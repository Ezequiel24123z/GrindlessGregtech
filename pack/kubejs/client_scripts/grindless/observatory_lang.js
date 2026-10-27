// priority: 6000
// Gregtech Grindless - names and tooltips of the observatory family (Steam to MV):
//
//   gtceu:steam_observatory, gtceu:optical_observatory, gtceu:radio_telescope        (machine names + tooltips)
//   gtceu:stargazing, gtceu:astrophotography, gtceu:radio_astronomy                  (recipe types)
//   gtceu.recipe.grindless_sky.<steam|optical|radio>                                 (the EMI line with the sky rule of each recipe)
//   grindless:lunar_chart_draft, photographic_plate, lunar_map, lunar_ephemeris, lunar_landing_chart   (items)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts: Minecraft merges lang entries from every
// namespace/script, so ClientEvents.lang works wherever it is declared. Quests are English only; names go in en_us and es_es.
// GTM's own condition lines (night, rain level, thunder level, Y range) keep GTM's text; the sky line above says in words what a
// reversed rain or thunder condition means.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.steam_observatory', 'Clockwork Observatory')
    add('block.gtceu.optical_observatory', 'Optical Observatory')
    add('block.gtceu.radio_telescope', 'Radio Telescope')
    add('gtceu.stargazing', 'Stargazing')
    add('gtceu.astrophotography', 'Astrophotography')
    add('gtceu.radio_astronomy', 'Radio Astronomy')

    add('grindless.machine.steam_observatory.tooltip.0', 'A bronze telescope on a clockwork mount, out in the open. Steam winds the drive that keeps the Moon in the eyepiece while you draw.')
    add('grindless.machine.steam_observatory.tooltip.1', 'Works only at night under a clear sky, with the controller at Y 100 or higher: above the haze and the smoke of your own coke ovens.')
    add('grindless.machine.steam_observatory.tooltip.2', 'The only source of the Lunar Chart (Draft). If dawn or rain comes mid-sketch, it waits and keeps its progress.')
    add('grindless.machine.steam_observatory.tooltip.3', 'Needs 1 steam hatch, 1 steam input bus and 1 steam output bus in the platform. One draft at a time.')

    add('grindless.machine.optical_observatory.tooltip.0', 'A steel dome with an open shutter slit and a refractor on a motor drive. Photographic plates catch what the eye missed.')
    add('grindless.machine.optical_observatory.tooltip.1', 'Works only at night under a clear sky. Long exposures beat the haze, so any height will do.')
    add('grindless.machine.optical_observatory.tooltip.2', 'The only source of the Photographic Lunar Map and the Lunar Ephemeris. Your draft guides the telescope and is never used up.')
    add('grindless.machine.optical_observatory.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus and 1 output bus in the floor ring. Keep the two cells of the slit open.')

    add('grindless.machine.radio_telescope.tooltip.0', 'Three aluminium dishes and a control hut. It bounces radar off the Moon and listens for the echo.')
    add('grindless.machine.radio_telescope.tooltip.1', 'Radio goes through cloud and rain: it only needs the Moon up (night) and no thunderstorm, whose lightning drowns the echo.')
    add('grindless.machine.radio_telescope.tooltip.2', 'The only source of the Lunar Landing-Site Chart. The map and the ephemeris point the dishes and are never used up.')
    add('grindless.machine.radio_telescope.tooltip.3', 'Needs 1 or 2 energy hatches (MV), 1 input bus and 1 output bus in the hut.')

    add('gtceu.recipe.grindless_sky.steam', 'Sky: clear night, controller at Y 100+')
    add('gtceu.recipe.grindless_sky.optical', 'Sky: clear night, any height')
    add('gtceu.recipe.grindless_sky.radio', 'Sky: night; rain is fine, storms are not')

    add('item.grindless.lunar_chart_draft', 'Lunar Chart (Draft)')
    add('tooltip.grindless.lunar_chart_draft.0', 'Drawn at the eyepiece by lamplight: dark seas, bright highlands, the big craters and their rays.')
    add('tooltip.grindless.lunar_chart_draft.1', 'From the Clockwork Observatory. The Optical Observatory reads it without using it up. Copy: draft + paper + coal dust.')
    add('item.grindless.photographic_plate', 'Photographic Plate')
    add('tooltip.grindless.photographic_plate.0', 'Glass with a silver emulsion. The Optical Observatory exposes it on the Moon; laid on a lunar map, it prints a copy.')
    add('item.grindless.lunar_map', 'Photographic Lunar Map')
    add('tooltip.grindless.lunar_map.0', 'Plates stitched into one map: rilles, crater chains, long shadows on the terminator. Flat ground and rough ground, told apart.')
    add('tooltip.grindless.lunar_map.1', 'From the Optical Observatory. The Radio Telescope reads it without using it up. Copy: map + photographic plate.')
    add('item.grindless.lunar_ephemeris', 'Lunar Ephemeris')
    add('tooltip.grindless.lunar_ephemeris.0', 'Tables of where the Moon will stand, night after night. With them a dish finds the Moon without seeing it.')
    add('tooltip.grindless.lunar_ephemeris.1', 'From the Optical Observatory, with the map. The Radio Telescope reads it without using it up. Copy: ephemeris + paper + coal dust.')
    add('item.grindless.lunar_landing_chart', 'Lunar Landing-Site Chart')
    add('tooltip.grindless.lunar_landing_chart.0', 'Radar echoes over the photographic map: smooth mare, boulder fields, steep crater walls. One ellipse on a flat sea is circled in red.')
    add('tooltip.grindless.lunar_landing_chart.1', 'From the Radio Telescope: the landing site of the first trip to the Moon. Copy: chart + paper + coal dust.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.steam_observatory', 'Observatorio de relojería')
    add('block.gtceu.optical_observatory', 'Observatorio óptico')
    add('block.gtceu.radio_telescope', 'Radiotelescopio')
    add('gtceu.stargazing', 'Observación al ocular')
    add('gtceu.astrophotography', 'Astrofotografía')
    add('gtceu.radio_astronomy', 'Radioastronomía')

    add('grindless.machine.steam_observatory.tooltip.0', 'Un telescopio de bronce sobre una montura de relojería, al aire libre. El vapor da cuerda al mecanismo que mantiene la Luna en el ocular mientras dibujas.')
    add('grindless.machine.steam_observatory.tooltip.1', 'Solo funciona de noche y con el cielo despejado, con el controlador en Y 100 o más: por encima de la bruma y del humo de tus hornos de coque.')
    add('grindless.machine.steam_observatory.tooltip.2', 'Es lo único que hace la carta lunar (borrador). Si amanece o llueve a medio dibujo, espera y no pierde lo hecho.')
    add('grindless.machine.steam_observatory.tooltip.3', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor en la plataforma. Un borrador cada vez.')

    add('grindless.machine.optical_observatory.tooltip.0', 'Una cúpula de acero con la rendija abierta y un refractor con motor de seguimiento. Las placas fotográficas captan lo que el ojo no vio.')
    add('grindless.machine.optical_observatory.tooltip.1', 'Solo funciona de noche y con el cielo despejado. Las exposiciones largas vencen a la bruma, así que vale cualquier altura.')
    add('grindless.machine.optical_observatory.tooltip.2', 'Es lo único que hace el mapa fotográfico de la Luna y las efemérides lunares. Tu borrador guía el telescopio y no se gasta.')
    add('grindless.machine.optical_observatory.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada y 1 bus de salida en el anillo del suelo. Las dos casillas de la rendija quedan abiertas.')

    add('grindless.machine.radio_telescope.tooltip.0', 'Tres antenas parabólicas de aluminio y una caseta de control. Hace rebotar el radar en la Luna y escucha el eco.')
    add('grindless.machine.radio_telescope.tooltip.1', 'La radio atraviesa nubes y lluvia: solo necesita la Luna en el cielo (de noche) y que no haya tormenta, cuyos rayos tapan el eco.')
    add('grindless.machine.radio_telescope.tooltip.2', 'Es lo único que hace la carta del lugar de alunizaje. El mapa y las efemérides apuntan las antenas y no se gastan.')
    add('grindless.machine.radio_telescope.tooltip.3', 'Necesita 1 o 2 escotillas de energía (MV), 1 bus de entrada y 1 bus de salida en la caseta.')

    add('gtceu.recipe.grindless_sky.steam', 'Cielo: noche despejada, controlador en Y 100 o más')
    add('gtceu.recipe.grindless_sky.optical', 'Cielo: noche despejada, a cualquier altura')
    add('gtceu.recipe.grindless_sky.radio', 'Cielo: de noche; con lluvia sí, con tormenta no')

    add('item.grindless.lunar_chart_draft', 'Carta lunar (borrador)')
    add('tooltip.grindless.lunar_chart_draft.0', 'Dibujada en el ocular a la luz de un farol: mares oscuros, tierras altas claras, los grandes cráteres y sus rayos.')
    add('tooltip.grindless.lunar_chart_draft.1', 'Del observatorio de relojería. El observatorio óptico la lee sin gastarla. Copia: borrador + papel + polvo de carbón.')
    add('item.grindless.photographic_plate', 'Placa fotográfica')
    add('tooltip.grindless.photographic_plate.0', 'Vidrio con una emulsión de plata. El observatorio óptico la expone a la Luna; sobre un mapa lunar, imprime una copia.')
    add('item.grindless.lunar_map', 'Mapa fotográfico de la Luna')
    add('tooltip.grindless.lunar_map.0', 'Placas unidas en un solo mapa: grietas, cadenas de cráteres, sombras largas en el terminador. Ya se distingue el suelo llano del abrupto.')
    add('tooltip.grindless.lunar_map.1', 'Del observatorio óptico. El radiotelescopio lo lee sin gastarlo. Copia: mapa + placa fotográfica.')
    add('item.grindless.lunar_ephemeris', 'Efemérides lunares')
    add('tooltip.grindless.lunar_ephemeris.0', 'Tablas de dónde estará la Luna noche tras noche. Con ellas una antena encuentra la Luna sin verla.')
    add('tooltip.grindless.lunar_ephemeris.1', 'Del observatorio óptico, junto con el mapa. El radiotelescopio las lee sin gastarlas. Copia: efemérides + papel + polvo de carbón.')
    add('item.grindless.lunar_landing_chart', 'Carta del lugar de alunizaje')
    add('tooltip.grindless.lunar_landing_chart.0', 'Ecos de radar sobre el mapa fotográfico: mares lisos, campos de rocas, paredes de cráter empinadas. Una elipse sobre un mar llano, marcada en rojo.')
    add('tooltip.grindless.lunar_landing_chart.1', 'Del radiotelescopio: el lugar de alunizaje del primer viaje a la Luna. Copia: carta + papel + polvo de carbón.')
})
