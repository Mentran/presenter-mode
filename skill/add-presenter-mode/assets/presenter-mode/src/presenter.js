const STORAGE_PREFIX='htmlPresenter.v3.';
const DEFAULTS={slides:'slides.html',notes:'notes.md',fontSize:28,layout:'notes',lang:'en',theme:'sun'};

const copy={
  en:{
    statusDisconnected:'Disconnected',
    statusOpening:'Opening',
    statusConnected:'Connected',
    settings:'Settings',
    settingsFiles:'Files',
    settingsAppearance:'Appearance',
    settingsWorkspace:'Workspace',
    settingsLanguage:'Language',
    settingsTheme:'Theme',
    settingsFont:'Notes font',
    settingsLayout:'Layout',
    settingsPanels:'Panels',
    themeSun:'Sun',
    themeMoon:'Moon',
    default:'Default',
    layoutNotes:'Notes',
    layoutBalanced:'Balanced',
    layoutPreview:'Preview',
    panelSetup:'Setup',
    panelCurrent:'Current',
    panelNext:'Next',
    panelTimer:'Timer',
    panelList:'List',
    openAudience:'Open audience',
    reload:'Reload',
    slidesPath:'Slides HTML',
    notesPath:'Notes Markdown',
    load:'Reload all',
    currentPreview:'Current slide',
    nextPreview:'Next slide',
    timer:'Timer',
    currentPage:'Current',
    totalPages:'Total',
    resetTimer:'Reset timer',
    blackout:'Blackout',
    loading:'Loading',
    loaded:'Slides and notes loaded',
    loadFailed:'Load failed',
    noNotes:'No speaker notes for this slide.',
    useHttp:'Open this page through a local HTTP server, for example: ',
    audienceOpened:'Audience window opened. Move it to the projector and enter fullscreen.',
    fontToast:'Notes font',
    fontReset:'Notes font reset',
    show:'Show',
    hide:'Hide'
  },
  zh:{
    statusDisconnected:'未连接',
    statusOpening:'连接中',
    statusConnected:'已连接',
    settings:'设置',
    settingsFiles:'文件',
    settingsAppearance:'外观',
    settingsWorkspace:'工作区',
    settingsLanguage:'语言',
    settingsTheme:'主题',
    settingsFont:'讲稿字号',
    settingsLayout:'布局',
    settingsPanels:'区域',
    themeSun:'Sun',
    themeMoon:'Moon',
    default:'默认',
    layoutNotes:'讲稿',
    layoutBalanced:'均衡',
    layoutPreview:'预览',
    panelSetup:'配置',
    panelCurrent:'当前',
    panelNext:'下页',
    panelTimer:'计时',
    panelList:'列表',
    openAudience:'打开展示窗口',
    reload:'重新加载',
    slidesPath:'PPT HTML',
    notesPath:'讲稿 Markdown',
    load:'重新加载',
    currentPreview:'当前页预览',
    nextPreview:'下一页',
    timer:'计时',
    currentPage:'当前页',
    totalPages:'总页数',
    resetTimer:'重置计时',
    blackout:'黑屏',
    loading:'加载中',
    loaded:'已加载 PPT 和讲稿',
    loadFailed:'加载失败',
    noNotes:'这一页没有讲稿。',
    useHttp:'请用本地 HTTP 服务打开本页面，例如：',
    audienceOpened:'展示窗口已打开：拖到投影屏后全屏。',
    fontToast:'讲稿字号',
    fontReset:'讲稿字号已恢复默认',
    show:'显示',
    hide:'隐藏'
  }
};

const state={
  deckUrl:'',
  notesUrl:'',
  current:0,
  total:1,
  notes:[],
  titles:[],
  audience:null,
  startedAt:Date.now(),
  black:false,
  previewReady:{current:false,next:false},
  fontSize:DEFAULTS.fontSize,
  layout:DEFAULTS.layout,
  lang:DEFAULTS.lang,
  theme:DEFAULTS.theme,
  panels:{setup:true,current:true,next:true,timer:true,list:true}
};

const el=(id)=>document.getElementById(id);
const t=(key)=>copy[state.lang]?.[key] || copy.en[key] || key;

function storageKey(key){
  return `${STORAGE_PREFIX}${key}`;
}

function toast(message){
  const node=el('toast');
  node.textContent=message;
  node.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>node.classList.remove('show'),1800);
}

function clamp(value,min,max){
  return Math.max(min,Math.min(max,value));
}

function normalizeUrl(value){
  return new URL(value, window.location.href).href;
}

function getParams(){
  return new URLSearchParams(window.location.search);
}

