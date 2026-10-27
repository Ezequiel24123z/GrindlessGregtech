// priority: -3800
// -----------------------------------------------------------------------------------------------
// One of LuV's multiblocks (docs/eras/luv.md, "4. Biofoundry"; package LuV-A5): the biofoundry and its recipe type.
//
//   gtceu:biofoundry        a sealed sterile hall, 9 wide, 6 high and 9 deep: plascrete with cleanroom glass windows, four fermenter
//                           columns of laminated glass in clean stainless steel casing, an autoclave bay (heat-proof vessels under a steel
//                           steam header), GT lamps as the UV ceiling and an iron-door airlock. Everything goes in and out through the
//                           back wall: nothing is carried through the airlock.
//   gtceu:sterile_culture   its recipe type (EU in): GTM's whole sterile chain, bootstrap included, and our engineered seeds. The recipes
//                           come from data/grindless/tables/biofoundry.json (server_scripts/grindless/luv/biofoundry.js); the programmed
//                           circuit picks the step:
//                             c1-c2  collagen (bone, bone meal)      c5  bacterial sludge        c8   stem cells
//                             c3     gelatin                          c6  mutagen                 c9   engineered barley seed
//                             c4     agar                             c7  sterile growth medium   c10  engineered tobacco seed
//
// What it gains (rule 4): every step of GTM's chain needs GTM's sterile cleanroom, which is a ZPM build. GTM's cleaning maintenance
// hatch only gives a normal cleanroom, and Extended Features' configurable hatch has no recipe, so this hall is the only route at LuV.
// GTM's own recipes stay as they are, with their sterile condition; ours are the same steps registered again under this type, composed
// from GTM's live recipes with the same ratios and the same energy (server_scripts/grindless/lib/compose.js).
//
// Kept: nothing it makes may be thrown away (the stem cells' sludge goes back to mutagen, the diluted sulfuric acid and the phosphorus go
// back to acid). lib/no_voiding.js refuses voiding in the modifier and at the start of every run (GTM 7.5.3 restarts a cached recipe
// without the modifier). Then a parallel hatch's copies when one sits in a part cell (lib/parallel_hatch.js), then GTM's own overclock.
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine), so its overclock is GTM's.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front):
//   slice 0, the service wall: rows 1-3 of columns 1-7 are `X` (casing or a part), the rest plascrete.
//   slice 1, the autoclave bay: 3 x 2 heat-proof casings (H) on the floor in the middle, a row of steel pipe casings (I) over them.
//   slices 3 and 5, the fermenters: at columns 2 and 6, clean casing (C) at the foot and the head, two laminated glass blocks (L) between.
//   slices 2, 4 and 6: GT lamps (U) in the roof at columns 2, 4 and 6: nine UV lamps.
//   slices 6-7, the airlock in the front-left corner: an inner iron door (D) at slice 6, column 1, an air chamber at slice 7, a plascrete
//   partition at column 2 and a plascrete ceiling at row 3; the outer door at slice 8, column 1.
//   slice 8, the front: the controller at column 4, row 1, a 5 x 2 window of cleanroom glass (W) above it.
//   The side walls have windows (W) at rows 2-3 of slices 2-5 (and 6-7 on the right). The rest of the inside is air.
// The 21 `X` cells take 1-2 energy hatches, 1-4 input buses, 1-2 output buses, 1-3 input hatches, 1-2 output hatches and at most one
// parallel hatch; at least 4 stay plascrete. ME buses and hatches have the same abilities, so they fit.
//
// Textures: overlay dir grindless:block/multiblock/biofoundry (tools/assets/Build-BiofoundryTextures.ps1) on GTM's plascrete.
// Names / tooltips: client_scripts/grindless/luv_biofoundry_lang.js. Published for the recipe script and the smoke test:
// global.grindless.biofoundry.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const BF = G.biofoundry || (G.biofoundry = {})
  const LOG = '[grindless/luv] '

  const MACHINE = 'gtceu:biofoundry'
  const TYPE = 'sterile_culture'
  const TABLE = 'kubejs/data/grindless/tables/biofoundry.json'

  const PLASCRETE = 'gtceu:plascrete'
  const PLASCRETE_TEXTURE = 'gtceu:block/casings/cleanroom/plascrete'
  const WINDOW = 'gtceu:cleanroom_glass'
  const FERMENTER_GLASS = 'gtceu:laminated_glass'
  const FERMENTER_SHELL = 'gtceu:clean_machine_casing'
  const AUTOCLAVE = 'gtceu:heatproof_machine_casing'
  const STEAM_HEADER = 'gtceu:steel_pipe_casing'
  const DOOR = 'minecraft:iron_door'
  const COLORS = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue',
    'brown', 'green', 'red', 'black']
  // any GT lamp, framed or borderless, of any colour
  const LAMPS = COLORS.map(function (c) { return 'gtceu:' + c + '_lamp' }).concat(COLORS.map(function (c) { return 'gtceu:' + c + '_borderless_lamp' }))

  const NO_VOIDING = 'grindless.machine.biofoundry.no_voiding'
  // the recipe data key: the EMI line gtceu.recipe.grindless_biofoundry.<recipe name>
  const DATA_KEY = 'grindless_biofoundry'

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  BF.machine = MACHINE
  BF.recipeType = 'gtceu:' + TYPE
  BF.table = TABLE
  // items in: up to four ingredients and the programmed circuit (sterile medium: meat, salt, calcium and agar); out: gelatin and phosphorus.
  // Fluids in: two (gelatin: phosphoric acid and water; stem cells: bacteria and medium); out: one
  BF.maxIO = { itemsIn: 5, itemsOut: 2, fluidsIn: 2, fluidsOut: 1 }
  BF.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 4 },
    output_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 3 },
    output_hatch: { min: 1, max: 2 }
  }
  BF.minCasing = 4
  BF.steps = {
    1: 'collagen_from_bone', 2: 'collagen_from_bone_meal', 3: 'gelatin', 4: 'agar', 5: 'bacterial_sludge', 6: 'mutagen',
    7: 'sterile_growth_medium', 8: 'stem_cells', 9: 'engineered_barley_seed', 10: 'engineered_tobacco_seed'
  }
  BF.noVoiding = NO_VOIDING
  BF.dataKey = DATA_KEY
  BF.blocks = {
    plascrete: PLASCRETE, window: WINDOW, fermenterGlass: FERMENTER_GLASS, fermenterShell: FERMENTER_SHELL, autoclave: AUTOCLAVE,
    steamHeader: STEAM_HEADER, door: DOOR, lamps: LAMPS
  }

  // ---------------------------------------------------------------- pattern

  const SPEC = {
    slices: [
      // the service wall: buses, hatches and the energy come in here
      ['PPPPPPPPP', 'PXXXXXXXP', 'PXXXXXXXP', 'PXXXXXXXP', 'PPPPPPPPP', 'PPPPPPPPP'],
      // the autoclave bay and its steam header
      ['PPPPPPPPP', 'P##HHH##P', 'P##HHH##P', 'P##III##P', 'P#######P', 'PPPPPPPPP'],
      ['PPPPPPPPP', 'P#######P', 'W#######W', 'W#######W', 'P#######P', 'PPUPUPUPP'],
      // the back fermenters
      ['PPPPPPPPP', 'P#C###C#P', 'W#L###L#W', 'W#L###L#W', 'P#C###C#P', 'PPPPPPPPP'],
      ['PPPPPPPPP', 'P#######P', 'W#######W', 'W#######W', 'P#######P', 'PPUPUPUPP'],
      // the front fermenters
      ['PPPPPPPPP', 'P#C###C#P', 'W#L###L#W', 'W#L###L#W', 'P#C###C#P', 'PPPPPPPPP'],
      // the airlock's inner door
      ['PPPPPPPPP', 'PDP#####P', 'PDP#####W', 'PPP#####W', 'P#######P', 'PPUPUPUPP'],
      // the airlock's chamber
      ['PPPPPPPPP', 'P#P#####P', 'P#P#####W', 'PPP#####W', 'P#######P', 'PPPPPPPPP'],
      // the front: the outer door, the controller and the window
      ['PPPPPPPPP', 'PDPPSPPPP', 'PDPWWWWWP', 'PPPWWWWWP', 'PPPPPPPPP', 'PPPPPPPPP']
    ],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(PLASCRETE, { min: BF.minCasing }),
        Pat.part('energy_input', BF.parts.energy_input),
        Pat.part('input_bus', BF.parts.input_bus),
        Pat.part('output_bus', BF.parts.output_bus),
        Pat.part('input_hatch', BF.parts.input_hatch),
        Pat.part('output_hatch', BF.parts.output_hatch),
        G.parallelHatch.part()
      ),
      P: Pat.block(PLASCRETE),
      W: Pat.block(WINDOW),
      C: Pat.block(FERMENTER_SHELL),
      L: Pat.block(FERMENTER_GLASS),
      H: Pat.block(AUTOCLAVE),
      I: Pat.block(STEAM_HEADER),
      U: Pat.block(LAMPS),
      D: Pat.block(DOOR),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- recipe modifier and start check

  const KEEP = { which: 'both', reason: NO_VOIDING, name: 'biofoundry' }

  // One EMI line per recipe, read from its data: what the step does
  function stepInfo(data) {
    try {
      var name = String(data.getString(DATA_KEY))
      if (name === '') return ''
      return String(Text.translate('gtceu.recipe.' + DATA_KEY + '.' + name).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(BF.maxIO.itemsIn, BF.maxIO.itemsOut, BF.maxIO.fluidsIn, BF.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(stepInfo)

    Pat.register(MACHINE, SPEC)
    if (G.parallelHatch.machines.indexOf(MACHINE) < 0) G.parallelHatch.machines.push(MACHINE)

    event.create('biofoundry', 'multiblock')
      .langValue('Biofoundry')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      // voiding refused, then a parallel hatch's copies, then GTM's own overclock
      .recipeModifier(G.noVoiding.modifier(KEEP, G.parallelHatch.modifier(G.parallelHatch.overclock)), true)
      // GTM restarts a cached recipe without the modifier: refuse voiding at every start too (lib/no_voiding.js)
      .beforeWorking(G.noVoiding.beforeWorking(KEEP))
      .appearanceBlock(function () { return Block.getBlock(PLASCRETE) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.biofoundry.tooltip.0'),
        Text.translate('grindless.machine.biofoundry.tooltip.1'),
        Text.translate('grindless.machine.biofoundry.tooltip.2'),
        Text.translate('grindless.machine.biofoundry.tooltip.3'),
        Text.translate('grindless.machine.parallel_hatch.tooltip')
      ])
      .workableCasingModel(PLASCRETE_TEXTURE, 'grindless:block/multiblock/biofoundry')
  })
})()
