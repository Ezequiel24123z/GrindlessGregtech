// OpV-G1, gate to MAX (docs/eras/opv.md "Gate to MAX"): the warp gate gets two more item slots for c13, which burns a Kugelblitz core and the
// launched bulge seed, keeps six stacks (census, exotic matter, tetron array, census IV, bulge chart, cosmic mainframes) and takes the
// programmed circuit: 2 + 6 + 1 = 9. No machine, item or block is registered here.
//
//   gtceu:warp_gate   7 -> 9 item inputs, widened in the gtceu:machine event like startup_scripts/grindless/uxv/gate.js (a type is never narrowed;
//                     the published figure is raised too, so the server scripts' slot check and the type agree).
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var WIDEN = [['warp_gate', 9]]

  function ioOf() {
    if (!(G.warpGate && G.warpGate.machines && G.warpGate.machines.gate)) throw new Error('no published machine for warp_gate')
    return G.warpGate.machines.gate.maxIO
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var ItemCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
    var FluidCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
    WIDEN.forEach(function (w) {
      try {
        var io = ioOf()
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
