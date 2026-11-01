// priority: 6990
// MAX+ machine 17, the Hyperstargate: names, tooltips, controller lines and recipe info (package XP-G1). English only.
ClientEvents.lang('en_us', function (e) {
  var L = function (k, v) { e.add('grindless', k, v) }
  L('gtceu.hyperstargate_dial', 'Hyperstargate Dial')
  L('block.gtceu.hyperstargate', 'Hyperstargate')
  L('item.grindless.spent_dial_charge', 'Spent Dial Charge')
  L('tooltip.grindless.spent_dial_charge.0', 'What a dial leaves of its condensate cells.')
  L('tooltip.grindless.spent_dial_charge.1', 'Recharged in the Condensate Refinery.')
  L('grindless.machine.hyperstargate.tooltip.0', 'A ring of 160 cells stands upright; the dial opens its plane for a few minutes.')
  L('grindless.machine.hyperstargate.tooltip.1', 'A dial draws 2^43 EU/t from one 4,096 A wireless hatch and needs one full dial in the banks.')
  L('grindless.machine.hyperstargate.open', 'The gate is open.')
  L('grindless.machine.hyperstargate.network', 'A dial needs %s EU; the banks hold up to %s, stored %s.')
  L('grindless.machine.hyperstargate.refused.structure', 'Dial refused: the structure is broken.')
  L('grindless.machine.hyperstargate.refused.no_network', 'Dial refused: there is no wireless network.')
  L('grindless.machine.hyperstargate.refused.bank', 'Dial refused: the banks hold up to %s EU, a dial needs %s.')
  L('grindless.machine.hyperstargate.refused.charge', 'Dial refused: %s EU stored, %s more needed.')
  L('gtceu.recipe.grindless_hyper_assembly_array.hyperstargate', 'The Hyperstargate controller.')
  L('gtceu.recipe.grindless_hyperstargate_dial.dial', 'One dial: the lock is kept, the cells are spent.')
  L('gtceu.recipe.grindless_condensate_refinery.recharge_dial_charge', 'Sixteen of the 64 cells are lost to the dial.')
})
