// -----------------------------------------------------------------------------------------------
// Gregicality Rocketry (GCYR 0.2.9): the first rocket and the space suit are HV. The Moon comes at the end of HV with the first rocket
// (docs/viaje.md) and HV has no titanium: every HV part is stainless steel (DECISIONS.md, 2026-10-24). GCYR's mechanics stay as they
// are: the Rocket Scanner builds the rocket out of the blocks above its launch pads, seats + basic motors + basic fuel tanks make a
// tier 1 rocket (what the Moon asks for, data/gcyr/gcyr/planets/luna.json), and the suit keeps 16 buckets of oxygen in the chestplate.
// Only the recipes that asked for EV or later parts change:
//
//   Rocket Scanner (gcyr:rocket_scanner)    EV hull, 4 EV circuits and 2 titanium plates -> HV hull, 4 HV circuits and 2 stainless
//                                           steel plates; the 2 launch pads stay
//   Space Fabric (gcyr:space_fabric)        4 PTFE + 4 para-aramid + 4 POLYBENZIMIDAZOLE foils + 4 fiberglass -> the PBI (an IV plastic:
//                                           7 680 EU/t) becomes 1 plate of KAPTON K, GCYR's polyimide (HV chemistry, the same amount of
//                                           plastic as 4 foils). A plate and not foils so the recipe is not a superset of GCYR's heat
//                                           shielding fabric (4 Kapton K foils + 4 PTFE foils + 4 fiberglass) in the same assembler
//   Fiberglass (fluid gcyr:fiberglass)      chemical bath, 2 silica + 250 mB epoxy at 1 920 EU/t (EV) -> the same recipe at 480 EU/t:
//                                           epoxy is an HV line (docs/eras/hv.md), so is the glass fibre made with it
//   Space Helmet, Space Leggings            the EV circuit -> an HV circuit
//   Space Chestplate                        large TUNGSTEN STEEL fluid cell + 2 EV circuits -> large STAINLESS STEEL fluid cell + 2 HV
//                                           circuits (the oxygen tank is GCYR's own, 16 B whatever the cell; tungsten is from Mars)
// Already HV or lower and untouched: the boots, the seat, the launch pad, the ID chip, the basic rocket motor (4 power thrusters,
// 6 Kapton K plates, a stainless steel frame) and the basic fuel tank (2 stainless steel drums, 6 Kapton K plates, a stainless steel
// frame). The rocket's fuel: diesel and gasoline are tier 0, rocket fuel and hydrogen tier 1 (GCYR's rocket_fuel recipes).
//
// Not touched (later tiers; iv.md's "remove GCYR's basic parts" is superseded: the basic rocket IS the HV rocket): the advanced and
// elite motors and tanks, the space and thermal upgrade templates (titanium, PBI, IV), the insulating and heat shielding fabrics, the
// space station packager, the Dyson sphere and the space elevator. GCYR only registers the oxygen spreader from IV up: on the first
// trip the oxygen is the suit's own tank (1 mB every 3 ticks: 16 B last 40 minutes), filled in a fluid canner.
//
// Era: HV. Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/gcyr] '

  // published for tools/test and the audit: GCYR recipe id -> the recipe that replaces it
  var REPLACED = {
    'gcyr:shaped/rocket_scanner': 'grindless:gcyr/rocket_scanner',
    'gcyr:assembler/space_fabric': 'grindless:assembler/gcyr/space_fabric',
    'gcyr:chemical_bath/fiberglass': 'grindless:chemical_bath/gcyr/fiberglass',
    'gcyr:shaped/space_helmet': 'grindless:gcyr/space_helmet',
    'gcyr:shaped/space_chest': 'grindless:gcyr/space_chestplate',
    'gcyr:shaped/space_legs': 'grindless:gcyr/space_leggings'
  }
  var G = global.grindless || (global.grindless = {})
  G.gcyr = { replaced: REPLACED }

  var NEEDED = ['gcyr:rocket_scanner', 'gcyr:launch_pad', 'gcyr:space_fabric', 'gcyr:space_helmet', 'gcyr:space_chestplate',
    'gcyr:space_leggings', 'gcyr:kapton_k_plate', 'gcyr:para_aramid_foil', 'gcyr:fiberglass_dust', 'gtceu:hv_machine_hull',
    'gtceu:stainless_steel_fluid_cell', 'gtceu:polytetrafluoroethylene_foil', 'gtceu:silicon_dioxide_dust']

  function addRecipes(event) {
    var done = []

    event.remove({ id: 'gcyr:shaped/rocket_scanner' })
    event.shaped('gcyr:rocket_scanner', ['PCP', 'CHC', 'SCS'], {
      P: 'gcyr:launch_pad',
      C: '#gtceu:circuits/hv',
      H: 'gtceu:hv_machine_hull',
      S: '#forge:plates/stainless_steel'
    }).id('grindless:gcyr/rocket_scanner')
    done.push('rocket scanner')

    event.remove({ id: 'gcyr:assembler/space_fabric' })
    event.recipes.gtceu.assembler('grindless:gcyr/space_fabric')
      .itemInputs('4x #forge:foils/polytetrafluoroethylene', '4x #forge:foils/para_aramid', '1x #forge:plates/kapton_k',
        '4x #forge:dusts/fiberglass')
      .itemOutputs('gcyr:space_fabric')
      .duration(100).EUt(480)
    done.push('space fabric')

    event.remove({ id: 'gcyr:chemical_bath/fiberglass' })
    event.recipes.gtceu.chemical_bath('grindless:gcyr/fiberglass')
      .itemInputs('2x #forge:dusts/silicon_dioxide')
      .inputFluids(Fluid.of('gtceu:epoxy', 250))
      .outputFluids(Fluid.of('gcyr:fiberglass', 250))
      .duration(200).EUt(480)
    done.push('fiberglass')

    event.remove({ id: 'gcyr:shaped/space_helmet' })
    event.shaped('gcyr:space_helmet', ['SFS', 'FFF', 'SCS'], {
      S: 'gcyr:space_fabric',
      F: '#forge:foils/gold',
      C: '#gtceu:circuits/hv'
    }).id('grindless:gcyr/space_helmet')

    event.remove({ id: 'gcyr:shaped/space_chest' })
    event.shaped('gcyr:space_chestplate', ['STS', 'SCS', 'SCS'], {
      S: 'gcyr:space_fabric',
      T: 'gtceu:stainless_steel_fluid_cell',
      C: '#gtceu:circuits/hv'
    }).id('grindless:gcyr/space_chestplate')

    event.remove({ id: 'gcyr:shaped/space_legs' })
    event.shaped('gcyr:space_leggings', ['SCS', 'S S', 'S S'], {
      S: 'gcyr:space_fabric',
      C: '#gtceu:circuits/hv'
    }).id('grindless:gcyr/space_leggings')
    done.push('suit')

    return done
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    try {
      var missing = NEEDED.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0 || !Fluid.exists('gcyr:fiberglass') || !Fluid.exists('gtceu:epoxy')) {
        console.error(LOG + 'GCYR recipes left as they are, unknown item(s) or fluid(s): ' + missing.join(', '))
        return
      }
      console.info(LOG + 'first rocket and space suit moved to HV: ' + addRecipes(event).join(', '))
    } catch (e) {
      console.error(LOG + 'recipe changes failed: ' + e)
    }
  })
})()
