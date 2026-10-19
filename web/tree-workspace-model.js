/* Tree workspace uses the existing document and independent-work counting. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core'),require('./work-plan-model'));else root.DalTreeModel=factory(root.DalCore,root.DalWorkPlanModel);})(typeof window!=='undefined'?window:globalThis,(C,P)=>{
  'use strict';
  const norm=s=>String(s||'').toLocaleLowerCase('tr-TR');
  function rows(doc,{query='',closed=new Set()}={}){
    const q=norm(query.trim()),all=C.ordered(doc),visible=new Set();
    if(q)for(const {node:n} of all)if(norm(n.title+' '+n.owner+' '+n.role).includes(q)){visible.add(n.id);C.ancestors(doc,n.id).forEach(id=>visible.add(id));}
    const hidden=new Set();
    return all.filter(({node:n})=>{if(q)return visible.has(n.id);if(hidden.has(n.parentId)){hidden.add(n.id);return false;}if(closed.has(n.id))hidden.add(n.id);return true;});
  }
  function update(doc,id,patch,members=[]){
    const n=doc.nodes.find(n=>n.id===id);if(!n)throw Error('İş bulunamadı.');
    const next={};
    for(const [key,value] of Object.entries(patch)){
      if(key==='title'){const title=String(value).trim();if(!title||title.length>250)throw Error('1–250 karakter arasında bir başlık yazın.');next.title=title;}
      else if(key==='role'){if(String(value).length>500)throw Error('Açıklama en fazla 500 karakter olabilir.');next.role=String(value);}
      else if(key==='ownerUserId'){const who=members.find(m=>m.id===value&&m.active!==false);if(value&&!who)throw Error('Sorumluyu bu projenin üyelerinden seçin.');next.ownerUserId=who?.id||'';next.owner=who?.name||'';}
      else if(key==='dueDate'){if(value&&!C.validDate(value))throw Error('Geçerli bir tarih seçin.');next.dueDate=value;}
      else if(key==='priority'){if(!C.PRIORITIES.includes(value))throw Error('Geçerli bir öncelik seçin.');next.priority=value;}
      else if(key==='status'){if(n.kind!=='Görev'||!C.STATUSES.includes(value))throw Error('Geçerli bir iş durumu seçin.');next.status=value;}
      else throw Error('Bu alan düzenlenemez.');
    }
    if(next.status)P.update(doc,{nodeId:id},{status:next.status});
    Object.assign(n,next);if(next.title&&n.parentId===null)doc.name=next.title;
  }
  function add(doc,parentId,{title,kind='Görev'}){
    title=String(title||'').trim();if(!title||title.length>250)throw Error('1–250 karakter arasında bir başlık yazın.');
    if(!['Görev','Başlık'].includes(kind))throw Error('İş veya başlık seçin.');
    return C.addNode(doc,parentId,{title,kind,status:'Planlandı'});
  }
  return {rows,update,add};
});
