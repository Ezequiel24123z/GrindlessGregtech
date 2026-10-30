// priority: 1487
// Gregtech Grindless - names and tooltips of UXV's vdW stacking cell, racetrack fab and YIG LPE furnace (startup_scripts/grindless/uxv/spin_logic.js; package UXV-A5):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each stacking, patterning and epitaxy recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.vdw_stacking_cell', 'vdW Stacking Cell', 'Celda de apilado vdW'],
        ['block.gtceu.racetrack_fab', 'Racetrack Fab', 'Fábrica de pistas de carrera'],
        ['block.gtceu.yig_lpe_furnace', 'YIG LPE Furnace', 'Horno LPE de YIG'],
        ['gtceu.vdw_stacking', 'vdW Stacking', 'Apilado vdW'],
        ['gtceu.racetrack_patterning', 'Racetrack Patterning', 'Modelado de pistas de carrera'],
        ['gtceu.liquid_phase_epitaxy', 'Liquid Phase Epitaxy', 'Epitaxia en fase líquida'],

        ['grindless.machine.vdw_stacking_cell.tooltip.0',
            'An L-shaped argon glovebox with glove sleeves and a robotic stamp turret: cleaves van der Waals crystals into flakes and stacks them into the SOT heterostack.',
            'Una cámara de guantes de argón en forma de L con mangas y una torreta robótica: parte cristales de van der Waals en copos y los apila en la heteroestructura SOT.'],
        ['grindless.machine.vdw_stacking_cell.tooltip.1',
            'Circuit 1 WTe2 flakes, 2 FGT flakes, 3 hBN flakes, 4 SOT heterostack. Broken flakes come out as WTe2 and Fe3GeTe2 dust.',
            'Circuito 1 copos de WTe2, 2 copos de FGT, 3 copos de hBN, 4 heteroestructura SOT. Los copos rotos salen como polvo de WTe2 y Fe3GeTe2.'],
        ['grindless.machine.vdw_stacking_cell.tooltip.2',
            'Parts go in the floor, front and back: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1 input hatch, optional output hatch. Accepts a parallel hatch.',
            'Las piezas van en el suelo, delante y detrás: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, 1 escotilla de entrada, escotilla de salida opcional. Acepta una escotilla de paralelos.'],
        ['grindless.machine.racetrack_fab.tooltip.0',
            'A long lithography bay with an e-beam column at the back and a wafer track on a frame: the only maker of the patterned track wafer and the racetrack chip.',
            'Una larga bahía de litografía con una columna de haz de electrones al fondo y una pista de obleas sobre un bastidor: la única que fabrica la oblea de pista modelada y el chip de pista de carrera.'],
        ['grindless.machine.racetrack_fab.tooltip.1',
            'Circuit 1 pattern the SAF track, 2 bond an MTJ die onto it. Argon fills the bay; the lift-off leaves platinum-group sludge.',
            'Circuito 1 modelar la pista SAF, 2 unirle un troquel MTJ. El argón llena la bahía; el lift-off deja lodo de metales del grupo del platino.'],
        ['grindless.machine.racetrack_fab.tooltip.2',
            'Parts go in the floor, front and back: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1 input hatch, optional output hatch. Accepts a parallel hatch.',
            'Las piezas van en el suelo, delante y detrás: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, 1 escotilla de entrada, escotilla de salida opcional. Acepta una escotilla de paralelos.'],
        ['grindless.machine.yig_lpe_furnace.tooltip.0',
            'A stepped tower with three coil bands and a dip head over a platinum crucible: grows YIG films on GGG wafers from a lead-borate flux.',
            'Una torre escalonada con tres bandas de bobinas y un cabezal de inmersión sobre un crisol de platino: crece películas de YIG sobre obleas de GGG desde un fundente de borato de plomo.'],
        ['grindless.machine.yig_lpe_furnace.tooltip.1',
            'Circuit 1 melt the flux, 2 grow the YIG film (the platinum crucible is not consumed), 3 skim the used flux. The dross feeds the extraction cascade.',
            'Circuito 1 fundir el fundente, 2 crecer la película de YIG (el crisol de platino no se consume), 3 espumar el fundente usado. La escoria alimenta la cascada de extracción.'],
        ['grindless.machine.yig_lpe_furnace.tooltip.2',
            'Parts go in the floor of the lowest step, front and back: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-2 input hatches, optional output hatch. Accepts a parallel hatch.',
            'Las piezas van en el suelo del escalón inferior, delante y detrás: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, 1-2 escotillas de entrada, escotilla de salida opcional. Acepta una escotilla de paralelos.'],

        ['emi.grindless.info.vdw_stacking_cell.0',
            'Flakes are cleaved from WTe2, Fe3GeTe2 and hBN crystals in argon and stacked hBN / WTe2 / FGT / hBN by a robotic stamp. It needs two UIV energy hatches and a 6N helium-cooled controller.',
            'Los copos se parten de cristales de WTe2, Fe3GeTe2 y hBN en argón y se apilan hBN / WTe2 / FGT / hBN con un sello robótico. Necesita dos escotillas de energía UIV y un controlador refrigerado con helio 6N.'],
        ['emi.grindless.info.vdw_stacking_cell.1',
            'Nothing is wasted: broken flakes return as WTe2 and Fe3GeTe2 dust, and the hBN dust goes back to the megabar press.',
            'Nada se desperdicia: los copos rotos vuelven como polvo de WTe2 y Fe3GeTe2, y el polvo de hBN vuelve a la prensa de megabar.'],
        ['emi.grindless.info.racetrack_fab.0',
            'An e-beam column writes the track pattern into the synthetic antiferromagnet stack, and an MTJ die is bonded on as the read head. It needs two UIV energy hatches and a 6N helium-cooled controller.',
            'Una columna de haz de electrones escribe el patrón de la pista en la pila del antiferromagneto sintético y se une un troquel MTJ como cabezal de lectura. Necesita dos escotillas de energía UIV y un controlador refrigerado con helio 6N.'],
        ['emi.grindless.info.racetrack_fab.1',
            'The platinum-group sludge from the lift-off is collected, never vented: it goes to the platinum-group processing line.',
            'El lodo de metales del grupo del platino del lift-off se recoge y nunca se ventila: va a la línea de procesado de metales del grupo del platino.'],
        ['emi.grindless.info.yig_lpe_furnace.0',
            'A GGG wafer is dipped into a lead-borate flux holding yttrium and iron oxides in a platinum crucible, and a YIG film grows on it. It needs two UIV energy hatches and a 6N helium-cooled controller.',
            'Una oblea de GGG se sumerge en un fundente de borato de plomo con óxidos de itrio y hierro en un crisol de platino, y crece una película de YIG sobre ella. Necesita dos escotillas de energía UIV y un controlador refrigerado con helio 6N.'],
        ['emi.grindless.info.yig_lpe_furnace.1',
            'Most of the flux is reused; the used flux is skimmed back into lead and boron oxides and the dross goes to solvent extraction.',
            'La mayor parte del fundente se reutiliza; el fundente usado se espuma para recuperar óxidos de plomo y boro y la escoria va a la extracción por disolventes.'],

        ['gtceu.recipe.grindless_vdw_stacking.wte2_flake',
            'Circuit 1: a WTe2 crystal is cleaved into flakes in argon; broken flakes come back as dust.',
            'Circuito 1: un cristal de WTe2 se parte en copos en argón; los copos rotos vuelven como polvo.'],
        ['gtceu.recipe.grindless_vdw_stacking.fgt_flake',
            'Circuit 2: an Fe3GeTe2 crystal is cleaved into flakes in argon; broken flakes come back as dust.',
            'Circuito 2: un cristal de Fe3GeTe2 se parte en copos en argón; los copos rotos vuelven como polvo.'],
        ['gtceu.recipe.grindless_vdw_stacking.hbn_flake',
            'Circuit 3: a megabar hBN crystal is cleaved into encapsulation flakes; broken flakes come back as hBN dust.',
            'Circuito 3: un cristal de hBN de megabar se parte en copos de encapsulado; los copos rotos vuelven como polvo de hBN.'],
        ['gtceu.recipe.grindless_vdw_stacking.sot_heterostack',
            'Circuit 4: hBN, WTe2, FGT and hBN flakes are stamped into one SOT heterostack; torn flakes come off as dust.',
            'Circuito 4: copos de hBN, WTe2, FGT y hBN se sellan en una heteroestructura SOT; los copos rotos salen como polvo.'],
        ['gtceu.recipe.grindless_racetrack_patterning.pattern_track',
            'Circuit 1: the track written by the e-beam is developed and etched; the platinum-group lift-off sludge is collected.',
            'Circuito 1: la pista escrita con haz de electrones se revela y se graba; el lodo del lift-off de metales del grupo del platino se recoge.'],
        ['gtceu.recipe.grindless_racetrack_patterning.racetrack_chip',
            'Circuit 2: an MTJ die is bonded onto the patterned track as its read head.',
            'Circuito 2: un troquel MTJ se une a la pista modelada como su cabezal de lectura.'],
        ['gtceu.recipe.grindless_liquid_phase_epitaxy.lpe_flux',
            'Circuit 1: lead and boron oxides melt into the lead-borate flux.',
            'Circuito 1: los óxidos de plomo y boro se funden en el fundente de borato de plomo.'],
        ['gtceu.recipe.grindless_liquid_phase_epitaxy.yig_film',
            'Circuit 2: a GGG wafer grows a YIG film in the flux; the platinum crucible is not consumed and most of the flux comes back.',
            'Circuito 2: una oblea de GGG crece una película de YIG en el fundente; el crisol de platino no se consume y la mayor parte del fundente vuelve.'],
        ['gtceu.recipe.grindless_liquid_phase_epitaxy.flux_skim',
            'Circuit 3: the used flux is skimmed; lead and boron oxides return and the dross goes to solvent extraction.',
            'Circuito 3: el fundente usado se espuma; los óxidos de plomo y boro vuelven y la escoria va a la extracción por disolventes.'],
        ['gtceu.recipe.grindless_photonic_integration.spintronic_mainframe',
            'Circuit 7: the spintronic mainframe, the only recipe for it; the logic die, racetrack chip, MRAM wafer, magnonic bus, MTJ die and shielded interposer are bonded.',
            'Circuito 7: el mainframe espintrónico, su única receta; se unen el dado lógico, el chip de pista, la oblea MRAM, el bus magnónico, el dado MTJ y el interpositor blindado.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['wte2_flake', 'WTe2 Flake', 'Copo de WTe2', 'A thin cleaved flake of tungsten ditelluride.', 'Un copo fino y exfoliado de ditelururo de tungsteno.', 'The spin-orbit layer of the SOT heterostack.', 'La capa espín-órbita de la heteroestructura SOT.'],
        ['fgt_flake', 'FGT Flake', 'Copo de FGT', 'A thin cleaved flake of Fe3GeTe2.', 'Un copo fino y exfoliado de Fe3GeTe2.', 'The ferromagnetic layer of the SOT heterostack.', 'La capa ferromagnética de la heteroestructura SOT.'],
        ['hbn_flake', 'hBN Flake', 'Copo de hBN', 'A thin cleaved flake of megabar hexagonal boron nitride.', 'Un copo fino y exfoliado de nitruro de boro hexagonal de megabar.', 'Encapsulates the SOT heterostack top and bottom.', 'Encapsula la heteroestructura SOT por arriba y por abajo.'],
        ['patterned_track_wafer', 'Patterned Track Wafer', 'Oblea de pista modelada', 'A SAF stack with the racetrack pattern written by an e-beam.', 'Una pila SAF con el patrón de la pista escrito por un haz de electrones.', 'Gets an MTJ read head in the racetrack fab (circuit 2).', 'Recibe un cabezal de lectura MTJ en la fábrica de pistas de carrera (circuito 2).'],
        ['pt_crucible_shell', 'Platinum Crucible Shell', 'Casco de crisol de platino', 'Four platinum sheets spun into a deep bowl.', 'Cuatro láminas de platino hiladas en un cuenco hondo.', 'Welded shut with 5N platinum into the LPE crucible.', 'Se suelda con platino 5N para formar el crisol LPE.']
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
