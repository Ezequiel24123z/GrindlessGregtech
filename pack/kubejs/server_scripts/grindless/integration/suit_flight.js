// priority: -16074
// Creative flight for GTM's powered chestplates (NANO-1, #181).
// A charged chestplate lets a survival player fly; flying drains the chestplate through GTM's own electric-item
// capability, the same call GTM's suits use. Nothing is drained on the ground or while not flying.
//
//   NanoMuscle chestplate (6.4M EU)           175 EU/t  ~30.5 min per full charge
//   Advanced NanoMuscle chestplate (12.8M EU) 175 EU/t  ~61 min (it also carries GTM's jetpack)
//   QuarkTech chestplate (100M EU)            2,500 EU/t ~33 min
//   Advanced QuarkTech chestplate (1B EU)     2,500 EU/t ~5.5 h (it also carries GTM's jetpack)
//
// We only revoke flight we granted (persistentData 'gg_suit_flight'). Creative and spectator players and flight from other
// sources are never touched. The check runs every CHECK ticks and drains CHECK ticks' worth at once; it also covers login,
// respawn and dimension change, because the marker survives them and the abilities may not.
//
// Jetpack: on the advanced chestplates GTM's jetpack (the NBT flag 'enabled') would thrust and drain on top of creative flight.
// While the player is flying on our flight, 'enabled' is switched off and the chestplate itself is marked ('gg_jet_off'); whenever a
// marked chestplate is worn outside our flight, 'enabled' goes back on. So there is one drain and no jetpack speed on top of
// creative flight. The mark travels with the item: a chestplate taken off mid-flight gets its jetpack back the next time it is
// worn, and a jetpack its owner had switched off is never switched on.
;(function () {
  var CHECK = 5
  var WARN_EVERY = 100
  var SUITS = {
    'gtceu:nanomuscle_chestplate': 175,
    'gtceu:advanced_nanomuscle_chestplate': 175,
    'gtceu:quarktech_chestplate': 2500,
    'gtceu:advanced_quarktech_chestplate': 2500
  }
  var JETPACKS = {
    'gtceu:advanced_nanomuscle_chestplate': true,
    'gtceu:advanced_quarktech_chestplate': true
  }
  var K_FLIGHT = 'gg_suit_flight'
  var K_JET_OFF = 'gg_jet_off'

  var Helper = Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper')
  var Slot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')

  function setFlight(p, on) {
    var ab = p.getAbilities()
    ab.mayfly = on
    if (!on) ab.flying = false
    p.onUpdateAbilities()
  }

  // The NBT of a worn advanced chestplate (the ones with GTM's jetpack), or null.
  function jetTag(stack) {
    if (stack === null || stack === undefined || stack.isEmpty() || !JETPACKS[String(stack.id)]) return null
    var tag = stack.getNbt()
    return tag === null || tag === undefined ? null : tag
  }

  // Switches the jetpack off for our flight and marks the chestplate, if the jetpack is on.
  function suppressJetpack(stack) {
    var tag = jetTag(stack)
    if (tag !== null && tag.getBoolean('enabled')) {
      tag.putBoolean('enabled', false)
      tag.putBoolean(K_JET_OFF, true)
    }
  }

  // Switches the jetpack of a chestplate we marked back on.
  function restoreJetpack(stack) {
    var tag = jetTag(stack)
    if (tag !== null && tag.getBoolean(K_JET_OFF)) {
      tag.remove(K_JET_OFF)
      tag.putBoolean('enabled', true)
    }
  }

  function revoke(p, data) {
    data.putBoolean(K_FLIGHT, false)
    setFlight(p, false)
  }

  PlayerEvents.tick(function (event) {
    var p = event.player
    if (p.age % CHECK !== 0) return
    var data = p.getPersistentData()
    var marked = data.getBoolean(K_FLIGHT)
    var stack = p.getItemBySlot(Slot.CHEST)
    var cost = 0
    var elec = null
    if (stack !== null && !stack.isEmpty()) {
      cost = SUITS[String(stack.id)] || 0
      if (cost > 0) elec = Helper.getElectricItem(stack)
    }

    if (p.isCreative() || p.isSpectator()) {
      if (marked) data.putBoolean(K_FLIGHT, false)
      restoreJetpack(stack)
      return
    }

    var amount = cost * CHECK
    var eligible = elec !== null && elec !== undefined && Number(elec.getCharge()) >= amount
    var ab = p.getAbilities()

    if (!eligible) {
      if (marked) revoke(p, data)
      restoreJetpack(stack)
      return
    }

    if (!ab.mayfly) {
      setFlight(p, true)
      data.putBoolean(K_FLIGHT, true)
      marked = true
    } else if (!marked) {
      restoreJetpack(stack)
      return
    }

    if (!ab.flying) {
      restoreJetpack(stack)
      return
    }

    suppressJetpack(stack)
    elec.discharge(amount, elec.getTier(), true, false, false)
    var max = Number(elec.getMaxCharge())
    if (max > 0 && Number(elec.getCharge()) <= max / 10 && p.age % WARN_EVERY < CHECK) {
      p.setStatusMessage(Text.red('Suit power low: ' + Math.floor(Number(elec.getCharge()) * 100 / max) + '%. Land and recharge.'))
    }
  })
})()
