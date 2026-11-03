// priority: -9297
// -----------------------------------------------------------------------------------------------
// UIV structure shapes (QR-S6): the silhouettes of the UIV multiblocks that were boxes (docs/quality/structures.md). A shape is a function
// fn(x, y, z) -> one char: x runs left to right, y bottom to top, z back (0) to front (depth - 1); the controller is forced to
// (middle, 1, front). The era files call G.uivShapes.build(...) from inside their machine registry callback, never at load time
// (this file may load after them).
//
// Chars: S controller, X floor cell (casing or a part), F casing, A accent casing, Q frame post, L glass, P pipe casing, C coil block,
// B machine block (gearbox...), '#' air, ' ' anything (outside the silhouette); machine-specific chars (M, N, E, V, R, T, W) are blocks
// named in the layout's pal. Geometry limit (lib/patterns.js): a slice has at most 16 rows.
(function () {
  const G = global.grindless || (global.grindless = {})
  const T = G.uivShapes || (G.uivShapes = {})

  function abs(n) { return n < 0 ? -n : n }
  function cheb(a, b) { return abs(a) > abs(b) ? abs(a) : abs(b) }
  function rad(dx, dz) { return Math.sqrt(dx * dx + dz * dz) }

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

  // o: { w, h, d, fn, pal: { F: casing, Q: frame material, any other char: block id }, parts: [Pat.part(...)] }
  T.spec = function (Pat, o) {
    var casing = Pat.block(o.pal.F)
    var symbols = { S: Pat.controller(), X: Pat.oneOf.apply(null, [casing].concat(o.parts)), F: casing, '#': Pat.air() }
    Object.keys(o.pal).forEach(function (ch) {
      if (ch === 'F') return
      symbols[ch] = ch === 'Q' ? Pat.frame([o.pal[ch]]) : Pat.block(o.pal[ch])
    })
    return { slices: T.slices(o.w, o.h, o.d, o.fn), symbols: symbols }
  }

  // ---------------------------------------------------------------- crowns (k = rows above the roof)

  // a roof lantern: a glazed clerestory over the middle of the hall
  T.lantern = function (w, d, rx, rz) {
    var cx = (w - 1) / 2
    var cz = (d - 1) / 2
    return function (x, k, z) {
      var dx = abs(x - cx)
      var dz = abs(z - cz)
      if (dx > rx || dz > rz) return ' '
      var edge = dx === rx || dz === rz
      if (k === 0) return edge ? 'F' : ' '
      if (k === 1) return edge ? 'L' : ' '
      if (k === 2) return 'A'
      return ' '
    }
  }

  // a mast with a cross-arm and a coil at its tip
  T.spire = function (w, d, n) {
    var cx = (w - 1) / 2
    var cz = (d - 1) / 2
    return function (x, k, z) {
      var dx = abs(x - cx)
      if (z !== cz || k >= n) return ' '
      if (dx === 0) return k === n - 1 ? 'C' : 'Q'
      if (k === 2 && dx <= 2) return 'Q'
      return ' '
    }
  }

  // a stepped glass dome
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

  // rows of heat pipes standing on the roof, every second column
  T.sink = function (w, d) {
    var cz = (d - 1) / 2
    return function (x, k, z) {
      if (x % 2 !== 0 || x === 0 || x === w - 1 || abs(z - cz) > cz - 2) return ' '
      if (k === 0) return 'P'
      if (k === 1) return x % 4 === 0 ? 'A' : 'P'
      return ' '
    }
  }

  // ---------------------------------------------------------------- hall: a framed building with a plinth, two window courses and a skylit roof
  // o: { w, d, hh (rows), mull (window period), crown(x, k, z), inner(x, y, z) }
  T.hall = function (o) {
    var w = o.w
    var d = o.d
    var hh = o.hh
    var mull = o.mull || 4
    return function (x, y, z) {
      if (y >= hh) return o.crown ? o.crown(x, y - hh, z) : ' '
      var ex = x === 0 || x === w - 1
      var ez = z === 0 || z === d - 1
      if (y === 0) return ex && ez ? 'Q' : 'X'
      var top = y === hh - 1
      if (!(ex || ez || top)) return (o.inner && o.inner(x, y, z)) || '#'
      if (ex && ez) return 'Q'
      if (top) return (ex || ez) ? 'A' : ((x + z) % 3 === 0 ? 'L' : 'F')
      if (y === 1) return 'A'
      if (hh >= 6 && y === hh - 2) return 'A'
      return (ez ? x : z) % mull === 0 ? 'F' : 'L'
    }
  }

  // ---------------------------------------------------------------- beamline: an open gantry of portals around a beam tube
  // o: { w, h, d, ty (tube row), pz (portal period), ring (coil slice phase), jaws (undulator magnets above/below the tube), extra(x, y, z) }
  T.beamline = function (o) {
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
      var portal = z % pz === 0 || z === d - 1
      if (y === 0) {
        if (ex && portal) return 'Q'
        return abs(dx) <= 1 ? 'X' : (abs(dx) === 2 && z % 2 === 0 ? 'A' : ' ')
      }
      if (portal) {
        if (ex) return 'Q'
        if (y === h - 1) return 'Q'
        if (y === 1 && abs(dx) >= 2) return 'F'
      }
      if (y === h - 1 && ex) return 'Q'
      if (y === 1 && ex) return 'A'
      var m = cheb(dx, y - o.ty)
      var ringSlice = z % pz === o.ring
      if (m === 0) return '#'
      if (m === 1) return ringSlice ? 'C' : 'P'
      if (m === 2 && ringSlice) return 'C'
      if (o.jaws && abs(dx) === 0 && abs(y - o.ty) === 2 && z % 2 === 0) return z % 4 === 0 ? 'A' : 'B'
      if (y === 1 && abs(dx) <= 1) return 'A'
      return ' '
    }
  }

  // ---------------------------------------------------------------- vessels (circular plan)

  // a drum: floor disc, ribbed wall with window slits, an optional cap and crown. o: { w, d, R, hh, rib(y), band(y) -> 'C' | 'A' | null, inner, crown(x, k, z, r) }
  T.drum = function (o) {
    var cx = (o.w - 1) / 2
    var cz = (o.d - 1) / 2
    var hh = o.hh
    return function (x, y, z) {
      var r = rad(x - cx, z - cz)
      if (y >= hh) return o.crown ? o.crown(x, y - hh, z, r) : ' '
      if (r > o.R + 0.5) return ' '
      if (y === 0) return 'X'
      var wall = r >= o.R - 0.5
      if (!wall) return (o.inner && o.inner(x, y, z, r)) || '#'
      var b = o.band ? o.band(y) : null
      if (b) return b
      if (y === 1 || y === hh - 1) return 'A'
      return ((x * 3 + z * 5) % 4 === 0) ? 'F' : 'L'
    }
  }

  // ---------------------------------------------------------------- D4-SHAPE-UIV-A: parts composed into a silhouette (local coordinates)

  // a rectangular building. o: { w, h, d, ground (floor row = parts), slab, roof 'lid' | 'rim', win [rows], mull, bands [rows], sky, post, inner(x, y, z) }
  T.shell = function (o) {
    var w = o.w
    var h = o.h
    var d = o.d
    var mull = o.mull || 3
    var win = o.win || [2, 2]
    var sky = o.sky || 4
    var bands = o.bands || []
    return function (x, y, z) {
      var ex = x === 0 || x === w - 1
      var ez = z === 0 || z === d - 1
      var wall = ex || ez
      if (y === 0) return o.ground ? 'X' : (o.slab ? 'F' : (wall ? 'A' : '#'))
      if (y === h - 1 && h > 1) {
        if (o.roof === 'lid') return wall ? 'A' : ((x + z) % sky === 0 ? 'L' : 'F')
        if (o.roof === 'rim') return wall ? 'A' : '#'
      }
      if (!wall) return (o.inner && o.inner(x, y, z)) || '#'
      if (ex && ez) return o.post || 'F'
      if (bands.indexOf(y) >= 0) return 'A'
      if (y >= win[0] && y <= win[1]) return (ez ? x : z) % mull === 0 ? 'F' : 'L'
      return 'F'
    }
  }

  // a round vessel on a square plan of side 2R + 1. o: { R, h (wall rows), dome (rows), ground, lid, bands {row: char}, win [rows], inner(x, y, z, r) }
  T.cyl = function (o) {
    var R = o.R
    var H = o.h
    var n = o.dome || 0
    var win = o.win || [2, 2]
    return function (x, y, z) {
      var r = rad(x - R, z - R)
      if (r > R + 0.5) return ' '
      var wall = r >= R - 0.5
      if (y >= H) {
        if (!n) return ' '
        if (y === H) return wall ? 'A' : ' '
        var q = r / (R + 0.5)
        var hs = Math.round(n * Math.sqrt(Math.max(0, 1 - q * q)))
        return y - H === (hs > 0 ? hs - 1 : 0) && y - H < n ? (r > R - 1.5 ? 'A' : 'L') : ' '
      }
      if (y === 0) return o.ground ? 'X' : (wall ? 'A' : '#')
      if (!wall) {
        if (o.lid && y === H - 1) return 'F'
        return (o.inner && o.inner(x, y, z, r)) || '#'
      }
      if (o.bands && o.bands[y]) return o.bands[y]
      if (y === 1 || y === H - 1) return 'A'
      if (y >= win[0] && y <= win[1]) return (x + z) % 3 === 0 ? 'F' : 'L'
      return 'F'
    }
  }

  // a silhouette from parts { x, y, z, w, h, d, fn }; a solid cell of any part wins over the air of another
  T.at = function (x, y, z, w, h, d, fn) { return { x: x, y: y, z: z, w: w, h: h, d: d, fn: fn } }
  T.compose = function (parts) {
    return function (x, y, z) {
      var air = false
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]
        var lx = x - p.x
        var ly = y - p.y
        var lz = z - p.z
        if (lx < 0 || ly < 0 || lz < 0 || lx >= p.w || ly >= p.h || lz >= p.d) continue
        var ch = p.fn(lx, ly, lz)
        if (ch === '#') air = true
        else if (ch && ch !== ' ') return ch
      }
      return air ? '#' : ' '
    }
  }

  // ---------------------------------------------------------------- the layouts: name -> function returning { w, h, d, fn, pal }

  var P0 = {
    A: 'gtceu:stable_machine_casing', L: 'gtceu:laminated_glass', P: 'gtceu:tungstensteel_pipe_casing',
    C: 'gtceu:trinium_coil_block', B: 'gtceu:tungstensteel_gearbox', Q: 'tungsten_steel'
  }
  function pal(extra) {
    var o = {}
    Object.keys(P0).forEach(function (k) { o[k] = P0[k] })
    Object.keys(extra || {}).forEach(function (k) { o[k] = extra[k] })
    return o
  }
  var COIL_MH = 'grindless:metallic_hydrogen_coil_block'
  var SITE = 'grindless:neutron_star_site_casing'
  var RHEA = 'grindless:rhea_casing'
  var MH = 'grindless:mh_field_casing'
  var OPT = 'grindless:multilayer_optics_casing'
  var CRY = 'grindless:dilution_cryostat_casing'
  var L = {}
  T.layouts = L

  // BEUV scanner: a lithography hall, the mirror train staggered down its axis (alternate stands left and right of the beam rail)
  L.beuv_scanner = function () {
    var w = 15, d = 13, hh = 7, cx = 7
    return {
      w: w, h: hh + 3, d: d, pal: pal({ A: 'gtceu:uev_machine_casing' }),
      fn: T.hall({
        w: w, d: d, hh: hh, mull: 4, crown: T.lantern(w, d, 3, 3),
        inner: function (x, y, z) {
          var dx = x - cx
          if (dx === 0 && y === 1) return z % 3 === 1 ? 'B' : 'P'
          var k = (z - 1) / 3
          if (z % 3 === 1 && z > 1 && z < d - 3) {
            var off = k % 2 === 0 ? 3 : -3
            if (dx === off) return y === 1 ? 'B' : (y === 2 ? 'Q' : (y <= 4 ? 'A' : null))
            if (dx === off / 3 * 2 && y === 3) return 'L'
          }
          return null
        }
      })
    }
  }

  // STM lithography cell: the domed scan chamber at the back on its vibration-isolation pads (scan tower and probe on the axis), a low
  // load-lock hall across the front with its lock chambers and the transfer tube to the chamber
  L.stm_lithography_cell = function () {
    var w = 15, d = 17
    return {
      w: w, h: 11, d: d, pal: pal({ A: CRY, M: RHEA }),
      fn: T.compose([
        T.at(3, 0, 0, 9, 11, 9, T.cyl({
          R: 4, h: 8, dome: 3, ground: true, bands: { 4: 'M' }, win: [5, 6],
          inner: function (x, y, z, r) {
            if (r < 0.5) return y <= 2 ? 'B' : (y === 5 ? 'C' : 'P')
            if (y === 1 && r >= 2 && r < 3) return 'M'
            return null
          }
        })),
        T.at(0, 0, 9, w, 5, 8, T.shell({
          w: w, h: 5, d: 8, ground: true, roof: 'lid', win: [2, 3], mull: 4, sky: 3, bands: [1],
          inner: function (x, y, z) {
            var dx = abs(x - 7)
            if (dx >= 2 && dx <= 5 && (z === 2 || z === 5)) return y === 1 ? 'B' : (y === 2 ? 'M' : null)
            if (y === 1 && dx === 0 && z <= 5) return 'P'
            return null
          }
        }))
      ])
    }
  }

  // TFLN fab: the ion-slicing line under one open-roofed hall - implanter, bonder, split furnace and polisher in order from the back,
  // each under its own glazed hood on four posts, a conveyor of machine blocks down the aisle, an exhaust stack on every hood
  L.tfln_fab = function () {
    var w = 17, d = 23
    var zs = [1, 6, 11, 16]
    var parts = []
    zs.forEach(function (z0) {
      parts.push(T.at(6, 5, z0, 5, 6, 5, T.shell({
        w: 5, h: 6, d: 5, roof: 'lid', win: [1, 3], mull: 3, sky: 2, bands: [],
        inner: function (x, y, z) { return x === 2 && z === 2 && y >= 3 ? 'P' : null }
      })))
    })
    parts.push(T.at(0, 0, 0, w, 5, d, T.shell({
      w: w, h: 5, d: d, ground: true, roof: 'rim', win: [2, 3], mull: 4, bands: [1],
      inner: function (x, y, z) {
        var k = (z - 1) % 5
        var st = (z - 1) >= 0 && z <= 20 && k <= 4
        if (st && (x === 6 || x === 10) && (k === 0 || k === 4)) return y <= 3 ? 'F' : null
        if (x === 8 && y === 1) return z % 2 === 0 ? 'B' : 'M'
        if (st && k === 2 && abs(x - 8) <= 2 && y === 1 && x !== 8) return 'B'
        if (st && k === 2 && abs(x - 8) <= 2 && y === 2) return 'M'
        return null
      }
    })))
    return { w: w, h: 11, d: d, pal: pal({ A: RHEA, M: RHEA }), fn: T.compose(parts) }
  }

  // femtosecond writer: an optical table running the length of the machine - four amplifier cabinets chained along one beam tube (compressor
  // coil rings at its end) - into a glazed stage hall with the five-axis stage on a pedestal under a gantry beam
  L.femtosecond_writer = function () {
    var parts = [
      T.at(5, 2, 0, 3, 3, 22, function (x, y, z) {
        if (x === 1 && y === 1) return '#'
        return z >= 16 && z % 2 === 1 ? 'C' : 'P'
      })
    ]
    ;[1, 5, 9, 13].forEach(function (z0) {
      parts.push(T.at(3, 1, z0, 7, 5, 4, T.shell({ w: 7, h: 5, d: 4, roof: 'rim', win: [2, 3], mull: 3, bands: [] })))
    })
    parts.push(T.at(3, 0, 0, 7, 2, 31, function (x, y, z) {
      if (y === 0) return 'X'
      return x === 0 || x === 6 ? 'A' : null
    }))
    parts.push(T.at(0, 0, 22, 13, 9, 9, T.shell({
      w: 13, h: 9, d: 9, ground: true, roof: 'rim', win: [3, 4], mull: 3, bands: [1],
      inner: function (x, y, z) {
        var dx = abs(x - 6)
        var dz = z - 4
        if (dx <= 1 && abs(dz) <= 1) return y === 1 ? 'B' : (y === 2 ? 'M' : (dx === 0 && dz === 0 && y <= 5 ? 'P' : null))
        if (y === 6 && dz === 0 && dx <= 4) return 'A'
        if (y >= 1 && y <= 5 && abs(dx) === 4 && dz === 0) return 'P'
        return null
      }
    })))
    return { w: 13, h: 9, d: 31, pal: pal({ A: RHEA, M: RHEA }), fn: T.compose(parts) }
  }

  // x-ray pulse profiler: a telescope - a long ribbed tube raised on pylons over a floor strip, jawed by undulator magnets and
  // banded by one steering coil ring, ending over the detector deck (a low hall) under the glazed detector can
  L.xray_pulse_profiler = function () {
    var parts = [
      T.at(1, 4, 0, 9, 9, 23, function (x, y, z) {
        var dx = x - 4
        var dy = y - 4
        var r = rad(dx, dy)
        if (r < 3.5) {
          if (z === 12 && cheb(dx, dy) === 2) return 'C'
          if (z >= 4 && z <= 18 && z % 2 === 0 && dx === 0 && abs(dy) === 2) return 'A'
          return '#'
        }
        if (r >= 4.5) return ' '
        if (z % 2 === 0) return z % 4 === 0 ? 'A' : 'F'
        return dx === 0 || dy === 0 || abs(dx) === abs(dy) ? 'A' : null
      }),
      T.at(4, 0, 0, 3, 4, 20, function (x, y, z) {
        if (y === 0) return 'X'
        return x === 1 && z % 6 === 2 ? 'F' : null
      }),
      T.at(1, 5, 21, 9, 8, 8, T.shell({
        w: 9, h: 8, d: 8, roof: 'lid', win: [2, 5], mull: 3, sky: 3, bands: [1]
      })),
      T.at(0, 0, 18, 11, 5, 11, T.shell({
        w: 11, h: 5, d: 11, ground: true, roof: 'rim', win: [2, 3], mull: 3, bands: [1],
        inner: function (x, y, z) {
          if (y === 1 && z >= 3 && z <= 7 && abs(x - 5) >= 2 && abs(x - 5) <= 3) return 'B'
          if (y === 2 && z >= 3 && z <= 7 && abs(x - 5) === 3) return 'A'
          return null
        }
      }))
    ]
    return { w: 11, h: 13, d: 29, pal: pal({ A: RHEA }), fn: T.compose(parts) }
  }

  // polarised proton source, in line from the back: the dissociator (a glazed box, RF coils on the beam tube), the sextupole train (open magnet
  // cages round the tube), the storage cell (a domed drum on the axis) and the ice-cryostat hall across the front
  L.polarised_proton_source = function () {
    var parts = [
      T.at(5, 3, 0, 3, 3, 12, function (x, y, z) {
        if (x === 1 && y === 1) return '#'
        return z % 2 === 0 && z >= 2 && z <= 6 ? 'C' : 'P'
      }),
      T.at(2, 0, 0, 9, 8, 7, T.shell({ w: 9, h: 8, d: 7, ground: true, roof: 'lid', win: [2, 5], mull: 3, sky: 3, bands: [1] })),
      T.at(2, 0, 7, 9, 9, 6, function (x, y, z) {
        var dx = x - 4
        var dy = y - 4
        if (y === 0) return abs(dx) <= 1 ? 'X' : null
        var m = cheb(dx, dy)
        if (m === 3 && z % 3 === 0) return 'F'
        if (m === 3 && abs(dx) === 3 && abs(dy) === 3) return 'M'
        if (m === 4 && z % 3 === 0 && (dx === 0 || dy === 0)) return 'A'
        if (m === 2 && dx !== 0 && dy !== 0 && z % 3 === 1 && abs(dx) === 2 && abs(dy) === 2) return 'B'
        return null
      }),
      T.at(1, 0, 12, 11, 11, 11, T.cyl({
        R: 5, h: 9, dome: 2, ground: true, bands: { 4: 'M' }, win: [5, 6],
        inner: function (x, y, z, r) {
          if (r < 0.5) return y <= 2 ? 'B' : 'P'
          if (y === 1 && r >= 2 && r < 3) return 'A'
          return null
        }
      })),
      T.at(0, 0, 22, 13, 4, 5, T.shell({ w: 13, h: 4, d: 5, ground: true, roof: 'lid', win: [2, 2], mull: 3, sky: 3, bands: [1] }))
    ]
    return { w: 13, h: 11, d: 27, pal: pal({ A: CRY, M: RHEA, C: COIL_MH }), fn: T.compose(parts) }
  }

  // positronium condensate lab: the aerogel-target cryostat (a domed drum, Penning trap coil cross and target stack on the axis) at the back
  // between two slim accumulator columns, the laser hall across the front with its tables and mirror posts
  L.positronium_condensate_lab = function () {
    return {
      w: 15, h: 13, d: 17, pal: pal({ A: OPT, M: MH }),
      fn: T.compose([
        T.at(3, 0, 0, 9, 13, 9, T.cyl({
          R: 4, h: 10, dome: 3, ground: true, bands: { 5: 'M', 6: 'M' }, win: [3, 3],
          inner: function (x, y, z, r) {
            var dx = x - 4
            var dz = z - 4
            if (y === 5 && r > 0.5 && r < 1.5 && (dx === 0 || dz === 0)) return 'C'
            if (r < 0.5) return y % 2 === 0 ? 'A' : 'P'
            if (y === 1 && r >= 2 && r < 3) return 'M'
            return null
          }
        })),
        T.at(0, 0, 2, 3, 10, 3, T.cyl({ R: 1, h: 9, dome: 0, ground: true, bands: { 4: 'M' } })),
        T.at(12, 0, 2, 3, 10, 3, T.cyl({ R: 1, h: 9, dome: 0, ground: true, bands: { 4: 'M' } })),
        T.at(0, 0, 9, 15, 5, 8, T.shell({
          w: 15, h: 5, d: 8, ground: true, roof: 'lid', win: [2, 3], mull: 3, sky: 3, bands: [1],
          inner: function (x, y, z) {
            var dx = abs(x - 7)
            if (dx >= 2 && dx <= 5 && z >= 2 && z <= 5) return y === 1 ? 'B' : (y === 2 && (z === 2 || z === 5) ? 'A' : null)
            if (y === 2 && dx === 0 && z <= 5) return 'P'
            return null
          }
        }))
      ])
    }
  }

  // spectral hole burner: a dilution column (slim drum on the axis, stage plates and the ZEFOZ coil cross) inside a wide magnet jacket of
  // field casing, ringed by optics windows, pulse-tube coolers on the lid
  L.spectral_hole_burner = function () {
    return {
      w: 13, h: 17, d: 13, pal: pal({ A: MH, M: OPT, Q: 'stainless_steel' }),
      fn: T.cyl({
        R: 6, h: 14, dome: 3, ground: true, bands: { 3: 'A', 4: 'A', 9: 'A', 10: 'A' }, win: [6, 7],
        inner: function (x, y, z, r) {
          var dx = x - 6
          var dz = z - 6
          if (y === 6 && r > 0.5 && r < 1.5 && (dx === 0 || dz === 0)) return 'C'
          if (r >= 2.5 && r < 3.5 && y <= 8) return 'F'
          if (r < 0.5) return y % 3 === 0 ? 'M' : 'P'
          if (y % 4 === 0 && y <= 8 && r < 3.5) return y % 8 === 0 ? 'A' : 'M'
          return null
        }
      })
    }
  }

  // millikelvin works: a squat magnet base (field casing drum with a flat lid, 9 T bore) carrying a tall dilution column - slim vacuum
  // can, stage plates falling in radius on the rod, domed top with the pulse-tube coolers
  L.millikelvin_cryostat_works = function () {
    return {
      w: 13, h: 23, d: 13, pal: pal({ A: MH, M: OPT, Q: 'stainless_steel' }),
      fn: T.compose([
        T.at(0, 0, 0, 13, 8, 13, T.cyl({
          R: 6, h: 8, ground: true, lid: true, bands: { 3: 'A', 4: 'A', 5: 'A' }, win: [2, 2],
          inner: function (x, y, z, r) { return r < 3.5 && y <= 6 ? (r < 2.5 ? 'P' : 'F') : null }
        })),
        T.at(2, 8, 2, 9, 15, 9, T.cyl({
          R: 4, h: 12, dome: 3, win: [3, 9],
          inner: function (x, y, z, r) {
            if (r < 0.5) return y % 3 === 0 ? 'M' : 'P'
            if (y % 3 === 2 && y <= 9 && r < 4 - Math.floor(y / 3)) return y % 6 === 2 ? 'A' : 'M'
            return null
          }
        }))
      ])
    }
  }

  // droplet radiator works, in the order the metal flows: the melt tank (a domed drum, heater coil on its axis) at the back, an orifice wall
  // of pipe nozzles, a glazed drop chamber, and at the front a bank of tall radiator fins on a spine that catch and shed the heat
  L.droplet_radiator_works = function () {
    return {
      w: 17, h: 13, d: 21, pal: pal({ A: MH, Q: 'tungsten_steel' }),
      fn: T.compose([
        T.at(5, 0, 0, 7, 12, 7, T.cyl({
          R: 3, h: 9, dome: 3, ground: true, bands: { 4: 'A' }, win: [5, 6],
          inner: function (x, y, z, r) {
            if (y === 5 && r < 1.5) return r < 0.5 ? 'P' : 'C'
            if (r < 0.5) return y <= 3 ? 'B' : 'P'
            return null
          }
        })),
        T.at(0, 0, 7, 17, 7, 1, function (x, y, z) {
          if (y === 0) return 'X'
          if (y === 2 && x % 2 === 0) return 'P'
          return x === 0 || x === 16 || y % 2 === 0 ? 'A' : 'F'
        }),
        T.at(0, 0, 8, 17, 7, 8, T.shell({
          w: 17, h: 7, d: 8, ground: true, roof: 'lid', win: [2, 4], mull: 3, sky: 5, bands: [1]
        })),
        T.at(0, 0, 16, 17, 13, 5, function (x, y, z) {
          if (y === 0) return abs(x - 8) <= 1 || x % 3 === 2 ? 'X' : null
          if (x % 3 !== 2) return y === 2 && z === 0 ? 'P' : null
          var top = 8 + (z % 2) + (x === 8 ? 2 : 0)
          if (y > top) return ' '
          if (y === top || z === 0 || z === 4) return 'F'
          return (y + z) % 4 === 0 ? 'F' : 'A'
        })
      ])
    }
  }

  // crust lift: a deep shaft - glazed walls, the lift cage (four frame posts, floor and roof plates) in the middle, rails on the walls and
  // a headframe with the winding wheel on top
  L.crust_lift = function () {
    var w = 9, d = 9, hh = 10, cx = 4, cz = 4
    function crown(x, k, z) {
      var dx = abs(x - cx)
      if (z !== cz) return ' '
      if (k === 0) return dx === 2 || dx === 0 ? 'A' : ' '
      if (k === 1) return dx === 1 || dx === 2 ? 'A' : ' '
      return dx === 0 ? 'C' : (dx === 1 ? 'A' : ' ')
    }
    return {
      w: w, h: hh + 3, d: d, pal: pal({ A: RHEA, C: COIL_MH, Q: 'tungsten_steel' }),
      fn: T.compose([
        T.at(0, hh, 0, w, 3, d, crown),
        T.at(0, 0, 0, w, hh, d, T.shell({
          w: w, h: hh, d: d, ground: true, roof: 'lid', win: [4, 6], mull: 3, sky: 3, bands: [1, 8],
          inner: function (x, y, z) {
            var dx = x - cx
            var dz = z - cz
            var cage = y >= 4 && y <= 6
            if (abs(dx) === 1 && abs(dz) === 1) return cage ? 'Q' : null
            if (cage && cheb(dx, dz) === 1 && y === 4) return 'A'
            if (cage && cheb(dx, dz) <= 1 && y === 6) return 'A'
            if (dx === 0 && dz === 0 && y >= 7) return 'P'
            if (abs(dx) === 3 && dz === 0 && y >= 2) return 'P'
            return null
          }
        }))
      ])
    }
  }

  // neutron-drip separator: a glazed hall with three centrifuge drums in a line and heat-sink pipes on the roof
  L.neutron_drip_separator = function () {
    var w = 9, d = 11, hh = 6, cx = 4
    return {
      w: w, h: hh + 2, d: d, pal: pal({ A: SITE, C: COIL_MH, Q: 'tungsten_steel' }),
      fn: T.hall({
        w: w, d: d, hh: hh, mull: 4, crown: T.sink(w, d),
        inner: function (x, y, z) {
          var dx = x - cx
          if (z % 4 === 2 && abs(dx) <= 1 && z > 1) {
            if (y === 1) return 'B'
            if (y === 2 || y === 3) return abs(dx) === 0 ? 'P' : 'L'
            if (y === 4) return 'C'
          }
          if (dx === 0 && y === 1) return 'P'
          return null
        }
      })
    }
  }

  // neutronium cage: a truncated cube (corners cut to site-casing plates) with glazed faces, a coil cage inside and a core held on pipe struts
  L.neutronium_cage = function () {
    var n = 9, c = 4
    return {
      w: n, h: n, d: n, pal: pal({ A: SITE, C: COIL_MH, Q: 'tungsten_steel' }),
      fn: function (x, y, z) {
        var dx = abs(x - c)
        var dy = abs(y - c)
        var dz = abs(z - c)
        var s = dx + dy + dz
        var m = cheb(cheb(dx, dy), dz)
        if (s >= 10) return ' '
        if (y === 0) return 'X'
        if (s === 9) return 'A'
        if (m === 4) {
          var inner = dx <= 2 && dy <= 2 && dz <= 2
          var edge = (dx === 4 ? 1 : 0) + (dy === 4 ? 1 : 0) + (dz === 4 ? 1 : 0) >= 2
          return edge ? 'Q' : (inner ? 'L' : 'F')
        }
        if (m === 2) {
          var corner = (dx === 2 ? 1 : 0) + (dy === 2 ? 1 : 0) + (dz === 2 ? 1 : 0) >= 2
          return corner ? 'C' : (s === 4 && m === 2 && dx + dz === 0 ? 'A' : null) || '#'
        }
        if (m === 3 && ((dx === 0 && dz === 0) || (dy === 0 && dz === 0) || (dx === 0 && dy === 0))) return 'P'
        if (m === 0) return 'A'
        return '#'
      }
    }
  }

  // r-process decompressor: a ziggurat - stepped terraces ringed with coil collars, a central pressure shaft, floor rim and cross for the parts
  L.r_process_decompressor = function () {
    var w = 15, d = 19, h = 13, cx = 7, cz = 6, dz0 = 13
    function zig(x, y, z) {
      var dx = abs(x - cx)
      var dz = abs(z - cz)
      var ex = cx - Math.floor((y - 1) / 2)
      var ez = cz - Math.floor((y - 1) / 2)
      if (y === 0) return dx === cx || dz === cz || dx === 0 || dz === 0 ? 'X' : ' '
      if (dx > ex || dz > ez) return ' '
      var rim = dx === ex || dz === ez
      if (y === h - 1) return (dx <= 1 && dz <= 1) ? 'L' : (rim ? 'A' : ' ')
      if (rim) {
        if (dx === ex && dz === ez) return 'Q'
        if ((y - 1) % 2 === 0) return 'M'
        return (dx + dz) % 3 === 0 ? 'F' : 'L'
      }
      if (dx === 0 && dz === 0) return 'P'
      if ((y - 1) % 2 === 0 && (dx + dz) % 4 === 0 && y < h - 2) return 'A'
      return '#'
    }
    return {
      w: w, h: h, d: d, pal: pal({ A: RHEA, M: MH, C: COIL_MH, Q: 'tungsten_steel' }),
      fn: T.compose([
        T.at(0, 0, 0, w, h, 13, zig),
        T.at(0, 0, dz0, w, 7, 6, T.shell({
          w: w, h: 7, d: 6, ground: true, roof: 'lid', win: [2, 4], mull: 4, sky: 3, bands: [1, 5],
          inner: function (x, y, z) {
            if (y === 2 && (z === 2 || z === 3) && x % 2 === 1 && x >= 1 && x <= 13) return 'C'
            if (y === 4 && x === 7 && (z === 2 || z === 3)) return 'C'
            if (y === 1 && z === 3 && x % 2 === 0) return 'P'
            return null
          }
        }))
      ])
    }
  }

  // decay-heat vault: a squat armoured vault - a bank of generator blocks under a roof of heat-sink fins, glazed viewing slits
  L.decay_heat_vault = function () {
    var w = 15, d = 17, hh = 8
    return {
      w: w, h: 11, d: d, pal: pal({ A: RHEA, C: COIL_MH, Q: 'tungsten_steel' }),
      fn: T.compose([
        T.at(0, hh, 0, w, 3, d, function (x, k, z) {
          if (x < 1 || x > w - 2 || z < 1 || z > d - 2) return ' '
          if (x % 3 === 1) return k === 2 ? 'Q' : (k === 1 ? 'A' : 'F')
          return k === 0 && z % 4 === 0 && x % 3 === 0 ? 'P' : ' '
        }),
        T.at(0, 0, 0, w, hh, d, T.shell({
          w: w, h: hh, d: d, ground: true, roof: 'rim', win: [3, 4], mull: 4, sky: 5, bands: [1, 6],
          inner: function (x, y, z) {
            var cell = (x - 3) % 4 === 0 && (z - 3) % 4 === 0 && x >= 3 && x <= 11 && z >= 3 && z <= 13
            if (cell) return y === 1 ? 'B' : (y <= 3 ? 'A' : (y === 4 ? 'P' : null))
            if (x === 7 && z === 7 && y === 6) return 'C'
            if ((x === 1 || x === 13) && z % 2 === 0 && y === 1) return 'P'
            return null
          }
        }))
      ])
    }
  }

  // pulsar wind trap: a magnetic torus - a tube of alternating coil and lining rows around an open plasma channel, a lattice spire hub
  L.pulsar_wind_trap = function () {
    var w = 15, d = 31, h = 15, cx = 7, cy = 7
    return {
      w: w, h: h, d: d, pal: pal({ A: RHEA, W: 'gtceu:tungsten_block', C: COIL_MH, Q: 'tungsten_steel' }),
      fn: function (x, y, z) {
        var dx = x - cx
        var dy = y - cy
        var r = rad(dx, dy)
        if (y === 0) return abs(dx) <= 2 ? 'X' : ' '
        var ringSlice = z % 3 === 0
        if (z === 6 || z === 24) {
          if (r >= 6 && r < 7.5) return 'F'
          if (r >= 4.5 && r < 6) return 'A'
        }
        if (z === 15 && r >= 4.5 && r < 5.5) return 'C'
        if (r < 4.5) return r >= 3.5 && ringSlice ? ((z === 3 || z === 27) ? 'W' : 'A') : '#'
        if (r < 5.5) {
          if (ringSlice) return z % 6 === 0 ? 'F' : 'A'
          if (abs(dx) === 0 || abs(dy) === 0 || abs(abs(dx) - abs(dy)) === 0) return 'Q'
          return ' '
        }
        if (ringSlice && dx === 0 && y < cy && r < 7.5) return 'Q'
        if (ringSlice && z % 6 === 0 && r < 6.5) return 'F'
        return ' '
      }
    }
  }

  // levitation melter: a round induction tower - a base hall, then a glazed tube banded by levitation coils with the crucible and its
  // pipe feed on the axis, a cooling collar on top
  L.levitation_melter = function () {
    var w = 15, d = 15, hb = 6
    return {
      w: w, h: 17, d: d, pal: pal({ A: MH, C: 'grindless:hftacn_coil_block', Q: 'tungsten_steel' }),
      fn: T.compose([
        T.at(2, hb, 2, 11, 11, 11, T.cyl({
          R: 5, h: 7, dome: 4, win: [2, 3], bands: { 4: 'C' },
          inner: function (x, y, z, r) {
            if (y === 4 && r >= 1.5 && r < 2.5) return 'C'
            if (r < 0.5) return y < 3 ? 'B' : (y < 5 ? 'F' : 'P')
            return null
          }
        })),
        T.at(0, 0, 0, w, hb, d, T.shell({
          w: w, h: hb, d: d, ground: true, roof: 'lid', win: [2, 3], mull: 4, sky: 4, bands: [1, 4],
          inner: function (x, y, z) {
            if (y === 1 && (x === 4 || x === 10) && z % 2 === 0) return 'P'
            if (y === 1 && x === 7 && z >= 4 && z <= 10) return 'B'
            return null
          }
        }))
      ])
    }
  }

  // ramp-compression pulser: a pressure vessel - a ribbed drum with coil rings, four rams ending in anvils at mid height, a stepped lid
  L.ramp_compression_pulser = function () {
    var w = 13, hh = 9, cx = 6, cz = 6
    return {
      w: w, h: hh + 3, d: w, pal: pal({ A: 'gtceu:uev_machine_casing', C: 'grindless:coilgun_coil_casing', Q: 'tungsten_steel' }),
      fn: T.drum({
        w: w, d: w, R: 6, hh: hh,
        band: function (y) { return y === 3 || y === 5 || y === 7 ? 'C' : null },
        inner: function (x, y, z, r) {
          var dx = x - cx
          var dz = z - cz
          var axis = (dx === 0 && abs(dz) >= 1) || (dz === 0 && abs(dx) >= 1)
          if (axis && y >= 4 && y <= 5) {
            var a = abs(dx) + abs(dz)
            if (a >= 5) return 'P'
            if (a >= 3) return 'B'
            return null
          }
          if (axis && y === 3 && abs(dx) + abs(dz) >= 5) return 'Q'
          if (axis && y === 6 && abs(dx) + abs(dz) >= 5) return 'Q'
          return null
        },
        crown: function (x, k, z, r) {
          if (k === 0) return r >= 3.5 && r < 6 ? 'F' : ' '
          if (k === 1) return r >= 1.5 && r < 4.5 ? 'A' : ' '
          if (k === 2) return r < 2.5 ? 'L' : ' '
          return ' '
        }
      })
    }
  }

  // matrioshka computer: three nested lattice shells (radiators outside, emitter / TPV shells, logic tiles) round a node core, held by
  // frame spokes; the outer cube's edges are frame
  L.matrioshka_computer = function () {
    var n = 11, c = 5
    return {
      w: n, h: n, d: n,
      pal: pal({
        A: 'grindless:matrioshka_logic_tile', N: 'grindless:matrioshka_node', E: 'grindless:matrioshka_emitter_shell',
        V: 'grindless:matrioshka_tpv_shell', R: 'grindless:droplet_radiator_module', Q: 'tungsten_steel'
      }),
      fn: function (x, y, z) {
        var dx = abs(x - c)
        var dy = abs(y - c)
        var dz = abs(z - c)
        var m = cheb(cheb(dx, dy), dz)
        var lattice = (x + y + z) % 2 === 0
        if (y === 0) return lattice || (dx <= 1 && dz <= 1) ? 'X' : ' '
        if (m === 5) {
          var edge = (dx === 5 ? 1 : 0) + (dy === 5 ? 1 : 0) + (dz === 5 ? 1 : 0) >= 2
          return edge ? 'Q' : (lattice ? 'R' : ' ')
        }
        if (m === 4 && ((dx === 0 && dz === 0) || (dy === 0 && dz === 0) || (dy === 0 && dx === 0))) return 'Q'
        if (m === 3) return lattice ? 'E' : 'V'
        if (m === 1) return dx === 0 && dy === 0 && dz === 0 ? 'N' : 'A'
        if (m === 0) return 'N'
        return '#'
      }
    }
  }

  // Mk5 fusion ring: an octagonal annulus 13 x 7 x 15 round an open plasma channel; coils line the channel, energy cells and glass ports
  // on the outer wall, a pipe course between, frame pylons on the cut corners
  L.uiv_fusion_reactor = function () {
    var W = 13, D = 15, H = 7
    return {
      w: W, h: H, d: D, ring: true,
      fn: function (x, y, z) {
        var ex = x < W - 1 - x ? x : W - 1 - x
        var ez = z < D - 1 - z ? z : D - 1 - z
        if (ex + ez < 3) return ' '
        var e = ex < ez ? ex : ez
        if (e > 2) return y >= 1 && y <= H - 2 ? '#' : ' '
        if (ex + ez === 3) return 'Q'
        if (x === 0 && z === 7 && y === 2) return 'I'
        if (x === W - 1 && z === 7 && y === 2) return 'O'
        if (y === 0) return e === 0 ? 'E' : 'C'
        if (y === H - 1) return e === 1 ? 'A' : 'C'
        if (e === 2) return 'K'
        if (e === 1) return y % 2 === 0 ? 'P' : 'C'
        if (y === 3) return (x + z) % 3 === 0 ? 'C' : 'L'
        return y === 1 || y === 5 ? 'E' : 'L'
      }
    }
  }

  // build(Pat, name, casing, parts) -> the structure spec of a layout
  T.build = function (Pat, name, casing, parts) {
    var lay = L[name]()
    lay.pal.F = casing
    lay.parts = parts
    return T.spec(Pat, lay)
  }
  T.dims = function (name) {
    var lay = L[name]()
    return lay.w + 'x' + lay.h + 'x' + lay.d
  }
})()
