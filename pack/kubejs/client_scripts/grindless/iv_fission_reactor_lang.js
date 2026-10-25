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

    add('grindless.machine.fission_reactor.tooltip.0', 'A designed-core fission reactor: fuel assemblies in four tungstensteel channels boil water for a turbine hall. Nothing burns, so it works anywhere. The programmed circuit picks the core: 1 LEU in light water, 2 LEU in heavy water, 3 MOX in heavy water, 4 breeder.')
    add('grindless.machine.fission_reactor.tooltip.1', 'Per channel and 20 s cycle: 2,000 mB of water, lost through the vents. LEU in light water makes 16,384 EU/t; in heavy water 32,768, and 5 mB of heavy water comes out tritiated; MOX in heavy water the same; the breeder 8,192, and its spent assembly holds more plutonium than went in.')
    add('grindless.machine.fission_reactor.tooltip.2', 'An assembly wears 0.5% a cycle: one is used up, and one spent assembly comes out, every 200 channel-cycles (about 67 min in one channel). Channels = the fewest of 4, the assemblies in the buses, the water and heavy water, the room for the outputs and the dynamo hatches (a heavy-water channel needs 32,768 EU/t: a 4 A IV hatch; a 16 A IV hatch carries all four).')
    add('grindless.machine.fission_reactor.tooltip.3', 'SCRAM, not explosion: with no water, or no room for the spent fuel or the tritiated heavy water, it finishes its cycle and shuts down, losing nothing; it refuses voiding. Turbine hall floor: 1-2 input buses, 1-2 output buses, 1-3 fluid input hatches, up to 1 fluid output hatch and 1-4 dynamo hatches. ME parts fit.')

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

    add('grindless.machine.fission_reactor.tooltip.0', 'Un reactor de fisión de núcleo diseñado: los elementos combustibles de cuatro canales de acero de tungsteno hierven agua para una sala de turbinas. No quema nada, así que funciona en cualquier sitio. El circuito programado elige el núcleo: 1 LEU con agua ligera, 2 LEU con agua pesada, 3 MOX con agua pesada, 4 reproductor.')
    add('grindless.machine.fission_reactor.tooltip.1', 'Por canal y ciclo de 20 s: 2000 mB de agua, que se pierden por los respiraderos. El LEU con agua ligera da 16 384 EU/t; con agua pesada, 32 768, y 5 mB de agua pesada salen tritiados; el MOX con agua pesada, lo mismo; el reproductor, 8192, y su elemento gastado lleva más plutonio del que entró.')
    add('grindless.machine.fission_reactor.tooltip.2', 'Un elemento se desgasta un 0,5 % por ciclo: se gasta uno, y sale un elemento gastado, cada 200 ciclos de canal (unos 67 min en un canal). Canales = el menor de 4, los elementos de los buses, el agua y el agua pesada, el sitio para lo que sale y las escotillas dinamo (un canal de agua pesada pide 32 768 EU/t: una escotilla IV de 4 A; una de 16 A lleva los cuatro).')
    add('grindless.machine.fission_reactor.tooltip.3', 'SCRAM, no explosión: sin agua, o sin sitio para el combustible gastado o el agua pesada tritiada, acaba su ciclo y se para sin perder nada; no acepta tirar nada. Suelo de la sala de turbinas: 1-2 buses de entrada, 1-2 buses de salida, 1-3 escotillas de entrada de fluidos, hasta 1 escotilla de salida de fluidos y 1-4 escotillas dinamo. Valen las piezas ME.')

    add('gtceu.recipe.grindless_core.leu_light_water', 'LEU con agua ligera: un elemento dura %s ciclos de canal (unos %s min en un canal) y da %s G EU')
    add('gtceu.recipe.grindless_core.leu_heavy_water', 'LEU con agua pesada: un elemento dura %s ciclos de canal (unos %s min en un canal) y da %s G EU; el agua pesada sale tritiada')
    add('gtceu.recipe.grindless_core.mox_heavy_water', 'MOX con agua pesada: un elemento dura %s ciclos de canal (unos %s min en un canal) y da %s G EU; el agua pesada sale tritiada')
    add('gtceu.recipe.grindless_core.breeder', 'Reproductor: un elemento dura %s ciclos de canal (unos %s min en un canal) y da %s G EU; el elemento gastado lleva más plutonio del que entró')

    add('grindless.machine.fission_reactor.no_voiding', 'El reactor guarda todo lo que hace: el combustible gastado y el agua pesada tritiada salen por su bus y su escotilla. Desactiva el vaciado')
    add('grindless.machine.fission_reactor.scram', 'SCRAM: parado con combustible cargado. Arranca solo cuando tiene agua (y agua pesada para los circuitos 2 y 3), sitio para el combustible gastado y el agua pesada tritiada, y el circuito de un núcleo')
})
