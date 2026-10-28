// pl_uev: the UEV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every UEV package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
// Each row is one line of docs/eras/uev.md ("New process lines"): its feedstock, its machines and its product.
// Rows are laid out by chain(), 2.5 columns per step.
import { I, F, M, n } from './pl-lib.mjs';

// a step is [key, resource, title, kind?, options?]: the first step is raw, machines are 'ours', the rest products
function chain(y, steps, end, x0 = 0) {
  const out = steps.map(([key, res, title, kind, opt], i) => n(key, x0 + 2.5 * i, y, res, title, {
    kind: kind || (i === 0 ? 'raw' : res.machine ? 'ours' : 'product'),
    ...(i > 0 ? { from: [steps[i - 1][0]] } : {}),
    ...(opt || {}),
  }));
  const last = out[out.length - 1];
  if (end && last.kind !== 'ours') last.end = end;
  return out;
}
const mach = (id) => M(id);

export default {
  file: 'pl_uev',
  order: 10,
  title: 'UEV Lines',
  subtitle: 'Isotopes and the heaviest atoms, pressure and fibres, light for computers and clocks, and the dust and rock of other stars.',
  icon: 'gtceu:calutron',
  focus: 'cal',
  bands: [['isotopes', 'pressure'], ['light', 'stars']],
  clusters: {
    isotopes: {
      name: 'Isotopes and superheavy atoms',
      nodes: [
        // calcium-48
        ...chain(0, [
          ['cacl', I('gtceu:calcium_chloride_dust'), 'Calcium Chloride', 'raw'],
          ['cal', mach('gtceu:calutron'), 'Calutron', 'ours', { desc: 'Bends an ion beam in a magnet; each isotope lands in its own cup.' }],
          ['enrd', I('gtceu:calcium_48_enriched_dust'), 'Enriched Calcium'],
          ['enr', I('gtceu:calcium_48_enriched_chloride_dust'), 'Enriched Chloride', 'product', { from: [], sub: 'Chlorinated again' }],
          ['cal2', mach('gtceu:calutron'), 'Calutron, second pass', 'ours'],
          ['ca48', I('gtceu:calcium_48_dust'), 'Calcium-48'],
        ], 'the beam of the cyclotron'),
        // flerovium atoms
        ...chain(2, [
          ['pt', I('grindless:plutonium_244_target'), 'Plutonium-244 Target', 'raw'],
          ['hic', mach('gtceu:heavy_ion_cyclotron'), 'Heavy Ion Cyclotron', 'ours', { desc: 'A calcium-48 beam on an actinide target; the atoms fly out as recoil gas.' }],
          ['gas', F('gtceu:flerovium_recoil_gas'), 'Flerovium Recoil Gas'],
          ['rec', mach('gtceu:recoil_separator'), 'Recoil Separator', 'ours', { desc: 'Sends the gas through an etched membrane; the helium returns.' }],
          ['fl', I('grindless:flerovium_atoms'), 'Flerovium Atoms'],
        ], 'the superheavy census'),
        // etched membranes
        ...chain(4, [
          ['pc', I('grindless:polycarbonate_foil'), 'Polycarbonate Foil', 'raw'],
          ['itf', I('grindless:ion_tracked_foil'), 'Ion-Tracked Foil'],
          ['mem', I('grindless:etched_membrane'), 'Etched Membrane'],
          ['rec2', mach('gtceu:recoil_separator'), 'Recoil Separator', 'ours'],
          ['fl2', I('grindless:flerovium_atoms'), 'Flerovium Atoms'],
        ], 'the superheavy census'),
      ],
    },
    pressure: {
      name: 'Megabar pressure, vacuum metals and fibres',
      nodes: [
        // superhydride
        ...chain(0, [
          ['pel', I('grindless:nanodiamond_pellet'), 'Nanodiamond Pellet', 'raw'],
          ['mega', mach('gtceu:megabar_press'), 'Megabar Press', 'ours', { desc: 'Squeezes the pellet between anvils into nanotwinned diamond.' }],
          ['ntd', I('grindless:nanotwinned_diamond'), 'Nanotwinned Diamond'],
          ['anv', I('grindless:nanotwinned_diamond_anvil'), 'Diamond Anvil'],
          ['mega2', mach('gtceu:megabar_press'), 'Megabar Press', 'ours', { desc: 'Fiction: the real hydride needs over 100 GPa.' }],
          ['hyd', I('gtceu:lay_superhydride_ingot'), 'Superhydride Ingot'],
        ], 'the scoop coil'),
        // SX turbine wheel
        ...chain(2, [
          ['bc', I('grindless:bond_coated_sx_blade'), 'Bond-Coated Blade', 'raw'],
          ['ebf', mach('gtceu:electron_beam_furnace'), 'Electron Beam Furnace', 'ours', { desc: 'Coats the blade in vacuum with a ceramic that resists heat.' }],
          ['cb', I('grindless:coated_sx_blade'), 'Coated SX Blade'],
          ['scf', mach('gtceu:single_crystal_foundry'), 'Single-Crystal Foundry', 'ours', { desc: 'Casts the wheel as one crystal.' }],
          ['bw', I('grindless:brayton_turbine_wheel'), 'Brayton Turbine Wheel'],
        ], 'the DFD Mk2'),
        // silicon carbide fibre
        ...chain(4, [
          ['pcs', I('grindless:polycarbosilane_dust'), 'Polycarbosilane', 'raw'],
          ['sfp', mach('gtceu:sic_fibre_plant'), 'SiC Fibre Plant', 'ours', { desc: 'Spins, cures with a beam and fires the fibre.' }],
          ['gf', I('grindless:green_sic_fibre'), 'Green Fibre'],
          ['sfp2', mach('gtceu:sic_fibre_plant'), 'SiC Fibre Plant', 'ours', { desc: 'The electron beam cures the green fibre.' }],
          ['cf', I('grindless:cured_sic_fibre'), 'Cured Fibre'],
          ['sfp3', mach('gtceu:sic_fibre_plant'), 'SiC Fibre Plant', 'ours', { desc: 'Fires the fibre; the methane and hydrogen are caught.' }],
          ['sf', I('grindless:sic_fibre'), 'SiC Fibre'],
        ], 'the preform'),
        ...chain(6, [
          ['pre', I('grindless:sic_fibre_preform'), 'Fibre Preform', 'raw', { sub: 'Woven from the fibre above' }],
          ['cvi', mach('gtceu:cvi_furnace'), 'CVI Furnace', 'ours', { desc: 'Grows silicon carbide into the preform.' }],
          ['plate', I('grindless:sic_sic_plate'), 'SiC/SiC Plate'],
        ], 'the hull and the Mk4 casing'),
        n('hcl', 5, 7.5, F('gtceu:hydrochloric_acid'), 'Hydrochloric Acid', { kind: 'by', from: ['cvi'], end: 'the chlorine loop' }),
        // nitride magnet
        ...chain(9.5, [
          ['rip', I('grindless:reduced_iron_powder'), 'Reduced Iron Powder', 'raw', { sub: 'From carbonyl iron' }],
          ['nmw', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours', { desc: 'Nitrides the iron with ammonia.' }],
          ['fe', I('gtceu:fe16n2_dust'), 'Fe16N2 Powder'],
          ['nmw2', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours', { desc: 'Anneals the powder under strain.' }],
          ['sa', I('grindless:strain_annealed_fe16n2_powder'), 'Strain-Annealed Powder'],
          ['nmw3', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours', { desc: 'Bonds the powder in polycarbonate.' }],
          ['mag', I('grindless:bonded_fe16n2_magnet'), 'Bonded Magnet'],
        ], 'the UEV motor'),
      ],
    },
    light: {
      name: 'Single photons, photonic chips and cold atoms',
      nodes: [
        // SNSPD
        ...chain(0, [
          ['fz', I('grindless:fz_silicon_wafer'), 'Float-Zone Wafer', 'raw'],
          ['wsi', I('grindless:wsi_wafer'), 'WSi Wafer'],
          ['nw', I('grindless:wsi_nanowire_wafer'), 'Nanowire Wafer'],
          ['die', I('grindless:snspd_die'), 'SNSPD Die'],
          ['snspd', I('grindless:snspd'), 'SNSPD'],
        ], 'the photonic chip and the pulsar station'),
        // photonic chip
        ...chain(2, [
          ['sin', I('grindless:annealed_sin_chip'), 'Annealed SiN Chip', 'raw'],
          ['wg', I('grindless:waveguide_circuit'), 'Waveguide Circuit'],
          ['qpc', I('grindless:quantum_photonic_chip'), 'Quantum Photonic Chip'],
          ['pih', mach('gtceu:photonic_integration_hall'), 'Photonic Integration Hall', 'ours', { desc: 'Bonds the chip to the optical assembly.' }],
          ['oc', I('gtnn:optical_computer'), 'Optical Computer'],
        ], 'the next computers'),
        // polarised helium-3
        ...chain(4, [
          ['he3', F('gtceu:helium_3_6n'), 'Helium-3, 6N', 'raw'],
          ['pol', mach('gtceu:helium3_polariser'), 'Helium-3 Polariser', 'ours', { desc: 'Lines up the nuclear spins with a 1083 nm laser.' }],
          ['phe', F('gtceu:polarised_helium_3'), 'Polarised Helium-3'],
          ['dhe', F('gtceu:polarised_dhe3_fuel'), 'Polarised D-He-3 Fuel'],
        ], 'the Mk4 Fusion Reactor'),
      ],
    },
    stars: {
      name: 'Dust and rock of other stars',
      nodes: [
        // interstellar dust
        ...chain(0, [
          ['aer', I('grindless:aerogel_tile'), 'Aerogel Tile', 'raw'],
          ['neb', mach('gtceu:nebula_collector'), 'Nebula Collector', 'ours', { desc: 'Drags the tile through thin gas. Fiction: the real yield is tiny.' }],
          ['dla', I('grindless:dust_laden_aerogel'), 'Dust-Laden Aerogel'],
          ['dl', mach('gtceu:interstellar_dust_lab'), 'Interstellar Dust Lab', 'ours', { desc: 'Frees and cleans the grains, then measures iron-60.' }],
          ['grn', I('grindless:extracted_grains'), 'Extracted Grains'],
          ['dem', I('grindless:demineralised_grains'), 'Demineralised Grains'],
          ['fe60', I('grindless:fe60_record'), 'Iron-60 Record'],
        ], 'the pulsar chart'),
        // carbonyl iron
        ...chain(2, [
          ['drill', mach('gtceu:barnard_core_drill'), 'Barnard Core Drill', 'ours', { desc: 'Sinks a drill into the iron planet.' }],
          ['core', I('grindless:barnard_core_rock'), 'Barnard Core Rock'],
          ['carb', mach('gtceu:carbonyl_refinery'), 'Carbonyl Refinery', 'ours', { desc: 'Carbon monoxide lifts the iron out as a gas.' }],
          ['fepc', F('gtceu:iron_pentacarbonyl'), 'Iron Pentacarbonyl'],
        ], 'the magnet powder and the UEV motor'),
        n('res', 7.5, 3.5, I('grindless:barnard_residue'), 'Barnard Residue', { kind: 'by', from: ['carb'], end: 'rhenium, by the platinum plant' }),
      ],
    },
  },
};
