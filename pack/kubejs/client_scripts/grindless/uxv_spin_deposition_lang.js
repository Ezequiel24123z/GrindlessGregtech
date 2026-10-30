// priority: 1511
// Gregtech Grindless - names and tooltips of UXV's MTJ sputter cluster and oxide PLD chamber (startup_scripts/grindless/uxv/spin_deposition.js; package UXV-A4):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each sputter and PLD recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.mtj_sputter_cluster', 'MTJ Sputter Cluster', 'Clúster de pulverización MTJ'],
        ['block.gtceu.oxide_pld_chamber', 'Oxide PLD Chamber', 'Cámara PLD de óxidos'],
        ['gtceu.mtj_sputtering', 'MTJ Sputtering', 'Pulverización MTJ'],
        ['gtceu.pulsed_laser_deposition', 'Pulsed Laser Deposition', 'Deposición por láser pulsado'],

        ['grindless.machine.mtj_sputter_cluster.tooltip.0',
            '\u00a77Sputters the MTJ, MRAM, SAF and STNO spintronic stacks.',
            '\u00a77Pulveriza las pilas espintrónicas MTJ, MRAM, SAF y STNO.'],
        ['grindless.machine.oxide_pld_chamber.tooltip.0',
            '\u00a77Pulsed laser deposition of oxide electrode, BiFeO3 and ME switch films.',
            '\u00a77Deposición por láser pulsado de electrodo de óxido, BiFeO3 e interruptor ME.'],

        ['emi.grindless.info.mtj_sputter_cluster.0',
            'Four magnetron guns sit on the diagonals of an octagonal hub and a load lock feeds the wafers. It needs two UIV energy hatches and a 6N helium-cooled controller.',
            'Cuatro cañones magnetrón se sitúan en las diagonales de un núcleo octogonal y una esclusa de carga alimenta las obleas. Necesita dos escotillas de energía UIV y un controlador refrigerado con helio 6N.'],
        ['emi.grindless.info.mtj_sputter_cluster.1',
            'Nothing is wasted: the spent CoFeB target goes to the powder-bed re-press, the Heusler and ruthenium overspray comes out as powder, and the argon is recovered.',
            'Nada se desperdicia: el blanco de CoFeB gastado va a la re-prensa de lecho de polvo, el exceso de Heusler y rutenio sale como polvo y el argón se recupera.'],
        ['emi.grindless.info.oxide_pld_chamber.0',
            'A KrF excimer laser ablates a bonded oxide target and the plume lands on a heated substrate in oxygen. The laser is built on an assembly line and kept in the chamber, not consumed.',
            'Un láser excímero KrF ablaciona un blanco de óxido unido y la pluma cae sobre un sustrato calentado en oxígeno. El láser se construye en una línea de ensamblaje y se queda en la cámara, no se consume.'],
        ['emi.grindless.info.oxide_pld_chamber.1',
            'The volatile ruthenium tetroxide and the bismuth-rich BFO fume are collected, never vented: they feed the extraction cascade.',
            'El tetróxido de rutenio volátil y el humo de BFO rico en bismuto se recogen y nunca se ventilan: alimentan la cascada de extracción.'],

        ['gtceu.recipe.grindless_mtj_sputtering.mtj_stack',
            'Circuit 1: CoFeB, MgO, a Ta seed and ruthenium are sputtered on an H-terminated Si-28 wafer; the CoFeB target comes out spent.',
            'Circuito 1: CoFeB, MgO, una semilla de Ta y rutenio se pulverizan sobre una oblea de Si-28 terminada en H; el blanco de CoFeB sale gastado.'],
        ['gtceu.recipe.grindless_mtj_sputtering.mram_stack',
            'Circuit 2: a Heusler layer and an MgO barrier make the MRAM stack; the Heusler overspray returns as powder.',
            'Circuito 2: una capa Heusler y una barrera de MgO forman la pila MRAM; el exceso de Heusler vuelve como polvo.'],
        ['gtceu.recipe.grindless_mtj_sputtering.saf_track',
            'Circuit 3: the synthetic antiferromagnet target set is sputtered into a racetrack stack; the ruthenium overspray returns as powder.',
            'Circuito 3: el juego de blancos del antiferromagneto sintético se pulveriza en una pila de pista; el exceso de rutenio vuelve como polvo.'],
        ['gtceu.recipe.grindless_mtj_sputtering.stno_stack',
            'Circuit 4: a Heusler free layer, an MgO barrier and a Ta seed make the spin-torque oscillator stack.',
            'Circuito 4: una capa libre Heusler, una barrera de MgO y una semilla de Ta forman la pila del oscilador de par de espín.'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.srruo3_electrode',
            'Circuit 1: the KrF laser ablates a SrRuO3 target onto a DyScO3 substrate in oxygen; the volatile RuO4 is collected.',
            'Circuito 1: el láser KrF ablaciona un blanco de SrRuO3 sobre un sustrato de DyScO3 en oxígeno; el RuO4 volátil se recoge.'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.bfo_film',
            'Circuit 2: a La-doped BiFeO3 film grows on the electrode; the bismuth-rich plume condenses as BFO fume.',
            'Circuito 2: una película de BiFeO3 dopada con La crece sobre el electrodo; la pluma rica en bismuto se condensa como humo de BFO.'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.me_switch',
            'Circuit 3: a CoFe layer on the multiferroic film makes the magnetoelectric switch; the target offcut is cobalt dust.',
            'Circuito 3: una capa de CoFe sobre la película multiferroica forma el interruptor magnetoeléctrico; el recorte del blanco es polvo de cobalto.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['cofe_target', 'CoFe Target', 'Blanco de CoFe', 'Cobalt and iron plate on a copper backing, indium-bonded.', 'Placa de cobalto y hierro sobre un respaldo de cobre, unida con indio.', 'Sputtered onto the multiferroic film in the PLD chamber (circuit 3).', 'Se deposita sobre la película multiferroica en la cámara PLD (circuito 3).'],
        ['bfo_film_wafer', 'BiFeO3 Film Wafer', 'Oblea con película de BiFeO3', 'A multiferroic film on an oxide electrode.', 'Una película multiferroica sobre un electrodo de óxido.', 'Gets its CoFe layer in the PLD chamber (circuit 3).', 'Recibe su capa de CoFe en la cámara PLD (circuito 3).'],
        ['krf_discharge_tube_blank', 'KrF Discharge Tube Blank', 'Tubo de descarga KrF en bruto', 'Two VUV CaF2 windows and cupronickel electrodes in a tungsten steel body.', 'Dos ventanas de CaF2 VUV y electrodos de cuproníquel en un cuerpo de acero de tungsteno.', 'Filled and conditioned in a chemical reactor.', 'Se llena y acondiciona en un reactor químico.'],
        ['krf_discharge_tube', 'KrF Discharge Tube', 'Tubo de descarga KrF', 'Filled with krypton and fluorine and conditioned by a test discharge.', 'Lleno de criptón y flúor y acondicionado con una descarga de prueba.', 'The heart of the KrF excimer laser.', 'El corazón del láser excímero KrF.'],
        ['pulsed_power_head', 'Pulsed Power Head', 'Cabezal de potencia pulsada', 'Capacitor banks and a field generator that switch nanosecond pulses.', 'Bancos de condensadores y un generador de campo que conmutan pulsos de nanosegundos.', 'Drives the discharge tube of the KrF excimer laser.', 'Alimenta el tubo de descarga del láser excímero KrF.']
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
