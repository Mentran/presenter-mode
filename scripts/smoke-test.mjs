import { readFile } from 'node:fs/promises';

const files=[
  'presenter.html',
  'src/presenter.css',
  'src/presenter.js',
  'slides.html',
  'notes.md',
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

assert(contents['presenter.html'].includes('src/presenter.css'),'presenter.html links CSS');
assert(contents['presenter.html'].includes('src/presenter.js'),'presenter.html loads JS');
assert(contents['src/presenter.css'].includes('--notes-font-size'),'CSS exposes notes font variable');
assert(contents['src/presenter.css'].includes('@container'),'CSS keeps narrow preview panels responsive');
assert(contents['src/presenter.js'].includes("DEFAULTS={slides:'slides.html',notes:'notes.md'"),'JS defaults to slides.html and notes.md');
assert(contents['src/presenter.js'].includes("params.get('slides')"),'JS supports slides URL parameter');
assert(contents['src/presenter.js'].includes('window.open'),'JS opens audience window');
assert(contents['slides.html'].includes('class="slide"'),'demo slides expose .slide');
assert(contents['slides.html'].includes('window.deck={show'),'demo slides expose deck.show');
assert(contents['notes.md'].includes('## 01'),'demo notes use numbered headings');

try{
  new Function(contents['src/presenter.js']);
}catch(error){
  console.error(`FAIL: presenter.js parse error: ${error.message}`);
  process.exitCode=1;
}

if(process.exitCode){
  process.exit(process.exitCode);
}

console.log('smoke test passed');
