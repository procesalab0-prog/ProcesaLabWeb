/* Existing per-client signed-link flow; owners can preview their client space. */
(async()=>{
 document.documentElement.style.visibility='hidden';
 try{
  let response=await fetch('/api/client-check?slug=tortas-poncho',{cache:'no-store'});
  let allowed=response.ok&&(await response.json()).authenticated;
  if(!allowed){response=await fetch('/api/check',{cache:'no-store'});allowed=response.ok&&(await response.json()).authenticated;}
  if(!allowed){location.replace('/clientes/tortas-poncho/login.html');return;}
  document.documentElement.style.visibility='visible';
 }catch{location.replace('/clientes/tortas-poncho/login.html');}
})();
