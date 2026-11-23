'use strict';
// Mantém o processo Next.js ativo ENQUANTO o container estiver a correr.
// O arranque após recriação/paragem do container depende do provedor cloud.
const fs=require('node:fs');
const path=require('node:path');
const net=require('node:net');
const {spawn}=require('node:child_process');

const root=path.resolve(__dirname,'..');
const script=path.join(root,'node_modules','.bin','next');
const pidfile='/tmp/shayon-website-watchdog.pid';
const logfile='/tmp/shayon-website-service.log';
const host='127.0.0.1';
const port=3000;

function alreadyRunning(){
 try{
  const id=Number(fs.readFileSync(pidfile,'utf8').trim());
  if(Number.isInteger(id)&&id>1&&id!==process.pid){
   try{process.kill(id,0);return true;}catch{}
  }
 }catch{}
 return false;
}
if(alreadyRunning()){
 console.log('[Shayon site] watchdog já está ativo.');
 process.exit(0);
}
fs.writeFileSync(pidfile,String(process.pid),{mode:0o600});

let current=null;
let lastStart=0;
let stopped=false;
function isListening(){
 return new Promise(resolve=>{
  const s=net.connect({host,port});
  let settled=false;
  const done=(value)=>{
   if(settled)return;
   settled=true;
   s.destroy();
   resolve(value);
  };
  s.setTimeout(2500,()=>done(false));
  s.once('connect',()=>done(true));
  s.once('error',()=>done(false));
 });
}
async function ensureWebsite(){
 if(stopped||await isListening())return;
 if(current&&current.exitCode===null&&current.signalCode===null)return;
 if(Date.now()-lastStart<8000)return;
 lastStart=Date.now();
 const fd=fs.openSync(logfile,'a',0o600);
 try{
  current=spawn(script,['start','-H','0.0.0.0','-p',String(port)],{
   cwd:root,stdio:['ignore',fd,fd],env:process.env,
  });
  console.log('[Shayon site] processo Next.js iniciado:',current.pid);
  current.on('exit',(code,signal)=>{
   console.warn('[Shayon site] Next.js terminou:',code||signal||0);
   current=null;
  });
  current.on('error',error=>{
   console.warn('[Shayon site] falha de arranque:',error.code||error.name);
   current=null;
  });
 }finally{fs.closeSync(fd);}
}
function shutdown(){
 stopped=true;
 try{if(current&&current.exitCode===null)current.kill('SIGTERM')}catch{}
 try{if(fs.readFileSync(pidfile,'utf8').trim()===String(process.pid))fs.unlinkSync(pidfile)}catch{}
 process.exit(0);
}
process.on('SIGTERM',shutdown);
process.on('SIGINT',shutdown);
process.on('exit',()=>{try{
 if(fs.readFileSync(pidfile,'utf8').trim()===String(process.pid))fs.unlinkSync(pidfile);
}catch{}});
void ensureWebsite();
setInterval(()=>{void ensureWebsite().catch(e=>console.warn('[Shayon site] check:',e.name))},10000);
