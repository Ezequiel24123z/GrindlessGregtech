// priority: -6825
// -----------------------------------------------------------------------------------------------
// OpV structure shapes (D5-SHAPE-OPV-A, docs/eras/lines-opv-maxplus.md section 6.1): the silhouettes of OpV's home and Cygnus machines at
// their new scale, drawn with the OpV casing family (opv/foundation.js). A shape is fn(x, y, z) -> one char: x runs left to right, y bottom
// to top, z back (0) to front (depth - 1). The era files call G.opvShapes.spec(...) from inside their machine registry callback, never at
// load time (this file may load after them).
//
// Chars: S controller, X casing-or-part cell, '#' air, ' ' anything (outside the silhouette); every other char is a block named in the
// machine's pal (F is the appearance casing). Geometry limit (lib/patterns.js): at most 64 rows per slice.
(function () {
  var G = global.grindless || (global.grindless = {})
  var T = G.opvShapes || (G.opvShapes = {})

  function abs(n) { return n < 0 ? -n : n }
  function cheb(a, b) { return abs(a) > abs(b) ? abs(a) : abs(b) }

  // slices back -> front, rows bottom -> top; the controller is put at ctl (default: middle, row 1) of the front slice
  T.slices = function (w, h, d, fn, ctl) {
    var cx = ctl ? ctl[0] : (w - 1) / 2
    var cy = ctl ? ctl[1] : 1
    var slices = []
    for (var z = 0; z < d; z++) {
      var rows = []
      for (var y = 0; y < h; y++) {
        var row = ''
        for (var x = 0; x < w; x++) {
          var ch = fn(x, y, z)
          if (ch === undefined || ch === null || ch === '') ch = ' '
          if (z === d - 1 && y === cy && x === cx) ch = 'S'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // o: { w, h, d, fn, pal: { F: casing, any other char: block id, or a bare material name for a GT frame }, parts: [Pat.part(...)], ctl: [x, y] }
  T.spec = function (Pat, o) {
    var casing = Pat.block(o.pal.F)
    var symbols = { S: Pat.controller(), X: Pat.oneOf.apply(null, [casing].concat(o.parts)), F: casing, '#': Pat.air() }
    Object.keys(o.pal).forEach(function (ch) {
      if (ch === 'F') return
      symbols[ch] = o.pal[ch].indexOf(':') < 0 ? Pat.frame(o.pal[ch]) : Pat.block(o.pal[ch])
    })
    return { slices: T.slices(o.w, o.h, o.d, o.fn, o.ctl), symbols: symbols }
  }

  // the front disc of a sphere: the controller in the middle, the hatch cells in a ring round it, casing outside
  function disc(r2, rx) { return r2 === 0 ? 'S' : (r2 <= rx ? 'X' : 'F') }

  // ---------------------------------------------------------------- the layouts: name -> { w, h, d, fn, ctl }
  // pal chars: F appearance casing, Y chain lamina, T TPV wall, K the layout's own (cavity, field-frozen or SRF), N NEG, A shield,
  // G glass, C coil, W water, P pipe, Q frame, D plascrete
  var L = {}
  T.layouts = L

  // Kugelblitz forge: a two-shell sphere, 23 cubed. The cavity shell (K, kugelblitz cavity casing) holds the hole; round it a gap with the
  // shield struts (A) and one equatorial coil ring (C), a lamina lattice (Y) and the field-frozen skin (F). Eight glass arms (G) run
  // along the cube diagonals; the sphere stands on a lamina cradle of four legs and a floor frame.
  L.kugelblitz_forge = function () {
    var n = 23
    var c = 11
    return {
      w: n, h: 17, d: n, ctl: [c, 8],
      fn: function (x, y, z) {
        var dx = x - c
        var dy = (y - 8) * 11 / 8
        var dz = z - c
        var d2 = dx * dx + dy * dy + dz * dz
        if (d2 > 132.25) {
          if (abs(dx) === 8 && abs(dz) === 8 && y <= 4) return y % 3 === 2 ? 'P' : 'Y'
          if (y === 0 && cheb(dx, dz) <= 8 && (abs(dx) === 8 || abs(dz) === 8)) return 'Y'
          if (y === 1 && cheb(dx, dz) <= 8 && abs(dx) === 8 && abs(dz) === 8) return 'Y'
          return ' '
        }
        var r2 = dx * dx + dy * dy
        if (z === 22) return disc(r2, 5)
        if (abs(dx) === abs(dz) && Math.round(abs(dy)) === abs(dx) && abs(dx) >= 2) return 'G'
        if (d2 <= 42.25) return '#'
        if (d2 <= 72.25) return 'K'
        if (d2 <= 90.25) {
          if (dy === 0 && d2 > 72.25) return 'C'
          return (x + y + z) % 3 === 0 ? '#' : 'A'
        }
        if (d2 <= 110.25) return (x + y + z) % 2 === 0 ? 'Y' : '#'
        return 'F'
      }
    }
  }

  // Annihilation engine: a sphere in a cage, 17 cubed. The NEG chamber (N) in the middle, the absorber shell (F shield), two magnetic
  // nozzle rings of coils (C) round the shell, the TPV wall (T) outside, and a lamina cage (Y) of cube edges.
  L.annihilation_engine = function () {
    var n = 17
    var c = 8
    return {
      w: n, h: n, d: n, ctl: [c, c],
      fn: function (x, y, z) {
        var dx = x - c
        var dy = y - c
        var dz = z - c
        var d2 = dx * dx + dy * dy + dz * dz
        if (d2 > 72.25) {
          var ex = abs(dx) >= 7 ? 1 : 0
          var ey = abs(dy) >= 7 ? 1 : 0
          var ez = abs(dz) >= 7 ? 1 : 0
          if (ex + ey + ez >= 2 && !(ex + ey + ez === 3 && (abs(dx) + abs(dy) + abs(dz)) % 2 === 1)) return (abs(dx) + abs(dy) + abs(dz)) % 5 === 0 ? 'P' : 'Y'
          if (ex + ey + ez === 1 && abs(dx) + abs(dy) + abs(dz) === 8 && (abs(dx) === 8 || abs(dy) === 8 || abs(dz) === 8)) return 'Y'
          return ' '
        }
        var r2 = dx * dx + dy * dy
        if (z === 16) return disc(r2, 8)
        if (z === 0 && r2 <= 1) return 'G'
        if (d2 <= 6.25) return '#'
        if (d2 <= 20.25) return 'N'
        if (d2 <= 30.25) return '#'
        if (d2 <= 49) return 'F'
        if (d2 <= 56.25) return abs(dz) === 3 ? 'C' : '#'
        return 'T'
      }
    }
  }

  // Hawking collector: a sphere, 17 cubed. A field-frozen core cage (K) at the centre on lamina struts and plates (Y), an absorber ring
  // of coils (C) in the shield layer (F shield), and a TPV wall (T) with six glass ports on the axes.
  L.hawking_collector = function () {
    var n = 17
    var c = 8
    return {
      w: n, h: n, d: n, ctl: [c, c],
      fn: function (x, y, z) {
        var dx = x - c
        var dy = y - c
        var dz = z - c
        var d2 = dx * dx + dy * dy + dz * dz
        if (d2 > 72.25) return ' '
        var r2 = dx * dx + dy * dy
        if (z === 16) return disc(r2, 8)
        var zeros = (dx === 0 ? 1 : 0) + (dy === 0 ? 1 : 0) + (dz === 0 ? 1 : 0)
        if (d2 > 56.25) return zeros === 2 && d2 > 60 ? 'G' : 'T'
        var m = cheb(cheb(dx, dy), dz)
        if (d2 <= 12.25 || m <= 3) {
          if (m === 3) return 'K'
          return m < 3 && d2 <= 12.25 && zeros === 2 && m >= 2 ? 'K' : '#'
        }
        if (d2 <= 25) return (x + y + z) % 2 === 0 ? 'K' : '#'
        if (d2 <= 36) return zeros >= 1 || (x + y + z) % 2 === 0 ? 'Y' : '#'
        if (dy === 0 && d2 > 42.25) return 'C'
        return 'F'
      }
    }
  }

  // Antihydrogen foundry: a long trap hall, 13 x 11 x 25. NEG walls with glass windows (F NEG, L glass), a lamina floor, a shield roof
  // with the laser enclosure (Y over A) on it, and down the axis the trap: a NEG liner in a shield tube, octupole coil rings (C) every
  // fourth slice, on lamina pedestals.
  L.antihydrogen_foundry = function () {
    var w = 13
    var h = 11
    var d = 25
    return {
      w: w, h: h, d: d,
      fn: function (x, y, z) {
        var dx = x - 6
        var dy = y - 4
        var ex = x === 0 || x === 12
        var ez = z === 0 || z === 24
        if (y >= 9) {
          if (x < 3 || x > 9 || z < 4 || z > 20) return ' '
          if (y === 10) return (x === 3 || x === 9 || z === 4 || z === 20) ? 'Y' : 'A'
          return (x === 3 || x === 9 || z === 4 || z === 20) ? ((z + x) % 4 === 0 ? 'G' : 'Y') : '#'
        }
        if (y <= 1) return ex || ez || y === 0 ? 'Y' : (x === 1 || x === 11 ? 'A' : '#')
        if (y === 8) return 'A'
        var m = cheb(dx, dy)
        if (!(ex || ez)) {
          if (z >= 1 && z <= 23 && m === 1) return 'F'
          if (z >= 1 && z <= 23 && m === 2 && dy >= -2) return z % 4 === 2 ? 'C' : 'A'
          if (m === 3 && dy === -3 && z % 4 === 2) return 'Y'
          if ((x === 1 || x === 11) && y === 2) return 'Y'
          if ((x === 1 || x === 11) && y <= 4) return 'Y'
          if ((x === 1 || x === 11) && y <= 7) return 'A'
          return '#'
        }
        if (ez) {
          if (z === 24 && y <= 3 && x >= 3 && x <= 9) return 'X'
          return m <= 1 ? 'G' : (y % 2 === 0 ? 'Y' : 'F')
        }
        return (y >= 3 && y <= 6 && z % 4 !== 0) ? ((y === 4 || y === 5) && z % 2 === 1 ? 'G' : 'F') : 'Y'
      }
    }
  }

  // Strangelet vault: a chamfered vault, 13 cubed, with a trap column in a borated pool (W water). Field-frozen skin (F), shield inner
  // wall (A), lamina floor and buttresses (Y); the column is a glass tube (L) with coil bands (C).
  L.strangelet_vault = function () {
    var n = 13
    var c = 6
    return {
      w: n, h: n, d: n,
      fn: function (x, y, z) {
        var dx = x - c
        var dz = z - c
        var chamfer = abs(dx) + abs(dz)
        if (chamfer > 9) return ' '
        var m = cheb(dx, dz)
        var edge = m === 6 || chamfer === 9
        var inner = m === 5 || chamfer === 8
        if (y <= 1) return edge || y === 0 ? 'Y' : 'A'
        if (y >= 11) return edge ? 'F' : 'A'
        if (edge) {
          if (z === 12 && y <= 3 && abs(dx) <= 2) return 'X'
          return (chamfer === 9 && y % 3 === 0) ? 'Y' : 'F'
        }
        if (inner) return y <= 6 ? ((y === 3 || y === 5) && chamfer === 8 ? 'N' : 'A') : ((y + x + z) % 4 === 0 ? 'A' : 'F')
        var k = cheb(dx, dz)
        if (k === 1 && y >= 2 && y <= 9) return y % 2 === 0 ? 'C' : 'L'
        if (k === 0) return '#'
        if (y <= 5) return 'W'
        return '#'
      }
    }
  }

  // Antiproton complex: a hexagonal AD ring (a 5-wide beam tube with a lamina yoke, a NEG liner, SRF straights and quadrupole bands of
  // coils) with a smaller ELENA ring inside and a shielded target hall on the back straight, 29 x 7 x 29.
  L.antiproton_decelerator = function () {
    return {
      w: 29, h: 7, d: 29,
      fn: function (x, y, z) {
        var dx = abs(x - 14)
        var dz = abs(z - 14)
        // target hall on the back straight, inside the ring
        if (z >= 5 && z <= 11 && dx <= 6 && z > 4) {
          var hx = dx === 6
          var hz = z === 5 || z === 11
          if (y === 0 || y === 6) return 'A'
          if (hx || hz) return (z === 11 && y >= 2 && y <= 4 && dx <= 2) ? 'G' : 'A'
          if (y === 1 && dx <= 1) return 'K'
          return '#'
        }
        if (z === 28 && y >= 1 && y <= 3 && dx <= 5) return 'X'
        var e = Math.min(14 - dz, (14 - dx - dz / 2) * 0.894)
        if (e >= 0 && e < 5) {
          var i = Math.floor(e)
          return tube(x, y, z, i)
        }
        // ELENA: the inner hexagon
        var ez = abs(z - 17)
        var e2 = Math.min(6 - ez, (8 - dx - ez / 2) * 0.894)
        if (e2 >= 0 && e2 < 3 && z >= 12 && z <= 22) {
          var j = Math.floor(e2)
          if (y === 0 || y === 4) return 'F'
          if (y > 4) return ' '
          if (j !== 1) return (x + z) % 4 === 0 && y >= 1 && y <= 3 ? 'C' : 'F'
          return y === 2 ? '#' : 'N'
        }
        return ' '
      }
    }
  }
  function tube(x, y, z, i) {
    var side = i === 0 || i === 4
    if (y === 0) return 'F'
    if (y === 6) return side ? 'F' : 'A'
    if (side) return (y >= 2 && y <= 4 && (x + z) % 4 === 0) ? 'C' : 'F'
    var m = cheb(i - 2, y - 3)
    if (m === 0) return '#'
    if (m === 1) return (x + z) % 12 === 0 && (x % 2 === 0) ? 'K' : 'N'
    return '#'
  }

  // Jet beam line: a straight beam line, 7 x 7 x 45. A NEG liner (N) round the beam, a lamina yoke (F) with quadrupole doublets (C),
  // SRF modules (K) at three stations, portal frames every sixth slice, corner posts and a rail under the line.
  L.jet_beam_line = function () {
    return {
      w: 7, h: 7, d: 45,
      fn: function (x, y, z) {
        var dx = abs(x - 3)
        var dy = abs(y - 3)
        var m = cheb(dx, dy)
        var corner = dx === 3 && dy === 3
        if (z === 44) return corner ? ' ' : (dx <= 2 && y <= 2 && y >= 1 ? 'X' : 'F')
        if (z === 0) return corner ? ' ' : (m <= 1 ? 'G' : 'F')
        if (m === 0) return '#'
        if (m === 1) return z % 8 === 4 && dx !== dy ? 'G' : 'N'
        if (m === 2) {
          var srf = z % 12 === 11 || z % 12 === 0 || z % 12 === 1
          if (srf && z > 8 && z < 40) return 'K'
          var quad = (z % 6 === 2 || z % 6 === 3) && z > 4 && z < 41
          if (quad && (dx === 0 || dy === 0)) return 'C'
          return 'F'
        }
        if (corner) return 'F'
        if (z % 6 === 0) return 'F'
        if (y === 0 && dx <= 1) return 'F'
        return ' '
      }
    }
  }

  // Strangelet distiller: a beam inlet into a plasma cell, the catcher behind, 11 x 11 x 19. A cylinder along the axis: the inlet tube at
  // the front, the plasma cell (field-frozen skin F, lamina ribs Y, NEG liner N, four coil bands C) in the middle, the catcher at the back,
  // held in a lamina cage of corner posts and braces.
  L.strangelet_distiller = function () {
    return {
      w: 11, h: 11, d: 19,
      fn: function (x, y, z) {
        var dx = x - 5
        var dy = y - 5
        var r = Math.sqrt(dx * dx + dy * dy)
        var big = z >= 6 && z <= 13
        var R = big ? 5.5 : ((z === 5 || z === 14) ? 4.5 : 3.5)
        if (z === 18) return cheb(dx, dy) <= 4 ? (y <= 3 && abs(dx) <= 3 ? 'X' : 'F') : ' '
        if (abs(dx) === 5 && abs(dy) === 5) {
          if (z % 3 === 0) return 'Y'
          return ' '
        }
        if (r > R) {
          if (abs(dx) >= 4 && abs(dy) >= 4) return 'Y'
          if (z % 3 === 0 && cheb(dx, dy) === 5) return 'Y'
          return ' '
        }
        if (z === 18) return r <= 1.5 && y === 1 ? 'X' : (y <= 2 && abs(dx) <= 2 ? 'X' : 'F')
        if (z === 0) return r <= 1.5 ? 'G' : 'F'
        if (r <= 1.5) return '#'
        if (r > R - 1) {
          if (big && (z === 7 || z === 9 || z === 11 || z === 13)) return (x + y) % 2 === 0 ? 'C' : 'Y'
          return z % 2 === 0 ? 'Y' : 'F'
        }
        if (r > R - 2) return 'N'
        if (big) return r > 2.5 ? ((z === 8 || z === 12) ? 'N' : '#') : '#'
        return (z <= 4 || z >= 15) && r > 1.5 ? 'N' : '#'
      }
    }
  }

  // Tetron fab: a cleanroom bay round a dilution-fridge mast, 15 x 11 x 17. A lamina shell with a cleanroom-glass band and plascrete
  // plinth, the mast (a pipe column with coil rings and stage plates) in the middle with its cryostat can on the roof, and two rows of
  // process bays (NEG vacuum cells on frames) along the long walls.
  L.tetron_fab = function () {
    return {
      w: 15, h: 11, d: 17,
      fn: function (x, y, z) {
        var ex = x === 0 || x === 14
        var ez = z === 0 || z === 16
        var dx = x - 7
        var dz = z - 8
        if (y >= 9) {
          if (cheb(dx, dz) > 2) return ' '
          if (y === 9) return cheb(dx, dz) === 2 ? 'F' : (dx === 0 && dz === 0 ? 'P' : '#')
          return dx === 0 && dz === 0 ? 'P' : (cheb(dx, dz) === 1 ? 'C' : ' ')
        }
        if (y === 0) return z === 16 && x >= 4 && x <= 10 ? 'X' : 'F'
        if (y === 1 && cheb(dx, dz) > 2 && !ex && !ez) return 'D'
        if (y === 8) return (ex || ez) ? 'Q' : ((x + z) % 4 === 0 ? 'L' : 'F')
        if (ex && ez) return 'Q'
        if (ex || ez) {
          if (z === 16 && y <= 2 && x >= 4 && x <= 10) return 'X'
          if (y === 1 || y === 7) return 'D'
          return ((ez ? x : z) % 4 === 0) ? 'F' : 'L'
        }
        var m = cheb(dx, dz)
        if (m === 0) return y === 8 ? 'F' : 'P'
        if (m === 1) return (y % 2 === 1) ? 'C' : (y === 2 || y === 6 ? 'F' : '#')
        if (m === 2 && (y === 2 || y === 6 || y === 4)) return 'F'
        if ((x === 3 || x === 11) && z % 3 === 1 && z > 2 && z < 14) return y === 1 ? 'Q' : (y <= 3 ? 'N' : (y === 4 ? 'Q' : '#'))
        if ((x === 1 || x === 13) && y >= 2 && y <= 6) return (z % 2 === 0) ? 'D' : 'N'
        if ((x === 2 || x === 12) && (z === 4 || z === 12) && y <= 4) return 'D'
        return '#'
      }
    }
  }

  // Gamma optics works: a long optical bench, 9 x 9 x 31. A lamina bed, the vacuum tube (a NEG ring with glass windows at its four
  // cardinal points) on frame saddles every fourth slice, the lamina yoke arches over it, the lens frame at the far end and shield caps
  // closing the tube (the end vents of the old bench).
  L.gamma_optics_works = function () {
    return {
      w: 9, h: 9, d: 31,
      fn: function (x, y, z) {
        var dx = x - 4
        var dy = y - 5
        var m = cheb(dx, dy)
        if (y <= 1) return (z === 30 && abs(dx) <= 2 && y === 1) ? 'X' : 'F'
        if (z === 0) return m <= 1 ? 'G' : (m <= 3 ? 'Q' : ' ')
        if (z === 1) return m === 3 ? 'Q' : (m === 2 ? 'A' : (m <= 1 ? 'G' : ' '))
        if (z === 30) return m === 2 ? 'A' : (m <= 1 ? '#' : (m === 3 && abs(dx) <= 2 && y <= 3 ? 'X' : ' '))
        if (m === 2) return (dx === 0 || dy === 0) ? 'L' : 'N'
        if (m === 3) {
          if (y === 2 && z % 4 === 2) return 'Q'
          if (z % 4 === 2) return (abs(dx) === 3 && abs(dy) === 3) ? 'P' : (abs(dx) === 3 || dy === 3 ? 'F' : ' ')
          return abs(dx) === 3 && y === 2 ? 'F' : (dy === 3 && abs(dx) <= 2 && z % 2 === 0 ? 'F' : ' ')
        }
        if (m === 4 && y === 2 && z % 4 === 2) return 'F'
        return m <= 1 ? '#' : ' '
      }
    }
  }

  // ---- D5-SHAPE-OPV-B: the SGR and Terzan 5 machines. F is the chain lamina casing; the other chars are per machine (see each pal).

  // Magnetic pair converter: an open frame along the field lines, 13 x 17 x 13. Field-frozen (K) pylons, hoops and base carry a lamina (F)
  // deck at each end; on the axis the trap: a NEG (N) vessel inside a lamina jacket with glass viewports (G), the field coils (C) on the
  // jacket and tie struts (Q) from the hoops to it. Hatches sit in the front of the base.
  L.magnetic_pair_converter = function () {
    return {
      w: 13, h: 17, d: 13, ctl: [6, 1],
      fn: function (x, y, z) {
        var dx = x - 6
        var dz = z - 6
        var ax = abs(dx)
        var az = abs(dz)
        var m = cheb(dx, dz)
        if (y === 0) return (z === 12 && ax <= 3) ? 'X' : 'K'
        if (y === 16) return m <= 1 && dx === 0 && dz === 0 ? 'G' : 'F'
        if (ax === 6 && az === 6) return (y % 4 === 0) ? 'Q' : 'K'
        if (y === 1) return m === 6 ? 'K' : (m <= 2 ? 'F' : '#')
        if (y === 2 || y === 14) return m <= 5 ? (y === 2 ? 'K' : 'F') : '#'
        if (y === 15) return m === 6 ? 'F' : (m <= 1 ? 'N' : '#')
        if ((y === 4 || y === 8 || y === 12) && m === 6) return 'F'
        if (m === 3 && y >= 3 && y <= 13) {
          if (y === 8 && (dx === 0 || dz === 0)) return 'G'
          if (y % 2 === 1 && (dx === 0 || dz === 0)) return 'C'
          return y % 2 === 0 ? 'K' : 'F'
        }
        if (m <= 2 && m >= 1 && y >= 3 && y <= 13) return m === 1 && dx !== 0 && dz !== 0 ? '#' : (m === 2 ? 'N' : 'N')
        if ((y === 4 || y === 8 || y === 12) && (dx === 0 || dz === 0 || ax === az) && m >= 4 && m <= 5) return 'Q'
        return '#'
      }
    }
  }

  // Field-frozen press: a press frame aligned with the field, 11 x 15 x 11. Lamina (F) bed and head, four GTM high-power casing (H)
  // columns, a ram (Q) with platens through a coil stack (C), a lamina shell with glass (G) viewports round it, and a can bay of
  // framed bays on the front wall. No field-frozen casing: the press makes the plates that casing needs.
  L.field_frozen_press = function () {
    return {
      w: 11, h: 15, d: 11, ctl: [5, 1],
      fn: function (x, y, z) {
        var dx = x - 5
        var dz = z - 5
        var ax = abs(dx)
        var az = abs(dz)
        var m = cheb(dx, dz)
        if (y <= 2) return (y === 0 && z === 10 && ax <= 3) ? 'X' : (y === 2 ? 'H' : 'F')
        if (y >= 12) return (y === 14 && m <= 1) ? 'Q' : (y === 12 ? 'H' : 'F')
        if (ax >= 4 && az >= 4) return 'Q'
        if (m === 0) return 'Q'
        if ((y === 3 || y === 11) && m <= 3) return 'F'
        if (m === 2 && (y === 5 || y === 7 || y === 9)) return 'C'
        if (m === 3) {
          if (dx === 0 || dz === 0) return (y % 2 === 1 && y >= 5 && y <= 9) ? 'G' : 'P'
          return 'P'
        }
        if (m === 1 && (y === 4 || y === 10)) return 'F'
        if (z === 0 && ax <= 3) return 'F'
        if (ax === 5 && az <= 3 && y % 2 === 1) return 'Q'
        if (ax === 5 && az <= 3) return 'F'
        if (z === 10 && ax <= 3 && y <= 7) return y % 4 === 0 ? 'Q' : (ax === 3 ? 'F' : '#')
        return '#'
      }
    }
  }

  // Debris harvester (the field unit): a sweep frame round a sorter drum, 15 x 7 x 15. A lamina (F) sweep ring and arms on the ground,
  // frame (Q) posts and an upper ring, and across the middle the sorter drum, a lamina shell with glass (G) windows driven by steel
  // gearboxes (B) at both ends.
  L.debris_harvester = function () {
    return {
      w: 15, h: 7, d: 15, ctl: [7, 1],
      fn: function (x, y, z) {
        var dx = x - 7
        var dz = z - 7
        var ax = abs(dx)
        var az = abs(dz)
        var m = cheb(dx, dz)
        var dy = y - 3
        var r2 = dy * dy + dz * dz
        if (y === 0) {
          if (z === 14 && ax <= 3) return 'X'
          return m === 7 ? 'F' : ((dx === 0 || dz === 0 || m === 4 || (ax === az && m <= 4)) ? 'R' : (m <= 3 ? 'R' : '#'))
        }
        if (ax >= 3 && ax <= 11 - 0 && x >= 3 && x <= 11 && r2 <= 6) {
          if (r2 <= 1) return (dy === 0 && dz === 0) ? 'B' : '#'
          if (r2 === 5 || r2 === 6) return 'F'
          return (x % 3 === 1 && dy === 0) ? 'G' : 'F'
        }
        if ((x === 2 || x === 12) && r2 <= 6) return 'F'
        if (dz === 0 && dy === 0 && (x <= 1 || x >= 13)) return 'B'
        if (dz === 0 && dy === 0 && (x === 0 || x === 14)) return 'Q'
        if (ax === 7 && az === 7) return y === 6 ? 'F' : 'Q'
        if (m === 7 && y === 6) return 'Q'
        if (m === 7 && y === 4 && (ax === 0 || az === 0)) return 'Q'
        if (y === 1 && (m === 6 || m === 5) && az >= 3) return 'F'
        if (y === 2 && m === 6 && az >= 3 && ax % 2 === 0) return 'F'
        if ((z === 2 || z === 12) && y === 2 && x >= 2 && x <= 12) return 'R'
        if ((z === 1 || z === 13) && y === 1 && x >= 2 && x <= 12) return 'F'
        if ((z === 1 || z === 13) && y === 3 && ax <= 5) return 'Q'
        if (y === 5 && m <= 6 && m >= 5 && ax >= 3) return 'F'
        return '#'
      }
    }
  }

  // Replication refinery: a carbonyl column beside the field-frozen cells, 13 x 15 x 13. A lamina (F) bed and roof, the column (a
  // TPV-walled tower, T, with pipe (P) risers, tray decks and vent crown V) at the right, a bank of field-frozen cell boxes (K) at the
  // left linked by pipe runs, and frame (Q) columns.
  L.replication_refinery = function () {
    return {
      w: 13, h: 15, d: 13, ctl: [6, 1],
      fn: function (x, y, z) {
        var dx = x - 6
        var dz = z - 6
        var ax = abs(dx)
        var az = abs(dz)
        var m = cheb(dx, dz)
        if (y <= 1) return (y === 0 && z === 12 && ax <= 3) ? 'X' : 'F'
        if (y === 14) return (dx >= 1 && dx <= 5 && abs(dz) <= 2) ? ((dx === 3 && dz === 0) ? 'V' : 'T') : 'F'
        if (y === 13) {
          if (dx >= 1 && dx <= 5 && az <= 2) return (dx % 2 === 1 && az % 2 === 0) ? 'V' : 'T'
          if (dx <= -1 && dx >= -5 && az <= 4) return 'K'
          return m === 6 ? 'F' : '#'
        }
        var cx = dx - 3
        var cm = cheb(cx, dz)
        if (cm <= 2) {
          if (cm === 2) return (y % 4 === 3 && (cx === 0 || dz === 0)) ? 'G' : 'T'
          if (cm === 0) return 'P'
          return y % 3 === 0 ? 'F' : '#'
        }
        if (dx <= -1 && dx >= -5 && az <= 4) {
          var bx = (dx + 5) % 4
          var bz = (dz + 4) % 4
          var by = (y - 2) % 4
          if (y <= 12 && bx !== 3 && bz !== 3 && by !== 3) {
            if (bx === 0 || bx === 2 && false) return 'K'
            return (bx === 1 && bz === 1 && by === 1) ? '#' : 'K'
          }
          if (y === 5 && dz === 0) return 'P'
          return '#'
        }
        if (y === 6 && dz === 0 && dx >= -1 && dx <= 1) return 'P'
        if (ax === 6 && az === 6) return 'Q'
        if (z === 0 && ax <= 5 && y <= 9) return 'N'
        if (x === 0 && az <= 5 && y <= 9) return (y + z) % 4 === 0 ? 'G' : 'F'
        if (x === 12 && az <= 5 && y <= 9) return 'N'
        return '#'
      }
    }
  }

  // Von Neumann foundry: a replicator bay, 17 x 13 x 17. A seed core (K, field-frozen shell) hangs in the middle of the hall on four
  // frame (Q) rails; four assembly cradles (lamina decks, F) with frame gantries stand round it, the hall is a lamina shell with a
  // glass (G) clerestory and frame piers.
  L.von_neumann_foundry = function () {
    return {
      w: 17, h: 13, d: 17, ctl: [8, 1],
      fn: function (x, y, z) {
        var dx = x - 8
        var dz = z - 8
        var ax = abs(dx)
        var az = abs(dz)
        var m = cheb(dx, dz)
        var dy = y - 6
        if (y <= 1) return (y === 0 && z === 16 && ax <= 3) ? 'X' : (y === 0 ? 'F' : 'R')
        if (y === 12) return m <= 7 ? 'F' : '#'
        var r2 = dx * dx + dy * dy + dz * dz
        if (r2 <= 26) {
          if (r2 <= 6) return '#'
          if (r2 <= 18) return 'K'
          return (dx === 0 || dz === 0 || dy === 0) ? 'Q' : '#'
        }
        if (m === 8) {
          if (ax === 8 && az === 8) return 'Q'
          if (y === 11) return 'F'
          if (y >= 8 && y <= 10) return ((ax + az) % 3 === 0 ? 'G' : 'F')
          return y === 2 ? 'F' : ((ax + az) % 4 === 0 ? 'Q' : 'F')
        }
        if (m === 7 && (ax + az) % 5 === 0 && y <= 11) return 'Q'
        if (ax >= 4 && ax <= 6 && az >= 4 && az <= 6) {
          if (y === 2) return 'E'
          if (y === 3 && (ax === 4 || az === 4 || ax === 6 || az === 6)) return 'B'
          if (y >= 4 && y <= 7 && ax === 6 && az === 6) return 'Q'
          if (y === 8 && ax >= 5 && az >= 5) return 'Q'
          return '#'
        }
        if (y === 5 && (dx === 0 || dz === 0 || ax === az) && m >= 4) return 'Q'
        if (y === 2 && m >= 3 && m <= 7 && (ax + az) % 2 === 0) return 'E'
        if ((y === 4 || y === 10) && m === 7) return 'F'
        if (y === 7 && m === 7) return 'F'
        if (y === 11 && m === 7) return 'F'
        if (y === 8 && (m === 6 || m === 5) && (ax === 0 || az === 0)) return 'Q'
        return '#'
      }
    }
  }

  // Collector node works: a film line hall, 13 x 9 x 21. A lamina (F) floor and roof, a TPV (T) skin along one side and the roof strips,
  // glass (G) clerestory, and down the middle the line itself: two frame (Q) conveyor beds with roller pipes (P) every third slice.
  L.collector_node_works = function () {
    return {
      w: 13, h: 9, d: 21, ctl: [6, 1],
      fn: function (x, y, z) {
        var dx = x - 6
        var ax = abs(dx)
        var ex = x === 0 || x === 12
        var ez = z === 0 || z === 20
        if (y === 0) return (z === 20 && ax <= 3) ? 'X' : 'F'
        if (y === 8) return (ex || ez || x % 4 === 2) ? 'F' : ((x % 4 === 0 || z % 4 === 2) ? 'T' : 'G')
        if (ex || ez) {
          if (ex && ez) return 'Q'
          if (z === 20 && ax <= 3 && y <= 2) return 'X'
          if (y >= 5 && y <= 6) return ex ? 'G' : (ax <= 3 ? 'G' : 'F')
          return (x === 12) ? 'T' : 'F'
        }
        if (y === 1 && (ax === 3 || ax === 4) && z >= 2) return 'Q'
        if (y === 1 && ax <= 2 && z >= 2 && z <= 18 && z % 6 !== 3) return 'D'
        if (y === 1 && ax === 5 && z >= 1 && z <= 19) return 'D'
        if (y === 4 && ax >= 4 && ax <= 5 && z >= 2 && z <= 18) return 'F'
        if (y === 2 && ax === 3 && z % 3 === 1) return 'P'
        if (y === 2 && ax === 4 && z % 3 === 1) return 'P'
        if (y === 3 && ax <= 4 && ax >= 3 && z % 3 === 1) return 'Q'
        if (y === 1 && ax <= 2 && z % 6 === 3) return 'F'
        if (y <= 6 && ax === 5 && z % 5 === 2) return 'Q'
        if (y === 7 && ax <= 5 && z % 4 === 2) return 'Q'
        return '#'
      }
    }
  }

  // Bulge collector: a receiving dish ring, 31 x 9 x 31. A bowl rising from the hub to the rim, its collecting skin of TPV wall (T)
  // over a lamina (F) backing, a glass (G) lens ring over the skin, a hub tower of lamina with a coil (C) collar, frame (Q) spokes
  // and a ring of legs under the bowl; hatches on the front rim.
  L.bulge_collector = function () {
    return {
      w: 31, h: 9, d: 31, ctl: [15, 1],
      fn: function (x, y, z) {
        var dx = x - 15
        var dz = z - 15
        var r2 = dx * dx + dz * dz
        var r = Math.sqrt(r2)
        var ax = abs(dx)
        if (r > 15.6) return ' '
        if (r <= 2.5) {
          if (y === 8) return r2 <= 2 ? 'G' : 'C'
          if (y === 7) return r2 >= 5 ? 'C' : 'G'
          if (r2 === 0) return y <= 6 ? 'Q' : '#'
          return y <= 1 ? 'F' : (y % 2 === 0 ? 'F' : (r2 <= 2 ? '#' : 'F'))
        }
        if (r >= 13.5 && y <= 1) return (z === 30 && ax <= 3) ? 'X' : (y === 0 ? 'F' : ((x + z) % 3 === 0 ? 'Q' : 'F'))
        if (r < 4.5) return (y === 1 && (dx === 0 || dz === 0 || ax === abs(dz))) ? 'Q' : '#'
        var s = 2 + Math.floor((r - 4.5) * 4.9 / 11)
        if (y === s) return 'T'
        if (y === s - 1) return r >= 9 ? 'T' : 'F'
        if (y === s - 2 && r >= 5.5) return ((ax + abs(dz)) % 3 === 0 || r < 6) ? 'F' : '#'
        if (y === s + 1 && r >= 7.5 && r <= 12.5) return (r2 % 5 === 0) ? 'G' : '#'
        if (y < s - 2 && r > 5 && ((dx === 0 || dz === 0) || (ax === abs(dz)) || r >= 12 && r < 14.5 && (x + z) % 4 === 0)) return (y % 3 === 0) ? 'Q' : 'F'
        return '#'
      }
    }
  }

  T.build = function (Pat, name, pal, parts) {
    var lay = L[name]()
    return T.spec(Pat, { w: lay.w, h: lay.h, d: lay.d, pal: pal, parts: parts, fn: lay.fn, ctl: lay.ctl })
  }
})()
