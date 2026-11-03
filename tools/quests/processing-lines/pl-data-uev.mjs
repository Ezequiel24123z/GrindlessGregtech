// pl_uev: the UEV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every UEV package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
// Eleven clusters, E1 to E11 of docs/eras/lines-uev-uxv.md (section 11): each is one trunk (the line) with feeders drawn
// as branches that join it. A branch that serves another line or era ends in a `dest` node and is not counted as a line.
// The trunk is laid out by chain(), 2.5 columns per step; earlier eras' stages are links, not copies.
import { I, F, M, L, n } from './pl-lib.mjs';

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
// the last node of a branch: it goes to another line, so the line audit does not count the branch as a line of its own
const dest = (nodes, end) => nodes.map((nd, i) => (i === nodes.length - 1 ? { ...nd, kind: 'dest', end } : nd));

export default {
  file: 'pl_uev',
  order: 10,
  title: 'UEV Lines',
  subtitle: 'Isotopes and the heaviest atoms, pressure and fibres, light for computers and clocks, and the dust and rock of other stars.',
  icon: 'gtceu:calutron',
  focus: 'cal',
  bands: [['E1', 'E2'], ['E3', 'E4'], ['E5', 'E6', 'E7'], ['E8', 'E9', 'E10', 'E11']],
  clusters: {
    // E1: from the float-zone boule to the optical computer, through the waveguide chip and the quantum photonic chip
    E1: {
      name: 'The photonic chip and the optical computer',
      nodes: [
        L('x_boule', 0, 0, 'pl_mv:boule'),
        ...chain(0, [
          ['fzb', I('grindless:fz_silicon_boule'), 'Float-Zone Boule', 'product', { from: ['x_boule'], sub: 'Zone refining' }],
          ['fzw', I('grindless:fz_silicon_wafer'), 'Float-Zone Wafer'],
          ['oxw', I('grindless:oxidised_wafer'), 'Oxidised Wafer'],
          ['scw', I('grindless:sin_coated_wafer'), 'SiN-Coated Wafer'],
          ['slw', I('grindless:sin_lithographed_wafer'), 'Lithographed Wafer'],
          ['sew', I('grindless:sin_etched_wafer'), 'Etched Wafer'],
          ['asc', I('grindless:annealed_sin_chip'), 'Annealed SiN Chip'],
          ['wg', I('grindless:waveguide_circuit'), 'Waveguide Circuit'],
          ['wsw', I('grindless:wsi_waveguide_wafer'), 'WSi Waveguide Wafer'],
          ['dww', I('grindless:detector_waveguide_wafer'), 'Detector Waveguide Wafer'],
          ['grw', I('grindless:graphene_ring_wafer'), 'Graphene Ring Wafer', 'product', { from: ['dww', 'gfl'] }],
          ['enw', I('grindless:encapsulated_ring_wafer'), 'Encapsulated Ring Wafer', 'product', { from: ['grw', 'ahf'] }],
          ['epw', I('grindless:electroded_photonic_wafer'), 'Electroded Photonic Wafer'],
          ['hqw', I('grindless:hybrid_quantum_wafer'), 'Hybrid Quantum Wafer', 'product', { from: ['epw', 'mpw'] }],
          ['cqw', I('grindless:clad_quantum_wafer'), 'Clad Quantum Wafer'],
          ['qpd', I('grindless:quantum_photonic_die'), 'Quantum Photonic Die'],
          ['pgd', I('grindless:pigtailed_quantum_die'), 'Pigtailed Die', 'product', { from: ['qpd', 'nop'] }],
          ['qpc', I('grindless:quantum_photonic_chip'), 'Quantum Photonic Chip'],
          ['pih', mach('gtceu:photonic_integration_hall'), 'Photonic Integration Hall', 'ours', { from: ['qpc', 'oa'], desc: 'Bonds the chip to the optical assembly.' }],
          ['oc', I('gtnn:optical_computer'), 'Optical Computer'],
        ], 'the next computers', 2.5),
        n('nop', 42.5, 2.5, I('gtceu:normal_optical_pipe'), 'Optical Pipe', { kind: 'raw' }),
        n('oa', 47.5, -2.5, I('gtnn:optical_assembly'), 'Optical Assembly', { kind: 'raw' }),
        // SNSPD, from the float-zone wafer
        ...dest(chain(-2.5, [
          ['wsi', I('grindless:wsi_wafer'), 'WSi Wafer', 'product', { from: ['fzw'] }],
          ['nw', I('grindless:wsi_nanowire_wafer'), 'Nanowire Wafer'],
          ['die', I('grindless:snspd_die'), 'SNSPD Die'],
          ['snspd', I('grindless:snspd'), 'SNSPD', 'product', { from: ['die', 'x_pipe'] }],
        ], null, 7.5), 'the pulsar station and the sensors'),
        L('x_pipe', 15, -5, 'pl_luv:pipe'),
        // hBN
        ...chain(-2.5, [
          ['abd2', I('gtceu:ammonia_borane_dust'), 'Ammonia Borane', 'raw'],
          ['bza', I('grindless:borazine_ampoule'), 'Borazine Ampoule'],
          ['hcf', I('grindless:hbn_copper_foil'), 'hBN on Copper'],
          ['hf', I('grindless:hbn_film'), 'hBN Film'],
          ['ahf', I('grindless:annealed_hbn_film'), 'Annealed hBN'],
        ], null, 17.5),
        // graphene
        ...chain(2.5, [
          ['cuf', I('gtceu:copper_foil'), 'Copper Foil', 'raw'],
          ['ecf', I('grindless:electropolished_copper_foil'), 'Electropolished Copper'],
          ['gcf', I('grindless:graphene_copper_foil'), 'Graphene on Copper'],
          ['pgf', I('grindless:pmma_graphene_foil'), 'PMMA Graphene Foil'],
          ['pgm', I('grindless:pmma_graphene_film'), 'PMMA Graphene Film'],
          ['gfl', I('grindless:graphene_film'), 'Graphene Film'],
        ], null, 12.5),
        n('eg', 27.5, 5, I('grindless:encapsulated_graphene'), 'Encapsulated Graphene', { kind: 'product', from: ['gfl'] }),
        n('gm', 30, 5, I('grindless:graphene_modulator'), 'Graphene Modulator', { kind: 'dest', from: ['eg', 'x_yb'], end: 'the UEV emitter' }),
        L('x_yb', 30, 7.5, 'pl_uv:fibre'),
        // quantum dots
        ...chain(2.5, [
          ['ini', I('gtceu:indium_ingot'), 'Indium Ingot', 'raw'],
          ['in7', I('grindless:seven_n_indium'), '7N Indium'],
          ['iqd', I('grindless:inas_qd_wafer'), 'InAs Quantum-Dot Wafer'],
          ['mpw', I('grindless:micropillar_wafer'), 'Micropillar Wafer'],
        ], null, 27.5),
        n('qds', 37.5, 2.5, I('grindless:qd_source'), 'Quantum-Dot Source', { kind: 'dest', from: ['mpw'], end: 'the UEV emitter and the repeater' }),
      ],
    },
    // E2: from berkelium to the tennessine sample, with the calcium-48 beam, the plutonium target and the membranes beside it
    E2: {
      name: 'Isotopes and superheavy atoms',
      nodes: [
        ...chain(0, [
          ['bkn', F('gtceu:berkelium_nitrate'), 'Berkelium Nitrate', 'raw'],
          ['bko', I('grindless:berkelium_oxide_dust'), 'Berkelium Oxide'],
          ['tw', I('grindless:target_wheel'), 'Target Wheel'],
          ['hic', mach('gtceu:heavy_ion_cyclotron'), 'Superheavy Factory', 'ours', { from: ['tw', 'pt2', 'beam'], desc: 'A calcium-48 beam on an actinide target; the atoms fly out as recoil gas.' }],
          ['tgas', F('gtceu:tennessine_recoil_gas'), 'Tennessine Recoil Gas'],
          ['tna', I('grindless:tennessine_atoms'), 'Tennessine Atoms'],
          ['tns', I('grindless:tennessine_sample'), 'Tennessine Sample', 'product', { from: ['tna', 'x_aer'] }],
        ], 'the UIV atoms'),
        L('x_aer', 15, 2.5, 'pl_zpm:aer'),
        // californium-249 wheel
        ...dest(chain(-2.5, [
          ['tcl', F('gtceu:transcurium_liquor'), 'Transcurium Liquor', 'raw'],
          ['bk', I('grindless:berkelium_249'), 'Berkelium-249'],
          ['cf9', I('gtceu:californium_249_dust'), 'Californium-249', 'product', { sub: 'Aged in the hot cell' }],
          ['cfw', I('grindless:cf249_target_wheel'), 'Californium-249 Target Wheel'],
        ], null, -7.5), 'the oganesson line'),
        // plutonium-244 target, then the flerovium atoms
        ...chain(-5, [
          ['pfd', I('gtceu:plutonium_244_dust'), 'Plutonium-244', 'raw'],
          ['po4', I('gtceu:plutonium_244_oxide_dust'), 'Plutonium-244 Oxide'],
          ['pam', I('grindless:pu244_plating_ampoule'), 'Plating Ampoule'],
        ], null, -2.5),
        n('pt2', 5, -2.5, I('grindless:plutonium_244_target'), 'Plutonium-244 Target', { kind: 'product', from: ['pam', 'x_fsc'] }),
        L('x_fsc', 5, -5, 'pl_zpm:duplate'),
        n('gas', 10, -2.5, F('gtceu:flerovium_recoil_gas'), 'Flerovium Recoil Gas', { kind: 'product', from: ['hic'] }),
        n('rec', 12.5, -2.5, mach('gtceu:heavy_ion_cyclotron'), 'Superheavy Factory', { kind: 'ours', from: ['gas', 'mem'], desc: 'Sends the gas through an etched membrane; the helium returns.' }),
        n('fl', 15, -2.5, I('grindless:flerovium_atoms'), 'Flerovium Atoms', { kind: 'dest', from: ['rec'], end: 'the superheavy census' }),
        // etched membranes
        ...chain(-5, [
          ['pc', I('grindless:polycarbonate_foil'), 'Polycarbonate Foil', 'raw'],
          ['itf', I('grindless:ion_tracked_foil'), 'Ion-Tracked Foil'],
          ['mem', I('grindless:etched_membrane'), 'Etched Membrane'],
        ], null, 7.5),
        // calcium-48
        ...chain(2.5, [
          ['cacl', I('gtceu:calcium_chloride_dust'), 'Calcium Chloride', 'raw'],
          ['cal', mach('gtceu:calutron'), 'Calutron', 'ours', { desc: 'Bends an ion beam in a magnet; each isotope lands in its own cup.' }],
          ['enrd', I('gtceu:calcium_48_enriched_dust'), 'Enriched Calcium'],
          ['enr', I('gtceu:calcium_48_enriched_chloride_dust'), 'Enriched Chloride', 'product', { sub: 'Chlorinated again' }],
          ['cal2', mach('gtceu:calutron'), 'Calutron, second pass', 'ours'],
          ['ca48', I('gtceu:calcium_48_dust'), 'Calcium-48'],
          ['crl', I('grindless:ca48_crucible_load'), 'Crucible Load'],
          ['ovc', I('grindless:ca48_oven_charge'), 'Oven Charge'],
          ['plb', I('grindless:ca48_plasma_bunch'), 'Plasma Bunch'],
          ['beam', I('grindless:ca48_beam'), 'Calcium-48 Beam', 'product', { from: ['plb', 'x_cmod'] }],
        ], null, -17.5),
        L('x_cmod', 5, 5, 'pl_uv:cmod'),
        // lithium-6 and potassium-40
        ...chain(7.5, [
          ['licl', I('gtceu:lithium_chloride_dust'), 'Lithium Chloride', 'raw'],
          ['cal4', mach('gtceu:calutron'), 'Calutron', 'ours'],
          ['li6', I('gtceu:lithium_6_dust'), 'Lithium-6'],
        ]),
        ...chain(10, [
          ['rks', I('gtceu:rock_salt_dust'), 'Rock Salt', 'raw'],
          ['cal5', mach('gtceu:calutron'), 'Calutron', 'ours'],
          ['k40', I('gtceu:potassium_40_dust'), 'Potassium-40'],
        ]),
        n('eos', 7.5, 8.75, I('grindless:degenerate_eos_model'), 'Degenerate EOS Model', {
          kind: 'product', from: ['li6', 'k40'], end: 'the stasis field',
          keepShort: 'one model fed by two calutron runs (Li-6 and K-40); both isotopes are separated from their own salt, and the single model recipe is the whole use',
        }),
      ],
    },
    // E3: rhenium, the single-crystal blade and the turbine wheel; the YSZ, hafnium, tantalum, iron and Barnard branches beside it
    E3: {
      name: 'Rhenium, the turbine wheel and vacuum metals',
      nodes: [
        ...chain(0, [
          ['rhi', I('gtceu:rhenium_ingot'), 'Rhenium Ingot', 'raw'],
          ['re6', I('grindless:six_n_rhenium'), '6N Rhenium'],
          ['sxm', I('grindless:sx_master_alloy_dust'), 'SX Master Alloy'],
          ['sxb', I('grindless:sx_blade'), 'SX Blade'],
          ['hts', I('grindless:heat_treated_sx_blade'), 'Heat-Treated Blade', 'product', { sub: 'Heat-treated in the electron beam furnace' }],
          ['bc', I('grindless:bond_coated_sx_blade'), 'Bond-Coated Blade', 'product', { from: ['hts', 'xp_pt'], sub: 'Platinum and aluminium bond coat' }],
          ['ebf', mach('gtceu:electron_beam_furnace'), 'Electron Beam Furnace', 'ours', { from: ['bc', 'ysi'], desc: 'Coats the blade in vacuum with a ceramic that resists heat.' }],
          ['cb', I('grindless:coated_sx_blade'), 'Coated SX Blade'],
          ['scf', mach('gtceu:single_crystal_foundry'), 'Single-Crystal Foundry', 'ours', { desc: 'Casts the wheel as one crystal.' }],
          ['bw', I('grindless:brayton_turbine_wheel'), 'Brayton Turbine Wheel'],
        ], 'the DFD Mk2'),
        L('xp_pt', 12.5, -2.5, 'pl_ev:pt'),
        // YSZ coating
        ...chain(2.5, [
          ['yo', I('grindless:yttrium_oxide_dust'), 'Yttrium Oxide', 'raw'],
          ['ysp', I('grindless:ysz_powder'), 'YSZ Powder'],
          ['ysi', I('grindless:ysz_ingot'), 'YSZ Ingot'],
        ], null, 7.5),
        // hafnium
        ...dest(chain(5, [
          ['zrh', I('grindless:zr_hf_chloride_dust'), 'Zr-Hf Chloride', 'raw'],
          ['hfc', I('grindless:hafnium_chloride_dust'), 'Hafnium Chloride'],
          ['hfo', I('grindless:hafnia_dust'), 'Hafnia'],
          ['hf4', I('grindless:hafnium_tetrachloride_dust'), 'Hafnium Tetrachloride'],
          ['hfs', I('grindless:hafnium_sponge'), 'Hafnium Sponge'],
          ['hf6', I('grindless:six_n_hafnium'), '6N Hafnium'],
        ]), 'the pump, the coil and the fusion alloy'),
        // tantalum
        ...dest(chain(7.5, [
          ['tan', I('gtceu:tantalite_dust'), 'Tantalite', 'raw'],
          ['tfc', I('grindless:tantalite_fluoride_cake'), 'Fluoride Cake'],
          ['ktf', I('grindless:k2taf7_dust'), 'K2TaF7'],
          ['tap', I('grindless:tantalum_powder'), 'Tantalum Powder'],
          ['ta6', I('grindless:six_n_tantalum'), '6N Tantalum'],
        ]), 'the emitter, the conveyor and the blade alloy'),
        // nitride magnet, from the carbonyl iron
        L('xp_h2', -2.5, 10, 'pl_hv:shifted'),
        ...dest(chain(10, [
          ['rip', I('grindless:reduced_iron_powder'), 'Reduced Iron Powder', 'raw', { from: ['xp_h2'], sub: 'From carbonyl iron' }],
          ['nmw', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours', { desc: 'Nitrides the iron with ammonia.' }],
          ['fe', I('gtceu:fe16n2_dust'), 'Fe16N2 Powder'],
          ['nmw2', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours', { desc: 'Anneals the powder under strain.' }],
          ['sa', I('grindless:strain_annealed_fe16n2_powder'), 'Strain-Annealed Powder'],
          ['nmw3', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours', { desc: 'Bonds the powder in polycarbonate.' }],
          ['mag', I('grindless:bonded_fe16n2_magnet'), 'Bonded Magnet'],
        ]), 'the UEV motor'),
        // Barnard's star: the iron planet's core
        ...dest(chain(12.5, [
          ['drill', mach('gtceu:barnard_core_drill'), 'Barnard Core Drill', 'ours', { desc: 'Sinks a drill into the iron planet.' }],
          ['core', I('grindless:barnard_core_rock'), 'Barnard Core Rock'],
          ['carb', mach('gtceu:carbonyl_refinery'), 'Carbonyl Refinery', 'ours', { desc: 'Carbon monoxide lifts the iron out as a gas.' }],
          ['fepc', F('gtceu:iron_pentacarbonyl'), 'Iron Pentacarbonyl'],
        ]), 'the magnet powder and the UEV motor'),
        n('res', 5, 15, I('grindless:barnard_residue'), 'Barnard Residue', { kind: 'by', from: ['carb'], end: 'rhenium, by the platinum plant' }),
      ],
    },
    // E4: polycarbosilane to the SiC/SiC plate; the HfTaCN, tungsten-fibre and niobium cavity branches beside it
    E4: {
      name: 'Silicon carbide fibre and composite',
      nodes: [
        ...chain(0, [
          ['pcs', I('grindless:polycarbosilane_dust'), 'Polycarbosilane', 'raw'],
          ['sfp', mach('gtceu:sic_fibre_plant'), 'SiC Fibre Plant', 'ours', { desc: 'Spins, cures with a beam and fires the fibre.' }],
          ['gf', I('grindless:green_sic_fibre'), 'Green Fibre'],
          ['sfp2', mach('gtceu:sic_fibre_plant'), 'SiC Fibre Plant', 'ours', { desc: 'The electron beam cures the green fibre.' }],
          ['cf', I('grindless:cured_sic_fibre'), 'Cured Fibre'],
          ['sfp3', mach('gtceu:sic_fibre_plant'), 'SiC Fibre Plant', 'ours', { desc: 'Fires the fibre; the methane and hydrogen are caught.' }],
          ['sf', I('grindless:sic_fibre'), 'SiC Fibre'],
          ['bn', I('grindless:bn_coated_sic_fibre'), 'BN-Coated Fibre', 'product', { from: ['sf'] }],
          ['pre', I('grindless:sic_fibre_preform'), 'Fibre Preform', 'product', { sub: 'Woven from the fibre above' }],
          ['cvi', mach('gtceu:cvi_furnace'), 'CVI Furnace', 'ours', { desc: 'Grows silicon carbide into the preform.' }],
          ['plate', I('grindless:sic_sic_plate'), 'SiC/SiC Plate'],
        ], 'the hull and the Mk4 casing'),
        n('hcl', 22.5, 2.5, F('gtceu:hydrochloric_acid'), 'Hydrochloric Acid', { kind: 'by', from: ['cvi'], end: 'the chlorine loop' }),
        // HfTaCN coil block
        ...dest(chain(5, [
          ['hcd', I('grindless:hftacn_crude_dust'), 'HfTaCN Crude', 'raw'],
          ['hcp', I('grindless:hftacn_powder'), 'HfTaCN Powder'],
          ['hci', I('gtceu:hftacn_ingot'), 'HfTaCN Ingot'],
          ['hce', I('grindless:hftacn_heating_element'), 'Heating Element'],
          ['hcb', I('grindless:hftacn_coil_block'), 'Coil Block', 'product', { from: ['hce', 'x_wire'] }],
        ], null, 0), 'the Mk4 reactor and the stellar forge'),
        L('x_wire', 10, 7.5, 'pl_zpm:wire'),
        // tungsten divertor and Wf/W tile
        ...dest(chain(10, [
          ['tdu', I('gtceu:tungsten_dust'), 'Tungsten Dust', 'raw'],
          ['tin', I('gtceu:tungsten_ingot'), 'Tungsten Ingot', 'product', { sub: 'Blast furnace' }],
          ['tsw', I('gtceu:tungsten_single_wire'), 'Tungsten Wire'],
          ['cww', I('grindless:coated_w_wire'), 'Coated Wire'],
          ['wfp', I('grindless:w_fibre_preform'), 'Fibre Preform'],
          ['wft', I('grindless:wf_w_tile'), 'Wf/W Tile'],
        ]), 'the Mk4 fusion casing'),
        // niobium cavities
        ...dest(chain(12.5, [
          ['nbp', I('grindless:niobium_powder'), 'Niobium Powder', 'raw'],
          ['nb6', I('grindless:six_n_niobium'), '6N Niobium'],
          ['rrr', I('grindless:rrr_niobium_sheet'), 'RRR Niobium Sheet'],
          ['hcell', I('grindless:niobium_half_cell'), 'Niobium Half-Cell'],
          ['bsc', I('grindless:bare_srf_cavity'), 'Bare Cavity'],
          ['src', I('grindless:srf_cavity'), 'SRF Cavity'],
          ['nsc', I('grindless:nb3sn_srf_cavity'), 'Nb3Sn Cavity'],
        ]), 'the cyclotron and the calutron'),
      ],
    },
    // E5: the diamond anvil to the superhydride
    E5: {
      name: 'Megabar pressure and superhydride',
      nodes: [
        ...chain(0, [
          ['pel', I('grindless:nanodiamond_pellet'), 'Nanodiamond Pellet', 'raw'],
          ['mega', mach('gtceu:megabar_press'), 'Megabar Press', 'ours', { desc: 'Squeezes the pellet between anvils into nanotwinned diamond.' }],
          ['ntd', I('grindless:nanotwinned_diamond'), 'Nanotwinned Diamond'],
          ['anv', I('grindless:nanotwinned_diamond_anvil'), 'Diamond Anvil'],
          ['mega2', mach('gtceu:megabar_press'), 'Megabar Press', 'ours', { from: ['anv', 'abc'], desc: 'Fiction: the real hydride needs over 100 GPa.' }],
          ['hyd', I('gtceu:lay_superhydride_ingot'), 'Superhydride Ingot', 'product', { role: 'infrastructure' }],
        ], 'the scoop coil'),
        ...chain(2.5, [
          ['bac', I('gtceu:boric_acid_dust'), 'Boric Acid', 'raw'],
          ['tmb', I('grindless:trimethyl_borate_ampoule'), 'Trimethyl Borate'],
          ['nbh', I('grindless:sodium_borohydride_dust'), 'Sodium Borohydride'],
          ['abd', I('gtceu:ammonia_borane_dust'), 'Ammonia Borane'],
          ['abc', I('grindless:ammonia_borane_charge'), 'Pressed Charge'],
        ], null, -2.5),
      ],
    },
    // E6: the silicon drift detector, with the lobster-eye plate beside it
    E6: {
      name: 'The drift detector and the lobster-eye optics',
      nodes: [
        ...chain(0, [
          ['fzb2', I('grindless:fz_silicon_boule'), 'Float-Zone Boule', 'raw'],
          ['fzw2', I('grindless:fz_silicon_wafer'), 'Float-Zone Wafer'],
          ['oxw2', I('grindless:oxidised_wafer'), 'Oxidised Wafer'],
          ['siw', I('grindless:sdd_implanted_wafer'), 'Implanted Wafer'],
          ['saw', I('grindless:sdd_annealed_wafer'), 'Annealed Wafer'],
          ['sdd', I('grindless:sdd'), 'Silicon Drift Detector'],
        ], 'the UEV sensor and the pulsar station'),
        ...dest(chain(2.5, [
          ['ect', I('grindless:etchable_core_tube'), 'Etchable-Core Tube', 'raw'],
          ['mmf', I('grindless:mcp_multifibre'), 'Multi-Fibre'],
          ['mbl', I('grindless:mcp_boule'), 'Fused Boule'],
          ['mpl', I('grindless:mcp_plate'), 'Sliced Plate'],
          ['mep', I('grindless:mcp_etched_plate'), 'Etched Plate'],
          ['mrp', I('grindless:mcp_reduced_plate'), 'Reduced Plate'],
          ['lem', I('grindless:lobster_eye_mcp'), 'Lobster-Eye MCP'],
        ]), 'the pulsar station'),
      ],
    },
    // E7: the entangled-photon source, with the poled crystal and the hollow-core fibre
    E7: {
      name: 'Entangled photons: PPKTP, TGG and hollow-core fibre',
      nodes: [
        ...chain(0, [
          ['tgd', I('gtceu:tgg_dust'), 'TGG Powder', 'raw'],
          ['tgb', I('grindless:tgg_boule'), 'TGG Boule'],
          ['tgr', I('grindless:tgg_rod'), 'TGG Rod'],
          ['tgp', I('grindless:tgg_polished_rod'), 'Polished Rod'],
          ['fi', I('grindless:faraday_isolator'), 'Faraday Isolator'],
          ['spd', I('grindless:spdc_source'), 'SPDC Source', 'product', { from: ['fi', 'x_pc'] }],
        ], 'the entanglement station'),
        L('x_pc', 12.5, -2.5, 'pl_uv:chip'),
        ...dest(chain(2.5, [
          ['kdp', I('grindless:kh2po4_dust'), 'KH2PO4', 'raw'],
          ['kpf', I('grindless:ktp_flux'), 'KTP Flux', 'product', { from: ['kdp', 'x_plate'] }],
          ['ktb', I('grindless:ktp_boule'), 'KTP Boule'],
          ['ktw', I('grindless:ktp_wafer'), 'KTP Wafer'],
          ['kte', I('grindless:ktp_electroded_wafer'), 'Electroded Wafer'],
        ], null, -5), 'the poled crystal of the SPDC source'),
        L('x_plate', -2.5, 5, 'pl_zpm:plate'),
        ...dest(chain(7.5, [
          ['fst', I('grindless:fused_silica_tube'), 'Fused Silica Tube', 'raw'],
          ['hcap', I('grindless:hollow_capillaries'), 'Capillaries'],
          ['stp', I('grindless:stacked_preform'), 'Stacked Preform'],
          ['cnp', I('grindless:caned_preform'), 'Caned Preform'],
          ['dhf', I('grindless:drawn_hollow_fibre'), 'Drawn Fibre'],
          ['hcf2', I('grindless:hollow_core_fibre'), 'Hollow-Core Fibre'],
        ]), 'the repeater node and the containment casing'),
      ],
    },
    // E8: interstellar dust, with the aerogel that catches it and the relay seed
    E8: {
      name: 'Dust and rock of other stars',
      nodes: [
        ...chain(0, [
          ['aer', I('grindless:aerogel_tile'), 'Aerogel Tile', 'raw'],
          ['neb', mach('gtceu:nebula_collector'), 'Nebula Collector', 'ours', { desc: 'Drags the tile through thin gas. Fiction: the real yield is tiny.' }],
          ['dla', I('grindless:dust_laden_aerogel'), 'Dust-Laden Aerogel'],
          ['dl', mach('gtceu:interstellar_dust_lab'), 'Interstellar Dust Lab', 'ours', { desc: 'Frees and cleans the grains, then measures iron-60.' }],
          ['grn', I('grindless:extracted_grains'), 'Extracted Grains'],
          ['dem', I('grindless:demineralised_grains'), 'Demineralised Grains'],
          ['fe60', I('grindless:fe60_record'), 'Iron-60 Record', 'product', { role: 'research' }],
        ], 'the pulsar chart'),
        // aerogel
        ...dest(chain(2.5, [
          ['sic4', I('gtca:silicon_tetrachloride_dust'), 'Silicon Tetrachloride', 'raw'],
          ['teo', I('grindless:teos_flask'), 'TEOS Flask'],
          ['sol', I('grindless:silica_sol'), 'Silica Sol'],
          ['wet', I('grindless:silica_wet_gel'), 'Wet Gel'],
          ['age', I('grindless:silica_aged_gel'), 'Aged Gel'],
          ['aer2', I('grindless:aerogel_tile'), 'Aerogel Tile', 'product', { role: 'infrastructure' }],
        ]), 'the nebula collector'),
        // Sirius B pellet and the relay seed (the starchip is the UV line's)
        n('dmat', 0, 6, I('grindless:degenerate_matter'), 'Degenerate Matter', { kind: 'raw' }),
        n('cell', 2.5, 8.75, I('grindless:exotic_matter_cell'), 'Exotic Matter Cell', { kind: 'raw' }),
        n('cw', 2.5, 6.75, mach('gtceu:degenerate_harvester'), 'Degenerate Works', { kind: 'ours', from: ['dmat', 'cell'], desc: 'Holds the degenerate matter in a stasis field as a pellet.' }),
        n('dpel', 5, 6.75, I('grindless:degenerate_pellet'), 'Degenerate Pellet', { kind: 'product', from: ['cw'] }),
        L('x_schip', 5, 9.5, 'pl_uv:schip'),
        n('sfab', 7.25, 8.25, mach('gtceu:starchip_fab'), 'Starchip Fab', { kind: 'ours', from: ['dpel', 'x_schip', 'cell'], desc: 'Seats the pellet and a starchip in one relay seed.' }),
        n('relay', 9.75, 8.25, I('grindless:relay_seed'), 'Relay Seed', { kind: 'product', role: 'travel', from: ['sfab'], end: 'launched from the Moon to hold a pulsar for the warp gate' }),
      ],
    },
    // E9: polarised helium-3 fuel
    E9: {
      name: 'Polarised helium-3 fuel',
      nodes: [
        L('xl_he', -2.5, 0, 'pl_ev:he3'),
        ...chain(0, [
          ['he3', F('gtceu:helium_3_6n'), 'Helium-3, 6N', 'raw', { from: ['xl_he'] }],
          ['pol', mach('gtceu:helium3_polariser'), 'Helium-3 Polariser', 'ours', { desc: 'Lines up the nuclear spins with a 1083 nm laser.' }],
          ['phe', F('gtceu:polarised_helium_3'), 'Polarised Helium-3'],
          ['dhe', F('gtceu:polarised_dhe3_fuel'), 'Polarised D-He-3 Fuel'],
        ], 'the Mk4 Fusion Reactor').map((nd) => (nd.key === 'dhe' ? { ...nd, keepShort: 'the fuel is polarised helium-3 blended with deuterium in one recipe; its helium-3 comes from the EV line (xl_he)' } : nd)),
      ],
    },
    // E10: carbon nanotube muscle
    E10: {
      name: 'Carbon nanotube muscle',
      nodes: [
        ...chain(0, [
          ['cs', I('grindless:cnt_sock'), 'CNT Sock', 'raw'],
          ['cr', I('grindless:cnt_ribbon'), 'CNT Ribbon'],
          ['cdy', I('grindless:cnt_densified_yarn'), 'Densified Yarn'],
          ['cay', I('grindless:cnt_annealed_yarn'), 'Annealed Yarn'],
          ['csy', I('grindless:cnt_sized_yarn'), 'Sized Yarn'],
          ['cty', I('grindless:cnt_twisted_yarn'), 'Twisted Yarn'],
          ['cm', I('grindless:cnt_coiled_muscle'), 'Coiled Muscle', 'product', { from: ['cty', 'x_sc'] }],
        ], 'the UEV robot arm'),
        L('x_sc', 15, 2.5, 'pl_luv:coil'),
      ],
    },
    // E11: the ULE cavity
    E11: {
      name: 'The ULE cavity',
      nodes: [
        ...chain(0, [
          ['uso', I('grindless:ule_soot'), 'ULE Soot', 'raw'],
          ['ubl', I('grindless:ule_boule'), 'ULE Boule'],
          ['usp', I('grindless:ule_spacer'), 'Spacer'],
          ['ums', I('grindless:ule_mirrored_spacer'), 'Mirrored Spacer'],
          ['ucv', I('grindless:ule_cavity'), 'ULE Cavity', 'product', { from: ['ums', 'x_mass'] }],
        ], 'the cold-atom calibrations'),
        L('x_mass', 10, 2.5, 'pl_luv:mass'),
      ],
    },
  },
};
