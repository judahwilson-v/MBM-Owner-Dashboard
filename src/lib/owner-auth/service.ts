import {createClient,type SupabaseClient,type Session} from '@supabase/supabase-js';
import {ownerBinding,ownerPrincipalAllows,type OwnerBinding} from './config';
export const AUTH_FAILURE='Could not authenticate owner.';
export function ordinaryOwnerClient(token?:string):SupabaseClient{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(url!=='https://slgkzhchczgvfhryejqu.supabase.co'||!key)throw Error(AUTH_FAILURE);
 let publicKey=key.startsWith('sb_publishable_');
 if(!publicKey){try{publicKey=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role==='anon'}catch{publicKey=false}}
 if(!publicKey||key.startsWith('sb_secret_'))throw Error(AUTH_FAILURE);
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:token?{headers:{Authorization:`Bearer ${token}`}}:undefined});
}
export async function activeOwner(client:SupabaseClient,uid:string,binding?:OwnerBinding):Promise<boolean>{
 if(binding&&binding.authUserId!==uid)return false;
 const {data,error}=await client.from('website_approver_principals').select('principal_id,active,supabase_user_id').eq('supabase_user_id',uid).single();
 return !error&&ownerPrincipalAllows(uid,data);
}
export async function authenticateOwner(client:SupabaseClient,username:unknown,password:unknown):Promise<Session>{
 try{
  const binding=ownerBinding(username);
  if(!binding||typeof password!=='string'||!password||password.length>4096)throw Error();
  const {data,error}=await client.auth.signInWithPassword({email:binding.email,password});
  if(error||!data.session||!data.user||data.user.role!=='authenticated'||data.user.id!==binding.authUserId)throw Error();
  const verified=await client.auth.getUser();
  if(verified.error||verified.data.user?.id!==binding.authUserId||verified.data.user.role!=='authenticated'||!await activeOwner(client,binding.authUserId,binding))throw Error();
  return data.session;
 }catch{
  await client.auth.signOut({scope:'local'}).catch(()=>undefined);
  throw Error(AUTH_FAILURE);
 }
}
