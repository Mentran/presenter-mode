#!/usr/bin/env node
/**
 * Verify that a presenter-mode installation works correctly.
 * This script checks that the deck exposes the required control API.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const slidesPath = resolve(args.slides || 'slides.html');

main().catch((err) => {
  console.error(`✗ Verification failed: ${err.message}`);
  process.exit(1);
});

async function main() {
  console.log('Verifying presenter-mode installation...\n');

  // Check 1: Slides file exists
  let html;
  try {
    html = await readFile(slidesPath, 'utf8');
    console.log(`✓ Slides file found: ${slidesPath}`);
  } catch {
    throw new Error(`Cannot read slides file: ${slidesPath}`);
  }

  // Check 2: Deck has recognizable slide structure
  const hasSlideClass = html.includes('class="slide"') || html.includes("class='slide'") || /class="[^"]*\bslide\b/.test(html);
  if (hasSlideClass) {
    console.log('✓ Deck has .slide class structure');
  } else {
    console.log('⚠ Warning: Deck does not use .slide class. Navigation may need custom adaptation.');
  }

  // Check 3: Deck exposes window.deck API
  const hasWindowDeck = /window\.deck\s*=/.test(html) || /window\["deck"\]/.test(html);
  if (hasWindowDeck) {
    console.log('✓ Deck exposes window.deck API');
  } else {
    console.log('⚠ Warning: Deck does not expose window.deck.show(). Hash navigation fallback will be used.');
    console.log('  Consider adapting the deck using Pattern A or B in SKILL.md');
  }

  // Check 4: Deck supports hash navigation
  const hasHashNav = html.includes('hashchange') || html.includes('location.hash');
  if (hasHashNav) {
    console.log('✓ Deck has hash navigation support');
  } else {
    console.log('⚠ Warning: Deck does not appear to support hash navigation (#N).');
    console.log('  Presenter sync may not work. Adaptation required.');
  }

  // Check 5: presenter.html installed
  try {
    await readFile('presenter.html', 'utf8');
    console.log('✓ presenter.html installed');
  } catch {
    throw new Error('presenter.html not found in current directory. Run install script first.');
  }

  console.log('\n---');
  if (hasWindowDeck || hasHashNav) {
    console.log('✓ Installation looks good! Open the presenter URL and test navigation.');
  } else {
    console.log('⚠ Deck needs adaptation before presenter-mode will work.');
    console.log('  See SKILL.md "Deck Adaptation Patterns" for guidance.');
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = argv[i + 1];
    if (value && !value.startsWith('--')) {
      parsed[key] = value;
      i += 1;
    }
  }
  return parsed;
}
