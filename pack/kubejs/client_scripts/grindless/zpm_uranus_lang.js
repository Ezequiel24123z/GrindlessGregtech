// priority: 100
// Gregtech Grindless - names and tooltips of ZPM's Uranus orbit machines (startup_scripts/grindless/zpm/uranus.js):
// gtceu:ice_giant_siphon, gtceu:slurry_separator, gtceu:flyby_probe_bay and their recipe types.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ice_giant_siphon', 'Ice-Giant Siphon')
    add('block.gtceu.slurry_separator', 'Slurry Separator')
    add('block.gtceu.flyby_probe_bay', 'Flyby Probe Bay')
    add('gtceu.ice_giant_siphon', 'Ice-Giant Siphoning')
    add('gtceu.slurry_separation', 'Slurry Separation')
    add('gtceu.outer_flyby', 'Outer Flyby')

    add('grindless.machine.ice_giant_siphon.tooltip.0', 'Lowers a scoop on a tether into Uranus\'s atmosphere. Saturn\'s interior model (kept) tells it how deep. Only works in Uranus orbit.')
    add('grindless.machine.ice_giant_siphon.tooltip.1', 'Circuit 1: 8,000 mB Uranus hydrogen + 2,000 mB helium. 2: 4,000 mB methane + 500 mB hydrogen sulfide. 3: 2,000 mB diamond slurry. 4: 1 glass bottle -> 1 ice giant atmosphere sample. 122,880 EU/t (ZPM). The scoop head wears (0.25 % per run).')
    add('grindless.machine.ice_giant_siphon.tooltip.2', 'Needs: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 to 3 output hatches, and 14 or more pressure hull casings in the floor and the walls. The tether winch stands in the middle.')
    add('grindless.machine.ice_giant_siphon.no_voiding', 'The siphon keeps its gases. Disable voiding.')

    add('grindless.machine.slurry_separator.tooltip.0', 'Decompresses diamond slurry in a cascade of cyclones. Only works in Uranus orbit.')
    add('grindless.machine.slurry_separator.tooltip.1', '2,000 mB diamond slurry + 500 mB hydrogen sulfide -> 4 diamond dust + 1 ice giant diamond seed + 1 sulfur dust + 500 mB ammonia + 500 mB water. 122,880 EU/t (ZPM), 300 t.')
    add('grindless.machine.slurry_separator.tooltip.2', 'Needs: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 input hatches, 1 or 2 output buses, 1 or 2 output hatches, and 10 or more pressure hull casings. A tungstensteel pipe casing column stands in the middle.')
    add('grindless.machine.slurry_separator.no_voiding', 'The separator keeps its diamonds and seeds. Disable voiding.')

    add('grindless.machine.flyby_probe_bay.tooltip.0', 'Launches a probe on Voyager 2\'s route to Neptune and Triton. Only works in Uranus orbit.')
    add('grindless.machine.flyby_probe_bay.tooltip.1', 'Circuit 1: Neptune flyby probe + silica aerogel -> Neptune probe recording + Neptune sample. Circuit 2: probe + aerogel + Titan entry probe (as the lander) -> Triton probe recording + 4,000 mB nitrogen. 122,880 EU/t (ZPM), 600 t.')
    add('grindless.machine.flyby_probe_bay.tooltip.2', 'Needs: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 or 2 output hatches, and 14 or more probe bay casings. A titanium launch rail runs through the middle.')
    add('grindless.machine.flyby_probe_bay.no_voiding', 'The bay keeps its recordings. Disable voiding.')
    add('emi.grindless.info.pressure_hull_casing.0', 'A thick-walled casing that holds out against the pressure of an ice giant. It builds the walls, roof and floor of the Ice-Giant Siphon and the Slurry Separator.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ice_giant_siphon', 'Sif\u00f3n de gigante de hielo')
    add('block.gtceu.slurry_separator', 'Separador de lodo')
    add('block.gtceu.flyby_probe_bay', 'Bah\u00eda de sondas de sobrevuelo')
    add('gtceu.ice_giant_siphon', 'Sifonado de gigante de hielo')
    add('gtceu.slurry_separation', 'Separaci\u00f3n de lodo')
    add('gtceu.outer_flyby', 'Sobrevuelo exterior')

    add('grindless.machine.ice_giant_siphon.tooltip.0', 'Baja un cazo con un cable a la atm\u00f3sfera de Urano. El modelo interior de Saturno (se conserva) le dice a qu\u00e9 profundidad. Solo funciona en la \u00f3rbita de Urano.')
    add('grindless.machine.ice_giant_siphon.tooltip.1', 'Circuito 1: 8 000 mB de hidr\u00f3geno de Urano + 2 000 mB de helio. 2: 4 000 mB de metano + 500 mB de sulfuro de hidr\u00f3geno. 3: 2 000 mB de lodo de diamante. 4: 1 botella de vidrio -> 1 muestra de atm\u00f3sfera de gigante de hielo. 122 880 EU/t (ZPM). El cabezal se desgasta (0,25 % por ciclo).')
    add('grindless.machine.ice_giant_siphon.tooltip.2', 'Necesita: 1 o 2 escotillas de energ\u00eda (ZPM), 1 o 2 buses de entrada, de 1 a 3 escotillas de salida y 14 o m\u00e1s carcasas de casco a presi\u00f3n en el suelo y las paredes. El cabestrante va en el centro.')
    add('grindless.machine.ice_giant_siphon.no_voiding', 'El sif\u00f3n conserva sus gases. Desactiva el descarte.')

    add('grindless.machine.slurry_separator.tooltip.0', 'Descomprime lodo de diamante en una cascada de ciclones. Solo funciona en la \u00f3rbita de Urano.')
    add('grindless.machine.slurry_separator.tooltip.1', '2 000 mB de lodo de diamante + 500 mB de sulfuro de hidr\u00f3geno -> 4 polvos de diamante + 1 semilla de diamante de gigante de hielo + 1 polvo de azufre + 500 mB de amon\u00edaco + 500 mB de agua. 122 880 EU/t (ZPM), 300 t.')
    add('grindless.machine.slurry_separator.tooltip.2', 'Necesita: 1 o 2 escotillas de energ\u00eda (ZPM), 1 o 2 buses de entrada, 1 o 2 escotillas de entrada, 1 o 2 buses de salida, 1 o 2 escotillas de salida y 10 o m\u00e1s carcasas de casco a presi\u00f3n. Una columna de carcasa de tuber\u00eda de acero de tungsteno va en el centro.')
    add('grindless.machine.slurry_separator.no_voiding', 'El separador conserva sus diamantes y semillas. Desactiva el descarte.')

    add('grindless.machine.flyby_probe_bay.tooltip.0', 'Lanza una sonda por la ruta de la Voyager 2 hacia Neptuno y Trit\u00f3n. Solo funciona en la \u00f3rbita de Urano.')
    add('grindless.machine.flyby_probe_bay.tooltip.1', 'Circuito 1: sonda de sobrevuelo de Neptuno + aerogel de s\u00edlice -> grabaci\u00f3n de sonda de Neptuno + muestra de Neptuno. Circuito 2: sonda + aerogel + sonda de entrada a Tit\u00e1n (como m\u00f3dulo) -> grabaci\u00f3n de sonda de Trit\u00f3n + 4 000 mB de nitr\u00f3geno. 122 880 EU/t (ZPM), 600 t.')
    add('grindless.machine.flyby_probe_bay.tooltip.2', 'Necesita: 1 o 2 escotillas de energ\u00eda (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida, 1 o 2 escotillas de salida y 14 o m\u00e1s carcasas de bah\u00eda de sondas. Un ra\u00edl de lanzamiento de titanio atraviesa el centro.')
    add('grindless.machine.flyby_probe_bay.no_voiding', 'La bah\u00eda conserva sus grabaciones. Desactiva el descarte.')
    add('emi.grindless.info.pressure_hull_casing.0', 'Una carcasa de paredes gruesas que resiste la presi\u00f3n de un gigante de hielo. Construye las paredes, el techo y el suelo del Sif\u00f3n de gigante de hielo y del Separador de lodo.')
})
