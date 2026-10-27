// Gregtech Grindless - names and tooltips of UV's life (startup_scripts/grindless/uv/life.js):
//
//   gtceu:ark_biosphere / gtceu:neural_culture_vat   machine names + four tooltip lines each
//   gtceu:closed_ecosystem / gtceu:neural_culture     recipe type names
//   grindless:algae_culture                           item name + tooltip
(function () {
    var TEXT = {
        en_us: {
            ark: 'Ark Biosphere', vat: 'Neural Culture Vat',
            arkType: 'Closed Ecosystem', vatType: 'Neural Culture',
            algae: 'Algae Culture',
            algaeTip: 'The ark\'s algae bank. Not consumed by the ark\'s cycle; copied by its circuit 2, first isolated on agar by its circuit 3.',
            arkTips: [
                'The greenhouse family\'s step 7: a closed ecosystem. Programmed circuit 1: 1,000 mB carbon dioxide + 250 mB ammonia + 1,000 mB water -> 500 mB oxygen + 500 mB raw growth medium + 250 mB biomass.',
                'Circuit 1 needs an algae culture and an archaeal culture in the input bus (not consumed): the algae turn the CO2 back into oxygen, the archaea in the core make the medium.',
                'Circuit 2: 1 algae culture + 1 archaeal culture + 1,000 mB biomass -> 2 of each. Circuit 3: 1 agar dust + 1,000 mB biomass + 1,000 mB water -> 1 algae culture. Biomass goes to the biorefinery.',
                'Needs an 11 x 9 x 11 dome: UV machine casing floor (the parts, 90 or more casings) and footing, laminated glass walls and cap, a 7 x 7 glass tube ring under GT lamps, a 3 x 3 x 3 inert casing core; 1 or 2 energy hatches (UV).'
            ],
            vatTips: [
                'Wetware in batches; GTM\'s own stem cell and neuro processing unit recipes still work. Circuit 1: 1,000 mB raw growth medium + 4 gelatin dust -> 64 stem cells + 250 mB biomass.',
                'Circuit 1 needs a neural organoid (from the organoid lab) in the input bus, not consumed: it seeds the culture.',
                'Circuit 2: 8 stem cells + 1 wetware printed circuit board + 1,000 mB sterilised growth medium -> 4 neuro processing units + 250 mB biomass. Failed cultures are autoclaved inside.',
                'Needs a 7 x 7 x 7 plascrete room: cleanroom glass windows, a 3 x 3 filter casing ceiling, four heatproof casing incubators and a robust casing bioprinter; parts in the floor (30 or more casings), 1 or 2 energy hatches (UV).'
            ]
        },
        es_es: {
            ark: 'Biosfera Arca', vat: 'Cuba de Cultivo Neural',
            arkType: 'Ecosistema cerrado', vatType: 'Cultivo neural',
            algae: 'Cultivo de Algas',
            algaeTip: 'El banco de algas del arca. El ciclo del arca no lo consume; su circuito 2 lo copia y su circuito 3 lo aisla por primera vez en agar.',
            arkTips: [
                'El paso 7 de la familia de invernaderos: un ecosistema cerrado. Circuito programado 1: 1.000 mB de dioxido de carbono + 250 mB de amoniaco + 1.000 mB de agua -> 500 mB de oxigeno + 500 mB de medio de cultivo crudo + 250 mB de biomasa.',
                'El circuito 1 necesita un cultivo de algas y un cultivo de arqueas en el bus de entrada (no se consumen): las algas devuelven el CO2 como oxigeno y las arqueas del nucleo hacen el medio.',
                'Circuito 2: 1 cultivo de algas + 1 cultivo de arqueas + 1.000 mB de biomasa -> 2 de cada. Circuito 3: 1 polvo de agar + 1.000 mB de biomasa + 1.000 mB de agua -> 1 cultivo de algas. La biomasa va a la biorrefineria.',
                'Necesita una cupula de 11 x 9 x 11: suelo de carcasa de maquina UV (las piezas, 90 o mas carcasas) y zocalo, paredes y techo de vidrio laminado, un anillo de tubos de vidrio de 7 x 7 bajo lamparas GT y un nucleo de carcasa inerte de 3 x 3 x 3; 1 o 2 hatches de energia (UV).'
            ],
            vatTips: [
                'Wetware por lotes; las recetas de GTM de celulas madre y unidades de neuroprocesamiento siguen funcionando. Circuito 1: 1.000 mB de medio de cultivo crudo + 4 polvos de gelatina -> 64 celulas madre + 250 mB de biomasa.',
                'El circuito 1 necesita un organoide neural (del laboratorio de organoides) en el bus de entrada, no se consume: siembra el cultivo.',
                'Circuito 2: 8 celulas madre + 1 placa de circuito impreso de wetware + 1.000 mB de medio de cultivo esterilizado -> 4 unidades de neuroprocesamiento + 250 mB de biomasa. Los cultivos fallidos se esterilizan en autoclave dentro.',
                'Necesita una sala de plascreto de 7 x 7 x 7: ventanas de vidrio de sala limpia, un techo de 3 x 3 de carcasas de filtro, cuatro incubadoras de carcasa termorresistente y una bioimpresora de carcasa robusta; piezas en el suelo (30 o mas carcasas), 1 o 2 hatches de energia (UV).'
            ]
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.ark_biosphere', t.ark)
            add('block.gtceu.neural_culture_vat', t.vat)
            add('gtceu.closed_ecosystem', t.arkType)
            add('gtceu.neural_culture', t.vatType)
            add('item.grindless.algae_culture', t.algae)
            add('item.grindless.algae_culture.tooltip', t.algaeTip)
            for (var i = 0; i < 4; i++) {
                add('grindless.machine.ark_biosphere.tooltip.' + i, t.arkTips[i])
                add('grindless.machine.neural_culture_vat.tooltip.' + i, t.vatTips[i])
            }
        })
    })
})()