function getConfiguredPaths(){
  const params=getParams();
  return {
    slides:params.get('slides') || localStorage.getItem(storageKey('slides')) || DEFAULTS.slides,
    notes:params.get('notes') || localStorage.getItem(storageKey('notes')) || DEFAULTS.notes
  };
}

async function loadText(url){
  const res=await fetch(url,{cache:'no-store'});
  if(!res.ok)throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
}

function parseNotes(markdown){
  const blocks=[];
  const lines=markdown.replace(/\r\n/g,'\n').split('\n');
  let current=null;
  const heading=/^##\s+(\d{1,3})(?:[.\s、｜|:-]|$)(.*)$/;
  for(const line of lines){
    const match=line.match(heading);
    if(match){
      if(current)blocks.push(current);
      current={page:parseInt(match[1],10),title:match[2].replace(/^[-\s.、｜|:]+/,'').trim(),body:[]};
    }else if(current){
      current.body.push(line);
    }
  }
  if(current)blocks.push(current);
  return blocks;
}

function parseDeckTitles(html){
  const doc=new DOMParser().parseFromString(html,'text/html');
  const slides=[...doc.querySelectorAll('.slide')];
  return slides.map((slide,idx)=>{
    const title=slide.querySelector('[data-title]')?.getAttribute('data-title')
      || slide.querySelector('.eyebrow')?.textContent
      || slide.querySelector('h1,h2,h3')?.textContent
      || `Slide ${idx+1}`;
    return title.replace(/\s+/g,' ').trim();
  });
}

function inlineMarkdown(text){
  return text
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>');
}

