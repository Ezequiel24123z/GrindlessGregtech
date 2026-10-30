// -----------------------------------------------------------------------------------------------
// UXV-B6, gate to OpV (docs/eras/uxv.md "Gate to OpV"): two older recipe types get one more item slot for the rows B6 appends. No machine, item or
// block is registered here.
//
//   gtceu:warp_gate            6 -> 7 item inputs: c10 burns one FRC cartridge and keeps five stacks (census III, island chart, arm chart, core
//                              sample, four spintronic mainframes), and the programmed circuit takes the seventh slot.
//   gtceu:matrioshka_computing 3 -> 5 item inputs: the arm chart row (c4) takes four records and the circuit.
//
// The recipe types are registered by uhv/gate.js and uiv/matrioshka.js in the gtceu:recipe_type event, from the maxIO they publish in
// global.grindless (warpGate.machines.gate, matrioshka.machines). This handler raises that figure so the server scripts' slot check and the
// type agree; it works in either script order: before those handlers it moves the figure they read, after them it resizes the registered type.
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

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    WIDEN.forEach(function (w) {
      try {
        var io = ioOf(w[0])
        io.itemsIn = w[1]
        if (typeof GTRecipeTypes !== 'undefined') {
          var type = GTRecipeTypes.get(w[0])
          if (type != null) type.setMaxIOSize(w[1], io.itemsOut, io.fluidsIn, io.fluidsOut)
        }
      } catch (e) {
        console.error(LOG + 'gate slots not widened: ' + e)
      }
    })
  })
})()
