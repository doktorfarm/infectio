export const authored=i=>/AUTHOR_EBM/.test(i.provenance||'');
export const key=i=>(authored(i)?'author:':'source:')+i.id;
export function parseOptions(i){return typeof i.options==='string'?[...i.options.matchAll(/(?:^|;\s*)([A-Ea-e])\)\s*([^]*?)(?=;\s*[A-Ea-e]\)|$)/g)].map(m=>({letter:m[1].toUpperCase(),text:m[2].trim()})):[]}
export function validStructure(i){const o=parseOptions(i);return i.kind==='ABCDE'&&o.length===5&&new Set(o.map(x=>x.letter)).size===5&&new Set(o.map(x=>x.text.toLowerCase())).size===5&&o.every(x=>x.text)&&/^[A-E]$/.test(i.correct_option||'')}
export function fingerprint(i){return JSON.stringify([i.question,i.options,i.answer,i.correct_option,i.reference])}
export function canGrade(i,approved){return validStructure(i)&&approved.get(key(i))===fingerprint(i)}
export function grade(i,choice,approved){if(!canGrade(i,approved))throw Error('Brak zweryfikowanego klucza');if(!/^[A-E]$/.test(choice))throw Error('Nieprawidłowa opcja');return choice===i.correct_option}
export function importItems(input,existing=[]){const rows=Array.isArray(input)?input:input.items||input.records;if(!Array.isArray(rows)||!rows.length)throw Error('Oczekiwano niepustej tablicy lub pola items / records.');const seen=new Set(existing.map(key));const result=[];for(const row of rows){if(!row||typeof row!=='object'||typeof row.id!=='string'||!row.id.trim())throw Error('Każdy rekord wymaga tekstowego ID.');for(const f of ['question','answer','options','kind','topic','provenance','reference'])if(row[f]!=null&&typeof row[f]!=='string')throw Error('Pole '+f+' musi być tekstem.');const item={...row};if(seen.has(key(item)))throw Error('Powtórzone ID: '+item.id+' — import anulowany.');seen.add(key(item));result.push(item)}return [...existing,...result]}

export function shuffle(arr,rnd=Math.random){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
