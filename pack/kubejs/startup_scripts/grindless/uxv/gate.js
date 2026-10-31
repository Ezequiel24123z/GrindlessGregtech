// priority: -10865
// -----------------------------------------------------------------------------------------------
// UXV-B6, gate to OpV (docs/eras/uxv.md "Gate to OpV"): two older recipe types get one more item slot for the rows B6 appends. No machine, item or
// block is registered here.
//
//   gtceu:warp_gate            6 -> 7 item inputs: c10 burns one FRC cartridge and keeps five stacks (census III, island chart, arm chart, core
//                              sample, four spintronic mainframes), and the programmed circuit takes the seventh slot.
//   gtceu:matrioshka_computing 3 -> 5 item inputs: the arm chart row (c4) takes four records and the circuit.
//
// The recipe types are registered by uhv/gate.js and uiv/matrioshka.js in the gtceu:recipe_type event, from the maxIO they publish in
// global.grindless (warpGate.machines.gate, matrioshka.machines). GTM builds the types only after that event (GTRecipeTypes.get is null inside
// it, so a resize there never reached EMI's slot layout), so they are resized in the gtceu:machine event, as luv/europa.js widens vein_drilling:
// any script order works and a type is never narrowed. The published figure is raised too, so the server scripts' slot check and the type agree.
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var WIDEN = [['warp_gate', 7], ['matrioshka_computing', 5]]

  function ioOf(typeName) {
    var list = []
    if (G.warpGate && G.warpGate.machines && G.warpGate.machines.gate && typeName === 'warp_gate') list.push(G.warpGate.machines.gate)
    if (G.matrioshka && G.matrioshka.machines) {
      G.matrioshka.machines.forEach(function (m) { if (m.type === typeName) list.push(m) })
    }
    if (list.length === 0) throw new Error('no published machine for ' + typeName)
    return list[0].maxIO
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var ItemCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
    var FluidCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
    WIDEN.forEach(function (w) {
      try {
        var io = ioOf(w[0])
        io.itemsIn = Math.max(Number(io.itemsIn) || 0, w[1])
        var type = GTRecipeTypes.get(w[0])
        if (type == null) throw new Error('recipe type gtceu:' + w[0] + ' is not registered')
        var now = [type.getMaxInputs(ItemCap), type.getMaxOutputs(ItemCap), type.getMaxInputs(FluidCap), type.getMaxOutputs(FluidCap)]
        var sizes = [io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut].map(function (n, i) { return Math.max(Number(n) || 0, Number(now[i]) || 0) })
        type.setMaxIOSize(sizes[0], sizes[1], sizes[2], sizes[3])
      } catch (e) {
        console.error(LOG + 'gate slots not widened: ' + e)
      }
    })
  })
})()
