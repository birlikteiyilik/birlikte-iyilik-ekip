const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../web/core'),P=require('../web/work-plan-model'),Brief=require('../web/presentation-model');
function fixture(){
 const doc=C.newDocument('blank'),root=C.rootNode(doc);
 const first=C.addNode(doc,root.id,{kind:'Görev',title:'Hazırlık',dueDate:'2026-10-13',tasks:[{id:'small',text:'Küçük adım',done:false},{id:'dated',text:'Ayrı teslim',dueDate:'2026-10-12',done:true},{id:'owned',text:'Sorumlu alt iş',assigneeId:'account',assignee:'Can',done:false}]});
 const second=C.addNode(doc,root.id,{kind:'Görev',title:'Kapanış',dueDate:'2026-10-13',status:'Tamamlandı'});
 const unit=C.addNode(doc,root.id,{title:'Ekip',kind:'Birim',tasks:[{id:'unit-step',text:'Ekip kontrolü',done:false}]});
 return {doc,root,first,second,unit};
}
const build=doc=>P.build(doc,{day:'2026-10-12'});
test('Dated plan shares actual work counts with graph and briefing, with stable date order',()=>{
 const {doc,root}=fixture(),before=JSON.stringify(doc),p=build(doc),branch=C.branchProgress(doc).get(root.id),brief=Brief.build(doc,{day:'2026-10-12'}).slides.find(s=>s.type==='progress');
 assert.deepEqual([p.total,p.done,p.percent],[5,2,40]);assert.deepEqual([branch.total,branch.done,branch.percent],[p.total,p.done,p.percent]);assert.equal(brief.percent,p.percent);
 assert.deepEqual(p.groups.map(g=>g.date),['2026-10-12','2026-10-13','']);assert.equal(p.groups[0].today,true);
 assert.deepEqual(p.groups[1].items.map(t=>t.title),['Hazırlık','Kapanış']);assert.equal(p.groups[1].items[0].steps.length,1);assert.equal(JSON.stringify(doc),before);
});
test('Checkbox and date edits change only their existing task or checklist step',()=>{
 const {doc,first,second,root}=fixture(),other=JSON.stringify(doc.nodes.find(n=>n.id===second));
 P.update(doc,{nodeId:first},{done:true});assert.equal(build(doc).done,3);assert.equal(C.branchProgress(doc).get(root.id).percent,60);
 P.update(doc,{nodeId:first,taskId:'small'},{done:true});assert.equal(build(doc).done,3);assert.equal(doc.nodes.find(n=>n.id===first).tasks[0].done,true);
 P.update(doc,{nodeId:first,taskId:'owned'},{dueDate:'2027-01-02',done:true});assert.equal(build(doc).done,4);assert.equal(build(doc).groups.at(-2).date,'2027-01-02');
 P.update(doc,{nodeId:first},{done:false,dueDate:'2026-10-10'});assert.equal(build(doc).done,3);assert.equal(doc.nodes.find(n=>n.id===first).progress,0);assert.equal(build(doc).groups[0].late,true);assert.equal(JSON.stringify(doc.nodes.find(n=>n.id===second)),other);
 assert.doesNotThrow(()=>C.validateStrict(doc));
});
test('Bad dates, deleted work and non-task cards cannot partially change a plan',()=>{
 const {doc,first,root}=fixture(),original=JSON.stringify(doc);
 assert.throws(()=>P.update(doc,{nodeId:first},{dueDate:'2026-02-30'}));
 assert.throws(()=>P.update(doc,{nodeId:first},{dueDate:'2026-11-02',done:'true'}));
 assert.throws(()=>P.update(doc,{nodeId:root.id},{done:true}));assert.throws(()=>P.update(doc,{nodeId:first,taskId:'deleted'},{done:true}));
 assert.equal(JSON.stringify(doc),original);
});
test('Completed filtering and bounded lists preserve project totals and undated work',()=>{
 const {doc,root}=fixture();for(let i=0;i<120;i++)C.addNode(doc,root.id,{kind:'Görev',title:'İş '+i,dueDate:'2026-10-14'});
 const p=P.build(doc,{hideDone:true,limit:100,day:'2026-10-12'});assert.equal(p.total,125);assert.equal(p.done,2);assert.equal(p.shown,100);assert.equal(p.remaining,23);
 const all=P.build(doc,{hideDone:true,limit:Infinity,day:'2026-10-12'});assert.equal(all.remaining,0);assert.equal(all.groups.at(-1).date,'');assert.ok(all.groups.flatMap(g=>g.items).every(t=>!t.done));
 const empty=build(C.newDocument('blank'));assert.deepEqual([empty.total,empty.done,empty.percent,empty.groups.length],[0,0,0,0]);
});
test('Work keys stay distinct when node and step identifiers contain punctuation',()=>{
 assert.notEqual(P.key('a:b','c'),P.key('a','b:c'));assert.notEqual(P.key('a',''),P.key('a','null'));
});
test('Readable and printed plans escape text, exclude private fields and retain native controls',()=>{
 const {doc,first}=fixture();doc.name='<script>name</script>';const n=doc.nodes.find(n=>n.id===first);n.title='<img src=x onerror=bad>';n.notes='PRIVATE-NOTE';n.email='PRIVATE-EMAIL';n.phone='PRIVATE-PHONE';n.links=[{id:'link',label:'PRIVATE-LINK',url:'https://example.com/'}];
 const window={DalCore:C,DalHubModel:{today:()=> '2026-10-12'},DalWorkPlanModel:P,DalIcons:{render:()=>'<svg aria-hidden="true"></svg>'}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../web/work-plan.js'),'utf8'),{window,Intl,Date});
 const html=window.DalWorkPlanView.render(doc,{editable:false});assert.match(html,/type="checkbox"[^>]*disabled/);assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img src=x'));
 for(const secret of ['PRIVATE-NOTE','PRIVATE-EMAIL','PRIVATE-PHONE','PRIVATE-LINK'])assert.ok(!html.includes(secret));
 const printed=window.DalWorkPlanView.render(doc,{print:true,hideDone:true});assert.ok(printed.includes('Kapanış'));assert.ok(!printed.includes('<input'));assert.ok(!printed.includes('<button'));assert.ok(!printed.includes('PRIVATE-NOTE'));
});
