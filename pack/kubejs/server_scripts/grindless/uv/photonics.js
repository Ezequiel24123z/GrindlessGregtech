// priority: -25624
// -----------------------------------------------------------------------------------------------
// Recipes of UV's photonics (docs/eras/uv.md, machines 9 and 10, lines 8 and 9; package UV-A6): the fibre draw tower, the MOCVD reactor
// and the small side steps that feed them (machines and items: startup_scripts/grindless/uv/photonics.js). VA[LuV] = 30,720 EU/t,
// VA[ZPM] = 122,880 EU/t, VA[UV] = 491,520 EU/t.
//
//   fibre draw tower (type gtceu:fibre_draw; the programmed circuit picks the step)
//     1 preform    5 silicon tetrachloride (GTCA's dust, one mole) + 1 ytterbium oxide (the cascade's Yb strip) + 1 aluminium dust +
//                  100 mB germanium tetrachloride (UV-A7's germanium refinery) + 3,700 mB oxygen -> 1 Yb-doped preform + 1 glass dust
//                  (the silica soot that misses the tube) + 4,400 mB chlorine (MCVD: SiCl4 + GeCl4 + 2 O2 each -> the oxides + the
//                  chlorine; the aluminium co-dopant burns to alumina; GTM's units: 1,000 mB per Cl or O atom)   122,880 x 600 t
//     2 draw       1 preform + 250 mB acrylate coating -> 16 ytterbium fibre spools                                   30,720 x 400 t
//     3 module     4 fibre spools + 4 InGaAs pump modules + 1 fibre Bragg grating -> 1 fibre laser module            122,880 x 400 t
//     4 refurbish  1 spent laser module (UV-A3's laser fusion chamber, 2 % wear) + 1 fibre spool -> 1 fibre laser module
//                  (the pumps and the grating are kept; the burnt fibre is replaced)                                    30,720 x 200 t
//   MOCVD reactor (type gtceu:mocvd; the programmed circuit picks the step)
//     1 organometallics  1 gallium dust + 1 indium dust + 6 sodium dust + 6,000 mB chloromethane -> 1,000 mB trimethylgallium +
//                  1,000 mB trimethylindium + 12 salt (Wurtz-type: M + 3 CH3Cl + 3 Na -> M(CH3)3 + 3 NaCl; NaCl is 2 dust) 30,720 x 300 t
//     2 epi        1 gallium arsenide wafer + 250 mB trimethylgallium + 250 mB trimethylindium + 1,000 mB arsine -> 1 InGaAs epi
//                  wafer + 1,500 mB methane + 500 mB arsine (MOCVD runs arsine in excess, V/III = 2: the unreacted half is fed back or
//                  goes to circuit 6; M(CH3)3 + AsH3 -> MAs + 3 CH4)                                              491,520 x 800 t
//     3 bars       1 epi wafer -> 8 InGaAs diode bars (cleaved)                                                       122,880 x 200 t
//     4 NbN        1 sapphire wafer + 1 niobium dust + 100 mB nitrogen -> 1 NbN film wafer (reactive sputtering; UV-A7's SNSPD
//                  takes it)                                                                                          122,880 x 400 t
//     5 pump       4 diode bars + 2 copper plates (the heat sink) -> 1 InGaAs pump module                              30,720 x 200 t
//     6 scrub      1,000 mB arsine -> 1 arsenic dust + 3,000 mB hydrogen (the burn box in the gas cabinet's exhaust:
//                  2 AsH3 -> 2 As + 3 H2, cracked hot; THE ARSINE SCRUBBER)                                             1,920 x 100 t
//   MOCVD reactor, UHV rows (package UHV-A5, docs/eras/uhv.md Older machines; published apart in .uhvRows, so .recipes stays UV's)
//     7 IMM epi    1 gallium arsenide wafer + 1 phosphorus dust + 500 mB trimethylgallium + 250 mB trimethylindium + 1,000 mB arsine
//                  -> 1 IMM epi wafer + 2,250 mB methane + 500 mB arsine (GaInP/GaAs/InGaAs grown upside down, NREL's inverted
//                  metamorphic cell; the solar array fab lifts it off and returns the substrate)                    491,520 x 1,200 t
//     8 NbN plate  1 SiC mirror blank (the SiC device fab) + 2 niobium dust + 200 mB nitrogen -> 1 NbN-coated SiC plate
//                  (reactive sputtering as in circuit 4)                                                              122,880 x 400 t
//   side steps (GTM's own machines)
//     arsine       chemical reactor: 2 arsenic dust + 3 magnesium dust + 6,000 mB hydrochloric acid -> 2,000 mB arsine + 9 magnesium
//                  chloride (Mg3As2 + 6 HCl -> 2 AsH3 + 3 MgCl2, the magnesium arsenide made and hydrolysed in one step)   480 x 200 t
//     acrylate     chemical reactor, circuit 7: 1,000 mB propene + 3,000 mB oxygen -> 1,000 mB acrylate coating + 1,000 mB water
//                  (propene oxidation to acrylic acid, the coating's monomer, reckoned as the coating)                 480 x 200 t
//     GaAs boule   electric blast furnace, circuit 6, 1,600 K: 8 gallium arsenide dust + 1,000 mB argon -> 1 GaAs boule       1,920 x 600 t
//     GaAs wafers  cutter: 1 GaAs boule + 100 mB lubricant -> 8 GaAs wafers                                            1,920 x 200 t
//     sapphire boule  electric blast furnace, 2,400 K: 1 sapphire block + 1,000 mB argon -> 1 sapphire boule (Kyropoulos growth;
//                  a block, not dust: GTM's blast furnace already turns sapphire dust into aluminium)                 7,680 x 600 t
//     sapphire wafers  cutter: 1 sapphire boule + 100 mB lubricant -> 8 sapphire wafers                                 1,920 x 200 t
//     Bragg grating  laser engraver, purple lens kept: 1 ytterbium fibre spool -> 1 fibre Bragg grating                 30,720 x 200 t
//   crafting: 1 fibre laser module <-> 1 laser module block (the laser fusion chamber's and Starshot's structure block)
//   controllers (crafting grid): UV hull + 2 UV motors + UV sensor + 4 UV circuits (tower); UV hull + 2 UV pumps + UV sensor + 4 UV
//   circuits (reactor)
//
// Destinations (rule 3 of AGENTS.md):
//   chlorine (preform)    -> silicon tetrachloride again (GTCA's chemical reactor: silicon + chlorine) or GTM's hydrochloric acid
//   glass dust            -> GTM's glass recipes (alloy smelter, furnace)
//   methane (epi)         -> ZPM's methane pyrolyser (gtceu:methane_pyrolyser: hydrogen and carbon) or GTM's chloromethane step
//   arsine (epi, unused)  -> back into circuit 2 (or 7) or into circuit 6, the scrubber; it is never voided
//   arsenic (scrub)       -> the arsine step again; hydrogen -> GTM's hydrochloric acid (chlorine + hydrogen)
//   salt (organometallics) -> GTM's electrolyser (sodium + chlorine; the sodium comes back to circuit 1)
//   magnesium chloride    -> GTM's electrolyser (magnesium + chlorine; the magnesium comes back to the arsine step)
//   water (acrylate)      -> any water consumer, the Yb strip among them
//   spent laser module    -> circuit 4 (refurbished)
//
// Lookup: every tower and reactor recipe has its own circuit, so no recipe's keys contain another's (checked at load). Ids not yet
// registered (the spent laser module until UV-A3 merges) skip their row with a console error. Published in global.grindless.photonics:
// .recipes [{ name, type, recipeId, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration, temp, notConsumable }], .side,
// .uhvRows (circuits 7-8, the same shape), .crafting, .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var P = G.photonics || (G.photonics = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}
  var EC = G.extractionCascade && G.extractionCascade.ids ? G.extractionCascade.ids : {}

  var LUV = 30720
  var ZPM = 122880
  var UVA = 491520

  var FIBRE_MODULE = UV.fibreLaserModule || 'grindless:fibre_laser_module'
  var MODULE_BLOCK = UV.laserModuleBlock || 'grindless:laser_module_block'
  var FIBRE = UV.ytterbiumFibre || 'grindless:ytterbium_fibre'
  var PUMP = UV.ingaasPumpModule || 'grindless:ingaas_pump_module'
  var ARSINE = UV.arsine || 'gtceu:arsine'
  var SPENT_MODULE = 'grindless:spent_laser_module'
  var YB2O3 = EC.ytterbiumOxide || 'gtceu:ytterbium_oxide_dust'

  var PREFORM = 'grindless:yb_doped_preform'
  var GRATING = 'grindless:fibre_bragg_grating'
  var GAAS_BOULE = 'grindless:gallium_arsenide_boule'
  var GAAS_WAFER = 'grindless:gallium_arsenide_wafer'
  var SAPPHIRE_BOULE = 'grindless:sapphire_boule'
  var SAPPHIRE_WAFER = 'grindless:sapphire_wafer'
  var EPI = 'grindless:ingaas_epi_wafer'
  var BAR = 'grindless:ingaas_diode_bar'
  var NBN = 'grindless:nbn_film_wafer'

  var GECL4 = 'gtceu:germanium_tetrachloride'
  var TMGA = 'gtceu:trimethylgallium'
  var TMIN = 'gtceu:trimethylindium'
  var ACRYLATE = 'gtceu:acrylate_coating'
  var SICL4 = 'gtca:silicon_tetrachloride_dust'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }

  // recipes of the two machines: type, circuit, contents
  var TABLE = [
    { name: 'preform', type: 'fibre_draw', circuit: 1,
      itemsIn: [item(SICL4, 5), item(YB2O3, 1), item('gtceu:aluminium_dust', 1)],
      fluidsIn: [fluid(GECL4, 100), fluid('gtceu:oxygen', 3700)],
      itemsOut: [item(PREFORM, 1), item('gtceu:glass_dust', 1)], fluidsOut: [fluid('gtceu:chlorine', 4400)], eut: ZPM, duration: 600 },
    { name: 'draw', type: 'fibre_draw', circuit: 2, itemsIn: [item(PREFORM, 1)], fluidsIn: [fluid(ACRYLATE, 250)],
      itemsOut: [item(FIBRE, 16)], fluidsOut: [], eut: LUV, duration: 400 },
    { name: 'laser_module', type: 'fibre_draw', circuit: 3, itemsIn: [item(FIBRE, 4), item(PUMP, 4), item(GRATING, 1)], fluidsIn: [],
      itemsOut: [item(FIBRE_MODULE, 1)], fluidsOut: [], eut: ZPM, duration: 400 },
    { name: 'refurbish', type: 'fibre_draw', circuit: 4, itemsIn: [item(SPENT_MODULE, 1), item(FIBRE, 1)], fluidsIn: [],
      itemsOut: [item(FIBRE_MODULE, 1)], fluidsOut: [], eut: LUV, duration: 200 },
    { name: 'organometallics', type: 'mocvd', circuit: 1,
      itemsIn: [item('gtceu:gallium_dust', 1), item('gtceu:indium_dust', 1), item('gtceu:sodium_dust', 6)],
      fluidsIn: [fluid('gtceu:chloromethane', 6000)],
      itemsOut: [item('gtceu:salt_dust', 12)], fluidsOut: [fluid(TMGA, 1000), fluid(TMIN, 1000)], eut: LUV, duration: 300 },
    { name: 'ingaas_epi', type: 'mocvd', circuit: 2, itemsIn: [item(GAAS_WAFER, 1)],
      fluidsIn: [fluid(TMGA, 250), fluid(TMIN, 250), fluid(ARSINE, 1000)],
      itemsOut: [item(EPI, 1)], fluidsOut: [fluid('gtceu:methane', 1500), fluid(ARSINE, 500)], eut: UVA, duration: 800 },
    { name: 'diode_bars', type: 'mocvd', circuit: 3, itemsIn: [item(EPI, 1)], fluidsIn: [], itemsOut: [item(BAR, 8)], fluidsOut: [],
      eut: ZPM, duration: 200 },
    { name: 'nbn_film', type: 'mocvd', circuit: 4, itemsIn: [item(SAPPHIRE_WAFER, 1), item('gtceu:niobium_dust', 1)],
      fluidsIn: [fluid('gtceu:nitrogen', 100)], itemsOut: [item(NBN, 1)], fluidsOut: [], eut: ZPM, duration: 400 },
    { name: 'pump_module', type: 'mocvd', circuit: 5, itemsIn: [item(BAR, 4), item('gtceu:copper_plate', 2)], fluidsIn: [],
      itemsOut: [item(PUMP, 1)], fluidsOut: [], eut: LUV, duration: 200 },
    { name: 'arsine_scrub', type: 'mocvd', circuit: 6, itemsIn: [], fluidsIn: [fluid(ARSINE, 1000)],
      itemsOut: [item('gtceu:arsenic_dust', 1)], fluidsOut: [fluid('gtceu:hydrogen', 3000)], eut: 1920, duration: 100 }
  ]

  // the MOCVD reactor's UHV rows (package UHV-A5): their inputs come from UHV (the SiC mirror blank) or feed only UHV (the IMM wafer)
  var UHV_ROWS = [
    { name: 'imm_epi', type: 'mocvd', circuit: 7, itemsIn: [item(GAAS_WAFER, 1), item('gtceu:phosphorus_dust', 1)],
      fluidsIn: [fluid(TMGA, 500), fluid(TMIN, 250), fluid(ARSINE, 1000)],
      itemsOut: [item('grindless:imm_epi_wafer', 1)], fluidsOut: [fluid('gtceu:methane', 2250), fluid(ARSINE, 500)], eut: UVA, duration: 1200 },
    { name: 'nbn_sic_plate', type: 'mocvd', circuit: 8, itemsIn: [item('grindless:sic_mirror_blank', 1), item('gtceu:niobium_dust', 2)],
      fluidsIn: [fluid('gtceu:nitrogen', 200)], itemsOut: [item('grindless:nbn_coated_sic_plate', 1)], fluidsOut: [], eut: ZPM, duration: 400 }
  ]

  // UEV-A7 (docs/eras/uev.md, line 24): the 1,083 nm line of the helium-3 polariser's optical pumping, drawn from the Yb fibre laser module
  // and a Bragg grating. The polariser (uev/fusion.js) keeps it as its tool: it is never consumed there.
  var UEV_ROWS = [
    { name: 'laser_1083nm', type: 'fibre_draw', circuit: 5, itemsIn: [item(FIBRE_MODULE, 1), item(GRATING, 1)], fluidsIn: [],
      itemsOut: [item('grindless:laser_1083nm', 1)], fluidsOut: [], eut: ZPM, duration: 400 }
  ]

  // UEV-A8 (docs/eras/uev.md, lines 34, 36 and machine 16): hollow-core capillaries, the MCP multi-fibre and the Li and K cooling lasers
  var A8_ROWS = [
    { name: 'hollow_capillaries', type: 'fibre_draw', circuit: 6, itemsIn: [item('grindless:fused_silica_tube', 1)],
      fluidsIn: [fluid('gtceu:argon', 500)], itemsOut: [item('grindless:hollow_capillaries', 4)], fluidsOut: [], eut: ZPM, duration: 400 },
    { name: 'mcp_multifibre', type: 'fibre_draw', circuit: 7, itemsIn: [item('grindless:etchable_core_tube', 4)],
      fluidsIn: [fluid('gtceu:argon', 500)], itemsOut: [item('grindless:mcp_multifibre', 1)], fluidsOut: [], eut: ZPM, duration: 600 },
    { name: 'cooling_lasers', type: 'fibre_draw', circuit: 8,
      itemsIn: [item('grindless:uev_emitter', 1), item('gtceu:lithium_6_dust', 1), item('gtceu:potassium_40_dust', 1)], fluidsIn: [],
      itemsOut: [item('grindless:li_cooling_laser', 1), item('grindless:k_cooling_laser', 1)], fluidsOut: [], eut: ZPM, duration: 400 }
  ]

  // side steps on GTM's own machines
  var SIDE = [
    { name: 'arsine', type: 'chemical_reactor', circuit: null,
      itemsIn: [item('gtceu:arsenic_dust', 2), item('gtceu:magnesium_dust', 3)], fluidsIn: [fluid('gtceu:hydrochloric_acid', 6000)],
      itemsOut: [item('gtceu:magnesium_chloride_dust', 9)], fluidsOut: [fluid(ARSINE, 2000)], eut: 480, duration: 200 },
    { name: 'acrylate_coating', type: 'chemical_reactor', circuit: 7, itemsIn: [],
      fluidsIn: [fluid('gtceu:propene', 1000), fluid('gtceu:oxygen', 3000)],
      itemsOut: [], fluidsOut: [fluid(ACRYLATE, 1000), fluid('minecraft:water', 1000)], eut: 480, duration: 200 },
    { name: 'gallium_arsenide_boule', type: 'electric_blast_furnace', circuit: 6, temp: 1600,
      itemsIn: [item('gtceu:gallium_arsenide_dust', 8)], fluidsIn: [fluid('gtceu:argon', 1000)],
      itemsOut: [item(GAAS_BOULE, 1)], fluidsOut: [], eut: 1920, duration: 600 },
    { name: 'gallium_arsenide_wafer', type: 'cutter', circuit: null, itemsIn: [item(GAAS_BOULE, 1)], fluidsIn: [fluid('gtceu:lubricant', 100)],
      itemsOut: [item(GAAS_WAFER, 8)], fluidsOut: [], eut: 1920, duration: 200 },
    { name: 'sapphire_boule', type: 'electric_blast_furnace', circuit: null, temp: 2400,
      itemsIn: [item('gtceu:sapphire_block', 1)], fluidsIn: [fluid('gtceu:argon', 1000)],
      itemsOut: [item(SAPPHIRE_BOULE, 1)], fluidsOut: [], eut: 7680, duration: 600 },
    { name: 'sapphire_wafer', type: 'cutter', circuit: null, itemsIn: [item(SAPPHIRE_BOULE, 1)], fluidsIn: [fluid('gtceu:lubricant', 100)],
      itemsOut: [item(SAPPHIRE_WAFER, 8)], fluidsOut: [], eut: 1920, duration: 200 },
    { name: 'fibre_bragg_grating', type: 'laser_engraver', circuit: null, notConsumable: 'gtceu:purple_glass_lens',
      itemsIn: [item(FIBRE, 1)], fluidsIn: [], itemsOut: [item(GRATING, 1)], fluidsOut: [], eut: LUV, duration: 200 }
  ]

  function publish(t, recipeId) {
    return {
      name: t.name, type: t.type, recipeId: recipeId, circuit: t.circuit, itemsIn: t.itemsIn, fluidsIn: t.fluidsIn,
      itemsOut: t.itemsOut, fluidsOut: t.fluidsOut, eut: t.eut, duration: t.duration, temp: t.temp || null,
      notConsumable: t.notConsumable || null
    }
  }
  // the id passed is 'grindless:<name>' for mocvd (GTM puts the type in front: grindless:mocvd/<name>); fibre_draw keeps its doubled ids
  P.recipes = TABLE.map(function (t) { return publish(t, t.type === 'mocvd' ? 'grindless:' + t.name : 'grindless:' + t.type + '/' + t.name) })
  P.side = SIDE.map(function (t) { return publish(t, 'grindless:' + t.name) })
  P.uhvRows = UHV_ROWS.map(function (t) { return publish(t, 'grindless:' + t.name) })
  P.uevRows = UEV_ROWS.map(function (t) { return publish(t, 'grindless:' + t.type + '/' + t.name) })
  P.a8Rows = A8_ROWS.map(function (t) { return publish(t, 'grindless:' + t.name) })
  P.skipped = []
  P.clashes = []
  P.crafting = {
    tower: 'grindless:crafting/fibre_draw_tower',
    reactor: 'grindless:crafting/mocvd_reactor',
    moduleToBlock: 'grindless:crafting/laser_module_block',
    blockToModule: 'grindless:crafting/fibre_laser_module_from_block'
  }
  P.craftingParts = ['gtceu:uv_machine_hull', 'gtceu:uv_electric_motor', 'gtceu:uv_electric_pump', 'gtceu:uv_sensor']

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    if (r.circuit !== null) keys['circuit:' + r.circuit] = true
    if (r.notConsumable) keys['i:' + r.notConsumable] = true
    return keys
  }

  function subset(a, b) {
    return Object.keys(a).every(function (k) { return b[k] === true })
  }

  function clashesOf(list) {
    var out = []
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        if (list[i].type !== list[j].type) continue
        var a = keysOf(list[i])
        var b = keysOf(list[j])
        if (subset(a, b) || subset(b, a)) out.push(list[i].name + ' / ' + list[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.concat(r.itemsOut)
    if (r.notConsumable) items = items.concat([item(r.notConsumable, 0)])
    items.forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRecipe(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      P.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'photonics recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type](r.recipeId)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    if (r.notConsumable) recipe.notConsumable(r.notConsumable)
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (r.temp) recipe.blastFurnaceTemp(r.temp)
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addMachines(event) {
    P.clashes = clashesOf(P.recipes.concat(P.uhvRows, P.uevRows, P.a8Rows))
    if (P.clashes.length > 0) console.error(LOG + 'photonics recipes clash in the lookup: ' + P.clashes.join(', '))
    P.recipes.concat(P.uhvRows, P.uevRows, P.a8Rows).forEach(function (r) { addRecipe(event, r) })
    console.info(LOG + 'photonics recipes added: ' + (P.recipes.length + P.uhvRows.length + P.uevRows.length + P.a8Rows.length - P.skipped.length))
  }

  function addSide(event) {
    P.side.forEach(function (r) { addRecipe(event, r) })
  }

  function addCrafting(event) {
    if (Item.exists(FIBRE_MODULE) && Item.exists(MODULE_BLOCK)) {
      event.shapeless(MODULE_BLOCK, [FIBRE_MODULE]).id(P.crafting.moduleToBlock)
      event.shapeless(FIBRE_MODULE, [MODULE_BLOCK]).id(P.crafting.blockToModule)
    } else {
      console.error(LOG + 'laser module block crafting skipped: ' + FIBRE_MODULE + ' or ' + MODULE_BLOCK + ' unknown')
    }
    var missing = P.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'photonics controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped('gtceu:fibre_draw_tower', ['CSC', 'MHM', 'C C'], {
      C: '#gtceu:circuits/uv', S: 'gtceu:uv_sensor', M: 'gtceu:uv_electric_motor', H: 'gtceu:uv_machine_hull'
    }).id(P.crafting.tower)
    event.recipes.gtceu.shaped('gtceu:mocvd_reactor', ['CSC', 'PHP', 'C C'], {
      C: '#gtceu:circuits/uv', S: 'gtceu:uv_sensor', P: 'gtceu:uv_electric_pump', H: 'gtceu:uv_machine_hull'
    }).id(P.crafting.reactor)
  }

  ServerEvents.recipes(function (event) {
    try { addMachines(event) } catch (e) { console.error(LOG + 'photonics recipes failed: ' + e) }
    try { addSide(event) } catch (e2) { console.error(LOG + 'photonics side recipes failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'photonics crafting failed: ' + e3) }
  })
})()
