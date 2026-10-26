// LuV B8, Europa: the cryobot, the algae bioreactor, the bioreactor type and magnesium sulfate (startup_scripts/grindless/luv/europa.js).
ClientEvents.lang('en_us', function (event) {
  var entries = {
    'block.gtceu.cryobot': 'Cryobot',
    'block.gtceu.algae_bioreactor': 'Algae Bioreactor',
    'gtceu.bioreactor': 'Bioreactor',
    'material.gtceu.magnesium_sulfate': 'Magnesium Sulfate',
    'grindless.machine.cryobot.tooltip.0': 'Vein drill family, step 7b. Europa only. Circuit 1: a cryobot probe melts down to the ocean and brings back the Europan ocean sample and 1,000 mB of brine. Circuit 2: 8,000 mB of Europan brine and 2,000 mB of meltwater a run.',
    'grindless.machine.cryobot.tooltip.1': 'The melt head wears 0.25% a brine run and its RTG pellet is used up about once an hour. Runs only its own recipes. Keeps the sample and the brine: no voiding.',
    'grindless.machine.cryobot.tooltip.2': '5x5 base of sulfur concrete around a radiation-vault core, a 3x3x10 tungsten steel derrick under a vault head with a tungstensteel gearbox drum, and a 1x5 shaft of packed or blue ice under the middle of the base. Base: 1-2 energy hatches, input and output buses, 1-2 output hatches.',
    'grindless.machine.cryobot.no_voiding': 'The cryobot keeps the ocean sample and the brine. Disable item and fluid voiding.',
    'grindless.machine.algae_bioreactor.tooltip.0': 'Greenhouse family, step 5. Circuit 1, anywhere: algae under LED lamps turn water and CO2 into biomass and oxygen. Circuit 2, Europa only: brine, hydrogen peroxide, hydrogen and the belt\'s chondritic extract feed the Europan culture, seeded by the ocean sample (kept): the only bacteria.',
    'grindless.machine.algae_bioreactor.tooltip.1': 'Three 1x1x10 laminated glass tubes with GT lamps between them, on a 5x5x3 sealed sulfur concrete base with a radiation vault roof. Base: 1-2 energy hatches, input buses, 1-3 input hatches and 1-2 output hatches.',
    'grindless.machine.algae_bioreactor.tooltip.2': 'The bacteria go home to the biofoundry. Keeps everything it makes: no voiding.',
    'grindless.machine.algae_bioreactor.no_voiding': 'The bioreactor keeps the pack\'s only living matter. Disable item and fluid voiding.'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})

ClientEvents.lang('es_es', function (event) {
  var entries = {
    'block.gtceu.cryobot': 'Criobot',
    'block.gtceu.algae_bioreactor': 'Biorreactor de algas',
    'gtceu.bioreactor': 'Biorreactor',
    'material.gtceu.magnesium_sulfate': 'Sulfato de magnesio',
    'grindless.machine.cryobot.tooltip.0': 'Familia de taladros de vetas, paso 7b. Solo en Europa. Circuito 1: una sonda criobot se funde hasta el océano y trae la muestra del océano de Europa y 1000 mB de salmuera. Circuito 2: 8000 mB de salmuera europana y 2000 mB de agua de fusión por ciclo.',
    'grindless.machine.cryobot.tooltip.1': 'La cabeza de fusión se gasta un 0,25% por ciclo de salmuera y su pastilla de RTG se consume más o menos una vez por hora. Solo hace sus propias recetas. Conserva la muestra y la salmuera: sin descarte.',
    'grindless.machine.cryobot.tooltip.2': 'Base de 5x5 de hormigón de azufre alrededor de un núcleo de bóveda antirradiación, una torre de 3x3x10 de acero de tungsteno bajo una cabeza de bóveda con un tambor de caja de engranajes de acero de tungsteno, y un pozo de 1x5 de hielo compacto o azul bajo el centro de la base. Base: 1-2 escotillas de energía, buses de entrada y salida, 1-2 escotillas de salida.',
    'grindless.machine.cryobot.no_voiding': 'El criobot conserva la muestra del océano y la salmuera. Desactiva el descarte de objetos y fluidos.',
    'grindless.machine.algae_bioreactor.tooltip.0': 'Familia de invernaderos, paso 5. Circuito 1, en cualquier sitio: algas bajo lámparas LED convierten agua y CO2 en biomasa y oxígeno. Circuito 2, solo en Europa: salmuera, peróxido de hidrógeno, hidrógeno y el extracto condrítico del cinturón alimentan el cultivo europano, sembrado con la muestra del océano (se conserva): las únicas bacterias.',
    'grindless.machine.algae_bioreactor.tooltip.1': 'Tres tubos de 1x1x10 de vidrio laminado con lámparas GT entre ellos, sobre una base sellada de 5x5x3 de hormigón de azufre con techo de bóveda antirradiación. Base: 1-2 escotillas de energía, buses de entrada, 1-3 escotillas de entrada y 1-2 de salida.',
    'grindless.machine.algae_bioreactor.tooltip.2': 'Las bacterias van a casa, a la biofactoría. Conserva todo lo que produce: sin descarte.',
    'grindless.machine.algae_bioreactor.no_voiding': 'El biorreactor conserva la única materia viva del pack. Desactiva el descarte de objetos y fluidos.'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})
