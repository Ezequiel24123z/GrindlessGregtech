// priority: 4545
// Gregtech Grindless - names and tooltips of UHV W11, the gate ring's MgB2 coils (startup_scripts/grindless/uhv/gate_ring.js):
//   grindless:<item>   name + two tooltip lines
//   gtceu.recipe.grindless_naquadria_magnets.<name>   the EMI line of each magnet works recipe (circuits 13-15)
(function () {
    var ITEMS = {
        mgb2_cable: ['MgB2 Cable', 'Eight magnesium diboride wires cabled round two copper foil stabilisers.', 'Made in the Naquadria Magnet Works (circuit 13); wound into a gate coil.'],
        gate_coil_winding: ['Gate Coil Winding', 'Four MgB2 cables wound on a former and insulated with Kapton K foil. Not yet superconducting.', 'Made in the Naquadria Magnet Works (circuit 14); reacted in the blast furnace.'],
        reacted_gate_coil: ['Reacted Gate Coil', 'A winding heat-treated at 973 K in argon, so the MgB2 forms inside the wires. Brittle.', 'Made in the Electric Blast Furnace; impregnated in the Composite Autoclave.'],
        impregnated_gate_coil: ['Impregnated Gate Coil', 'A reacted coil with every gap filled with epoxy, so it cannot flex.', 'Made in the Composite Autoclave; cold-tested in the Naquadria Magnet Works (circuit 15).'],
        qualified_gate_coil: ['Qualified Gate Coil', 'A coil that held its field at liquid helium temperature.', 'Made in the Naquadria Magnet Works (circuit 15); two Warp Gate Casings are built round each.']
    }
    var RECIPES = {
        mgb2_cable: 'Circuit 13: eight MgB2 single wires cabled round two copper foils',
        gate_coil_winding: 'Circuit 14: four MgB2 cables wound and insulated with Kapton K foil',
        qualified_gate_coil: 'Circuit 15: the impregnated coil cold-tested in the helium charge'
    }

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        Object.keys(ITEMS).forEach(function (name) {
            add('item.grindless.' + name, ITEMS[name][0])
            add('tooltip.grindless.' + name + '.0', ITEMS[name][1])
            add('tooltip.grindless.' + name + '.1', ITEMS[name][2])
        })
        Object.keys(RECIPES).forEach(function (name) { add('gtceu.recipe.grindless_naquadria_magnets.' + name, RECIPES[name]) })
    })
})()
