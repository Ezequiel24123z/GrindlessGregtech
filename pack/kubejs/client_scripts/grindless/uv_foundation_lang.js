// Gregtech Grindless - names and tooltips of the UV foundation (startup_scripts/grindless/uv/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // kind, id, [en name, en tip 0, en tip 1], [es name, es tip 0, es tip 1]
    var ENTRIES = [
        ['item', 'thorium_oxide_fuel_assembly',
            ['Thorium Oxide Fuel Assembly', 'A bundle of thorium oxide rods in a zirconium frame.', 'Made by the fuel fabrication plant. The accelerator-driven reactor burns it.'],
            ['Ensamblaje de combustible de óxido de torio', 'Un haz de barras de óxido de torio en un marco de circonio.', 'Lo fabrica la planta de fabricación de combustible. El reactor impulsado por acelerador lo quema.']],
        ['item', 'thorium_nitride_fuel_assembly',
            ['Thorium Nitride Fuel Assembly', 'Denser than the oxide, and it carries heat better.', 'Made with nitrogen-15. It lasts longer in the accelerator-driven reactor.'],
            ['Ensamblaje de combustible de nitruro de torio', 'Más denso que el óxido, y conduce mejor el calor.', 'Se hace con nitrógeno-15. Dura más en el reactor impulsado por acelerador.']],
        ['item', 'spent_thorium_oxide_fuel',
            ['Spent Thorium Oxide Fuel', 'Burnt-out rods, now rich in uranium-233.', 'Contained waste of the accelerator-driven reactor. The pyroprocessing cell turns it back into fuel.'],
            ['Combustible de óxido de torio gastado', 'Barras agotadas, ahora ricas en uranio-233.', 'Residuo contenido del reactor impulsado por acelerador. La celda de pirorrefinado lo devuelve a combustible.']],
        ['item', 'spent_thorium_nitride_fuel',
            ['Spent Thorium Nitride Fuel', 'Burnt-out nitride rods, rich in uranium-233 and nitrogen-15.', 'Contained waste of the accelerator-driven reactor. The pyroprocessing cell recovers both.'],
            ['Combustible de nitruro de torio gastado', 'Barras de nitruro agotadas, ricas en uranio-233 y nitrógeno-15.', 'Residuo contenido del reactor impulsado por acelerador. La celda de pirorrefinado recupera ambos.']],
        ['item', 'curium_244_pellet',
            ['Curium-244 Pellet', 'A sintered ceramic pellet that stays hot for decades.', 'Pressed by the heat source works. The GPHS module and the curium RTG pellets start here.'],
            ['Pastilla de curio-244', 'Una pastilla cerámica sinterizada que se mantiene caliente durante décadas.', 'La prensa la planta de fuentes de calor. De ella salen el módulo GPHS y las pastillas de RTG de curio.']],
        ['item', 'gphs_module',
            ['GPHS Module', 'A general-purpose heat source: an iridium-clad curium pellet in a carbon-carbon shell.', 'Made by the heat source works. Probe RTGs and the penetrator use it.'],
            ['Módulo GPHS', 'Una fuente de calor de uso general: una pastilla de curio con funda de iridio en una carcasa de carbono-carbono.', 'La fabrica la planta de fuentes de calor. Los RTG de sondas y el penetrador la usan.']],
        ['item', 'carbon_carbon_aeroshell',
            ['Carbon-Carbon Aeroshell', 'A woven carbon shell that survives a crash.', 'Made by the composite autoclave. It guards the GPHS module.'],
            ['Carcasa aerodinámica de carbono-carbono', 'Una carcasa de carbono tejido que sobrevive a un impacto.', 'La fabrica el autoclave de compuestos. Protege el módulo GPHS.']],
        ['item', 'pb11_capsule',
            ['p-B11 Capsule', 'A diamond shell filled with decaborane.', 'Made by the diamond lattice fab. The laser fusion chamber burns it.'],
            ['Cápsula de p-B11', 'Una cáscara de diamante rellena de decaborano.', 'La fabrica la fábrica de redes de diamante. La cámara de fusión láser la quema.']],
        ['item', 'd_he3_capsule',
            ['D-He-3 Capsule', 'A diamond shell holding deuterium and helium-3.', 'Made by the diamond lattice fab. The laser fusion chamber burns it.'],
            ['Cápsula de D-He-3', 'Una cáscara de diamante con deuterio y helio-3.', 'La fabrica la fábrica de redes de diamante. La cámara de fusión láser la quema.']],
        ['item', 'srf_cryomodule',
            ['SRF Cryomodule', 'Niobium cavities in a helium vessel, cold enough to carry a beam without loss.', 'Made by the SRF cavity works. The synchrotron and the accelerator-driven reactor are built around it.'],
            ['Criomódulo SRF', 'Cavidades de niobio en un recipiente de helio, tan frías que llevan un haz sin pérdidas.', 'Lo fabrica la fábrica de cavidades SRF. El sincrotrón y el reactor impulsado por acelerador se construyen alrededor.']],
        ['item', 'antiproton_cartridge',
            ['Antiproton Cartridge', 'A magnetic bottle holding a few billion antiprotons.', 'Filled by the synchrotron and emptied by the antimatter trap, which sends it back.'],
            ['Cartucho de antiprotones', 'Una botella magnética con unos miles de millones de antiprotones.', 'Lo llena el sincrotrón y lo vacía la trampa de antimateria, que lo devuelve.']],
        ['item', 'fibre_laser_module',
            ['Fibre Laser Module', 'Ytterbium fibre coils pumped by diode bars.', 'Made by the fibre draw tower. The era\'s light source: fusion, printing and the sail launcher use it.'],
            ['Módulo láser de fibra', 'Bobinas de fibra de iterbio bombeadas por barras de diodos.', 'Lo fabrica la torre de estirado de fibra. La fuente de luz de la era: la fusión, la impresión y el lanzador de velas lo usan.']],
        ['item', 'ytterbium_fibre',
            ['Ytterbium Fibre Spool', 'A spool of double-clad fibre doped with ytterbium.', 'Drawn by the fibre draw tower. Fibre laser modules are wound from it.'],
            ['Carrete de fibra de iterbio', 'Un carrete de fibra de doble revestimiento dopada con iterbio.', 'Lo estira la torre de estirado de fibra. De él se bobinan los módulos láser de fibra.']],
        ['item', 'ingaas_pump_module',
            ['InGaAs Pump Module', 'Diode bars that pump a fibre with 9xx nm light.', 'Made by the MOCVD reactor. The fibre draw tower needs four per laser module.'],
            ['Módulo de bombeo InGaAs', 'Barras de diodos que bombean una fibra con luz de 9xx nm.', 'Lo fabrica el reactor MOCVD. La torre de estirado de fibra necesita cuatro por módulo láser.']],
        ['item', 'hpge_crystal',
            ['HPGe Crystal', 'High-purity germanium, thirteen nines pure.', 'Zone-refined into a detector crystal. Spectrometers and the interferometer use it.'],
            ['Cristal de HPGe', 'Germanio de alta pureza, trece nueves.', 'Refinado por zonas hasta ser un cristal detector. Los espectrómetros y el interferómetro lo usan.']],
        ['item', 'snspd_array',
            ['SNSPD Array', 'A grid of niobium nitride nanowires that counts single photons.', 'Tested in the qubit fab\'s helium-3 fridge. The optical ground station needs it.'],
            ['Matriz SNSPD', 'Una red de nanohilos de nitruro de niobio que cuenta fotones sueltos.', 'Se prueba en el refrigerador de helio-3 de la fábrica de qubits. La estación óptica terrestre la necesita.']],
        ['item', 'hbn_dust',
            ['Hexagonal Boron Nitride Dust', 'White graphite-like flakes that shrug off heat.', 'Made by the boron nitride reactor. Nanotubes, sail masks and thruster channels use it.'],
            ['Polvo de nitruro de boro hexagonal', 'Escamas blancas parecidas al grafito que ignoran el calor.', 'Lo fabrica el reactor de nitruro de boro. Los nanotubos, las máscaras de vela y los canales de propulsor lo usan.']],
        ['item', 'bnnt_yarn',
            ['BNNT Yarn', 'A white thread of boron nitride nanotubes, tougher than carbon and unburnable.', 'Spun by the boron nitride reactor. The BNNT fuel tank is wound from it.'],
            ['Hilo de BNNT', 'Un hilo blanco de nanotubos de nitruro de boro, más duro que el carbono e incombustible.', 'Lo hila el reactor de nitruro de boro. El tanque de combustible de BNNT se bobina con él.']],
        ['item', 'ented_powder',
            ['EnTED Powder', 'Enriched naquadah, trinium, europium and duranium, ground together.', 'Mixed by the powder-in-tube line. It fills the silver tubes of EnTED wire.'],
            ['Polvo de EnTED', 'Naquadah enriquecido, trinio, europio y duranio, molidos juntos.', 'Lo mezcla la línea de polvo en tubo. Llena los tubos de plata del cable de EnTED.']],
        ['item', 'neutronium_am_powder',
            ['Neutronium AM Powder', 'Atomised neutronium, round grains for the print bed.', 'Atomised by the powder bed printer in argon. Spatter and unsintered powder go back in.'],
            ['Polvo AM de neutronio', 'Neutronio atomizado, granos redondos para la cama de impresión.', 'Lo atomiza la impresora de lecho de polvo en argón. Las salpicaduras y el polvo sin sinterizar vuelven.']],
        ['item', 'darmstadtium_am_powder',
            ['Darmstadtium AM Powder', 'Atomised darmstadtium, round grains for the print bed.', 'Atomised by the powder bed printer in argon. Spatter and unsintered powder go back in.'],
            ['Polvo AM de darmstadtio', 'Darmstadtio atomizado, granos redondos para la cama de impresión.', 'Lo atomiza la impresora de lecho de polvo en argón. Las salpicaduras y el polvo sin sinterizar vuelven.']],
        ['item', 'tritanium_am_powder',
            ['Tritanium AM Powder', 'Atomised tritanium, round grains for the print bed.', 'Atomised by the powder bed printer in argon. Spatter and unsintered powder go back in.'],
            ['Polvo AM de tritanio', 'Tritanio atomizado, granos redondos para la cama de impresión.', 'Lo atomiza la impresora de lecho de polvo en argón. Las salpicaduras y el polvo sin sinterizar vuelven.']],
        ['item', 'light_sail',
            ['Light Sail', 'A 100 nm silicon nitride film with a boron nitride metasurface. Too thin for gravity.', 'Made in orbit by the light sail fab. The starchip rides on it.'],
            ['Vela de luz', 'Una película de nitruro de silicio de 100 nm con una metasuperficie de nitruro de boro. Demasiado fina para la gravedad.', 'La fabrica en órbita la fábrica de velas de luz. El microchip estelar viaja sobre ella.']],
        ['item', 'starchip',
            ['Starchip', 'A gram-scale probe: sensors, a radio and a power source on one wafer.', 'Made by the starchip fab. The sail-chip is built from it.'],
            ['Microchip estelar', 'Una sonda de un gramo: sensores, radio y fuente de energía en una sola oblea.', 'La fabrica la fábrica de microchips estelares. De él se construye el chip-vela.']],
        ['item', 'sailcraft',
            ['Sail-Chip', 'A starchip glued to its light sail, ready to be pushed.', 'Made by the starchip fab. The laser sail launcher accelerates it.'],
            ['Chip-vela', 'Un microchip estelar pegado a su vela de luz, listo para ser empujado.', 'Lo fabrica la fábrica de microchips estelares. El lanzador de velas láser lo acelera.']],
        ['item', 'starshot_probe',
            ['Probe in Flight', 'A sail-chip at a fifth of light speed, already gone.', 'Made by the laser sail launcher. The optical ground station reads its signal, once.'],
            ['Sonda en vuelo', 'Un chip-vela a una quinta parte de la velocidad de la luz, ya lejos.', 'La produce el lanzador de velas láser. La estación óptica terrestre lee su señal, una sola vez.']],
        ['item', 'triton_ice_core',
            ['Triton Ice Core', 'A core of frozen nitrogen from Triton\'s geysers.', 'Caught by the Triton geyser sampler. It calibrates the probes for Kuiper ices.'],
            ['Núcleo de hielo de Tritón', 'Un núcleo de nitrógeno congelado de los géiseres de Tritón.', 'Lo recoge el muestreador de géiseres de Tritón. Calibra las sondas para los hielos del Kuiper.']],
        ['item', 'sputnik_ice_core',
            ['Sputnik Ice Core', 'A core drilled from Sputnik Planitia\'s nitrogen glaciers.', 'Cut by the penetrator probe bay. The volatile ice fractionator splits it.'],
            ['Núcleo de hielo de Sputnik', 'Un núcleo perforado de los glaciares de nitrógeno de Sputnik Planitia.', 'Lo corta la bahía de sondas penetradoras. El fraccionador de hielos volátiles lo separa.']],
        ['item', 'charon_core',
            ['Charon Core', 'A core of water and ammonia ice from Charon.', 'Cut by the penetrator probe bay. The volatile ice fractionator splits it.'],
            ['Núcleo de Caronte', 'Un núcleo de hielo de agua y amoníaco de Caronte.', 'Lo corta la bahía de sondas penetradoras. El fraccionador de hielos volátiles lo separa.']],
        ['item', 'planetesimal_sample',
            ['Planetesimal Sample', 'A pebble of primordial ice and dust, untouched since the system formed.', 'Caught by the Kuiper interceptor bay. The amorphous ice annealer releases its noble gases.'],
            ['Muestra de planetesimal', 'Un guijarro de hielo y polvo primordiales, intacto desde que se formó el sistema.', 'Lo recoge la bahía de interceptores del Kuiper. El recocedor de hielo amorfo libera sus gases nobles.']],
        ['item', 'heliopause_data',
            ['Heliopause Data', 'A data orb of the interstellar medium\'s density, measured at the edge of the Sun\'s reach.', 'Recorded by the precursor probe bay. The laser sail launcher needs it to set a trajectory.'],
            ['Datos de la heliopausa', 'Un orbe de datos con la densidad del medio interestelar, medida en el borde del alcance del Sol.', 'Los registra la bahía de sondas precursoras. El lanzador de velas láser los necesita para trazar la trayectoria.']],
        ['item', 'proxima_approach_data',
            ['Proxima Approach Data', 'A data orb of a few seconds of Proxima Centauri, seen from very close.', 'Read from the probe in flight by the optical ground station.'],
            ['Datos de aproximación a Próxima', 'Un orbe de datos con unos segundos de Próxima Centauri, vista de muy cerca.', 'Los lee de la sonda en vuelo la estación óptica terrestre.']],
        ['item', 'sgr_a_star_image',
            ['Sgr A* Image', 'A ring of light around the black hole at the galaxy\'s heart.', 'Assembled by the event horizon interferometer.'],
            ['Imagen de Sgr A*', 'Un anillo de luz alrededor del agujero negro del corazón de la galaxia.', 'La compone el interferómetro del horizonte de sucesos.']],
        ['item', 'uv_smes_cell',
            ['UV Energy Cell', 'Six UV batteries wound into one cell, with room for 15.7 billion EU.', 'Wound by the naquadria magnet works. The wireless network goes UV only when its towers hold them.'],
            ['Celda de energía UV', 'Seis baterías UV bobinadas en una sola celda, con espacio para 15 700 millones de EU.', 'La bobina la fábrica de imanes de naquadria. La red inalámbrica pasa a UV solo cuando sus torres las contienen.']],
        ['block', 'laser_module_block',
            ['Laser Module Block', 'A beamline of fibre laser modules behind a steel grille.', 'Structure block of the laser fusion chamber and the laser sail launcher.'],
            ['Bloque de módulo láser', 'Una línea de haz de módulos láser de fibra tras una rejilla de acero.', 'Bloque de estructura de la cámara de fusión láser y del lanzador de velas láser.']],
        ['block', 'srf_cryomodule_block',
            ['SRF Cryomodule Block', 'A frosted cryostat with a niobium cavity inside.', 'Made by the SRF cavity works. A structure block of the synchrotron and the muon fusion cell.'],
            ['Bloque de criomódulo SRF', 'Un criostato escarchado con una cavidad de niobio dentro.', 'Lo fabrica la fábrica de cavidades SRF. Bloque de estructura del sincrotrón y de la celda de fusión de muones.']],
        ['block', 'bnnt_fuel_tank',
            ['BNNT Fuel Tank', 'A wound tank of boron nitride nanotubes: tier 11, the biggest a rocket can carry.', 'Made by the cryotank winder. With elite motors it takes a rocket to level 7.'],
            ['Tanque de combustible de BNNT', 'Un tanque bobinado de nanotubos de nitruro de boro: nivel 11, el mayor que puede llevar un cohete.', 'Lo fabrica la bobinadora de criotanques. Con motores de élite lleva un cohete al nivel 7.']],

        ['material', 'ytterbium', ['Ytterbium'], ['Iterbio']],
        ['material', 'uranium_233', ['Uranium-233'], ['Uranio-233']],
        ['material', 'arsine', ['Arsine'], ['Arsina']],
        ['material', 'thorium_nitride', ['Thorium Nitride'], ['Nitruro de torio']],
        ['material', 'nitrogen_15', ['Nitrogen-15'], ['Nitrógeno-15']],
        ['material', 'nitrogen_15_oxide', ['Nitrogen-15 Oxide'], ['Óxido de nitrógeno-15']],
        ['material', 'boron_11_trifluoride', ['Boron-11 Trifluoride'], ['Trifluoruro de boro-11']],
        ['material', 'boron_10_trifluoride', ['Boron-10 Trifluoride'], ['Trifluoruro de boro-10']],
        ['material', 'decaborane', ['Decaborane'], ['Decaborano']],
        ['material', 'neptune_helium', ['Neptune Helium'], ['Helio de Neptuno']],
        ['material', 'neptune_hydrogen', ['Neptune Hydrogen'], ['Hidrógeno de Neptuno']],
        ['material', 'triton_nitrogen', ['Triton Nitrogen'], ['Nitrógeno de Tritón']],
        ['material', 'kuiper_noble_gas', ['Kuiper Noble Gas'], ['Gas noble del Kuiper']],
        ['material', 'superfluid_helium', ['Superfluid Helium'], ['Helio superfluido']],
        ['material', 'helium_3_concentrate', ['Helium-3 Concentrate'], ['Concentrado de helio-3']],
        ['material', 'liquid_deuterium_tritium', ['Liquid Deuterium-Tritium'], ['Deuterio-tritio líquido']]
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
                add(kind + '.grindless.' + id, t[0])
                add('tooltip.grindless.' + id + '.0', t[1])
                add('tooltip.grindless.' + id + '.1', t[2])
            })
        })
    })
})()
