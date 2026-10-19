/* Dashboard derives only from the authorized hub snapshot. No extra requests. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./hub-model.js'):root.DalHubModel);if(typeof module==='object'&&module.exports)module.exports=api;else root.DalDashboardModel=api;})(typeof globalThis!=='undefined'?globalThis:this,M=>{
  'use strict';
  const FILTERS=['overdue','today','week','unassigned'];
  function summarize(data,{day=M.today()}={}){
    const boards=(data.boards||[]).filter(b=>!b.archived),ids=new Set(boards.map(b=>b.id));
    const items=M.workspaceItems((data.items||[]).filter(t=>ids.has(t.boardId)),{day});
    const open=items.filter(t=>!t.done),done=items.length-open.length;
    const attention={overdue:open.filter(t=>M.matches(t,'overdue',day)),today:open.filter(t=>M.matches(t,'today',day)),week:open.filter(t=>M.matches(t,'week',day)),unassigned:open.filter(t=>M.ownerKey(t)==='unassigned')};
    const states=M.STATUSES.map(status=>({status,count:items.filter(t=>(t.done?'Tamamlandı':t.status||'Planlandı')===status).length}));
    const projects=boards.filter(b=>b.purpose!=='daily').map(b=>{const rows=items.filter(t=>t.boardId===b.id),completed=rows.filter(t=>t.done).length,late=rows.filter(t=>M.matches(t,'overdue',day)).length;return {...b,total:rows.length,done:completed,open:rows.length-completed,late,percent:M.percent(completed,rows.length)};}).sort((a,b)=>b.late-a.late||b.open-a.open||a.name.localeCompare(b.name,'tr'));
    const byOwner=new Map();
    for(const t of open){const key=M.ownerKey(t);if(key==='unassigned')continue;if(!byOwner.has(key))byOwner.set(key,{key,id:t.ownerId||'',name:t.owner||'Ekip üyesi',open:0,doing:0,late:0});const p=byOwner.get(key);p.open++;if(t.status==='Devam ediyor')p.doing++;if(M.matches(t,'overdue',day))p.late++;}
    const people=[...byOwner.values()].sort((a,b)=>b.open-a.open||b.late-a.late||a.name.localeCompare(b.name,'tr'));
    return {day,items,total:items.length,open:open.length,done,percent:M.percent(done,items.length),states,projects,people,attention,defaultAttention:attention.overdue.length?'overdue':attention.today.length?'today':attention.unassigned.length?'unassigned':'week'};
  }
  function boardFilter(key,owner=''){
    return {filter:key==='unassigned'?'open':['open','done','today','overdue','week','doing','blocked'].includes(key)?key:'all',owner:key==='unassigned'?'unassigned':owner};
  }
  return {FILTERS,summarize,boardFilter};
});
