// priority: -7572
// -----------------------------------------------------------------------------------------------
// UEV's isotope separation (docs/eras/uev.md, machine 1, lines 1, 2, 29 and 30; package UEV-A1): the calutron, its recipe type, the
// intermediate GT materials of the four lines and the four items that carry them to the superheavy package (UEV-A2). The recipes come
// from data/grindless/tables/isotopes.json (server_scripts/grindless/uev/isotopes.js); the older rows from isotopes_facility.json
// (UHV's high flux reactor and transuranium facility, read by uhv/transcurium.js), isotopes_fabrication.json (IV's fuel fabrication
// plant, read by iv/uranium_cycle.js) and three rows of zpm/actinides.js.
//
//   gtceu:calutron             Y-12's calutron: an electromagnetic racetrack in a vacuum tank, a superconducting coil round the track and
//                              the collector pockets. The only enrichment route of calcium-48, potassium-40, lithium-6 and plutonium-244.
//                              It refuses to void: the depleted streams go back to stock, the depleted plutonium to IV's MOX.
//   gtceu:calutron_separation  its recipe type (EU in, UHV). Circuit 1: calcium pass 1 (40 %). 2: calcium pass 2 (97 %). 3: potassium-40.
//                              4: lithium-6. 5: plutonium-244. 6: plutonium-242 pass 1 for the HFIR.
//
// New ids (F1's are in uev/foundation.js and are not registered again):
//   items     ca48_oven_charge, plutonium_oxide_target, irradiated_plutonium_target, plutonium_244_target
//   materials calcium_48_enriched, calcium_48_enriched_chloride, plutonium_oxide_feed, plutonium_242_oxide, plutonium_244_rich_oxide,
//             plutonium_244_rich_chloride, plutonium_244_oxide, depleted_plutonium_oxide, mox_blend_powder (dusts);
//             plutonium_nitrate, curium_californium_nitrate, berkelium_californium_nitrate, curium_nitrate, californium_nitrate,
//             berkelium_nitrate (liquids)
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): 27 x 9 x 23: eight SiC magnet tanks (superhydride field band, HfTaCN
// base) round an oval pipe-and-glass vacuum course, a frame beam on their tops, the ion source and the collector pockets in the back gaps.
// Textures: tools/assets/Build-UEVIsotopesTextures.ps1. Names: client_scripts/grindless/uev_isotopes_lang.js.
// Published for the recipe script: global.grindless.isotopes.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const ISO = G.isotopes || (G.isotopes = {})
  const LOG = '[grindless/uev] '

  const BODY = 'grindless:sic_composite_casing'
  const BODY_TEXTURE = 'grindless:block/uev/sic_composite_casing'

  ISO.table = 'kubejs/data/grindless/tables/isotopes.json'
  ISO.noVoiding = 'grindless.machine.calutron.no_voiding'

  ISO.items = {
    ca48_oven_charge: { stack: 16 },
    plutonium_oxide_target: { stack: 16 },
    irradiated_plutonium_target: { stack: 1 },
    plutonium_244_target: { stack: 16 },
    ca48_crucible_load: { stack: 16 },
    pu244_plating_ampoule: { stack: 16 }
  }

  // name -> [form, colour, formula]; the liquids are acid and radioactive
  ISO.materials = {
    calcium_48_enriched: { form: 'dust', colour: 0xD8D4C4, formula: 'Ca(40% 48Ca)' },
    calcium_48_enriched_chloride: { form: 'dust', colour: 0xE0DCD0, formula: 'CaCl2(40% 48Ca)' },
    plutonium_oxide_feed: { form: 'dust', colour: 0x8C7A8C, formula: 'PuO2' },
    plutonium_242_oxide: { form: 'dust', colour: 0x9A6A78, formula: '242PuO2' },
    plutonium_244_rich_oxide: { form: 'dust', colour: 0xA4586C, formula: '(242,244)PuO2' },
    plutonium_244_rich_chloride: { form: 'dust', colour: 0xB06880, formula: '(242,244)PuCl3' },
    plutonium_244_oxide: { form: 'dust', colour: 0xB04058, formula: '244PuO2' },
    depleted_plutonium_oxide: { form: 'dust', colour: 0x7A6A74, formula: 'PuO2(depleted)' },
    mox_blend_powder: { form: 'dust', colour: 0x6C6A5A, formula: '(U,Pu)O2' },
    plutonium_nitrate: { form: 'liquid', colour: 0xB8607C, formula: 'Pu(NO3)4' },
    curium_californium_nitrate: { form: 'liquid', colour: 0xC0A0C8, formula: '(CmCf)(NO3)3' },
    berkelium_californium_nitrate: { form: 'liquid', colour: 0xC8C898, formula: '(BkCf)(NO3)3' },
    curium_nitrate: { form: 'liquid', colour: 0xC8A8D0, formula: 'Cm(NO3)3' },
    californium_nitrate: { form: 'liquid', colour: 0xC8D8A0, formula: 'Cf(NO3)3' },
    berkelium_nitrate: { form: 'liquid', colour: 0xD0C078, formula: 'Bk(NO3)3' }
  }

  ISO.machine = {
    name: 'calutron',
    machine: 'gtceu:calutron',
    type: 'calutron_separation',
    dataKey: 'grindless_calutron_separation',
    lang: 'Calutron',
    // items in: the feed and the circuit; items out: the isotope, the depleted stream, a second tail
    maxIO: { itemsIn: 2, itemsOut: 3, fluidsIn: 1, fluidsOut: 1 },
    width: 27, depth: 23, height: 9
  }

  // The racetrack (27 x 9 x 23): Y-12's alpha track. Eight magnet tanks stand round an oval vacuum course (pipe and glass between them), a
  // SiC beam ties their tops, the ion source (gearbox and coil) sits in the back left gap and the collector pockets in the back right one,
  // and the control booth is in the front wall. Built in the registry callback (shapes.js may load after this file).
  function trackCell() {
    var s = G.uevShapes.scene(27, 9, 23)
    s.box(0, 0, 0, 26, 0, 22, 'X')
    s.box(6, 0, 6, 20, 0, 16, ' ')
    s.box(10, 0, 8, 16, 0, 14, 'X')
    var tanks = [[0, 3], [0, 14], [22, 3], [22, 14], [6, 0], [16, 0], [6, 18], [16, 18]]
    tanks.forEach(function (t) {
      s.room(t[0], 1, t[1], t[0] + 4, 5, t[1] + 4, 'R', '', '#')
      s.box(t[0], 5, t[1], t[0] + 4, 5, t[1] + 4, 'M').box(t[0], 1, t[1], t[0] + 4, 1, t[1] + 4, 'H')
      s.box(t[0], 3, t[1], t[0] + 4, 3, t[1] + 4, 'M').box(t[0] + 1, 3, t[1] + 1, t[0] + 3, 3, t[1] + 3, '#')
      s.set(t[0] + 2, 7, t[1] + 2, 'C')
    })
    // the vacuum course: pipe with glass windows between the tanks, a coil on each straight
    s.box(2, 3, 8, 2, 3, 13, 'P').box(24, 3, 8, 24, 3, 13, 'P').box(11, 3, 2, 15, 3, 2, 'P').box(11, 3, 20, 15, 3, 20, 'P')
    ;[[2, 10], [24, 10], [13, 2], [13, 20]].forEach(function (p) { s.set(p[0], 3, p[1], 'L').set(p[0], 4, p[1], 'C').set(p[0], 2, p[1], 'C') })
    s.edges(0, 6, 0, 26, 6, 22, 'Q')
    s.box(0, 1, 0, 4, 4, 2, 'F').box(0, 1, 0, 1, 3, 2, 'B')
    s.set(2, 2, 1, 'C').set(2, 3, 1, 'C')
    s.box(22, 1, 0, 26, 4, 2, 'F').box(24, 1, 1, 26, 3, 1, 'L')
    return s.booth('R', 3).fn()
  }
  function makeSpec() {
    return G.uevShapes.spec(Pat, {
      w: 27, h: 9, d: 23,
      parts: [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 3 }),
        Pat.part('input_hatch', { min: 0, max: 1 }),
        Pat.part('output_hatch', { min: 0, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 })
      ],
      fn: trackCell(),
      pal: G.uevShapes.palette(BODY)
    })
  }
  // one EMI line per recipe, read from its data: what the circuit does
  function infoOf(dataKey) {
    return function (data) {
      try {
        var name = String(data.getString(dataKey))
        if (name === '') return ''
        return String(Text.translate('gtceu.recipe.' + dataKey + '.' + name).getString())
      } catch (e) {
        return ''
      }
    }
  }

  function tooltips(item, name) {
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(ISO.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ISO.items[name].stack)
      tooltips(item, name)
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(ISO.materials).forEach(function (name) {
      var spec = ISO.materials[name]
      var material = event.create(name)
      if (spec.form === 'liquid') material.liquid(new GTFluidBuilder().attribute(GTFluidAttributes.ACID))
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      if (/plutonium|curium|californium|berkelium|mox/.test(name)) material.radioactiveHazard(1)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var m = ISO.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_FUSION, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = ISO.machine
    var type = GTRecipeTypes.get(m.type)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
    type.addDataInfo(infoOf(m.dataKey))
    m.spec = makeSpec()
    Pat.register(m.machine, m.spec)

    event.create(m.name, 'multiblock')
      .langValue(m.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(m.type)
      .recipeModifier(G.noVoiding.modifier({ which: 'both', reason: ISO.noVoiding, name: 'calutron' }, G.parallelHatch.overclock), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: ISO.noVoiding, name: 'calutron' }))
      .appearanceBlock(function () { return Block.getBlock(BODY) })
      .pattern(function (def) { return Pat.build(def, m.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.calutron.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.calutron_separation'))
      ])
      .workableCasingModel(BODY_TEXTURE, 'grindless:block/multiblock/calutron')
  })
})()
