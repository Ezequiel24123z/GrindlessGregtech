// Gregtech Grindless - names and tooltips of IV's Fluorspar Kiln (startup_scripts/grindless/iv/fluorspar_kiln.js), its recipe type, the EMI
// line of its recipe and the reason it shows when set to void fluids.
//
//   gtceu:fluorspar_kiln / gtceu.fluorspar_digestion           (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_fluorspar_kiln.<recipe name>        (EMI line of the recipe: one charge)
//   grindless.machine.fluorspar_kiln.no_voiding                (why a run does not start)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.fluorspar_kiln', 'Fluorspar Kiln')
    add('gtceu.fluorspar_digestion', 'Fluorspar Digestion')

    add('grindless.machine.fluorspar_kiln.tooltip.0', 'A long rotary kiln on roller stands, turned by a gearbox, with an HF scrubber at its hot end. Fluorspar, sulfuric acid and water go in at the cold end: hydrofluoric acid leaves the scrubber, and the calcium sulfate is quenched with the water and drops out as gypsum. The unreacted fluorite goes back to the feed.')
    add('grindless.machine.fluorspar_kiln.tooltip.1', 'It runs many charges at once, each at the recipe\'s own power and time, with no overclock: as many as the inputs, the room and the energy hatches allow, up to 256. One IV energy hatch runs all 256.')
    add('grindless.machine.fluorspar_kiln.tooltip.2', 'The HF feeds the naquadah plant, the hot cell\'s enrichment and PTFE; the gypsum goes to concrete. The scrubber keeps every drop of HF: the kiln refuses to void fluids. Surplus gypsum is inert and can be voided.')
    add('grindless.machine.fluorspar_kiln.tooltip.3', 'Feed head, round the controller: 1-2 energy hatches, 1-2 input buses and 1-4 input hatches (acid and water). Scrubber, the two lower rows of its back wall and the row under the kiln: 1-2 output buses and 1-2 output hatches. ME parts fit.')

    add('gtceu.recipe.grindless_fluorspar_kiln.hydrofluoric_acid_from_fluorite', 'One charge: the kiln runs up to 256 at once, 64 ticks each, with no overclock')

    add('grindless.machine.fluorspar_kiln.no_voiding', 'The scrubber keeps all the hydrofluoric acid: it leaves through the output hatches. Turn fluid voiding off')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.fluorspar_kiln', 'Horno de fluorita')
    add('gtceu.fluorspar_digestion', 'Digestión de fluorita')

    add('grindless.machine.fluorspar_kiln.tooltip.0', 'Un horno rotatorio largo sobre estaciones de rodillos, movido por una caja de engranajes, con un lavador de HF en su extremo caliente. La fluorita, el ácido sulfúrico y el agua entran por el extremo frío: el ácido fluorhídrico sale del lavador, y el sulfato de calcio se apaga con el agua y cae como yeso. La fluorita que no reacciona vuelve a la alimentación.')
    add('grindless.machine.fluorspar_kiln.tooltip.1', 'Hace muchas cargas a la vez, cada una con la potencia y el tiempo de la receta, sin overclock: tantas como permiten las entradas, el sitio libre y las escotillas de energía, hasta 256. Una escotilla de energía IV mueve las 256.')
    add('grindless.machine.fluorspar_kiln.tooltip.2', 'El HF alimenta la planta de naquadah, el enriquecimiento de la celda caliente y el PTFE; el yeso va al hormigón. El lavador guarda hasta la última gota de HF: el horno no acepta tirar fluidos. El yeso que sobra es inerte y se puede tirar.')
    add('grindless.machine.fluorspar_kiln.tooltip.3', 'Cabezal de alimentación, alrededor del controlador: 1-2 escotillas de energía, 1-2 buses de entrada y 1-4 escotillas de entrada (ácido y agua). Lavador, las dos filas bajas de su muro trasero y la fila bajo el horno: 1-2 buses de salida y 1-2 escotillas de salida. Valen las piezas ME.')

    add('gtceu.recipe.grindless_fluorspar_kiln.hydrofluoric_acid_from_fluorite', 'Una carga: el horno hace hasta 256 a la vez, 64 ticks cada una, sin overclock')

    add('grindless.machine.fluorspar_kiln.no_voiding', 'El lavador guarda todo el ácido fluorhídrico: sale por las escotillas de salida. Desactiva el vaciado de fluidos')
})
