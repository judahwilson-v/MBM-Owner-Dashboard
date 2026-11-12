// Imported only by server login/route code. Never expose this map to a client.
export type OwnerBinding={username:string;email:string;authUserId:string};
const USERNAMES=['JUDAH','VIJAI','AJAI'];
export function ownerBindings(raw=process.env.MBM_OWNER_LOGIN_BINDINGS):OwnerBinding[]{
 try{
  const rows:unknown=JSON.parse(raw??'');
  if(!Array.isArray(rows)||rows.length!==3)throw Error();
  const mapped=rows.map((row:unknown)=>{
   if(!row||typeof row!=='object'||Array.isArray(row))throw Error();
   const r=row as Record<string,unknown>;
   if(Object.keys(r).sort().join(',')!=='authUserId,email,username'||typeof r.username!=='string'||!USERNAMES.includes(r.username)||typeof r.email!=='string'||!/^\S+@\S+\.\S+$/.test(r.email)||typeof r.authUserId!=='string'||!(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.authUserId)))throw Error();
   return r as OwnerBinding;
  });
  if(new Set(mapped.map(r=>r.username)).size!==3||new Set(mapped.map(r=>r.email.toLowerCase())).size!==3||new Set(mapped.map(r=>r.authUserId)).size!==3)throw Error();
  return mapped;
 }catch{throw new Error('Owner login is not configured.');}
}
export function ownerBinding(username:unknown):OwnerBinding|null{
 if(typeof username!=='string'||username.length>32)return null;
 return ownerBindings().find(row=>row.username===username.trim().toUpperCase())??null;
}
// Shared server-only gate for cookie pages and ordinary bearer endpoints.
export function ownerPrincipalAllows(uid:string,membership:unknown):boolean{
 try{
  if(!ownerBindings().some(row=>row.authUserId===uid)||!membership||typeof membership!=='object')return false;
  const row=membership as Record<string,unknown>;
  return row.supabase_user_id===uid&&row.active===true&&typeof row.principal_id==='string'&&row.principal_id.trim().length>0;
 }catch{return false}
}
