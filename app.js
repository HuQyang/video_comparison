import {config} from './study-config.js';
import {validateConfig,createSession,validSession,mergeSession,labelKey,results,toCsv} from './model.js';
import {schemaVersion,questions,details,completeLabel} from './schema.js';
import {lang,setLang,t,qTitle,qHint,optText,detailTitle,tagText,studyTitle,applyStatic} from './i18n.js';
const $=id=>document.getElementById(id);
validateConfig(config);
// One save slot per study id, independent of config.version, so labels survive groups being added.
const oldKey=`video-comparison:${config.id}:${config.version}`,key=`video-comparison:${config.id}:labels-v${schemaVersion}`;
let session;
try {
 let saved=JSON.parse(localStorage.getItem(key));
 if (!saved) {  // first visit after this change: pick up the newest per-version save of this study
  const prefix=`video-comparison:${config.id}:`, suffix=`:labels-v${schemaVersion}`;
  const old=Object.keys(localStorage).filter(k=>k.startsWith(prefix)&&k.endsWith(suffix)&&k!==key)
   .sort((a,b)=>Number(a.slice(prefix.length,-suffix.length))-Number(b.slice(prefix.length,-suffix.length))).pop();
  if (old) saved=JSON.parse(localStorage.getItem(old));
 }
 if (saved && !validSession(saved,config)) saved=mergeSession(saved,config);
 if (validSession(saved,config)) session=saved;
} catch {}
session ||= createSession(config);
try {localStorage.setItem(key,JSON.stringify(session));} catch {}
let activeQ=0,startedAt=Date.now(),rate=1;
const group=()=>config.groups.find(g=>g.id===session.order[session.cursor]);
const item=()=>group().videos.find(v=>v.id===session.videoOrder[group().id][session.active]);
const currentKey=()=>labelKey(group().id,item().id);
function persist(){try{localStorage.setItem(key,JSON.stringify(session));$('save-status').textContent=t('saved');}catch{$('save-status').textContent=t('saveFail');}}
function buildForm(){
 $('questions').replaceChildren(...questions.map((q,i)=>{const fs=document.createElement('fieldset');fs.className='q';fs.dataset.question=q.key;
 const legend=document.createElement('legend');const n=document.createElement('span');n.textContent=`${i+1}`;legend.append(n,document.createTextNode(qTitle(q)));fs.append(legend);
 if(qHint(q)){const p=document.createElement('p');p.textContent=qHint(q);fs.append(p);}
 q.options.forEach(([value,text],j)=>{const l=document.createElement('label');l.className='opt';const r=document.createElement('input');r.type='radio';r.name=q.key;r.value=value;const k=document.createElement('kbd');k.textContent=j+1;l.append(r,k,document.createTextNode(optText(q,value,text)));fs.append(l);r.onchange=()=>{capture();setActive(Math.min(i+1,questions.length-1));};});fs.onclick=()=>setActive(i);return fs;}));
 $('details').replaceChildren(...details.map((g,gi)=>{const div=document.createElement('div');div.className='detail-group';const title=document.createElement('strong');title.textContent=detailTitle(gi,g.title);div.append(title);g.options.forEach(([code,text])=>{const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.name='tag';c.value=code;c.onchange=capture;l.append(c,document.createTextNode(tagText(code,text)));div.append(l);});return div;}));
}
function setActive(i){activeQ=i;document.querySelectorAll('.q').forEach((fs,n)=>fs.classList.toggle('active',n===i));}
function capture(){
 const previous=session.labels[currentKey()]||{};
 const a={...previous,tags:[...document.querySelectorAll('input[name=tag]:checked')].map(c=>c.value),note:$('note').value,issue_time:$('issue-time').value,at:new Date().toISOString(),elapsed:(previous.elapsed||0)+Date.now()-startedAt};
 questions.forEach(q=>a[q.key]=document.querySelector(`input[name=${q.key}]:checked`)?.value||'');
 session.labels[currentKey()]=a;startedAt=Date.now();persist();refreshProgress();
 document.querySelectorAll('.q').forEach(fs=>fs.classList.remove('missing'));
 $('answer-status').textContent=completeLabel(a)?t('qDone'):t('qDraft');
}
function refreshProgress(){
 const total=config.groups.length*3;const done=config.groups.reduce((n,g)=>n+g.videos.filter(v=>completeLabel(session.labels[labelKey(g.id,v.id)])).length,0);
 $('count').textContent=`${done} / ${total}`;$('progress').style.width=`${done/total*100}%`;$('complete').hidden=done!==total;
 $('groups').replaceChildren(...session.order.map((id,i)=>{const g=config.groups.find(g=>g.id===id),n=g.videos.filter(v=>completeLabel(session.labels[labelKey(id,v.id)])).length,b=document.createElement('button');b.textContent=t('groupBtn',{n:String(i+1).padStart(2,'0'),k:n});b.className=i===session.cursor?'current':'';if(i===session.cursor)b.setAttribute('aria-current','step');b.onclick=()=>navigate(i,0);return b;}));
 $('tabs').replaceChildren(...session.videoOrder[group().id].map((id,i)=>{const b=document.createElement('button');b.textContent=`${t('videoTab',{x:'ABC'[i]})}${completeLabel(session.labels[labelKey(group().id,id)])?' ✓':''}`;b.className=i===session.active?'active':'';b.setAttribute('aria-pressed',i===session.active?'true':'false');b.onclick=()=>navigate(session.cursor,i);return b;}));
}
function render(){
 document.querySelector('.sheet').scrollTop=0;
 const g=group(),v=item(),a=session.labels[currentKey()]||{};startedAt=Date.now();
 $('group-count').textContent=config.groups.length;$('position').textContent=`COMPARISON ${String(session.cursor+1).padStart(2,'0')} / ${config.groups.length} · VIDEO ${'ABC'[session.active]}`;
 // Hide model identities in the annotation view; full source title stays in configuration.
 $('group-title').textContent=t('groupTitle',{n:String(session.cursor+1).padStart(2,'0')});
 $('label-title').textContent=t('labelTitle',{x:'ABC'[session.active]});$('prompt').textContent=v.prompt;
 const video=$('video');video.pause();$('media-error').hidden=true;$('metadata').textContent=t('readingMeta');
 const loadedKey=currentKey();video.onloadedmetadata=()=>{session.metadata[loadedKey]={width:video.videoWidth,height:video.videoHeight,duration_seconds:Number.isFinite(video.duration)?video.duration:null};$('metadata').textContent=t('meta',{w:video.videoWidth,h:video.videoHeight,d:video.duration.toFixed(1)});persist();};
 video.onerror=()=>{$('media-error').textContent=t('mediaError',{src:v.src});$('media-error').hidden=false;$('metadata').textContent=t('mediaNone');};video.src=v.src;video.playbackRate=rate;
 questions.forEach(q=>document.querySelectorAll(`input[name=${q.key}]`).forEach(r=>r.checked=r.value===a[q.key]));
 document.querySelectorAll('input[name=tag]').forEach(c=>c.checked=(a.tags||[]).includes(c.value));$('note').value=a.note||'';$('issue-time').value=a.issue_time||'';
 setActive(Math.max(0,questions.findIndex(q=>!a[q.key])));
 $('answer-status').textContent=completeLabel(a)?t('labeledEdit'):t('fillSeven');
 $('previous').disabled=session.cursor===0&&session.active===0;$('following').disabled=session.cursor===session.order.length-1&&session.active===2;
 $('save').textContent=$('following').disabled?t('saveLast'):t('saveNext');$('study-name').textContent=t('studyName',{title:studyTitle(config),v:schemaVersion});refreshProgress();
}
function navigate(cursor,active){session.cursor=cursor;session.active=active;persist();render();}
function move(delta){const n=session.cursor*3+session.active+delta;if(n>=0&&n<session.order.length*3)navigate(Math.floor(n/3),n%3);}
$('save').onclick=()=>{capture();const a=session.labels[currentKey()];if(!completeLabel(a)){const i=questions.findIndex(q=>!a[q.key]);setActive(i);document.querySelectorAll('.q').forEach(fs=>fs.classList.toggle('missing',!a[fs.dataset.question]));$('answer-status').textContent=t('mustComplete');document.querySelector(`input[name=${questions[i].key}]`).focus();return;}move(1);};
$('previous').onclick=()=>move(-1);$('following').onclick=()=>move(1);
$('note').oninput=capture;$('issue-time').oninput=capture;
$('rater').value=session.rater;$('rater').oninput=()=>{session.rater=$('rater').value.trim();persist();};
$('replay').onclick=async()=>{try{$('video').currentTime=0;await $('video').play();}catch{$('answer-status').textContent=t('playFail');}};
$('speed').onclick=()=>{rate=rate===1?.5:1;$('video').playbackRate=rate;$('speed').textContent=rate===1?t('speedSlow'):t('speedNormal');};
$('help').onclick=()=>$('guide').showModal();$('close-guide').onclick=()=>$('guide').close();
function download(data,extension,name){const blob=new Blob([typeof data==='string'?data:JSON.stringify(data,null,2)],{type:extension==='csv'?'text/csv;charset=utf-8':'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${name}.${extension}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportData(){const data=results(session,config);$('export-status').textContent=data.complete?t('exportedAll'):t('exportedPartial');return data;}
$('json').onclick=()=>download(exportData(),'json',`${config.id}-labels-${session.id}`);$('csv').onclick=()=>download(toCsv(exportData()),'csv',`${config.id}-labels-${session.id}`);
$('copy').onclick=async()=>{const data=exportData();try{await navigator.clipboard.writeText(JSON.stringify(data,null,2));$('export-status').textContent=data.complete?t('copiedAll'):t('copiedPartial');}catch{$('export-status').textContent=t('copyFail');}};
$('legacy').onclick=()=>{try{const old=JSON.parse(localStorage.getItem(oldKey));if(!old)throw Error();download(old,'json',`${config.id}-legacy-comparison`);$('export-status').textContent=t('legacyDone');}catch{$('export-status').textContent=t('legacyNone');}};
$('reset').onclick=()=>{if(confirm(t('resetConfirm'))){session=createSession(config);$('rater').value='';persist();render();}};
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('textarea,select,button,input:not([type=radio]):not([type=checkbox])')||$('guide').open)return;
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}
 const n=Number(e.key)-1;if(Number.isInteger(n)&&n>=0&&n<questions[activeQ].options.length){e.preventDefault();const value=questions[activeQ].options[n][0];document.querySelector(`input[name=${questions[activeQ].key}][value=${value}]`).click();}
});
$('lang').onclick=()=>{setLang(lang==='zh'?'en':'zh');applyStatic();$('speed').textContent=rate===1?t('speedSlow'):t('speedNormal');buildForm();render();};
applyStatic();$('speed').textContent=t('speedSlow');buildForm();persist();render();
