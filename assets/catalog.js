/* [Codex] 目录以搜索数据为源，只创建当前页；不依赖被删除的卡片 DOM。 */
(() => {
 'use strict';
 const catalog=document.querySelector('[data-dynamic-catalog]');if(!catalog)return;
 const q=document.getElementById('query'),df=document.getElementById('discipline'),lf=document.getElementById('lean');
 const grid=catalog.querySelector('.results-grid'),favorites=!!document.body.dataset.favoritesPage;
 const entries=(window.searchData||[]).filter(x=>favorites||/^\d{3}$/.test(x.id));
 const gaps=[...catalog.querySelectorAll('template[data-gap-id]')].map(t=>({id:t.dataset.gapId,placeholder:true,html:t.innerHTML,title:t.content.textContent,search:''}));
 if(!favorites)entries.push(...gaps);
 entries.sort((a,b)=>/^\d{3}$/.test(a.id)&&/^\d{3}$/.test(b.id)?a.id.localeCompare(b.id):0);
 const searchable=new Map(entries.map(x=>[x.id,(x.title+' '+x.search).toLocaleLowerCase()]));
 let page=0;const size=24;
 let uf=null;
 if(document.body.dataset.papers){
  uf=document.createElement('select');uf.id='update-kind';uf.setAttribute('aria-label','更新情况');
  for(const [value,label]of [['','更新情况不限'],['any','全部有更新'],['withdrawn','有论文撤回'],['revised','有论文修订'],['references','引用更新'],['formalization','新增形式化'],['support','部分结果已形式化']]){
   const option=document.createElement('option');option.value=value;option.textContent=label;uf.append(option);
  }
  document.getElementById('clear').before(uf);
 }
 const favoriteOnly=document.createElement('input');favoriteOnly.type='checkbox';favoriteOnly.id='favorites-only';
 if(!favorites){const label=document.createElement('label');label.className='favorites-filter';label.append(favoriteOnly,document.createTextNode('只看收藏'));catalog.querySelector('.results-meta').prepend(label)}
 function span(className,text){const el=document.createElement('span');el.className=className;el.textContent=text;return el}
 function renderCard(x){
  if(x.placeholder){const t=document.createElement('template');t.innerHTML=x.html;return t.content.firstElementChild.cloneNode(true)}
  const card=document.createElement('article');card.className='entry-card'+(x.reasoning?' has-reasoning':'');
  Object.assign(card.dataset,{id:x.id,discipline:x.discipline,lean:x.state,papers:x.paper_count||0,updateKinds:x.update_kinds||''});
  const meta=document.createElement('div');meta.className='entry-meta';meta.append(span('',x.id),span('',x.discipline),span('tag '+x.state,x.state_label));
  if(x.reasoning){const a=document.createElement('a');a.className='reasoning-badge';a.href=x.reasoning.url;a.target='_blank';a.rel='noopener';a.textContent='思维链摘要 ↗';meta.append(a)}
  const heading=document.createElement('div');heading.className='card-heading';
  const h=document.createElement('h3'),a=document.createElement('a');a.href=x.url;a.innerHTML=x.title_html;h.append(a);heading.append(h);
  if(x.card_badges_html){const tags=document.createElement('div');tags.className='card-status';tags.innerHTML=x.card_badges_html;heading.append(tags)}
  const summary=document.createElement('p');summary.innerHTML=x.summary_html;card.append(meta,heading,summary);
  if(/^\d{3}$/.test(x.id))card.append(span('card-count',x.paper_count+' 篇论文'));
  else if(x.footer_html){const footer=document.createElement('div');footer.className='entry-meta card-count';footer.innerHTML=x.footer_html;card.append(footer)}
  return card;
 }
 function matches(x,words,d,l){
  return words.every(w=>/^#?\d{3}$/.test(w)?x.id===w.replace('#',''):searchable.get(x.id).includes(w))
   &&(!d||x.discipline===d)&&(!l||x.state===l)
   &&(!uf?.value||(uf.value==='any'?!!x.update_kinds:(x.update_kinds||'').split(' ').includes(uf.value)))
   &&(!(favorites||favoriteOnly.checked)||window.mathLibrary?.has(x.id));
 }
 function update(reset=true){
  if(reset)page=0;
  const words=q.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean),d=df.value,l=lf.value;
  const found=entries.filter(x=>matches(x,words,d,l)),pages=Math.max(1,Math.ceil(found.length/size));page=Math.max(0,Math.min(page,pages-1));
  grid.replaceChildren(...found.slice(page*size,(page+1)*size).map(renderCard));window.mathLibrary?.decorate(grid);
  const results=found.filter(x=>!x.placeholder),gaps=found.length-results.length;
  document.getElementById('result-count').textContent=!results.length&&gaps?gaps+' 个空缺编号':results.length+' '+(document.body.dataset.unit||'项')+(document.body.dataset.papers?' · '+results.reduce((n,x)=>n+x.paper_count,0)+' 篇论文':'');
  document.querySelectorAll('[data-page-label]').forEach(el=>el.textContent=(page+1)+' / '+pages);
  document.querySelectorAll('[data-page-direction]').forEach(el=>el.disabled=Number(el.dataset.pageDirection)<0?page===0:page===pages-1);
  document.getElementById('paging-bottom').hidden=pages===1;document.getElementById('empty').hidden=found.length>0;
  const emptyFavorites=favorites&&!window.mathLibrary?.ids().length;
  document.getElementById('empty').textContent=emptyFavorites?'还没有收藏。':'未找到相关结果。';
  catalog.querySelector('.searchbar').hidden=emptyFavorites;catalog.querySelector('.results-meta').hidden=emptyFavorites;
  document.querySelectorAll('button[data-pick-lean]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.pickLean===l)));
  document.querySelectorAll('.library-branch[data-pick-discipline]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.pickDiscipline===d)));
  try{const url=new URL(location.href);if(d)url.searchParams.set('discipline',d);else url.searchParams.delete('discipline');if(url.href!==location.href)history.replaceState(null,'',url.href)}catch(e){}
 }
 [q,df,lf,uf,favoriteOnly].filter(Boolean).forEach(el=>el.addEventListener(el===q?'input':'change',()=>update()));
 window.addEventListener('favoriteschange',()=>update(false));
 document.getElementById('clear').onclick=()=>{q.value='';df.value='';lf.value='';if(uf)uf.value='';favoriteOnly.checked=false;update()};
 document.querySelectorAll('[data-page-direction]').forEach(el=>el.onclick=()=>{page+=Number(el.dataset.pageDirection);update(false);catalog.scrollIntoView({block:'start',behavior:'instant'})});
 document.querySelectorAll('[data-pick-discipline]').forEach(el=>el.onclick=()=>{df.value=el.dataset.pickDiscipline;q.value='';update();catalog.scrollIntoView({block:'start'})});
 document.querySelectorAll('[data-pick-lean]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();lf.value=lf.value===el.dataset.pickLean?'':el.dataset.pickLean;update();catalog.scrollIntoView({block:'start'})}));
 const params=new URLSearchParams(location.search);if(params.has('discipline'))df.value=params.get('discipline');if(params.has('q'))q.value=params.get('q');update();
})();
