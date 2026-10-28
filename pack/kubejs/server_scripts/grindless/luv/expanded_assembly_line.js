// priority: -17974
// -----------------------------------------------------------------------------------------------
// The Expanded Assembly Line at LuV (package QR-G0; owner request: an assembly line where input order does not matter, early, nearly
// identical to the normal one, crafted with the normal one).
//
// extendedfeatures:expanded_assembly_line (GTM Extended Features 3.0.0) is a gtceu:assembly_line machine whose recipe logic gives every
// ingredient to any bus (and every fluid to any tank), so the order of the inputs is free. Its recipes are the normal line's. It had no
// recipe. The code was read for ideas only (check CREDITS.md for the addon's licence).
//
// Research data: its structure has NO slot for GTM's data access hatch or optical receiver. A wireless optical data receptor (exactly
// one) is part of the structure and the only way research data arrives: receptor -> transmissor (a player scan links them) -> data
// access hatches. The addon only accepts hatches whose controller is a Matrix Data Relay (config DataHatchLinkingBehavior = true, the
// default). So the smallest working path at LuV is all three, made here:
//   luv_wireless_data_receptor     in the Expanded Assembly Line
//   luv_wireless_data_transmissor  in the Matrix Data Relay (exactly one)
//   matrix_data_relay              a data bank (our LuV one, research-gated by GTM) whose structure takes up to 6 GTM data access hatches
// The relay drains 144 mB of PCB coolant a second (gtceu:mixer/pcb_coolant makes it at LuV) and its LuV transmissor costs 131,072 EU/t on
// top of the data bank's own. The ZPM, UV and UHV variants stay without a recipe.
//
// Recipe-cost rule: from IV up nothing of ours is crafted on the crafting table. Everything here is a gtceu:assembly_line recipe at LuV
// voltage (30,720 EU/t). The controller takes the NORMAL controller (gtceu:assembly_line) as an input, which is the reason to build the
// normal line first; the cost is complexity (a hull, an input bus, robot arms and conveyors, circuits), not quantity.
//
// Published for the bench test: global.grindless.expandedAssemblyLine { recipes: [ { id, output } ] }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/expanded_assembly_line] '
  var EUT = 30720
  var PARTS = [
    {
      name: 'expanded_assembly_line', out: 'extendedfeatures:expanded_assembly_line', duration: 600,
      items: ['gtceu:assembly_line', 'gtceu:luv_machine_hull', '2x gtceu:luv_robot_arm', '2x gtceu:luv_conveyor_module',
        '2x #gtceu:circuits/luv', 'gtceu:luv_input_bus'],
      fluids: [['soldering_alloy', 576], ['lubricant', 500]]
    },
    {
      name: 'luv_wireless_data_receptor', out: 'extendedfeatures:luv_wireless_data_receptor', duration: 300,
      items: ['gtceu:luv_machine_hull', '2x gtceu:luv_sensor', '2x gtceu:normal_optical_pipe', '#gtceu:circuits/luv'],
      fluids: [['soldering_alloy', 288]]
    },
    {
      name: 'luv_wireless_data_transmissor', out: 'extendedfeatures:luv_wireless_data_transmissor', duration: 300,
      items: ['gtceu:luv_machine_hull', '2x gtceu:luv_emitter', '2x gtceu:normal_optical_pipe', '#gtceu:circuits/luv'],
      fluids: [['soldering_alloy', 288]]
    },
    {
      name: 'matrix_data_relay', out: 'extendedfeatures:matrix_data_relay', duration: 600,
      items: ['gtceu:data_bank', '2x gtceu:advanced_computer_casing', '2x gtceu:high_power_casing', '4x gtceu:normal_optical_pipe',
        '2x #gtceu:circuits/luv'],
      fluids: [['soldering_alloy', 576], ['lubricant', 250]]
    }
  ]

  var EAL = { recipes: [] }
  global.grindless = global.grindless || {}
  global.grindless.expandedAssemblyLine = EAL

  ServerEvents.recipes(function (event) {
    PARTS.forEach(function (p) {
      if (!Item.exists(p.out)) { console.error(LOG + p.out + ' does not exist: no recipe'); return }
      event.remove({ output: p.out })
      var b = event.recipes.gtceu.assembly_line(p.name)
      p.items.forEach(function (s) { b.itemInputs(s) })
      p.fluids.forEach(function (f) { b.inputFluids(Fluid.of('gtceu:' + f[0], f[1])) })
      b.itemOutputs(p.out).EUt(EUT).duration(p.duration)
      EAL.recipes.push({ id: 'grindless:assembly_line/' + p.name, output: p.out })
    })
    console.info(LOG + EAL.recipes.length + ' assembly line recipes at LuV')
  })
})()
