// -----------------------------------------------------------------------------------------------
// HV items of the Vein Drill family:
//   grindless:stainless_steel_drill_bit  wear part of the HV Vein Drill, the fourth bit after the bronze, steel and vanadium steel
//                                        ones (item tag grindless:drill_bits): consumed by chance, ~0.5 % of the runs (~0.25 %
//                                        with drilling fluid) against 1 % / 0.5 % for the vanadium steel bit. Its recipes only
//                                        run in the HV drill and better. HV has no titanium (DECISIONS.md, 2026-10-24): every HV
//                                        part is stainless steel, the bit too.
//   grindless:titanium_drill_bit         the old HV bit, kept only so worlds made before that decision load their bits: no recipe
//                                        makes it, no drilling recipe takes it, it is hidden from EMI (c:hidden_from_recipe_viewers)
//                                        and one crafts into one stainless steel bit (server_scripts/grindless/hv/family_crafting.js).
//   grindless:vein_sample_<vein>         one per vein of data/grindless/tables/veins_end.json: four End veins (GTM's bauxite, magnetite
//                                        and sheldonite ones and GT Community Additions' zirconium; scheelite waits for Mars). Same two-layer icon as the Overworld and Nether samples (item/vein_sample_frame +
//                                        item/vein_sample_core, tinted); put in the input bus of the HV Vein Drill with a drill
//                                        bit and drilling fluid in its fluid hatch it selects the vein.
//   grindless:vein_sample_scheelite      legacy: the End scheelite vein left the table in v0.4.1 (it comes back on Mars), but saves keep
//                                        their samples (AGENTS.md, "Playable channel"): registered, out of grindless:vein_samples, hidden
//                                        from EMI, no drilling recipe takes it and one crafts back into an empty vein probe.
// It also loads the End vein table into global.grindless.tables.veins_end (the Overworld one is loaded by lib/tables.js, the
// Nether one by lv/multis_items.js), so startup and server scripts share a single copy, and publishes the legacy ids in
// global.grindless.legacy.hv for the server scripts.
// Names / tooltips: client_scripts/grindless/hv_family_lang.js. Textures: item/stainless_steel_drill_bit and item/titanium_drill_bit
// (drawn separately, tools/assets); the samples reuse the steam ones.
(function () {
  const G = global.grindless

  G.tables.veins_end = G.readJsonTable('kubejs/data/grindless/tables/veins_end.json')
  if (!G.tables.veins_end || !G.tables.veins_end.veins || G.tables.veins_end.veins.length === 0) {
    throw new Error('[grindless/hv] veins_end.json has no veins')
  }
  console.info('[grindless/hv] loaded ' + G.tables.veins_end.veins.length + ' End veins')

  // ids that existed in a released version and must stay registered (old saves); color = the old sample's core tint. A vein that is
  // back in the table registers its sample the normal way, so it is not legacy any more.
  const LEGACY_SAMPLES = [{ id: 'scheelite', color: '#D7E8B3' }].filter(function (s) {
    return !G.tables.veins_end.veins.some(function (v) { return v.id === s.id })
  })
  G.legacy = G.legacy || {}
  G.legacy.hv = {
    bit: 'grindless:titanium_drill_bit',
    samples: LEGACY_SAMPLES.map(function (s) { return 'grindless:vein_sample_' + s.id })
  }

  // GTM material name -> lang key; a material of an addon mod keeps its namespace (gtca:red_zircon -> material.gtca.red_zircon)
  function materialKey(id) {
    var i = id.indexOf(':')
    return i < 0 ? 'material.gtceu.' + id : 'material.' + id.substring(0, i) + '.' + id.substring(i + 1)
  }

  StartupEvents.registry('item', function (event) {
    event.create('grindless:stainless_steel_drill_bit')
      .texture('grindless:item/stainless_steel_drill_bit')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.stainless_steel_drill_bit')))
      .tag('grindless:drill_bits')

    // legacy (old worlds): not a drill bit any more, so not in grindless:drill_bits
    event.create('grindless:titanium_drill_bit')
      .texture('grindless:item/titanium_drill_bit')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.titanium_drill_bit')))

    G.tables.veins_end.veins.forEach(function (vein) {
      var sample = event.create('grindless:vein_sample_' + vein.id)
        .texture('layer0', 'grindless:item/vein_sample_frame')
        .texture('layer1', 'grindless:item/vein_sample_core')
        .color(1, vein.color)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.vein_sample.drill_hv')))

      var contents = Text.translate(materialKey(vein.materials[0].id))
      for (var i = 1; i < vein.materials.length; i++) {
        contents = contents.append(', ').append(Text.translate(materialKey(vein.materials[i].id)))
      }
      sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.contains', contents)))
      sample.tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.depth', String(vein.minY), String(vein.maxY))))
      sample.tooltip(Text.red(Text.translate('tooltip.grindless.vein_sample.end')))
      sample.tag('grindless:vein_samples')
    })

    // legacy samples (old saves): same icon, no vein behind them any more
    LEGACY_SAMPLES.forEach(function (s) {
      event.create('grindless:vein_sample_' + s.id)
        .texture('layer0', 'grindless:item/vein_sample_frame')
        .texture('layer1', 'grindless:item/vein_sample_core')
        .color(1, s.color)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.vein_sample.legacy')))
    })
  })
})()
