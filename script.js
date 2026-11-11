/* rajkahar portfolio: page transitions, reveals, cursor */
(function () {
  "use strict";
  var d = document, h = d.documentElement;
  var rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  h.classList.add("js");

  /* page transition curtain */
  var c = d.createElement("div");
  c.className = "curtain";
  c.setAttribute("aria-hidden", "true");
  if (!rm) {
    c.classList.add("on");
    d.body.appendChild(c);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { c.classList.remove("on"); });
    });
    d.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      var u = a.getAttribute("href");
      if (!u || u.charAt(0) === "#" || /^(mailto:|https?:)/.test(u)) return;
      e.preventDefault();
      c.classList.add("on");
      setTimeout(function () { location.href = u; }, 450);
    });
    addEventListener("pageshow", function (e) {
      if (e.persisted) c.classList.remove("on");
    });
  }

  /* marquee: duplicate content for a seamless loop */
  var t = d.querySelector(".mq__t");
  if (t) t.innerHTML += t.innerHTML;

  /* reveal on scroll */
  var els = d.querySelectorAll(".rv");
  if (rm || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* custom cursor (mouse only) */
  if (fine && !rm) {
    var dot = d.createElement("div"), ring = d.createElement("div");
    dot.className = "cur-dot"; ring.className = "cur-ring";
    d.body.appendChild(ring); d.body.appendChild(dot);
    var x = 0, y = 0, rx = 0, ry = 0;
    addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      dot.style.transform = "translate(" + x + "px," + y + "px)";
      h.classList.add("cur");
    });
    (function loop() {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(loop);
    })();
    d.addEventListener("mouseover", function (e) {
      ring.classList.toggle("big", !!e.target.closest("a,button"));
    });
  }
})();