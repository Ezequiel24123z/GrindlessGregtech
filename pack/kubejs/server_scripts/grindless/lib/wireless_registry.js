// priority: 1000
// -----------------------------------------------------------------------------------------------
// The wireless energy network's list of blocks (lv/wireless_energy.js), kept in the server's persistent data
// (kubejs_persistent_data.nbt) as an NBT list of compounds: one compound per tower, hatch or cover. NbtIo writes every string tag with
// DataOutput#writeUTF, which stops at 65,535 bytes; the first version kept the whole list as one JSON string and could not be saved
// past about 700 covers. A list of compounds has no such limit: each string in it is one field (a dimension id, a side, a kind).
//
// Entries (field, NBT type); every copy of an entry keeps this order, so equal entries print the same:
//   tower:          k 'tower', d dimension, x y z, f formed (byte), c capacity (long), t tier (0 = no cells), n cells
//   hatch / dynamo: k, d, x y z, t tier, a amps
//   cover:          k 'cover', d, x y z, s side, ck 'energy' | 'dynamo', t tier
// Reading never drops anything. A compound that is not a valid entry stays in the list as { bad: why, tag } (the network skips it and
// it is written back as it was). A list in the old string format, or anything else found under the key, is copied to a free backup
// key first; a JSON string is then converted (its entries that are not valid stay as bad entries), and the list is written back in the
// new format. Every problem is returned in `notes` for the caller to log as an error.
//
// Published as global.grindless.wirelessRegistry: FIELDS, canon(entry), toTag(entry), fromTag(compound), write(list), read(persistent
// data, key, backup key). The NBT classes come from Java.loadClass (a test hands in its own through `using(classes)`).
// Rhino: var + function.
(function () {
  var G = global.grindless || (global.grindless = {})
  // NBT tag type ids: byte, int, long, string, list, compound
  var ID = { b: 1, i: 3, l: 4, s: 8, list: 9, compound: 10 }
  var COMMON = [['k', 's'], ['d', 's'], ['x', 'i'], ['y', 'i'], ['z', 'i']]
  var FIELDS = {
    tower: COMMON.concat([['f', 'b'], ['c', 'l'], ['t', 'i'], ['n', 'i']]),
    hatch: COMMON.concat([['t', 'i'], ['a', 'i']]),
    dynamo: COMMON.concat([['t', 'i'], ['a', 'i']]),
    cover: COMMON.concat([['s', 's'], ['ck', 's'], ['t', 'i']])
  }
  var INT_MIN = -2147483648
  var INT_MAX = 2147483647
  var SAFE = 9007199254740991

  var nbt = null
  function classes() {
    if (nbt === null) {
      nbt = {
        CompoundTag: Java.loadClass('net.minecraft.nbt.CompoundTag'),
        ListTag: Java.loadClass('net.minecraft.nbt.ListTag'),
        StringTag: Java.loadClass('net.minecraft.nbt.StringTag')
      }
    }
    return nbt
  }

  function problem(name, type, v) {
    if (type === 's') return typeof v === 'string' && v !== '' ? '' : name + ' is not a text'
    if (type === 'b') return v === true || v === false ? '' : name + ' is not true or false'
    if (typeof v !== 'number' || v % 1 !== 0) return name + ' is not a whole number'
    if (type === 'i' && (v < INT_MIN || v > INT_MAX)) return name + ' does not fit an int'
    if (type === 'l' && (v < -SAFE || v > SAFE)) return name + ' does not fit a safe whole number'
    return ''
  }

  // a copy of the entry with exactly its kind's fields, in the table's order; throws on a missing field or a wrong type
  function canon(e) {
    if (e === null || typeof e !== 'object') throw new Error('not an entry: ' + e)
    var f = FIELDS[e.k]
    if (!f) throw new Error('unknown kind ' + JSON.stringify(e.k) + ' in ' + JSON.stringify(e))
    var out = {}
    for (var i = 0; i < f.length; i++) {
      var why = problem(f[i][0], f[i][1], e[f[i][0]])
      if (why) throw new Error(e.k + ' entry ' + JSON.stringify(e) + ': ' + why)
      out[f[i][0]] = e[f[i][0]]
    }
    return out
  }

  function toTag(e) {
    var c = canon(e)
    var t = new (classes().CompoundTag)()
    FIELDS[c.k].forEach(function (f) {
      var v = c[f[0]]
      if (f[1] === 's') t.putString(f[0], v)
      else if (f[1] === 'i') t.putInt(f[0], v)
      else if (f[1] === 'l') t.putLong(f[0], v)
      else t.putBoolean(f[0], v)
    })
    return t
  }

  // a compound -> its entry, or { bad: why, tag: a copy of the compound }
  function fromTag(t) {
    if (!t.contains('k', ID.s)) return { bad: 'no kind', tag: t.copy() }
    var k = String(t.getString('k'))
    var f = FIELDS[k]
    if (!f) return { bad: 'unknown kind ' + k, tag: t.copy() }
    var e = {}
    for (var i = 0; i < f.length; i++) {
      var name = f[i][0]
      var type = f[i][1]
      if (!t.contains(name, ID[type])) return { bad: k + ' without ' + name, tag: t.copy() }
      if (type === 's') e[name] = String(t.getString(name))
      else if (type === 'i') e[name] = Number(t.getInt(name))
      else if (type === 'l') e[name] = Number(t.getLong(name))
      else e[name] = t.getBoolean(name) === true
    }
    var why = ''
    for (var j = 0; j < f.length && !why; j++) why = problem(f[j][0], f[j][1], e[f[j][0]])
    return why ? { bad: why, tag: t.copy() } : e
  }

  function write(list) {
    var tag = new (classes().ListTag)()
    list.forEach(function (e) {
      tag.add(e && e.bad ? e.tag.copy() : toTag(e))
    })
    return tag
  }

  function freeKey(pd, base) {
    if (!pd.contains(base)) return base
    for (var n = 2; ; n++) if (!pd.contains(base + '_' + n)) return base + '_' + n
  }

  // the list under `key`: { list, notes (problems, for the log), migrated (persistent data was rewritten), backup (its key, or '') }
  function read(pd, key, backupKey) {
    var type = Number(pd.getTagType(key))
    if (type === 0) return { list: [], notes: [], migrated: false, backup: '' }
    var notes = []
    var list = []
    if (type === ID.list) {
      var tag = pd.get(key)
      var elementType = Number(tag.getElementType())
      if (elementType === ID.compound || Number(tag.size()) === 0) {
        for (var i = 0; i < tag.size(); i++) {
          var r = fromTag(tag.getCompound(i))
          if (r.bad) notes.push('entry ' + i + ' is kept but not used: ' + r.bad)
          list.push(r)
        }
        return { list: list, notes: notes, migrated: false, backup: '' }
      }
    }
    // the old format, or something unexpected: copied aside before anything else
    var backup = freeKey(pd, backupKey)
    pd.put(backup, pd.get(key).copy())
    if (type === ID.s) {
      var raw = String(pd.getString(key))
      var parsed = null
      try {
        parsed = JSON.parse(raw)
      } catch (err) {
        notes.push('the old list (a JSON string of ' + raw.length + ' characters) could not be parsed (' + err + '); it is kept under ' + backup)
      }
      if (parsed !== null && !Array.isArray(parsed)) notes.push('the old list is not a JSON array; it is kept under ' + backup)
      if (Array.isArray(parsed)) {
        parsed.forEach(function (e, n) {
          try {
            list.push(canon(e))
          } catch (err) {
            var keep = new (classes().CompoundTag)()
            keep.putString('json', JSON.stringify(e))
            list.push({ bad: String(err.message || err), tag: keep })
            notes.push('old entry ' + n + ' is kept but not used: ' + (err.message || err))
          }
        })
        notes.push('converted ' + list.length + ' entries from the old JSON string; the string is kept under ' + backup)
      }
    } else {
      notes.push('found NBT type ' + type + ' instead of a list of compounds; it is kept under ' + backup)
    }
    pd.put(key, write(list))
    return { list: list, notes: notes, migrated: true, backup: backup }
  }

  G.wirelessRegistry = {
    FIELDS: FIELDS,
    canon: canon,
    toTag: toTag,
    fromTag: fromTag,
    write: write,
    read: read,
    // a test's own NBT classes ({ CompoundTag, ListTag, StringTag })
    using: function (c) { nbt = c }
  }
})()
