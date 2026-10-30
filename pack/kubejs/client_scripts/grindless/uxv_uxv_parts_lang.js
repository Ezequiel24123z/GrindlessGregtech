// priority: 1451
// Gregtech Grindless - EMI lines of UXV's parts and part steps (server_scripts/grindless/uxv/uxv_parts.js and the three older tables; package UXV-A8):
//
//   gtceu.recipe.grindless_naquadria_magnets.<name>   magnet works c8 and c10
//   gtceu.recipe.grindless_magnet_winding.<name>      HTS magnet works c6
//   gtceu.recipe.grindless_coated_conductor.<name>    coated conductor line c4
// The item names are in uxv_foundation_lang.js. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_naquadria_magnets.tetrataenite_rotor',
            'Circuit 8: four tetrataenite laminations are stacked on a tungsten steel shaft and magnetised as the rotor.',
            'Circuito 8: cuatro láminas de tetrataenita se apilan sobre un eje de acero de wolframio y se magnetizan como rotor.'],
        ['gtceu.recipe.grindless_naquadria_magnets.multipole_encoder_ring',
            'Circuit 10: an encoder ring is mounted on a titanium carrier and magnetised in alternating poles.',
            'Circuito 10: un anillo de codificador se monta en un portador de titanio y se magnetiza con polos alternos.'],
        ['gtceu.recipe.grindless_magnet_winding.strand_stator',
            'Circuit 6: pasta strand wire is wound round tetrataenite laminations, potted in epoxy and cold-tested in the helium charge.',
            'Circuito 6: el hilo de pasta se bobina sobre láminas de tetrataenita, se encapsula en epoxi y se prueba en frío en la carga de helio.'],
        ['gtceu.recipe.grindless_coated_conductor.strand_tape',
            'Circuit 4: pasta strand wire is flattened and clad with copper foil as the stabiliser.',
            'Circuito 4: el hilo de pasta se aplana y se reviste con lámina de cobre como estabilizador.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
