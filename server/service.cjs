'use strict';
const {getServices}=require('./admin.cjs');
const createWorkspace=require('./workspace.cjs');
const createStorage=require('./storage.cjs');
let service;
function getWorkspace() {
  if(service)return service;
  const {db}=getServices();
  const storage=createStorage({db,authorize(u,b,min,allowArchive){
    if(!u?.active)service.fail(403,'Ekip erişiminiz kapatılmış.');
    service.check(u,b,min,allowArchive);
  }});
  service=createWorkspace({db,storage});
  service.storage=storage;
  return service;
}
module.exports={getWorkspace};
