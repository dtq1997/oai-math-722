window.mathErrors=[];
function renderMath(root=document){root.querySelectorAll('.math:not([data-rendered])').forEach(el=>{try{katex.render(el.dataset.tex,el,{throwOnError:true,strict:false,output:'htmlAndMathml'});el.dataset.rendered='1'}catch(e){el.classList.add('math-error');window.mathErrors.push(el.dataset.tex+': '+e.message)}})}
renderMath();
const detailTabs=[...document.querySelectorAll('[data-detail-tab]')];
function selectDetailPanel(id){
 if(!detailTabs.some(tab=>tab.dataset.detailTab===id))return;
 detailTabs.forEach(tab=>{const selected=tab.dataset.detailTab===id;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;document.getElementById(tab.dataset.detailTab).hidden=!selected});
}
detailTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>{selectDetailPanel(tab.dataset.detailTab);try{const url=new URL(location.href);url.hash=tab.dataset.detailTab==='research-content'?'':tab.dataset.detailTab;history.pushState(null,'',url.href)}catch(e){}});
 tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%detailTabs.length;else if(event.key==='ArrowLeft')next=(index+detailTabs.length-1)%detailTabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=detailTabs.length-1;else return;event.preventDefault();detailTabs[next].focus();detailTabs[next].click()});
});
function revealFragment(){
 let id;try{id=decodeURIComponent(location.hash.slice(1))}catch(e){return}
 if(!id){selectDetailPanel('research-content');return}
 const target=id&&document.getElementById(id);if(!target)return;
 const panel=target.closest('[data-detail-panel]');if(panel)selectDetailPanel(panel.id);
 if(target.tagName==='DETAILS')target.open=true;
 for(let parent=target.parentElement;parent;parent=parent.parentElement){if(parent.tagName==='DETAILS')parent.open=true}
 requestAnimationFrame(()=>(target.matches('[data-detail-panel]')?document.querySelector('.entry-tabs'):target).scrollIntoView({block:target.matches('[data-detail-panel]')?'start':'center'}));
}
revealFragment();
window.addEventListener('hashchange',revealFragment);
window.addEventListener('popstate',revealFragment);
document.querySelectorAll('.theme-toggle').forEach(button=>{
 const updateLabel=()=>{const dark=document.documentElement.dataset.theme==='dark';button.textContent=dark?'浅色':'深色';button.setAttribute('aria-label','切换到'+(dark?'浅色':'深色')+'外观')};
 button.onclick=()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('math-library-theme-v2',theme)}catch(e){}updateLabel()};
 updateLabel();
});
const cards=[...document.querySelectorAll('.entry-card')];
const q=document.getElementById('query'),df=document.getElementById('discipline'),lf=document.getElementById('lean');
if(q&&cards.length){
 let uf=null;
 if(document.body.dataset.papers){
  uf=document.createElement('select');uf.id='update-kind';uf.setAttribute('aria-label','更新情况');
  for(const [value,label]of [['','更新情况不限'],['any','全部有更新'],['withdrawn','有论文撤回'],['revised','有论文修订'],['references','引用更新'],['formalization','新增形式化'],['support','辅助结果形式化']]){const option=document.createElement('option');option.value=value;option.textContent=label;uf.append(option)}
  document.getElementById('clear').before(uf);
 }
 const favoriteOnly=document.createElement('input');favoriteOnly.type='checkbox';favoriteOnly.id='favorites-only';
 const favoriteLabel=document.createElement('label');favoriteLabel.className='favorites-filter';favoriteLabel.append(favoriteOnly,document.createTextNode('只看收藏'));
 if(!document.body.dataset.favoritesPage)document.querySelector('.results-meta').prepend(favoriteLabel);
 let page=0,matched=cards;const size=24;
 const data=Object.fromEntries((window.searchData||[]).map(x=>[x.id,x]));
 const text=new Map(cards.map(c=>[c,(c.textContent+' '+(data[c.dataset.id]?.search||'')).toLocaleLowerCase()]));
 const update=(reset=true)=>{if(reset)page=0;const words=q.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean),d=df?.value||'',l=lf?.value||'';
 const updateMatch=c=>!uf?.value||(uf.value==='any'?!!c.dataset.updateKinds:(c.dataset.updateKinds||'').split(' ').includes(uf.value));
 matched=cards.filter(c=>words.every(w=>/^#?\d{3}$/.test(w)?c.dataset.id===w.replace('#',''):text.get(c).includes(w))&&(!d||c.dataset.discipline===d)&&(!l||c.dataset.lean===l)&&updateMatch(c)&&(!(favoriteOnly.checked||document.body.dataset.favoritesPage)||window.mathLibrary?.has(c.dataset.id)));
 const pages=Math.max(1,Math.ceil(matched.length/size));page=Math.min(page,pages-1);cards.forEach(c=>c.hidden=true);matched.slice(page*size,(page+1)*size).forEach(c=>c.hidden=false);
 const results=matched.filter(c=>!c.dataset.placeholder),gaps=matched.length-results.length;
 document.querySelectorAll('.library-branch[data-pick-discipline]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.pickDiscipline===d)));
 try{const url=new URL(location.href);if(d)url.searchParams.set('discipline',d);else url.searchParams.delete('discipline');if(url.href!==location.href)history.replaceState(null,'',url.href)}catch(e){}
 document.getElementById('result-count').textContent=!results.length&&gaps?gaps+' 个空缺编号':results.length+' '+(document.body.dataset.unit||'项')+(document.body.dataset.papers?' · '+results.reduce((s,c)=>s+Number(c.dataset.papers||0),0)+' 篇论文':'');
 document.querySelectorAll('[data-page-label]').forEach(el=>el.textContent=(page+1)+' / '+pages);document.querySelectorAll('[data-page-direction]').forEach(el=>el.disabled=Number(el.dataset.pageDirection)<0?page===0:page===pages-1);document.getElementById('paging-bottom').hidden=pages===1;document.getElementById('empty').hidden=matched.length>0;};
 [q,df,lf,uf,favoriteOnly].filter(Boolean).forEach(el=>el.addEventListener(el===q?'input':'change',()=>update()));window.addEventListener('favoriteschange',()=>update());document.getElementById('clear').onclick=()=>{q.value='';if(df)df.value='';if(lf)lf.value='';if(uf)uf.value='';favoriteOnly.checked=false;update()};
 document.querySelectorAll('[data-page-direction]').forEach(el=>el.onclick=()=>{page+=Number(el.dataset.pageDirection);update(false);document.getElementById('catalog').scrollIntoView({block:'start',behavior:'instant'})});
 document.querySelectorAll('[data-pick-discipline]').forEach(el=>el.onclick=()=>{df.value=el.dataset.pickDiscipline;q.value='';update();document.getElementById('catalog').scrollIntoView({block:'start'})});
 const params=new URLSearchParams(location.search);if(params.has('discipline')&&df)df.value=params.get('discipline');if(params.has('q'))q.value=params.get('q');update();
}
const homeQuery=document.getElementById('home-query');
if(homeQuery){
 const result=document.getElementById('home-results'),sections=document.getElementById('home-collections'),counter=document.getElementById('home-count');let shown=40;
 function homeSearch(){const term=homeQuery.value.trim().toLocaleLowerCase();result.replaceChildren();sections.hidden=!!term;counter.hidden=!term;document.getElementById('more-search').hidden=true;if(!term)return;const words=term.split(/\s+/);const found=window.searchData.filter(x=>(!document.body.dataset.appendices||!/^\d{3}$/.test(x.id))&&words.every(w=>(x.title+' '+x.search).toLocaleLowerCase().includes(w)));counter.textContent=found.length+' 项研究';
 for(const x of found.slice(0,shown)){const a=document.createElement('a');a.className='result-link';a.href=x.url;const meta=document.createElement('span');meta.className='meta';meta.textContent=x.group+' · '+x.id;if(x.reasoning){a.classList.add('has-reasoning');const badge=document.createElement('span');badge.className='reasoning-badge';badge.textContent='思维链摘要';meta.append(badge)}const h=document.createElement('h3');h.innerHTML=x.title_html;const p=document.createElement('p');p.innerHTML=x.summary_html;a.append(meta,h,p);result.append(a)}renderMath(result);document.getElementById('more-search').hidden=found.length<=shown;
 }
 homeQuery.addEventListener('input',()=>{shown=40;homeSearch()});document.getElementById('more-search').onclick=()=>{shown+=40;homeSearch()};
 document.querySelectorAll('[data-filter-group]').forEach(el=>el.onclick=()=>{document.querySelectorAll('[data-filter-group]').forEach(b=>b.setAttribute('aria-pressed',b===el?'true':'false'));document.querySelectorAll('.collection-row').forEach(row=>row.hidden=!!el.dataset.filterGroup&&row.dataset.group!==el.dataset.filterGroup)});
}

const preview=document.getElementById('result-preview');
if(preview){
 const entries=new Map((window.searchData||[]).map(x=>[x.id,x]));
 const dots=[...document.querySelectorAll('[data-preview-id]')];
 let active=null,hideTimer=null,dismissed=null;
 const cancelHide=()=>{clearTimeout(hideTimer);hideTimer=null};
 function hidePreview(){
  cancelHide();preview.hidden=true;
  if(active){active.classList.remove('preview-active');active.setAttribute('aria-expanded','false')}
  active=null;
 }
 document.addEventListener('librarymenuopen',hidePreview);
 function positionPreview(){
  if(!active||preview.hidden)return;
  const r=active.getBoundingClientRect(),gap=12,pad=12;
  const w=preview.offsetWidth,h=preview.offsetHeight;
  let left=r.right+gap,top=r.top-14;
  if(left+w>innerWidth-pad){
   if(r.left-gap-w>=pad)left=r.left-gap-w;
   else{left=Math.max(pad,Math.min(r.left,innerWidth-w-pad));top=r.bottom+gap;if(top+h>innerHeight-pad&&r.top-gap-h>=pad)top=r.top-gap-h}
  }
  preview.style.left=Math.max(pad,Math.min(left,innerWidth-w-pad))+'px';
  preview.style.top=Math.max(pad,Math.min(top,innerHeight-h-pad))+'px';
 }
 function fillPreview(x){
  preview.innerHTML='<header class="preview-header"><span class="preview-id"></span><button type="button" class="preview-close" aria-label="关闭预览">×</button></header><h3 class="preview-title"></h3><div class="preview-facts"><span class="preview-count"></span><span class="tag"></span></div><p class="preview-summary"></p><details class="preview-original"><summary>英文原文</summary><div class="english" lang="en"></div></details><ol class="preview-papers"></ol><footer class="preview-links"><a class="preview-detail"></a></footer>';
  preview.querySelector('.preview-id').textContent=x.id+' · '+x.discipline;
  preview.querySelector('.preview-title').innerHTML=x.title_html;
  preview.querySelector('.preview-count').textContent=x.paper_count+' 篇论文';
  const state=preview.querySelector('.tag');state.classList.add(x.state);state.textContent=x.state_label;
  if(x.update_preview_html)preview.querySelector('.preview-papers').insertAdjacentHTML('afterend',x.update_preview_html);
  preview.querySelector('.preview-summary').innerHTML=x.summary_html;
  const original=preview.querySelector('.preview-original');
  original.querySelector('.english').innerHTML=x.original_html;
  for(const paper of x.papers){
   const li=document.createElement('li'),a=document.createElement('a');
   a.href=paper.url;a.target='_blank';a.rel='noopener';a.innerHTML=paper.title_html;
   li.append(a);preview.querySelector('.preview-papers').append(li);
  }
  const detail=preview.querySelector('.preview-detail');detail.href=x.url;
  detail.textContent=x.paper_count>2?'全部 '+x.paper_count+' 篇论文 →':'结果详情 →';
  if(x.reasoning){
   const a=document.createElement('a');a.className='preview-reasoning';a.href=x.reasoning.url;
   a.target='_blank';a.rel='noopener';a.textContent='思维链摘要（删节）↗';
   preview.querySelector('.preview-links').append(a);
  }
  preview.classList.toggle('with-reasoning',!!x.reasoning);
  preview.querySelector('.preview-close').onclick=()=>dismissPreview();
  renderMath(preview);
 }
 function showPreview(dot){
  const x=entries.get(dot.dataset.previewId);if(!x)return;
  cancelHide();
  const changed=active!==dot;
  if(changed){hidePreview();active=dot;fillPreview(x)}
  preview.hidden=false;active.classList.add('preview-active');active.setAttribute('aria-expanded','true');
  if(changed)preview.scrollTop=0;
  positionPreview();
 }
 function dismissPreview(){
  const trigger=active,restore=preview.contains(document.activeElement);
  dismissed=trigger;hidePreview();
  if(restore&&trigger)trigger.focus({preventScroll:true});
 }
 function scheduleHide(){
  cancelHide();hideTimer=setTimeout(()=>{
   if(preview.matches(':hover')||preview.contains(document.activeElement)||active===document.activeElement)return;
   hidePreview();
  },160);
 }
 for(const dot of dots){
  let pointerType='mouse';
  dot.addEventListener('pointerdown',event=>{pointerType=event.pointerType});
  dot.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){dismissed=null;showPreview(dot)}});
  dot.addEventListener('pointerleave',scheduleHide);
  dot.addEventListener('focus',()=>{if(dismissed!==dot)showPreview(dot)});
  dot.addEventListener('blur',()=>{dismissed=null;scheduleHide()});
  dot.addEventListener('click',event=>{if((event.pointerType==='touch'||pointerType==='touch')&&event.detail!==0){event.preventDefault();showPreview(dot)}});
 }
 preview.addEventListener('pointerenter',cancelHide);
 preview.addEventListener('toggle',positionPreview,true);
 preview.addEventListener('pointerleave',scheduleHide);
 preview.addEventListener('focusin',cancelHide);
 preview.addEventListener('focusout',scheduleHide);
 document.addEventListener('pointerdown',event=>{if(active&&!preview.contains(event.target)&&!active.contains(event.target))hidePreview()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!preview.hidden){event.preventDefault();dismissPreview()}});
 window.addEventListener('resize',positionPreview);
 window.addEventListener('scroll',event=>{if(!(event.target instanceof Node)||!preview.contains(event.target))hidePreview()},true);
 document.querySelector('.matrix').addEventListener('toggle',event=>{if(!event.target.open)hidePreview()});
}
