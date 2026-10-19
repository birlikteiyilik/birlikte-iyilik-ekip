/* Alternative views of the shared work list. No new records or subscriptions. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./work-plan-model'),require('./hub-model'));
  else root.DalOperationsModel=factory(root.DalWorkPlanModel,root.DalHubModel);
})(typeof globalThis!=='undefined'?globalThis:this,(P,H)=>{
  'use strict';
  function select(doc,{owner='',query='',filter='all',day=H.today(),hideDone=false}={}){
    const text=H.norm(query.trim());
    return P.items(doc).filter(t=>(!owner||t.ownerId===owner)&&(!hideDone||!t.done)&&
      H.matches(t,filter,day)&&H.norm([t.title,t.owner,t.parentTitle].join(' ')).includes(text))
      .sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999')||a.title.localeCompare(b.title,'tr'));
  }
  function summary(doc,day=H.today()){
    const items=P.items(doc),done=items.filter(t=>t.done).length;
    return {total:items.length,done,open:items.length-done,percent:H.percent(done,items.length),
      late:items.filter(t=>!t.done&&t.dueDate&&t.dueDate<day).length,
      doing:items.filter(t=>t.status==='Devam ediyor').length,
      waiting:items.filter(t=>t.status==='Beklemede').length};
  }
  function monthStart(date){return date.slice(0,7)+'-01';}
  function moveMonth(date,offset){
    const d=new Date(monthStart(date)+'T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+offset);return d.toISOString().slice(0,10);
  }
  function monday(date){const d=new Date(date+'T12:00:00Z');return H.plus(date,-((d.getUTCDay()+6)%7));}
  function calendar(items,date,day=H.today()){
    const start=monday(monthStart(date)),month=date.slice(0,7),byDate=new Map();
    for(const t of items){if(!byDate.has(t.dueDate))byDate.set(t.dueDate,[]);byDate.get(t.dueDate).push(t);}
    return Array.from({length:42},(_,i)=>{const value=H.plus(start,i);return {date:value,inMonth:value.startsWith(month),today:value===day,items:byDate.get(value)||[]};});
  }
  function timeline(items,date,day=H.today()){
    const start=monday(date),days=Array.from({length:14},(_,i)=>H.plus(start,i)),end=days.at(-1);
    return {start,end,days,rows:items.filter(t=>t.dueDate).map(t=>({...t,index:days.indexOf(t.dueDate),
      before:t.dueDate<start,after:t.dueDate>end,late:!t.done&&t.dueDate<day})),undated:items.filter(t=>!t.dueDate)};
  }
  return {select,summary,monthStart,moveMonth,monday,calendar,timeline};
});
