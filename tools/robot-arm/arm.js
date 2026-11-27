// 2-link robot arm: forward kinematics.
// Given two link lengths (L1, L2) and two joint angles (θ1 from the x-axis,
// θ2 from link 1), work out where the tip of the arm is, draw the arm,
// and show the working-out step by step.

(function () {
  'use strict';

  // ---- Settings (the "state" is the current value of each control) ----

  var CONTROLS = {
    L1: { min: 1, max: 50 },
    L2: { min: 1, max: 50 },
    t1: { min: -180, max: 180 },
    t2: { min: -180, max: 180 }
  };
  var state = {};

  var svg = document.getElementById('arm-svg');
  var resultEl = document.getElementById('arm-result');
  var stepsEl = document.getElementById('arm-steps');
  var SVG_NS = 'http://www.w3.org/2000/svg';

  // ---- Number formatting ----

  // Use a real minus sign (−) and never show "−0.00".
  function fmt(n, digits) {
    if (digits === undefined) digits = 2;
    var limit = 0.5 * Math.pow(10, -digits);
    if (Math.abs(n) < limit) n = 0;
    return n.toFixed(digits).replace('-', '−');
  }

  // Show input values without trailing zeros: 20 → "20", 12.5 → "12.5".
  function fmtInput(n) {
    return String(Number(n.toFixed(1))).replace('-', '−');
  }

  // Wrap negative numbers in brackets inside a sum: 17.32 + (−3.88).
  function term(text) {
    return text.charAt(0) === '−' ? '(' + text + ')' : text;
  }

  function toRad(deg) {
    return deg * Math.PI / 180;
  }

  // ---- The maths ----

  function solve(s) {
    var dir2 = s.t1 + s.t2;               // direction of link 2, from the x-axis
    var c1 = Math.cos(toRad(s.t1));
    var s1 = Math.sin(toRad(s.t1));
    var c2 = Math.cos(toRad(dir2));
    var s2 = Math.sin(toRad(dir2));
    var x1 = s.L1 * c1, y1 = s.L1 * s1;   // elbow
    var dx = s.L2 * c2, dy = s.L2 * s2;   // link 2's own reach
    var x = x1 + dx, y = y1 + dy;         // tip
    return {
      dir2: dir2, c1: c1, s1: s1, c2: c2, s2: s2,
      x1: x1, y1: y1, dx: dx, dy: dy, x: x, y: y,
      dist: Math.sqrt(x * x + y * y),
      reach: s.L1 + s.L2
    };
  }

  // ---- Drawing ----

  function el(name, attrs, text) {
    var node = document.createElementNS(SVG_NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (text !== undefined) node.textContent = text;
    svg.appendChild(node);
    return node;
  }

  // SVG path for an arc of radius r around (cx, cy), from angle a to angle b (degrees).
  // y is flipped (SVG's y-axis points down), so anticlockwise in maths = sweep flag 0.
  function arcPath(cx, cy, r, a, b) {
    var ax = cx + r * Math.cos(toRad(a)), ay = cy - r * Math.sin(toRad(a));
    var bx = cx + r * Math.cos(toRad(b)), by = cy - r * Math.sin(toRad(b));
    var large = Math.abs(b - a) > 180 ? 1 : 0;
    var sweep = b > a ? 0 : 1;
    return 'M ' + ax + ' ' + ay + ' A ' + r + ' ' + r + ' 0 ' + large + ' ' + sweep + ' ' + bx + ' ' + by;
  }

  function draw(s, r) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Scale: the reach circle (radius L1 + L2) fills most of the 400 × 400 view.
    var scale = 165 / r.reach;            // pixels per cm
    function px(cm) { return cm * scale; }
    var half = 200 / scale;               // half the view width, in cm

    // Grid: pick a spacing that gives a handful of lines each side.
    var spacings = [1, 2, 5, 10, 20, 25];
    var g = spacings[spacings.length - 1];
    for (var i = 0; i < spacings.length; i++) {
      if (r.reach / spacings[i] <= 5) { g = spacings[i]; break; }
    }
    var n = Math.floor(half / g);
    for (var k = -n; k <= n; k++) {
      if (k === 0) continue;
      var p = px(k * g);
      el('line', { 'class': 'grid', x1: p, y1: -200, x2: p, y2: 200 });
      el('line', { 'class': 'grid', x1: -200, y1: p, x2: 200, y2: p });
      // Axis numbers sit along the bottom and left edges, away from the arm's labels.
      el('text', { 'class': 'tick', x: p, y: 194, 'text-anchor': 'middle' }, fmtInput(k * g));
      el('text', { 'class': 'tick', x: -194, y: -p + 4, 'text-anchor': 'start' }, fmtInput(k * g));
    }

    // Axes with labels.
    el('line', { 'class': 'axis', x1: -200, y1: 0, x2: 200, y2: 0 });
    el('line', { 'class': 'axis', x1: 0, y1: -200, x2: 0, y2: 200 });
    el('text', { x: 194, y: -6, 'text-anchor': 'end' }, 'x (cm)');
    el('text', { x: 6, y: -186 }, 'y (cm)');

    // Reach circle: the tip can never be further away than L1 + L2.
    el('circle', { 'class': 'reach', cx: 0, cy: 0, r: px(r.reach) });

    // Positions on screen (y flipped so up is positive).
    var ex = px(r.x1), ey = -px(r.y1);
    var tx = px(r.x), ty = -px(r.y);

    // θ1 arc at the base, from the x-axis to link 1.
    var r1 = Math.min(px(s.L1) * 0.5, 40);
    if (Math.abs(s.t1) >= 1) {
      el('path', { 'class': 'arc1', d: arcPath(0, 0, r1, 0, s.t1) });
      var m1 = toRad(s.t1 / 2);
      el('text', { x: (r1 + 14) * Math.cos(m1), y: -(r1 + 14) * Math.sin(m1) + 4, 'text-anchor': 'middle' }, 'θ1');
    }

    // θ2 arc at the elbow, from "straight on" (dashed) to link 2.
    var r2 = Math.min(Math.min(px(s.L1), px(s.L2)) * 0.5, 36);
    var extLen = r2 + 18;
    el('line', {
      'class': 'extension', x1: ex, y1: ey,
      x2: ex + extLen * r.c1, y2: ey - extLen * r.s1
    });
    if (Math.abs(s.t2) >= 1) {
      el('path', { 'class': 'arc2', d: arcPath(ex, ey, r2, s.t1, r.dir2) });
      var m2 = toRad(s.t1 + s.t2 / 2);
      el('text', { x: ex + (r2 + 14) * Math.cos(m2), y: ey - (r2 + 14) * Math.sin(m2) + 4, 'text-anchor': 'middle' }, 'θ2');
    }

    // The two links.
    el('line', { 'class': 'link1', x1: 0, y1: 0, x2: ex, y2: ey });
    el('line', { 'class': 'link2', x1: ex, y1: ey, x2: tx, y2: ty });

    // Joints and tip.
    el('circle', { 'class': 'joint', cx: 0, cy: 0, r: 6 });
    el('circle', { 'class': 'joint', cx: ex, cy: ey, r: 5 });
    el('circle', { 'class': 'tip', cx: tx, cy: ty, r: 5 });

    // Point labels, nudged away from the arm.
    label('Base', 0, 0, 180 + s.t1);
    // Elbow label goes on the inside of the bend; the θ2 arc is on the outside.
    label('Elbow', ex, ey, s.t1 + 90 + s.t2 / 2);
    label('Tip', tx, ty, r.dir2);

    svg.setAttribute('aria-label',
      'Robot arm. Link 1 is ' + fmtInput(s.L1) + ' cm long at ' + fmtInput(s.t1) +
      ' degrees from the x-axis. Link 2 is ' + fmtInput(s.L2) + ' cm long, bent ' +
      fmtInput(s.t2) + ' degrees at the elbow. The tip is at x ' + fmt(r.x) +
      ' cm, y ' + fmt(r.y) + ' cm.');
  }

  // Place a text label 18px from a point, in the given direction (degrees).
  function label(text, x, y, angle) {
    var a = toRad(angle);
    var lx = x + 18 * Math.cos(a);
    var ly = y - 18 * Math.sin(a) + 4;
    var anchor = Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle';
    // Keep labels inside the drawing.
    lx = Math.max(-196, Math.min(196, lx));
    ly = Math.max(-188, Math.min(196, ly));
    el('text', { x: lx, y: ly, 'text-anchor': anchor }, text);
  }

  // ---- Result and working-out ----

  function showResult(r) {
    resultEl.textContent = 'Tip position: x = ' + fmt(r.x) + ' cm, y = ' + fmt(r.y) + ' cm';
  }

  function showSteps(s, r) {
    var L1 = fmtInput(s.L1), L2 = fmtInput(s.L2);
    var t1 = fmtInput(s.t1) + '°', t2 = fmtInput(s.t2) + '°';
    var dir2 = fmtInput(r.dir2) + '°';

    var steps = [
      {
        title: 'Where is the elbow?',
        text: 'Link 1 starts at the base (0, 0) and points at angle θ1. ' +
              'cos tells you how much of a link points sideways (x), and sin tells you how much points up (y). ' +
              'Multiply each by the length of the link.',
        math: [
          'x₁ = L1 × cos(θ1) = ' + L1 + ' × cos(' + t1 + ') = ' + L1 + ' × ' + fmt(r.c1, 3) + ' = ' + fmt(r.x1) + ' cm',
          'y₁ = L1 × sin(θ1) = ' + L1 + ' × sin(' + t1 + ') = ' + L1 + ' × ' + fmt(r.s1, 3) + ' = ' + fmt(r.y1) + ' cm'
        ]
      },
      {
        title: 'Which way does link 2 point?',
        text: 'θ2 is measured from link 1, not from the x-axis. So to get link 2\'s direction ' +
              'from the x-axis, add the two angles together.',
        math: [
          'θ1 + θ2 = ' + t1 + ' + ' + term(t2) + ' = ' + dir2
        ]
      },
      {
        title: 'How far does link 2 reach?',
        text: 'Use cos and sin again, this time with link 2\'s length and the direction from step 2. ' +
              'This tells you how far the tip is from the elbow, sideways and up.',
        math: [
          'Δx = L2 × cos(θ1 + θ2) = ' + L2 + ' × cos(' + dir2 + ') = ' + L2 + ' × ' + fmt(r.c2, 3) + ' = ' + fmt(r.dx) + ' cm',
          'Δy = L2 × sin(θ1 + θ2) = ' + L2 + ' × sin(' + dir2 + ') = ' + L2 + ' × ' + fmt(r.s2, 3) + ' = ' + fmt(r.dy) + ' cm'
        ]
      },
      {
        title: 'Add them up:',
        text: 'The tip is where the elbow is, plus how far link 2 reaches from there.',
        math: [
          'x = x₁ + Δx = ' + fmt(r.x1) + ' + ' + term(fmt(r.dx)) + ' = ' + fmt(r.x) + ' cm',
          'y = y₁ + Δy = ' + fmt(r.y1) + ' + ' + term(fmt(r.dy)) + ' = ' + fmt(r.y) + ' cm'
        ]
      },
      {
        title: 'Check the answer:',
        text: 'The tip can never be further from the base than both links laid end to end (L1 + L2). ' +
              'Use Pythagoras to find the tip\'s distance from the base.',
        math: [
          'distance = √(x² + y²) = √(' + fmt(r.x) + '² + ' + fmt(r.y) + '²) = ' + fmt(r.dist) + ' cm',
          'L1 + L2 = ' + L1 + ' + ' + L2 + ' = ' + fmtInput(r.reach) + ' cm  ✓ the tip is within reach'
        ]
      }
    ];

    stepsEl.textContent = '';
    steps.forEach(function (step) {
      var li = document.createElement('li');
      var p = document.createElement('p');
      var strong = document.createElement('strong');
      strong.textContent = step.title;
      p.appendChild(strong);
      p.appendChild(document.createTextNode(' ' + step.text));
      li.appendChild(p);
      var box = document.createElement('div');
      box.className = 'math';
      step.math.forEach(function (line) {
        var d = document.createElement('div');
        d.textContent = line;
        box.appendChild(d);
      });
      li.appendChild(box);
      stepsEl.appendChild(li);
    });
  }

  function update() {
    var r = solve(state);
    draw(state, r);
    showResult(r);
    showSteps(state, r);
  }

  // ---- Wire up each slider + number box pair ----

  Object.keys(CONTROLS).forEach(function (key) {
    var cfg = CONTROLS[key];
    var range = document.getElementById(key + '-range');
    var num = document.getElementById(key + '-num');
    state[key] = Number(num.value);

    function clamp(v) {
      return Math.min(cfg.max, Math.max(cfg.min, v));
    }

    // Moving the slider updates the number box.
    range.addEventListener('input', function () {
      state[key] = Number(range.value);
      num.value = state[key];
      update();
    });

    // Typing a valid number updates the slider straight away.
    // Half-typed values (like "-" or "") are ignored until they make sense.
    num.addEventListener('input', function () {
      var v = parseFloat(num.value);
      if (isFinite(v) && v >= cfg.min && v <= cfg.max) {
        state[key] = v;
        range.value = v;
        update();
      }
    });

    // When the box loses focus or Enter is pressed, fix out-of-range or empty values.
    num.addEventListener('change', function () {
      var v = parseFloat(num.value);
      state[key] = isFinite(v) ? clamp(v) : state[key];
      num.value = state[key];
      range.value = state[key];
      update();
    });
  });

  update();
})();
