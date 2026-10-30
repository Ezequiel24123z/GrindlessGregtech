// priority: -23360
// TP-C (docs/research/tier-parity.md): UHV's nine components and the UHV-UXV fluid regulators, generated at every server load from
// data/grindless/tables/uhv_components.json.
//
//   assembly_line   gtceu:uhv_<family>: station research on the UV part, GTM's UV shape with UHV-era materials (ids grindless:assembly_line/<name>)
//   assembler       gtceu:u{h,e,i,x}v_fluid_regulator: the tier's pump + two of the tier's circuits (GTM's shape; ids grindless:assembler/<name>)
//
// Published for the smoke test: global.grindless.uhvComponents.recipes, .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var UC = G.uhvComponents || (G.uhvComponents = {})
  var TABLE = UC.table || 'kubejs/data/grindless/tables/uhv_components.json'

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function load(type, t) {
    var out = []
    var seen = {}
    list(t[type]).forEach(function (r) {
      var n = String(r.name || '')
      var ok = /^[a-z0-9_]+$/.test(n) && !seen[n] && Number(r.eut) > 0 && Number(r.duration) > 0 && list(r.itemsIn).length > 0 && list(r.itemsOut).length > 0
      if (!ok) {
        console.error(LOG + 'uhv components: bad ' + type + ' row ' + n)
        return
      }
      seen[n] = true
      out.push({ type: type, name: n, research: r.research ? String(r.research) : '', circuit: Number(r.circuit || 0), eut: Number(r.eut), duration: Number(r.duration),
        itemsIn: list(r.itemsIn).map(function (x) { return { id: String(x.id), count: Number(x.count) } }),
        fluidsIn: list(r.fluidsIn).map(function (f) { return { id: String(f.id), amount: Number(f.amount) } }),
        itemsOut: list(r.itemsOut).map(function (x) { return { id: String(x.id), count: Number(x.count) } }) })
    })
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.itemsOut).forEach(function (x) {
      if (x.id.charAt(0) === '#') return
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    if (rec.research !== '' && !Item.exists(rec.research)) missing.push(rec.research)
    return missing
  }

  function add(event, rec) {
    var b = event.recipes.gtceu[rec.type]('grindless:' + rec.name)
    rec.itemsIn.forEach(function (x) { b.itemInputs(x.count + 'x ' + x.id) })
    if (rec.circuit > 0) b.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { b.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) { b.itemOutputs(x.count + 'x ' + x.id) })
    // the research voltage is the recipe's own: the station scans at the floor of the tier
    if (rec.research !== '') b.stationResearch(function (r) { return r.researchStack(Item.of(rec.research)).CWUt(64).EUt(rec.eut) })
    b.EUt(rec.eut).duration(rec.duration)
  }

  function generate(event) {
    UC.recipes = []
    UC.skipped = []
    var t = G.readJsonTable(TABLE)
    load('assembly_line', t).concat(load('assembler', t)).forEach(function (rec) {
      var missing = missingIds(rec)
      var label = rec.type + '/' + rec.name
      if (missing.length > 0) {
        UC.skipped.push({ name: label, reason: 'unknown id(s): ' + missing.join(', ') })
        console.error(LOG + 'uhv components skipped ' + label + ': unknown id(s) ' + missing.join(', '))
        return
      }
      try {
        add(event, rec)
      } catch (e) {
        UC.skipped.push({ name: label, reason: String(e) })
        console.error(LOG + 'uhv components skipped ' + label + ': the builder failed: ' + e)
        return
      }
      UC.recipes.push(label)
    })
    console.info(LOG + 'uhv components: ' + UC.recipes.length + ' recipes; skipped ' + UC.skipped.length)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'uhv components failed: ' + e)
    }
  })
})()
