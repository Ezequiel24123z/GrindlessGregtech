// Gregtech Grindless - names and tooltips of OpV's Kugelblitz forge and Hawking collector, their three items and the EMI pages
// (startup_scripts/grindless/opv/kugelblitz.js; package OpV-D3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips (short: what it does, then what it accepts)
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's three items
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers; emi.grindless.info.hawking_drive.N the drive's
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.kugelblitz_forge', 'Kugelblitz Forge', 'Forja Kugelblitz'],
        ['block.gtceu.hawking_collector', 'Hawking Collector', 'Colector Hawking'],
        ['gtceu.kugelblitz_forming', 'Kugelblitz Forming', 'Formación de Kugelblitz'],
        ['gtceu.hawking_power', 'Hawking Power', 'Energía Hawking'],

        ['grindless.machine.kugelblitz_forge.tooltip.0',
            '\u00a77Focuses gamma pulses into a Kugelblitz. The hole does not spin.',
            '\u00a77Concentra pulsos gamma en un Kugelblitz. El agujero no gira.'],
        ['grindless.machine.kugelblitz_forge.tooltip.1',
            '\u00a77A failed seed (5%) is thrown into Cygnus X-1.',
            '\u00a77Una semilla fallida (5%) se arroja a Cygnus X-1.'],
        ['grindless.machine.hawking_collector.tooltip.0',
            '\u00a77Feeds a Kugelblitz core and collects its Hawking radiation. The hole does not spin.',
            '\u00a77Alimenta un núcleo Kugelblitz y recoge su radiación de Hawking. El agujero no gira.'],
        ['grindless.machine.hawking_collector.tooltip.1',
            '\u00a77Burns stable exotic matter or stellar plasma; the core wears slowly.',
            '\u00a77Quema materia exótica estable o plasma estelar; el núcleo se gasta despacio.'],
        ['grindless.machine.hawking_collector.tooltip.2',
            '\u00a77OpV dynamo hatches: two 1 A or one 4 A.',
            '\u00a77Hatches dínamo OpV: dos de 1 A o uno de 4 A.'],

        ['item.grindless.gamma_pump_charge', 'Gamma Pump Charge', 'Carga de bombeo gamma'],
        ['tooltip.grindless.gamma_pump_charge.0', 'Positron annihilation stored in a gamma laser module as pump energy.', 'Aniquilación de positrones almacenada en un módulo láser gamma como energía de bombeo.'],
        ['tooltip.grindless.gamma_pump_charge.1', 'Four of them focus a Kugelblitz seed in the forge.', 'Cuatro de ellas enfocan una semilla Kugelblitz en la forja.'],
        ['item.grindless.kugelblitz_seed', 'Kugelblitz Seed', 'Semilla Kugelblitz'],
        ['tooltip.grindless.kugelblitz_seed.0', 'Gamma light focused inside a Schwarzschild radius, not yet held.', 'Luz gamma enfocada dentro de un radio de Schwarzschild, aún sin contener.'],
        ['tooltip.grindless.kugelblitz_seed.1', 'Charged with positrons and absorber tiles it becomes a core.', 'Con positrones y losetas absorbentes se convierte en un núcleo.'],
        ['item.grindless.evaporated_core_shell', 'Evaporated Core Shell', 'Cáscara de núcleo evaporado'],
        ['tooltip.grindless.evaporated_core_shell.0', 'The absorber shell a Kugelblitz core leaves when it has evaporated.', 'La cáscara absorbente que deja un núcleo Kugelblitz cuando se ha evaporado.'],
        ['tooltip.grindless.evaporated_core_shell.1', 'Feeds the forge again; half of the absorber tiles come back.', 'Vuelve a alimentar la forja; la mitad de las losetas absorbentes regresa.'],

        ['emi.grindless.info.kugelblitz_forge.0',
            'Gamma pulses pumped by positron annihilation are focused by Laue lenses and multilayer mirrors inside an FRC cartridge until their energy sits within a Schwarzschild radius (Crane & Westmoreland 2009 propose this; the forming is named fiction). It runs at Cygnus X-1 orbit and nowhere else, on up to two OpV energy hatches, and takes a parallel hatch. Circuits: 1 gamma pump charge, 2 seed, 3 core, 4 Hawking drive, 5 core from a spent shell.',
            'Los pulsos gamma bombeados por aniquilación de positrones se enfocan con lentes de Laue y espejos multicapa dentro de un cartucho FRC hasta que su energía cabe en un radio de Schwarzschild (lo proponen Crane y Westmoreland 2009; la formación es ficción declarada). Funciona en la órbita de Cygnus X-1 y en ningún otro sitio, con hasta dos hatches de energía OpV, y admite un hatch de paralelismo. Circuitos: 1 carga de bombeo gamma, 2 semilla, 3 núcleo, 4 propulsor Hawking, 5 núcleo desde una cáscara agotada.'],
        ['emi.grindless.info.kugelblitz_forge.1',
            'The hole never rotates, so there is no superradiance: it is a Schwarzschild hole, charged with positrons and held electrostatically in the absorber shell. A 10^9 kg hole has a lifetime of about 2,700 years (Hawking 1974; Page 1976). The lens and mirror wear 1/64 per seed; a failed seed (5%) is thrown into Cygnus X-1. The core feeds the Hawking collector and, with a mirror and a field-frozen plate, becomes a Hawking drive for the pathfinder. The spent shell of the collector feeds circuit 5.',
            'El agujero nunca rota, así que no hay superradiancia: es un agujero de Schwarzschild, cargado con positrones y contenido electrostáticamente en la cáscara absorbente. Un agujero de 10^9 kg dura unos 2.700 años (Hawking 1974; Page 1976). La lente y el espejo se gastan 1/64 por semilla; una semilla fallida (5%) se arroja a Cygnus X-1. El núcleo alimenta el colector Hawking y, con un espejo y una placa congelada en campo, se convierte en un propulsor Hawking para la sonda exploradora. La cáscara agotada del colector alimenta el circuito 5.'],
        ['emi.grindless.info.hawking_collector.0',
            'A non-spinning Kugelblitz core of about 10^-18 m swallows ordinary matter very slowly: feeding it stable exotic matter at nuclear density is the rate the machine is built for, and stellar plasma feeds at half power (the feed rate is named fiction). The core keeps its mass and the feed is the fuel, so no energy comes from nothing. It runs at Cygnus X-1 orbit and nowhere else.',
            'Un núcleo Kugelblitz sin rotación de unos 10^-18 m traga la materia ordinaria muy despacio: alimentarlo con materia exótica estable a densidad nuclear es el ritmo para el que se construyó la máquina, y el plasma estelar lo alimenta a media potencia (el ritmo de alimentación es ficción declarada). El núcleo conserva su masa y la alimentación es el combustible, así que no sale energía de la nada. Funciona en la órbita de Cygnus X-1 y en ningún otro sitio.'],
        ['emi.grindless.info.hawking_collector.1',
            'Circuit 1 burns 1 stable exotic matter for 2^30 EU/t during 2,400 ticks and wears the core 1/64; circuit 2 burns 4,000 mB stellar plasma for 2^29 EU/t during 1,200 ticks and wears it 1/32. Each run wears 1/8 of a gamma absorber tile. Power leaves through two OpV 1 A dynamo hatches or one 4 A. The spent core comes back as an evaporated core shell, which feeds the Kugelblitz forge (circuit 5).',
            'El circuito 1 quema 1 materia exótica estable a 2^30 EU/t durante 2.400 ticks y gasta el núcleo 1/64; el circuito 2 quema 4.000 mB de plasma estelar a 2^29 EU/t durante 1.200 ticks y lo gasta 1/32. Cada ejecución gasta 1/8 de una loseta absorbente gamma. La energía sale por dos hatches dínamo OpV de 1 A o uno de 4 A. El núcleo agotado vuelve como cáscara de núcleo evaporado, que alimenta la forja Kugelblitz (circuito 5).'],
        ['emi.grindless.info.hawking_drive.0',
            'A Kugelblitz core, a gamma mirror and a field-frozen plate, forged at Cygnus X-1: a drive that pushes on the light of an evaporating black hole. Stock for the pathfinder probe (R1).',
            'Un núcleo Kugelblitz, un espejo gamma y una placa congelada en campo, forjados en Cygnus X-1: un propulsor que empuja con la luz de un agujero negro que se evapora. Almacén para la sonda exploradora (R1).'],
        ['emi.grindless.info.hawking_drive.1',
            'Made only by the Kugelblitz forge (circuit 4). It brakes the pathfinder at Terzan 5.',
            'Solo lo hace la forja Kugelblitz (circuito 4). Frena la sonda exploradora en Terzan 5.'],

        ['gtceu.recipe.grindless_kugelblitz_forming.charge_gamma_pump',
            'Circuit 1: two dense positron cells charge a gamma laser module (1/8 worn) with annihilation pump energy.',
            'Circuito 1: dos celdas densas de positrones cargan un módulo láser gamma (1/8 de desgaste) con energía de bombeo de aniquilación.'],
        ['gtceu.recipe.grindless_kugelblitz_forming.focus_kugelblitz_seed',
            'Circuit 2: four pump charges focused through a Laue lens and a mirror (each worn 1/64) into an FRC cartridge; 5% of the seeds fail and are thrown into Cygnus X-1.',
            'Circuito 2: cuatro cargas de bombeo enfocadas con una lente de Laue y un espejo (cada uno con desgaste 1/64) en un cartucho FRC; el 5% de las semillas falla y se arroja a Cygnus X-1.'],
        ['gtceu.recipe.grindless_kugelblitz_forming.condense_kugelblitz_core',
            'Circuit 3: the seed charged with positron cartridges and held in an absorber shell: a Kugelblitz core.',
            'Circuito 3: la semilla cargada con cartuchos de positrones y contenida en una cáscara absorbente: un núcleo Kugelblitz.'],
        ['gtceu.recipe.grindless_kugelblitz_forming.forge_hawking_drive',
            'Circuit 4: a core, a multilayer mirror and a field-frozen plate make a Hawking drive.',
            'Circuito 4: un núcleo, un espejo multicapa y una placa congelada en campo forman un propulsor Hawking.'],
        ['gtceu.recipe.grindless_kugelblitz_forming.recondense_core_from_shell',
            'Circuit 5: a spent core shell stands in for half of the absorber tiles.',
            'Circuito 5: una cáscara de núcleo agotado sustituye a la mitad de las losetas absorbentes.'],
        ['gtceu.recipe.grindless_hawking_power.feed_exotic_matter',
            'Circuit 1: one stable exotic matter feeds the core, which wears 1/64 (an absorber tile 1/8); the spent core returns as a shell.',
            'Circuito 1: una materia exótica estable alimenta el núcleo, que se gasta 1/64 (una loseta absorbente 1/8); el núcleo agotado vuelve como cáscara.'],
        ['gtceu.recipe.grindless_hawking_power.feed_stellar_plasma',
            'Circuit 2: stellar plasma feeds the core at half power, which wears 1/32 (an absorber tile 1/8); the spent core returns as a shell.',
            'Circuito 2: el plasma estelar alimenta el núcleo a media potencia, que se gasta 1/32 (una loseta absorbente 1/8); el núcleo agotado vuelve como cáscara.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
