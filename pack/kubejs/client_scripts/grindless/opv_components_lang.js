// Gregtech Grindless - names and tooltips of the OpV components' intermediates (startup_scripts/grindless/opv/components.js) and the EMI
// lines of the rows OpV-A1 adds to older machines:
//
//   grindless:<item>                    item.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   grindless:<material> (GT material)  material.grindless.<n>
//   gtceu.recipe.<dataKey>.<row>        the EMI line of each new row of a custom machine
//
// The gtceu:opv_* component names are GTM's own. Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts.
// Names go in en_us and es_es.
(function () {
    // id, en name, es name, en tip 0, es tip 0, en tip 1, es tip 1
    var ITEMS = [
        ['chain_sic_preform', 'Chain SiC Preform', 'Preforma de SiC y cadena', 'SiC fibre wound around chain strand wire, not yet densified.', 'Fibra de SiC devanada sobre alambre de hebra de cadena, a\u00fan sin densificar.', 'Densified in the CVI furnace.', 'Se densifica en el horno CVI.'],
        ['densified_chain_preform', 'Densified Chain Preform', 'Preforma de cadena densificada', 'The chain preform with its pores filled with SiC from methyltrichlorosilane.', 'La preforma de cadena con los poros llenos de SiC del metiltriclorosilano.', 'Sintered into chain composite rods and rotors.', 'Se sinteriza en varillas y rotores de compuesto de cadena.'],
        ['superleak_plug', 'Superleak Plug', 'Tap\u00f3n superfuga', 'Silica aerogel that lets only the superfluid through.', 'Aerogel de s\u00edlice que solo deja pasar el superfluido.', 'The heart of the superfluid He-3 seal.', 'El coraz\u00f3n del sello de He-3 superfluido.'],
        ['welded_mesh_belt', 'Welded Mesh Belt', 'Cinta de malla soldada', 'The chain mesh weave with its edges welded by electron beam.', 'El tejido de malla de cadena con los bordes soldados por haz de electrones.', 'Accepted at 4 K in the helium refrigerator.', 'Se acepta a 4 K en el refrigerador de helio.'],
        ['pbo_belt_trim', 'PBO Belt Trim', 'Recorte de cinta de PBO', 'The PBO selvedge cut off the welded belt.', 'El orillo de PBO cortado de la cinta soldada.', 'Dissolved back into PBO dope in the PBO plant.', 'Se disuelve de nuevo en pasta de PBO en la planta de PBO.'],
        ['chain_flexspline_cup', 'Chain Flexspline Cup', 'Copa flexspline de cadena', 'Gum metal and chain lamina pressed into a thin-walled cup at megabar pressure.', 'Metal goma y l\u00e1mina de cadena prensados en una copa de pared fina a presi\u00f3n de megabar.', 'Its teeth are written by the femtosecond laser.', 'El l\u00e1ser de femtosegundos le escribe los dientes.'],
        ['toothed_flexspline_cup', 'Toothed Flexspline Cup', 'Copa flexspline dentada', 'The flexspline with its teeth cut by femtosecond pulses, no heat-affected zone.', 'La flexspline con los dientes tallados por pulsos de femtosegundos, sin zona afectada por el calor.', 'Sintered into the OpV harmonic drive.', 'Se sinteriza en el reductor arm\u00f3nico de OpV.'],
        ['gum_metal_swarf', 'Gum Metal Swarf', 'Viruta de metal goma', 'The gum metal ablated from the flexspline teeth.', 'El metal goma extirpado de los dientes de la flexspline.', 'Atomised back to gum metal blend.', 'Se atomiza de nuevo en mezcla de metal goma.'],
        ['rebco_pancake', 'REBCO Pancake', 'Galleta de REBCO', 'Coated conductor tape wound into a flat double pancake with chain wire terminals.', 'Cinta de conductor recubierto bobinada en una galleta doble plana con terminales de alambre de cadena.', 'Potted in epoxy in the CVI furnace.', 'Se encapsula en ep\u00f3xido en el horno CVI.'],
        ['potted_rebco_pancake', 'Potted REBCO Pancake', 'Galleta de REBCO encapsulada', 'The pancake vacuum-impregnated with epoxy so no turn can move.', 'La galleta impregnada al vac\u00edo con ep\u00f3xido para que ninguna espira se mueva.', 'Trained to full current in the HTS magnet works.', 'Se entrena a corriente plena en la planta de imanes HTS.'],
        ['trained_rebco_pancake', 'Trained REBCO Pancake', 'Galleta de REBCO entrenada', 'The pancake ramped through its quenches until it holds full current.', 'La galleta llevada por sus transiciones hasta que aguanta la corriente plena.', 'Assembled into the chain field coil.', 'Se monta en la bobina de campo de cadena.'],
        ['thorium_229_nitrate', 'Thorium-229 Nitrate', 'Nitrato de torio 229', 'Th-229 dissolved in nitric acid behind the hot cell glass.', 'Th-229 disuelto en \u00e1cido n\u00edtrico tras el cristal de la celda caliente.', 'Fluorinated into laser-grade ThF4.', 'Se fluora en ThF4 de grado l\u00e1ser.'],
        ['laser_grade_thf4', 'Laser-Grade ThF4', 'ThF4 de grado l\u00e1ser', 'Thorium-229 tetrafluoride with no oxygen and no water.', 'Tetrafluoruro de torio 229 sin ox\u00edgeno ni agua.', 'The dopant of the lasing CaF2 boule.', 'El dopante de la bola de CaF2 l\u00e1ser.'],
        ['th_caf2_lasing_boule', 'Th:CaF2 Lasing Boule', 'Bola l\u00e1ser de Th:CaF2', 'Calcium fluoride grown with thorium-229 in its lattice.', 'Fluoruro de calcio crecido con torio 229 en su red.', 'Coated against the VUV in the MOCVD reactor.', 'Se recubre contra el VUV en el reactor MOCVD.'],
        ['coated_th_caf2_crystal', 'Coated Th:CaF2 Crystal', 'Cristal de Th:CaF2 recubierto', 'The boule faces coated with VUV-transparent MgF2.', 'Las caras de la bola recubiertas con MgF2 transparente al VUV.', 'Checked for lasing in the nuclear clock.', 'Se comprueba el efecto l\u00e1ser en el reloj nuclear.'],
        ['thirteen_n_germanium', '13N Germanium', 'Germanio 13N', 'Germanium zone-refined to one impurity in ten trillion.', 'Germanio refinado por zonas hasta una impureza en diez billones.', 'Pulled into a high-purity germanium boule.', 'Se estira en una bola de germanio de alta pureza.'],
        ['hpge_compton_boule', 'HPGe Compton Boule', 'Bola Compton de HPGe', 'A high-purity germanium crystal pulled under argon.', 'Un cristal de germanio de alta pureza estirado bajo arg\u00f3n.', 'Given boron contacts in the ion implanter.', 'Recibe contactos de boro en el implantador i\u00f3nico.'],
        ['contacted_hpge_crystal', 'Contacted HPGe Crystal', 'Cristal de HPGe con contactos', 'The germanium crystal with implanted boron contacts.', 'El cristal de germanio con contactos de boro implantados.', 'Tested at 77 K in the helium refrigerator.', 'Se prueba a 77 K en el refrigerador de helio.']
    ]

    // kind, id, en, es
    var NAMES = [
        ['gmaterial', 'liquid_helium_3', 'Liquid Helium-3', 'Helio 3 l\u00edquido'],
        ['gmaterial', 'pure_germanium_tetrachloride', 'Pure Germanium Tetrachloride', 'Tetracloruro de germanio puro']
    ]

    var PREFIX = { material: 'material.gtceu.', gmaterial: 'material.grindless.' }

    // key, en, es
    var RECIPES = [
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.chain_preform_densify', 'Circuit 6: the chain SiC preform densified from methyltrichlorosilane; the HCl goes back to stock', 'Circuito 6: la preforma de SiC y cadena densificada con metiltriclorosilano; el HCl vuelve al stock'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.superfluid_he3', 'Circuit 4: liquid helium-3 cooled below 1 mK into the superfluid', 'Circuito 4: helio 3 l\u00edquido enfriado por debajo de 1 mK hasta el superfluido'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.superleak_plug', 'Circuit 5: an aerogel plug qualified on the He-3/He-4 mixture; the helium-4 superflows through and goes to the helium refrigerator', 'Circuito 5: un tap\u00f3n de aerogel calificado con la mezcla de He-3/He-4; el helio 4 pasa como superfluido y va al refrigerador de helio'],
        ['gtceu.recipe.grindless_electron_beam.mesh_belt_weld', 'Circuit 21: the chain mesh weave edge-welded under argon; the PBO trim goes back to the PBO plant', 'Circuito 21: el tejido de malla de cadena soldado por los bordes bajo arg\u00f3n; el recorte de PBO vuelve a la planta de PBO'],
        ['gtceu.recipe.grindless_megabar.flexspline_cup', 'Circuit 7: gum metal and chain lamina pressed into the flexspline cup; the anvil sometimes cracks', 'Circuito 7: metal goma y l\u00e1mina de cadena prensados en la copa flexspline; el yunque a veces se agrieta'],
        ['gtceu.recipe.grindless_femtosecond_writing.flexspline_teeth', 'Circuit 5: the flexspline teeth written by femtosecond pulses; the swarf is atomised back to gum metal blend', 'Circuito 5: los dientes de la flexspline escritos con pulsos de femtosegundos; la viruta se atomiza de nuevo en mezcla de metal goma'],
        ['gtceu.recipe.grindless_magnet_winding.rebco_pancake', 'Circuit 7: REBCO coated conductor wound into a double pancake with chain wire terminals', 'Circuito 7: conductor recubierto de REBCO bobinado en una galleta doble con terminales de alambre de cadena'],
        ['gtceu.recipe.grindless_magnet_winding.rebco_training', 'Circuit 8: the potted pancake trained through its quenches to full current', 'Circuito 8: la galleta encapsulada entrenada a trav\u00e9s de sus transiciones hasta la corriente plena'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.rebco_potting', 'Circuit 7: the REBCO pancake vacuum-impregnated with epoxy', 'Circuito 7: la galleta de REBCO impregnada al vac\u00edo con ep\u00f3xido'],
        ['gtceu.recipe.grindless_hot_cell.thorium_229_nitrate', 'Circuit 21: thorium-229 dissolved in nitric acid; the hydrogen goes back to stock', 'Circuito 21: torio 229 disuelto en \u00e1cido n\u00edtrico; el hidr\u00f3geno vuelve al stock'],
        ['gtceu.recipe.grindless_fluorspar_kiln.laser_grade_thf4', 'Thorium-229 nitrate fluorinated to laser-grade ThF4; the nitric acid goes back to the hot cell', 'Nitrato de torio 229 fluorado a ThF4 de grado l\u00e1ser; el \u00e1cido n\u00edtrico vuelve a la celda caliente'],
        ['gtceu.recipe.grindless_crystal_growth.th_caf2_lasing', 'Circuit 19: a CaF2 boule grown with laser-grade ThF4 under argon; the lead fluoride scavenger stays', 'Circuito 19: una bola de CaF2 crecida con ThF4 de grado l\u00e1ser bajo arg\u00f3n; el fluoruro de plomo depurador se queda'],
        ['gtceu.recipe.grindless_crystal_growth.hpge_compton', 'Circuit 20: 13N germanium pulled into a high-purity boule under argon', 'Circuito 20: germanio 13N estirado en una bola de alta pureza bajo arg\u00f3n'],
        ['gtceu.recipe.grindless_nuclear_clock.lasing_check', 'Circuit 4: the coated Th:CaF2 crystal pumped by the VUV comb until the nuclear line lases', 'Circuito 4: el cristal de Th:CaF2 recubierto bombeado por el peine VUV hasta que la l\u00ednea nuclear emite l\u00e1ser']
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
