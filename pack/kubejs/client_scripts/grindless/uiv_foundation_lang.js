// priority: 3380
// Gregtech Grindless - names and tooltips of the UIV foundation (startup_scripts/grindless/uiv/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//   grindless:<material> (GT material)       material.grindless.<n>
//   gtceu:uiv_<machine> (hull and hatches)   block.gtceu.uiv_<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // kind, id, [en name, en tip 0, en tip 1], [es name, es tip 0, es tip 1]
    var ENTRIES = [
        ['item', 'uiv_electric_motor',
            ['UIV Electric Motor', 'A motor wound with metallic hydrogen and driven at 33 MV.', 'The shared motor of every UIV machine.'],
            ['Motor eléctrico UIV', 'Un motor bobinado con hidrógeno metálico y alimentado a 33 MV.', 'El motor común de toda máquina UIV.']],
        ['item', 'uiv_electric_pump',
            ['UIV Electric Pump', 'A pump for fluids that would eat a lesser seal.', 'Part of the UIV machine components.'],
            ['Bomba eléctrica UIV', 'Una bomba para fluidos que destruirían un sello menor.', 'Parte de los componentes de máquina UIV.']],
        ['item', 'uiv_conveyor_module',
            ['UIV Conveyor Module', 'A maglev belt that moves parts without touching them.', 'Part of the UIV machine components.'],
            ['Módulo transportador UIV', 'Una cinta maglev que mueve piezas sin tocarlas.', 'Parte de los componentes de máquina UIV.']],
        ['item', 'uiv_electric_piston',
            ['UIV Electric Piston', 'A piston that pushes without a gram of play.', 'Part of the UIV machine components.'],
            ['Pistón eléctrico UIV', 'Un pistón que empuja sin un gramo de holgura.', 'Parte de los componentes de máquina UIV.']],
        ['item', 'uiv_robot_arm',
            ['UIV Robot Arm', 'An arm that places a part to within a nanometre.', 'Part of the UIV machine components.'],
            ['Brazo robótico UIV', 'Un brazo que coloca una pieza con precisión de nanómetro.', 'Parte de los componentes de máquina UIV.']],
        ['item', 'uiv_sensor',
            ['UIV Sensor', 'A detector for a signal that is almost not there.', 'Part of the UIV machine components.'],
            ['Sensor UIV', 'Un detector para una señal que casi no existe.', 'Parte de los componentes de máquina UIV.']],
        ['item', 'uiv_emitter',
            ['UIV Emitter', 'A source of light and fields in a very narrow band.', 'Part of the UIV machine components.'],
            ['Emisor UIV', 'Una fuente de luz y campos en una banda muy estrecha.', 'Parte de los componentes de máquina UIV.']],
        ['item', 'uiv_field_generator',
            ['UIV Field Generator', 'A field that holds what no wall could.', 'Part of the UIV machine components.'],
            ['Generador de campo UIV', 'Un campo que sostiene lo que ninguna pared podría.', 'Parte de los componentes de máquina UIV.']],
        ['item', 'ti50_oven_charge',
            ['Ti-50 Oven Charge', 'Titanium-50 loaded for an ion source.', 'Feeds the heavy ion cyclotron.'],
            ['Carga de horno de Ti-50', 'Titanio-50 cargado para una fuente de iones.', 'Alimenta el ciclotrón de iones pesados.']],
        ['item', 'element_119_recoil',
            ['Element 119 Recoil Record', 'The few atoms of element 119 the separator caught.', 'Goes into the superheavy census.'],
            ['Registro de retroceso del elemento 119', 'Los pocos átomos del elemento 119 que atrapó el separador.', 'Pasa al censo de superpesados.']],
        ['item', 'element_120_recoil',
            ['Element 120 Recoil Record', 'The few atoms of element 120 the separator caught.', 'Goes into the superheavy census.'],
            ['Registro de retroceso del elemento 120', 'Los pocos átomos del elemento 120 que atrapó el separador.', 'Pasa al censo de superpesados.']],
        ['item', 'superheavy_census_ii',
            ['Superheavy Census II', 'A census that now reaches elements 119 and 120.', 'Follows the first superheavy census.'],
            ['Censo de superpesados II', 'Un censo que ya llega a los elementos 119 y 120.', 'Continúa el primer censo de superpesados.']],
        ['item', 'u238_flash_target',
            ['U-238 Flash Target', 'Uranium-238 set to meet a neutron flash.', 'Its debris holds einsteinium and fermium.'],
            ['Blanco de destello de U-238', 'Uranio-238 listo para recibir un destello de neutrones.', 'Sus restos contienen einstenio y fermio.']],
        ['item', 'mh_winding',
            ['Metallic Hydrogen Winding', 'A winding of metallic hydrogen wire.', 'Goes into UIV motors and conveyors.'],
            ['Bobinado de hidrógeno metálico', 'Un bobinado de hilo de hidrógeno metálico.', 'Va en los motores y transportadores UIV.']],
        ['item', 'h_si28_wafer',
            ['H-Implanted Si-28 Wafer', 'An isotopically pure silicon wafer with hydrogen implanted.', 'Becomes the phosphorus-doped die.'],
            ['Oblea de Si-28 implantada con H', 'Una oblea de silicio isotópicamente puro con hidrógeno implantado.', 'Se convierte en el dado dopado con fósforo.']],
        ['item', 'p_si_die',
            ['P:Si Die', 'A phosphorus-in-silicon die that holds a quantum state.', 'Used by the memories and the cryostat.'],
            ['Dado P:Si', 'Un dado de fósforo en silicio que guarda un estado cuántico.', 'Lo usan las memorias y el criostato.']],
        ['item', 'eo_microcomb',
            ['EO-Tunable Microcomb', 'A chip that turns one laser into hundreds of lines.', 'Part of the optical mainframe.'],
            ['Micropeine electroóptico', 'Un chip que convierte un láser en cientos de líneas.', 'Parte del mainframe óptico.']],
        ['item', 'telecom_memory',
            ['Telecom Memory', 'A memory that stores light at a telecom wavelength.', 'Part of the optical mainframe.'],
            ['Memoria de telecomunicaciones', 'Una memoria que guarda luz en una longitud de onda de telecomunicaciones.', 'Parte del mainframe óptico.']],
        ['item', 'mk_cryostat_module',
            ['mK Cryostat Module', 'A dilution unit that holds a few millikelvin.', 'Used by the P:Si die and the memories.'],
            ['Módulo criostato de mK', 'Una unidad de dilución que mantiene unos pocos milikelvin.', 'Lo usan el dado P:Si y las memorias.']],
        ['item', 'data_crystal_5d',
            ['5D Data Crystal', 'Glass written in five dimensions that lasts billions of years.', 'Carries verified research from the Matrioshka.'],
            ['Cristal de datos 5D', 'Vidrio escrito en cinco dimensiones que dura miles de millones de años.', 'Lleva la investigación verificada de la Matrioshka.']],
        ['item', 'wf_rhea_billet',
            ['W-Fibre RHEA Billet', 'A refractory alloy billet reinforced with tungsten fibre.', 'Becomes first wall plates.'],
            ['Tocho de RHEA con fibra de W', 'Un tocho de aleación refractaria reforzado con fibra de wolframio.', 'Se convierte en placas de primera pared.']],
        ['item', 'ps_cooling_laser',
            ['Positronium Cooling Laser', 'A laser tuned to cool positronium.', 'Part of the positronium condensate lab.'],
            ['Láser de enfriamiento de positronio', 'Un láser ajustado para enfriar positronio.', 'Parte del laboratorio de condensado de positronio.']],
        ['item', 'cage_part',
            ['Cage Part', 'A lattice part that will hold neutronium.', 'Part of the neutronium cage.'],
            ['Pieza de jaula', 'Una pieza de red que contendrá neutronio.', 'Parte de la jaula de neutronio.']],
        ['item', 'sled_charge',
            ['Sled Charge', 'The charge that pushes a sled out of the pulsar wind.', 'Used with the recovered half-sled.'],
            ['Carga del trineo', 'La carga que empuja un trineo fuera del viento del púlsar.', 'Se usa con la mitad de trineo recuperada.']],
        ['item', 'neutronium_pellet',
            ['Neutronium Pellet', 'Neutron-star matter held in a cage.', 'The core of the UIV field generator.'],
            ['Pellet de neutronio', 'Materia de estrella de neutrones sostenida en una jaula.', 'El núcleo del generador de campo UIV.']],
        ['item', 'j0437_pulse_raw',
            ['Raw J0437 Pulse Profile', 'A pulsar signal as the dish heard it.', 'Needs timing before it is useful.'],
            ['Perfil de pulso J0437 en bruto', 'Una señal de púlsar tal como la oyó la antena.', 'Necesita sincronización antes de servir.']],
        ['item', 'xray_pulse_timed',
            ['Timed X-ray Pulse Profile', 'A pulse profile fixed against an atomic clock.', 'Feeds the neutron-star equation of state.'],
            ['Perfil de pulso de rayos X sincronizado', 'Un perfil de pulso fijado contra un reloj atómico.', 'Alimenta la ecuación de estado de la estrella de neutrones.']],
        ['item', 'pulsar_navigation_solution',
            ['Pulsar Navigation Solution', 'A position fix from the pulsar timing array.', 'Used for far navigation.'],
            ['Solución de navegación por púlsares', 'Una posición calculada con la red de púlsares.', 'Se usa en la navegación lejana.']],
        ['item', 'kerr_probe_data',
            ['Kerr Probe Data', 'What a probe sent back from near a spinning black hole.', 'Must be correlated at home.'],
            ['Datos de la sonda de Kerr', 'Lo que una sonda envió desde cerca de un agujero negro en rotación.', 'Hay que correlacionarlos en casa.']],
        ['item', 'correlated_kerr_data',
            ['Correlated Kerr Data', 'Probe data matched to the ringdown and the image.', 'Becomes the Kerr chart.'],
            ['Datos de Kerr correlacionados', 'Datos de sonda cotejados con el ringdown y la imagen.', 'Se convierte en el mapa de Kerr.']],
        ['item', 'recovered_half_sled',
            ['Recovered Half-Sled', 'Half a sled, brought back from the hold.', 'Read by the Penrose engine hold.'],
            ['Mitad de trineo recuperada', 'La mitad de un trineo, traída de vuelta de la bodega.', 'La lee la bodega del motor de Penrose.']],
        ['item', 'ns_eos_chart',
            ['Neutron-Star EOS Chart', 'How matter behaves at the densest point.', 'Written by the Matrioshka computer.'],
            ['Mapa de EOS de estrella de neutrones', 'Cómo se comporta la materia en su punto más denso.', 'Lo escribe el ordenador Matrioshka.']],
        ['item', 'kerr_chart',
            ['Kerr Chart', 'A map of the space around a spinning black hole.', 'Written by the Matrioshka computer.'],
            ['Mapa de Kerr', 'Un mapa del espacio alrededor de un agujero negro en rotación.', 'Lo escribe el ordenador Matrioshka.']],
        ['item', 'pulsar_timed_repeater',
            ['Pulsar-Timed Repeater', 'A relay that keeps time by a pulsar.', 'A link of the far network.'],
            ['Repetidor sincronizado por púlsar', 'Un relé que mide el tiempo con un púlsar.', 'Un enlace de la red lejana.']],
        ['block', 'uiv_fusion_casing',
            ['UIV Fusion Casing', 'A plasma-facing wall for the hottest fusion fuels.', 'Structure block of the Mk5 fusion reactor.'],
            ['Carcasa de fusión UIV', 'Una pared frente al plasma para los combustibles de fusión más calientes.', 'Bloque de estructura del reactor de fusión Mk5.']],
        ['block', 'neutron_star_site_casing',
            ['Neutron-Star Site Casing', 'A field-hardened casing for a site on a neutron star.', 'Needs a rad-hard controller to make.'],
            ['Carcasa de sitio de estrella de neutrones', 'Una carcasa endurecida contra campos para un sitio en una estrella de neutrones.', 'Requiere un controlador resistente a la radiación.']],
        ['block', 'metallic_hydrogen_coil_block',
            ['Metallic Hydrogen Coil Block', 'A coil of metallic hydrogen that runs at 14,400 K.', 'The hottest coil of the UIV era.'],
            ['Bloque de bobina de hidrógeno metálico', 'Una bobina de hidrógeno metálico que funciona a 14 400 K.', 'La bobina más caliente de la era UIV.']],

        ['gmaterial', 'metallic_hydrogen', ['Metallic Hydrogen'], ['Hidrógeno metálico']],
        ['nitem', 'metallic_hydrogen_ingot', ['Metallic Hydrogen Ingot'], ['Lingote de hidrógeno metálico']],
        ['nitem', 'metallic_hydrogen_dust', ['Metallic Hydrogen Dust'], ['Polvo de hidrógeno metálico']],
        ['material', 'rhea', ['RHEA (WMoNbTaHf)'], ['RHEA (WMoNbTaHf)']],
        ['material', 'wf_rhea', ['W-Fibre RHEA'], ['RHEA con fibra de W']],
        ['material', 'zrticunibe_glass', ['Zr-Ti-Cu-Ni-Be Metallic Glass'], ['Vidrio metálico de Zr-Ti-Cu-Ni-Be']],
        ['material', 'prni5', ['Praseodymium Nickel (PrNi5)'], ['Praseodimio y níquel (PrNi5)']],
        ['material', 'lonsdaleite', ['Lonsdaleite'], ['Lonsdaleíta']],
        ['material', 'cubic_gauche_nitrogen', ['Cubic Gauche Nitrogen'], ['Nitrógeno cúbico gauche']],
        ['material', 'gd_123', ['Gd-123 Superconductor'], ['Superconductor Gd-123']],
        ['material', 'li_sn', ['Lithium-Tin Alloy'], ['Aleación de litio y estaño']],
        ['material', 'ingaasb', ['Indium Gallium Arsenide Antimonide'], ['Antimoniuro arseniuro de indio y galio']],
        ['material', 'titanium_50', ['Titanium-50'], ['Titanio-50']],
        ['material', 'europium_151', ['Europium-151'], ['Europio-151']],
        ['material', 'nickel_58', ['Nickel-58'], ['Níquel-58']],
        ['material', 'carbon_12', ['Carbon-12'], ['Carbono-12']],
        ['material', 'niobium_pentoxide', ['Niobium Pentoxide'], ['Pentóxido de niobio']],
        ['material', 'erbium_oxide', ['Erbium Oxide'], ['Óxido de erbio']],
        ['material', 'praseodymium_oxide', ['Praseodymium Oxide'], ['Óxido de praseodimio']],
        ['material', 'gadolinium_oxide', ['Gadolinium Oxide'], ['Óxido de gadolinio']],
        ['gmaterial', 'he3he3_fuel', ['He-3 He-3 Fuel'], ['Combustible He-3 He-3']],
        ['gmaterial', 'pli6_fuel', ['p-Li6 Fuel'], ['Combustible p-Li6']],
        ['gmaterial', 'pn15_fuel', ['p-N15 Fuel'], ['Combustible p-N15']],
        ['gmaterial', 'he3he3_plasma', ['He-3 He-3 Plasma'], ['Plasma He-3 He-3']],
        ['gmaterial', 'pli6_plasma', ['p-Li6 Plasma'], ['Plasma p-Li6']],
        ['gmaterial', 'pn15_plasma', ['p-N15 Plasma'], ['Plasma p-N15']],
        ['gmaterial', 'he3he3_ash', ['He-3 He-3 Ash Gas'], ['Gas de ceniza He-3 He-3']],
        ['gmaterial', 'pli6_ash', ['p-Li6 Ash Gas'], ['Gas de ceniza p-Li6']],
        ['gmaterial', 'pn15_ash', ['p-N15 Ash Gas'], ['Gas de ceniza p-N15']],

        ['machine', 'uiv_machine_hull', ['UIV Machine Hull'], ['Casco de máquina UIV']],
        ['machine', 'uiv_energy_input_hatch', ['UIV Energy Hatch'], ['Hatch de energía UIV']],
        ['machine', 'uiv_energy_output_hatch', ['UIV Dynamo Hatch'], ['Hatch de dinamo UIV']],
        ['machine', 'uiv_energy_input_hatch_16a', ['UIV 16A Energy Hatch'], ['Hatch de energía UIV 16A']],
        ['machine', 'uiv_energy_output_hatch_16a', ['UIV 16A Dynamo Hatch'], ['Hatch de dinamo UIV 16A']]
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
                if (kind === 'gmaterial') {
                    add('material.grindless.' + id, t[0])
                    return
                }
                if (kind === 'nitem') {
                    add('item.grindless.' + id, t[0])
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
