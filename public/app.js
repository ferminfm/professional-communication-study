const CANDIDATES = [
  { id: 'ensenum', name: 'Ensenum' },
  { id: 'ensenada_flow', name: 'Ensenada Flow' },
  { id: 'enseflow', name: 'Enseflow' },
  { id: 'bcfd', name: 'Baja California Fluid Dynamics' }
];

const AUDIO = {
  es: { ensenum: '/audio/es-A.mp3', ensenada_flow: '/audio/es-B.mp3', enseflow: '/audio/es-C.mp3', bcfd: '/audio/es-D.mp3' },
  en: { ensenum: '/audio/en-A.mp3', ensenada_flow: '/audio/en-B.mp3', enseflow: '/audio/en-C.mp3', bcfd: '/audio/en-D.mp3' },
  ja: { ensenum: '/audio/ja-A.mp3', ensenada_flow: '/audio/ja-B.mp3', enseflow: '/audio/ja-C.mp3', bcfd: '/audio/ja-D.mp3' }
};

const translations = {
  es: (await import('./translations/es.js')).default,
  en: (await import('./translations/en.js')).default,
  ja: (await import('./translations/ja.js')).default
};

function shuffle(arr) {
  const a = [...arr];
  for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

const params = new URLSearchParams(location.search);
const routeLang = location.pathname.split('/').filter(Boolean)[0];
const lang = ['es','en','ja'].includes(routeLang) ? routeLang : (['es','en','ja'].includes(params.get('lang')) ? params.get('lang') : 'es');
document.documentElement.lang = lang;
const t = translations[lang];
const source = params.get('src') || params.get('utm_source') || 'direct';
const medium = params.get('medium') || params.get('utm_medium') || 'link';
const campaign = params.get('campaign') || params.get('utm_campaign') || 'none';
const cohort = params.get('cohort') || 'general';
const state = {
  id: crypto.randomUUID(),
  startedAt: new Date().toISOString(),
  page: 0,
  order: shuffle(CANDIDATES).map(c=>c.id),
  answers: {}
};

const app = document.querySelector('#app');
const title = document.querySelector('#studyTitle');
const progress = document.querySelector('#progress');
title.textContent = t.title;
document.title = t.title;

const candidate = id => CANDIDATES.find(c=>c.id===id);
const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const qid = (...parts) => parts.join('__');

function textField(id,label,{required=true,multiline=false}={}) {
  const tag = multiline ? 'textarea' : 'input';
  const type = multiline ? '' : 'type="text"';
  return `<div class="question"><label class="main" for="${id}">${esc(label)}</label><${tag} ${type} id="${id}" name="${id}" ${required?'required':''}></${multiline?'textarea':'input'}></div>`;
}
function radio(id,label,opts,{required=true}={}) { return `<fieldset class="question" data-qid="${id}"><legend class="main">${esc(label)}</legend><div class="choices">${opts.map((o,i)=>`<label class="choice"><input type="radio" name="${id}" value="${esc(o)}" ${required?'required':''}> <span>${esc(o)}</span></label>`).join('')}</div></fieldset>`; }
function checks(id,label,opts,{required=true,max=null,exact=null}={}) { return `<fieldset class="question" data-checks="${id}" data-max="${max||''}" data-exact="${exact||''}"><legend class="main">${esc(label)}</legend><div class="choices">${opts.map(o=>`<label class="choice"><input type="checkbox" name="${id}" value="${esc(o)}"> <span>${esc(o)}</span></label>`).join('')}</div>${max?`<span class="hint">${esc(t.chooseMax2)}</span>`:''}${exact?`<span class="hint">${esc(t.chooseExactly2)}</span>`:''}</fieldset>`; }
function scale(id,label,left,right,{min=1,max=7}={}) { const vals=[]; for(let n=min;n<=max;n++) vals.push(n); return `<fieldset class="question"><legend class="main">${esc(label)}</legend><div class="scale">${vals.map(n=>`<label><input type="radio" name="${id}" value="${n}" required> ${n}</label>`).join('')}</div><div class="hint">${esc(left)} ← ${min} ··· ${max} → ${esc(right)}</div></fieldset>`; }

function pageShell(h,body) { return `<div class="card"><h1>${esc(h)}</h1>${body}<div id="error" class="error" role="alert"></div><div class="actions"><button id="next" class="btn">${state.page===6?esc(t.submit):esc(t.next)}</button></div></div>`; }

function render() {
  progress.textContent = `${state.page+1} / 7`;
  const page = state.page;
  let body='';
  if(page===0){
    body=`<p>${esc(t.intro)}</p>${radio('consent',t.consent,[t.yes,t.no])}${textField('firstLanguage',t.firstLanguage)}${textField('country',t.country)}${radio('technical',t.technical,t.technicalOpts)}${textField('industry',t.industry,{required:false})}`;
  } else if(page===1){
    body=`<p>${esc(t.audioIntro)}</p>`+state.order.map((id,i)=>{const c=candidate(id);const letter=String.fromCharCode(65+i);return `<div class="audio-block"><h2>${esc(t.audio)} ${letter}</h2><audio controls preload="metadata" src="${AUDIO[lang][id]}"></audio>${textField(qid('audio',id,'heard'),`${t.audio} ${letter} — ${t.heard}`)}${scale(qid('audio',id,'confidence'),`${t.audio} ${letter} — ${t.confidence}`,'0','10',{min:0,max:10})}${textField(qid('audio',id,'association'),`${t.audio} ${letter} — ${t.associationAudio}`,{required:false,multiline:true})}</div>`}).join('');
  } else if(page===2){
    body=`<p>${esc(t.visualIntro)}</p>`+state.order.map(id=>{const n=candidate(id).name;return `<div class="candidate"><div class="candidate-name">${esc(n)}</div>${textField(qid('visual',id,'pronounce'),t.pronounce(n))}${textField(qid('visual',id,'what'),t.whatIs(n),{multiline:true})}${checks(qid('visual',id,'category'),t.category(n),t.categories,{max:2})}${textField(qid('visual',id,'geo'),t.geo(n))}${textField(qid('visual',id,'suggest'),t.suggest(n),{multiline:true})}${textField(qid('visual',id,'known'),t.known(n),{required:false,multiline:true})}${scale(qid('visual',id,'credible'),t.credible(n),...t.scaleCred)}${scale(qid('visual',id,'distinguish'),t.distinguish(n),...t.scaleDiff)}${scale(qid('visual',id,'remember'),t.remember(n),...t.scaleRemember)}</div>`}).join('');
  } else if(page===3){
    body=`${radio('neutral1',t.neutral1,t.neutral1Opts)}${radio('neutral2',t.neutral2,t.neutral2Opts)}${radio('neutral3',t.neutral3,t.neutral3Opts)}`;
  } else if(page===4){
    body=`${textField('recallAll',t.recallAll,{multiline:true})}${textField('recallFirst',t.recallFirst)}`;
  } else if(page===5){
    body=`<p>${esc(t.contextIntro)}</p>`+state.order.map(id=>{const n=candidate(id).name;return `<div class="candidate"><div class="candidate-name">${esc(n)}</div><div class="descriptor">${esc(t.descriptor)}</div>${scale(qid('context',id,'clear'),t.clear(n),...t.clearScale)}${scale(qid('context',id,'credible'),t.contextCred(n),...t.scaleCred)}${scale(qid('context',id,'proposal'),t.proposal(n),...t.willingScale)}${checks(qid('context',id,'services'),t.otherServices(n),t.services)}${textField(qid('context',id,'geo'),t.contextGeo(n))}${textField(qid('context',id,'confusion'),t.contextConfusion(n),{required:false,multiline:true})}</div>`}).join('');
  } else if(page===6){
    const names=CANDIDATES.map(c=>c.name); body=`${checks('prior',t.prior,[...names,...t.priorExtra],{required:true})}<p>${esc(t.finalContext)}</p>${checks('best2',t.best2,names,{exact:2})}${radio('worst',t.worst,names)}${textField('whyWorst',t.whyWorst,{multiline:true})}${radio('mostProfessional',t.mostProfessional,names)}${radio('origin',t.origin,[...names,t.none])}${radio('overall',t.overall,names,{required:false})}`;
  }
  app.innerHTML=pageShell(t.pages[page],body);
  document.querySelector('#next').addEventListener('click', next);
  app.querySelectorAll('fieldset[data-max],fieldset[data-exact]').forEach(fs=>{
    fs.querySelectorAll('input[type=checkbox]').forEach(cb=>cb.addEventListener('change',()=>{
      const max=Number(fs.dataset.max||0); if(max){const checked=[...fs.querySelectorAll('input:checked')]; if(checked.length>max) cb.checked=false;}
    }));
  });
  window.scrollTo({top:0,behavior:'instant'});
}

function collectPage() {
  const error=document.querySelector('#error'); error.textContent='';
  const formEls=[...app.querySelectorAll('input,textarea,select')];
  for(const el of formEls){ if(el.required && el.type!=='radio' && el.value.trim()===''){error.textContent=t.required;el.focus();return false;} }
  const radioNames=[...new Set(formEls.filter(e=>e.type==='radio'&&e.required).map(e=>e.name))];
  for(const name of radioNames){if(!app.querySelector(`input[name="${CSS.escape(name)}"]:checked`)){error.textContent=t.required;return false;}}
  for(const fs of app.querySelectorAll('fieldset[data-checks]')){
    const checked=[...fs.querySelectorAll('input:checked')]; const exact=Number(fs.dataset.exact||0); const max=Number(fs.dataset.max||0);
    if(exact && checked.length!==exact){error.textContent=t.chooseExactly2;return false;} if(!exact && fs.querySelector('legend') && checked.length===0){error.textContent=t.required;return false;} if(max&&checked.length>max){error.textContent=t.chooseMax2;return false;}
  }
  const data={};
  for(const el of formEls){
    if(el.type==='radio'){if(el.checked)data[el.name]=el.value;}
    else if(el.type==='checkbox'){if(el.checked)(data[el.name]??=[]).push(el.value);}
    else data[el.name]=el.value.trim();
  }
  Object.assign(state.answers,data); return true;
}

async function next() {
  if(!collectPage()) return;
  if(state.page===0 && state.answers.consent===t.no){app.innerHTML=`<div class="card success"><h1>${esc(t.declined)}</h1></div>`;progress.textContent='';return;}
  if(state.page<6){state.page++;render();return;}
  const submittedAt=new Date().toISOString();
  const btn=document.querySelector('#next');btn.disabled=true;
  try{
    const res=await fetch('/api/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:state.id,language:lang,source,medium,campaign,cohort,candidateOrder:state.order,answers:state.answers,startedAt:state.startedAt,submittedAt})});
    if(!res.ok) throw new Error(await res.text());
    app.innerHTML=`<div class="card success"><h1>${esc(t.thanks)}</h1></div>`;progress.textContent='';
  }catch(e){document.querySelector('#error').textContent='Submission failed. Please try again.';btn.disabled=false;console.error(e);}
}

history.pushState(null,'',location.href);
window.addEventListener('popstate',()=>history.pushState(null,'',location.href));
render();
