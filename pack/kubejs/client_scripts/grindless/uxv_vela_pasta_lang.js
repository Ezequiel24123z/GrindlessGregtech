// priority: 1439
// Gregtech Grindless - names and tooltips of UXV's pasta extractor, phase sorter, draw bench, laminator and polar cap tap
// (startup_scripts/grindless/uxv/vela_pasta.js; package UXV-B4):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.pasta_extractor', 'Pasta Extractor', 'Extractor de pasta'],
        ['block.gtceu.pasta_phase_sorter', 'Pasta Phase Sorter', 'Clasificador de fases de pasta'],
        ['block.gtceu.pasta_draw_bench', 'Pasta Draw Bench', 'Banco de trefilado de pasta'],
        ['block.gtceu.pasta_laminator', 'Pasta Laminator', 'Laminador de pasta'],
        ['block.gtceu.polar_cap_tap', 'Polar Cap Tap', 'Toma del casquete polar'],
        ['gtceu.pasta_extraction', 'Pasta Extraction', 'Extracción de pasta'],
        ['gtceu.pasta_sorting', 'Pasta Sorting', 'Clasificación de pasta'],
        ['gtceu.pasta_drawing', 'Pasta Drawing', 'Trefilado de pasta'],
        ['gtceu.pasta_lamination', 'Pasta Lamination', 'Laminado de pasta'],
        ['gtceu.polar_cap_tapping', 'Polar Cap Tapping', 'Toma del casquete polar'],

        ['grindless.machine.pasta_extractor.tooltip.0',
            '\u00a77Catches the nuclear pasta a glitching Vela pulsar sheds.',
            '\u00a77Recoge la pasta nuclear que suelta un púlsar de Vela con glitch.'],
        ['grindless.machine.pasta_phase_sorter.tooltip.0',
            '\u00a77Sorts raw pasta into spaghetti, lasagna and gnocchi phases.',
            '\u00a77Ordena la pasta cruda en fases espagueti, lasaña y ñoqui.'],
        ['grindless.machine.pasta_draw_bench.tooltip.0',
            '\u00a77Draws the spaghetti phase into strands of pasta wire.',
            '\u00a77Estira la fase espagueti en hebras de cable de pasta.'],
        ['grindless.machine.pasta_laminator.tooltip.0',
            '\u00a77Presses the lasagna phase into plates and electrodes.',
            '\u00a77Prensa la fase lasaña en placas y electrodos.'],
        ['grindless.machine.polar_cap_tap.tooltip.0',
            '\u00a77Generator: taps the pulsar\'s polar cap through lasagna electrodes.',
            '\u00a77Generador: toma energía del casquete polar del púlsar con electrodos de lasaña.'],
        ['grindless.machine.polar_cap_tap.tooltip.1',
            'Dynamo: 1 UIV 16 A hatch. No parallel hatch.',
            'Dinamo: 1 escotilla UIV de 16 A. Sin paralelos.'],

        ['emi.grindless.info.pasta_extractor.0',
            'The nuclear pasta comes from the Vela pulsar, so the extractor runs in Vela pulsar orbit. It lies on its side: orbit has no up.',
            'La pasta nuclear viene del púlsar de Vela, así que el extractor funciona en la órbita del púlsar de Vela. Está tumbado: la órbita no tiene arriba.'],
        ['emi.grindless.info.pasta_extractor.1',
            'The glitch timing record is kept; the neutronium pellet bait is spent one run in ten. Raw pasta goes to the phase sorter.',
            'El registro de tiempos del glitch no se consume; el cebo de pellet de neutronio se gasta una vez de cada diez. La pasta cruda va al clasificador de fases.'],
        ['emi.grindless.info.pasta_phase_sorter.0',
            'The sorter runs in Vela pulsar orbit, where the raw pasta is. The spaghetti phase goes to the draw bench, the lasagna phase to the laminator and the gnocchi fragment to the r-process decompressor.',
            'El clasificador funciona en la órbita del púlsar de Vela, donde está la pasta cruda. La fase espagueti va al banco de trefilado, la lasaña al laminador y el fragmento de ñoqui al descompresor de proceso r.'],
        ['emi.grindless.info.pasta_phase_sorter.1',
            'The anti-phase residue is not wasted: sixteen of them sealed in a cage part make a core sample, kept as a data sample of the star\'s crust.',
            'El residuo antifase no se desperdicia: dieciséis sellados en una pieza de jaula dan una muestra de núcleo, que se guarda como dato de la corteza de la estrella.'],
        ['emi.grindless.info.pasta_draw_bench.0',
            'Spaghetti pasta is drawn into pasta wire in Vela pulsar orbit. The wire is the UXV cable: it carries 4 A at UXV voltage with no loss,             and the hatches, the voltage coil and the lasagna electrode are made of it.',
                        'La pasta espagueti se trefila en cable de pasta en la órbita del púlsar de Vela. El cable es el cable UXV: lleva 4 A a voltaje UXV sin pérdidas, y con él se hacen las escotillas, la bobina de voltaje y el electrodo de lasaña.'],
        ['emi.grindless.info.pasta_draw_bench.1',
            'The cage part is kept, only the spaghetti phase and the aerogel die are used up.',
            'La pieza de jaula no se consume, solo se gastan la fase espagueti y la matriz de aerogel.'],
        ['emi.grindless.info.pasta_laminator.0',
            'The lasagna phase is pressed flat in Vela pulsar orbit. The plates make the UXV hull and the wireless links; with pasta wire             they make the lasagna electrode.',
                        'La fase lasaña se prensa en la órbita del púlsar de Vela. Las placas hacen el casco UXV y los enlaces inalámbricos; con cable de pasta hacen el electrodo de lasaña.'],
        ['emi.grindless.info.pasta_laminator.1',
            'The cage part is kept; the rhea billet and the lasagna phase are used up.',
            'La pieza de jaula no se consume; se gastan el lingote de rhea y la fase lasaña.'],
        ['emi.grindless.info.polar_cap_tap.0',
            'The tap makes its power from the pulsar\'s polar cap in Vela pulsar orbit.             An electrode is the fuel: one makes 386,547,056,640 EU in 720 ticks, and a UIV 16 A dynamo hatch carries 536,870,912 EU/t of it. It leaves through pasta wire.',
                        'La toma saca su energía del casquete polar del púlsar en la órbita del púlsar de Vela. Un electrodo es el combustible: uno produce 386.547.056.640 EU en 720 ticks, y una escotilla generadora UIV de 16 A lleva 536.870.912 EU/t. Sale por cable de pasta.'],
        ['emi.grindless.info.polar_cap_tap.1',
            'Power is generous, never free: making one electrode costs about 195 billion EU across the Vela works (raw pasta, drawing, pressing, four electrodes per pasta), so the tap returns about twice what it cost.',
                        'La energía es generosa, nunca gratis: fabricar un electrodo cuesta unos 195.000 millones de EU en las obras de Vela (pasta cruda, trefilado, prensado, cuatro electrodos por pasta), así que la toma devuelve cerca del doble de lo que costó.'],

        ['gtceu.recipe.grindless_r_process_decompression.gnocchi_decompression',
            'Circuit 3: a gnocchi fragment from Vela\'s pasta swells in the neutron flood into r-process ash; the fission fragments go to the decay heat vault.',
            'Circuito 3: un fragmento de ñoqui de la pasta de Vela se hincha en el flujo de neutrones en ceniza de proceso r; los fragmentos de fisión van a la bóveda de calor de desintegración.'],
        ['gtceu.recipe.grindless_pasta_extraction.pasta_extraction',
            'Circuit 1: the funnel catches the pasta the glitching crust sheds; the timing record is kept and one pellet in ten is spent as bait.',
            'Circuito 1: el embudo recoge la pasta que suelta la corteza en el glitch; el registro de tiempos no se consume y un pellet de cada diez se gasta como cebo.'],
        ['gtceu.recipe.grindless_pasta_sorting.phase_sorting',
            'Circuit 1: raw pasta is sorted into the spaghetti and lasagna phases, a gnocchi fragment and an anti-phase residue; the cage part is kept.',
            'Circuito 1: la pasta cruda se ordena en fases espagueti y lasaña, un fragmento de ñoqui y un residuo antifase; la pieza de jaula no se consume.'],
        ['gtceu.recipe.grindless_pasta_sorting.core_sample',
            'Circuit 2: sixteen anti-phase residues are sealed in a cage part as one core sample.',
            'Circuito 2: dieciséis residuos antifase se sellan en una pieza de jaula como una muestra de núcleo.'],
        ['gtceu.recipe.grindless_pasta_drawing.strand_drawing',
            'Circuit 1: the spaghetti phase is drawn through an aerogel die into eight strands of pasta wire; the cage part is kept.',
            'Circuito 1: la fase espagueti se estira por una matriz de aerogel en ocho hebras de cable de pasta; la pieza de jaula no se consume.'],
        ['gtceu.recipe.grindless_pasta_lamination.plate_pressing',
            'Circuit 1: the lasagna phase is pressed on a rhea billet into four plates; the cage part is kept.',
            'Circuito 1: la fase lasaña se prensa sobre un lingote de rhea en cuatro placas; la pieza de jaula no se consume.'],
        ['gtceu.recipe.grindless_pasta_lamination.lasagna_electrode',
            'Circuit 2: a lasagna plate carries two strands of pasta wire as a lasagna electrode.',
            'Circuito 2: una placa de lasaña lleva dos hebras de cable de pasta como electrodo de lasaña.'],
        ['gtceu.recipe.grindless_polar_cap_tapping.polar_cap_tap',
            'Circuit 1: the lasagna electrode taps the polar cap for 720 ticks at 536,870,912 EU/t (386,547,056,640 EU) and is spent.',
                        'Circuito 1: el electrodo de lasaña toma energía del casquete polar durante 720 ticks a 536.870.912 EU/t (386.547.056.640 EU) y se gasta.']
                    ,
                    ['item.grindless.lasagna_electrode', 'Lasagna Electrode', 'Electrodo de lasaña'],
                    ['tooltip.grindless.lasagna_electrode.0', 'A plate of lasagna phase wound with pasta wire.', 'Una placa de fase lasaña bobinada con cable de pasta.'],
                    ['tooltip.grindless.lasagna_electrode.1', 'Spent by the polar cap tap.', 'Lo gasta la toma del casquete polar.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
