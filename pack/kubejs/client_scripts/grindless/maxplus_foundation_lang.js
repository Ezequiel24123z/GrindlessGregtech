// priority: 6864
// Gregtech Grindless - names of the MAX+ foundation (startup_scripts/grindless/maxplus/foundation.js and travel.js), en_us and es_es.
//
//   grindless:<item> / <block>      item.grindless.<n> / block.grindless.<n>
//   grindless:<fluid> (GT material) material.grindless.<n>
//   gtceu:kerr_strand               material.gtceu.kerr_strand
//   the 1,024 A hatch               block.gtceu.max_maxplus_energy_hatch_1024a
//   the four places                 level.grindless.<world>, dimension.grindless.<world>, planet.grindless.<key>
//
// A name is built word by word from the id: WORDS lists every word whose English form is not the capitalised word, with its Spanish
// form; a word missing from WORDS keeps the capitalised English word in both languages (symbols and proper names). The ids come from
// global.grindless.maxPlusFoundation. Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts.
(function () {
    // word: [en, es]
    var WORDS = {
        '1550': ['1550 nm', '1550 nm'], '3': ['3', '3'], '4': ['4', '4'], '3d': ['3D', '3D'], six: ['Six', 'Seis'], n: ['N', 'N'],
        absorber: ['Absorber', 'Absorbedor'], actuator: ['Actuator', 'Actuador'], addressed: ['Addressed', 'Direccionado'], aerogel: ['Aerogel', 'Aerogel'],
        alcogel: ['Alcogel', 'Alcogel'], alignment: ['Alignment', 'Alineación'], alloy: ['Alloy', 'Aleación'], amplifier: ['Amplifier', 'Amplificador'],
        arm: ['Arm', 'Brazo'], array: ['Array', 'Matriz'], ash: ['Ash', 'Ceniza'], assembly: ['Assembly', 'Conjunto'], balanced: ['Balanced', 'Equilibrado'],
        beam: ['Beam', 'Haz'], belt: ['Belt', 'Cinturón'], beryllium: ['Beryllium', 'Berilio'], billet: ['Billet', 'Tocho'], blade: ['Blade', 'Álabe'],
        blank: ['Blank', 'Pieza en bruto'], block: ['Block', 'Bloque'], body: ['Body', 'Cuerpo'], boil: ['Boil', 'Ebullición'], off: ['Off', 'Residual'],
        bottomless: ['Bottomless', 'Sin fondo'], boule: ['Boule', 'Bola cristalina'], bound: ['Bound', 'Ligado'], braced: ['Braced', 'Arriostrado'],
        braid: ['Braid', 'Trenza'], braided: ['Braided', 'Trenzado'], buffer: ['Buffer', 'Amortiguador'], burned: ['Burned', 'Quemado'],
        cabled: ['Cabled', 'Cableado'], caesium: ['Caesium', 'Cesio'], cage: ['Cage', 'Jaula'], caged: ['Caged', 'Enjaulado'], calibrated: ['Calibrated', 'Calibrado'],
        canned: ['Canned', 'Enlatado'], capacitor: ['Capacitor', 'Condensador'], casing: ['Casing', 'Carcasa'], cask: ['Cask', 'Contenedor'],
        cavity: ['Cavity', 'Cavidad'], cell: ['Cell', 'Celda'], cermet: ['Cermet', 'Cermet'], chamber: ['Chamber', 'Cámara'], charge: ['Charge', 'Carga'],
        chip: ['Chip', 'Chip'], chloride: ['Chloride', 'Cloruro'], clad: ['Clad', 'Revestido'], clock: ['Clock', 'Reloj'], cloud: ['Cloud', 'Nube'],
        coated: ['Coated', 'Recubierto'], coil: ['Coil', 'Bobina'], cold: ['Cold', 'Frío'], comm: ['Comm', 'Comunicación'], compact: ['Compact', 'Compacto'],
        compressed: ['Compressed', 'Comprimido'], computation: ['Computation', 'Cómputo'], concentrate: ['Concentrate', 'Concentrado'],
        condensate: ['Condensate', 'Condensado'], conductor: ['Conductor', 'Conductor'], conduit: ['Conduit', 'Conducto'], confined: ['Confined', 'Confinado'],
        confinement: ['Confinement', 'Confinamiento'], containment: ['Containment', 'Contención'], controller: ['Controller', 'Controlador'],
        converter: ['Converter', 'Convertidor'], conveyor: ['Conveyor', 'Transportador'], coprocessor: ['Coprocessor', 'Coprocesador'], core: ['Core', 'Núcleo'],
        counterweight: ['Counterweight', 'Contrapeso'], crucible: ['Crucible', 'Crisol'], crude: ['Crude', 'Crudo'], crystal: ['Crystal', 'Cristal'],
        cured: ['Cured', 'Curado'], deep: ['Deep', 'Profundo'], degenerate: ['Degenerate', 'Degenerado'], dense: ['Dense', 'Denso'], densified: ['Densified', 'Densificado'],
        detector: ['Detector', 'Detector'], deuterium: ['Deuterium', 'Deuterio'], dewar: ['Dewar', 'Dewar'], diamond: ['Diamond', 'Diamante'], die: ['Die', 'Troquel'],
        direct: ['Direct', 'Directo'], disc: ['Disc', 'Disco'], divider: ['Divider', 'Divisor'], doped: ['Doped', 'Dopado'], dust: ['Dust', 'Polvo'],
        edged: ['Edged', 'Afilado'], electric: ['Electric', 'Eléctrico'], electroded: ['Electroded', 'Con electrodos'], electronic: ['Electronic', 'Electrónico'],
        element: ['Element', 'Elemento'], emitter: ['Emitter', 'Emisor'], engine: ['Engine', 'Motor'], engineered: ['Engineered', 'Diseñado'],
        enriched: ['Enriched', 'Enriquecido'], feed: ['Feed', 'Alimentación'], fibre: ['Fibre', 'Fibra'], field: ['Field', 'Campo'], filtered: ['Filtered', 'Filtrado'],
        flange: ['Flange', 'Brida'], fluid: ['Fluid', 'Fluido'], flux: ['Flux', 'Flujo'], focus: ['Focus', 'Enfoque'], foil: ['Foil', 'Lámina'], former: ['Former', 'Formador'],
        fraction: ['Fraction', 'Fracción'], fractions: ['Fractions', 'Fracciones'], frame: ['Frame', 'Marco'], frequency: ['Frequency', 'Frecuencia'],
        frozen: ['Frozen', 'Congelado'], fused: ['Fused', 'Fundido'], gamma: ['Gamma', 'Gamma'], gas: ['Gas', 'Gas'], generator: ['Generator', 'Generador'],
        grade: ['Grade', 'Grado'], graded: ['Graded', 'Graduado'], grid: ['Grid', 'Rejilla'], grown: ['Grown', 'Crecido'], gyro: ['Gyro', 'Giroscopio'],
        helium: ['Helium', 'Helio'], holo: ['Holo', 'Holo'], holographic: ['Holographic', 'Holográfico'], hoop: ['Hoop', 'Aro'], horizon: ['Horizon', 'Horizonte'],
        hydrogen: ['Hydrogen', 'Hidrógeno'], hydroxide: ['Hydroxide', 'Hidróxido'], impregnated: ['Impregnated', 'Impregnado'], infiltrated: ['Infiltrated', 'Infiltrado'],
        ingot: ['Ingot', 'Lingote'], injector: ['Injector', 'Inyector'], inscribed: ['Inscribed', 'Inscrito'], insulated: ['Insulated', 'Aislado'],
        insulator: ['Insulator', 'Aislante'], interconnect: ['Interconnect', 'Interconexión'], interposer: ['Interposer', 'Interpositor'], iris: ['Iris', 'Iris'],
        jacketed: ['Jacketed', 'Encamisado'], kerr: ['Kerr', 'Kerr'], kugelblitz: ['Kugelblitz', 'Kugelblitz'], laminate: ['Laminate', 'Laminado'],
        laminated: ['Laminated', 'Laminado'], lapped: ['Lapped', 'Lapeado'], large: ['Large', 'Grande'], laser: ['Laser', 'Láser'], lattice: ['Lattice', 'Red'],
        launched: ['Launched', 'Lanzado'], layer: ['Layer', 'Capa'], leach: ['Leach', 'Lixiviado'], leak: ['Leak', 'Fuga'], lift: ['Lift', 'Elevador'],
        lifted: ['Lifted', 'Elevado'], lined: ['Lined', 'Forrado'], liner: ['Liner', 'Forro'], lining: ['Lining', 'Revestimiento'], liquid: ['Liquid', 'Líquido'],
        loaded: ['Loaded', 'Cargado'], logic: ['Logic', 'Lógica'], machine: ['Machine', 'Máquina'], magnetic: ['Magnetic', 'Magnético'], matrix: ['Matrix', 'Matriz'],
        matter: ['Matter', 'Materia'], maxplus: ['MAX+', 'MAX+'], memory: ['Memory', 'Memoria'], mesh: ['Mesh', 'Malla'], mirror: ['Mirror', 'Espejo'],
        mix: ['Mix', 'Mezcla'], modulator: ['Modulator', 'Modulador'], module: ['Module', 'Módulo'], molten: ['Molten', 'Fundido'], molybdenum: ['Molybdenum', 'Molibdeno'],
        motor: ['Motor', 'Motor'], multilayer: ['Multilayer', 'Multicapa'], nav: ['Nav', 'Navegación'], neutral: ['Neutral', 'Neutro'], neutraliser: ['Neutraliser', 'Neutralizador'],
        neutronium: ['Neutronium', 'Neutronio'], nozzle: ['Nozzle', 'Tobera'], nuclear: ['Nuclear', 'Nuclear'], nuclide: ['Nuclide', 'Núclido'], on: ['on', 'sobre'],
        optic: ['Optic', 'Óptica'], optical: ['Optical', 'Óptico'], oriented: ['Oriented', 'Orientado'], oxide: ['Oxide', 'Óxido'], oxides: ['Oxides', 'Óxidos'],
        pair: ['Pair', 'Par'], part: ['Part', 'Pieza'], pattern: ['Pattern', 'Patrón'], patterned: ['Patterned', 'Con patrón'], pebbles: ['Pebbles', 'Guijarros'], phase: ['Phase', 'Fase'],
        photonic: ['Photonic', 'Fotónico'], photonuclear: ['Photonuclear', 'Fotonuclear'], piezo: ['Piezo', 'Piezo'], piston: ['Piston', 'Pistón'], plasma: ['Plasma', 'Plasma'],
        plate: ['Plate', 'Placa'], plug: ['Plug', 'Tapón'], plus: ['Plus', 'Plus'], polished: ['Polished', 'Pulido'], powder: ['Powder', 'Polvo'],
        precursor: ['Precursor', 'Precursor'], preform: ['Preform', 'Preforma'], press: ['Press', 'Prensa'], primed: ['Primed', 'Imprimado'], primordial: ['Primordial', 'Primordial'],
        pristine: ['Pristine', 'Prístino'], probe: ['Probe', 'Sonda'], process: ['Process', 'Proceso'], processor: ['Processor', 'Procesador'], proof: ['Proof', 'Prueba'],
        pump: ['Pump', 'Bomba'], quartz: ['Quartz', 'Cuarzo'], racetrack: ['Racetrack', 'Pista'], raw: ['Raw', 'Crudo'], readout: ['Readout', 'Lectura'],
        recovered: ['Recovered', 'Recuperado'], recuperator: ['Recuperator', 'Recuperador'], reference: ['Reference', 'Referencia'], refined: ['Refined', 'Refinado'],
        refractory: ['Refractory', 'Refractario'], regulator: ['Regulator', 'Regulador'], relay: ['Relay', 'Relé'], reservoir: ['Reservoir', 'Depósito'],
        resonance: ['Resonance', 'Resonancia'], ribbon: ['Ribbon', 'Cinta'], rich: ['Rich', 'Rica'], ring: ['Ring', 'Anillo'], robot: ['Robot', 'Robótico'],
        rotor: ['Rotor', 'Rotor'], sapphire: ['Sapphire', 'Zafiro'], scoop: ['Scoop', 'Colector'], sealed: ['Sealed', 'Sellado'], seed: ['Seed', 'Semilla'],
        sensor: ['Sensor', 'Sensor'], settled: ['Settled', 'Asentado'], sheet: ['Sheet', 'Lámina'], shielded: ['Shielded', 'Blindado'], shielding: ['Shielding', 'Blindaje'],
        silicon: ['Silicon', 'Silicio'], slab: ['Slab', 'Losa'], sleeve: ['Sleeve', 'Manguito'], slingshot: ['Slingshot', 'Honda'], slug: ['Slug', 'Lingotillo'],
        slurry: ['Slurry', 'Lechada'], spent: ['Spent', 'Agotado'], sphere: ['Sphere', 'Esfera'], spin: ['Spin', 'Espín'], stabilised: ['Stabilised', 'Estabilizado'],
        stack: ['Stack', 'Pila'], stacked: ['Stacked', 'Apilado'], stellar: ['Stellar', 'Estelar'], storage: ['Storage', 'Almacenamiento'], store: ['Store', 'Almacén'],
        strand: ['Strand', 'Hebra'], strange: ['Strange', 'Extraño'], superfluid: ['Superfluid', 'Superfluido'], superleak: ['Superleak', 'Superfuga'], tank: ['Tank', 'Tanque'],
        tape: ['Tape', 'Cinta'], target: ['Target', 'Blanco'], telescope: ['Telescope', 'Telescopio'], terminal: ['Terminal', 'Terminal'], tether: ['Tether', 'Amarre'],
        thick: ['Thick', 'Grueso'], thorium: ['Thorium', 'Torio'], tile: ['Tile', 'Baldosa'], toroid: ['Toroid', 'Toroide'], transducer: ['Transducer', 'Transductor'],
        truss: ['Truss', 'Cercha'], tube: ['Tube', 'Tubo'], turbine: ['Turbine', 'Turbina'], unit: ['Unit', 'Unidad'], valve: ['Valve', 'Válvula'], vessel: ['Vessel', 'Recipiente'],
        void: ['Void', 'Vacío'], wafer: ['Wafer', 'Oblea'], waveguide: ['Waveguide', 'Guiaondas'], waveguides: ['Waveguides', 'Guiaondas'], wear: ['Wear', 'Desgaste'],
        web: ['Web', 'Red'], wetted: ['Wetted', 'Humedecido'], winding: ['Winding', 'Devanado'], window: ['Window', 'Ventana'], wire: ['Wire', 'Cable'], zone: ['Zone', 'Zona'],
        xray: ['X-Ray', 'Rayos X'], c12: ['C-12', 'C-12'], co56: ['Co-56', 'Co-56'], fe16n2: ['Fe16N2', 'Fe16N2'], fe56: ['Fe-56', 'Fe-56'], ni56: ['Ni-56', 'Ni-56'],
        si28: ['Si-28', 'Si-28'], he3: ['He-3', 'He-3'], he4: ['He-4', 'He-4'], sco2: ['sCO2', 'sCO2'], hfb2: ['HfB2', 'HfB2'], pche: ['PCHE', 'PCHE'], rfq: ['RFQ', 'RFQ'],
        snspd: ['SNSPD', 'SNSPD'], qpu: ['QPU', 'QPU'], tbc: ['TBC', 'TBC'], pmn: ['PMN', 'PMN'], pt: ['PT', 'PT'], mram: ['MRAM', 'MRAM'], hd: ['HD', 'HD'], fcl: ['FCL', 'FCL'],
        ime: ['IME', 'IME'], ig: ['IG', 'IG'], vms: ['VMS', 'VMS'], gan: ['GaN', 'GaN'], ln: ['LN', 'LN'], er: ['Er', 'Er'], nv: ['NV', 'NV'], mo: ['Mo', 'Mo'], nb: ['Nb', 'Nb'],
        gd: ['Gd', 'Gd'], be: ['Be', 'Be'], sx: ['SX', 'SX'], sic: ['SiC', 'SiC'], inp: ['InP', 'InP'], p: ['P', 'P'], z: ['Z', 'Z'], he: ['He', 'He']
    }

    function nameOf(id, li) {
        return id.split('_').map(function (w) {
            var e = WORDS[w]
            return e ? e[li] : w.charAt(0).toUpperCase() + w.slice(1)
        }).join(' ')
    }

    var F = global.grindless && global.grindless.maxPlusFoundation
    var strip = function (id) { return id.slice(id.indexOf(':') + 1) }

    var PLACES = [
        ['tarantula_orbit', 'lmc', '30 Doradus Orbit', 'Órbita de 30 Doradus', 'Tarantula Nebula', 'Nebulosa de la Tarántula'],
        ['magellanic_stream', 'stream', 'Magellanic Stream', 'Corriente de Magallanes', 'Magellanic Stream', 'Corriente de Magallanes'],
        ['m31_nucleus_orbit', 'm31', 'M31 Nucleus Orbit', 'Órbita del núcleo de M31', 'Andromeda Nucleus', 'Núcleo de Andrómeda'],
        ['local_group_filament', 'void', 'Local Group Filament', 'Filamento del Grupo Local', 'Local Group Filament', 'Filamento del Grupo Local']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            var add = function (key, value) { event.add('grindless', key, value) }
            if (F) {
                F.items.forEach(function (id) { add('item.grindless.' + strip(id), nameOf(strip(id), li)) })
                F.blocks.forEach(function (id) { add('block.grindless.' + strip(id), nameOf(strip(id), li)) })
                F.fluids.forEach(function (id) { add('material.grindless.' + strip(id), nameOf(strip(id), li)) })
            }
            add('material.gtceu.kerr_strand', li ? 'Hebra de Kerr' : 'Kerr Strand')
            add('block.gtceu.max_maxplus_energy_hatch_1024a', li ? 'Entrada de energía MAX+ de 1.024 A' : 'MAX+ 1,024 A Energy Hatch')
            PLACES.forEach(function (p) {
                add('level.grindless.' + p[0], p[2 + li])
                add('dimension.grindless.' + p[0], p[2 + li])
                add('planet.grindless.' + p[1], p[4 + li])
            })
        })
    })
})()
