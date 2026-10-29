// priority: 9675
// Gregtech Grindless - EMI information pages of the HV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in hv_family_lang.js, hv_refinery_lang.js, hv_mega_coil_chemical_plant_lang.js and syngas_lang.js; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.coil_chemical_plant.0', "The Coil Chemical Plant is a large chemical reactor that grows with its heating coil: it runs every large chemical reactor recipe, and so every chemical reactor recipe, with many copies at once.")
    add('emi.grindless.info.coil_chemical_plant.1', "Better coils mean more copies, up to 64 with HSS-G, and each coil step above cupronickel also trims the energy. Each copy pays its full EU/t, so the energy hatches set how many run.")

    add('emi.grindless.info.hv_greenhouse.0', "The HV Greenhouse grows trees, rubber trees, crops, mushrooms, berries, vines and flowers with a plant that is never used up. It runs every Steam, LV and MV Greenhouse recipe, with more crops at once.")
    add('emi.grindless.info.hv_greenhouse.1', "Water unlocks the extra plants; circuit 2 plus fertilizer doubles the output. Circuit 4 with fertilizer and carbon dioxide in a second input hatch adds output and gives oxygen back.")

    add('emi.grindless.info.hv_vein_drill.0', "The HV Vein Drill drills the vein marked by the vein sample, over and over. It runs every Steam, LV and MV Vein Drill recipe, the End veins too with drilling fluid, up to 32 bores at once.")
    add('emi.grindless.info.hv_vein_drill.1', "It takes the stainless steel bit, which only works here and in better drills. Drilling fluid in the fluid hatch gives more ore and less wear.")

    add('emi.grindless.info.refinery.0', "The Refinery is a petrochemical complex in one machine. The programmed circuit picks the process: 1 crude oil with hydrogen into fuels, naphtha and refinery gas; 2 hydro-cracking; 3 steam cracking.")
    add('emi.grindless.info.refinery.1', "It uses the same ratios as the loose machines and adds up their energy: no discount, it saves steps and pipes. Each of its 12 layers needs exactly one output hatch, and a Hydrotreating Catalyst goes in the input bus.")

    add('emi.grindless.info.reformer.0', "The Catalytic Reformer turns desulfurized naphtha into benzene, toluene and hydrogen over a platinum catalyst. GTM has no reforming; this is ours. Circuit 1 favours benzene, 2 toluene and 3 hydrogen.")
    add('emi.grindless.info.reformer.1', "The hydrogen is what the Refinery spends, so the two close a loop. A Reforming Catalyst goes in the input bus and is used up by chance. Each of its three outputs needs its own hatch.")

    add('emi.grindless.info.syngas_plant.0', "The Syngas and Shift Plant is a gasifier, shift reactors and a CO2 absorber in one. Circuit 1: carbon or heavy fuel with steam into carbon monoxide and hydrogen. Circuit 2: methanol syngas. Circuit 3: hydrogen and CO2. Circuit 4: spare carbon monoxide and steam into hydrogen and CO2.")
    add('emi.grindless.info.syngas_plant.1', "GTM has no steam gasification and no water-gas shift: this is the machine that turns carbon monoxide into hydrogen. Modes 2 to 4 need a Shift Catalyst in the input bus. Carbon monoxide is toxic: keep it in tanks or shift it.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.coil_chemical_plant.0', "La planta química de bobinas es un reactor químico grande que crece con su bobina calefactora: ejecuta todas las recetas del reactor químico grande, y por tanto todas las del reactor químico, con muchas copias a la vez.")
    add('emi.grindless.info.coil_chemical_plant.1', "Mejores bobinas dan más copias, hasta 64 con HSS-G, y cada escalón sobre el cuproníquel recorta además la energía. Cada copia paga su EU/t completo, así que las escotillas de energía fijan cuántas corren.")

    add('emi.grindless.info.hv_greenhouse.0', "El invernadero HV cultiva árboles, árboles de caucho, cultivos, setas, bayas, enredaderas y flores con una planta que nunca se gasta. Ejecuta todas las recetas de los invernaderos de vapor, LV y MV, con más cultivos a la vez.")
    add('emi.grindless.info.hv_greenhouse.1', "El agua desbloquea las plantas extra; el circuito 2 con fertilizante duplica la producción. El circuito 4 con fertilizante y dióxido de carbono en una segunda escotilla de entrada suma producción y devuelve oxígeno.")

    add('emi.grindless.info.hv_vein_drill.0', "La perforadora de vetas HV perfora la veta que marca la muestra, una y otra vez. Ejecuta todas las recetas de las perforadoras de vapor, LV y MV, también las vetas del End con fluido de perforación, hasta 32 perforaciones a la vez.")
    add('emi.grindless.info.hv_vein_drill.1', "Usa la broca de acero inoxidable, que solo funciona aquí y en perforadoras mejores. El fluido de perforación en la escotilla de fluidos da más mena y menos desgaste.")

    add('emi.grindless.info.refinery.0', "La refinería es un complejo petroquímico en una sola máquina. El circuito programado elige el proceso: 1 petróleo crudo con hidrógeno a combustibles, nafta y gas de refinería; 2 hidrocraqueo; 3 craqueo con vapor.")
    add('emi.grindless.info.refinery.1', "Usa las mismas proporciones que las máquinas sueltas y suma su energía: sin descuento, ahorra pasos y tuberías. Cada una de sus 12 capas necesita exactamente una escotilla de salida, y un catalizador de hidrotratamiento va en el bus de entrada.")

    add('emi.grindless.info.reformer.0', "El reformador catalítico convierte nafta desulfurada en benceno, tolueno e hidrógeno sobre un catalizador de platino. GTM no tiene reformado; este es nuestro. El circuito 1 favorece el benceno, el 2 el tolueno y el 3 el hidrógeno.")
    add('emi.grindless.info.reformer.1', "El hidrógeno es lo que gasta la refinería, así que las dos cierran un ciclo. Un catalizador de reformado va en el bus de entrada y se gasta por probabilidad. Cada una de sus tres salidas necesita su propia escotilla.")

    add('emi.grindless.info.syngas_plant.0', "La planta de gas de síntesis y conversión es un gasificador, reactores de conversión y un absorbedor de CO2 en uno. Circuito 1: carbono o combustible pesado con vapor a monóxido de carbono e hidrógeno. Circuito 2: gas de síntesis de metanol. Circuito 3: hidrógeno y CO2. Circuito 4: monóxido sobrante y vapor a hidrógeno y CO2.")
    add('emi.grindless.info.syngas_plant.1', "GTM no tiene gasificación con vapor ni conversión agua-gas: esta es la máquina que convierte el monóxido de carbono en hidrógeno. Los modos 2 a 4 necesitan un catalizador de conversión en el bus de entrada. El monóxido de carbono es tóxico: guárdalo en tanques o conviértelo.")
})
