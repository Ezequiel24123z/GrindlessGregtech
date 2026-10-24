// -----------------------------------------------------------------------------------------------
// gtceu:coking recipe of the By-product Coke Battery (gtceu:coking_battery), its controller and the Steam Age recipe of GTM's
// ULV fluid output hatch.
//
//   1 coal -> 1 coke + 500 mB creosote + 125 mB coal gas                   4 EU/t, 360 ticks
// The steam multiblock runs 4 at once and 1.5x slower: 4 coal every 540 ticks (27 s), about 6.7 coke ovens, drawing about
// 28 mB/t of steam (3 840 mB per coal, about what 180 mB of its own creosote gives in a high pressure liquid boiler).
//
// Why these numbers (per coal; GTM 7.5.3 recipes):
//   coke oven (Steam)            1 coke + 500 mB creosote                          900 t, burns nothing, loses the gas
//   this battery (Steam)         1 coke + 500 mB creosote + 125 mB coal gas       steam
//   pyrolyse oven (MV, steam)    1 coke + 250 mB coal gas                          16 coal + 1 000 mB steam, 96 EU/t, 320 t
//   pyrolyse oven (MV, N2)       1 coke + 500 mB creosote                          16 coal + 1 000 mB N2, 96 EU/t, 320 t
// Coke stays 1:1 (GT Community Additions' industrial coke oven made 2 coke per coal and 3.4x the creosote: removed). The
// creosote is the coke oven's. The gas is half of what the MV pyrolyse oven recovers: the other half heats the ovens, as a
// real battery burns 40-50 % of its own gas under the chambers. At LV prices (96 EU per mB of coal gas in the gas turbine,
// about 10.5 EU per mB of creosote in a high pressure liquid boiler) a coal is worth ~5 250 EU in the coke oven, ~15 300 EU
// here (after its steam) and ~22 000 EU in the pyrolyse oven's gas recipe: better than the Steam machine, below the MV one.
//
// Where the byproducts go: creosote is a boiler fuel now (and treated wood); coal gas is flammable and poisonous, so it stays
// in tanks (drums or a multiblock tank) until LV: gas turbine (96 EU/mB) and distillery (coal tar, ammonia, ethylbenzene, CO2,
// with a coke dust back), and at MV the biorefinery and GTM's distillation tower. If the gas hatch is full the battery stops.
//
// ULV fluid output hatch: GTM 7.5.3 only makes it in the assembler (LV), and no steam part can hand a fluid out of a steam
// multiblock (the pump hatch only takes water, the coke oven hatch only works on the coke oven). The battery's whole point is
// the gas, so the hatch gets a crafting-table recipe with the assembler recipe's parts (ULV hull + glass + resin as the glue).
// Side effects, both small: a screwdriver turns it into the ULV input hatch (GTM's own recipe; no Steam machine takes one),
// and GTM's primitive pump pumps twice as much water through it as through its pump hatch.
//
// Lookup note: a single recipe of this type.
(function () {
  const G = global.grindless

  const COAL = '#forge:gems/coal'
  const COKE = 'gtceu:coke_gem'
  const CREOSOTE = 'gtceu:creosote'
  const COAL_GAS = 'gtceu:coal_gas'
  const CREOSOTE_MB = 500
  const COAL_GAS_MB = 125
  const EUT = 4
  const DURATION = 360

  var SC = G.steamContent || (G.steamContent = {})
  SC.cokingBattery = {
    machine: 'gtceu:coking_battery',
    type: 'gtceu:coking',
    recipe: 'grindless:coking/coal',
    coke: COKE,
    creosote: CREOSOTE,
    coalGas: COAL_GAS,
    creosoteMb: CREOSOTE_MB,
    coalGasMb: COAL_GAS_MB,
    eut: EUT,
    duration: DURATION,
    hatchRecipe: 'grindless:crafting/ulv_output_hatch'
  }

  ServerEvents.recipes(function (event) {
    if (!Fluid.exists(COAL_GAS) || !Fluid.exists(CREOSOTE)) {
      console.error('[grindless/steam] coking recipe skipped: coal gas or creosote is not a registered fluid')
      return
    }
    event.recipes.gtceu.coking('grindless:coal')
      .itemInputs('1x ' + COAL)
      .itemOutputs('1x ' + COKE)
      .outputFluids(Fluid.of(CREOSOTE, CREOSOTE_MB), Fluid.of(COAL_GAS, COAL_GAS_MB))
      .EUt(EUT).duration(DURATION)

    // the controller is built around two of GTM's coke ovens (the machine it replaces), the gas main and the pusher gears
    event.recipes.gtceu.shaped('gtceu:coking_battery', ['PTP', 'OGO', 'CwC'], {
      P: '#forge:plates/bronze',
      T: 'gtceu:bronze_normal_fluid_pipe',
      O: 'gtceu:coke_oven',
      G: '#forge:gears/bronze',
      C: 'gtceu:steam_machine_casing'
    }).id('grindless:crafting/coking_battery')

    // GTM's ULV fluid output hatch by hand: the assembler recipe's hull and glass, two sticky resin as the glue
    event.recipes.gtceu.shaped('gtceu:ulv_output_hatch', [' G ', 'RHR', ' w '], {
      G: '#forge:glass',
      R: 'gtceu:sticky_resin',
      H: 'gtceu:ulv_machine_hull'
    }).id('grindless:crafting/ulv_output_hatch')

    console.info('[grindless/steam] coking recipes: 1, coking battery and ULV output hatch crafting added')
  })
})()
