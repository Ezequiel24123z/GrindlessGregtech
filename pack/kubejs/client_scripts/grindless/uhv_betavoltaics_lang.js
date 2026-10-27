// priority: 4900
// Gregtech Grindless - names and tooltips of UHV's water and betavoltaics (startup_scripts/grindless/uhv/betavoltaics.js; package UHV-A3):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the fab's refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe of the two new machines
//   item.grindless.diamond_diode, tooltip.grindless.diamond_diode.N   the p-i-n diamond diode
//   material.gtceu.<n>                                            the new GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.ultrapure_water_plant', 'Ultrapure Water Plant', 'Planta de agua ultrapura'],
        ['gtceu.ultrapure_water', 'Ultrapure Water', 'Agua ultrapura'],
        ['block.gtceu.betavoltaic_fab', 'Betavoltaic Fab', 'Fábrica betavoltaica'],
        ['gtceu.betavoltaic', 'Betavoltaic Fabrication', 'Fabricación betavoltaica'],

        ['grindless.machine.ultrapure_water_plant.tooltip.0',
            'A semiconductor fab\'s water train: PTFE pipe racks, reverse osmosis filters and an ion exchange bed. Plain water goes in; water for the UHV processes comes out.',
            'El tren de agua de una fábrica de semiconductores: bastidores de tubería de PTFE, filtros de ósmosis inversa y un lecho de intercambio iónico. Entra agua corriente; sale agua para los procesos de UHV.'],
        ['grindless.machine.ultrapure_water_plant.tooltip.1',
            'The resin is kept; hydrochloric acid and sodium hydroxide regenerate it. The reverse osmosis concentrate leaves as salt water. It is the only source of ultrapure water.',
            'La resina se conserva; el ácido clorhídrico y el hidróxido de sodio la regeneran. El concentrado de la ósmosis inversa sale como agua salada. Es la única fuente de agua ultrapura.'],
        ['grindless.machine.ultrapure_water_plant.tooltip.2',
            'Parts in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output hatches, and one parallel hatch if you want.',
            'Partes en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, 1-2 escotillas de salida y, si se quiere, una escotilla paralela.'],

        ['grindless.machine.betavoltaic_fab.tooltip.0',
            'A shielded plating line: nickel-63 is dissolved and plated onto diamond diodes, which turn its beta decay into a trickle of current for decades.',
            'Una línea de chapado blindada: el níquel-63 se disuelve y se deposita sobre diodos de diamante, que convierten su desintegración beta en un hilo de corriente durante décadas.'],
        ['grindless.machine.betavoltaic_fab.tooltip.1',
            'Circuit 1: nickel-63 targets in nitric acid to plating liquor. 2: the liquor and eight diamond diodes to eight cells. 3: the spent bath stripped back to nitric acid and nickel.',
            'Circuito 1: blancos de níquel-63 en ácido nítrico a licor de chapado. 2: el licor y ocho diodos de diamante a ocho celdas. 3: el baño gastado se recupera como ácido nítrico y níquel.'],
        ['grindless.machine.betavoltaic_fab.tooltip.2',
            'Parts in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, an output bus, an output hatch.',
            'Partes en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, un bus de salida, una escotilla de salida.'],
        ['grindless.machine.betavoltaic_fab.no_voiding',
            'Voiding is off: the nickel-63 baths are radioactive and must never be thrown away.',
            'El desecho está desactivado: los baños de níquel-63 son radiactivos y nunca deben tirarse.'],

        ['gtceu.recipe.grindless_ultrapure_water.ultrapure_water',
            'Circuit 1: reverse osmosis and ion exchange; the concentrate leaves as salt water',
            'Circuito 1: ósmosis inversa e intercambio iónico; el concentrado sale como agua salada'],
        ['gtceu.recipe.grindless_betavoltaic.plating_liquor',
            'Circuit 1: nickel-63 targets dissolved into plating liquor',
            'Circuito 1: blancos de níquel-63 disueltos en licor de chapado'],
        ['gtceu.recipe.grindless_betavoltaic.betavoltaic_cell',
            'Circuit 2: nickel-63 plated onto eight diamond diodes',
            'Circuito 2: níquel-63 depositado sobre ocho diodos de diamante'],
        ['gtceu.recipe.grindless_betavoltaic.strip_bath',
            'Circuit 3: the spent bath back to nitric acid; the nickel-62 left over goes to the hot cell',
            'Circuito 3: el baño gastado vuelve a ácido nítrico; el níquel-62 sobrante va a la celda caliente'],

        ['item.grindless.diamond_diode', 'Diamond Diode', 'Diodo de diamante'],
        ['tooltip.grindless.diamond_diode.0',
            'A p-i-n junction grown on CVD diamond: boron on one side, phosphorus on the other.',
            'Una unión p-i-n crecida sobre diamante CVD: boro de un lado, fósforo del otro.'],
        ['tooltip.grindless.diamond_diode.1',
            'Diamond lattice fab, circuit 5. Takes nickel-63 in the betavoltaic fab.',
            'Fábrica de red de diamante, circuito 5. Recibe níquel-63 en la fábrica betavoltaica.'],

        ['material.gtceu.carbon_12_monoxide', 'Carbon-12 Monoxide', 'Monóxido de carbono-12'],
        ['material.gtceu.carbon_12_methane', 'Carbon-12 Methane', 'Metano de carbono-12'],
        ['material.gtceu.nickel_63_plating_liquor', 'Nickel-63 Plating Liquor', 'Licor de chapado de níquel-63'],
        ['material.gtceu.depleted_nickel_plating_liquor', 'Depleted Nickel Plating Liquor', 'Licor de chapado de níquel agotado']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
