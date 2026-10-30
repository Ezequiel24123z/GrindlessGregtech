// TP-C (docs/research/tier-parity.md): the basic machines and hatches GTM 7.5.3 leaves without a recipe above UV.
//
//   UHV basic machines   GTM generates a recipe for the UHV machines that need no component (hull, furnace, arc furnace, alloy smelter...) and none
//                        for the rest, whose UV recipe takes components. Ours is GTM's UV shape with the UHV hull, UHV components and circuits,
//                        europium cable and neutronium plate (the materials of GTM's own UHV hull and arc furnace). Shaped crafting (ids grindless:crafting/<out>).
//   UHV laser hatches    GTM's UEV assembler shape (diamond lens, emitter or sensor, pump, cable; 1/2/4 of each and a circuit), at VA[UHV].
//   4x/9x hatches        GTM stops at UHV; UEV-UXV follow its shape (the tier's input or output hatch under a quadruple or nonuple neutronium pipe).
//   quantum chest/tank   GTM stops at UHV; UEV-UXV follow its UHV shape with the tier's hull, field generator, pump and circuits.
//   UXV circuit assembler and scanner   GTM's recipes take an OpV circuit nothing makes: removed, remade with #gtceu:circuits/uxv.
// Published for the smoke test: global.grindless.highTierMachines.recipes, .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/integration] '
  var G = global.grindless || (global.grindless = {})
  var HM = G.highTierMachines || (G.highTierMachines = {})

  var NEUTRONIUM_PIPE = 'gtceu:neutronium_normal_fluid_pipe'
  var FIXED = {
    plate: '#forge:plates/neutronium', glass: 'gtceu:fusion_glass', rotor: '#forge:rotors/darmstadtium', spring: '#forge:springs/naquadah_alloy',
    blade: 'gtceu:neutronium_buzz_saw_blade', head: 'gtceu:tungsten_grinding_head', chest: '#forge:chests/wooden', anvil: 'minecraft:anvil',
    bars: 'minecraft:iron_bars', fluidfilter: 'gtceu:fluid_filter', itemfilter: 'gtceu:item_filter', ptfe: 'gtceu:polytetrafluoroethylene_huge_fluid_pipe',
    pipe: NEUTRONIUM_PIPE, rodvg: '#forge:rods/vanadium_gallium', octal: 'gtceu:europium_octal_cable', quad: 'gtceu:europium_quadruple_cable'
  }
  var COMPONENT = { motor: 'electric_motor', pump: 'electric_pump', piston: 'electric_piston', conveyor: 'conveyor_module', robot: 'robot_arm',
    emitter: 'emitter', sensor: 'sensor', field: 'field_generator' }

  // GTM's UV shapes (pattern rows joined by "|", "." is an empty slot; key "letter:name"); names resolve through resolve()
  var UHV_MACHINES = [
    ['assembler', 'ACA|VMV|WCW', 'A:robot V:conveyor M:hull C:circ W:cable'],
    ['autoclave', 'IGI|IMI|CPC', 'I:plate G:glass M:hull C:circ P:pump'],
    ['bender', 'PBP|CMC|EWE', 'P:piston B:plate C:circ M:hull E:motor W:cable'],
    ['brewery', 'GPG|WMW|CBC', 'G:glass P:pump W:cable M:hull C:circ B:spring'],
    ['canner', 'WPW|CMC|GGG', 'W:cable P:pump C:circ M:hull G:glass'],
    ['centrifuge', 'CEC|WMW|CEC', 'C:circ E:motor W:cable M:hull'],
    ['chemical_bath', 'VGW|PGV|CMC', 'V:conveyor G:glass W:cable P:pump C:circ M:hull'],
    ['chemical_reactor', 'GRG|WEW|CMC', 'G:ptfe R:rotor W:cable E:motor C:circ M:hull'],
    ['circuit_assembler', 'RIE|CHC|WIW', 'R:robot I:circ E:emitter C:conveyor H:hull W:cable'],
    ['compressor', '.C.|PMP|WCW', 'C:circ P:piston M:hull W:cable'],
    ['cutter', 'WCG|VMB|CWE', 'W:cable C:circ G:glass V:conveyor M:hull B:blade E:motor'],
    ['distillery', 'GBG|CMC|WPW', 'G:glass B:spring C:circ M:hull W:cable P:pump'],
    ['electromagnetic_separator', 'VWZ|WMS|CWZ', 'V:conveyor W:cable Z:octal M:hull S:rodvg C:circ'],
    ['extractor', 'GCG|EMP|WCW', 'G:glass C:circ E:piston M:hull P:pump W:cable'],
    ['extruder', 'CCE|XMP|CCE', 'C:quad E:circ X:piston M:hull P:pipe'],
    ['fermenter', 'WPW|GMG|WCW', 'W:cable P:pump G:glass M:hull C:circ'],
    ['fluid_heater', 'OGO|PMP|WCW', 'O:quad G:glass P:pump M:hull W:cable C:circ'],
    ['fluid_solidifier', 'PGP|WMW|CBC', 'P:pump G:glass W:cable M:hull C:circ B:chest'],
    ['forge_hammer', 'WPW|CMC|WAW', 'W:cable P:piston C:circ M:hull A:anvil'],
    ['forming_press', 'WPW|CMC|WPW', 'W:cable P:piston C:circ M:hull'],
    ['gas_collector', 'WFW|PHP|WCW', 'W:bars F:fluidfilter P:pump H:hull C:circ'],
    ['laser_engraver', 'PEP|CMC|WCW', 'P:piston E:emitter C:circ M:hull W:cable'],
    ['lathe', 'WCW|EMD|CWP', 'W:cable C:circ E:motor M:hull D:head P:piston'],
    ['macerator', 'PEG|WWM|CCW', 'P:piston E:motor G:head W:cable M:hull C:circ'],
    ['mixer', 'GRG|GEG|CMC', 'G:glass R:rotor E:motor C:circ M:hull'],
    ['muffler_hatch', 'HM|PR', 'H:hull M:motor P:pipe R:rotor'],
    ['ore_washer', 'RGR|CEC|WMW', 'R:rotor G:glass C:circ E:motor W:cable M:hull'],
    ['packer', 'BCB|RMV|WCW', 'B:chest C:circ R:robot M:hull V:conveyor W:cable'],
    ['rock_crusher', 'PMW|CHC|GGG', 'P:piston M:motor W:head C:cable H:hull G:glass'],
    ['scanner', 'CEC|WHW|CSC', 'C:circ E:emitter W:cable H:hull S:sensor'],
    ['sifter', 'WFW|PMP|CFC', 'W:cable F:itemfilter P:piston M:hull C:circ'],
    ['thermal_centrifuge', 'CEC|OMO|WEW', 'C:circ E:motor O:quad M:hull W:cable'],
    ['wiremill', 'EWE|CMC|EWE', 'E:motor W:cable C:circ M:hull']
  ]
  // the UXV circuit assembler and scanner: the same shapes, one tier up
  var UXV_MACHINES = [UHV_MACHINES[8], UHV_MACHINES[29]]

  var PROFILES = {
    uhv: { cable: 'gtceu:europium_single_cable', plate: '#forge:plates/neutronium' },
    uxv: { cable: 'gtceu:metallic_hydrogen_single_cable', plate: '#forge:plates/neutronium' }
  }

  function resolve(tier, name) {
    if (name === 'hull') return 'gtceu:' + tier + '_machine_hull'
    if (name === 'circ') return '#gtceu:circuits/' + tier
    if (name === 'cable') return PROFILES[tier].cable
    if (COMPONENT[name]) return 'gtceu:' + tier + '_' + COMPONENT[name]
    return FIXED[name]
  }

  function keyOf(tier, spec) {
    var key = {}
    spec.split(' ').forEach(function (kv) { key[kv.charAt(0)] = resolve(tier, kv.substring(2)) })
    return key
  }

  function ids(key) {
    return Object.keys(key).map(function (k) { return key[k] }).filter(function (id) { return id.charAt(0) !== '#' })
  }

  function missing(list) {
    return list.filter(function (id) { return !Item.exists(id) })
  }

  function skip(name, ms) {
    HM.skipped.push({ name: name, reason: 'unknown id(s): ' + ms.join(', ') })
    console.error(LOG + 'high_tier_machines skipped ' + name + ': unknown id(s) ' + ms.join(', '))
  }

  var VA = { uhv: 1966080, uev: 7864320, uiv: 31457280, uxv: 125829120 }
  var PREV = { uhv: 'uv', uev: 'uhv', uiv: 'uev', uxv: 'uiv' }
  var COMPONENT_RE = /_(electric_motor|electric_pump|electric_piston|conveyor_module|robot_arm|emitter|sensor|field_generator)$/

  // Above UV every hatch and single is an assembly line with station research of the tier below's same machine (docs/quality/recipes.md H-FORM, S-FORM)
  // inputs: [[id, count]]; at least two tier components and one circuit of the tier are guaranteed
  function line(event, tier, name, out, inputs) {
    var research = 'gtceu:' + PREV[tier] + '_' + out.substring(out.indexOf('_') + 1)
    var ms = missing([out, research].concat(inputs.map(function (i) { return i[0] }).filter(function (id) { return id.charAt(0) !== '#' })))
    if (ms.length > 0) return skip(name, ms)
    var parts = 0
    var first = -1
    var circ = false
    inputs.forEach(function (i, idx) {
      if (COMPONENT_RE.test(i[0])) { parts += i[1]; if (first < 0) first = idx }
      if (i[0].indexOf('#gtceu:circuits/') === 0) circ = true
    })
    if (parts < 2 && first >= 0) inputs[first][1] += 2 - parts
    if (!circ) inputs.push(['#gtceu:circuits/' + tier, 1])
    // the tier below's same machine is upgraded, which also keeps the sets of ingredients of sibling machines distinct (GTM's recipe lookup)
    if (!inputs.some(function (i) { return i[0] === research })) inputs.push([research, 1])
    var b = event.recipes.gtceu.assembly_line('grindless:' + name)
    inputs.forEach(function (i) { b.itemInputs(i[1] + 'x ' + i[0]) })
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152))
    b.itemOutputs(out)
    b.stationResearch(function (r) { return r.researchStack(Item.of(research)).CWUt(64).EUt(VA[tier]) })
    b.EUt(VA[tier]).duration(600)
    HM.recipes.push('grindless:assembly_line/' + name)
  }

  function addMachines(event, tier, list) {
    list.forEach(function (m) {
      var counts = {}
      m[1].replace(/[|.]/g, '').split('').forEach(function (c) { counts[c] = (counts[c] || 0) + 1 })
      var key = keyOf(tier, m[2])
      line(event, tier, tier + '_' + m[0], 'gtceu:' + tier + '_' + m[0], Object.keys(counts).map(function (c) { return [key[c], counts[c]] }))
    })
  }

  // GTM's laser hatch recipe (assembler): hull, lens, emitter (source) or sensor (target), pump and cables, programmed circuit
  function addLasers(event) {
    var LINES = [{ a: '256a', n: 1, cable: 'single', circuit: 1, duration: 300 }, { a: '1024a', n: 2, cable: 'double', circuit: 2, duration: 600 },
      { a: '4096a', n: 4, cable: 'quadruple', circuit: 3, duration: 1200 }]
    LINES.forEach(function (l) {
      ;['source', 'target'].forEach(function (side) {
        var name = 'uhv_' + l.a + '_laser_' + side + '_hatch'
        var part = 'gtceu:uhv_' + (side === 'source' ? 'emitter' : 'sensor')
        line(event, 'uhv', name, 'gtceu:' + name, [['gtceu:uhv_machine_hull', 1], ['#forge:lenses/diamond', l.n], [part, l.n],
          ['gtceu:uhv_electric_pump', l.n], ['gtceu:europium_' + l.cable + '_cable', 4], ['#gtceu:circuits/uhv', l.circuit]])
      })
    })
  }

  var HIGH = ['uev', 'uiv', 'uxv']
  var PART_OF = { uev: 'gtceu:uev_electric_pump', uiv: 'gtceu:uiv_electric_pump', uxv: 'gtceu:uxv_electric_pump' }
  var PLATE_OF = { uev: '#forge:plates/neutronium', uiv: 'gtceu:rhea_plate', uxv: 'gtceu:rhea_plate' }

  function addHatches(event) {
    HIGH.forEach(function (tier) {
      ;[['input', 'import', '4x', 'quadruple'], ['input', 'import', '9x', 'nonuple'], ['output', 'export', '4x', 'quadruple'], ['output', 'export', '9x', 'nonuple']]
        .forEach(function (h) {
          var base = 'gtceu:' + tier + '_' + h[0] + '_hatch'
          var pipe = 'gtceu:neutronium_' + h[3] + '_fluid_pipe'
          line(event, tier, tier + '_' + h[0] + '_hatch_' + h[2], base + '_' + h[2], [[base, 1], [pipe, 1], [PART_OF[tier], 2]])
        })
    })
  }

  function addStorage(event) {
    HIGH.forEach(function (tier) {
      var circ = '#gtceu:circuits/' + tier
      var hull = 'gtceu:' + tier + '_machine_hull'
      var field = 'gtceu:' + tier + '_field_generator'
      line(event, tier, tier + '_quantum_chest', 'gtceu:' + tier + '_quantum_chest', [[circ, 4], [PLATE_OF[tier], 4], [hull, 1], [field, 2]])
      line(event, tier, tier + '_quantum_tank', 'gtceu:' + tier + '_quantum_tank', [[circ, 4], [PLATE_OF[tier], 2], [hull, 1], [field, 1], ['gtceu:' + tier + '_electric_pump', 1]])
    })
  }

  function generate(event) {
    HM.recipes = []
    HM.skipped = []
    event.remove({ id: 'gtceu:shaped/uxv_circuit_assembler' })
    event.remove({ id: 'gtceu:shaped/uxv_scanner' })
    addMachines(event, 'uhv', UHV_MACHINES)
    addMachines(event, 'uxv', UXV_MACHINES)
    addLasers(event)
    addHatches(event)
    addStorage(event)
    console.info(LOG + 'high_tier_machines: ' + HM.recipes.length + ' recipes; skipped ' + HM.skipped.length)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'high_tier_machines failed: ' + e)
    }
  })
})()
