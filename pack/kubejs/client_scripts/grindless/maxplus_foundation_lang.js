// priority: 6996
// Gregtech Grindless - names of the MAX+ foundation (startup_scripts/grindless/maxplus/foundation.js and travel.js), en_us.
//
//   grindless:<item> / <block>      item.grindless.<n> / block.grindless.<n>
//   grindless:<fluid> (GT material) material.grindless.<n>
//   gtceu:kerr_strand               material.gtceu.kerr_strand
//   the 1,024 A hatch               block.gtceu.max_maxplus_energy_hatch_1024a
//   the four places                 level.grindless.<world>, dimension.grindless.<world>, planet.grindless.<key>
//
// A name is built word by word from the id: WORDS lists every word whose English form is not the capitalised word; a word missing
// from WORDS keeps the capitalised English word (symbols and proper names). The ids come from
// global.grindless.maxPlusFoundation. Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts.
(function () {
    // word: English form
    var WORDS = {
        '1550': '1550 nm', '3': '3', '4': '4', '3d': '3D', six: 'Six', n: 'N',
        absorber: 'Absorber', actuator: 'Actuator', addressed: 'Addressed', aerogel: 'Aerogel',
        alcogel: 'Alcogel', alignment: 'Alignment', alloy: 'Alloy', amplifier: 'Amplifier',
        arm: 'Arm', array: 'Array', ash: 'Ash', assembly: 'Assembly', balanced: 'Balanced',
        beam: 'Beam', belt: 'Belt', beryllium: 'Beryllium', billet: 'Billet', blade: 'Blade',
        blank: 'Blank', block: 'Block', body: 'Body', boil: 'Boil', off: 'Off',
        bottomless: 'Bottomless', boule: 'Boule', bound: 'Bound', braced: 'Braced',
        braid: 'Braid', braided: 'Braided', buffer: 'Buffer', burned: 'Burned',
        cabled: 'Cabled', caesium: 'Caesium', cage: 'Cage', caged: 'Caged', calibrated: 'Calibrated',
        canned: 'Canned', capacitor: 'Capacitor', casing: 'Casing', cask: 'Cask',
        cavity: 'Cavity', cell: 'Cell', cermet: 'Cermet', chamber: 'Chamber', charge: 'Charge',
        chip: 'Chip', chloride: 'Chloride', clad: 'Clad', clock: 'Clock', cloud: 'Cloud',
        coated: 'Coated', coil: 'Coil', cold: 'Cold', comm: 'Comm', compact: 'Compact',
        compressed: 'Compressed', computation: 'Computation', concentrate: 'Concentrate',
        condensate: 'Condensate', conductor: 'Conductor', conduit: 'Conduit', confined: 'Confined',
        confinement: 'Confinement', containment: 'Containment', controller: 'Controller',
        converter: 'Converter', conveyor: 'Conveyor', coprocessor: 'Coprocessor', core: 'Core',
        counterweight: 'Counterweight', crucible: 'Crucible', crude: 'Crude', crystal: 'Crystal',
        cured: 'Cured', deep: 'Deep', degenerate: 'Degenerate', dense: 'Dense', densified: 'Densified',
        detector: 'Detector', deuterium: 'Deuterium', dewar: 'Dewar', diamond: 'Diamond', die: 'Die',
        direct: 'Direct', disc: 'Disc', divider: 'Divider', doped: 'Doped', dust: 'Dust',
        edged: 'Edged', electric: 'Electric', electroded: 'Electroded', electronic: 'Electronic',
        element: 'Element', emitter: 'Emitter', engine: 'Engine', engineered: 'Engineered',
        enriched: 'Enriched', feed: 'Feed', fibre: 'Fibre', field: 'Field', filtered: 'Filtered',
        flange: 'Flange', fluid: 'Fluid', flux: 'Flux', focus: 'Focus', foil: 'Foil', former: 'Former',
        fraction: 'Fraction', fractions: 'Fractions', frame: 'Frame', frequency: 'Frequency',
        frozen: 'Frozen', fused: 'Fused', gamma: 'Gamma', gas: 'Gas', generator: 'Generator',
        grade: 'Grade', graded: 'Graded', grid: 'Grid', grown: 'Grown', gyro: 'Gyro',
        helium: 'Helium', holo: 'Holo', holographic: 'Holographic', hoop: 'Hoop', horizon: 'Horizon',
        hydrogen: 'Hydrogen', hydroxide: 'Hydroxide', impregnated: 'Impregnated', infiltrated: 'Infiltrated',
        ingot: 'Ingot', injector: 'Injector', inscribed: 'Inscribed', insulated: 'Insulated',
        insulator: 'Insulator', interconnect: 'Interconnect', interposer: 'Interposer', iris: 'Iris',
        jacketed: 'Jacketed', kerr: 'Kerr', kugelblitz: 'Kugelblitz', laminate: 'Laminate',
        laminated: 'Laminated', lapped: 'Lapped', large: 'Large', laser: 'Laser', lattice: 'Lattice',
        launched: 'Launched', layer: 'Layer', leach: 'Leach', leak: 'Leak', lift: 'Lift',
        lifted: 'Lifted', lined: 'Lined', liner: 'Liner', lining: 'Lining', liquid: 'Liquid',
        loaded: 'Loaded', logic: 'Logic', machine: 'Machine', magnetic: 'Magnetic', matrix: 'Matrix',
        matter: 'Matter', maxplus: 'MAX+', memory: 'Memory', mesh: 'Mesh', mirror: 'Mirror',
        mix: 'Mix', modulator: 'Modulator', module: 'Module', molten: 'Molten', molybdenum: 'Molybdenum',
        motor: 'Motor', multilayer: 'Multilayer', nav: 'Nav', neutral: 'Neutral', neutraliser: 'Neutraliser',
        neutronium: 'Neutronium', nozzle: 'Nozzle', nuclear: 'Nuclear', nuclide: 'Nuclide', on: 'on',
        optic: 'Optic', optical: 'Optical', oriented: 'Oriented', oxide: 'Oxide', oxides: 'Oxides',
        pair: 'Pair', part: 'Part', pattern: 'Pattern', patterned: 'Patterned', pebbles: 'Pebbles', phase: 'Phase',
        photonic: 'Photonic', photonuclear: 'Photonuclear', piezo: 'Piezo', piston: 'Piston', plasma: 'Plasma',
        plate: 'Plate', plug: 'Plug', plus: 'Plus', polished: 'Polished', powder: 'Powder',
        precursor: 'Precursor', preform: 'Preform', press: 'Press', primed: 'Primed', primordial: 'Primordial',
        pristine: 'Pristine', probe: 'Probe', process: 'Process', processor: 'Processor', proof: 'Proof',
        pump: 'Pump', quartz: 'Quartz', racetrack: 'Racetrack', raw: 'Raw', readout: 'Readout',
        recovered: 'Recovered', recuperator: 'Recuperator', reference: 'Reference', refined: 'Refined',
        refractory: 'Refractory', regulator: 'Regulator', relay: 'Relay', reservoir: 'Reservoir',
        resonance: 'Resonance', ribbon: 'Ribbon', rich: 'Rich', ring: 'Ring', robot: 'Robot',
        rotor: 'Rotor', sapphire: 'Sapphire', scoop: 'Scoop', sealed: 'Sealed', seed: 'Seed',
        sensor: 'Sensor', settled: 'Settled', sheet: 'Sheet', shielded: 'Shielded', shielding: 'Shielding',
        silicon: 'Silicon', slab: 'Slab', sleeve: 'Sleeve', slingshot: 'Slingshot', slug: 'Slug',
        slurry: 'Slurry', spent: 'Spent', sphere: 'Sphere', spin: 'Spin', stabilised: 'Stabilised',
        stack: 'Stack', stacked: 'Stacked', stellar: 'Stellar', storage: 'Storage', store: 'Store',
        strand: 'Strand', strange: 'Strange', superfluid: 'Superfluid', superleak: 'Superleak', tank: 'Tank',
        tape: 'Tape', target: 'Target', telescope: 'Telescope', terminal: 'Terminal', tether: 'Tether',
        thick: 'Thick', thorium: 'Thorium', tile: 'Tile', toroid: 'Toroid', transducer: 'Transducer',
        truss: 'Truss', tube: 'Tube', turbine: 'Turbine', unit: 'Unit', valve: 'Valve', vessel: 'Vessel',
        void: 'Void', wafer: 'Wafer', waveguide: 'Waveguide', waveguides: 'Waveguides', wear: 'Wear',
        web: 'Web', wetted: 'Wetted', winding: 'Winding', window: 'Window', wire: 'Wire', zone: 'Zone',
        xray: 'X-Ray', c12: 'C-12', co56: 'Co-56', fe16n2: 'Fe16N2', fe56: 'Fe-56', ni56: 'Ni-56',
        si28: 'Si-28', he3: 'He-3', he4: 'He-4', sco2: 'sCO2', hfb2: 'HfB2', pche: 'PCHE', rfq: 'RFQ',
        snspd: 'SNSPD', qpu: 'QPU', tbc: 'TBC', pmn: 'PMN', pt: 'PT', mram: 'MRAM', hd: 'HD', fcl: 'FCL',
        ime: 'IME', ig: 'IG', vms: 'VMS', gan: 'GaN', ln: 'LN', er: 'Er', nv: 'NV', mo: 'Mo', nb: 'Nb',
        gd: 'Gd', be: 'Be', sx: 'SX', sic: 'SiC', inp: 'InP', p: 'P', z: 'Z', he: 'He'
    }

    function nameOf(id) {
        return id.split('_').map(function (w) {
            var e = WORDS[w]
            return e ? e : w.charAt(0).toUpperCase() + w.slice(1)
        }).join(' ')
    }

    var F = global.grindless && global.grindless.maxPlusFoundation
    var strip = function (id) { return id.slice(id.indexOf(':') + 1) }

    var PLACES = [
        ['tarantula_orbit', 'lmc', '30 Doradus Orbit', 'Tarantula Nebula'],
        ['magellanic_stream', 'stream', 'Magellanic Stream', 'Magellanic Stream'],
        ['m31_nucleus_orbit', 'm31', 'M31 Nucleus Orbit', 'Andromeda Nucleus'],
        ['local_group_filament', 'void', 'Local Group Filament', 'Local Group Filament']
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        if (F) {
            F.items.forEach(function (id) { add('item.grindless.' + strip(id), nameOf(strip(id))) })
            F.blocks.forEach(function (id) { add('block.grindless.' + strip(id), nameOf(strip(id))) })
            F.fluids.forEach(function (id) { add('material.grindless.' + strip(id), nameOf(strip(id))) })
        }
        add('material.gtceu.kerr_strand', 'Kerr Strand')
        add('block.gtceu.max_maxplus_energy_hatch_1024a', 'MAX+ 1,024 A Energy Hatch')
        PLACES.forEach(function (p) {
            add('level.grindless.' + p[0], p[2])
            add('dimension.grindless.' + p[0], p[2])
            add('planet.grindless.' + p[1], p[3])
        })
    })
})()
