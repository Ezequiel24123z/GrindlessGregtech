// priority: -26279
// UXV-A8 (docs/eras/uxv.md "A8"): UXV's five parts and the GTM-type steps of lines 34-37, 45 and 49. The older machines' own rows are in their
// tables (magnet_works c8 and c10, hts_magnet_works c6, coated_conductor_line c4).
//
//   hot_rolling   the hot strip mill, circuits 9-12 (1-3 are the generated rows, 4 the levitation melter, 5-8 UXV-A2 and A3): tetrataenite ingot to
//                 laminations (9) and to the encoder ring (12), lasagna plate to the ALIP duct (10), gum metal billet to the blank (11).
//   lathe         the blank, cold-swaged, hobbed and shot-peened, to the gum metal flexspline (the swarf goes back to the powder bed's blend).
//   assembler     the strain-wave gear and the TMR encoder (machine form, an era fluid and five domain items).
//   assembly_line the motor, pump, piston, conveyor module and robot arm, each behind station research on the UIV part.
//
// The pump's NaK is GTM's own chemical reactor recipe (ordinary sodium + potassium, gtceu:chemical_reactor/sodium_potassium); no row here.
// Published in global.grindless.uxvParts: .rows ([{ id, path, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration }]),
// .parts ([{ name, research, itemsIn, fluidsIn, eut, duration }]), .partRecipes, .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var UP = G.uxvParts || (G.uxvParts = {})

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(path, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration) {
    return { id: 'grindless:' + type + '/' + path, path: path, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut,
      fluidsOut: fluidsOut, eut: eut, duration: duration }
  }

  var WATER = 'minecraft:water'
  var STEAM = 'gtceu:steam'
  var HE = 'gtceu:he_6n'
  var LUBRICANT = 'gtceu:lubricant'
  var SOLDER = 'gtceu:soldering_alloy'

  // hot strip mill: water in, steam out (the generated pattern); the type holds one item output
  UP.rows = [
    row('uxv/tetrataenite_lamination', 'hot_rolling', 9, [item('gtceu:tetrataenite_ingot', 1)], [fluid(WATER, 50)],
      [item('grindless:tetrataenite_lamination', 4)], [fluid(STEAM, 8000)], 7680, 200),
    row('uxv/alip_duct', 'hot_rolling', 10, [item('grindless:lasagna_plate', 1)], [fluid(WATER, 50)],
      [item('grindless:alip_duct', 2)], [fluid(STEAM, 8000)], 491520, 300),
    row('uxv/gum_metal_blank', 'hot_rolling', 11, [item('grindless:gum_metal_billet', 1)], [fluid(WATER, 50)],
      [item('grindless:gum_metal_blank', 1)], [fluid(STEAM, 8000)], 30720, 300),
    row('uxv/encoder_ring', 'hot_rolling', 12, [item('gtceu:tetrataenite_ingot', 1)], [fluid(WATER, 50)],
      [item('grindless:encoder_ring', 2)], [fluid(STEAM, 8000)], 7680, 200),

    // cold swage to a cup (90%), hob the teeth, shot-peen: one lathe row, the swarf is the blend the powder bed sinters again
    row('uxv/gum_metal_flexspline', 'lathe', null, [item('grindless:gum_metal_blank', 1)], [fluid(LUBRICANT, 100)],
      [item('grindless:gum_metal_flexspline', 1), item('grindless:gum_metal_blend', 1)], [], 491520, 400),

    // the strain-wave gear: flexspline in a circular spline of RHEA plate on a wave generator (tantalum foil races, tungsten steel rings)
    row('uxv_strain_wave_gear', 'assembler', null, [item('grindless:gum_metal_flexspline', 1), item('gtceu:rhea_plate', 2), item('grindless:ta_foil', 2),
      item('gtceu:tungsten_steel_ring', 2), item('gtceu:tungsten_foil', 2)], [fluid(LUBRICANT, 250), fluid(HE, 500)],
      [item('grindless:uxv_strain_wave_gear', 1)], [], 7864320, 400),

    // the TMR encoder: the multipole ring over a tunnel-magnetoresistance bridge of two MTJ dice, shielded, wired in gold, in a titanium housing
    row('tmr_encoder', 'assembler', null, [item('grindless:multipole_encoder_ring', 1), item('grindless:mtj_die', 2), item('grindless:mu_metal_foil', 2),
      item('gtceu:gold_foil', 4), item('gtceu:titanium_plate', 1)], [fluid(SOLDER, 144), fluid(HE, 500)],
      [item('grindless:tmr_encoder', 1)], [], 7864320, 300)
  ]

  // the five parts: assembly line behind station research on the UIV part; 6N helium, soldering alloy and lubricant (the NaK replaces the pump's lubricant)
  var CIRCUITS = '2x #gtceu:circuits/uiv'
  UP.parts = [
    { name: 'uxv_electric_motor', research: 'grindless:uiv_electric_motor',
      itemsIn: ['grindless:uiv_electric_motor', '2x grindless:strand_stator', '2x grindless:tetrataenite_rotor', '2x grindless:mh_winding',
        '2x grindless:field_cooled_gdbco', CIRCUITS],
      fluidsIn: [fluid(HE, 1000), fluid(SOLDER, 1152), fluid(LUBRICANT, 1000)], eut: 7864320, duration: 1200 },
    { name: 'uxv_electric_pump', research: 'grindless:uiv_electric_pump',
      itemsIn: ['grindless:uiv_electric_pump', '2x grindless:alip_duct', '3x grindless:strand_tape', '2x grindless:balanced_rhea_impeller', CIRCUITS],
      fluidsIn: [fluid(HE, 1000), fluid('gtceu:sodium_potassium', 1000), fluid(SOLDER, 1152)], eut: 7864320, duration: 1200 },
    { name: 'uxv_electric_piston', research: 'grindless:uiv_electric_piston',
      itemsIn: ['grindless:uiv_electric_piston', '2x grindless:terfenol_d_rod', '2x grindless:lasagna_plate', '2x grindless:strand_tape', CIRCUITS],
      fluidsIn: [fluid(HE, 1000), fluid(SOLDER, 1152), fluid(LUBRICANT, 1000)], eut: 7864320, duration: 1200 },
    { name: 'uxv_conveyor_module', research: 'grindless:uiv_conveyor_module',
      itemsIn: ['grindless:uiv_conveyor_module', '3x grindless:ni_mn_ga_crystal', '3x grindless:strand_tape', '2x gtceu:tungsten_steel_plate', CIRCUITS],
      fluidsIn: [fluid(HE, 1000), fluid(SOLDER, 1152), fluid(LUBRICANT, 1000)], eut: 7864320, duration: 1200 },
    { name: 'uxv_robot_arm', research: 'grindless:uiv_robot_arm',
      itemsIn: ['grindless:uiv_robot_arm', '3x grindless:uxv_strain_wave_gear', '2x grindless:tmr_encoder', 'grindless:uxv_electric_piston', CIRCUITS],
      fluidsIn: [fluid(HE, 1000), fluid(SOLDER, 1152), fluid(LUBRICANT, 1000)], eut: 7864320, duration: 1500 }
  ]

  UP.skipped = []
  UP.partRecipes = []

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function add(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      UP.skipped.push({ id: r.id, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'uxv_parts recipe skipped ' + r.id + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu[r.type]('grindless:' + r.path)
    r.itemsIn.forEach(function (x) { b.itemInputs(x.count + 'x ' + x.id) })
    if (r.circuit !== null) b.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { b.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { b.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { b.outputFluids(Fluid.of(x.id, x.amount)) })
    b.EUt(r.eut).duration(r.duration)
  }

  function addPart(event, p) {
    var out = 'grindless:' + p.name
    var strip = function (s) { return s.replace(/^\d+x /, '') }
    var missing = [out, p.research].concat(p.itemsIn.filter(function (s) { return s.indexOf('#') < 0 }).map(strip)).filter(function (id) { return !Item.exists(id) })
    p.fluidsIn.forEach(function (f) { if (!Fluid.exists(f.id)) missing.push(f.id) })
    if (missing.length > 0) {
      UP.skipped.push({ id: 'assembly_line/' + p.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'uxv_parts ' + p.name + ' assembly line skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:' + p.name)
    p.itemsIn.forEach(function (s) { b.itemInputs(s) })
    p.fluidsIn.forEach(function (f) { b.inputFluids(Fluid.of(f.id, f.amount)) })
    b.itemOutputs(out)
    b.stationResearch(function (r) { return r.researchStack(Item.of(p.research)).CWUt(64).EUt(7864320) })
    b.EUt(p.eut).duration(p.duration)
    UP.partRecipes.push('grindless:assembly_line/' + p.name)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      UP.rows.forEach(function (r) { add(event, r) })
      UP.parts.forEach(function (p) { addPart(event, p) })
      console.info(LOG + 'uxv_parts: ' + UP.rows.length + ' rows and ' + UP.partRecipes.length + ' part lines added, ' + UP.skipped.length + ' skipped')
    } catch (e) {
      console.error(LOG + 'uxv_parts recipes failed: ' + e)
    }
  })
})()
