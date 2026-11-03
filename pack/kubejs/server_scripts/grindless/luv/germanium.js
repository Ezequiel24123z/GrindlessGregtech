// priority: -18174
// LuV germanium line L4 (docs/eras/lines-ev-zpm.md section 4), steps after Io's chlorination (luv/io_surface.js "separate").
// Germanium, indium and chlorine are conserved: per condenser run (4 sublimate = 2 Ge + 1 In) 11,000 mB chlorine go in at the condenser,
// 8,000 return from the hydrolysis HCl and 3,000 from the indium chloride. The cascade's scrub (ev/extraction_cascade.js) purifies the GeCl4.
(function () {
  var G = global.grindless
  var GE = G.germanium
  var R = GE.recipes = {
    hydrolysis: { eut: 1920, duration: 200, gecl4: 2000, water: 4000, dioxide: 2, hcl: 8000 },
    reduction: { eut: 7680, duration: 400, temp: 900, dioxide: 2, hydrogen: 8000, germanium: 2, water: 4000 },
    hclRecovery: { eut: 1920, duration: 200, hcl: 8000, hydrogen: 8000, chlorine: 8000 },
    indium: { eut: 1920, duration: 200, chloride: 1, indium: 1, chlorine: 3000 },
    boule: { eut: 30720, duration: 1200, temp: 1300, germanium: 16, argon: 1000, boules: 1 },
    cutter: { eut: 7680, duration: 400, boules: 1, wafers: 16 }
  }

  global.grindless.recipes('luv/germanium', function (event) {
    var gt = event.recipes.gtceu
    var clean = Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType').CLEANROOM

    var h = R.hydrolysis
    gt.chemical_reactor('grindless:germanium_hydrolysis')
      .inputFluids(Fluid.of('gtceu:pure_germanium_tetrachloride', h.gecl4), Fluid.of('minecraft:water', h.water))
      .itemOutputs(h.dioxide + 'x gtceu:germanium_dioxide_dust')
      .outputFluids(Fluid.of('gtceu:hydrochloric_acid', h.hcl))
      .EUt(h.eut).duration(h.duration)

    var d = R.reduction
    gt.electric_blast_furnace('grindless:germanium_reduction')
      .itemInputs(d.dioxide + 'x gtceu:germanium_dioxide_dust')
      .inputFluids(Fluid.of('gtceu:hydrogen', d.hydrogen))
      .itemOutputs(d.germanium + 'x gtceu:germanium_dust')
      .outputFluids(Fluid.of('minecraft:water', d.water))
      .blastFurnaceTemp(d.temp).EUt(d.eut).duration(d.duration)

    var c = R.hclRecovery
    gt.electrolyzer('grindless:germanium_hcl_recovery')
      .inputFluids(Fluid.of('gtceu:hydrochloric_acid', c.hcl))
      .outputFluids(Fluid.of('gtceu:hydrogen', c.hydrogen), Fluid.of('gtceu:chlorine', c.chlorine))
      .EUt(c.eut).duration(c.duration)

    var i = R.indium
    gt.electrolyzer('grindless:indium_chloride_electrolysis')
      .itemInputs(i.chloride + 'x gtceu:indium_chloride_dust')
      .itemOutputs(i.indium + 'x gtceu:indium_dust')
      .outputFluids(Fluid.of('gtceu:chlorine', i.chlorine))
      .EUt(i.eut).duration(i.duration)

    var b = R.boule
    gt.electric_blast_furnace('grindless:germanium_boule')
      .circuit(1)
      .itemInputs(b.germanium + 'x gtceu:germanium_dust')
      .notConsumableFluid(Fluid.of('gtceu:argon', b.argon))
      .itemOutputs(b.boules + 'x grindless:germanium_boule')
      .blastFurnaceTemp(b.temp).EUt(b.eut).duration(b.duration)

    var w = R.cutter
    gt.cutter('grindless:germanium_wafer')
      .itemInputs(w.boules + 'x grindless:germanium_boule')
      .itemOutputs(w.wafers + 'x grindless:germanium_wafer')
      .cleanroom(clean).EUt(w.eut).duration(w.duration)
  })
})()
