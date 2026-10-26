// Gregtech Grindless - names and tooltips of the ZPM foundation (startup_scripts/grindless/zpm/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   grindless:<fluid>                        fluid.grindless.<n> and item.grindless.<n>_bucket
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // kind, id, [en name, en tip 0, en tip 1], [es name, es tip 0, es tip 1]
    var ENTRIES = [
        ['item', 'radium_capsule',
            ['Radium Capsule', 'Radium-226 sealed in a lead-lined titanium capsule.', 'Parted out of the waste retrieval plant\'s raffinate. Brachytherapy sources and the hot cell\'s targets use it.'],
            ['Cápsula de radio', 'Radio-226 sellado en una cápsula de titanio forrada de plomo.', 'Se separa del refinado de la planta de recuperación de residuos. Lo usan las fuentes de braquiterapia y las dianas de la celda caliente.']],
        ['item', 'curium_oxide',
            ['Curium Oxide', 'A heavy dark powder, warm to the touch from its own decay.', 'Parted out of the actinide partitioning plant. Fuel for the hottest RTGs.'],
            ['Óxido de curio', 'Un polvo oscuro y pesado, tibio por su propia desintegración.', 'Se separa en la planta de partición de actínidos. Combustible de los RTG más calientes.']],
        ['item', 'carbon_nanotube_yarn',
            ['Carbon Nanotube Yarn', 'A spun thread of aligned nanotubes, lighter than aramid and stronger than steel.', 'Grown by the methane pyrolyser. Tethers and sails are woven from it.'],
            ['Hilo de nanotubos de carbono', 'Un hilo de nanotubos alineados, más ligero que la aramida y más fuerte que el acero.', 'Lo crece el pirolizador de metano. De él se tejen cables y velas.']],
        ['item', 'cvd_diamond_plate',
            ['CVD Diamond Plate', 'A flawless diamond wafer grown from methane, layer by layer.', 'Made by the diamond lattice fab. Qubits, optics and the Kuiper telescope use it.'],
            ['Placa de diamante CVD', 'Una oblea de diamante impecable crecida capa a capa desde metano.', 'La fabrica la fábrica de redes de diamante. La usan los qubits, la óptica y el telescopio del Kuiper.']],
        ['item', 'qubit_array',
            ['Qubit Array', 'A grid of nitrogen-vacancy centres in diamond, each one a qubit.', 'Made by the qubit fab. It replaces circuits in the HPCA alternatives.'],
            ['Matriz de qubits', 'Una red de centros de vacante de nitrógeno en diamante; cada uno es un qubit.', 'La fabrica la fábrica de qubits. Sustituye a los circuitos en las alternativas del HPCA.']],
        ['item', 'archaeal_culture',
            ['Archaeal Culture', 'Methane-eating archaea that live off a hydrothermal vent\'s chemistry.', 'Grown in the vent bioreactor. The greenhouse\'s sixth step needs it.'],
            ['Cultivo de arqueas', 'Arqueas que comen metano y viven de la química de una fuente hidrotermal.', 'Se cultiva en el biorreactor de fuente. El sexto paso del invernadero lo necesita.']],
        ['item', 'silica_aerogel',
            ['Silica Aerogel', 'Ninety-nine percent air, and the best insulator there is.', 'Made by the aerogel works. The aerogel tank and the probes\' dust shields use it.'],
            ['Aerogel de sílice', 'Noventa y nueve por ciento aire, y el mejor aislante que existe.', 'Lo fabrica la fábrica de aerogel. El tanque de aerogel y los escudos de polvo de las sondas lo usan.']],
        ['item', 'solar_core_survey',
            ['Solar Core Survey', 'A data orb of neutrino counts from the Sun\'s core.', 'Recorded by the neutrino observatory. It feeds the UV energy hatch.'],
            ['Estudio del núcleo solar', 'Un orbe de datos con recuentos de neutrinos del núcleo del Sol.', 'Lo registra el observatorio de neutrinos. Alimenta la cápsula de energía UV.']],
        ['item', 'multimessenger_catalogue',
            ['Multimessenger Catalogue', 'A data orb of events seen in light, neutrinos and gravitational waves at once.', 'Recorded by the neutrino observatory. The UV telescope\'s seed.'],
            ['Catálogo multimensajero', 'Un orbe de datos con eventos vistos a la vez en luz, neutrinos y ondas gravitacionales.', 'Lo registra el observatorio de neutrinos. La semilla del telescopio UV.']],
        ['item', 'neptune_probe_recording',
            ['Neptune Probe Recording', 'A tape of what the probe heard at Neptune: radio, plasma and magnetic field.', 'Made by the flyby probe bay. The deep space network turns it into flyby data.'],
            ['Grabación de la sonda de Neptuno', 'Una cinta con lo que la sonda oyó en Neptuno: radio, plasma y campo magnético.', 'La hace la bahía de sondas de sobrevuelo. La red de espacio profundo la convierte en datos.']],
        ['item', 'triton_probe_recording',
            ['Triton Probe Recording', 'A tape of what the probe heard passing Triton: geysers, ice and a thin nitrogen sky.', 'Made by the flyby probe bay. The deep space network turns it into flyby data.'],
            ['Grabación de la sonda de Tritón', 'Una cinta con lo que la sonda oyó al pasar Tritón: géiseres, hielo y un cielo fino de nitrógeno.', 'La hace la bahía de sondas de sobrevuelo. La red de espacio profundo la convierte en datos.']],
        ['item', 'neptune_flyby_data',
            ['Neptune Flyby Data', 'A data orb filled with the deep blue of Neptune.', 'Decoded by the deep space network from the probe\'s recording.'],
            ['Datos del sobrevuelo de Neptuno', 'Un orbe de datos lleno del azul profundo de Neptuno.', 'La red de espacio profundo lo decodifica de la grabación de la sonda.']],
        ['item', 'triton_flyby_data',
            ['Triton Flyby Data', 'A data orb filled with Triton\'s pink-white ice.', 'Decoded by the deep space network from the probe\'s recording.'],
            ['Datos del sobrevuelo de Tritón', 'Un orbe de datos lleno del hielo rosa y blanco de Tritón.', 'La red de espacio profundo lo decodifica de la grabación de la sonda.']],
        ['item', 'pluto_kuiper_chart',
            ['Pluto-Kuiper Chart', 'A data stick with Pluto\'s heart and the belt around it.', 'Plotted by the deep space network from the Kuiper target list.'],
            ['Carta Plutón-Kuiper', 'Un lápiz de datos con el corazón de Plutón y el cinturón que lo rodea.', 'La traza la red de espacio profundo a partir de la lista de objetivos del Kuiper.']],
        ['item', 'kuiper_target_list',
            ['Kuiper Target List', 'A data stick of faint, slow objects beyond Neptune, ranked by reach.', 'Made by the Kuiper survey telescope. The deep space network reads it.'],
            ['Lista de objetivos del Kuiper', 'Un lápiz de datos con objetos tenues y lentos más allá de Neptuno, por alcance.', 'La hace el telescopio de sondeo del Kuiper. La lee la red de espacio profundo.']],
        ['item', 'scoop_head',
            ['Scoop Head', 'A ceramic-lipped intake that drinks a gas giant\'s upper air.', 'The drill family\'s bit for the gas giant and ice-giant siphons.'],
            ['Cabezal de cuchara', 'Una toma de labio cerámico que bebe el aire alto de un gigante gaseoso.', 'La broca de la familia de taladros de los sifones de gigantes gaseosos y helados.']],
        ['item', 'ring_sail_net',
            ['Ring Sail Net', 'A fine nanotube net that sweeps ring ice without tearing.', 'Worn out by the ring harvester; it needs a new one every run.'],
            ['Red de vela de anillo', 'Una red fina de nanotubos que barre el hielo del anillo sin romperse.', 'Se desgasta en el recolector de anillos; hace falta una nueva en cada ciclo.']],
        ['item', 'ring_ice_sample',
            ['Ring Ice Sample', 'A sealed cold canister of Saturn\'s ring ice.', 'Made by the ring harvester. Saturn\'s bridge takes it as input.'],
            ['Muestra de hielo de anillo', 'Un bote sellado y frío con hielo de los anillos de Saturno.', 'La hace el recolector de anillos. El puente de Saturno la usa de entrada.']],
        ['item', 'titan_entry_probe',
            ['Titan Entry Probe', 'A blunt probe with a heat shield and a parachute for Titan\'s thick air.', 'Made for the entry probe bay.'],
            ['Sonda de entrada a Titán', 'Una sonda roma con escudo térmico y paracaídas para el aire espeso de Titán.', 'Se fabrica para la bahía de sondas de entrada.']],
        ['item', 'lake_sampler',
            ['Lake Sampler', 'A floating canister built to scoop liquid methane.', 'Carried by the Titan entry probe.'],
            ['Muestreador de lagos', 'Un bote flotante hecho para recoger metano líquido.', 'Lo lleva la sonda de entrada a Titán.']],
        ['item', 'aerogel_cartridge',
            ['Aerogel Cartridge', 'A cartridge of aerogel tiles that catches plume dust unharmed.', 'Used by the plume sampler; it comes back full of grains.'],
            ['Cartucho de aerogel', 'Un cartucho de losetas de aerogel que atrapa el polvo de la pluma sin dañarlo.', 'Lo usa el muestreador de plumas; vuelve lleno de granos.']],
        ['item', 'silica_nanograins',
            ['Silica Nanograins', 'Fine silica grains, the seed of a new gel.', 'Made by the aerogel works from the plume\'s dust.'],
            ['Nanogranos de sílice', 'Granos finos de sílice, la semilla de un gel nuevo.', 'Los fabrica la fábrica de aerogel a partir del polvo de la pluma.']],
        ['item', 'saturn_interior_model',
            ['Saturn Interior Model', 'A data orb of Saturn\'s layers, read from the rings\' ripples.', 'Made by the ring seismometer.'],
            ['Modelo del interior de Saturno', 'Un orbe de datos con las capas de Saturno, leídas de las ondulaciones de los anillos.', 'Lo hace el sismómetro de anillos.']],
        ['item', 'uranus_transfer_chart',
            ['Uranus Transfer Chart', 'A data stick with the long, cold route to Uranus.', 'Made by the ring seismometer from the Saturn model.'],
            ['Carta de transferencia a Urano', 'Un lápiz de datos con la ruta larga y fría hasta Urano.', 'La hace el sismómetro de anillos a partir del modelo de Saturno.']],
        ['item', 'ice_giant_atmosphere_sample',
            ['Ice Giant Atmosphere Sample', 'A pressurised flask of Uranian hydrogen, helium and methane.', 'Taken by the ice-giant siphon\'s first run. It is Uranus\'s bridge input.'],
            ['Muestra de atmósfera de gigante helado', 'Un matraz a presión con hidrógeno, helio y metano de Urano.', 'La toma la primera pasada del sifón de gigantes helados. Es la entrada del puente de Urano.']],
        ['item', 'ice_giant_diamond_seed',
            ['Ice Giant Diamond Seed', 'A tiny diamond crystal that grew under the ice giant\'s pressure.', 'Made by the slurry separator. The diamond lattice fab starts from it.'],
            ['Semilla de diamante de gigante helado', 'Un cristal diminuto de diamante crecido bajo la presión del gigante helado.', 'Lo hace el separador de lodo. La fábrica de redes de diamante parte de él.']],
        ['item', 'neptune_flyby_probe',
            ['Neptune Flyby Probe', 'A slim probe with a long boom and a single big dish.', 'Made by the flyby probe bay. It records, then leaves the system.'],
            ['Sonda de sobrevuelo de Neptuno', 'Una sonda esbelta con un brazo largo y una sola antena grande.', 'La hace la bahía de sondas de sobrevuelo. Graba y abandona el sistema.']],
        ['item', 'neptune_sample',
            ['Neptune Sample', 'A frozen flask of Neptune\'s upper air, the coldest sample there is.', 'Made by the flyby probe bay.'],
            ['Muestra de Neptuno', 'Un matraz helado con el aire alto de Neptuno, la muestra más fría que existe.', 'La hace la bahía de sondas de sobrevuelo.']],
        ['item', 'tholin',
            ['Tholin', 'A sticky red-brown organic dust, the smog of Titan.', 'Collected by the entry probe bay. The vent bioreactor and the Titan chemistry use it.'],
            ['Tolina', 'Un polvo orgánico pegajoso rojo pardo, el smog de Titán.', 'Lo recoge la bahía de sondas de entrada. Lo usan el biorreactor de fuente y la química de Titán.']],
        ['item', 'silicon_28_dust',
            ['Silicon-28 Dust', 'Silicon with every atom the same isotope: no spin, no noise.', 'Made in the hot cell\'s Si-28 mode. The qubit fab needs it.'],
            ['Polvo de silicio-28', 'Silicio con todos los átomos del mismo isótopo: sin espín, sin ruido.', 'Se hace en el modo Si-28 de la celda caliente. La fábrica de qubits lo necesita.']],
        ['item', 'pica_heat_shield',
            ['PICA Heat Shield', 'A tile of carbon-phenolic ablator that burns away so the probe does not.', 'Made by the composite autoclave. Entry and flyby probes carry it.'],
            ['Escudo térmico PICA', 'Una loseta de ablador de carbono y fenol que se quema para que la sonda no lo haga.', 'La hace el autoclave de compuestos. Las sondas de entrada y sobrevuelo la llevan.']],

        ['block', 'naquadria_containment_casing',
            ['Naquadria Containment Casing', 'Naquadria-plated tungstensteel that holds an unstable core.', 'Shell of the reactors that burn naquadria.'],
            ['Carcasa de contención de naquadria', 'Acero de wolframio chapado en naquadria que contiene un núcleo inestable.', 'Envoltura de los reactores que queman naquadria.']],
        ['block', 'pressure_hull_casing',
            ['Pressure Hull Casing', 'Dense tungstensteel and duranium on a naquadah alloy frame.', 'Shell of the gas giant and ice-giant siphons.'],
            ['Carcasa de casco a presión', 'Acero de wolframio denso y duranio sobre un marco de aleación de naquadah.', 'Envoltura de los sifones de gigantes gaseosos y helados.']],
        ['block', 'photomultiplier_casing',
            ['Photomultiplier Casing', 'A dark glass shell lined with light sensors, seeing one photon at a time.', 'Shell of the neutrino observatory.'],
            ['Carcasa de fotomultiplicadores', 'Una envoltura de vidrio oscuro con sensores de luz, que ve un fotón cada vez.', 'Envoltura del observatorio de neutrinos.']],
        ['block', 'cryostat_casing',
            ['Cryostat Casing', 'Aerogel and gold-plated copper shield a millikelvin core from the world.', 'Shell of the qubit fab and other machines that must stay cold.'],
            ['Carcasa de criostato', 'Aerogel y cobre dorado aíslan del mundo un núcleo de milikelvin.', 'Envoltura de la fábrica de qubits y otras máquinas que deben mantenerse frías.']],
        ['block', 'probe_bay_casing',
            ['Probe Bay Casing', 'Station truss with a launch rail along its edge.', 'Shell of the entry probe bay, the plume sampler and the flyby probe bay.'],
            ['Carcasa de bahía de sondas', 'Armazón de estación con un raíl de lanzamiento en el borde.', 'Envoltura de la bahía de sondas de entrada, el muestreador de plumas y la bahía de sobrevuelo.']],
        ['block', 'synroc_block',
            ['Synroc Block', 'Waste fixed in titanate ceramic: harmless, and it will stay that way for a million years.', 'The final form of the waste plants\' output. Decorative.'],
            ['Bloque de synroc', 'Residuos fijados en cerámica de titanato: inofensivos, y lo seguirán siendo un millón de años.', 'La forma final de lo que producen las plantas de residuos. Decorativo.']],

        ['fluid', 'saturn_helium',
            ['Saturn Helium', '', ''], ['Helio de Saturno', '', '']],
        ['fluid', 'uranus_hydrogen',
            ['Uranus Hydrogen', '', ''], ['Hidrógeno de Urano', '', '']],
        ['fluid', 'enceladus_brine',
            ['Enceladus Brine', '', ''], ['Salmuera de Encélado', '', '']],
        ['fluid', 'actinide_raffinate',
            ['Actinide Raffinate', '', ''], ['Refinado de actínidos', '', '']],
        ['fluid', 'diamond_slurry',
            ['Diamond Slurry', '', ''], ['Lodo de diamante', '', '']],
        ['fluid', 'ring_ice',
            ['Ring Ice', '', ''], ['Hielo de anillo', '', '']]
    ]

    var bucketName = { en_us: function (n) { return n + ' Bucket' }, es_es: function (n) { return 'Cubo de ' + n.charAt(0).toLowerCase() + n.slice(1) } }

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            var add = function (key, value) { event.add('grindless', key, value) }
            ENTRIES.forEach(function (e) {
                var kind = e[0]
                var id = e[1]
                var t = e[2 + li]
                if (kind === 'fluid') {
                    add('fluid.grindless.' + id, t[0])
                    add('item.grindless.' + id + '_bucket', bucketName[lang](t[0]))
                    return
                }
                add(kind + '.grindless.' + id, t[0])
                add('tooltip.grindless.' + id + '.0', t[1])
                add('tooltip.grindless.' + id + '.1', t[2])
            })
        })
    })
})()
