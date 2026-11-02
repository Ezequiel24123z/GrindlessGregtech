// priority: -21230
// -----------------------------------------------------------------------------------------------
// MV electronic-grade silicon (package D1-SILICON, docs/eras/lines-steam-hv.md section 4, line M2): trichlorosilane and Siemens polysilicon
// before every silicon boule.
//
//   hydrochlorination   chemical reactor, 30 EU/t   silicon + 3 HCl -> crude trichlorosilane + H2
//   distillation        distillery, 30 EU/t         4 crude -> 3 trichlorosilane + 1 SiCl4 bottoms
//   bottoms loop        chemical reactor, 30 EU/t   3 bottoms + silicon + 2 H2 -> 4 crude (3 SiCl4 + Si + 2 H2 -> 4 HSiCl3)
//   feed gas            mixer, 30 EU/t              trichlorosilane + H2 -> Siemens feed gas (the EBF has one fluid input)
//   Siemens CVD         EBF cupronickel, 1,800 K    feed gas -> polysilicon + 3 HCl (the HCl goes back to the first step)
//   The bottoms are our chlorosilane bottoms (mostly SiCl4), kept apart from gtca's own silicon tetrachloride dust.
//
// Every GTM boule recipe (silicon, phosphorus, naquadah, neutronium) takes polysilicon where it took silicon: dust 1:1, silicon block as 9
// polysilicon (the silicon boule is written out with GTM's own numbers so EMI shows it; the other three are rebuilt from GTM's recipe at load). Nothing else of the silicon dust changes.
(function () {
  const G = global.grindless || (global.grindless = {})
  const SI = G.mvSilicon || (G.mvSilicon = {})
  const POLY = 'grindless:polysilicon'
  const BOULES = ['phosphorus_boule', 'naquadah_boule', 'neutronium_boule']

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
    var missing = [ids.polysilicon, ids.bottoms].filter(function (id) { return !Item.exists(id) })
      .concat([ids.crude, ids.trichlorosilane, ids.feed, 'gtceu:hydrochloric_acid', 'gtceu:hydrogen']
        .filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error('[grindless/mv] silicon line skipped, unknown: ' + missing.join(', '))
      return
    }

    event.recipes.gtceu.chemical_reactor('grindless:hydrochlorination')
      .itemInputs('1x gtceu:silicon_dust')
      .inputFluids(Fluid.of('gtceu:hydrochloric_acid', 3000))
      .outputFluids(Fluid.of(ids.crude, 1000), Fluid.of('gtceu:hydrogen', 1000))
      .EUt(30).duration(200)

    event.recipes.gtceu.distillery('grindless:trichlorosilane_distillation')
      .circuit(1)
      .inputFluids(Fluid.of(ids.crude, 4000))
      .outputFluids(Fluid.of(ids.trichlorosilane, 3000))
      .itemOutputs('1x ' + ids.bottoms)
      .EUt(30).duration(300)

    event.recipes.gtceu.chemical_reactor('grindless:tetrachloride_hydrogenation')
      .itemInputs('1x gtceu:silicon_dust', '3x ' + ids.bottoms)
      .inputFluids(Fluid.of('gtceu:hydrogen', 2000))
      .outputFluids(Fluid.of(ids.crude, 4000))
      .EUt(30).duration(200)

    event.recipes.gtceu.mixer('grindless:siemens_feed')
      .inputFluids(Fluid.of(ids.trichlorosilane, 1000), Fluid.of('gtceu:hydrogen', 1000))
      .outputFluids(Fluid.of(ids.feed, 2000))
      .EUt(30).duration(100)

    event.recipes.gtceu.electric_blast_furnace('grindless:siemens_polysilicon')
      .inputFluids(Fluid.of(ids.feed, 2000))
      .itemOutputs('1x ' + POLY)
      .outputFluids(Fluid.of('gtceu:hydrochloric_acid', 3000))
      .blastFurnaceTemp(1800)
      .EUt(120).duration(400)
    event.remove({ id: 'gtceu:electric_blast_furnace/silicon_boule' })
    event.recipes.gtceu.electric_blast_furnace('grindless:silicon_boule')
      .itemInputs('32x ' + POLY, '1x gtceu:small_gallium_arsenide_dust')
      .circuit(2)
      .itemOutputs('1x gtceu:silicon_boule')
      .blastFurnaceTemp(1784)
      .EUt(120).duration(9000)

    SI.boules = []
    var missing3 = []
    BOULES.forEach(function (name) {
      var id = 'gtceu:electric_blast_furnace/' + name
      var edits = 0
      event.forEachRecipe({ id: id }, function (r) {
        var j = JSON.parse(String(r.json))
        var items = j.inputs && j.inputs.item ? j.inputs.item : []
        items.forEach(function (entry) {
          var c = entry.content
          if (!c || !c.ingredient) return
          var kind = siliconKind(c.ingredient)
          if (kind === 0) return
          c.count = Number(c.count) * kind
          c.ingredient = { item: POLY }
          edits++
        })
        if (edits === 0) return
        r.json.add('inputs', JsonIO.parseRaw(JSON.stringify(j.inputs)))
        r.save()
      })
      if (edits > 0) SI.boules.push(id)
      else missing3.push(id)
    })
    if (missing3.length > 0) console.error('[grindless/mv] boules not edited: ' + missing3.join(', '))
    console.info('[grindless/mv] polysilicon boules rebuilt: ' + SI.boules.length + ' of ' + BOULES.length)  })
})()
