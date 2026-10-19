const {test}=require('node:test'),assert=require('node:assert/strict'),M=require('../web/hub-model.js');
const day='2026-10-07';const t=(id,dueDate,done=false,extra={})=>({key:id,text:id,dueDate,done,ownerId:'u1',boardId:'b1',priority:'Normal',...extra});
const items=[t('late','2026-10-06'),t('today',day),t('tomorrow','2026-10-08'),t('six','2026-10-13'),t('seven','2026-10-14'),t('undated',''),t('done',day,true),t('other',day,false,{ownerId:'u2'})];
test('Istanbul day crosses UTC midnight correctly',()=>assert.equal(M.today(new Date('2026-10-06T21:30:00Z')),day));
test('Date addition crosses month and leap boundaries',()=>{assert.equal(M.plus('2024-02-28',1),'2024-02-29');assert.equal(M.plus('2026-12-31',1),'2027-01-01');});
test('Today excludes completed work',()=>assert.deepEqual(M.select(items,{filter:'today',day}).map(x=>x.key),['other','today']));
test('Overdue excludes undated and today',()=>assert.deepEqual(M.select(items,{filter:'overdue',day}).map(x=>x.key),['late']));
test('Rolling seven days excludes eighth date',()=>assert.deepEqual(M.select(items,{filter:'week',day}).map(x=>x.key),['other','today','tomorrow','six']));
test('Only undated open items selected',()=>assert.deepEqual(M.select(items,{filter:'undated',day}).map(x=>x.key),['undated']));
test('Mine filters on account ID, not display label',()=>assert.equal(M.select(items,{userId:'u1',day}).some(x=>x.key==='other'),false));
test('Project filter is exact',()=>assert.equal(M.select(items,{boardId:'missing'}).length,0));
test('Done filter includes only completed records',()=>assert.deepEqual(M.select(items,{filter:'done'}).map(x=>x.key),['done']));
test('Turkish dotted I search',()=>assert.equal(M.norm('İYİLİK'),'iyilik'));
test('Search checks assignee and project labels',()=>assert.equal(M.select([t('a','',false,{owner:'Şule',boardName:'Mihenk'})],{query:'şule'}).length,1));
test('High priority ordered before normal on the same date',()=>assert.equal(M.select([t('a',day),t('z',day,false,{priority:'Yüksek'})])[0].text,'z'));
test('No task means zero percent, not NaN',()=>assert.equal(M.percent(0,0),0));
test('Initials and safe key',()=>{assert.equal(M.initials('İpek Şen'),'İŞ');assert.equal(M.safeKey('<img>'),'');});

// V4 adds a real ongoing filter; completed tasks do not enter it.
test('Premium: doing filter selects ongoing and excludes completed',()=>{
  const M=require('../web/hub-model.js');
  assert.equal(M.matches({done:false,status:'Devam ediyor'},'doing'),true);
  assert.equal(M.matches({done:false,status:'Planlandı'},'doing'),false);
  assert.equal(M.matches({done:true,status:'Devam ediyor'},'doing'),false);
});

test('Project progress and owner totals cover open, completed and unassigned work without mixing projects',()=>{
 const items=[{boardId:'a',ownerId:'u',owner:'Elif',done:true,status:'Tamamlandı'},{boardId:'a',ownerId:'u',owner:'Elif',done:false,status:'Devam ediyor'},{boardId:'a',ownerId:'',owner:'Deniz',done:false,status:'Beklemede'},{boardId:'a',ownerId:'',owner:'',done:false,status:'Planlandı'},{boardId:'b',ownerId:'u',owner:'Elif',done:true,status:'Tamamlandı'}];
 const r=M.projectSummary(items,'a');assert.deepEqual([r.total,r.done,r.open,r.doing,r.unassigned,r.percent],[4,1,3,1,1,25]);assert.deepEqual(r.people.find(p=>p.id==='u'),{key:'uid:u',id:'u',name:'Elif',assigned:true,total:2,done:1,doing:1});assert.equal(r.people.reduce((sum,p)=>sum+p.total,0),r.total);assert.equal(r.people.reduce((sum,p)=>sum+p.done,0),r.done);
});
test('Project progress keeps same-named accounts separate and empty projects have no invented progress',()=>{
 const r=M.projectSummary([{boardId:'a',ownerId:'one',owner:'Can',done:true},{boardId:'a',ownerId:'two',owner:'Can',done:false}],'a');assert.equal(r.people.length,2);assert.equal(r.percent,50);const empty=M.projectSummary([],'a');assert.deepEqual([empty.total,empty.done,empty.percent,empty.people.length],[0,0,0,0]);
});

test('Workspace board starts with every accessible project, owner and completed state',()=>{
 const rows=[t('mine','',false,{status:'Planlandı'}),t('other','',false,{ownerId:'u2',boardId:'b2',status:'Devam ediyor'}),t('finished','',true,{boardId:'b2',status:'Tamamlandı'}),t('unassigned','',false,{ownerId:'',owner:'',status:'Beklemede'})];
 const before=JSON.stringify(rows),result=M.workspaceItems(rows);assert.equal(result.length,4);assert.ok(result.some(t=>t.done));assert.ok(result.some(t=>t.ownerId==='u2'));assert.equal(JSON.stringify(rows),before);
});
test('Workspace filters are explicit and combine exact project, owner, search and deadline',()=>{
 const rows=[t('Duyuru',day,false,{owner:'İpek',boardId:'a'}),t('Tamam',day,true,{owner:'İpek',boardId:'a'}),t('Diğer',day,false,{owner:'İpek',ownerId:'u2',boardId:'a'}),t('Başka',day,false,{owner:'İpek',boardId:'b'})];
 assert.deepEqual(M.workspaceItems(rows,{boardId:'a',owner:'uid:u1'}).map(x=>x.text),['Duyuru','Tamam']);
 assert.deepEqual(M.workspaceItems(rows,{boardId:'a',owner:'uid:u1',query:'İPEK',filter:'overdue',day:'2026-10-08'}).map(x=>x.text),['Duyuru']);
 assert.equal(M.workspaceItems(rows,{boardId:'missing'}).length,0);
});
test('Workspace unassigned filter does not hide named template owners or confuse same names',()=>{
 const rows=[t('a','',false,{ownerId:'',owner:''}),t('b','',false,{ownerId:'',owner:'Deniz'}),t('c','',false,{ownerId:'u1',owner:'Deniz'}),t('d','',false,{ownerId:'u2',owner:'Deniz'})];
 assert.deepEqual(M.workspaceItems(rows,{owner:'unassigned'}).map(x=>x.key),['a']);assert.deepEqual(M.workspaceItems(rows,{owner:'name:Deniz'}).map(x=>x.key),['b']);assert.deepEqual(M.workspaceItems(rows,{owner:'uid:u2'}).map(x=>x.key),['d']);
});
