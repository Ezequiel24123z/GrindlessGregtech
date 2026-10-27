// priority: 7800
// Gregtech Grindless - names and tooltips of the LuV foundation (startup_scripts/grindless/luv/foundation.js):
//
//   grindless:<item> and grindless:<block>     the shared LuV items and blocks, with two tooltip lines each
//   material.gtceu.<material>                  the four GT materials (GTM names their forms and fluids from these)
//   item.gtceu.<form>                          es_es only: the Spanish name of every GT form of the new materials; GTM uses an
//                                              item-specific key when the language has one (TagPrefix.getUnlocalizedName), so en_us keeps
//                                              GTM's own patterns. Ore blocks keep the prefix pattern "%s_<prefix name>".
//
// Indicators and buckets keep GTM's English patterns in es_es, like every GTM indicator and bucket (no per-item key).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    // ---- cryogenics and magnets (home)
    add('item.grindless.nickel_tungsten_tape', 'Nickel-Tungsten Tape')
    add('tooltip.grindless.nickel_tungsten_tape.0', 'Nickel with 5 % tungsten, rolled thin and annealed until every grain lines up: a textured substrate.')
    add('tooltip.grindless.nickel_tungsten_tape.1', 'The coated conductor line lays the superconductor on it.')

    add('item.grindless.itbtc_coated_conductor', 'ITBTC Coated Conductor')
    add('tooltip.grindless.itbtc_coated_conductor.0', 'Second-generation superconducting tape: a micron-thin ITBTC film on nickel-tungsten, capped with silver.')
    add('tooltip.grindless.itbtc_coated_conductor.1', 'Made by the coated conductor line. The HTS magnet works winds it into coils and SMES cells.')

    add('block.grindless.magnetic_bearing', 'Magnetic Bearing')
    add('tooltip.grindless.magnetic_bearing.0', 'Tetrataenite magnets hold the shaft in the air: no contact, no wear, no lubricant to boil off in vacuum.')
    add('tooltip.grindless.magnetic_bearing.1', 'Made by the HTS magnet works from the belt\'s tetrataenite. The hydroponic ring spins on them.')

    add('block.grindless.coilgun_coil_casing', 'Coilgun Coil Casing')
    add('tooltip.grindless.coilgun_coil_casing.0', 'A wound Hg-1223 coil in an HSS-S frame. At Ganymede\'s 110 K it superconducts with no cryostat at all.')
    add('tooltip.grindless.coilgun_coil_casing.1', 'Made by the HTS magnet works. The coilgun probe launcher\'s barrel is built from it.')

    // ---- living circuits
    add('item.grindless.engineered_barley_seed', 'Engineered Barley Seed')
    add('tooltip.grindless.engineered_barley_seed.0', 'Barley carrying a human growth-factor gene, put there by bacteria the way Agrobacterium does it.')
    add('tooltip.grindless.engineered_barley_seed.1', 'Made in the biofoundry. The hydroponic ring grows the neurotrophic factor from it, and replants it.')

    add('item.grindless.engineered_tobacco_seed', 'Engineered Tobacco Seed')
    add('tooltip.grindless.engineered_tobacco_seed.0', 'Tobacco carrying the human collagen genes: a plant that makes collagen with no meat and no bone.')
    add('tooltip.grindless.engineered_tobacco_seed.1', 'Made in the biofoundry. The hydroponic ring grows plant collagen from it, and replants it.')

    add('item.grindless.neurotrophic_factor', 'Neurotrophic Factor')
    add('tooltip.grindless.neurotrophic_factor.0', 'A human protein that tells stem cells to become neurons, grown in engineered barley.')
    add('tooltip.grindless.neurotrophic_factor.1', 'Made by the rotating hydroponic ring in orbit. The organoid lab needs one per organoid.')

    add('item.grindless.neural_organoid', 'Neural Organoid')
    add('tooltip.grindless.neural_organoid.0', 'A tiny ball of living neurons, grown without a scaffold in weightlessness.')
    add('tooltip.grindless.neural_organoid.1', 'Made by the organoid lab in orbit. It is the living part of a neuro processing unit.')

    // ---- orbit
    add('item.grindless.triple_junction_wafer', 'Triple-Junction Wafer')
    add('tooltip.grindless.triple_junction_wafer.0', 'GaInP over GaAs over germanium, grown layer by layer in the wake\'s perfect vacuum.')
    add('tooltip.grindless.triple_junction_wafer.1', 'Made by the wake shield facility on Io\'s germanium. A cutter splits it into four cells.')

    add('item.grindless.triple_junction_cell', 'Triple-Junction Cell')
    add('tooltip.grindless.triple_junction_cell.0', 'Three solar cells stacked in one, each taking its own colour of light. Juno flies them at Jupiter.')
    add('tooltip.grindless.triple_junction_cell.1', 'Cut from a triple-junction wafer. It builds orbital solar panels with a quarter of the circuits.')

    add('block.grindless.station_truss_casing', 'Station Truss Casing')
    add('tooltip.grindless.station_truss_casing.0', 'Aluminium skin on a titanium truss: light, stiff and airtight, the fabric of a space station.')
    add('tooltip.grindless.station_truss_casing.1', 'The casing of the orbital machines: the solar station, the smelter, the grower and the labs.')

    add('block.grindless.whipple_shield_casing', 'Whipple Shield Casing')
    add('tooltip.grindless.whipple_shield_casing.0', 'Aluminium foam and aramid: a micrometeoroid shatters on the first layer and the spray stops on the next.')
    add('tooltip.grindless.whipple_shield_casing.1', 'Foamed in the microgravity smelter, where the pores stay even. Wake shields, drills and tethers face space with it.')

    add('block.grindless.orbital_solar_panel', 'Orbital Solar Panel')
    add('tooltip.grindless.orbital_solar_panel.0', 'Multi-junction cells on a titanium frame, in sunlight that never sets.')
    add('tooltip.grindless.orbital_solar_panel.1', 'The orbital solar station\'s panel: it counts while its top sees open sky.')

    add('block.grindless.sapphire_test_mass', 'Sapphire Test Mass')
    add('tooltip.grindless.sapphire_test_mass.0', 'A flawless sapphire crystal, polished into a mirror that a passing gravitational wave can nudge.')
    add('tooltip.grindless.sapphire_test_mass.1', 'Grown by the zero-g crystal grower. The gravitational-wave detector hangs four of them.')

    // ---- the belt
    add('item.grindless.asteroid_quantum_seed', 'Asteroid Quantum Seed')
    add('tooltip.grindless.asteroid_quantum_seed.0', 'The belt\'s half of an Earth-belt quantum pair, grown from raw meteoric iron.')
    add('tooltip.grindless.asteroid_quantum_seed.1', 'Made only on the asteroid belt. Blow it up with a singularity to make the entangled pair.')

    add('item.grindless.hss_s_drill_bit', 'HSS-S Drill Bit')
    add('tooltip.grindless.hss_s_drill_bit.0', 'The LuV vein drill bit: HSS-S, hard enough for iron-nickel meteorites.')
    add('tooltip.grindless.hss_s_drill_bit.1', 'It wears in the harpoon anchor drill, a little every run.')

    add('item.grindless.anchor_harpoon', 'Anchor Harpoon')
    add('tooltip.grindless.anchor_harpoon.0', 'An HSS-S shaft with a barbed tungsten carbide tip: where gravity is too weak to hold a drill down, harpoons do.')
    add('tooltip.grindless.anchor_harpoon.1', 'The harpoon anchor drill fires them into the rock and wears them out.')

    add('item.grindless.asteroid_pgm_concentrate', 'Asteroid PGM Concentrate')
    add('tooltip.grindless.asteroid_pgm_concentrate.0', 'What the Mond process leaves of meteoric iron: platinum metals form no carbonyl, so they stay behind.')
    add('tooltip.grindless.asteroid_pgm_concentrate.1', 'Only the asteroid processor makes it. The platinum plant splits it into the six platinum metals.')

    add('item.grindless.capture_bag', 'Capture Bag')
    add('tooltip.grindless.capture_bag.0', 'A bag of aramid and Kapton that closes around a boulder, so nothing that boils off is lost.')
    add('tooltip.grindless.capture_bag.1', 'The optical miner uses it up slowly.')

    add('item.grindless.chondritic_extract', 'Chondritic Extract')
    add('tooltip.grindless.chondritic_extract.0', 'Ammonia, phosphate and organics boiled out of a carbonaceous asteroid: food for microbes.')
    add('tooltip.grindless.chondritic_extract.1', 'Only the optical miner makes it, on the belt. The Europan culture needs it.')

    add('block.grindless.asteroid_regolith_casing', 'Asteroid Regolith Casing')
    add('tooltip.grindless.asteroid_regolith_casing.0', 'Belt rubble sintered into blocks: metal-flecked and tough.')
    add('tooltip.grindless.asteroid_regolith_casing.1', 'Made only on the asteroid belt. The belt\'s machines stand on it.')

    // ---- Io
    add('item.grindless.ionian_quantum_seed', 'Ionian Quantum Seed')
    add('tooltip.grindless.ionian_quantum_seed.0', 'Io\'s half of an Earth-Io quantum pair, grown from Io\'s brimstone.')
    add('tooltip.grindless.ionian_quantum_seed.1', 'Made only on Io. Its pair also works in the Io-orbit station.')

    add('item.grindless.ionian_sublimate', 'Ionian Sublimate')
    add('tooltip.grindless.ionian_sublimate.0', 'The crust that volcanic gas leaves as it cools: chlorides of germanium, indium and other rare metals.')
    add('tooltip.grindless.ionian_sublimate.1', 'Only the fumarole condenser on Io collects it, and only it separates the germanium and indium.')

    add('item.grindless.heat_exchanger_bundle', 'Heat Exchanger Bundle')
    add('tooltip.grindless.heat_exchanger_bundle.0', 'Tungstensteel tubes in a sulfur concrete frame, between Io\'s magma and the sulfur dioxide loop.')
    add('tooltip.grindless.heat_exchanger_bundle.1', 'Hot sulfur eats it: the volcanic intake wears out about one an hour per turbine module.')

    add('item.grindless.tether_spool', 'Tether Spool')
    add('tooltip.grindless.tether_spool.0', 'Kilometres of bare aluminium tape and aramid, with a Whipple-shielded end mass.')
    add('tooltip.grindless.tether_spool.1', 'The flux-tube tether pays it out into Io\'s plasma torus and wears it out, about one an hour.')

    add('block.grindless.radiation_vault_casing', 'Radiation Vault Casing')
    add('tooltip.grindless.radiation_vault_casing.0', 'Titanium, then tantalum: a graded shield that stops Jupiter\'s electrons and the X-rays they make, like Juno\'s vault.')
    add('tooltip.grindless.radiation_vault_casing.1', 'Every machine on Io, on Europa and in Io orbit needs it in its structure.')

    add('block.grindless.sulfur_concrete_casing', 'Sulfur Concrete Casing')
    add('tooltip.grindless.sulfur_concrete_casing.0', 'Rock bound with molten sulfur instead of cement: it needs no water, so it sets where water can\'t.')
    add('tooltip.grindless.sulfur_concrete_casing.1', 'Made only on Io, by the fumarole condenser. Every Jovian base is built with it.')

    // ---- Europa
    add('item.grindless.europan_quantum_seed', 'Europan Quantum Seed')
    add('tooltip.grindless.europan_quantum_seed.0', 'Europa\'s half of an Earth-Europa quantum pair, grown from Europa\'s blue ice.')
    add('tooltip.grindless.europan_quantum_seed.1', 'Made only on Europa. Blow it up with a singularity to make the entangled pair.')

    add('item.grindless.cryobot_probe', 'Cryobot Probe')
    add('tooltip.grindless.cryobot_probe.0', 'A melt probe that sinks through kilometres of ice on its own heat, paying out its tether.')
    add('tooltip.grindless.cryobot_probe.1', 'The cryobot sends one down to bring back the ocean sample. It does not come back.')

    add('item.grindless.melt_head', 'Melt Head')
    add('tooltip.grindless.melt_head.0', 'Tungsten carbide over an RTG heat source: it melts the shaft the cryobot pumps brine through.')
    add('tooltip.grindless.melt_head.1', 'The cryobot wears it, a little every brine run.')

    add('item.grindless.europan_ocean_sample', 'Europan Ocean Sample')
    add('tooltip.grindless.europan_ocean_sample.0', 'Brine from the ocean under Europa\'s ice, and something alive in it.')
    add('tooltip.grindless.europan_ocean_sample.1', 'Brought up by a cryobot probe. The algae bioreactor keeps it to seed the Europan culture.')

    // ---- Ganymede
    add('item.grindless.ganymedean_quantum_seed', 'Ganymedean Quantum Seed')
    add('tooltip.grindless.ganymedean_quantum_seed.0', 'Ganymede\'s half of an Earth-Ganymede quantum pair, grown from Ganymede\'s tuff.')
    add('tooltip.grindless.ganymedean_quantum_seed.1', 'Made only on Ganymede. Blow it up with a singularity to make the entangled pair.')

    add('item.grindless.jupiter_entry_probe', 'Jupiter Entry Probe')
    add('tooltip.grindless.jupiter_entry_probe.0', 'A heat-shielded cone with a mass spectrometer, built to fall into Jupiter and taste it on the way down.')
    add('tooltip.grindless.jupiter_entry_probe.1', 'The coilgun probe launcher on Ganymede fires it.')

    add('item.grindless.saturn_flyby_probe', 'Saturn Flyby Probe')
    add('tooltip.grindless.saturn_flyby_probe.0', 'Two RTG pellets, a sensor and a radio, aimed to swing past Jupiter on its way to Saturn.')
    add('tooltip.grindless.saturn_flyby_probe.1', 'The coilgun probe launcher on Ganymede fires it.')

    add('item.grindless.jovian_atmosphere_survey', 'Jovian Atmosphere Survey')
    add('tooltip.grindless.jovian_atmosphere_survey.0', 'What the entry probe radioed back before the pressure crushed it: hydrogen, helium and the helium-3 ratio.')
    add('tooltip.grindless.jovian_atmosphere_survey.1', 'Written by the coilgun probe launcher. The gas giant siphon of the next era needs it.')

    add('item.grindless.saturn_transfer_chart', 'Saturn Transfer Chart')
    add('tooltip.grindless.saturn_transfer_chart.0', 'A data stick with the flyby probe\'s track: the gravity assist at Jupiter and the way into Saturn\'s orbit.')
    add('tooltip.grindless.saturn_transfer_chart.1', 'Written by the coilgun probe launcher after a long flight. It is the next trip.')

    add('item.grindless.gravitational_wave_catalogue', 'Gravitational-Wave Catalogue')
    add('tooltip.grindless.gravitational_wave_catalogue.0', 'A data orb holding a chirp: two black holes merging, heard as space-time itself shaking.')
    add('tooltip.grindless.gravitational_wave_catalogue.1', 'Written by the gravitational-wave detector on Ganymede. It can be copied onto another data orb.')

    // ---- GT materials
    add('material.gtceu.meteoric_iron', 'Meteoric Iron')
    add('material.gtceu.tetrataenite', 'Tetrataenite')
    add('material.gtceu.zblan', 'ZBLAN')
    add('material.gtceu.europan_brine', 'Europan Brine')

    add('tooltip.grindless.meteoric_iron', 'Iron-nickel from an M-type asteroid. The asteroid processor\'s Mond process refines it and keeps the platinum metals.')
    add('tooltip.grindless.tetrataenite', 'Ordered iron-nickel, a permanent magnet with no rare earths that forms only in meteorites, over millions of years.')
    add('tooltip.grindless.zblan', 'Fluoride glass. On the ground it crystallizes as it is drawn; in orbit it stays glass and becomes optical fibre.')
    add('tooltip.grindless.europan_brine', 'Europa\'s ocean: water with magnesium sulfate and salt. The Europan culture grows in it.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    // ---- criogenia e imanes (en casa)
    add('item.grindless.nickel_tungsten_tape', 'Cinta de níquel-tungsteno')
    add('tooltip.grindless.nickel_tungsten_tape.0', 'Níquel con un 5 % de tungsteno, laminado fino y recocido hasta que todos los granos se alinean: un sustrato texturizado.')
    add('tooltip.grindless.nickel_tungsten_tape.1', 'La línea de conductor recubierto deposita el superconductor encima.')

    add('item.grindless.itbtc_coated_conductor', 'Conductor recubierto de ITBTC')
    add('tooltip.grindless.itbtc_coated_conductor.0', 'Cinta superconductora de segunda generación: una película de ITBTC de una micra sobre níquel-tungsteno, con una capa de plata.')
    add('tooltip.grindless.itbtc_coated_conductor.1', 'La hace la línea de conductor recubierto. El taller de imanes HTS la bobina en bobinas y celdas SMES.')

    add('block.grindless.magnetic_bearing', 'Cojinete magnético')
    add('tooltip.grindless.magnetic_bearing.0', 'Imanes de tetrataenita sostienen el eje en el aire: sin contacto, sin desgaste y sin lubricante que hierva en el vacío.')
    add('tooltip.grindless.magnetic_bearing.1', 'Lo hace el taller de imanes HTS con la tetrataenita del cinturón. El anillo hidropónico gira sobre ellos.')

    add('block.grindless.coilgun_coil_casing', 'Carcasa de bobina de cañón de bobinas')
    add('tooltip.grindless.coilgun_coil_casing.0', 'Una bobina de Hg-1223 en un marco de HSS-S. A los 110 K de Ganímedes superconduce sin criostato.')
    add('tooltip.grindless.coilgun_coil_casing.1', 'La hace el taller de imanes HTS. El cañón del lanzador de sondas de bobinas se construye con ella.')

    // ---- circuitos vivos
    add('item.grindless.engineered_barley_seed', 'Semilla de cebada modificada')
    add('tooltip.grindless.engineered_barley_seed.0', 'Cebada con un gen humano de factor de crecimiento, puesto ahí por bacterias, como hace Agrobacterium.')
    add('tooltip.grindless.engineered_barley_seed.1', 'Se hace en la biofundición. El anillo hidropónico cultiva con ella el factor neurotrófico y la vuelve a plantar.')

    add('item.grindless.engineered_tobacco_seed', 'Semilla de tabaco modificada')
    add('tooltip.grindless.engineered_tobacco_seed.0', 'Tabaco con los genes del colágeno humano: una planta que hace colágeno sin carne y sin hueso.')
    add('tooltip.grindless.engineered_tobacco_seed.1', 'Se hace en la biofundición. El anillo hidropónico cultiva con ella colágeno vegetal y la vuelve a plantar.')

    add('item.grindless.neurotrophic_factor', 'Factor neurotrófico')
    add('tooltip.grindless.neurotrophic_factor.0', 'Una proteína humana que hace que las células madre se conviertan en neuronas, cultivada en cebada modificada.')
    add('tooltip.grindless.neurotrophic_factor.1', 'Lo hace el anillo hidropónico giratorio en órbita. El laboratorio de organoides necesita uno por organoide.')

    add('item.grindless.neural_organoid', 'Organoide neural')
    add('tooltip.grindless.neural_organoid.0', 'Una bolita de neuronas vivas, cultivada sin andamio en ingravidez.')
    add('tooltip.grindless.neural_organoid.1', 'Lo hace el laboratorio de organoides en órbita. Es la parte viva de una unidad de procesamiento neural.')

    // ---- órbita
    add('item.grindless.triple_junction_wafer', 'Oblea de triple unión')
    add('tooltip.grindless.triple_junction_wafer.0', 'GaInP sobre GaAs sobre germanio, crecidos capa a capa en el vacío perfecto de la estela.')
    add('tooltip.grindless.triple_junction_wafer.1', 'La hace la instalación de escudo de estela con el germanio de Ío. Una cortadora la parte en cuatro células.')

    add('item.grindless.triple_junction_cell', 'Célula de triple unión')
    add('tooltip.grindless.triple_junction_cell.0', 'Tres células solares apiladas en una, cada una con su propio color de luz. Juno las lleva en Júpiter.')
    add('tooltip.grindless.triple_junction_cell.1', 'Se corta de una oblea de triple unión. Hace paneles solares orbitales con la cuarta parte de los circuitos.')

    add('block.grindless.station_truss_casing', 'Carcasa de celosía de estación')
    add('tooltip.grindless.station_truss_casing.0', 'Piel de aluminio sobre una celosía de titanio: ligera, rígida y estanca, la tela de una estación espacial.')
    add('tooltip.grindless.station_truss_casing.1', 'La carcasa de las máquinas orbitales: la estación solar, la fundición, el cultivador y los laboratorios.')

    add('block.grindless.whipple_shield_casing', 'Carcasa de escudo Whipple')
    add('tooltip.grindless.whipple_shield_casing.0', 'Espuma de aluminio y aramida: un micrometeoroide se rompe en la primera capa y la metralla se para en la siguiente.')
    add('tooltip.grindless.whipple_shield_casing.1', 'Se espuma en la fundición de microgravedad, donde los poros quedan iguales. Escudos de estela, perforadoras y cables miran al espacio con ella.')

    add('block.grindless.orbital_solar_panel', 'Panel solar orbital')
    add('tooltip.grindless.orbital_solar_panel.0', 'Células multiunión en un marco de titanio, bajo una luz solar que nunca se pone.')
    add('tooltip.grindless.orbital_solar_panel.1', 'El panel de la estación solar orbital: cuenta mientras su cara de arriba ve el cielo abierto.')

    add('block.grindless.sapphire_test_mass', 'Masa de prueba de zafiro')
    add('tooltip.grindless.sapphire_test_mass.0', 'Un cristal de zafiro sin defectos, pulido como un espejo que una onda gravitacional al pasar puede mover.')
    add('tooltip.grindless.sapphire_test_mass.1', 'La crece el cultivador de cristales en gravedad cero. El detector de ondas gravitacionales cuelga cuatro.')

    // ---- el cinturón
    add('item.grindless.asteroid_quantum_seed', 'Semilla cuántica asteroidal')
    add('tooltip.grindless.asteroid_quantum_seed.0', 'La mitad del cinturón de un par cuántico Tierra-cinturón, crecida a partir de hierro meteórico en bruto.')
    add('tooltip.grindless.asteroid_quantum_seed.1', 'Solo se hace en el cinturón de asteroides. Hazla estallar con una singularidad para hacer el par entrelazado.')

    add('item.grindless.hss_s_drill_bit', 'Broca de HSS-S')
    add('tooltip.grindless.hss_s_drill_bit.0', 'La broca de perforadora de vetas de LuV: HSS-S, lo bastante dura para los meteoritos de hierro y níquel.')
    add('tooltip.grindless.hss_s_drill_bit.1', 'Se gasta en la perforadora de anclaje con arpones, un poco en cada ciclo.')

    add('item.grindless.anchor_harpoon', 'Arpón de anclaje')
    add('tooltip.grindless.anchor_harpoon.0', 'Un vástago de HSS-S con una punta de carburo de tungsteno con lengüetas: donde la gravedad no sujeta una perforadora, lo hacen los arpones.')
    add('tooltip.grindless.anchor_harpoon.1', 'La perforadora de anclaje con arpones los dispara a la roca y los gasta.')

    add('item.grindless.asteroid_pgm_concentrate', 'Concentrado de MGP asteroidal')
    add('tooltip.grindless.asteroid_pgm_concentrate.0', 'Lo que el proceso Mond deja del hierro meteórico: los metales del grupo del platino no forman carbonilos y se quedan atrás.')
    add('tooltip.grindless.asteroid_pgm_concentrate.1', 'Solo lo hace el procesador de asteroides. La planta de platino lo separa en los seis metales del grupo del platino.')

    add('item.grindless.capture_bag', 'Bolsa de captura')
    add('tooltip.grindless.capture_bag.0', 'Una bolsa de aramida y Kapton que se cierra alrededor de un peñasco, para que no se pierda nada de lo que hierve.')
    add('tooltip.grindless.capture_bag.1', 'El minero óptico la gasta poco a poco.')

    add('item.grindless.chondritic_extract', 'Extracto condrítico')
    add('tooltip.grindless.chondritic_extract.0', 'Amoníaco, fosfato y compuestos orgánicos hervidos de un asteroide carbonáceo: comida para microbios.')
    add('tooltip.grindless.chondritic_extract.1', 'Solo lo hace el minero óptico, en el cinturón. El cultivo europano lo necesita.')

    add('block.grindless.asteroid_regolith_casing', 'Carcasa de regolito asteroidal')
    add('tooltip.grindless.asteroid_regolith_casing.0', 'Escombros del cinturón sinterizados en bloques: duros y con motas de metal.')
    add('tooltip.grindless.asteroid_regolith_casing.1', 'Solo se hace en el cinturón de asteroides. Las máquinas del cinturón se apoyan en ella.')

    // ---- Ío
    add('item.grindless.ionian_quantum_seed', 'Semilla cuántica de Ío')
    add('tooltip.grindless.ionian_quantum_seed.0', 'La mitad de Ío de un par cuántico Tierra-Ío, crecida a partir del azufre de Ío.')
    add('tooltip.grindless.ionian_quantum_seed.1', 'Solo se hace en Ío. Su par también funciona en la estación en órbita de Ío.')

    add('item.grindless.ionian_sublimate', 'Sublimado de Ío')
    add('tooltip.grindless.ionian_sublimate.0', 'La costra que deja el gas volcánico al enfriarse: cloruros de germanio, indio y otros metales raros.')
    add('tooltip.grindless.ionian_sublimate.1', 'Solo el condensador de fumarolas de Ío lo recoge, y solo él separa el germanio y el indio.')

    add('item.grindless.heat_exchanger_bundle', 'Haz de intercambiador de calor')
    add('tooltip.grindless.heat_exchanger_bundle.0', 'Tubos de acero de tungsteno en un marco de hormigón de azufre, entre el magma de Ío y el circuito de dióxido de azufre.')
    add('tooltip.grindless.heat_exchanger_bundle.1', 'El azufre caliente se lo come: la toma volcánica gasta uno cada hora, más o menos, por módulo de turbina.')

    add('item.grindless.tether_spool', 'Carrete de cable')
    add('tooltip.grindless.tether_spool.0', 'Kilómetros de cinta de aluminio desnuda y aramida, con una masa final protegida con escudo Whipple.')
    add('tooltip.grindless.tether_spool.1', 'El cable del tubo de flujo lo despliega en el toro de plasma de Ío y lo gasta, uno cada hora más o menos.')

    add('block.grindless.radiation_vault_casing', 'Carcasa de bóveda antirradiación')
    add('tooltip.grindless.radiation_vault_casing.0', 'Titanio y luego tántalo: un blindaje graduado que para los electrones de Júpiter y los rayos X que generan, como la bóveda de Juno.')
    add('tooltip.grindless.radiation_vault_casing.1', 'Toda máquina en Ío, en Europa y en la órbita de Ío la necesita en su estructura.')

    add('block.grindless.sulfur_concrete_casing', 'Carcasa de hormigón de azufre')
    add('tooltip.grindless.sulfur_concrete_casing.0', 'Roca unida con azufre fundido en vez de cemento: no necesita agua, así que fragua donde el agua no puede.')
    add('tooltip.grindless.sulfur_concrete_casing.1', 'Solo se hace en Ío, en el condensador de fumarolas. Todas las bases jovianas se construyen con ella.')

    // ---- Europa
    add('item.grindless.europan_quantum_seed', 'Semilla cuántica europana')
    add('tooltip.grindless.europan_quantum_seed.0', 'La mitad de Europa de un par cuántico Tierra-Europa, crecida a partir del hielo azul de Europa.')
    add('tooltip.grindless.europan_quantum_seed.1', 'Solo se hace en Europa. Hazla estallar con una singularidad para hacer el par entrelazado.')

    add('item.grindless.cryobot_probe', 'Sonda criobot')
    add('tooltip.grindless.cryobot_probe.0', 'Una sonda de fusión que se hunde kilómetros en el hielo con su propio calor, soltando su cable.')
    add('tooltip.grindless.cryobot_probe.1', 'El criobot manda una abajo para traer la muestra del océano. No vuelve.')

    add('item.grindless.melt_head', 'Cabeza de fusión')
    add('tooltip.grindless.melt_head.0', 'Carburo de tungsteno sobre una fuente de calor de RTG: funde el pozo por el que el criobot bombea la salmuera.')
    add('tooltip.grindless.melt_head.1', 'El criobot la gasta, un poco en cada ciclo de salmuera.')

    add('item.grindless.europan_ocean_sample', 'Muestra del océano de Europa')
    add('tooltip.grindless.europan_ocean_sample.0', 'Salmuera del océano bajo el hielo de Europa, y algo vivo dentro.')
    add('tooltip.grindless.europan_ocean_sample.1', 'La sube una sonda criobot. El biorreactor de algas la guarda para sembrar el cultivo europano.')

    // ---- Ganímedes
    add('item.grindless.ganymedean_quantum_seed', 'Semilla cuántica de Ganímedes')
    add('tooltip.grindless.ganymedean_quantum_seed.0', 'La mitad de Ganímedes de un par cuántico Tierra-Ganímedes, crecida a partir de la toba de Ganímedes.')
    add('tooltip.grindless.ganymedean_quantum_seed.1', 'Solo se hace en Ganímedes. Hazla estallar con una singularidad para hacer el par entrelazado.')

    add('item.grindless.jupiter_entry_probe', 'Sonda de entrada a Júpiter')
    add('tooltip.grindless.jupiter_entry_probe.0', 'Un cono con escudo térmico y un espectrómetro de masas, hecho para caer en Júpiter y probarlo por el camino.')
    add('tooltip.grindless.jupiter_entry_probe.1', 'La dispara el lanzador de sondas de bobinas de Ganímedes.')

    add('item.grindless.saturn_flyby_probe', 'Sonda de sobrevuelo de Saturno')
    add('tooltip.grindless.saturn_flyby_probe.0', 'Dos pastillas de RTG, un sensor y una radio, apuntados para pasar junto a Júpiter camino de Saturno.')
    add('tooltip.grindless.saturn_flyby_probe.1', 'La dispara el lanzador de sondas de bobinas de Ganímedes.')

    add('item.grindless.jovian_atmosphere_survey', 'Estudio de la atmósfera joviana')
    add('tooltip.grindless.jovian_atmosphere_survey.0', 'Lo que la sonda de entrada transmitió antes de que la presión la aplastara: hidrógeno, helio y la proporción de helio 3.')
    add('tooltip.grindless.jovian_atmosphere_survey.1', 'Lo escribe el lanzador de sondas de bobinas. El sifón de gigante gaseoso de la era siguiente lo necesita.')

    add('item.grindless.saturn_transfer_chart', 'Carta de transferencia a Saturno')
    add('tooltip.grindless.saturn_transfer_chart.0', 'Una memoria de datos con la trayectoria de la sonda de sobrevuelo: la asistencia gravitatoria en Júpiter y el camino a la órbita de Saturno.')
    add('tooltip.grindless.saturn_transfer_chart.1', 'La escribe el lanzador de sondas de bobinas tras un largo vuelo. Es el siguiente viaje.')

    add('item.grindless.gravitational_wave_catalogue', 'Catálogo de ondas gravitacionales')
    add('tooltip.grindless.gravitational_wave_catalogue.0', 'Un orbe de datos con un chirrido: dos agujeros negros fusionándose, oído como el propio espacio-tiempo temblando.')
    add('tooltip.grindless.gravitational_wave_catalogue.1', 'Lo escribe el detector de ondas gravitacionales de Ganímedes. Se puede copiar en otro orbe de datos.')

    // ---- materiales GT
    add('material.gtceu.meteoric_iron', 'Hierro meteórico')
    add('material.gtceu.tetrataenite', 'Tetrataenita')
    add('material.gtceu.zblan', 'ZBLAN')
    add('material.gtceu.europan_brine', 'Salmuera europana')

    add('tooltip.grindless.meteoric_iron', 'Hierro y níquel de un asteroide de tipo M. El proceso Mond del procesador de asteroides lo refina y se queda con los metales del grupo del platino.')
    add('tooltip.grindless.tetrataenite', 'Hierro y níquel ordenados, un imán permanente sin tierras raras que solo se forma en meteoritos, a lo largo de millones de años.')
    add('tooltip.grindless.zblan', 'Vidrio de fluoruros. En tierra cristaliza al estirarlo; en órbita sigue siendo vidrio y se convierte en fibra óptica.')
    add('tooltip.grindless.europan_brine', 'El océano de Europa: agua con sulfato de magnesio y sal. El cultivo europano crece en ella.')

    // ---- the GT forms of the new materials
    var dusts = function (material, name) {
        add('item.gtceu.' + material + '_dust', 'Polvo de ' + name)
        add('item.gtceu.small_' + material + '_dust', 'Montón pequeño de polvo de ' + name)
        add('item.gtceu.tiny_' + material + '_dust', 'Montón diminuto de polvo de ' + name)
    }
    dusts('meteoric_iron', 'hierro meteórico')
    dusts('tetrataenite', 'tetrataenita')
    dusts('zblan', 'ZBLAN')

    add('item.gtceu.tetrataenite_ingot', 'Lingote de tetrataenita')
    add('item.gtceu.tetrataenite_nugget', 'Pepita de tetrataenita')
    add('item.gtceu.tetrataenite_block', 'Bloque de tetrataenita')
    add('item.gtceu.tetrataenite_rod', 'Varilla de tetrataenita')

    // ore forms and one ore block per stone type (ore prefix name -> where it sits); only the belt's will generate (package B5)
    var stones = {
        stone: '', andesite: ' en andesita', basalt: ' en basalto', blackstone: ' en piedra negra', deepslate: ' en pizarra profunda',
        diorite: ' en diorita', endstone: ' en piedra del End', granite: ' en granito', gravel: ' en grava', marble: ' en mármol',
        mars: ' de Marte', mercury: ' de Mercurio', moon: ' de la Luna', netherrack: ' en netherrack',
        proxima_centauri_b: ' de Próxima Centauri b', red_granite: ' en granito rojo', red_sand: ' en arena roja', sand: ' en arena',
        tuff: ' en toba', venus: ' de Venus'
    }
    var ores = function (material, name) {
        add('item.gtceu.impure_' + material + '_dust', 'Montón impuro de polvo de ' + name)
        add('item.gtceu.pure_' + material + '_dust', 'Montón purificado de polvo de ' + name)
        add('item.gtceu.crushed_' + material + '_ore', 'Mena triturada de ' + name)
        add('item.gtceu.purified_' + material + '_ore', 'Mena purificada de ' + name)
        add('item.gtceu.refined_' + material + '_ore', 'Mena refinada de ' + name)
        add('item.gtceu.raw_' + material, name.charAt(0).toUpperCase() + name.substring(1) + ' en bruto')
        add('item.gtceu.raw_' + material + '_block', 'Bloque de ' + name + ' en bruto')
        Object.keys(stones).forEach(function (stone) {
            add('item.gtceu.' + material + '_' + stone, 'Mena de ' + name + stones[stone])
        })
    }
    ores('meteoric_iron', 'hierro meteórico')
    ores('tetrataenite', 'tetrataenita')
})

// what the new GT forms are for (GTM already shows the chemical formula)
ItemEvents.tooltip(event => {
    event.add(['gtceu:raw_meteoric_iron', 'gtceu:crushed_meteoric_iron_ore', 'gtceu:meteoric_iron_dust', 'gtceu:tuff_meteoric_iron_ore'],
        Text.translate('tooltip.grindless.meteoric_iron').gray())
    event.add(['gtceu:raw_tetrataenite', 'gtceu:crushed_tetrataenite_ore', 'gtceu:tetrataenite_dust', 'gtceu:tetrataenite_ingot',
        'gtceu:tetrataenite_rod', 'gtceu:tuff_tetrataenite_ore'], Text.translate('tooltip.grindless.tetrataenite').gray())
    event.add('gtceu:zblan_dust', Text.translate('tooltip.grindless.zblan').gray())
    event.add('gtceu:europan_brine_bucket', Text.translate('tooltip.grindless.europan_brine').gray())
})
