// priority: -8400
// -----------------------------------------------------------------------------------------------
// UHV's ceramics and the level 8 rocket (docs/eras/uhv.md, machine 16, line 26, the thruster works' two UHV rows; package UHV-A8): the
// spark plasma sinterer, its recipe type, line 26's two package materials, the TaC liner, the oganesson propellant pod and the ICAN
// rocket motor. Every other id is F1's (global.grindless.uhvFoundation): uhtc_tile, uhtc_nozzle, zirconia, zirconium_diboride,
// oganesson_propellant; the thruster works and its type are UV-A11's (startup_scripts/grindless/uv/propulsion.js).
//
//   gtceu:spark_plasma_sinterer    machine 16. 5 wide x 5 high x 7 deep of robust tungsten steel casing: two hydraulic rams (tungsten steel
//                                  frames) press the graphite die from above and below through the middle slices, driven by
//                                  tungsten steel gearboxes, between water jackets (tungsten steel pipe casings) at both ends.
//   gtceu:spark_plasma_sintering   its recipe type (EU in); circuits: 1 UHTC tile, 2 TaC liner, 3 UHTC nozzle.
//   grindless:ican_rocket_motor    a GCYR rocket motor at tier 6 (S0-2: GCYR 0.2.9's KubeJS motor builder makes a fuel tank, so the
//                                  block is a real argent_matter.gcyr.common.block.RocketMotorBlock through createCustom, with its
//                                  own motor type; carry weight and motor count are the elite motor's). With the BNNT fuel tank
//                                  (tier 11): floor((6 + 11) / 2) = level 8, Proxima b's rocket tier. Its block item is a
//                                  createCustom BlockItem; its loot table and pickaxe tag are in server_scripts/grindless/uhv/propulsion.js,
//                                  its blockstate and models in assets/grindless/{blockstates,models}/.
//
// Items (grindless:, names in client_scripts/grindless/uhv_propulsion_lang.js): tantalum_carbide_liner (the nozzle's throat liner),
// oganesson_propellant_pod (a propellant tank filled with oganesson propellant: the swarm control station's fuel, UHV-B3).
// Materials (GT materials, dusts): boron_carbide (B4C), uhtc_blend (the ZrB2-SiC powder the sinterer presses).
//
// Parts: 1-2 energy hatches, 1-2 input buses, 1-2 output buses in the floor cells of the back and front slices, at least 4 casings
// among them; no fluids. Textures: the hot strip mill's overlay on robust tungsten steel; the item icons and the motor's faces from
// tools/assets/Build-UHVPropulsionTextures.ps1. Published: global.grindless.uhvPropulsion.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const P = G.uhvPropulsion || (G.uhvPropulsion = {})

  const SINTERER = 'gtceu:spark_plasma_sinterer'
  const SINTER_TYPE = 'spark_plasma_sintering'
  const MOTOR = 'grindless:ican_rocket_motor'
  const MOTOR_TIER = 6
  const MOTOR_TYPE_NAME = 'grindless_ican'

  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const OVERLAY = 'grindless:block/multiblock/hot_strip_mill'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const FRAME = 'tungsten_steel'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    tantalum_carbide_liner: { stack: 64 },
    oganesson_propellant_pod: { stack: 16 }
  }

  // GT material name -> form, colour and formula
  const MATERIALS = {
    boron_carbide: { form: 'dust', colour: 0x303038, formula: 'B4C' },
    uhtc_blend: { form: 'dust', colour: 0x6A6E78, formula: '(ZrB2)2SiC' }
  }

  P.sinterer = SINTERER
  P.type = 'gtceu:' + SINTER_TYPE
  P.motor = MOTOR
  P.motorTier = String(MOTOR_TIER)
  P.motorTypeName = MOTOR_TYPE_NAME
  P.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  P.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })
  P.ids = { icanRocketMotor: MOTOR }
  Object.keys(ITEMS).concat(Object.keys(MATERIALS)).forEach(function (name) {
    var key = name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() })
    P.ids[key] = (MATERIALS[name] ? 'gtceu:' : 'grindless:') + name
  })
  // items in 4 (blend + graphite + circuit; tantalum + carbon + circuit; tiles + liner + circuit; UEV-A5's HfTaCN billet: powder +
  // 6N hafnium + graphite + circuit), out 2 (tile + carbon), no fluids
  P.io = { itemsIn: 4, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }
  P.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 }
  }
  P.minCasings = 4
  P.abilities = ['energy_input', 'input_bus', 'output_bus']
  P.blocks = { robust: ROBUST, pipe: PIPE, gearbox: GEARBOX, frame: FRAME }

  // ---------------------------------------------------------------- pattern
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  function cells(casing, min, abilities) {
    var options = [Pat.block(casing, { min: min })]
    abilities.forEach(function (a) { options.push(Pat.part(a, P.parts[a])) })
    return Pat.oneOf.apply(null, options)
  }

  // a 5 x 5 ring around three interior rows (bottom -> top): the lower ram, the die, the upper ram
  function ring(interior) {
    var rows = ['RRRRR']
    interior.forEach(function (row) { rows.push('R' + row + 'R') })
    rows.push('RRRRR')
    return rows
  }
  const JACKET = ring(['WWW', '###', 'WWW'])
  const RAM = ring(['#F#', '###', '#F#'])

  // dress the casing walls: frame posts (Q) on the corners and roof edges, heatproof ribs (A) on the roof and a course at the foot,
  // glass (L) between casing mullions in the rows above
  function dress(slices) {
    var depth = slices.length
    var height = slices[0].length
    var width = slices[0][0].length
    return slices.map(function (rows, si) {
      return rows.map(function (row, r) {
        var out = ''
        for (var c = 0; c < width; c++) {
          var ch = row.charAt(c)
          if (ch === 'R' && r > 0) {
            var ex = c === 0 || c === width - 1
            var ez = si === 0 || si === depth - 1
            var top = r === height - 1
            if ((ex && ez) || (top && (ex || ez))) ch = 'Q'
            else if (top) ch = si % 2 === 1 ? 'A' : 'R'
            else if (r === 1) ch = 'A'
            else if ((ez ? c : si) % 2 === 1) ch = 'L'
          }
          out += ch
        }
        return out
      })
    })
  }
  const SPEC = {
    slices: dress([
      ['XXXXX', 'RRRRR', 'RRRRR', 'RRRRR', 'RRRRR'],
      JACKET,
      RAM,
      ring(['GFG', '###', 'GFG']),
      RAM,
      JACKET,
      ['XXXXX', 'RRSRR', 'RRRRR', 'RRRRR', 'RRRRR']
    ]),
    symbols: {
      S: Pat.controller(),
      X: cells(ROBUST, P.minCasings, P.abilities),
      R: Pat.block(ROBUST),
      A: Pat.block('gtceu:heatproof_machine_casing'),
      L: Pat.block('gtceu:laminated_glass'),
      Q: Pat.frame([FRAME]),
      W: Pat.block(PIPE),
      G: Pat.block(GEARBOX),
      F: Pat.frame([FRAME]),
      '#': Pat.air()
    }
  }
  P.spec = SPEC

  // ---------------------------------------------------------------- recipe type and machine

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var io = P.io
    event.create(SINTER_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_COMPRESS, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(SINTERER, SPEC)
    event.create('spark_plasma_sinterer', 'multiblock')
      .langValue('Spark Plasma Sinterer')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(SINTER_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(ROBUST) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.spark_plasma_sinterer.tooltip.0'),
        Text.translate('grindless.machine.spark_plasma_sinterer.tooltip.1'),
        Text.translate('grindless.machine.spark_plasma_sinterer.tooltip.2'),
        Text.translate('grindless.machine.spark_plasma_sinterer.tooltip.3')
      ])
      .workableCasingModel(ROBUST_TEXTURE, OVERLAY)
  })

  // ---------------------------------------------------------------- the ICAN rocket motor (GCYR tier 6)

  var motorBlock = null
  P.motorRegistered = false

  StartupEvents.registry('block', function (event) {
    // KubeJS 6 always has createCustom; the static stand-in (tools/analysis/lib/kubejs_static.mjs) registers the id without the supplier
    if (typeof event.createCustom !== 'function') {
      console.warn('[grindless/uhv] ICAN rocket motor skipped: this registry event has no createCustom')
      return
    }
    try {
      var RMB = Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock')
      var RMT = Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock$RocketMotorType')
      var IRMT = Java.loadClass('argent_matter.gcyr.api.block.IRocketMotorType')
      var Props = Java.loadClass('net.minecraft.world.level.block.state.BlockBehaviour$Properties')
      var VBlocks = Java.loadClass('net.minecraft.world.level.block.Blocks')
      var elite = RMT.ELITE
      var type = new IRMT({
        getTier: function () { return MOTOR_TIER },
        getMaxCarryWeight: function () { return elite.getMaxCarryWeight() },
        getMotorCount: function () { return elite.getMotorCount() },
        getSerializedName: function () { return MOTOR_TYPE_NAME }
      })
      event.createCustom(MOTOR, function () {
        motorBlock = new RMB(Props.copy(VBlocks.IRON_BLOCK), type)
        return motorBlock
      })
      P.motorRegistered = true
    } catch (e) {
      console.error('[grindless/uhv] ICAN rocket motor block not registered: ' + e)
    }
  })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
    // KubeJS can fire this event before the block one (T1 showed it), so no flag check here: the supplier runs in Forge's
    // item RegisterEvent, after every block is registered, and resolves the motor block then
    if (typeof event.createCustom !== 'function') return
    try {
      var BlockItem = Java.loadClass('net.minecraft.world.item.BlockItem')
      var ItemProps = Java.loadClass('net.minecraft.world.item.Item$Properties')
      var Forge = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
      event.createCustom(MOTOR, function () {
        var block = motorBlock !== null ? motorBlock : Forge.BLOCKS.getValue(new RL(MOTOR))
        if (P.motorRegistered !== true) console.error('[grindless/uhv] ICAN rocket motor item has no motor block (the block registry failed)')
        return new BlockItem(block, new ItemProps())
      })
    } catch (e) {
      console.error('[grindless/uhv] ICAN rocket motor item not registered: ' + e)
    }
  })

  // ---------------------------------------------------------------- materials

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MATERIALS).forEach(function (name) {
      var spec = MATERIALS[name]
      event.create(name).dust().color(spec.colour).formula(spec.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
