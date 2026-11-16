/* GGG Audio — shared page behaviour: keeps the active product tab in view on narrow
   screens, and draws the moving waveform behind a product page's hero screenshot. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- keep the active tab visible when the tab row scrolls ----------
  var tabs = document.querySelector('.gx-tabs');
  var active = tabs && tabs.querySelector('[aria-current="page"], [aria-selected="true"]');
  if (tabs && active && tabs.scrollWidth > tabs.clientWidth) {
    tabs.scrollLeft = active.offsetLeft - tabs.clientWidth / 2 + active.offsetWidth / 2;
  }

  // ---------- waveform behind the hero screenshot ----------
  var hero = document.querySelector('.gx-product .hero');
  if (!hero) return;
  var canvas = document.createElement('canvas');
  canvas.className = 'gx-wave';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);
  var ctx = canvas.getContext('2d');
  var H = 200, t = 1.8, last = 0, raf = 0, running = false, colors = {};

  function readColors() {
    var cs = getComputedStyle(document.body);
    colors.a = cs.getPropertyValue('--gx-a').trim() || '#fff';
    colors.g2 = cs.getPropertyValue('--gx-g2').trim() || '#fff';
  }
  // Layered sines under a slow envelope, so it reads as program material, not a test tone.
  function sample(x, t) {
    var env = 0.35 + 0.65 * Math.pow(Math.sin(x * 0.9 + t * 0.7) * 0.5 + 0.5, 2);
    return env * (Math.sin(x * 7 + t * 2.1) * 0.55 + Math.sin(x * 17 - t * 3.3) * 0.28 + Math.sin(x * 41 + t * 5.2) * 0.12);
  }
  function size() {
    var d = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * d);
    canvas.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function line(off, alpha, width, color) {
    var w = canvas.clientWidth, mid = H / 2;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (var px = 0; px <= w; px += 3) {
      var y = mid + sample(px / w * Math.PI * 2 + off, t + off) * (H * 0.44);
      px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
    }
    ctx.stroke();
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.clientWidth, H);
    ctx.lineJoin = 'round';
    line(1.3, 0.35, 1.2, colors.g2);
    line(0, 0.75, 1.8, colors.a);
    ctx.globalAlpha = 1;
  }
  function loop(now) {
    var dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    t += dt * 0.6;
    draw();
    raf = running ? requestAnimationFrame(loop) : 0;
  }
  function start() { if (running || reduced || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  readColors();
  size();
  draw();
  if (!reduced) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(canvas);
    } else { start(); }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }
  window.addEventListener('resize', function () { size(); draw(); });
})();
