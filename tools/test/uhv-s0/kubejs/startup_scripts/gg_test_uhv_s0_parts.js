// UHV-S0 disposable registrations. TEST-ONLY overlay (tools/test/uhv-s0, merged over the bench overlay copy), never shipped.
//   S0-2  grindless:s0_uhv_motor   a 'gcyr:rocket_motor' builder at tier 5 (ZPM-S0 saw this builder make a fuel tank)
//         grindless:s0_uhv_tank    a 'gcyr:fuel_tank' at tier 13 (the fallback: elite motor 3 + tank 13 = level 8)
//   S0-5  grindless:nuclear_clock  the UHV wireless row's link (tables/wireless_energy.json overlay, tier 9)
//   S0-6  grindless:s0_segment, grindless:s0_worn_segment; recipe type gtceu:s0_dyson_swarm (a generator); multiblock
//         gtceu:s0_swarm_control (3 x 3 x 3 solid steel casing, one dynamo, input bus, input hatch, output bus) through
//         lib/patterns.js and lib/generators.js, as UV's laser fusion chamber
StartupEvents.registry('block', function (event) {
  var motor = event.create('grindless:s0_uhv_motor', 'gcyr:rocket_motor')
  console.info('[uhv-s0] s0_uhv_motor builder class ' + motor.getClass().getName())
  try { motor.typeId('grindless_s0_uhv_motor') } catch (e) { console.warn('[uhv-s0] motor builder has no typeId: ' + e) }
  try { motor.tier(5) } catch (e) { console.warn('[uhv-s0] motor builder has no tier: ' + e) }
  try { motor.textureAll('gcyr:block/elite_rocket_motor') } catch (e) { console.warn('[uhv-s0] motor builder has no textureAll: ' + e) }
  try { motor.hardness(5).resistance(6) } catch (e) { }
  event.create('grindless:s0_uhv_tank', 'gcyr:fuel_tank')
    .typeId('grindless_s0_uhv')
    .tier(13)
    .fuelStorage(1024000)
    .textureAll('gcyr:block/basic_fuel_tank')
    .hardness(5)
    .resistance(6)
  // S0-2 workaround: GCYR 0.2.9's RocketMotorBlockBuilder.createObject builds a FuelTankBlock, so try a real
  // RocketMotorBlock through createCustom with a JS-implemented IRocketMotorType at tier 6
  try {
    var RMB = Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock')
    var RMT = Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock$RocketMotorType')
    var IRMT = Java.loadClass('argent_matter.gcyr.api.block.IRocketMotorType')
    var Props = Java.loadClass('net.minecraft.world.level.block.state.BlockBehaviour$Properties')
    var VBlocks = Java.loadClass('net.minecraft.world.level.block.Blocks')
    var elite = RMT.ELITE
    var type6 = new IRMT({
      getTier: function () { return 6 },
      getMaxCarryWeight: function () { return elite.getMaxCarryWeight() },
      getMotorCount: function () { return elite.getMotorCount() },
      getSerializedName: function () { return 'grindless_s0_motor6' }
    })
    console.info('[uhv-s0] s0_motor6 type tier ' + type6.getTier() + ' carry ' + type6.getMaxCarryWeight() + ' count ' + type6.getMotorCount())
    event.createCustom('grindless:s0_motor6', function () { return new RMB(Props.copy(VBlocks.IRON_BLOCK), type6) })
    console.info('[uhv-s0] s0_motor6 createCustom registered')
  } catch (e) { console.warn('[uhv-s0] s0_motor6 createCustom failed: ' + e) }
})

StartupEvents.registry('item', function (event) {
  event.create('grindless:nuclear_clock').texture('minecraft:item/clock_00')
  event.create('grindless:s0_segment').texture('minecraft:item/glowstone_dust')
  event.create('grindless:s0_worn_segment').texture('minecraft:item/gunpowder')
})

GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
  event.create('s0_dyson_swarm')
    .category('generator')
    .setEUIO('out')
    .setMaxIOSize(3, 1, 1, 0)
    .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
    .setSound(GTSoundEntries.ARC)
})

GTCEuStartupEvents.registry('gtceu:machine', function (event) {
  var G = global.grindless
  var Pat = G.patterns
  var SPEC = {
    slices: [
      ['CCC', 'CEC', 'CCC'],
      ['CCC', 'C#C', 'CCC'],
      ['CIC', 'BSO', 'CCC']
    ],
    symbols: {
      S: Pat.controller(),
      E: Pat.part('energy_output', { exact: 1 }),
      I: Pat.part('input_hatch', { exact: 1 }),
      B: Pat.part('input_bus', { exact: 1 }),
      O: Pat.part('output_bus', { exact: 1 }),
      C: Pat.block('gtceu:solid_machine_casing'),
      '#': Pat.air()
    }
  }
  Pat.register('gtceu:s0_swarm_control', SPEC)
  G.generators.configure(event.create('s0_swarm_control', 'multiblock'), { maxParallels: 1, name: 's0_swarm_control' })
    .langValue('S0 Swarm Control')
    .rotationState(RotationState.NON_Y_AXIS)
    .recipeType('s0_dyson_swarm')
    .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
    .pattern(function (def) { return Pat.build(def, SPEC) })
    .workableCasingModel('gtceu:block/casings/solid/machine_casing_solid_steel', 'gtceu:block/multiblock/large_combustion_engine')
})
