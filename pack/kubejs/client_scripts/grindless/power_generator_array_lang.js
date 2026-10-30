// priority: 5900
// Gregtech Grindless - names and tooltips of the LV Generator Array, plus the controller lines that every generator multiblock built
// with startup_scripts/grindless/lib/generators.js shows (grindless.generators.*).
//
//   gtceu:generator_array   (machine name + tooltips)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.generator_array', 'Generator Array')

    add('grindless.machine.generator_array.tooltip.0', '§7Up to 16 steam turbines, combustion or gas generators in one hall.')

    add('grindless.generators.capacity', 'Dynamo hatches carry up to %s EU/t')
    add('grindless.generators.output', 'Producing %s EU/t: %s runs in parallel (up to %s)')
    add('grindless.generators.dynamo_too_small', 'The dynamo hatches cannot carry even one run of this fuel')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.generator_array', 'Matriz de generadores')

    add('grindless.machine.generator_array.tooltip.0', '§7Hasta 16 turbinas de vapor, generadores de combustión o de gas en una nave.')

    add('grindless.generators.capacity', 'Las escotillas dinamo llevan hasta %s EU/t')
    add('grindless.generators.output', 'Produciendo %s EU/t: %s ciclos en paralelo (hasta %s)')
    add('grindless.generators.dynamo_too_small', 'Las escotillas dinamo no pueden llevar ni un ciclo de este combustible')
})
