// Gregtech Grindless - names and tooltips of UV's thorium front end (startup_scripts/grindless/uv/thorium_refining.js):
//
//   grindless:thoria_pellet / thorium_nitride_pellet / thoria_fuel_pin / thorium_nitride_fuel_pin / cladding_tube_15_15ti   names + two tooltip lines each
//   gtceu:n_butanol / tributyl_phosphate / tbp_solvent / loaded_tbp_solvent / crude_thorium_nitrate / thorium_nitrate / thorium_oxalate / thoria
//                                                                                                        material.gtceu.<n>
(function () {
    var TEXT = {
        items: {
            thoria_pellet: ['Thoria Pellet', 'A sintered cylinder of thorium dioxide, the most refractory fuel there is.', 'Pressed in the fuel fabrication plant (circuit 15).'],
            thorium_nitride_pellet: ['Thorium Nitride Pellet', 'A dense sintered pellet of thorium nitride: more thorium per volume and a far better conductor of heat than the oxide.', 'Pressed in the fuel fabrication plant (circuit 14).'],
            thoria_fuel_pin: ['Thoria Fuel Pin', 'Four thoria pellets in a helium-filled 15-15Ti tube, plugs welded.', 'Made in the fuel fabrication plant (circuit 17).'],
            thorium_nitride_fuel_pin: ['Thorium Nitride Fuel Pin', 'Four thorium nitride pellets in a helium-filled 15-15Ti tube, plugs welded.', 'Made in the fuel fabrication plant (circuit 16).'],
            cladding_tube_15_15ti: ['15-15Ti Cladding Tube', 'Titanium-stabilised 15Cr-15Ni steel, drawn thin: it holds up to fast-neutron swelling better than zircaloy.', 'Made in the fuel fabrication plant (circuit 18).']
        },
        materials: {
            n_butanol: 'n-Butanol', tributyl_phosphate: 'Tributyl Phosphate', tbp_solvent: 'TBP Solvent', loaded_tbp_solvent: 'Loaded TBP Solvent',
            crude_thorium_nitrate: 'Crude Thorium Nitrate Solution', thorium_nitrate: 'Thorium Nitrate Solution', thorium_oxalate: 'Thorium Oxalate', thoria: 'Thoria'
        }
    }

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        Object.keys(TEXT.items).forEach(function (name) {
            add('item.grindless.' + name, TEXT.items[name][0])
            add('tooltip.grindless.' + name + '.0', TEXT.items[name][1])
            add('tooltip.grindless.' + name + '.1', TEXT.items[name][2])
        })
        Object.keys(TEXT.materials).forEach(function (name) { add('material.gtceu.' + name, TEXT.materials[name]) })
    })
})()
