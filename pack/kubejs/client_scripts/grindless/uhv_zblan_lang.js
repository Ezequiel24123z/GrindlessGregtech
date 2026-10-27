// Gregtech Grindless - names and tooltips of UHV's ZBLAN draw tower (startup_scripts/grindless/uhv/zblan.js):
//
//   gtceu:zblan_draw_tower          machine name + four tooltip lines
//   gtceu:zblan_draw                recipe type name
//   grindless:zblan_preform         name + two tooltip lines
//   gtceu:zirconium_tetrafluoride   material.gtceu.<n>
(function () {
    var TEXT = {
        en_us: {
            tower: 'ZBLAN Draw Tower',
            towerType: 'ZBLAN Draw',
            towerTips: [
                'Fluoride glass that crystallises when drawn under gravity: Earth orbit only. Programmed circuit 1: zirconium tetrafluoride + barium + lanthanum + aluminium + sodium + quicklime + hydrogen fluoride -> 1 ZBLAN preform.',
                'Circuit 2: 1 ZBLAN preform -> 8 ZBLAN fibre spools.',
                'The metals are fluorinated in the melt by hydrogen fluoride; the off-gas is caught by the quicklime as fluorite, which goes back to the fluorspar kiln. The hydrogen and water come out as fluids.',
                'Needs a 3 x 11 x 3 clean room casing tower under a station truss roof (3 or more casings among the floor parts), 1 or 2 energy hatches, input and output buses and hatches.'
            ],
            items: {
                zblan_preform: ['ZBLAN Preform', 'A rod of zirconium, barium, lanthanum, aluminium and sodium fluoride glass, ready to draw.', 'Made in the ZBLAN Draw Tower (circuit 1), in Earth orbit.']
            },
            materials: {
                zirconium_tetrafluoride: 'Zirconium Tetrafluoride'
            }
        },
        es_es: {
            tower: 'Torre de Estirado de ZBLAN',
            towerType: 'Estirado de ZBLAN',
            towerTips: [
                'Vidrio de fluoruros que cristaliza si se estira con gravedad: solo en la órbita terrestre. Circuito programado 1: tetrafluoruro de circonio + bario + lantano + aluminio + sodio + cal viva + fluoruro de hidrógeno -> 1 preforma de ZBLAN.',
                'Circuito 2: 1 preforma de ZBLAN -> 8 bobinas de fibra de ZBLAN.',
                'Los metales se fluoran en el fundido con fluoruro de hidrógeno; la cal viva atrapa el gas residual como fluorita, que vuelve al horno de fluorita. El hidrógeno y el agua salen como fluidos.',
                'Necesita una torre de 3 x 11 x 3 de carcasa de sala limpia bajo un techo de armazón de estación (3 o más carcasas entre las partes del suelo), 1 o 2 escotillas de energía, buses y escotillas de entrada y salida.'
            ],
            items: {
                zblan_preform: ['Preforma de ZBLAN', 'Una varilla de vidrio de fluoruros de circonio, bario, lantano, aluminio y sodio, lista para estirar.', 'Se fabrica en la Torre de Estirado de ZBLAN (circuito 1), en la órbita terrestre.']
            },
            materials: {
                zirconium_tetrafluoride: 'Tetrafluoruro de Circonio'
            }
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.zblan_draw_tower', t.tower)
            add('gtceu.zblan_draw', t.towerType)
            for (var i = 0; i < 4; i++) add('grindless.machine.zblan_draw_tower.tooltip.' + i, t.towerTips[i])
            Object.keys(t.items).forEach(function (name) {
                add('item.grindless.' + name, t.items[name][0])
                add('tooltip.grindless.' + name + '.0', t.items[name][1])
                add('tooltip.grindless.' + name + '.1', t.items[name][2])
            })
            Object.keys(t.materials).forEach(function (name) { add('material.gtceu.' + name, t.materials[name]) })
        })
    })
})()
