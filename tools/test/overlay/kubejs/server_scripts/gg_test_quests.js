// Gregtech Grindless - test overlay (not shipped with the pack)
//
// Usage: powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//   -Commands 'kubejs custom_command gg_test_quests' -WaitForLog 'GGTEST\|quests\|DONE@@300'
//
// Checks the quest book that FTB Quests actually loaded (ServerQuestFile.INSTANCE):
//   - every chapter in EXPECTED is loaded, sits in a named chapter group (or is meant to be ungrouped) and has the expected
//     number of quests and of dependencies (a chapter whose SNBT fails to parse is skipped by FTB Quests, and a
//     dependency it cannot resolve is dropped, so a missing chapter or a missing line shows up here);
//   - every item id the book names exists: chapter and quest icons, task and reward items, and the ids inside
//     Item Filters items (itemfilters:or lists); every itemfilters:tag names a tag with at least one item.
//     FTB Quests turns an unknown id into ftbquests:missing_item without logging anything, so this is the only
//     place an unresolved id shows up. The ids are read back through writeData(), which writes the original id.
//   - every chapter has a title: FTB Quests 2001.4 reads it only from the chapter file (it has no lang files)
//     and shows "Unnamed" without one.
//   - the Neutronium Toolbox rewards (welcome chapter): every GT tool reward is unbreakable the way GTM reads it
//     (root "Unbreakable" tag, so ToolHelper.damageItem never wears it), gives no hazard to whoever carries it
//     (HazardProperty.getValidHazardMaterial is NULL), and keeps the behaviours a crafted tool gets from
//     IGTTool#get() (area of effect, magnetism, tree felling...).
//
// Second command, gg_dump_toolbox: prints IGTTool#get() NBT of every toolbox tool (GGTEST|toolbox|nbt|INFO id snbt),
// used to write those rewards, and checks a copy marked Unbreakable takes no damage.
// Uses var + function everywhere (Rhino).
ServerEvents.customCommand('gg_test_quests', function (event) { runQuestTest() })
ServerEvents.customCommand('gg_dump_toolbox', function (event) { dumpToolbox() })

var GG_TOOLBOX = [
  'gtceu:neutronium_hammer', 'gtceu:neutronium_wrench', 'gtceu:neutronium_file', 'gtceu:neutronium_saw',
  'gtceu:neutronium_screwdriver', 'gtceu:neutronium_wire_cutter', 'gtceu:neutronium_knife',
  'gtceu:neutronium_crowbar', 'gtceu:neutronium_butchery_knife', 'gtceu:neutronium_scythe',
  'gtceu:neutronium_pickaxe', 'gtceu:neutronium_shovel', 'gtceu:neutronium_axe', 'gtceu:neutronium_hoe',
  'gtceu:neutronium_sword', 'gtceu:neutronium_mining_hammer', 'gtceu:neutronium_spade',
  'gtceu:naquadah_mortar', 'gtceu:rubber_mallet', 'gtceu:rubber_plunger'
]

function dumpToolbox() {
  var $Hazard = Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.HazardProperty')
  var $GTMaterials = Java.loadClass('com.gregtechceu.gtceu.common.data.GTMaterials')
  var $ToolHelper = Java.loadClass('com.gregtechceu.gtceu.api.item.tool.ToolHelper')
  GG_TOOLBOX.forEach(function (id) {
    try {
      // KubeJS renames ItemStack#getTag to getNbt for scripts
      var stack = Item.of(id).item.get()
      console.log('GGTEST|toolbox|nbt|INFO ' + id + ' ' + stack.getNbt())
      var copy = stack.copy()
      copy.getOrCreateTag().putBoolean('Unbreakable', true)
      $ToolHelper.damageItem(copy, null, 50)
      var haz = $Hazard.getValidHazardMaterial(copy)
      qtCheck('toolbox_dump_' + id, copy.getDamageValue() === 0 && !copy.isDamageableItem() && haz == $GTMaterials.NULL,
        'damage after 50=' + copy.getDamageValue() + ' damageable=' + copy.isDamageableItem() + ' hazard=' + haz.getName())
    } catch (e) {
      qtCheck('toolbox_dump_' + id, false, String(e))
    }
  })
  console.log('GGTEST|toolbox|DONE')
}

