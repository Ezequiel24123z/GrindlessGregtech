// priority: 4900
// Gregtech Grindless - names and tooltips of UEV's superheavy line (startup_scripts/grindless/uev/superheavy.js; package UEV-A2):
//
//   block.gtceu.<machine>, gtceu.<type>                           machine and recipe type names (three of each)
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1                the twelve items
//   material.gtceu.<n>                                            the six new gases
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe of the three types
//   gtceu.recipe.grindless_hot_cell.<row>                         the EMI line of the four older hot cell rows
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [id, [en name, en tip 0, en tip 1], [es name, es tip 0, es tip 1]]
    var ITEMS = [
        ['target_wheel_blank',
            ['Blank Target Wheel', 'A titanium wheel with foil windows, ready to be loaded with a transcurium target.', 'The hot cell gives it back after a run.'],
            ['Rueda de blancos vacía', 'Una rueda de titanio con ventanas de lámina, lista para cargarse con un blanco de transcurio.', 'La celda caliente la devuelve tras una ejecución.']],
        ['activated_target_wheel',
            ['Activated Target Wheel', 'A target wheel out of the cyclotron beam, too radioactive to handle.', 'Store it in the hot cell: it comes back as a blank wheel.'],
            ['Rueda de blancos activada', 'Una rueda de blancos fuera del haz del ciclotrón, demasiado radiactiva para manipularla.', 'Guárdala en la celda caliente: vuelve como rueda vacía.']],
        ['sealed_capsule',
            ['Sealed Capsule', 'A lead-lined titanium capsule that holds a few atoms of a superheavy element.', 'Fill it in the superheavy chemistry lab.'],
            ['Cápsula sellada', 'Una cápsula de titanio forrada de plomo que guarda unos pocos átomos de un elemento superpesado.', 'Se llena en el laboratorio de química superpesada.']],
        ['flerovium_atoms',
            ['Flerovium Atoms', 'A handful of flerovium atoms caught on a membrane.', 'Feeds the superheavy census.'],
            ['Átomos de flerovio', 'Un puñado de átomos de flerovio recogidos en una membrana.', 'Alimenta el censo de superpesados.']],
        ['livermorium_atoms',
            ['Livermorium Atoms', 'A handful of livermorium atoms caught on a membrane.', 'Feeds the superheavy census.'],
            ['Átomos de livermorio', 'Un puñado de átomos de livermorio recogidos en una membrana.', 'Alimenta el censo de superpesados.']],
        ['tennessine_atoms',
            ['Tennessine Atoms', 'A handful of tennessine atoms caught on a membrane.', 'Seal them into a capsule in the superheavy chemistry lab.'],
            ['Átomos de téneso', 'Un puñado de átomos de téneso recogidos en una membrana.', 'Séllalos en una cápsula en el laboratorio de química superpesada.']],
        ['oganesson_atoms',
            ['Oganesson Atoms', 'A handful of oganesson atoms caught on a membrane.', 'Feeds the superheavy census.'],
            ['Átomos de oganesón', 'Un puñado de átomos de oganesón recogidos en una membrana.', 'Alimenta el censo de superpesados.']],
        ['moscovium_atoms',
            ['Moscovium Atoms', 'A handful of moscovium atoms caught on a membrane.', 'Feeds the superheavy census.'],
            ['Átomos de moscovio', 'Un puñado de átomos de moscovio recogidos en una membrana.', 'Alimenta el censo de superpesados.']],
        ['cast_polycarbonate_film', 'Cast Polycarbonate Film', 'Película de policarbonato colada', 'Polycarbonate dissolved in acetone and cast flat.', 'Policarbonato disuelto en acetona y colado en plano.', 'Stretched into track-detector foil, or laminated with lead into a capsule liner.', 'Se estira hasta lámina detectora de trazas, o se lamina con plomo como forro de cápsula.'],
        ['lead_polymer_liner', 'Lead-Polymer Liner', 'Forro de plomo y polímero', 'Lead foil laminated on cast polycarbonate.', 'Lámina de plomo laminada sobre policarbonato colado.', 'Fitted in a titanium shell to make a sealed capsule (circuit 23).', 'Se monta en una carcasa de titanio para hacer una cápsula sellada (circuito 23).'],
        ['ca48_plasma_bunch', 'Calcium-48 Plasma Bunch', 'Paquete de plasma de calcio-48', 'Calcium-48 ionised from the oven charge in helium.', 'Calcio-48 ionizado a partir de la carga del horno en helio.', 'The platinum filament burns out in the arc. Accelerated into a beam (circuit 20).', 'El filamento de platino se consume en el arco. Se acelera hasta un haz (circuito 20).'],
        ['polycarbonate_foil',
            ['Polycarbonate Foil', 'A thin polycarbonate film, the track detector of the heavy ion cyclotron.', 'Made from polycarbonate dust.'],
            ['Lámina de policarbonato', 'Una película fina de policarbonato, el detector de trazas del ciclotrón de iones pesados.', 'Se hace con polvo de policarbonato.']],
        ['ion_tracked_foil',
            ['Ion-Tracked Foil', 'Polycarbonate foil pierced by a xenon beam: every ion left a damaged track.', 'Etch it in sodium hydroxide to open the tracks.'],
            ['Lámina con trazas de iones', 'Lámina de policarbonato atravesada por un haz de xenón: cada ion dejó una traza dañada.', 'Grábala en hidróxido de sodio para abrir las trazas.']],
        ['etched_membrane',
            ['Etched Membrane', 'A track-etched membrane with pores a few nanometres wide.', 'Used up by the recoil separator.'],
            ['Membrana grabada', 'Una membrana grabada por trazas con poros de unos pocos nanómetros.', 'La consume el separador de retroceso.']],
        ['berkelium_oxide_dust',
            ['Berkelium Oxide Dust', 'Berkelium dioxide, the target material of the tennessine wheel.', 'Made from berkelium nitrate.'],
            ['Polvo de óxido de berkelio', 'Dióxido de berkelio, el material de blanco de la rueda de téneso.', 'Se hace con nitrato de berkelio.']]
    ]

    var MATERIALS = [
        ['flerovium_recoil_gas', 'Flerovium Recoil Gas', 'Gas de retroceso de flerovio'],
        ['livermorium_recoil_gas', 'Livermorium Recoil Gas', 'Gas de retroceso de livermorio'],
        ['tennessine_recoil_gas', 'Tennessine Recoil Gas', 'Gas de retroceso de téneso'],
        ['oganesson_recoil_gas', 'Oganesson Recoil Gas', 'Gas de retroceso de oganesón'],
        ['moscovium_recoil_gas', 'Moscovium Recoil Gas', 'Gas de retroceso de moscovio'],
        ['phosgene', 'Phosgene', 'Fosgeno']
    ]

    var MACHINES = [
        ['heavy_ion_cyclotron', 'Heavy Ion Cyclotron', 'Ciclotrón de iones pesados', 'heavy_ion_irradiation', 'Heavy Ion Irradiation', 'Irradiación con iones pesados',
            'Dubna\'s U-400: a calcium-48 beam from the ion source is accelerated by the SRF cavity and hits an actinide target; a helium chamber takes the recoil. Neither the cavity nor the helium is used up.',
            'El U-400 de Dubna: un haz de calcio-48 de la fuente de iones lo acelera la cavidad SRF y golpea un blanco de actínido; una cámara de helio recoge el retroceso. Ni la cavidad ni el helio se gastan.',
            'Circuit 1: flerovium (plutonium-244). 2: livermorium (curium-248). 3: tennessine (target wheel). 4: oganesson (californium-249). 5: moscovium (americium). 6: xenon beam on polycarbonate foil.',
            'Circuito 1: flerovio (plutonio-244). 2: livermorio (curio-248). 3: téneso (rueda de blancos). 4: oganesón (californio-249). 5: moscovio (americio). 6: haz de xenón sobre lámina de policarbonato.',
            'It uses energy. Parts go in the bottom layer: 1-4 energy hatches, 1-2 input buses, 1-2 output buses, up to 2 input and 2 output hatches.',
            'Consume energía. Las piezas van en la capa inferior: 1-4 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, hasta 2 escotillas de entrada y 2 de salida.',
            'Voiding is off: the recoil gases, the helium and the activated wheel must never be thrown away.',
            'El desecho está desactivado: los gases de retroceso, el helio y la rueda activada nunca deben tirarse.'],
        ['recoil_separator', 'Recoil Separator', 'Separador de retroceso', 'recoil_separation', 'Recoil Separation', 'Separación de retroceso',
            'A gas-filled separator: dipole magnets bend the recoiling atoms away from the beam and an etched membrane catches them.',
            'Un separador lleno de gas: imanes dipolares desvían los átomos de retroceso fuera del haz y una membrana grabada los recoge.',
            'Circuits 1-5, as the cyclotron: one recoil gas and one etched membrane give one atom item; the helium comes back.',
            'Circuitos 1-5, como el ciclotrón: un gas de retroceso y una membrana grabada dan un ítem de átomos; el helio vuelve.',
            'It uses energy. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, up to 2 input and 2 output hatches.',
            'Consume energía. Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, hasta 2 escotillas de entrada y 2 de salida.',
            'Voiding is off: the helium and the atoms must never be thrown away.',
            'El desecho está desactivado: el helio y los átomos nunca deben tirarse.'],
        ['superheavy_chemistry_lab', 'Superheavy Chemistry Lab', 'Laboratorio de química superpesada', 'superheavy_chemistry', 'Superheavy Chemistry', 'Química superpesada',
            'Gas chromatography on gold and the capsule line: a few atoms at a time are counted, sorted and sealed.',
            'Cromatografía de gases sobre oro y la línea de cápsulas: se cuentan, clasifican y sellan unos pocos átomos a la vez.',
            'Circuit 1: tennessine atoms in a sealed capsule give a tennessine sample (stored; no recipe uses it). 2: flerovium, livermorium, moscovium and oganesson atoms on gold foil give the superheavy census.',
            'Circuito 1: átomos de téneso en una cápsula sellada dan una muestra de téneso (se guarda; ninguna receta la usa). 2: átomos de flerovio, livermorio, moscovio y oganesón sobre lámina de oro dan el censo de superpesados.',
            'It uses energy. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses.',
            'Consume energía. Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida.',
            'Voiding is off: the atoms and the samples must never be thrown away.',
            'El desecho está desactivado: los átomos y las muestras nunca deben tirarse.']
    ]

    // [key, en, es]
    var ENTRIES = []

    // [en tip 0, es tip 0] of each controller: the rest of the old tooltip moved to its EMI info page
    var TIP0 = {
        heavy_ion_cyclotron: ['§7Fires a calcium-48 beam at actinide targets to make superheavy atoms.', '§7Dispara un haz de calcio-48 contra actínidos para crear átomos superpesados.'],
        recoil_separator: ['§7Separates recoiling superheavy atoms from the beam with dipole magnets.', '§7Separa los átomos superpesados de retroceso del haz con imanes dipolares.'],
        superheavy_chemistry_lab: ['§7Counts, sorts and seals a few superheavy atoms at a time.', '§7Cuenta, clasifica y sella unos pocos átomos superpesados a la vez.']
    }

    MACHINES.forEach(function (m) {
        ENTRIES.push(['block.gtceu.' + m[0], m[1], m[2]])
        ENTRIES.push(['gtceu.' + m[3], m[4], m[5]])
        ENTRIES.push(['grindless.machine.' + m[0] + '.tooltip.0', TIP0[m[0]][0], TIP0[m[0]][1]])
        ENTRIES.push(['emi.grindless.info.' + m[0] + '.2', m[6], m[7]])
        ENTRIES.push(['emi.grindless.info.' + m[0] + '.3', m[8], m[9]])
        ENTRIES.push(['emi.grindless.info.' + m[0] + '.4', m[10], m[11]])
        ENTRIES.push(['grindless.machine.' + m[0] + '.no_voiding', m[12], m[13]])
    })

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1][0], i[2][0]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[1][1], i[2][1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[1][2], i[2][2]])
    })
    MATERIALS.forEach(function (m) {
        ENTRIES.push(['material.gtceu.' + m[0], m[1], m[2]])
    })

    // [type, recipe, en, es]
    var RECIPES = [
        ['heavy_ion_irradiation', 'flerovium', 'Circuit 1: plutonium-244 target hit by calcium-48; flerovium recoil gas. The cavity and the helium are not used up',
            'Circuito 1: blanco de plutonio-244 golpeado por calcio-48; gas de retroceso de flerovio. La cavidad y el helio no se gastan'],
        ['heavy_ion_irradiation', 'livermorium', 'Circuit 2: curium-248 hit by calcium-48; livermorium recoil gas',
            'Circuito 2: curio-248 golpeado por calcio-48; gas de retroceso de livermorio'],
        ['heavy_ion_irradiation', 'tennessine', 'Circuit 3: a berkelium target wheel hit by calcium-48; tennessine recoil gas, and the wheel comes out activated (to the hot cell)',
            'Circuito 3: una rueda de blancos de berkelio golpeada por calcio-48; gas de retroceso de téneso, y la rueda sale activada (a la celda caliente)'],
        ['heavy_ion_irradiation', 'oganesson', 'Circuit 4: californium-249 hit by calcium-48; oganesson recoil gas',
            'Circuito 4: californio-249 golpeado por calcio-48; gas de retroceso de oganesón'],
        ['heavy_ion_irradiation', 'moscovium', 'Circuit 5: americium hit by calcium-48; moscovium recoil gas',
            'Circuito 5: americio golpeado por calcio-48; gas de retroceso de moscovio'],
        ['heavy_ion_irradiation', 'ion_track', 'Circuit 6: a xenon beam through polycarbonate foil; the xenon is recovered (900 of 1,000 mB)',
            'Circuito 6: un haz de xenón a través de lámina de policarbonato; el xenón se recupera (900 de 1.000 mB)'],
        ['recoil_separation', 'flerovium', 'Circuit 1: flerovium recoil gas through an etched membrane; the helium comes back',
            'Circuito 1: gas de retroceso de flerovio a través de una membrana grabada; el helio vuelve'],
        ['recoil_separation', 'livermorium', 'Circuit 2: livermorium recoil gas through an etched membrane; the helium comes back',
            'Circuito 2: gas de retroceso de livermorio a través de una membrana grabada; el helio vuelve'],
        ['recoil_separation', 'tennessine', 'Circuit 3: tennessine recoil gas through an etched membrane; the helium comes back',
            'Circuito 3: gas de retroceso de téneso a través de una membrana grabada; el helio vuelve'],
        ['recoil_separation', 'oganesson', 'Circuit 4: oganesson recoil gas through an etched membrane; the helium comes back',
            'Circuito 4: gas de retroceso de oganesón a través de una membrana grabada; el helio vuelve'],
        ['recoil_separation', 'moscovium', 'Circuit 5: moscovium recoil gas through an etched membrane; the helium comes back',
            'Circuito 5: gas de retroceso de moscovio a través de una membrana grabada; el helio vuelve'],
        ['superheavy_chemistry', 'tennessine_sample', 'Circuit 1: tennessine atoms sealed in a capsule; the sample is only stored, nothing uses it up',
            'Circuito 1: átomos de téneso sellados en una cápsula; la muestra solo se guarda, nada la consume'],
        ['superheavy_chemistry', 'superheavy_census', 'Circuit 2: flerovium, livermorium, moscovium and oganesson atoms counted on gold foil',
            'Circuito 2: átomos de flerovio, livermorio, moscovio y oganesón contados sobre lámina de oro']
    ]
    RECIPES.forEach(function (r) {
        ENTRIES.push(['gtceu.recipe.grindless_' + r[0] + '.' + r[1], r[2], r[3]])
    })

    var HOT_CELL = [
        ['californium_252_store', 'Circuit 8: californium-252 decays to curium-248 in storage (2.6 years)',
            'Circuito 8: el californio-252 decae a curio-248 en el almacén (2,6 años)'],
        ['berkelium_249_store', 'Circuit 9: berkelium-249 decays to californium-249 in storage (330 days)',
            'Circuito 9: el berkelio-249 decae a californio-249 en el almacén (330 días)'],
        ['tritium_store', 'Circuit 10: tritium decays to helium-3 in storage (12 years)',
            'Circuito 10: el tritio decae a helio-3 en el almacén (12 años)'],
        ['target_wheel_return', 'Circuit 11: an activated target wheel cools down and comes back as a blank wheel',
            'Circuito 11: una rueda de blancos activada se enfría y vuelve como rueda vacía']
    ]
    HOT_CELL.forEach(function (r) {
        ENTRIES.push(['gtceu.recipe.grindless_hot_cell.' + r[0], r[1], r[2]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
