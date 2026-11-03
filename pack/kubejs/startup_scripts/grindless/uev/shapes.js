// priority: -7612
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
    Object.keys(o.pal).forEach(function (ch) {
      if (ch === 'F' || ch === 'Q' || ch === 'S' || ch === 'X' || !o.pal[ch]) return
      symbols[ch] = Pat.block(o.pal[ch])
    })
    if (o.pal.Q) symbols.Q = Pat.frame([o.pal.Q])
    return { slices: T.slices(o.w, o.h, o.d, o.fn), symbols: symbols }
  }

  // The UEV casing families (docs/eras/lines-uev-uxv.md section 9): the body of every UEV structure. R structural (SiC composite),
  // H thermal (HfTaCN lining), M field (superhydride magnet), O optics (photonic), D containment (degenerate matter).
  T.family = {
    R: 'grindless:sic_composite_casing',
    H: 'grindless:hftacn_lining_casing',
    M: 'grindless:superhydride_magnet_casing',
    O: 'grindless:photonic_casing',
    D: 'grindless:degenerate_containment_casing'
  }
  T.palette = function (primary, extra) {
    var pal = {
      F: primary, A: 'gtceu:stable_machine_casing', L: 'gtceu:laminated_glass', P: 'gtceu:tungstensteel_pipe_casing',
      C: 'gtceu:trinium_coil_block', B: 'gtceu:tungstensteel_gearbox', Q: 'tungsten_steel'
    }
    Object.keys(T.family).forEach(function (ch) { pal[ch] = T.family[ch] })
    if (extra) Object.keys(extra).forEach(function (ch) { pal[ch] = extra[ch] })
    return pal
  }

  // Bootstrap bodies (docs/quality/structures.md, "Bootstrap bodies"): a machine whose product a family casing needs, directly or through
  // another machine, never contains that casing, or the era deadlocks. Each forbidden letter takes a pre-UEV stand-in: R the machine's
  // own GTM body, H the high-temperature smelting casing, M the UHV field ring casing. The set, from reachability with the casings
  // swapped (batch 16): the CVI furnace and SiC fibre plant (R, H, M) and the electron beam furnace (R, M); the megabar press takes the
  // HfTaCN lining for M. (The magnet casing takes no Barnard product, so the magnet works and the Barnard drill keep it.)
  T.BOOTSTRAP = { H: 'gtceu:high_temperature_smelting_casing', M: 'grindless:field_ring_casing' }
  T.bootstrap = function (primary, letters) {
    var o = {}
    String(letters || '').split('').forEach(function (c) { o[c] = c === 'R' ? primary : T.BOOTSTRAP[c] })
    return o
  }

  // ---------------------------------------------------------------- scene: a voxel canvas the big UEV structures are drawn on
  // Later strokes paint over earlier ones. Axis 'x', 'y' or 'z' names the axis of a cylinder; (a, b) is its centre in the other two
  // axes, in the order x, y, z with the axis removed. Unpainted cells are ' ' (anything).
  T.scene = function (w, h, d) {
    var g = []
    for (var i = 0; i < w * h * d; i++) g.push(' ')
    var s = { w: w, h: h, d: d }
    s.get = function (x, y, z) {
      return x < 0 || y < 0 || z < 0 || x >= w || y >= h || z >= d ? ' ' : g[(z * h + y) * w + x]
    }
    s.set = function (x, y, z, ch) {
      if (x < 0 || y < 0 || z < 0 || x >= w || y >= h || z >= d) return s
      g[(z * h + y) * w + x] = ch
      return s
    }
    s.box = function (x0, y0, z0, x1, y1, z1, ch) {
      for (var z = z0; z <= z1; z++) for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) s.set(x, y, z, ch)
      return s
    }
    // walls of ch with an air interior; faces: string of the faces to leave open, from 'lrbtfk' (left, right, bottom, top, front, back)
    s.room = function (x0, y0, z0, x1, y1, z1, ch, open, inner) {
      open = open || ''
      for (var z = z0; z <= z1; z++) for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
        var wall = (x === x0 && open.indexOf('l') < 0) || (x === x1 && open.indexOf('r') < 0) ||
          (y === y0 && open.indexOf('b') < 0) || (y === y1 && open.indexOf('t') < 0) ||
          (z === z0 && open.indexOf('k') < 0) || (z === z1 && open.indexOf('f') < 0)
        s.set(x, y, z, wall ? ch : (inner === undefined ? '#' : inner))
      }
      return s
    }
    // the twelve edges of a box
    s.edges = function (x0, y0, z0, x1, y1, z1, ch) {
      for (var z = z0; z <= z1; z++) for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
        var n = (x === x0 || x === x1 ? 1 : 0) + (y === y0 || y === y1 ? 1 : 0) + (z === z0 || z === z1 ? 1 : 0)
        if (n >= 2) s.set(x, y, z, ch)
      }
      return s
    }
    function inDisk(da, db, r) { return da * da + db * db <= r * r + r * 0.5 }
    // a solid cylinder, or a tube (wall ch, interior inner, '#' by default) when hollow is true
    s.cyl = function (axis, a, b, r, lo, hi, ch, hollow, inner) {
      for (var u = lo; u <= hi; u++) for (var p = -r; p <= r; p++) for (var q = -r; q <= r; q++) {
        if (!inDisk(p, q, r)) continue
        var ring = r > 0 && !inDisk(p, q, r - 1)
        if (hollow && !ring) { if (inner !== null) put(axis, a + p, b + q, u, inner === undefined ? '#' : inner); continue }
        put(axis, a + p, b + q, u, ch)
      }
      return s
    }
    function put(axis, a, b, u, ch) {
      if (axis === 'y') s.set(a, u, b, ch)
      else if (axis === 'z') s.set(a, b, u, ch)
      else s.set(u, a, b, ch)
    }
    // a stepped cone along y: radius r0 at y0 shrinking by one every `step` rows (hollow shell when hollow)
    s.cone = function (cx, cz, r0, y0, y1, step, ch, hollow) {
      for (var y = y0; y <= y1; y++) {
        var r = r0 - Math.floor((y - y0) / step)
        if (r < 0) break
        s.cyl('y', cx, cz, r, y, y, ch, hollow, hollow ? '#' : undefined)
      }
      return s
    }
    // the cells of one kind painted into another: replaces every `from` with `to` where pick(x, y, z) is true
    s.replace = function (from, to, pick) {
      for (var z = 0; z < d; z++) for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        if (s.get(x, y, z) === from && (!pick || pick(x, y, z))) s.set(x, y, z, to)
      }
      return s
    }
    s.fn = function () { return function (x, y, z) { return s.get(x, y, z) } }
    // the control booth on the front face: the controller sits in its front wall (T.slices forces it at (middle, 1, front)); the floor
    // row stays X so the hatches can go there
    s.booth = function (ch, depth) {
      var mid = (w - 1) / 2
      s.room(mid - 2, 0, d - depth, mid + 2, 3, d - 1, ch)
      s.box(mid - 2, 0, d - depth, mid + 2, 0, d - 1, 'X')
      s.set(mid - 1, 2, d - 1, 'L').set(mid + 1, 2, d - 1, 'L')
      return s
    }
    return s
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