function markdownToHtml(markdown){
  const esc=(s)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const lines=markdown.trim().split('\n');
  const html=[];
  let list=null;
  const closeList=()=>{if(list){html.push(`</${list}>`);list=null;}};
  for(const raw of lines){
    const line=raw.trim();
    if(!line){closeList();continue;}
    const bullet=line.match(/^[-*]\s+(.+)$/);
    const ordered=line.match(/^\d+[.、]\s+(.+)$/);
    if(bullet||ordered){
      const type=bullet?'ul':'ol';
      if(list!==type){closeList();html.push(`<${type}>`);list=type;}
      html.push(`<li>${inlineMarkdown(esc((bullet||ordered)[1]))}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${inlineMarkdown(esc(line))}</p>`);
  }
  closeList();
  return html.join('');
}

async function loadFiles(){
  try{
    state.deckUrl=normalizeUrl(el('deckUrl').value.trim() || DEFAULTS.slides);
    state.notesUrl=normalizeUrl(el('notesUrl').value.trim() || DEFAULTS.notes);
    localStorage.setItem(storageKey('slides'),el('deckUrl').value.trim());
    localStorage.setItem(storageKey('notes'),el('notesUrl').value.trim());

    const [deckHtml,notesMd]=await Promise.all([loadText(state.deckUrl),loadText(state.notesUrl)]);
    state.titles=parseDeckTitles(deckHtml);
    state.notes=parseNotes(notesMd);
    state.total=Math.max(state.titles.length,state.notes.length,1);
    state.current=clamp(state.current,0,state.total-1);

    loadPreviews();
    buildSlideList();
    goTo(state.current,{silent:false});
    toast(t('loaded'));
  }catch(err){
    el('notesBody').innerHTML=`<p class="notes-empty">${t('loadFailed')}: ${err.message}</p><p class="notes-empty">${t('useHttp')}<code>python3 -m http.server 4311</code></p>`;
    toast(t('loadFailed'));
  }
}

function loadPreviews(){
  state.previewReady={current:false,next:false};
  const current=el('currentPreview');
  const next=el('nextPreview');
  current.src=state.deckUrl;
  next.src=state.deckUrl;
  current.onload=()=>{state.previewReady.current=true;syncPreview(current,state.current);};
  next.onload=()=>{state.previewReady.next=true;syncPreview(next,Math.min(state.current+1,state.total-1));};
  requestAnimationFrame(scalePreviews);
}

function scalePreviews(){
  document.querySelectorAll('.preview-frame').forEach((frame)=>{
    const iframe=frame.querySelector('iframe');
    const scale=Math.min(frame.clientWidth/1920,frame.clientHeight/1080);
    const x=(frame.clientWidth-1920*scale)/2;
    const y=(frame.clientHeight-1080*scale)/2;
    iframe.style.transform=`translate(${x}px, ${y}px) scale(${scale})`;
  });
}

function applyFontSize(size,options={}){
  state.fontSize=clamp(size,18,40);
  document.documentElement.style.setProperty('--notes-font-size',`${state.fontSize}px`);
  el('fontReadout').textContent=`${state.fontSize}px`;
  if(!options.silent)localStorage.setItem(storageKey('fontSize'),String(state.fontSize));
}

function changeFont(delta){
  applyFontSize(state.fontSize+delta);
  toast(`${t('fontToast')} ${state.fontSize}px`);
}

function setLayout(layout,options={}){
  const layouts={notes:'35vw',balanced:'45vw',preview:'55vw'};
  state.layout=layouts[layout]?layout:'notes';
  document.documentElement.style.setProperty('--preview-col',layouts[state.layout]);
  document.querySelectorAll('[data-layout-button]').forEach((button)=>{
    button.classList.toggle('active',button.dataset.layoutButton===state.layout);
  });
  if(!options.silent){
    localStorage.setItem(storageKey('layout'),state.layout);
    localStorage.removeItem(storageKey('previewWidth'));
  }
  requestAnimationFrame(scalePreviews);
}

function setLanguage(lang,options={}){
  state.lang=copy[lang]?lang:DEFAULTS.lang;
  document.documentElement.lang=state.lang==='zh'?'zh-CN':'en';
  document.querySelectorAll('[data-i18n]').forEach((node)=>{
    node.textContent=t(node.dataset.i18n);
  });
  document.querySelectorAll('[data-lang-button]').forEach((button)=>{
    button.classList.toggle('active',button.dataset.langButton===state.lang);
  });
  updateConnection();
  goTo(state.current,{silent:true});
  if(!options.silent)localStorage.setItem(storageKey('lang'),state.lang);
}

function setTheme(theme,options={}){
  state.theme=theme==='moon'?'moon':DEFAULTS.theme;
  document.documentElement.dataset.theme=state.theme;
  document.querySelectorAll('[data-theme-button]').forEach((button)=>{
    button.classList.toggle('active',button.dataset.themeButton===state.theme);
  });
  if(!options.silent)localStorage.setItem(storageKey('theme'),state.theme);
}

function panelElement(key){
  return {
    setup:el('setupPanel'),
    current:el('currentPanel'),
    next:el('nextPanel'),
    timer:el('timerPanel'),
    list:el('slideList')
  }[key];
}

function panelName(key){
  const names={
    en:{setup:'setup',current:'current preview',next:'next preview',timer:'timer',list:'slide list'},
    zh:{setup:'配置栏',current:'当前页预览',next:'下一页预览',timer:'计时区',list:'页码列表'}
  };
  return names[state.lang]?.[key] || key;
}

function applyPanels(options={}){
  Object.entries(state.panels).forEach(([key,isOpen])=>{
    const node=panelElement(key);
    if(node)node.dataset.collapsed=String(!isOpen);
    const toggle=document.querySelector(`[data-panel-toggle="${key}"]`);
    if(toggle)toggle.classList.toggle('off',!isOpen);
  });
  el('nextRow').dataset.collapsed=String(!state.panels.next&&!state.panels.timer);

  // Mark left column as empty when all previews/timer are hidden
  const leftSection=document.querySelector('.left');
  if(leftSection){
    const allLeftHidden=!state.panels.current&&!state.panels.next&&!state.panels.timer;
    leftSection.dataset.empty=String(allLeftHidden);
  }

  if(!options.silent)localStorage.setItem(storageKey('panels'),JSON.stringify(state.panels));
  requestAnimationFrame(scalePreviews);
}

function togglePanel(key){
  if(!(key in state.panels))return;
  state.panels[key]=!state.panels[key];
  applyPanels();
  toast(`${state.panels[key]?t('show'):t('hide')}: ${panelName(key)}`);
}

function setPreviewWidth(px,options={}){
  const min=300;
  const max=Math.max(min,Math.round(window.innerWidth*0.68));
  const width=clamp(Math.round(px),min,max);
  document.documentElement.style.setProperty('--preview-col',`${width}px`);
  document.querySelectorAll('[data-layout-button]').forEach((button)=>button.classList.remove('active'));
  if(!options.silent){
    localStorage.setItem(storageKey('previewWidth'),String(width));
    localStorage.setItem(storageKey('layout'),'custom');
  }
  requestAnimationFrame(scalePreviews);
}

function setupSplitter(){
  const splitter=el('mainSplitter');
  const workspace=document.querySelector('.workspace');
  let startX=0;
  let startWidth=0;
  const move=(event)=>setPreviewWidth(startWidth+event.clientX-startX);
  const up=()=>{
    document.body.classList.remove('resizing');
    splitter.classList.remove('dragging');
    window.removeEventListener('pointermove',move);
    window.removeEventListener('pointerup',up);
  };
  splitter.addEventListener('pointerdown',(event)=>{
    event.preventDefault();
    startX=event.clientX;
    startWidth=workspace.firstElementChild.getBoundingClientRect().width;
    document.body.classList.add('resizing');
    splitter.classList.add('dragging');
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',up);
  });
}

function syncPreview(iframe,index){
  try{
    const win=iframe.contentWindow;
    if(win?.deck?.show)win.deck.show(index);
    else win.location.hash=`#${index+1}`;
  }catch(_){}
}

function buildSlideList(){
  const list=el('slideList');
  list.innerHTML='';
  for(let i=0;i<state.total;i++){
    const item=document.createElement('div');
    item.className='slide-item';
    item.dataset.index=String(i);
    item.textContent=`${String(i+1).padStart(2,'0')} · ${getTitle(i)}`;
    item.addEventListener('click',()=>goTo(i));
    list.appendChild(item);
  }
}

function getNote(index){
  return state.notes.find((note)=>note.page===index+1) || state.notes[index] || null;
}

function getTitle(index){
  const note=getNote(index);
  return note?.title || state.titles[index] || `Slide ${index+1}`;
}

function goTo(index,options={}){
  state.current=clamp(index,0,state.total-1);
  const note=getNote(state.current);
  el('currentLabel').textContent=`${String(state.current+1).padStart(2,'0')} / ${state.total}`;
  el('nextLabel').textContent=state.current+1<state.total?String(state.current+2).padStart(2,'0'):'END';
  el('pageMetric').textContent=state.current+1;
  el('totalMetric').textContent=state.total;
  el('slideKicker').textContent=`Slide ${String(state.current+1).padStart(2,'0')}`;
  el('slideTitle').textContent=getTitle(state.current);
  el('progressBar').style.width=`${((state.current+1)/state.total)*100}%`;
  el('notesBody').innerHTML=note?markdownToHtml(note.body.join('\n')):`<p class="notes-empty">${t('noNotes')}</p>`;
  document.querySelectorAll('.slide-item').forEach((item)=>{
    item.classList.toggle('active',Number(item.dataset.index)===state.current);
  });
  document.querySelector('.slide-item.active')?.scrollIntoView({block:'nearest'});
  syncPreview(el('currentPreview'),state.current);
  syncPreview(el('nextPreview'),Math.min(state.current+1,state.total-1));
  syncAudience();
  if(!options.silent)localStorage.setItem(storageKey('current'),String(state.current));
}

function openAudience(){
  state.deckUrl=normalizeUrl(el('deckUrl').value.trim() || DEFAULTS.slides);
  state.audience=window.open(`${state.deckUrl}#${state.current+1}`,'html-presenter-audience','popup=yes,width=1280,height=720');
  updateConnection();
  if(!state.audience){
    toast('Popup blocked');
    return;
  }
  const check=setInterval(()=>{
    if(!state.audience || state.audience.closed){
      clearInterval(check);
      state.audience=null;
      updateConnection();
      return;
    }
    try{
      if(state.audience.deck){
        syncAudience();
        clearInterval(check);
        updateConnection(true);
      }
    }catch(_){}
  },300);
  toast(t('audienceOpened'));
}

function syncAudience(){
  if(!state.audience || state.audience.closed)return;
  try{
    if(state.audience.deck?.show){
      state.audience.deck.show(state.current);
    }else{
      state.audience.location.hash=`#${state.current+1}`;
    }
    applyBlackout();
  }catch(_){}
}

function updateConnection(ready=false){
  const dot=el('statusDot');
  const text=el('statusText');
  if(state.audience && !state.audience.closed){
    dot.className=`status-dot ${ready?'ok':'warn'}`;
    text.textContent=ready?t('statusConnected'):t('statusOpening');
  }else{
    dot.className='status-dot';
    text.textContent=t('statusDisconnected');
  }
}

function toggleBlackout(){
  state.black=!state.black;
  el('blackout').classList.toggle('active',state.black);
  applyBlackout();
}

function applyBlackout(){
  if(!state.audience || state.audience.closed)return;
  try{
    const doc=state.audience.document;
    let mask=doc.getElementById('presenterBlackoutMask');
    if(!mask){
      mask=doc.createElement('div');
      mask.id='presenterBlackoutMask';
      mask.style.cssText='position:fixed;inset:0;background:#000;z-index:2147483647;display:none;';
      doc.body.appendChild(mask);
    }
    mask.style.display=state.black?'block':'none';
  }catch(_){}
}

function tick(){
  const elapsed=Math.max(0,Date.now()-state.startedAt);
  const mins=Math.floor(elapsed/60000);
  const secs=Math.floor((elapsed%60000)/1000);
  el('timer').textContent=`${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

function resetTimer(){
  state.startedAt=Date.now();
  tick();
}

function restoreSettings(){
  const params=getParams();
  const paths=getConfiguredPaths();
  const currentValue=localStorage.getItem(storageKey('current'));
  const fontSizeValue=localStorage.getItem(storageKey('fontSize'));
  const current=currentValue === null ? NaN : Number(currentValue);
  const fontSize=fontSizeValue === null ? NaN : Number(fontSizeValue);
  const layout=localStorage.getItem(storageKey('layout'));
  const panels=localStorage.getItem(storageKey('panels'));
  const previewWidth=Number(localStorage.getItem(storageKey('previewWidth')));
  const lang=params.get('lang') || localStorage.getItem(storageKey('lang')) || DEFAULTS.lang;
  const theme=params.get('theme') || localStorage.getItem(storageKey('theme')) || DEFAULTS.theme;

  el('deckUrl').value=paths.slides;
  el('notesUrl').value=paths.notes;
  if(Number.isFinite(current))state.current=current;
  applyFontSize(Number.isFinite(fontSize)?fontSize:DEFAULTS.fontSize,{silent:true});
  if(panels){
    try{state.panels={...state.panels,...JSON.parse(panels)}}catch(_){}
  }
  applyPanels({silent:true});
  setTheme(theme,{silent:true});
  if(Number.isFinite(previewWidth)&&previewWidth>0)setPreviewWidth(previewWidth,{silent:true});
  else setLayout(layout&&layout!=='custom'?layout:DEFAULTS.layout,{silent:true});
  setLanguage(lang,{silent:true});
}

function bindEvents(){
  document.addEventListener('keydown',(event)=>{
    const tag=event.target.tagName.toLowerCase();
    if(tag==='input'||tag==='textarea')return;
    if(event.key==='ArrowRight'||event.key===' '||event.key==='PageDown'){event.preventDefault();goTo(state.current+1);}
    else if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();goTo(state.current-1);}
    else if(event.key==='Home'){event.preventDefault();goTo(0);}
    else if(event.key==='End'){event.preventDefault();goTo(state.total-1);}
    else if(event.key==='b'||event.key==='B'){event.preventDefault();toggleBlackout();}
    else if(event.key==='r'||event.key==='R'){event.preventDefault();resetTimer();}
    else if(event.key==='='||event.key==='+'){event.preventDefault();changeFont(2);}
    else if(event.key==='-'||event.key==='_'){event.preventDefault();changeFont(-2);}
    else if(event.key==='0'){event.preventDefault();applyFontSize(DEFAULTS.fontSize);toast(t('fontReset'));}
  });
  window.addEventListener('resize',scalePreviews);
  el('loadFiles').addEventListener('click',loadFiles);
  el('openAudience').addEventListener('click',openAudience);
  el('prevSlide').addEventListener('click',()=>goTo(state.current-1));
  el('nextSlide').addEventListener('click',()=>goTo(state.current+1));
  el('resetTimer').addEventListener('click',resetTimer);
  el('blackout').addEventListener('click',toggleBlackout);
  el('fontDown').addEventListener('click',()=>changeFont(-2));
  el('fontUp').addEventListener('click',()=>changeFont(2));
  el('fontReset').addEventListener('click',()=>{applyFontSize(DEFAULTS.fontSize);toast(t('fontReset'));});
  el('layoutNotes').addEventListener('click',()=>setLayout('notes'));
  el('layoutBalanced').addEventListener('click',()=>setLayout('balanced'));
  el('layoutPreview').addEventListener('click',()=>setLayout('preview'));
  el('langEn').addEventListener('click',()=>setLanguage('en'));
  el('langZh').addEventListener('click',()=>setLanguage('zh'));
  el('themeSun').addEventListener('click',()=>setTheme('sun'));
  el('themeMoon').addEventListener('click',()=>setTheme('moon'));
  document.querySelectorAll('[data-panel-toggle]').forEach((button)=>{
    button.addEventListener('click',()=>togglePanel(button.dataset.panelToggle));
  });
}

bindEvents();
restoreSettings();
setupSplitter();
loadFiles();
setInterval(tick,250);
setInterval(()=>updateConnection(Boolean(state.audience && !state.audience.closed)),1000);
