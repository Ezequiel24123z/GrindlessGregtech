// priority: 1524
// Gregtech Grindless - names and tooltips of UXV's SHeQUID works and MNT collider (startup_scripts/grindless/uxv/shequid_mnt.js; package UXV-A6):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each SHeQUID, MNT and synchrotron recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.shequid_works', 'SHeQUID Works', 'Taller SHeQUID'],
        ['block.gtceu.mnt_collider', 'MNT Collider', 'Colisionador MNT'],
        ['gtceu.shequid_assembly', 'SHeQUID Assembly', 'Ensamblaje SHeQUID'],
        ['gtceu.multinucleon_transfer', 'Multinucleon Transfer', 'Transferencia multinucleónica'],

        ['grindless.machine.shequid_works.tooltip.0',
            '\u00a77Makes the weak-link cell and the SHeQUID gyro in a He-II bath.',
            '\u00a77Fabrica la celda de enlace débil y el giroscopio SHeQUID en un baño de He-II.'],
        ['grindless.machine.mnt_collider.tooltip.0',
            '\u00a77A beamline that makes island nuclides by multinucleon transfer.',
            '\u00a77Línea de haz que fabrica nucleidos de la isla por transferencia de nucleones.'],

        ['emi.grindless.info.shequid_works.0',
            'Two weak links in a superconducting loop make a SQUID; the SHeQUID reads it with superfluid helium. It needs two UIV energy hatches and a 6N helium-cooled controller.',
            'Dos enlaces débiles en un bucle superconductor forman un SQUID; el SHeQUID lo lee con helio superfluido. Necesita dos escotillas de energía UIV y un controlador refrigerado con helio 6N.'],
        ['emi.grindless.info.shequid_works.1',
            'Nothing is vented: the warmed He-II returns to the superfluid helium plant, where a heat flush recovers it and its helium-3.',
            'Nada se ventila: el He-II templado vuelve a la planta de helio superfluido, donde un lavado térmico lo recupera junto con su helio-3.'],
        ['emi.grindless.info.mnt_collider.0',
            'A U-238 beam strikes a Cm-248 target near the Coulomb barrier; the recoils are stopped in a gas cell, thermalised in 6N helium and sorted by a time-of-flight spectrometer. It needs two UIV energy hatches.',
            'Un haz de U-238 golpea un blanco de Cm-248 cerca de la barrera de Coulomb; los retrocesos se frenan en una celda de gas, se termalizan en helio 6N y se ordenan con un espectrómetro de tiempo de vuelo. Necesita dos escotillas de energía UIV.'],
        ['emi.grindless.info.mnt_collider.1',
            'The spent actinide target goes to waste retrieval and the light fragments to actinide partitioning; the helium is recovered.',
            'El blanco de actínido gastado va a la recuperación de residuos y los fragmentos ligeros a la partición de actínidos; el helio se recupera.'],

        ['gtceu.recipe.grindless_shequid_assembly.weak_link_cell',
            'Circuit 1: a 70 nm aperture array is bonded into a titanium cell body as a weak link.',
            'Circuito 1: una matriz de aperturas de 70 nm se une a un cuerpo de celda de titanio como enlace débil.'],
        ['gtceu.recipe.grindless_shequid_assembly.shequid_gyro',
            'Circuit 2: two weak-link cells and an MTJ die readout in a He-II bath; the warmed bath is returned.',
            'Circuito 2: dos celdas de enlace débil y una lectura con troquel MTJ en un baño de He-II; el baño templado se devuelve.'],
        ['gtceu.recipe.grindless_multinucleon_transfer.collision',
            'Circuit 1: a U-238 beam on a Cm-248 target; the gas stopping cell is kept, the spent target comes back and the recoils leave as gas.',
            'Circuito 1: un haz de U-238 sobre un blanco de Cm-248; la celda de frenado de gas se conserva, el blanco gastado vuelve y los retrocesos salen como gas.'],
        ['gtceu.recipe.grindless_multinucleon_transfer.gas_catcher',
            'Circuit 2: the recoil gas is thermalised in 6N helium inside the stopping cell; 10 mB of buffer is lost.',
            'Circuito 2: el gas de retroceso se termaliza en helio 6N dentro de la celda de frenado; se pierden 10 mB de tampón.'],
        ['gtceu.recipe.grindless_multinucleon_transfer.mr_tof',
            'Circuit 3: the spectrometer separates the island nuclide; the light fragments leave as gas and the helium is recovered.',
            'Circuito 3: el espectrómetro separa el nucleido de la isla; los fragmentos ligeros salen como gas y el helio se recupera.'],
        ['gtceu.recipe.grindless_multinucleon_transfer.island_chart',
            'Circuit 4: sixteen island nuclides are recorded on a data module as the island chart.',
            'Circuito 4: dieciséis nucleidos de la isla se registran en un módulo de datos como la carta de la isla.'],
        ['gtceu.recipe.grindless_synchrotron.u238_beam_charge',
            'Circuit 8: the ion-source charge is accelerated to a U-238 beam charge; liquid helium cools the injector and returns as gas.',
            'Circuito 8: la carga de la fuente de iones se acelera hasta una carga de haz de U-238; el helio líquido enfría el inyector y vuelve como gas.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['weak_link_cell', 'Weak-Link Cell', 'Celda de enlace débil', 'A 70 nm aperture array bonded into a titanium cell body.', 'Una matriz de aperturas de 70 nm unida a un cuerpo de celda de titanio.', 'Two of them make a SHeQUID gyro in the SHeQUID works (circuit 2).', 'Dos de ellas forman un giroscopio SHeQUID en el taller SHeQUID (circuito 2).'],
        ['mnt_thermal_ions', 'MNT Thermal Ions', 'Iones térmicos MNT', 'Recoil nuclei stopped and thermalised in 6N helium.', 'Núcleos de retroceso frenados y termalizados en helio 6N.', 'Sorted in the MNT collider\'s MR-TOF (circuit 3).', 'Se ordenan en el MR-TOF del colisionador MNT (circuito 3).']
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
