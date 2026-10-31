// Gregtech Grindless - names and tooltips of OpV's replication chain (startup_scripts/grindless/opv/replication.js; package OpV-R2):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's items
//   material.grindless.<id>                            the package's fluid
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controller
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.debris_harvester', 'Debris Harvester', 'Cosechadora de escombros'],
        ['gtceu.debris_harvesting', 'Debris Harvesting', 'Cosecha de escombros'],
        ['grindless.machine.debris_harvester.tooltip.0',
            '\u00a77Gathers bulge debris around Terzan 5 and sorts it into fractions.',
            '\u00a77Recoge escombros del bulbo en Terzan 5 y los separa en fracciones.'],

        ['item.grindless.metal_debris_fraction', 'Metal Debris Fraction', 'Fracción metálica de escombros'],
        ['tooltip.grindless.metal_debris_fraction.0', 'The iron and nickel grains sorted out of bulge debris.', 'Los granos de hierro y níquel separados de los escombros del bulbo.'],
        ['tooltip.grindless.metal_debris_fraction.1', 'Refined through carbonyl in the replication refinery.', 'Se refina como carbonilo en la refinería de replicación.'],

        ['emi.grindless.info.debris_harvester.0',
            'The harvester runs only at Terzan 5 core. Its first run needs no input: a sensor head is its only tool and is never used up, so the first debris is gathered without any supply from home. Harvesting debris from a bulge is named fiction.',
            'La cosechadora funciona solo en el núcleo de Terzan 5. Su primera pasada no necesita entrada: un cabezal sensor es su única herramienta y no se gasta, así que los primeros escombros se recogen sin suministro desde casa. Cosechar escombros de un bulbo es ficción declarada.'],
        ['emi.grindless.info.debris_harvester.1',
            'Circuit 2 sorts four bulge debris into two metal and two silicate fractions; the refinery turns them into feedstock and casings.',
            'El circuito 2 separa cuatro escombros del bulbo en dos fracciones metálicas y dos silicatadas; la refinería las convierte en materia prima y carcasas.'],

        ['gtceu.recipe.grindless_debris_harvesting.bulge_debris_harvest',
            'Circuit 1: four bulge debris gathered with a sensor head that is not consumed.',
            'Circuito 1: cuatro escombros del bulbo recogidos con un cabezal sensor que no se consume.'],
        ['gtceu.recipe.grindless_debris_harvesting.debris_fractions',
            'Circuit 2: four bulge debris sorted into two metal and two silicate fractions.',
            'Circuito 2: cuatro escombros del bulbo separados en dos fracciones metálicas y dos silicatadas.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
