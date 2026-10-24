// Gregtech Grindless - "Dimensiones de construcción"
//
// Behaviour for grindless:void_key / grindless:flat_key:
//  - Used in the Overworld (or any other non-building dimension): remembers the return spot
//    (dimension + xyz + rotation) and teleports to the matching building dimension.
//  - Used again while inside that same building dimension: returns to the saved spot
//    (falls back to the player's respawn point, then to the Overworld's world spawn).
//  - Used for the *other* building dimension while already inside one of them: hops straight
//    across (void <-> flat) without touching/overwriting the saved Overworld return point.
//  - Never teleports into suffocation; always lands standing on solid ground (or on a small
//    stone brick platform it creates once, in the Void, if there is nothing underneath yet).
//  - All of this runs server-side only (ItemEvents.rightClicked registered from a server script),
//    so it works in multiplayer and never no-ops silently on a client-only hook.
//
// Also: cheap recovery recipes for both keys, and (bonus) tries to make GTM's Overworld ore veins
// generate underneath grindless:flat too.
//
// NOTE ON `var` vs `const`/`let`: every function below only uses `var` for its own locals. KubeJS's
// Rhino fork throws a "redeclaration of var X" TypeError the *second* time a function is invoked if
// it declares a top-of-body `const`/`let` and that same function (named or anonymous, it does not
// matter) gets called more than once from an event that can fire repeatedly in one server session
// (confirmed for ItemEvents.rightClicked across two clicks, ServerEvents.loaded and
// GTCEuServerEvents.oreVeins across GTM's own re-registration pass). `var` has always been
// function-scoped with no such restriction, so it is used everywhere here instead. Top-level
// `const`s (evaluated once, when the file itself loads) are unaffected and kept as `const`.

const VOID_DIM = 'grindless:void'
const FLAT_DIM = 'grindless:flat'
const OVERWORLD_DIM = 'minecraft:overworld'
const PD_KEY = 'grindless_dimensions'
const COOLDOWN_TICKS = 20 // 1 second, on top of the vanilla item-cooldown overlay
const VOID_PLATFORM_BLOCK = 'minecraft:stone_bricks'
const VOID_LANDING_Y = 64
const FLAT_LANDING_Y = 64 // grindless:flat is identical in every chunk (5-layer flat preset), so the
                          // surface is always y=63 by construction: no need for a heightmap lookup,
                          // which is unreliable on a chunk that has not finished generating yet.
const SAFE_Y_SEARCH_RANGE = 192

const $HashSet = Java.loadClass('java.util.HashSet')
const $ResourceKey = Java.loadClass('net.minecraft.resources.ResourceKey')
const $Registries = Java.loadClass('net.minecraft.core.registries.Registries')
const $ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
const $GTConfigHolder = Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder')

// ---------------------------------------------------------------- persistent data helpers

function updatePD(player, mutator) {
    var root = player.getPersistentData()
    var sub = root.getCompound(PD_KEY)
    mutator(sub)
    root.put(PD_KEY, sub)
}

function getPD(player) {
    return player.getPersistentData().getCompound(PD_KEY)
}

function isOnCooldown(player, level) {
    var pd = getPD(player)
    return pd.contains('cooldown_until') && level.getGameTime() < pd.getLong('cooldown_until')
}

function armCooldown(player, level) {
    updatePD(player, function (sub) {
        sub.putLong('cooldown_until', level.getGameTime() + COOLDOWN_TICKS)
    })
}

function saveReturnPoint(player, dimId) {
    updatePD(player, function (sub) {
        sub.putString('return_dim', dimId)
        sub.putDouble('return_x', player.getX())
        sub.putDouble('return_y', player.getY())
        sub.putDouble('return_z', player.getZ())
        sub.putFloat('return_yaw', player.getYRot())
        sub.putFloat('return_pitch', player.getXRot())
    })
}

// ---------------------------------------------------------------- safe landing helpers

function isAirAt(level, x, y, z) {
    return level.getBlock(x, y, z).getBlockState().isAir()
}

