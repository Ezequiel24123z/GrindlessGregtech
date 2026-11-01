// priority: 3400
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
            towerTip: '§7Draws ZBLAN fluoride glass into fibre in microgravity.',
            towerSite: 'Works in Earth orbit only.',
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
        }
    }

    ClientEvents.lang('en_us', function (event) {
        var t = TEXT.en_us
        var add = function (key, value) { event.add('grindless', key, value) }

        add('block.gtceu.zblan_draw_tower', t.tower)
        add('gtceu.zblan_draw', t.towerType)
        for (var i = 0; i < 4; i++) add('emi.grindless.info.zblan_draw_tower.' + (2 + i), t.towerTips[i])
        add('grindless.machine.zblan_draw_tower.tooltip.0', t.towerTip)
        add('grindless.machine.zblan_draw_tower.tooltip.1', t.towerSite)
        Object.keys(t.items).forEach(function (name) {
            add('item.grindless.' + name, t.items[name][0])
            add('tooltip.grindless.' + name + '.0', t.items[name][1])
            add('tooltip.grindless.' + name + '.1', t.items[name][2])
        })
        Object.keys(t.materials).forEach(function (name) { add('material.gtceu.' + name, t.materials[name]) })
    })
})()
