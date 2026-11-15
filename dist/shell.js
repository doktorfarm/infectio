const button=document.querySelector('#sidebar-toggle');
const mobile=window.matchMedia('(max-width:760px)');
let collapsed=mobile.matches;
function update(){document.body.classList.toggle('sidebar-collapsed',collapsed);button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',collapsed?'Rozwiń panel boczny':'Zwiń panel boczny');document.querySelector('#sidebar').inert=collapsed;}
button.addEventListener('click',()=>{collapsed=!collapsed;update()});
mobile.addEventListener('change',()=>{collapsed=mobile.matches;update()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobile.matches){collapsed=true;update();button.focus()}});
document.querySelector('#nav').addEventListener('click',e=>{if(mobile.matches&&e.target.closest('a')){collapsed=true;update();button.focus()}});
update();
