// priority: 5650
// Gregtech Grindless - EMI information page of the generator multiblock of the power scripts (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Its recipes show in EMI under the controller itself.
// Tooltips live in power_generator_array_lang.js; every key is in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.generator_array.0', "The Generator Array runs up to 16 generators in one hall: steam turbine, combustion generator or gas turbine, chosen in the controller's machine mode tab. It uses the single blocks' own fuel recipes: the same EU per unit of fuel, no overclock, no bonus.")
    add('emi.grindless.info.generator_array.1', "Fuel goes in the input hatches and EU leaves through dynamo hatches, which set how many generators run. Steam mode gives back distilled water: give it a fluid output hatch or set the controller to void fluids.")
    add('emi.grindless.info.generator_array.2', 'Up to 16 generators in one hall: steam turbine, combustion generator or gas turbine (switch the machine mode in the controller). It runs the single blocks\' own fuel recipes side by side: the same EU per unit of fuel, no overclock, no bonus.')
    add('emi.grindless.info.generator_array.3', 'Generators running = the fewest of 16, the fuel in the input hatches, and what the dynamo hatches carry (every LV fuel is 32 EU/t per generator; a dynamo hatch carries 2 amps: an LV one 2 generators, an MV one 8, an HV one all 16). It pauses, losing nothing, while the dynamo hatches are full.')
    add('emi.grindless.info.generator_array.4', 'Steam mode gives back 4 mB of distilled water per 640 mB of steam: put a fluid output hatch in the floor for it, or set the controller to void fluids.')
    add('emi.grindless.info.generator_array.5', 'Needs, in the floor: 1 to 16 dynamo hatches (any tier), 1 or 2 fluid input hatches (the fuel) and 0 or 1 fluid output hatch. The front holds 16 steel gearboxes, the generator units.')
})

