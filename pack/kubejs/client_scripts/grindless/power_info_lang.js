// priority: 5850
// Gregtech Grindless - EMI information page of the generator multiblock of the power scripts (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Its recipes show in EMI under the controller itself.
// Tooltips live in power_generator_array_lang.js; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.generator_array.0', "The Generator Array runs up to 16 generators in one hall: steam turbine, combustion generator or gas turbine, chosen in the controller's machine mode tab. It uses the single blocks' own fuel recipes: the same EU per unit of fuel, no overclock, no bonus.")
    add('emi.grindless.info.generator_array.1', "Fuel goes in the input hatches and EU leaves through dynamo hatches, which set how many generators run. Steam mode gives back distilled water: give it a fluid output hatch or set the controller to void fluids.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.generator_array.0', "La matriz de generadores ejecuta hasta 16 generadores en un salón: turbina de vapor, generador de combustión o turbina de gas, a elegir en la pestaña de modo del controlador. Usa las recetas de combustible de los bloques simples: el mismo EU por unidad de combustible, sin overclock ni bonificación.")
    add('emi.grindless.info.generator_array.1', "El combustible entra por las escotillas de entrada y el EU sale por escotillas dinamo, que fijan cuántos generadores corren. El modo vapor devuelve agua destilada: dale una escotilla de salida de fluido o pon el controlador en eliminar fluidos.")
})
