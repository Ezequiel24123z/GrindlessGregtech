// priority: 9500
// Gregtech Grindless - names and tooltips of IV's Fission Reactor (startup_scripts/grindless/iv/fission_reactor.js), its recipe type, the
// EMI line of each designed core, the reason it shows when set to void, and its SCRAM line.
//
//   gtceu:fission_reactor / gtceu:fission_core             (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_core.<core>                     (EMI line of each core: the assembly's life in channel-cycles and minutes, G EU)
//   grindless.machine.fission_reactor.no_voiding / .scram  (why a cycle does not start; shut down with fuel loaded)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.fission_reactor', 'Fission Reactor')
    add('gtceu.fission_core', 'Fission Core')

    add('grindless.machine.fission_reactor.tooltip.0', '§7Boils water with designed fission cores for a turbine hall.')

    add('gtceu.recipe.grindless_core.leu_light_water', 'LEU in light water: an assembly lasts %s channel-cycles (about %s min in one channel) and gives %s G EU')
    add('gtceu.recipe.grindless_core.leu_heavy_water', 'LEU in heavy water: an assembly lasts %s channel-cycles (about %s min in one channel) and gives %s G EU; the heavy water comes out tritiated')
    add('gtceu.recipe.grindless_core.mox_heavy_water', 'MOX in heavy water: an assembly lasts %s channel-cycles (about %s min in one channel) and gives %s G EU; the heavy water comes out tritiated')
    add('gtceu.recipe.grindless_core.breeder', 'Breeder: an assembly lasts %s channel-cycles (about %s min in one channel) and gives %s G EU; the spent assembly holds more plutonium than went in')

    add('grindless.machine.fission_reactor.no_voiding', 'The reactor keeps all it makes: spent fuel and tritiated heavy water leave through their bus and hatch. Turn voiding off')
    add('grindless.machine.fission_reactor.scram', 'SCRAM: shut down with fuel loaded. It restarts by itself once it has water (and heavy water for circuits 2 and 3), room for the spent fuel and the tritiated heavy water, and the circuit of a core')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.fission_reactor', 'Reactor de fisión')
    add('gtceu.fission_core', 'Núcleo de fisión')

    add('grindless.machine.fission_reactor.tooltip.0', '§7Hierve agua con núcleos de fisión diseñados para turbinas.')

    add('gtceu.recipe.grindless_core.leu_light_water', 'LEU con agua ligera: un elemento dura %s ciclos de canal (unos %s min en un canal) y da %s G EU')
    add('gtceu.recipe.grindless_core.leu_heavy_water', 'LEU con agua pesada: un elemento dura %s ciclos de canal (unos %s min en un canal) y da %s G EU; el agua pesada sale tritiada')
    add('gtceu.recipe.grindless_core.mox_heavy_water', 'MOX con agua pesada: un elemento dura %s ciclos de canal (unos %s min en un canal) y da %s G EU; el agua pesada sale tritiada')
    add('gtceu.recipe.grindless_core.breeder', 'Reproductor: un elemento dura %s ciclos de canal (unos %s min en un canal) y da %s G EU; el elemento gastado lleva más plutonio del que entró')

    add('grindless.machine.fission_reactor.no_voiding', 'El reactor guarda todo lo que hace: el combustible gastado y el agua pesada tritiada salen por su bus y su escotilla. Desactiva el vaciado')
    add('grindless.machine.fission_reactor.scram', 'SCRAM: parado con combustible cargado. Arranca solo cuando tiene agua (y agua pesada para los circuitos 2 y 3), sitio para el combustible gastado y el agua pesada tritiada, y el circuito de un núcleo')
})