/** Walks upward from startY until it finds a 2-block-tall air pocket (never suffocates). */
function findSafeY(level, x, startY, z) {
    var y = startY
    for (var i = 0; i < SAFE_Y_SEARCH_RANGE; i++) {
        if (isAirAt(level, x, y, z) && isAirAt(level, x, y + 1, z)) return y
        y++
    }
    return startY
}

/** Only touches blocks that are still air, so it never overwrites anything the player built. */
function ensurePlatform(level, x, y, z) {
    if (!isAirAt(level, x, y, z)) return
    for (var dx = -2; dx <= 2; dx++) {
        for (var dz = -2; dz <= 2; dz++) {
            var b = level.getBlock(x + dx, y, z + dz)
            if (b.getBlockState().isAir()) {
                b.set(VOID_PLATFORM_BLOCK)
            }
        }
    }
}

function computeLanding(targetLevel, targetDimId, x, z) {
    var bx = Math.floor(x)
    var bz = Math.floor(z)
    var startY = targetDimId === VOID_DIM ? VOID_LANDING_Y : FLAT_LANDING_Y

    var y = findSafeY(targetLevel, bx, startY, bz)
    if (targetDimId === VOID_DIM) {
        ensurePlatform(targetLevel, bx, y - 1, bz)
    }
    return { x: bx + 0.5, y: y, z: bz + 0.5 }
}

function fallbackSpawn(player, server) {
    var respawnDim = player.getRespawnDimension()
    var respawnPos = player.getRespawnPosition()
    if (respawnDim && respawnPos) {
        var dimId = respawnDim.location().toString()
        if (server.getLevel(dimId)) {
            return { dim: dimId, x: respawnPos.getX() + 0.5, y: respawnPos.getY(), z: respawnPos.getZ() + 0.5, yaw: player.getRespawnAngle(), pitch: 0 }
        }
    }
    var overworld = server.getLevel(OVERWORLD_DIM)
    var spawn = overworld.getSharedSpawnPos()
    return { dim: OVERWORLD_DIM, x: spawn.getX() + 0.5, y: spawn.getY(), z: spawn.getZ() + 0.5, yaw: 0, pitch: 0 }
}

function teleportSafely(player, dimId, x, y, z, yaw, pitch) {
    try {
        player.teleportTo(dimId, x, y, z, yaw, pitch)
        return true
    } catch (e) {
        console.error('[grindless] No se pudo teletransportar a ' + dimId + ': ' + e)
        return false
    }
}

// ---------------------------------------------------------------- key behaviour

function returnToSavedPosition(player, server) {
    var pd = getPD(player)
    var dest
    if (pd.contains('return_dim') && server.getLevel(pd.getString('return_dim'))) {
        dest = {
            dim: pd.getString('return_dim'),
            x: pd.getDouble('return_x'),
            y: pd.getDouble('return_y'),
            z: pd.getDouble('return_z'),
            yaw: pd.contains('return_yaw') ? pd.getFloat('return_yaw') : 0,
            pitch: pd.contains('return_pitch') ? pd.getFloat('return_pitch') : 0,
        }
    } else {
        dest = fallbackSpawn(player, server)
    }
    return teleportSafely(player, dest.dim, dest.x, dest.y, dest.z, dest.yaw, dest.pitch)
}

function travelToBuildingDimension(player, server, targetDimId) {
    var targetLevel = server.getLevel(targetDimId)
    if (!targetLevel) {
        console.warn('[grindless] La dimensión ' + targetDimId + ' no existe todavía (datapack no cargado?)')
        return false
    }
    var landing = computeLanding(targetLevel, targetDimId, player.getX(), player.getZ())
    return teleportSafely(player, targetDimId, landing.x, landing.y, landing.z, player.getYRot(), player.getXRot())
}

