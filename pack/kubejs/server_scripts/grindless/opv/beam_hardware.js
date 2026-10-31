// -----------------------------------------------------------------------------------------------
// OpV beam hardware (package OpV-D1, docs/eras/opv.md "D1"): the GTM-type steps of process lines 20-25 and the NEG casing. The older
// machines' own rows are in their tables and scripts:
//
//   line 20  Be window   fluorspar kiln (iv/fluorspar_kiln.js: Be and worn window scrap -> BeF2), electron beam c24 (BeF2 + Ca -> Be,
//                        the CaF2 back to the kiln's charge) and c25 (foil brazed to a titanium flange; the trim is window scrap)
//   line 21  Ir target   platinum plant c13 (5N Ir, UXV-A2), spark plasma sinterer c11 (rod), MTJ sputtering c9 (Ta cladding);
//                        spent: hot cell c18 (declad) -> platinum plant c15-16 (Ir back; Os and W from the residue)
//   line 22  LiH shield  UEV pyro and Mk5 (li6_hydride), spark plasma sinterer c12 (tiles), electron beam c26 (canned);
//                        spent: the blast furnace below bakes it out -> tritium removal (iv/tritium_removal.js: T and He-3)
//   line 23  e-cooler    crystal growth c23 (CeB6 boule), He refrigerator (the gun cooled to 4 K -> electron_cooler)
//   line 24  pickup      electron beam c31 (NbTiN on RRR Nb; the trim is niobium powder for c4), the blast furnace below (brazed tank),
//                        He refrigerator (the tank at 4 K -> stochastic_cooling_pickup)
//   line 25  NEG casing  levitation melter c17 (TiZrV), spark plasma sinterer c13 (target), MTJ sputtering c10 (coated chambers),
//                        electron beam c30 (activation bake; the chamber that does not activate goes back to the melter, c18)
//
// Here (every row above V[UXV] = 134,217,728 EU/t):
//   hot_rolling              circuit 13 (1-3 generated, 4 the levitation melter, 5-12 UXV): the electron-beam Be ingot to window foil
//   electric_blast_furnace   CeB6 from cerium and boron; the pickup tank vacuum-brazed; the spent LiH shield baked out (LiH back to the sinterer, the steel can and the
//                            tungsten skin back as dust, the bred gas to the tritium removal facility)
//   lathe                    the CeB6 boule cut to two cathodes; the kerf is CeB6 powder the crystal growth furnace grows again
//   assembler                the five beam parts at VA[OpV] and grindless:neg_xhv_casing (2 OpV circuits, docs/eras/opv.md *Common*); the e-gun
//                            takes an activated NEG chamber (line 25) and the LiH shield the UEV lead-polymer liner
//
// grindless:nbtin_film (A2) and grindless:spent_li6_shield (B3) are other packages' ids: a row that takes one skips itself (logged as
// pending, not as an error) until that package registers it.
// Published in global.grindless.opvBeamHardware: .rows ([{ id, path, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration,
// temp }]), .added (recipe ids), .skipped ([{ id, reason }]).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var OPVB = G.opvBeamHardware || (G.opvBeamHardware = {})

  var STEP = 167772160      // the intermediate steps: above V[UXV]
  var OPV_VA = 503316480    // VA[OpV]: the beam parts and the casing

  var WATER = 'minecraft:water'
  var STEAM = 'gtceu:steam'
  var HE = 'gtceu:he_6n'
  var NITROGEN = 'gtceu:nitrogen'
  var PENDING = { 'grindless:nbtin_film': 'A2', 'grindless:spent_li6_shield': 'B3' }

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(path, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration, temp) {
    return { id: 'grindless:' + type + '/' + path, path: path, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn,
      itemsOut: itemsOut, fluidsOut: fluidsOut, eut: eut, duration: duration, temp: temp || null }
  }

  OPVB.rows = [
    // line 20: the hot strip mill rolls the electron-beam beryllium to window foil (water in, steam out: the generated pattern)
    row('opv/be_window_foil', 'hot_rolling', 13, [item('grindless:eb_beryllium_ingot', 1)], [fluid(WATER, 50)],
      [item('grindless:be_window_foil', 4)], [fluid(STEAM, 8000)], STEP, 200),

    // line 22: the spent shield baked out under vacuum. 2 of its 8 LiH were burnt (Li-6 + n -> T + He-4); the 6 left go back to the
    // sinterer's tiles, the steel can and the tungsten skin come back as dust, and the bred gas goes to the tritium removal facility
    row('opv/spent_li6_shield_bakeout', 'electric_blast_furnace', null, [item('grindless:spent_li6_shield', 1)], [],
      [item('grindless:li6_hydride', 6), item('gtceu:stainless_steel_dust', 2), item('gtceu:tungsten_dust', 2)],
      [fluid('gtceu:bred_tritium_gas', 1000)], STEP, 600, 1100),

    // line 23: cerium hexaboride from the elements (Ce + 6 B), the feed of the crystal growth furnace's float zone (c23)
    row('opv/ceb6_powder', 'electric_blast_furnace', null, [item('gtceu:cerium_dust', 1), item('gtceu:boron_dust', 6)], [],
      [item('grindless:ceb6_powder', 7)], [], STEP, 300, 2500),
    // line 24: the pickup array vacuum-brazed into its stainless steel tank; the He refrigerator then takes it to 4 K
    row('opv/brazed_pickup_tank', 'electric_blast_furnace', null, [item('grindless:pickup_array', 1), item('gtceu:stainless_steel_plate', 2)], [],
      [item('grindless:brazed_pickup_tank', 1)], [], STEP, 400, 1300),
    // the boule cut and polished to two cathodes; the kerf is CeB6 powder for the next boule
    row('opv/ceb6_cathode', 'lathe', null, [item('grindless:ceb6_boule', 1)], [],
      [item('grindless:ceb6_cathode', 2), item('grindless:ceb6_powder', 1)], [], STEP, 400),

    // the beam parts, assembled under dry nitrogen (the UHV vent gas) and leak-tested in 6N helium; the flanges seal on copper gaskets
    // line 20: the brazed window on a titanium flange with its seal rings
    row('opv/be_beam_window', 'assembler', null, [item('grindless:brazed_be_window', 1), item('gtceu:titanium_plate', 2),
      item('gtceu:titanium_ring', 2), item('gtceu:copper_foil', 1)], [fluid(NITROGEN, 1000), fluid(HE, 250)],
      [item('grindless:be_beam_window', 1)], [], OPV_VA, 400),
    // line 21: the clad rods in a tungsten case with tungstensteel coolant channels
    row('opv/ir_spallation_target', 'assembler', null, [item('grindless:ta_clad_ir_rod', 4), item('gtceu:tungsten_plate', 2),
      item('gtceu:tungsten_steel_small_fluid_pipe', 2), item('gtceu:tungsten_steel_ring', 2)], [fluid(NITROGEN, 1000), fluid(HE, 250)],
      [item('grindless:ir_spallation_target', 1)], [], OPV_VA, 400),
    // line 22: the canned LiH (slow neutrons) behind tungsten (fast neutrons) and the UEV lead-polymer liner (gammas), in a steel housing
    row('opv/li6_hydride_shield', 'assembler', null, [item('grindless:canned_li6h_block', 2), item('gtceu:tungsten_plate', 2),
      item('grindless:lead_polymer_liner', 1), item('gtceu:stainless_steel_plate', 2)], [fluid(NITROGEN, 1000), fluid(HE, 250)],
      [item('grindless:li6_hydride_shield', 1)], [], OPV_VA, 400),
    // line 23: the cathode behind tantalum heat shields in a chain field coil's solenoid, its drift section an activated NEG chamber
    // (line 25: the cooler's beam needs XHV); the He refrigerator takes the gun to 4 K (electron_cooler)
    row('opv/cooler_electron_gun', 'assembler', null, [item('grindless:ceb6_cathode', 1), item('grindless:chain_field_coil', 2),
      item('grindless:activated_neg_chamber', 1), item('gtceu:tantalum_foil', 2)], [fluid(NITROGEN, 1000), fluid(HE, 250)],
      [item('grindless:cooler_electron_gun', 1)], [], OPV_VA, 400),
    // line 25: the activated chambers in a titanium frame, two OpV circuits for the pumping controls (docs/eras/opv.md *Common*)
    row('opv/neg_xhv_casing', 'assembler', null, [item('grindless:activated_neg_chamber', 4), item('gtceu:titanium_plate', 4),
      item('gtceu:copper_foil', 2), item('#gtceu:circuits/opv', 2)], [fluid(NITROGEN, 1000), fluid(HE, 1000)],
      [item('grindless:neg_xhv_casing', 2)], [], OPV_VA, 600)
  ]

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) {
      if (x.id.charAt(0) === '#') return
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function add(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      var waits = missing.every(function (id) { return PENDING[id] !== undefined })
      var reason = (waits ? 'waits for ' : 'unknown id(s) ') + missing.map(function (id) { return PENDING[id] ? id + ' (' + PENDING[id] + ')' : id }).join(', ')
      OPVB.skipped.push({ id: r.id, reason: reason })
      if (waits) console.info(LOG + 'beam_hardware recipe ' + r.id + ' ' + reason)
      else console.error(LOG + 'beam_hardware recipe skipped ' + r.id + ': ' + reason)
      return
    }
    var b = event.recipes.gtceu[r.type]('grindless:' + r.path)
    r.itemsIn.forEach(function (x) { b.itemInputs(x.count + 'x ' + x.id) })
    if (r.circuit !== null) b.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { b.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { b.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { b.outputFluids(Fluid.of(x.id, x.amount)) })
    if (r.temp !== null) b.blastFurnaceTemp(r.temp)
    b.EUt(r.eut).duration(r.duration)
    OPVB.added.push(r.id)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    OPVB.added = []
    OPVB.skipped = []
    OPVB.rows.forEach(function (r) {
      try {
        add(event, r)
      } catch (e) {
        OPVB.skipped.push({ id: r.id, reason: 'the builder failed: ' + e })
        console.error(LOG + 'beam_hardware recipe ' + r.id + ' failed: ' + e)
      }
    })
    console.info(LOG + 'beam_hardware recipes added: ' + OPVB.added.length + '; skipped ' + OPVB.skipped.length)
  })
})()
