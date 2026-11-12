import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dayBounds,siteDate,siteDateTime,balanceMeaning,receiptLabel,moneySum,loadOwnerOverview,loadSiteLog,ERP_TABLES} from '../src/lib/erp-read-contract';
let count=0;
async function test(name:string,fn:()=>unknown|Promise<unknown>){await fn();count++;console.log('PASS',name);}
function client(responses:any[]) {
 const queries:any[]=[];
 return {queries,from(table:string){const calls:any[]=[];const index=queries.length;queries.push({table,calls});const chain:any={then(resolve:any,reject:any){return Promise.resolve(responses[index]).then(resolve,reject);}};
 for(const method of ['select','gte','lt','lte','order','limit','maybeSingle','range'])chain[method]=(...args:any[])=>{calls.push([method,...args]);return chain;};return chain;}};
}
const now=new Date('2026-11-08T20:00:00Z'); // Nov 9 in quarry timezone, Nov 8 on UTC host.
const okay:any[]=[{data:[{final_amount:0.1,qty:10},{final_amount:0.2,qty:20}],error:null},{data:[{final_amount:100}],error:null},{data:[{amount:30}],error:null},{data:{closing_cash_balance:70,business_date:'2026-11-08T18:30:00Z',updated_at:'2026-11-09T05:00:00Z'},error:null}];
await test('quarry day is independent of host timezone',()=>{assert.equal(siteDate(now),'2026-11-09');assert.deepEqual(dayBounds('2026-11-09'),{start:'2026-11-09T00:00:00+05:30',endExclusive:'2026-11-10T00:00:00+05:30'});});
await test('rejects invalid calendar filters and handles leap days',()=>{assert.throws(()=>dayBounds('2026-02-29'));assert.throws(()=>dayBounds('2026-13-01'));assert.equal(dayBounds('2028-02-29').endExclusive,'2028-03-01T00:00:00+05:30');});
await test('all overview query ranges exclude tomorrow/future entries',async()=>{const db=client(okay);const result=await loadOwnerOverview(db,now);assert.equal(result.status,'available');for(const query of db.queries.slice(0,3))assert(query.calls.some((call:any)=>call[0]==='lt'&&call[2]==='2026-11-10T00:00:00+05:30'));assert.equal(db.queries[0].calls.find((c:any)=>c[0]==='gte')[2],'2026-11-09T00:00:00+05:30');});
await test('overview sums exact paise and does not derive production tons',async()=>{const result=await loadOwnerOverview(client(okay),now);assert.equal(result.status,'available');if(result.status==='available'){assert.equal(result.todaysSales,0.3);assert.equal(result.todaysQty,30);assert.equal(result.dispatchCount,2);assert.equal(result.revenue,100);assert.equal(result.recordedExpenses,30);assert.equal(result.cash?.amount,70);assert(!('productionTons' in result));}});
await test('any cloud query error makes overview unavailable, never zero/live',async()=>{for(let i=0;i<4;i++){const responses=structuredClone(okay);responses[i]={data:null,error:{message:'synthetic inaccessible source'}};assert.equal((await loadOwnerOverview(client(responses),now)).status,'unavailable');}});
await test('missing daybook remains unavailable cash, not zero cash',async()=>{const responses=structuredClone(okay);responses[3]={data:null,error:null};const result=await loadOwnerOverview(client(responses),now);assert.equal(result.status,'available');if(result.status==='available')assert.equal(result.cash,null);});
await test('malformed amounts do not yield credible metrics',async()=>{const responses=structuredClone(okay);responses[0].data[0].final_amount=NaN;assert.equal((await loadOwnerOverview(client(responses),now)).status,'unavailable');assert.throws(()=>moneySum([0.001]));});
await test('customer signed balance agrees with ERP contract',()=>{assert.equal(balanceMeaning(10),'Amount you owe MBM');assert.equal(balanceMeaning(-10),'Amount MBM owes you');assert.equal(balanceMeaning(0),'Account settled');});
await test('sale reference uses actual book/page contract, not invented invoice number',()=>{assert.equal(receiptLabel({book_number:4,page_number:8}),'Book 4 / Page 8');assert.equal(receiptLabel({serial_number:7}),'Sale #7');assert.equal(receiptLabel({}),'Sale reference unavailable');});
await test('customer portal is deliberately closed in the private approval website',()=>{const source=fs.readFileSync('src/app/customer/dashboard/page.tsx','utf8');assert(source.includes("redirect('/customer/login')"));assert(!source.includes('.from('));const login=fs.readFileSync('src/app/customer/login/page.tsx','utf8');assert(login.includes('Customer portal not available'));assert(!login.includes('cookieStore.set'));});
await test('owner overview explicitly avoids unverified profit/live/production claims',()=>{const source=fs.readFileSync('src/app/page.tsx','utf8');assert(!source.includes('Monthly P/L'));assert(!source.includes('Est. Production'));assert(!source.includes('Live</span>'));assert(source.includes('Not a profit calculation'));assert(source.includes('Last recorded cash'));});
await test('query names exist in ERP exported DDL contract',()=>{
 const fixture=JSON.parse(fs.readFileSync('tests/fixtures/erp-contract.json','utf8'));
 for(const table of Object.values(ERP_TABLES))assert(fixture.tables[table.replace(/^website_/, '')],`Unknown ERP table ${table}`);
 for(const column of ['sale_date','final_amount','book_number','page_number','serial_number'])assert(fixture.tables.outgoing_sales.includes(column));
 assert(!fixture.tables.outgoing_sales.includes('invoice_number'));assert(!fixture.tables.outgoing_sales.includes('total_amount'));
 assert(fixture.tables.party_ledger.includes('date'));assert(!fixture.tables.party_ledgers);
});
await test('500-row response is paged instead of silently capped',async()=>{
 let quantityPage=0;const fixture:any={from(table:string){let columns='';const q:any={select(value:string){columns=value;return q;},then(resolve:any){return Promise.resolve(columns.includes('qty')?{data:quantityPage++===0?Array.from({length:500},()=>({final_amount:1,qty:1})):[{final_amount:2,qty:2}],error:null}:table==='website_day_books'?okay[3]:{data:[],error:null}).then(resolve);}};for(const method of ['gte','lt','lte','order','limit','range','maybeSingle'])q[method]=()=>q;return q;}};
 const result=await loadOwnerOverview(fixture,now);assert.equal(result.status,'available');if(result.status==='available'){assert.equal(result.dispatchCount,501);assert.equal(result.todaysSales,502);}
});

