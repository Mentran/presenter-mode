import { readFile } from 'node:fs/promises';

const files=[
  'presenter.html',
  'example/slides.html',
  'example/notes.md',
  'README.md',
  'LICENSE'
];

function assert(condition,message){
  if(!condition){
    console.error(`FAIL: ${message}`);
    process.exitCode=1;
  }
}

const contents=Object.fromEntries(await Promise.all(files.map(async (file)=>[file,await readFile(file,'utf8')])));

assert(contents['presenter.html'].includes('<style>'),'presenter.html inlines CSS');
assert(contents['presenter.html'].includes('<script>'),'presenter.html inlines JS');
assert(!contents['presenter.html'].includes('src/presenter'),'presenter.html has no external src references');
assert(contents['presenter.html'].includes('--notes-font-size'),'CSS exposes notes font variable');
assert(contents['presenter.html'].includes('@container'),'CSS keeps narrow preview panels responsive');
assert(contents['presenter.html'].includes("DEFAULTS={slides:'slides.html',notes:'notes.md'"),'JS defaults to slides.html and notes.md');
assert(contents['presenter.html'].includes("params.get('slides')"),'JS supports slides URL parameter');
assert(contents['presenter.html'].includes('window.open'),'JS opens audience window');
assert(contents['example/slides.html'].includes('class="slide"'),'demo slides expose .slide');
assert(contents['example/slides.html'].includes('window.deck={show'),'demo slides expose deck.show');
assert(contents['example/notes.md'].includes('## 01'),'demo notes use numbered headings');

// Extract inlined script and verify it parses
const scriptMatch=contents['presenter.html'].match(/<script>([\s\S]*?)<\/script>/);
try{
  new Function(scriptMatch?scriptMatch[1]:'throw new Error("no inline script found")');
}catch(error){
  console.error(`FAIL: inlined script parse error: ${error.message}`);
  process.exitCode=1;
}

if(process.exitCode){
  process.exit(process.exitCode);
}

console.log('smoke test passed');
