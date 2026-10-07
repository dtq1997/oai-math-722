(() => {
 'use strict';
 const key='oai-math-favorites-v1',known=new Set(window.libraryEntryIds||[]);
 let saved=new Set(),storageAvailable=true,menuTarget=null;
 const notice=document.createElement('div');notice.className='library-notice';notice.setAttribute('role','status');notice.hidden=true;document.body.append(notice);
 let noticeTimer;
 function announce(text){notice.textContent=text;notice.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice.hidden=true},4500)}
 function decode(raw){const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.favorites))throw Error('收藏文件格式不符');return new Set(data.favorites.filter(id=>typeof id==='string'&&known.has(id)))}
 try{const raw=localStorage.getItem(key);if(raw)saved=decode(raw)}catch(e){storageAvailable=false}
 function entryId(element){return element.dataset.previewId||element.dataset.id||element.dataset.entryId}
 function update(){
  document.querySelectorAll('.dot[data-preview-id],.entry-card:not([data-placeholder])').forEach(element=>element.classList.toggle('is-favorite',saved.has(entryId(element))));
  document.querySelectorAll('[data-favorite-id]').forEach(button=>{const on=saved.has(button.dataset.favoriteId);button.textContent=on?'★':'☆';button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'取消收藏':'收藏');button.title=on?'取消收藏':'收藏'});
  document.querySelectorAll('.library-favorite-count').forEach(element=>element.textContent=String(saved.size));
  window.dispatchEvent(new Event('favoriteschange'));
 }
 function persist(){
  try{localStorage.setItem(key,JSON.stringify({version:1,favorites:[...saved]}));storageAvailable=true}catch(e){storageAvailable=false;announce('浏览器无法保存收藏，请导出备份。')}
  update();
 }
 function toggle(id){if(!known.has(id))return;if(saved.has(id))saved.delete(id);else saved.add(id);persist()}
 window.mathLibrary={has:id=>saved.has(id),ids:()=>[...saved],toggle};
 function favoriteButton(id){const button=document.createElement('button');button.type='button';button.className='favorite-button';button.dataset.favoriteId=id;button.onclick=()=>toggle(id);return button}
 document.querySelectorAll('.entry-card:not([data-placeholder])').forEach(card=>{const meta=card.querySelector('.entry-meta');if(meta)meta.append(favoriteButton(card.dataset.id))});
 if(document.body.dataset.entryId&&known.has(document.body.dataset.entryId)){
  const heading=document.querySelector('.page-heading'),button=favoriteButton(document.body.dataset.entryId);button.classList.add('detail-favorite');heading.append(button);
 }
 const menu=document.createElement('div');menu.className='library-context-menu';menu.setAttribute('role','menu');menu.hidden=true;
 const action=document.createElement('button');action.type='button';action.setAttribute('role','menuitem');
 const open=document.createElement('a');open.setAttribute('role','menuitem');open.target='_blank';open.rel='noopener';open.textContent='在新标签页打开';menu.append(action,open);document.body.append(menu);
 function hideMenu(restore=false){const target=menuTarget;menu.hidden=true;menuTarget=null;if(restore&&target)target.focus({preventScroll:true})}
 document.addEventListener('contextmenu',event=>{
  const block=event.target.closest('.dot[data-preview-id],.entry-card:not([data-placeholder])');
  if(!block||window.getSelection()?.toString()||!known.has(entryId(block)))return;
  event.preventDefault();menuTarget=event.target.closest('a,button')||block;
  const id=entryId(block);action.textContent=saved.has(id)?'★ 取消收藏':'☆ 收藏';action.onclick=()=>{toggle(id);hideMenu(true)};
  open.href=block.getAttribute('href')||block.querySelector('h3 a').href;open.onclick=()=>hideMenu();
  menu.hidden=false;document.dispatchEvent(new Event('librarymenuopen'));
  const rect=block.getBoundingClientRect(),x=event.clientX||rect.left,y=event.clientY||rect.bottom;
  menu.style.left=Math.max(8,Math.min(x,innerWidth-menu.offsetWidth-8))+'px';menu.style.top=Math.max(8,Math.min(y,innerHeight-menu.offsetHeight-8))+'px';action.focus();
 });
 document.addEventListener('pointerdown',event=>{if(!menu.hidden&&!menu.contains(event.target))hideMenu()});
 document.addEventListener('keydown',event=>{if(menu.hidden)return;if(event.key==='Escape'){event.preventDefault();hideMenu(true)}if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();(document.activeElement===action?open:action).focus()}});
 window.addEventListener('scroll',()=>hideMenu(),{passive:true});window.addEventListener('resize',()=>hideMenu());
 window.addEventListener('storage',event=>{if(event.key!==key)return;try{saved=event.newValue?decode(event.newValue):new Set();update()}catch(e){announce('另一窗口的收藏数据无法读取。')}});
 document.getElementById('export-favorites')?.addEventListener('click',()=>{
  const data=JSON.stringify({version:1,favorites:[...saved],exported_at:new Date().toISOString()},null,2),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='数学研究收藏.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 document.getElementById('import-favorites')?.addEventListener('change',async event=>{
  const input=event.target,file=input.files[0];if(!file)return;
  try{if(file.size>1024*1024)throw Error('收藏文件过大');const incoming=decode(await file.text()),before=saved.size;for(const id of incoming)saved.add(id);persist();if(storageAvailable)announce('已导入 '+(saved.size-before)+' 项收藏。')}
  catch(e){announce(e instanceof SyntaxError?'无法读取收藏文件，请选择导出的 JSON 文件。':e.message)}finally{input.value=''}
 });
 update();
})();
