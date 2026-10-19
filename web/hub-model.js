/* Daily-work selectors. No network or DOM dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DalHubModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  const STATUSES=['Planlandı','Devam ediyor','Beklemede','Tamamlandı'];
  function today(now=new Date()){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;
  }
  function plus(day,n){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
  const norm=s=>String(s||'').toLocaleLowerCase('tr-TR');
  function matches(t,filter='open',day=today()){
    if(filter==='all')return true;if(filter==='done')return t.done;
    if(t.done)return false;
    if(filter==='doing')return t.status==='Devam ediyor';
    if(filter==='today')return t.dueDate===day;
    if(filter==='overdue')return !!t.dueDate&&t.dueDate<day;
    if(filter==='week')return !!t.dueDate&&t.dueDate>=day&&t.dueDate<plus(day,7);
    if(filter==='undated')return !t.dueDate;
    return true;
  }
  function select(items,{filter='open',userId='',boardId='',query='',day=today()}={}){
    return items.filter(t=>(!userId||t.ownerId===userId)&&(!boardId||t.boardId===boardId)&&matches(t,filter,day)&&norm([t.text,t.owner,t.boardName,t.nodeTitle].join(' ')).includes(norm(query)))
      .sort((a,b)=>Number(a.done)-Number(b.done)||(a.dueDate||'9999').localeCompare(b.dueDate||'9999')||Number(b.priority==='Yüksek')-Number(a.priority==='Yüksek')||a.text.localeCompare(b.text,'tr'));
  }
  const ownerKey=t=>t.ownerId?'uid:'+t.ownerId:t.owner?'name:'+t.owner:'unassigned';
  // General work is intentionally all owners and all states; personal filters never leak here.
  function workspaceItems(items,{boardId='',owner='',query='',filter='all',day=today()}={}){
    return select(items,{boardId,query,filter,day}).filter(t=>!owner||ownerKey(t)===owner);
  }
  const initials=s=>String(s||'?').trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toLocaleUpperCase('tr-TR');
  const percent=(done,total)=>total?Math.round(done/total*100):0;
  function projectSummary(items,boardId){
    const rows=items.filter(t=>t.boardId===boardId),people=new Map();
    for(const t of rows){const key=t.ownerId?'uid:'+t.ownerId:t.owner?'name:'+t.owner:'unassigned';if(!people.has(key))people.set(key,{key,id:t.ownerId||'',name:t.owner||(t.ownerId?'Sorumlu ekip üyesi':'Atanmadı'),assigned:!!(t.ownerId||t.owner),total:0,done:0,doing:0});const p=people.get(key);p.total++;if(t.done)p.done++;else if(t.status==='Devam ediyor')p.doing++;}
    const done=rows.filter(t=>t.done).length;
    return {total:rows.length,done,open:rows.length-done,doing:rows.filter(t=>!t.done&&t.status==='Devam ediyor').length,unassigned:rows.filter(t=>!t.ownerId&&!t.owner).length,percent:percent(done,rows.length),people:[...people.values()].sort((a,b)=>Number(b.assigned)-Number(a.assigned)||a.name.localeCompare(b.name,'tr'))};
  }
  function safeKey(s){return /^[a-zA-Z0-9_:-]+$/.test(s)?s:'';}
  return {STATUSES,today,plus,norm,matches,select,ownerKey,workspaceItems,initials,percent,projectSummary,safeKey};
});
