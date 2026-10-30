(function () {
  var G = global.grindless
  var A = G.antimatterCygnus
  var LOG = '[grindless/opv/antimatter_cygnus] '
  function list(r, k) { return r[k] || [] }
  function requireItem(s) {
    var id = s.replace(/^\d+x /, '')
    if (!Item.exists(id)) throw new Error('unknown item ' + id)
  }
  function requireFluid(f) {
    if (!Fluid.exists(f.id)) throw new Error('unknown fluid ' + f.id)
  }
  ServerEvents.recipes(function (event) {
    A.recipes = []
    A.errors = []
    A.controllers = []
    var t = G.readJsonTable(A.table)
    var circuits = {}
    t.recipes.forEach(function (r) {
      try {
        var key = r.type + '/' + r.circuit
        if (circuits[key]) throw new Error('duplicate circuit ' + key)
        if (!(r.eut > 134217728 && r.eut < 2147483648) || !(r.duration > 0) ||
          !(r.circuit >= 1 && r.circuit <= 32)) throw new Error('invalid voltage, duration or circuit')
        list(r, 'itemsIn').concat(list(r, 'kept'), list(r, 'itemsOut')).forEach(requireItem)
        list(r, 'wear').concat(list(r, 'chancedOut')).forEach(function (s) {
          requireItem(s.id)
          if (!(s.chance > 0 && s.chance <= 10000)) throw new Error('invalid chance for ' + s.id)
        })
        list(r, 'fluidsIn').concat(list(r, 'fluidsOut')).forEach(requireFluid)
        var b = event.recipes.gtceu[r.type]('grindless:' + r.name).circuit(r.circuit)
        list(r, 'itemsIn').forEach(function (s) { b.itemInputs(s) })
        list(r, 'kept').forEach(function (s) { b.notConsumable(s) })
        list(r, 'wear').forEach(function (s) { b.chancedInput(s.id, s.chance, 0) })
        list(r, 'fluidsIn').forEach(function (s) { b.inputFluids(Fluid.of(s.id, s.amount)) })
        list(r, 'itemsOut').forEach(function (s) { b.itemOutputs(s) })
        list(r, 'chancedOut').forEach(function (s) { b.chancedOutput(s.count + 'x ' + s.id, s.chance, 0) })
        list(r, 'fluidsOut').forEach(function (s) { b.outputFluids(Fluid.of(s.id, s.amount)) })
        b.dimension(A.site).EUt(r.eut).duration(r.duration)
        circuits[key] = true
        A.recipes.push(r)
      } catch (e) {
        var error = r.type + '/' + r.name + ': ' + e
        A.errors.push(error)
        console.error(LOG + error)
      }
    })
    t.controllers.forEach(function (d) {
      try {
        var items = ['gtceu:opv_machine_hull'].concat(d.parts, d.domain)
        items.concat([d.research, 'gtceu:' + d.name]).forEach(requireItem)
        var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
          .itemInputs(items).itemInputs('4x #gtceu:circuits/opv')
          .inputFluids(Fluid.of('grindless:superfluid_helium_3', 1000),
            Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000))
          .itemOutputs('gtceu:' + d.name)
          .stationResearch(function (s) { return s.researchStack(Item.of(d.research)).dataStack(Item.of('gtceu:data_module')).CWUt(128).EUt(503316480) })
          .EUt(503316480).duration(2400)
        A.controllers.push('grindless:assembly_line/' + d.name)
      } catch (e) {
        var error = d.name + ' controller: ' + e
        A.errors.push(error)
        console.error(LOG + error)
      }
    })
  })
})()
