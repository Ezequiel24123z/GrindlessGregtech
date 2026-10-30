// priority: 5064
// Gregtech Grindless - names and tooltips of UEV's electron beam furnace and single-crystal foundry (startup_scripts/grindless/uev/electron_beam.js; package UEV-A4):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.electron_beam_furnace', 'Electron Beam Furnace', 'Horno de haz de electrones'],
        ['gtceu.electron_beam_refining', 'Electron Beam Refining', 'Refinado por haz de electrones'],
        ['block.gtceu.single_crystal_foundry', 'Single-Crystal Foundry', 'Fundición monocristalina'],
        ['gtceu.single_crystal_casting', 'Single-Crystal Casting', 'Colada monocristalina'],

        ['grindless.machine.electron_beam_furnace.tooltip.0',
            '§7Melts metal under an electron gun in hard vacuum to 6N purity.',
            '§7Funde metal bajo un cañón de electrones en vacío duro hasta pureza 6N.'],

        ['grindless.machine.single_crystal_foundry.tooltip.0',
            '§7Casts single-crystal blades and wheels in a withdrawal furnace.',
            '§7Cuela álabes y rodetes monocristalinos en un horno de extracción.'],
        ['grindless.machine.single_crystal_foundry.no_voiding',
            'Voiding is off: the gate and the dross must never be thrown away.',
            'El desecho está desactivado: la mazarota y la escoria nunca deben tirarse.'],

        ['gtceu.recipe.grindless_electron_beam.rhenium', 'Circuit 1: 6N rhenium; the hearth liner leaves a skull', 'Circuito 1: renio 6N; el revestimiento deja un casquete'],
        ['gtceu.recipe.grindless_electron_beam.hafnium', 'Circuit 2: 6N hafnium from the Kroll sponge', 'Circuito 2: hafnio 6N a partir de la esponja de Kroll'],
        ['gtceu.recipe.grindless_electron_beam.tantalum', 'Circuit 3: 6N tantalum from the sodium-reduced powder', 'Circuito 3: tántalo 6N a partir del polvo reducido con sodio'],
        ['gtceu.recipe.grindless_electron_beam.niobium_rrr', 'Circuit 4: RRR-grade niobium for superconducting cavities', 'Circuito 4: niobio de grado RRR para cavidades superconductoras'],
        ['gtceu.recipe.grindless_electron_beam.ysz_coating', 'Circuit 5: a YSZ thermal barrier on a bond-coated SX blade', 'Circuito 5: una barrera térmica de YSZ sobre un álabe SX con capa de unión'],
        ['gtceu.recipe.grindless_electron_beam.onion_carbon', 'Circuit 6: diamond dust annealed to onion carbon', 'Circuito 6: polvo de diamante recocido a carbono cebolla'],
        ['gtceu.recipe.grindless_single_crystal_casting.sx_blade', 'Circuit 1: an SX turbine blade; the argon is never used up', 'Circuito 1: un álabe de turbina SX; el argón nunca se gasta'],
        ['gtceu.recipe.grindless_single_crystal_casting.pump_impeller', 'Circuit 2: an SX pump impeller; the dross goes to the platinum plant', 'Circuito 2: un impulsor de bomba SX; la escoria va a la planta de platino'],
        ['gtceu.recipe.grindless_single_crystal_casting.turbine_wheel', 'Circuit 3: a Brayton turbine wheel from eight coated SX blades', 'Circuito 3: una rueda de turbina Brayton con ocho álabes SX recubiertos']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['six_n_hafnium', '6N Hafnium', 'Hafnio 6N', 'Hafnium refined to six nines.', 'Hafnio refinado a seis nueves.', 'Made only in the electron beam furnace (circuit 2).', 'Solo se fabrica en el horno de haz de electrones (circuito 2).'],
        ['six_n_tantalum', '6N Tantalum', 'Tántalo 6N', 'Tantalum refined to six nines.', 'Tántalo refinado a seis nueves.', 'Made only in the electron beam furnace (circuit 3).', 'Solo se fabrica en el horno de haz de electrones (circuito 3).'],
        ['six_n_niobium', '6N Niobium', 'Niobio 6N', 'RRR-grade niobium, clean enough for a superconducting cavity.', 'Niobio de grado RRR, lo bastante limpio para una cavidad superconductora.', 'Made only in the electron beam furnace (circuit 4).', 'Solo se fabrica en el horno de haz de electrones (circuito 4).'],
        ['six_n_rhenium', '6N Rhenium', 'Renio 6N', 'Rhenium refined to six nines.', 'Renio refinado a seis nueves.', 'Made only in the electron beam furnace (circuit 1) from Barnard\'s rhenium.', 'Solo se fabrica en el horno de haz de electrones (circuito 1) con el renio de Barnard.'],
        ['eb_skull', 'EB Skull', 'Casquete EB', 'Iridium-clad hearth liner scrap left by every refining.', 'Restos del revestimiento de iridio del crisol que deja cada refinado.', 'Goes back to iridium in the platinum plant (circuit 7).', 'Vuelve a iridio en la planta de platino (circuito 7).'],
        ['onion_carbon', 'Onion Carbon', 'Carbono cebolla', 'Nested fullerene shells, a dry lubricant and a spark source.', 'Capas de fullereno anidadas, lubricante seco y fuente de chispas.', 'Annealed from diamond dust in the electron beam furnace (circuit 6).', 'Se obtiene recociendo polvo de diamante en el horno de haz de electrones (circuito 6).'],
        ['zr_hf_chloride_dust', 'Zr-Hf Chloride Dust', 'Polvo de cloruro de Zr-Hf', 'Zircon chlorinated: zirconium and hafnium chloride together.', 'Circón clorado: cloruros de circonio y hafnio juntos.', 'Split in the extraction cascade (circuit 8).', 'Se separa en la cascada de extracción (circuito 8).'],
        ['zirconium_chloride_dust', 'Zirconium Chloride Dust', 'Polvo de cloruro de circonio', 'The zirconium cut of the cascade.', 'El corte de circonio de la cascada.', 'Hydrolysed to zirconia for the YSZ line.', 'Se hidroliza a circonia para la línea del YSZ.'],
        ['hafnium_chloride_dust', 'Hafnium Chloride Dust', 'Polvo de cloruro de hafnio', 'The hafnium cut of the cascade.', 'El corte de hafnio de la cascada.', 'Hydrolysed to hafnia in a chemical reactor.', 'Se hidroliza a hafnia en un reactor químico.'],
        ['hafnia_dust', 'Hafnia Dust', 'Polvo de hafnia', 'Hafnium oxide.', 'Óxido de hafnio.', 'Carbochlorinated to the tetrachloride.', 'Se carbocloruro al tetracloruro.'],
        ['hafnium_tetrachloride_dust', 'Hafnium Tetrachloride Dust', 'Polvo de tetracloruro de hafnio', 'Volatile and moisture-hungry.', 'Volátil y ávido de humedad.', 'Reduced with magnesium (Kroll) to a sponge.', 'Se reduce con magnesio (Kroll) a esponja.'],
        ['hafnium_sponge', 'Hafnium Sponge', 'Esponja de hafnio', 'Porous metal from the Kroll process.', 'Metal poroso del proceso Kroll.', 'Refined to 6N in the electron beam furnace (circuit 2).', 'Se refina a 6N en el horno de haz de electrones (circuito 2).'],
        ['tantalite_fluoride_cake', 'Tantalite Fluoride Cake', 'Torta de fluoruro de tantalita', 'Tantalite digested in hydrofluoric acid.', 'Tantalita digerida en ácido fluorhídrico.', 'Split into K2TaF7 and niobium oxyfluoride in the cascade (circuit 9).', 'Se separa en K2TaF7 y oxifluoruro de niobio en la cascada (circuito 9).'],
        ['k2taf7_dust', 'K2TaF7 Dust', 'Polvo de K2TaF7', 'Potassium heptafluorotantalate.', 'Heptafluorotantalato de potasio.', 'Reduced with sodium to tantalum powder.', 'Se reduce con sodio a polvo de tántalo.'],
        ['niobium_oxyfluoride_dust', 'Niobium Oxyfluoride Dust', 'Polvo de oxifluoruro de niobio', 'The niobium cut of the tantalite digest.', 'El corte de niobio de la digestión de tantalita.', 'Reduced with sodium to niobium powder.', 'Se reduce con sodio a polvo de niobio.'],
        ['tantalum_powder', 'Tantalum Powder', 'Polvo de tántalo', 'Sodium-reduced tantalum.', 'Tántalo reducido con sodio.', 'Refined to 6N in the electron beam furnace (circuit 3).', 'Se refina a 6N en el horno de haz de electrones (circuito 3).'],
        ['niobium_powder', 'Niobium Powder', 'Polvo de niobio', 'Sodium-reduced niobium.', 'Niobio reducido con sodio.', 'Refined to RRR grade in the electron beam furnace (circuit 4).', 'Se refina a grado RRR en el horno de haz de electrones (circuito 4).'],
        ['alkali_fluoride_dust', 'Alkali Fluoride Dust', 'Polvo de fluoruro alcalino', 'NaF and KF left by the sodium reductions.', 'NaF y KF que dejan las reducciones con sodio.', 'Returns to the fluorspar kiln as hydrofluoric acid.', 'Vuelve al horno de fluorita como ácido fluorhídrico.'],
        ['alkali_sulfate_dust', 'Alkali Sulfate Dust', 'Polvo de sulfato alcalino', 'Inert sodium and potassium sulfate.', 'Sulfato de sodio y potasio inerte.', 'The kiln\'s harmless leftover; safe to void.', 'El residuo inofensivo del horno; se puede desechar.'],
        ['yttrium_oxide_dust', 'Yttrium Oxide Dust', 'Polvo de óxido de itrio', 'Yttria from the rare-earth cascade.', 'Itria de la cascada de tierras raras.', 'Stabilises zirconia for the YSZ coating.', 'Estabiliza la circonia del recubrimiento YSZ.'],
        ['terbium_oxide_dust', 'Terbium Oxide Dust', 'Polvo de óxido de terbio', 'Terbia from the rare-earth cascade.', 'Terbia de la cascada de tierras raras.', 'Stripped in the extraction cascade (circuit 10).', 'Se extrae en la cascada de extracción (circuito 10).'],
        ['ysz_powder', 'YSZ Powder', 'Polvo de YSZ', 'Yttria-stabilised zirconia.', 'Circonia estabilizada con itria.', 'Pressed to an ingot in a compressor.', 'Se prensa a lingote en una compresora.'],
        ['ysz_ingot', 'YSZ Ingot', 'Lingote de YSZ', 'The target of the thermal barrier coating.', 'El blanco del recubrimiento de barrera térmica.', 'Evaporated onto SX blades in the electron beam furnace (circuit 5).', 'Se evapora sobre álabes SX en el horno de haz de electrones (circuito 5).'],
        ['sx_master_alloy_dust', 'SX Master Alloy Dust', 'Polvo de aleación madre SX', 'Nickel with rhenium, ruthenium and tantalum.', 'Níquel con renio, rutenio y tántalo.', 'Cast in the single-crystal foundry; gates are remelted into it.', 'Se cuela en la fundición monocristalina; las mazarotas se refunden en él.'],
        ['ceramic_shell_mould', 'Ceramic Shell Mould', 'Molde de cáscara cerámica', 'A zirconia-alumina investment shell with a grain selector.', 'Una cáscara de circonia y alúmina con selector de grano.', 'Fired shell stuccoed in an assembler (circuit 25); one per casting.', 'Cáscara cocida y estucada en un ensamblador (circuito 25); uno por colada.'],
        ['ceramic_slurry', 'Ceramic Slurry', 'Barbotina cerámica', 'Yttria-stabilised zirconia and sapphire grain in a polyvinyl butyral binder.', 'Grano de circonia estabilizada con itria y zafiro en un aglutinante de butiral de polivinilo.', 'Mixed (circuit 1); dipped onto a polyethylene pattern in the mixer (circuit 2).', 'Se mezcla (circuito 1); se moldea sobre un patrón de polietileno en la mezcladora (circuito 2).'],
        ['green_ceramic_shell', 'Green Ceramic Shell', 'Cáscara cerámica verde', 'Unfired shell with the polyethylene pattern still inside.', 'Cáscara sin cocer con el patrón de polietileno aún dentro.', 'Fired in the blast furnace with oxygen (circuit 1); the pattern burns out as carbon dioxide.', 'Se cuece en el horno alto con oxígeno (circuito 1); el patrón se quema como dióxido de carbono.'],
        ['fired_ceramic_shell', 'Fired Ceramic Shell', 'Cáscara cerámica cocida', 'Sintered shell, hollow where the pattern was.', 'Cáscara sinterizada, hueca donde estaba el patrón.', 'Stuccoed into a mould in an assembler (circuit 25).', 'Se estuca hasta molde en un ensamblador (circuito 25).'],
        ['sx_gate', 'SX Gate', 'Mazarota SX', 'The runner left on a casting.', 'El bebedero que queda en una pieza colada.', 'Remelted to master alloy in a macerator.', 'Se refunde a aleación madre en un pulverizador.'],
        ['sx_dross', 'SX Dross', 'Escoria SX', 'Oxide skin with ruthenium and nickel.', 'Película de óxido con rutenio y níquel.', 'Goes to the platinum plant (circuit 6).', 'Va a la planta de platino (circuito 6).'],
        ['heat_treated_sx_blade', 'Heat-Treated SX Blade', 'Álabe SX tratado térmicamente', 'Solution-treated and aged to precipitate gamma prime.', 'Tratado en solución y envejecido para precipitar gamma prima.', 'Next: a bond coat in an assembler (circuit 26).', 'Siguiente: una capa de unión en un ensamblador (circuito 26).'],
        ['bond_coated_sx_blade', 'Bond-Coated SX Blade', 'Álabe SX con capa de unión', 'A platinum-aluminide bond coat.', 'Una capa de unión de aluminuro de platino.', 'Next: the YSZ coating in the electron beam furnace.', 'Siguiente: el recubrimiento YSZ en el horno de haz de electrones.'],
        ['coated_sx_blade', 'Coated SX Blade', 'Álabe SX recubierto', 'Columnar YSZ over the bond coat.', 'YSZ columnar sobre la capa de unión.', 'Eight go into a Brayton turbine wheel.', 'Ocho forman una rueda de turbina Brayton.'],
        ['sx_pump_impeller', 'SX Pump Impeller', 'Impulsor de bomba SX', 'A single-crystal impeller for hot loops.', 'Un impulsor monocristalino para circuitos calientes.', 'Cast only in the single-crystal foundry (circuit 2).', 'Solo se cuela en la fundición monocristalina (circuito 2).'],
        ['brayton_turbine_wheel', 'Brayton Turbine Wheel', 'Rueda de turbina Brayton', 'Eight coated SX blades on one disc.', 'Ocho álabes SX recubiertos en un disco.', 'Cast only in the single-crystal foundry (circuit 3).', 'Solo se cuela en la fundición monocristalina (circuito 3).'],
        ['nb3sn_srf_cavity', 'Nb3Sn SRF Cavity', 'Cavidad SRF de Nb3Sn', 'A niobium cavity coated with Nb3Sn by tin vapour diffusion.', 'Una cavidad de niobio recubierta de Nb3Sn por difusión de vapor de estaño.', 'Made in the SRF cavity works (circuit 5).', 'Se fabrica en la planta de cavidades SRF (circuito 5).']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ENTRIES.push(['material.gtceu.rhenium', 'Rhenium', 'Renio'])

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
