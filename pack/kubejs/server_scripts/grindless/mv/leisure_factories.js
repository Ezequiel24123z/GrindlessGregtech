// priority: -20924
// -----------------------------------------------------------------------------------------------
// Controller recipes of the four universal factories (startup_scripts/grindless/mv/leisure_factories.js), made by hand from MV parts
// like the rest of the MV family (mv/family_crafting.js). Each controller is built around the two single-block MV machines that are
// its most used modes, like GTM's own GCYM controllers take the single block they replace, plus the parts of its other modes and two
// MV circuits. That is about three MV machines per factory: more than one single block, far less than the 2 to 11 machine types (times
// 4, for the parallels) it stands in for. No new recipes for the modes themselves: they are GTM's own recipe types.
//
//   Processing   2 MV pistons (press, hammer, extruder), 1 MV emitter (laser engraver), MV bender + MV wiremill, a steel gearbox
//   Assembly     2 MV robot arms, an aluminium frame, MV assembler + MV circuit assembler, 1 MV conveyor
//   Separation   2 MV motors (the rotors), a steel pipe casing, MV centrifuge + MV electrolyzer, 1 MV pump
//   Mixing       2 MV motors (the stirrers), glass, MV mixer + MV chemical reactor, 1 MV pump
//
// event.recipes.gtceu.shaped: GTM's shaped recipe; ingredient keys are uppercase on purpose (lowercase letters are GT tools).
(function () {
  const G = global.grindless
  const UF = G.universalFactories || (G.universalFactories = {})

  const HULL = 'gtceu:mv_machine_hull'
  const CIRCUIT = '#gtceu:circuits/mv'

  const RECIPES = [
    {
      machine: 'gtceu:universal_processing_factory',
      rows: ['PEP', 'BHW', 'CGD'],
      keys: { P: 'gtceu:mv_electric_piston', E: 'gtceu:mv_emitter', B: 'gtceu:mv_bender', H: HULL, W: 'gtceu:mv_wiremill',
        C: CIRCUIT, G: 'gtceu:steel_gearbox', D: 'grindless:vanadium_steel_drill_bit' }
    },
    {
      machine: 'gtceu:universal_assembly_factory',
      rows: ['RFR', 'AHK', 'CVD'],
      keys: { R: 'gtceu:mv_robot_arm', F: 'gtceu:aluminium_frame', A: 'gtceu:mv_assembler', H: HULL, K: 'gtceu:mv_circuit_assembler',
        C: CIRCUIT, V: 'gtceu:mv_conveyor_module', D: 'grindless:graphite_electrode' }
    },
    {
      machine: 'gtceu:universal_separation_factory',
      rows: ['MTM', 'NHE', 'CPD'],
      keys: { M: 'gtceu:mv_electric_motor', T: 'gtceu:steel_pipe_casing', N: 'gtceu:mv_centrifuge', H: HULL, E: 'gtceu:mv_electrolyzer',
        C: CIRCUIT, P: 'gtceu:mv_electric_pump', D: 'grindless:vanadium_steel_drill_bit' }
    },
    {
      machine: 'gtceu:universal_mixing_factory',
      rows: ['MGM', 'XHR', 'CPD'],
      keys: { M: 'gtceu:mv_electric_motor', G: '#forge:glass', X: 'gtceu:mv_mixer', H: HULL, R: 'gtceu:mv_chemical_reactor',
        C: CIRCUIT, P: 'gtceu:mv_electric_pump', D: 'grindless:contact_catalyst' }
    }
  ]

  // machine id -> crafting recipe id (read by the smoke test)
  UF.crafting = {}
  RECIPES.forEach(function (r) {
    UF.crafting[r.machine] = 'grindless:crafting/' + r.machine.split(':')[1]
  })

  ServerEvents.recipes(function (event) {
    var added = 0
    RECIPES.forEach(function (r) {
      try {
        var missing = []
        Object.keys(r.keys).forEach(function (k) {
          var id = r.keys[k]
          if (id.charAt(0) !== '#' && !Item.exists(id)) missing.push(id)
        })
        if (!Item.exists(r.machine)) missing.push(r.machine)
        if (missing.length > 0) {
          console.error('[grindless/mv] ' + r.machine + ' recipe skipped, unknown item(s): ' + missing.join(', '))
          return
        }
        event.recipes.gtceu.shaped(r.machine, r.rows, r.keys).id(UF.crafting[r.machine])
        added++
      } catch (e) {
        console.error('[grindless/mv] ' + r.machine + ' recipe failed: ' + e)
      }
    })
    console.info('[grindless/mv] universal factories: ' + added + ' controller recipes added')
  })
})()
