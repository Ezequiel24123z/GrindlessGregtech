// priority: -20146
// -----------------------------------------------------------------------------------------------
// MAX+ casing family (D5-CAS-MAXP, docs/eras/lines-opv-maxplus.md 7.3 and X5 step 8/9): the rows of the six horizon casings. The lattice is the
// structure (it takes the MAX tensegrity truss), the Kerr coil casing wraps the lattice round the Kerr field coil, and the shield, cryostat,
// window and gate casings are made from what the three far places give: iron-56 (30 Doradus), pristine helium-3 (the Stream) and void
// diamond (the filament). None of them takes a horizon plate, a containment plate or Kerr condensate (#233: the Hyperstargate's 15,840
// horizon plates stay the same). Bootstraps: the stellar lift, crucible and burner take no Fe-56, the gas works no cryostat, the void fab no
// window. Published for the tests: global.grindless.maxPlusCasings { recipes, skipped }.
// Rhino: var + function in callbacks.
// -----------------------------------------------------------------------------------------------
(function () {
  var LOG = '[grindless/maxplus_casings] '
  var G = global.grindless || (global.grindless = {})
  var MC = G.maxPlusCasings || (G.maxPlusCasings = {})
  MC.recipes = []
  MC.skipped = []

  var VA_MAX = Number(GTValues.VA[14])
  var HE3 = 'gtceu:pristine_helium_3'
  var SF3 = 'gtceu:superfluid_helium_3'
  var SEAL = '2x grindless:ffkm_seal'
  var LATTICE = 'grindless:bound_lattice_casing'
  var PLATE = 'gtceu:iron_56_plate'

  // type: assembler or assembly_line (the gate casing, with its research item)
  var CASINGS = [
    { name: 'bound_lattice_casing', out: 4, duration: 200, fluid: SF3,
      items: ['grindless:bound_degenerate_billet', '2x grindless:kerr_strand_wire', '2x grindless:tensegrity_truss_casing', 'grindless:maxplus_electric_piston', SEAL] },
    { name: 'kerr_coil_casing', out: 2, duration: 400, fluid: SF3,
      items: ['grindless:kerr_field_coil', LATTICE, 'grindless:maxplus_field_generator', SEAL] },
    { name: 'fe56_shield_casing', out: 4, duration: 400, fluid: SF3,
      items: ['6x ' + PLATE, '2x gtceu:lithium_6_dust', 'gtceu:tungsten_plate', 'grindless:maxplus_electric_piston', SEAL] },
    { name: 'primordial_cryostat_casing', out: 2, duration: 400, fluid: HE3,
      items: ['2x ' + PLATE, 'grindless:he4_dewar', 'grindless:neg_xhv_casing', 'grindless:maxplus_electric_pump', 'grindless:maxplus_fluid_regulator', SEAL] },
    { name: 'void_diamond_window', out: 2, duration: 200, fluid: SF3,
      items: ['2x grindless:void_grown_diamond', PLATE, 'grindless:maxplus_sensor', 'grindless:maxplus_emitter', SEAL] },
    { name: 'horizon_gate_casing', out: 2, duration: 600, fluid: HE3, line: true, research: 'grindless:max_field_coil',
      items: ['4x ' + PLATE, 'grindless:void_grown_diamond', 'grindless:max_field_coil', 'grindless:maxplus_field_generator', '2x grindless:maxplus_emitter', SEAL] }
  ]

  ServerEvents.recipes(function (event) {
    try {
      CASINGS.forEach(function (c) {
        try {
          var out = 'grindless:' + c.name
          var ids = c.items.concat([out], c.research ? [c.research] : [])
          var missing = []
          ids.forEach(function (s) {
            var id = String(s).replace(/^\d+x /, '')
            if (!Item.exists(id)) missing.push(id)
          })
          if (!Fluid.exists(c.fluid)) missing.push(c.fluid)
          if (missing.length > 0) {
            MC.skipped.push(c.name)
            console.error(LOG + 'casing ' + c.name + ' skipped, unknown id(s): ' + missing.join(', '))
            return
          }
          var b = c.line ? event.recipes.gtceu.assembly_line('grindless:' + c.name) : event.recipes.gtceu.assembler('grindless:' + c.name)
          c.items.forEach(function (s) { b.itemInputs(s) })
          b.inputFluids(Fluid.of(c.fluid, 250))
          b.itemOutputs(c.out + 'x ' + out)
          if (c.line) b.stationResearch(function (r) { return r.researchStack(Item.of(c.research)).CWUt(64).EUt(VA_MAX) })
          b.EUt(VA_MAX).duration(c.duration)
          MC.recipes.push('grindless:' + (c.line ? 'assembly_line' : 'assembler') + '/' + c.name)
        } catch (e) {
          console.error(LOG + 'casing ' + c.name + ' failed: ' + e)
        }
      })
      console.info(LOG + 'casings: ' + MC.recipes.length + ' recipes; skipped ' + MC.skipped.length)
    } catch (e) {
      console.error('[grindless/maxplus/casings] recipes failed: ' + e)
    }
  })
})()
