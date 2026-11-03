// priority: -18174
// LuV living-circuit line L2 (docs/eras/lines-ev-zpm.md section 4): butane to PEDOT:PSS, the interface polymer of the organoid's electrode array.
// One run of the line: 1 butane + 4 sulfur -> 1 thiophene -> 1 tetrabromothiophene -> 1 dibromothiophene -> 1 DMT -> 1 EDOT -> 1 PEDOT:PSS.
// Atoms are conserved in GTM units (dusts by atoms, fluids 1,000 mB a molecule, elemental gases and bromine 1,000 mB an atom).
// Bromine: 8 atoms go into the tetrabromide (the spec's 4,000 mB is one Br2 per two atoms short of the molecule: 4 Br2 = 8 Br), 4 leave as HBr;
// the HBr pays the debromination's protons, the zinc and sodium bromides and the rest of the HBr are electrolysed back (8 Br out per run).
// Methanol loops (the transetherification gives back what the methoxide takes); the oxidant ends as sodium sulfate and sulfuric acid.
(function () {
  var G = global.grindless
  var PE = G.pedot || (G.pedot = {})
  var LV = 30720
  var FEED = 7680
  var R = PE.recipes = {
    thiophene: { eut: LV, duration: 400, butane: 1000, sulfur: 4, thiophene: 1000, h2s: 3000 },
    bromination: { eut: LV, duration: 300, thiophene: 1000, bromine: 8000, tetra: 1, hbr: 4000 },
    debromination: { eut: LV, duration: 300, tetra: 1, zinc: 2, hbr: 2000, solvent: 1000, dibromo: 1000, zincBromide: 2 },
    methoxylation: { eut: LV, duration: 400, dibromo: 1000, methoxide: 2000, dmt: 1000, sodiumBromide: 2 },
    etherification: { eut: LV, duration: 400, dmt: 1000, glycol: 1000, edot: 1000, methanol: 2000 },
    polymerisation: { eut: LV, duration: 600, edot: 1000, pss: 1000, persulfate: 1000, pedot: 1000, sulfate: 1, acid: 1000 },
    methoxide: { eut: FEED, duration: 200, methanol: 2000, sodium: 2, methoxide: 2000, hydrogen: 2000 },
    ethyleneOxide: { eut: FEED, duration: 300, ethylene: 1000, oxygen: 1000, oxide: 1000 },
    glycol: { eut: FEED, duration: 200, oxide: 1000, water: 1000, glycol: 1000 },
    polystyrene: { eut: FEED, duration: 200, styrene: 1000, polystyrene: 1 },
    sulfonation: { eut: FEED, duration: 200, polystyrene: 1, so3: 1000, pss: 1000 },
    hbrElectrolysis: { eut: FEED, duration: 200, hbr: 2000, hydrogen: 2000, bromine: 2000 },
    zincBromideElectrolysis: { eut: FEED, duration: 200, bromide: 1, zinc: 1, bromine: 2000 },
    sodiumBromideElectrolysis: { eut: FEED, duration: 200, bromide: 1, sodium: 1, bromine: 1000 }
  }

  global.grindless.recipes('luv/pedot', function (event) {
    var gt = event.recipes.gtceu

    var t = R.thiophene
    gt.chemical_reactor('grindless:thiophene_sulfurisation')
      .circuit(1)
      .itemInputs(t.sulfur + 'x gtceu:sulfur_dust')
      .inputFluids(Fluid.of('gtceu:butane', t.butane))
      .outputFluids(Fluid.of('gtceu:thiophene', t.thiophene), Fluid.of('gtceu:hydrogen_sulfide', t.h2s))
      .EUt(t.eut).duration(t.duration)

    var b = R.bromination
    gt.chemical_reactor('grindless:thiophene_bromination')
      .inputFluids(Fluid.of('gtceu:thiophene', b.thiophene), Fluid.of('gtceu:bromine', b.bromine))
      .itemOutputs(b.tetra + 'x gtceu:tetrabromothiophene_dust')
      .outputFluids(Fluid.of('gtceu:hydrogen_bromide', b.hbr))
      .EUt(b.eut).duration(b.duration)

    var d = R.debromination
    gt.chemical_reactor('grindless:dibromothiophene_reduction')
      .itemInputs(d.tetra + 'x gtceu:tetrabromothiophene_dust', d.zinc + 'x gtceu:zinc_dust')
      .inputFluids(Fluid.of('gtceu:hydrogen_bromide', d.hbr))
      .notConsumableFluid(Fluid.of('gtceu:acetic_acid', d.solvent))
      .itemOutputs(d.zincBromide + 'x gtceu:zinc_bromide_dust')
      .outputFluids(Fluid.of('gtceu:dibromothiophene', d.dibromo))
      .EUt(d.eut).duration(d.duration)

    var m = R.methoxylation
    gt.large_chemical_reactor('grindless:dimethoxythiophene_methoxylation')
      .inputFluids(Fluid.of('gtceu:dibromothiophene', m.dibromo), Fluid.of('gtceu:sodium_methoxide', m.methoxide))
      .itemOutputs(m.sodiumBromide + 'x gtceu:sodium_bromide_dust')
      .outputFluids(Fluid.of('gtceu:dimethoxythiophene', m.dmt))
      .EUt(m.eut).duration(m.duration)

    var e = R.etherification
    gt.large_chemical_reactor('grindless:edot_transetherification')
      .inputFluids(Fluid.of('gtceu:dimethoxythiophene', e.dmt), Fluid.of('gtceu:ethylene_glycol', e.glycol))
      .outputFluids(Fluid.of('gtceu:edot', e.edot), Fluid.of('gtceu:methanol', e.methanol))
      .EUt(e.eut).duration(e.duration)

    var p = R.polymerisation
    gt.large_chemical_reactor('grindless:pedot_pss_polymerisation')
      .inputFluids(Fluid.of('gtceu:edot', p.edot), Fluid.of('gtceu:polystyrene_sulfonate', p.pss), Fluid.of('gtceu:sodium_persulfate', p.persulfate))
      .itemOutputs(p.sulfate + 'x gtceu:sodium_sulfate_dust')
      .outputFluids(Fluid.of('gtceu:pedot_pss', p.pedot), Fluid.of('gtceu:sulfuric_acid', p.acid))
      .EUt(p.eut).duration(p.duration)

    var x = R.methoxide
    gt.chemical_reactor('grindless:sodium_methoxide_synthesis')
      .circuit(2)
      .itemInputs(x.sodium + 'x gtceu:sodium_dust')
      .inputFluids(Fluid.of('gtceu:methanol', x.methanol))
      .outputFluids(Fluid.of('gtceu:sodium_methoxide', x.methoxide), Fluid.of('gtceu:hydrogen', x.hydrogen))
      .EUt(x.eut).duration(x.duration)

    var o = R.ethyleneOxide
    gt.chemical_reactor('grindless:ethylene_oxide_oxidation')
      .notConsumable('gtceu:silver_dust')
      .inputFluids(Fluid.of('gtceu:ethylene', o.ethylene), Fluid.of('gtceu:oxygen', o.oxygen))
      .outputFluids(Fluid.of('gtceu:ethylene_oxide', o.oxide))
      .EUt(o.eut).duration(o.duration)

    var g = R.glycol
    gt.chemical_reactor('grindless:ethylene_glycol_hydration')
      .inputFluids(Fluid.of('gtceu:ethylene_oxide', g.oxide), Fluid.of('minecraft:water', g.water))
      .outputFluids(Fluid.of('gtceu:ethylene_glycol', g.glycol))
      .EUt(g.eut).duration(g.duration)

    var s = R.polystyrene
    gt.chemical_reactor('grindless:polystyrene_polymerisation')
      .circuit(3)
      .inputFluids(Fluid.of('gtceu:styrene', s.styrene))
      .itemOutputs(s.polystyrene + 'x gtceu:polystyrene_dust')
      .EUt(s.eut).duration(s.duration)

    var u = R.sulfonation
    gt.chemical_reactor('grindless:polystyrene_sulfonation')
      .itemInputs(u.polystyrene + 'x gtceu:polystyrene_dust')
      .inputFluids(Fluid.of('gtceu:sulfur_trioxide', u.so3))
      .outputFluids(Fluid.of('gtceu:polystyrene_sulfonate', u.pss))
      .EUt(u.eut).duration(u.duration)

    var h = R.hbrElectrolysis
    gt.electrolyzer('grindless:hydrogen_bromide_electrolysis')
      .inputFluids(Fluid.of('gtceu:hydrogen_bromide', h.hbr))
      .outputFluids(Fluid.of('gtceu:hydrogen', h.hydrogen), Fluid.of('gtceu:bromine', h.bromine))
      .EUt(h.eut).duration(h.duration)

    var z = R.zincBromideElectrolysis
    gt.electrolyzer('grindless:zinc_bromide_electrolysis')
      .itemInputs(z.bromide + 'x gtceu:zinc_bromide_dust')
      .itemOutputs(z.zinc + 'x gtceu:zinc_dust')
      .outputFluids(Fluid.of('gtceu:bromine', z.bromine))
      .EUt(z.eut).duration(z.duration)

    var n = R.sodiumBromideElectrolysis
    gt.electrolyzer('grindless:sodium_bromide_electrolysis')
      .itemInputs(n.bromide + 'x gtceu:sodium_bromide_dust')
      .itemOutputs(n.sodium + 'x gtceu:sodium_dust')
      .outputFluids(Fluid.of('gtceu:bromine', n.bromine))
      .EUt(n.eut).duration(n.duration)
  })
})()
