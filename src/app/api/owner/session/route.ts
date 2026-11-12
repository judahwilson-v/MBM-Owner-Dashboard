import {NextRequest,NextResponse} from 'next/server';
import {activeOwner,authenticateOwner,AUTH_FAILURE,ordinaryOwnerClient} from '@/lib/owner-auth/service';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','Pragma':'no-cache'};
const failure=()=>NextResponse.json({error:AUTH_FAILURE},{status:401,headers});
function token(request:NextRequest){const h=request.headers.get('authorization');return h?.startsWith('Bearer ')&&h.length<16384?h.slice(7):null;}
// This is an ordinary Auth session, not an elevated/custom token issuer.
export async function POST(request:NextRequest){
 let client:ReturnType<typeof ordinaryOwnerClient>|undefined;
 let completed=false;
 try{
  if(!request.headers.get('content-type')?.startsWith('application/json'))return failure();
  if((request.headers.get('content-length')&&Number(request.headers.get('content-length'))>8192))return failure();
  const raw=await request.text();if(raw.length>8192)return failure();
  const body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))return failure();
  client=ordinaryOwnerClient();let session;
  if(body.action==='login'&&Object.keys(body).sort().join(',')==='action,password,username')session=await authenticateOwner(client,body.username,body.password);
  else if(body.action==='refresh'&&Object.keys(body).sort().join(',')==='action,refreshToken'&&typeof body.refreshToken==='string'&&body.refreshToken.length>0&&body.refreshToken.length<4096){
   const refreshed=await client.auth.refreshSession({refresh_token:body.refreshToken});
   const verified=await client.auth.getUser();
   if(refreshed.error||!refreshed.data.session||verified.error||!verified.data.user||verified.data.user.role!=='authenticated'||!await activeOwner(client,verified.data.user.id))throw Error();
   session=refreshed.data.session;
  }else return failure();
  completed=true;
  return NextResponse.json({accessToken:session.access_token,refreshToken:session.refresh_token,expiresAt:session.expires_at,tokenType:'bearer'},{headers});
 }catch{return failure();}
 finally{if(client){if(!completed)await client.auth.signOut({scope:'local'}).catch(()=>undefined);await client.auth.stopAutoRefresh().catch(()=>undefined);}}
}
// Revoke this ordinary refresh session, never other owners/devices. The native
// client clears its local credentials even when the network logout fails.
export async function DELETE(request:NextRequest){
 let client:ReturnType<typeof ordinaryOwnerClient>|undefined;
 try{
  const accessToken=token(request);if(!accessToken)return failure();
  const raw=await request.text();if(raw.length>8192)return failure();
  const body=JSON.parse(raw);
  if(!body||Object.keys(body).join(',')!=='refreshToken'||typeof body.refreshToken!=='string'||!body.refreshToken||body.refreshToken.length>4096)return failure();
  client=ordinaryOwnerClient();
  const verified=await client.auth.getUser(accessToken);
  if(verified.error||!verified.data.user||verified.data.user.role!=='authenticated')return failure();
  const restored=await client.auth.setSession({access_token:accessToken,refresh_token:body.refreshToken});
  if(restored.error||restored.data.user?.id!==verified.data.user.id)return failure();
  const result=await client.auth.signOut({scope:'local'});if(result.error)return failure();
  return NextResponse.json({signedOut:true},{headers});
 }catch{return failure();}
 finally{if(client)await client.auth.stopAutoRefresh().catch(()=>undefined);}
}
