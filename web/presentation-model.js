/* Deterministic project briefing. No network, AI service, or source mutations. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./core'),require('./hub-model'));
  else root.DalPresentationModel=factory(root.DalCore,root.DalHubModel);
})(typeof globalThis!=='undefined'?globalThis:this,(C,M)=>{
  'use strict';
  function brief(value,max){const text=String(value||'').replace(/\s+/g,' ').trim();if(text.length<=max)return text;const cut=text.slice(0,max-1),space=cut.lastIndexOf(' ');return cut.slice(0,space>max*.6?space:cut.length)+'…';}
  function workItems(doc){
    const items=[];
    for(const n of doc.nodes){
      const base={boardId:doc.id,owner:n.owner,ownerId:n.ownerUserId,status:n.status,priority:n.priority,dueDate:n.dueDate};
      if(n.kind==='Görev')items.push({...base,key:n.id,text:n.title,done:n.status==='Tamamlandı'});
      for(const t of n.tasks)if(n.kind!=='Görev'||t.assigneeId||t.dueDate)items.push({...base,key:n.id+':'+t.id,text:t.text,owner:t.assignee,ownerId:t.assigneeId,status:t.done?'Tamamlandı':'Planlandı',done:t.done,dueDate:t.dueDate});
    }
    return items;
  }
  function build(raw,{showPeople=true,day=M.today()}={}){
    const doc=C.validateStrict(raw),root=C.rootNode(doc),items=workItems(doc),summary=M.projectSummary(items,doc.id),slides=[];
    const late=items.filter(t=>!t.done&&t.dueDate&&t.dueDate<day),waiting=items.filter(t=>!t.done&&t.status==='Beklemede'),unassigned=items.filter(t=>!t.done&&!t.ownerId&&!t.owner).length;
    const assigned=summary.people.filter(p=>p.assigned),units=C.children(doc,root.id).filter(n=>n.kind!=='Görev'&&(showPeople||n.kind!=='Kişi'));
    const date=new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'numeric',month:'long',year:'numeric'}).format(new Date(day+'T12:00:00Z'));
    slides.push({type:'cover',title:brief(doc.name,96),date,sample:doc.sample});
    const direct=C.children(doc,root.id).filter(n=>showPeople||n.kind!=='Kişi'),areas=(units.length?units:direct).slice(0,4),progress=C.branchProgress(doc);
    const shown=[root,...areas],indices=new Map(shown.map((n,i)=>[n.id,i]));
    const diagram={layout:doc.settings.layout,nodes:shown.map(n=>({title:brief(n.title,52),kind:n.kind,...progress.get(n.id)})),relations:doc.relations.filter(r=>indices.has(r.from)&&indices.has(r.to)).slice(0,6).map(r=>({from:indices.get(r.from),to:indices.get(r.to),label:brief(r.label,24)})),extra:Math.max(0,direct.length-areas.length)};
    diagram.extraRelations=doc.relations.length-diagram.relations.length;
    slides.push({type:'structure',title:areas.length?'Çalışma yapısı':'Çalışmanın amacı',body:brief(root.goals||root.description||root.role||'Amaç henüz yazılmadı.',220),rows:areas.map(n=>({title:brief(n.title,52),detail:brief(n.role,85)})),extra:diagram.extra,diagram});
    if(summary.total){
      slides.push({type:'progress',title:'İlerleme',percent:summary.percent,done:summary.done,total:summary.total,open:summary.open,doing:summary.doing});
      if(showPeople&&assigned.length)slides.push({type:'people',title:'İş paylaşımı',rows:assigned.slice(0,5).map(p=>({name:brief(p.name,42),done:p.done,total:p.total,open:p.total-p.done})),extra:Math.max(0,assigned.length-5)});
      const next=M.select(items,{boardId:doc.id,day}).slice(0,3);
      slides.push(next.length?{type:'next',title:'Sıradaki işler',rows:next.map(t=>({title:brief(t.text,78),owner:showPeople?brief(t.owner||'Atanmadı',36):'',date:t.dueDate,status:t.status})),extra:summary.open-next.length}:{type:'complete',title:'Bütün işler tamamlandı',done:summary.done});
      if(late.length||waiting.length||unassigned)slides.push({type:'attention',title:'Dikkat gerektiren işler',late:late.length,waiting:waiting.length,unassigned});
    }else slides.push({type:'start',title:'İlk adımlar',body:'Bu çalışmada henüz iş yok.',rows:['İlk görevi ekleyin','Sorumlusunu ve son tarihini belirleyin']});
    return {name:brief(doc.name,96),date,slides};
  }
  return {build,brief,workItems};
});
