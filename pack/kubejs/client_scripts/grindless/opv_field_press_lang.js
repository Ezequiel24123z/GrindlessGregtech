// priority: 5710
// Gregtech Grindless - names and tooltips of OpV's field-frozen press, its items and the package's older rows
// (startup_scripts/grindless/opv/field_press.js; package OpV-A3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's items
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controller
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.field_frozen_press', 'Field-Frozen Press', 'Prensa de congelación en campo'],
        ['gtceu.field_freezing', 'Field Freezing', 'Congelación en campo'],

        ['grindless.machine.field_frozen_press.tooltip.0',
            '\u00a77Presses canned chain laminae while a magnetar field freezes into them.',
            '\u00a77Prensa láminas de cadena enlatadas y congela en ellas el campo del magnetar.'],

        ['item.grindless.field_canned_stack', 'Field-Canned Stack', 'Pila enlatada para campo'],
        ['tooltip.grindless.field_canned_stack.0', 'A chain lamina stack sealed in a tungsten-rhenium can.', 'Una pila de láminas de cadena sellada en una lata de wolframio-renio.'],
        ['tooltip.grindless.field_canned_stack.1', 'Pressed at SGR 1806-20 into a field-frozen billet.', 'Se prensa en SGR 1806-20 hasta un tocho congelado en campo.'],
        ['item.grindless.field_frozen_billet', 'Field-Frozen Billet', 'Tocho congelado en campo'],
        ['tooltip.grindless.field_frozen_billet.0', 'Chain laminae holding a frozen magnetar field (named fiction).', 'Láminas de cadena que guardan un campo de magnetar congelado (ficción declarada).'],
        ['tooltip.grindless.field_frozen_billet.1', 'Rolled into field-frozen plates by the same press.', 'La misma prensa lo lamina en placas congeladas en campo.'],
        ['item.grindless.spent_field_can', 'Spent Field Can', 'Lata de campo gastada'],
        ['tooltip.grindless.spent_field_can.0', 'The tungsten-rhenium can left after pressing.', 'La lata de wolframio-renio que queda tras el prensado.'],
        ['tooltip.grindless.spent_field_can.1', 'Re-melted in the electron beam furnace: 80% comes back.', 'Se refunde en el horno de haz de electrones: vuelve el 80%.'],

        ['item.grindless.aln_powder', 'AlN Powder', 'Polvo de AlN'],
        ['tooltip.grindless.aln_powder.0', 'Aluminium nitride from aluminium in a nitrogen stream.', 'Nitruro de aluminio a partir de aluminio en corriente de nitrógeno.'],
        ['tooltip.grindless.aln_powder.1', 'Grown into AlN boules by sublimation.', 'Se crece en lingotes de AlN por sublimación.'],
        ['item.grindless.aln_kerf', 'AlN Kerf', 'Merma de corte de AlN'],
        ['tooltip.grindless.aln_kerf.0', 'What the saw takes when the AlN boule is sliced.', 'Lo que se lleva la sierra al cortar el lingote de AlN.'],
        ['tooltip.grindless.aln_kerf.1', 'Re-pressed into powder by the nitride magnet works.', 'La planta de imanes de nitruro la vuelve a prensar en polvo.'],
        ['item.grindless.aln_boule', 'AlN Boule', 'Lingote de AlN'],
        ['tooltip.grindless.aln_boule.0', 'An aluminium nitride single crystal: an ultra-wide bandgap substrate.', 'Un monocristal de nitruro de aluminio: un sustrato de banda prohibida ultraancha.'],
        ['tooltip.grindless.aln_boule.1', 'Sliced into wafers on a cutter.', 'Se corta en obleas en una cortadora.'],
        ['item.grindless.aln_wafer', 'AlN Wafer', 'Oblea de AlN'],
        ['tooltip.grindless.aln_wafer.0', 'A polished aluminium nitride substrate.', 'Un sustrato pulido de nitruro de aluminio.'],
        ['tooltip.grindless.aln_wafer.1', 'The MOCVD reactor grows AlGaN on it.', 'El reactor MOCVD crece AlGaN sobre ella.'],
        ['item.grindless.algan_epi_wafer', 'AlGaN Epi Wafer', 'Oblea epitaxial de AlGaN'],
        ['tooltip.grindless.algan_epi_wafer.0', 'An AlGaN channel layer grown on aluminium nitride.', 'Una capa de canal de AlGaN crecida sobre nitruro de aluminio.'],
        ['tooltip.grindless.algan_epi_wafer.1', 'Its gates are drawn by the BEUV lithography cell.', 'Sus puertas las dibuja la celda de litografía BEUV.'],
        ['item.grindless.algan_patterned_wafer', 'Gated AlGaN Wafer', 'Oblea de AlGaN con puertas'],
        ['tooltip.grindless.algan_patterned_wafer.0', 'AlGaN transistors with their gates written at 6.7 nm.', 'Transistores de AlGaN con sus puertas escritas a 6,7 nm.'],
        ['tooltip.grindless.algan_patterned_wafer.1', 'Diced into power dies by the SiC device fab.', 'La fábrica de dispositivos de SiC la corta en chips de potencia.'],

        ['emi.grindless.info.field_frozen_press.0',
            'The field is SGR 1806-20\'s: the press runs in the magnetar\'s orbit and nowhere else, on two UXV 4 A energy hatches, because the OpV hatches need its plate. Flux freezing in a superconducting stack is real; keeping a magnetar field in a billet is named fiction.',
            'El campo es el de SGR 1806-20: la prensa funciona en la órbita del magnetar y en ningún otro sitio, con dos hatches de energía UXV de 4 A, porque los hatches OpV necesitan su placa. Congelar flujo en una pila superconductora es real; guardar el campo de un magnetar en un tocho es ficción declarada.'],
        ['emi.grindless.info.field_frozen_press.1',
            'The W-Re cans come from the electron beam furnace (circuit 22); the spent cans go back to it (circuit 22, other inputs) and return 80% of the 6N rhenium and the tungsten. The plates make the OpV field generator and energy hatches; the casing is for later OpV machines.',
            'Las latas de W-Re salen del horno de haz de electrones (circuito 22); las latas gastadas vuelven a él (circuito 22, otras entradas) y devuelven el 80% del renio 6N y del wolframio. Las placas forman el generador de campo y los hatches de energía OpV; la carcasa es para máquinas OpV posteriores.'],

        ['gtceu.recipe.grindless_field_freezing.field_frozen_billet',
            'Circuit 1: four W-Re canned stacks pressed in the field into one billet; the four cans come off spent.',
            'Circuito 1: cuatro pilas enlatadas de W-Re prensadas en el campo hasta un tocho; las cuatro latas salen gastadas.'],
        ['gtceu.recipe.grindless_field_freezing.field_frozen_plate',
            'Circuit 2: the billet rolled into four field-frozen plates.',
            'Circuito 2: el tocho laminado en cuatro placas congeladas en campo.'],
        ['gtceu.recipe.grindless_field_freezing.field_frozen_casing',
            'Circuit 3: four plates on a tungsten steel frame make two field-frozen casings.',
            'Circuito 3: cuatro placas sobre un marco de acero de wolframio forman dos carcasas congeladas en campo.'],
        ['gtceu.recipe.grindless_electron_beam.field_can',
            'Circuit 22: a chain lamina stack canned in 6N rhenium and molten tungsten, welded shut by the beam.',
            'Circuito 22: una pila de láminas de cadena enlatada en renio 6N y wolframio fundido, soldada por el haz.'],
        ['gtceu.recipe.grindless_electron_beam.field_can_remelt',
            'Circuit 22: five spent field cans re-melted; 80% of the rhenium and the tungsten come back.',
            'Circuito 22: cinco latas de campo gastadas refundidas; vuelve el 80% del renio y del wolframio.'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.aln_powder',
            'Circuit 16: aluminium nitrided in a nitrogen stream into AlN powder.',
            'Circuito 16: aluminio nitrurado en corriente de nitrógeno hasta polvo de AlN.'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.aln_kerf_repress',
            'Circuit 17: four AlN kerf re-pressed into three AlN powder.',
            'Circuito 17: cuatro mermas de AlN vueltas a prensar en tres polvos de AlN.'],
        ['gtceu.recipe.grindless_crystal_growth.aln_boule',
            'Circuit 22: an AlN boule sublimed from the powder under nitrogen (not consumed).',
            'Circuito 22: un lingote de AlN sublimado a partir del polvo bajo nitrógeno (no se gasta).'],
        ['gtceu.recipe.grindless_beuv_lithography.algan_gates',
            'Circuit 9: the AlGaN epi wafer gated at 6.7 nm; the mirror comes out fouled (circuit 3 cleans it).',
            'Circuito 9: la oblea epitaxial de AlGaN con puertas a 6,7 nm; el espejo sale sucio (el circuito 3 lo limpia).'],
        ['gtceu.recipe.grindless_silicon_carbide.aln_power_die',
            'Circuit 8: the gated AlGaN wafer diced into four AlN power dies on copper with silver sinter.',
            'Circuito 8: la oblea de AlGaN con puertas cortada en cuatro chips de potencia de AlN sobre cobre con sinterizado de plata.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
