// Read contract verified against the ERP Prisma/sync schema. No account mutations.
export const ERP_TABLES = {sales:'outgoing_sales',expenses:'expenses',dayBooks:'day_books',partyLedger:'party_ledger',boulders:'incoming_boulder'} as const;
export const SITE_TIMEZONE = 'Asia/Kolkata';
export function siteDate(value:Date=new Date()):string {
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:SITE_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(value);
 const get=(name:string)=>parts.find(part=>part.type===name)!.value;
 return `${get('year')}-${get('month')}-${get('day')}`;
}
export function dayBounds(date:string) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Date must be YYYY-MM-DD.');
 const [year,month,day]=date.split('-').map(Number);
 const valid=new Date(Date.UTC(year,month-1,day));
 if(valid.toISOString().slice(0,10)!==date)throw new Error('Invalid calendar date.');
 const next=new Date(valid);next.setUTCDate(next.getUTCDate()+1);
 return {start:`${date}T00:00:00+05:30`,endExclusive:`${next.toISOString().slice(0,10)}T00:00:00+05:30`};
}
export function siteDateTime(value:string) {
 return new Intl.DateTimeFormat('en-IN',{timeZone:SITE_TIMEZONE,day:'2-digit',month:'short',year:'2-digit',hour:'numeric',minute:'2-digit'}).format(new Date(value));
}
export function balanceMeaning(balance:number) {
 return balance>0?'Amount you owe MBM':balance<0?'Amount MBM owes you':'Account settled';
}
export function receiptLabel(row:{book_number?:number|null,page_number?:number|null,serial_number?:number|null}) {
 if(row.book_number!=null && row.page_number!=null)return `Book ${row.book_number} / Page ${row.page_number}`;
 return row.serial_number!=null?`Sale #${row.serial_number}`:'Sale reference unavailable';
}
export function moneySum(values:unknown[]):number {
 let total=BigInt(0);
 for(const value of values){
  if(typeof value!=='number' || !Number.isFinite(value))throw new Error('Invalid financial amount.');
  const text=String(value);if(!/^\d+(?:\.\d{1,2})?$/.test(text))throw new Error('Unsupported financial precision.');
  const [whole,fraction='']=text.split('.');total+=BigInt(whole)*BigInt(100)+BigInt(fraction.padEnd(2,'0'));
 }
 if(total>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('Financial amount is too large.');
 const result=Number(total)/100;
 const [resultWhole,resultFraction='']=String(result).split('.');
 if(!/^\d+(?:\.\d{1,2})?$/.test(String(result))||BigInt(resultWhole)*BigInt(100)+BigInt(resultFraction.padEnd(2,'0'))!==total)throw new Error('Financial amount loses precision.');
 return result;
}
type ReadResult={data:unknown,error:unknown};
interface ReadQuery extends PromiseLike<ReadResult> {
 gte(column:string,value:string):ReadQuery;
 lt(column:string,value:string):ReadQuery;
 lte(column:string,value:string):ReadQuery;
 order(column:string,options:{ascending:boolean}):ReadQuery;
 limit(count:number):ReadQuery;
 range(from:number,to:number):ReadQuery;
 maybeSingle():PromiseLike<ReadResult>;
}
type ReadClient={from:(table:string)=>{select:(columns:string)=>ReadQuery}};
function rows(value:unknown):Record<string,unknown>[] {
 if(!Array.isArray(value)||value.some(row=>!row||typeof row!=='object'||Array.isArray(row)))throw new Error('Invalid records');
 return value as Record<string,unknown>[];
}
async function allRows(build:()=>ReadQuery):Promise<ReadResult> {
 const collected:unknown[]=[];
 // Explicit cap: never display a truncated partial monthly total as complete.
 for(let page=0;page<20;page++){
  const result=await build().range(page*500,page*500+499);
  if(result.error)return result;
  if(!Array.isArray(result.data))return {data:null,error:'Invalid records'};
  collected.push(...result.data);
  if(result.data.length<500)return {data:collected,error:null};
 }
 return {data:null,error:'Too many records for a verified snapshot'};
}
export async function loadOwnerOverview(client:ReadClient,now:Date=new Date()) {
 const today=siteDate(now),bounds=dayBounds(today),monthStart=`${today.slice(0,7)}-01T00:00:00+05:30`;
 const results=await Promise.all([
  allRows(()=>client.from(ERP_TABLES.sales).select('id,final_amount,qty').gte('sale_date',bounds.start).lt('sale_date',bounds.endExclusive).order('id',{ascending:true})),
  allRows(()=>client.from(ERP_TABLES.sales).select('id,final_amount').gte('sale_date',monthStart).lt('sale_date',bounds.endExclusive).order('id',{ascending:true})),
  allRows(()=>client.from(ERP_TABLES.expenses).select('id,amount').gte('expense_date',monthStart).lt('expense_date',bounds.endExclusive).order('id',{ascending:true})),
  // day_books.business_date is the ERP's canonical UTC-midnight date LABEL, not
  // a local business timestamp: an IST-midnight instant bound excludes the
  // same-day row. Compare against today's label; legacy previous-evening keys
  // still fall below it, and order keeps the newest label first.
  client.from(ERP_TABLES.dayBooks).select('closing_cash_balance,business_date,updated_at').lte('business_date',`${today}T00:00:00.000Z`).order('business_date',{ascending:false}).limit(1).maybeSingle(),
 ]).catch(()=>null);
 if(!results || results.some(result=>result.error))return {status:'unavailable' as const};
 const [sales,monthlySales,expenses,cash]=results;
 try {
  const salesRows=rows(sales.data),monthlyRows=rows(monthlySales.data),expenseRows=rows(expenses.data);
  const revenue=moneySum(monthlyRows.map(row=>row.final_amount));
  const recordedExpenses=moneySum(expenseRows.map(row=>row.amount));
  const quantity=salesRows.reduce((total,row)=>{if(typeof row.qty!=='number'||!Number.isFinite(row.qty)||row.qty<0)throw new Error('Invalid quantity');return total+row.qty;},0);
  const cashRecord=cash.data as Record<string,unknown>|null;
  const cashValue=cashRecord?.closing_cash_balance;
  if(cashRecord && (typeof cashValue!=='number'||!Number.isFinite(cashValue)||typeof cashRecord.business_date!=='string'||typeof cashRecord.updated_at!=='string'))return {status:'unavailable' as const};
  return {status:'available' as const,date:today,todaysSales:moneySum(salesRows.map(row=>row.final_amount)),todaysQty:quantity,dispatchCount:salesRows.length,revenue,recordedExpenses,cash:cashRecord?{amount:cashValue as number,businessDate:cashRecord.business_date as string,updatedAt:cashRecord.updated_at as string}:null};
 }catch{return {status:'unavailable' as const};}
}

// Revision 2: complete selected-day lists; explicit latest-50 scope otherwise.
export type SiteLogRow = {
 id:string; sale_date?:string; date?:string; party_name?:string|null;
 vehicle_number?:string|null; material_name?:string|null; serial_number?:number|null;
 final_amount?:number; amount?:number; qty:number; remaining_credit?:number; settled?:boolean;
};
export async function loadSiteLog(client:ReadClient,kind:'sales'|'boulders',date:string|undefined,term='') {
 let bounds:ReturnType<typeof dayBounds>|undefined;
 if(date!==undefined){try{bounds=dayBounds(date);}catch{return {status:'invalid-date' as const};}}
 const table=kind==='sales'?ERP_TABLES.sales:ERP_TABLES.boulders;
 const dateColumn=kind==='sales'?'sale_date':'date',amountColumn=kind==='sales'?'final_amount':'amount';
 const build=()=>{
  const columns=kind==='sales'?'id,sale_date,book_number,page_number,serial_number,party_name,vehicle_number,material_name,qty,final_amount,remaining_credit':'id,date,party_name,vehicle_number,material_name,qty,amount,settled';
  let query=client.from(table).select(columns).order(dateColumn,{ascending:false}).order('id',{ascending:true});
  if(bounds)query=query.gte(dateColumn,bounds.start).lt(dateColumn,bounds.endExclusive);
  return query;
 };
 const result=await Promise.resolve().then(()=>bounds?allRows(build):build().limit(50)).catch(()=>({data:null,error:true}));
 if(result.error)return {status:'unavailable' as const};
 try{
  const records=rows(result.data);
  // Validate before searching, so malformed records cannot disappear from totals.
  for(const row of records){
   if(typeof row.id!=='string'||typeof row[dateColumn]!=='string'||!Number.isFinite(Date.parse(row[dateColumn] as string))||typeof row.qty!=='number'||!Number.isFinite(row.qty)||row.qty<0)throw new Error('Invalid log record');
   if(row.party_name!=null&&typeof row.party_name!=='string')throw new Error('Invalid party name');
   moneySum([row[amountColumn]]);
  }
  const needle=term.trim().toLocaleLowerCase('en-IN');
  const filtered=records.filter(row=>!needle||String(row.party_name??'').toLocaleLowerCase('en-IN').includes(needle));
  const totalAmount=moneySum(filtered.map(row=>row[amountColumn]));
  const totalQty=filtered.reduce((sum,row)=>sum+(row.qty as number),0);
  if(!Number.isFinite(totalQty))throw new Error('Invalid total quantity');
  return {status:'available' as const,rows:filtered as SiteLogRow[],totalAmount,totalQty,scope:bounds?'selected-day' as const:'latest-50' as const,loadedCount:records.length};
 }catch{return {status:'unavailable' as const};}
}
