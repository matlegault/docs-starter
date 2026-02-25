(function () {
  var container = document.getElementById("blob-animation");
  if (!container) return;

  // Accent color from Fern theme
  function getParentCSS(prop, fallback) {
    var val = getComputedStyle(document.documentElement)
      .getPropertyValue(prop)
      .trim();
    return val || fallback;
  }

  var accentStops = [
    { stop: 0,    color: getParentCSS("--accent-2") },
    { stop: 0.15, color: getParentCSS("--accent-4") },
    { stop: 0.3,  color: getParentCSS("--accent-6") },
    { stop: 0.45, color: getParentCSS("--accent-8") },
    { stop: 0.6,  color: getParentCSS("--accent-10") },
    { stop: 0.75, color: getParentCSS("--accent-11") },
    { stop: 0.9,  color: getParentCSS("--accent-12") },
    { stop: 1,    color: getParentCSS("--accent-9") },
  ];
  var bgColor = getParentCSS("--background");

  Math.toRadians = function (degrees) {
    return (degrees * Math.PI) / 180;
  };

  var mouseInside = false;
  var mouse = {
    x: Math.random() * container.offsetWidth,
    y: Math.random() * container.offsetHeight,
  };

  container.addEventListener(
    "mouseenter",
    function () {
      mouseInside = true;
    },
    false
  );
  container.addEventListener(
    "mouseleave",
    function () {
      mouseInside = false;
    },
    false
  );
  document.addEventListener(
    "mousemove",
    function (event) {
      if (!mouseInside) return;
      var rect = canvas.getBoundingClientRect();
      mouse = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },
    false
  );

  var canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);
  var context = canvas.getContext("2d");

  function resize() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  }

  window.addEventListener("resize", resize, false);
  resize();

  var time;

  var Vertex = function (x, y) {
    this.x = x;
    this.y = y;
    this.vibe = Math.random() - 0.5;
    this.vibrate = function () {
      this.x += Math.cos(time) * this.vibe;
      this.y -= Math.sin(time) * this.vibe;
    };
    this.drawCurve = function (ctx, to) {
      this.vibrate();
      var ep = this.curveTo(to);
      ctx.quadraticCurveTo(this.x, this.y, ep.x, ep.y);
    };
    this.curveTo = function (to) {
      return {
        x: (this.x + to.x) / 2,
        y: (this.y + to.y) / 2,
      };
    };
    return this;
  };

  var BlobShape = function (args) {
    if (args === undefined) args = {};
    this.sides = args.sides || 4;
    this.radius = args.radius || 75;
    this.deface = args.deface || 50;
    this.rotation = args.rotation || 0;
    this.scale = 0;
    this.alpha = 0;
    this.lineWidth = 0.5;
    this.delay = Math.random() * 100;
    this.vertex = [];
    this.center = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    };
    this.setup = function () {
      this.diameter = this.radius * 2;
      this.vertex = [];
      this.dps = 360 / this.sides;
      for (var i = 0; i < this.sides; i++) {
        var angle = this.dps * i;
        var deface =
          Math.random() * this.deface - this.deface / 2;
        var x =
          this.diameter * Math.cos(Math.toRadians(angle)) + deface;
        var y =
          this.diameter * Math.sin(Math.toRadians(angle)) + deface;
        var vtx = new Vertex(x, y);
        this.vertex.push(vtx);
      }
    };
    this.render = function (ctx) {
      if (mouseInside) {
        this.center.x += (mouse.x - this.center.x) / this.delay;
        this.center.y += (mouse.y - this.center.y) / this.delay;
      } else {
        var cx = canvas.width / 2;
        var cy = canvas.height / 2;
        var driftX = cx + Math.cos(time * 0.3) * cx * 0.4;
        var driftY = cy + Math.sin(time * 0.5) * cy * 0.3;
        this.center.x += (driftX - this.center.x) / this.delay;
        this.center.y += (driftY - this.center.y) / this.delay;
      }
      ctx.fillStyle = "rgba(0, 0, 0, " + this.alpha + ")";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.rotation = Math.sin(time) * 3;
      this.scale = Math.abs(Math.sin(time)) + 1;
      ctx.translate(this.center.x, this.center.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);
      ctx.beginPath();
      var r1 = Math.abs(this.center.y) + 1;
      var r2 = Math.abs(this.center.x) + 1;
      var grd = ctx.createRadialGradient(
        -this.center.x,
        -this.center.y,
        r1,
        this.center.x,
        this.center.y,
        r2
      );
      for (var s = 0; s < accentStops.length; s++) {
        grd.addColorStop(accentStops[s].stop, accentStops[s].color);
      }
      ctx.strokeStyle = grd;
      var _current = this.vertex[this.vertex.length - 1];
      var _first = this.vertex[0];
      var _next = _first;
      var _start = _current.curveTo(_next);
      ctx.moveTo(_start.x, _start.y);
      for (var i = 1; i < this.vertex.length; i++) {
        _current = this.vertex[i];
        _next.drawCurve(ctx, _current);
        _next = _current;
      }
      _next.drawCurve(ctx, _first);
      ctx.lineWidth = Math.abs(Math.sin(time) * this.lineWidth);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    };
    this.setup();
    return this;
  };

  var blob = new BlobShape({
    sides: 8,
    radius: 35,
    deface: 5,
  });

  function animate() {
    requestAnimationFrame(animate);
    time = new Date().getTime() * 0.001;
    context.save();
    blob.render(context);
    context.restore();
  }

  animate();
})();
