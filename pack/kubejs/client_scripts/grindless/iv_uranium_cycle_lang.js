// Gregtech Grindless - names and tooltips of IV's uranium cycle (startup_scripts/grindless/iv/uranium_cycle.js): the In-Situ Leach Field
// and the Fuel Fabrication Plant, their recipe types, why the field refuses voiding and why it does not start outside the End.
//
//   gtceu:isr_wellfield / gtceu:in_situ_leaching                   (machine name + tooltips, recipe type name)
//   gtceu:fuel_fabrication_plant / gtceu:fuel_fabrication          (machine name + tooltips, recipe type name)
//   grindless.machine.isr_wellfield.no_voiding / .not_end          (why a run does not start)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.isr_wellfield', 'In-Situ Leach Field')
    add('gtceu.in_situ_leaching', 'In-Situ Leaching')
    add('block.gtceu.fuel_fabrication_plant', 'Fuel Fabrication Plant')
    add('gtceu.fuel_fabrication', 'Fuel Fabrication')

    add('grindless.machine.isr_wellfield.tooltip.0', 'Uranium with no drill bit: sulfuric acid and oxygen go down four injection wells, dissolve the uranium of the End\'s pitchblende vein in place, and the production well brings it up to the header house, where ion exchange catches it. Works only in the End.')
    add('grindless.machine.isr_wellfield.tooltip.1', 'Each batch: the vein sample (never used up) + 100 mB of sulfuric acid + 50 mB of oxygen, and the ion-exchange resin wears 1% -> 2 uraninite dust. Thorium and lead stay in the ground.')
    add('grindless.machine.isr_wellfield.tooltip.2', 'The radium the solution carries comes out as radioactive waste (1% of the batches): it is contained, so the field refuses item voiding.')
    add('grindless.machine.isr_wellfield.tooltip.3', 'A 7x7 five-spot: wells of tungstensteel pipe casing three blocks into the ground, under PTFE pipe wellheads with a tungsten steel frame on top, and a header house of inert casing with two ion-exchange columns. House walls: 1-2 input buses, 1-2 output buses, 1-3 fluid input hatches and 1-2 energy hatches. ME parts fit.')

    add('grindless.machine.fuel_fabrication_plant.tooltip.0', 'Real fuel: uranium dioxide pellets in Zircaloy tubes, backfilled with helium. The programmed circuit picks the step: 1 pellets, 2 cladding tubes, 3 the LEU fuel assembly.')
    add('grindless.machine.fuel_fabrication_plant.tooltip.1', '1: 1 U-235 + 9 U-238 dust + 20,000 mB of oxygen -> 10 LEU pellets, pressed and sintered in hydrogen. Keep 500 mB of hydrogen in a hatch: it goes round inside the furnace and is never used up.')
    add('grindless.machine.fuel_fabrication_plant.tooltip.2', '2: 1 Zircaloy ingot -> 2 cladding tubes on the pilger mill. 3: 10 pellets + 4 tubes + 100 mB of helium -> 1 LEU fuel assembly, the fission reactor\'s fuel.')
    add('grindless.machine.fuel_fabrication_plant.tooltip.3', 'A 3x4x13 line of clean stainless steel casing: pellet press, sintering tunnel with two rings of Kanthal or hotter coils, pilger stand on a tungsten steel frame bed and a laminated glass glovebox. Floor of the press bay and the glovebox: 1-3 input buses, 1-2 output buses, 1-4 fluid input hatches and 1-2 energy hatches. ME parts fit.')

    add('grindless.machine.isr_wellfield.no_voiding', 'The field keeps its radioactive waste: it leaves through the output bus. Turn item voiding off')
    add('grindless.machine.isr_wellfield.not_end', 'Nothing to leach here: the field only works in the End, on its pitchblende vein')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.isr_wellfield', 'Campo de lixiviación in situ')
    add('gtceu.in_situ_leaching', 'Lixiviación in situ')
    add('block.gtceu.fuel_fabrication_plant', 'Planta de fabricación de combustible')
    add('gtceu.fuel_fabrication', 'Fabricación de combustible')

    add('grindless.machine.isr_wellfield.tooltip.0', 'Uranio sin broca: el ácido sulfúrico y el oxígeno bajan por cuatro pozos de inyección, disuelven el uranio de la veta de pechblenda del End en su sitio, y el pozo de producción lo sube a la caseta de cabecera, donde el intercambio iónico lo atrapa. Solo funciona en el End.')
    add('grindless.machine.isr_wellfield.tooltip.1', 'Cada tanda: la muestra de la veta (no se gasta) + 100 mB de ácido sulfúrico + 50 mB de oxígeno, y la resina de intercambio iónico se desgasta un 1 % -> 2 de polvo de uraninita. El torio y el plomo se quedan en el suelo.')
    add('grindless.machine.isr_wellfield.tooltip.2', 'El radio que arrastra la solución sale como residuo radiactivo (un 1 % de las tandas): se guarda, así que el campo no acepta tirar objetos.')
    add('grindless.machine.isr_wellfield.tooltip.3', 'Un cinco puntos de 7x7: pozos de carcasa de tubería de acero de tungsteno que bajan tres bloques bajo tierra, con cabezales de tubería de PTFE y un armazón de acero de tungsteno encima, y una caseta de cabecera de carcasa inerte con dos columnas de intercambio iónico. Paredes de la caseta: 1-2 buses de entrada, 1-2 buses de salida, 1-3 escotillas de entrada de fluidos y 1-2 escotillas de energía. Valen las piezas ME.')

    add('grindless.machine.fuel_fabrication_plant.tooltip.0', 'Combustible de verdad: pastillas de dióxido de uranio en tubos de zircaloy, rellenos de helio. El circuito programado elige el paso: 1 pastillas, 2 tubos de vaina, 3 el elemento combustible de LEU.')
    add('grindless.machine.fuel_fabrication_plant.tooltip.1', '1: 1 de U-235 + 9 de polvo de U-238 + 20 000 mB de oxígeno -> 10 pastillas de LEU, prensadas y sinterizadas en hidrógeno. Deja 500 mB de hidrógeno en una escotilla: da vueltas dentro del horno y no se gasta.')
    add('grindless.machine.fuel_fabrication_plant.tooltip.2', '2: 1 lingote de zircaloy -> 2 tubos de vaina en el laminador de paso peregrino. 3: 10 pastillas + 4 tubos + 100 mB de helio -> 1 elemento combustible de LEU, el combustible del reactor de fisión.')
    add('grindless.machine.fuel_fabrication_plant.tooltip.3', 'Una línea de 3x4x13 de carcasa limpia de acero inoxidable: prensa de pastillas, túnel de sinterizado con dos anillos de bobinas de kanthal o más calientes, banco del laminador sobre una bancada de armazones de acero de tungsteno y una caja de guantes de vidrio laminado. Suelo de la prensa y de la caja de guantes: 1-3 buses de entrada, 1-2 buses de salida, 1-4 escotillas de entrada de fluidos y 1-2 escotillas de energía. Valen las piezas ME.')

    add('grindless.machine.isr_wellfield.no_voiding', 'El campo guarda su residuo radiactivo: sale por el bus de salida. Desactiva el vaciado de objetos')
    add('grindless.machine.isr_wellfield.not_end', 'Aquí no hay nada que lixiviar: el campo solo funciona en el End, sobre su veta de pechblenda')
})
