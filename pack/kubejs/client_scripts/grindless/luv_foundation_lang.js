// priority: 7800
// Gregtech Grindless - names and tooltips of the LuV foundation (startup_scripts/grindless/luv/foundation.js):
//
//   grindless:<item> and grindless:<block>     the shared LuV items and blocks, with two tooltip lines each
//   material.gtceu.<material>                  the four GT materials (GTM names their forms and fluids from these)
//
// GTM names the forms, indicators and buckets of these materials from its own English patterns, so no per-form key is needed.
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us.
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
    add('tooltip.grindless.ionian_quantum_seed.1', 'Made in a chemical reactor. Its pair also works in the Io-orbit station.')

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
    add('tooltip.grindless.sulfur_concrete_casing.1', 'Made by the fumarole condenser, anywhere. Every Jovian base is built with it.')

    // ---- Europa
    add('item.grindless.europan_quantum_seed', 'Europan Quantum Seed')
    add('tooltip.grindless.europan_quantum_seed.0', 'Europa\'s half of an Earth-Europa quantum pair, grown from Europa\'s blue ice.')
    add('tooltip.grindless.europan_quantum_seed.1', 'Made in a chemical reactor. Blow it up with a singularity to make the entangled pair.')

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

// what the new GT forms are for (GTM already shows the chemical formula)
ItemEvents.tooltip(event => {
    event.add(['gtceu:raw_meteoric_iron', 'gtceu:crushed_meteoric_iron_ore', 'gtceu:meteoric_iron_dust', 'gtceu:tuff_meteoric_iron_ore'],
        Text.translate('tooltip.grindless.meteoric_iron').gray())
    event.add(['gtceu:raw_tetrataenite', 'gtceu:crushed_tetrataenite_ore', 'gtceu:tetrataenite_dust', 'gtceu:tetrataenite_ingot',
        'gtceu:tetrataenite_rod', 'gtceu:tuff_tetrataenite_ore'], Text.translate('tooltip.grindless.tetrataenite').gray())
    event.add('gtceu:zblan_dust', Text.translate('tooltip.grindless.zblan').gray())
    event.add('gtceu:europan_brine_bucket', Text.translate('tooltip.grindless.europan_brine').gray())
})
