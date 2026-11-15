// Runs before first paint (plain blocking script, no module): marks the page as "flair" unless the
// visitor asked for reduced motion, so the headline can stay hidden until flair.js has split it.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('flair');
