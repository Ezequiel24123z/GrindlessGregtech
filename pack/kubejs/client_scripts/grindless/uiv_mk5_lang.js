// priority: 3006
// Gregtech Grindless - names and tooltips of UIV's polarised proton source and Mk5 fusion ring (startup_scripts/grindless/uiv/mk5.js; package UIV-A9):
//
//   block.gtceu.<machine>, gtceu.<type>, material.gtceu.<id>   machine, recipe type and gas names
//   grindless.machine.<machine>.tooltip.N                      controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                     the EMI line of each recipe with a dataKey, including the older rows UIV-A9 appends
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1           the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.polarised_proton_source', 'Polarised Proton Source', 'Fuente de protones polarizados'],
        ['block.gtceu.uiv_fusion_reactor', 'Mk5 Fusion Reactor', 'Reactor de fusión Mk5'],
        ['gtceu.proton_polarisation', 'Proton Polarisation', 'Polarización de protones'],
        ['material.gtceu.detritiated_protium', 'Detritiated Protium', 'Protio sin tritio'],
        ['material.gtceu.polarised_h_gas', 'Polarised Hydrogen Gas', 'Gas de hidrógeno polarizado'],
        ['material.gtceu.nitrogen_15_ammonia', 'Nitrogen-15 Ammonia', 'Amoníaco de nitrógeno-15'],

        ['grindless.machine.polarised_proton_source.tooltip.0',
            'A cryostat with an RF dissociator and a magnet belt that aligns the spins of hydrogen nuclei: the only maker of the polarised targets of the Mk5 fuels.',
            'Un criostato con un disociador de RF y un cinturón de imanes que alinea los espines de los núcleos de hidrógeno: el único que fabrica los blancos polarizados de los combustibles Mk5.'],
        ['grindless.machine.polarised_proton_source.tooltip.1',
            'Circuit 1 detritiated protium to polarised H gas, 2 Li-6 hydride to polarised Li-6H, 3 nitrogen-15 ammonia to polarised 15NH3 ice.',
            'Circuito 1 protio sin tritio a gas H polarizado, 2 hidruro de Li-6 a Li-6H polarizado, 3 amoníaco de nitrógeno-15 a hielo de 15NH3 polarizado.'],
        ['grindless.machine.polarised_proton_source.tooltip.2',
            'Needs a belt of metallic hydrogen coil blocks. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, optional fluid hatches. Accepts a parallel hatch.',
            'Necesita un cinturón de bloques de bobina de hidrógeno metálico. Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, escotillas de fluidos opcionales. Acepta una escotilla de paralelos.'],
        ['grindless.machine.uiv_fusion_reactor.tooltip.0',
            'A second fusion ring beside the Mk4 that burns three polarised fuels: He-3 + He-3, p + Li-6 and p + N-15. Fits a start energy above 2^31 EU.',
            'Un segundo anillo de fusión junto al Mk4 que quema tres combustibles polarizados: He-3 + He-3, p + Li-6 y p + N-15. Admite una energía de arranque superior a 2^31 EU.'],
        ['grindless.machine.uiv_fusion_reactor.tooltip.1',
            'Its plasmas leave through the direct energy converter; the ash goes to the centrifuge and the superfluid helium plant, never to the void.',
            'Sus plasmas salen por el convertidor de energía directa; la ceniza va a la centrifugadora y a la planta de helio superfluido, nunca al vacío.'],
        ['grindless.machine.uiv_fusion_reactor.tooltip.2',
            'Needs the UIV fusion casing and a metallic hydrogen coil spike. Parts: energy hatches and fluid hatches. Accepts a parallel hatch.',
            'Necesita la carcasa de fusión UIV y una espiga de bobinas de hidrógeno metálico. Piezas: escotillas de energía y de fluidos. Acepta una escotilla de paralelos.'],

        ['gtceu.recipe.grindless_proton_polarisation.rf_dissociation',
            'Circuit 1: an RF dissociator splits detritiated H2 into atoms that a sextupole beam polarises; the molecules return.',
            'Circuito 1: un disociador de RF separa el H2 sin tritio en átomos que un haz sextupolar polariza; las moléculas vuelven.'],
        ['gtceu.recipe.grindless_proton_polarisation.li6h_polarisation',
            'Circuit 2: dynamic nuclear polarisation of frozen Li-6 hydride.',
            'Circuito 2: polarización nuclear dinámica del hidruro de Li-6 congelado.'],
        ['gtceu.recipe.grindless_proton_polarisation.nh3_polarisation',
            'Circuit 3: dynamic nuclear polarisation of frozen 15NH3.',
            'Circuito 3: polarización nuclear dinámica de 15NH3 congelado.'],
        // the pyroprocessing cell row UIV-A9 appends to tables/thorium.json
        ['gtceu.recipe.grindless_pyroprocessing.li_sn_eutectic',
            'Circuit 9: lithium and tin melt into the Li-Sn eutectic of the divertor.',
            'Circuito 9: litio y estaño se funden en el eutéctico Li-Sn del divertor.'],
        ['emi.grindless.info.uiv_mk5.0',
            'The proton source polarises hydrogen, Li-6 hydride and 15NH3; pressed into pellets they are mixed with helium into the He-3 + He-3, p + Li-6 and p + N-15 fuels of the Mk5 ring.',
            'La fuente de protones polariza hidrógeno, hidruro de Li-6 y 15NH3; prensados en gránulos se mezclan con helio en los combustibles He-3 + He-3, p + Li-6 y p + N-15 del anillo Mk5.'],
        ['emi.grindless.info.uiv_mk5.1',
            'The ring casing is built from the Li-Sn armoured first-wall tile and from the divertor, a stack of Li-Sn wetted capillary meshes. All ash is split into helium, hydrogen, He-3 and carbon-12.',
            'La carcasa del anillo se construye con la baldosa de primera pared blindada con Li-Sn y con el divertor, una pila de mallas capilares mojadas con Li-Sn. Toda la ceniza se separa en helio, hidrógeno, He-3 y carbono-12.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['li6_hydride', 'Lithium-6 Hydride', 'Hidruro de litio-6', 'Li-6 metal hydrided in hydrogen.', 'Metal de Li-6 hidrurado en hidrógeno.', 'Polarised in the proton source (circuit 2).', 'Se polariza en la fuente de protones (circuito 2).'],
        ['polarised_li6h', 'Polarised Li-6H', 'Li-6H polarizado', 'Frozen Li-6 hydride with aligned spins.', 'Hidruro de Li-6 congelado con espines alineados.', 'Pressed into pellets.', 'Se prensa en gránulos.'],
        ['polarised_h_ice', 'Polarised Hydrogen Ice', 'Hielo de hidrógeno polarizado', 'Polarised H frozen in a superfluid helium bath.', 'H polarizado congelado en un baño de helio superfluido.', 'Pressed into pellets.', 'Se prensa en gránulos.'],
        ['polarised_15nh3_ice', 'Polarised 15NH3 Ice', 'Hielo de 15NH3 polarizado', 'Frozen nitrogen-15 ammonia with aligned proton spins.', 'Amoníaco de nitrógeno-15 congelado con espines de protón alineados.', 'Pressed into pellets.', 'Se prensa en gránulos.'],
        ['polarised_h_pellet', 'Polarised Hydrogen Pellet', 'Gránulo de hidrógeno polarizado', 'A pellet of polarised hydrogen ice.', 'Un gránulo de hielo de hidrógeno polarizado.', 'Mixed into the p-Li6 and p-N15 fuels.', 'Se mezcla en los combustibles p-Li6 y p-N15.'],
        ['polarised_li6h_pellet', 'Polarised Li-6H Pellet', 'Gránulo de Li-6H polarizado', 'A pellet of polarised Li-6 hydride.', 'Un gránulo de hidruro de Li-6 polarizado.', 'Mixed into the p-Li6 fuel.', 'Se mezcla en el combustible p-Li6.'],
        ['polarised_15nh3_pellet', 'Polarised 15NH3 Pellet', 'Gránulo de 15NH3 polarizado', 'A pellet of polarised 15NH3 ice.', 'Un gránulo de hielo de 15NH3 polarizado.', 'Mixed into the p-N15 fuel.', 'Se mezcla en el combustible p-N15.'],
        ['polarised_he3_cell', 'Polarised He-3 Cell', 'Celda de He-3 polarizado', 'A glass cell that holds polarised helium-3.', 'Una celda de vidrio con helio-3 polarizado.', 'Mixed into the He-3 + He-3 fuel; the glass comes back.', 'Se mezcla en el combustible He-3 + He-3; el vidrio vuelve.'],
        ['plasma_sprayed_tile', 'Plasma-Sprayed Tile', 'Baldosa proyectada por plasma', 'A W-fibre/RHEA tile quenched in argon plasma.', 'Una baldosa de fibra de W/RHEA templada en plasma de argón.', 'Becomes the first-wall tile.', 'Se convierte en la baldosa de primera pared.'],
        ['first_wall_tile', 'First-Wall Tile', 'Baldosa de primera pared', 'A tile backed with tungsten steel.', 'Una baldosa reforzada con acero de tungsteno.', 'Armoured with Li-Sn.', 'Se blinda con Li-Sn.'],
        ['li_sn_armoured_tile', 'Li-Sn Armoured Tile', 'Baldosa blindada con Li-Sn', 'A first-wall tile wetted with liquid Li-Sn.', 'Una baldosa de primera pared mojada con Li-Sn líquido.', 'Builds the UIV fusion casing.', 'Construye la carcasa de fusión UIV.'],
        ['near_net_w_mesh', 'Near-Net W Mesh', 'Malla de W casi final', 'A printed porous mesh, not yet pressed.', 'Una malla porosa impresa, aún sin prensar.', 'Pressed into the W mesh.', 'Se prensa en la malla de W.'],
        ['w_mesh', 'W Mesh', 'Malla de W', 'A capillary porous mesh of refractory metal.', 'Una malla porosa capilar de metal refractario.', 'Wetted with Li-Sn.', 'Se moja con Li-Sn.'],
        ['cps_wetted_mesh', 'Li-Sn Wetted Mesh', 'Malla mojada con Li-Sn', 'A mesh that wicks liquid Li-Sn to the surface.', 'Una malla que lleva Li-Sn líquido a la superficie.', 'Stacked into a divertor cassette.', 'Se apila en un cassette de divertor.'],
        ['divertor_cassette', 'Divertor Cassette', 'Cassette de divertor', 'Four wetted meshes on tungsten steel plates.', 'Cuatro mallas mojadas sobre placas de acero de tungsteno.', 'Two make a divertor.', 'Dos forman un divertor.'],
        ['divertor', 'Divertor', 'Divertor', 'A capillary porous system that takes the heat and the ash.', 'Un sistema poroso capilar que absorbe el calor y la ceniza.', 'Builds the UIV fusion casing.', 'Construye la carcasa de fusión UIV.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
