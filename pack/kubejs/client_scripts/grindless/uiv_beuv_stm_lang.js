// priority: 3300
// Gregtech Grindless - names and tooltips of UIV's BEUV scanner and STM lithography cell (startup_scripts/grindless/uiv/beuv_stm.js; package UIV-A5):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each scanner and cell recipe
//   material.gtceu.phosphine                           the doping gas
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.beuv_scanner', 'BEUV Scanner', 'Escáner BEUV'],
        ['block.gtceu.stm_lithography_cell', 'STM Lithography Cell', 'Celda de litografía STM'],
        ['gtceu.beuv_lithography', 'BEUV Lithography', 'Litografía BEUV'],
        ['gtceu.stm_lithography', 'STM Lithography', 'Litografía STM'],

        ['material.gtceu.phosphine', 'Phosphine', 'Fosfina'],

        ['grindless.machine.beuv_scanner.tooltip.0',
            '\u00a77Exposes resist at 6.7 nm: the only maker of BEUV driver ASICs.',
            '\u00a77Expone resina a 6,7 nm: único fabricante de ASIC de control BEUV.'],
        ['grindless.machine.stm_lithography_cell.tooltip.0',
            '\u00a77Moves single hydrogen atoms: patterns and doses Si-28 wafers.',
            '\u00a77Mueve átomos de hidrógeno sueltos: patrona y dosifica obleas de Si-28.'],

        ['gtceu.recipe.grindless_beuv_lithography.exposure',
            'Circuit 1: a terbium droplet is lit at 6.7 nm and exposes the HfO2 resist; the collector mirror comes out fouled by terbium debris.',
            'Circuito 1: una gota de terbio se ilumina a 6,7 nm y expone la resina de HfO2; el espejo colector sale ensuciado por restos de terbio.'],
        ['gtceu.recipe.grindless_beuv_lithography.driver_asic',
            'Circuit 2: the exposed film is developed in an ethanol bath (not consumed) and cut into driver ASICs.',
            'Circuito 2: la película expuesta se revela en un baño de etanol (no se consume) y se corta en ASIC de control.'],
        ['gtceu.recipe.grindless_beuv_lithography.mirror_cleaning',
            'Circuit 3: the fouled mirror is cleaned and the terbium debris is recovered as metal.',
            'Circuito 3: el espejo ensuciado se limpia y los restos de terbio se recuperan como metal.'],
        ['gtceu.recipe.grindless_stm_lithography.h_terminate',
            'Circuit 1: hydrogen passivates the surface of a Si-28 SOI wafer.',
            'Circuito 1: el hidrógeno pasiva la superficie de una oblea SOI de Si-28.'],
        ['gtceu.recipe.grindless_stm_lithography.stm_pattern',
            'Circuit 2: the tip removes single hydrogen atoms in the pattern; liquid helium cools the stage and boils off as helium.',
            'Circuito 2: la punta retira átomos de hidrógeno individuales según el patrón; el helio líquido enfría la platina y se evapora como helio.'],
        ['gtceu.recipe.grindless_stm_lithography.ph3_dose',
            'Circuit 3: phosphine adsorbs on the bare silicon; the excess gas goes to the phosphine scrubber, which makes phosphoric acid.',
            'Circuito 3: la fosfina se adsorbe en el silicio desnudo; el gas sobrante va al depurador de fosfina, que produce ácido fosfórico.'],

        ['gtceu.recipe.grindless_molecular_beam_epitaxy.la_b4c_multilayer',
            'Circuit 5: lanthanum and boron carbide are deposited in alternating layers on glass; the B4C offcuts return to stock.',
            'Circuito 5: lantano y carburo de boro se depositan en capas alternas sobre vidrio; los recortes de B4C vuelven al inventario.'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.psi_overgrowth',
            'Circuit 6: a Si-28 overgrowth buries the phosphorus-dosed pattern into a P:Si die.',
            'Circuito 6: un sobrecrecimiento de Si-28 entierra el patrón dosificado con fósforo y forma un dado P:Si.'],
        ['gtceu.recipe.grindless_photonic_foundry.hfo2_resist',
            'Circuit 12: a hafnia film is spun on a silicon wafer to make the BEUV resist.',
            'Circuito 12: una película de hafnia se deposita sobre una oblea de silicio y forma la resina BEUV.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['tb_droplet_target', 'Terbium Droplet Target', 'Blanco de gotas de terbio', 'Terbium on a tin carrier, fired as droplets into the BEUV source.', 'Terbio sobre un portador de estaño, disparado como gotas en la fuente BEUV.', 'Each exposure uses one; the debris comes back as terbium.', 'Cada exposición usa uno; los restos vuelven como terbio.'],
        ['hfo2_resist_wafer', 'HfO2 Resist Wafer', 'Oblea con resina de HfO2', 'A silicon wafer under a thin hafnia film.', 'Una oblea de silicio bajo una película fina de hafnia.', 'Exposed in the BEUV scanner (circuit 1).', 'Se expone en el escáner BEUV (circuito 1).'],
        ['beuv_exposed_wafer', 'BEUV-Exposed Wafer', 'Oblea expuesta a BEUV', 'The resist carries a latent 6.7 nm pattern.', 'La resina lleva un patrón latente de 6,7 nm.', 'Developed into driver ASICs (circuit 2).', 'Se revela en ASIC de control (circuito 2).'],
        ['fouled_beuv_mirror', 'Fouled BEUV Mirror', 'Espejo BEUV ensuciado', 'Coated with terbium debris and no longer reflective.', 'Cubierto de restos de terbio y sin reflejar.', 'Cleaned in the scanner (circuit 3), which returns the terbium.', 'Se limpia en el escáner (circuito 3), que devuelve el terbio.'],
        ['beuv_driver_asic', 'BEUV Driver ASIC', 'ASIC de control BEUV', 'A control chip printed at 6.7 nm.', 'Un chip de control impreso a 6,7 nm.', 'Only the BEUV scanner makes it.', 'Solo el escáner BEUV lo fabrica.'],
        ['b4c_target', 'Boron Carbide Target', 'Blanco de carburo de boro', 'A sintered B4C sputtering target.', 'Un blanco de pulverización de B4C sinterizado.', 'Coats a mirror in the MBE reactor (circuit 5).', 'Recubre un espejo en el reactor MBE (circuito 5).'],
        ['la_b4c_multilayer', 'La/B4C Multilayer', 'Multicapa La/B4C', 'Alternating lanthanum and boron carbide layers on glass.', 'Capas alternas de lantano y carburo de boro sobre vidrio.', 'Gets a LaN barrier in the chemical reactor.', 'Recibe una barrera de LaN en el reactor químico.'],
        ['lan_barrier_mirror', 'LaN-Barrier Mirror', 'Espejo con barrera de LaN', 'A multilayer with a lanthanum nitride diffusion barrier.', 'Una multicapa con una barrera de difusión de nitruro de lantano.', 'Capped with ruthenium in the assembler.', 'Se cubre con rutenio en el ensamblador.'],
        ['beuv_mirror', 'BEUV Mirror', 'Espejo BEUV', 'A ruthenium-capped La/B4C mirror for 6.7 nm light.', 'Un espejo La/B4C con cubierta de rutenio para luz de 6,7 nm.', 'Fouls on every exposure and is cleaned, not replaced.', 'Se ensucia en cada exposición y se limpia, no se sustituye.'],
        ['si28_fz_ingot', 'Si-28 Float-Zone Ingot', 'Lingote de Si-28 de zona flotante', 'Isotopically pure silicon, zone-refined.', 'Silicio isotópicamente puro, refinado por zonas.', 'Cut into wafers; donor wafers regrow it.', 'Se corta en obleas; las obleas donantes lo regeneran.'],
        ['si28_fz_wafer', 'Si-28 Wafer', 'Oblea de Si-28', 'A polished wafer of isotopically pure silicon.', 'Una oblea pulida de silicio isotópicamente puro.', 'Implanted with hydrogen in the ion implanter (circuit 6).', 'Se implanta con hidrógeno en el implantador iónico (circuito 6).'],
        ['h_terminated_wafer', 'H-Terminated Wafer', 'Oblea terminada en H', 'A Si-28 SOI surface capped with hydrogen.', 'Una superficie SOI de Si-28 cubierta de hidrógeno.', 'Patterned atom by atom in the STM cell.', 'Se modela átomo a átomo en la celda STM.'],
        ['stm_patterned_wafer', 'STM-Patterned Wafer', 'Oblea con patrón STM', 'Bare silicon where the hydrogen was removed.', 'Silicio desnudo donde se retiró el hidrógeno.', 'Dosed with phosphine (circuit 3).', 'Se dosifica con fosfina (circuito 3).'],
        ['ph3_dosed_wafer', 'PH3-Dosed Wafer', 'Oblea dosificada con PH3', 'Phosphorus atoms placed in the pattern.', 'Átomos de fósforo colocados según el patrón.', 'Buried under Si-28 in the MBE reactor (circuit 6).', 'Se entierra bajo Si-28 en el reactor MBE (circuito 6).']
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
