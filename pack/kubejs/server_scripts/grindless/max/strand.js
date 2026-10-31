// priority: -19994
// MAX-A0 "Horizon strand and hull" (docs/eras/max.md line L1 and the hull): the three assembler-side rows of the chain. The rest of the line
// lives in the tables of the machines that run it:
//   c4 vault (tables/exotic_matter.json, strangelet_growth): 1 stable exotic matter -> 4 exotic cladding foil
//   c5, c6 draw bench at SGR 1806-20 (tables/vela_pasta.json, pasta_drawing): clad chain strand -> preform -> 4 horizon strand wires
//   c10 PBO plant (uhv/elevator.js): a wire braided in PBO fibre -> pbo_braid_sleeve
// This script makes:
//   1. grindless:clad_chain_strand: a chain strand ingot clad in 2 exotic cladding foil, a chain lamina and 2 PBO fibre under argon (home, assembly line, no research: a part; EUt VH[MAX]/8 = 2^27 = V[UXV]). It is an assembly line, not the L1 GTM assembler, because the assembler form scores below recipe-quality's tier-14 complexity floor of 10 (C-COMPLEX).
//   2. gtceu:horizon_strand_single_cable: the covering of GTM's single cable above IV, on the braided sleeve: one polyphenylene sulfide foil, one
//      polyvinyl chloride foil and 72 mB of silicone rubber, 7 EU/t for 100 t (the OpV chain_strand_single_cable shape, opv/bulge_relay.js).
//   3. gtceu:max_machine_hull: an assembly line row of the MAX casing, 2 horizon strand cables, 2 chain lamina stacks and 500 mB superfluid
//      He-3 at VH[MAX] = 2^30 EU/t (V[MAX] is 2^31), no research (a part, like the OpV hull). GTM's own hull recipe is removed by opv/cuts.js.
// No input is a MAX product that returns through a loop. Published: global.grindless.maxStrand.recipes, .skipped.
// Rhino: var + function inside every callback.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var S = G.maxStrand || (G.maxStrand = {})
  var VH_MAX = 1073741824 // VH[MAX] = 2^30, not V[MAX]

  function skip(name, missing) {
    S.skipped.push({ name: name, reason: 'unknown id(s) ' + missing.join(', ') })
    console.error(LOG + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    S.recipes = []
    S.skipped = []
    try {
      var cladParts = ['gtceu:chain_strand_ingot', 'grindless:exotic_cladding_foil', 'grindless:chain_lamina', 'grindless:pbo_fibre', 'grindless:clad_chain_strand'].filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists('gtceu:argon')) cladParts.push('gtceu:argon')
      if (cladParts.length > 0) {
        skip('clad_chain_strand', cladParts)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:clad_chain_strand')
        a.itemInputs('gtceu:chain_strand_ingot', '2x grindless:exotic_cladding_foil', 'grindless:chain_lamina', '2x grindless:pbo_fibre')
        a.inputFluids(Fluid.of('gtceu:argon', 1000))
        a.itemOutputs('grindless:clad_chain_strand')
        a.EUt(VH_MAX / 8).duration(300)
        S.recipes.push('grindless:assembly_line/clad_chain_strand')
      }
    } catch (e) {
      S.skipped.push({ name: 'clad_chain_strand', reason: String(e) })
      console.error(LOG + 'clad chain strand recipe failed: ' + e)
    }
    try {
      var coverParts = ['grindless:pbo_braid_sleeve', 'gtceu:polyphenylene_sulfide_foil', 'gtceu:polyvinyl_chloride_foil', 'gtceu:horizon_strand_single_cable']
        .filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists('gtceu:silicone_rubber')) coverParts.push('gtceu:silicone_rubber')
      if (coverParts.length > 0) {
        skip('horizon_strand_single_cable', coverParts)
      } else {
        var c = event.recipes.gtceu.assembler('grindless:horizon_strand_single_cable')
        c.itemInputs('grindless:pbo_braid_sleeve', 'gtceu:polyphenylene_sulfide_foil', 'gtceu:polyvinyl_chloride_foil')
        c.inputFluids(Fluid.of('gtceu:silicone_rubber', 72))
        c.itemOutputs('gtceu:horizon_strand_single_cable')
        c.EUt(7).duration(100)
        S.recipes.push('grindless:assembler/horizon_strand_single_cable')
      }
    } catch (e) {
      S.skipped.push({ name: 'horizon_strand_single_cable', reason: String(e) })
      console.error(LOG + 'horizon strand cable recipe failed: ' + e)
    }
    try {
      var hullParts = ['gtceu:max_machine_casing', 'gtceu:horizon_strand_single_cable', 'grindless:chain_lamina_stack', 'gtceu:max_machine_hull']
        .filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists('gtceu:superfluid_helium_3')) hullParts.push('gtceu:superfluid_helium_3')
      if (hullParts.length > 0) {
        skip('max_machine_hull', hullParts)
      } else {
        var h = event.recipes.gtceu.assembly_line('grindless:max_machine_hull')
        h.itemInputs('gtceu:max_machine_casing')
        h.itemInputs('2x gtceu:horizon_strand_single_cable')
        h.itemInputs('2x grindless:chain_lamina_stack')
        h.inputFluids(Fluid.of('gtceu:superfluid_helium_3', 500))
        h.itemOutputs('gtceu:max_machine_hull')
        h.EUt(VH_MAX).duration(200)
        S.recipes.push('grindless:assembly_line/max_machine_hull')
      }
    } catch (e) {
      S.skipped.push({ name: 'max_machine_hull', reason: String(e) })
      console.error(LOG + 'MAX machine hull recipe failed: ' + e)
    }
  })
})()
