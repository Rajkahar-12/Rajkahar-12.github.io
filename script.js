/* ==========================================================
   RAJ KAHAR — MOTION + UI
   ========================================================== */

// Mark JS-enabled early so reveal CSS applies safely
document.documentElement.classList.add("js");

// Ink background is intentionally disabled to remove the "live" bg.
const ENABLE_INK_BG = false;

const hasAnime = typeof anime !== "undefined";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- PRELOADER ---------------- */
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  const fill = document.querySelector(".loader-fill");

  const finish = () => {
    if (preloader) preloader.classList.add("hidden");
  };

  if (fill && hasAnime) {
    anime({
      targets: fill,
      width: "100%",
      duration: 800,
      easing: "easeInOutQuad",
      complete: finish
    });
  } else {
    if (fill) fill.style.width = "100%";
    setTimeout(finish, 300);
  }
});

// Safety: never leave preloader stuck
setTimeout(() => {
  const p = document.getElementById("preloader");
  if (p && !p.classList.contains("hidden")) p.classList.add("hidden");
}, 4000);

/* ---------------- DOM READY ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  /* -- Theme toggle -- */
  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    const syncPressed = () => {
      themeToggle.setAttribute(
        "aria-pressed",
        document.documentElement.getAttribute("data-theme") === "dark"
      );
    };
    syncPressed();
    themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncPressed();
    });
  }

  /* -- Mobile menu -- */
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  if (menuButton && navigation) {
    const closeMenu = () => {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    };
    menuButton.addEventListener("click", () => {
      const open = navigation.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    navigation.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* -- Bell button (Kokonut UI vanilla port) -- */
  document.querySelectorAll(".bell-button").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.remove("is-ringing");
      void btn.offsetWidth; // restart animation
      btn.classList.add("is-ringing");
      const dot = btn.querySelector(".bell-dot");
      if (dot) dot.classList.add("is-hidden");
      setTimeout(() => btn.classList.remove("is-ringing"), 1200);
    });
  });

  /* -- Magnetic buttons (guarded) -- */
  if (hasAnime && !prefersReducedMotion) {
    document.querySelectorAll(".magnetic").forEach(el => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        anime({
          targets: el,
          translateX: x * 0.28,
          translateY: y * 0.28,
          duration: 300,
          easing: "easeOutCubic"
        });
      });
      el.addEventListener("mouseleave", () => {
        anime({
          targets: el,
          translateX: 0,
          translateY: 0,
          duration: 600,
          easing: "easeOutElastic(1, .5)"
        });
      });
    });
  }

  /* -- Tilt cards + spotlight -- */
  document.querySelectorAll(".tilt-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);

      if (!hasAnime || prefersReducedMotion) return;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
      anime({
        targets: card,
        rotateX, rotateY, scale: 1.02,
        duration: 400,
        easing: "easeOutCubic",
        begin: () => { card.style.zIndex = 10; }
      });
    });
    card.addEventListener("mouseleave", () => {
      if (!hasAnime || prefersReducedMotion) return;
      anime({
        targets: card,
        rotateX: 0, rotateY: 0, scale: 1,
        duration: 700,
        easing: "easeOutElastic(1, .6)",
        complete: () => { card.style.zIndex = 1; }
      });
    });
  });

  /* -- Scroll reveal (CSS + IntersectionObserver) -- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-visible"));
  }

  /* -- Ink background (disabled) -- */
  if (ENABLE_INK_BG) {
    const canvas = document.getElementById("ink-canvas");
    if (canvas) {
      new InkBackgroundVanilla(canvas, {
        accent: "#790B13",
        interactive: true
      });
    }
  }
});

/* ==========================================================
   KOKONUT UI INK BACKGROUND (kept, but unused)
   ========================================================== */
