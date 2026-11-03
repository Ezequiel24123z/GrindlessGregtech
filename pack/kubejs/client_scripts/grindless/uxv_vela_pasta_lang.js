// priority: 1439
// Gregtech Grindless - names and tooltips of UXV's pasta extractor, phase sorter, draw bench, laminator and polar cap tap
// (startup_scripts/grindless/uxv/vela_pasta.js; package UXV-B4):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.pasta_extractor', 'Pasta Extractor'],
        ['block.gtceu.pasta_phase_sorter', 'Pasta Mill'],
        ['block.gtceu.polar_cap_tap', 'Polar Cap Tap'],
        ['gtceu.pasta_extraction', 'Pasta Extraction'],
        ['gtceu.pasta_sorting', 'Pasta Sorting'],
        ['gtceu.pasta_drawing', 'Pasta Drawing'],
        ['gtceu.pasta_lamination', 'Pasta Lamination'],
        ['gtceu.polar_cap_tapping', 'Polar Cap Tapping'],

        ['grindless.machine.pasta_extractor.tooltip.0',
            '\u00a77Catches the nuclear pasta a glitching Vela pulsar sheds.'],
        ['grindless.machine.pasta_phase_sorter.tooltip.0',
            '\u00a77Sorts raw pasta into phases, draws strand wire, presses lasagna plates.'],
        ['grindless.machine.polar_cap_tap.tooltip.0',
            '\u00a77Generator: taps the pulsar\'s polar cap through lasagna electrodes.'],
        ['grindless.machine.polar_cap_tap.tooltip.1',
            'Dynamo: 1 UIV 16 A hatch. No parallel hatch.'],

        ['emi.grindless.info.pasta_extractor.0',
            'The nuclear pasta comes from the Vela pulsar, so the extractor runs in Vela pulsar orbit. It lies on its side: orbit has no up.'],
        ['emi.grindless.info.pasta_extractor.1',
            'The glitch timing record is kept; the neutronium pellet bait is spent one run in ten. Raw pasta goes to the phase sorter.'],
        ['emi.grindless.info.pasta_phase_sorter.0',
            'The mill runs anywhere on carried raw pasta. A sorter drum splits it into phases; the spaghetti phase goes down the draw line, the lasagna phase to the press hall and the gnocchi fragment to the r-process decompressor.'],
        ['emi.grindless.info.pasta_phase_sorter.1',
            'The anti-phase residue is not wasted: sixteen of them sealed in a cage part make a core sample, kept as a data sample of the star\'s crust. The cage part is kept by every pass.'],
        ['emi.grindless.info.pasta_phase_sorter.2',
            'Spaghetti pasta is drawn into pasta wire: the UXV cable, which carries 4 A at UXV voltage with no loss, and of which the hatches, the voltage coil and the lasagna electrode are made.'],
        ['emi.grindless.info.pasta_phase_sorter.3',
            'The lasagna phase is pressed flat. The plates make the UXV hull and the wireless links; with pasta wire they make the lasagna electrode.'],
        ['emi.grindless.info.polar_cap_tap.0',
            'The tap makes its power from the pulsar\'s polar cap in Vela pulsar orbit.             An electrode is the fuel: one makes 386,547,056,640 EU in 720 ticks, and a UIV 16 A dynamo hatch carries 536,870,912 EU/t of it. It leaves through pasta wire.'],
        ['emi.grindless.info.polar_cap_tap.1',
            'Power is generous, never free: making one electrode costs about 195 billion EU across the Vela works (raw pasta, drawing, pressing, four electrodes per pasta), so the tap returns about twice what it cost.'],

        ['gtceu.recipe.grindless_r_process_decompression.gnocchi_decompression',
            'Circuit 3: a gnocchi fragment from Vela\'s pasta swells in the neutron flood into r-process ash; the fission fragments go to the decay heat vault.'],
        ['gtceu.recipe.grindless_pasta_extraction.pasta_extraction',
            'Circuit 1: the funnel catches the pasta the glitching crust sheds; the timing record is kept and one pellet in ten is spent as bait.'],
        ['gtceu.recipe.grindless_pasta_sorting.phase_sorting',
            'Circuit 1: raw pasta is sorted into the spaghetti and lasagna phases, a gnocchi fragment and an anti-phase residue; the cage part is kept.'],
        ['gtceu.recipe.grindless_pasta_sorting.core_sample',
            'Circuit 2: sixteen anti-phase residues are sealed in a cage part as one core sample.'],
        ['gtceu.recipe.grindless_pasta_drawing.strand_drawing',
            'Circuit 1: the spaghetti phase is drawn through an aerogel die into eight strands of pasta wire; the cage part is kept.'],
        ['gtceu.recipe.grindless_pasta_lamination.plate_pressing',
            'Circuit 1: the lasagna phase is pressed on a rhea billet into four plates; the cage part is kept.'],
        ['gtceu.recipe.grindless_pasta_lamination.lasagna_electrode',
            'Circuit 2: a lasagna plate carries two strands of pasta wire as a lasagna electrode.'],
        ['gtceu.recipe.grindless_polar_cap_tapping.polar_cap_tap',
            'Circuit 1: the lasagna electrode taps the polar cap for 720 ticks at 536,870,912 EU/t (386,547,056,640 EU) and is spent.']
                    ,
                    ['item.grindless.lasagna_electrode', 'Lasagna Electrode'],
                    ['tooltip.grindless.lasagna_electrode.0', 'A plate of lasagna phase wound with pasta wire.'],
                    ['tooltip.grindless.lasagna_electrode.1', 'Spent by the polar cap tap.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
