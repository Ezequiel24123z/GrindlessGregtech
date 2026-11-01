// priority: 2827
// Gregtech Grindless - names and tooltips of the UV foundation (startup_scripts/grindless/uv/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // kind, id, [name, tip 0, tip 1]
    var ENTRIES = [
        ['item', 'thorium_oxide_fuel_assembly',
            ['Thorium Oxide Fuel Assembly', 'A bundle of thorium oxide rods in a zirconium frame.', 'Made by the fuel fabrication plant. The accelerator-driven reactor burns it.']],
        ['item', 'thorium_nitride_fuel_assembly',
            ['Thorium Nitride Fuel Assembly', 'Denser than the oxide, and it carries heat better.', 'Made with nitrogen-15. It lasts longer in the accelerator-driven reactor.']],
        ['item', 'spent_thorium_oxide_fuel',
            ['Spent Thorium Oxide Fuel', 'Burnt-out rods, now rich in uranium-233.', 'Contained waste of the accelerator-driven reactor. The pyroprocessing cell turns it back into fuel.']],
        ['item', 'spent_thorium_nitride_fuel',
            ['Spent Thorium Nitride Fuel', 'Burnt-out nitride rods, rich in uranium-233 and nitrogen-15.', 'Contained waste of the accelerator-driven reactor. The pyroprocessing cell recovers both.']],
        ['item', 'curium_244_pellet',
            ['Curium-244 Pellet', 'A sintered ceramic pellet that stays hot for decades.', 'Pressed by the heat source works. The GPHS module and the curium RTG pellets start here.']],
        ['item', 'gphs_module',
            ['GPHS Module', 'A general-purpose heat source: an iridium-clad curium pellet in a carbon-carbon shell.', 'Made by the heat source works. Probe RTGs and the penetrator use it.']],
        ['item', 'carbon_carbon_aeroshell',
            ['Carbon-Carbon Aeroshell', 'A woven carbon shell that survives a crash.', 'Made by the composite autoclave. It guards the GPHS module.']],
        ['item', 'pb11_capsule',
            ['p-B11 Capsule', 'A diamond shell filled with decaborane.', 'Made by the diamond lattice fab. The laser fusion chamber burns it.']],
        ['item', 'd_he3_capsule',
            ['D-He-3 Capsule', 'A diamond shell holding deuterium and helium-3.', 'Made by the diamond lattice fab. The laser fusion chamber burns it.']],
        ['item', 'srf_cryomodule',
            ['SRF Cryomodule', 'Niobium cavities in a helium vessel, cold enough to carry a beam without loss.', 'Made by the SRF cavity works. The synchrotron and the accelerator-driven reactor are built around it.']],
        ['item', 'antiproton_cartridge',
            ['Antiproton Cartridge', 'A magnetic bottle holding a few billion antiprotons.', 'Filled by the synchrotron and emptied by the antimatter trap, which sends it back.']],
        ['item', 'fibre_laser_module',
            ['Fibre Laser Module', 'Ytterbium fibre coils pumped by diode bars.', 'Made by the fibre draw tower. The era\'s light source: fusion, printing and the sail launcher use it.']],
        ['item', 'ytterbium_fibre',
            ['Ytterbium Fibre Spool', 'A spool of double-clad fibre doped with ytterbium.', 'Drawn by the fibre draw tower. Fibre laser modules are wound from it.']],
        ['item', 'ingaas_pump_module',
            ['InGaAs Pump Module', 'Diode bars that pump a fibre with 9xx nm light.', 'Made by the MOCVD reactor. The fibre draw tower needs four per laser module.']],
        ['item', 'hpge_crystal',
            ['HPGe Crystal', 'High-purity germanium, thirteen nines pure.', 'Zone-refined into a detector crystal. Spectrometers and the interferometer use it.']],
        ['item', 'snspd_array',
            ['SNSPD Array', 'A grid of niobium nitride nanowires that counts single photons.', 'Tested in the qubit fab\'s helium-3 fridge. The optical ground station needs it.']],
        ['item', 'hbn_dust',
            ['Hexagonal Boron Nitride Dust', 'White graphite-like flakes that shrug off heat.', 'Made by the boron nitride reactor. Nanotubes, sail masks and thruster channels use it.']],
        ['item', 'bnnt_yarn',
            ['BNNT Yarn', 'A white thread of boron nitride nanotubes, tougher than carbon and unburnable.', 'Spun by the boron nitride reactor. The BNNT fuel tank is wound from it.']],
        ['item', 'ented_powder',
            ['EnTED Powder', 'Enriched naquadah, trinium, europium and duranium, ground together.', 'Mixed by the powder-in-tube line. It fills the silver tubes of EnTED wire.']],
        ['item', 'neutronium_am_powder',
            ['Neutronium AM Powder', 'Atomised neutronium, round grains for the print bed.', 'Atomised by the powder bed printer in argon. Spatter and unsintered powder go back in.']],
        ['item', 'darmstadtium_am_powder',
            ['Darmstadtium AM Powder', 'Atomised darmstadtium, round grains for the print bed.', 'Atomised by the powder bed printer in argon. Spatter and unsintered powder go back in.']],
        ['item', 'tritanium_am_powder',
            ['Tritanium AM Powder', 'Atomised tritanium, round grains for the print bed.', 'Atomised by the powder bed printer in argon. Spatter and unsintered powder go back in.']],
        ['item', 'light_sail',
            ['Light Sail', 'A 100 nm silicon nitride film with a boron nitride metasurface. Too thin for gravity.', 'Made in orbit by the light sail fab. The starchip rides on it.']],
        ['item', 'starchip',
            ['Starchip', 'A gram-scale probe: sensors, a radio and a power source on one wafer.', 'Made by the starchip fab. The sail-chip is built from it.']],
        ['item', 'sailcraft',
            ['Sail-Chip', 'A starchip glued to its light sail, ready to be pushed.', 'Made by the starchip fab. The laser sail launcher accelerates it.']],
        ['item', 'starshot_probe',
            ['Probe in Flight', 'A sail-chip at a fifth of light speed, already gone.', 'Made by the laser sail launcher. The optical ground station reads its signal, once.']],
        ['item', 'triton_ice_core',
            ['Triton Ice Core', 'A core of frozen nitrogen from Triton\'s geysers.', 'Caught by the Triton geyser sampler. It calibrates the probes for Kuiper ices.']],
        ['item', 'sputnik_ice_core',
            ['Sputnik Ice Core', 'A core drilled from Sputnik Planitia\'s nitrogen glaciers.', 'Cut by the penetrator probe bay. The volatile ice fractionator splits it.']],
        ['item', 'charon_core',
            ['Charon Core', 'A core of water and ammonia ice from Charon.', 'Cut by the penetrator probe bay. The volatile ice fractionator splits it.']],
        ['item', 'planetesimal_sample',
            ['Planetesimal Sample', 'A pebble of primordial ice and dust, untouched since the system formed.', 'Caught by the Kuiper interceptor bay. The amorphous ice annealer releases its noble gases.']],
        ['item', 'heliopause_data',
            ['Heliopause Data', 'A data orb of the interstellar medium\'s density, measured at the edge of the Sun\'s reach.', 'Recorded by the precursor probe bay. The laser sail launcher needs it to set a trajectory.']],
        ['item', 'proxima_approach_data',
            ['Proxima Approach Data', 'A data orb of a few seconds of Proxima Centauri, seen from very close.', 'Read from the probe in flight by the optical ground station.']],
        ['item', 'sgr_a_star_image',
            ['Sgr A* Image', 'A ring of light around the black hole at the galaxy\'s heart.', 'Assembled by the event horizon interferometer.']],
        ['block', 'laser_module_block',
            ['Laser Module Block', 'A beamline of fibre laser modules behind a steel grille.', 'Structure block of the laser fusion chamber and the laser sail launcher.']],
        ['block', 'srf_cryomodule_block',
            ['SRF Cryomodule Block', 'A frosted cryostat with a niobium cavity inside.', 'Made by the SRF cavity works. A structure block of the synchrotron and the muon fusion cell.']],
        ['block', 'bnnt_fuel_tank',
            ['BNNT Fuel Tank', 'A wound tank of boron nitride nanotubes: tier 11, the biggest a rocket can carry.', 'Made by the cryotank winder. With elite motors it takes a rocket to level 7.']],

        ['material', 'ytterbium', ['Ytterbium']],
        ['material', 'uranium_233', ['Uranium-233']],
        ['material', 'arsine', ['Arsine']],
        ['material', 'thorium_nitride', ['Thorium Nitride']],
        ['material', 'nitrogen_15', ['Nitrogen-15']],
        ['material', 'nitrogen_15_oxide', ['Nitrogen-15 Oxide']],
        ['material', 'boron_11_trifluoride', ['Boron-11 Trifluoride']],
        ['material', 'boron_10_trifluoride', ['Boron-10 Trifluoride']],
        ['material', 'decaborane', ['Decaborane']],
        ['material', 'neptune_helium', ['Neptune Helium']],
        ['material', 'neptune_hydrogen', ['Neptune Hydrogen']],
        ['material', 'triton_nitrogen', ['Triton Nitrogen']],
        ['material', 'kuiper_noble_gas', ['Kuiper Noble Gas']],
        ['material', 'superfluid_helium', ['Superfluid Helium']],
        ['material', 'helium_3_concentrate', ['Helium-3 Concentrate']],
        ['material', 'liquid_deuterium_tritium', ['Liquid Deuterium-Tritium']]
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
            add(kind + '.grindless.' + id, t[0])
            add('tooltip.grindless.' + id + '.0', t[1])
            add('tooltip.grindless.' + id + '.1', t[2])
        })
    })
})()
