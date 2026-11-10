// Atlas globe, ported from the Elara app prototype (its WebGL shader, paper-earth texture, marker markup and
// rotation constants are reused as they are). Only the destination list and the homepage wiring differ.
window.ElaraGlobe = (() => {
  const stage = document.querySelector('#globe-stage'); if (!stage) return { set() {}, onPick() {} };
  const canvas = stage.querySelector('canvas'), reduced = matchMedia('(prefers-reduced-motion: reduce)'), RAD = Math.PI / 180;
  const LOCK = '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 4.63601C5 3.76031 5.24219 3.1054 5.64323 2.67357C6.03934 2.24705 6.64582 1.9783 7.5014 1.9783C8.35745 1.9783 8.96306 2.24652 9.35823 2.67208C9.75838 3.10299 10 3.75708 10 4.63325V5.99999H5V4.63601ZM4 5.99999V4.63601C4 3.58148 4.29339 2.65754 4.91049 1.99307C5.53252 1.32329 6.42675 0.978302 7.5014 0.978302C8.57583 0.978302 9.46952 1.32233 10.091 1.99162C10.7076 2.65557 11 3.57896 11 4.63325V5.99999H12C12.5523 5.99999 13 6.44771 13 6.99999V13C13 13.5523 12.5523 14 12 14H3C2.44772 14 2 13.5523 2 13V6.99999C2 6.44771 2.44772 5.99999 3 5.99999H4ZM3 6.99999H12V13H3V6.99999Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/></svg>';
  const CHECK = '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/></svg>';
  // Coordinates and place names as in the app. The five homepage destinations, then the app's locked "to discover" markers.
  const PINS = [
    { lat: 35, lon: 135, img: 'pin-kyoto.jpg', title: ['Arashiyama, Kioto', 'Arashiyama, Kyoto'], label: ['Kioto', 'Kyoto'] },
    { lat: 45.4408, lon: 12.3155, img: 'pin-venice.jpg', title: ['Venecia, Italia', 'Venice, Italy'], label: ['Venecia', 'Venice'] },
    { lat: -13.16, lon: -72.54, img: 'pin-andes.jpg', title: ['Machu Picchu, Perú', 'Machu Picchu, Peru'], label: ['Machu Picchu', 'Machu Picchu'] },
    { lat: 19.4, lon: -99.1, img: 'pin-mexico.jpg', title: ['Ciudad de México', 'Mexico City'], label: ['Ciudad de México', 'Mexico City'] },
    { lat: 27.2579, lon: 33.8116, img: 'pin-redsea.jpg', title: ['Costa del mar Rojo, Egipto', 'Red Sea Coast, Egypt'], label: ['Mar Rojo', 'Red Sea'] },
    ...[[44, 117, 'Asia', 'Asia'], [-4.16, -90.54, 'Sudamérica', 'South America'], [6.7, 16.8, 'África', 'Africa'], [-9.3, 129.7, 'Oceanía', 'Oceania'], [28.4, -117.1, 'Norteamérica', 'North America'], [47.7, -27.1, 'Europa', 'Europe']]
      .map(([lat, lon, es, en]) => ({ lat, lon, locked: true, title: ['Por descubrir · ' + es, 'To discover · ' + en] })),
  ];
  let current = 0, collected = [], lang = 0, pick = () => {}, visible = false, fallback = false;
  const m = { yaw: PINS[0].lon * RAD, pitch: PINS[0].lat * RAD, targetYaw: PINS[0].lon * RAD, targetPitch: PINS[0].lat * RAD, spinning: !reduced.matches, drag: false, lastX: 0, lastY: 0 };
  const turnTo = p => { m.targetYaw = m.yaw + Math.atan2(Math.sin(p.lon * RAD - m.yaw), Math.cos(p.lon * RAD - m.yaw)); m.targetPitch = p.lat * RAD; };

  // ---- markers (same markup and classes as the app)
  const els = PINS.map((p, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.hidden = true; b.disabled = !!p.locked;
    b.addEventListener('click', () => { if (p.locked) return; m.spinning = false; turnTo(p); pick(i); });
    stage.append(b); return b;
  });
  function renderPins() {
    PINS.forEach((p, i) => { const b = els[i], got = collected.includes(i);
      b.className = 'paper-globe-pin ' + (i === current ? 'is-selected ' : '') + (p.locked ? 'is-locked ' : '') + (got ? 'is-visited' : '');
      b.setAttribute('aria-label', p.title[lang] + ' · ' + (p.locked ? ['Bloqueado', 'Locked'][lang] : got ? ['Recorrido', 'Visited'][lang] : ['Por explorar', 'To explore'][lang]));
      b.innerHTML = (p.locked ? LOCK : '<small class="paper-pin-label"></small><img alt="" src="assets/' + p.img + '">') + (got ? '<span>' + CHECK + '</span>' : '');
      if (!p.locked) b.querySelector('small').textContent = p.label[lang]; });
  }

  // ---- WebGL (shader copied from the app)
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, preserveDrawingBuffer: true });
  let yawLoc, pitchLoc, ready = false, last = 0;
  const fail = () => { fallback = true; canvas.hidden = true; els.forEach(b => { b.hidden = true; }); const p = document.createElement('p'); p.className = 'paper-globe-fallback'; p.textContent = ['Puedes elegir un destino en la lista.', 'You can choose a destination from the list.'][lang]; stage.append(p); };
  if (!gl) fail(); else try {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error('Atlas shader unavailable'); return s; };
    const vs = sh(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 uv;void main(){uv=p;gl_Position=vec4(p,0.,1.);}');
    const fs = sh(gl.FRAGMENT_SHADER, `precision highp float;varying vec2 uv;uniform sampler2D earth;uniform float yaw;uniform float pitch;
   void main(){vec2 q=uv*1.15;float r=dot(q,q);if(r>1.){gl_FragColor=vec4(0.);return;}float z=sqrt(1.-r);vec3 n=vec3(q,z);vec3 east=vec3(cos(yaw),0.,-sin(yaw));vec3 north=vec3(-sin(pitch)*sin(yaw),cos(pitch),-sin(pitch)*cos(yaw));vec3 center=vec3(cos(pitch)*sin(yaw),sin(pitch),cos(pitch)*cos(yaw));vec3 w=n.x*east+n.y*north+n.z*center;vec2 t=vec2(atan(w.x,w.z)/6.2831853+.5,asin(clamp(w.y,-1.,1.))/3.14159265+.5);vec3 color=texture2D(earth,t).rgb;float light=.86+.14*max(0.,dot(n,normalize(vec3(-.4,.55,1.))));color*=light;float edge=1.-smoothstep(.99,1.,r);gl_FragColor=vec4(color,edge);}`);
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    yawLoc = gl.getUniformLocation(prog, 'yaw'); pitchLoc = gl.getUniformLocation(prog, 'pitch');
    const tex = gl.createTexture(), earth = new Image();
    earth.onload = () => { gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, earth); gl.uniform1i(gl.getUniformLocation(prog, 'earth'), 0);
      canvas.dataset.ready = 'true'; ready = true; draw(); requestAnimationFrame(frame); };
    earth.onerror = fail; earth.src = 'assets/paper-earth.jpg';
  } catch (e) { fail(); }
  function draw() {
    if (!ready || fallback) return;
    const px = Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 2));
    if (px && canvas.width !== px) { canvas.width = px; canvas.height = px; gl.viewport(0, 0, px, px); }
    gl.uniform1f(yawLoc, m.yaw); gl.uniform1f(pitchLoc, m.pitch); gl.drawArrays(gl.TRIANGLES, 0, 6);
    canvas.dataset.longitude = (m.yaw / RAD).toFixed(1); canvas.dataset.rotating = String(m.spinning && !m.drag);
    PINS.forEach((p, i) => { const b = els[i], la = p.lat * RAD, lo = p.lon * RAD - m.yaw;
      const x = Math.cos(la) * Math.sin(lo), y = Math.sin(la) * Math.cos(m.pitch) - Math.cos(la) * Math.cos(lo) * Math.sin(m.pitch);
      b.hidden = Math.sin(la) * Math.sin(m.pitch) + Math.cos(la) * Math.cos(lo) * Math.cos(m.pitch) < .12;
      b.style.left = 50 + x / 1.15 * 50 + '%'; b.style.top = 50 - y / 1.15 * 50 + '%'; });
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (!visible || document.hidden) return;             // homepage addition: rest while off-screen or in a hidden tab
    if (m.spinning && !m.drag && !reduced.matches) m.targetYaw += dt * .055;
    const k = reduced.matches ? 1 : .1;
    m.yaw += (m.targetYaw - m.yaw) * k; m.pitch += (m.targetPitch - m.pitch) * k; draw();
  }
  stage.addEventListener('focusin', () => { m.spinning = false; });
  stage.addEventListener('pointerdown', e => { m.spinning = false; if (e.target.closest('button')) return; m.drag = true; m.lastX = e.clientX; m.lastY = e.clientY; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => { if (!m.drag) return; m.targetYaw -= (e.clientX - m.lastX) * .009; m.targetPitch = Math.max(-1.1, Math.min(1.1, m.targetPitch + (e.clientY - m.lastY) * .006)); m.lastX = e.clientX; m.lastY = e.clientY; });
  stage.addEventListener('pointerup', () => { m.drag = false; }); stage.addEventListener('pointercancel', () => { m.drag = false; });
  canvas.addEventListener('keydown', e => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', ' '].includes(e.key)) return; e.preventDefault(); const was = m.spinning; m.spinning = false;
    if (e.key === 'Home') turnTo(PINS[current]); else if (e.key === ' ') m.spinning = !was; else if (e.key === 'ArrowLeft') m.targetYaw -= .18; else if (e.key === 'ArrowRight') m.targetYaw += .18;
    else m.targetPitch = Math.max(-1.1, Math.min(1.1, m.targetPitch + (e.key === 'ArrowUp' ? .12 : -.12))); });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; last = 0; }).observe(stage);
  renderPins();
  return {
    set(o) { if ('lang' in o) { lang = o.lang === 'en' ? 1 : 0; canvas.setAttribute('aria-label', ['Globo de papel interactivo. Flechas para girar, espacio para pausar.', 'Interactive paper globe. Arrow keys rotate, space pauses.'][lang]); }
      if ('collected' in o) collected = o.collected;
      if ('current' in o && o.current !== current) { current = o.current; m.spinning = false; turnTo(PINS[current]); }
      renderPins(); draw(); },
    onPick(f) { pick = f; }, get lon() { return m.yaw / RAD; }, get spinning() { return m.spinning; }, state: m,
  };
})();
