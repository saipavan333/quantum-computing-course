/* hero.js — the landing-page WebGL hero (playbook §3, §5.6; built with the
   Wondersmith method). Concept: "The Double Slit" — a single-pass GLSL field of
   LIVING INTERFERENCE: sharp luminous fringes from coherent wave sources (real
   superposition -> |ψ|²), oil-slick violet/cyan/teal color driven by the
   interference amplitude, on near-black, never white. The visitor is the
   engine: the cursor is a third wave source that warps the pattern, and a click
   fires a MEASUREMENT — the fringes resolve into discrete detection specks
   (wave-particle duality) then flow back to waves. Weighted right so the
   headline stays clean. Three.js is vendored locally and lazy-loaded only on
   the home view; a calm CSS aurora hero is shown instead when WebGL is
   unavailable or motion is reduced. The shader was tuned via a CPU port whose
   renders were visually critiqued (Wondersmith gauntlet). */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var THREE_URL = "assets/vendor/three.min.js";
  var threePromise = null;
  var instance = null;

  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threePromise) return threePromise;
    threePromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = THREE_URL; s.async = true;
      s.onload = function () { window.THREE ? resolve(window.THREE) : reject(new Error("THREE missing")); };
      s.onerror = function () { reject(new Error("three.min.js failed to load")); };
      document.head.appendChild(s);
    });
    return threePromise;
  }

  function webglOK() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  function auroraFallback(hero) { hero.classList.add("hero--aurora"); }

  /* ---------- the raymarch ---------- */
  var VERT = "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }";

  /* "Living double-slit interference": sharp luminous fringes from coherent
     sources (real wave superposition -> |psi|^2), oil-slick chromatic hue driven
     by the interference amplitude, a radial envelope + left-mask so the bloom
     sits right-of-center and the headline stays clean, the cursor as a movable
     third source, and a measurement pulse that resolves the fringes into
     discrete detection specks (wave-particle duality). Tuned via a CPU port. */
  var FRAG = [
    "precision highp float;",
    "uniform float uTime; uniform vec2 uRes; uniform vec2 uMouse; uniform float uPulse;",
    // violet #7c5cff, cyan #22d3ee, teal #34d399 — never white
    "vec3 pal(float t){ vec3 v=vec3(0.486,0.361,1.0), c=vec3(0.133,0.827,0.933), tl=vec3(0.204,0.827,0.6);",
    "  t=clamp(t,0.0,1.0); return t<0.5 ? mix(v,c,t*2.0) : mix(c,tl,(t-0.5)*2.0); }",
    "float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }",
    "void main(){",
    "  vec2 uv=(gl_FragCoord.xy-0.5*uRes)/uRes.y;",
    "  float t=uTime;",
    "  vec2 s1=vec2(0.40, 0.16), s2=vec2(0.40,-0.16);",           // the two slits
    "  vec2 s3=vec2(uMouse.x*(0.5*uRes.x/uRes.y)*0.9, uMouse.y*0.5);", // cursor source
    "  float d1=length(uv-s1), d2=length(uv-s2), d3=length(uv-s3);",
    "  float k=46.0, w=2.4;",
    "  float A=(cos(k*d1-w*t)+cos(k*d2-w*t)+0.85*cos(k*d3-w*t))/2.85;", // superposition
    "  float I=pow(A*A, 1.5);",                                    // |psi|^2 -> fringes
    "  float sharpNow=1.0+uPulse*2.6;",
    "  I=pow(I, sharpNow)*2.25*(1.0+uPulse*2.0);",
    "  if(uPulse>0.01){",                                          // measurement -> detection specks
    "    float sp=hash(vec2(floor(uv.x*230.0), floor(uv.y*230.0)));",
    "    float hit=smoothstep(0.72,0.98,I)*step(0.78,sp)*uPulse; I+=hit*2.2;",
    "  }",
    "  float dc=length(uv-vec2(0.40,0.0));",
    "  float env=exp(-pow(dc/0.66,2.0));",
    "  float val=(I + pow(I,2.4)*1.15)*env;",                      // bloom the maxima
    "  float leftMask=smoothstep(-0.52,0.12,uv.x);",               // dark on the left (text side)
    "  val*=leftMask;",
    "  float hue=0.5 + 0.46*sin(A*3.14159 + dc*1.1 + t*0.22) + 0.10*sin(uv.x*2.2 - t*0.15);",
    "  vec3 col=pal(hue)*val;",
    "  float sg=(exp(-pow(d1/0.028,2.0))+exp(-pow(d2/0.028,2.0)))*0.9*leftMask;", // slit anchors
    "  col+=pal(0.7)*sg;",
    "  float bg=exp(-pow(dc/0.42,2.0))*0.28*leftMask;",            // luminance floor
    "  col+=pal(0.55)*bg;",
    "  col=col/(1.0+col); col=pow(col,vec3(0.82));",               // tonemap
    "  col+=(hash(gl_FragCoord.xy*0.5+t)-0.5)*0.025;",             // grain
    "  float vig=smoothstep(1.35,0.28,length(uv)); col*=0.42+0.58*vig;",
    "  gl_FragColor=vec4(max(col,0.0),1.0);",
    "}"
  ].join("\n");

  function initWebGL(THREE, hero) {
    var canvas = document.createElement("canvas");
    canvas.className = "hero-canvas"; canvas.setAttribute("aria-hidden", "true");
    var scrim = document.createElement("div"); scrim.className = "hero-scrim"; scrim.setAttribute("aria-hidden", "true");
    hero.insertBefore(scrim, hero.firstChild);
    hero.insertBefore(canvas, hero.firstChild);
    hero.classList.add("hero--webgl");

    var W = hero.clientWidth || 800, H = hero.clientHeight || 380;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false }); }
    catch (e) { hero.classList.remove("hero--webgl"); canvas.remove(); scrim.remove(); auroraFallback(hero); return null; }
    var PR = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(PR);
    renderer.setSize(W, H, false);

    var scene = new THREE.Scene();
    var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var uniforms = {
      uTime: { value: 30.0 },                          // pre-warm so the first frame is already alive
      uRes: { value: new THREE.Vector2(W * PR, H * PR) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPulse: { value: 0 }
    };
    var mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uniforms, depthTest: false, depthWrite: false });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(mesh);

    /* interaction — the visitor is the engine */
    var tmx = 0, tmy = 0, mx = 0, my = 0, pulse = 0;
    function onMove(e) {
      var r = hero.getBoundingClientRect();
      tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    function collapse() { pulse = 1; }   // fire a measurement
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerdown", collapse);

    var ro = null;
    function resize() {
      W = hero.clientWidth || 800; H = hero.clientHeight || 380;
      renderer.setSize(W, H, false);
      uniforms.uRes.value.set(W * PR, H * PR);
    }
    if ("ResizeObserver" in window) { ro = new ResizeObserver(resize); ro.observe(hero); }
    else window.addEventListener("resize", resize);
    resize();

    var visible = true, io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; start(); }, { threshold: 0.01 });
      io.observe(hero);
    }
    function onVis() { start(); }
    document.addEventListener("visibilitychange", onVis);

    var raf = 0, t0 = performance.now(), active = false, lastPulse = t0;
    function frame() {
      raf = 0;
      if (!visible || document.hidden) { active = false; return; }
      var now = performance.now(), t = 30 + (now - t0) / 1000;
      // auto-fire a gentle measurement every ~9s so the piece breathes on its own
      if (now - lastPulse > 9000) { pulse = Math.max(pulse, 0.85); lastPulse = now; }
      mx += (tmx - mx) * 0.045; my += (tmy - my) * 0.045;
      pulse *= 0.955; if (pulse < 0.003) pulse = 0;
      uniforms.uTime.value = t;
      uniforms.uMouse.value.set(mx, -my);
      uniforms.uPulse.value = pulse;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (active || !visible || document.hidden) return; active = true; raf = requestAnimationFrame(frame); }
    start();

    return {
      dispose: function () {
        if (raf) cancelAnimationFrame(raf); raf = 0; active = false;
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerdown", collapse);
        document.removeEventListener("visibilitychange", onVis);
        if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
        if (io) io.disconnect();
        try {
          mesh.geometry.dispose(); mat.dispose(); renderer.dispose();
          var gl = renderer.getContext && renderer.getContext();
          var lose = gl && gl.getExtension && gl.getExtension("WEBGL_lose_context");
          if (lose) lose.loseContext();
        } catch (e) {}
        canvas.remove(); scrim.remove();
        hero.classList.remove("hero--webgl");
      }
    };
  }

  function mountHero(hero) {
    if (instance) { instance.dispose(); instance = null; }
    if (reduce || !webglOK()) { auroraFallback(hero); return; }
    loadThree().then(function (THREE) {
      if (!document.body.contains(hero)) return;
      instance = initWebGL(THREE, hero);
    }).catch(function () { auroraFallback(hero); });
  }

  QCC.onRender(function (root, ctx) {
    if (ctx && ctx.view === "home") {
      var hero = root.querySelector(".hero");
      if (hero) mountHero(hero);
    } else if (instance) { instance.dispose(); instance = null; }
  });
});
