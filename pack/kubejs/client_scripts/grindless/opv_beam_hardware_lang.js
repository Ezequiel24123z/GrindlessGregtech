// Gregtech Grindless - names and tooltips of the OpV beam hardware (startup_scripts/grindless/opv/beam_hardware.js, package OpV-D1):
//
//   grindless:<item>                    item.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   grindless:<material> (GT material)  material.grindless.<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // id, en name, es name, en tip 0, es tip 0, en tip 1, es tip 1
    var ITEMS = [
        ['be_fluoride_dust', 'Beryllium Fluoride Dust', 'Polvo de fluoruro de berilio', 'BeF2 from the fluorspar kiln: beryllium or window scrap in hydrogen fluoride.', 'BeF2 del horno de fluorita: berilio o recortes de ventana en fluoruro de hidrógeno.', 'Reduced with calcium under the electron beam.', 'Se reduce con calcio bajo el haz de electrones.'],
        ['eb_beryllium_ingot', 'Electron Beam Beryllium Ingot', 'Lingote de berilio por haz de electrones', 'Beryllium melted clean under the electron beam, with no oxide left in it.', 'Berilio fundido limpio bajo el haz de electrones, sin óxido.', 'Hot rolled into window foil.', 'Se lamina en caliente en lámina para ventanas.'],
        ['be_window_foil', 'Beryllium Window Foil', 'Lámina de berilio para ventanas', 'Beryllium rolled thin enough for the beam to pass.', 'Berilio laminado tan fino que el haz lo atraviesa.', 'Brazed to a titanium flange under the electron beam.', 'Se suelda a una brida de titanio bajo el haz de electrones.'],
        ['brazed_be_window', 'Brazed Beryllium Window', 'Ventana de berilio soldada', 'Two beryllium foils brazed to a titanium flange, vacuum tight.', 'Dos láminas de berilio soldadas a una brida de titanio, estancas al vacío.', 'Assembled into the beam window.', 'Se monta en la ventana del haz.'],
        ['be_window_scrap', 'Beryllium Window Scrap', 'Recortes de ventana de berilio', 'The braze trim cut off a beryllium window.', 'El sobrante de soldadura recortado de una ventana de berilio.', 'Fluorinated back to beryllium fluoride in the fluorspar kiln.', 'Vuelve a fluoruro de berilio en el horno de fluorita.'],
        ['ir_target_rod', 'Iridium Target Rod', 'Varilla de blanco de iridio', 'A rod of 5N iridium, sintered dense.', 'Una varilla de iridio 5N, sinterizada densa.', 'Clad with tantalum by sputtering.', 'Se recubre de tántalo por pulverización.'],
        ['ta_clad_ir_rod', 'Tantalum-Clad Iridium Rod', 'Varilla de iridio recubierta de tántalo', 'An iridium rod under a sputtered tantalum skin.', 'Una varilla de iridio bajo una piel de tántalo pulverizado.', 'Four make an iridium spallation target.', 'Cuatro forman un blanco de espalación de iridio.'],
        ['decladded_ir_core', 'Decladded Iridium Core', 'Núcleo de iridio sin revestimiento', 'The iridium of a spent target, its activated cladding removed in the hot cell.', 'El iridio de un blanco gastado, sin el revestimiento activado que quitó la celda caliente.', 'Refined back to 5N iridium in the platinum plant.', 'Se refina de nuevo a iridio 5N en la planta de platino.'],
        ['ir_spallation_residue', 'Iridium Spallation Residue', 'Residuo de espalación de iridio', 'What the beam turned part of the iridium into: osmium, rhenium and tungsten.', 'Lo que el haz hizo de parte del iridio: osmio, renio y tungsteno.', 'Leached in aqua regia in the platinum plant.', 'Se lixivia en agua regia en la planta de platino.'],
        ['li6h_tile', 'Lithium-6 Hydride Tile', 'Baldosa de hidruro de litio 6', 'Lithium-6 hydride, sintered into a tile.', 'Hidruro de litio 6 sinterizado en una baldosa.', 'Canned in stainless steel under the electron beam.', 'Se encapsula en acero inoxidable bajo el haz de electrones.'],
        ['canned_li6h_block', 'Canned Lithium-6 Hydride Block', 'Bloque de hidruro de litio 6 encapsulado', 'Lithium-6 hydride sealed in a welded stainless steel can.', 'Hidruro de litio 6 sellado en una lata soldada de acero inoxidable.', 'Assembled into the neutron shield.', 'Se monta en el blindaje de neutrones.'],
        ['ceb6_powder', 'Cerium Hexaboride Powder', 'Polvo de hexaboruro de cerio', 'CeB6 made from cerium and boron in the blast furnace.', 'CeB6 hecho de cerio y boro en el alto horno.', 'Grown into a boule by float zone.', 'Se crece en una bola por zona flotante.'],
        ['ceb6_boule', 'Cerium Hexaboride Boule', 'Bola de hexaboruro de cerio', 'A single crystal of CeB6, grown with no crucible.', 'Un monocristal de CeB6 crecido sin crisol.', 'Turned into cathodes on the lathe.', 'Se tornea en cátodos.'],
        ['ceb6_cathode', 'Cerium Hexaboride Cathode', 'Cátodo de hexaboruro de cerio', 'A CeB6 tip: a bright, cool electron source.', 'Una punta de CeB6: una fuente de electrones brillante y fría.', 'The heart of the cooler\'s electron gun.', 'El corazón del cañón de electrones del enfriador.'],
        ['cooler_electron_gun', 'Cooler Electron Gun', 'Cañón de electrones del enfriador', 'A CeB6 cathode in chain field coils.', 'Un cátodo de CeB6 entre bobinas de campo de cadena.', 'Run cold in the helium refrigerator.', 'Se enfría en el refrigerador de helio.'],
        ['pickup_array', 'Pickup Array', 'Matriz de captación', 'NbTiN film loops on high-purity niobium sheet.', 'Bucles de película de NbTiN sobre lámina de niobio de alta pureza.', 'Brazed into a stainless steel tank.', 'Se suelda en un tanque de acero inoxidable.'],
        ['brazed_pickup_tank', 'Brazed Pickup Tank', 'Tanque de captación soldado', 'A pickup array brazed into its vacuum tank.', 'Una matriz de captación soldada en su tanque de vacío.', 'Run cold in the helium refrigerator.', 'Se enfría en el refrigerador de helio.'],
        ['tizrv_ingot', 'TiZrV Ingot', 'Lingote de TiZrV', 'Titanium, zirconium and vanadium melted together: a getter alloy.', 'Titanio, circonio y vanadio fundidos juntos: una aleación captadora.', 'Sintered into sputtering targets.', 'Se sinteriza en blancos de pulverización.'],
        ['tizrv_target', 'TiZrV Target', 'Blanco de TiZrV', 'A sputtering target of the getter alloy.', 'Un blanco de pulverización de la aleación captadora.', 'Coats the inside of eight vacuum chambers.', 'Recubre el interior de ocho cámaras de vacío.'],
        ['neg_coated_chamber', 'NEG-Coated Chamber', 'Cámara recubierta de NEG', 'A stainless steel chamber with a non-evaporable getter film inside.', 'Una cámara de acero inoxidable con una película captadora no evaporable dentro.', 'Activated under the electron beam.', 'Se activa bajo el haz de electrones.'],
        ['activated_neg_chamber', 'Activated NEG Chamber', 'Cámara de NEG activada', 'Its getter film baked clean: it now pumps gas on its own.', 'Su película captadora horneada y limpia: ya bombea gas por sí sola.', 'Assembled into the XHV casing.', 'Se monta en la carcasa de vacío extremo.'],
        ['spent_neg_chamber', 'Spent NEG Chamber', 'Cámara de NEG gastada', 'A chamber whose getter film did not activate.', 'Una cámara cuya película captadora no se activó.', 'Re-melted in the levitation melter.', 'Se refunde en el fundidor por levitación.']
    ]

    // kind, key, en, es
    var NAMES = [
        ['gmaterial', 'bred_tritium_gas', 'Bred Tritium Gas', 'Gas de tritio generado']
    ]

    var PREFIX = { gmaterial: 'material.grindless.' }

    // recipe lines of the rows OpV-D1 appended to older machines' tables: key, en, es
    var RECIPES = [
        ['gtceu.recipe.grindless_electron_beam.be_reduction',
            'Circuit 24: beryllium fluoride reduced by calcium and beam-melted into a clean ingot; fluorite comes back.',
            'Circuito 24: fluoruro de berilio reducido con calcio y fundido por haz en un lingote limpio; vuelve fluorita.'],
        ['gtceu.recipe.grindless_electron_beam.be_window_braze',
            'Circuit 25: beryllium foil brazed onto a titanium flange; the trimmed foil comes back as scrap.',
            'Circuito 25: lámina de berilio soldada a una brida de titanio; el recorte vuelve como chatarra.'],
        ['gtceu.recipe.grindless_electron_beam.pickup_tank_braze',
            'Circuit 25: the pickup array brazed into its stainless steel vacuum tank.',
            'Circuito 25: la matriz de captación soldada en su tanque de vacío de acero inoxidable.'],
        ['gtceu.recipe.grindless_electron_beam.li6h_canning',
            'Circuit 26: lithium-6 hydride tiles sealed in a stainless steel can.',
            'Circuito 26: losetas de hidruro de litio-6 selladas en una lata de acero inoxidable.'],
        ['gtceu.recipe.grindless_electron_beam.neg_activation',
            'Circuit 30: getter chambers baked under the beam; one in eight does not activate.',
            'Circuito 30: cámaras de captador horneadas bajo el haz; una de cada ocho no se activa.'],
        ['gtceu.recipe.grindless_electron_beam.pickup_array',
            'Circuit 31: NbTiN film loops welded onto high-purity niobium sheet; the kerf comes back as niobium powder.',
            'Circuito 31: bucles de película de NbTiN soldados sobre lámina de niobio de alta pureza; el corte vuelve como polvo de niobio.'],
        ['gtceu.recipe.grindless_crystal_growth.ceb6_boule',
            'Circuit 23: cerium hexaboride powder grown into a single-crystal boule under argon.',
            'Circuito 23: polvo de hexaboruro de cerio crecido en un lingote monocristalino bajo argón.'],
        ['gtceu.recipe.grindless_levitation_melting.tizrv_melt',
            'Circuit 17: titanium, zirconium and vanadium levitation-melted into the TiZrV getter alloy.',
            'Circuito 17: titanio, circonio y vanadio fundidos por levitación en la aleación captadora TiZrV.'],
        ['gtceu.recipe.grindless_levitation_melting.neg_chamber_remelt',
            'Circuit 18: spent getter chambers remelted; the steel and the getter alloy separate, sometimes with dross.',
            'Circuito 18: cámaras de captador gastadas refundidas; el acero y la aleación captadora se separan, a veces con escoria.'],
        ['gtceu.recipe.grindless_hot_cell.spent_ir_target_decladding',
            'Mode 17: a spent iridium target stripped of its tantalum cladding; the cladding goes to radioactive waste.',
            'Modo 17: un blanco de iridio agotado despojado de su revestimiento de tántalo; el revestimiento va a residuo radiactivo.'],
        ['gtceu.recipe.grindless_mtj_sputtering.ta_clad_ir_rod',
            'Circuit 9: iridium target rods clad in sputtered tantalum.',
            'Circuito 9: barras de blanco de iridio revestidas con tántalo pulverizado.'],
        ['gtceu.recipe.grindless_mtj_sputtering.neg_coated_chamber',
            'Circuit 10: a TiZrV getter film sputtered inside stainless steel chambers.',
            'Circuito 10: una película captadora de TiZrV pulverizada dentro de cámaras de acero inoxidable.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            var add = function (key, value) { event.add('grindless', key, value) }
            ITEMS.forEach(function (e) {
                add('item.grindless.' + e[0], e[1 + li])
                add('tooltip.grindless.' + e[0] + '.0', e[3 + li])
                add('tooltip.grindless.' + e[0] + '.1', e[5 + li])
            })
            NAMES.forEach(function (e) { add(PREFIX[e[0]] + e[1], e[2 + li]) })
            RECIPES.forEach(function (e) { add(e[0], e[1 + li]) })
        })
    })
})()
