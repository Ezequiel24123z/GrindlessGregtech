// priority: 3250
// Gregtech Grindless - names and tooltips of Cygnus X-1's ergosphere probe bay and Penrose engine (startup_scripts/grindless/uiv/cygnus.js; package UIV-B4):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe, and of each row the package appends to an older EMI table
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//   emi.grindless.info.*                               the info pages
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.ergosphere_probe_bay', 'Ergosphere Probe Bay', 'Bahía de sondas de ergosfera'],
        ['block.gtceu.penrose_engine', 'Penrose Engine', 'Motor de Penrose'],
        ['gtceu.ergosphere_probing', 'Ergosphere Probing', 'Sondeo de ergosfera'],
        ['gtceu.penrose_extraction', 'Penrose Extraction', 'Extracción de Penrose'],

        ['grindless.machine.ergosphere_probe_bay.tooltip.0', '\u00a77Drops probes through the ergosphere and loads the Penrose sleds.', '\u00a77Lanza sondas por la ergosfera y carga los trineos de Penrose.'],
        ['grindless.machine.penrose_engine.tooltip.0', '\u00a77Drops a split-charge sled into the ergosphere to harvest energy.', '\u00a77Deja caer un trineo de carga dividida en la ergosfera para obtener energía.'],
        ['grindless.machine.penrose_engine.tooltip.1', 'Needs 2 UIV 4A or 1 UIV 16A wireless dynamo hatch.', 'Necesita 2 dinamos inalámbricas UIV 4A o 1 de 16A.'],

        ['emi.grindless.info.ergosphere_probe_bay.0',
            'The probe bay drops ergosphere probes through the spacetime of Cygnus X-1 (spin above 0.9985, 21.2 solar masses) and writes the Kerr metric on a 5D data crystal, which is kept.',
            'La bahía de sondas lanza sondas de ergosfera por el espacio-tiempo de Cygnus X-1 (espín superior a 0,9985, 21,2 masas solares) y escribe la métrica de Kerr en un cristal de datos 5D, que se conserva.'],
        ['emi.grindless.info.ergosphere_probe_bay.1',
            'It also loads the sleds. A new sled takes a hull, a charge and a compacted waste canister; the half-sled the engine recovers is refitted with a fresh canister and charge.',
            'También carga los trineos. Un trineo nuevo lleva un casco, una carga y un bidón de residuos compactado; el medio trineo que recupera el motor se reacondiciona con un bidón y una carga nuevos.'],
        ['emi.grindless.info.ergosphere_probe_bay.2',
            'Circuit 1: probe. Circuit 2: new sled. Circuit 3: refit of a half-sled. Circuit 4: sled hull.',
            'Circuito 1: sonda. Circuito 2: trineo nuevo. Circuito 3: reacondicionado de un medio trineo. Circuito 4: casco de trineo.'],
        ['emi.grindless.info.penrose_engine.0',
            'The Penrose engine drops a split-charge sled into the ergosphere. One half falls into the hole; the other comes back with more energy than it left with (Penrose, 1969; at best about 20.7 %).',
            'El motor de Penrose deja caer un trineo de carga dividida en la ergosfera. Una mitad cae al agujero; la otra vuelve con más energía de la que salió (Penrose, 1969; como máximo un 20,7 %).'],
        ['emi.grindless.info.penrose_engine.1',
            'A run gives 268,435,456 EU/t (8 A at UIV) for 2,400 ticks through wireless dynamo hatches: two UIV 4A or one UIV 16A. The Kerr chart is kept; the recovered half-sled is refitted in the probe bay.',
            'Una ejecución da 268 435 456 EU/t (8 A en UIV) durante 2 400 ticks por cámaras de dinamo inalámbricas: dos UIV de 4 A o una UIV de 16 A. La carta de Kerr se conserva; el medio trineo recuperado se reacondiciona en la bahía de sondas.'],
        ['emi.grindless.info.uiv_cygnus_sled.0',
            'Waste goes in a synroc liner, then a megabar press compacts the filled canister. The canister is the sled\'s ballast; the sled hull is plated; the ringdown record is probe data read as gravitational waves on Ganymede.',
            'Los residuos van en un forro de synroc y la prensa de megabares compacta el bidón lleno. El bidón es el lastre del trineo; el casco del trineo es blindado; el registro de ringdown son datos de sonda leídos como ondas gravitacionales en Ganimedes.'],

        ['gtceu.recipe.grindless_ergosphere_probing.kerr_probe', 'Circuit 1: a probe dropped through the ergosphere writes the Kerr metric on the data crystal (kept)', 'Circuito 1: una sonda lanzada por la ergosfera escribe la métrica de Kerr en el cristal de datos (se conserva)'],
        ['gtceu.recipe.grindless_ergosphere_probing.split_sled', 'Circuit 2: a hull, a charge and a compacted waste canister loaded into a split-charge sled', 'Circuito 2: un casco, una carga y un bidón de residuos compactado cargados en un trineo de carga dividida'],
        ['gtceu.recipe.grindless_ergosphere_probing.refit_sled', 'Circuit 3: the recovered half-sled refitted with a fresh canister and charge', 'Circuito 3: el medio trineo recuperado reacondicionado con un bidón y una carga nuevos'],
        ['gtceu.recipe.grindless_ergosphere_probing.sled_hull', 'Circuit 4: a sled hull plated from RHEA and tungsten-steel plates', 'Circuito 4: un casco de trineo blindado con placas de RHEA y de acero de tungsteno'],
        ['gtceu.recipe.grindless_penrose_extraction.penrose_drop', 'Circuit 1: the sled dropped into the ergosphere gives 268,435,456 EU/t for 2,400 ticks; the Kerr chart is kept', 'Circuito 1: el trineo lanzado a la ergosfera da 268 435 456 EU/t durante 2 400 ticks; la carta de Kerr se conserva'],

        ['gtceu.recipe.grindless_hot_cell.waste_canister_fill', 'Mode 15: radioactive waste sealed into a synroc liner', 'Modo 15: residuos radiactivos sellados en un forro de synroc'],
        ['gtceu.recipe.grindless_megabar.canister_compaction', 'Circuit 5: a filled waste canister compacted under the anvil into the sled\'s ballast', 'Circuito 5: un bidón de residuos lleno compactado bajo el yunque como lastre del trineo']
    ]

    // [name, en, es, tooltip 0 en, tooltip 0 es, tooltip 1 en, tooltip 1 es]
    var ITEMS = [
        ['kerr_ringdown_record', 'Kerr Ringdown Record', 'Registro de ringdown de Kerr', 'Kerr probe data read as gravitational waves.', 'Datos de la sonda de Kerr leídos como ondas gravitacionales.', 'Correlated at the event horizon.', 'Se correlaciona en el horizonte de sucesos.'],
        ['synroc_liner', 'Synroc Liner', 'Forro de synroc', 'A cast synroc shell for waste.', 'Una carcasa de synroc moldeada para residuos.', 'Filled in the hot cell.', 'Se llena en la celda caliente.'],
        ['filled_waste_canister', 'Filled Waste Canister', 'Bidón de residuos lleno', 'Radioactive waste sealed in synroc.', 'Residuos radiactivos sellados en synroc.', 'Compacted in the megabar press.', 'Se compacta en la prensa de megabares.'],
        ['compacted_waste_canister', 'Compacted Waste Canister', 'Bidón de residuos compactado', 'Waste squeezed dense enough to ride a sled.', 'Residuos comprimidos lo bastante densos para ir en un trineo.', 'Ballast of a split-charge sled.', 'Lastre de un trineo de carga dividida.'],
        ['sled_hull', 'Sled Hull', 'Casco de trineo', 'A plated shell for the ergosphere drop.', 'Una carcasa blindada para la caída por la ergosfera.', 'Loaded in the ergosphere probe bay.', 'Se carga en la bahía de sondas de ergosfera.'],
        ['split_charge_sled', 'Split-Charge Sled', 'Trineo de carga dividida', 'Splits its charge in flight.', 'Divide su carga en vuelo.', 'Dropped in the Penrose engine.', 'Se lanza en el motor de Penrose.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
