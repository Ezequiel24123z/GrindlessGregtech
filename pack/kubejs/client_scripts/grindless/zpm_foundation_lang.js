// priority: 1200
// Gregtech Grindless - names and tooltips of the ZPM foundation (startup_scripts/grindless/zpm/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<fluid> (GT material)              material.gtceu.<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // kind, id, [name, tip 0, tip 1]
    var ENTRIES = [
        ['item', 'radium_capsule',
            ['Radium Capsule', 'Radium-226 sealed in a lead-lined titanium capsule.', 'Parted out of the waste retrieval plant\'s raffinate. Brachytherapy sources and the hot cell\'s targets use it.']],
        ['item', 'curium_oxide',
            ['Curium Oxide', 'A heavy dark powder, warm to the touch from its own decay.', 'Parted out of the actinide partitioning plant. Fuel for the hottest RTGs.']],
        ['item', 'carbon_nanotube_yarn',
            ['Carbon Nanotube Yarn', 'A spun thread of aligned nanotubes, lighter than aramid and stronger than steel.', 'Grown by the methane pyrolyser. Tethers and sails are woven from it.']],
        ['item', 'cvd_diamond_plate',
            ['CVD Diamond Plate', 'A flawless diamond wafer grown from methane, layer by layer.', 'Made by the diamond lattice fab. Qubits, optics and the Kuiper telescope use it.']],
        ['item', 'qubit_array',
            ['Qubit Array', 'A grid of nitrogen-vacancy centres in diamond, each one a qubit.', 'Made by the qubit fab. It replaces circuits in the HPCA alternatives.']],
        ['item', 'archaeal_culture',
            ['Archaeal Culture', 'Methane-eating archaea that live off a hydrothermal vent\'s chemistry.', 'Grown in the vent bioreactor. The greenhouse\'s sixth step needs it.']],
        ['item', 'silica_aerogel',
            ['Silica Aerogel', 'Ninety-nine percent air, and the best insulator there is.', 'Made by the aerogel works. The aerogel tank and the probes\' dust shields use it.']],
        ['item', 'solar_core_survey',
            ['Solar Core Survey', 'A data orb of neutrino counts from the Sun\'s core.', 'Recorded by the neutrino observatory. It feeds the UV energy hatch.']],
        ['item', 'multimessenger_catalogue',
            ['Multimessenger Catalogue', 'A data orb of events seen in light, neutrinos and gravitational waves at once.', 'Recorded by the neutrino observatory. The UV telescope\'s seed.']],
        ['item', 'neptune_probe_recording',
            ['Neptune Probe Recording', 'A tape of what the probe heard at Neptune: radio, plasma and magnetic field.', 'Made by the flyby probe bay. The deep space network turns it into flyby data.']],
        ['item', 'triton_probe_recording',
            ['Triton Probe Recording', 'A tape of what the probe heard passing Triton: geysers, ice and a thin nitrogen sky.', 'Made by the flyby probe bay. The deep space network turns it into flyby data.']],
        ['item', 'neptune_flyby_data',
            ['Neptune Flyby Data', 'A data orb filled with the deep blue of Neptune.', 'Decoded by the deep space network from the probe\'s recording.']],
        ['item', 'triton_flyby_data',
            ['Triton Flyby Data', 'A data orb filled with Triton\'s pink-white ice.', 'Decoded by the deep space network from the probe\'s recording.']],
        ['item', 'pluto_kuiper_chart',
            ['Pluto-Kuiper Chart', 'A data stick with Pluto\'s heart and the belt around it.', 'Plotted by the deep space network from the Kuiper target list.']],
        ['item', 'kuiper_target_list',
            ['Kuiper Target List', 'A data stick of faint, slow objects beyond Neptune, ranked by reach.', 'Made by the Kuiper survey telescope. The deep space network reads it.']],
        ['item', 'scoop_head',
            ['Scoop Head', 'A ceramic-lipped intake that drinks a gas giant\'s upper air.', 'The drill family\'s bit for the gas giant and ice-giant siphons.']],
        ['item', 'ring_sail_net',
            ['Ring Sail Net', 'A fine nanotube net that sweeps ring ice without tearing.', 'Worn out by the ring harvester; it needs a new one every run.']],
        ['item', 'ring_ice_sample',
            ['Ring Ice Sample', 'A sealed cold canister of Saturn\'s ring ice.', 'Made by the ring harvester. Saturn\'s bridge takes it as input.']],
        ['item', 'titan_entry_probe',
            ['Titan Entry Probe', 'A blunt probe with a heat shield and a parachute for Titan\'s thick air.', 'Made for the entry probe bay.']],
        ['item', 'lake_sampler',
            ['Lake Sampler', 'A floating canister built to scoop liquid methane.', 'Carried by the Titan entry probe.']],
        ['item', 'aerogel_cartridge',
            ['Aerogel Cartridge', 'A cartridge of aerogel tiles that catches plume dust unharmed.', 'Used by the plume sampler; it comes back full of grains.']],
        ['item', 'silica_nanograins',
            ['Silica Nanograins', 'Fine silica grains, the seed of a new gel.', 'Made by the aerogel works from the plume\'s dust.']],
        ['item', 'saturn_interior_model',
            ['Saturn Interior Model', 'A data orb of Saturn\'s layers, read from the rings\' ripples.', 'Made by the ring seismometer.']],
        ['item', 'uranus_transfer_chart',
            ['Uranus Transfer Chart', 'A data stick with the long, cold route to Uranus.', 'Made by the ring seismometer from the Saturn model.']],
        ['item', 'ice_giant_atmosphere_sample',
            ['Ice Giant Atmosphere Sample', 'A pressurised flask of Uranian hydrogen, helium and methane.', 'Taken by the ice-giant siphon\'s first run. It is Uranus\'s bridge input.']],
        ['item', 'ice_giant_diamond_seed',
            ['Ice Giant Diamond Seed', 'A tiny diamond crystal that grew under the ice giant\'s pressure.', 'Made by the slurry separator. The diamond lattice fab starts from it.']],
        ['item', 'neptune_flyby_probe',
            ['Neptune Flyby Probe', 'A slim probe with a long boom and a single big dish.', 'Made by the flyby probe bay. It records, then leaves the system.']],
        ['item', 'neptune_sample',
            ['Neptune Sample', 'A frozen flask of Neptune\'s upper air, the coldest sample there is.', 'Made by the flyby probe bay.']],
        ['item', 'tholin',
            ['Tholin', 'A sticky red-brown organic dust, the smog of Titan.', 'Collected by the entry probe bay. The vent bioreactor and the Titan chemistry use it.']],
        ['item', 'silicon_28_dust',
            ['Silicon-28 Dust', 'Silicon with every atom the same isotope: no spin, no noise.', 'Made in the hot cell\'s Si-28 mode. The qubit fab needs it.']],
        ['item', 'pica_heat_shield',
            ['PICA Heat Shield', 'A tile of carbon-phenolic ablator that burns away so the probe does not.', 'Made by the composite autoclave. Entry and flyby probes carry it.']],

        ['block', 'naquadria_containment_casing',
            ['Naquadria Containment Casing', 'Naquadria-plated tungstensteel that holds an unstable core.', 'Shell of the reactors that burn naquadria.']],
        ['block', 'pressure_hull_casing',
            ['Pressure Hull Casing', 'Dense tungstensteel and duranium on a naquadah alloy frame.', 'Shell of the gas giant and ice-giant siphons.']],
        ['block', 'photomultiplier_casing',
            ['Photomultiplier Casing', 'A dark glass shell lined with light sensors, seeing one photon at a time.', 'Shell of the neutrino observatory.']],
        ['block', 'cryostat_casing',
            ['Cryostat Casing', 'Aerogel and gold-plated copper shield a millikelvin core from the world.', 'Shell of the qubit fab and other machines that must stay cold.']],
        ['block', 'probe_bay_casing',
            ['Probe Bay Casing', 'Station truss with a launch rail along its edge.', 'Shell of the entry probe bay, the plume sampler and the flyby probe bay.']],
        ['block', 'synroc_block',
            ['Synroc Block', 'Waste fixed in titanate ceramic: harmless, and it will stay that way for a million years.', 'The final form of the waste plants\' output. Decorative.']],

        ['fluid', 'saturn_helium',
            ['Saturn Helium', '', '']],
        ['fluid', 'uranus_hydrogen',
            ['Uranus Hydrogen', '', '']],
        ['fluid', 'enceladus_brine',
            ['Enceladus Brine', '', '']],
        ['fluid', 'actinide_raffinate',
            ['Actinide Raffinate', '', '']],
        ['fluid', 'diamond_slurry',
            ['Diamond Slurry', '', '']],
        ['fluid', 'ring_ice',
            ['Ring Ice', '', '']]
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        ENTRIES.forEach(function (e) {
            var kind = e[0]
            var id = e[1]
            var t = e[2]
            if (kind === 'fluid') {
                add('material.gtceu.' + id, t[0])
                return
            }
            add(kind + '.grindless.' + id, t[0])
            add('tooltip.grindless.' + id + '.0', t[1])
            add('tooltip.grindless.' + id + '.1', t[2])
        })
    })
})()
