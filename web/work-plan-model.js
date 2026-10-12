/* A dated work list over the existing shared document. No separate records. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./core'),require('./hub-model'));
  else root.DalWorkPlanModel=factory(root.DalCore,root.DalHubModel);
})(typeof globalThis!=='undefined'?globalThis:this,(C,M)=>{
  'use strict';
  const key=(nodeId,taskId='')=>JSON.stringify([nodeId,taskId]);
  function items(doc){
    const result=[];
    for(const n of doc.nodes){
      if(n.kind==='Görev')result.push({key:key(n.id),nodeId:n.id,taskId:'',title:n.title,owner:n.owner,dueDate:n.dueDate,status:n.status,done:n.status==='Tamamlandı',steps:n.tasks.filter(t=>!t.assigneeId&&!t.dueDate).map(t=>({key:key(n.id,t.id),nodeId:n.id,taskId:t.id,title:t.text,done:t.done}))});
      for(const t of n.tasks)if(n.kind!=='Görev'||t.assigneeId||t.dueDate)result.push({key:key(n.id,t.id),nodeId:n.id,taskId:t.id,title:t.text,owner:t.assignee,dueDate:t.dueDate,status:t.done?'Tamamlandı':'Planlandı',done:t.done,parentTitle:n.title,steps:[]});
    }
    return result;
  }
  function build(doc,{hideDone=false,day=M.today(),limit=100}={}){
    const all=items(doc),done=all.filter(t=>t.done).length;
    const visible=all.filter(t=>!hideDone||!t.done).map((t,i)=>({...t,order:i})).sort((a,b)=>(a.dueDate||'9999-99-99').localeCompare(b.dueDate||'9999-99-99')||a.order-b.order);
    const shown=visible.slice(0,Math.max(1,Math.floor(limit))),groups=[],lateDates=new Set(visible.filter(t=>t.dueDate&&t.dueDate<day&&!t.done).map(t=>t.dueDate));
    for(const t of shown){let g=groups.at(-1);if(!g||g.date!==t.dueDate){g={date:t.dueDate,today:t.dueDate===day,late:lateDates.has(t.dueDate),items:[]};groups.push(g);}g.items.push(t);}
    return {total:all.length,done,open:all.length-done,percent:M.percent(done,all.length),groups,shown:shown.length,visible:visible.length,remaining:visible.length-shown.length};
  }
  function update(doc,{nodeId,taskId=''},patch){
    const n=doc.nodes.find(n=>n.id===nodeId);if(!n)throw new Error('Bu iş artık bulunmuyor.');
    const target=taskId?n.tasks.find(t=>t.id===taskId):n;
    if(!target||(!taskId&&n.kind!=='Görev'))throw new Error('Bu iş artık bulunmuyor.');
    if(Object.hasOwn(patch,'done')&&typeof patch.done!=='boolean')throw new Error('Geçersiz iş durumu.');
    if(Object.hasOwn(patch,'dueDate')){if(patch.dueDate!==''&&!C.validDate(patch.dueDate))throw new Error('Geçerli bir tarih seçin.');target.dueDate=patch.dueDate;}
    if(Object.hasOwn(patch,'done')){
      if(taskId)target.done=patch.done;
      else{target.status=patch.done?'Tamamlandı':'Planlandı';if(patch.done)target.progress=100;else if(target.progress===100)target.progress=0;}
    }
  }
  return {key,items,build,update};
});
