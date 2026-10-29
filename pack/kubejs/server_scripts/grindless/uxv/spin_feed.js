// UXV-A2 (docs/eras/uxv.md "A2"): the spintronic feedstock that no older plant row makes: the hot strip mill's foils, the oxide charges
// (GTM mixer), the seven bonded sputter targets (GTM assembler), the spent-CoFeB re-press and the gum-metal sinter (powder bed).
// The older plants' own rows are in their own files; the powder bed's atomise, print and press rows come from tables/am_powders.json.
// Published in global.grindless.spinFeed: .hotRolling, .charges, .targets, .powderBed ([{ id, type, circuit, itemsIn, fluidsIn, itemsOut,
// fluidsOut, eut, duration }]), .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var SF = G.spinFeed || (G.spinFeed = {})

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(path, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration) {
    return { id: 'grindless:' + type + '/' + path, path: path, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut, fluidsOut: fluidsOut,
      eut: eut, duration: duration }
  }

  var PLATE = 'gtceu:copper_plate'
  var SOLDER = 'gtceu:soldering_alloy'
  var ARGON = 'gtceu:argon'

  // hot strip mill (type hot_rolling): circuits 1-3 are the generated rows, 4 the levitation melter
  SF.hotRolling = [
    row('uxv/ta_foil', 'hot_rolling', 5, [item('grindless:six_n_tantalum', 1)], [fluid('minecraft:water', 50)],
      [item('grindless:ta_foil', 4)], [fluid('gtceu:steam', 8000)], 1920, 200),
    row('uxv/pt_sheet', 'hot_rolling', 6, [item('grindless:five_n_platinum', 1)], [fluid('minecraft:water', 50)],
      [item('grindless:pt_sheet', 2)], [fluid('gtceu:steam', 8000)], 1920, 200)
  ]

  // oxide charges and the gum-metal blend (GTM mixer, no circuit: the inputs are different in every row)
  SF.charges = [
    row('uxv/dysco3_charge', 'mixer', null, [item('grindless:dysprosium_oxide_dust', 1), item('grindless:scandium_oxide_dust', 1)], [],
      [item('grindless:dysco3_charge_dust', 2)], [], 480, 100),
    row('uxv/ggg_charge', 'mixer', null, [item('gtceu:gadolinium_oxide_dust', 3), item('grindless:gallium_oxide_dust', 5)], [],
      [item('grindless:ggg_charge_dust', 8)], [], 480, 100),
    row('uxv/srruo3_charge', 'mixer', null, [item('grindless:five_n_ruthenium', 1), item('grindless:strontium_carbonate_dust', 1)], [],
      [item('grindless:srruo3_charge_dust', 2)], [], 480, 100),
    row('uxv/la_bfo_charge', 'mixer', null, [item('gtceu:lanthanum_oxide_dust', 1), item('gtceu:bismuth_dust', 1), item('gtceu:hematite_dust', 1)], [],
      [item('grindless:la_bfo_charge_dust', 3)], [], 480, 100),
    row('uxv/gum_metal_blend', 'mixer', null, [item('gtceu:titanium_dust', 3), item('grindless:six_n_niobium', 1), item('gtceu:tantalum_dust', 1),
      item('gtceu:zirconium_dust', 1)], [], [item('grindless:gum_metal_blend', 6)], [], 480, 100)
  ]

  // the seven bonded targets: the HIP blank indium-bonded to its copper backing plate under solder flux and argon
  var TARGETS = [['cofeb_target', 'cofeb_hip_blank', 1], ['mgo_target', 'mgo_hip_blank', 1], ['heusler_target', 'heusler_hip_blank', 1],
    ['saf_target_set', 'saf_hip_blank', 1], ['srruo3_target', 'srruo3_hip_blank', 1], ['la_bfo_target', 'la_bfo_hip_blank', 1],
    ['ta_seed_target', 'ta_foil', 2]]
  SF.targets = TARGETS.map(function (t) {
    return row('uxv/' + t[0], 'assembler', null, [item('grindless:' + t[1], t[2]), item(PLATE, 1), item('gtceu:indium_dust', 1)], [fluid(SOLDER, 144), fluid(ARGON, 1000)],
      [item('grindless:' + t[0], 1)], [], 1920, 200)
  })

  // powder bed: circuits 1-14 are the table's rows (atomise 1, press 3, parts 2 and 4-14)
  SF.powderBed = [
    row('uxv/repress_spent_cofeb', 'powder_bed_fusion', 15, [item('grindless:spent_cofeb_target', 1)], [fluid(ARGON, 1000)],
      [item(PLATE, 1), item('grindless:cofeb_am_powder', 4)], [fluid(ARGON, 950)], 122880, 200),
    row('uxv/gum_metal_sinter', 'powder_bed_fusion', 16, [item('grindless:gum_metal_blend', 6)], [fluid(ARGON, 1000)],
      [item('grindless:gum_metal_billet', 6)], [fluid(ARGON, 950)], 491520, 400)
  ]

  SF.skipped = []

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function add(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      SF.skipped.push({ id: r.id, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'spin_feed recipe skipped ' + r.id + ': unknown id(s) ' + missing.join(', '))
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

  ServerEvents.recipes(function (event) {
    try {
      var all = SF.hotRolling.concat(SF.charges, SF.targets, SF.powderBed)
      all.forEach(function (r) { add(event, r) })
      console.info(LOG + 'spin_feed recipes: ' + (all.length - SF.skipped.length) + ' added, ' + SF.skipped.length + ' skipped')
    } catch (e) {
      console.error(LOG + 'spin_feed recipes failed: ' + e)
    }
  })
})()
