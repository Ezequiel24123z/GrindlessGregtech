// priority: 3090
// Gregtech Grindless - names and tooltips of UIV's PSR J0437-4715 machines (startup_scripts/grindless/uiv/j0437.js; package UIV-B3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe, and of each row the package appends to an older table
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items; material.gtceu.<n> its gases
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.pulsar_wind_trap', 'Pulsar Wind Trap', 'Trampa de viento de púlsar'],
        ['block.gtceu.positronium_condensate_lab', 'Positronium Condensate Lab', 'Laboratorio de condensado de positronio'],
        ['block.gtceu.xray_pulse_profiler', 'X-ray Pulse Profiler', 'Perfilador de pulsos de rayos X'],
        ['gtceu.pulsar_wind_trapping', 'Pulsar Wind Trapping', 'Captura de viento de púlsar'],
        ['gtceu.positronium_condensation', 'Positronium Condensation', 'Condensación de positronio'],
        ['gtceu.xray_pulse_profiling', 'X-ray Pulse Profiling', 'Perfilado de pulsos de rayos X'],
        ['material.gtceu.pair_plasma', 'Pair Plasma', 'Plasma de pares'],
        ['material.gtceu.wind_electrons', 'Wind Electrons', 'Electrones del viento'],
        ['material.gtceu.neon_6n', '6N Neon', 'Neón 6N'],
        ['material.gtceu.purified_neon', 'Purified Neon', 'Neón purificado'],

        ['grindless.machine.pulsar_wind_trap.tooltip.0',
            '\u00a77Catches the electron-positron wind of a pulsar as pair plasma.',
            '\u00a77Atrapa el viento de electrones y positrones de un púlsar como plasma de pares.'],
        ['grindless.machine.positronium_condensate_lab.tooltip.0',
            '\u00a77Condenses positronium and makes it annihilate in step: a gamma laser core.',
            '\u00a77Condensa positronio y lo aniquila al unísono: el núcleo de un láser gamma.'],
        ['grindless.machine.xray_pulse_profiler.tooltip.0',
            '\u00a77Folds pulsar X-ray pulses into a timing solution for seed navigation.',
            '\u00a77Pliega pulsos de rayos X de púlsar en una solución de cronometraje.'],

        ['gtceu.recipe.grindless_pulsar_wind_trapping.pair_plasma',
            'Circuit 1: the coil block traps pair plasma; the gamma rays heat the lining (voided) and the spare electrons go back to the wind.',
            'Circuito 1: el bloque de bobina atrapa plasma de pares; los rayos gamma calientan el revestimiento (se anulan) y los electrones sobrantes vuelven al viento.'],
        ['gtceu.recipe.grindless_positronium_condensation.ps_in_aerogel',
            'Circuit 1: moderated positrons form positronium in the pores of the Ps-converter aerogel.',
            'Circuito 1: los positrones moderados forman positronio en los poros del aerogel conversor de Ps.'],
        ['gtceu.recipe.grindless_positronium_condensation.laser_cooled_ps',
            'Circuit 2: the 243 nm cooling laser (not consumed) cools the positronium.',
            'Circuito 2: el láser de enfriamiento de 243 nm (no se consume) enfría el positronio.'],
        ['gtceu.recipe.grindless_positronium_condensation.gamma_laser_cavity',
            'Circuit 3: the Ps BEC between two gamma Bragg mirrors is a gamma-ray laser cavity.',
            'Circuito 3: el BEC de Ps entre dos espejos de Bragg gamma es una cavidad láser de rayos gamma.'],
        ['gtceu.recipe.grindless_xray_pulse_profiling.j0437_pulse_raw',
            'Circuit 1: the UEV navigation chart (not consumed) points the profiler; four raw J0437 pulse profiles come out.',
            'Circuito 1: la carta de navegación UEV (no se consume) apunta el perfilador; salen cuatro perfiles de pulso en bruto de J0437.'],
        ['gtceu.recipe.grindless_xray_pulse_profiling.pulsar_navigation_solution',
            'Circuit 2: four timed pulse profiles and the neutron-star EOS chart give the navigation solution.',
            'Circuito 2: cuatro perfiles de pulso cronometrados y la carta EOS de estrella de neutrones dan la solución de navegación.'],
        ['gtceu.recipe.grindless_positron_accumulation.pair_plasma_cooling',
            'Circuit 4, at PSR J0437-4715 only: the Penning trap cools pair plasma into a bunch of cooled positrons; the electrons go back.',
            'Circuito 4, solo en PSR J0437-4715: la trampa de Penning enfría plasma de pares hasta un paquete de positrones fríos; los electrones vuelven.'],
        ['gtceu.recipe.grindless_antimatter_storage.ps_bec',
            'Circuit 4, at PSR J0437-4715 only: laser-cooled positronium condenses in a superfluid helium bath into a Ps BEC.',
            'Circuito 4, solo en PSR J0437-4715: el positronio enfriado con láser se condensa en un baño de helio superfluido hasta un BEC de Ps.'],
        ['gtceu.recipe.grindless_megabar.c12_hpht',
            'Circuit 4: high-pressure, high-temperature annealing heals the C-12 CVD plate. Anvil wear: 10 % per run.',
            'Circuito 4: el recocido a alta presión y temperatura cura la placa CVD de C-12. Desgaste del yunque: 10 % por ciclo.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['cooled_positron_bunch', 'Cooled Positron Bunch', 'Paquete de positrones fríos', 'Positrons cooled in a Penning trap at J0437.', 'Positrones enfriados en una trampa de Penning en J0437.', 'Goes into the positronium condensate lab (circuit 1).', 'Va al laboratorio de condensado de positronio (circuito 1).'],
        ['ps_converter_aerogel', 'Ps-Converter Aerogel', 'Aerogel conversor de Ps', 'Mesoporous silica whose pores stop positrons as positronium.', 'Sílice mesoporosa cuyos poros frenan positrones como positronio.', 'Made in the aerogel works (circuit 1).', 'Se fabrica en el taller de aerogel (circuito 1).'],
        ['ps_in_aerogel', 'Positronium in Aerogel', 'Positronio en aerogel', 'Positronium trapped in the pores of the aerogel.', 'Positronio atrapado en los poros del aerogel.', 'Cooled by the 243 nm laser in the positronium lab (circuit 2).', 'Se enfría con el láser de 243 nm en el laboratorio de positronio (circuito 2).'],
        ['laser_cooled_ps', 'Laser-Cooled Positronium', 'Positronio enfriado con láser', 'Positronium cooled to a few kelvin.', 'Positronio enfriado a unos pocos kelvin.', 'Condensed in the antimatter trap (circuit 4).', 'Se condensa en la trampa de antimateria (circuito 4).'],
        ['ps_bec', 'Positronium BEC', 'BEC de positronio', 'A Bose-Einstein condensate of positronium: a proposal, not yet made.', 'Un condensado de Bose-Einstein de positronio: una propuesta, aún no realizada.', 'Goes between two gamma mirrors (positronium lab, circuit 3).', 'Va entre dos espejos gamma (laboratorio de positronio, circuito 3).'],
        ['gamma_laser_cavity', 'Gamma Laser Cavity', 'Cavidad láser gamma', 'A Ps BEC between two Bragg mirrors, ready to lase in step.', 'Un BEC de Ps entre dos espejos de Bragg, listo para emitir al unísono.', 'The core of the UIV emitter.', 'El núcleo del emisor UIV.'],
        ['c12_hpht_plate', 'HPHT C-12 Plate', 'Placa de C-12 HPHT', 'A C-12 CVD plate annealed under megabar pressure.', 'Una placa CVD de C-12 recocida bajo presión de megabar.', 'Cut along the (004) plane.', 'Se corta a lo largo del plano (004).'],
        ['c12_004_plate', '(004) C-12 Blank', 'Pieza (004) de C-12', 'A thin diamond blank cut along the (004) plane.', 'Una pieza fina de diamante cortada según el plano (004).', 'Ion-milled flat.', 'Se pule con haz de iones.'],
        ['c12_ion_milled_plate', 'Ion-Milled C-12 Plate', 'Placa de C-12 pulida con iones', 'A (004) blank milled flat and strain-free.', 'Una pieza (004) pulida plana y sin tensión.', 'Four make a pair of gamma Bragg mirrors.', 'Cuatro forman un par de espejos de Bragg gamma.'],
        ['gamma_bragg_mirror', 'Gamma Bragg Mirror', 'Espejo de Bragg gamma', 'Diamond and tungsten layers that reflect gamma rays.', 'Capas de diamante y wolframio que reflejan rayos gamma.', 'A pair closes the gamma laser cavity.', 'Un par cierra la cavidad láser gamma.'],
        ['solid_neon_cone', 'Solid Neon Cone', 'Cono de neón sólido', 'Purified neon frozen on a cooled cone.', 'Neón purificado congelado sobre un cono enfriado.', 'Annealed in the vacuum freezer.', 'Se recuece en el congelador de vacío.'],
        ['annealed_neon_cone', 'Annealed Neon Cone', 'Cono de neón recocido', 'A solid-neon cone without grain boundaries.', 'Un cono de neón sólido sin fronteras de grano.', 'Sealed into a moderator cartridge.', 'Se sella en un cartucho moderador.'],
        ['neon_moderator_cartridge', 'Neon Moderator Cartridge', 'Cartucho moderador de neón', 'A film of solid neon that slows positrons to a stop.', 'Una película de neón sólido que frena los positrones hasta detenerlos.', 'Used up in the positronium condensate lab (circuit 1).', 'Se consume en el laboratorio de condensado de positronio (circuito 1).']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
