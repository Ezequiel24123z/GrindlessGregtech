// priority: -5810
// TEST ONLY, XP-S0b spike S0-8 (docs/eras/maxplus.md S0 table). Throwaway registration, never shipped; id gtceu:gg_s0_world_box.
//   A 45 x 45 x 9 hollow box (casing shell, air inside) with the controller in the middle of the front face and exactly 64 substation input
//   hatches on the floor row. It stands in for the planned Hyperstargate-sized structure: what matters is the number of cells the pattern
//   checks (18,225), the 64 A substation ability and the 64 parts, not the look. global.ggXpS0BoxAbility records which ability the pattern used.
(function () {
  var ID = 'gtceu:gg_s0_world_box'
  var N = 45
  var H = 9
  var MID = (N - 1) / 2
  var CASING = 'gtceu:solid_machine_casing'

  function row(first, mid, n) {
    var s = first
    for (var i = 0; i < n - 2; i++) s += mid
    return s + first
  }
  function allRow(ch) { return row(ch, ch, N) }

  function slices() {
    var out = []
    for (var si = 0; si < N; si++) {
      var rows = []
      for (var ri = 0; ri < H; ri++) {
        var r
        if (si === 0 || si === N - 1 || ri === H - 1) r = allRow('C')
        else if (ri === 0) r = row('C', 'H', N)
        else r = row('C', '#', N)
        if (si === N - 1 && ri === (H - 1) / 2) r = r.substring(0, MID) + 'S' + r.substring(MID + 1)
        rows.push(r)
      }
      out.push(rows)
    }
    return out
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var Pat = global.grindless.patterns
    var hatch = {
      kind: 'part',
      ability: 'substation_input',
      limits: { exact: 64 },
      build: function () {
        var ability = null
        try { ability = PartAbility.SUBSTATION_INPUT_ENERGY } catch (e) { ability = null }
        if (ability === null || ability === undefined) {
          ability = PartAbility.INPUT_ENERGY
          global.ggXpS0BoxAbility = 'INPUT_ENERGY (SUBSTATION_INPUT_ENERGY missing)'
        } else {
          global.ggXpS0BoxAbility = 'SUBSTATION_INPUT_ENERGY'
        }
        return Predicates.abilities(ability).setExactLimit(64)
      }
    }
    var spec = {
      slices: slices(),
      symbols: { S: Pat.controller(), C: Pat.block(CASING), '#': Pat.air(), H: Pat.oneOf(Pat.block(CASING), hatch) }
    }
    Pat.register(ID, spec)
    event.create('gg_s0_world_box', 'multiblock')
      .langValue('Spike 45 cube box')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('large_chemical_reactor')
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, spec) })
      .workableCasingModel('gtceu:block/casings/solid/machine_casing_solid_steel', 'gtceu:block/multiblock/implosion_compressor')
  })
})()
