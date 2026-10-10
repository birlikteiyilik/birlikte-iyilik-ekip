'use strict';
const {Pool}=require('@neondatabase/serverless');
const {randomUUID}=require('node:crypto');
let database;
const TABLE='ekip_documents';
const clone=value=>JSON.parse(JSON.stringify(value));
function pathCheck(path){if(typeof path!=='string'||path.length>1000||path.startsWith('/')||path.endsWith('/')||path.includes('//'))throw new Error('Invalid document path.');return path;}
class Snapshot {
  constructor(ref,data){this.ref=ref;this.id=ref.id;this.exists=data!==undefined;this.value=data;}
  data(){return this.exists?clone(this.value):undefined;}
}
module.exports.createDocumentStore=function createDocumentStore(pool){
  let ready;
  async function ensure(){
    if(!ready)ready=(async()=>{await pool.query(`CREATE TABLE IF NOT EXISTS ${TABLE} (path text PRIMARY KEY,parent_path text NOT NULL,document_id text NOT NULL,data jsonb NOT NULL)`);await pool.query(`CREATE INDEX IF NOT EXISTS ekip_parent_idx ON ${TABLE}(parent_path)`);})()
      .catch(e=>{ready=undefined;throw e;});
    await ready;
  }
  class Query {
    constructor(path,group=false,filters=[],order=[],limitValue=null,fields=null){this.path=path;this.group=group;this.filters=filters;this.order=order;this.limitValue=limitValue;this.fields=fields;}
    where(field,operator,value){if(!['==','<','<=','>','>=','array-contains'].includes(operator))throw new Error('Unsupported operator.');return new Query(this.path,this.group,[...this.filters,{field,operator,value}],this.order,this.limitValue,this.fields);}
    orderBy(field,direction='asc'){if(!['asc','desc'].includes(direction))throw Error('Invalid order.');return new Query(this.path,this.group,this.filters,[...this.order,{field,direction}],this.limitValue,this.fields);}
    limit(n){if(!Number.isSafeInteger(n)||n<1||n>10001)throw Error('Invalid limit.');return new Query(this.path,this.group,this.filters,this.order,n,this.fields);}
    select(...fields){return new Query(this.path,this.group,this.filters,this.order,this.limitValue,fields);}
    doc(id=randomUUID()){if(this.group||typeof id!=='string'||!id||id.includes('/'))throw Error('Invalid document id.');return new Ref(this.path+'/'+id);}
    async get(){await ensure();return query(this,pool);}
  }
  class Ref {
    constructor(path){this.path=pathCheck(path);const parts=path.split('/');if(parts.length%2)throw Error('Document path required.');this.id=parts.at(-1);this.parentPath=parts.slice(0,-1).join('/');}
    collection(name){if(typeof name!=='string'||name.includes('/'))throw Error('Invalid collection.');return new Query(this.path+'/'+name);}
    async get(){await ensure();return read(this,pool);}
    async set(data,options){await ensure();await write({kind:'set',ref:this,data,merge:options?.merge},pool);}
    async create(data){await ensure();await write({kind:'create',ref:this,data},pool);}
    async update(data){await ensure();await write({kind:'update',ref:this,data},pool);}
    async delete(){await ensure();await write({kind:'delete',ref:this},pool);}
  }
  async function read(ref,client){const result=await client.query(`SELECT data FROM ${TABLE} WHERE path=$1`,[ref.path]);return new Snapshot(ref,result.rows[0]?.data);}
  async function query(q,client){
    const params=[],parameter=v=>{params.push(v);return '$'+params.length;},field=name=>`d.data #> ${parameter(name.split('.'))}::text[]`;
    const clauses=[q.group?`right(d.parent_path,length(${parameter('/'+q.path)}))=${parameter('/'+q.path)}`:`d.parent_path=${parameter(q.path)}`];
    for(const {field:name,operator,value} of q.filters){const expr=field(name),sqlOp=operator==='=='?'=':operator==='array-contains'?'@>':operator;clauses.push(`${expr} ${sqlOp} ${parameter(JSON.stringify(operator==='array-contains'?[value]:value))}::jsonb`);}
    const order=q.order.map(o=>`${field(o.field)} ${o.direction.toUpperCase()} NULLS LAST`);
    let data='d.data';
    if(q.fields)data=q.fields.length?'jsonb_build_object('+q.fields.flatMap(f=>[parameter(f)+'::text',field(f)]).join(',')+')':"'{}'::jsonb";
    const result=await client.query(`SELECT d.path,${data} AS data FROM ${TABLE} d WHERE ${clauses.join(' AND ')}${order.length?' ORDER BY '+order.join(','):''}${q.limitValue?' LIMIT '+parameter(q.limitValue):''}`,params);
    const docs=result.rows.map(r=>new Snapshot(new Ref(r.path),r.data));return {docs,size:docs.length,empty:!docs.length};
  }
  async function write(change,client){
    const {ref,kind}=change;
    if(kind==='delete'){await client.query(`DELETE FROM ${TABLE} WHERE path=$1`,[ref.path]);return;}
    const data=JSON.stringify(change.data);
    if(kind==='update'){
      const result=await client.query(`UPDATE ${TABLE} SET data=data||$2::jsonb WHERE path=$1`,[ref.path,data]);
      if(!result.rowCount)throw Object.assign(Error('Kayıt bulunamadı.'),{status:404});return;
    }
    await client.query(`INSERT INTO ${TABLE}(path,parent_path,document_id,data) VALUES($1,$2,$3,$4::jsonb)${kind==='create'?'':` ON CONFLICT(path) DO UPDATE SET data=${change.merge?TABLE+'.data||EXCLUDED.data':'EXCLUDED.data'}`}`,[ref.path,ref.parentPath,ref.id,data]);
  }
  function transaction(client){
    const changes=[];
    return {changes,async get(target){if(changes.length)throw Error('All transaction reads must precede writes.');return target instanceof Ref?read(target,client):query(target,client);},
      set(ref,data,options){changes.push({kind:'set',ref,data,merge:options?.merge});},create(ref,data){changes.push({kind:'create',ref,data});},update(ref,data){changes.push({kind:'update',ref,data});},delete(ref){changes.push({kind:'delete',ref});}};
  }
  async function runTransaction(fn,options={}){
    await ensure();
    for(let attempt=0;attempt<5;attempt++){
      const client=await pool.connect();
      try {
        await client.query(options.readOnly?'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY':'BEGIN ISOLATION LEVEL SERIALIZABLE');
        const tx=transaction(client),result=await fn(tx);
        for(const change of tx.changes)await write(change,client);
        await client.query('COMMIT');return result;
      }catch(e){await client.query('ROLLBACK').catch(()=>{});if(['40001','40P01'].includes(e.code)&&attempt<4){await new Promise(r=>setTimeout(r,20*(attempt+1)));continue;}throw e;}
      finally{client.release();}
    }
  }
  return {doc:path=>new Ref(path),collection:path=>new Query(pathCheck(path)),collectionGroup:name=>new Query(name,true),getAll:(...refs)=>Promise.all(refs.map(r=>r.get())),runTransaction,
    batch(){const ops=[],batch={set(ref,data,options){ops.push({kind:'set',ref,data,merge:options?.merge});return batch;},create(ref,data){ops.push({kind:'create',ref,data});return batch;},update(ref,data){ops.push({kind:'update',ref,data});return batch;},delete(ref){ops.push({kind:'delete',ref});return batch;},async commit(){return runTransaction(async tx=>tx.changes.push(...ops));}};return batch;},
    async recursiveDelete(ref){await ensure();await pool.query(`DELETE FROM ${TABLE} WHERE path=$1 OR left(path,length($2))=$2`,[ref.path,ref.path+'/']);},async terminate(){await pool.end?.();}};
};
module.exports.getDatabase=function getDatabase(){
  if(database)return database;
  if(!process.env.DATABASE_URL)throw Object.assign(new Error('Vercel database connection is missing.'),{status:503});
  database=module.exports.createDocumentStore(new Pool({connectionString:process.env.DATABASE_URL,max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000}));
  return database;
};