const logRow=(id:string,kind='sales',party='Alpha')=>({id,sale_date:'2026-11-09T04:00:00Z',date:'2026-11-09T04:00:00Z',party_name:party,qty:1,final_amount:0.10,amount:0.20});
await test('selected-day sales and boulder lists page beyond 500 with deterministic ties',async()=>{
 for(const kind of ['sales','boulders'] as const){const db=client([{data:Array.from({length:500},(_,i)=>logRow(String(i))),error:null},{data:[logRow('501',kind,'Beta')],error:null}]);const result=await loadSiteLog(db,kind,'2026-11-09');assert.equal(result.status,'available');if(result.status==='available'){assert.equal(result.rows.length,501);assert.equal(result.totalAmount,kind==='sales'?50.1:100.2);assert.equal(result.totalQty,501);assert.equal(result.scope,'selected-day');}assert.deepEqual(db.queries.map(q=>q.calls.find((c:any)=>c[0]==='range')), [['range',0,499],['range',500,999]]);for(const query of db.queries){assert(query.calls.some((c:any)=>c[0]==='order'&&c[1]==='id'));assert(query.calls.some((c:any)=>c[0]==='lt'&&c[2]==='2026-11-10T00:00:00+05:30'));}}
});
await test('search filters after complete paging and updates all totals',async()=>{const db=client([{data:[logRow('1','sales','Alpha'),logRow('2','sales','Beta')],error:null}]);const result=await loadSiteLog(db,'sales','2026-11-09','  bEtA  ');assert.equal(result.status,'available');if(result.status==='available'){assert.equal(result.rows.length,1);assert.equal(result.loadedCount,2);assert.equal(result.totalAmount,0.1);assert.equal(result.totalQty,1);}});
await test('recent list explicitly requests 50 and reports limited scope',async()=>{const db=client([{data:[logRow('1')],error:null}]);const result=await loadSiteLog(db,'sales',undefined);assert.equal(result.status,'available');if(result.status==='available')assert.equal(result.scope,'latest-50');assert(db.queries[0].calls.some((c:any)=>c[0]==='limit'&&c[1]===50));});
await test('malformed dates never fall through to unrelated recent lists',async()=>{for(const date of ['oops','2026-02-29','']){const db=client([]);assert.equal((await loadSiteLog(db,'sales',date)).status,'invalid-date');assert.equal(db.queries.length,0);}});
await test('second page failures never yield partial log totals',async()=>{const db=client([{data:Array.from({length:500},(_,i)=>logRow(String(i))),error:null},{data:null,error:{message:'synthetic'}}]);assert.equal((await loadSiteLog(db,'sales','2026-11-09')).status,'unavailable');});
await test('page-cap exhaustion is unavailable rather than a partial total',async()=>{const db=client(Array.from({length:20},()=>({data:Array.from({length:500},(_,i)=>logRow(String(i))),error:null})));assert.equal((await loadSiteLog(db,'boulders','2026-11-09')).status,'unavailable');assert.equal(db.queries.length,20);});
await test('invalid money is checked before search can hide the row',async()=>{const row=logRow('1');row.final_amount=0.001;assert.equal((await loadSiteLog(client([{data:[row],error:null}]),'sales','2026-11-09','nomatch')).status,'unavailable');});
await test('both list pages wire GET search, retained date and explicit total scope',()=>{for(const name of ['sales','boulder']){const source=fs.readFileSync(`src/app/${name}/page.tsx`,'utf8');assert(source.includes('loadSiteLog('));assert(source.includes('method="get"'));assert(source.includes('name="q"'));assert(source.includes('name="date"'));assert(source.includes('Totals cover only the latest 50 records.'));assert(source.includes('Search filters that scope.'));assert(!source.includes('final_amount || 0'));assert(!source.includes('amount || 0'));}});

