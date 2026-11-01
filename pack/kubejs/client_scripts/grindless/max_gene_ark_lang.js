// priority: 6737
// Gregtech Grindless - names and tooltips of MAX's gene ark (startup_scripts/grindless/max/gene_ark.js; package MAX-B4):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package that has a data key or a step name
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.gene_ark', 'Gene Ark'],
        ['gtceu.genome_archiving', 'Genome Archiving'],
        ['grindless.machine.gene_ark.tooltip.0', '\u00a77Seals genomes and living cells into a cold archive that can reboot life.'],
        ['emi.grindless.info.gene_ark.0', 'A sealed cold vault holds the genome archive: four encapsulated genome libraries, a Rydberg logic array as its index and a vitrified cell capsule that can boot it, in a superfluid He-3 bath. Circuit 2 copies an archive with four oligo pools.'],
        ['emi.grindless.info.gene_ark.1', 'Its parts come from older machines: oligo pools and genome cassettes (biofoundry), the organoid extract (organoid lab), the ark genome set (ark biosphere), the xeno genome set (xenobotany), the hardened cell (vent bioreactor, xenobiochem plant, radiotrophic vat) and the aerogel capsules (aerogel works).'],
        ['gtceu.recipe.grindless_genome_archiving.genome_archive', 'Circuit 1: four encapsulated genome libraries, a Rydberg logic array and a vitrified cell capsule are sealed in a superfluid He-3 bath into a genome archive.'],
        ['gtceu.recipe.grindless_genome_archiving.genome_copy', 'Circuit 2: an archive kept as a template is copied by PCR from four oligo pools and a genome library into a new archive.'],
        ['gtceu.recipe.grindless_biofoundry.synthetic_oligo_pool', 'Synthetic oligo pool'],
        ['gtceu.recipe.grindless_biofoundry.syn3_genome_cassettes', 'Minimal genome cassettes'],
        ['gtceu.recipe.grindless_xenobotany.xeno_genome_set', 'Re-grow the genome set in Proxima light'],
        ['gtceu.recipe.grindless_xenobiochemistry.transplanted_minimal_cell', 'Transplant the synthetic genome'],
        ['gtceu.recipe.grindless_radiotrophic.hardened_minimal_cell', 'Harden the minimal cell']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
