// priority: -9298
// -----------------------------------------------------------------------------------------------
// D4-SHAPE-UIV-B: the UIV flagships and halls (docs/eras/lines-uev-uxv.md, section 8), added to the layouts of uiv/shapes.js (this file loads
// after it). Same conventions: fn(x, y, z) -> one char, the controller forced to (middle, 1, front); machine-specific chars are blocks named
// in the layout's pal. The bodies are the UIV family (rhea, mh_field, multilayer_optics, dilution_cryostat, neutron_star_site, uiv_fusion);
// T.BOOT in shapes.js swaps the casings of the machines that feed them.
(function () {
  // Math.PI is undefined in KubeJS's Rhino (.github/instructions/kubejs.instructions.md), so the constant is a literal
  var PI = 3.141592653589793
  const G = global.grindless || (global.grindless = {})
  const T = G.uivShapes || (G.uivShapes = {})
  const L = T.layouts || (T.layouts = {})
  const pal = T.pal

  function abs(n) { return n < 0 ? -n : n }
  function rad(a, b) { return Math.sqrt(a * a + b * b) }
  function rad3(a, b, c) { return Math.sqrt(a * a + b * b + c * c) }

  var COIL_MH = 'grindless:metallic_hydrogen_coil_block'
  var SITE = 'grindless:neutron_star_site_casing'
  var RHEA = 'grindless:rhea_casing'
  var MH = 'grindless:mh_field_casing'
  var OPT = 'grindless:multilayer_optics_casing'
  var CRY = 'grindless:dilution_cryostat_casing'
  var FUSION = 'grindless:uiv_fusion_casing'

  // Mk5 fusion reactor: a torus 39 x 11 x 39 round a lit central solenoid. The wall is one cell thick: Li-Sn first wall on the outer
  // quadrant (the signature casing, with the hatch ports), RHEA on the inner quadrant, and passive metallic-hydrogen toroidal magnets
  // every third sector over the top and bottom. Floor spokes and a base ring carry it; the controller stands on a pier at the front.
  L.uiv_fusion_reactor = function () {
    var N = 39, c = 19, R = 14, ty = 5
    var tau = PI / 8
    return {
      w: N, h: 11, d: N, ring: true,
      pal: pal({ C: FUSION, K: COIL_MH, R: RHEA, M: MH, E: FUSION, I: FUSION, O: FUSION, Q: 'tungsten_steel' }),
      fn: function (x, y, z) {
        var dx = x - c
        var dz = z - c
        var r = rad(dx, dz)
        if (z >= 35 && x >= 17 && x <= 21 && y <= 2) return 'R'
        if (r < 1.5) return y === 0 || y === 10 ? 'R' : 'K'
        var dr = r - R
        var dy = y - ty
        var dd = rad(dr, dy)
        var bin = Math.floor((Math.atan2(dz, dx) + PI) / tau) % 16
        if (dd >= 3.5 && dd < 4.5) {
          var phi = Math.abs(Math.atan2(dy, dr))
          if (phi < 0.7) {
            if (y === ty) {
              if (bin === 1 || bin === 3 || bin === 5 || bin === 7 || bin === 9 || bin === 13 || bin === 15) return 'E'
              if (bin === 4 || bin === 8) return 'I'
              if (bin === 0 || bin === 14) return 'O'
              return 'C'
            }
            if ((y === ty + 1 || y === ty - 1) && bin % 2 === 0) return 'L'
            return 'C'
          }
          if (phi > 3 * PI / 4) return 'R'
          return bin % 3 === 0 ? 'M' : 'R'
        }
        if (dd < 3.5) return dd < 0 ? ' ' : '#'
        if (dd < 5.5 && bin % 3 === 0) {
          var ph = Math.abs(Math.atan2(dy, dr))
          if (ph > PI / 4 && ph < 3 * PI / 4) return 'M'
        }
        if (y === ty && r < 9.5 && (dx === 0 || dz === 0)) return 'Q'
        if (y === 0) {
          if (abs(dr) < 0.5) return 'R'
          if ((dx === 0 || dz === 0) && r < 19) return 'R'
        }
        return ' '
      }
    }
  }

  // matrioshka computer: nested gyroscope-lattice spheres round a node core. Outside, the RHEA radiator shell with droplet radiator modules
  // and three RHEA fin discs; inside, a glass emitter shell and a glass TPV shell studded with their tiles, then the logic shell. A walkway
  // on pylons carries the controller to the shell.
  L.matrioshka_computer = function () {
    var n = 29, c = 14
    return {
      w: n, h: n, d: n,
      pal: pal({
        A: 'grindless:matrioshka_logic_tile', N: 'grindless:matrioshka_node', E: 'grindless:matrioshka_emitter_shell',
        V: 'grindless:matrioshka_tpv_shell', R: 'grindless:droplet_radiator_module', Q: 'tungsten_steel'
      }),
      fn: function (x, y, z) {
        var dx = x - c
        var dy = y - c
        var dz = z - c
        var lat = (x + y + z) % 2 === 0
        if (y === 0 && z >= 19 && x >= 10 && x <= 18) return 'X'
        if (z >= 20 && (x === 10 || x === 18) && y >= 1 && y <= 2 && z % 4 === 0) return 'Q'
        var r = rad3(dx, dy, dz)
        if (r >= 13 && r < 14) return lat ? ((x * 3 + y * 5 + z * 7) % 37 === 0 ? 'R' : 'F') : ' '
        if (r >= 9 && r < 10) return lat ? ((x * 5 + y * 3 + z) % 37 === 1 ? 'E' : 'L') : '#'
        if (r >= 6 && r < 7) return lat ? ((x + y * 7 + z * 5) % 17 === 2 ? 'V' : 'L') : '#'
        if (r >= 3 && r < 5) return lat ? 'A' : '#'
        if (r < 1.5) return 'N'
        if (r < 13) {
          if (r >= 12 && (dx === 0 || dy === 0 || dz === 0)) return 'Q'
          if (r >= 7 && (dx === 0 || dy === 0 || dz === 0) && (x + y + z) % 2 === 0 && (dx === 0 ? 1 : 0) + (dy === 0 ? 1 : 0) + (dz === 0 ? 1 : 0) === 1) return 'F'
          if ((dx === 0 ? 1 : 0) + (dy === 0 ? 1 : 0) + (dz === 0 ? 1 : 0) >= 2 && r >= 2) return 'Q'
          return '#'
        }
        return ' '
      }
    }
  }

  // BEUV scanner: the Tb droplet source vessel at the back, a tube to the tall projection tower (mirror stands round the beam tube, the
  // reticle stage under its roof), and the wafer stage hall across the front. The optical path steps sideways from vessel to tower.
  L.beuv_scanner = function () {
    var w = 25, h = 15, d = 23
    return {
      w: w, h: h, d: d,
      pal: pal({ A: RHEA, L: 'gtceu:laminated_glass', P: 'gtceu:tungstensteel_pipe_casing', B: 'gtceu:tungstensteel_gearbox', Q: 'tungsten_steel' }),
      fn: T.compose([
        T.at(3, 0, 14, 19, 5, 9, T.shell({
          w: 19, h: 5, d: 9, ground: true, roof: 'lid', win: [2, 3], mull: 3, bands: [1],
          inner: function (x, y, z) {
            if (y === 1 && z >= 2 && z <= 6 && (x === 4 || x === 14)) return 'Q'
            if (y === 1 && z >= 2 && z <= 6 && x > 4 && x < 14) return x % 2 === 0 ? 'B' : 'P'
            if (y === 2 && z === 4 && x >= 5 && x <= 13) return 'Q'
            return null
          }
        })),
        T.at(12, 0, 3, 11, 15, 11, T.shell({
          w: 11, h: 15, d: 11, slab: true, roof: 'lid', win: [2, 13], mull: 4, bands: [1, 7, 12],
          inner: function (x, y, z) {
            if (x === 5 && z === 5 && y >= 1 && y <= 13) return 'P'
            if ((y === 3 || y === 6 || y === 9) && z === 5 && (x === 2 || x === 8)) return 'B'
            if ((y === 4 || y === 7 || y === 10) && x === 5 && (z === 2 || z === 8)) return 'B'
            if ((y === 3 || y === 6 || y === 9) && z === 5 && (x === 3 || x === 7)) return 'Q'
            if ((y === 4 || y === 7 || y === 10) && x === 5 && (z === 3 || z === 7)) return 'Q'
            if (y === 12 && abs(x - 5) <= 3 && abs(z - 5) <= 3) return abs(x - 5) === 3 || abs(z - 5) === 3 ? 'A' : 'B'
            return null
          }
        })),
        T.at(8, 3, 3, 5, 4, 3, T.shell({ w: 5, h: 4, d: 3, win: [1, 2], mull: 2 })),
        T.at(0, 0, 0, 9, 12, 9, T.cyl({
          R: 4, h: 9, dome: 3, ground: true, bands: { 4: 'A', 7: 'A' }, win: [2, 6],
          inner: function (x, y, z, r) {
            if (x === 4 && z === 4 && y >= 1 && y <= 7) return y % 2 === 0 ? 'P' : 'B'
            if (y === 4 && r > 1 && r < 3) return 'Q'
            return null
          }
        }))
      ])
    }
  }

  // neutron drip works: the centrifuge drum at the front (the drip separator, a ribbed vessel under a glazed dome) feeding the superfluid cage
  // vault behind it: a cryostat-jacketed hall holding the coil cage and the neutronium core on pipe struts
  L.neutronium_cage = function () {
    var w = 21, h = 13, d = 29
    return {
      w: w, h: h, d: d,
      pal: pal({ A: MH, Y: CRY, C: COIL_MH, N: SITE, L: 'gtceu:laminated_glass', Q: 'tungsten_steel' }),
      fn: T.compose([
        T.at(4, 0, 16, 13, 12, 13, T.cyl({
          R: 6, h: 10, dome: 2, ground: true, bands: { 1: 'A', 4: 'A', 7: 'A' }, win: [2, 3],
          inner: function (x, y, z, r) {
            if (r < 1.5 && y >= 1 && y <= 9) return y % 3 === 0 ? 'N' : 'P'
            if (r >= 3.5 && r < 4.5 && y === 5) return 'B'
            return null
          }
        })),
        T.at(4, 0, 0, 13, 10, 16, T.shell({
          w: 13, h: 10, d: 16, slab: true, roof: 'lid', win: [2, 7], mull: 4, bands: [1, 5, 8],
          inner: function (x, y, z) {
            var dx = x - 6
            var dz = z - 7
            if (abs(dx) <= 4 && abs(dz) <= 4 && y >= 2 && y <= 7) {
              var shell = abs(dx) === 4 || abs(dz) === 4 || y === 2 || y === 7
              var edge = (abs(dx) === 4 ? 1 : 0) + (abs(dz) === 4 ? 1 : 0) >= 2
              if (edge) return 'C'
              if (shell) return (x + y + z) % 2 === 0 ? 'Y' : 'L'
            }
            if (abs(dx) <= 1 && abs(dz) <= 1 && y >= 3 && y <= 5) return abs(dx) + abs(dz) + abs(y - 4) <= 1 ? 'N' : 'A'
            if (y === 4 && ((abs(dx) >= 2 && abs(dx) <= 3 && dz === 0) || (abs(dz) >= 2 && abs(dz) <= 3 && dx === 0))) return 'P'
            return null
          }
        }))
      ])
    }
  }

  // Penrose engine: sleds dropped down a central shaft and braked by a catch ring; twelve radial release rails on pylons, a dynamo house
  // between every pair of rails where the recovered energy is turned into current, and an outer parapet with a crane gantry over it all
  L.penrose_engine = function () {
    var N = 39, c = 19
    var rail = {}
    var house = {}
    for (var k = 0; k < 12; k++) {
      var a = k * PI / 6
      for (var t = 5; t <= 17; t++) rail[Math.round(c + t * Math.cos(a)) * 64 + Math.round(c + t * Math.sin(a))] = t
      var b = a + PI / 12
      var hx = Math.round(c + 13 * Math.cos(b))
      var hz = Math.round(c + 13 * Math.sin(b))
      for (var ix = -2; ix <= 2; ix++) for (var iz = -2; iz <= 2; iz++) house[(hx + ix) * 64 + hz + iz] = [ix, iz]
    }
    return {
      w: N, h: 11, d: N,
      pal: pal({ C: COIL_MH, R: RHEA, L: 'gtceu:laminated_glass', Q: 'tungsten_steel', A: RHEA }),
      fn: function (x, y, z) {
        var dx = x - c
        var dz = z - c
        var r = rad(dx, dz)
        var key = x * 64 + z
        if (r >= 18.5 && r < 19.5) {
          if (y === 0) return 'X'
          if (y <= 2) return y === 2 && (x + z) % 3 === 0 ? 'L' : 'F'
          if (y === 3) return 'R'
          if (y === 9) return (x + z) % 2 === 0 ? 'Q' : ' '
          return ' '
        }
        if (y === 8 && r >= 8 && r < 9 && (x + z) % 2 === 0) return 'Q'
        if (y === 9 && r >= 18.5 && r < 19.5 && (x + z) % 2 === 0) return 'Q'
        if (r < 3.5) {
          if (r >= 2.5) return y >= 1 ? (y % 3 === 1 ? 'F' : 'L') : 'F'
          return y === 0 ? 'F' : '#'
        }
        if (r < 4.5 && y >= 2 && y <= 3) return 'C'
        if (house[key] !== undefined && r > 8 && r < 17.5) {
          if (y === 5) return 'R'
          if (y >= 1 && y <= 4) {
            var ix = house[key][0]
            var iz = house[key][1]
            if (abs(ix) !== 2 && abs(iz) !== 2) return '#'
            if (abs(ix) === 2 && abs(iz) === 2) return 'F'
            return y === 3 && (ix + iz) % 2 === 0 ? 'L' : 'F'
          }
        }
        if (rail[key] !== undefined && y >= 1 && y <= 3) {
          var tt = rail[key]
          if (y === 3) return 'Q'
          return tt % 4 === 0 ? 'F' : ' '
        }
        if (y === 0) {
          if (r >= 8.5 && r < 9.5) return 'R'
          if (rail[key] !== undefined) return 'R'
        }
        return ' '
      }
    }
  }
  // Ramp compression pulser: a central compression drum fed by twelve Marx-bank arms, each a hollow tube ringed with coilgun coils, on pylons
  // inside a floor rim. Its field casing is the bootstrap stand-in (T.BOOT): the pulser makes the metallic hydrogen the real field needs.
  L.ramp_compression_pulser = function () {
    var N = 31, c = 15
    var arm = {}
    for (var k = 0; k < 12; k++) {
      var a = k * PI / 6
      var ca = Math.cos(a), sa = Math.sin(a)
      for (var t = 4; t <= 14.5; t += 0.5) {
        var px = c + t * ca, pz = c + t * sa
        for (var ix = Math.floor(px) - 2; ix <= Math.ceil(px) + 2; ix++) for (var iz = Math.floor(pz) - 2; iz <= Math.ceil(pz) + 2; iz++) {
          var ex = ix - c, ez = iz - c
          var along = ex * ca + ez * sa
          var perp = abs(-ex * sa + ez * ca)
          if (along >= 4 && along <= 14.5 && perp <= 1.5) {
            var key = ix * 64 + iz
            var cur = arm[key]
            if (cur === undefined || perp < cur[0]) arm[key] = [perp, Math.round(along)]
          }
        }
      }
    }
    return {
      w: N, h: 11, d: N,
      pal: pal({ A: MH, C: 'grindless:coilgun_coil_casing', L: 'gtceu:laminated_glass', Q: 'tungsten_steel', P: 'gtceu:tungstensteel_pipe_casing' }),
      fn: function (x, y, z) {
        var dx = x - c, dz = z - c
        var r = rad(dx, dz)
        var key = x * 64 + z
        if (r >= 14.5 && r < 15.5) {
          if (y === 0) return 'X'
          if (y === 1) return 'F'
          if (y === 2) return (x + z) % 2 === 0 ? 'A' : 'F'
          return ' '
        }
        if (r < 4.5) {
          if (r >= 3.5) {
            if (y >= 10) return ' '
            return y % 3 === 1 && y < 9 ? 'L' : 'F'
          }
          if (y === 0) return 'F'
          if (y === 10 && r < 3.5) return 'F'
          if (y === 9) return 'A'
          return r < 1.5 ? 'P' : '#'
        }
        if (arm[key] !== undefined && y >= 3 && y <= 5) {
          var m = arm[key]
          var inside = m[0] < 0.7 && y === 4
          if (inside) return '#'
          if (m[1] % 4 === 0) return 'C'
          if (m[1] % 2 === 0) return 'A'
          return m[1] % 4 === 1 && y !== 4 ? 'A' : 'F'
        }
        if (arm[key] !== undefined && y >= 1 && y <= 2 && arm[key][1] % 5 === 0 && arm[key][0] < 0.7) return 'Q'
        if (y === 0 && arm[key] !== undefined) return 'F'
        if (y === 0 && r >= 9.5 && r < 10.5) return 'F'
        return ' '
      }
    }
  }

  // Neutronium compression hall: four press stations in a line down a tall hall, each an RHEA bed, metallic-hydrogen uprights, a head beam
  // on a ram and four field coils, with a gantry on rails over them and the melt line of the neutronium along the floor.
  L.neutronium_compression_hall = function () {
    var ST = [4, 9, 14, 19]
    return {
      w: 19, h: 13, d: 25,
      pal: pal({ A: MH, R: RHEA, C: COIL_MH, L: 'gtceu:laminated_glass', Q: 'tungsten_steel', P: 'gtceu:tungstensteel_pipe_casing', B: 'gtceu:tungstensteel_gearbox' }),
      fn: T.hall({
        w: 19, d: 25, hh: 10, mull: 4,
        crown: function (x, k, z) {
          var dx = abs(x - 9), dz = abs(z - 12)
          if (k === 0) return dx <= 3 && dz <= 4 ? 'A' : ' '
          if (k === 1) return dx <= 1 && dz <= 2 ? 'P' : ' '
          return ' '
        },
        inner: function (x, y, z) {
          var dx = x - 9
          var ax = abs(dx)
          if (ax === 7 && y === 8 && z >= 2 && z <= 22) return 'Q'
          if (ax === 7 && y <= 8 && (z === 2 || z === 22)) return 'Q'
          if (y === 9 && ax <= 7 && (z === 6 || z === 16)) return ax === 7 ? 'Q' : 'B'
          if (y === 1 && ax === 0 && z >= 3 && z <= 21) return 'P'
          for (var i = 0; i < 4; i++) {
            var dz = z - ST[i]
            var adz = abs(dz)
            if (y === 1 && ax <= 3 && adz <= 3) return 'R'
            if (y === 2 && ax <= 2 && adz <= 2) return 'R'
            if (ax === 3 && adz === 3 && y >= 2 && y <= 6) return 'A'
            
            if (y === 7 && ax <= 3 && adz <= 3) return 'A'
            if (y >= 3 && y <= 6 && ax === 0 && adz === 0) return y === 3 ? 'A' : 'P'
            if (y === 5 && ((ax === 2 && adz === 0) || (ax === 0 && adz === 2))) return 'C'

          }
          return null
        }
      })
    }
  }
})()
