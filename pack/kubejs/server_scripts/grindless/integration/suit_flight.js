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
// While the player is flying on our flight, 'enabled' is switched off and remembered ('gg_suit_jet'); it is switched back on when
// flight stops. So there is one drain and no jetpack speed on top of creative flight.
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
  var K_JET = 'gg_suit_jet'

  var Helper = Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper')
  var Slot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')

  function setFlight(p, on) {
    var ab = p.getAbilities()
    ab.mayfly = on
    if (!on) ab.flying = false
    p.onUpdateAbilities()
  }

  // Puts the advanced chestplate's jetpack back as it was, if we switched it off.
  function restoreJetpack(p, stack, data) {
    if (!data.getBoolean(K_JET)) return
    data.putBoolean(K_JET, false)
    if (stack !== null && !stack.isEmpty() && JETPACKS[String(stack.id)]) {
      var tag = stack.getNbt()
      if (tag !== null && tag !== undefined) tag.putBoolean('enabled', true)
    }
  }

  function revoke(p, stack, data) {
    data.putBoolean(K_FLIGHT, false)
    restoreJetpack(p, stack, data)
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
      if (marked) {
        data.putBoolean(K_FLIGHT, false)
        restoreJetpack(p, stack, data)
      }
      return
    }

    var amount = cost * CHECK
    var eligible = elec !== null && elec !== undefined && Number(elec.getCharge()) >= amount
    var ab = p.getAbilities()

    if (!eligible) {
      if (marked) revoke(p, stack, data)
      return
    }

    if (!ab.mayfly) {
      setFlight(p, true)
      data.putBoolean(K_FLIGHT, true)
      marked = true
    } else if (!marked) {
      return
    }

    if (!ab.flying) {
      restoreJetpack(p, stack, data)
      return
    }

    if (JETPACKS[String(stack.id)]) {
      var tag = stack.getNbt()
      if (tag !== null && tag !== undefined && tag.getBoolean('enabled')) {
        tag.putBoolean('enabled', false)
        data.putBoolean(K_JET, true)
      }
    }
    elec.discharge(amount, elec.getTier(), true, false, false)
    var max = Number(elec.getMaxCharge())
    if (max > 0 && Number(elec.getCharge()) <= max / 10 && p.age % WARN_EVERY < CHECK) {
      p.setStatusMessage(Text.red('Suit power low: ' + Math.floor(Number(elec.getCharge()) * 100 / max) + '%. Land and recharge.'))
    }
  })
})()
