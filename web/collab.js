/* Identity-based collaboration protocol; no third-party dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DalCollab = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clone = x => JSON.parse(JSON.stringify(x));
  const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  const has = (x, k) => Object.prototype.hasOwnProperty.call(x, k);
  const blocked = new Set(['__proto__', 'constructor', 'prototype']);
  function equal(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b || a === null || b === null) return false;
    if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x,i) => equal(x,b[i]));
    if (object(a) && object(b)) return Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(k => has(b,k) && equal(a[k],b[k]));
    return false;
  }
  function mapById(list) {
    const out = Object.create(null);
    for (const row of list) {
      if (!row.id || blocked.has(row.id) || has(out, row.id)) throw new Error('Geçersiz/tekrarlanan kayıt kimliği.');
      out[row.id] = Object.fromEntries(Object.entries(row).filter(([k]) => k !== 'id'));
    }
    return out;
  }
  function project(doc) {
    const nodes = Object.create(null);
    for (const n of doc.nodes) {
      if (blocked.has(n.id) || has(nodes,n.id)) throw new Error('Geçersiz kart kimliği.');
      const out = clone(n);
      for (const key of ['id', 'collapsed', 'offsetX', 'offsetY']) delete out[key];
      out.ownerUserId ||= '';
      out.tasks = mapById(n.tasks.map(t=>({...t,assigneeId:t.assigneeId||''})));
      out.links = mapById(n.links);
      nodes[n.id] = out;
    }
    return {name: doc.name, sample: doc.sample, nodes, relations: mapById(doc.relations)};
  }
  function diff(a, b) {
    const out = [];
    function walk(left, right, path) {
      if (equal(left, right)) return;
      if (object(left) && object(right)) {
        for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
          if (blocked.has(key)) throw new Error('Geçersiz alan adı.');
          const p = [...path, key];
          if (!has(left,key)) out.push({path:p,before:{exists:false},after:{exists:true,value:clone(right[key])}});
          else if (!has(right,key)) out.push({path:p,before:{exists:true,value:clone(left[key])},after:{exists:false}});
          else walk(left[key], right[key], p);
        }
      } else out.push({path, before:{exists:true,value:clone(left)}, after:{exists:true,value:clone(right)}});
    }
    walk(project(a), project(b), []);
    return out;
  }
  function slot(tree, path) {
    let p=tree;
    for (const key of path.slice(0,-1)) {
      if (!object(p) || !has(p,key)) return {exists:false};
      p=p[key];
    }
    const key=path[path.length-1];
    return object(p) && has(p,key) ? {exists:true,value:clone(p[key])} : {exists:false};
  }
  function inflate(tree, original) {
    const out=clone(original);
    out.name=tree.name; out.sample=tree.sample;
    out.nodes=Object.entries(tree.nodes).map(([id,n])=>({...clone(n),id,
      tasks:Object.entries(n.tasks).map(([id,t])=>({...clone(t),id})),
      links:Object.entries(n.links).map(([id,l])=>({...clone(l),id})), collapsed:false,offsetX:0,offsetY:0}));
    out.relations=Object.entries(tree.relations).map(([id,r])=>({...clone(r),id}));
    return out;
  }
  function apply(doc, changes, force=false) {
    const tree=project(doc), conflicts=[];
    for (const c of changes) {
      if (!Array.isArray(c.path) || c.path.some(k=>blocked.has(k))) throw new Error('Geçersiz alan yolu.');
      const current=slot(tree,c.path);
      if (!force && !equal(current,c.before)) conflicts.push({path:c.path,current,requested:c.after});
    }
    if (conflicts.length) return {doc:null, conflicts};
    for (const c of changes) {
      let p=tree;
      for (const key of c.path.slice(0,-1)) {
        if (!object(p) || !has(p,key)) return {doc:null,conflicts:[{path:c.path,reason:'Üst kayıt artık mevcut değil.'}]};
        p=p[key];
      }
      const key=c.path[c.path.length-1];
      if (!object(p)) return {doc:null,conflicts:[{path:c.path,reason:'Üst kayıt artık mevcut değil.'}]};
      if (c.after.exists) p[key]=clone(c.after.value); else delete p[key];
    }
    return {doc:inflate(tree,doc), conflicts:[]};
  }
  function inverse(changes) { return changes.map(c=>({path:clone(c.path),before:clone(c.after),after:clone(c.before)})); }
  return {project,diff,apply,inverse,slot,equal,clone};
});
