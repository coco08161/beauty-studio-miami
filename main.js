/* Beauty Studio Miami — interactions and motion
   Motion is built on GSAP + ScrollTrigger. Effects are modeled on
   Skiper UI (words preloader, text-roll nav, card stack scroll, text scroll
   reveal, expand-on-hover) and Componentry (scroll-velocity marquee,
   magnetic buttons, animated gradient background). */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var hasGsap = !!(gsap && ST);
  if (!hasGsap || reduce) root.classList.remove("anim");

  /* ---------- Header: solid on scroll, hides on scroll down ---------- */
  var header = document.querySelector(".site-header");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("scrolled", y > 40);
      var hide = y > 300 && y > lastY && !document.body.classList.contains("menu-open");
      header.classList.toggle("hide", hide);
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector("b").textContent = open ? "Close" : "Menu";
    var mm = document.querySelector(".mobile-menu");
    if (mm) mm.setAttribute("aria-hidden", String(!open));
    if (open && hasGsap && !reduce) {
      gsap.fromTo(".mobile-menu nav a", { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .8, stagger: .07, ease: "power3.out", delay: .15 });
    }
  }
  if (toggle) {
    toggle.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("menu-open")) { setMenu(false); toggle.focus(); } });
  }

  /* ---------- Hero video: respect reduced motion, offer pause ---------- */
  document.querySelectorAll(".hero-video video").forEach(function (v) {
    var btn = document.querySelector(".video-toggle");
    var pauseIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor"/></svg>';
    var playIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="currentColor"/></svg>';
    function sync() {
      if (!btn) return;
      btn.innerHTML = v.paused ? playIcon : pauseIcon;
      btn.setAttribute("aria-label", v.paused ? "Play background video" : "Pause background video");
    }
    if (reduce) { v.removeAttribute("autoplay"); v.pause(); }
    else { var p = v.play(); if (p && p.catch) p.catch(function () { sync(); }); }
    v.addEventListener("play", sync); v.addEventListener("pause", sync);
    if (btn) btn.addEventListener("click", function () { if (v.paused) v.play(); else v.pause(); });
    sync();
  });

  /* ---------- Spotlight origin for value cards ---------- */
  document.querySelectorAll(".value").forEach(function (card) {
    card.addEventListener("pointerenter", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Rent form (FormSubmit, sent in the background) ----------
     Safety: no double sends, loading state, 12 s timeout, error fallback
     that keeps what the visitor typed, honeypot, inline success message.
     Without JS the form still posts normally and lands on thank-you.html. */
  var form = document.getElementById("suite-form");
  if (form) {
    var next = form.querySelector('input[name="_next"]');
    if (next) next.value = new URL("thank-you.html", window.location.href).href;
    var status = form.querySelector(".form-status");
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn.querySelector("span");
    var success = document.getElementById("suite-success");
    var sending = false;
    var fallback = 'Something went wrong sending your request. Please try again, or call <a href="tel:+17865362111">786.536.2111</a>.';

    function done() {
      form.hidden = true;
      if (success) { success.hidden = false; success.focus({ preventScroll: true }); success.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;
      var first = null;
      form.querySelectorAll("[required]").forEach(function (el) {
        var ok = el.value.trim() !== "" && el.checkValidity();
        el.closest(".field").classList.toggle("invalid", !ok);
        if (!ok && !first) first = el;
      });
      if (first) { first.focus(); status.textContent = "Please fill in the highlighted fields."; return; }
      if (/YOUR-EMAIL/.test(form.action)) { status.textContent = "Online requests open soon. For now, please call 786.536.2111."; return; }
      if (form.querySelector('[name="_honey"]').value) { done(); return; } // bots: pretend it worked

      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== "_next") data[k] = typeof v === "string" ? v.trim() : v; });

      sending = true; btn.disabled = true; btnLabel.textContent = "Sending…"; status.textContent = "";
      var ctrl = "AbortController" in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);

      fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json().catch(function () { return {}; });
      }).then(function (json) {
        if (json && (json.success === false || json.success === "false")) throw new Error(json.message || "Not sent");
        done();
      }).catch(function () {
        status.innerHTML = fallback;
        sending = false; btn.disabled = false; btnLabel.textContent = "Try again";
      }).then(function () { clearTimeout(timer); });
    });
    form.addEventListener("input", function (e) {
      var f = e.target.closest(".field");
      if (f && f.classList.contains("invalid") && e.target.value.trim() && e.target.checkValidity()) f.classList.remove("invalid");
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Animated gradient background (WebGL) ---------- */
  document.querySelectorAll("canvas.gradient").forEach(function (canvas) {
    var gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!gl) { canvas.remove(); return; }
    var vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    var fs = [
      "precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;",
      "vec3 c1=vec3(.976,.867,.816);vec3 c2=vec3(.937,.490,.353);vec3 c3=vec3(.941,.345,.173);vec3 c4=vec3(.984,.973,.957);",
      "float n(vec2 p){return sin(p.x)*sin(p.y);}",
      "void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*vec2(r.x/r.y,1.)*1.6;",
      "float a=n(q*1.3+vec2(t*.18,t*.11))+.5*n(q*2.7-vec2(t*.13,-t*.2))+.25*n(q*5.1+t*.07);",
      "a+=.6*length(uv-m)*-.6;",
      "float b=n(q.yx*1.7+vec2(-t*.12,t*.16)+a);",
      "vec3 col=mix(c1,c2,smoothstep(-.9,.9,a));col=mix(col,c3,smoothstep(.35,1.2,b)*.55);col=mix(col,c4,smoothstep(.6,1.3,-a)*.5);",
      "float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);col+=(g-.5)*.035;",
      "gl_FragColor=vec4(col,1.);}"
    ].join("");
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(prog, "r"), uT = gl.getUniformLocation(prog, "t"), uM = gl.getUniformLocation(prog, "m");
    var mouse = [.5, .5], target = [.5, .5], visible = true, start = performance.now();
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(canvas.clientWidth * dpr * .6);
      canvas.height = Math.round(canvas.clientHeight * dpr * .6);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function frame(now) {
      if (!visible) return;
      mouse[0] += (target[0] - mouse[0]) * .05; mouse[1] += (target[1] - mouse[1]) * .05;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, reduce ? 4 : (now - start) / 1000);
      gl.uniform2f(uM, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduce) requestAnimationFrame(frame);
    }
    size();
    window.addEventListener("resize", function () { size(); if (reduce) frame(performance.now()); });
    canvas.parentNode.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      target = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        var was = visible; visible = en[0].isIntersecting;
        if (visible && !was) requestAnimationFrame(frame);
      }).observe(canvas);
    }
    requestAnimationFrame(frame);
  });

  /* ---------- Everything below needs GSAP ---------- */
  function endPreload() { root.classList.remove("preload"); try { sessionStorage.setItem("bsm-intro", "1"); } catch (e) {} }
  if (!hasGsap || reduce) { endPreload(); return; }
  gsap.registerPlugin(ST);

  /* Scroll progress bar */
  var bar = document.querySelector(".progress");
  if (bar) gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

  /* Hero intro */
  function heroIn() {
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    var vid = document.querySelector(".hero-video");
    if (vid) tl.fromTo(vid, { scale: 1.18 }, { scale: 1, duration: 2.2 }, 0);
    var lines = document.querySelectorAll(".hero h1 .line > span");
    if (lines.length) tl.to(lines, { y: 0, duration: 1.4, stagger: .12 }, .2);
    var bits = document.querySelectorAll(".hero [data-reveal]");
    if (bits.length) tl.fromTo(bits, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: .1 }, .55);
  }

  /* Words preloader, once per visit */
  if (root.classList.contains("preload")) {
    var pre = document.querySelector(".preloader");
    var word = pre && pre.querySelector(".word span");
    var words = ["Your Beauty.", "Your Style.", "Your Studio."];
    if (!pre || !word) { endPreload(); heroIn(); }
    else {
      var ptl = gsap.timeline({ onComplete: function () { endPreload(); } });
      words.forEach(function (w, i) {
        ptl.call(function () { word.textContent = w; });
        ptl.fromTo(pre.querySelector(".word"), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .45, ease: "power3.out" });
        ptl.to(pre.querySelector(".word"), { yPercent: -40, opacity: 0, duration: .35, ease: "power3.in" }, "+=.25");
      });
      ptl.to(pre, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" });
      ptl.add(heroIn, "-=.6");
      // Safety: if frames are throttled (background tab), don't trap the visitor behind the intro.
      setTimeout(function () { if (root.classList.contains("preload")) ptl.progress(1); }, 6000);
    }
  } else {
    heroIn();
  }

  /* Scroll reveals */
  var rest = gsap.utils.toArray("[data-reveal]").filter(function (el) { return !el.closest(".hero"); });
  gsap.set(rest, { y: 50, opacity: 0 });
  ST.batch(rest, {
    start: "top 88%", once: true,
    onEnter: function (b) { gsap.to(b, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: .1, overwrite: true }); }
  });

  /* Clip-path image reveals */
  gsap.utils.toArray("[data-clip]").forEach(function (el) {
    var img = el.querySelector("img") || el;
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top 82%", once: true } })
      .to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "expo.inOut" })
      .from(img, { scale: 1.3, duration: 1.8, ease: "expo.out" }, "<.1");
  });

  /* Text scroll highlight: split statement into words */
  document.querySelectorAll(".statement").forEach(function (el) {
    function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) split(child);
      });
    }
    split(el);
    gsap.to(el.querySelectorAll(".w"), {
      opacity: 1, stagger: .08, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: .6 }
    });
  });

  /* Scroll-velocity marquee */
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    var x = 0, dir = -1, base = 0.6, boost = 0;
    var half = track.scrollWidth / 2;
    window.addEventListener("resize", function () { half = track.scrollWidth / 2; });
    ST.create({
      trigger: track, start: "top bottom", end: "bottom top",
      onUpdate: function (self) {
        var v = self.getVelocity();
        dir = v < 0 ? 1 : -1;
        boost = Math.min(Math.abs(v) / 120, 14);
      }
    });
    gsap.ticker.add(function () {
      boost *= 0.94;
      x += dir * (base + boost);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = "translate3d(" + x + "px,0,0)";
    });
  });

  /* Card stack: earlier cards shrink and dim as the next one covers them */
  var cards = gsap.utils.toArray(".s-card");
  if (cards.length && window.matchMedia("(min-width: 901px)").matches) {
    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return;
      gsap.to(card, {
        scale: .92, filter: "brightness(.85)", ease: "none",
        scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 110px", scrub: true }
      });
    });
  }

  /* Line-art drift inside service cards */
  gsap.utils.toArray(".line-art").forEach(function (el) {
    gsap.fromTo(el, { y: 40, rotate: -6 }, { y: -40, rotate: 6, ease: "none", scrollTrigger: { trigger: el.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* Big title parallax */
  gsap.utils.toArray("[data-drift]").forEach(function (el) {
    gsap.fromTo(el, { xPercent: parseFloat(el.dataset.drift) }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "center 40%", scrub: .8 } });
  });

  /* Magnetic buttons */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var xTo = gsap.quickTo(el, "x", { duration: .7, ease: "elastic.out(1, .4)" });
      var yTo = gsap.quickTo(el, "y", { duration: .7, ease: "elastic.out(1, .4)" });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .35);
        yTo((e.clientY - r.top - r.height / 2) * .45);
      });
      el.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }

  window.addEventListener("load", function () { ST.refresh(); });
})();
