// priority: 900
// -----------------------------------------------------------------------------------------------
// How a wireless hatch or cover moves EU into and out of a GTM machine (lv/wireless_energy.js). GTM 7.5.3 keeps a machine's EU in an
// energy container (TieredEnergyMachine#energyContainer, EnergyHatchPartMachine#energyContainer), and the containers do not all keep
// their books the same way, so the network only moves EU through the ones it knows, picked by the container's exact class:
//   - plain: NotifiableEnergyContainer, and RecipeAmperageEnergyContainer (WorkableTieredMachine's: it only changes the amperage
//     getters). One stored number, which getEnergyStored reports and changeEnergy changes; changeEnergy returns the exact change.
//   - items: the EnergyBatteryTrait of BatteryBufferMachine and of ChargerMachine. Their getEnergyStored and getEnergyCapacity report
//     the charge of the items in their slots, while the changeEnergy they inherit writes a separate internal buffer and returns the
//     change of a number it does not keep (on a charger holding a battery at 60,000 EU it returned -55,904 and charged nothing: the
//     network took that as EU given back). The adapter charges and discharges the items themselves, with GTM's own calls and limits,
//     those of the classes' acceptEnergyFromNetwork and serverTick, per tick times the settlement's ticks, and never touches the
//     internal buffer: IElectricItem#charge(min(left, V[item tier] x amps per item x ticks), machine tier, true, false) and
//     FeCompat#insertEu (Forge Energy items, when GTM's nativeEUToFE is on: 4 FE = 1 EU, whole EU only) going in; going out (a battery
//     buffer only, as GTM's serverTick), IElectricItem#discharge on the batteries that can give charge, at most min(V, the battery's
//     transfer limit) per tick each. Only while the machine is enabled (IControllable, as GTM's side conditions).
//   - anything else (GTM's ConverterTrait, NotifiableLaserContainer and the creative InfiniteEnergyContainer, or any other mod's class):
//     unsupported. A cover is refused on it with a message; the network never calls changeEnergy on a class it does not know.
// Every move is checked: the amount moved is a whole number within what was asked, and the machine's stored EU (getEnergyStored: for
// item machines the items' charge) changed by exactly that amount. Anything else throws, with the numbers and `measured`, what the stored
// EU really did; the caller counts that (a fill it cannot measure is charged in full, a drain credits nothing: a failure can lose EU,
// never make it), sets the block aside and logs it as an error.
//
// Published as global.grindless.wirelessAdapters: create(deps) -> { classify, room, fill, available, drain }, and gtmDeps() (GTM's
// classes, loaded on first use). A test hands create() its own deps. Rhino: var + function.
(function () {
  var G = global.grindless || (global.grindless = {})

  var PLAIN = {
    'com.gregtechceu.gtceu.api.machine.trait.NotifiableEnergyContainer': true,
    'com.gregtechceu.gtceu.api.machine.trait.RecipeAmperageEnergyContainer': true
  }
  // inventory getter, the class holding GTM's amps-per-item constant and its name, and whether the machine gives EU (a battery buffer)
  var ITEMS = {
    'com.gregtechceu.gtceu.common.machine.electric.BatteryBufferMachine$EnergyBatteryTrait': {
      name: 'battery buffer', inventory: 'getBatteryInventory', owner: 'com.gregtechceu.gtceu.common.machine.electric.BatteryBufferMachine',
      amps: 'AMPS_PER_BATTERY', gives: true
    },
    'com.gregtechceu.gtceu.common.machine.electric.ChargerMachine$EnergyBatteryTrait': {
      name: 'charger', inventory: 'getChargerInventory', owner: 'com.gregtechceu.gtceu.common.machine.electric.ChargerMachine',
      amps: 'AMPS_PER_ITEM', gives: false
    }
  }

  // GTM's side: what the adapter calls on the game's classes
  function gtmDeps() {
    var GTCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper')
    var FeCompat = Java.loadClass('com.gregtechceu.gtceu.api.capability.compat.FeCompat')
    var ConfigHolder = Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder')
    var amps = {}
    return {
      V: function (tier) { return Number(GTValues.V[tier]) },
      nativeEUToFE: function () { return ConfigHolder.INSTANCE.compat.energy.nativeEUToFE === true },
      electricItem: function (stack) { var e = GTCap.getElectricItem(stack); return e === undefined ? null : e },
      feItem: function (stack) { var s = GTCap.getForgeEnergyItem(stack); return s === undefined ? null : s },
      insertEu: function (storage, eu, simulate) { return Number(FeCompat.insertEu(storage, eu, simulate)) },
      ampsPerItem: function (spec) {
        if (amps[spec.owner] === undefined) amps[spec.owner] = Number(Java.loadClass(spec.owner)[spec.amps])
        return amps[spec.owner]
      }
    }
  }

  function create(deps) {
    function containerOf(m) {
      if (m === null || m === undefined) return null
      var c = m.energyContainer
      return c === null || c === undefined ? null : c
    }

    // { kind: 'none' | 'plain' | 'items' | 'unsupported', m, c, cls, spec }
    function classify(m) {
      var c = containerOf(m)
      if (c === null) return { kind: 'none', m: m, c: null, cls: '' }
      var cls = String(c.getClass().getName())
      if (PLAIN[cls]) return { kind: 'plain', m: m, c: c, cls: cls }
      if (ITEMS[cls]) return { kind: 'items', m: m, c: c, cls: cls, spec: ITEMS[cls] }
      return { kind: 'unsupported', m: m, c: c, cls: cls }
    }

    function whole(n) {
      return typeof n === 'number' && n % 1 === 0 && n >= 0
    }

    // an error that carries what the stored EU really did (`measured`: EU in for a fill, out for a drain), so the caller can count it
    function failure(message, measured) {
      var err = new Error(message)
      err.measured = measured
      return err
    }

    // the amount moved must be a whole number within what was asked, and the stored EU must have changed by exactly that much
    function checked(a, what, asked, got, before, after) {
      var change = what === 'in' ? after - before : before - after
      if (!whole(asked) || !whole(got) || got > asked || change !== got) {
        throw failure(what + ' ' + a.cls + ': asked ' + asked + ', moved ' + got + ', stored ' + before + ' -> ' + after, change)
      }
      return got
    }

    function stored(a) {
      return Number(a.c.getEnergyStored())
    }

    function enabled(a) {
      return typeof a.m.isWorkingEnabled !== 'function' || a.m.isWorkingEnabled() === true
    }

    // the item machine's slots that take EU: [{ e } | { fe }], in slot order
    function intake(a) {
      var inv = a.m[a.spec.inventory]()
      var out = []
      for (var i = 0; i < inv.getSlots(); i++) {
        var stack = inv.getStackInSlot(i)
        if (stack.isEmpty()) continue
        var e = deps.electricItem(stack)
        if (e !== null) {
          if (Number(e.getCharge()) < Number(e.getMaxCharge())) out.push({ e: e })
          continue
        }
        if (deps.nativeEUToFE()) {
          var fe = deps.feItem(stack)
          if (fe !== null) out.push({ fe: fe })
        }
      }
      return out
    }

    // the batteries that give EU (GTM's getNonEmptyBatteries: charge > 0 and able to give it to a machine)
    function outtake(a) {
      var inv = a.m[a.spec.inventory]()
      var out = []
      for (var i = 0; i < inv.getSlots(); i++) {
        var stack = inv.getStackInSlot(i)
        if (stack.isEmpty()) continue
        var e = deps.electricItem(stack)
        if (e !== null && e.canProvideChargeExternally() && Number(e.getCharge()) > 0) out.push(e)
      }
      return out
    }

    // one item: what it takes of `amount` (simulate: what it would take), within GTM's per-item limit for `ticks` ticks
    function chargeOne(a, slot, amount, ticks, simulate) {
      var tier = Number(a.m.getTier())
      var perItem = deps.ampsPerItem(a.spec)
      if (slot.e) {
        var cap = deps.V(Number(slot.e.getTier())) * perItem * ticks
        var ask = Math.min(amount, cap)
        return ask > 0 ? Number(slot.e.charge(ask, tier, true, simulate)) : 0
      }
      var feCap = deps.V(tier) * perItem * ticks
      var feAsk = Math.min(amount, feCap)
      return feAsk > 0 ? deps.insertEu(slot.fe, feAsk, simulate) : 0
    }

    function dischargeOne(a, e, amount, ticks, simulate) {
      var tier = Number(a.m.getTier())
      var cap = Math.min(deps.V(tier), Number(e.getTransferLimit())) * ticks
      var ask = Math.min(amount, cap)
      return ask > 0 ? Number(e.discharge(ask, tier, true, true, simulate)) : 0
    }

    // what the machine can take now, at most `limit`
    function room(a, limit, ticks) {
      if (a.kind === 'plain') return Math.max(0, Math.min(limit, Number(a.c.getEnergyCapacity()) - stored(a)))
      if (a.kind !== 'items') throw new Error('no energy adapter for ' + (a.cls || 'a machine without an energy container'))
      if (!enabled(a)) return 0
      var sum = 0
      intake(a).forEach(function (slot) {
        if (sum < limit) sum += chargeOne(a, slot, limit - sum, ticks, true)
      })
      return Math.min(sum, limit)
    }

    // puts `amount` in; returns what went in (checked). A failure carries `measured`: what the stored EU really rose by.
    function fill(a, amount, ticks) {
      if (amount <= 0) return 0
      if (a.kind !== 'plain' && a.kind !== 'items') throw failure('no energy adapter for ' + (a.cls || 'a machine without an energy container'), 0)
      var before = stored(a)
      var moved = 0
      try {
        if (a.kind === 'plain') moved = Number(a.c.changeEnergy(amount))
        else if (enabled(a)) {
          var left = amount
          intake(a).forEach(function (slot) {
            if (left <= 0) return
            var got = chargeOne(a, slot, left, ticks, false)
            if (!whole(got) || got > left) throw new Error('an item took ' + got + ' of ' + left)
            left -= got
          })
          moved = amount - left
          if (moved > 0) afterItems(a)
        }
      } catch (err) {
        var after = stored(a)
        throw failure('in ' + a.cls + ': ' + (err.message || err) + ' (stored ' + before + ' -> ' + after + ')', after - before)
      }
      return checked(a, 'in', amount, moved, before, stored(a))
    }

    // what the machine can give now, at most `limit`
    function available(a, limit, ticks) {
      if (a.kind === 'plain') return Math.max(0, Math.min(limit, stored(a)))
      if (a.kind !== 'items' || !a.spec.gives) throw new Error('no energy adapter gives EU from ' + (a.cls || 'a machine without an energy container'))
      if (!enabled(a)) return 0
      var sum = 0
      outtake(a).forEach(function (e) {
        if (sum < limit) sum += dischargeOne(a, e, limit - sum, ticks, true)
      })
      return Math.min(sum, limit)
    }

    // takes `amount` out; returns what came out (checked). A failure carries `measured`: what the stored EU really fell by.
    function drain(a, amount, ticks) {
      if (amount <= 0) return 0
      if (a.kind !== 'plain' && !(a.kind === 'items' && a.spec.gives)) {
        throw failure('no energy adapter gives EU from ' + (a.cls || 'a machine without an energy container'), 0)
      }
      var before = stored(a)
      var moved = 0
      try {
        if (a.kind === 'plain') moved = -Number(a.c.changeEnergy(-amount))
        else if (enabled(a)) {
          var left = amount
          outtake(a).forEach(function (e) {
            if (left <= 0) return
            var got = dischargeOne(a, e, left, ticks, false)
            if (!whole(got) || got > left) throw new Error('a battery gave ' + got + ' of ' + left)
            left -= got
          })
          moved = amount - left
          if (moved > 0) afterItems(a)
        }
      } catch (err) {
        var after = stored(a)
        throw failure('out ' + a.cls + ': ' + (err.message || err) + ' (stored ' + before + ' -> ' + after + ')', before - after)
      }
      return checked(a, 'out', amount, moved, before, stored(a))
    }

    // what GTM does after its own item moves: save the machine, and a battery buffer re-checks whether it has EU to send
    function afterItems(a) {
      a.m.markDirty()
      if (a.spec.gives) a.c.checkOutputSubscription()
    }

    return { classify: classify, room: room, fill: fill, available: available, drain: drain }
  }

  G.wirelessAdapters = { PLAIN: PLAIN, ITEMS: ITEMS, create: create, gtmDeps: gtmDeps }
})()
