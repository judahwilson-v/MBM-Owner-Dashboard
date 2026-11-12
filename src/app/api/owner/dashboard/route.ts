import {NextRequest,NextResponse} from 'next/server';
import {activeOwner,ordinaryOwnerClient} from '@/lib/owner-auth/service';
import {loadOwnerOverview} from '@/lib/erp-read-contract';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','Pragma':'no-cache'};
export async function GET(request:NextRequest){
 try{
  if(request.nextUrl.search)return NextResponse.json({error:'Unsupported request.'},{status:400,headers});
  const auth=request.headers.get('authorization');if(!auth?.startsWith('Bearer ')||auth.length>16384)throw Error();
  const token=auth.slice(7),client=ordinaryOwnerClient(token);
  const {data,error}=await client.auth.getUser(token);
  if(error||!data.user||data.user.role!=='authenticated'||!await activeOwner(client,data.user.id))throw Error();
  const overview=await loadOwnerOverview(client);
  return NextResponse.json({version:1,source:'saved-cloud',timezone:'Asia/Kolkata',currency:'INR',overview},{status:overview.status==='available'?200:503,headers});
 }catch{return NextResponse.json({error:'Owner data unavailable.'},{status:401,headers});}
}
