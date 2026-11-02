// priority: -20530
// -----------------------------------------------------------------------------------------------
// MV electronic-grade silicon (package D1-SILICON, docs/eras/lines-steam-hv.md section 4, line M2): trichlorosilane and Siemens polysilicon
// before every silicon boule.
//
//   hydrochlorination   chemical reactor, 30 EU/t   silicon + 3 HCl -> crude trichlorosilane + H2
//   distillation        distillery, 30 EU/t         4 crude -> 3 trichlorosilane + 1 SiCl4 bottoms
//   bottoms loop        chemical reactor, 30 EU/t   3 bottoms + silicon + 2 H2 -> 4 crude (3 SiCl4 + Si + 2 H2 -> 4 HSiCl3)
//   Siemens CVD         EBF cupronickel, 1,800 K    trichlorosilane + H2 -> polysilicon + 3 HCl (the HCl goes back to the first step)
//
// Every GTM boule recipe (silicon, phosphorus, naquadah, neutronium) takes polysilicon where it took silicon: dust 1:1, silicon block as 9
// polysilicon (rebuilt from GTM's own recipe, so the counts, circuit, temperature and time stay GTM's). Nothing else of the silicon dust changes.
(function () {
  const G = global.grindless || (global.grindless = {})
  const SI = G.mvSilicon || (G.mvSilicon = {})
  const POLY = 'grindless:polysilicon'
  const BOULES = ['silicon_boule', 'phosphorus_boule', 'naquadah_boule', 'neutronium_boule']

  SI.boules = []

  // 'silicon' dust or block only: not silicon carbide, nor a doped or compound material
  function siliconKind(ingredient) {
    var s = JSON.stringify(ingredient)
    if (/dusts\/silicon"|gtceu:silicon_dust"/.test(s)) return 1
    if (/storage_blocks\/silicon"|gtceu:silicon_block"/.test(s)) return 9
    return 0
  }

  function recipeId(r) {
    var m = /^(.*)\[([^\[\]]*)\]$/.exec(String(r))
    if (m) return m[1]
    return String(r.getId())
  }

  G.recipes('mv/silicon', function (event) {
    var ids = SI.ids
    var missing = [ids.polysilicon].filter(function (id) { return !Item.exists(id) })
      .concat([ids.crude, ids.trichlorosilane, ids.bottoms, 'gtceu:hydrogen_chloride', 'gtceu:hydrogen']
        .filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error('[grindless/mv] silicon line skipped, unknown: ' + missing.join(', '))
      return
    }

    event.recipes.gtceu.chemical_reactor('grindless:hydrochlorination')
      .itemInputs('1x gtceu:silicon_dust')
      .inputFluids(Fluid.of('gtceu:hydrogen_chloride', 3000))
      .outputFluids(Fluid.of(ids.crude, 1000), Fluid.of('gtceu:hydrogen', 1000))
      .EUt(30).duration(200)

    event.recipes.gtceu.distillery('grindless:trichlorosilane_distillation')
      .circuit(1)
      .inputFluids(Fluid.of(ids.crude, 4000))
      .outputFluids(Fluid.of(ids.trichlorosilane, 3000), Fluid.of(ids.bottoms, 1000))
      .EUt(30).duration(300)

    event.recipes.gtceu.chemical_reactor('grindless:tetrachloride_hydrogenation')
      .itemInputs('1x gtceu:silicon_dust')
      .inputFluids(Fluid.of(ids.bottoms, 3000), Fluid.of('gtceu:hydrogen', 2000))
      .outputFluids(Fluid.of(ids.crude, 4000))
      .EUt(30).duration(200)

    event.recipes.gtceu.electric_blast_furnace('grindless:siemens_polysilicon')
      .inputFluids(Fluid.of(ids.trichlorosilane, 1000), Fluid.of('gtceu:hydrogen', 1000))
      .itemOutputs('1x ' + POLY)
      .outputFluids(Fluid.of('gtceu:hydrogen_chloride', 3000))
      .blastFurnaceTemp(1800)
      .EUt(120).duration(400)

    var wanted = {}
    BOULES.forEach(function (name) { wanted['gtceu:electric_blast_furnace/' + name] = true })
    var found = []
    event.originalRecipes.values().forEach(function (r) {
      var id = recipeId(r)
      if (wanted[id] && r.json !== null && r.json !== undefined) found.push({ id: id, json: JSON.parse(String(r.json)) })
    })
    SI.boules = []
    found.forEach(function (f) {
      var changed = 0
      var items = f.json.inputs && f.json.inputs.item ? f.json.inputs.item : []
      items.forEach(function (entry) {
        var c = entry.content
        if (!c || !c.ingredient) return
        var kind = siliconKind(c.ingredient)
        if (kind === 0) return
        c.count = Number(c.count) * kind
        c.ingredient = { item: POLY }
        changed++
      })
      if (changed === 0) {
        console.error('[grindless/mv] boule ' + f.id + ' has no silicon input to replace')
        return
      }
      event.remove({ id: f.id })
      event.custom(f.json).id(f.id)
      SI.boules.push(f.id)
    })
    if (SI.boules.length !== BOULES.length) {
      console.error('[grindless/mv] polysilicon boules rebuilt: ' + SI.boules.length + ' of ' + BOULES.length)
    }
  })
})()
