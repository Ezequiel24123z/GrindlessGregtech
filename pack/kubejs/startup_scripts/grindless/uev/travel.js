// priority: -7656
// -----------------------------------------------------------------------------------------------
// UEV travel (package UEV-B1, docs/eras/uev.md "Places and site rules", "Sunlight", "Bridges and first arrivals", "AE2 between stars").
//
// Registered here: the two direct fusion drive motors, GCYR rocket motors made with createCustom exactly like UHV-A8's ICAN
// (startup_scripts/grindless/uhv/propulsion.js; spike S0-2 proved both tiers fly):
//   grindless:dfd_mk1_motor   GCYR motor tier 7. With UV's tier 11 BNNT tank, floor((7 + 11) / 2) = level 9: Alpha Centauri AB orbit
//                             (station 9) and Barnard b.
//   grindless:dfd_mk2_motor   GCYR motor tier 9. With the same tank, floor((9 + 11) / 2) = level 10: Sirius B orbit (station 10).
// Their recipes are two rows of UV's thruster works (server_scripts/grindless/uv/propulsion.js, circuits 6 and 7); their loot table
// and tool tag are in server_scripts/grindless/uev/travel.js; their models reuse the ICAN's textures; names: client_scripts/grindless/uev_travel_lang.js.
//
// The places are data, nothing else is registered here (spike S0-3):
//   data/grindless/gcyr/planets/{alpha_centauri_orbit,barnard_b,sirius_b_orbit}.json   the planets (tier 9, 9, 10)
//   data/grindless/dimension/{alpha_centauri_orbit,barnard_b,barnard_b_orbit,sirius_b_orbit}.json   the dimensions (final ids)
//   assets/grindless/gcyr/planet_assets/sky_renderers/{alpha_centauri_orbit,barnard_b_orbit,sirius_b_orbit}.json   the skies
// Tables: planets.json (alpha, barnard, sirius), orbits.json, places.json (barnard_b), stations.json `more` slots nine and ten,
// sunlight.json, offworld_only.json (Barnard b's rhenium). The warp gate relays: server_scripts/grindless/uhv/gate.js.
// Published as global.grindless.uevTravel for the recipe scripts and the tests.
(function () {
  var G = global.grindless
  var T = G.uevTravel || (G.uevTravel = {})

  T.motors = {
    mk1: { id: 'grindless:dfd_mk1_motor', tier: 7, typeName: 'grindless_dfd_mk1', level: 9 },
    mk2: { id: 'grindless:dfd_mk2_motor', tier: 9, typeName: 'grindless_dfd_mk2', level: 10 }
  }
  T.ids = { dfdMk1Motor: T.motors.mk1.id, dfdMk2Motor: T.motors.mk2.id }
  T.registered = {}

  // the dimension ids are final once shipped
  T.places = {
    alpha: { world: 'grindless:alpha_centauri_orbit', orbit: 'grindless:alpha_centauri_orbit', tier: 9, planets: 'alpha' },
    barnard: { world: 'grindless:barnard_b', orbit: 'grindless:barnard_b_orbit', tier: 9, planets: 'barnard' },
    sirius: { world: 'grindless:sirius_b_orbit', orbit: 'grindless:sirius_b_orbit', tier: 10, planets: 'sirius' }
  }

  // stations.json `more`: the 9th and 10th slots, after UHV's two
  T.stations = [
    { slot: 'alpha', orbit: 'grindless:alpha_centauri_orbit' },
    { slot: 'sirius', orbit: 'grindless:sirius_b_orbit' }
  ]

  T.sunlight = {
    'grindless:alpha_centauri_orbit': 1.0,
    'grindless:barnard_b': 6.7,
    'grindless:sirius_b_orbit': 5.6
  }

  var motorBlocks = {}

  StartupEvents.registry('block', function (event) {
    // KubeJS 6 always has createCustom; the static stand-in (tools/analysis/lib/kubejs_static.mjs) registers the id without the supplier
    if (typeof event.createCustom !== 'function') {
      console.warn('[grindless/uev] DFD motors skipped: this registry event has no createCustom')
      return
    }
    try {
      var RMB = Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock')
      var RMT = Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock$RocketMotorType')
      var IRMT = Java.loadClass('argent_matter.gcyr.api.block.IRocketMotorType')
      var Props = Java.loadClass('net.minecraft.world.level.block.state.BlockBehaviour$Properties')
      var VBlocks = Java.loadClass('net.minecraft.world.level.block.Blocks')
      var elite = RMT.ELITE
      Object.keys(T.motors).forEach(function (key) {
        var m = T.motors[key]
        var type = new IRMT({
          getTier: function () { return m.tier },
          getMaxCarryWeight: function () { return elite.getMaxCarryWeight() },
          getMotorCount: function () { return elite.getMotorCount() },
          getSerializedName: function () { return m.typeName }
        })
        event.createCustom(m.id, function () {
          motorBlocks[key] = new RMB(Props.copy(VBlocks.IRON_BLOCK), type)
          return motorBlocks[key]
        })
        T.registered[key] = true
      })
    } catch (e) {
      console.error('[grindless/uev] DFD motor blocks not registered: ' + e)
    }
  })

  StartupEvents.registry('item', function (event) {
    // the item event can fire before the block one (UHV-A8's T1 showed it): the supplier runs in Forge's item RegisterEvent,
    // after every block is registered, and resolves the block then
    if (typeof event.createCustom !== 'function') return
    try {
      var BlockItem = Java.loadClass('net.minecraft.world.item.BlockItem')
      var ItemProps = Java.loadClass('net.minecraft.world.item.Item$Properties')
      var Forge = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
      Object.keys(T.motors).forEach(function (key) {
        var m = T.motors[key]
        event.createCustom(m.id, function () {
          var block = motorBlocks[key] ? motorBlocks[key] : Forge.BLOCKS.getValue(new RL(m.id))
          if (T.registered[key] !== true) console.error('[grindless/uev] ' + m.id + ' item has no motor block (the block registry failed)')
          return new BlockItem(block, new ItemProps())
        })
      })
    } catch (e) {
      console.error('[grindless/uev] DFD motor items not registered: ' + e)
    }
  })
})()
