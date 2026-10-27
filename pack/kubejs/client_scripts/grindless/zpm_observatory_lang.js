// priority: 800
// Gregtech Grindless - names and tooltips of ZPM's survey network (startup_scripts/grindless/zpm/observatory.js):
// gtceu:neutrino_observatory, gtceu:deep_space_network, gtceu:kuiper_survey_telescope and their recipe types.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.neutrino_observatory', 'Neutrino Observatory')
    add('block.gtceu.deep_space_network', 'Deep Space Network')
    add('block.gtceu.kuiper_survey_telescope', 'Kuiper Survey Telescope')
    add('gtceu.neutrino_detection', 'Neutrino Detection')
    add('gtceu.telemetry_decoding', 'Telemetry Decoding')
    add('gtceu.kuiper_survey', 'Kuiper Survey')
    add('emi.grindless.info.photomultiplier_casing.0', 'A glass casing lined with photomultiplier tubes. It builds the 15 x 15 x 15 shell of the Neutrino Observatory.')

    add('grindless.machine.neutrino_observatory.tooltip.0', 'A vessel of heavy water inside a shield, watched by thousands of photomultipliers. Circuit 1: a data orb + 1,000 mB heavy water -> Solar-Core Survey (the UV energy hatch needs it).')
    add('grindless.machine.neutrino_observatory.tooltip.1', 'Circuit 2: the same + a Gravitational-Wave Catalogue (never used up) -> Multi-Messenger Catalogue. 122,880 EU/t (ZPM), 1,200 t.')
    add('grindless.machine.neutrino_observatory.tooltip.2', 'Needs: a 15 x 15 x 15 shell of photomultiplier casing around a water shield, a laminated glass vessel 5 x 5 x 5 in the middle, 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 or 2 input hatches.')

    add('grindless.machine.deep_space_network.tooltip.0', 'A dish over a cryo-cabin. Circuit 1: a Neptune probe recording + a data orb + 1,000 mB liquid helium -> Neptune flyby data. Circuit 2: the same with a Triton recording.')
    add('grindless.machine.deep_space_network.tooltip.1', 'Circuit 3: both flyby datasets + a Kuiper target list + a data orb -> Pluto-Kuiper chart. 122,880 EU/t (ZPM).')
    add('grindless.machine.deep_space_network.tooltip.2', 'Needs: a 15 x 15 heat-proof deck, aluminium frame rings widening to the rim, a 3 x 3 x 3 frostproof cryo-cabin in the middle, 1 or 2 energy hatches (ZPM), input buses, output buses and input hatches.')

    add('grindless.machine.kuiper_survey_telescope.tooltip.0', 'A survey telescope with a sapphire secondary mirror. Only works in Earth orbit. A data orb + a CVD diamond plate (the mirror coating) -> Kuiper target list.')
    add('grindless.machine.kuiper_survey_telescope.tooltip.1', 'Circuit 1. 122,880 EU/t (ZPM), 1,200 t.')
    add('grindless.machine.kuiper_survey_telescope.tooltip.2', 'Needs: a 5 x 5 x 11 tube of station truss casing, a sapphire block as the secondary mirror, 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.neutrino_observatory', 'Observatorio de neutrinos')
    add('block.gtceu.deep_space_network', 'Red de espacio profundo')
    add('block.gtceu.kuiper_survey_telescope', 'Telescopio de sondeo de Kuiper')
    add('gtceu.neutrino_detection', 'Detección de neutrinos')
    add('gtceu.telemetry_decoding', 'Decodificación de telemetría')
    add('gtceu.kuiper_survey', 'Sondeo de Kuiper')
    add('emi.grindless.info.photomultiplier_casing.0', 'Una carcasa de vidrio forrada de fotomultiplicadores. Construye la carcasa de 15 x 15 x 15 del Observatorio de neutrinos.')

    add('grindless.machine.neutrino_observatory.tooltip.0', 'Una vasija de agua pesada dentro de un blindaje, vigilada por miles de fotomultiplicadores. Circuito 1: un orbe de datos + 1 000 mB de agua pesada -> Estudio del núcleo solar (lo necesita la escotilla de energía UV).')
    add('grindless.machine.neutrino_observatory.tooltip.1', 'Circuito 2: lo mismo + un Catálogo de ondas gravitacionales (no se gasta) -> Catálogo multimensajero. 122 880 EU/t (ZPM), 1 200 t.')
    add('grindless.machine.neutrino_observatory.tooltip.2', 'Necesita: una carcasa de 15 x 15 x 15 de carcasas de fotomultiplicador alrededor de un blindaje de agua, una vasija de vidrio laminado de 5 x 5 x 5 en el centro, 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida y 1 o 2 escotillas de entrada.')

    add('grindless.machine.deep_space_network.tooltip.0', 'Una antena sobre una cabina criogénica. Circuito 1: una grabación de la sonda de Neptuno + un orbe de datos + 1 000 mB de helio líquido -> Datos del sobrevuelo de Neptuno. Circuito 2: igual con una grabación de Tritón.')
    add('grindless.machine.deep_space_network.tooltip.1', 'Circuito 3: ambos conjuntos de datos + una lista de objetivos de Kuiper + un orbe de datos -> Carta de Plutón y Kuiper. 122 880 EU/t (ZPM).')
    add('grindless.machine.deep_space_network.tooltip.2', 'Necesita: una cubierta de 15 x 15 de carcasa a prueba de calor, anillos de armazón de aluminio que se ensanchan hasta el borde, una cabina criogénica de 3 x 3 x 3 de carcasa a prueba de escarcha, 1 o 2 escotillas de energía (ZPM), buses y escotillas de entrada y salida.')

    add('grindless.machine.kuiper_survey_telescope.tooltip.0', 'Un telescopio de sondeo con espejo secundario de zafiro. Solo funciona en la órbita terrestre. Un orbe de datos + una placa de diamante CVD (el recubrimiento del espejo) -> Lista de objetivos de Kuiper.')
    add('grindless.machine.kuiper_survey_telescope.tooltip.1', 'Circuito 1. 122 880 EU/t (ZPM), 1 200 t.')
    add('grindless.machine.kuiper_survey_telescope.tooltip.2', 'Necesita: un tubo de 5 x 5 x 11 de carcasas de armazón de estación, un bloque de zafiro como espejo secundario, 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada y 1 o 2 buses de salida.')
})
