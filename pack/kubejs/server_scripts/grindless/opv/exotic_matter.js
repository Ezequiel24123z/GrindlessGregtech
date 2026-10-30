// OpV-D2: the older crossings stay in their owners' tables; only this package's types and ion source live here.
(function () {
  var G = global.grindless
  var EM = G.exoticMatter
  var LOG = '[grindless/opv/exotic_matter] '
  function list(value) { return Array.isArray(value) ? value : [] }
  function integer(value) { return typeof value === 'number' && isFinite(value) && value % 1 === 0 }
  function fail(message) { throw new Error(LOG + message) }
  function generate(event) {
    EM.recipes = []
    var t = G.readJsonTable(EM.table)
    Object.keys(t.types).forEach(function (type) {
      var names = {}
      var circuits = {}
      t.types[type].recipes.forEach(function (r) {
        if (!/^[a-z0-9_]+$/.test(r.name) || names[r.name] || circuits[r.circuit] ||
            !integer(r.circuit) || r.circuit < 0 || r.circuit > 32 ||
            !integer(r.eut) || r.eut <= 134217728 || r.eut >= 2147483648 ||
            !integer(r.duration) || r.duration <= 0) fail(type + ': invalid row ' + r.name)
        names[r.name] = true
        circuits[r.circuit] = true
        var id = 'grindless:' + type + '/' + r.name
        var outputs = list(r.itemsOut).concat(list(r.chancedOut), list(r.fluidsOut))
        var disposal = id === EM.disposalId && r.site === EM.site && r.disposal === true
        if ((outputs.length === 0) !== disposal) fail(id + ': only exact Cygnus c3 may discard its output')
        if (disposal && (r.circuit !== 3 || list(r.itemsIn).length !== 1 ||
            r.itemsIn[0].id !== 'grindless:negative_strangelet_residue' || r.itemsIn[0].count !== 1)) fail(id + ': invalid disposal input')
        var b = event.recipes.gtceu[type]('grindless:' + r.name)
        function stacks(key, method, chance) {
          list(r[key]).forEach(function (s) {
            if (!Item.exists(s.id) || !integer(s.count) || s.count < 1) fail(id + ': invalid item ' + s.id)
            if (chance) {
              if (!integer(s.chance) || s.chance < 1 || s.chance > 9999) fail(id + ': invalid chance')
              b[method](s.count + 'x ' + s.id, s.chance, 0)
            } else b[method](s.count + 'x ' + s.id)
          })
        }
        function fluids(key, method) {
          list(r[key]).forEach(function (f) {
            if (!Fluid.exists(f.id) || !integer(f.amount) || f.amount < 1) fail(id + ': invalid fluid ' + f.id)
            b[method](Fluid.of(f.id, f.amount))
          })
        }
        stacks('itemsIn', 'itemInputs', false)
        stacks('kept', 'notConsumable', false)
        stacks('chancedIn', 'chancedInput', true)
        stacks('itemsOut', 'itemOutputs', false)
        stacks('chancedOut', 'chancedOutput', true)
        fluids('fluidsIn', 'inputFluids')
        fluids('charge', 'notConsumableFluid')
        fluids('fluidsOut', 'outputFluids')
        if (r.circuit > 0) b.circuit(r.circuit)
        if (r.site) {
          if (r.site !== EM.site) fail(id + ': unexpected site')
          b.dimension(r.site)
        }
        b.EUt(r.eut).duration(r.duration)
        EM.recipes.push(id)
      })
    })
  }
  function controllers(event) {
    EM.controllerRecipes = []
    var defs = [
      { name: 'strangelet_vault', domain: ['grindless:field_frozen_plate', 'grindless:neutronium_pellet', 'grindless:chain_field_coil'] },
      { name: 'strangelet_distiller', domain: ['grindless:pasta_core_sample', 'grindless:field_frozen_plate', 'grindless:neg_xhv_casing'] }
    ]
    defs.forEach(function (d) {
      var parts = ['gtceu:opv_machine_hull', '4x gtceu:opv_field_generator', '4x gtceu:opv_electric_pump',
        '2x gtceu:opv_sensor', '4x #gtceu:circuits/opv'].concat(d.domain)
      parts.concat(['gtceu:' + d.name, 'grindless:pb208_beam_cell']).forEach(function (s) {
        var id = s.replace(/^\d+x /, '')
        if (id.charAt(0) !== '#' && !Item.exists(id)) fail(d.name + ': unknown controller ingredient ' + id)
      })
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      parts.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('grindless:superfluid_helium_3', 1000),
        Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000))
        .itemOutputs('gtceu:' + d.name)
        .stationResearch(function (r) { return r.researchStack(Item.of('grindless:pb208_beam_cell')).CWUt(128).EUt(503316480) })
        .EUt(503316480).duration(2400)
      EM.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
      controllers(event)
    } catch (e) {
      console.error(LOG + 'recipe generation failed: ' + e)
      throw e
    }
  })
})()
