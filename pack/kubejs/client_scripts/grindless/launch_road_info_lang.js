// priority: 8350
// Gregtech Grindless - EMI information pages of the launch road multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in launch_road_lang.js; every key is in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.composite_autoclave.0', "The Composite Autoclave cures fibre plies and epoxy under heat and nitrogen pressure. Glass fibre foils and epoxy make ablative heat shield tiles. A stainless steel drum wrapped in para-aramid and epoxy makes a composite overwrapped tank.")
    add('emi.grindless.info.composite_autoclave.1', "It needs epoxy and nitrogen in its two input hatches; the nitrogen is vented after every cure. HV: 1 or 2 HV energy hatches. The tiles go into rocket motors, two tanks make a basic fuel tank.")
    add('emi.grindless.info.composite_autoclave.2', 'A horizontal pressure vessel: fibre plies and epoxy cure under heat and nitrogen pressure. No small machine holds a part this size at that pressure.')
    add('emi.grindless.info.composite_autoclave.3', 'Glass fibre foils + epoxy: ablative heat shield tiles, the base heat shield of a rocket motor. A stainless steel drum wrapped in para-aramid + epoxy: a composite overwrapped tank, two per basic fuel tank.')
    add('emi.grindless.info.composite_autoclave.4', 'The nitrogen pressurises the vessel and is vented after every cure (it is inert). HV: 1 or 2 HV energy hatches.')
    add('emi.grindless.info.composite_autoclave.5', 'Needs 1 or 2 energy hatches, 1 input bus, 1 output bus and 2 input hatches (epoxy and nitrogen) on the shell. The chamber inside stays empty.')

    add('emi.grindless.info.engine_test_stand.0', "The Engine Test Stand is a static fire stand, and no other machine qualifies a rocket engine. MV: four power thrusters fire together on RP-1 and oxygen and come out qualified. HV: an untested rocket motor fires on rocket fuel and becomes a basic rocket motor.")
    add('emi.grindless.info.engine_test_stand.1', "The exhaust is CO2 and water, one output hatch each. The HV fire needs an HV energy hatch or two MV ones. Fuel and oxidizer go in the run tank hatches.")
    add('emi.grindless.info.engine_test_stand.2', 'A static fire stand: the engine is clamped over a firebrick flame bucket, fed from the run tanks on top and fired. What passes, flies. No other machine qualifies a rocket engine.')
    add('emi.grindless.info.engine_test_stand.3', 'MV: the four power thrusters of one rocket motor fire together on RP-1 and oxygen and come out qualified. HV: an untested rocket motor fires on rocket fuel and becomes a basic rocket motor.')
    add('emi.grindless.info.engine_test_stand.4', 'The exhaust is CO2 and water, one output hatch each: the CO2 can go to a greenhouse or to methanol, the water back to the pumps. The HV fire needs an HV energy hatch or two MV ones.')
    add('emi.grindless.info.engine_test_stand.5', 'Needs 1 or 2 energy hatches, 1 input bus, 1 output bus and 2 output hatches in the base, and 1 or 2 input hatches (fuel and oxidizer) in the run tanks. The trench under the engine stays open on both sides.')
})

