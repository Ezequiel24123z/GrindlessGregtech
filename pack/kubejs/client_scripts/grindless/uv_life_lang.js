// priority: 2500
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
                '§7A closed ecosystem that makes oxygen, medium and biomass.'
            ],
            vatTips: [
                '§7Grows wetware in batches: stem cells and neural tissue.'
            ]
        }
    }

    ClientEvents.lang('en_us', function (event) {
        var t = TEXT.en_us
        var add = function (key, value) { event.add('grindless', key, value) }

        add('block.gtceu.ark_biosphere', t.ark)
        add('block.gtceu.neural_culture_vat', t.vat)
        add('gtceu.closed_ecosystem', t.arkType)
        add('gtceu.neural_culture', t.vatType)
        add('item.grindless.algae_culture', t.algae)
        add('item.grindless.algae_culture.tooltip', t.algaeTip)
        for (var i = 0; i < 1; i++) {
            add('grindless.machine.ark_biosphere.tooltip.' + i, t.arkTips[i])
            add('grindless.machine.neural_culture_vat.tooltip.' + i, t.vatTips[i])
        }
    })
})()
