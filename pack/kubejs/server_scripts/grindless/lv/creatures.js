// priority: -19224
// -----------------------------------------------------------------------------------------------
// LV era: recipes of the Creature Simulator (see startup_scripts/grindless/lv/creatures.js). Everything is generated
// from the creature table (kubejs/data/grindless/tables/mobs.json, loaded by the startup script into
// global.grindless.tables.mobs): to add a creature, add a row there.
//
//   gtceu:creature_simulation  one recipe per roll of every creature
//        model (NOT consumed) + the creature's mineral + biomass + programmed circuit (= the roll)  ->  the drops
//        EU/t of the creature (30 for LV, x4 per tier), 10 s (enderman 20 s). The model is never used up and the
//        biomass and the mineral are the only things the cycle eats: no other byproduct than the drops. The biomass of a
//        cycle (biomass_mb) is what ONE brewery of the creature's tier makes in that time: 25 mB per 10 s at LV.
//   gtceu:assembler            grindless:blank_creature_model (sensor + emitter + circuit) and, per creature, the print
//        blank model + the creature's print items  ->  grindless:creature_model_<id>   (nobody is killed)
//   crafting table             gtceu:<lv|mv|hv|ev>_creature_simulator from the voltage parts of its tier (the EV one with an HV
//                              emitter and sensor: EV's need the quantum eye, an IV resource)
//
// Helpers shared with the test overlay:
//   global.grindless.creatureTable()          normalized table: { biomass: { fluid, lvBreweryMbPerS }, printing, blank,
//                                             mobs: [ { id, tier, eut, duration, biomassMb, model, mineral, print,
//                                             rolls: [ { circuit, drops } ] } ] }
//   global.grindless.checkCreatureTable()     list of problems (empty = fine)
//   global.grindless.creatureRecipeId(mob, roll) / creaturePrintId(mob) / creatureBlankRecipeId   final recipe ids
//   global.grindless.creatureMachines()       the four machine crafting recipes ({ tier, machine, recipe, ... })
(function () {
  const G = global.grindless || (global.grindless = {})

  // voltage of every GT tier (ULV, LV, MV, HV, EV): a recipe belongs to the first tier whose voltage covers its EU/t
  const VOLTAGE = [8, 32, 128, 512, 2048]
  const MAX_ITEM_INPUTS = 3
  const MAX_DROPS = 4

  // machine hull + the parts GT's own machine recipes take for that tier (HULL, MOTOR, SENSOR, EMITTER, CIRCUIT, CABLE). `optics`
  // overrides the tier of the emitter and the sensor: EV's need GTM's quantum eye (radon), which waits for IV (docs/eras/ev.md), so
  // the EV simulator, the wither's, takes HV ones like the deep space antenna
  const MACHINE_TIERS = [
    { tier: 1, name: 'lv', circuit: '#gtceu:circuits/lv', cable: 'gtceu:tin_single_cable' },
    { tier: 2, name: 'mv', circuit: '#gtceu:circuits/mv', cable: 'gtceu:copper_single_cable' },
    { tier: 3, name: 'hv', circuit: '#gtceu:circuits/hv', cable: 'gtceu:gold_single_cable' },
    { tier: 4, name: 'ev', circuit: '#gtceu:circuits/ev', cable: 'gtceu:aluminium_single_cable', optics: 'hv' }
  ]

  // blank creature model: sensor (sees the creature) + emitter (projects it) + circuit (remembers it)
  const BLANK = {
    inputs: ['gtceu:lv_sensor', 'gtceu:lv_emitter', '#gtceu:circuits/lv'],
    eut: 30,
    duration: 200
  }

  function tierOfEut(eut) {
    for (var i = 0; i < VOLTAGE.length; i++) {
      if (eut <= VOLTAGE[i]) return i
    }
    return VOLTAGE.length
  }

  function fluidExists(id) {
    var registry = Java.loadClass('net.minecraftforge.registries.ForgeRegistries').FLUIDS
    return registry.containsKey(new ResourceLocation(id))
  }

  // tags are not checked here (they are filled by the datapack, after the registries)
  function itemExists(id) {
    return String(id).charAt(0) === '#' || Item.exists(id)
  }

  function tagHasItems(tag) {
    return Ingredient.of(tag).getItemIds().size() > 0
  }

  function ingredientExists(id) {
    return String(id).charAt(0) === '#' ? tagHasItems(id) : Item.exists(id)
  }

  G.creatureBlankRecipeId = 'grindless:assembler/blank_creature_model'

  G.creatureRecipeId = function (mob, roll) {
    return 'grindless:creature_simulation/' + mob.id + '/circuit_' + roll.circuit
  }

  G.creaturePrintId = function (mob) {
    return 'grindless:assembler/creature_model/' + mob.id
  }

  G.creatureMachines = function () {
    return MACHINE_TIERS.map(function (t) {
      return {
        tier: t.tier,
        name: t.name,
        machine: 'gtceu:' + t.name + '_creature_simulator',
        recipe: 'grindless:crafting/' + t.name + '_creature_simulator',
        keys: {
          C: t.circuit,
          E: 'gtceu:' + (t.optics || t.name) + '_emitter',
          W: t.cable,
          H: 'gtceu:' + t.name + '_machine_hull',
          M: 'gtceu:' + t.name + '_electric_motor',
          S: 'gtceu:' + (t.optics || t.name) + '_sensor'
        }
      }
    })
  }

  G.creatureBlank = function () {
    return { inputs: BLANK.inputs.slice(), eut: BLANK.eut, duration: BLANK.duration }
  }

  G.creatureTable = function () {
    var raw = (G.tables && G.tables.mobs) || G.readJsonTable('kubejs/data/grindless/tables/mobs.json')
    return {
      biomass: { fluid: raw.biomass.fluid, lvBreweryMbPerS: raw.biomass.lv_brewery_mb_per_s },
      printing: { eut: raw.printing.eut, duration: raw.printing.duration },
      blank: 'grindless:blank_creature_model',
      mobs: raw.mobs.map(function (m) {
        return {
          id: m.id,
          tier: m.tier,
          color: m.color,
          name: m.name,
          eut: m.eut,
          duration: m.duration,
          biomassMb: m.biomass_mb,
          model: 'grindless:creature_model_' + m.id,
          mineral: m.mineral ? { item: m.mineral.item, n: m.mineral.n || 1 } : null,
          print: (m.print || []).map(function (p) { return { item: p.item, n: p.n || 1 } }),
          rolls: (m.rolls || []).map(function (r) {
            return {
              circuit: r.circuit,
              drops: (r.drops || []).map(function (d) {
                return { item: d.item, n: d.n || 1, chance: d.chance === undefined ? 1 : d.chance }
              })
            }
          })
        }
      })
    }
  }

  G.checkCreatureTable = function () {
    var problems = []
    var t = G.creatureTable()

    if (!(t.biomass.lvBreweryMbPerS > 0)) {
      problems.push('biomass: lv_brewery_mb_per_s must be > 0')
    }
    if (!fluidExists(t.biomass.fluid)) {
      problems.push('biomass: fluid ' + t.biomass.fluid + ' does not exist')
    }
    // the prints run in the LV assembler
    if (!(t.printing.eut > 0 && t.printing.eut <= VOLTAGE[1] && t.printing.duration > 0)) {
      problems.push('printing: needs 0 < eut <= 32 (LV assembler) and duration > 0')
    }
    if (t.mobs.length === 0) problems.push('no creatures')

    var ids = {}
    var prints = {}
    t.mobs.forEach(function (mob) {
      var where = mob.id + ': '
      if (!/^[a-z0-9_]+$/.test(String(mob.id))) problems.push(where + 'id must be lower case letters, digits and _')
      if (ids[mob.id]) problems.push(where + 'duplicate id')
      ids[mob.id] = true

      if (!(mob.tier >= 1 && mob.tier <= 4)) {
        problems.push(where + 'tier ' + mob.tier + ' is not in 1..4')
      } else if (tierOfEut(mob.eut) !== mob.tier) {
        problems.push(where + 'eut ' + mob.eut + ' is tier ' + tierOfEut(mob.eut) + ', the table says tier ' + mob.tier)
      }
      if (!(mob.duration > 0)) problems.push(where + 'duration must be > 0')
      if (!(mob.biomassMb >= 1 && mob.biomassMb <= 1000)) {
        problems.push(where + 'biomass_mb ' + mob.biomassMb + ' is not in 1..1000')
      } else if (mob.duration > 0 && mob.tier >= 1 && mob.tier <= 4 && t.biomass.lvBreweryMbPerS > 0) {
        // ONE brewery of the creature's tier has to keep ONE simulator of that tier running at full speed
        var perSecond = mob.biomassMb * 20 / mob.duration
        var breweryPerSecond = t.biomass.lvBreweryMbPerS * Math.pow(2, mob.tier - 1)
        if (perSecond > breweryPerSecond + 1e-9) {
          problems.push(where + 'biomass_mb ' + mob.biomassMb + ' per ' + (mob.duration / 20) + ' s is ' + perSecond +
            ' mB/s, one brewery of its tier makes ' + breweryPerSecond + ' mB/s')
        }
      }
      if (!/^#[0-9A-Fa-f]{6}$/.test(String(mob.color))) problems.push(where + 'color must be #RRGGBB')
      if (!mob.name || !mob.name.en_us || !mob.name.es_es) problems.push(where + 'name needs en_us and es_es')
      if (!Item.exists(mob.model)) problems.push(where + 'model item ' + mob.model + ' is not registered (startup table out of sync?)')

      if (mob.mineral) {
        if (!itemExists(mob.mineral.item)) problems.push(where + 'mineral ' + mob.mineral.item + ' does not exist')
        if (!(mob.mineral.n >= 1 && mob.mineral.n <= 64)) problems.push(where + 'mineral amount is not in 1..64')
      }

      if (mob.print.length === 0) problems.push(where + 'print has no items')
      mob.print.forEach(function (p) {
        if (!itemExists(p.item)) problems.push(where + 'print item ' + p.item + ' does not exist')
        if (!(p.n >= 1 && p.n <= 64)) problems.push(where + 'print amount of ' + p.item + ' is not in 1..64')
      })
      // GTM's lookup keys items without their count: two creatures printed from the same items would collide
      var key = mob.print.map(function (p) { return p.item }).sort().join(' + ')
      if (prints[key]) problems.push(where + 'prints with the same items as ' + prints[key] + ' (' + key + ')')
      prints[key] = mob.id

      if (mob.rolls.length === 0) problems.push(where + 'no rolls')
      var circuits = {}
      mob.rolls.forEach(function (roll, index) {
        var rwhere = where + 'roll ' + roll.circuit + ': '
        if (!(roll.circuit >= 1 && roll.circuit <= 32)) problems.push(rwhere + 'circuit is not in 1..32')
        if (circuits[roll.circuit]) problems.push(rwhere + 'duplicate circuit')
        circuits[roll.circuit] = true
        if (index === 0 && roll.circuit !== 1) problems.push(rwhere + 'the first roll (full loot) must be circuit 1')
        if (roll.drops.length < 1 || roll.drops.length > MAX_DROPS) {
          problems.push(rwhere + 'needs 1..' + MAX_DROPS + ' drops')
        }
        roll.drops.forEach(function (d) {
          if (!itemExists(d.item)) problems.push(rwhere + 'drop ' + d.item + ' does not exist')
          if (!(d.n >= 1 && d.n <= 64)) problems.push(rwhere + 'amount of ' + d.item + ' is not in 1..64')
          if (!(d.chance > 0 && d.chance <= 1)) problems.push(rwhere + 'chance of ' + d.item + ' is not in (0, 1]')
        })
      })
      var items = (mob.mineral ? 1 : 0) + 1 + 1
      if (items > MAX_ITEM_INPUTS) problems.push(where + 'more item inputs than the recipe type has')
    })
    return problems
  }

  function addDrop(recipe, drop) {
    var stack = drop.n + 'x ' + drop.item
    if (drop.chance >= 1) {
      recipe.itemOutputs(stack)
    } else {
      recipe.chancedOutput(stack, Math.max(1, Math.min(9999, Math.round(drop.chance * 10000))), 0)
    }
  }

  ServerEvents.recipes(function (event) {
    var t = G.creatureTable()
    G.checkCreatureTable().forEach(function (problem) {
      console.error('[grindless/creatures] table: ' + problem)
    })

    var counts = { simulation: 0, print: 0, machines: 0, blank: 0 }

    // ---- blank model
    var blankOk = BLANK.inputs.every(function (id) { return ingredientExists(id) })
    if (blankOk) {
      var blank = event.recipes.gtceu.assembler('grindless:blank_creature_model')
      BLANK.inputs.forEach(function (id) { blank.itemInputs(id) })
      blank.itemOutputs(t.blank).EUt(BLANK.eut).duration(BLANK.duration)
      counts.blank++
    } else {
      console.error('[grindless/creatures] blank creature model skipped, missing ingredient(s): ' + BLANK.inputs.join(', '))
    }

    // ---- the creatures
    t.mobs.forEach(function (mob) {
      try {
        var print = event.recipes.gtceu.assembler('grindless:creature_model/' + mob.id)
        print.itemInputs(t.blank)
        mob.print.forEach(function (p) { print.itemInputs(p.n > 1 ? p.n + 'x ' + p.item : p.item) })
        print.itemOutputs(mob.model).EUt(t.printing.eut).duration(t.printing.duration)
        counts.print++

        mob.rolls.forEach(function (roll) {
          var recipe = event.recipes.gtceu.creature_simulation('grindless:' + mob.id + '/circuit_' + roll.circuit)
            .notConsumable(mob.model)
          if (mob.mineral) recipe.itemInputs(mob.mineral.n + 'x ' + mob.mineral.item)
          recipe.inputFluids(Fluid.of(t.biomass.fluid, mob.biomassMb))
          recipe.circuit(roll.circuit)
          roll.drops.forEach(function (drop) { addDrop(recipe, drop) })
          recipe.EUt(mob.eut).duration(mob.duration)
          counts.simulation++
        })
      } catch (e) {
        console.error('[grindless/creatures] ' + mob.id + ' skipped: ' + e)
      }
    })

    // ---- the machines: hull in the middle, sensor and emitter to see and project, motors, circuits and cables
    G.creatureMachines().forEach(function (m) {
      event.recipes.gtceu.shaped(m.machine, ['CEC', 'WHW', 'MSM'], m.keys).id(m.recipe)
      counts.machines++
    })

    console.info('[grindless/creatures] recipes: creature_simulation=' + counts.simulation + ' prints=' + counts.print +
      ' blank=' + counts.blank + ' machines=' + counts.machines)
  })
})()
