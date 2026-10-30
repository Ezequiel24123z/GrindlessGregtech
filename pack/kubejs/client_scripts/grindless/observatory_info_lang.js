// priority: 6050
// Gregtech Grindless - EMI information pages of the observatory multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in observatory_lang.js; every key is in en_us and es_es.
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

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.steam_observatory.0', "El observatorio de relojería es un telescopio de bronce sobre una montura a la que da cuerda el vapor. Dibuja la Carta Lunar (borrador) y es la única fuente. Hace un borrador cada vez.")
    add('emi.grindless.info.steam_observatory.1', "Solo funciona de noche con el cielo despejado y el controlador a Y 100 o más. Al amanecer o con lluvia espera y conserva su progreso. Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor.")
    add('emi.grindless.info.steam_observatory.2', 'Un telescopio de bronce sobre una montura de relojería, al aire libre. El vapor da cuerda al mecanismo que mantiene la Luna en el ocular mientras dibujas.')
    add('emi.grindless.info.steam_observatory.3', 'Solo funciona de noche y con el cielo despejado, con el controlador en Y 100 o más: por encima de la bruma y del humo de tus hornos de coque.')
    add('emi.grindless.info.steam_observatory.4', 'Es lo único que hace la carta lunar (borrador). Si amanece o llueve a medio dibujo, espera y no pierde lo hecho.')
    add('emi.grindless.info.steam_observatory.5', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor en la plataforma. Un borrador cada vez.')

    add('emi.grindless.info.optical_observatory.0', "El observatorio óptico es una cúpula de acero con un refractor de motor. Tu borrador guía el telescopio y no se gasta. Hace el Mapa Lunar Fotográfico y las Efemérides Lunares, y es su única fuente.")
    add('emi.grindless.info.optical_observatory.1', "Solo funciona de noche con el cielo despejado, a cualquier altura. Mantén abiertas las dos celdas de la rendija. Necesita 1 o 2 escotillas de energía, 1 bus de entrada y 1 bus de salida.")
    add('emi.grindless.info.optical_observatory.2', 'Una cúpula de acero con la rendija abierta y un refractor con motor de seguimiento. Las placas fotográficas captan lo que el ojo no vio.')
    add('emi.grindless.info.optical_observatory.3', 'Solo funciona de noche y con el cielo despejado. Las exposiciones largas vencen a la bruma, así que vale cualquier altura.')
    add('emi.grindless.info.optical_observatory.4', 'Es lo único que hace el mapa fotográfico de la Luna y las efemérides lunares. Tu borrador guía el telescopio y no se gasta.')
    add('emi.grindless.info.optical_observatory.5', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada y 1 bus de salida en el anillo del suelo. Las dos casillas de la rendija quedan abiertas.')

    add('emi.grindless.info.radio_telescope.0', "El radiotelescopio hace rebotar radar en la Luna y escucha el eco. Hace la Carta de Sitios de Alunizaje y es su única fuente. El mapa y las efemérides orientan las antenas y no se gastan.")
    add('emi.grindless.info.radio_telescope.1', "Funciona de noche con nubes y lluvia, pero no con tormenta eléctrica. Necesita 1 o 2 escotillas de energía MV, 1 bus de entrada y 1 bus de salida.")
    add('emi.grindless.info.radio_telescope.2', 'Tres antenas parabólicas de aluminio y una caseta de control. Hace rebotar el radar en la Luna y escucha el eco.')
    add('emi.grindless.info.radio_telescope.3', 'La radio atraviesa nubes y lluvia: solo necesita la Luna en el cielo (de noche) y que no haya tormenta, cuyos rayos tapan el eco.')
    add('emi.grindless.info.radio_telescope.4', 'Es lo único que hace la carta del lugar de alunizaje. El mapa y las efemérides apuntan las antenas y no se gastan.')
    add('emi.grindless.info.radio_telescope.5', 'Necesita 1 o 2 escotillas de energía (MV), 1 bus de entrada y 1 bus de salida en la caseta.')
})
