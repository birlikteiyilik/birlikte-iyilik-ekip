'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const cli=createRequire(require.resolve('firebase-tools/package.json'));
test('patched uuid remains compatible with legacy CommonJS Google HTTP clients',()=>{
 const gaxios=createRequire(cli.resolve('gaxios'));
 const uuid=gaxios('uuid');
 assert.equal(uuid.version(uuid.v4()),4);
 assert.throws(()=>uuid.v5('test',uuid.v5.DNS,new Uint8Array(8),4),RangeError);
 assert.ok(new (gaxios('gaxios').Gaxios)());
});
test('Pub/Sub tracing keeps its public propagation API with patched OpenTelemetry core',()=>{
 const pubsub=createRequire(cli.resolve('@google-cloud/pubsub'));
 const core=pubsub('@opentelemetry/core'),api=pubsub('@opentelemetry/api');
 const context=api.trace.setSpanContext(api.ROOT_CONTEXT,{traceId:'12345678901234567890123456789012',spanId:'1234567890123456',traceFlags:1});
 const carrier={},propagator=new core.W3CTraceContextPropagator();
 propagator.inject(context,carrier,api.defaultTextMapSetter);
 assert.equal(api.trace.getSpanContext(propagator.extract(api.ROOT_CONTEXT,carrier,api.defaultTextMapGetter)).spanId,'1234567890123456');
 const huge={baggage:'a='+ 'x'.repeat(9000)};
 const extracted=new core.W3CBaggagePropagator().extract(api.ROOT_CONTEXT,huge,api.defaultTextMapGetter);
 assert.equal(api.propagation.getBaggage(extracted)?.getAllEntries().length||0,0);
 assert.ok(new (cli('@google-cloud/pubsub').PubSub)({projectId:'offline-compat',enableOpenTelemetryTracing:true}));
});