function handleKeyUse(player, targetDimId, item) {
    var level = player.getLevel()
    var server = player.getServer()
    if (!level || !server) return
    if (isOnCooldown(player, level)) return

    var curDimId = level.getDimension().toString()
    var handled

    if (curDimId === targetDimId) {
        // already in that dimension -> go back to the saved Overworld (or wherever) return point
        handled = returnToSavedPosition(player, server)
    } else if (curDimId === VOID_DIM || curDimId === FLAT_DIM) {
        // hopping directly between the two building dimensions: keep the existing return point
        handled = travelToBuildingDimension(player, server, targetDimId)
    } else {
        // leaving the Overworld (or any other dimension) into a building dimension
        saveReturnPoint(player, curDimId)
        handled = travelToBuildingDimension(player, server, targetDimId)
    }

    if (handled) {
        armCooldown(player, level)
        player.addItemCooldown(item, COOLDOWN_TICKS) // vanilla hotbar overlay, cosmetic on top of our own check
    }
}

ItemEvents.rightClicked('grindless:void_key', function (event) { onVoidKeyClicked(event) })

ItemEvents.rightClicked('grindless:flat_key', function (event) { onFlatKeyClicked(event) })

function onVoidKeyClicked(event) {
    var player = event.getPlayer()
    if (!player) return
    handleKeyUse(player, VOID_DIM, event.getItem().getItem())
}

function onFlatKeyClicked(event) {
    var player = event.getPlayer()
    if (!player) return
    handleKeyUse(player, FLAT_DIM, event.getItem().getItem())
}

// ---------------------------------------------------------------- cheap recovery recipes

ServerEvents.recipes(function (event) { addKeyRecipes(event) })

function addKeyRecipes(event) {
    event.shapeless('grindless:void_key', ['minecraft:flint', 'minecraft:stick', 'minecraft:glass'])
        .id('grindless:void_key_from_flint')
    event.shapeless('grindless:flat_key', ['minecraft:flint', 'minecraft:stick', 'minecraft:dirt'])
        .id('grindless:flat_key_from_flint')
}

// ---------------------------------------------------------------- bonus: GT ore veins under grindless:flat
//
// GTM skips ore vein placement for any `minecraft:flat` chunk generator unless the dev config flag
// `dev.doSuperflatOres` is on (see com.gregtechceu.gtceu.api.data.worldgen.ores.OrePlacer#placeOres,
// GTM 7.5.3). Flipping that public config field at server start lets our flat generator keep GTM's
// normal vein placement instead of being skipped outright.
ServerEvents.loaded(function (event) { activateSuperflatOres() })

function activateSuperflatOres() {
    try {
        // GTM 7.5.3's ConfigHolder has no getInstance() helper (that was added later): it's a plain
        // `init()` + public static `INSTANCE` field (com.gregtechceu.gtceu.config.ConfigHolder).
        $GTConfigHolder.init()
        $GTConfigHolder.INSTANCE.dev.doSuperflatOres = true
    } catch (e) {
        console.error('[grindless] No se pudo activar dev.doSuperflatOres (vetas GT en Llano): ' + e)
    }
}

// Extend every Overworld-targeted ore vein so it also considers grindless:flat as a valid dimension.
GTCEuServerEvents.oreVeins(function (event) { extendOreVeinsToFlat(event) })

function extendOreVeinsToFlat(event) {
    try {
        var flatKey = $ResourceKey.create($Registries.DIMENSION, new $ResourceLocation('grindless', 'flat'))
        event.modifyAll(function (id, vein) { addFlatToVeinFilter(vein, flatKey) })
    } catch (e) {
        console.error('[grindless] No se pudieron extender las vetas de GT a grindless:flat: ' + e)
    }
}

function addFlatToVeinFilter(vein, flatKey) {
    var filter = vein.dimensionFilter()
    var hasOverworld = false
    filter.forEach(function (key) {
        if (key.location().toString() === OVERWORLD_DIM) hasOverworld = true
    })
    if (!hasOverworld) return

    var updated = new $HashSet(filter)
    updated.add(flatKey)
    vein.dimensionFilter(updated)
}
