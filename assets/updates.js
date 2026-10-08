(() => {
 'use strict';
 const entries=[...document.querySelectorAll('.history-change[data-history-kind]')];
 const query=document.getElementById('history-query'),favorites=document.getElementById('history-favorites');
 let kind=new URLSearchParams(location.search).get('kind')||'';
 const valid=new Set([...document.querySelectorAll('[data-history-filter]')].map(x=>x.dataset.historyFilter));
 if(!valid.has(kind))kind='';
 function updateHistoryFilter(){
  const words=query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  let count=0;const families=new Set();
  for(const entry of entries){
   const matches=(!kind||entry.dataset.historyKind===kind)&&words.every(w=>/^(?:\d{3}-p\d{2}|lean-\d{3})$/.test(w)?entry.dataset.updateRecord.toLowerCase()===w:entry.textContent.toLocaleLowerCase().includes(w))&&(!favorites.checked||window.mathLibrary?.has(entry.dataset.family));
   entry.hidden=!matches;
   if(matches){count++;families.add(entry.dataset.family)}
  }
  document.querySelectorAll('[data-history-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.historyFilter===kind)));
  document.getElementById('history-count').textContent=count+' 条更新 · '+families.size+' 组结果';
  document.getElementById('history-empty').hidden=count!==0;
  try{const url=new URL(location.href);if(kind)url.searchParams.set('kind',kind);else url.searchParams.delete('kind');history.replaceState(null,'',url.href)}catch(e){}
 }
 query.addEventListener('input',updateHistoryFilter);
 favorites.addEventListener('change',updateHistoryFilter);
 window.addEventListener('favoriteschange',updateHistoryFilter);
 document.querySelectorAll('[data-history-filter]').forEach(b=>b.onclick=()=>{kind=b.dataset.historyFilter;updateHistoryFilter()});
 function revealHistory(){
  let id;try{id=decodeURIComponent(location.hash.slice(1))}catch(e){return}
  const target=document.getElementById(id);
  if(target?.matches('.history-change')){
   kind='';query.value='';favorites.checked=false;updateHistoryFilter();
   requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  }
 }
 updateHistoryFilter();revealHistory();window.addEventListener('hashchange',revealHistory);

 const data=window.updateHistory;
 function source(path,initial=false){return 'https://github.com/openai/math/blob/'+(initial?data.baseline:data.head)+'/'+path}
 function link(url,text){const a=document.createElement('a');a.href=url;a.textContent=text;a.target='_blank';a.rel='noopener';return a}
 function renderTable(kind,items,filter,row){
  const target=document.getElementById(kind==='initial'?'initial-papers':'file-changes');
  const input=document.getElementById(kind+'-query');let page=0;const size=30;
  function draw(reset=false){
   if(reset)page=0;
   const found=items.filter(x=>filter(x,input.value.trim().toLocaleLowerCase()));
   const pages=Math.max(1,Math.ceil(found.length/size));page=Math.max(0,Math.min(page,pages-1));
   target.replaceChildren(...found.slice(page*size,(page+1)*size).map(row));
   if(!found.length){const p=document.createElement('p');p.textContent='没有符合条件的记录。';target.append(p)}
   document.getElementById(kind+'-page-label').textContent=found.length+' 项 · '+(page+1)+' / '+pages;
   document.querySelectorAll('[data-'+kind+'-page]').forEach(b=>b.disabled=Number(b.dataset[kind+'Page'])<0?page===0:page===pages-1);
  }
  input.addEventListener('input',()=>draw(true));
  document.querySelectorAll('[data-'+kind+'-page]').forEach(b=>b.onclick=()=>{page+=Number(b.dataset[kind+'Page']);draw();target.scrollIntoView({block:'start'})});
  draw();return()=>draw(true);
 }
 renderTable('initial',data.initial_papers,(x,q)=>(x.id+' '+x.title+' '+x.title_en).toLocaleLowerCase().includes(q),x=>{
  const row=document.createElement('div');row.className='history-table-row';
  const id=document.createElement('span');id.textContent=x.id;
  const title=link(source(x.path,true),'');title.innerHTML=x.title_html;
  const date=document.createElement('time');date.dateTime=x.date;date.textContent=x.date.replaceAll('-','.')+' 版';
  row.append(id,title,date);return row;
 });
 const category=document.getElementById('file-category');
 const redraw=renderTable('file',data.files,(x,q)=>{
  const c=category.value;return x.path.toLocaleLowerCase().includes(q)&&(!c||(c==='root'?!x.path.includes('/'):x.path.startsWith(c)));
 },x=>{
  const row=document.createElement('div');row.className='history-table-row';
  const status=document.createElement('span');status.textContent={added:'新增',modified:'修改',removed:'移除'}[x.status];
  const path=document.createElement('code');path.textContent=x.path;
  const links=document.createElement('div');
  if(x.status!=='added')links.append(link(source(x.path,true),'旧版'));
  if(x.status!=='removed')links.append(link(source(x.path),'新版'));
  row.append(status,path,links);return row;
 });
 category.addEventListener('change',redraw);
})();
