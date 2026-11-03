// priority: 2600
// Gregtech Grindless - names and tooltips of UV's Kuiper belt (startup_scripts/grindless/uv/kuiper.js):
//
//   gtceu:kuiper_interceptor_bay   machine name + tooltip line
//   gtceu:kuiper_intercept         recipe type name
//   grindless:kuiper_interceptor / sample_canister          names + two tooltip lines each
// The planetesimal sample and the Kuiper noble gas are F1's and named in uv_foundation_lang.js.
(function () {
    var TEXT = {
        en_us: {
            bay: 'Kuiper Interceptor Bay',
            bayType: 'Kuiper Intercept',
            bayTips: [
                '§7Intercepts a Kuiper Belt object for a planetesimal sample.'
            ],
            items: {
                kuiper_interceptor: ['Kuiper Interceptor', 'A thruster pod, a probe RTG and a sample canister: the delta-v and the power to reach a Kuiper Belt object and return.', 'Assembler. Spent in the Kuiper interceptor bay; the canister comes back.'],
                sample_canister: ['Sample Canister', 'A titanium return capsule with PTFE seals and a sensor that logs the cold chain all the way home.', 'Assembler (circuit 9). The Kuiper interceptor bay gives it back empty.']
            }
        }
    }

    ClientEvents.lang('en_us', function (event) {
        var t = TEXT.en_us
        var add = function (key, value) { event.add('grindless', key, value) }

        add('block.gtceu.kuiper_interceptor_bay', t.bay)
        add('gtceu.kuiper_intercept', t.bayType)
        for (var i = 0; i < 1; i++) {
            add('grindless.machine.kuiper_interceptor_bay.tooltip.' + i, t.bayTips[i])
        }
        Object.keys(t.items).forEach(function (name) {
            add('item.grindless.' + name, t.items[name][0])
            add('tooltip.grindless.' + name + '.0', t.items[name][1])
            add('tooltip.grindless.' + name + '.1', t.items[name][2])
        })
    })
})()
