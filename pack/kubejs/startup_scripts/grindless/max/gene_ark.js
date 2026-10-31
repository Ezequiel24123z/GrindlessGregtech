// priority: -5392
// -----------------------------------------------------------------------------------------------
// MAX's gene ark (docs/eras/max.md, machine 4, lines L12 and L28; package MAX-B4): the multiblock and its recipe type. No item of its own:
// every item it makes or takes is F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/gene_ark.js.
//
//   gtceu:gene_ark   11 x 9 x 11 sealed cold vault on two OpV 4 A hatches. Recipe type gtceu:genome_archiving: circuit 1 the genome archive
//                    (four encapsulated genome libraries, a Rydberg logic array as its index and a vitrified cell capsule that can boot it,
//                    in a superfluid He-3 bath), circuit 2 copies an archive with four synthetic oligo pools.
//
// Shape: sterilizing filter casing for the vault, a ring of superconducting coils around the cold core, a cleanroom glass window in each
// wall. Textures: tools/assets/Build-MaxGeneArkTextures.ps1. Names: client_scripts/grindless/max_gene_ark_lang.js.
// Published for the recipe script: global.grindless.maxGeneArk.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MG = G.maxGeneArk || (G.maxGeneArk = {})
  const LOG = '[grindless/max] '

  const VAULT = 'gtceu:sterilizing_filter_casing'
  const VAULT_TEXTURE = 'gtceu:block/casings/cleanroom/plascrete'

  // items in include the programmed circuit; the superfluid He-3 of c1 is consumed
  MG.machines = [
    {
      name: 'gene_ark', machine: 'gtceu:gene_ark', type: 'genome_archiving', dataKey: 'grindless_genome_archiving',
      lang: 'Gene Ark', maxIO: { itemsIn: 7, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: VAULT, texture: VAULT_TEXTURE,
      width: 11, height: 9, depth: 11,
      pal: { F: VAULT, A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil', L: 'gtceu:cleanroom_glass' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    }
  ]

  // x left to right, y bottom to top, z back to front. Row 0 the floor (hatches front and back), row 1 a plinth, rows 2-6 the walls with
  // a glass window in the middle of each, a superconducting coil ring inside at row 4, row 7 a collar, row 8 the roof (plinth, collar, roof and floor of atomic casing so no block type dominates).
  function arkCell(x, y, z) {
    var edgeX = x === 0 || x === 10
    var edgeZ = z === 0 || z === 10
    if (y === 0) return (z === 10 || z === 0) && x >= 4 && x <= 6 ? 'X' : 'A'
    if (y === 8) return 'A'
    if (!edgeX && !edgeZ) {
      var ring = x === 1 || x === 9 || z === 1 || z === 9
      if (y === 4 && ring) return 'C'
      return '#'
    }
    if (y === 1 || y === 7) return 'A'
    if (edgeX && edgeZ) return 'F'
    var mid = (edgeX && z === 5) || (edgeZ && x === 5)
    if (y === 4 && mid) return 'L'
    return 'F'
  }

  var CELLS = { gene_ark: arkCell }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: CELLS[m.name] })
  }

  // one EMI line per recipe, read from its data
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

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    MG.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.COOLING)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MG.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
