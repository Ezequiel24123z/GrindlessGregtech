// priority: 5038
// Gregtech Grindless - names and tooltips of UEV's helium-3 polariser, Mk4 fusion ring and fusion materials (startup_scripts/grindless/uev/fusion.js; package UEV-A7):
//
//   block.gtceu.<machine>, gtceu.<recipe type>      machine and recipe type names
//   grindless.machine.<machine>.tooltip.N           controller tooltips
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1  the package's own items
//   material.gtceu.<n>                              the package's gases (6N helium-3, polarised helium-3, helium-4 ash, three plasmas, BF3)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.helium3_polariser', 'Helium-3 Polariser', 'Polarizador de helio-3'],
        ['block.gtceu.uev_fusion_reactor', 'Mk4 Fusion Reactor', 'Reactor de fusi\u00f3n Mk4'],
        ['gtceu.spin_polarisation', 'Spin Polarisation', 'Polarizaci\u00f3n de esp\u00edn'],
        ['grindless.machine.helium3_polariser.tooltip.0', 'Optical pumping at 1,083 nm aligns the nuclear spins of 6N helium-3.', 'El bombeo \u00f3ptico a 1.083 nm alinea los espines nucleares del helio-3 6N.'],
        ['grindless.machine.helium3_polariser.tooltip.1', 'Circuit 1 polarises the gas; circuit 2 mixes it with deuterium into polarised fuel.', 'El circuito 1 polariza el gas; el circuito 2 lo mezcla con deuterio en combustible polarizado.'],
        ['grindless.machine.helium3_polariser.tooltip.2', 'The 1,083 nm laser is a tool: it is never consumed. Depolarised gas goes back to the cryogenic plant.', 'El l\u00e1ser de 1.083 nm es una herramienta: no se consume. El gas despolarizado vuelve a la planta criog\u00e9nica.'],
        ['grindless.machine.uev_fusion_reactor.tooltip.0', 'A tier 10 fusion ring: its energy buffer is far beyond the int range.', 'Un anillo de fusi\u00f3n de nivel 10: su b\u00fafer de energ\u00eda supera con mucho el rango de un entero.'],
        ['grindless.machine.uev_fusion_reactor.tooltip.1', 'Runs D-He-3, p-11B and polarised D-He-3, each from one premixed fuel fluid.', 'Ejecuta D-He-3, p-11B y D-He-3 polarizado, cada uno con un \u00fanico fluido de combustible premezclado.'],
        ['grindless.machine.uev_fusion_reactor.tooltip.2', 'Polarised fuel makes 1.5 times the plasma. The plasma feeds the direct energy converter.', 'El combustible polarizado da 1,5 veces m\u00e1s plasma. El plasma alimenta el conversor directo de energ\u00eda.'],
        ['material.gtceu.helium_3_6n', '6N Helium-3', 'Helio-3 6N'],
        ['material.gtceu.polarised_helium_3', 'Polarised Helium-3', 'Helio-3 polarizado'],
        ['material.gtceu.helium_4_ash', 'Helium-4 Ash', 'Ceniza de helio-4'],
        ['material.gtceu.uev_dhe3_plasma', 'D-He-3 Plasma', 'Plasma de D-He-3'],
        ['material.gtceu.uev_pb11_plasma', 'p-11B Plasma', 'Plasma de p-11B'],
        ['material.gtceu.uev_polarised_plasma', 'Polarised D-He-3 Plasma', 'Plasma de D-He-3 polarizado'],
        ['material.gtceu.boron_trifluoride', 'Boron Trifluoride', 'Trifluoruro de boro']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['boron_11_powder', 'Boron-11 Powder', 'Polvo de boro-11', 'Boron enriched in its 11 isotope.', 'Boro enriquecido en el is\u00f3topo 11.', 'Mixed with hydrogen into p-11B fuel.', 'Se mezcla con hidr\u00f3geno en combustible p-11B.'],
        ['laser_1083nm', '1,083 nm Laser', 'L\u00e1ser de 1.083 nm', 'A Yb fibre laser tuned to the helium metastable line.', 'Un l\u00e1ser de fibra de Yb sintonizado a la l\u00ednea metaestable del helio.', 'A tool of the helium-3 polariser: never consumed.', 'Herramienta del polarizador de helio-3: no se consume.']
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
