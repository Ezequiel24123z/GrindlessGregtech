// priority: 1000
// -----------------------------------------------------------------------------------------------
// Grindless multiblock pattern helper.
//
// This is the ONLY file in the pack that talks to GTM's multiblock pattern API
// (FactoryBlockPattern, Predicates, TraceabilityPredicate, PartAbility). Every multiblock builds its
// pattern through `global.grindless.patterns.build(def, spec)` and records the spec's plain-data description at
// registration time with `global.grindless.patterns.register(machineId, spec)`. When GTM 8.0 arrives
// (MultiblockPatternBuilder.slice instead of FactoryBlockPattern.aisle, reversed start() directions,
// `.or` -> `.and` for limited predicates, machine factories taking `info` instead of `holder`...)
// only this file has to change, not each multiblock.
//
// Load order: KubeJS sorts scripts of one type by `// priority:` (higher first; ties keep the order of
// the directory walk, which is NOT guaranteed alphabetical). Users of this helper only call it from
// inside registry callbacks, which run after every startup script has been evaluated, but the high
// priority above keeps it safe even for top-level use.
//
// Everything is wrapped in a function so no top-level const/let leaks into the shared startup scope
// (KubeJS evaluates every file of a script type in ONE scope; a duplicated top-level `const` in another
// file would throw "redeclaration of const"). Inside the helper functions only `var` is used: this KubeJS
// Rhino fork throws "redeclaration of var X" the second time a function with a top-of-body const/let runs.
//
// -------------------------------- spec (plain data, GTM-version independent) --------------------------------
//   slices : array of slices listed BACK -> FRONT. The controller must sit in the LAST slice (front face).
//            A slice is an array of rows listed BOTTOM -> TOP; a row is a string, one char per column.
//            All rows must have the same length. ' ' (space) = any block.
//   symbols: { <char>: predicate } using the predicates below.
//
// -------------------------------- predicates --------------------------------
//   controller()                              the controller block itself (exactly one cell in the pattern)
//   air() / any()                             must be air / anything
//   block(id | [ids], {min,max,exact,preview}) one of these blocks. Limits count ALL blocks of the group
//                                             together only when a single id is given (limits + several ids = error)
//   frame([materialNames])                    GT frame blocks (or framed pipes) of those materials
//   part(name, {min,max,exact,preview})       a multiblock part with that ability, see ABILITIES
//   oneOf(p1, p2, ...)                        any of the given predicates (typical "casing OR hatch" cell)
//
// `global.grindless.structures[<machine id>]` holds the plain-data description of every registered pattern
// ({ id, built, slices, symbols }); `built` turns true once GTM has built the pattern (lazily, on first use).
// Test tooling places the structure block by block from it, without having to build the pattern first.
(function () {
  const G = global.grindless || (global.grindless = {})
  G.structures = G.structures || {}

  // part name -> PartAbility (looked up lazily so nothing GTM-related runs at script load)
  const ABILITIES = {
    steam: function () { return PartAbility.STEAM },
    steam_input_bus: function () { return PartAbility.STEAM_IMPORT_ITEMS },
    steam_output_bus: function () { return PartAbility.STEAM_EXPORT_ITEMS },
    input_bus: function () { return PartAbility.IMPORT_ITEMS },
    output_bus: function () { return PartAbility.EXPORT_ITEMS },
    input_hatch: function () { return PartAbility.IMPORT_FLUIDS },
    output_hatch: function () { return PartAbility.EXPORT_FLUIDS },
    energy_input: function () { return PartAbility.INPUT_ENERGY },
    energy_output: function () { return PartAbility.OUTPUT_ENERGY },
    muffler: function () { return PartAbility.MUFFLER },
    maintenance: function () { return PartAbility.MAINTENANCE }
  }

  const MAX_ROWS = 12

  function fail(msg) {
    throw new Error('[grindless/patterns] ' + msg)
  }

  function pickLimits(o) {
    if (!o) return null
    var r = {}
    if (o.min != null) r.min = o.min
    if (o.max != null) r.max = o.max
    if (o.exact != null) r.exact = o.exact
    if (o.preview != null) r.preview = o.preview
    return r
  }

  function hasCountLimit(o) {
    return !!o && (o.min != null || o.max != null || o.exact != null)
  }

  // GTM: limits are set on every SimplePredicate already inside the TraceabilityPredicate,
  // so they must be applied to a leaf before it is combined with oneOf().
  function applyLimits(pred, o) {
    if (!o) return pred
    if (o.exact != null) {
      pred = pred.setExactLimit(o.exact)
    } else {
      if (o.min != null) pred = pred.setMinGlobalLimited(o.min)
      if (o.max != null) pred = pred.setMaxGlobalLimited(o.max)
    }
    if (o.preview != null) pred = pred.setPreviewCount(o.preview)
    return pred
  }

  function blockOf(id) {
    var b = Block.getBlock(id)
    if (b == null || String(Block.getId(b)) !== String(id)) fail('unknown block id: ' + id)
    return b
  }

  // ---------------------------------------------------------------- predicates
  function controller() {
    return {
      kind: 'controller',
      build: function (def) { return Predicates.controller(Predicates.blocks(def.get())) }
    }
  }

  function air() {
    return { kind: 'air', build: function () { return Predicates.air() } }
  }

  function any() {
    return { kind: 'any', build: function () { return Predicates.any() } }
  }

  function block(ids, opts) {
    var list = Array.isArray(ids) ? ids.slice() : [ids]
    if (list.length === 0) fail('block(): empty id list')
    if (hasCountLimit(opts) && list.length > 1) {
      fail('block(): count limits need a single block id (got ' + list.length + ')')
    }
    return {
      kind: 'blocks',
      blocks: list,
      limits: pickLimits(opts),
      build: function () {
        var pred = null
        list.forEach(function (id) {
          var p = Predicates.blocks(blockOf(id))
          pred = pred === null ? p : pred.or(p)
        })
        return applyLimits(pred, opts)
      }
    }
  }

  function frame(materials) {
    var list = Array.isArray(materials) ? materials.slice() : [materials]
    return {
      kind: 'frames',
      materials: list,
      build: function () {
        var mats = list.map(function (name) {
          var m = GTMaterials.get(name)
          if (m == null || m.isNull()) fail('unknown GT material: ' + name)
          return m
        })
        // Predicates.frames takes varargs; spelled out so no array-to-varargs conversion is needed
        switch (mats.length) {
          case 1: return Predicates.frames(mats[0])
          case 2: return Predicates.frames(mats[0], mats[1])
          case 3: return Predicates.frames(mats[0], mats[1], mats[2])
          default: return fail('frame(): 1 to 3 materials supported')
        }
      }
    }
  }

  function part(name, opts) {
    if (!ABILITIES[name]) fail('unknown part name: ' + name + ' (known: ' + Object.keys(ABILITIES).join(', ') + ')')
    return {
      kind: 'part',
      ability: name,
      limits: pickLimits(opts),
      build: function () { return applyLimits(Predicates.abilities(ABILITIES[name]()), opts) }
    }
  }

  // The only place that uses TraceabilityPredicate.or
  function oneOf() {
    var options = Array.prototype.slice.call(arguments)
    if (options.length === 0) fail('oneOf(): needs at least one predicate')
    return {
      kind: 'oneOf',
      options: options,
      build: function (def) {
        var pred = null
        options.forEach(function (o) {
          var p = o.build(def)
          pred = pred === null ? p : pred.or(p)
        })
        return pred
      }
    }
  }

  // ---------------------------------------------------------------- build
  function describe(w) {
    var d = { kind: w.kind }
    if (w.blocks) d.blocks = w.blocks.slice()
    if (w.materials) d.materials = w.materials.slice()
    if (w.ability) d.ability = w.ability
    if (w.limits) d.limits = w.limits
    if (w.options) d.options = w.options.map(describe)
    return d
  }

  // GTM 7.5.3: FactoryBlockPattern.aisle(String...) - one call per slice
  function addSlice(builder, rows) {
    switch (rows.length) {
      case 1: return builder.aisle(rows[0])
      case 2: return builder.aisle(rows[0], rows[1])
      case 3: return builder.aisle(rows[0], rows[1], rows[2])
      case 4: return builder.aisle(rows[0], rows[1], rows[2], rows[3])
      case 5: return builder.aisle(rows[0], rows[1], rows[2], rows[3], rows[4])
      case 6: return builder.aisle(rows[0], rows[1], rows[2], rows[3], rows[4], rows[5])
      case 7: return builder.aisle(rows[0], rows[1], rows[2], rows[3], rows[4], rows[5], rows[6])
      case 8: return builder.aisle(rows[0], rows[1], rows[2], rows[3], rows[4], rows[5], rows[6], rows[7])
      case 9: return builder.aisle(rows[0], rows[1], rows[2], rows[3], rows[4], rows[5], rows[6], rows[7], rows[8])
      case 10: return builder.aisle(rows[0], rows[1], rows[2], rows[3], rows[4], rows[5], rows[6], rows[7], rows[8], rows[9])
      default: return fail('a slice can have 1 to ' + MAX_ROWS + ' rows (got ' + rows.length + ')')
    }
  }

  function validate(id, spec) {
    if (!spec || !Array.isArray(spec.slices) || spec.slices.length === 0) fail(id + ': spec.slices is empty')
    if (!spec.symbols) fail(id + ': spec.symbols is missing')
    var height = spec.slices[0].length
    var width = String(spec.slices[0][0]).length
    var controllers = 0
    spec.slices.forEach(function (rows, si) {
      if (!Array.isArray(rows) || rows.length !== height) fail(id + ': slice ' + si + ' must have ' + height + ' rows')
      rows.forEach(function (row, ri) {
        row = String(row)
        if (row.length !== width) fail(id + ': slice ' + si + ' row ' + ri + ' must be ' + width + ' chars wide')
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = spec.symbols[ch]
          if (!sym) fail(id + ': symbol "' + ch + '" (slice ' + si + ', row ' + ri + ') has no predicate')
          if (sym.kind === 'controller') {
            controllers++
            if (si !== spec.slices.length - 1) fail(id + ': the controller must be in the last (front) slice')
          }
        }
      })
    })
    if (controllers !== 1) fail(id + ': the pattern needs exactly one controller cell (found ' + controllers + ')')
  }

  // Records the plain-data description of a spec (no GTM objects are touched) in global.grindless.structures, so
  // tools can place a structure block by block without ever building the pattern. Machines call it at registration.
  function register(machineId, spec) {
    var id = String(machineId)
    validate(id, spec)
    var described = {}
    Object.keys(spec.symbols).forEach(function (ch) {
      described[ch] = describe(spec.symbols[ch])
    })
    G.structures[id] = {
      id: id,
      built: false,
      slices: spec.slices.map(function (rows) { return rows.map(String) }),
      symbols: described
    }
    return G.structures[id]
  }

  function build(def, spec) {
    var id = String(def.getId())
    var entry = G.structures[id] || register(id, spec)

    var b = FactoryBlockPattern.start()
    spec.slices.forEach(function (rows) { b = addSlice(b, rows.map(String)) })
    Object.keys(spec.symbols).forEach(function (ch) {
      b = b.where(ch, spec.symbols[ch].build(def))
    })
    var pattern = b.build()
    entry.built = true
    return pattern
  }

  G.patterns = {
    GTM_VERSION: '7.5.3',
    controller: controller,
    air: air,
    any: any,
    block: block,
    frame: frame,
    part: part,
    oneOf: oneOf,
    register: register,
    build: build,
    // plain-data description of a registered pattern (null when unknown); `built` tells if GTM has built it yet
    describe: function (machineId) { return G.structures[String(machineId)] || null },
    partNames: Object.keys(ABILITIES)
  }
})()
