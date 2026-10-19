const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../web/dashboard-model.js'),H=require('../web/hub-model.js'),V=require('../web/dashboard.js');
const day='2026-10-19';
const row=(key,extra={})=>({key,text:key,boardId:'a',boardName:'Mihenk',status:'Planlandı',done:false,ownerId:'u1',owner:'Deniz',dueDate:'',editable:true,...extra});
const data={boards:[{id:'a',name:'Mihenk'},{id:'b',name:'Atölye'},{id:'archived',name:'Arşiv',archived:true}],items:[
 row('late',{dueDate:'2026-10-18'}),row('today',{dueDate:day,status:'Devam ediyor'}),row('six',{dueDate:'2026-10-25',ownerId:'u2',owner:'Deniz'}),
 row('seven',{dueDate:'2026-10-26',ownerId:'',owner:'Deniz'}),row('unassigned',{ownerId:'',owner:'',status:'Beklemede'}),
 row('finished',{done:true,status:'Tamamlandı',dueDate:'2026-10-01'}),row('unassigned-done',{done:true,status:'Tamamlandı',ownerId:'',owner:''}),
 row('b-work',{boardId:'b',status:'Devam ediyor'}),row('archived-work',{boardId:'archived'}),row('not-accessible',{boardId:'missing'})
]};
test('Overview counts only authorized active projects without changing the snapshot',()=>{
 const before=JSON.stringify(data),r=M.summarize(data,{day});
 assert.deepEqual([r.total,r.done,r.open,r.percent,r.projects.length],[8,2,6,25,2]);
 assert.equal(JSON.stringify(data),before);assert.equal(r.projects.reduce((s,p)=>s+p.total,0),r.total);assert.equal(r.states.reduce((s,p)=>s+p.count,0),r.total);
 assert.equal(r.projects[0].name,'Mihenk');assert.equal(r.projects[0].late,1);
});
test('Attention excludes completed work and uses a seven-day window starting today',()=>{
 const r=M.summarize(data,{day});
 assert.deepEqual(r.attention.overdue.map(t=>t.key),['late']);assert.deepEqual(r.attention.today.map(t=>t.key),['today']);
 assert.deepEqual(r.attention.week.map(t=>t.key),['today','six']);assert.deepEqual(r.attention.unassigned.map(t=>t.key),['unassigned']);assert.equal(r.defaultAttention,'overdue');
});
test('Owner totals keep same-named members and named template owners separate',()=>{
 const r=M.summarize(data,{day});assert.equal(r.people.length,3);
 assert.equal(r.people.find(p=>p.key==='uid:u1').open,3);assert.equal(r.people.find(p=>p.key==='uid:u2').open,1);assert.equal(r.people.find(p=>p.key==='name:Deniz').open,1);
 assert.equal(r.people.reduce((s,p)=>s+p.open,0)+r.attention.unassigned.length,r.open);
});
test('Every dashboard shortcut returns exactly the items represented by its count',()=>{
 const r=M.summarize(data,{day});
 for(const filter of M.FILTERS){const f=M.boardFilter(filter);const actual=H.workspaceItems(r.items,{...f,day}).map(t=>t.key).sort();assert.deepEqual(actual,r.attention[filter].map(t=>t.key).sort(),filter);}
 assert.equal(H.workspaceItems(r.items,{...M.boardFilter('open'),day}).length,r.open);
 assert.equal(H.workspaceItems(r.items,{...M.boardFilter('done'),day}).length,r.done);
 for(const p of r.people)assert.equal(H.workspaceItems(r.items,{...M.boardFilter('open',p.key),day}).length,p.open);
 assert.deepEqual(H.workspaceItems(r.items,{...M.boardFilter('blocked'),day}).map(t=>t.key),['unassigned']);
});
test('Empty overview reports no invented progress and has deterministic attention fallback',()=>{
 const r=M.summarize({},{day});assert.deepEqual([r.total,r.done,r.open,r.percent,r.people.length],[0,0,0,0,0]);assert.equal(r.defaultAttention,'week');
 const noDates=M.summarize({boards:[{id:'a',name:'A'}],items:[row('x',{ownerId:'',owner:''})]},{day});assert.equal(noDates.defaultAttention,'unassigned');
});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const h={esc,icon:()=>'<svg></svg>',avatar:name=>esc(name),due:t=>esc(t.dueDate)};
test('Read-only and empty states expose only actions appropriate to their permissions',()=>{
 const r=M.summarize({},{day}),viewer=V.render(r,{},h),admin=V.render(r,{canCreate:true},h);
 assert.doesNotMatch(viewer,/data-hub="new-(task|project)"/);assert.match(admin,/data-hub="new-project"/);
 assert.doesNotMatch(viewer,/NaN|Infinity/);assert.match(viewer,/İşleriniz burada görünecek/);
 const readonly=M.summarize({boards:[{id:'a',name:'A'}],items:[row('late',{dueDate:'2026-10-18',editable:false})]},{day});
 assert.match(V.render(readonly,{},h),/data-hub="toggle"[^>]*disabled/);
});
test('Dashboard safely renders user titles and caps preview rows while preserving total counts',()=>{
 const r=M.summarize({boards:[{id:'a',name:'<img onerror=alert(1)>'}],items:Array.from({length:9},(_,i)=>row(String(i),{text:'<script>test</script>',dueDate:'2026-10-18'}))},{day});
 const html=V.render(r,{canWrite:true},h);assert.doesNotMatch(html,/<script>|<img onerror/);assert.match(html,/&lt;script&gt;/);assert.match(html,/İlk 4 \/ 9 iş/);assert.equal((html.match(/class="dash-work"/g)||[]).length,4);
 assert.match(html,/data-hub="new-task"/);assert.match(html,/role="checkbox"/);
});

test('daily work appears in totals and attention without inflating project counts',()=>{
 const r=M.summarize({boards:[{id:'daily',name:'Günlük işler',purpose:'daily'}],items:[row('daily-job',{boardId:'daily',dueDate:day})]},{day});
 assert.equal(r.projects.length,0);assert.equal(r.open,1);assert.equal(r.attention.today.length,1);assert.equal(r.people[0].open,1);
});
