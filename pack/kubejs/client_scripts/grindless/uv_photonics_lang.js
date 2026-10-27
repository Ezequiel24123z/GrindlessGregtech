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
                'Ytterbium-doped double-clad fibre and the fibre laser module, the light source of UV\'s lasers. Programmed circuit 1: silicon tetrachloride + germanium tetrachloride + ytterbium oxide + aluminium + oxygen -> 1 Yb-doped preform (MCVD).',
                'Circuit 2: 1 preform + 250 mB acrylate coating -> 16 ytterbium fibre spools. Circuit 3: 4 fibre spools + 4 InGaAs pump modules + 1 fibre Bragg grating -> 1 fibre laser module.',
                'Circuit 4: 1 spent laser module + 1 fibre spool -> 1 fibre laser module (refurbished). The chlorine goes back to silicon tetrachloride, the silica soot to glass.',
                'Needs a 5 x 15 x 5 clean room casing tower (6 or more among the floor parts), 1 or 2 energy hatches (UV), input and output buses and hatches.'
            ],
            reactorTips: [
                'Compound semiconductors grown atom layer by atom layer. Circuit 1: gallium + indium + sodium + chloromethane -> trimethylgallium + trimethylindium + salt.',
                'Circuit 2: 1 GaAs wafer + trimethylgallium + trimethylindium + arsine -> 1 InGaAs epi wafer + methane + unused arsine. Circuit 3: 1 epi wafer -> 8 diode bars. Circuit 5: 4 diode bars + 2 copper plates -> 1 InGaAs pump module.',
                'Circuit 4: 1 sapphire wafer + niobium + nitrogen -> 1 NbN film wafer. Circuit 6, the arsine scrubber: 1,000 mB arsine -> 1 arsenic dust + 3,000 mB hydrogen. Arsine is never vented.',
                'Needs 7 x 7 x 7 clean room casing with an inert gas cabinet (8 or more among the parts), 1 or 2 energy hatches (UV), input and output buses and hatches.'
            ],
            items: {
                yb_doped_preform: ['Yb-Doped Preform', 'A silica rod with an ytterbium-doped core, built up layer by layer inside a turning tube.', 'Made in the Fibre Draw Tower (circuit 1).'],
                fibre_bragg_grating: ['Fibre Bragg Grating', 'A mirror written into the fibre core by a laser: it closes the laser cavity.', 'Made in a laser engraver from a fibre spool (purple lens).'],
                gallium_arsenide_boule: ['Gallium Arsenide Boule', 'A single crystal of gallium arsenide grown under argon.', 'Made in an electric blast furnace (circuit 6).'],
                gallium_arsenide_wafer: ['Gallium Arsenide Wafer', 'The substrate the InGaAs layers grow on.', 'Cut from a gallium arsenide boule.'],
                sapphire_boule: ['Sapphire Boule', 'A single crystal of sapphire grown from the melt under argon.', 'Made in an electric blast furnace from a sapphire block.'],
                sapphire_wafer: ['Sapphire Wafer', 'The substrate of the niobium nitride film.', 'Cut from a sapphire boule.'],
                ingaas_epi_wafer: ['InGaAs Epi Wafer', 'Indium gallium arsenide quantum wells grown on gallium arsenide.', 'Made in the MOCVD Reactor (circuit 2).'],
                ingaas_diode_bar: ['InGaAs Diode Bar', 'A cleaved bar of laser diodes that pump the ytterbium fibre at 976 nm.', 'Made in the MOCVD Reactor (circuit 3).'],
                nbn_film_wafer: ['NbN Film Wafer', 'A few nanometres of niobium nitride on sapphire, the material of single-photon detectors.', 'Made in the MOCVD Reactor (circuit 4).']
            },
            materials: {
                germanium_tetrachloride: 'Germanium Tetrachloride', trimethylgallium: 'Trimethylgallium', trimethylindium: 'Trimethylindium',
                acrylate_coating: 'Acrylate Coating', ytterbium_oxide: 'Ytterbium Oxide'
            }
        },
        es_es: {
            tower: 'Torre de Estirado de Fibra', reactor: 'Reactor MOCVD',
            towerType: 'Estirado de fibra', reactorType: 'MOCVD',
            towerTips: [
                'Fibra de doble revestimiento dopada con iterbio y el modulo laser de fibra, la fuente de luz de los laseres de UV. Circuito programado 1: tetracloruro de silicio + tetracloruro de germanio + oxido de iterbio + aluminio + oxigeno -> 1 preforma dopada con Yb (MCVD).',
                'Circuito 2: 1 preforma + 250 mB de recubrimiento de acrilato -> 16 bobinas de fibra de iterbio. Circuito 3: 4 bobinas de fibra + 4 modulos de bombeo InGaAs + 1 red de Bragg en fibra -> 1 modulo laser de fibra.',
                'Circuito 4: 1 modulo laser gastado + 1 bobina de fibra -> 1 modulo laser de fibra (reacondicionado). El cloro vuelve a tetracloruro de silicio y el hollin de silice a vidrio.',
                'Necesita una torre de carcasa de sala limpia de 5 x 15 x 5 (6 o mas entre las piezas del suelo), 1 o 2 hatches de energia (UV), buses y hatches de entrada y salida.'
            ],
            reactorTips: [
                'Semiconductores compuestos crecidos capa atomica a capa atomica. Circuito 1: galio + indio + sodio + clorometano -> trimetilgalio + trimetilindio + sal.',
                'Circuito 2: 1 oblea de GaAs + trimetilgalio + trimetilindio + arsina -> 1 oblea epitaxial de InGaAs + metano + arsina sin usar. Circuito 3: 1 oblea epitaxial -> 8 barras de diodos. Circuito 5: 4 barras de diodos + 2 placas de cobre -> 1 modulo de bombeo InGaAs.',
                'Circuito 4: 1 oblea de zafiro + niobio + nitrogeno -> 1 oblea con pelicula de NbN. Circuito 6, el depurador de arsina: 1.000 mB de arsina -> 1 polvo de arsenico + 3.000 mB de hidrogeno. La arsina nunca se ventila.',
                'Necesita carcasa de sala limpia de 7 x 7 x 7 con un armario de gases inerte (8 o mas entre las piezas), 1 o 2 hatches de energia (UV), buses y hatches de entrada y salida.'
            ],
            items: {
                yb_doped_preform: ['Preforma dopada con Yb', 'Una barra de silice con nucleo dopado con iterbio, depositada capa a capa dentro de un tubo que gira.', 'Se hace en la Torre de Estirado de Fibra (circuito 1).'],
                fibre_bragg_grating: ['Red de Bragg en fibra', 'Un espejo escrito con laser en el nucleo de la fibra: cierra la cavidad del laser.', 'Se hace en un grabador laser con una bobina de fibra (lente morada).'],
                gallium_arsenide_boule: ['Lingote de arseniuro de galio', 'Un monocristal de arseniuro de galio crecido bajo argon.', 'Se hace en un alto horno electrico (circuito 6).'],
                gallium_arsenide_wafer: ['Oblea de arseniuro de galio', 'El sustrato sobre el que crecen las capas de InGaAs.', 'Se corta de un lingote de arseniuro de galio.'],
                sapphire_boule: ['Lingote de zafiro', 'Un monocristal de zafiro crecido desde el fundido bajo argon.', 'Se hace en un alto horno electrico con un bloque de zafiro.'],
                sapphire_wafer: ['Oblea de zafiro', 'El sustrato de la pelicula de nitruro de niobio.', 'Se corta de un lingote de zafiro.'],
                ingaas_epi_wafer: ['Oblea epitaxial de InGaAs', 'Pozos cuanticos de arseniuro de indio y galio crecidos sobre arseniuro de galio.', 'Se hace en el Reactor MOCVD (circuito 2).'],
                ingaas_diode_bar: ['Barra de diodos InGaAs', 'Una barra cortada de diodos laser que bombean la fibra de iterbio a 976 nm.', 'Se hace en el Reactor MOCVD (circuito 3).'],
                nbn_film_wafer: ['Oblea con pelicula de NbN', 'Unos nanometros de nitruro de niobio sobre zafiro, el material de los detectores de fotones individuales.', 'Se hace en el Reactor MOCVD (circuito 4).']
            },
            materials: {
                germanium_tetrachloride: 'Tetracloruro de germanio', trimethylgallium: 'Trimetilgalio', trimethylindium: 'Trimetilindio',
                acrylate_coating: 'Recubrimiento de acrilato', ytterbium_oxide: 'Oxido de iterbio'
            }
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.fibre_draw_tower', t.tower)
            add('block.gtceu.mocvd_reactor', t.reactor)
            add('gtceu.fibre_draw', t.towerType)
            add('gtceu.mocvd', t.reactorType)
            for (var i = 0; i < 4; i++) {
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
    })
})()
