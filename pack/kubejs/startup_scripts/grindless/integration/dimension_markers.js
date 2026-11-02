// Gregtech Grindless - EMI-1: dimension markers
//
// GTM 7.5.3 draws a recipe's dimension condition as the dimension's DimensionMarker (GTRegistries.DIMENSION_MARKERS). A dimension with no
// marker shows a barrier named with the raw ResourceKey. DimensionMarker.Builder is reachable from KubeJS through the GT registry event
// 'gtceu:dimension_marker' (GTRegistryInfo.DIMENSION_MARKER; GTDimensionMarkers#init posts it after the machines). Names are English
// lang keys 'dimension_marker.<namespace>.<path>' (client_scripts/grindless/dimension_markers_lang.js).
//
// ROWS: [dimension id, icon item, tier (sorting and the T<n> overlay), ...]. One row per dimension of pack/kubejs/data/grindless/dimension
// plus the GCYR dimensions the pack names. GTM and GCYR already mark the Overworld, Nether, End, Luna, Mars, Mercury and Venus: no row.
// dimension-markers.test.mjs checks that every dimension of ours has a row and a name.
var GG_DIMENSION_MARKER_ROWS = [
  ['grindless:flat', 'minecraft:grass_block', 0],
  ['grindless:void', 'minecraft:black_stained_glass', 0],
  ['grindless:horizon_city', 'minecraft:smooth_stone', 0],
  ['gcyr:overworld_orbit', 'minecraft:ender_eye', 1],
  ['gcyr:luna_orbit', 'minecraft:end_stone', 2],
  ['gcyr:mars_orbit', 'minecraft:red_sand', 3],
  ['gcyr:venus_orbit', 'minecraft:yellow_terracotta', 3],
  ['gcyr:mercury_orbit', 'minecraft:blackstone', 3],
  ['grindless:asteroid_belt', 'minecraft:raw_iron_block', 4],
  ['grindless:asteroid_belt_orbit', 'minecraft:iron_ore', 4],
  ['grindless:jupiter', 'minecraft:orange_concrete', 5],
  ['grindless:jupiter_orbit', 'minecraft:orange_stained_glass', 5],
  ['grindless:io', 'minecraft:magma_block', 5],
  ['grindless:io_orbit', 'minecraft:shroomlight', 5],
  ['grindless:europa', 'minecraft:packed_ice', 5],
  ['grindless:europa_orbit', 'minecraft:ice', 5],
  ['grindless:ganymede', 'minecraft:gravel', 5],
  ['grindless:ganymede_orbit', 'minecraft:cobbled_deepslate', 5],
  ['grindless:saturn', 'minecraft:yellow_concrete', 6],
  ['grindless:saturn_orbit', 'minecraft:yellow_stained_glass', 6],
  ['grindless:uranus', 'minecraft:light_blue_concrete', 7],
  ['grindless:uranus_orbit', 'minecraft:light_blue_stained_glass', 7],
  ['grindless:neptune', 'minecraft:blue_concrete', 7],
  ['grindless:neptune_orbit', 'minecraft:blue_stained_glass', 7],
  ['grindless:pluto', 'minecraft:snow_block', 8],
  ['grindless:pluto_orbit', 'minecraft:powder_snow_bucket', 8],
  ['gcyr:proxima_centauri_b', 'minecraft:netherrack', 9],
  ['grindless:proxima_b_orbit', 'minecraft:crimson_nylium', 9],
  ['grindless:alpha_centauri_orbit', 'minecraft:glowstone', 9],
  ['grindless:barnard_b', 'minecraft:terracotta', 10],
  ['grindless:barnard_b_orbit', 'minecraft:red_terracotta', 10],
  ['grindless:sirius_b_orbit', 'minecraft:sea_lantern', 10],
  ['grindless:rx_j1856_orbit', 'minecraft:blue_ice', 11],
  ['grindless:psr_j0437_orbit', 'minecraft:amethyst_block', 11],
  ['grindless:cygnus_x1_orbit', 'minecraft:crying_obsidian', 12],
  ['gcyr:black_hole_orbit', 'minecraft:obsidian', 12],
  ['grindless:vela_pulsar_orbit', 'minecraft:purple_concrete', 12],
  ['grindless:cas_a_remnant', 'minecraft:redstone_block', 13],
  ['grindless:sgr1806_orbit', 'minecraft:end_rod', 13],
  ['grindless:terzan5_core', 'minecraft:copper_block', 13],
  ['grindless:nsc_belt', 'minecraft:gold_block', 14],
  ['grindless:m31_nucleus_orbit', 'minecraft:nether_star', 14],
  ['grindless:tarantula_orbit', 'minecraft:magenta_concrete', 14],
  ['grindless:magellanic_stream', 'minecraft:prismarine', 14],
  ['grindless:local_group_filament', 'minecraft:chorus_flower', 14]
]

GTCEuStartupEvents.registry('gtceu:dimension_marker', function (event) {
  var Registries = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
  var ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
  var made = 0
  GG_DIMENSION_MARKER_ROWS.forEach(function (row) {
    var id = String(row[0])
    var icon = String(row[1])
    var taken = false
    try { taken = Registries.DIMENSION_MARKERS.containsKey(new ResourceLocation(id)) } catch (e) { taken = false }
    if (taken) return
    event.create(id)
      .iconSupplier(function () { return Item.of(icon).getItem() })
      .tier(row[2])
      .overrideName('dimension_marker.' + id.replace(':', '.'))
    made++
  })
  console.info('[grindless/integration] dimension markers registered: ' + made)
})
