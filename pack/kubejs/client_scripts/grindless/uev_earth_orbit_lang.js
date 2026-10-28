// Gregtech Grindless - names and tooltips of UEV's quantum gas lab and entanglement station (startup_scripts/grindless/uev/earth_orbit.js; package UEV-A8):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.quantum_gas_lab', 'Quantum Gas Lab', 'Laboratorio de gases cuánticos'],
        ['gtceu.quantum_degenerate_gas', 'Quantum Degenerate Gas', 'Gas cuántico degenerado'],
        ['block.gtceu.entanglement_station', 'Entanglement Station', 'Estación de entrelazamiento'],
        ['gtceu.entanglement_distribution', 'Entanglement Distribution', 'Distribución de entrelazamiento'],

        ['grindless.machine.quantum_gas_lab.tooltip.0',
            'Cools lithium-6 and potassium-40 into a degenerate Fermi mixture and measures gravity with atom interferometry. Works in Earth orbit only.',
            'Enfría litio-6 y potasio-40 hasta una mezcla de Fermi degenerada y mide la gravedad por interferometría atómica. Solo funciona en órbita terrestre.'],
        ['grindless.machine.quantum_gas_lab.tooltip.1',
            'Circuit 1 degenerate EOS model, 2 Barnard gravity survey, 3 calibrate the interferometer against the ULE cavity (never consumed).',
            'Circuito 1 modelo de ecuación de estado degenerada, 2 estudio gravitatorio de Barnard, 3 calibrar el interferómetro con la cavidad ULE (no se consume).'],
        ['grindless.machine.quantum_gas_lab.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, una escotilla de entrada opcional. Acepta una escotilla de paralelos.'],

        ['grindless.machine.entanglement_station.tooltip.0',
            'Entangles photons from a PPKTP source with an Eu:YSO memory and checks them with SNSPDs: the only maker of quantum repeater nodes. Earth orbit only.',
            'Entrelaza fotones de una fuente de PPKTP con una memoria Eu:YSO y los comprueba con SNSPD: el único fabricante de nodos repetidores cuánticos. Solo en órbita terrestre.'],
        ['grindless.machine.entanglement_station.tooltip.1',
            'Circuit 1 quantum repeater node. The memory is held in superfluid helium, which is not used up.',
            'Circuito 1 nodo repetidor cuántico. La memoria se mantiene en helio superfluido, que no se gasta.'],
        ['grindless.machine.entanglement_station.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, una escotilla de entrada opcional. Acepta una escotilla de paralelos.'],

        ['gtceu.recipe.grindless_quantum_degenerate_gas.degenerate_eos_model', 'Circuit 1: a Li-6 and K-40 Fermi mixture cooled by the two lasers: the EOS model', 'Circuito 1: una mezcla de Fermi de Li-6 y K-40 enfriada por los dos láseres: el modelo de ecuación de estado'],
        ['gtceu.recipe.grindless_quantum_degenerate_gas.barnard_gravity_survey', 'Circuit 2: the calibrated gravimeter measures Barnard core rock', 'Circuito 2: el gravímetro calibrado mide roca del núcleo de Barnard'],
        ['gtceu.recipe.grindless_quantum_degenerate_gas.calibrate_gravimeter', 'Circuit 3: the atom interferometer is referenced to the ULE cavity, which is not consumed', 'Circuito 3: el interferómetro atómico se refiere a la cavidad ULE, que no se consume'],
        ['gtceu.recipe.grindless_entanglement_distribution.quantum_repeater_node', 'Circuit 1: source, memory, QD source, detectors and hollow-core fibre in one node', 'Circuito 1: fuente, memoria, fuente QD, detectores y fibra de núcleo hueco en un nodo'],
        ['gtceu.recipe.grindless_crystal_growth.tgg', 'Circuit 6: terbium gallium garnet pulled from the melt in an iridium crucible', 'Circuito 6: granate de terbio y galio extraído del fundido en un crisol de iridio'],
        ['gtceu.recipe.grindless_crystal_growth.ktp', 'Circuit 7: KTP grown from a flux in an iridium crucible', 'Circuito 7: KTP crecido desde un fundente en un crisol de iridio']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['cnt_sock', 'CNT Sock', 'Calcetín de CNT', 'A sleeve of carbon nanotubes grown on floating iron.', 'Una manga de nanotubos de carbono crecida sobre hierro flotante.', 'Made in the methane pyrolyser, circuit 3.', 'Se hace en el pirolizador de metano, circuito 3.'],
        ['cnt_densified_yarn', 'Densified CNT Yarn', 'Hilo de CNT densificado', 'The sock drawn through ethanol into a dense yarn.', 'El calcetín pasado por etanol hasta un hilo denso.', 'The iron catalyst comes back as dust.', 'El catalizador de hierro vuelve como polvo.'],
        ['cnt_twisted_yarn', 'Twisted CNT Yarn', 'Hilo de CNT trenzado', 'Four yarns twisted into one.', 'Cuatro hilos trenzados en uno.', 'Made in the assembler.', 'Se hace en el ensamblador.'],
        ['cnt_coiled_muscle', 'Coiled CNT Muscle', 'Músculo de CNT enrollado', 'A coiled yarn that contracts when heated.', 'Un hilo enrollado que se contrae al calentarse.', 'Four of them move a UEV robot arm.', 'Cuatro mueven un brazo robótico UEV.'],
        ['gallium_oxide_dust', 'Gallium Oxide Dust', 'Polvo de óxido de galio', 'Gallium burned in oxygen.', 'Galio quemado en oxígeno.', 'Part of the TGG line.', 'Parte de la línea del TGG.'],
        ['tgg_hydroxide_cake', 'TGG Hydroxide Cake', 'Torta de hidróxido de TGG', 'Terbium and gallium coprecipitated with ammonia.', 'Terbio y galio coprecipitados con amoniaco.', 'Calcined into TGG powder.', 'Se calcina hasta polvo de TGG.'],
        ['tgg_boule', 'TGG Boule', 'Boule de TGG', 'A terbium gallium garnet crystal.', 'Un cristal de granate de terbio y galio.', 'Cut into rods.', 'Se corta en varillas.'],
        ['tgg_rod', 'TGG Rod', 'Varilla de TGG', 'A rough rod of garnet.', 'Una varilla de granate en bruto.', 'Polished on a lathe.', 'Se pule en el torno.'],
        ['tgg_polished_rod', 'Polished TGG Rod', 'Varilla de TGG pulida', 'Optical grade, ready for a magnet.', 'De grado óptico, lista para un imán.', 'The heart of a Faraday isolator.', 'El corazón de un aislador de Faraday.'],
        ['fused_silica_tube', 'Fused Silica Tube', 'Tubo de sílice fundida', 'Silica melted into a tube.', 'Sílice fundida en un tubo.', 'Capillaries and preforms start here.', 'De aquí salen capilares y preformas.'],
        ['hollow_capillaries', 'Hollow Capillaries', 'Capilares huecos', 'Thin silica tubes from the fibre draw tower.', 'Tubos finos de sílice de la torre de estirado.', 'Stacked around a larger tube.', 'Se apilan alrededor de un tubo mayor.'],
        ['stacked_preform', 'Stacked Preform', 'Preforma apilada', 'Capillaries packed around a tube.', 'Capilares empaquetados alrededor de un tubo.', 'Fused into a cane.', 'Se funde en una caña.'],
        ['caned_preform', 'Caned Preform', 'Preforma en caña', 'The stack fused under helium.', 'La pila fundida bajo helio.', 'Drawn into fibre.', 'Se estira en fibra.'],
        ['drawn_hollow_fibre', 'Drawn Hollow Fibre', 'Fibra hueca estirada', 'Hair-thin fibre with an air core.', 'Fibra fina como un pelo con núcleo de aire.', 'Coated with epoxy.', 'Se recubre con epoxi.'],
        ['mcp_lead_glass', 'MCP Lead Glass', 'Vidrio de plomo para MCP', 'Glass melted with lead.', 'Vidrio fundido con plomo.', 'Cladding of the channel plate.', 'Revestimiento de la placa de canales.'],
        ['etchable_core_tube', 'Etchable Core Tube', 'Tubo con núcleo atacable', 'A glass core inside lead-glass cladding.', 'Un núcleo de vidrio dentro de un revestimiento de vidrio de plomo.', 'Drawn into a multi-fibre.', 'Se estira en una multifibra.'],
        ['mcp_multifibre', 'MCP Multi-fibre', 'Multifibra de MCP', 'A bundle of core tubes drawn together.', 'Un haz de tubos con núcleo estirados juntos.', 'Fused into a boule.', 'Se funde en un boule.'],
        ['mcp_boule', 'MCP Boule', 'Boule de MCP', 'A fused block of channel fibres.', 'Un bloque fundido de fibras de canal.', 'Sliced into plates.', 'Se corta en placas.'],
        ['mcp_plate', 'MCP Plate', 'Placa de MCP', 'A slice across the fibres.', 'Un corte transversal a las fibras.', 'The core is etched out with acid.', 'El núcleo se ataca con ácido.'],
        ['mcp_etched_plate', 'Etched MCP Plate', 'Placa de MCP atacada', 'A plate of empty channels.', 'Una placa de canales vacíos.', 'Reduced in hydrogen.', 'Se reduce en hidrógeno.'],
        ['mcp_reduced_plate', 'Reduced MCP Plate', 'Placa de MCP reducida', 'Channel walls that now emit electrons.', 'Paredes de canal que ahora emiten electrones.', 'Electrodes make it a lobster-eye MCP.', 'Los electrodos la convierten en un MCP ojo de langosta.'],
        ['kh2po4_dust', 'KH2PO4 Dust', 'Polvo de KH2PO4', 'Potassium dihydrogen phosphate.', 'Fosfato diácido de potasio.', 'The flux of the KTP line.', 'El fundente de la línea del KTP.'],
        ['ktp_flux', 'KTP Flux', 'Fundente de KTP', 'Phosphate and rutile ready to melt.', 'Fosfato y rutilo listos para fundir.', 'Grown in the crystal furnace, circuit 7.', 'Se crece en el horno de cristales, circuito 7.'],
        ['ktp_boule', 'KTP Boule', 'Boule de KTP', 'A potassium titanyl phosphate crystal.', 'Un cristal de fosfato titanílico de potasio.', 'Sliced into wafers.', 'Se corta en obleas.'],
        ['ktp_wafer', 'KTP Wafer', 'Oblea de KTP', 'A thin slice of KTP.', 'Una rebanada fina de KTP.', 'Gets gold electrodes.', 'Recibe electrodos de oro.'],
        ['ktp_electroded_wafer', 'Electroded KTP Wafer', 'Oblea de KTP con electrodos', 'Ready for periodic poling.', 'Lista para el poling periódico.', 'Poled in the polarizer.', 'Se polariza en el polarizador.'],
        ['spdc_source', 'SPDC Source', 'Fuente SPDC', 'A PPKTP crystal pumped by an emitter.', 'Un cristal de PPKTP bombeado por un emisor.', 'Makes entangled photon pairs.', 'Produce pares de fotones entrelazados.'],
        ['ule_soot', 'ULE Soot', 'Hollín ULE', 'Silica and titania from flame hydrolysis.', 'Sílice y titania de la hidrólisis a la llama.', 'The chlorine goes to the chlorine users.', 'El cloro va a quienes lo usan.'],
        ['ule_boule', 'ULE Boule', 'Boule ULE', 'Ultra-low expansion glass.', 'Vidrio de expansión ultrabaja.', 'Turned into a spacer.', 'Se tornea hasta un espaciador.'],
        ['ule_spacer', 'ULE Spacer', 'Espaciador ULE', 'A rod that barely changes length.', 'Una varilla que casi no cambia de longitud.', 'Mirrors go on both ends.', 'Los espejos van en ambos extremos.'],
        ['ule_mirrored_spacer', 'Mirrored ULE Spacer', 'Espaciador ULE con espejos', 'Tantalum oxide mirror coats on both ends.', 'Espejos de óxido de tantalio en ambos extremos.', 'Housed in vacuum.', 'Se aloja en vacío.'],
        ['ule_cavity', 'ULE Cavity', 'Cavidad ULE', 'A frequency reference. It is never used up.', 'Una referencia de frecuencia. Nunca se gasta.', 'Kept in the quantum gas lab.', 'Se queda en el laboratorio de gases cuánticos.'],
        ['li_cooling_laser', 'Lithium Cooling Laser', 'Láser de enfriamiento de litio', 'Locked to the lithium transition.', 'Fijado a la transición del litio.', 'Kept in the quantum gas lab.', 'Se queda en el laboratorio de gases cuánticos.'],
        ['k_cooling_laser', 'Potassium Cooling Laser', 'Láser de enfriamiento de potasio', 'Locked to the potassium transition.', 'Fijado a la transición del potasio.', 'Kept in the quantum gas lab.', 'Se queda en el laboratorio de gases cuánticos.'],
        ['atom_interferometer', 'Atom Interferometer', 'Interferómetro atómico', 'A sensor and two cooling lasers.', 'Un sensor y dos láseres de enfriamiento.', 'Needs calibration against the ULE cavity.', 'Necesita calibrarse con la cavidad ULE.'],
        ['calibrated_gravimeter', 'Calibrated Gravimeter', 'Gravímetro calibrado', 'An interferometer tied to the ULE cavity.', 'Un interferómetro atado a la cavidad ULE.', 'Measures Barnard core rock.', 'Mide roca del núcleo de Barnard.']
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
