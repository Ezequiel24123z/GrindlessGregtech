// -----------------------------------------------------------------------------------------------
// UEV structure shapes (QR-S5): the silhouettes the UEV multiblocks share. A shape is a function fn(x, y, z) -> one char: x runs left to
// right, y bottom to top, z back (0) to front (depth - 1); the controller is forced to (middle, 1, front). Every UEV file calls
// G.uevShapes.spec(...) from inside its machine registry callback, never at load time (this file may load after them).
//
// Chars: S controller, X floor cell (casing or a part), F casing, A accent casing, Q frame post, L glass, P pipe casing, C coil block,
// B machine block (gearbox...), '#' air, ' ' anything (outside the silhouette).
// Geometry limit (lib/patterns.js): a slice has at most 16 rows.
(function () {
  const G = global.grindless || (global.grindless = {})
  const T = G.uevShapes || (G.uevShapes = {})

  function abs(n) { return n < 0 ? -n : n }
  function cheb(a, b) { return abs(a) > abs(b) ? abs(a) : abs(b) }
  T.cheb = cheb

  // slices back -> front, rows bottom -> top, one char per column
  T.slices = function (w, h, d, fn) {
    var slices = []
    var mid = (w - 1) / 2
    for (var z = 0; z < d; z++) {
      var rows = []
      for (var y = 0; y < h; y++) {
        var row = ''
        for (var x = 0; x < w; x++) {
          var ch = fn(x, y, z)
          if (ch === undefined || ch === null || ch === '') ch = ' '
          if (z === d - 1 && y === 1 && x === mid) ch = 'S'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // o: { w, h, d, fn, pal: { F, A, L, P, C, B: block ids; Q: frame material }, parts: [Pat.part(...)] }
  T.spec = function (Pat, o) {
    var casing = Pat.block(o.pal.F)
    var symbols = {
      S: Pat.controller(),
      X: Pat.oneOf.apply(null, [casing].concat(o.parts)),
      F: casing,
      '#': Pat.air()
    }
    ;['A', 'L', 'P', 'C', 'B'].forEach(function (ch) {
      if (o.pal[ch]) symbols[ch] = Pat.block(o.pal[ch])
    })
    if (o.pal.Q) symbols.Q = Pat.frame([o.pal.Q])
    return { slices: T.slices(o.w, o.h, o.d, o.fn), symbols: symbols }
  }

  // ---------------------------------------------------------------- crowns (k = rows above the hall roof)

  // a dish on a mast: two rows of mast, a cone of rings widening to radius R, the feed horn (C) at the centre
  T.dish = function (w, d, R) {
    var cx = (w - 1) / 2
    var cz = (d - 1) / 2
    return function (x, k, z) {
      var m = cheb(x - cx, z - cz)
      if (k < 2) return m === 0 ? 'Q' : ' '
      var r = k - 1
      if (r > R) return m === 0 && r === R + 1 ? 'C' : ' '
      if (m === r) return r === R ? 'F' : 'A'
      if (m === 0) return 'Q'
      return ' '
    }
  }

  // an antenna mast with two cross-arms and a coil at its tip
  T.mast = function (w, d, n) {
    var cx = (w - 1) / 2
    var cz = (d - 1) / 2
    return function (x, k, z) {
      var dx = abs(x - cx)
      var dz = z - cz
      if (k < n && dx === 0 && dz === 0) return k === n - 1 ? 'C' : 'Q'
      if (k === 2 && dz === 0 && dx <= 2) return 'Q'
      if (k === 4 && dz === 0 && dx <= 1) return 'Q'
      return ' '
    }
  }

  // a stepped glass dome over the hall
  T.dome = function (w, d, steps) {
    var cx = (w - 1) / 2
    var cz = (d - 1) / 2
    var r0 = (w < d ? w : d) / 2 - 1.5
    return function (x, k, z) {
      var m = cheb(x - cx, z - cz)
      var r = r0 - k
      if (k >= steps || r < 0) return ' '
      if (m === r) return 'L'
      if (m < r && k === steps - 1) return 'L'
      return ' '
    }
  }

  // a ridge of pipes along the roof with ribs every third slice
  T.ridge = function (w, d) {
    var cx = (w - 1) / 2
    return function (x, k, z) {
      var dx = abs(x - cx)
      if (k === 0) return dx === 0 ? 'P' : (z % 3 === 1 && dx <= 3 ? 'A' : ' ')
      if (k === 1) return dx === 0 && z % 3 === 1 ? 'C' : ' '
      return ' '
    }
  }

  // ---------------------------------------------------------------- hall: a framed glass-walled building
  // o: { w, d, hh (rows), mull (window period), crown(x, k, z), inner(x, y, z) }
  T.hall = function (o) {
    var w = o.w
    var d = o.d
    var hh = o.hh
    var mull = o.mull || 3
    return function (x, y, z) {
      if (y >= hh) return o.crown ? o.crown(x, y - hh, z) : ' '
      var ex = x === 0 || x === w - 1
      var ez = z === 0 || z === d - 1
      if (y === 0) return ex && ez ? 'Q' : 'X'
      var top = y === hh - 1
      if (!(ex || ez || top)) return (o.inner && o.inner(x, y, z)) || '#'
      if ((ex && ez) || (top && (ex || ez))) return 'Q'
      if (top) return z % 3 === 1 ? 'A' : 'F'
      if (y === 1) return 'A'
      return (ez ? x : z) % mull === 0 ? 'F' : 'L'
    }
  }

  // ---------------------------------------------------------------- tower: a base hall under a narrower banded shaft
  // o: { w, d, th (tower height), baseH, inset, band (period), bandChar, core(x, y, z), crown(x, k, z), baseInner }
  T.tower = function (o) {
    var w = o.w
    var d = o.d
    var ins = o.inset
    var base = T.hall({ w: w, d: d, hh: o.baseH, inner: o.baseInner })
    return function (x, y, z) {
      if (y >= o.th) return o.crown ? o.crown(x, y - o.th, z) : ' '
      if (y < o.baseH) return base(x, y, z)
      if (x < ins || x > w - 1 - ins || z < ins || z > d - 1 - ins) return ' '
      var ex = x === ins || x === w - 1 - ins
      var ez = z === ins || z === d - 1 - ins
      var k = y - o.baseH
      if (y === o.th - 1) {
        if (ex || ez) return ex && ez ? 'Q' : 'A'
        return (o.core && o.core(x, y, z)) || 'A'
      }
      if (!(ex || ez)) return (o.core && o.core(x, y, z)) || '#'
      if (ex && ez) return 'Q'
      var phase = k % o.band
      if (phase === 0) return o.bandChar || 'C'
      if (phase === 1 || phase === 2) return 'L'
      return 'F'
    }
  }

  // ---------------------------------------------------------------- ring: a stadium (rounded rectangle) annulus yoke
  // o: { w, d, r1, r2 (inner / outer radius, cells), prof(y, seg) -> char for y >= 1 (seg alternates per cell), hub(x, y, z, q) }
  T.ring = function (o) {
    var cx = (o.w - 1) / 2
    var cz = (o.d - 1) / 2
    var R = o.r2
    var ax = cx - R
    var az = cz - R
    if (ax < 0) ax = 0
    if (az < 0) az = 0
    var i2 = o.r1 * o.r1
    var o2 = o.r2 * o.r2
    return function (x, y, z) {
      var dx = abs(x - cx)
      var dz = abs(z - cz)
      var ex = dx > ax ? dx - ax : 0
      var ez = dz > az ? dz - az : 0
      var q = ex * ex + ez * ez
      if (q >= i2 && q <= o2) {
        if (y === 0) return 'X'
        return o.prof(y, (x + z) % 4)
      }
      return o.hub ? o.hub(x, y, z, q) : ' '
    }
  }

  // ---------------------------------------------------------------- gantry: an open frame with a beam tube down its axis
  // o: { w, h, d, ty (tube axis row), pz (post period), ring (coil slice phase), extra(x, y, z) }
  T.gantry = function (o) {
    var w = o.w
    var h = o.h
    var d = o.d
    var cx = (w - 1) / 2
    var pz = o.pz || 4
    return function (x, y, z) {
      var v = o.extra ? o.extra(x, y, z) : null
      if (v) return v
      var dx = x - cx
      var ex = x === 0 || x === w - 1
      var post = z % pz === 0 || z === d - 1
      if (y === 0) return ex && post ? 'Q' : (abs(dx) <= 1 ? 'X' : ' ')
      if (ex && post) return 'Q'
      if (y === h - 1 && ex) return 'Q'
      if (y === 1 && ex) return 'A'
      var m = cheb(dx, y - o.ty)
      var ringSlice = z % pz === o.ring
      if (m === 1) return ringSlice ? 'C' : 'P'
      if (m === 2 && ringSlice) return 'C'
      if (m < 1) return '#'
      if (y === 1 && abs(dx) <= 1) return 'A'
      return ' '
    }
  }
})()
