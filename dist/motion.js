const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function update(){document.documentElement.classList.toggle('motion-on',!reduced.matches);document.documentElement.classList.toggle('motion-off',reduced.matches)}
reduced.addEventListener('change',update);update();
const elements=document.querySelectorAll('.section-heading,.steps>li,.cta-banner');
const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){target.classList.add('entered');observer.unobserve(target)}}),{threshold:.1});
elements.forEach(element=>{element.classList.add('reveal-once');observer.observe(element)});
