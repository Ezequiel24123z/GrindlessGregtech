// pl_uv: the UV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every UV package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
import { I, F, M, n, L, via } from './pl-lib.mjs';

const chapter = {
  file: 'pl_uv',
  order: 8,
  title: 'UV Lines',
  subtitle: 'Thorium and nitrogen-15, superfluid helium, laser fusion fuel and fibre lasers, the ices of Pluto and closed life, EnTED wire, and the Starshot programme with the Kuiper belt.',
  icon: 'gtceu:pyroprocessing_cell',
  focus: 'pyro',
  bands: [['thorium', 'beams'], ['pluto', 'ented'], ['starshot']],
  clusters: {
    thorium: {
      name: 'Thorium, uranium-233 and nitrogen-15',
      nodes: [
        n('sampler', -12.5, 0, M('gtceu:triton_geyser_sampler'), 'Triton Geyser Sampler', {
          kind: 'ours', desc: 'Flies through Triton\'s geysers from Neptune orbit.',
        }),
        n('tn', -10, 0, F('gtceu:triton_nitrogen'), 'Triton Nitrogen', { kind: 'product', from: ['sampler'], sub: 'Rich in nitrogen-15' }),
        n('tholin', -10, 1.5, I('grindless:tholin'), 'Tholin', { kind: 'by', from: ['sampler'], end: 'the tholin reformer' }),
        n('tno', -7.5, 0, F('gtceu:triton_nitric_oxide'), 'Triton Nitric Oxide', { kind: 'product', from: ['tn'], sub: 'Burnt with oxygen in a chemical reactor' }),
        n('n15o', -5, 0, F('gtceu:nitrogen_15_oxide'), 'Nitrogen-15 Oxide', { kind: 'product', from: ['tno'], sub: 'Distilled out in the EV cryogenic plant' }),
        n('n15', -2.5, 0.75, F('gtceu:nitrogen_15'), 'Nitrogen-15', { kind: 'product', from: ['n15o'], sub: 'Reduced with hydrogen; the water goes to the network' }),
        n('th', 0, -0.75, I('gtceu:thorium_dust'), 'Thorium', { kind: 'raw', sub: 'The pyroprocessing cell sends most of it back' }),
        n('oxide', 2.5, -0.75, I('grindless:thorium_oxide_fuel_assembly'), 'Thorium Oxide Assembly', { kind: 'product', from: ['th'], sub: 'Pressed with oxygen in the fuel fabrication plant' }),
        n('nitride', 2.5, 0.75, I('grindless:thorium_nitride_fuel_assembly'), 'Thorium Nitride Assembly', {
          kind: 'product', from: ['th', 'n15'], sub: 'Carbon and nitrogen-15 from Triton, and back from the cell; it breeds better',
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
    beams: {
      name: 'Muon-catalysed fusion',
      keepShort: 'a generator fed by one freezer and the blanket it also wears; the tritium it makes is bred back, so the loop is the whole line',
      nodes: [
        L('trit', 0, 0, 'pl_iv:tritium'),
        n('dt', 2.5, 0, F('gtceu:liquid_deuterium_tritium'), 'Liquid D-T', { kind: 'product', from: ['trit'], sub: 'Frozen with deuterium in the vacuum freezer' }),
        n('muon', 5, 0, M('gtceu:muon_fusion_cell'), 'Muon Fusion Cell', {
          kind: 'ours', from: ['dt'], desc: 'An extrapolation: real muon-catalysed fusion never broke even.',
        }),
        n('mhe', 7.5, 0, F('gtceu:helium'), 'Helium', { kind: 'by', from: ['muon'], end: 'the network: nothing is vented' }),
        n('mtrit', 7.5, 1.5, F('gtceu:tritium'), 'Tritium', { kind: 'ret', from: ['muon'], sub: 'Bred back in the blanket' }),
      ],
    },
    cold: {
      name: 'Superfluid helium, laser fusion fuel and fibre lasers',
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
        n('d2', 5, 3.25, F('gtceu:deuterium'), 'Deuterium', { kind: 'product', from: ['nhyd'], sub: 'Into the D-He3 capsules and the D-T freezer' }),
        n('plant', 2.5, 0.75, M('gtceu:superfluid_helium_plant'), 'Superfluid Helium Plant', {
          kind: 'ours', from: ['lhe', 'nh'], desc: 'Cools helium past the lambda point. Only helium-4 passes its superleak.',
        }),
        n('sf', 5, 0, F('gtceu:superfluid_helium'), 'Superfluid Helium', { kind: 'product', from: ['plant'], sub: 'Bathes the cryomodules, the antimatter trap and the downlink' }),
        n('conc', 5, 1.5, F('gtceu:helium_3_concentrate'), 'Helium-3 Concentrate', { kind: 'product', from: ['plant'], sub: 'What the superleak holds back' }),
        n('he3', 7.5, 1.5, F('gtceu:helium_3'), 'Helium-3', { kind: 'product', from: ['conc'], sub: 'Into the D-He3 capsules' }),
        n('cmod', 12.5, -1.5, I('grindless:srf_cryomodule'), 'SRF Cryomodule', {
          kind: 'product', from: ['cav', 'sf'], sub: 'Eight cavities in superfluid helium', end: 'placed as blocks in the reactor, the synchrotron and the muon cell',
        }),
        // laser fusion fuel
        n('boron', 16, 0, I('gtceu:boron_dust'), 'Boron', { kind: 'raw' }),
        n('b11', 18.5, -0.75, F('gtceu:boron_11_trifluoride'), 'Boron-11 Trifluoride', { kind: 'product', from: ['boron'], sub: 'Split from boron-10 with fluorine in the IV hot cell' }),
        n('b10', 18.5, 0.75, F('gtceu:boron_10_trifluoride'), 'Boron-10 Trifluoride', { kind: 'by', from: ['boron'], end: 'the boron nitride reactor' }),
        n('deca', 21, -0.75, F('gtceu:decaborane'), 'Decaborane', { kind: 'product', from: ['b11'], sub: 'With hydrogen in a chemical reactor' }),
        n('hf', 21, 0.75, F('gtceu:hydrofluoric_acid'), 'Hydrofluoric Acid', { kind: 'by', from: ['b11'], end: 'back to your fluorine chemistry' }),
        L('dplate', 21, -2.25, 'pl_zpm:plate'),
        L('zhe3', 23.5, -3.75, 'pl_zpm:he3'),
        n('pb11', 23.5, -0.75, I('grindless:pb11_capsule'), 'Boron Capsule', { kind: 'product', from: ['deca', 'dplate'] }),
        n('dhe3', 23.5, -2.25, I('grindless:d_he3_capsule'), 'D-He3 Capsule', { kind: 'product', from: ['dplate', 'zhe3', 'he3', 'd2'] }),
        n('chamber', 26, -1.5, M('gtceu:laser_fusion_chamber'), 'Laser Fusion Chamber', {
          kind: 'ours', from: ['pb11', 'dhe3', 'laser'], desc: 'Fires a ring of fibre lasers at one capsule a shot. The lasers wear.',
        }),
        n('alpha', 28.5, -2.25, F('gtceu:helium'), 'Helium', { kind: 'by', from: ['chamber'], end: 'the network: nothing is vented' }),
        n('spentL', 28.5, -0.75, I('grindless:spent_laser_module'), 'Spent Laser Module', { kind: 'ret', from: ['chamber'], sub: 'Refurbished in the fibre draw tower' }),
        // fibre lasers
        n('preform', 16, 6, I('grindless:yb_doped_preform'), 'Doped Preform', { kind: 'raw', sub: 'Ytterbium glass laid inside a tube' }),
        n('tower', 18.5, 6, M('gtceu:fibre_draw_tower'), 'Fibre Draw Tower', {
          kind: 'ours', from: ['preform'], desc: 'Draws the preform into fibre and builds the laser modules.',
        }),
        n('fibre', 21, 6, I('grindless:ytterbium_fibre'), 'Ytterbium Fibre', { kind: 'product', from: ['tower'] }),
        n('epi', 16, 8, I('grindless:gallium_arsenide_wafer'), 'GaAs Wafer', { kind: 'raw', sub: 'With the organometallics and arsine' }),
        n('mocvd', 18.5, 8, M('gtceu:mocvd_reactor'), 'MOCVD Reactor', {
          kind: 'ours', from: ['epi'], desc: 'Grows indium gallium arsenide one layer at a time, then cleaves and mounts the bars.',
        }),
        n('arsine', 18.5, 9.75, F('gtceu:arsine'), 'Arsine', { kind: 'by', from: ['mocvd'], end: 'the scrubber: arsenic and hydrogen' }),
        n('epiw', 21, 8, I('grindless:ingaas_epi_wafer'), 'InGaAs Epi Wafer', { kind: 'product', from: ['mocvd'] }),
        n('pump', 23.5, 8, I('grindless:ingaas_pump_module'), 'Pump Module', { kind: 'product', from: [via('epiw', 'grindless:ingaas_diode_bar')], sub: 'Cleaved into bars and mounted on copper' }),
        n('laser', 25.75, 7, I('grindless:fibre_laser_module'), 'Fibre Laser Module', {
          kind: 'product', from: ['fibre', 'pump'], sub: 'The laser chamber, the printer, the comb and the launcher take it',
        }),
      ],
    },
    pluto: {
      name: 'Pluto\'s ices and closed life',
      nodes: [
        n('nnpf', -7.5, -0.75, I('grindless:near_net_probe_frame'), 'Near-Net Probe Frame', { kind: 'raw', sub: 'From the Starshot printers' }),
        n('ppf', -7.5, 0.75, M('gtceu:powder_bed_printer'), 'Powder Bed Printer', { kind: 'ours', from: ['nnpf'], desc: 'Presses the frame in argon.' }),
        n('pfr', -5, -0.75, I('grindless:printed_probe_frame'), 'Printed Probe Frame', { kind: 'product', from: ['ppf'], sub: 'Four go into the bay too' }),
        n('pgph', -5, 0.75, I('grindless:gphs_module'), 'GPHS Module', { kind: 'raw', sub: 'From the Starshot heat sources' }),
        n('ppr', -2.5, 0, I('grindless:penetrator_probe'), 'Penetrator Probe', { kind: 'product', from: ['pfr', 'pgph'], sub: 'With an HPGe crystal, a melt head and a sensor' }),
        n('tic', -2.5, -2, I('grindless:triton_ice_core'), 'Triton Ice Core', { kind: 'raw', sub: 'Dug on Triton' }),
        n('bay', 0, 0, M('gtceu:penetrator_probe_bay'), 'Penetrator Probe Bay', {
          kind: 'ours', from: ['ppr', 'tic'], desc: 'Drops a probe that melts into the ice and sends a core up.',
        }),
        n('sput', 2.5, -1.5, I('grindless:sputnik_ice_core'), 'Sputnik Ice Core', { kind: 'product', from: ['bay'] }),
        n('charon', 2.5, 1.5, I('grindless:charon_core'), 'Charon Core', { kind: 'product', from: ['bay'] }),
        n('frac', 5, 0, M('gtceu:volatile_ice_fractionator'), 'Volatile Ice Fractionator', {
          kind: 'ours', from: ['sput', 'charon'], desc: 'Each ice boils off at its own temperature.',
        }),
        n('pn2', 7.5, -3, F('gtceu:nitrogen'), 'Nitrogen', { kind: 'product', from: ['frac'], end: 'the nitrogen network' }),
        n('pco', 7.5, -1.5, F('gtceu:carbon_monoxide'), 'Carbon Monoxide', { kind: 'product', from: ['frac'], end: 'the syngas plant\'s Pluto shift' }),
        n('pch4', 7.5, 0, F('gtceu:methane'), 'Methane', { kind: 'product', from: ['frac'], end: 'the methane pyrolyser' }),
        n('pwater', 7.5, 1.5, F('minecraft:water'), 'Water', { kind: 'product', from: ['frac'], sub: 'The ark drinks it; the rest goes to the shift and the network' }),
        n('pnh3', 7.5, 3, F('gtceu:ammonia'), 'Ammonia', { kind: 'product', from: ['frac'], sub: 'The ark takes it; the nitric acid line too' }),
        n('agar', 7.5, 5, I('gtceu:agar_dust'), 'Agar', { kind: 'raw', sub: 'Seeds the algae culture' }),
        n('ark', 10, 3, M('gtceu:ark_biosphere'), 'Ark Biosphere', {
          kind: 'ours', from: ['agar', 'pnh3', 'pwater'], desc: 'Algae and archaea turn Pluto\'s ammonia and water, with carbon dioxide, into growth medium and oxygen.',
        }),
        n('o2', 12.5, 1.5, F('gtceu:oxygen'), 'Oxygen', { kind: 'by', from: ['ark'], end: 'the network' }),
        n('bio', 12.5, 4.5, F('gtceu:biomass'), 'Biomass', { kind: 'by', from: ['ark'], end: 'back into the culture seed' }),
        n('medium', 12.5, 3, F('gtceu:raw_growth_medium'), 'Raw Growth Medium', { kind: 'product', from: ['ark'] }),
        L('lorg', 15, 5, 'pl_luv:org'),
        n('vat', 15, 3, M('gtceu:neural_culture_vat'), 'Neural Culture Vat', {
          kind: 'ours', from: ['medium', 'lorg'], desc: 'Grows neural organoids into stem cells by the batch, and stem cells into processing units.',
        }),
        n('stem', 17.5, 3, I('gtceu:stem_cells'), 'Stem Cells', { kind: 'product', from: ['vat'], sub: 'Sixty-four from one organoid' }),
        n('npu', 20, 3, I('gtceu:neuro_processing_unit'), 'Neuro Processing Unit', { kind: 'product', from: ['stem'], end: 'the wetware circuit line' }),
      ],
    },
    ented: {
      name: 'EnTED wire',
      nodes: [
        L('lenq', 0, -0.75, 'pl_luv:enq'),
        L('ltr', 0, 0.75, 'pl_luv:trin'),
        n('enp', 2.5, -0.75, I('gtceu:enriched_naquadah_dust'), 'Enriched Naquadah Dust', { from: ['lenq'] }),
        n('trp', 2.5, 0.75, I('gtceu:trinium_dust'), 'Trinium Dust', { from: ['ltr'] }),
        n('eup', 2.5, 2.25, I('gtceu:europium_dust'), 'Europium', { kind: 'raw' }),
        n('dup', 2.5, 3.75, I('gtceu:duranium_dust'), 'Duranium', { kind: 'raw' }),
        n('pit', 5, 1.5, M('gtceu:powder_in_tube_line'), 'Powder-in-Tube Line', {
          kind: 'ours', from: ['enp', 'trp', 'eup', 'dup'], desc: 'Packs a powder into a silver tube and draws it down to wire.',
        }),
        n('entedp', 7.5, 1.5, I('grindless:ented_powder'), 'EnTED Powder', { kind: 'product', from: ['pit'] }),
        n('billet', 10, 1.5, I('grindless:pit_billet'), 'Powder Billet', { kind: 'product', from: ['entedp'], sub: 'Four loads in a silver tube' }),
        n('entedw', 12.5, 1.5, I('gtceu:enriched_naquadah_trinium_europium_duranide_single_wire'), 'EnTED Wire', { kind: 'product', from: ['billet'], end: 'stored: no recipe uses it yet' }),
      ],
    },
    starshot: {
      name: 'Starshot, its parts and the Kuiper belt',
      nodes: [
        // curium heat and the probe RTG
        n('cmox', 0, 0, I('grindless:curium_oxide'), 'Curium Oxide', { kind: 'raw', sub: 'From the actinide partitioning plant' }),
        n('am', 0, 2.25, I('gtceu:americium_dust'), 'Americium', { kind: 'raw', sub: 'Also from the partitioning plant' }),
        n('hs', 2.5, 1, M('gtceu:heat_source_works'), 'Heat Source Works', {
          kind: 'ours', from: ['cmox', 'am'], desc: 'Presses curium into pellets, clads them in iridium and builds RTGs; it also seals americium micro-sources.',
        }),
        n('pellet', 5, 0, I('grindless:curium_244_pellet'), 'Curium-244 Pellet', { kind: 'product', from: ['hs'], sub: 'The heavy curium oxide goes back' }),
        n('gphs', 7.5, 0, I('grindless:gphs_module'), 'GPHS Module', { kind: 'product', from: ['pellet'], sub: 'Iridium foil and a carbon-carbon aeroshell around the pellet' }),
        n('rtg', 10, 0, I('grindless:probe_rtg'), 'Probe RTG', { kind: 'product', from: ['gphs'], sub: 'The precursor probe, the Kuiper craft and two UV machines take it' }),
        n('micro', 5, 2.25, I('grindless:americium_micro_source'), 'Americium Micro-Source', { kind: 'product', from: ['hs'], sub: 'Eight from one run' }),
        // printed parts and the thruster pod
        n('ti', 0, 5.5, I('gtceu:tritanium_ingot'), 'Tritanium', { kind: 'raw' }),
        n('pbp', 2.5, 5.5, M('gtceu:powder_bed_printer'), 'Powder Bed Printer', {
          kind: 'ours', from: ['ti', 'laser'], desc: 'Atomises tritanium in argon and prints it a layer at a time with a fibre laser. The lasers wear.',
        }),
        n('tipow', 5, 5.5, I('grindless:tritanium_am_powder'), 'Tritanium Powder', { kind: 'product', from: ['pbp'] }),
        n('near', 7.5, 5.5, I('grindless:near_net_thruster_chamber'), 'Near-Net Chamber', { kind: 'product', from: ['tipow', 'laser'], sub: 'Most of the powder is left over' }),
        n('pchamber', 10, 5.5, I('grindless:printed_thruster_chamber'), 'Printed Chamber', { kind: 'product', from: ['near'], sub: 'Pressed in argon' }),
        n('tw', 12.5, 5.5, M('gtceu:thruster_works'), 'Thruster Works', { kind: 'ours', from: ['pchamber'], desc: 'Fits grids, cathodes and chambers into thrusters, and thrusters into pods.' }),
        n('ion', 15, 5.5, I('grindless:ion_thruster'), 'Ion Thruster', { kind: 'product', from: ['tw'], sub: 'Xenon burns in it' }),
        n('pod', 17.5, 5.5, I('grindless:thruster_pod'), 'Thruster Pod', { kind: 'product', from: ['ion'], sub: 'With a Hall thruster and a propellant tank; the Kuiper craft, the probe and the UHV machines take it' }),
        // the Kuiper belt
        n('craft', 20, 3, I('grindless:kuiper_interceptor'), 'Kuiper Interceptor', { kind: 'product', from: ['pod', 'rtg'], sub: 'A thruster pod and a probe RTG; spent, its canister comes back' }),
        n('ibay', 22.5, 3, M('gtceu:kuiper_interceptor_bay'), 'Kuiper Interceptor Bay', {
          kind: 'ours', from: ['craft'], desc: 'Sends a craft to a small world on the chart and brings a sample home.',
        }),
        n('sample', 25, 3, I('grindless:planetesimal_sample'), 'Planetesimal Sample', { kind: 'product', from: ['ibay'] }),
        n('anneal', 27.5, 3, M('gtceu:amorphous_ice_annealer'), 'Amorphous Ice Annealer', {
          kind: 'ours', from: ['sample'], desc: 'Warms the old ice slowly until it lets go of its gas. The inert dust is voided.',
        }),
        n('kwater', 30, 1.5, F('minecraft:water'), 'Water', { kind: 'by', from: ['anneal'], end: 'the network' }),
        n('noble', 30, 3, F('gtceu:kuiper_noble_gas'), 'Kuiper Noble Gas', { kind: 'product', from: ['anneal'], sub: 'Split in the cryogenic plant' }),
        n('kco', 30, 4.5, F('gtceu:carbon_monoxide'), 'Carbon Monoxide', { kind: 'by', from: ['anneal'], end: 'the syngas plant' }),
        n('kr', 32.5, 2.25, F('gtceu:krypton'), 'Krypton', {         kind: 'product', from: ['noble'], end: 'the Hall thruster' }),
                n('xe', 32.5, 3.75, F('gtceu:xenon'), 'Xenon', { kind: 'product', from: ['noble'], end: 'the ion thruster' }),
        // high-purity germanium
        L('lgedust', 0, 9, 'pl_luv:gedust'),
        n('zrt', 2.5, 9, M('gtceu:zone_refining_tower'), 'Zone Refining Tower', {
          kind: 'ours', from: ['lgedust'], desc: 'Chlorinates germanium to a liquid, reduces it back to ingots and grows the detector crystals.',
        }),
        n('gecl4', 5, 9, F('gtceu:germanium_tetrachloride'), 'Germanium Tetrachloride', { kind: 'product', from: ['zrt'], sub: 'Reduced with hydrogen; the acid goes to the network' }),
        n('gein', 7.5, 9, I('gtceu:germanium_ingot'), 'Germanium Ingot', { kind: 'product', from: ['gecl4'] }),
        n('hpge', 10, 9, I('grindless:hpge_crystal'), 'HPGe Crystal', { kind: 'product', from: ['gein'], sub: 'The Proxima rover, the solar probe, the precursor probe and the ground station take it' }),
        // boron nitride nanotubes
        n('b2o3', 0, 12, I('gtceu:boron_trioxide_dust'), 'Boron Trioxide', { kind: 'raw' }),
        n('bnr', 2.5, 12, M('gtceu:boron_nitride_reactor'), 'Boron Nitride Reactor', {
          kind: 'ours', from: ['b2o3'], desc: 'Makes hexagonal boron nitride with ammonia, grows nanotubes on it and spins them into yarn.',
        }),
        n('hbn', 5, 12, I('grindless:hbn_dust'), 'Hexagonal Boron Nitride', { kind: 'product', from: ['bnr'], sub: 'The sail film takes some too' }),
        n('bnntd', 7.5, 12, I('grindless:bnnt_dust'), 'Nanotube Dust', { kind: 'product', from: ['hbn'], sub: 'Grown in hydrogen' }),
        n('yarn', 10, 12, I('grindless:bnnt_yarn'), 'BNNT Yarn', { kind: 'product', from: ['bnntd'], sub: 'Spun five to one; the boron nitride comes back' }),
        n('winder', 12.5, 12, M('gtceu:cryotank_winder'), 'Cryotank Winder', { kind: 'ours', from: ['yarn', 'agt'], desc: 'Winds the yarn round an aerogel tank with carbon nanotube yarn and epoxy.' }),
        n('tank', 15, 12, I('grindless:bnnt_fuel_tank'), 'BNNT Fuel Tank', { kind: 'product', from: ['winder'], end: 'built into the Pluto rocket' }),
        L('laer', 10, 13.5, 'pl_zpm:aer'),
        L('lct', 15, 13.5, 'pl_luv:cryotank'),
        n('agt', 12.5, 13.5, I('grindless:aerogel_fuel_tank'), 'Aerogel Fuel Tank', {
          kind: 'product', from: [via('lct', 'grindless:naquadah_fuel_tank', 'grindless:aerogel_fuel_tank'), via('laer', 'grindless:aerogel_fuel_tank')],
          sub: 'The assembler builds it round a Naquadah tank and the aerogel',
        }),
        // the light sail
        L('lsw', 0, 15, 'pl_mv:wafer'),
        n('wsf', 2.5, 15, M('gtceu:wake_shield_facility'), 'Wake Shield Facility', {
          kind: 'ours', from: ['lsw'], desc: 'Grows silicon epitaxially in the vacuum behind a shield, in orbit.',
        }),
        n('sepi', 5, 15, I('grindless:epitaxial_silicon_wafer'), 'Epitaxial Silicon Wafer', { kind: 'product', from: ['wsf'] }),
        n('lsf', 7.5, 15, M('gtceu:light_sail_fab'), 'Light Sail Fab', { kind: 'ours', from: ['sepi'], desc: 'Coats the wafer, patterns the film and releases the sail in orbit.' }),
        n('film', 10, 15, I('grindless:nitride_coated_carrier'), 'Nitride-Coated Carrier', { kind: 'product', from: ['lsf'], sub: 'Silane and ammonia' }),
        n('pat', 12.5, 15, I('grindless:patterned_sail_carrier'), 'Patterned Sail Carrier', { kind: 'product', from: ['film', 'hbn'], sub: 'Boron nitride and an X-ray mask' }),
        n('lsail', 15, 15, I('grindless:light_sail'), 'Light Sail', { kind: 'product', from: ['pat'], sub: 'Released with xenon difluoride' }),
        // single-photon detectors
        n('sb', 0, 18, I('gtceu:sapphire_block'), 'Sapphire Block', { kind: 'raw' }),
        n('sebf', 2.5, 18, M('gtceu:electric_blast_furnace'), 'Electric Blast Furnace', { kind: 'machine', from: ['sb'], desc: 'Melts the block in argon at 2400 K.' }),
        n('boule', 5, 18, I('grindless:sapphire_boule'), 'Sapphire Boule', { kind: 'product', from: ['sebf'] }),
        n('swafer', 7.5, 18, I('grindless:sapphire_wafer'), 'Sapphire Wafer', { kind: 'product', from: ['boule'], sub: 'Cut with lubricant' }),
        n('nbnw', 10, 18, I('grindless:nbn_film_wafer'), 'Niobium Nitride Film Wafer', { kind: 'product', from: ['swafer'], sub: 'Grown in the MOCVD reactor' }),
        n('snspd', 12.5, 18, I('grindless:snspd_array'), 'SNSPD Array', { kind: 'product', from: ['nbnw'], sub: 'Cooled in the qubit fab; the downlink and the ground station take it' }),
        // synchrotron light and antimatter
        n('wafer', 0, 21, I('grindless:pmma_coated_wafer'), 'PMMA Wafer', { kind: 'raw', sub: 'Exposed through the X-ray mask' }),
        n('proton', 0, 22.5, I('gtca:proton'), 'Protons', { kind: 'raw', sub: 'From the COMET' }),
        n('sync', 2.5, 21.75, M('gtceu:synchrotron'), 'Synchrotron', {
          kind: 'ours', from: ['wafer', 'proton'], desc: 'Bends a beam into X-rays for lithography, and knocks antiprotons off a target.',
        }),
        n('exposed', 5, 21, I('grindless:exposed_wafer'), 'Exposed Wafer', { kind: 'product', from: ['sync'], sub: 'Developed and finished in the same ring' }),
        n('chip', 7.5, 21, I('grindless:photonic_chip'), 'Photonic Chip', { kind: 'product', from: [via('exposed', 'grindless:patterned_wafer')] }),
        n('cart', 5, 22.5, I('grindless:antiproton_cartridge'), 'Antiproton Cartridge', { kind: 'product', from: ['sync'] }),
        n('trap', 7.5, 22.5, M('gtceu:antimatter_trap'), 'Antimatter Trap', {
          kind: 'ours', from: ['cart'], desc: 'Stacks the cartridges into one bottle; the empties go back to the synchrotron.',
        }),
        n('aptrap', 10, 22.5, I('grindless:antiproton_trap'), 'Antiproton Trap', { kind: 'product', from: ['trap'] }),
        n('ican', 12.5, 22.5, I('grindless:ican_pellet'), 'ICAN Pellet', { kind: 'product', from: ['aptrap'], sub: 'Four per heliopause run' }),
        // the probe
        n('nv', 20, 9, I('grindless:nv_diamond_chip'), 'NV Diamond Chip', { kind: 'raw', sub: 'Ion-implanted CVD diamond' }),
        n('nw', 20, 10.5, I('gtceu:neutronium_wafer'), 'Neutronium Wafer', { kind: 'raw' }),
        n('sfab', 22.5, 9.75, M('gtceu:starchip_fab'), 'Starchip Fab', {
          kind: 'ours', from: ['chip', 'nv', 'micro', 'nw'], desc: 'Bonds a photonic chip, a diamond sensor, an americium source and a neutronium wafer into one starchip.',
        }),
        n('schip', 25, 9.75, I('grindless:starchip'), 'Starchip', { kind: 'product', from: ['sfab'] }),
        n('relay', 27.5, 8.25, I('grindless:relay_seed'), 'Relay Seed', { kind: 'product', role: 'travel', from: ['schip'], end: 'launched from the Moon to hold a pulsar for the warp gate' }),
        n('sailc', 27.5, 10.5, I('grindless:sailcraft'), 'Sailcraft', { kind: 'product', from: ['schip', 'lsail'] }),
        n('pprobe', 27.5, 13.5, I('grindless:precursor_probe'), 'Precursor Probe', { kind: 'product', from: ['rtg', 'pod', 'hpge'], sub: 'Built with a UV sensor and a printed frame' }),
        n('helio', 30, 13.5, I('grindless:heliopause_data'), 'Heliopause Data', { kind: 'product', from: ['pprobe', 'ican'], sub: 'Six thousand ticks at Pluto\'s orbit' }),
        n('launch', 32.5, 12, I('grindless:starshot_probe'), 'Starshot Probe', { kind: 'product', from: ['sailc', 'helio', 'laser'], sub: 'Launched from the Moon' }),
        n('spentS', 35, 10.5, I('grindless:spent_laser_module'), 'Spent Laser Module', { kind: 'ret', from: ['sailc'], sub: 'Refurbished in the fibre draw tower' }),
        n('data', 35, 12, I('grindless:proxima_approach_data'), 'Proxima Approach Data', { kind: 'product', from: ['launch', 'snspd'], end: 'the Proxima rover survey and the warp gate' }),
      ],
    },
  },
};

// The fibre laser module feeds the laser chamber, both printers and the Starshot probe, and the probe's parts all feed the
// probe, so the nodes written above as 'cold' and 'starshot' are one tangle: it is laid out as one set of coordinates (x, y in
// cells, relative to the cluster each node ends up in below), within the 5-cell line limit and reading left to right. The
// per-cluster coordinates above are only the order they were first written in.
const TOGETHER = {
  nb: [0, 16], sheet: [0.5, 17.75], bare: [2, 17.75], works: [4, 17.75], acid: [4.5, 16.25], cav: [5.75, 17], lhe: [4.75, 20.5],
  nh: [5.75, 22], siphon: [5.25, 23.75], nhyd: [7.25, 22.75], d2: [9.5, 21.5], plant: [6.25, 20.25], sf: [6.75, 18.5],
  conc: [8.25, 19.5], he3: [9.75, 19], cmod: [7.25, 17], boron: [7.25, 15.25], b11: [8.75, 16], b10: [8.75, 14.75],
  deca: [11, 15.25], hf: [9.5, 17.25], dplate: [11.5, 17.25], zhe3: [11.5, 20.25], pb11: [12.5, 15.75], dhe3: [12, 18.75],
  chamber: [14.25, 15.25], alpha: [15.75, 17.25], spentL: [14.75, 16.75], preform: [9.5, 13], tower: [11, 13.25],
  fibre: [11.5, 11.5], epi: [7.75, 4.75], mocvd: [9.25, 4.75], arsine: [9.75, 3.25], epiw: [11, 5], pump: [12.25, 6.75],
  laser: [13.75, 10.5], cmox: [7, 7.5], am: [7.25, 10.25], hs: [9, 10.75],
  pellet: [12.75, 10.25], gphs: [15.75, 11], rtg: [18.25, 14.75], micro: [11.25, 9],
  ti: [11, 6.25], pbp: [12.75, 5.75], tipow: [15, 4.75], near: [15.5, 3.25],
  pchamber: [18.5, 3.25], tw: [19.5, 6.5], ion: [20, 10.25], pod: [20, 12.25],
  craft: [22.75, 14.5], ibay: [26.25, 14], sample: [27.5, 12.25], anneal: [28.75, 15],
  kwater: [32.75, 14.75], noble: [29.5, 19.75], kco: [30.5, 12.5], kr: [32, 18.5],
  xe: [33.5, 20.25], lgedust: [27.5, 33.75], zrt: [30.75, 32.75], gecl4: [34.5, 33.5],
  gein: [38, 35], hpge: [42, 36.75], b2o3: [-5.25, 15.5], bnr: [-1.75, 14.25],
  hbn: [3, 13], bnntd: [5.75, 15.5], yarn: [7.5, 17], winder: [10.5, 19], laer: [8, 20.25], lct: [12.5, 20.5], agt: [10.5, 21.75],
  tank: [13, 17.75], lsw: [-9.25, 12.25], wsf: [-7, 11], sepi: [-4.5, 10.75],
  lsf: [-1, 11.25], film: [2, 9.5], pat: [4.75, 9.75], lsail: [6, 12],
  sb: [9, -4.25], sebf: [13.5, -2.25], boule: [17, 0.5], swafer: [19.75, 2.5],
  nbnw: [20.5, 7.25], snspd: [21.25, 5.25], wafer: [1.25, 7], proton: [2, 8.25],
  sync: [3.75, 5.5], exposed: [4.25, 3], chip: [6.25, 2.25], cart: [6.25, 9],
  trap: [8.75, 8.5], aptrap: [12.5, 9.5], ican: [14.75, 13], nv: [8.75, 1.25],
  nw: [6.75, 3.75], sfab: [10.75, 2], schip: [15.25, 3.75], relay: [18, 4.5],
  sailc: [17, 7.5], pprobe: [15.5, 14.5], helio: [16.5, 13], launch: [20.25, 10.25],
  spentS: [19.25, 4.5], data: [23.25, 6.25], laserB: [12.25, 3.75], laserC: [15.5, 11.25],
  microC: [8, 5], rtgC: [11.5, 11.75], podC: [11.75, 14], hpgeC: [13.75, 16],
  lsailC: [14, 5.25],
};
const PARTS = new Set(['cmox', 'am', 'hs', 'pellet', 'gphs', 'rtg', 'micro', 'ti', 'pbp', 'tipow', 'near', 'pchamber', 'tw', 'ion', 'pod',
  'craft', 'ibay', 'sample', 'anneal', 'kwater', 'noble', 'kco', 'kr', 'xe', 'lgedust', 'zrt', 'gecl4', 'gein', 'hpge',
  'b2o3', 'bnr', 'hbn', 'bnntd', 'yarn', 'winder', 'laer', 'lct', 'agt', 'tank', 'lsw', 'wsf', 'sepi', 'lsf', 'film', 'pat', 'lsail']);
const fusion = chapter.clusters.cold.nodes;
const parts = chapter.clusters.starshot.nodes.filter((nd) => PARTS.has(nd.key));
const probe = chapter.clusters.starshot.nodes.filter((nd) => !PARTS.has(nd.key));
// One chart line in three clusters (all tagged line 'starshot', so the line audit still measures one chain). An arrow that would
// cross from one cluster to another is drawn instead from a raw node of the same item in the consuming cluster: the audit joins
// it to the sibling cluster's product node (LD-T1), so the chain and its steps are unchanged.
const copy = (src, key, sub) => {
  const o = [...fusion, ...parts, ...probe].find((nd) => nd.key === src);
  const { key: _k, x: _x, y: _y, from: _f, title, kind: _kind, sub: _s, desc: _d, ...res } = o;
  return n(key, 0, 0, res, title, { kind: 'raw', sub });
};
const feed = (list, key, was, now) => {
  const nd = list.find((x) => x.key === key);
  nd.from = nd.from.map((f) => (f === was ? now : f));
};
parts.push(copy('laser', 'laserB', 'Made in the fibre laser line'));
feed(parts, 'pbp', 'laser', 'laserB');
feed(parts, 'near', 'laser', 'laserB');
probe.push(copy('laser', 'laserC', 'Made in the fibre laser line'), copy('micro', 'microC', 'Sealed in the heat source works'),
  copy('rtg', 'rtgC', 'Built in the heat source works'), copy('pod', 'podC', 'Fitted in the thruster works'),
  copy('hpge', 'hpgeC', 'Grown in the zone refining tower'), copy('lsail', 'lsailC', 'Released in the light sail fab'));
feed(probe, 'launch', 'laser', 'laserC');
feed(probe, 'sailc', 'lsail', 'lsailC');
feed(probe, 'sfab', 'micro', 'microC');
feed(probe, 'pprobe', 'rtg', 'rtgC');
feed(probe, 'pprobe', 'pod', 'podC');
feed(probe, 'pprobe', 'hpge', 'hpgeC');
for (const nd of [...fusion, ...parts, ...probe]) {
  const p = TOGETHER[nd.key];
  if (!p) throw new Error('pl_uv: no layout for ' + nd.key);
  nd.x = p[0];
  nd.y = p[1];
}
delete chapter.clusters.cold;
chapter.clusters.starshot = { name: 'Superfluid helium, laser fusion fuel and fibre lasers', line: 'starshot', nodes: fusion };
chapter.clusters.parts = { name: 'Heat sources, printed thrusters, the Kuiper belt, germanium, boron nitride and the light sail', line: 'starshot', nodes: parts };
chapter.clusters.probe = { name: 'Detectors, antimatter, and the Starshot probe', line: 'starshot', nodes: probe };
chapter.bands = [['thorium', 'beams'], ['pluto', 'ented'], ['starshot', 'parts', 'probe']];

export default chapter;
