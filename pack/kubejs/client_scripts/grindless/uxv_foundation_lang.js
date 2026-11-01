// priority: 1601
// Gregtech Grindless - names and tooltips of the UXV foundation (startup_scripts/grindless/uxv/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//   grindless:<material> (GT material)       material.grindless.<n>
//   gtceu:uxv_<machine> (hull and hatches)   block.gtceu.uxv_<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // id, name, tip 0, tip 1
    var ITEMS = [
        ['cofeb_target', 'CoFeB Sputter Target', 'Bonded CoFeB for the magnetic layers.', 'Spent targets are pressed again.'],
        ['mgo_target', 'MgO Sputter Target', 'The oxide barrier of a tunnel junction.', 'Spent targets are pressed again.'],
        ['heusler_target', 'Heusler Sputter Target', 'Co2MnSi, a half-metal for the free layers.', 'Spent targets are pressed again.'],
        ['saf_target_set', 'SAF Target Set', 'The Ru spacer and pinned layers of a synthetic antiferromagnet.', 'Spent targets are pressed again.'],
        ['ta_seed_target', 'Ta Seed Target', 'Tantalum for the seed layer under a stack.', 'Spent targets are pressed again.'],
        ['srruo3_target', 'SrRuO3 Target', 'An oxide electrode for pulsed laser deposition.', 'Used up in the oxide PLD chamber.'],
        ['la_bfo_target', 'La-BFO Target', 'La-doped bismuth ferrite, a multiferroic.', 'Used up in the oxide PLD chamber.'],
        ['cofeb_ingot', 'CoFeB Ingot', 'A glassy magnetic alloy, melted levitated.', 'Ground to powder for targets.'],
        ['heusler_ingot', 'Heusler Ingot', 'Co2MnSi melted levitated.', 'Ground to powder for targets.'],
        ['terfenol_d_ingot', 'Terfenol-D Ingot', 'The most magnetostrictive alloy known.', 'Grown into a rod in a Bridgman furnace.'],
        ['ni_mn_ga_ingot', 'Ni-Mn-Ga Ingot', 'A shape-memory alloy with a magnetic trigger.', 'Grown into a crystal in a Bridgman furnace.'],
        ['ta_foil', 'Ta Foil', 'Tantalum foil for spin-orbit torque layers.', 'Rolled from a Ta ingot.'],
        ['pt_sheet', 'Pt Sheet', 'A thin platinum sheet for antennas and crucibles.', 'The offcuts go back to the platinum plant.'],
        ['dysco3_substrate', 'DyScO3 Substrate', 'A lattice-matched base for oxide films.', 'Grown by the Czochralski method.'],
        ['ggg_wafer', 'GGG Wafer', 'Gadolinium gallium garnet, the base for YIG.', 'Cut from a Czochralski boule.'],
        ['hbn_crystal', 'hBN Crystal', 'A flake of hexagonal boron nitride.', 'Insulates the layers of a van der Waals stack.'],
        ['wte2_crystal', 'WTe2 Crystal', 'A layered crystal with a strong spin-orbit effect.', 'Grown by chemical vapour transport.'],
        ['fgt_crystal', 'Fe3GeTe2 Crystal', 'A layered ferromagnet that works as a thin flake.', 'Grown by chemical vapour transport.'],
        ['mtj_stack_wafer', 'MTJ Stack Wafer', 'A wafer carrying a magnetic tunnel junction stack.', 'Made in the MTJ sputter cluster.'],
        ['mram_stack_wafer', 'MRAM Stack Wafer', 'A wafer carrying a memory stack with a Heusler layer.', 'Made in the MTJ sputter cluster.'],
        ['saf_track_wafer', 'SAF Track Wafer', 'A wafer carrying a racetrack stack.', 'Made in the MTJ sputter cluster.'],
        ['mtj_die', 'MTJ Die', 'A magnetic tunnel junction, probed and diced.', 'Part of the spintronic circuits.'],
        ['mram_wafer', 'MRAM Wafer', 'A wafer of finished magnetic memory.', 'Part of the spintronic circuits.'],
        ['srruo3_electrode_wafer', 'SrRuO3 Electrode Wafer', 'An oxide electrode grown on a substrate.', 'Made in the oxide PLD chamber.'],
        ['me_switch_wafer', 'ME Switch Wafer', 'A magnetoelectric switch film on an oxide stack.', 'Made in the oxide PLD chamber.'],
        ['sot_readout_stack', 'SOT Readout Stack', 'A stack that reads a spin by its torque.', 'Made in the vdW stacking cell.'],
        ['meso_logic_die', 'MESO Logic Die', 'A magnetoelectric spin-orbit logic die.', 'Part of the spintronic circuits.'],
        ['racetrack_chip', 'Racetrack Chip', 'A memory where domain walls run along a track.', 'Made in the racetrack fab.'],
        ['magnonic_bus', 'Magnonic Bus', 'A YIG waveguide that carries spin waves.', 'Made in the YIG LPE furnace line.'],
        ['sin_membrane', 'SiN Membrane', 'A thin silicon nitride film that holds an aperture.', 'Back-etched before use.'],
        ['nanoaperture_array', 'Nanoaperture Array', 'Holes 70 nm wide written in a membrane.', 'Used in the weak link of a gyroscope.'],
        ['rf_carpet_board', 'RF Carpet Board', 'Electrodes that sweep ions to a nozzle.', 'Part of a gas stopping cell.'],
        ['kr_f2_premix', 'KrF2 Premix', 'The gas charge of an excimer laser.', 'Used up as the laser fires.'],
        ['krf_excimer_laser', 'KrF Excimer Laser', 'The light source of the oxide PLD chamber.', 'A machine part, not a machine.'],
        ['pt_lpe_crucible', 'Pt LPE Crucible', 'A platinum crucible for a molten flux.', 'A machine part of the YIG LPE furnace.'],
        ['gas_stopping_cell', 'Gas Stopping Cell', 'A helium cell that stops fast ions.', 'A machine part of the MNT collider.'],
        ['shequid_gyro', 'SHeQUID Gyroscope', 'A superfluid helium quantum interference gyroscope.', 'Made at the SHeQUID works.'],

        ['stno_stack_wafer', 'STNO Stack Wafer', 'A thick free layer for a spin-torque oscillator.', 'Made in the MTJ sputter cluster.'],
        ['stno_array', 'STNO Array', 'Oscillators that pulse in phase as a spin-wave source.', 'Feeds the magnonic bus.'],
        ['gum_metal_billet', 'Gum Metal Billet', 'A Ti-Nb-Ta-Zr-O billet that bends like rubber.', 'Sintered in the powder bed.'],
        ['gum_metal_blank', 'Gum Metal Blank', 'A blank cut for a flexspline.', 'Made from a gum metal billet.'],
        ['gum_metal_flexspline', 'Gum Metal Flexspline', 'A cup that flexes without fatigue.', 'Part of a strain wave gear.'],
        ['uxv_strain_wave_gear', 'UXV Strain Wave Gear', 'A gear with no backlash and a huge ratio.', 'Used in the UXV robot arm.'],
        ['encoder_ring', 'Encoder Ring', 'A ring that tells a joint its angle.', 'Becomes a multipole ring.'],
        ['multipole_encoder_ring', 'Multipole Encoder Ring', 'A ring with many magnetic poles for fine angles.', 'Read by a TMR encoder.'],
        ['tmr_encoder', 'TMR Encoder', 'A tunnel magnetoresistance angle sensor.', 'Part of the UXV robot arm.'],
        ['ga2o3_wafer', 'Ga2O3 Wafer', 'A wide-gap oxide wafer from edge-defined growth.', 'Cut into power dies.'],
        ['ga2o3_power_die', 'Ga2O3 Power Die', 'A switch that stands very high voltages.', 'Part of the UXV energy hatches.'],
        ['mu_metal_foil', 'Mu-Metal Foil', 'A foil that shields a part from stray fields.', 'Part of shielded circuits.'],
        ['shielded_interposer', 'Shielded Interposer', 'A carrier board inside a mu-metal shield.', 'Part of the Mk6 fusion ring.'],
        ['finemet_ribbon', 'Finemet Ribbon', 'A nanocrystalline ribbon spun from a melt.', 'Wound into a toroid.'],
        ['finemet_toroid', 'Finemet Toroid', 'A wound ring of Finemet ribbon.', 'Annealed into a core.'],
        ['finemet_core', 'Finemet Core', 'A soft magnetic core with very low loss.', 'Part of the UXV voltage coil.'],
        ['uxv_voltage_coil', 'UXV Voltage Coil', 'A coil that steps a hatch up to UXV voltage.', 'Part of the UXV hull and hatches.'],

        ['fm257_target', 'Fm-257 Target', 'A target wheel loaded with fermium-257.', 'Spent wheels come back as actinide waste.'],
        ['cm248_target', 'Cm-248 Target', 'A target wheel loaded with curium-248.', 'Spent wheels come back as actinide waste.'],
        ['element_121_recoil', 'Element 121 Recoil', 'A few atoms of element 121, caught on a foil.', 'Counted in the superheavy census.'],
        ['element_122_recoil', 'Element 122 Recoil', 'A few atoms of element 122, caught on a foil.', 'Counted in the superheavy census.'],
        ['superheavy_census_iii', 'Superheavy Census III', 'The decay chains of elements 121 and 122.', 'Points to the island of stability.'],
        ['spent_actinide_target', 'Spent Actinide Target', 'A used Fm, Es or Cm target, still radioactive.', 'Reprocessed in the cyclotron works.'],
        ['u238_ion_source', 'U-238 Ion Source', 'Uranium-238 ready to be ionised.', 'Feeds the heavy ion collider.'],
        ['u238_beam_charge', 'U-238 Beam Charge', 'A charge of uranium ions for the collider.', 'Used up by the collider.'],
        ['island_nuclide', 'Island Nuclide', 'A nuclide near the island of stability.', 'Measured for the island chart.'],
        ['island_chart', 'Island Chart', 'A chart of the island of stability.', 'A data item, kept.'],

        ['tetrataenite_lamination', 'Tetrataenite Lamination', 'A thin sheet of ordered iron-nickel.', 'Stacked into a rotor.'],
        ['tetrataenite_rotor', 'Tetrataenite Rotor', 'A rotor of a meteorite magnet with no rare earths.', 'Part of the UXV electric motor.'],
        ['strand_stator', 'Strand Stator', 'A stator wound from a pasta strand.', 'Part of the UXV electric motor.'],
        ['strand_tape', 'Strand Tape', 'A strand pressed into a tape.', 'Wound into coils.'],
        ['alip_duct', 'ALIP Duct', 'A duct for a liquid-metal induction pump.', 'Part of the UXV electric pump.'],
        ['w184_cvi_preform', 'W-184 CVI Preform', 'A woven tungsten-184 fibre body.', 'Infiltrated in the CVI furnace.'],
        ['terfenol_d_rod', 'Terfenol-D Rod', 'A rod grown along its best axis.', 'Part of the UXV electric piston.'],
        ['ni_mn_ga_crystal', 'Ni-Mn-Ga Crystal', 'A single crystal that changes shape in a field.', 'Part of the UXV electric piston.'],
        ['cnt_bumper_weave', 'CNT Bumper Weave', 'A carbon nanotube weave that stops dust.', 'The outer layer of a Whipple shield.'],
        ['cnt_whipple_shield', 'CNT Whipple Shield', 'A spaced shield against hypervelocity dust.', 'Protects the far platforms.'],
        ['frc_cartridge', 'FRC Cartridge', 'A field-reversed plasma formed and sealed.', 'Part of the UXV field generator.'],
        ['gamma_laser_module', 'Gamma Laser Module', 'A module that fires annihilation photons.', 'Part of the UXV emitter.'],
        ['positron_stack', 'Positron Stack', 'Positrons held in a trap stack.', 'Used up by the annihilation laser.'],
        ['ti44_core', 'Ti-44 Core', 'A core of titanium-44 for a gamma source.', 'Part of the gamma laser module.'],
        ['si28_ash', 'Si-28 Ash', 'Silicon-28 from oxygen burning.', 'Goes to the silicon-28 wafer line.'],

        ['raw_pasta', 'Raw Pasta', 'Crust matter from a neutron star, unsorted.', 'It exists only at Vela.'],
        ['spaghetti_phase', 'Spaghetti Phase', 'Nuclear matter in long rods.', 'Drawn into strands.'],
        ['lasagna_phase', 'Lasagna Phase', 'Nuclear matter in flat sheets.', 'Pressed into plates.'],
        ['gnocchi_fragment', 'Gnocchi Fragment', 'Nuclear matter in small lumps.', 'Sorted before use.'],
        ['anti_phase_residue', 'Anti-Phase Residue', 'What is left when a phase is split.', 'Goes back to the crust.'],
        ['lasagna_plate', 'Lasagna Plate', 'A plate of nuclear matter in the lasagna phase.', 'Part of the UXV hull.'],
        ['pasta_core_sample', 'Pasta Core Sample', 'A core drilled from the crust.', 'Sorted into phases.'],
        ['ejecta_knot_dust', 'Ejecta Knot Dust', 'Dust of a knot flung out by a supernova.', 'It is rich in titanium-44.'],
        ['refractory_condensate', 'Refractory Condensate', 'The first solid to condense from a hot cut.', 'Split into ordinary metals.'],
        ['metal_condensate', 'Metal Condensate', 'Metal that condenses from a heavy cut.', 'Split into ordinary metals.'],
        ['silicate_condensate', 'Silicate Condensate', 'Rock that condenses from a heavy cut.', 'Split into ordinary minerals.'],

        ['vela_glitch_timing', 'Vela Glitch Timing', 'Pulse times around a glitch of the Vela pulsar.', 'Becomes a glitch record.'],
        ['vela_glitch_record', 'Vela Glitch Record', 'A reduced record of a pulsar glitch.', 'A data item.'],
        ['cygnus_vlbi_record', 'Cygnus VLBI Record', 'Interferometer data from Cygnus X-1.', 'A data item.'],
        ['elevator_log', 'Elevator Log', 'The log of a run of the stellar elevator.', 'A data item.'],
        ['ti44_map', 'Ti-44 Map', 'Where titanium-44 sits in the remnant.', 'A data item.'],
        ['arm_chart', 'Arm Chart', 'A chart of the galactic arm.', 'A data item.'],
        ['bulge_chart', 'Bulge Chart', 'A chart of the galactic bulge.', 'A data item.'],
        ['pasta_strand_repeater', 'Pasta Strand Repeater', 'A repeater that links a wireless network by a strand.', 'The link of the UXV wireless row.']
    ]

    // id, name, tip 0, tip 1
    var BLOCKS = [
        ['uxv_fusion_casing', 'UXV Fusion Casing', 'A wall of W-184 fibre that faces the hottest plasma.', 'The structure block of the Mk6 fusion reactor.']
    ]

    // kind, id, name
    var NAMES = [
        ['material', 'pasta_strand', 'Pasta Strand'],
        ['material', 'titanium_44', 'Titanium-44'],
        ['material', 'fermium_257', 'Fermium-257'],
        ['material', 'tungsten_184', 'Tungsten-184'],
        ['material', 'oxygen_16', 'Oxygen-16'],
        ['material', 'cofeb', 'CoFeB'],
        ['material', 'co2mnsi', 'Co2MnSi (Heusler)'],
        ['material', 'terfenol_d', 'Terfenol-D'],
        ['material', 'ni2mnga', 'Ni2MnGa'],
        ['material', 'dysco3', 'Dysprosium Scandate'],
        ['material', 'srruo3', 'Strontium Ruthenate'],
        ['material', 'la_bfo', 'La-Doped Bismuth Ferrite'],
        ['material', 'ggg', 'Gadolinium Gallium Garnet'],
        ['material', 'yig', 'Yttrium Iron Garnet'],
        ['material', 'hbn', 'Hexagonal Boron Nitride'],
        ['material', 'wte2', 'Tungsten Ditelluride'],
        ['material', 'fe3gete2', 'Iron Germanium Telluride'],
        ['gmaterial', 'stellar_plasma', 'Stellar Plasma'],
        ['gmaterial', 'disk_plasma', 'Accretion Disk Plasma'],
        ['gmaterial', 'filtered_disk_plasma', 'Filtered Disk Plasma'],
        ['gmaterial', 'flux_loaded_plasma', 'Flux-Loaded Plasma'],
        ['gmaterial', 'stellar_hydrogen_cut', 'Stellar Hydrogen Cut'],
        ['gmaterial', 'stellar_helium_cut', 'Stellar Helium Cut'],
        ['gmaterial', 'stellar_cno_cut', 'Stellar CNO Cut'],
        ['gmaterial', 'stellar_heavy_cut', 'Stellar Heavy Cut'],
        ['gmaterial', 'triple_alpha_fuel', 'Triple-Alpha Fuel'],
        ['gmaterial', 'carbon_burning_fuel', 'Carbon-Burning Fuel'],
        ['gmaterial', 'oxygen_burning_fuel', 'Oxygen-Burning Fuel'],
        ['gmaterial', 'cno_ash_plasma', 'CNO Ash Plasma'],
        ['gmaterial', 'helium_burning_ash_plasma', 'Helium-Burning Ash Plasma'],
        ['gmaterial', 'carbon_burning_ash_plasma', 'Carbon-Burning Ash Plasma'],
        ['gmaterial', 'oxygen_burning_ash_plasma', 'Oxygen-Burning Ash Plasma'],
        ['gmaterial', 'lpe_flux', 'LPE Flux'],
        ['gmaterial', 'he_6n', 'Helium-6N'],
        ['gmaterial', 'mnt_product_gas', 'MNT Product Gas'],
        ['gmaterial', 'finemet_melt', 'Finemet Melt'],
        ['gmaterial', 'volatile_condensate', 'Volatile Condensate'],

        ['machine', 'uxv_machine_hull', 'UXV Machine Hull'],
        ['machine', 'uxv_energy_input_hatch', 'UXV Energy Hatch'],
        ['machine', 'uxv_energy_output_hatch', 'UXV Dynamo Hatch'],
        ['machine', 'uxv_energy_input_hatch_16a', 'UXV 16A Energy Hatch'],
        ['machine', 'uxv_energy_output_hatch_16a', 'UXV 16A Dynamo Hatch']
    ]

    var PREFIX = { material: 'material.gtceu.', gmaterial: 'material.grindless.', machine: 'block.gtceu.' }

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        var tipped = function (kind) {
            return function (e) {
                add(kind + '.grindless.' + e[0], e[1])
                add('tooltip.grindless.' + e[0] + '.0', e[2])
                add('tooltip.grindless.' + e[0] + '.1', e[3])
            }
        }
        ITEMS.forEach(tipped('item'))
        BLOCKS.forEach(tipped('block'))
        NAMES.forEach(function (e) { add(PREFIX[e[0]] + e[1], e[2]) })
    })
})()
