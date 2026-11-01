// priority: 6050
// Gregtech Grindless - EMI information pages of the observatory multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in observatory_lang.js; every key is in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.steam_observatory.0', "The Clockwork Observatory is a bronze telescope on a steam-wound mount. It draws the Lunar Chart (Draft), and it is the only source of it. It runs one draft at a time.")
    add('emi.grindless.info.steam_observatory.1', "It works only at night under a clear sky, with the controller at Y 100 or higher. At dawn or in rain it waits and keeps its progress. It needs 1 steam hatch, 1 steam input bus and 1 steam output bus.")
    add('emi.grindless.info.steam_observatory.2', 'A bronze telescope on a clockwork mount, out in the open. Steam winds the drive that keeps the Moon in the eyepiece while you draw.')
    add('emi.grindless.info.steam_observatory.3', 'Works only at night under a clear sky, with the controller at Y 100 or higher: above the haze and the smoke of your own coke ovens.')
    add('emi.grindless.info.steam_observatory.4', 'The only source of the Lunar Chart (Draft). If dawn or rain comes mid-sketch, it waits and keeps its progress.')
    add('emi.grindless.info.steam_observatory.5', 'Needs 1 steam hatch, 1 steam input bus and 1 steam output bus in the platform. One draft at a time.')

    add('emi.grindless.info.optical_observatory.0', "The Optical Observatory is a steel dome with a refractor on a motor drive. Your draft guides the telescope and is never used up. It makes the Photographic Lunar Map and the Lunar Ephemeris, and is their only source.")
    add('emi.grindless.info.optical_observatory.1', "It works only at night under a clear sky, at any height. Keep the two cells of the slit open. It needs 1 or 2 energy hatches, 1 input bus and 1 output bus.")
    add('emi.grindless.info.optical_observatory.2', 'A steel dome with an open shutter slit and a refractor on a motor drive. Photographic plates catch what the eye missed.')
    add('emi.grindless.info.optical_observatory.3', 'Works only at night under a clear sky. Long exposures beat the haze, so any height will do.')
    add('emi.grindless.info.optical_observatory.4', 'The only source of the Photographic Lunar Map and the Lunar Ephemeris. Your draft guides the telescope and is never used up.')
    add('emi.grindless.info.optical_observatory.5', 'Needs 1 or 2 energy hatches, 1 input bus and 1 output bus in the floor ring. Keep the two cells of the slit open.')

    add('emi.grindless.info.radio_telescope.0', "The Radio Telescope bounces radar off the Moon and listens for the echo. It makes the Lunar Landing-Site Chart, and is its only source. The map and the ephemeris point the dishes and are never used up.")
    add('emi.grindless.info.radio_telescope.1', "It works at night through cloud and rain, but not in a thunderstorm. It needs 1 or 2 MV energy hatches, 1 input bus and 1 output bus.")
    add('emi.grindless.info.radio_telescope.2', 'Three aluminium dishes and a control hut. It bounces radar off the Moon and listens for the echo.')
    add('emi.grindless.info.radio_telescope.3', 'Radio goes through cloud and rain: it only needs the Moon up (night) and no thunderstorm, whose lightning drowns the echo.')
    add('emi.grindless.info.radio_telescope.4', 'The only source of the Lunar Landing-Site Chart. The map and the ephemeris point the dishes and are never used up.')
    add('emi.grindless.info.radio_telescope.5', 'Needs 1 or 2 energy hatches (MV), 1 input bus and 1 output bus in the hut.')
})

