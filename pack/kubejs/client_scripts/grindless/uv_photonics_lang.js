// priority: 2200
// Gregtech Grindless - names and tooltips of UV's photonics (startup_scripts/grindless/uv/photonics.js):
//
//   gtceu:fibre_draw_tower / gtceu:mocvd_reactor   machine names + four tooltip lines each
//   gtceu:fibre_draw / gtceu:mocvd                 recipe type names
//   grindless:yb_doped_preform / fibre_bragg_grating / gallium_arsenide_boule / gallium_arsenide_wafer / sapphire_boule /
//   sapphire_wafer / ingaas_epi_wafer / ingaas_diode_bar / nbn_film_wafer   names + two tooltip lines each
//   gtceu:germanium_tetrachloride / trimethylgallium / trimethylindium / acrylate_coating   material.gtceu.<n>
//   gtceu:ytterbium_oxide   material.gtceu.<n> (registered by startup_scripts/grindless/ev/extraction_cascade.js for the Yb strip)
(function () {
    var TEXT = {
        en_us: {
            tower: 'Fibre Draw Tower', reactor: 'MOCVD Reactor',
            towerType: 'Fibre Draw', reactorType: 'MOCVD',
            towerTips: [
                '§7Draws Yb-doped fibre and fibre laser modules.'
            ],
            reactorTips: [
                '§7Grows compound semiconductors layer by layer.'
            ],
            items: {
                yb_doped_preform: ['Yb-Doped Preform', 'A silica rod with an ytterbium-doped core, collapsed from a doped soot tube.', 'Made in the Fibre Draw Tower (circuit 1).'],
                mcvd_soot_tube: ['MCVD Soot Tube', 'A fused silica tube with germanium-silica soot laid inside it layer by layer.', 'Made in the Fibre Draw Tower (circuit 12).'],
                doped_soot_tube: ['Doped Soot Tube', 'A soot tube soaked in ytterbium chloride solution: the rare earth sits in the porous soot.', 'Made in the Fibre Draw Tower (circuit 13).'],
                coated_diode_bar: ['Coated Diode Bar', 'A diode bar with a high-reflection mirror on one facet and an anti-reflection coating on the other.', 'Made in the MOCVD Reactor (circuit 31).'],
                fibre_bragg_grating: ['Fibre Bragg Grating', 'A mirror written into the fibre core by a laser: it closes the laser cavity.', 'Made in a laser engraver from a fibre spool (purple lens).'],
                gallium_arsenide_boule: ['Gallium Arsenide Boule', 'A single crystal of gallium arsenide grown under argon.', 'Made in an electric blast furnace (circuit 6).'],
                gallium_arsenide_wafer: ['Gallium Arsenide Wafer', 'The substrate the InGaAs layers grow on.', 'Cut from a gallium arsenide boule.'],
                sapphire_boule: ['Sapphire Boule', 'A single crystal of sapphire grown from the melt under argon.', 'Made in an electric blast furnace from a sapphire block.'],
                sapphire_wafer: ['Sapphire Wafer', 'The substrate of the niobium nitride film.', 'Cut from a sapphire boule.'],
                ingaas_epi_wafer: ['InGaAs Epi Wafer', 'Indium gallium arsenide quantum wells grown on gallium arsenide.', 'Made in the MOCVD Reactor (circuit 2).'],
                ingaas_diode_bar: ['InGaAs Diode Bar', 'A cleaved bar of laser diodes that pump the ytterbium fibre at 976 nm.', 'Made in the MOCVD Reactor (circuit 3). Facet-coated before it is mounted.'],
                nbn_film_wafer: ['NbN Film Wafer', 'A few nanometres of niobium nitride on sapphire, the material of single-photon detectors.', 'Made in the MOCVD Reactor (circuit 4).']
            },
            materials: {
                germanium_tetrachloride: 'Germanium Tetrachloride', trimethylgallium: 'Trimethylgallium', trimethylindium: 'Trimethylindium',
                acrylate_coating: 'Acrylate Coating', ytterbium_oxide: 'Ytterbium Oxide', ytterbium_chloride_solution: 'Ytterbium Chloride Solution'
            }
        }
    }

    ClientEvents.lang('en_us', function (event) {
        var t = TEXT.en_us
        var add = function (key, value) { event.add('grindless', key, value) }

        add('block.gtceu.fibre_draw_tower', t.tower)
        add('block.gtceu.mocvd_reactor', t.reactor)
        add('gtceu.fibre_draw', t.towerType)
        add('gtceu.mocvd', t.reactorType)
        for (var i = 0; i < 1; i++) {
            add('grindless.machine.fibre_draw_tower.tooltip.' + i, t.towerTips[i])
            add('grindless.machine.mocvd_reactor.tooltip.' + i, t.reactorTips[i])
        }
        Object.keys(t.items).forEach(function (name) {
            add('item.grindless.' + name, t.items[name][0])
            add('tooltip.grindless.' + name + '.0', t.items[name][1])
            add('tooltip.grindless.' + name + '.1', t.items[name][2])
        })
        Object.keys(t.materials).forEach(function (name) { add('material.gtceu.' + name, t.materials[name]) })
    })
})()