console.log(`${count} acceptance checks passed. Synthetic client only; no auth or cloud access.`);
await test('day books are queried by canonical UTC-midnight date label, not a local-midnight instant',async()=>{
 // ERP day_books.business_date is a canonical UTC-midnight date label
 // (2026-11-09T00:00:00.000Z). An IST-midnight instant bound
 // (2026-11-09T00:00:00+05:30 = 2026-11-08T18:30:00Z) excludes the same-day
 // row and the page reports "No synced Day Book" despite a synced row.
 const db=client(okay);await loadOwnerOverview(db,now);
 const dayBookQuery=db.queries[3];assert.equal(dayBookQuery.table,'website_day_books');
 const lte=dayBookQuery.calls.find((c:any)=>c[0]==='lte');
 assert(lte);assert.equal(lte[1],'business_date');assert.equal(lte[2],'2026-11-09T00:00:00.000Z');
});
await test('same-day canonical day book row yields last recorded cash, legacy wrong key tolerated',async()=>{
 const responses=structuredClone(okay);responses[3]={data:{closing_cash_balance:-123.45,business_date:'2026-11-09T00:00:00.000Z',updated_at:'2026-11-09T05:00:00Z'},error:null};
 const result=await loadOwnerOverview(client(responses),now);
 assert.equal(result.status,'available');if(result.status==='available'){assert.equal(result.cash?.amount,-123.45);assert.equal(result.cash?.businessDate,'2026-11-09T00:00:00.000Z');}
});

await test('rejected provider promises are unavailable, never fabricated records',async()=>{
 const failing:any={from(){const q:any={then(_ok:any,no:any){return Promise.reject(new Error('Synthetic transport failure')).then(_ok,no);}};for(const method of ['select','gte','lt','lte','order','limit','range','maybeSingle'])q[method]=()=>q;return q;}};
 assert.equal((await loadOwnerOverview(failing,now)).status,'unavailable');
 for(const kind of ['sales','boulders'] as const)assert.equal((await loadSiteLog(failing,kind,undefined)).status,'unavailable');
});
await test('every read query column fits proposed grants, never SELECT star',async()=>{
 const policy=fs.readFileSync('docs/database/Q2-PRIVATE-NOT-EXECUTED.sql','utf8');
 const db=client(okay);await loadOwnerOverview(db,now);
 for(const kind of ['sales','boulders'] as const){const list=client([{data:[],error:null}]);await loadSiteLog(list,kind,undefined);db.queries.push(...list.queries);}
 for(const query of db.queries){const selected=query.calls.find((c:any)=>c[0]==='select')[1];assert(!selected.includes('*'));const grant=policy.match(new RegExp('CREATE VIEW public\\.'+query.table+' WITH \\([^)]*\\) AS SELECT ([^;]+?) FROM public\\.'));assert(grant,query.table);for(const col of selected.split(','))assert(grant[1].split(',').includes(col),query.table+'.'+col);}
});
console.log('All '+count+' cohesive owner checks passed.');
