// priority: -4655
// LuV living-circuit line L2 (package D2-MEA, docs/eras/lines-ev-zpm.md section 4): the PEDOT:PSS microelectrode array the neural processing unit takes.
// Recipes: server_scripts/grindless/luv/pedot_mea.js. Names: client_scripts/grindless/luv_pedot_mea_lang.js.
(function () {
  var G = global.grindless
  var MEA = G.pedotMea || (G.pedotMea = {})

  MEA.items = ['grindless:pedot_microelectrode_array']

  StartupEvents.registry('item', function (event) {
    event.create('grindless:pedot_microelectrode_array')
      .texture('grindless:item/pedot_microelectrode_array')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.pedot_microelectrode_array.0')))
  })
})()
