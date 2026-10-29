// priority: -18324
// LuV B7, Io orbit (docs/eras/luv.md, sections 16 and 16b). Writes the recipes of the slot's active design only (G.ioOrbit.mode, from
// tables/stations.json); in the 'pending' mode nothing is written and the spool stays hidden (its hidden-table group says unless
// 'tether'). Every number is marked (tune) in the design.
(function () {
  var G = global.grindless
  var IOO = G.ioOrbit
  var R = IOO.recipes = {
    tether: {
      circuit: 1, eut: 65536, duration: 400, argon: 25, spool: 'grindless:tether_spool',
      // a spool about every hour at full power: two reel cells x 28/10,000 a run, 180 runs (400 t) an hour -> 1.0 an hour
      wearChance: 28
    },
    spool: { eut: 7680, duration: 400, foils: 64, aramid: 8, endMass: 'grindless:whipple_shield_casing' },
    plant: { circuit: 1, eut: 30, duration: 400, water: 1000, acid: 2000, iodine: 8, hydrogen: 2000, oxygen: 1000 }
  }

  ServerEvents.recipes(function (event) {
    var gt = event.recipes.gtceu
    if (IOO.tether.active) {
      var t = R.tether
      gt[IOO.tether.type]('grindless:plasma_torus')
        .circuit(t.circuit)
        .chancedInput(t.spool, t.wearChance, 0)
        .inputFluids(Fluid.of('gtceu:argon', t.argon))
        .EUt(-t.eut).duration(t.duration)
        .dimension(IOO.tether.site)
      var s = R.spool
      gt.assembly_line('grindless:luv/tether_spool')
        .itemInputs(s.foils + 'x gtceu:aluminium_foil', s.aramid + 'x gcyr:para_aramid_foil', s.endMass, '2x grindless:platinum_gauze',
          '2x grindless:zircaloy_cladding_tube')
        .inputFluids(Fluid.of('gtceu:soldering_alloy', 144), Fluid.of('gtceu:lubricant', 250))
        .itemOutputs(t.spool).EUt(s.eut).duration(s.duration)
      gt.assembly_line('grindless:flux_tube_tether')
        .itemInputs('gtceu:luv_machine_hull', '2x gtceu:luv_electric_motor', 'gtceu:luv_sensor', '4x #gtceu:circuits/luv', '4x ' + t.spool,
          '2x grindless:magnetic_bearing')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 576), Fluid.of('gtceu:lubricant', 500))
        .itemOutputs(IOO.tether.machine).EUt(30720).duration(600)
    }
    if (IOO.plant.active) {
      var p = R.plant
      G.places.allow(gt[IOO.plant.type]('grindless:sulfur_iodine')
        .circuit(p.circuit)
        .inputFluids(Fluid.of('minecraft:water', p.water))
        .notConsumableFluid(Fluid.of('gtceu:sulfuric_acid', p.acid))
        .notConsumable(p.iodine + 'x gtceu:iodine_dust')
        .outputFluids(Fluid.of('gtceu:hydrogen', p.hydrogen), Fluid.of('gtceu:oxygen', p.oxygen))
        .EUt(p.eut).duration(p.duration), IOO.plant.place)
      gt.assembly_line('grindless:sulfur_iodine_plant')
        .itemInputs('gtceu:luv_machine_hull', '2x gtceu:luv_electric_pump', 'gtceu:luv_sensor', '4x #gtceu:circuits/luv',
          '2x grindless:zircaloy_cladding_tube', '2x grindless:contact_catalyst')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 576), Fluid.of('gtceu:lubricant', 500))
        .itemOutputs(IOO.plant.machine).EUt(30720).duration(600)
    }
  })
})()
