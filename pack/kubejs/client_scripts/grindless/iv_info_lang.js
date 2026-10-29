// Gregtech Grindless - EMI information pages of the IV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in the iv_*_lang.js files; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.fission_reactor.0', "The Fission Reactor turns nuclear fuel into EU and heat. Circuit 1: low-enriched uranium with light water. Circuit 2: the same fuel with heavy water. Circuit 3: MOX with heavy water. Circuit 4: breeder, which makes plutonium.")
    add('emi.grindless.info.fission_reactor.1', "If its output has nowhere to go the reactor does a SCRAM: it stops safely instead of voiding. Spent fuel goes to the Hot Cell for reprocessing.")

    add('emi.grindless.info.fluorspar_kiln.0', "The Fluorspar Kiln heats fluorspar with sulfuric acid and water into hydrofluoric acid and gypsum. It is where the hydrofluoric acid of the nuclear line comes from.")
    add('emi.grindless.info.fluorspar_kiln.1', "Gypsum is a harmless byproduct: it can be voided or used for building.")

    add('emi.grindless.info.fuel_fabrication_plant.0', "The Fuel Fabrication Plant builds fuel assemblies. Circuit 1: fuel pellets. Circuit 2: cladding tubes. Circuit 3: the low-enriched uranium fuel assembly the Fission Reactor burns.")
    add('emi.grindless.info.fuel_fabrication_plant.1', "It is the step between enriched uranium and the reactor.")

    add('emi.grindless.info.heavy_water_plant.0', "The Heavy Water Plant concentrates deuterium out of water. Circuit 1: isotope exchange. Circuit 2: finishing into heavy water. Circuit 3: Proxima mode, from UHV.")
    add('emi.grindless.info.heavy_water_plant.1', "It needs a hydrogen sulfide charge to run the exchange. Heavy water feeds the Fission Reactor and the tritium line.")

    add('emi.grindless.info.hot_cell.0', "The Hot Cell handles radioactive material behind shielding. Circuit 1: enrichment. 2: fuel. 3: reprocessing of spent fuel. 4: radon. 5: silicon-28. 6: boron-11. 7: nickel-62.")
    add('emi.grindless.info.hot_cell.1', "It refuses to void: if an output is blocked it stops. Reprocessing is how spent fuel gives something back.")

    add('emi.grindless.info.interferometer.0', "The Interferometer is a telescope array on Mercury that works only at night. It writes the Outer System Chart onto data sticks and orbs.")
    add('emi.grindless.info.interferometer.1', "It is the only source of that chart. At dawn it waits and keeps its progress.")

    add('emi.grindless.info.isr_wellfield.0', "The ISR Wellfield leaches uranium in place on the End: sulfuric acid and oxygen go down the wells and uraninite comes up.")
    add('emi.grindless.info.isr_wellfield.1', "It works only on the End. The uraninite feeds the uranium line toward enrichment.")

    add('emi.grindless.info.mercury_solar_field.0', "The Mercury Solar Field turns Mercury's sunlight into EU. Put programmed circuit 1 in the input bus.")
    add('emi.grindless.info.mercury_solar_field.1', "It works only on Mercury and only by day; at night it waits and loses nothing. Its EU leaves through dynamo hatches.")

    add('emi.grindless.info.mercury_solar_works.0', "The Mercury Solar Works is the factory of the planet. It sinters heat-shield bricks, makes thin-film solar panels and fuses iridosmine.")
    add('emi.grindless.info.mercury_solar_works.1', "It works only on Mercury. The bricks line Mercury structures; the iridosmine goes to the Platinum Plant.")

    add('emi.grindless.info.mercury_vein_drill.0', "The Mercury Vein Drill drills the veins of Mercury, only there, and never an Earth vein. Put the sample and tungsten steel drill bits in the input bus.")
    add('emi.grindless.info.mercury_vein_drill.1', "Liquid nitrogen in the input hatch gives more ore and less bit wear by day.")

    add('emi.grindless.info.naquadah_plant.0', "The Naquadah Plant refines naquadah. Circuit 1 runs the naquadah line; circuits 2 and 3 are LuV modes.")
    add('emi.grindless.info.naquadah_plant.1', "It needs a plutonium-beryllium neutron source. Its products feed the dense materials of the next eras.")

    add('emi.grindless.info.pressurized_vein_drill.0', "The Pressurized Vein Drill drills the naquadah vein of Venus and the veins of Mars, each only in its own world.")
    add('emi.grindless.info.pressurized_vein_drill.1', "It is the drill for places where the EV tripod drill cannot stand the pressure.")

    add('emi.grindless.info.smelting_complex.0', "The Smelting Complex is a blast furnace and a vacuum freezer in one. It runs blast furnace recipes and the freezer step in a single pass.")
    add('emi.grindless.info.smelting_complex.1', "Its coils set how many copies run at once, so it is the high-throughput way to make alloy ingots.")

    add('emi.grindless.info.tritium_removal_facility.0', "The Tritium Removal Facility de-tritiates heavy water. It works only on the Moon and needs a deuterium charge in the input hatch.")
    add('emi.grindless.info.tritium_removal_facility.1', "It is the source of tritium for the fusion fuel of later eras.")

    add('emi.grindless.info.venus_acid_works.0', "The Venus Acid Works cracks sulfuric acid into water and oxygen. It works only on Venus, where acid is everywhere.")
    add('emi.grindless.info.venus_acid_works.1', "The water and oxygen are what Venus lacks for its own industry.")

    add('emi.grindless.info.venus_heat_engine.0', "The Venus Heat Engine uses the heat of Venus: it burns nothing and gives 8,192 EU/t plus steam. It works only on Venus.")
    add('emi.grindless.info.venus_heat_engine.1', "Its EU leaves through dynamo hatches. The steam needs somewhere to go or it stops.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.fission_reactor.0', "El reactor de fisión convierte combustible nuclear en EU y calor. Circuito 1: uranio poco enriquecido con agua ligera. Circuito 2: el mismo combustible con agua pesada. Circuito 3: MOX con agua pesada. Circuito 4: criador, que fabrica plutonio.")
    add('emi.grindless.info.fission_reactor.1', "Si su salida no tiene adónde ir, el reactor hace SCRAM: se detiene con seguridad en vez de eliminar. El combustible gastado va a la celda caliente para reprocesarse.")

    add('emi.grindless.info.fluorspar_kiln.0', "El horno de fluorita calienta fluorita con ácido sulfúrico y agua y da ácido fluorhídrico y yeso. De aquí sale el ácido fluorhídrico de la línea nuclear.")
    add('emi.grindless.info.fluorspar_kiln.1', "El yeso es un subproducto inofensivo: se puede eliminar o usar para construir.")

    add('emi.grindless.info.fuel_fabrication_plant.0', "La planta de fabricación de combustible construye ensamblajes de combustible. Circuito 1: pastillas de combustible. Circuito 2: tubos de revestimiento. Circuito 3: el ensamblaje de uranio poco enriquecido que quema el reactor de fisión.")
    add('emi.grindless.info.fuel_fabrication_plant.1', "Es el paso entre el uranio enriquecido y el reactor.")

    add('emi.grindless.info.heavy_water_plant.0', "La planta de agua pesada concentra deuterio a partir de agua. Circuito 1: intercambio isotópico. Circuito 2: acabado a agua pesada. Circuito 3: modo Proxima, desde UHV.")
    add('emi.grindless.info.heavy_water_plant.1', "Necesita una carga de sulfuro de hidrógeno para el intercambio. El agua pesada alimenta el reactor de fisión y la línea del tritio.")

    add('emi.grindless.info.hot_cell.0', "La celda caliente maneja material radiactivo tras un blindaje. Circuito 1: enriquecimiento. 2: combustible. 3: reprocesado de combustible gastado. 4: radón. 5: silicio-28. 6: boro-11. 7: níquel-62.")
    add('emi.grindless.info.hot_cell.1', "Se niega a eliminar: si una salida está bloqueada se detiene. El reprocesado es lo que devuelve algo del combustible gastado.")

    add('emi.grindless.info.interferometer.0', "El interferómetro es una red de telescopios en Mercurio que solo funciona de noche. Escribe la Carta del Sistema Exterior en memorias y orbes de datos.")
    add('emi.grindless.info.interferometer.1', "Es la única fuente de esa carta. Al amanecer espera y conserva su progreso.")

    add('emi.grindless.info.isr_wellfield.0', "El campo de pozos ISR lixivia uranio in situ en el End: ácido sulfúrico y oxígeno bajan por los pozos y sube uraninita.")
    add('emi.grindless.info.isr_wellfield.1', "Solo funciona en el End. La uraninita alimenta la línea del uranio hacia el enriquecimiento.")

    add('emi.grindless.info.mercury_solar_field.0', "El campo solar de Mercurio convierte la luz solar de Mercurio en EU. Pon el circuito programado 1 en el bus de entrada.")
    add('emi.grindless.info.mercury_solar_field.1', "Solo funciona en Mercurio y solo de día; de noche espera sin perder nada. Su EU sale por hatches dinamo.")

    add('emi.grindless.info.mercury_solar_works.0', "La fábrica solar de Mercurio es la fábrica del planeta. Sinteriza ladrillos de escudo térmico, fabrica paneles solares de película fina y funde iridosmina.")
    add('emi.grindless.info.mercury_solar_works.1', "Solo funciona en Mercurio. Los ladrillos revisten las estructuras de Mercurio; la iridosmina va a la planta de platino.")

    add('emi.grindless.info.mercury_vein_drill.0', "La perforadora de vetas de Mercurio perfora las vetas de Mercurio, solo allí, y nunca una veta de la Tierra. Pon la muestra y brocas de acero de tungsteno en el bus de entrada.")
    add('emi.grindless.info.mercury_vein_drill.1', "El nitrógeno líquido en el hatch de entrada da más mena y menos desgaste de broca de día.")

    add('emi.grindless.info.naquadah_plant.0', "La planta de naquadah refina naquadah. El circuito 1 ejecuta la línea del naquadah; los circuitos 2 y 3 son modos LuV.")
    add('emi.grindless.info.naquadah_plant.1', "Necesita una fuente de neutrones de plutonio-berilio. Sus productos alimentan los materiales densos de las siguientes eras.")

    add('emi.grindless.info.pressurized_vein_drill.0', "La perforadora de vetas presurizada perfora la veta de naquadah de Venus y las vetas de Marte, cada una solo en su mundo.")
    add('emi.grindless.info.pressurized_vein_drill.1', "Es la perforadora para los lugares donde la perforadora trípode EV no aguanta la presión.")

    add('emi.grindless.info.smelting_complex.0', "El complejo de fundición es un alto horno y un congelador de vacío en uno. Ejecuta recetas de alto horno y el paso del congelador en una sola pasada.")
    add('emi.grindless.info.smelting_complex.1', "Sus bobinas fijan cuántas copias corren a la vez, así que es la vía de alto rendimiento para hacer lingotes de aleación.")

    add('emi.grindless.info.tritium_removal_facility.0', "La instalación de retirada de tritio destritia agua pesada. Solo funciona en la Luna y necesita una carga de deuterio en el hatch de entrada.")
    add('emi.grindless.info.tritium_removal_facility.1', "Es la fuente de tritio para el combustible de fusión de las eras posteriores.")

    add('emi.grindless.info.venus_acid_works.0', "La planta de ácido de Venus descompone ácido sulfúrico en agua y oxígeno. Solo funciona en Venus, donde el ácido abunda.")
    add('emi.grindless.info.venus_acid_works.1', "El agua y el oxígeno son lo que a Venus le falta para su propia industria.")

    add('emi.grindless.info.venus_heat_engine.0', "El motor térmico de Venus aprovecha el calor de Venus: no quema nada y da 8.192 EU/t más vapor. Solo funciona en Venus.")
    add('emi.grindless.info.venus_heat_engine.1', "Su EU sale por hatches dinamo. El vapor necesita adónde ir o se detiene.")
})
