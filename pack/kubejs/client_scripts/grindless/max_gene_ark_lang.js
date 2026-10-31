// Gregtech Grindless - names and tooltips of MAX's gene ark (startup_scripts/grindless/max/gene_ark.js; package MAX-B4):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package that has a data key or a step name
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.gene_ark', 'Gene Ark', 'Arca g\u00e9nica'],
        ['gtceu.genome_archiving', 'Genome Archiving', 'Archivo de genomas'],
        ['grindless.machine.gene_ark.tooltip.0', '\u00a77Seals genome libraries and living cells into a cold archive that can reboot life.', '\u00a77Sella bibliotecas de genomas y c\u00e9lulas vivas en un archivo fr\u00edo capaz de reiniciar la vida.'],
        ['emi.grindless.info.gene_ark.0', 'A sealed cold vault holds the genome archive: four encapsulated genome libraries, a Rydberg logic array as its index and a vitrified cell capsule that can boot it, in a superfluid He-3 bath. Circuit 2 copies an archive with four oligo pools.', 'Una b\u00f3veda fr\u00eda sellada guarda el archivo de genomas: cuatro bibliotecas de genomas encapsuladas, una matriz l\u00f3gica de Rydberg como \u00edndice y una c\u00e1psula celular vitrificada que puede arrancarlo, en un ba\u00f1o de He-3 superfluido. El circuito 2 copia un archivo con cuatro reservas de oligos.'],
        ['emi.grindless.info.gene_ark.1', 'Its parts come from older machines: oligo pools and genome cassettes (biofoundry), the organoid extract (organoid lab), the ark genome set (ark biosphere), the xeno genome set (xenobotany), the hardened cell (vent bioreactor, xenobiochem plant, radiotrophic vat) and the aerogel capsules (aerogel works).', 'Sus piezas vienen de m\u00e1quinas anteriores: reservas de oligos y casetes de genoma (biofundici\u00f3n), el extracto de organoide (laboratorio de organoides), el conjunto gen\u00e9tico del arca (biosfera arca), el conjunto gen\u00e9tico xeno (invernadero xenobot\u00e1nico), la c\u00e9lula endurecida (biorreactor de ventilas, planta xenobioqu\u00edmica, cuba radiotr\u00f3fica) y las c\u00e1psulas de aerogel (taller de aerogel).'],
        ['gtceu.recipe.grindless_genome_archiving.genome_archive', 'Circuit 1: four encapsulated genome libraries, a Rydberg logic array and a vitrified cell capsule are sealed in a superfluid He-3 bath into a genome archive.', 'Circuito 1: cuatro bibliotecas de genomas encapsuladas, una matriz l\u00f3gica de Rydberg y una c\u00e1psula celular vitrificada se sellan en un ba\u00f1o de He-3 superfluido como un archivo de genomas.'],
        ['gtceu.recipe.grindless_genome_archiving.genome_copy', 'Circuit 2: an archive is copied by PCR from four oligo pools into two archives.', 'Circuito 2: un archivo se copia por PCR a partir de cuatro reservas de oligos y da dos archivos.'],
        ['gtceu.recipe.grindless_biofoundry.synthetic_oligo_pool', 'Synthetic oligo pool', 'Reserva de oligos sint\u00e9ticos'],
        ['gtceu.recipe.grindless_biofoundry.syn3_genome_cassettes', 'Minimal genome cassettes', 'Casetes de genoma m\u00ednimo'],
        ['gtceu.recipe.grindless_xenobotany.xeno_genome_set', 'Re-grow the genome set in Proxima light', 'Recultivo del conjunto gen\u00e9tico con luz de Pr\u00f3xima'],
        ['gtceu.recipe.grindless_xenobiochemistry.transplanted_minimal_cell', 'Transplant the synthetic genome', 'Trasplante del genoma sint\u00e9tico'],
        ['gtceu.recipe.grindless_radiotrophic.hardened_minimal_cell', 'Harden the minimal cell', 'Endurecimiento de la c\u00e9lula m\u00ednima']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