// [quests, dependencies] per chapter. FTB Quests drops a dependency it cannot resolve without logging anything (an id
// above 7FFFFFFFFFFFFFFF, see tools/quests/fix-ids.mjs, or a quest that is gone), so a short count means lines missing
// in the book. Update both numbers when a chapter changes (node tools/quests/lint.mjs prints them per chapter).
var GG_QUESTS_EXPECTED = {
  storage: [21, 20],
  applied_energistics: [40, 40],
  productive_bees: [12, 14],
  travel_and_teams: [16, 15],
  workshop: [15, 14],
  welcome: [16, 15],
  steam_age: [45, 51],
  lv_age: [50, 51],
  mv_age: [41, 49],
  hv_age: [35, 45],
  ev_age: [12, 14]
}
// chapters that sit outside every chapter group on purpose (shown above the groups)
var GG_UNGROUPED = { welcome: true }

// The Neutronium Toolbox (welcome chapter): every reward must be exactly what GTM's IGTTool#get() makes, plus the root
// "Unbreakable" tag GTM itself reads (ToolHelper.UNBREAKABLE_KEY), and must give no hazard.
var GG_TOOLBOX_QUEST = '047B55ED9C952BC9'

function qtCheckToolbox(file) {
  var $Hazard = Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.HazardProperty')
  var $GTMaterials = Java.loadClass('com.gregtechceu.gtceu.common.data.GTMaterials')
  var $ToolHelper = Java.loadClass('com.gregtechceu.gtceu.api.item.tool.ToolHelper')
  // quest ids are 64-bit: look the quest up by its hex code string, a JS number would lose precision
  var quest = null
  var chs = file.getAllChapters()
  for (var c = 0; c < chs.size() && quest == null; c++) {
    qtIterate(chs.get(c).getQuests(), function (q) { if (String(q.getCodeString()) === GG_TOOLBOX_QUEST) quest = q })
  }
  if (quest == null) {
    qtCheck('toolbox_quest', false, 'quest ' + GG_TOOLBOX_QUEST + ' not loaded')
    return
  }
  var seen = {}
  var bad = []
  qtIterate(quest.getRewards(), function (reward) {
    var stack = reward.getItem ? reward.getItem() : null
    if (stack == null) return
    var id = String(stack.getId())
    seen[id] = true
    var expected = stack.getItem().get().getNbt()
    expected.putBoolean('Unbreakable', true)
    var copy = stack.copy()
    $ToolHelper.damageItem(copy, null, 50)
    var haz = $Hazard.getValidHazardMaterial(stack)
    if (!expected.equals(stack.getNbt())) bad.push(id + ' nbt ' + stack.getNbt() + ' != ' + expected)
    if (copy.getDamageValue() !== 0 || copy.isDamageableItem()) bad.push(id + ' takes damage')
    if (haz != $GTMaterials.NULL) bad.push(id + ' hazard ' + haz.getName())
  })
  var absent = GG_TOOLBOX.filter(function (id) { return !seen[id] })
  qtCheck('toolbox_rewards', bad.length === 0 && absent.length === 0,
    bad.length === 0 && absent.length === 0 ? GG_TOOLBOX.length + ' tools: GTM NBT, unbreakable, no hazard'
      : (absent.length ? 'missing ' + absent.join(', ') + '; ' : '') + bad.join('; '))
}

function qtCheck(name, ok, detail) {
  console.log('GGTEST|quests|' + name + '|' + (ok ? 'PASS' : 'FAIL') + (detail ? ' (' + detail + ')' : ''))
}

function qtIterate(collection, fn) {
  var it = collection.iterator()
  while (it.hasNext()) fn(it.next())
}

