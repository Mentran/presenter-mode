#!/usr/bin/env node
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { access, cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillRoot = path.resolve(__dirname, '..');
const assetRoot = path.join(skillRoot, 'assets', 'presenter-mode');

const args = parseArgs(process.argv.slice(2));
const targetRoot = path.resolve(args.target || process.cwd());
const installDir = path.join(targetRoot, 'presenter-mode');
const startPort = Number(args.port || 4311);
const lang = args.lang || detectLanguage();

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

async function main() {
  await assertDirectory(assetRoot, 'Missing bundled presenter-mode assets');
  await assertDirectory(targetRoot, 'Target directory does not exist');

  const slidesRel = await resolveSlidesPath();
  const notesRel = await resolveNotesPath(slidesRel);

  if (await exists(installDir)) {
    if (!args.force) {
      throw new Error('presenter-mode/ already exists. Re-run with --force to replace it.');
    }
    await rm(installDir, { recursive: true, force: true });
  }

  await cp(assetRoot, installDir, { recursive: true });

  const presenterRel = 'presenter-mode/presenter.html';
  const slidesForPresenter = toUrlPath(path.relative(installDir, path.join(targetRoot, slidesRel)));
  const notesForPresenter = toUrlPath(path.relative(installDir, path.join(targetRoot, notesRel)));
  const query = new URLSearchParams({ slides: slidesForPresenter, notes: notesForPresenter, lang });

  const port = args.noServer ? startPort : await findAvailablePort(startPort);
  const presenterUrl = `http://127.0.0.1:${port}/${presenterRel}?${query.toString()}`;

  console.log('Installed presenter-mode/');
  console.log(`Slides: ${slidesRel}`);
  console.log(`Notes: ${notesRel}`);
  console.log(`Presenter URL: ${presenterUrl}`);

  if (args.noServer) {
    return;
  }

  await startStaticServer(targetRoot, port, presenterUrl);
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    if (key === 'force' || key === 'noServer') {
      parsed[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}

async function resolveSlidesPath() {
  if (args.slides) {
    return await requireFile(args.slides, 'Slides file does not exist');
  }
  for (const candidate of ['slides.html', 'index.html']) {
    if (await exists(path.join(targetRoot, candidate))) {
      return candidate;
    }
  }

  // List available HTML files to help the user
  const files = await readdir(targetRoot).catch(() => []);
  const htmlFiles = files.filter(f => f.endsWith('.html'));

  let message = 'Cannot find slides.html or index.html. Pass --slides path/to/slides.html.';
  if (htmlFiles.length > 0) {
    message += '\n\nHTML files found in target directory:\n' + htmlFiles.map(f => `  - ${f}`).join('\n');
  }

  throw new Error(message);
}

async function resolveNotesPath(slidesRel) {
  if (args.notes) {
    const notesRel = normalizeRelative(args.notes);
    if (!(await exists(path.join(targetRoot, notesRel)))) {
      await createNotesTemplate(slidesRel, notesRel);
    }
    return notesRel;
  }

  for (const candidate of ['notes.md', 'speaker-notes.md']) {
    if (await exists(path.join(targetRoot, candidate))) {
      return candidate;
    }
  }

  await createNotesTemplate(slidesRel, 'notes.md');
  return 'notes.md';
}

async function createNotesTemplate(slidesRel, notesRel) {
  const slidesHtml = await readFile(path.join(targetRoot, slidesRel), 'utf8');
  const titles = extractSlideTitles(slidesHtml);
  const width = Math.max(2, String(titles.length).length);
  const body = titles
    .map((title, index) => `## ${String(index + 1).padStart(width, '0')} ${title}\n\n[Write speaker notes here.]\n`)
    .join('\n');
  const notesPath = path.join(targetRoot, notesRel);
  await mkdir(path.dirname(notesPath), { recursive: true });
  await writeFile(notesPath, body, 'utf8');
}

function extractSlideTitles(html) {
  const slideOpen = /<[^>]*class=["'][^"']*\bslide\b[^"']*["'][^>]*>/gi;
  const matches = [...html.matchAll(slideOpen)];
  if (matches.length === 0) {
    const pageTitle = extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    return [cleanText(pageTitle) || 'Slide 1'];
  }

  return matches.map((match, index) => {
    const startTag = match[0];
    const start = match.index + startTag.length;
    const end = matches[index + 1]?.index ?? html.length;
    const chunk = html.slice(start, end);
    const dataTitle = extractFirst(startTag, /\bdata-title=["']([^"']+)["']/i);
    const heading = extractFirst(chunk, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
    return cleanText(dataTitle || heading) || `Slide ${index + 1}`;
  });
}

function extractFirst(value, pattern) {
  return value.match(pattern)?.[1] || '';
}

function cleanText(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function startStaticServer(root, port, presenterUrl) {
  const server = createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', `http://127.0.0.1:${port}`);
      const pathname = decodeURIComponent(requestUrl.pathname);
      const filePath = path.resolve(root, `.${pathname}`);
      if (!isInside(root, filePath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      const fileStat = await stat(filePath);
      const finalPath = fileStat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
      res.writeHead(200, { 'Content-Type': contentType(finalPath) });
      createReadStream(finalPath).pipe(res);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

  console.log('');
  console.log(`Serving ${root}`);
  console.log(`Open: ${presenterUrl}`);
  console.log('Press Ctrl+C to stop.');

  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp'
  }[ext] || 'application/octet-stream';
}

async function findAvailablePort(port) {
  for (let candidate = port; candidate < port + 100; candidate += 1) {
    if (await isPortAvailable(candidate)) {
      return candidate;
    }
  }
  throw new Error(`Cannot find an available port from ${port} to ${port + 99}.`);
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function requireFile(input, message) {
  const rel = normalizeRelative(input);
  const fullPath = path.join(targetRoot, rel);
  const fileStat = await stat(fullPath).catch(() => null);
  if (!fileStat?.isFile()) {
    throw new Error(message);
  }
  return rel;
}

async function assertDirectory(dir, message) {
  const dirStat = await stat(dir).catch(() => null);
  if (!dirStat?.isDirectory()) {
    throw new Error(message);
  }
}

function normalizeRelative(input) {
  const resolved = path.resolve(targetRoot, input);
  if (!isInside(targetRoot, resolved)) {
    throw new Error(`Path escapes target root: ${input}`);
  }
  return toUrlPath(path.relative(targetRoot, resolved));
}

function isInside(root, filePath) {
  const relative = path.relative(root, filePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function toUrlPath(value) {
  return value.split(path.sep).join('/');
}

async function exists(filePath) {
  return access(filePath).then(() => true, () => false);
}

function detectLanguage() {
  // Check LANG environment variable first
  const envLang = process.env.LANG || process.env.LANGUAGE || '';
  if (envLang.toLowerCase().includes('zh') || envLang.toLowerCase().includes('cn')) {
    return 'zh';
  }

  // Default to English
  return 'en';
}
