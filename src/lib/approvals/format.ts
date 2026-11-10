const fields:Record<string,string>={qty:'Quantity',ratePerCft:'Rate per CFT',discountType:'Discount type',discountValue:'Discount',gstEnabled:'GST'};
export function requestTitle(operation:string) {
  return operation==='edit_remarks'?'Sale note correction':operation==='edit_fields'?'Sale correction':operation==='delete_sale'?'Sale removal request':'Request needing app review';
}
export function requestDiff(operation:string,before:string|null,after:string|null) {
  if(operation!=='edit_fields')return `${before??'(blank)'} → ${after??'(blank)'}`;
  try{
    const old=JSON.parse(before??'{}'),next=JSON.parse(after??'{}');
    return Object.keys(next).map(k=>`${fields[k]??k}: ${String(old[k]??'(blank)')} → ${String(next[k]??'(blank)')}`).join('; ');
  }catch{return 'Change details could not be read. Check this request in the app.'}
}
