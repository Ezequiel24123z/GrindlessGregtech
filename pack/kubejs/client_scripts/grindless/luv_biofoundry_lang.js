// priority: 8100
// Gregtech Grindless - names and tooltips of LuV's Biofoundry (startup_scripts/grindless/luv/biofoundry.js), its recipe type, the EMI
// line of each of its recipes and the reason it shows when set to void.
//
//   gtceu:biofoundry / gtceu.sterile_culture             (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_biofoundry.<recipe name>     (EMI line of each recipe: what the step does)
//   grindless.machine.biofoundry.no_voiding             (why a run does not start)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.biofoundry', 'Biofoundry')
    add('gtceu.sterile_culture', 'Sterile Culture')

    add('grindless.machine.biofoundry.tooltip.0', '§7Runs GregTech\'s sterile bio chain without a cleanroom.')

    add('gtceu.recipe.grindless_biofoundry.collagen_from_bone', 'Step 1: collagen from bone and meat in sulfuric acid; the diluted acid goes back to sulfuric acid')
    add('gtceu.recipe.grindless_biofoundry.collagen_from_bone_meal', 'Step 2: collagen from bone meal and meat; the diluted acid goes back to sulfuric acid')
    add('gtceu.recipe.grindless_biofoundry.gelatin', 'Step 3: the gelatin mixture and its centrifuge in one run; the phosphorus goes back to phosphoric acid')
    add('gtceu.recipe.grindless_biofoundry.agar', 'Step 4: agar from gelatin in the autoclave bay')
    add('gtceu.recipe.grindless_biofoundry.bacterial_sludge', 'Step 5: bacteria grown on biomass into bacterial sludge')
    add('gtceu.recipe.grindless_biofoundry.mutagen', 'Step 6: the sludge enriched with U-235 and distilled in one run')
    add('gtceu.recipe.grindless_biofoundry.sterile_growth_medium', 'Step 7: the raw growth medium mixed and sterilized in one run')
    add('gtceu.recipe.grindless_biofoundry.stem_cells', 'Step 8: stem cells on osmiridium; their sludge goes back to mutagen')
    add('gtceu.recipe.grindless_biofoundry.engineered_barley_seed', 'Step 9: the bacteria carry the gene into the seed. For the rotating hydroponic ring')
    add('gtceu.recipe.grindless_biofoundry.engineered_tobacco_seed', 'Step 10: the bacteria carry the gene into the seed. For the rotating hydroponic ring')

    add('grindless.machine.biofoundry.no_voiding', 'The biofoundry keeps all it makes: the sludge, the acid and the phosphorus go back into the chain. Turn voiding off')
})

