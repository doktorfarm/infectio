const stage=document.querySelector('.story-stage');
const cards=[...stage.querySelectorAll('.story-card')];
const controls=document.createElement('div');controls.className='scene-controls';controls.setAttribute('aria-label','Wybierz tryb nauki');
let current=0;
const previous=document.createElement('button');previous.textContent='←';previous.setAttribute('aria-label','Poprzedni tryb');
const next=document.createElement('button');next.textContent='→';next.setAttribute('aria-label','Następny tryb');
const status=document.createElement('span');status.className='sr-only';status.setAttribute('aria-live','polite');
const tabs=['Fiszki','Pytania otwarte','Quiz ABCDE'].map((label,index)=>{const b=document.createElement('button');b.textContent=label;b.addEventListener('click',()=>show(index));controls.append(b);return b});
controls.prepend(previous);controls.append(next,status);stage.before(controls);
function show(index){current=(index+cards.length)%cards.length;cards.forEach((card,i)=>{card.hidden=i!==current;card.inert=i!==current});tabs.forEach((tab,i)=>tab.setAttribute('aria-pressed',String(i===current)));status.textContent=`${current+1} z 3: ${tabs[current].textContent}`}
previous.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
controls.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));tabs[current].focus()}});
let startX=0;stage.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX},{passive:true});stage.addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-startX;if(Math.abs(delta)>70)show(current+(delta<0?1:-1))},{passive:true});
show(0);