class InkBackgroundVanilla {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2", { alpha: true, depth: false, stencil: false, antialias: false });
    if (!this.gl) return;
    this.accent = options.accent || "#790B13";
    this.interactive = options.interactive !== false;
    this.SIM_RES = 128;
    this.DYE_RES = 512;
    this.PRESSURE_ITERATIONS = 20;
    this.DYE_FADE = 0.35;
    this.VELOCITY_FADE = 1.2;
    this.CURL = 22;
    this.STIR_FORCE = 5200;
    this.STIR_RADIUS = 0.0018;
    this.pointers = [];
    this.splatStack = [];
    this.lastInteractionTime = Date.now();
    this.isSleeping = false;
    this.initShaders();
    this.initFramebuffers();
    this.bindEvents();
    this.resize();
    for (let i = 0; i < 8; i++) {
      this.splatStack.push({
        x: Math.random(), y: Math.random(),
        dx: (Math.random() - 0.5) * 1000,
        dy: (Math.random() - 0.5) * 1000,
        color: this.hexToRgb(this.accent)
      });
    }
    this.update();
  }
  initShaders() {
    const gl = this.gl;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
      return shader;
    };
    const vert = compile(gl.VERTEX_SHADER, this.getVertexShader());
    const createProgram = (fragSource) => {
      const frag = compile(gl.FRAGMENT_SHADER, fragSource);
      if (!frag) return null;
      const prog = gl.createProgram();
      gl.attachShader(prog, vert);
      gl.attachShader(prog, frag);
      gl.linkProgram(prog);
      return prog;
    };
    const shaders = this.getFragmentShaders();
    this.programs = {
      splat: createProgram(shaders.splat),
      advect: createProgram(shaders.advect),
      divergence: createProgram(shaders.divergence),
      curl: createProgram(shaders.curl),
      vorticity: createProgram(shaders.vorticity),
      pressure: createProgram(shaders.pressure),
      gradient: createProgram(shaders.gradient),
      display: createProgram(shaders.display),
    };
    this.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  }
  initFramebuffers() {
    const gl = this.gl;
    gl.getExtension("EXT_color_buffer_float");
    this.dye = this.createFBO(this.DYE_RES, this.DYE_RES);
    this.velocity = this.createFBO(this.SIM_RES, this.SIM_RES);
    this.divergence = this.createFBO(this.SIM_RES, this.SIM_RES);
    this.curl = this.createFBO(this.SIM_RES, this.SIM_RES);
    this.pressure = this.createFBO(this.SIM_RES, this.SIM_RES);
  }
  createFBO(w, h) {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture, fbo, width: w, height: h };
  }
  bindEvents() {
    if (!this.interactive) return;
    window.addEventListener("mousemove", (e) => {
      this.lastInteractionTime = Date.now();
      this.isSleeping = false;
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - e.clientY / window.innerHeight;
      if (this.pointers.length === 0) {
        this.pointers.push({ x, y, dx: 0, dy: 0, moved: false });
      } else {
        const p = this.pointers[0];
        p.dx = x - p.x; p.dy = y - p.y;
        p.x = x; p.y = y;
        p.moved = Math.abs(p.dx) > 0 || Math.abs(p.dy) > 0;
      }
    });
    window.addEventListener("resize", () => this.resize());
  }
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
  }
  update() {
    const gl = this.gl;
    const now = Date.now();
    if (now - this.lastInteractionTime > 5000) this.isSleeping = true;
    if (this.isSleeping && now - this.lastInteractionTime > 6000) {
      requestAnimationFrame(() => this.update());
      return;
    }
    this.pointers.forEach(p => {
      if (p.moved) {
        this.splatStack.push({ x: p.x, y: p.y, dx: p.dx * this.STIR_FORCE, dy: p.dy * this.STIR_FORCE, color: this.hexToRgb(this.accent) });
        p.moved = false;
      }
    });
    while (this.splatStack.length > 0) {
      const s = this.splatStack.pop();
      this.splat(s.x, s.y, s.dx, s.dy, s.color, this.STIR_RADIUS);
    }
    gl.viewport(0, 0, this.SIM_RES, this.SIM_RES);
    this.useProgram(this.programs.curl, this.curl);
    gl.uniform1i(gl.getUniformLocation(this.programs.curl, "uVelocity"), this.velocity.texture);
    this.blit(this.curl);
    this.useProgram(this.programs.vorticity, this.velocity);
    gl.uniform1i(gl.getUniformLocation(this.programs.vorticity, "uVelocity"), this.velocity.texture);
    gl.uniform1i(gl.getUniformLocation(this.programs.vorticity, "uCurl"), this.curl.texture);
    gl.uniform1f(gl.getUniformLocation(this.programs.vorticity, "curl"), this.CURL);
    gl.uniform1f(gl.getUniformLocation(this.programs.vorticity, "dt"), 0.016);
    this.blit(this.velocity);
    this.useProgram(this.programs.divergence, this.divergence);
    gl.uniform1i(gl.getUniformLocation(this.programs.divergence, "uVelocity"), this.velocity.texture);
    this.blit(this.divergence);
    this.useProgram(this.programs.pressure, this.pressure);
    gl.uniform1i(gl.getUniformLocation(this.programs.pressure, "uDivergence"), this.divergence.texture);
    this.blit(this.pressure);
    for (let i = 0; i < this.PRESSURE_ITERATIONS; i++) {
      this.useProgram(this.programs.pressure, this.pressure);
      gl.uniform1i(gl.getUniformLocation(this.programs.pressure, "uPressure"), this.pressure.texture);
      gl.uniform1i(gl.getUniformLocation(this.programs.pressure, "uDivergence"), this.divergence.texture);
      this.blit(this.pressure);
    }
    this.useProgram(this.programs.gradient, this.velocity);
    gl.uniform1i(gl.getUniformLocation(this.programs.gradient, "uPressure"), this.pressure.texture);
    gl.uniform1i(gl.getUniformLocation(this.programs.gradient, "uVelocity"), this.velocity.texture);
    this.blit(this.velocity);
    this.useProgram(this.programs.advect, this.velocity);
    gl.uniform1i(gl.getUniformLocation(this.programs.advect, "uVelocity"), this.velocity.texture);
    gl.uniform1i(gl.getUniformLocation(this.programs.advect, "uSource"), this.velocity.texture);
    gl.uniform2f(gl.getUniformLocation(this.programs.advect, "texel"), 1.0 / this.SIM_RES, 1.0 / this.SIM_RES);
    gl.uniform1f(gl.getUniformLocation(this.programs.advect, "dt"), 0.016);
    gl.uniform1f(gl.getUniformLocation(this.programs.advect, "dissipation"), this.VELOCITY_FADE);
    this.blit(this.velocity);
    gl.viewport(0, 0, this.DYE_RES, this.DYE_RES);
    this.useProgram(this.programs.advect, this.dye);
    gl.uniform1i(gl.getUniformLocation(this.programs.advect, "uVelocity"), this.velocity.texture);
    gl.uniform1i(gl.getUniformLocation(this.programs.advect, "uSource"), this.dye.texture);
    gl.uniform2f(gl.getUniformLocation(this.programs.advect, "texel"), 1.0 / this.DYE_RES, 1.0 / this.DYE_RES);
    gl.uniform1f(gl.getUniformLocation(this.programs.advect, "dt"), 0.016);
    gl.uniform1f(gl.getUniformLocation(this.programs.advect, "dissipation"), this.DYE_FADE);
    this.blit(this.dye);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.useProgram(this.programs.display);
    gl.uniform1i(gl.getUniformLocation(this.programs.display, "uTexture"), this.dye.texture);
    this.drawQuad();
    requestAnimationFrame(() => this.update());
  }
  splat(x, y, dx, dy, color, radius) {
    const gl = this.gl;
    this.useProgram(this.programs.splat, this.velocity);
    gl.uniform1i(gl.getUniformLocation(this.programs.splat, "uTarget"), this.velocity.texture);
    gl.uniform1f(gl.getUniformLocation(this.programs.splat, "aspect"), 1);
    gl.uniform3f(gl.getUniformLocation(this.programs.splat, "color"), dx, dy, 0);
    gl.uniform2f(gl.getUniformLocation(this.programs.splat, "point"), x, y);
    gl.uniform1f(gl.getUniformLocation(this.programs.splat, "radius"), radius);
    this.blit(this.velocity);
    gl.viewport(0, 0, this.DYE_RES, this.DYE_RES);
    this.useProgram(this.programs.splat, this.dye);
    gl.uniform1i(gl.getUniformLocation(this.programs.splat, "uTarget"), this.dye.texture);
    gl.uniform1f(gl.getUniformLocation(this.programs.splat, "aspect"), 1);
    gl.uniform3f(gl.getUniformLocation(this.programs.splat, "color"), color.r, color.g, color.b);
    gl.uniform2f(gl.getUniformLocation(this.programs.splat, "point"), x, y);
    gl.uniform1f(gl.getUniformLocation(this.programs.splat, "radius"), radius);
    this.blit(this.dye);
  }
  useProgram(prog, targetFBO = null) {
    const gl = this.gl;
    gl.useProgram(prog);
    if (targetFBO) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO.fbo);
      gl.viewport(0, 0, targetFBO.width, targetFBO.height);
    }
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  }
  blit(targetFBO) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, targetFBO.fbo);
    this.gl.viewport(0, 0, targetFBO.width, targetFBO.height);
    this.drawQuad();
  }
  drawQuad() { this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4); }
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 } : { r: 0.47, g: 0.04, b: 0.07 };
  }
  getVertexShader() {
    return `#version 300 es
    in vec2 aPos;
    out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
    uniform vec2 texel;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      vL = vUv - vec2(texel.x, 0.0);
      vR = vUv + vec2(texel.x, 0.0);
      vT = vUv + vec2(0.0, texel.y);
      vB = vUv - vec2(0.0, texel.y);
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`;
  }
  getFragmentShaders() {
    const HEAD = `#version 300 es
    precision highp float; precision highp sampler2D;
    in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
    out vec4 o;`;
    return {
      splat: `${HEAD} uniform sampler2D uTarget; uniform float aspect; uniform vec3 color; uniform vec2 point; uniform float radius; void main() { vec2 p = vUv - point; p.x *= aspect; vec3 s = exp(-dot(p, p) / radius) * color; o = vec4(texture(uTarget, vUv).xyz + s, 1.0); }`,
      advect: `${HEAD} uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texel; uniform float dt; uniform float dissipation; void main() { vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texel; o = dissipation * texture(uSource, coord); }`,
      divergence: `${HEAD} uniform sampler2D uVelocity; void main() { float L = texture(uVelocity, vL).x; float R = texture(uVelocity, vR).x; float T = texture(uVelocity, vT).y; float B = texture(uVelocity, vB).y; vec2 C = texture(uVelocity, vUv).xy; if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x; if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y; o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0); }`,
      curl: `${HEAD} uniform sampler2D uVelocity; void main() { float L = texture(uVelocity, vL).y; float R = texture(uVelocity, vR).y; float T = texture(uVelocity, vT).x; float B = texture(uVelocity, vB).x; o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0); }`,
      vorticity: `${HEAD} uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt; void main() { float L = texture(uCurl, vL).x; float R = texture(uCurl, vR).x; float T = texture(uCurl, vT).x; float B = texture(uCurl, vB).x; float C = texture(uCurl, vUv).x; vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0; vec2 v = texture(uVelocity, vUv).xy + force * dt; o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0); }`,
      pressure: `${HEAD} uniform sampler2D uPressure; uniform sampler2D uDivergence; void main() { float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x; float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x; float d = texture(uDivergence, vUv).x; o = vec4((L + R + B + T - d) * 0.25, 0.0, 0.0, 1.0); }`,
      gradient: `${HEAD} uniform sampler2D uPressure; uniform sampler2D uVelocity; void main() { float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x; float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x; vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B); o = vec4(v, 0.0, 1.0); }`,
      display: `${HEAD} uniform sampler2D uTexture; void main() { vec3 c = texture(uTexture, vUv).rgb; float a = max(c.r, max(c.g, c.b)); o = vec4(c, a); }`
    };
  }
}
