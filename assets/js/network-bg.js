(function () {
  var canvas = document.getElementById("network-bg");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var DOT_ALPHA = 0.16;
  var LINE_ALPHA = 0.045;
  var LINK_DIST = 130;
  var SPACING = 150; // px per node, on average — keeps the field sparse
  var SPEED = 0.035;

  var w, h, dpr, nodes, inkColor;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function readInkColor() {
    inkColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--ink")
      .trim() || "#1D1D1F";
  }

  function seedNodes() {
    var count = Math.min(46, Math.max(14, Math.round((w * h) / (SPACING * SPACING))));
    nodes = [];
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedNodes();
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.globalAlpha = LINE_ALPHA * (1 - dist / LINK_DIST);
          ctx.strokeStyle = inkColor;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = DOT_ALPHA;
    ctx.fillStyle = inkColor;
    for (var i = 0; i < nodes.length; i++) {
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!reduceMotion) requestAnimationFrame(step);
  }

  readInkColor();
  resize();
  step();

  window.addEventListener("resize", resize);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    readInkColor();
    if (reduceMotion) step();
  });
})();
