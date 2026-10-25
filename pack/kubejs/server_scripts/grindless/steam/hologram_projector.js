// -----------------------------------------------------------------------------------------------
// Hologram Projector (grindless:hologram_projector): what it does with a multiblock controller. GTM's Terminal (gtceu:terminal)
// does exactly the same in this pack.
//
//   right-click            the server tells the client to show the hologram: GTM's own in-world preview of the structure, for
//                          30 s (client_scripts/grindless/hologram_projector.js; a second click on the same controller hides it)
//   sneak + right-click    builds the structure from the player's inventory:
//     - only each cell's default blocks: the options of the cell's pattern predicate that are not GT machines (casings, coils,
//       glass, frames, pipes, our oneOf casings...). Hatches, buses, mufflers, maintenance and every other part (any GT machine
//       block) are never placed. A cell whose only options are parts is left empty and listed ("parts go here");
//     - several default options in one cell: per option group (one of GTM's simple predicates: the coils, a list of glass or
//       pipe casings...) the option already in the structure, else the first option the player has enough of for every cell
//       that starts with it, else the first option they have at all; a cell falls back to its next option when the stock of
//       its first one runs out. GTM only forms with one coil type, so one option per group keeps the structure formable;
//     - only air and replaceable blocks (grass, snow layers, fluids...) are filled; any other block, and a block in a cell that
//       must stay air, is left as it is and listed;
//     - survival: one item from the main inventory or the off hand per block placed; creative: no items;
//     - every placement fires Forge's place event (FTB Chunks claims) and respects spawn protection;
//     - repeating aisles (GTM's distillation tower, assembly line...) are built at their minimum: the size GTM's own auto-build
//       uses and the first page of its preview, which is the hologram;
//     - the report goes to the chat (placed, missing with counts, part cells, the parts the structure still needs to form,
//       blocks left as they are) and a summary to the action bar.
//
// Generic over GTM's BlockPattern: every multiblock (GTM, GCYM, GTCA, GT--, GCYR and ours) is read through the pattern's predicate
// grid, which GTM 7.5.3 keeps protected (BlockPattern#blockMatches, #centerOffset). Gregtech Terminals (gtceuterminal 6.8.5, MIT,
// in the pack) reads it with reflection in its public BlockPatternReflection.getBlockMatches / getCenterOffset, which is what this
// script calls (KubeJS denies java.lang.reflect). The cell positions are GTM's private BlockPattern#setActualRelativeOffset, written
// again below, for the controller's facing, upwards facing and flip; each cell is tested with GTM's own predicates.
//
// GTM's Terminal: GTM 7.5.3 gives it a sneak + right-click auto-build (BlockPattern#autoBuild) that fills a cell with a hatch while
// a part's minimum count isn't met, and otherwise with the first inventory stack that matches any candidate, hatches included.
// Here its clicks on a controller run the projector instead, so it never places a part either. It keeps GTM's recipe (it needs a
// book, so it is not a Steam Age item in the validator; the projector is), its quest and its id.
//
// Published for the test (tools/test/overlay/kubejs/server_scripts/gg_test_projector.js): global.grindless.projector
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
(function () {
  var G = global.grindless || (global.grindless = {})
  var ITEM = 'grindless:hologram_projector'
  var TERMINAL = 'gtceu:terminal'
  var CHANNEL = 'grindless_projector'
  var HOLOGRAM_TICKS = 600
  var COOLDOWN_TICKS = 8
  var LIST_MAX = 6
  var LOG = '[grindless/projector] '

  // ---------------------------------------------------------------- Java classes (loaded on first use)
  var J = null
  function lazy() {
    if (J !== null) return J
    var j = {
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      IMultiController: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.multiblock.IMultiController'),
      IMachineBlock: Java.loadClass('com.gregtechceu.gtceu.api.block.IMachineBlock'),
      MultiblockState: Java.loadClass('com.gregtechceu.gtceu.api.pattern.MultiblockState'),
      IdentityHashMap: Java.loadClass('java.util.IdentityHashMap'),
      CollisionContext: Java.loadClass('net.minecraft.world.phys.shapes.CollisionContext'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      ForgeRegistries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      BlockSnapshot: Java.loadClass('net.minecraftforge.common.util.BlockSnapshot'),
      ForgeEventFactory: Java.loadClass('net.minecraftforge.event.ForgeEventFactory'),
      BPR: null,
      bprError: ''
    }
    try {
      j.BPR = Java.loadClass('com.gtceuterminal.common.compat.BlockPatternReflection')
    } catch (e) {
      j.bprError = String(e)
      console.error(LOG + 'Gregtech Terminals BlockPatternReflection is missing: the projector cannot read patterns (' + e + ')')
    }
    J = j
    return J
  }

  // ---------------------------------------------------------------- GTM 7.5.3 geometry (BlockPattern#setActualRelativeOffset)
  var CW = { north: 'east', east: 'south', south: 'west', west: 'north' }
  var CCW = { north: 'west', west: 'south', south: 'east', east: 'north' }
  var OPP = { north: 'south', south: 'north', east: 'west', west: 'east', up: 'down', down: 'up' }
  var STEP = { north: [0, 0, -1], south: [0, 0, 1], east: [1, 0, 0], west: [-1, 0, 0], up: [0, 1, 0], down: [0, -1, 0] }

  // RelativeDirection#getActualDirection
  function actual(rel, dir) {
    switch (rel) {
      case 'UP': return dir === 'up' || dir === 'down' ? 'north' : 'up'
      case 'DOWN': return dir === 'up' || dir === 'down' ? 'south' : 'down'
      case 'LEFT': return dir === 'up' ? 'east' : dir === 'down' ? 'west' : CCW[dir]
      case 'RIGHT': return dir === 'up' ? 'west' : dir === 'down' ? 'east' : CW[dir]
      case 'FRONT': return dir
      case 'BACK': return OPP[dir]
    }
    throw new Error('unknown relative direction ' + rel)
  }

  // pattern coordinates (char, row, aisle) relative to the controller -> world offset; the same branches as GTM's private method
  function relOffset(dirs, x, y, z, facing, up, flipped) {
    var c0 = [x, y, z]
    var c1 = [0, 0, 0]
    var tmp
    function put(d, v) {
      if (d === 'up') c1[1] = v
      else if (d === 'down') c1[1] = -v
      else if (d === 'west') c1[0] = -v
      else if (d === 'east') c1[0] = v
      else if (d === 'north') c1[2] = -v
      else if (d === 'south') c1[2] = v
    }
    var i
    if (facing === 'up' || facing === 'down') {
      var of = facing === 'down' ? up : OPP[up]
      for (i = 0; i < 3; i++) put(actual(dirs[i], of), c0[i])
      var xOff = STEP[up][0]
      var zOff = STEP[up][2]
      if (xOff === 0) {
        tmp = c1[2]
        c1[2] = zOff > 0 ? c1[1] : -c1[1]
        c1[1] = zOff > 0 ? -tmp : tmp
      } else {
        tmp = c1[0]
        c1[0] = xOff > 0 ? c1[1] : -c1[1]
        c1[1] = xOff > 0 ? -tmp : tmp
      }
      if (flipped) {
        if (up === 'north' || up === 'south') c1[0] = -c1[0]
        else c1[2] = -c1[2]
      }
    } else {
      for (i = 0; i < 3; i++) put(actual(dirs[i], facing), c0[i])
      if (up === 'west' || up === 'east') {
        var side = up === 'east' ? CW[facing] : OPP[CW[facing]]
        var xo = STEP[side][0]
        var zo = STEP[side][2]
        if (xo === 0) {
          tmp = c1[2]
          c1[2] = zo > 0 ? -c1[1] : c1[1]
          c1[1] = zo > 0 ? tmp : -tmp
        } else {
          tmp = c1[0]
          c1[0] = xo > 0 ? -c1[1] : c1[1]
          c1[1] = xo > 0 ? tmp : -tmp
        }
      } else if (up === 'south') {
        c1[1] = -c1[1]
        if (STEP[facing][0] === 0) c1[0] = -c1[0]
        else c1[2] = -c1[2]
      }
      if (flipped) {
        if (up === 'north' || up === 'south') {
          if (facing === 'north' || facing === 'south') c1[0] = -c1[0]
          else c1[2] = -c1[2]
        } else {
          c1[1] = -c1[1]
        }
      }
    }
    return c1
  }

  // every cell of the pattern at its minimum repetitions, as GTM's BlockPattern#autoBuild walks it: aisle, repetition, row, char.
  // The first aisle starts at -centerOffset[3] (the minimum length of the aisles before the controller's), so the controller's aisle
  // lands on the controller even when an aisle before it repeats (GTM's autoBuild starts at the maximum, -centerOffset[4]).
  function cellsOf(pattern, facing, up, flipped) {
    var j = lazy()
    if (j.BPR === null) throw new Error('Gregtech Terminals BlockPatternReflection is missing (' + j.bprError + ')')
    var m = j.BPR.getBlockMatches(pattern)
    var co = j.BPR.getCenterOffset(pattern)
    if (m === null || m === undefined || co === null || co === undefined) throw new Error('BlockPatternReflection could not read the pattern')
    var reps = pattern.aisleRepetitions
    var sd = pattern.structureDir
    var dirs = [String(sd[0]), String(sd[1]), String(sd[2])]
    var cx = Number(co[0])
    var cy = Number(co[1])
    var finger = m.length
    var thumb = finger > 0 ? m[0].length : 0
    var palm = thumb > 0 ? m[0][0].length : 0
    var out = []
    var z = -Number(co[3])
    for (var c = 0; c < finger; c++) {
      var n = Number(reps[c][0])
      for (var r = 0; r < n; r++) {
        for (var b = 0; b < thumb; b++) {
          for (var a = 0; a < palm; a++) {
            var o = relOffset(dirs, a - cx, b - cy, z, facing, up, flipped)
            out.push({ pred: m[c][b][a], dx: o[0], dy: o[1], dz: o[2], layer: c + ':' + r })
          }
        }
        z++
      }
    }
    return out
  }

  // ---------------------------------------------------------------- what a cell's predicate offers
  function newCache() {
    var j = lazy()
    return { preds: new j.IdentityHashMap(), predList: [], sps: new j.IdentityHashMap(), spList: [], blocks: {} }
  }

  // a candidate block of a predicate: a GT machine (a part, never placed) or a block with an item to place it from
  function candidate(state, cache) {
    var j = lazy()
    var block = state.getBlock()
    var id = String(j.ForgeRegistries.BLOCKS.getKey(block))
    var key = id + '|' + String(state)
    var hit = cache.blocks[key]
    if (hit) return hit
    var item = block.asItem()
    var itemId = String(j.ForgeRegistries.ITEMS.getKey(item))
    var c = {
      id: id,
      state: state,
      machine: block instanceof j.IMachineBlock,
      item: itemId === 'minecraft:air' ? '' : itemId,
      nameKey: itemId === 'minecraft:air' ? String(block.getDescriptionId()) : String(item.getDescriptionId())
    }
    cache.blocks[key] = c
    return c
  }

  // one of GTM's SimplePredicates: its limits and its candidates, split into default blocks and parts
  function spInfo(sp, cache) {
    var hit = cache.sps.get(sp)
    if (hit !== null && hit !== undefined) return cache.spList[Number(hit)]
    var s = {
      index: cache.spList.length,
      raw: sp,
      type: String(sp.type),
      min: Number(sp.minCount),
      max: Number(sp.maxCount),
      maxLayer: Number(sp.maxLayerCount),
      blocks: [],
      parts: [],
      other: 0,
      present: 0,
      placed: 0,
      layers: {},
      existing: {},
      choice: null,
      need: 0
    }
    var infos = null
    try {
      var sup = sp.candidates
      infos = sup === null || sup === undefined ? null : sup.get()
    } catch (e) {
      infos = null
    }
    var seen = {}
    if (infos !== null && infos !== undefined) {
      for (var i = 0; i < infos.length; i++) {
        var state = infos[i].getBlockState()
        if (state.isAir()) continue
        var cand = candidate(state, cache)
        var k = cand.id + '|' + String(cand.state)
        if (seen[k]) continue
        seen[k] = true
        if (cand.machine) s.parts.push(cand)
        else if (cand.item !== '') s.blocks.push(cand)
        else s.other++
      }
    }
    cache.sps.put(sp, s.index)
    cache.spList.push(s)
    return s
  }

  // a TraceabilityPredicate: its simple predicates in GTM's order (limited, sorted by minimum, then common), its default options
  // (the simple predicates that offer a block to place) and its part options
  function analyse(pred, cache) {
    var hit = cache.preds.get(pred)
    if (hit !== null && hit !== undefined) return cache.predList[Number(hit)]
    var info = {
      controller: pred.isController === true,
      any: pred.isAny() === true,
      air: pred.isAir() === true,
      sps: [],
      options: [],
      partSps: []
    }
    var lists = [pred.limited, pred.common]
    for (var li = 0; li < lists.length; li++) {
      var list = lists[li]
      for (var i = 0; i < list.size(); i++) {
        var s = spInfo(list.get(i), cache)
        info.sps.push(s)
        if (s.blocks.length > 0) info.options.push(s)
        else if (s.parts.length > 0) info.partSps.push(s)
      }
    }
    cache.preds.put(pred, cache.predList.length)
    cache.predList.push(info)
    return info
  }

  // ---------------------------------------------------------------- inventories
  // A source is where the blocks come from: the player's main inventory and off hand, or (tests) any vanilla Container.
  function containerSource(container, slots, creative, player) {
    var list = slots
    if (!list) {
      list = []
      for (var i = 0; i < container.getContainerSize(); i++) list.push(i)
    }
    return {
      creative: creative === true,
      player: player || null,
      counts: function () {
        var m = {}
        list.forEach(function (slot) {
          var st = container.getItem(slot)
          if (st.isEmpty()) return
          var id = String(st.getId())
          m[id] = (m[id] || 0) + Number(st.getCount())
        })
        return m
      },
      take: function (itemId) {
        for (var k = 0; k < list.length; k++) {
          var st = container.getItem(list[k])
          if (!st.isEmpty() && String(st.getId()) === itemId) {
            st.shrink(1)
            container.setChanged()
            return true
          }
        }
        return false
      }
    }
  }

  function playerSource(player) {
    var slots = []
    for (var i = 0; i < 36; i++) slots.push(i)
    slots.push(40)
    return containerSource(player.getInventory(), slots, player.isCreative() === true, player)
  }

  // ---------------------------------------------------------------- the build
  function controllerAt(level, pos) {
    var j = lazy()
    var machine = j.MetaMachine.getMachine(level, pos)
    if (machine === null || machine === undefined || !(machine instanceof j.IMultiController)) return null
    return machine
  }

  // GTM's own test of a simple predicate, without the global/layer counting of testLimited
  function testRaw(s, ws) {
    try {
      return s.raw.predicate.test(ws) === true
    } catch (e) {
      return false
    }
  }

  function bump(map, key, n) {
    map[key] = (map[key] || 0) + (n === undefined ? 1 : n)
  }

  // the option a group uses: the one already in the structure, else the first the source has enough of for the cells that start
  // with it, else the first it has at all, else the first
  function choose(s, stock, creative) {
    var best = null
    var bestN = 0
    Object.keys(s.existing).forEach(function (id) {
      if (s.existing[id] > bestN) {
        best = id
        bestN = s.existing[id]
      }
    })
    var i
    if (best !== null) {
      for (i = 0; i < s.blocks.length; i++) if (s.blocks[i].id === best) return s.blocks[i]
    }
    if (creative) return s.blocks[0]
    if (s.need > 0) {
      for (i = 0; i < s.blocks.length; i++) if ((stock[s.blocks[i].item] || 0) >= s.need) return s.blocks[i]
    }
    for (i = 0; i < s.blocks.length; i++) if ((stock[s.blocks[i].item] || 0) > 0) return s.blocks[i]
    return s.blocks[0]
  }

  function maxed(s, layer) {
    if (s.max >= 0 && s.present + s.placed >= s.max) return true
    if (s.maxLayer >= 0 && (s.layers[layer] || 0) >= s.maxLayer) return true
    return false
  }

  // scans the structure of the controller at pos and, unless dry, places what the source has; returns the result (plain data)
  function run(level, pos, source, dry) {
    var j = lazy()
    var res = {
      ok: false, error: '', machine: '', nameKey: '', formed: false, facing: '', up: '', flipped: false, creative: source.creative,
      controller: { x: pos.getX(), y: pos.getY(), z: pos.getZ() }, cells: [], total: 0, present: 0,
      placed: {}, placedTotal: 0, missing: {}, missingTotal: 0, parts: [], needs: [], blocked: [], air: 0
    }
    var ctrl = controllerAt(level, pos)
    if (ctrl === null) {
      res.error = 'not a multiblock controller'
      return res
    }
    var self = ctrl.self()
    var def = self.getDefinition()
    res.machine = String(def.getId())
    res.nameKey = String(def.getDescriptionId())
    res.formed = ctrl.isFormed() === true
    res.facing = String(self.getFrontFacing())
    res.up = String(self.getUpwardsFacing())
    res.flipped = self.isFlipped() === true
    var raw = cellsOf(ctrl.getPattern(), res.facing, res.up, res.flipped)
    var cache = newCache()
    var ws = new j.MultiblockState(level, pos)
    ws.clean()

    // 1. what each cell holds and what it accepts, with GTM's own predicates (one state for the scan, as GTM's check: the coil
    //    type seen first is the one every other coil cell must match)
    var cells = []
    raw.forEach(function (rc) {
      var info = analyse(rc.pred, cache)
      if (info.any) return
      var p = new BlockPos(pos.getX() + rc.dx, pos.getY() + rc.dy, pos.getZ() + rc.dz)
      var cell = { x: p.getX(), y: p.getY(), z: p.getZ(), pos: p, info: info, layer: rc.layer, kind: '', block: null, now: '' }
      cells.push(cell)
      if (info.controller) {
        cell.kind = 'controller'
        return
      }
      if (ws.update(p, rc.pred) !== true) {
        cell.kind = 'unloaded'
        return
      }
      var st = level.getBlockState(p)
      cell.now = String(j.ForgeRegistries.BLOCKS.getKey(st.getBlock()))
      var matched = info.sps.filter(function (s) { return testRaw(s, ws) })
      if (matched.length > 0) {
        cell.kind = 'ok'
        matched.forEach(function (s) {
          s.present++
          bump(s.layers, cell.layer)
          if (s.blocks.length > 0) bump(s.existing, cell.now)
        })
        if (info.air) res.air++
        return
      }
      var empty = st.isAir() || st.canBeReplaced() === true
      if (!empty) {
        cell.kind = 'blocked'
        cell.reason = 'wrong'
      } else if (info.air) {
        cell.kind = 'blocked'
        cell.reason = 'air'
      } else if (info.options.length > 0) {
        cell.kind = 'fill'
      } else {
        cell.kind = 'parts'
      }
    })

    // 2. one option per group, then cell by cell: the first option not at its maximum that the source still has
    var stock = source.creative ? {} : source.counts()
    var fills = cells.filter(function (c) { return c.kind === 'fill' })
    fills.forEach(function (c) {
      for (var k = 0; k < c.info.options.length; k++) {
        if (!maxed(c.info.options[k], c.layer)) {
          c.info.options[k].need++
          break
        }
      }
    })
    cache.spList.forEach(function (s) { if (s.blocks.length > 0) s.choice = choose(s, stock, source.creative) })
    fills.forEach(function (c) {
      var first = null
      var pick = null
      for (var k = 0; k < c.info.options.length; k++) {
        var s = c.info.options[k]
        if (maxed(s, c.layer)) continue
        if (first === null) first = s
        if (source.creative || (stock[s.choice.item] || 0) > 0) {
          pick = s
          break
        }
      }
      if (pick !== null) {
        c.kind = 'place'
        c.block = pick.choice
        c.group = pick
        pick.placed++
        bump(pick.layers, c.layer)
        if (!source.creative) stock[pick.choice.item]--
      } else if (first !== null) {
        c.kind = 'missing'
        c.block = first.choice
      } else {
        // every default option of the cell is at its maximum: only its parts are left
        c.kind = 'parts'
      }
    })

    // 3. placing, bottom first; one item per block in survival
    var player = source.player
    var placedAny = null
    cells.filter(function (c) { return c.kind === 'place' }).sort(function (a, b) { return a.y - b.y }).forEach(function (c) {
      if (dry) return
      if (level.isUnobstructed(c.block.state, c.pos, j.CollisionContext.empty()) !== true) {
        c.kind = 'blocked'
        c.reason = 'entity'
        return
      }
      if (player !== null && level.mayInteract(player, c.pos) !== true) {
        c.kind = 'blocked'
        c.reason = 'protected'
        return
      }
      var snap = player !== null ? j.BlockSnapshot.create(dimensionKey(level), level, c.pos) : null
      level.setBlock(c.pos, c.block.state, 3)
      if (player !== null && j.ForgeEventFactory.onBlockPlace(player, snap, j.Direction.UP) === true) {
        snap.restore(true, false)
        c.kind = 'blocked'
        c.reason = 'protected'
        return
      }
      if (!source.creative) source.take(c.block.item)
      placedAny = c.block
    })

    // 4. the report
    cells.forEach(function (c) {
      res.total++
      if (c.kind === 'ok') res.present++
      if (c.kind === 'place') {
        bump(res.placed, c.block.item)
        res.placedTotal++
      } else if (c.kind === 'missing') {
        bump(res.missing, c.block.item)
        res.missingTotal++
      } else if (c.kind === 'parts') {
        var cands = []
        c.info.partSps.forEach(function (s) { s.parts.forEach(function (p) { cands.push(p) }) })
        res.parts.push({ x: c.x, y: c.y, z: c.z, id: cands.length > 0 ? cands[0].id : '', nameKey: cands.length > 0 ? cands[0].nameKey : '', options: cands.length })
      } else if (c.kind === 'blocked' || c.kind === 'unloaded') {
        res.blocked.push({ x: c.x, y: c.y, z: c.z, block: c.now, reason: c.kind === 'unloaded' ? 'unloaded' : c.reason })
      }
      res.cells.push({
        x: c.x, y: c.y, z: c.z, kind: c.kind, block: c.block === null ? '' : c.block.id, now: c.now,
        accepts: acceptsOf(c.info)
      })
    })
    // parts the structure still needs to form: GTM's minimum count of each part option, less what is already there
    cache.spList.forEach(function (s) {
      if (s.blocks.length > 0 || s.parts.length === 0 || s.min <= 0) return
      var n = s.min - s.present
      if (n > 0) res.needs.push({ id: s.parts[0].id, nameKey: s.parts[0].nameKey, n: n, options: s.parts.length })
    })
    if (placedAny !== null && !dry) playPlaceSound(level, pos, placedAny)
    res.ok = true
    return res
  }

  function acceptsOf(info) {
    var ids = []
    info.sps.forEach(function (s) {
      s.blocks.forEach(function (b) { ids.push(b.id) })
      s.parts.forEach(function (b) { ids.push(b.id) })
    })
    return ids
  }

  // KubeJS calls Level#dimension() getDimensionKey for scripts
  function dimensionKey(level) {
    if (typeof level.getDimensionKey === 'function') return level.getDimensionKey()
    return level.dimension()
  }

  function playPlaceSound(level, pos, cand) {
    try {
      var sound = cand.state.getSoundType().getPlaceSound()
      level.playSound(null, pos, sound, Java.loadClass('net.minecraft.sounds.SoundSource').BLOCKS, 1.0, 0.8)
    } catch (e) {
      // a sound is only a nicety
    }
  }

  // ---------------------------------------------------------------- a definition's pattern without a world (the test's survey)
  function survey(def) {
    var out = { id: String(def.getId()), ok: false, error: '', cells: 0, controller: 0, any: 0, air: 0, fill: 0, multi: 0, parts: 0, other: 0 }
    try {
      var raw = cellsOf(def.getPatternFactory().get(), 'north', 'north', false)
      var cache = newCache()
      raw.forEach(function (rc) {
        var info = analyse(rc.pred, cache)
        if (info.any) {
          out.any++
          return
        }
        out.cells++
        if (info.controller) out.controller++
        else if (info.air) out.air++
        else if (info.options.length > 0) {
          out.fill++
          var n = 0
          info.options.forEach(function (s) { n += s.blocks.length })
          if (n > 1) out.multi++
        } else if (info.partSps.length > 0) out.parts++
        else out.other++
      })
      out.ok = out.controller === 1
      if (!out.ok) out.error = out.controller + ' controller cells'
    } catch (e) {
      out.error = String(e)
    }
    return out
  }

  // ---------------------------------------------------------------- messages
  function name(key) {
    return Text.translate(key)
  }

  function joined(parts) {
    var line = Text.of('')
    parts.forEach(function (p, i) {
      if (i > 0) line = line.append(', ')
      line = line.append(p)
    })
    return line
  }

  function more(list, render) {
    var shown = list.slice(0, LIST_MAX).map(render)
    if (list.length > LIST_MAX) shown.push(Text.translate('message.grindless.projector.more', String(list.length - LIST_MAX)))
    return joined(shown)
  }

  function counted(map, keys) {
    var ids = Object.keys(map).sort(function (a, b) { return map[b] - map[a] || (a < b ? -1 : 1) })
    return more(ids, function (id) { return Text.translate('message.grindless.projector.count', String(map[id]), name(keys[id])) })
  }

  function partName(p) {
    var n = name(p.nameKey)
    return p.options > 1 ? Text.translate('message.grindless.projector.or_similar', n) : n
  }

  function at(p) {
    return String(p.x) + ' ' + String(p.y) + ' ' + String(p.z)
  }

  function itemKeys(res) {
    var keys = {}
    Object.keys(res.placed).concat(Object.keys(res.missing)).forEach(function (id) {
      try {
        keys[id] = String(Item.of(id).getItem().getDescriptionId())
      } catch (e) {
        keys[id] = id
      }
    })
    return keys
  }

  // chat lines of a build
  function report(res) {
    var lines = []
    var keys = itemKeys(res)
    lines.push(Text.translate('message.grindless.projector.header', name(res.nameKey)).gold())
    if (res.placedTotal > 0) lines.push(Text.translate('message.grindless.projector.placed', String(res.placedTotal), counted(res.placed, keys)).green())
    if (res.missingTotal > 0) lines.push(Text.translate('message.grindless.projector.missing', String(res.missingTotal), counted(res.missing, keys)).red())
    if (res.parts.length > 0) {
      lines.push(Text.translate('message.grindless.projector.parts', String(res.parts.length), more(res.parts, function (p) {
        return Text.translate('message.grindless.projector.at', partName(p), at(p))
      })).yellow())
    }
    if (res.needs.length > 0) {
      lines.push(Text.translate('message.grindless.projector.needs', more(res.needs, function (n) {
        return Text.translate('message.grindless.projector.count', String(n.n), partName(n))
      })).yellow())
    }
    if (res.blocked.length > 0) {
      lines.push(Text.translate('message.grindless.projector.blocked', String(res.blocked.length), more(res.blocked, function (b) {
        return Text.translate('message.grindless.projector.at', blockName(b.block), at(b))
      })).gray())
    }
    if (res.placedTotal === 0 && res.missingTotal === 0) lines.push(Text.translate('message.grindless.projector.complete').green())
    return lines
  }

  function blockName(id) {
    try {
      return name(String(lazy().ForgeRegistries.BLOCKS.getValue(new ResourceLocation(id)).getDescriptionId()))
    } catch (e) {
      return Text.of(id)
    }
  }

  function summary(res) {
    return Text.translate('message.grindless.projector.summary', String(res.placedTotal), String(res.missingTotal), String(res.parts.length),
      String(res.blocked.length))
  }

  // ---------------------------------------------------------------- clicks
  // a held right-click repeats every 4 ticks: only the first click counts until the button has been released for COOLDOWN_TICKS
  var lastUse = {}

  // what a click with the projector (or GTM's Terminal) on a controller does; returns what happened, for the test
  function click(player, level, pos, sneaking, itemId) {
    var ctrl = controllerAt(level, pos)
    var key = String(player.getUuid())
    var now = Number(level.getServer().getTickCount())
    var out = { kind: '', item: itemId, sneaking: sneaking, result: null, at: now }
    var last = lastUse[key]
    lastUse[key] = now
    if (last !== undefined && now - last < COOLDOWN_TICKS) {
      out.kind = 'cooldown'
      return out
    }
    var nameKey = String(ctrl.self().getDefinition().getDescriptionId())
    if (ctrl.isFormed()) {
      out.kind = 'formed'
      player.setStatusMessage(Text.translate('message.grindless.projector.formed', name(nameKey)))
      return out
    }
    if (!sneaking) {
      out.kind = 'hologram'
      player.sendData(CHANNEL, { x: pos.getX(), y: pos.getY(), z: pos.getZ(), ticks: HOLOGRAM_TICKS, machine: String(ctrl.self().getDefinition().getId()) })
      return out
    }
    out.kind = 'build'
    var res = run(level, pos, playerSource(player), false)
    out.result = res
    if (!res.ok) {
      player.setStatusMessage(Text.translate('message.grindless.projector.unreadable', name(nameKey)).red())
      return out
    }
    report(res).forEach(function (line) { player.tell(line) })
    player.setStatusMessage(summary(res))
    return out
  }

  BlockEvents.rightClicked(function (event) {
    var stack = event.getItem()
    if (stack === null || stack === undefined || stack.isEmpty()) return
    var itemId = String(stack.getId())
    if (itemId !== ITEM && itemId !== TERMINAL) return
    var level = event.getLevel()
    var pos = event.getBlock().getPos()
    if (controllerAt(level, pos) === null) return
    var player = event.getPlayer()
    try {
      P.last = click(player, level, pos, player.isShiftKeyDown() === true, itemId)
    } catch (e) {
      P.last = { kind: 'error', item: itemId, error: String(e) }
      console.error(LOG + 'click at ' + pos + ' with ' + itemId + ': ' + e)
      player.setStatusMessage(Text.translate('message.grindless.projector.unreadable', Text.of(String(e))).red())
    }
    // outside the try: KubeJS's cancel() ends the handler by throwing. Cancelled, the controller's screen doesn't open and GTM's
    // Terminal behaviour (BlockPattern#autoBuild) never runs
    event.cancel()
  })

  // ---------------------------------------------------------------- recipe (Steam Age: bronze, glass, redstone; a screwdriver)
  ServerEvents.recipes(function (event) {
    event.recipes.gtceu.shaped(ITEM, [' G ', 'TRT', 'PdP'], {
      G: '#forge:glass',
      T: 'minecraft:redstone_torch',
      R: 'minecraft:redstone',
      P: '#forge:plates/bronze'
    }).id('grindless:crafting/hologram_projector')
  })

  var P = (G.projector = {
    item: ITEM,
    terminal: TERMINAL,
    channel: CHANNEL,
    hologramTicks: HOLOGRAM_TICKS,
    recipe: 'grindless:crafting/hologram_projector',
    available: function () { return lazy().BPR !== null },
    // the scan without placing anything (creative choices)
    plan: function (level, pos) { return run(level, pos, { creative: true, player: null, counts: function () { return {} }, take: function () { return false } }, true) },
    build: function (level, pos, source) { return run(level, pos, source, false) },
    containerSource: containerSource,
    playerSource: playerSource,
    survey: survey,
    relOffset: relOffset,
    report: report,
    summary: summary,
    last: null
  })
})()
