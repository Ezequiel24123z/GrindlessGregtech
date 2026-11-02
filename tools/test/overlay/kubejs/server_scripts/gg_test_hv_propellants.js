// TEST ONLY, D1-HV-PROP. Command: kubejs custom_command gg_test_hv_propellants
// Reserved band ONLY: X49664-49727, Z0-63; Overworld Y98-125 (zones.json "hv_propellants").
// Doubt: that GT--'s chemical plant (gtnn:exxonmobil_chemical_plant), built from blocks an HV player has, runs the peroxide cycle that is
// now the only way to hydrogen peroxide: EAQ -> EAHQ -> hydrogen peroxide -> hydrazine, each stage fed what the stage before made.
// GT-- 1.3.10 caps the plant's recipe voltage at the tier of its machine casings (ChemicalPlantMachine#getRealRecipe refuses a recipe of a
// higher tier, and the plant stays idle with no failure reason). Its preview pairs every tiered block by rank, so the preview with
// aluminium plant casings (tier 3, what the EAQ and EAHQ stages ask for) has MV machine casings and titanium pipes: there the 480 EU/t
// stages never start ('casing_voltage_cap' reads it live through the plant's own recipe modifier). The plant that runs the cycle is built
// as the HV player builds it: that preview's plant casings, HV machine casings, steel pipe casings (titanium is lunar in this pack) and
// cupronickel coils (coils only add speed).
// Static part first (no machine): the removed recipes are gone; the new ones, the plant's stages and the UDMH route are present.
// Markers: GGTEST|hv_propellants|<name>|PASS|FAIL|NOTE|<detail>, then GGTEST|hv_propellants|DONE|failures=<n>
// No manual recipe execution and no changed clock: the plant's own recipe logic runs each stage.
(function () {
  var S = null
  var C = null
  var NAME = 'hv_propellants'
  var REQUEST = 'ggTestHvPropellantsRequest'
  var LOADED = Date.now()
  var X0 = 49664
  var X1 = 49727
  var Z0 = 0
  var Z1 = 63
  var Y0 = 98
  var Y1 = 125
  var ORIGIN = { x: X0 + 2, y: Y0 + 2, z: Z0 + 2 }
  var DIM = 'minecraft:overworld'
  var PLANT = 'gtnn:exxonmobil_chemical_plant'
  var HV_HATCH = 'gtceu:hv_energy_input_hatch'
  var IN_HATCH = 'gtceu:hv_input_hatch'
  var CATALYST_HATCH = 'gtnn:catalyst_hatch'
  var OUT_HATCH = 'gtceu:hv_output_hatch'
  var NEED_HATCHES = 3
  var STAGE_SLACK = 600
  var HV = 3
  var VOLTAGES = ['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max']
  // the HV build: each tiered block of the preview becomes the one an HV player has. Machine casings set the plant's recipe voltage cap,
  // pipes its parallels and catalyst wear, coils its speed
  var CASINGS = /^gtceu:(ulv|lv|mv|hv|ev|iv|luv|zpm|uv|uhv|uev|uiv|uxv|opv|max)_machine_casing$/
  var HV_BUILD = [
    [CASINGS, 'gtceu:hv_machine_casing'],
    [/^gtceu:[a-z_]+_pipe_casing$/, 'gtceu:steel_pipe_casing'],
    [/^gtceu:[a-z_]+_coil_block$/, 'gtceu:cupronickel_coil_block']
  ]
  // GTM's route to UDMH, the only one left: methanol and ammonia to dimethylamine, chlorine water to HOCl, ammonia to monochloramine
  var UDMH_ROUTE = ['gtceu:chemical_reactor/dimethylamine', 'gtceu:chemical_reactor/hypochlorous_acid',
    'gtceu:chemical_reactor/monochloramine', 'gtceu:chemical_reactor/dimethylhydrazine_from_dimethylamine']

  // the cycle: each stage's recipe (gtceu:chemical_plant/<recipe>), inputs, product and the plant casing tier it asks for (the dump's rows);
  // hv: the recipe asks for 480 EU/t
  var STAGES = [
    { name: 'eaq', recipe: 'ethyl_anthra_quinone', duration: 300, casing: 3, circuit: 4,
      items: [['gtceu:phthalic_anhydride_dust', 15]], fluids: [['gtceu:ethylbenzene', 1000]],
      out: ['gtceu:ethyl_anthra_quinone', 1000] },
    { name: 'eahq', recipe: 'ethyl_anthra_hydro_quinone', duration: 800, casing: 3, circuit: 4, catalyst: ['gtnn:orange_metal_catalyst', 1],
      items: [], fluids: [['gtceu:ethyl_anthra_quinone', 1000, 'prev'], ['gtceu:hydrogen', 2000]],
      out: ['gtceu:ethyl_anthra_hydro_quinone', 1000] },
    { name: 'peroxide', recipe: 'hydrogen_peroxide_air', duration: 600, casing: 2, circuit: 4, hv: true,
      items: [], fluids: [['gtceu:air', 20000], ['gtceu:ethyl_anthra_hydro_quinone', 5000, 'prev'], ['gtceu:anthracene', 50]],
      out: ['gtceu:hydrogen_peroxide', 5000], back: ['gtceu:ethyl_anthra_quinone', 5000] },
    { name: 'hydrazine', recipe: 'hydrazine', duration: 200, casing: 2, circuit: 2, hv: true,
      items: [], fluids: [['gtceu:ammonia', 1000], ['gtceu:hydrogen_peroxide', 1000, 'prev']],
      out: ['gtceu:hydrazine', 1000] }
  ]

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      Items: Java.loadClass('net.minecraft.world.item.ItemStack'),
      Registries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      Forge: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function command(text) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function machineAt(p) { return classes().Meta.getMachine(S.level, p) }
  function idOf(part) { return String(part.getDefinition().getId()) }

  // ---------------------------------------------------------------- static checks

  function hasRecipe(id) {
    return S.server.getRecipeManager().byKey(new (classes().RL)(id)).isPresent()
  }
  function recipeEut(id) {
    var rec = S.server.getRecipeManager().byKey(new (classes().RL)(id)).get()
    var tries = [
      function () { return Number(rec.getInputEUt()) },
      function () { return Number(rec.getInputEUt().voltage()) },
      function () { return Number(rec.tickInputs.get(Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability').CAP).get(0).content) }
    ]
    for (var i = 0; i < tries.length; i++) {
      try {
        var v = tries[i]()
        if (!isNaN(v)) return v
      } catch (e) { }
    }
    return -1
  }
  function staticChecks() {
    var P = global.grindless.propellants
    check('script_loaded', !!P && !!P.removed && !!P.recipes, 'global.grindless.propellants published by hv/propellants.js')
    if (!P || !P.removed) return
    var gone = P.removed.filter(function (id) { return hasRecipe(id) })
    check('removed_recipes_gone', gone.length === 0, P.removed.length + ' ids checked' + (gone.length ? ', still present: ' + gone.join(' ') : ''))
    var missing = P.recipes.filter(function (id) { return !hasRecipe(id) })
    check('new_recipes_present', missing.length === 0, P.recipes.length + ' ids checked' + (missing.length ? ', missing: ' + missing.join(' ') : ''))
    ;['grindless:chemical_reactor/phthalic_anhydride', 'grindless:large_chemical_reactor/phthalic_anhydride'].forEach(function (id) {
      if (!hasRecipe(id)) return
      var eut = recipeEut(id)
      if (eut < 0) note('phthalic_eut_' + id, 'EU/t not readable through the GTRecipe API here')
      else check('phthalic_eut_' + id, eut === 480, id + ' takes ' + eut + ' EU/t (want 480)')
    })
    var noStage = STAGES.filter(function (st) { return !hasRecipe('gtceu:chemical_plant/' + st.recipe) })
    check('plant_recipes', noStage.length === 0, STAGES.length + ' GT-- chemical plant stages' + (noStage.length ? ', missing: ' + noStage.map(function (st) { return st.recipe }).join(' ') : ''))
    var noRoute = UDMH_ROUTE.filter(function (id) { return !hasRecipe(id) })
    check('udmh_route', noRoute.length === 0, UDMH_ROUTE.length + ' GTM reactor steps from methanol and ammonia to UDMH' + (noRoute.length ? ', missing: ' + noRoute.join(' ') : ''))
    check('aerozine_fluid', Fluid.exists('gtceu:aerozine_50'), 'gtceu:aerozine_50 is registered')
    check('rocket_fuel_fluid', Fluid.exists('gtceu:rocket_fuel'), 'gtceu:rocket_fuel is registered')
  }

  // ---------------------------------------------------------------- the plant

  function clearBand() {
    for (var y = Y0; y <= Y1; y++) command('fill ' + X0 + ' ' + y + ' ' + Z0 + ' ' + X1 + ' ' + y + ' ' + Z1 + ' minecraft:air')
  }

  function readShapes() {
    var def = classes().Registries.MACHINES.get(new (classes().RL)(PLANT))
    if (def === null || def === undefined) return { error: 'no machine definition for ' + PLANT }
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) return { error: 'no preview shape (getMatchingShapes is empty)' }
    return { shapes: shapes }
  }

  function shapeCells(shape) {
    var blocks = shape.getBlocks()
    var cells = []
    var ctrl = null
    var h = 0
    var d = 0
    for (var x = 0; x < blocks.length; x++) {
      h = Math.max(h, blocks[x].length)
      for (var y = 0; y < blocks[x].length; y++) {
        d = Math.max(d, blocks[x][y].length)
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var state = info.getBlockState()
          var bid = String(Block.getId(state.getBlock()))
          if (bid === 'minecraft:air') continue
          var cell = { x: x, y: y, z: z, state: state, id: bid }
          if (bid === PLANT) ctrl = cell
          cells.push(cell)
        }
      }
    }
    return { cells: cells, ctrl: ctrl, w: blocks.length, h: h, d: d }
  }

  function facingOf(state) {
    var m = /facing=([a-z]+)/.exec(String(state))
    return m ? m[1] : 'north'
  }

  // a horizontal face of a cell that opens to empty space in the preview (a side of the structure), or null
  function faceOf(cut, c) {
    if (!cut.occ) {
      cut.occ = {}
      cut.cells.forEach(function (o) { cut.occ[o.x + ',' + o.y + ',' + o.z] = true })
    }
    var sides = [['west', -1, 0], ['east', 1, 0], ['north', 0, -1], ['south', 0, 1]]
    for (var i = 0; i < sides.length; i++) {
      var s = sides[i]
      if (!cut.occ[(c.x + s[1]) + ',' + c.y + ',' + (c.z + s[2])]) return s[0]
    }
    return null
  }
  function keyOf(c) { return c.x + ',' + c.y + ',' + c.z }
  function worldPos(c) { return pos(ORIGIN.x + c.x, ORIGIN.y + c.y, ORIGIN.z + c.z) }
  function putHatch(p, face, id) {
    command('setblock ' + p.getX() + ' ' + p.getY() + ' ' + p.getZ() + ' ' + (id || IN_HATCH) + '[facing=' + face + '] replace')
  }
  // the HV build's block for a preview cell, or null when the cell keeps the preview's block
  function swapFor(id) {
    for (var i = 0; i < HV_BUILD.length; i++) if (HV_BUILD[i][0].test(id)) return HV_BUILD[i][1]
    return null
  }

  // places one preview shape with every energy input hatch and the preview's own fluid input hatch swapped for HV ones;
  // 'extra' maps cell keys to a face: those wall cells become HV hatches too (a player adds them the same way);
  // 'build': the machine casings, pipes and coils become the HV build's
  function place(shape, extra, build) {
    var cut = shapeCells(shape)
    if (cut.ctrl === null) return { error: 'the preview has no controller block' }
    if (cut.w > X1 - ORIGIN.x || cut.d > Z1 - ORIGIN.z || cut.h > Y1 - ORIGIN.y) {
      return { error: 'the preview ' + cut.w + ' x ' + cut.h + ' x ' + cut.d + ' does not fit the band' }
    }
    S.cut = cut
    var ctrlPos = null
    var swapped = 0
    var hatches = 0
    var rebuilt = 0
    cut.cells.forEach(function (c) {
      var p = worldPos(c)
      if (c === cut.ctrl) { ctrlPos = p; return }
      if (extra && extra[keyOf(c)]) {
        putHatch(p, extra[keyOf(c)][1], extra[keyOf(c)][0])
        hatches++
        return
      }
      if (c.id.indexOf('energy_input_hatch') >= 0 && c.id !== HV_HATCH) {
        command('setblock ' + p.getX() + ' ' + p.getY() + ' ' + p.getZ() + ' ' + HV_HATCH + '[facing=' + facingOf(c.state) + '] replace')
        swapped++
        return
      }
      if (c.id.indexOf('input_hatch') >= 0 && c.id.indexOf('energy') < 0 && c.id !== IN_HATCH) {
        putHatch(p, facingOf(c.state))
        hatches++
        return
      }
      var swap = build ? swapFor(c.id) : null
      if (swap !== null) {
        command('setblock ' + p.getX() + ' ' + p.getY() + ' ' + p.getZ() + ' ' + swap + ' replace')
        rebuilt++
        return
      }
      S.level.setBlock(p, c.state, 18)
    })
    S.level.setBlock(ctrlPos, cut.ctrl.state, 3)
    return { ctrlPos: ctrlPos, size: cut.w + 'x' + cut.h + 'x' + cut.d, swapped: swapped, hatches: hatches, rebuilt: rebuilt }
  }

  // which wall casing cells accept an HV input hatch: each is swapped one at a time and the pattern asked whether it still matches
  function probe(ctrl, blockId) {
    var accepted = {}
    var tried = 0
    var seen = {}
    var base = false
    var ids = {}
    var onWall = 0
    S.cut.cells.forEach(function (c) { ids[c.id] = (ids[c.id] || 0) + 1; if (faceOf(S.cut, c) !== null) onWall++ })
    note('probe_cells', S.cut.cells.length + ' cells, ' + onWall + ' with an open side; ' + JSON.stringify(ids).replace(/gtceu:|gtnn:/g, ''))
    try { base = ctrl.checkPatternWithLock() === true } catch (e0) { base = false }
    S.cut.cells.forEach(function (c) {
      var face = faceOf(S.cut, c)
      if (face === null || c === S.cut.ctrl || c.id.indexOf('casing') < 0) return
      var p = worldPos(c)
      putHatch(p, face, blockId)
      tried++
      var ok = false
      try { ok = ctrl.checkPatternWithLock() === true } catch (e) { ok = false }
      if (ok) {
        accepted[keyOf(c)] = [blockId, face]
        seen[c.id] = (seen[c.id] || 0) + 1
      }
      S.level.setBlock(p, c.state, 18)
    })
    return { accepted: accepted, tried: tried, seen: seen, base: base }
  }
  function tierOf(ctrl) {
    try { return Number(ctrl.getCasingTier()) } catch (e) { return -1 }
  }

  function formed(ctrl) {
    if (ctrl.isFormed()) return true
    try {
      if (ctrl.checkPatternWithLock()) {
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
      }
    } catch (e) {
      note('explicit_check', 'threw ' + e)
    }
    return ctrl.isFormed()
  }
  function patternError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      return err === null || err === undefined ? 'no pattern error' : String(err.getErrorInfo().getString())
    } catch (e) { return 'pattern error unreadable' }
  }

  function classify(ctrl) {
    var P = { energy: [], busIn: [], busOut: [], hatchIn: [], hatchOut: [], catalyst: [], ids: {} }
    array(ctrl.getParts()).forEach(function (p) {
      var id = idOf(p)
      P.ids[id] = (P.ids[id] || 0) + 1
      if (id.indexOf('catalyst_hatch') >= 0) P.catalyst.push(p)
      else if (id.indexOf('energy_input_hatch') >= 0) P.energy.push(p)
      else if (id.indexOf('input_bus') >= 0) P.busIn.push(p)
      else if (id.indexOf('output_bus') >= 0) P.busOut.push(p)
      else if (id.indexOf('input_hatch') >= 0) P.hatchIn.push(p)
      else if (id.indexOf('output_hatch') >= 0) P.hatchOut.push(p)
    })
    return P
  }
  function partList(P) {
    return Object.keys(P.ids).map(function (id) { return id.replace(/^(gtceu|gtnn):/, '') + ' x' + P.ids[id] }).join(', ')
  }

  // ---------------------------------------------------------------- the plant's voltage cap, read live

  function recipeOf(st) {
    var found = S.server.getRecipeManager().byKey(new (classes().RL)('gtceu:chemical_plant/' + st.recipe))
    return found.isPresent() ? found.get() : null
  }
  // the plant's own "Recipe voltage maximum support" line: GT--'s display of its machine casings' tier
  function capOf(ctrl) {
    var list = new (classes().ArrayList)()
    try { ctrl.addDisplayText(list) } catch (e) { return 'unreadable' }
    for (var i = 0; i < list.size(); i++) {
      try {
        var tc = list.get(i).getContents()
        if (String(tc.getKey()) === 'gtnn.multiblock.chemical_plant.tier') return String(tc.getArgs()[0]).replace(/\u00a7./g, '')
      } catch (e2) { }
    }
    return 'unreadable'
  }
  // what the plant's own recipe modifier (GTM's doModifyRecipe, which runs GT--'s getRealRecipe) says to a stage's recipe
  function verdict(ctrl, st) {
    var r = recipeOf(st)
    if (r === null) return 'no recipe'
    try { return ctrl.doModifyRecipe(r) !== null ? 'accepted' : 'refused' } catch (e) { return 'threw ' + String(e).substring(0, 100) }
  }
  // a formed plant as built: its machine casings' tier (from the blocks in the world), the cap it shows and its verdicts on the HV stages.
  // With one HV hatch an HV stage runs once at a time, so GT--'s modifier asks nothing of the inputs: only the voltage cap can refuse it
  function readout(ctrl) {
    var tier = -1
    var blocks = {}
    S.cut.cells.forEach(function (c) {
      if (swapFor(c.id) === null) return
      var id = String(Block.getId(S.level.getBlockState(worldPos(c)).getBlock()))
      blocks[id] = (blocks[id] || 0) + 1
      var m = CASINGS.exec(id)
      if (m) tier = VOLTAGES.indexOf(m[1])
    })
    var said = {}
    STAGES.forEach(function (st) { if (st.hv) said[st.recipe] = verdict(ctrl, st) })
    return {
      tier: tier, said: said,
      text: 'machine casings ' + (tier >= 0 ? VOLTAGES[tier].toUpperCase() : '?') + ', the plant shows a recipe voltage cap of ' + capOf(ctrl) +
        '; its modifier on the HV stages: ' + JSON.stringify(said) + '; tiered blocks ' + JSON.stringify(blocks).replace(/gtceu:/g, '')
    }
  }

  // ---------------------------------------------------------------- stages

  function tanksOf(h) {
    var out = []
    var n = 1
    try { n = Number(h.tank.getTanks()) } catch (e) { }
    for (var i = 0; i < n; i++) out.push({ h: h, i: i })
    return out
  }
  function clearHatch(h) {
    tanksOf(h).forEach(function (t) { h.tank.setFluidInTank(t.i, Fluid.of('minecraft:water', 0).getFluidStack()) })
  }
  function clearBus(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, classes().Items.EMPTY)
  }
  function fluidsIn(hatches) {
    var out = {}
    hatches.forEach(function (h) {
      tanksOf(h).forEach(function (t) {
        var fs = h.tank.getFluidInTank(t.i)
        if (fs.isEmpty()) return
        var id = String(classes().Forge.FLUIDS.getKey(fs.getFluid()))
        out[id] = (out[id] || 0) + Number(fs.getAmount())
      })
    })
    return out
  }
  function takeFluid(hatches, id, amount) {
    var left = amount
    hatches.forEach(function (h) {
      tanksOf(h).forEach(function (t) {
        var fs = h.tank.getFluidInTank(t.i)
        if (left <= 0 || fs.isEmpty() || String(classes().Forge.FLUIDS.getKey(fs.getFluid())) !== id) return
        var take = Math.min(left, Number(fs.getAmount()))
        left -= take
        var rest = Number(fs.getAmount()) - take
        h.tank.setFluidInTank(t.i, rest > 0 ? Fluid.of(id, rest).getFluidStack() : Fluid.of('minecraft:water', 0).getFluidStack())
      })
    })
    return amount - left
  }

  // fills the plant for one stage; returns an error text or null
  function feed(st, P) {
    P.hatchIn.forEach(clearHatch)
    P.hatchOut.forEach(clearHatch)
    P.busIn.forEach(clearBus)
    P.busOut.forEach(clearBus)
    var bus = P.busIn[0]
    if (!bus) return 'no input bus'
    bus.getCircuitInventory().setStackInSlot(0, classes().Circuit.stack(st.circuit))
    var slot = 0
    st.items.forEach(function (it) { bus.getInventory().setStackInSlot(slot++, Item.of(it[0], it[1])) })
    if (st.catalyst) {
      var cat = P.catalyst[0]
      var target = cat || bus
      try {
        target.getInventory().setStackInSlot(cat ? 0 : slot++, Item.of(st.catalyst[0], st.catalyst[1]))
      } catch (e) {
        return 'cannot insert the catalyst into ' + (cat ? 'the catalyst hatch' : 'the bus') + ': ' + e
      }
    }
    var tanks = []
    P.hatchIn.forEach(function (h) { tanks = tanks.concat(tanksOf(h)) })
    if (tanks.length < st.fluids.length) return 'only ' + tanks.length + ' input tanks for ' + st.fluids.length + ' fluids'
    st.fluids.forEach(function (f, k) {
      var t = tanks[k]
      t.h.tank.setFluidInTank(t.i, Fluid.of(f[0], f[1]).getFluidStack())
    })
    return null
  }

  function startPlant() {
    var ctrl = S.ctrl
    S.P.energy.forEach(function (e) { e.energyContainer.setEnergyStored(e.energyContainer.getEnergyCapacity()) })
    ctrl.getRecipeLogic().updateTickSubscription()
  }

  function failureText(ctrl) {
    try { return String(ctrl.getRecipeLogic().getFailureReasons()) } catch (e) { return 'no failure reasons readable' }
  }

  // ---------------------------------------------------------------- driver

  function finish() {
    if (S.finished) return
    S.finished = true
    try { clearBand() } catch (e) { }
    command('forceload remove ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }

  function begin(server) {
    S = { server: server, level: server.getLevel(DIM), tick: 0, failed: 0, finished: false, phase: 'warmup', stage: -1, carried: null, shapeIx: -1, tiers: [] }
    command('forceload add ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    clearBand()
    staticChecks()
    var r = readShapes()
    if (r.error) {
      check('preview', false, r.error)
      finish()
      return
    }
    S.shapes = r.shapes
    note('preview', S.shapes.length + ' preview shape(s)')
  }

  // tries the next preview shape until one forms with a casing tier the first stage needs
  function nextShape() {
    S.shapeIx++
    if (S.shapeIx >= S.shapes.length) {
      if (S.best) {
        S.ctrl = S.best.ctrl
        S.P = S.best.P
        check('formed', false, 'no preview shape formed with casing tier 3 or more; tiers seen ' + S.tiers.join(','))
        finish()
      } else {
        check('formed', false, 'no preview shape formed')
        finish()
      }
      return
    }
    clearBand()
    var placed = place(S.shapes[S.shapeIx], S.extra, !!S.extra)
    if (placed.error) {
      check('place_' + S.shapeIx, false, placed.error)
      return
    }
    S.placed = placed
    S.phase = 'forming'
    S.t0 = S.tick
  }

  function stageStart() {
    S.stage++
    if (S.stage >= STAGES.length) {
      finish()
      return
    }
    var st = STAGES[S.stage]
    S.st = st
    var err = feed(st, S.P)
    if (err !== null) {
      check('stage_' + st.name, false, err + ' | parts: ' + partList(S.P))
      S.stage = STAGES.length
      finish()
      return
    }
    if (st.hv) note('gate_' + st.name, 'inputs in place; the plant (recipe voltage cap ' + capOf(S.ctrl) + ') ' + verdict(S.ctrl, st) + ' ' + st.recipe)
    S.stageStart = S.tick
    S.phase = 'running'
    startPlant()
  }

  function stageDone() {
    var st = S.st
    var got = fluidsIn(S.P.hatchOut)
    var made = got[st.out[0]] || 0
    var ok = made >= st.out[1]
    if (!ok && S.tick - S.stageStart <= st.duration + STAGE_SLACK) {
      S.P.energy.forEach(function (e) { e.energyContainer.setEnergyStored(e.energyContainer.getEnergyCapacity()) })
      return false
    }
    check('stage_' + st.name, ok, ok
      ? st.out[1] + ' mB ' + st.out[0] + ' in ' + (S.tick - S.stageStart) + ' ticks at casing tier ' + tierOf(S.ctrl) + '; output ' + JSON.stringify(got)
      : 'no ' + st.out[0] + ' after ' + (S.tick - S.stageStart) + ' ticks; output ' + JSON.stringify(got) + '; casing tier ' + tierOf(S.ctrl) + '; failures=' + failureText(S.ctrl))
    if (!ok) {
      note('stage_' + st.name + '_state', 'inputs ' + JSON.stringify(fluidsIn(S.P.hatchIn)) + '; bus ' + S.P.busIn.map(function (b) { return String(b.getInventory().getStackInSlot(0)) }).join(',') + '; catalyst hatches ' + S.P.catalyst.length + '; recipe status ' + (function () { try { return String(S.ctrl.getRecipeLogic().getStatus()) } catch (e) { return 'unreadable' } })())
      diagnose(st)
      S.stage = STAGES.length
      finish()
      return true
    }
    if (st.back) {
      var back = got[st.back[0]] || 0
      check('eaq_returns', back >= st.back[1], back + ' mB ' + st.back[0] + ' came out with the ' + st.out[0] + ' (want ' + st.back[1] + '): the quinone goes back to the hydrogenation')
    }
    // the next stage starts from what this one made: move the product into the carried pool
    S.carried = { id: st.out[0], amount: takeFluid(S.P.hatchOut, st.out[0], st.out[1]) }
    return true
  }

  // why a stage did not start: the plant's own answers for the stage's recipe (GTM 7.5.3's RecipeHelper)
  function diagnose(st) {
    var r = recipeOf(st)
    if (r === null) { note('diag', 'no recipe gtceu:chemical_plant/' + st.recipe); return }
    var H = classes().Helper
    var modified = null
    var tries = {
      cap: function () { return capOf(S.ctrl) + ', recipe tier ' + String(VOLTAGES[Number(H.getRecipeEUtTier(r))]).toUpperCase() },
      modifier: function () { modified = S.ctrl.doModifyRecipe(r); return modified === null ? 'refused' : 'accepted' },
      match: function () { var m = H.matchRecipe(S.ctrl, modified !== null ? modified : r); return String(m.isSuccess()) + ' ' + String(m.reason()) },
      conditions: function () { var m = H.checkConditions(r, S.ctrl.getRecipeLogic()); return String(m.isSuccess()) + ' ' + String(m.reason()) },
      recipeFluids: function () { return array(H.getInputFluids(r)).map(function (fs) { return String(classes().Forge.FLUIDS.getKey(fs.getFluid())) + ' ' + fs.getAmount() }).join(', ') },
      outHatches: function () { return S.P.hatchOut.map(function (h) { return idOf(h) + ' ' + JSON.stringify(fluidsIn([h])) }).join(', ') }
    }
    Object.keys(tries).forEach(function (k) {
      var v
      try { v = tries[k]() } catch (e) { v = 'threw ' + String(e).substring(0, 150) }
      note('diag_' + k, v)
    })
  }

  // a stage's 'prev' fluid is the earlier stage's product: it is moved, not conjured, up to what that stage made
  function stageStartChained() {
    var carried = S.carried
    stageStart()
    if (S.phase !== 'running' || carried === null) return
    var st = S.st
    st.fluids.forEach(function (f) {
      if (f[2] !== 'prev') return
      if (carried.id !== f[0]) check('chain_' + st.name, false, 'the previous stage made ' + carried.id + ' but ' + st.name + ' takes ' + f[0])
      else if (carried.amount < Math.min(f[1], 1000)) check('chain_' + st.name, false, 'only ' + carried.amount + ' mB carried')
      else note('chain_' + st.name, carried.amount + ' mB ' + carried.id + ' came from the stage before')
    })
  }

  // the first shape with plant casing tier 3: GT--'s preview as drawn. Reads its voltage cap, then finds the wall cells for more hatches
  function onPreview(ctrl, P, tier) {
    var pre = readout(ctrl)
    var verdicts = Object.keys(pre.said).map(function (k) { return pre.said[k] })
    if (pre.tier >= 0 && pre.tier < HV) {
      check('casing_voltage_cap', verdicts.every(function (v) { return v === 'refused' }),
        'the preview with plant casing tier ' + tier + ' refuses every 480 EU/t stage, as GT-- caps the recipe voltage at the machine casings: ' + pre.text)
    } else {
      note('casing_voltage_cap', 'the preview\'s machine casings are not below HV here: ' + pre.text)
    }
    var found = probe(ctrl, IN_HATCH)
    var cat = probe(ctrl, CATALYST_HATCH)
    var outs = probe(ctrl, OUT_HATCH)
    var keys = Object.keys(found.accepted)
    var catKeys = Object.keys(cat.accepted)
    var cap = 0
    try { cap = Number(P.hatchIn[0].tank.getTankCapacity(0)) } catch (e) { cap = -1 }
    note('probe', 'unchanged preview matches ' + found.base + '; ' + keys.length + ' of ' + found.tried + ' open-side casing cells accept an HV input hatch (' + JSON.stringify(found.seen) + '), ' +
      catKeys.length + ' accept a catalyst hatch, ' + Object.keys(outs.accepted).length + ' an HV output hatch; first ' + keys.slice(0, 3).join(' | ') + '; preview input hatches ' + P.hatchIn.length + ', one HV hatch holds ' + cap + ' mB')
    var need = NEED_HATCHES - 1
    if (keys.length < need || catKeys.length < 1) {
      check('input_hatches', false, 'the plant accepts ' + keys.length + ' extra HV input hatches and ' + catKeys.length + ' catalyst hatches; the cycle needs ' + NEED_HATCHES + ' fluid inputs and a catalyst hatch')
      S.ctrl = ctrl
      S.P = P
      finish()
      return
    }
    S.extra = {}
    keys.slice(0, need).forEach(function (k) { S.extra[k] = found.accepted[k] })
    var catKey = catKeys.filter(function (k) { return !S.extra[k] })[0]
    if (catKey) S.extra[catKey] = cat.accepted[catKey]
    // the peroxide recipe makes two fluids (peroxide and EAQ), so a second output hatch is needed
    var outKey = Object.keys(outs.accepted).filter(function (k) { return !S.extra[k] })[0]
    if (outKey) S.extra[outKey] = outs.accepted[outKey]
    // the same shape again, as the HV build with the extra hatches
    S.phase = 'shape'
    S.shapeIx--
  }

  // the same shape as the HV build: the plant that runs the cycle
  function onHvBuild(ctrl, P, tier) {
    S.ctrl = ctrl
    S.P = P
    check('formed', true, S.placed.size + ', plant casing tier ' + tier + ', ' + S.placed.rebuilt + ' blocks of the HV build; ' + readout(ctrl).text + '; parts: ' + partList(P))
    check('input_hatches', P.hatchIn.length >= NEED_HATCHES, P.hatchIn.length + ' HV input hatches formed, one holds ' + (function () { try { return Number(P.hatchIn[0].tank.getTankCapacity(0)) } catch (e) { return -1 } })() + ' mB')
    if (P.hatchIn.length < NEED_HATCHES) { finish(); return }
    S.phase = 'stage'
  }

  function step() {
    S.tick++
    if (S.phase === 'warmup') {
      if (S.tick >= 40) { S.phase = 'shape'; S.shapeIx = -1 }
      return
    }
    if (S.phase === 'shape') { nextShape(); return }
    if (S.phase === 'forming') {
      var ctrl = machineAt(S.placed.ctrlPos)
      if (!ctrl) {
        check('place_' + S.shapeIx, false, 'no machine at the controller block')
        S.phase = 'shape'
        return
      }
      if (!formed(ctrl)) {
        if (S.tick - S.t0 < 60) return
        check('formed_shape_' + S.shapeIx + (S.extra ? '_hv_build' : ''), false, 'shape ' + S.placed.size + ' did not form: ' + patternError(ctrl))
        // the HV build reuses this shape's hatch cells: another shape cannot stand in for it
        if (S.extra) { finish(); return }
        S.phase = 'shape'
        return
      }
      var P = classify(ctrl)
      var tier = tierOf(ctrl)
      S.tiers.push(tier)
      note('shape_' + S.shapeIx + (S.extra ? '_hv_build' : ''), S.placed.size + ', plant casing tier ' + tier + ', hv energy hatches ' + S.placed.swapped + ', hv hatches added ' + S.placed.hatches + ', blocks rebuilt ' + S.placed.rebuilt + ', parts: ' + partList(P))
      if (!S.best || tier > S.best.tier) S.best = { ctrl: ctrl, P: P, tier: tier }
      if (tier >= 3 && !S.extra) { onPreview(ctrl, P, tier); return }
      if (tier >= 3) { onHvBuild(ctrl, P, tier); return }
      if (S.extra) { check('formed', false, 'the HV build formed with plant casing tier ' + tier); finish(); return }
      S.phase = 'shape'
      return
    }
    if (S.phase === 'stage') { stageStartChained(); return }
    if (S.phase === 'running') {
      if (stageDone()) S.phase = 'stage'
    }
  }

  ServerEvents.customCommand('gg_test_hv_propellants', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      step()
    } catch (e) {
      if (S === null) S = { server: event.server, level: event.server.getLevel(DIM), failed: 0, finished: false }
      check('exception', false, String(e) + ' @' + String(e.stack || '').split('\n').slice(0, 3).join(' '))
      finish()
    }
  })
})()
