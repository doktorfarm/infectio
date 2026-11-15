export function localDate(date=new Date()) {return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
export function scheduleReview(progress,itemKey,date,today=localDate()) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Wybierz poprawny termin.');
 const [year,month,day]=date.split('-').map(Number),due=new Date(year,month-1,day);
 if(localDate(due)!==date||date<today)throw Error('Wybierz dzisiejszą lub przyszłą datę.');
 return {...progress,[itemKey]:{...(progress[itemKey]||{seen:false,attempts:0,correct:0}),due:due.getTime()}};
}
