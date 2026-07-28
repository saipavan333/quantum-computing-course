/* hero.js — the landing-page WebGL hero (playbook §3, §5.6): a quantum-native
   "Superposition Bloch Field". A wireframe Bloch sphere with a precessing,
   glowing state-vector and a fading trail, floating over a full-hero
   domain-warped GLSL interference field (violet -> cyan -> teal on near-black,
   never white). Cursor parallax. Three.js is vendored locally and lazy-loaded
   only on the home view, so lesson pages never pay for it. If WebGL is
   unavailable OR the visitor prefers reduced motion, a calm CSS aurora hero is
   shown instead — no animation, no dependency. Registered as a QCC feature. */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var THREE_URL = "assets/vendor/three.min.js";
  var threePromise = null;
  var instance = null; // current live hero (so we can dispose on re-render / nav-away)

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

  /* ---------- calm fallback: CSS aurora hero (no JS animation) ---------- */
  function auroraFallback(hero) {
    hero.classList.add("hero--aurora");
  }

  /* ---------- the WebGL scene ---------- */
  var BG_FRAG = [
    "precision highp float;",
    "uniform float uTime; uniform vec2 uRes; uniform vec2 uMouse;",
    "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
    "float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);",
    " float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));",
    " return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}",
    "float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=0.5;}return v;}",
    "void main(){",
    " vec2 uv=gl_FragCoord.xy/uRes.xy;",
    " vec2 p=(gl_FragCoord.xy-0.5*uRes.xy)/uRes.y;",
    " p+=uMouse*0.12;",
    " float t=uTime*0.05;",
    " vec2 q=vec2(fbm(p*1.6+t),fbm(p*1.6-t+5.2));",
    " float f=fbm(p*2.2+q*1.6+vec2(t*0.7,0.0));",
    " float rings=0.5+0.5*sin(length(p)*9.0-uTime*0.7+f*4.0);",
    " vec3 base=vec3(0.035,0.047,0.070);",
    " vec3 violet=vec3(0.486,0.361,1.0);",
    " vec3 cyan=vec3(0.133,0.827,0.933);",
    " vec3 teal=vec3(0.204,0.827,0.6);",
    " vec3 col=base;",
    " col=mix(col,violet,smoothstep(0.30,0.95,f)*0.55);",
    " col=mix(col,cyan,rings*0.32);",
    " col=mix(col,teal,smoothstep(0.62,1.0,q.x)*0.22);",
    " float vig=smoothstep(1.25,0.15,length(uv-0.5));",
    " col*=0.55+0.45*vig;",
    " gl_FragColor=vec4(col,1.0);",
    "}"
  ].join("\n");

  var BG_VERT = "void main(){gl_Position=vec4(position.xy,0.0,1.0);}";

  function initWebGL(THREE, hero) {
    var canvas = document.createElement("canvas");
    canvas.className = "hero-canvas"; canvas.setAttribute("aria-hidden", "true");
    var scrim = document.createElement("div"); scrim.className = "hero-scrim"; scrim.setAttribute("aria-hidden", "true");
    hero.insertBefore(scrim, hero.firstChild);
    hero.insertBefore(canvas, hero.firstChild);
    hero.classList.add("hero--webgl");

    var W = hero.clientWidth || 800, H = hero.clientHeight || 360;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { hero.classList.remove("hero--webgl"); canvas.remove(); scrim.remove(); auroraFallback(hero); return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(W, H, false);
    renderer.autoClear = false;

    /* background flow-field pass (orthographic full-hero quad) */
    var bgScene = new THREE.Scene();
    var bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var bgUniforms = {
      uTime: { value: 0 }, uRes: { value: new THREE.Vector2(W, H) }, uMouse: { value: new THREE.Vector2(0, 0) }
    };
    var bgMat = new THREE.ShaderMaterial({ vertexShader: BG_VERT, fragmentShader: BG_FRAG, uniforms: bgUniforms, depthTest: false, depthWrite: false });
    var bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
    bgScene.add(bgMesh);

    /* foreground: Bloch sphere group */
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
    camera.position.set(0, 0, 4.3);
    var group = new THREE.Group(); scene.add(group);

    var R = 1.18;
    var C_CYAN = 0x22d3ee, C_VIOLET = 0x7c5cff, C_TEAL = 0x34d399, C_GOLD = 0xfbbf24;

    var wire = new THREE.Mesh(
      new THREE.SphereGeometry(R, 26, 18),
      new THREE.MeshBasicMaterial({ color: C_CYAN, wireframe: true, transparent: true, opacity: 0.13 })
    );
    group.add(wire);
    var glow = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.03, 32, 24),
      new THREE.MeshBasicMaterial({ color: C_VIOLET, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, side: THREE.BackSide })
    );
    group.add(glow);

    function ring(radius, tube, color, op, rotX, rotY) {
      var m = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 96),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: op }));
      m.rotation.x = rotX || 0; m.rotation.y = rotY || 0; group.add(m); return m;
    }
    ring(R, 0.006, C_CYAN, 0.55, Math.PI / 2, 0);            // equator
    ring(R, 0.004, C_VIOLET, 0.35, 0, 0);                    // meridian
    ring(R, 0.004, C_VIOLET, 0.35, 0, Math.PI / 2);          // meridian

    function pole(y, color) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16),
        new THREE.MeshBasicMaterial({ color: color }));
      m.position.set(0, y, 0); group.add(m); return m;
    }
    pole(R, C_CYAN); pole(-R, C_VIOLET);   // |0> north, |1> south

    /* state vector (a cylinder from center to tip) + glowing tip */
    var vecGeo = new THREE.CylinderGeometry(0.014, 0.014, 1, 10);
    vecGeo.translate(0, 0.5, 0); // base at origin, grows along +Y
    var vec = new THREE.Mesh(vecGeo, new THREE.MeshBasicMaterial({ color: C_GOLD }));
    group.add(vec);
    var tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 18, 18),
      new THREE.MeshBasicMaterial({ color: C_GOLD }));
    group.add(tip);
    var tipGlow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 18),
      new THREE.MeshBasicMaterial({ color: C_GOLD, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending }));
    group.add(tipGlow);

    /* precession trail */
    var TRAIL = 160;
    var trailPos = new Float32Array(TRAIL * 3);
    var trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    var trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: C_TEAL, transparent: true, opacity: 0.5 }));
    group.add(trail);
    var trailCount = 0;

    var up = new THREE.Vector3(0, 1, 0), tmpDir = new THREE.Vector3(), tmpQuat = new THREE.Quaternion();

    /* interaction: cursor parallax */
    var mx = 0, my = 0, tmx = 0, tmy = 0;
    function onMove(e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      tmx = (px - 0.5) * 2; tmy = (py - 0.5) * 2;
    }
    hero.addEventListener("pointermove", onMove);

    /* size handling */
    var ro = null;
    function resize() {
      W = hero.clientWidth || 800; H = hero.clientHeight || 360;
      renderer.setSize(W, H, false);
      bgUniforms.uRes.value.set(W * renderer.getPixelRatio(), H * renderer.getPixelRatio());
      camera.aspect = W / H; camera.updateProjectionMatrix();
    }
    if ("ResizeObserver" in window) { ro = new ResizeObserver(resize); ro.observe(hero); }
    else window.addEventListener("resize", resize);
    resize();

    /* pause when off-screen or tab hidden */
    var visible = true, io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; start(); }, { threshold: 0.01 });
      io.observe(hero);
    }
    function onVis() { start(); }
    document.addEventListener("visibilitychange", onVis);

    var raf = 0, t0 = performance.now(), active = false;
    function frame() {
      raf = 0;
      if (!visible || document.hidden) { active = false; return; }
      var t = (performance.now() - t0) / 1000;
      bgUniforms.uTime.value = t;
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;   // ease cursor
      bgUniforms.uMouse.value.set(mx, -my);
      group.rotation.y = t * 0.12 + mx * 0.5;
      group.rotation.x = -0.12 + my * 0.35;

      // precessing state vector: polar angle wobbles, azimuth advances
      var theta = 0.85 + 0.28 * Math.sin(t * 0.35), phi = t * 0.9;
      tmpDir.set(Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi));
      var tipPos = tmpDir.clone().multiplyScalar(R);
      tip.position.copy(tipPos); tipGlow.position.copy(tipPos);
      vec.scale.set(1, tipPos.length(), 1);
      tmpQuat.setFromUnitVectors(up, tmpDir.clone().normalize());
      vec.quaternion.copy(tmpQuat);

      // precession trail (rolling buffer)
      if (trailCount < TRAIL) trailCount++;
      for (var i = trailCount - 1; i > 0; i--) {
        trailPos[i * 3] = trailPos[(i - 1) * 3];
        trailPos[i * 3 + 1] = trailPos[(i - 1) * 3 + 1];
        trailPos[i * 3 + 2] = trailPos[(i - 1) * 3 + 2];
      }
      trailPos[0] = tipPos.x; trailPos[1] = tipPos.y; trailPos[2] = tipPos.z;
      trailGeo.setDrawRange(0, trailCount);
      trailGeo.attributes.position.needsUpdate = true;

      renderer.clear();
      renderer.render(bgScene, bgCam);
      renderer.clearDepth();
      renderer.render(scene, camera);

      raf = requestAnimationFrame(frame);
    }
    function start() { if (active || !visible || document.hidden) return; active = true; raf = requestAnimationFrame(frame); }

    start();

    return {
      dispose: function () {
        if (raf) cancelAnimationFrame(raf); raf = 0; active = false;
        hero.removeEventListener("pointermove", onMove);
        document.removeEventListener("visibilitychange", onVis);
        if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
        if (io) io.disconnect();
        try {
          trailGeo.dispose(); vecGeo.dispose(); bgMat.dispose(); bgMesh.geometry.dispose();
          wire.geometry.dispose(); wire.material.dispose(); glow.geometry.dispose(); glow.material.dispose();
          renderer.dispose();
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
      // the home view may have been navigated away from while three loaded
      if (!document.body.contains(hero)) return;
      instance = initWebGL(THREE, hero);
    }).catch(function () { auroraFallback(hero); });
  }

  QCC.onRender(function (root, ctx) {
    if (ctx && ctx.view === "home") {
      var hero = root.querySelector(".hero");
      if (hero) mountHero(hero);
    } else if (instance) {
      instance.dispose(); instance = null;
    }
  });
});
