// pl_uv: the UV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every UV package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
import { I, F, M, n, L, via } from './pl-lib.mjs';

export default {
  file: 'pl_uv',
  order: 8,
  title: 'UV Lines',
  subtitle: 'Thorium and nitrogen-15, superfluid helium and its beams, laser fusion fuel and fibre lasers, and the ices of Pluto and the Kuiper belt.',
  icon: 'gtceu:pyroprocessing_cell',
  focus: 'pyro',
  bands: [['thorium', 'n15'], ['cold', 'beams'], ['fuel', 'lasers'], ['pluto', 'kuiper']],
  clusters: {
    thorium: {
      name: 'Thorium and uranium-233',
      nodes: [
        n('th', 0, 0, I('gtceu:thorium_dust'), 'Thorium', { kind: 'raw', sub: 'The pyroprocessing cell sends most of it back' }),
        n('n15in', 0, 1.5, F('gtceu:nitrogen_15'), 'Nitrogen-15', { kind: 'raw', sub: 'From Triton, and back from the cell' }),
        n('oxide', 2.5, -0.75, I('grindless:thorium_oxide_fuel_assembly'), 'Thorium Oxide Assembly', { kind: 'product', from: ['th'], sub: 'Pressed with oxygen in the fuel fabrication plant' }),
        n('nitride', 2.5, 0.75, I('grindless:thorium_nitride_fuel_assembly'), 'Thorium Nitride Assembly', {
          kind: 'product', from: ['th', 'n15in'], sub: 'Carbon and nitrogen-15; it breeds better',
        }),
        n('adr', 5, 0, M('gtceu:accelerator_driven_reactor'), 'Accelerator-Driven Reactor', {
          kind: 'ours', from: ['oxide', 'nitride'],
          desc: 'A proton beam keeps a subcritical core going. The lead-bismuth pool is never used up.',
        }),
        n('spent', 7.5, -0.75, I('grindless:spent_thorium_oxide_fuel'), 'Spent Oxide Fuel', { kind: 'product', from: ['adr'] }),
        n('spentN', 7.5, 0.75, I('grindless:spent_thorium_nitride_fuel'), 'Spent Nitride Fuel', { kind: 'product', from: ['adr'] }),
        n('po', 7.5, 2.25, F('gtceu:polonium_210'), 'Polonium-210', { kind: 'by', from: ['adr'], end: 'contained: it decays to lead in a chemical reactor' }),
        n('pyro', 10, 0, M('gtceu:pyroprocessing_cell'), 'Pyroprocessing Cell', {
          kind: 'ours', from: ['spent', 'spentN'],
          desc: 'Melts the spent fuel in lithium chloride and collects the bred uranium on a cathode.',
        }),
        n('u233', 12.5, -1.5, I('gtceu:uranium_233_ingot'), 'Uranium-233', { kind: 'product', from: ['pyro'], sub: 'Keep some for UHV' }),
        n('rod', 15, -1.5, I('grindless:u233_fuel_rod'), 'U-233 Fuel Rod', { kind: 'product', from: ['u233'], end: 'the IV fission reactor' }),
        n('thret', 12.5, 0, I('gtceu:thorium_dust'), 'Thorium', { kind: 'ret', from: ['pyro'], sub: 'Back into fresh assemblies' }),
        n('n15ret', 12.5, 1.5, F('gtceu:nitrogen_15'), 'Nitrogen-15', { kind: 'ret', from: ['pyro'], sub: 'The nitride gives its nitrogen back' }),
        n('salt', 12.5, 3, F('gtceu:loaded_licl_salt'), 'Loaded Salt', { kind: 'product', from: ['pyro'], sub: 'Cleaned in the same cell' }),
        n('waste', 15, 3, I('gtnn:radioactive_waste'), 'Radioactive Waste', { kind: 'by', from: ['salt'], end: 'contained: the waste store' }),
        n('licl', 15, 4.5, F('gtceu:licl_salt'), 'Clean Salt', { kind: 'ret', from: ['salt'], sub: 'Back into the cell' }),
      ],
    },
    n15: {
      name: 'Nitrogen-15 from Triton',
      nodes: [
        n('sampler', 0, 0, M('gtceu:triton_geyser_sampler'), 'Triton Geyser Sampler', {
          kind: 'ours', desc: 'Flies through Triton\'s geysers from Neptune orbit.',
        }),
        n('tn', 2.5, 0, F('gtceu:triton_nitrogen'), 'Triton Nitrogen', { kind: 'product', from: ['sampler'], sub: 'Rich in nitrogen-15' }),
        n('tholin', 2.5, 1.5, I('grindless:tholin'), 'Tholin', { kind: 'by', from: ['sampler'], end: 'the tholin reformer' }),
        n('tno', 5, 0, F('gtceu:triton_nitric_oxide'), 'Triton Nitric Oxide', { kind: 'product', from: ['tn'], sub: 'Burnt with oxygen in a chemical reactor' }),
        n('n15o', 7.5, 0, F('gtceu:nitrogen_15_oxide'), 'Nitrogen-15 Oxide', { kind: 'product', from: ['tno'], sub: 'Distilled out in the EV cryogenic plant' }),
        n('n15', 10, 0, F('gtceu:nitrogen_15'), 'Nitrogen-15', { kind: 'product', from: ['n15o'], sub: 'Reduced with hydrogen; the water goes to the network' }),
      ],
    },
    cold: {
      name: 'Superfluid helium and cavities',
      nodes: [
        n('nb', 0, -1.5, I('gtceu:niobium_ingot'), 'Niobium', { kind: 'raw' }),
        n('sheet', 2.5, -1.5, I('grindless:rrr_niobium_sheet'), 'RRR Niobium Sheet', { kind: 'product', from: ['nb'], sub: 'Melted very pure in the cavity works' }),
        n('bare', 5, -1.5, I('grindless:bare_srf_cavity'), 'Bare Cavity', { kind: 'product', from: ['sheet'], sub: 'Nine cells, formed in the same works' }),
        n('works', 7.5, -1.5, M('gtceu:srf_cavity_works'), 'SRF Cavity Works', {
          kind: 'ours', from: ['bare'], desc: 'Melts the niobium very pure, forms nine-cell cavities and polishes them in acid.',
        }),
        n('acid', 10, -3, F('gtceu:spent_electropolish_acid'), 'Spent Acid', { kind: 'by', from: ['works'], end: 'electrolysed back to niobium and both acids' }),
        n('cav', 10, -1.5, I('grindless:srf_cavity'), 'SRF Cavity', { kind: 'product', from: ['works'] }),
        L('lhe', 0, 0, 'pl_ev:lhe'),
        n('nh', 0, 1.5, F('gtceu:neptune_helium'), 'Neptune Helium', { kind: 'product', from: ['siphon'] }),
        n('siphon', 0, 3.25, M('gtceu:neptune_deep_siphon'), 'Neptune Deep Siphon', {
          kind: 'ours', desc: 'Drops a scoop through Neptune\'s methane deck.',
        }),
        n('nhyd', 2.5, 3.25, F('gtceu:neptune_hydrogen'), 'Neptune Hydrogen', { kind: 'product', from: ['siphon'], sub: 'The isotope column takes its deuterium' }),
        n('d2', 5, 3.25, F('gtceu:deuterium'), 'Deuterium', { kind: 'product', from: ['nhyd'], end: 'capsules and the D-T freezer' }),
        n('plant', 2.5, 0.75, M('gtceu:superfluid_helium_plant'), 'Superfluid Helium Plant', {
          kind: 'ours', from: ['lhe', 'nh'], desc: 'Cools helium past the lambda point. Only helium-4 passes its superleak.',
        }),
        n('sf', 5, 0, F('gtceu:superfluid_helium'), 'Superfluid Helium', { kind: 'product', from: ['plant'], end: 'the cryomodules and the antimatter trap\'s bath' }),
        n('conc', 5, 1.5, F('gtceu:helium_3_concentrate'), 'Helium-3 Concentrate', { kind: 'product', from: ['plant'], sub: 'What the superleak holds back' }),
        n('he3', 7.5, 1.5, F('gtceu:helium_3'), 'Helium-3', { kind: 'product', from: ['conc'], end: 'the isotope column, then D-He3 capsules' }),
        n('cmod', 12.5, -1.5, I('grindless:srf_cryomodule'), 'SRF Cryomodule', {
          kind: 'product', from: ['cav'], sub: 'Eight cavities in superfluid helium', end: 'placed as blocks in the reactor, the synchrotron and the muon cell',
        }),
      ],
    },
    beams: {
      name: 'Synchrotron light and antimatter',
      nodes: [
        n('wafer', 0, -0.75, I('grindless:pmma_coated_wafer'), 'PMMA Wafer', { kind: 'raw', sub: 'Exposed through the X-ray mask' }),
        n('proton', 0, 0.75, I('gtca:proton'), 'Protons', { kind: 'raw', sub: 'From the COMET' }),
        n('sync', 2.5, 0, M('gtceu:synchrotron'), 'Synchrotron', {
          kind: 'ours', from: ['wafer', 'proton'], desc: 'Bends a beam into X-rays for lithography, and knocks antiprotons off a target.',
        }),
        n('exposed', 5, -0.75, I('grindless:exposed_wafer'), 'Exposed Wafer', { kind: 'product', from: ['sync'], sub: 'Developed and finished in the same ring' }),
        n('chip', 7.5, -1.25, I('grindless:photonic_chip'), 'Photonic Chip', { kind: 'product', from: [via('exposed', 'grindless:patterned_wafer')], end: 'the Starchip' }),
        n('cart', 5, 0.75, I('grindless:antiproton_cartridge'), 'Antiproton Cartridge', { kind: 'product', from: ['sync'] }),
        n('trap', 7.5, 0.75, M('gtceu:antimatter_trap'), 'Antimatter Trap', {
          kind: 'ours', from: ['cart'], desc: 'Stacks the cartridges into one bottle; the empties go back to the synchrotron.',
        }),
        n('aptrap', 10, 0.75, I('grindless:antiproton_trap'), 'Antiproton Trap', { kind: 'product', from: ['trap'] }),
        n('ican', 12.5, 0.75, I('grindless:ican_pellet'), 'ICAN Pellet', { kind: 'product', from: ['aptrap'], end: 'the precursor probe' }),
        L('trit', 0, 2.5, 'pl_iv:tritium'),
        n('dt', 2.5, 2.5, F('gtceu:liquid_deuterium_tritium'), 'Liquid D-T', { kind: 'product', from: ['trit'], sub: 'Frozen with deuterium in the vacuum freezer' }),
        n('muon', 5, 2.5, M('gtceu:muon_fusion_cell'), 'Muon Fusion Cell', {
          kind: 'ours', from: ['dt'], desc: 'An extrapolation: real muon-catalysed fusion never broke even.',
        }),
        n('mhe', 7.5, 2.5, F('gtceu:helium'), 'Helium', { kind: 'by', from: ['muon'], end: 'the network: nothing is vented' }),
        n('mtrit', 7.5, 4, F('gtceu:tritium'), 'Tritium', { kind: 'ret', from: ['muon'], sub: 'Bred back in the blanket' }),
      ],
    },
    fuel: {
      name: 'Laser fusion fuel',
      nodes: [
        n('boron', 0, 0, I('gtceu:boron_dust'), 'Boron', { kind: 'raw' }),
        n('b11', 2.5, -0.75, F('gtceu:boron_11_trifluoride'), 'Boron-11 Trifluoride', { kind: 'product', from: ['boron'], sub: 'Split from boron-10 with fluorine in the IV hot cell' }),
        n('b10', 2.5, 0.75, F('gtceu:boron_10_trifluoride'), 'Boron-10 Trifluoride', { kind: 'by', from: ['boron'], end: 'the boron nitride reactor' }),
        n('deca', 5, -0.75, F('gtceu:decaborane'), 'Decaborane', { kind: 'product', from: ['b11'], sub: 'With hydrogen in a chemical reactor' }),
        n('hf', 5, 0.75, F('gtceu:hydrofluoric_acid'), 'Hydrofluoric Acid', { kind: 'by', from: ['b11'], end: 'back to your fluorine chemistry' }),
        L('dplate', 5, -2.25, 'pl_zpm:plate'),
        L('zhe3', 7.5, -3.75, 'pl_zpm:he3'),
        n('pb11', 7.5, -0.75, I('grindless:pb11_capsule'), 'Boron Capsule', { kind: 'product', from: ['deca', 'dplate'] }),
        n('dhe3', 7.5, -2.25, I('grindless:d_he3_capsule'), 'D-He3 Capsule', { kind: 'product', from: ['dplate', 'zhe3'] }),
        n('chamber', 10, -1.5, M('gtceu:laser_fusion_chamber'), 'Laser Fusion Chamber', {
          kind: 'ours', from: ['pb11', 'dhe3'], desc: 'Fires a ring of fibre lasers at one capsule a shot. The lasers wear.',
        }),
        n('alpha', 12.5, -2.25, F('gtceu:helium'), 'Helium', { kind: 'by', from: ['chamber'], end: 'the network: nothing is vented' }),
        n('spentL', 12.5, -0.75, I('grindless:spent_laser_module'), 'Spent Laser Module', { kind: 'ret', from: ['chamber'], sub: 'Refurbished in the fibre draw tower' }),
      ],
    },
    lasers: {
      name: 'Fibre lasers',
      nodes: [
        n('preform', 0, -1, I('grindless:yb_doped_preform'), 'Doped Preform', { kind: 'raw', sub: 'Ytterbium glass laid inside a tube' }),
        n('tower', 2.5, -1, M('gtceu:fibre_draw_tower'), 'Fibre Draw Tower', {
          kind: 'ours', from: ['preform'], desc: 'Draws the preform into fibre and builds the laser modules.',
        }),
        n('fibre', 5, -1, I('grindless:ytterbium_fibre'), 'Ytterbium Fibre', { kind: 'product', from: ['tower'] }),
        n('epi', 0, 1, I('grindless:gallium_arsenide_wafer'), 'GaAs Wafer', { kind: 'raw', sub: 'With the organometallics and arsine' }),
        n('mocvd', 2.5, 1, M('gtceu:mocvd_reactor'), 'MOCVD Reactor', {
          kind: 'ours', from: ['epi'], desc: 'Grows indium gallium arsenide one layer at a time, then cleaves and mounts the bars.',
        }),
        n('arsine', 2.5, 2.75, F('gtceu:arsine'), 'Arsine', { kind: 'by', from: ['mocvd'], end: 'the scrubber: arsenic and hydrogen' }),
        n('epiw', 5, 1, I('grindless:ingaas_epi_wafer'), 'InGaAs Epi Wafer', { kind: 'product', from: ['mocvd'] }),
        n('pump', 7.5, 1, I('grindless:ingaas_pump_module'), 'Pump Module', { kind: 'product', from: [via('epiw', 'grindless:ingaas_diode_bar')], sub: 'Cleaved into bars and mounted on copper' }),
        n('laser', 9.75, 0, I('grindless:fibre_laser_module'), 'Fibre Laser Module', {
          kind: 'product', from: ['fibre', 'pump'], end: 'the laser chamber, the printer and the launcher',
        }),
      ],
    },
    pluto: {
      name: 'Pluto\'s ices',
      nodes: [
        n('bay', 0, 0, M('gtceu:penetrator_probe_bay'), 'Penetrator Probe Bay', {
          kind: 'ours', desc: 'Drops a probe that melts into the ice and sends a core up.',
        }),
        n('sput', 2.5, -1.5, I('grindless:sputnik_ice_core'), 'Sputnik Ice Core', { kind: 'product', from: ['bay'] }),
        n('charon', 2.5, 1.5, I('grindless:charon_core'), 'Charon Core', { kind: 'product', from: ['bay'] }),
        n('frac', 5, 0, M('gtceu:volatile_ice_fractionator'), 'Volatile Ice Fractionator', {
          kind: 'ours', from: ['sput', 'charon'], desc: 'Each ice boils off at its own temperature.',
        }),
        n('pn2', 7.5, -3, F('gtceu:nitrogen'), 'Nitrogen', { kind: 'product', from: ['frac'], end: 'the nitrogen network' }),
        n('pco', 7.5, -1.5, F('gtceu:carbon_monoxide'), 'Carbon Monoxide', { kind: 'product', from: ['frac'], end: 'the syngas plant\'s Pluto shift' }),
        n('pch4', 7.5, 0, F('gtceu:methane'), 'Methane', { kind: 'product', from: ['frac'], end: 'the methane pyrolyser' }),
        n('pwater', 7.5, 1.5, F('minecraft:water'), 'Water', { kind: 'product', from: ['frac'], end: 'the shift and the network' }),
        n('pnh3', 7.5, 3, F('gtceu:ammonia'), 'Ammonia', { kind: 'product', from: ['frac'], end: 'the nitric acid line' }),
      ],
    },
    kuiper: {
      name: 'The Kuiper belt',
      nodes: [
        n('craft', 0, 0, I('grindless:kuiper_interceptor'), 'Kuiper Interceptor', { kind: 'raw', sub: 'Spent; its canister comes back' }),
        n('ibay', 2.5, 0, M('gtceu:kuiper_interceptor_bay'), 'Kuiper Interceptor Bay', {
          kind: 'ours', from: ['craft'], desc: 'Sends a craft to a small world on the chart and brings a sample home.',
        }),
        n('sample', 5, 0, I('grindless:planetesimal_sample'), 'Planetesimal Sample', { kind: 'product', from: ['ibay'] }),
        n('anneal', 7.5, 0, M('gtceu:amorphous_ice_annealer'), 'Amorphous Ice Annealer', {
          kind: 'ours', from: ['sample'], desc: 'Warms the old ice slowly until it lets go of its gas. The inert dust is voided.',
        }),
        n('kwater', 10, -1.5, F('minecraft:water'), 'Water', { kind: 'by', from: ['anneal'], end: 'the network' }),
        n('noble', 10, 0, F('gtceu:kuiper_noble_gas'), 'Kuiper Noble Gas', { kind: 'product', from: ['anneal'], sub: 'Split in the cryogenic plant' }),
        n('kco', 10, 1.5, F('gtceu:carbon_monoxide'), 'Carbon Monoxide', { kind: 'by', from: ['anneal'], end: 'the syngas plant' }),
        n('kr', 12.5, -0.75, F('gtceu:krypton'), 'Krypton', { kind: 'product', from: ['noble'], end: 'the Hall thruster' }),
        n('xe', 12.5, 0.75, F('gtceu:xenon'), 'Xenon', { kind: 'product', from: ['noble'], end: 'the ion thruster' }),
      ],
    },
  },
};
