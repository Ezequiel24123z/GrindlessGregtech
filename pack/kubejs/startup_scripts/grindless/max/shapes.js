// priority: -5478
// -----------------------------------------------------------------------------------------------
// MAX structure shapes (D5-SHAPE-MAX-B, docs/eras/lines-opv-maxplus.md sections 6.2 and 7.2): the silhouettes of the thirteen MAX machines
// other than the Mirror Shell, at their new scale, drawn with the MAX casing family (max/foundation.js). Each layout paints a small 3D
// canvas (x left to right, y bottom to top, z back 0 to front d - 1); G.maxShapes.build(Pat, name, parts) turns it into a pattern spec.
// The machine files call build from inside their registry callback, never at load time (this file may load after them).
//
// Chars: S controller, X casing-or-part cell (a hatch gantry on the front slice, rows 0 to 2), '#' air, ' ' anything (outside the
// silhouette), F the machine's own detail casing; the rest are the family blocks in PAL below.
// Bootstrap (docs/quality/structures.md, Bootstrap bodies): the membrane line never uses M (it makes the membrane); R (droplet
// radiator, made at Sgr A*) appears only in the five machines section 7.2 lists: clamp, winch, imager, feeder, furnace.
// Rhino: ES5 only, var, no const in loops.
(function () {
  var G = global.grindless || (global.grindless = {})
  var T = G.maxShapes || (G.maxShapes = {})

  var PAL = {
    T: 'grindless:tensegrity_truss_casing',
    C: 'grindless:clamp_coil_casing',
    O: 'grindless:max_optical_table_casing',
    M: 'grindless:membrane_vacuum_casing',
    R: 'grindless:droplet_radiator_casing',
    G: 'gtceu:cleanroom_glass',
    K: 'gtceu:superconducting_coil',
    V: 'grindless:stream_bundle_block',
    L: 'grindless:laser_link_casing',
    W: 'gtceu:laminated_glass',
    H: 'gtceu:cupronickel_coil_block',
    Q: 'naquadah_alloy'
  }
  T.PAL = PAL

  function abs(n) { return n < 0 ? -n : n }
  function dist(dx, dz) { return Math.sqrt(dx * dx + dz * dz) }

  function Cv(w, h, d) {
    this.w = w
    this.h = h
    this.d = d
    this.c = []
    for (var i = 0; i < w * h * d; i++) this.c.push(' ')
  }
  Cv.prototype.put = function (x, y, z, ch) {
    if (x < 0 || y < 0 || z < 0 || x >= this.w || y >= this.h || z >= this.d) return
    this.c[(y * this.d + z) * this.w + x] = ch
  }
  Cv.prototype.get = function (x, y, z) { return this.c[(y * this.d + z) * this.w + x] }
  Cv.prototype.box = function (x0, y0, z0, x1, y1, z1, ch) {
    for (var y = y0; y <= y1; y++) for (var z = z0; z <= z1; z++) for (var x = x0; x <= x1; x++) this.put(x, y, z, ch)
  }
  // only the outer faces of the box
  Cv.prototype.shell = function (x0, y0, z0, x1, y1, z1, ch) {
    for (var y = y0; y <= y1; y++) for (var z = z0; z <= z1; z++) for (var x = x0; x <= x1; x++) {
      if (x === x0 || x === x1 || y === y0 || y === y1 || z === z0 || z === z1) this.put(x, y, z, ch)
    }
  }
  // the annulus r0 <= r <= r1 round (cx, cz), rows y0..y1; fn(x, y, z, r) may return a char, or undefined to leave the cell
  Cv.prototype.ring = function (cx, cz, r0, r1, y0, y1, ch, fn) {
    var lo = Math.floor(cx - r1)
    var hi = Math.ceil(cx + r1)
    var zlo = Math.floor(cz - r1)
    var zhi = Math.ceil(cz + r1)
    for (var y = y0; y <= y1; y++) for (var z = zlo; z <= zhi; z++) for (var x = lo; x <= hi; x++) {
      var r = dist(x - cx, z - cz)
      if (r < r0 - 0.001 || r > r1 + 0.001) continue
      var c = fn ? fn(x, y, z, r) : ch
      if (c !== undefined && c !== null) this.put(x, y, z, c)
    }
  }
  // spokes: n rays from (cx, cz), half width hw, radius rin..rout, rows y0..y1
  Cv.prototype.spokes = function (cx, cz, n, phase, hw, rin, rout, y0, y1, ch, fn) {
    var step = 2 * Math.PI / n
    this.ring(cx, cz, rin, rout, y0, y1, ch, function (x, y, z, r) {
      var a = Math.atan2(z - cz, x - cx) - phase
      var k = Math.round(a / step)
      var t = r * Math.sin(a - k * step)
      if (abs(t) > hw + 0.001) return undefined
      return fn ? fn(x, y, z, r, t, k) : ch
    })
  }
  // a line segment (a to b in x, z) swept with perpendicular distance q = max(|d|, |y - yc|) in [q0, q1]
  Cv.prototype.tube = function (ax, az, bx, bz, yc, q0, q1, ch, pad) {
    var dx = bx - ax
    var dz = bz - az
    var len2 = dx * dx + dz * dz
    for (var y = Math.max(0, Math.floor(yc - q1)); y <= Math.min(this.h - 1, Math.ceil(yc + q1)); y++) {
      for (var z = 0; z < this.d; z++) for (var x = 0; x < this.w; x++) {
        var t = ((x - ax) * dx + (z - az) * dz) / len2
        if (t < -(pad || 0) / Math.sqrt(len2) || t > 1 + (pad || 0) / Math.sqrt(len2)) continue
        var px = ax + t * dx
        var pz = az + t * dz
        var d = dist(x - px, z - pz)
        var q = d > abs(y - yc) ? d : abs(y - yc)
        if (q >= q0 && q <= q1) this.put(x, y, z, ch)
      }
    }
  }

  var L = {}
  T.layouts = L

  // ---------------------------------------------------------------- 2. Horizon flux clamp, 31 x 11 x 31
  // Sixteen flux pump coil stacks (clamp coil with truss flanks) stand round a central membrane-vacuum bore, fed by stream bundle spokes;
  // radiator fins on their outer faces, a truss girder ring and spokes top and bottom.
  L.horizon_flux_clamp = function () {
    var cv = new Cv(31, 11, 31)
    var c = 15
    // stacks
    cv.spokes(c, c, 16, 0, 1.5, 9, 12.5, 1, 9, 'F', function (x, y, z, r, t) {
      if (abs(t) < 0.6) return 'F'
      return y % 2 === 1 ? 'F' : 'T'
    })
    // stream bundle feed spokes
    cv.spokes(c, c, 16, 0, 0.5, 5.5, 8.5, 5, 5, 'V')
    // radiator fins
    cv.spokes(c, c, 16, 0, 0.5, 12.6, 14.6, 2, 8, 'R')
    // the bore
    cv.ring(c, c, 0, 5.5, 0, 10, '#')
    cv.ring(c, c, 4.5, 5.5, 1, 9, 'M')
    cv.ring(c, c, 0, 5.5, 0, 0, 'M')
    cv.ring(c, c, 0, 5.5, 10, 10, 'M')
    // girder decks, then rings and spokes, floor and roof
    cv.ring(c, c, 6, 13, 1, 1, 'T')
    cv.ring(c, c, 6, 13, 9, 9, 'T')
    var ys = [0, 10]
    for (var i = 0; i < ys.length; i++) {
      cv.ring(c, c, 13.5, 15.2, ys[i], ys[i], 'T')
      cv.ring(c, c, 8, 9, ys[i], ys[i], 'T')
      cv.spokes(c, c, 16, 0, 0.5, 5.6, 15, ys[i], ys[i], 'T')
    }
    // the sixteen superconducting cores
    for (var k = 0; k < 16; k++) {
      var a = k * Math.PI / 8
      cv.put(c + Math.round(10.5 * Math.cos(a)), 5, c + Math.round(10.5 * Math.sin(a)), 'K')
    }
    return { cv: cv, ctl: [c, 1] }
  }

  // ---------------------------------------------------------------- 3. Geroch winch, 13 x 45 x 13
  // A tether tower: four truss legs with girder rings, a clamp-coil tether well down the axis (superconducting rings in it), the Geroch
  // drum on top, radiator louvres on the four faces.
  L.geroch_winch = function () {
    var cv = new Cv(13, 45, 13)
    var c = 6
    var corners = [[0, 0], [11, 0], [0, 11], [11, 11]]
    var i
    var y
    for (i = 0; i < 4; i++) cv.box(corners[i][0], 0, corners[i][1], corners[i][0] + 1, 44, corners[i][1] + 1, 'T')
    for (y = 6; y <= 42; y += 6) cv.shell(0, y, 0, 12, y, 12, 'T')
    for (y = 8; y <= 36; y += 2) {
      cv.box(3, y, 0, 9, y, 0, 'R')
      cv.box(3, y, 12, 9, y, 12, 'R')
      cv.box(0, y, 3, 0, y, 9, 'R')
      cv.box(12, y, 3, 12, y, 9, 'R')
    }
    // the well
    cv.ring(c, c, 0, 2.5, 1, 44, '#')
    cv.ring(c, c, 1.6, 2.5, 1, 34, 'C', function (x, yy, z, r) {
      return yy % 3 === 1 && (x + z) % 2 === 0 ? 'K' : 'C'
    })
    // the drum
    cv.ring(c, c, 1.6, 5.5, 35, 42, 'F')
    cv.ring(c, c, 5, 5.5, 38, 38, 'C')
    cv.ring(c, c, 1.6, 5.5, 34, 34, 'T')
    cv.ring(c, c, 1.6, 4.5, 43, 44, 'T')
    return { cv: cv, ctl: [c, 1] }
  }

  // ---------------------------------------------------------------- 4. Ergoregion synchroniser, 27 x 9 x 27
  // A driver ring (driver ring casing) on a truss floor, an outer truss wall, eight RF feed spokes of clamp coil to a membrane-vacuum hub.
  L.ergoregion_synchroniser = function () {
    var cv = new Cv(27, 9, 27)
    var c = 13
    cv.ring(c, c, 0, 13, 0, 0, 'T')
    cv.ring(c, c, 11.2, 13, 1, 8, 'T')
    cv.ring(c, c, 3, 7.5, 1, 1, 'T')
    cv.ring(c, c, 12, 13, 8, 8, 'T')
    cv.ring(c, c, 0, 12, 1, 7, '#')
    cv.ring(c, c, 8, 11, 2, 6, 'F')
    cv.spokes(c, c, 8, Math.PI / 8, 2.0, 2.5, 8, 2, 6, 'C')
    cv.ring(c, c, 0, 2.5, 1, 7, 'M')
    cv.ring(c, c, 0, 1.5, 2, 6, '#')
    cv.ring(c, c, 6, 7.2, 3, 5, 'M', function (x, y, z, r) { return y === 3 || y === 5 ? 'M' : undefined })
    cv.ring(c, c, 11.2, 12, 1, 8, 'T', function (x, y, z, r) { return y === 7 ? 'T' : undefined })
    cv.spokes(c, c, 16, 0, 0.5, 11, 12, 1, 7, 'T')
    for (var k = 0; k < 16; k++) {
      var a = k * Math.PI / 8
      cv.put(c + Math.round(9.5 * Math.cos(a)), 4, c + Math.round(9.5 * Math.sin(a)), 'K')
    }
    return { cv: cv, ctl: [c, 1] }
  }

  // ---------------------------------------------------------------- 5. Photon ring imager, 25 x 11 x 25
  // A central optical-table dish with a ring of eight sub-dishes, all on a truss deck and pedestals; radiators under the dish.
  L.photon_ring_imager = function () {
    var cv = new Cv(25, 11, 25)
    var c = 12
    var k
    cv.ring(c, c, 0, 12, 0, 0, 'T')
    cv.ring(c, c, 11, 12, 1, 5, 'T')
    cv.ring(c, c, 11, 12, 6, 6, 'T')
    cv.ring(c, c, 0, 2.5, 1, 4, 'T')
    cv.ring(c, c, 3, 7.5, 1, 2, 'R', function (x, y, z, r) { return (x + z) % 2 === 0 ? 'R' : undefined })
    cv.ring(c, c, 0, 10, 1, 10, null, function (x, y, z, r) {
      var h = 3 + Math.round(r * r / 13)
      return y === h ? 'F' : undefined
    })
    cv.ring(c, c, 0, 10, 1, 10, null, function (x, y, z, r) {
      var h = 3 + Math.round(r * r / 13)
      return y === h + 1 && r < 9.5 ? 'F' : undefined
    })
    cv.spokes(c, c, 12, 0, 0.6, 3, 10, 1, 2, 'R')
    cv.ring(c, c, 0, 10, 1, 10, null, function (x, y, z, r) {
      var h = 3 + Math.round(r * r / 13)
      return y === h + 2 && r < 9 && (x + z) % 3 === 0 ? 'T' : undefined
    })
    for (k = 0; k < 8; k++) {
      var a = k * Math.PI / 4 + Math.PI / 8
      var sx = c + Math.round(8.8 * Math.cos(a))
      var sz = c + Math.round(8.8 * Math.sin(a))
      cv.ring(sx, sz, 0, 3.4, 1, 1, 'T')
      cv.ring(sx, sz, 0, 2.2, 3, 4, null, function (x, y, z, r) { return y === 3 + Math.round(r * r / 6) ? 'F' : undefined })
      cv.box(sx, 1, sz, sx, 3, sz, 'T')
    }
    cv.box(c, 5, c, c, 6, c, 'G')
    cv.box(c, 7, c, c, 9, c, 'Q')
    return { cv: cv, ctl: [c, 1] }
  }

  // ---------------------------------------------------------------- 6. Accretion feeder, 27 x 9 x 27
  // A flat feeding ring in the ISCO plane: feeder coil casing torus, truss pylons and girder ring, radiator fins, and a glass funnel with
  // superconducting belts in the middle.
  L.accretion_feeder = function () {
    var cv = new Cv(27, 9, 27)
    var c = 13
    var k
    cv.ring(c, c, 0, 13, 0, 0, 'T')
    cv.ring(c, c, 7, 12, 1, 1, 'T')
    cv.ring(c, c, 6.5, 12, 2, 6, 'F')
    cv.ring(c, c, 7, 11.5, 4, 4, '#')
    cv.ring(c, c, 12, 13, 1, 6, 'T')
    cv.ring(c, c, 2.5, 6, 1, 7, 'G', function (x, y, z, r) { return r >= 2.5 && r <= 3.5 + y * 0.35 ? 'G' : undefined })
    cv.ring(c, c, 5.2, 6.4, 3, 5, 'K')
    cv.ring(c, c, 11.8, 13, 7, 8, 'T')
    for (k = 0; k < 12; k++) {
      var a = k * Math.PI / 6
      var px = c + Math.round(12 * Math.cos(a))
      var pz = c + Math.round(12 * Math.sin(a))
      cv.box(px - 1, 1, pz - 1, px, 8, pz, 'T')
    }
    cv.spokes(c, c, 12, Math.PI / 12, 0.6, 7, 12.4, 1, 2, 'T')
    cv.spokes(c, c, 12, Math.PI / 12, 1.2, 12.5, 13, 2, 7, 'R')
    cv.spokes(c, c, 24, Math.PI / 24, 0.5, 6.6, 12.5, 6, 6, 'R')
    return { cv: cv, ctl: [c, 1] }
  }

  // ---------------------------------------------------------------- 7. Segment reclamation works, 19 x 11 x 23
  // A disassembly bay: a long hall lined with bay casing, a truss gantry crane overhead, four strip tanks (membrane vacuum) on each side.
  L.segment_reclamation_works = function () {
    var cv = new Cv(19, 11, 23)
    var i
    cv.box(0, 0, 0, 18, 0, 22, 'T')
    cv.box(5, 0, 1, 13, 0, 22, 'F')
    cv.shell(5, 1, 1, 13, 8, 22, 'F')
    cv.box(6, 1, 2, 12, 7, 21, '#')
    cv.box(9, 4, 1, 9, 4, 1, 'G')
    for (i = 0; i < 4; i++) {
      var z = 4 + i * 5
      cv.ring(2.5, z, 1, 2.5, 1, 7, 'T')
      cv.ring(16.5, z, 1, 2.5, 1, 7, 'T')
      cv.ring(2.5, z, 1, 2.5, 3, 3, 'M')
      cv.ring(16.5, z, 1, 2.5, 3, 3, 'M')
      cv.ring(2.5, z, 1, 2.5, 5, 5, 'M')
      cv.ring(16.5, z, 1, 2.5, 5, 5, 'M')
      cv.ring(2.5, z, 0, 1, 1, 7, '#')
      cv.ring(16.5, z, 0, 1, 1, 7, '#')
      cv.box(4, 4, z, 4, 4, z, 'V')
      cv.box(14, 4, z, 14, 4, z, 'V')
    }
    cv.box(0, 9, 0, 0, 10, 22, 'T')
    cv.box(18, 9, 0, 18, 10, 22, 'T')
    for (i = 0; i < 23; i += 4) cv.box(0, 10, i, 18, 10, i, 'T')
    cv.box(8, 9, 2, 10, 9, 21, 'T')
    cv.box(9, 10, 1, 9, 10, 21, 'Q')
    return { cv: cv, ctl: [9, 1] }
  }

  // ---------------------------------------------------------------- 8. Cluster-light furnace, 23 x 15 x 23
  // A solar furnace: an optical-table concentrator bowl on truss pylons over a hearth, radiator fins round the hearth base.
  L.cluster_light_furnace = function () {
    var cv = new Cv(23, 15, 23)
    var c = 11
    var k
    cv.ring(c, c, 0, 11, 0, 0, 'T')
    cv.ring(c, c, 2.5, 4, 1, 5, 'T')
    cv.ring(c, c, 0, 2.5, 1, 4, 'F')
    cv.ring(c, c, 0, 1, 5, 5, '#')
    cv.ring(c, c, 4.5, 9.5, 1, 2, 'R')
    cv.ring(c, c, 4.5, 9.5, 3, 3, 'T', function (x, y, z, r) { return (x + z) % 2 === 0 ? 'T' : undefined })
    cv.ring(c, c, 0, 11, 6, 14, null, function (x, y, z, r) {
      return y === 6 + Math.round(r * r / 16) || y === 7 + Math.round(r * r / 16) || y === 8 + Math.round(r * r / 16) ? 'F' : undefined
    })
    cv.ring(c, c, 0, 11, 6, 14, null, function (x, y, z, r) {
      var h = 6 + Math.round(r * r / 16)
      return y === h - 1 && y >= 6 && (x + z) % 2 === 0 && r > 2 ? 'T' : undefined
    })
    cv.ring(c, c, 10, 11.3, 13, 14, 'T')
    for (k = 0; k < 6; k++) {
      var a = k * Math.PI / 3
      var px = c + Math.round(9.5 * Math.cos(a))
      var pz = c + Math.round(9.5 * Math.sin(a))
      cv.box(px, 1, pz, px + 1, 12, pz + 1, 'T')
    }
    cv.ring(c, c, 3.4, 4.5, 3, 3, 'K', function (x, y, z, r) { return (x + z) % 2 === 0 ? 'K' : undefined })
    cv.ring(c, c, 10, 11, 1, 5, 'T')
    return { cv: cv, ctl: [c, 1] }
  }

  // ---------------------------------------------------------------- 9. Mass stream injector, 21 x 9 x 21
  // An injector ring of truss girders and clamp-coil staging with eight turning magnets (stream turn casing), and the beam line entering
  // from the front.
  L.mass_stream_injector = function () {
    var cv = new Cv(21, 9, 21)
    var c = 10
    var k
    cv.ring(c, c, 0, 10, 0, 1, 'T')
    cv.ring(c, c, 7, 9.5, 2, 6, 'T')
    cv.ring(c, c, 4.5, 10, 7, 7, 'C')
    cv.ring(c, c, 4.5, 10, 8, 8, 'T')
    cv.ring(c, c, 5.5, 6.2, 2, 6, 'C')
    cv.ring(c, c, 7.8, 8.7, 3, 5, '#')
    cv.ring(c, c, 6.2, 7, 3, 5, 'C')
    cv.ring(c, c, 9.6, 10, 3, 5, 'C')
    for (k = 0; k < 8; k++) {
      var a = k * Math.PI / 4 + Math.PI / 8
      var mx = c + Math.round(8.2 * Math.cos(a))
      var mz = c + Math.round(8.2 * Math.sin(a))
      cv.box(mx - 1, 2, mz - 1, mx + 1, 6, mz + 1, 'F')
    }
    cv.box(8, 3, 17, 12, 5, 20, 'C')
    cv.box(9, 4, 12, 11, 4, 20, '#')
    cv.box(9, 4, 12, 11, 4, 16, 'V')
    cv.box(9, 4, 17, 11, 4, 20, '#')
    cv.ring(c, c, 0, 5.5, 0, 8, 'T', function (x, y, z, r) { return y === 8 && r > 4.5 || y === 0 && r < 4 ? 'T' : undefined })
    cv.spokes(c, c, 8, Math.PI / 8, 0.6, 4, 7, 4, 4, 'V')
    for (k = 0; k < 16; k++) {
      var b = k * Math.PI / 8
      cv.put(c + Math.round(5 * Math.cos(b)), 4, c + Math.round(5 * Math.sin(b)), 'K')
    }
    return { cv: cv, ctl: [c, 1] }
  }

  // ---------------------------------------------------------------- 10. Gene ark, 17 x 13 x 17
  // A sealed octagonal vault: membrane-vacuum walls in a truss frame, rows of cryo racks (sterilizing filter casing, glass cap, coil) inside.
  L.gene_ark = function () {
    var cv = new Cv(17, 13, 17)
    var c = 8
    var x
    var z
    var y
    var i
    var oct = function (px, pz, r) { return abs(px - c) <= r && abs(pz - c) <= r && abs(px - c) + abs(pz - c) <= r * 1.5 + 0.5 }
    for (y = 0; y <= 12; y++) for (z = 0; z < 17; z++) for (x = 0; x < 17; x++) {
      if (!oct(x, z, 8)) continue
      var inner = oct(x, z, 6)
      if (y === 0 || y === 12) cv.put(x, y, z, 'T')
      else if (!inner) cv.put(x, y, z, 'M')
      else cv.put(x, y, z, '#')
    }
    for (y = 1; y <= 11; y += 5) for (z = 0; z < 17; z++) for (x = 0; x < 17; x++) {
      if (oct(x, z, 8) && !oct(x, z, 7)) cv.put(x, y, z, 'T')
    }
    for (i = 0; i < 4; i++) {
      var q = [[2, 2], [14, 2], [2, 14], [14, 14]][i]
      cv.box(q[0] - 1, 0, q[1] - 1, q[0], 12, q[1], 'T')
    }
    // rack rows
    var rows = [3, 6, 10, 13]
    for (i = 0; i < rows.length; i++) {
      for (x = 4; x <= 12; x += 2) {
        if (abs(x - c) < 1 && rows[i] >= 10) continue
        cv.box(x, 1, rows[i], x, 8, rows[i], 'F')
        cv.put(x, 9, rows[i], 'G')
        if (i % 2 === 0 && x % 4 === 0) cv.put(x, 5, rows[i], 'K')
      }
      cv.box(4, 1, rows[i], 12, 1, rows[i], 'F')
    }
    cv.box(2, 11, 4, 14, 11, 4, 'T')
    cv.box(2, 11, 12, 14, 11, 12, 'T')
    return { cv: cv, ctl: [c, 1] }
  }

  // ---------------------------------------------------------------- 11. Membrane line, 9 x 9 x 45
  // A roll-to-roll hall: a truss ladder frame, glass panels, roller stations (membrane roller casing) across the web, ovens. No membrane
  // vacuum casing: this line makes the membrane (Decision C-4).
  L.membrane_line = function () {
    var cv = new Cv(9, 9, 45)
    var z
    var y
    for (z = 0; z < 45; z++) {
      var rib = z % 6 === 0
      for (y = 0; y < 9; y++) for (var x = 0; x < 9; x++) {
        var edge = (x === 0 || x === 8) && (y === 0 || y === 8)
        var onShell = x === 0 || x === 8 || y === 0 || y === 8
        if (edge || (rib && onShell)) cv.put(x, y, z, 'T')
        else if (onShell) cv.put(x, y, z, y === 0 ? 'T' : ((y >= 2 && y <= 6) || y === 8 ? 'W' : 'T'))
        else cv.put(x, y, z, '#')
      }
    }
    // the web run and its rollers
    for (z = 3; z <= 41; z += 4) {
      for (y = 2; y <= 6; y++) for (var xx = 1; xx <= 7; xx++) {
        var r = dist(y - 4, 0)
        if (abs(y - 4) <= 1 && xx >= 1 && xx <= 7) cv.put(xx, y, z, 'F')
      }
      cv.box(1, 4, z + 1, 7, 4, z + 1, '#')
    }
    cv.box(1, 1, 1, 7, 1, 43, 'F')
    for (z = 2; z <= 38; z += 6) {
      cv.put(1, 3, z, 'H')
      cv.put(7, 3, z, 'H')
    }
    cv.box(3, 7, 0, 5, 7, 44, 'T')
    return { cv: cv, ctl: [4, 1] }
  }

  // ---------------------------------------------------------------- 12. Rydberg array works, 15 x 11 x 17
  // An optical lab round a vacuum cell: the cell (membrane vacuum cube) in the middle, Helmholtz coils (superconducting) above and below
  // it, optical tables and laser towers round it, a truss gantry over all.
  L.rydberg_array_works = function () {
    var cv = new Cv(15, 11, 17)
    var cx = 7
    var cz = 8
    cv.box(0, 0, 0, 14, 0, 16, 'O')
    cv.box(3, 0, 3, 11, 0, 13, 'T')
    cv.shell(cx - 4, 1, cz - 4, cx + 4, 9, cz + 4, 'M')
    cv.box(cx - 3, 2, cz - 3, cx + 3, 8, cz + 3, '#')
    cv.shell(cx - 2, 3, cz - 2, cx + 2, 7, cz + 2, 'M')
    cv.box(cx - 1, 4, cz - 1, cx + 1, 6, cz + 1, '#')
    // Helmholtz coil outlines, five by five
    var hy = [2, 8]
    for (var h = 0; h < 2; h++) {
      for (var o = -2; o <= 2; o++) {
        cv.put(cx + o, hy[h], cz - 2, 'K')
        cv.put(cx + o, hy[h], cz + 2, 'K')
        cv.put(cx - 2, hy[h], cz + o, 'K')
        cv.put(cx + 2, hy[h], cz + o, 'K')
      }
    }
    cv.box(cx - 3, 1, cz - 3, cx + 3, 1, cz + 3, 'T')
    var arms = [[0, -1], [0, 1], [-1, 0], [1, 0]]
    var i
    for (i = 0; i < 4; i++) {
      var dx = arms[i][0]
      var dz = arms[i][1]
      for (var s = 5; s <= 7; s++) {
        cv.put(cx + dx * s, 5, cz + dz * s, 'G')
        cv.put(cx + dx * s, 4, cz + dz * s, 'O')
        cv.put(cx + dx * s, 3, cz + dz * s, 'O')
      }
      cv.box(cx + dx * 6 - 1, 1, cz + dz * 6 - 1, cx + dx * 6 + 1, 2, cz + dz * 6 + 1, 'O')
    }
    var cs = [[1, 1], [13, 1], [1, 15], [13, 15]]
    for (i = 0; i < 4; i++) cv.box(cs[i][0], 1, cs[i][1], cs[i][0], 9, cs[i][1], 'T')
    cv.shell(1, 10, 1, 13, 10, 15, 'T')
    cv.box(cx, 10, 1, cx, 10, 15, 'T')
    cv.box(1, 10, cz, 13, 10, cz, 'T')
    cv.box(1, 1, 1, 1, 1, 15, 'T')
    cv.box(13, 1, 1, 13, 1, 15, 'T')
    cv.box(0, 1, 0, 0, 2, 16, 'O')
    cv.box(14, 1, 0, 14, 2, 16, 'O')
    cv.box(0, 3, 0, 14, 6, 0, 'O')
    cv.box(0, 3, 0, 0, 6, 16, 'O')
    cv.box(14, 3, 0, 14, 6, 16, 'O')
    cv.box(2, 1, 2, 12, 2, 3, 'O')
    cv.box(2, 1, 13, 12, 2, 14, 'O')
    cv.box(1, 10, 1, 13, 10, 15, 'T')
    cv.box(1, 3, 1, 1, 6, 15, 'O')
    cv.box(13, 3, 1, 13, 6, 15, 'O')
    cv.box(2, 3, 1, 12, 6, 1, 'O')
    cv.box(2, 3, 1, 3, 8, 2, 'O')
    cv.box(11, 3, 1, 12, 8, 2, 'O')
    cv.box(2, 3, 14, 3, 8, 15, 'O')
    cv.box(11, 3, 14, 12, 8, 15, 'O')
    cv.box(0, 3, 16, 14, 6, 16, 'O')
    cv.box(0, 7, 16, 14, 9, 16, 'T')
    cv.box(0, 7, 0, 0, 9, 16, 'T')
    cv.box(14, 7, 0, 14, 9, 16, 'T')
    cv.box(1, 9, 1, 13, 9, 15, 'T')
    for (var yy = 3; yy <= 8; yy++) {
      cv.box(1, yy, 8, 1, yy, 8, 'T')
      cv.box(13, yy, 8, 13, yy, 8, 'T')
    }
    return { cv: cv, ctl: [cx, 1] }
  }

  // ---------------------------------------------------------------- 13. Atom interferometer works, 9 x 45 x 9
  // An atom fountain tower: a membrane-vacuum tube up the axis inside clamp-coil shield rings and a truss shell, on an optical table base.
  L.atom_interferometer_works = function () {
    var cv = new Cv(9, 45, 9)
    var c = 4
    var y
    cv.box(0, 0, 0, 8, 3, 8, 'O')
    cv.box(1, 1, 1, 7, 2, 7, '#')
    cv.ring(c, c, 0, 2.6, 1, 2, 'O')
    var corners = [[0, 0], [7, 0], [0, 7], [7, 7]]
    for (var i = 0; i < 4; i++) cv.box(corners[i][0], 4, corners[i][1], corners[i][0] + 1, 44, corners[i][1] + 1, 'T')
    for (y = 8; y <= 44; y += 6) cv.shell(0, y, 0, 8, y, 8, 'T')
    cv.ring(c, c, 0, 3.6, 4, 41, '#')
    cv.ring(c, c, 2.6, 3.6, 4, 41, 'M', function (x, yy, z, r) {
      return yy % 10 === 8 && (x === c || z === c) && r > 2.9 ? 'K' : 'M'
    })
    cv.ring(c, c, 0, 3.6, 41, 41, 'M')
    for (y = 6; y <= 40; y += 4) cv.ring(c, c, 3.7, 4.4, y, y, 'C')
    cv.ring(c, c, 0, 3, 42, 43, 'O')
    return { cv: cv, ctl: [c, 1] }
  }

  // ---------------------------------------------------------------- 14. Horizon interferometer, 45 x 7 x 41
  // A triangle: three test-mass stations (test mass enclosure) joined by laser-link arms, on truss trestles, optical benches in the stations.
  L.horizon_interferometer = function () {
    var cv = new Cv(45, 7, 41)
    var st = [[22, 4], [4, 33], [40, 33]]
    var i
    for (i = 0; i < 3; i++) {
      var j = (i + 1) % 3
      cv.tube(st[i][0], st[i][1], st[j][0], st[j][1], 0, 0, 2.5, 'T', 0)
      cv.tube(st[i][0], st[i][1], st[j][0], st[j][1], 1, 0, 0.99, 'O', 0)
      cv.tube(st[i][0], st[i][1], st[j][0], st[j][1], 3.5, 1.0, 1.9, 'L', 0)
      cv.tube(st[i][0], st[i][1], st[j][0], st[j][1], 3.5, 0, 0.99, '#', 0)
    }
    for (i = 0; i < 3; i++) {
      var s = st[i]
      cv.shell(s[0] - 4, 0, s[1] - 4, s[0] + 4, 6, s[1] + 4, 'F')
      cv.box(s[0] - 3, 1, s[1] - 3, s[0] + 3, 5, s[1] + 3, '#')
      cv.box(s[0] - 3, 1, s[1] - 3, s[0] + 3, 1, s[1] + 3, 'O')
      cv.put(s[0], 2, s[1], 'K')
    }
    for (var k = 0; k < 18; k++) {
      var a = st[k % 3]
      var b = st[(k + 1) % 3]
      var t = 0.2 + 0.6 * (k % 8) / 8
      cv.put(Math.round(a[0] + t * (b[0] - a[0])), 3, Math.round(a[1] + t * (b[1] - a[1])), 'K')
    }
    // control gantry from the front
    cv.box(22, 0, 34, 22, 1, 40, 'T')
    return { cv: cv, ctl: [22, 1] }
  }

  // ---------------------------------------------------------------- build
  function finish(lay) {
    var cv = lay.cv
    var cx = lay.ctl[0]
    var hw = Math.min(5, Math.floor(cv.w / 2) - 1)
    cv.box(cx - hw, 0, cv.d - 1, cx + hw, 2, cv.d - 1, 'X')
    return cv
  }

  T.slices = function (lay, cv) {
    var cx = lay.ctl[0]
    var cy = lay.ctl[1]
    var slices = []
    for (var z = 0; z < cv.d; z++) {
      var rows = []
      for (var y = 0; y < cv.h; y++) {
        var row = ''
        for (var x = 0; x < cv.w; x++) {
          var ch = cv.get(x, y, z)
          if (z === cv.d - 1 && y === cy && x === cx) ch = 'S'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // name: the machine's registry name; casing: its appearance casing (F); parts: [Pat.part(...)]
  T.build = function (Pat, name, casing, parts) {
    var lay = L[name]()
    var cv = finish(lay)
    var f = Pat.block(casing)
    var symbols = { S: Pat.controller(), X: Pat.oneOf.apply(null, [f].concat(parts)), F: f, '#': Pat.air() }
    Object.keys(PAL).forEach(function (ch) {
      symbols[ch] = PAL[ch].indexOf(':') < 0 ? Pat.frame(PAL[ch]) : Pat.block(PAL[ch])
    })
    return { slices: T.slices(lay, cv), symbols: symbols }
  }
})()
