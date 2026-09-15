/* My Journal — no dependencies, network requests, or stored personal data.
 * The book retains the original notebook's hinged CSS 3D leaf model.
 * The intro adapts the supplied hearts project's perspective heart rings.
 */
(() => {
  'use strict';
  const SETTINGS = { leaves: 4, introDuration: 4300, fadeDuration: 1500, rings: 50 };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const book = document.getElementById('book');
  const journal = document.getElementById('journal');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const backCover = document.createElement('div');
  backCover.className = 'back-cover';
  book.append(backCover);
  const leaves = [];
  let current = 0;
  let turning = false;
  for (let i = 0; i < SETTINGS.leaves; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    const front = document.createElement('div');
    front.className = 'face front ' + (i === 0 ? 'cover' : 'paper');
    if (i === 0) {
      const title = document.createElement('h1');
      title.textContent = 'My Journal';
      front.append(title);
      const signature = document.createElement('p');
      signature.className = 'cover-signature';
      signature.textContent = 'by YB';
      front.append(signature);
    } else addNumber(front, i * 2);
    const back = document.createElement('div');
    back.className = 'face back paper';
    addNumber(back, i * 2 + 1);
    leaf.append(front, back);
    book.append(leaf);
    leaves.push(leaf);
  }
  function addNumber(face, number) {
    const label = document.createElement('span');
    label.className = 'page-number';
    label.textContent = number;
    face.append(label);
  }
  function update() {
    leaves.forEach((leaf, i) => {
      leaf.style.zIndex = i < current ? i + 1 : SETTINGS.leaves - i;
      const frontVisible = i === current;
      const backVisible = i === current - 1;
      leaf.children[0].setAttribute('aria-hidden', String(!frontVisible));
      leaf.children[1].setAttribute('aria-hidden', String(!backVisible));
      leaf.children[0].inert = !frontVisible;
      leaf.children[1].inert = !backVisible;
    });
    previous.disabled = turning || current === 0;
    next.disabled = turning || current === SETTINGS.leaves;
    book.classList.toggle('open', current > 0);
  }
  function turn(direction) {
    if (document.getElementById('photo-viewer').open || turning || journal.inert || current + direction < 0 || current + direction > SETTINGS.leaves) return;
    turning = true;
    const leaf = leaves[direction > 0 ? current : current - 1];
    current += direction;
    update();
    // Keep the moving leaf above both stacks for the entire rotation.
    leaf.style.zIndex = SETTINGS.leaves + 2;
    leaf.classList.toggle('flipped', direction > 0);
    const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--turn-duration'));
    setTimeout(() => { turning = false; update(); }, duration + 40);
  }
  previous.addEventListener('click', () => turn(-1));
  next.addEventListener('click', () => turn(1));
  book.addEventListener('click', () => { if (current === 0) turn(1); });
  document.addEventListener('keydown', event => {
    if (event.target.closest('input, audio, dialog, .music-player')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      turn(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  function scaleBook() {
    const stage = document.querySelector('.stage');
    const scale = Math.min((innerWidth - (innerWidth > 1100 ? 440 : innerWidth > 600 ? 220 : 44)) / 680, (stage.clientHeight - 30) / 460, 1.08);
    document.documentElement.style.setProperty('--book-scale', Math.max(.1, scale));
    document.documentElement.style.setProperty('--book-half-width', `${340 * Math.max(.1, scale)}px`);
    document.documentElement.style.setProperty('--book-half-height', `${230 * Math.max(.1, scale)}px`);
  }
  window.addEventListener('resize', scaleBook);
  scaleBook();
  update();

  const canvas = document.getElementById('tunnel');
  const ctx = canvas.getContext('2d', { alpha: false });
  let width, height;
  function resizeTunnel() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeTunnel();
  window.addEventListener('resize', resizeTunnel);
  const near = .15, far = 12, span = far - near;
  const rings = Array.from({ length: SETTINGS.rings }, (_, i) => ({ z: near + i / SETTINGS.rings * span, hue: i / SETTINGS.rings * 360 }));
  function heart(size, rotation) {
    ctx.save(); ctx.rotate(rotation); ctx.beginPath();
    ctx.moveTo(0, -size * .35);
    ctx.bezierCurveTo(-size * .55, -size * .85, -size * 1.1, -size * .15, 0, size * .75);
    ctx.bezierCurveTo(size * 1.1, -size * .15, size * .55, -size * .85, 0, -size * .35);
    ctx.closePath(); ctx.restore();
  }
  let start, last, fading = false;
  const duration = reducedMotion ? 500 : SETTINGS.introDuration;
  const fade = reducedMotion ? 400 : SETTINGS.fadeDuration;
  const whiteout = reducedMotion ? 300 : 1300;
  const smoothstep = value => value * value * (3 - 2 * value);
  function frame(now) {
    start ??= now; last ??= now;
    const elapsed = now - start;
    const dt = Math.min((now - last) / 1000, .04); last = now;
    const seconds = elapsed / 1000;
    ctx.fillStyle = '#080310'; ctx.fillRect(0, 0, width, height);
    ctx.save(); ctx.translate(width / 2, height / 2); ctx.globalCompositeOperation = 'lighter';
    const focal = Math.max(width, height) * .8;
    rings.sort((a,b) => b.z - a.z);
    for (const ring of rings) {
      ring.z -= reducedMotion ? 0 : dt * (2.1 + Math.min(seconds / 3, 1) * 1.6);
      if (ring.z < near) ring.z += span;
      const size = focal / ring.z;
      const opacity = Math.min(1, (far - ring.z) / 2) * Math.min(1, (ring.z - near) * 4);
      const hue = (ring.hue + seconds * 35) % 360;
      heart(size * (1 + Math.sin(seconds * 2 - ring.z * .5) * .035), Math.sin(seconds * .4 + ring.z * .3) * .09);
      for (const [line, alpha, light] of [[5,.13,65],[1.8,.6,72],[.55,.9,88]]) {
        ctx.strokeStyle = `hsla(${hue},85%,${light}%,${opacity * alpha})`;
        ctx.lineWidth = Math.max(.7, size * .018 * line); ctx.stroke();
      }
    }
    ctx.restore();
    // Reach solid white before revealing the book: no dark tunnel crossfade
    // or abrupt canvas removal is visible over the journal.
    const light = smoothstep(Math.max(0, Math.min(1, (elapsed - duration + whiteout) / whiteout)));
    if (light > 0) {
      ctx.fillStyle = `rgba(255,255,255,${light})`;
      ctx.fillRect(0, 0, width, height);
    }
    if (elapsed >= duration && !fading) {
      fading = true;
      canvas.classList.add('finished'); journal.classList.add('ready');
    }
    if (elapsed < duration + fade) requestAnimationFrame(frame);
    else { canvas.remove(); journal.inert = false; window.removeEventListener('resize', resizeTunnel); }
  }
  requestAnimationFrame(frame);
})();