// walks an NBT tree written by writeData() and calls found(id, kind) for every item id in it
function qtWalk(tag, key, found) {
  if (tag == null) return
  var type = Number(tag.getId())
  if (type === 8) {
    if (key === 'item' || key === 'icon') found(String(tag.getAsString()), 'item')
    return
  }
  if (type === 9) {
    for (var i = 0; i < tag.size(); i++) qtWalk(tag.get(i), key, found)
    return
  }
  if (type !== 10) return
  if (tag.contains('id') && tag.contains('Count')) {
    var id = String(tag.getString('id'))
    found(id, 'item')
    if (id === 'itemfilters:tag' && tag.contains('tag')) found(String(tag.getCompound('tag').getString('value')), 'tag')
  }
  qtIterate(tag.getAllKeys(), function (k) {
    var child = String(k)
    if (child === 'id' && !(key === 'item' || key === 'icon')) return
    qtWalk(tag.get(child), child, found)
  })
}

function runQuestTest() {
  var $SQF = Java.loadClass('dev.ftb.mods.ftbquests.quest.ServerQuestFile')
  var $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')
  var file = $SQF.INSTANCE
  if (file == null) {
    qtCheck('loaded', false, 'ServerQuestFile.INSTANCE is null')
    console.log('GGTEST|quests|DONE')
    return
  }
  var chapters = file.getAllChapters()
  var byName = {}
  var untitled = []
  var missing = []
  var refs = 0
  var tagCache = {}
  var totalQuests = 0

  var checkObject = function (obj, where) {
    var nbt = new $CompoundTag()
    obj.writeData(nbt)
    qtWalk(nbt, '', function (id, kind) {
      refs++
      if (kind === 'tag') {
        if (tagCache[id] === undefined) {
          var size = 0
          try { size = Ingredient.of('#' + id).getItemIds().size() } catch (e) { size = 0 }
          tagCache[id] = size
        }
        if (tagCache[id] === 0) missing.push(where + ': empty tag #' + id)
        return
      }
      if (id === '' || id === 'minecraft:air') return
      if (!Item.exists(id)) missing.push(where + ': ' + id)
    })
  }

  for (var c = 0; c < chapters.size(); c++) {
    var ch = chapters.get(c)
    var name = String(ch.getFilename())
    var quests = ch.getQuests()
    byName[name] = ch
    totalQuests += quests.size()
    if (String(ch.getRawTitle()) === '') untitled.push(name)
    console.log('GGTEST|quests|chapter|INFO ' + name + ' quests=' + quests.size() + ' group="' + ch.getGroup().getRawTitle() + '"')
    checkObject(ch, name)
    for (var i = 0; i < quests.size(); i++) {
      var quest = quests.get(i)
      var where = name + '/' + quest.getRawTitle()
      checkObject(quest, where)
      qtIterate(quest.getTasks(), function (task) { checkObject(task, where + ' (task)') })
      qtIterate(quest.getRewards(), function (reward) { checkObject(reward, where + ' (reward)') })
    }
  }

  Object.keys(GG_QUESTS_EXPECTED).forEach(function (name) {
    var ch = byName[name]
    if (!ch) {
      qtCheck('chapter_' + name, false, 'not loaded')
      return
    }
    var n = ch.getQuests().size()
    var deps = 0
    qtIterate(ch.getQuests(), function (q) { deps += Number(q.streamDependencies().count()) })
    var want = GG_QUESTS_EXPECTED[name]
    var group = String(ch.getGroup().getRawTitle())
    var title = String(ch.getRawTitle())
    var ok = n === want[0] && deps === want[1] && (group !== '' || GG_UNGROUPED[name] === true) && title !== ''
    qtCheck('chapter_' + name, ok, 'quests=' + n + '/' + want[0] + ' dependencies=' + deps + '/' + want[1] + ' group="' + group + '" title="' + title + '"')
  })

  qtCheck('item_ids', missing.length === 0, missing.length === 0 ? refs + ' item and tag references resolve' : missing.length + ' unresolved: ' + missing.join('; '))
  qtCheck('titles', untitled.length === 0, untitled.length === 0 ? 'every chapter has a title' : 'without a title (shown as "Unnamed"): ' + untitled.join(', '))
  try {
    qtCheckToolbox(file)
  } catch (e) {
    qtCheck('toolbox_rewards', false, String(e))
  }
  console.log('GGTEST|quests|summary|INFO chapters=' + chapters.size() + ' quests=' + totalQuests)
  console.log('GGTEST|quests|DONE')
}
