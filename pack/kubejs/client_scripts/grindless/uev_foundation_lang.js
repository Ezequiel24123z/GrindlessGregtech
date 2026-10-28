// Gregtech Grindless - names and tooltips of the UEV foundation (startup_scripts/grindless/uev/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//   gtceu:uev_<machine> (hull and hatches)   block.gtceu.uev_<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // kind, id, [en name, en tip 0, en tip 1], [es name, es tip 0, es tip 1]
    var ENTRIES = [
        ['item', 'uev_electric_motor',
            ['UEV Electric Motor', 'A motor wound with superhydride and driven at 8 MV.', 'The shared motor of every UEV machine. Made by the SiC device line.'],
            ['Motor eléctrico UEV', 'Un motor bobinado con superhidruro y alimentado a 8 MV.', 'El motor común de toda máquina UEV. Se fabrica en la línea de dispositivos de SiC.']],
        ['item', 'uev_electric_pump',
            ['UEV Electric Pump', 'A pump for fluids that would eat a lesser seal.', 'Part of the UEV machine components.'],
            ['Bomba eléctrica UEV', 'Una bomba para fluidos que destruirían un sello menor.', 'Parte de los componentes de máquina UEV.']],
        ['item', 'uev_conveyor_module',
            ['UEV Conveyor Module', 'A conveyor that moves parts at the speed of the line.', 'Part of the UEV machine components.'],
            ['Módulo transportador UEV', 'Un transportador que mueve piezas a la velocidad de la línea.', 'Parte de los componentes de máquina UEV.']],
        ['item', 'uev_electric_piston',
            ['UEV Electric Piston', 'A piston that pushes without a gram of play.', 'Part of the UEV machine components.'],
            ['Pistón eléctrico UEV', 'Un pistón que empuja sin un gramo de holgura.', 'Parte de los componentes de máquina UEV.']],
        ['item', 'uev_robot_arm',
            ['UEV Robot Arm', 'An arm that places a part to within a micrometre.', 'Made by the machining line. Part of the UEV machine components.'],
            ['Brazo robótico UEV', 'Un brazo que coloca una pieza con una precisión de micrómetro.', 'Se fabrica en la línea de mecanizado. Parte de los componentes de máquina UEV.']],
        ['item', 'uev_sensor',
            ['UEV Sensor', 'A detector for a signal that is almost not there.', 'Part of the UEV machine components.'],
            ['Sensor UEV', 'Un detector para una señal que casi no existe.', 'Parte de los componentes de máquina UEV.']],
        ['item', 'uev_emitter',
            ['UEV Emitter', 'A source of a clean, narrow beam.', 'Part of the UEV machine components.'],
            ['Emisor UEV', 'Una fuente de un haz limpio y estrecho.', 'Parte de los componentes de máquina UEV.']],
        ['item', 'uev_field_generator',
            ['UEV Field Generator', 'A shaped field held steady by a superhydride coil.', 'Made with the xenobiology line. Part of the UEV machine components.'],
            ['Generador de campo UEV', 'Un campo moldeado y sostenido por una bobina de superhidruro.', 'Se fabrica con la línea de xenobiología. Parte de los componentes de máquina UEV.']],
        ['item', 'ca48_beam',
            ['Calcium-48 Beam Charge', 'Enough calcium-48 ions to fire at a target for a run.', 'Made from enriched calcium. Fired at a target wheel.'],
            ['Carga de haz de calcio-48', 'Iones de calcio-48 suficientes para disparar a un blanco durante una tirada.', 'Se hace con calcio enriquecido. Se dispara a una rueda de blancos.']],
        ['item', 'target_wheel',
            ['Target Wheel', 'A spinning ring of actinide target segments.', 'It spreads the beam heat. Worn out by the run.'],
            ['Rueda de blancos', 'Un anillo giratorio de segmentos de blanco de actínidos.', 'Reparte el calor del haz. Se desgasta con la tirada.']],
        ['item', 'tennessine_sample',
            ['Tennessine Sample', 'A handful of atoms that lasted long enough to be counted.', 'Proof of the superheavy facility. Feeds the census.'],
            ['Muestra de teneso', 'Un puñado de átomos que duraron lo bastante para contarse.', 'Prueba de la instalación de superpesados. Alimenta el censo.']],
        ['item', 'superheavy_census',
            ['Superheavy Census', 'A tally of every superheavy decay chain seen so far.', 'Needed to check the island of stability model.'],
            ['Censo de superpesados', 'Un recuento de todas las cadenas de desintegración de superpesados vistas.', 'Necesario para comprobar el modelo de la isla de estabilidad.']],
        ['item', 'degenerate_eos_model',
            ['Degenerate EOS Model', 'An equation of state fitted to matter crushed past atoms.', 'Made in Earth orbit. Used by the degenerate matter line.'],
            ['Modelo de EOS degenerada', 'Una ecuación de estado ajustada a la materia aplastada más allá de los átomos.', 'Se hace en órbita terrestre. La usa la línea de materia degenerada.']],
        ['item', 'barnard_gravity_survey',
            ['Barnard Gravity Survey', 'A map of the pull under a red dwarf rocky world.', 'Made in Earth orbit. Guides the core drill.'],
            ['Estudio gravitatorio de Barnard', 'Un mapa de la atracción bajo un mundo rocoso de enana roja.', 'Se hace en órbita terrestre. Guía la perforación del núcleo.']],
        ['item', 'quantum_repeater_node',
            ['Quantum Repeater Node', 'A node that carries entanglement over a long link.', 'Made in Earth orbit. Used by the networked machines.'],
            ['Nodo repetidor cuántico', 'Un nodo que transporta el entrelazamiento por un enlace largo.', 'Se hace en órbita terrestre. Lo usan las máquinas en red.']],
        ['item', 'pulsar_navigation_chart',
            ['Pulsar Navigation Chart', 'A chart of the clock stars that tell a probe where it is.', 'Made from timing a set of pulsars.'],
            ['Carta de navegación por púlsares', 'Una carta de las estrellas reloj que dicen a una sonda dónde está.', 'Se hace midiendo el pulso de un conjunto de púlsares.']],
        ['item', 'mass_radius_chart',
            ['Mass-Radius Chart', 'A chart of how big each dense star is for its mass.', 'Made from a survey of compact stars.'],
            ['Carta masa-radio', 'Una carta del tamaño de cada estrella densa según su masa.', 'Se hace con un estudio de estrellas compactas.']],
        ['item', 'degenerate_matter',
            ['Degenerate Matter', 'Atoms packed until the electrons push back.', 'Made at Sirius B. Pressed into pellets.'],
            ['Materia degenerada', 'Átomos apretados hasta que los electrones empujan de vuelta.', 'Se obtiene en Sirio B. Se prensa en pellets.']],
        ['item', 'degenerate_pellet',
            ['Degenerate Pellet', 'A pressed pellet of degenerate matter, held by magnetic force.', 'Needs the degenerate containment casing.'],
            ['Pellet degenerado', 'Un pellet prensado de materia degenerada, sostenido por fuerza magnética.', 'Necesita la carcasa de contención degenerada.']],
        ['item', 'sx_blade',
            ['Single-Crystal Blade', 'A turbine blade grown as one crystal.', 'It holds its shape at white heat.'],
            ['Álabe monocristalino', 'Un álabe de turbina crecido como un solo cristal.', 'Conserva su forma al rojo blanco.']],
        ['item', 'sic_sic_plate',
            ['SiC/SiC Plate', 'A ceramic composite plate of silicon carbide fibre in silicon carbide.', 'Made in the CVI furnace. Feeds the UEV hull.'],
            ['Placa SiC/SiC', 'Una placa compuesta cerámica de fibra de carburo de silicio en carburo de silicio.', 'Se hace en el horno CVI. Alimenta el casco UEV.']],
        ['item', 'wf_w_tile',
            ['Wf/W Tile', 'A tungsten fibre in tungsten tile that faces the plasma.', 'Lines the fusion chamber.'],
            ['Baldosa Wf/W', 'Una baldosa de fibra de wolframio en wolframio que da al plasma.', 'Reviste la cámara de fusión.']],
        ['item', 'snspd',
            ['SNSPD', 'A superconducting nanowire that counts single photons.', 'Used by the quantum link and the telescopes.'],
            ['Detector SNSPD', 'Un nanohilo superconductor que cuenta fotones sueltos.', 'Lo usan el enlace cuántico y los telescopios.']],
        ['item', 'qd_source',
            ['Quantum Dot Source', 'A quantum dot that emits one photon at a time.', 'Used by the quantum link.'],
            ['Fuente de puntos cuánticos', 'Un punto cuántico que emite un fotón cada vez.', 'Lo usa el enlace cuántico.']],
        ['item', 'sdd',
            ['Silicon Drift Detector', 'An X-ray detector that tells which element was hit.', 'Used by the survey instruments.'],
            ['Detector de deriva de silicio', 'Un detector de rayos X que dice qué elemento fue golpeado.', 'Lo usan los instrumentos de estudio.']],
        ['item', 'lobster_eye_mcp',
            ['Lobster-Eye MCP', 'A microchannel plate that focuses X-rays like a lobster eye.', 'Used by the X-ray telescope.'],
            ['MCP de ojo de langosta', 'Una placa de microcanales que enfoca rayos X como un ojo de langosta.', 'La usa el telescopio de rayos X.']],
        ['item', 'aerogel_tile',
            ['Aerogel Tile', 'A tile of glass foam that is nearly all air.', 'It catches dust without breaking it.'],
            ['Baldosa de aerogel', 'Una baldosa de espuma de vidrio que es casi todo aire.', 'Atrapa polvo sin romperlo.']],
        ['item', 'hollow_core_fibre',
            ['Hollow-Core Fibre', 'A fibre that guides light through an air channel.', 'Used by the quantum link.'],
            ['Fibra de núcleo hueco', 'Una fibra que guía la luz por un canal de aire.', 'La usa el enlace cuántico.']],
        ['item', 'faraday_isolator',
            ['Faraday Isolator', 'An optical one-way valve for a laser beam.', 'Made with terbium gallium garnet.'],
            ['Aislador de Faraday', 'Una válvula óptica de un solo sentido para un haz láser.', 'Se hace con granate de terbio y galio.']],
        ['item', 'bonded_fe16n2_magnet',
            ['Bonded Fe16N2 Magnet', 'A rare-earth-free magnet from iron nitride powder.', 'Used by the UEV electric motor.'],
            ['Imán aglomerado de Fe16N2', 'Un imán sin tierras raras hecho con polvo de nitruro de hierro.', 'Lo usa el motor eléctrico UEV.']],
        ['item', 'barnard_core_rock',
            ['Barnard Core Rock', 'A core sample from a rocky world around a red dwarf.', 'Made by the core drill. Feeds the survey.'],
            ['Roca de núcleo de Barnard', 'Una muestra de núcleo de un mundo rocoso alrededor de una enana roja.', 'Se obtiene con la perforadora de núcleo. Alimenta el estudio.']],
        ['item', 'uev_smes_cell',
            ['UEV SMES Cell', 'A superconducting cell that stores energy at UEV scale.', 'Used by the wireless energy network.'],
            ['Celda SMES UEV', 'Una celda superconductora que almacena energía a escala UEV.', 'La usa la red de energía inalámbrica.']],
        ['block', 'uev_fusion_casing',
            ['UEV Fusion Casing', 'A plasma-facing wall of tungsten composite tiles.', 'Structure block of the UEV fusion reactor.'],
            ['Carcasa de fusión UEV', 'Una pared frente al plasma de baldosas compuestas de wolframio.', 'Bloque de estructura del reactor de fusión UEV.']],
        ['block', 'degenerate_containment_casing',
            ['Degenerate Containment Casing', 'A shell that holds matter crushed past atoms.', 'Structure block of the degenerate matter machines.'],
            ['Carcasa de contención degenerada', 'Una cubierta que contiene materia aplastada más allá de los átomos.', 'Bloque de estructura de las máquinas de materia degenerada.']],
        ['block', 'photonic_casing',
            ['Photonic Casing', 'A sealed wall of cleanroom grade for light-based machines.', 'Structure block of the photonic machines.'],
            ['Carcasa fotónica', 'Una pared sellada de grado de sala blanca para máquinas de luz.', 'Bloque de estructura de las máquinas fotónicas.']],
        ['block', 'hftacn_coil_block',
            ['HfTaCN Coil Block', 'A coil of hafnium tantalum carbonitride that runs at 12,600 K.', 'The hottest coil of the UEV era.'],
            ['Bloque de bobina de HfTaCN', 'Una bobina de carbonitruro de hafnio y tántalo que funciona a 12 600 K.', 'La bobina más caliente de la era UEV.']],

        ['material', 'calcium_48', ['Calcium-48'], ['Calcio-48']],
        ['material', 'potassium_40', ['Potassium-40'], ['Potasio-40']],
        ['material', 'lithium_6', ['Lithium-6'], ['Litio-6']],
        ['material', 'plutonium_244', ['Plutonium-244'], ['Plutonio-244']],
        ['material', 'curium_248', ['Curium-248'], ['Curio-248']],
        ['material', 'californium_249', ['Californium-249'], ['Californio-249']],
        ['material', 'lay_superhydride', ['Lanthanum Yttrium Superhydride'], ['Superhidruro de lantano e itrio']],
        ['material', 'ammonia_borane', ['Ammonia Borane'], ['Amoníaco borano']],
        ['material', 'fe16n2', ['Iron Nitride (Fe16N2)'], ['Nitruro de hierro (Fe16N2)']],
        ['material', 'iron_pentacarbonyl', ['Iron Pentacarbonyl'], ['Pentacarbonilo de hierro']],
        ['material', 'hftacn', ['Hafnium Tantalum Carbonitride'], ['Carbonitruro de hafnio y tántalo']],
        ['material', 'sic_sic', ['SiC/SiC Composite'], ['Compuesto SiC/SiC']],
        ['material', 'tungsten_silicide', ['Tungsten Silicide'], ['Siliciuro de wolframio']],
        ['material', 'tgg', ['Terbium Gallium Garnet'], ['Granate de terbio y galio']],
        ['material', 'ppktp', ['PPKTP'], ['PPKTP']],
        ['material', 'ffkm', ['FFKM'], ['FFKM']],
        ['material', 'polycarbonate', ['Polycarbonate'], ['Policarbonato']],
        ['material', 'ule_glass', ['ULE Glass'], ['Vidrio ULE']],
        ['material', 'interstellar_gas', ['Interstellar Gas'], ['Gas interestelar']],
        ['material', 'compressed_interstellar_gas', ['Compressed Interstellar Gas'], ['Gas interestelar comprimido']],
        ['material', 'hydrogen_deuterium_fraction', ['Hydrogen-Deuterium Fraction'], ['Fracción de hidrógeno y deuterio']],
        ['material', 'helium_fraction', ['Helium Fraction'], ['Fracción de helio']],
        ['material', 'dhe3_fuel_mix', ['D-He3 Fuel Mix'], ['Mezcla de combustible D-He3']],
        ['material', 'pb11_fuel', ['p-B11 Fuel'], ['Combustible p-B11']],
        ['material', 'polarised_dhe3_fuel', ['Polarised D-He3 Fuel'], ['Combustible D-He3 polarizado']],

        ['machine', 'uev_machine_hull', ['UEV Machine Hull'], ['Casco de máquina UEV']],
        ['machine', 'uev_energy_input_hatch', ['UEV Energy Hatch'], ['Hatch de energía UEV']],
        ['machine', 'uev_energy_output_hatch', ['UEV Dynamo Hatch'], ['Hatch de dinamo UEV']],
        ['machine', 'uev_energy_input_hatch_16a', ['UEV 16A Energy Hatch'], ['Hatch de energía UEV 16A']],
        ['machine', 'uev_energy_output_hatch_16a', ['UEV 16A Dynamo Hatch'], ['Hatch de dinamo UEV 16A']]
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            var add = function (key, value) { event.add('grindless', key, value) }
            ENTRIES.forEach(function (e) {
                var kind = e[0]
                var id = e[1]
                var t = e[2 + li]
                if (kind === 'material') {
                    add('material.gtceu.' + id, t[0])
                    return
                }
                if (kind === 'machine') {
                    add('block.gtceu.' + id, t[0])
                    return
                }
                add(kind + '.grindless.' + id, t[0])
                add('tooltip.grindless.' + id + '.0', t[1])
                add('tooltip.grindless.' + id + '.1', t[2])
            })
        })
    })
})()
