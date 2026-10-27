// pl_zpm: the ZPM lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every ZPM package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
import { I, F, M, n, L } from './pl-lib.mjs';

export default {
  file: 'pl_zpm',
  order: 7,
  title: 'ZPM Lines',
  subtitle: 'Naquadria and its fuel, actinides, europium, carbon and qubits, and the gas giants.',
  icon: 'gtceu:naquadria_refinery',
  focus: 'refinery',
  bands: [['naquadria', 'actinides'], ['europium', 'qubits'], ['saturn', 'uranus']],
  clusters: {
    naquadria: {
      name: 'Naquadria and its fuel',
      nodes: [
        L('impure', 0, 0, 'pl_luv:naquadria'),
        n('refinery', 2.5, 0, M('gtceu:naquadria_refinery'), 'Naquadria Refinery', {
          kind: 'ours', from: ['impure'], sub: 'The LuV plant\'s radioactive solution, refined',
          desc: 'The solution the naquadah plant had to tank and keep finally gets used.',
        }),
        n('ndust', 5, 0, I('gtceu:naquadria_dust'), 'Naquadria Dust', { kind: 'product', from: ['refinery'], sub: 'Into the fuel works' }),
        n('works', 7.5, 0, M('gtceu:naquadah_fuel_works'), 'Naquadah Fuel Works', {
          kind: 'ours', from: ['ndust'],
          desc: 'Makes the fuel and takes the spent fuel back, so the loop closes.',
        }),
        n('reactor', 10, 0, M('gtnn:large_naquadah_reactor', 'gtceu:large_naquadah_reactor'), 'Large Naquadah Reactor', {
          from: ['works'], sub: 'Burns fuel the Mk2 has excited; its power goes to the network',
        }),
        n('spent', 12.5, 0, I('gtceu:naquadria_dust'), 'Naquadria Dust, Back', {
          kind: 'ret', from: ['reactor'], sub: 'The spent fuel returns to the fuel works',
        }),
      ],
    },
    actinides: {
      name: 'Waste, actinides and Synroc',
      nodes: [
        n('retr', 0, 0, M('gtceu:waste_retrieval_plant'), 'Waste Retrieval Plant', {
          kind: 'ours', desc: 'Takes the old reactor waste back out of storage and gives it a use.',
        }),
        n('capsule', 2.5, -1.5, I('grindless:radium_capsule'), 'Radium Capsule', { kind: 'product', from: ['retr'], sub: 'Radon for the Mk2, with no uranium spent' }),
        n('rn', 2.5, 0, F('gtceu:radon'), 'Radon', { kind: 'product', from: ['retr'], end: 'the Mk2 and the fuel works' }),
        n('part', 2.5, 2.25, M('gtceu:actinide_partitioning_plant'), 'Actinide Partitioning Plant', {
          kind: 'ours', from: ['retr'], sub: 'What the capsule line leaves',
        }),
        n('am', 5, 0.75, I('gtceu:americium_dust'), 'Americium', { kind: 'product', from: ['part'], end: 'ZPM parts' }),
        n('cm', 5, 2.25, I('grindless:curium_oxide'), 'Curium Oxide', { kind: 'product', from: ['part'], end: 'ZPM parts' }),
        n('syn', 5, 3.75, I('grindless:synroc_block'), 'Synroc', { kind: 'by', from: ['part'], end: 'contained: the waste stays locked in' }),
        n('cap2', 5, -1.5, I('grindless:radium_capsule'), 'Radium Capsule', { kind: 'by', from: ['capsule'], end: 'stored: radon on demand' }),
      ],
    },
    europium: {
      name: 'Europium without fusion',
      nodes: [
        n('froth', 0, 0, F('gtca:monazite_froth'), 'Monazite Froth', { kind: 'raw', sub: 'Flotation, then the thermal reactor' }),
        n('red', 2.5, 0, M('gtceu:europium_reductor'), 'Europium Reductor', {
          kind: 'ours', from: ['froth'], desc: 'Pulls europium out of the froth with zinc and chlorides.',
        }),
        n('eu', 5, -0.75, I('gtceu:europium_dust'), 'Europium', { kind: 'product', from: ['red'], end: 'the Mk2 and ZPM wire' }),
        n('ree', 5, 0.75, F('gtceu:rare_earth_chloride_solution'), 'Rare Earth Chloride', {
          kind: 'by', from: ['red'], end: 'lanthanide line: what is left is rare earths',
        }),
      ],
    },
    qubits: {
      name: 'Carbon and qubits',
      nodes: [
        n('methane', 0, 0, F('gtceu:methane'), 'Methane', { kind: 'raw' }),
        n('pyro', 2.5, -1.5, M('gtceu:methane_pyrolyser'), 'Methane Pyrolyser', { kind: 'ours', from: ['methane'], desc: 'Cracks methane in a tin bath.' }),
        n('graphene', 5, -1.5, I('gtceu:graphene_dust'), 'Graphene', { kind: 'product', from: ['pyro'], end: 'ZPM parts' }),
        n('fab', 2.5, 1.5, M('gtceu:diamond_lattice_fab'), 'Diamond Lattice Fab', { kind: 'ours', from: ['methane'], desc: 'Grows flat diamond from gas.' }),
        n('plate', 5, 1.5, I('grindless:cvd_diamond_plate'), 'CVD Diamond Plate', { kind: 'product', from: ['fab'] }),
        n('qfab', 7.5, 1.5, M('gtceu:qubit_fab'), 'Qubit Fab', { kind: 'ours', from: ['plate'], desc: 'Builds qubit arrays inside a cryostat.' }),
        n('qarray', 10, 1.5, I('grindless:qubit_array'), 'Qubit Array', { kind: 'product', from: ['qfab'], end: 'the HPCA components' }),
      ],
    },
    saturn: {
      name: 'Saturn',
      nodes: [
        n('scoop', 0, 0, I('grindless:scoop_head'), 'Scoop Head', { kind: 'raw', sub: 'A wear part: build spares' }),
        n('siphon', 2.5, 0, M('gtceu:gas_giant_siphon'), 'Gas Giant Siphon', { kind: 'ours', from: ['scoop'], desc: 'Draws helium and hydrogen out of Saturn\'s air.' }),
        n('shel', 5, 0, F('gtceu:saturn_helium'), 'Saturn Helium', { kind: 'product', from: ['siphon'] }),
        n('col', 7.5, 0, M('gtceu:isotope_column'), 'Isotope Column', { kind: 'ours', from: ['shel'] }),
        n('he3', 10, -1.5, F('gtceu:helium_3'), 'Helium-3', { kind: 'product', from: ['col'], end: 'the Mk2 and the converter' }),
        n('d2', 10, 0, F('gtceu:deuterium'), 'Deuterium', { kind: 'product', from: ['col'], end: 'the Mk2' }),
        n('he4', 10, 1.5, F('gtceu:helium'), 'Helium-4', { kind: 'by', from: ['col'], end: 'the network: nothing is vented' }),
        n('harv', 2.5, 3, M('gtceu:ring_harvester'), 'Ring Harvester', { kind: 'ours', from: ['scoop'], desc: 'Sweeps a net through the rings.' }),
        n('rice', 5, 3, F('gtceu:ring_ice'), 'Ring Ice', { kind: 'product', from: ['harv'], end: 'the ring ice line' }),
      ],
    },
    uranus: {
      name: 'Uranus',
      nodes: [
        n('usiphon', 0, 0, M('gtceu:ice_giant_siphon'), 'Ice Giant Siphon', { kind: 'ours', desc: 'Reaches deeper than the Saturn siphon, under a pressure hull.' }),
        n('uh', 2.5, -0.75, F('gtceu:uranus_hydrogen'), 'Uranus Hydrogen', { kind: 'product', from: ['usiphon'], end: 'the network' }),
        n('slurry', 2.5, 0.75, F('gtceu:diamond_slurry'), 'Diamond Slurry', { kind: 'product', from: ['usiphon'] }),
        n('sep', 5, 0.75, M('gtceu:slurry_separator'), 'Slurry Separator', { kind: 'ours', from: ['slurry'] }),
        n('dseed', 7.5, 0.75, I('grindless:ice_giant_diamond_seed'), 'Ice Giant Diamond Seed', { kind: 'product', from: ['sep'], end: 'qubit plates' }),
      ],
    },
  },
};
