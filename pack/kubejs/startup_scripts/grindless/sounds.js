// priority: -6650
// -----------------------------------------------------------------------------------------------
// Working-sound loops of our special multiblocks (QR-E0, docs/quality/sounds.md).
//
// GTM 7.5.3 plays a machine's working sound per recipe type: RecipeLogic.updateSound() (client) looks up
// getRecipeType().getSound() and starts an AutoReleasedSound (looping, linear attenuation) on the SoundEvent of that SoundEntry.
// KubeJS cannot register a GTM SoundEntry (GTRegistries.SOUNDS is frozen after GTSoundEntries.init), but GTM's ExistingSoundEntry
// wraps any SoundEvent, so: 1. register the SoundEvent with KubeJS (sound_event registry), 2. after every recipe type exists (the
// machine registry fires after the recipe_type one) wrap it and call GTRecipeType.setSound. Era files stay untouched.
//
// Adding a sound: a row in tools/assets/sounds.json, run tools/assets/New-MachineSound.ps1, one line in WIRING below.
// -----------------------------------------------------------------------------------------------
(function () {
  const NS = 'grindless'

  // recipe type id -> sound event path (a key of assets/grindless/sounds.json). Keep in step with tools/assets/sounds.json.
  const WIRING = {
    'gtceu:radio_astronomy': 'loop_observatory',
    'gtceu:mega_chemical_complex': 'loop_mega_chemical_complex',
    'gtceu:plasma_quench': 'loop_plasma_quench_caster'
  }

  StartupEvents.registry('sound_event', function (event) {
    Object.keys(WIRING).forEach(function (typeId) {
      event.create(NS + ':' + WIRING[typeId])
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function () {
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var SoundEvent = Java.loadClass('net.minecraft.sounds.SoundEvent')
    var SoundSource = Java.loadClass('net.minecraft.sounds.SoundSource')
    var Entry = Java.loadClass('com.gregtechceu.gtceu.api.sound.ExistingSoundEntry')
    var Registries = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')

    Object.keys(WIRING).forEach(function (typeId) {
      var type = Registries.RECIPE_TYPES.get(new RL(typeId))
      if (type == null) {
        console.error('[grindless sounds] recipe type not found: ' + typeId)
        return
      }
      var entry = new Entry(SoundEvent.createVariableRangeEvent(new RL(NS, WIRING[typeId])), SoundSource.BLOCKS)
      type.setSound(entry)
    })
  })
})()
