// priority: -17499
// -----------------------------------------------------------------------------------------------
// FTB Teams and FTB Chunks, seen by our scripts (B13-WTEAM, #235; the owner's answer on #230: the wireless network and the Hyperstargate's
// dial are per team). One place that maps a player, a player's UUID or a machine to a team id, and asks FTB Chunks whether a player may
// change a block, so the wireless network (lv/wireless_energy.js) and the dial (a later package) share one answer.
//
// A team id is the FTB team's UUID as text. Every player has a personal team whose id is the player's own UUID; joining a party changes the
// team a player is in from then on (FTB's own rule), and what was built for a team stays with that team. When FTB Teams has no team for a
// UUID (a player who never logged in, or the mod missing), the UUID itself is the id, which is the id the personal team will have.
// 'server' is the id of whatever no player owns (a block set by a command or a script). A fake player (machines, mods' automation) acts for
// nobody, so ofPlayer answers 'server' for it.
//
// Published as global.grindless.teams: SERVER, ofPlayer(player), ofUuid(uuid), ofMachine(machine), claimOwner(level, pos),
// claimRefuses(player, level, pos), using(deps) (a test's own FTB lookups: teamOfUuid, teamOfPlayer, claimTeam, claimRefuses, machineOwner).
// Rhino: var + function.
(function () {
  var G = global.grindless || (global.grindless = {})
  var SERVER = 'server'
  var LOG = '[grindless/teams] '
  var injected = null
  var warned = {}

  function warnOnce(key, err) {
    if (warned[key]) return
    warned[key] = true
    console.error(LOG + key + ': ' + err)
  }

  function text(v) {
    return v === null || v === undefined ? null : String(v)
  }

  // ---------------------------------------------------------------- FTB Teams
  function teamManager() {
    try {
      var api = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI').api()
      return api.isManagerLoaded() ? api.getManager() : null
    } catch (e) {
      warnOnce('FTB Teams is not available, every player is on a personal network', e)
      return null
    }
  }

  function idOf(optional) {
    return optional !== null && optional !== undefined && optional.isPresent() ? text(optional.get().getId()) : null
  }

  function ofUuid(uuid) {
    if (uuid === null || uuid === undefined) return SERVER
    if (injected && injected.teamOfUuid) return injected.teamOfUuid(uuid) || text(uuid)
    var tm = teamManager()
    var id = null
    if (tm !== null) {
      try {
        id = idOf(tm.getTeamForPlayerID(uuid))
      } catch (e) {
        warnOnce('team lookup by UUID failed', e)
      }
    }
    return id || text(uuid)
  }

  // a fake player (a machine, a script, a mod's automation) acts for nobody, so it has no team of its own
  function isFake(player) {
    try {
      return Java.loadClass('net.minecraftforge.common.util.FakePlayer').class.isInstance(player)
    } catch (e) {
      warnOnce('fake player check failed', e)
      return false
    }
  }

  // the team of a player, or SERVER for a fake player and for none
  function ofPlayer(player) {
    if (player === null || player === undefined) return SERVER
    if (injected && injected.teamOfPlayer) return injected.teamOfPlayer(player) || text(player.getUUID())
    if (isFake(player)) return SERVER
    var tm = teamManager()
    var id = null
    if (tm !== null) {
      try {
        id = idOf(tm.getTeamForPlayer(player))
      } catch (e) {
        warnOnce('team lookup by player failed', e)
      }
    }
    return id || text(player.getUUID())
  }

  // the team of the player GTM recorded as a machine's owner when it was placed, or SERVER when it has none
  function ofMachine(machine) {
    if (machine === null || machine === undefined) return SERVER
    try {
      if (injected && injected.machineOwner) return injected.machineOwner(machine) ? ofUuid(injected.machineOwner(machine)) : SERVER
      if (typeof machine.getOwnerUUID !== 'function') return SERVER
      var owner = machine.getOwnerUUID()
      if (owner === null || owner === undefined || text(owner) === '00000000-0000-0000-0000-000000000000') return SERVER
      return ofUuid(owner)
    } catch (e) {
      warnOnce('machine owner lookup failed', e)
      return SERVER
    }
  }

  // ---------------------------------------------------------------- FTB Chunks
  function chunksManager() {
    try {
      var api = Java.loadClass('dev.ftb.mods.ftbchunks.api.FTBChunksAPI').api()
      return api.isManagerLoaded() ? api.getManager() : null
    } catch (e) {
      warnOnce('FTB Chunks is not available, claims are not checked', e)
      return null
    }
  }

  // the team that has claimed the chunk of pos, or null when it is unclaimed
  function claimOwner(level, pos) {
    if (injected && injected.claimTeam) return injected.claimTeam(level, pos) || null
    var cm = chunksManager()
    if (cm === null) return null
    try {
      var Pos = Java.loadClass('dev.ftb.mods.ftblibrary.math.ChunkDimPos')
      var chunk = cm.getChunk(new Pos(level, pos))
      return chunk === null || chunk === undefined ? null : text(chunk.getTeamData().getTeam().getId())
    } catch (e) {
      warnOnce('claim lookup failed', e)
      return null
    }
  }

  // true when FTB Chunks says this player may not edit and use the block at pos (another team's claim, no wilderness building...), by
  // FTB Chunks' own rule (its protection policies, bypass mode, fake-player setting); false when the mod is missing or says yes
  function claimRefuses(player, level, pos) {
    if (injected && injected.claimRefuses) return !!injected.claimRefuses(player, level, pos)
    var cm = chunksManager()
    if (cm === null) return false
    try {
      var Protection = Java.loadClass('dev.ftb.mods.ftbchunks.api.Protection')
      var Hand = Java.loadClass('net.minecraft.world.InteractionHand')
      return cm.shouldPreventInteraction(player, Hand.MAIN_HAND, pos, Protection.EDIT_AND_INTERACT_BLOCK, null) === true
    } catch (e) {
      warnOnce('claim check failed, the cover is refused', e)
      return true
    }
  }

  G.teams = {
    SERVER: SERVER,
    ofPlayer: ofPlayer,
    ofUuid: ofUuid,
    ofMachine: ofMachine,
    claimOwner: claimOwner,
    claimRefuses: claimRefuses,
    // a test's own lookups; any it leaves out are the real ones. using(null) puts the real ones back
    using: function (deps) { injected = deps || null }
  }
})()
