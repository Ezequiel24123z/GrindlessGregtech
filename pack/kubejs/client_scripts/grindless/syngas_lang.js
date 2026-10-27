// Gregtech Grindless - names and tooltips of the HV Syngas and Shift Plant.
//
//   gtceu:syngas_plant            (machine name + tooltips)
//   gtceu:syngas                  (recipe type name)
//   grindless:shift_catalyst      (its catalyst)
//   #grindless:gasifier_feed      (the item tag of its feed, as EMI names it)
//
// Same approach as hv_refinery_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.syngas_plant', 'Syngas and Shift Plant')
    add('gtceu.syngas', 'Syngas and Shift')

    add('grindless.machine.syngas_plant.tooltip.0', 'Gasifier, shift reactors and CO2 absorber in one. Circuit 1: pulverized carbon (coal, coke, charcoal or carbon dust) or heavy fuel + steam -> carbon monoxide + hydrogen. Circuit 2: methanol syngas (CO + 4 H, the ratio of GTM\'s methanol reactor). Circuit 3: hydrogen + CO2. Circuit 4: spare carbon monoxide + steam -> hydrogen + CO2.')
    add('grindless.machine.syngas_plant.tooltip.1', 'GTM has no steam gasification and no water-gas shift: this is the machine that turns carbon monoxide into hydrogen. Steam counts as water (1,000 mB per mole) and every recipe balances carbon, hydrogen and oxygen. Energy is the sum of the stages, no discount: 28,800 EU per gasification, 19,200 per shift; all HV, no parallels.')
    add('grindless.machine.syngas_plant.tooltip.2', 'Modes 2 to 4 need a Shift Catalyst in the input bus (used up in about 0.05% of the runs). Ash goes to the output bus. Carbon monoxide is toxic: keep it in tanks or shift it. CO2 is inert: vent it, or feed greenhouses, ethylene from glycerol or methanol from CO2. Circuit 5 (Pluto shift: carbon monoxide and water to hydrogen) only runs in Pluto orbit.')
    add('grindless.machine.syngas_plant.tooltip.3', 'Needs, in the floor: 1 or 2 HV energy hatches, 1 input bus (feed and catalyst), 1 output bus (ash), 1 or 2 input hatches (steam, and CO or heavy fuel) and 2 or 3 output hatches (each holds one gas).')

    add('item.grindless.shift_catalyst', 'Shift Catalyst')
    add('tooltip.grindless.shift_catalyst', 'Iron-chromium oxide (magnetite and chromium). Goes in the input bus of the Syngas and Shift Plant; used up in about 0.05% of the runs that shift.')

    add('tag.item.grindless.gasifier_feed', 'Gasifier Feed')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.syngas_plant', 'Planta de gas de síntesis')
    add('gtceu.syngas', 'Gas de síntesis y desplazamiento')

    add('grindless.machine.syngas_plant.tooltip.0', 'Gasificador, reactores de desplazamiento y absorbedor de CO2 en uno. Circuito 1: carbono en polvo (carbón, coque, carbón vegetal o carbono) o combustible pesado + vapor -> monóxido de carbono + hidrógeno. Circuito 2: gas para metanol (CO + 4 H, la proporción del reactor de metanol de GTM). Circuito 3: hidrógeno + CO2. Circuito 4: monóxido de carbono sobrante + vapor -> hidrógeno + CO2.')
    add('grindless.machine.syngas_plant.tooltip.1', 'GTM no gasifica con vapor ni tiene la reacción de desplazamiento del gas de agua: esta es la máquina que convierte el monóxido de carbono en hidrógeno. El vapor cuenta como agua (1 000 mB por mol) y cada receta cuadra el carbono, el hidrógeno y el oxígeno. La energía es la suma de las etapas, sin descuento: 28 800 EU por gasificación y 19 200 por desplazamiento; todo HV, sin paralelos.')
    add('grindless.machine.syngas_plant.tooltip.2', 'Los modos 2 a 4 piden un catalizador de desplazamiento en el bus de entrada (se gasta en cerca del 0,05 % de los ciclos). La ceniza sale por el bus de salida. El monóxido de carbono es tóxico: se guarda en tanques o se desplaza. El CO2 es inerte: se puede tirar o llevar a los invernaderos, al etileno desde glicerol o al metanol desde CO2. El circuito 5 (desplazamiento de Plutón: monóxido de carbono y agua a hidrógeno) solo funciona en la órbita de Plutón.')
    add('grindless.machine.syngas_plant.tooltip.3', 'Necesita, en el suelo: 1 o 2 escotillas de energía HV, 1 bus de entrada (carga y catalizador), 1 bus de salida (ceniza), 1 o 2 escotillas de entrada (vapor, y CO o combustible pesado) y 2 o 3 escotillas de salida (cada una guarda un gas).')

    add('item.grindless.shift_catalyst', 'Catalizador de desplazamiento')
    add('tooltip.grindless.shift_catalyst', 'Óxido de hierro y cromo (magnetita y cromo). Va en el bus de entrada de la planta de gas de síntesis; se gasta en cerca del 0,05 % de los ciclos que desplazan.')

    add('tag.item.grindless.gasifier_feed', 'Carga del gasificador')
})
