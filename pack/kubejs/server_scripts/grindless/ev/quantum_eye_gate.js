// -----------------------------------------------------------------------------------------------
// GTM machines of EV whose recipe takes an EV emitter or sensor. Their quantum eye (radon) waits for IV in this pack
// (docs/eras/ev.md, "Nothing in EV requires anything from IV"; DECISIONS.md 2026-10-25), so the ones an EV line needs take the HV
// part instead:
//   gtceu:ev_circuit_assembler   the nano circuits of the gate to IV (600 EU/t, cleanroom) only run in it. GTM's recipe
//                                (gtceu:shaped/ev_circuit_assembler) with an HV emitter: grindless:crafting/ev_circuit_assembler
// The EV laser engraver and scanner keep GTM's recipe (no EV line needs them): they open in IV. Our own EV machines take HV
// emitters and sensors in their own recipes (the creature simulator, lv/creatures.js; the deep space antenna,
// ev/lunar_power_and_antenna.js).
(function () {
  ServerEvents.recipes(function (event) {
    try {
      event.remove({ id: 'gtceu:shaped/ev_circuit_assembler' })
      event.shaped('gtceu:ev_circuit_assembler', ['RIE', 'CHC', 'WIW'], {
        R: 'gtceu:ev_robot_arm',
        I: '#gtceu:circuits/iv',
        E: 'gtceu:hv_emitter',
        C: 'gtceu:ev_conveyor_module',
        H: 'gtceu:ev_machine_hull',
        W: 'gtceu:aluminium_single_cable'
      }).id('grindless:crafting/ev_circuit_assembler')
    } catch (e) {
      console.error('[grindless/ev] EV circuit assembler recipe failed: ' + e)
    }
  })
})()
