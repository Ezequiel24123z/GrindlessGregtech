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

  // STM lithography cell: a glazed bay under a dome, the scan tower and its probe (coil tip) in the middle, vibration-isolation pads around it
  L.stm_lithography_cell = function () {
    var w = 9, d = 9, hh = 5, cx = 4, cz = 4
    return {
      w: w, h: hh + 3, d: d, pal: pal({ A: 'gtceu:uev_machine_casing' }),
      fn: T.hall({
        w: w, d: d, hh: hh, mull: 4, crown: T.dome(w, d, 3),
        inner: function (x, y, z) {
          var dx = x - cx
          var dz = z - cz
          if (dx === 0 && dz === 0) return y === 3 ? 'C' : (y === 1 ? 'B' : 'Q')
          if (y === 1 && cheb(dx, dz) === 2 && (dx === 0 || dz === 0)) return 'B'
          if (y === 1 && cheb(dx, dz) === 1) return 'A'
          return null
        }
      })
    }
  }

  // TFLN fab: a cleanroom hall with two rows of process bays (machine blocks under hoods of pipe) and a roof ridge
  L.tfln_fab = function () {
    var w = 13, d = 11, hh = 6
    return {
      w: w, h: hh + 3, d: d, pal: pal({ A: 'gtceu:uev_machine_casing' }),
      fn: T.hall({
        w: w, d: d, hh: hh, mull: 3, crown: T.sink(w, d),
        inner: function (x, y, z) {
          var bay = (x === 3 || x === 9) && z % 3 === 1 && z > 1 && z < d - 2
          if (bay) return y === 1 ? 'B' : (y === 2 ? 'A' : (y === 3 ? 'P' : null))
          if (x >= 4 && x <= 8 && z === 5 && y === 1) return x === 6 ? 'C' : 'P'
          return null
        }
      })
    }
  }

  // femtosecond writer: a long beamline - portal frames every fourth slice, the pulse compressor coils banding the tube
  L.femtosecond_writer = function () {
    return {
      w: 9, h: 7, d: 21, pal: pal({ A: 'gtceu:uev_machine_casing', Q: 'titanium' }),
      fn: T.beamline({ w: 9, h: 7, d: 21, ty: 3, pz: 4, ring: 2, jaws: true })
    }
  }

  // x-ray pulse profiler: an undulator - the same drawn-out line, narrower, magnets jawing the tube
  L.xray_pulse_profiler = function () {
    return {
      w: 7, h: 9, d: 17, pal: pal({ Q: 'stainless_steel' }),
      fn: T.beamline({ w: 7, h: 9, d: 17, ty: 4, pz: 4, ring: 0, jaws: true })
    }
  }

  // polarised proton source: a linac with RF cavity rings and, at the back, the source bottle (glass cube around a coil core)
  L.polarised_proton_source = function () {
    var w = 9, h = 8, d = 15, cx = 4
    return {
      w: w, h: h, d: d, pal: pal({ C: COIL_MH, Q: 'stainless_steel' }),
      fn: T.beamline({
        w: w, h: h, d: d, ty: 3, pz: 3, ring: 1,
        extra: function (x, y, z) {
          if (z > 4 || y === 0) return null
          var dx = abs(x - cx)
          if (z === 0 || (dx === 3 && z <= 4) || y === 6 || (y === 1 && z <= 4 && dx <= 3)) {
            if (y > 6 || dx > 3) return null
            if (y === 1) return z === 2 && dx <= 1 ? 'X' : 'F'
            if (dx === 3 && z === 4 && y !== 6) return 'Q'
            return (dx === 3 && z === 0) || (y === 6) ? 'A' : 'L'
          }
          if (dx === 0 && z === 2 && y >= 2 && y <= 5) return y === 3 ? 'C' : 'B'
          return null
        }
      })
    }
  }

  // positronium condensate lab: a trap hall, the Penning trap (coil triplet around a pipe) in the middle, a mast over it
  L.positronium_condensate_lab = function () {
    var w = 11, d = 9, hh = 5, cx = 5, cz = 4
    return {
      w: w, h: hh + 4, d: d, pal: pal({ A: 'grindless:cryostat_casing', Q: 'stainless_steel' }),
      fn: T.hall({
        w: w, d: d, hh: hh, mull: 3, crown: T.spire(w, d, 4),
        inner: function (x, y, z) {
          var dx = x - cx
          var dz = z - cz
          if (dz === 0 && dx === 0) return y === 2 ? 'C' : 'P'
          if (dz === 0 && abs(dx) === 1 && y === 2) return 'C'
          if (dz === 0 && abs(dx) >= 2 && abs(dx) <= 4 && y === 1) return abs(dx) % 2 === 0 ? 'B' : 'P'
          if (dz === 0 && abs(dx) <= 1 && y === 3) return 'A'
          return null
        }
      })
    }
  }

  // spectral hole burner / millikelvin works: a cryostat stack - a vacuum can with window slits, stage plates of falling radius on a
  // central rod, pulse-tube coolers on the lid
  function cryo(w, h, stages, magnetBand) {
    var cx = (w - 1) / 2
    var R = cx
    var step = Math.floor((h - 3) / stages)
    return T.drum({
      w: w, d: w, R: R, hh: h - 2,
      band: function (y) { return magnetBand && y >= h - 5 && y <= h - 4 ? 'C' : null },
      inner: function (x, y, z, r) {
        var dx = x - cx
        var dz = z - cx
        if (r < 0.5) return y % step === 0 ? 'C' : 'P'
        var s = (y - 1) % step === step - 1 ? Math.floor((y - 1) / step) : -1
        if (s >= 0 && s < stages && r <= R - 1 - s * (R - 2) / stages) return s % 2 === 0 ? 'A' : 'F'
        if (abs(dx) === 1 && abs(dz) === 1 && y >= 2 && y < h - 3 && y % step !== step - 1) return null
        return null
      },
      crown: function (x, k, z, r) {
        var dx = abs(x - cx)
        var dz = abs(z - cx)
        if (r > R - 0.5) return ' '
        if (k === 0) return 'A'
        if (dx === 0 && dz === 0) return k <= 2 ? 'Q' : ' '
        if (dx === 2 && dz === 2 && (cx >= 3)) return k <= 2 ? (k === 1 ? 'B' : 'P') : ' '
        if (dx === 0 && dz === 2 && cx >= 3 && k === 1) return 'P'
        return ' '
      }
    })
  }
  L.millikelvin_cryostat_works = function () {
    var w = 9, h = 14
    return { w: w, h: h, d: w, pal: pal({ A: 'gtceu:uev_machine_casing', C: COIL_MH, Q: 'stainless_steel' }), fn: cryo(w, h, 4, true) }
  }
  L.spectral_hole_burner = function () {
    var w = 7, h = 10
    return { w: w, h: h, d: w, pal: pal({ A: 'gtceu:uev_machine_casing', Q: 'stainless_steel' }), fn: cryo(w, h, 3, false) }
  }

  // droplet radiator works: a fin array - serrated radiator fins standing on foot rails, a pipe header across the back, a service spine
  // down the middle. The front stays open (vacuum).
  L.droplet_radiator_works = function () {
    var w = 13, h = 9, d = 13, cx = 6
    return {
      w: w, h: h, d: d, pal: pal({ A: 'grindless:droplet_radiator_module', Q: 'tungsten_steel' }),
      fn: function (x, y, z) {
        var fin = x % 3 === 0
        if (y === 0) return abs(x - cx) <= 1 ? 'X' : (fin ? 'F' : ' ')
        if (z === 0 && y === 2) return 'P'
        if (z === 0 && y === 1 && x % 3 === 0) return 'C'
        if (!fin) return ' '
        var top = 4 + (z % 2 === 0 ? 2 : 1) + (x === cx ? 1 : 0)
        if (y > top) return ' '
        if (z === 0 || z === d - 1) return 'Q'
        if (y === top) return 'F'
        if (y === 3 && z % 4 === 2) return 'P'
        return y % 2 === 1 ? 'A' : 'L'
      }
    }
  }

  // crust lift: a deep shaft - glazed walls, the lift cage (four frame posts, floor and roof plates) in the middle, rails on the walls and
  // a headframe with the winding wheel on top
  L.crust_lift = function () {
    var w = 9, d = 9, hh = 10, cx = 4, cz = 4
    return {
      w: w, h: hh + 3, d: d, pal: pal({ A: SITE, C: COIL_MH, Q: 'tungsten_steel' }),
      fn: T.hall({
        w: w, d: d, hh: hh, mull: 4, crown: function (x, k, z) {
          var dx = abs(x - cx)
          if (z !== cz) return ' '
          if (k === 0) return dx === 2 || dx === 0 ? 'Q' : ' '
          if (k === 1) return dx === 1 ? 'Q' : (dx === 2 ? 'Q' : ' ')
          return dx === 0 ? 'C' : (dx === 1 ? 'Q' : ' ')
        },
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
      })
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
    var w = 11, d = 13, h = 10, cx = 5, cz = 6
    return {
      w: w, h: h, d: d, pal: pal({ A: SITE, C: COIL_MH, Q: 'tungsten_steel' }),
      fn: function (x, y, z) {
        var dx = abs(x - cx)
        var dz = abs(z - cz)
        var level = y === 0 ? 0 : Math.floor((y - 1) / 2)
        var inset = level
        var ex = cx - inset
        var ez = cz - inset
        if (y === 0) {
          var onRim = dx === cx || dz === cz
          return onRim || dx === 0 || dz === 0 ? 'X' : ' '
        }
        if (dx > ex || dz > ez) return ' '
        var rim = dx === ex || dz === ez
        var top = y === h - 1
        if (top) return (dx <= 1 && dz <= 1) ? ((dx === 0 && dz === 0) ? 'C' : 'L') : (rim ? 'A' : ' ')
        if (rim) {
          if (dx === ex && dz === ez) return 'Q'
          if ((y - 1) % 2 === 0) return 'C'
          return (dx + dz) % 3 === 0 ? 'F' : 'L'
        }
        if (dx === 0 && dz === 0) return 'P'
        if ((y - 1) % 2 === 0 && (dx + dz) % 4 === 0 && y < h - 2) return 'A'
        return '#'
      }
    }
  }

  // decay-heat vault: a squat armoured vault - a bank of generator blocks under a roof of heat-sink fins, glazed viewing slits
  L.decay_heat_vault = function () {
    var w = 9, d = 9, hh = 5, cx = 4
    return {
      w: w, h: hh + 3, d: d, pal: pal({ A: SITE, C: COIL_MH, Q: 'tungsten_steel' }),
      fn: T.hall({
        w: w, d: d, hh: hh, mull: 2, crown: T.sink(w, d),
        inner: function (x, y, z) {
          var dx = x - cx
          var dz = z - 4
          if (cheb(dx, dz) <= 1 && y <= 2) return y === 1 ? 'B' : (dx === 0 && dz === 0 ? 'C' : 'A')
          if (abs(dx) === 3 && z % 2 === 0 && y === 1) return 'P'
          if (cheb(dx, dz) <= 1 && y === 3) return 'P'
          return null
        }
      })
    }
  }

  // pulsar wind trap: a magnetic torus - a tube of alternating coil and lining rows around an open plasma channel, a lattice spire hub
  L.pulsar_wind_trap = function () {
    var w = 13, d = 13, h = 9, cx = 6, cz = 6
    return {
      w: w, h: h, d: d, pal: pal({ A: 'gtceu:tungsten_block', C: COIL_MH, Q: 'tungsten_steel' }),
      fn: function (x, y, z) {
        var dx = x - cx
        var dz = z - cz
        var r = rad(dx, dz)
        if (r < 2.5) {
          if (dx === 0 && dz === 0) return y >= 1 && y <= h - 2 ? (y === h - 2 ? 'C' : 'Q') : (y === 0 ? 'X' : ' ')
          if (y === 0 && r < 1.5) return 'X'
          return ' '
        }
        if (r > 6.4) return ' '
        if (r < 3.5) return (y === 1 || y === 4) ? 'P' : ' '
        if (y === 0) return 'X'
        var t = r < 4.5 ? 0 : (r < 5.5 ? 1 : 2)
        if (y === h - 1) return t === 1 ? 'L' : 'A'
        if (t === 1) return '#'
        return (y - 1) % 4 < 2 ? 'C' : 'A'
      }
    }
  }

  // levitation melter: a round induction tower - a base hall, then a glazed tube banded by levitation coils with the crucible and its
  // pipe feed on the axis, a cooling collar on top
  L.levitation_melter = function () {
    var w = 9, d = 9, hb = 3, hh = 11, cx = 4, cz = 4
    var base = T.hall({ w: w, d: d, hh: hb, mull: 4 })
    return {
      w: w, h: hh, d: d, pal: pal({ A: 'gtceu:uev_machine_casing', C: 'grindless:hftacn_coil_block', Q: 'tungsten_steel' }),
      fn: function (x, y, z) {
        if (y < hb) return base(x, y, z)
        var r = rad(x - cx, z - cz)
        var k = y - hb
        if (r > 3.5) return ' '
        var top = y === hh - 1
        if (r >= 2.5) {
          if (top) return 'A'
          if (k % 3 === 0) return 'C'
          return k % 3 === 1 ? 'L' : 'F'
        }
        if (top) return r < 1.5 ? 'P' : 'A'
        if (r < 0.5) return k < 2 ? 'B' : (k < 5 ? 'F' : 'P')
        return '#'
      }
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
