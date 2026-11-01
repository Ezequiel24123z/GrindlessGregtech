// priority: 3200
// Gregtech Grindless - names and tooltips of the UIV foundation (startup_scripts/grindless/uiv/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//   grindless:<material> (GT material)       material.grindless.<n>
//   gtceu:uiv_<machine> (hull and hatches)   block.gtceu.uiv_<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // kind, id, [en name, en tip 0, en tip 1], [es name, es tip 0, es tip 1]
    var ENTRIES = [
        ['item', 'ti50_oven_charge',
            ['Ti-50 Oven Charge', 'Titanium-50 loaded for an ion source.', 'Feeds the heavy ion cyclotron.']],
        ['item', 'element_119_recoil',
            ['Element 119 Recoil Record', 'The few atoms of element 119 the separator caught.', 'Goes into the superheavy census.']],
        ['item', 'element_120_recoil',
            ['Element 120 Recoil Record', 'The few atoms of element 120 the separator caught.', 'Goes into the superheavy census.']],
        ['item', 'superheavy_census_ii',
            ['Superheavy Census II', 'A census that now reaches elements 119 and 120.', 'Follows the first superheavy census.']],
        ['item', 'u238_flash_target',
            ['U-238 Flash Target', 'Uranium-238 set to meet a neutron flash.', 'Its debris holds einsteinium and fermium.']],
        ['item', 'mh_winding',
            ['Metallic Hydrogen Winding', 'A winding of metallic hydrogen wire.', 'Goes into UIV motors and conveyors.']],
        ['item', 'h_si28_wafer',
            ['H-Implanted Si-28 Wafer', 'An isotopically pure silicon wafer with hydrogen implanted.', 'Becomes the phosphorus-doped die.']],
        ['item', 'p_si_die',
            ['P:Si Die', 'A phosphorus-in-silicon die that holds a quantum state.', 'Used by the memories and the cryostat.']],
        ['item', 'eo_microcomb',
            ['EO-Tunable Microcomb', 'A chip that turns one laser into hundreds of lines.', 'Part of the optical mainframe.']],
        ['item', 'telecom_memory',
            ['Telecom Memory', 'A memory that stores light at a telecom wavelength.', 'Part of the optical mainframe.']],
        ['item', 'mk_cryostat_module',
            ['mK Cryostat Module', 'A dilution unit that holds a few millikelvin.', 'Used by the P:Si die and the memories.']],
        ['item', 'data_crystal_5d',
            ['5D Data Crystal', 'Glass written in five dimensions that lasts billions of years.', 'Carries verified research from the Matrioshka.']],
        ['item', 'wf_rhea_billet',
            ['W-Fibre RHEA Billet', 'A refractory alloy billet reinforced with tungsten fibre.', 'Becomes first wall plates.']],
        ['item', 'ps_cooling_laser',
            ['Positronium Cooling Laser', 'A laser tuned to cool positronium.', 'Part of the positronium condensate lab.']],
        ['item', 'cage_part',
            ['Cage Part', 'A lattice part that will hold neutronium.', 'Part of the neutronium cage.']],
        ['item', 'sled_charge',
            ['Sled Charge', 'The charge that pushes a sled out of the pulsar wind.', 'Used with the recovered half-sled.']],
        ['item', 'neutronium_pellet',
            ['Neutronium Pellet', 'Neutron-star matter held in a cage.', 'The core of the UIV field generator.']],
        ['item', 'j0437_pulse_raw',
            ['Raw J0437 Pulse Profile', 'A pulsar signal as the dish heard it.', 'Needs timing before it is useful.']],
        ['item', 'xray_pulse_timed',
            ['Timed X-ray Pulse Profile', 'A pulse profile fixed against an atomic clock.', 'Feeds the neutron-star equation of state.']],
        ['item', 'pulsar_navigation_solution',
            ['Pulsar Navigation Solution', 'A position fix from the pulsar timing array.', 'Used for far navigation.']],
        ['item', 'kerr_probe_data',
            ['Kerr Probe Data', 'What a probe sent back from near a spinning black hole.', 'Must be correlated at home.']],
        ['item', 'correlated_kerr_data',
            ['Correlated Kerr Data', 'Probe data matched to the ringdown and the image.', 'Becomes the Kerr chart.']],
        ['item', 'recovered_half_sled',
            ['Recovered Half-Sled', 'Half a sled, brought back from the hold.', 'Read by the Penrose engine hold.']],
        ['item', 'ns_eos_chart',
            ['Neutron-Star EOS Chart', 'How matter behaves at the densest point.', 'Written by the Matrioshka computer.']],
        ['item', 'kerr_chart',
            ['Kerr Chart', 'A map of the space around a spinning black hole.', 'Written by the Matrioshka computer.']],
        ['item', 'pulsar_timed_repeater',
            ['Pulsar-Timed Repeater', 'A relay that keeps time by a pulsar.', 'A link of the far network.']],
        ['block', 'uiv_fusion_casing',
            ['UIV Fusion Casing', 'A plasma-facing wall for the hottest fusion fuels.', 'Structure block of the Mk5 fusion reactor.']],
        ['block', 'neutron_star_site_casing',
            ['Neutron-Star Site Casing', 'A field-hardened casing for a site on a neutron star.', 'Needs a rad-hard controller to make.']],
        ['block', 'metallic_hydrogen_coil_block',
            ['Metallic Hydrogen Coil Block', 'A coil of metallic hydrogen that runs at 14,400 K.', 'The hottest coil of the UIV era.']],

        ['gmaterial', 'metallic_hydrogen', ['Metallic Hydrogen']],
        ['nitem', 'metallic_hydrogen_ingot', ['Metallic Hydrogen Ingot']],
        ['nitem', 'metallic_hydrogen_dust', ['Metallic Hydrogen Dust']],
        ['material', 'rhea', ['RHEA (WMoNbTaHf)']],
        ['material', 'wf_rhea', ['W-Fibre RHEA']],
        ['material', 'zrticunibe_glass', ['Zr-Ti-Cu-Ni-Be Metallic Glass']],
        ['material', 'prni5', ['Praseodymium Nickel (PrNi5)']],
        ['material', 'lonsdaleite', ['Lonsdaleite']],
        ['material', 'cubic_gauche_nitrogen', ['Cubic Gauche Nitrogen']],
        ['material', 'gd_123', ['Gd-123 Superconductor']],
        ['material', 'li_sn', ['Lithium-Tin Alloy']],
        ['material', 'ingaasb', ['Indium Gallium Arsenide Antimonide']],
        ['material', 'titanium_50', ['Titanium-50']],
        ['material', 'europium_151', ['Europium-151']],
        ['material', 'nickel_58', ['Nickel-58']],
        ['material', 'carbon_12', ['Carbon-12']],
        ['material', 'niobium_pentoxide', ['Niobium Pentoxide']],
        ['material', 'erbium_oxide', ['Erbium Oxide']],
        ['material', 'praseodymium_oxide', ['Praseodymium Oxide']],
        ['material', 'gadolinium_oxide', ['Gadolinium Oxide']],
        ['gmaterial', 'he3he3_fuel', ['He-3 He-3 Fuel']],
        ['gmaterial', 'pli6_fuel', ['p-Li6 Fuel']],
        ['gmaterial', 'pn15_fuel', ['p-N15 Fuel']],
        ['gmaterial', 'he3he3_plasma', ['He-3 He-3 Plasma']],
        ['gmaterial', 'pli6_plasma', ['p-Li6 Plasma']],
        ['gmaterial', 'pn15_plasma', ['p-N15 Plasma']],
        ['gmaterial', 'he3he3_ash', ['He-3 He-3 Ash Gas']],
        ['gmaterial', 'pli6_ash', ['p-Li6 Ash Gas']],
        ['gmaterial', 'pn15_ash', ['p-N15 Ash Gas']],

        ['machine', 'uiv_machine_hull', ['UIV Machine Hull']],
        ['machine', 'uiv_energy_input_hatch', ['UIV Energy Hatch']],
        ['machine', 'uiv_energy_output_hatch', ['UIV Dynamo Hatch']],
        ['machine', 'uiv_energy_input_hatch_16a', ['UIV 16A Energy Hatch']],
        ['machine', 'uiv_energy_output_hatch_16a', ['UIV 16A Dynamo Hatch']]
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        ENTRIES.forEach(function (e) {
            var kind = e[0]
            var id = e[1]
            var t = e[2]
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
})()
