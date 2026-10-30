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

    add('grindless.machine.neutrino_observatory.tooltip.0', '§7Detects solar neutrinos in a vessel of heavy water.')

    add('grindless.machine.deep_space_network.tooltip.0', '§7Decodes probe telemetry from Neptune and Triton.')

    add('grindless.machine.kuiper_survey_telescope.tooltip.0', '§7Surveys the Kuiper Belt for targets.')
    add('grindless.machine.kuiper_survey_telescope.tooltip.1', 'Works only in Earth orbit.')
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

    add('grindless.machine.neutrino_observatory.tooltip.0', '§7Detecta neutrinos solares en un recipiente de agua pesada.')

    add('grindless.machine.deep_space_network.tooltip.0', '§7Decodifica la telemetría de las sondas de Neptuno y Tritón.')

    add('grindless.machine.kuiper_survey_telescope.tooltip.0', '§7Rastrea el cinturón de Kuiper en busca de objetivos.')
    add('grindless.machine.kuiper_survey_telescope.tooltip.1', 'Solo funciona en órbita terrestre.')
})
