// priority: 10000
// Gregtech Grindless - EMI info of the EV metal mixture separation row (ev/metal_mixture.js). Names in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.metal_mixture_separation.0', "Metal mixture dust is the 9.25 % by-product of centrifuged stone dust. The EV centrifuge (900 EU/t) separates 1 of it into 1 small dust each of hematite, bauxite, pyrolusite, barite and chromite.")
    add('emi.grindless.info.metal_mixture_separation.1', "Each small dust goes on to its ore's usual line. The barite is electrolyzed into barium, which LuV's ZBLAN takes. There is no ilmenite: titanium comes only from the Moon.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.metal_mixture_separation.0', "El polvo de mezcla de metales es el subproducto (9,25 %) del polvo de piedra centrifugado. La centrifugadora EV (900 EU/t) separa 1 en 1 polvo pequeño de hematita, bauxita, pirolusita, barita y cromita.")
    add('emi.grindless.info.metal_mixture_separation.1', "Cada polvo pequeño sigue a la línea habitual de su mena. La barita se electroliza en bario, que usa el ZBLAN de LuV. No hay ilmenita: el titanio solo viene de la Luna.")
})
