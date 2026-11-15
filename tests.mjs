import{test}from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{importItems,key,parseOptions,fingerprint,canGrade,grade}from'./dist/core.js';const data=JSON.parse(readFileSync(new URL('./dist/data.json',import.meta.url)));const rows=importItems(data),q=rows.find(i=>i.id==='EBM001'),approved=new Map([[key(q),fingerprint(q)]]);
test('410 rekordów (baza v7) i rozkład typów',()=>{assert.equal(rows.length,410);assert.equal(rows.filter(i=>i.kind==='FISZKA').length,0);assert.equal(rows.filter(i=>i.kind==='ODPOWIEDZ_OTWARTA').length,384);assert.equal(rows.filter(i=>i.kind==='ABCDE').length,26);assert.equal(new Set(rows.map(i=>i.id)).size,410)});
test('atomowe odrzucenie konfliktu ID',()=>{assert.throws(()=>importItems({items:[{id:'new'},q]},rows));assert.equal(rows.length,410)});
test('duplikaty wewnątrz importu i błędny format',()=>{assert.throws(()=>importItems([q,q]));assert.throws(()=>importItems({}));assert.throws(()=>importItems([{id:'a',question:{}}]))});
test('niekompletne archiwum pozostaje widoczne, osobne przestrzenie ID',()=>{assert.equal(importItems([{id:'Q1'},{id:'Q1',provenance:'AUTHOR_EBM_2026'}]).length,2);assert.equal(importItems({records:[{id:'empty'}]}).length,1)});
test('pięć opcji i prawidłowy klucz',()=>{assert.equal(parseOptions(q).length,5);assert.equal(grade(q,'B',approved),true);assert.equal(grade(q,'A',approved),false)});
test('sam status SOURCE_LINKED nie pozwala oceniać',()=>assert.throws(()=>grade(q,'B',new Map())));
test('zmieniona treść unieważnia zgodę',()=>{for(const field of['question','options','correct_option','answer','reference'])assert.equal(canGrade({...q,[field]:'zmiana'},approved),false)});
test('zduplikowane opcje i niepełne opcje są blokowane',()=>{for(const options of['A) tak; B) tak; C) nie; D) inne; E) coś','A) tak; B) nie']){let x={...q,options};assert.equal(canGrade(x,new Map([[key(x),fingerprint(x)]])),false)}});

import {scheduleReview,localDate} from './dist/reviews.js';
test('plan powtórek zachowuje wyniki i nie oznacza pytania jako przerobione',()=>{
 const original={q:{seen:true,attempts:4,correct:3}};
 const result=scheduleReview(original,'q','2026-12-01','2026-11-14');
 assert.equal(result.q.correct,3);assert.equal(localDate(new Date(result.q.due)),'2026-12-01');assert.equal(original.q.due,undefined);
 assert.equal(scheduleReview({},'new','2026-12-01','2026-11-14').new.seen,false);
});
test('plan powtórek odrzuca daty przeszłe i nieistniejące',()=>{
 assert.throws(()=>scheduleReview({},'q','2026-11-13','2026-11-14'));
 assert.throws(()=>scheduleReview({},'q','2026-02-30','2026-01-01'));
 assert.throws(()=>scheduleReview({},'q','invalid'));
});

import{newCode,normalizeCode,hashCode,mergeProgress,createSync,sanitizeProgress}from'./dist/sync.js';
test('kod synchronizacji: format, normalizacja, skrót',async()=>{const c=newCode();assert.match(c,/^[A-HJ-NP-Z2-9]{5}(-[A-HJ-NP-Z2-9]{5}){3}$/);assert.notEqual(c,newCode());assert.equal(normalizeCode(c.toLowerCase().replaceAll('-',' ')),c);assert.equal(normalizeCode('za krotki'),null);assert.equal(normalizeCode('0000000000000000000O'),null);assert.match(await hashCode(c),/^[0-9a-f]{64}$/)});
test('scalanie postępu: nowszy wpis wygrywa, nic nie ginie',()=>{const m=mergeProgress({a:{last:5,seen:true},b:{last:1}},{a:{last:9,seen:true,lastResult:false},c:{last:2}});assert.equal(m.a.last,9);assert.deepEqual(Object.keys(m).sort(),['a','b','c']);assert.equal(mergeProgress({x:{last:3,due:9}},{x:{last:3,due:5}}).x.due,9)});
test('klient synchronizacji wywołuje właściwe funkcje bazy',async()=>{const calls=[];const s=createSync({url:'https://x.example/',key:'k',fetchImpl:async(u,o)=>{calls.push([u,JSON.parse(o.body),o.headers.apikey]);return{ok:true,text:async()=>'{"a":{"last":1}}'}}});assert.equal(s.enabled,true);assert.deepEqual(await s.pull('id1'),{a:{last:1}});await s.push('id1',{b:1});assert.equal(calls[0][0],'https://x.example/rest/v1/rpc/get_progress');assert.equal(calls[1][0],'https://x.example/rest/v1/rpc/put_progress');assert.equal(calls[1][1].p_id,'id1');assert.equal(calls[0][2],'k');assert.equal(createSync({url:'',key:''}).enabled,false);await assert.rejects(createSync({url:'u',key:'k',fetchImpl:async()=>({ok:false,status:401})}).pull('i'))});

test('wczytywanie kopii: tylko znane pola, błędne pliki odrzucone',()=>{const c=sanitizeProgress({'source:Q1':{seen:true,attempts:2,correct:1,last:5,due:9,lastResult:false,evil:'<img>'},bad:5});assert.deepEqual(c,{'source:Q1':{seen:true,attempts:2,correct:1,last:5,due:9,lastResult:false}});assert.throws(()=>sanitizeProgress([]));assert.throws(()=>sanitizeProgress({}));assert.throws(()=>sanitizeProgress('x'))});

test('weryfikacja kluczy: spójność pliku z bazą',()=>{const v=JSON.parse(readFileSync(new URL('./dist/verification.json',import.meta.url)));const ids=new Set(rows.map(i=>i.id));assert.equal(v.reviewed.length,410);assert.ok(v.reviewed.every(id=>ids.has(id)));assert.ok(Object.keys(v.flags).every(id=>ids.has(id)));assert.equal(Object.values(v.flags).filter(f=>f.level==='blad').length,4);assert.ok(rows.every(i=>/^[A-E]$/.test(i.answer_key)&&parseOptions(i).length===5));const quiz=rows.filter(i=>v.flags[i.id]?.level!=='blad');assert.equal(quiz.length,406)});

test('przepisane warianty: 5 różnych opcji, klucz na swoim miejscu, brak ogólników',()=>{const v=JSON.parse(readFileSync(new URL('./dist/verification.json',import.meta.url)));const byId=new Map(rows.map(i=>[i.id,i]));assert.equal(v.rewritten.length,308);assert.equal(v.easy.length,4);for(const id of v.rewritten){const i=byId.get(id);const o=parseOptions(i);assert.equal(o.length,5,id);assert.equal(new Set(o.map(x=>x.text.toLowerCase())).size,5,id);assert.ok(o.some(x=>x.letter===i.answer_key),id);const key=o.find(x=>x.letter===i.answer_key).text;assert.ok(!/^Prawidłowa w szkicu/.test(key),id)}});
