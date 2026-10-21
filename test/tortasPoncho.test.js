const test=require('node:test');
const assert=require('node:assert/strict');
const login=require('../api/client-login');
const {CLIENTS}=require('../lib/clients');
const {createSessionCookie}=require('../lib/session');
const {isValidClientSession}=require('../lib/clientSession');
function response(){return {headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;},status(c){this.statusCode=c;return this;},json(v){this.body=v;return this;},redirect(c,p){this.statusCode=c;this.location=p;}};}
test('Tortas Poncho owner link opens its space and cannot authorize another client',()=>{
 const before=process.env.SESSION_SECRET;process.env.SESSION_SECRET='poncho-unit-test-only';
 try{
  const owner=response();
  login({method:'GET',query:{action:'link',slug:'tortas-poncho'},headers:{cookie:createSessionCookie(process.env.SESSION_SECRET)}},owner);
  assert.equal(owner.statusCode,200);
  const url=new URL(owner.body.path,'https://example.test');
  const client=response();
  login({method:'GET',query:Object.fromEntries(url.searchParams),headers:{}},client);
  assert.equal(client.statusCode,302);assert.equal(client.location,'/clientes/tortas-poncho/');
  assert.equal(isValidClientSession(client.headers['Set-Cookie'],'tortas-poncho',process.env.SESSION_SECRET),true);
  assert.equal(isValidClientSession(client.headers['Set-Cookie'],'bm-cubica',process.env.SESSION_SECRET),false);
  const bad=response();
  login({method:'GET',query:{slug:'tortas-poncho',token:url.searchParams.get('token')+'x'},headers:{}},bad);
  assert.equal(bad.location,'/clientes/tortas-poncho/login.html?error=enlace');
  const denied=response();
  login({method:'GET',query:{action:'link',slug:'tortas-poncho'},headers:{}},denied);
  assert.equal(denied.statusCode,401);
  const password=response();
  login({method:'POST',body:{slug:'tortas-poncho',password:CLIENTS['tortas-poncho'].password},headers:{}},password);
  assert.equal(password.statusCode,200);
 }finally{if(before===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=before;}
});

