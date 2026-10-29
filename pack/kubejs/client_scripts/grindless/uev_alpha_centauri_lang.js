// priority: 5154
// Gregtech Grindless - names and tooltips of UEV's nebula collector, interstellar dust lab and pulsar timing station (startup_scripts/grindless/uev/alpha_centauri.js; package UEV-B2):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   emi.grindless.info.<machine>.0                                the EMI info page of each controller
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.nebula_collector', 'Nebula Collector', 'Colector de nebulosa'],
        ['gtceu.nebula_collection', 'Nebula Collection', 'Recolección de nebulosa'],
        ['block.gtceu.interstellar_dust_lab', 'Interstellar Dust Lab', 'Laboratorio de polvo interestelar'],
        ['gtceu.interstellar_dust_analysis', 'Interstellar Dust Analysis', 'Análisis de polvo interestelar'],
        ['block.gtceu.pulsar_timing_station', 'Pulsar Timing Station', 'Estación de cronometraje de púlsares'],
        ['gtceu.pulsar_timing', 'Pulsar Timing', 'Cronometraje de púlsares'],

        ['grindless.machine.nebula_collector.tooltip.0',
            'A magnetic scoop sweeps the interstellar medium. The yield is named fiction: a real scoop would gather a few atoms per cubic centimetre. Alpha Centauri orbit only.',
            'Un colector magnético barre el medio interestelar. El rendimiento es ficción declarada: un colector real recogería unos pocos átomos por centímetro cúbico. Solo en la órbita de Alfa Centauri.'],
        ['grindless.machine.nebula_collector.tooltip.1',
            'Circuit 1 interstellar gas (the superhydride scoop coil is never consumed; a little liquid helium cools it), 2 dust-laden aerogel.',
            'Circuito 1 gas interestelar (la bobina de superhidruro no se consume; un poco de helio líquido la enfría), 2 aerogel cargado de polvo.'],
        ['grindless.machine.nebula_collector.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch, an optional output hatch. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, una escotilla de entrada opcional, una escotilla de salida opcional. Acepta una escotilla de paralelos.'],

        ['grindless.machine.interstellar_dust_lab.tooltip.0',
            'Washes captured grains out of the aerogel, strips their silicate shell and reads the iron-60 record of a nearby supernova. Alpha Centauri orbit only.',
            'Lava los granos capturados del aerogel, les quita la cáscara de silicato y lee el registro de hierro-60 de una supernova cercana. Solo en la órbita de Alfa Centauri.'],
        ['grindless.machine.interstellar_dust_lab.tooltip.1',
            'Circuit 1 extract grains, 2 demineralise, 3 Fe-60 record (the sensor is not consumed), 4 silicate residue.',
            'Circuito 1 extraer granos, 2 desmineralizar, 3 registro de Fe-60 (el sensor no se consume), 4 residuo de silicato.'],
        ['grindless.machine.interstellar_dust_lab.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-2 input hatches, an optional output hatch. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, 1-2 escotillas de entrada, una escotilla de salida opcional. Acepta una escotilla de paralelos.'],

        ['grindless.machine.pulsar_timing_station.tooltip.0',
            'Times pulsars with a lobster-eye X-ray telescope and a nuclear clock, then fixes a navigation chart with the Fe-60 record. Alpha Centauri orbit only.',
            'Cronometra púlsares con un telescopio de rayos X de ojo de langosta y un reloj nuclear, y fija una carta de navegación con el registro de Fe-60. Solo en la órbita de Alfa Centauri.'],
        ['grindless.machine.pulsar_timing_station.tooltip.1',
            'Circuit 1 timing survey (the clock is not consumed), 2 pulsar navigation chart.',
            'Circuito 1 estudio de cronometraje (el reloj no se consume), 2 carta de navegación de púlsares.'],
        ['grindless.machine.pulsar_timing_station.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida. Acepta una escotilla de paralelos.'],

        ['emi.grindless.info.nebula_collector.0',
            'Works only in the Alpha Centauri orbit. Interstellar gas then goes to a chemical reactor (compression), the cryogenic plant (hydrogen-deuterium fraction, helium fraction, neon) and two distillation towers (deuterium, helium-3). The scoop yield is named fiction.',
            'Solo funciona en la órbita de Alfa Centauri. El gas interestelar pasa luego a un reactor químico (compresión), a la planta criogénica (fracción de hidrógeno-deuterio, fracción de helio, neón) y a dos torres de destilación (deuterio, helio-3). El rendimiento del colector es ficción declarada.'],
        ['emi.grindless.info.interstellar_dust_lab.0',
            'Works only in the Alpha Centauri orbit. Spent hydrofluoric acid leaves as silicon tetrafluoride and is neutralised with calcium hydroxide into fluorite; silicate residue is electrolysed into silicon, iron and magnesium.',
            'Solo funciona en la órbita de Alfa Centauri. El ácido fluorhídrico gastado sale como tetrafluoruro de silicio y se neutraliza con hidróxido de calcio hasta fluorita; el residuo de silicato se electroliza en silicio, hierro y magnesio.'],
        ['emi.grindless.info.pulsar_timing_station.0',
            'Works only in the Alpha Centauri orbit. Makes the pulsar navigation chart, needed later for UIV casing research.',
            'Solo funciona en la órbita de Alfa Centauri. Hace la carta de navegación de púlsares, necesaria más adelante para la investigación de carcasas UIV.'],

        ['gtceu.recipe.grindless_nebula_collection.interstellar_gas', 'Circuit 1: the scoop coil sweeps interstellar gas; the coil is not consumed', 'Circuito 1: la bobina barre gas interestelar; la bobina no se consume'],
        ['gtceu.recipe.grindless_nebula_collection.dust_laden_aerogel', 'Circuit 2: an aerogel tile is exposed to the stream and traps grains', 'Circuito 2: una baldosa de aerogel se expone al flujo y atrapa granos'],
        ['gtceu.recipe.grindless_interstellar_dust_analysis.extract_grains', 'Circuit 1: water washes the grains out of the aerogel; the silica goes to the silicon lines', 'Circuito 1: el agua lava los granos del aerogel; la sílice va a las líneas de silicio'],
        ['gtceu.recipe.grindless_interstellar_dust_analysis.demineralise_grains', 'Circuit 2: hydrofluoric acid strips the silicate shell; silicon tetrafluoride is neutralised elsewhere', 'Circuito 2: el ácido fluorhídrico quita la cáscara de silicato; el tetrafluoruro de silicio se neutraliza aparte'],
        ['gtceu.recipe.grindless_interstellar_dust_analysis.fe60_record', 'Circuit 3: the sensor reads the iron-60 record and is not consumed', 'Circuito 3: el sensor lee el registro de hierro-60 y no se consume'],
        ['gtceu.recipe.grindless_interstellar_dust_analysis.silicate_residue', 'Circuit 4: grains are washed down to a silicate residue for the electrolyzer', 'Circuito 4: los granos se lavan hasta un residuo de silicato para el electrolizador'],
        ['gtceu.recipe.grindless_pulsar_timing.timing_survey', 'Circuit 1: the MCP telescope and the nuclear clock time the pulsars; the clock is not consumed', 'Circuito 1: el telescopio MCP y el reloj nuclear cronometran los púlsares; el reloj no se consume'],
        ['gtceu.recipe.grindless_pulsar_timing.pulsar_navigation_chart', 'Circuit 2: timing data and the Fe-60 record fix a navigation chart', 'Circuito 2: los datos de cronometraje y el registro de Fe-60 fijan una carta de navegación']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['scoop_winding', 'Scoop Winding', 'Bobinado de colector', 'Superhydride wire wound on a plate former.', 'Hilo de superhidruro bobinado sobre un molde de placas.', 'Impregnated with epoxy in a chemical reactor.', 'Se impregna con epoxi en un reactor químico.'],
        ['impregnated_scoop_winding', 'Impregnated Scoop Winding', 'Bobinado de colector impregnado', 'A winding set solid in epoxy so it survives the field.', 'Un bobinado fijado con epoxi para resistir el campo.', 'Fitted with a UV field generator in the assembler (circuit 2).', 'Se monta con un generador de campo UV en el ensamblador (circuito 2).'],
        ['superhydride_scoop_coil', 'Superhydride Scoop Coil', 'Bobina colectora de superhidruro', 'A superconducting loop that funnels the interstellar medium.', 'Un lazo superconductor que canaliza el medio interestelar.', 'Never used up in the nebula collector. The yield is named fiction.', 'No se gasta en el colector de nebulosa. El rendimiento es ficción declarada.'],
        ['dust_laden_aerogel', 'Dust-laden Aerogel', 'Aerogel cargado de polvo', 'An aerogel tile that caught interstellar grains.', 'Una baldosa de aerogel que atrapó granos interestelares.', 'Washed in the interstellar dust lab.', 'Se lava en el laboratorio de polvo interestelar.'],
        ['extracted_grains', 'Extracted Grains', 'Granos extraídos', 'Grains washed out of the aerogel.', 'Granos lavados del aerogel.', 'Demineralised or reduced to residue.', 'Se desmineralizan o se reducen a residuo.'],
        ['demineralised_grains', 'Demineralised Grains', 'Granos desmineralizados', 'Grains with the silicate shell stripped off.', 'Granos sin la cáscara de silicato.', 'Their iron-60 is read by a sensor.', 'Un sensor lee su hierro-60.'],
        ['fe60_record', 'Fe-60 Record', 'Registro de Fe-60', 'A trace of a supernova that exploded nearby.', 'Un rastro de una supernova que estalló cerca.', 'Fixes the pulsar navigation chart.', 'Fija la carta de navegación de púlsares.'],
        ['silicate_residue', 'Silicate Residue', 'Residuo de silicato', 'What is left of the grain shells.', 'Lo que queda de las cáscaras de los granos.', 'Electrolysed into silicon, iron and magnesium.', 'Se electroliza en silicio, hierro y magnesio.'],
        ['pulsar_timing_data', 'Pulsar Timing Data', 'Datos de cronometraje de púlsares', 'Arrival times of pulsar pulses.', 'Tiempos de llegada de los pulsos de los púlsares.', 'Combined with the Fe-60 record into a chart.', 'Se combinan con el registro de Fe-60 en una carta.'],
        ['alpha_coronal_field_map', 'Alpha Centauri Coronal Field Map', 'Mapa del campo coronal de Alfa Centauri', 'Mapped by a probe skimming Alpha Centauri A.', 'Cartografiado por una sonda que roza Alfa Centauri A.', 'Kept by the Alpha Centauri swarm station.', 'La conserva la estación de enjambre de Alfa Centauri.'],
        ['teos_flask', 'TEOS Flask', 'Frasco de TEOS', 'Tetraethyl orthosilicate, made from silicon tetrachloride and ethanol.', 'Ortosilicato de tetraetilo, hecho de tetracloruro de silicio y etanol.', 'The hydrochloric acid goes to its users.', 'El ácido clorhídrico va a quienes lo usan.'],
        ['silica_sol', 'Silica Sol', 'Sol de sílice', 'TEOS hydrolysed in water.', 'TEOS hidrolizado en agua.', 'Gels with ammonia.', 'Gelifica con amoníaco.'],
        ['silica_wet_gel', 'Silica Wet Gel', 'Gel húmedo de sílice', 'A gel soaked in ethanol.', 'Un gel empapado en etanol.', 'The ethanol is recycled.', 'El etanol se recicla.'],
        ['silica_aged_gel', 'Silica Aged Gel', 'Gel de sílice envejecido', 'A stronger gel network.', 'Una red de gel más fuerte.', 'Dried with supercritical carbon dioxide.', 'Se seca con dióxido de carbono supercrítico.']
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
