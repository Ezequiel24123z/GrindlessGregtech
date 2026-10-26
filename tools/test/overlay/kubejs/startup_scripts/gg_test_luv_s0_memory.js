// Opt-in test-instance isolation only. No shipped config, recipe or mod changes.
// Forge ScreenEvent.Init.Post precedes mc-runtime-test's next-tick onCreate.
// Public 1.20.1 CreateWorldScreen/WorldCreationUiState setters, not reflection.
;(function () {
  if (!Platform.isClientEnvironment()) return
  var marker = JsonIO.read('kubejs/config/gg_test_luv_s0_planet.json')
  if (marker === null || String(marker.get('enabled')) !== 'true' ||
      String(marker.get('memoryIsolation')) !== 'true') return
  var Create = Java.loadClass('net.minecraft.client.gui.screens.worldselection.CreateWorldScreen')
  var memory = null
  try {
    memory = Java.loadClass('java.lang.management.ManagementFactory').getMemoryMXBean()
  } catch (err) {
    global.ggLuvS0MemorySummary = JSON.stringify({ measurementAvailable: false, error: String(err) })
    console.info('GGTEST|luv_s0_memory|heap_measurement|NOTE|unavailable: ' + err)
  }
  var peak = 0
  var samples = 0
  var next = 0
  var nextLog = 0
  var configured = false
  var viewersAbsent = !Platform.isLoaded('emi') && !Platform.isLoaded('jei')
  function emit(name, ok, detail) {
    console.info('GGTEST|luv_s0_memory|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  emit('viewers_excluded', viewersAbsent, 'EMI/JEI absent only from disposable spike client')
  if (!viewersAbsent) global.ggLuvS0MemoryError = 'EMI/JEI must be excluded in the memory-isolated spike client'
  ForgeEvents.onEvent('net.minecraftforge.client.event.ScreenEvent$Init$Post', function (event) {
    var screen = event.getScreen()
    if (!(screen instanceof Create)) return
    try {
      var ui = screen.getUiState()
      if (String(ui.isGenerateStructures()) !== 'false') ui.setGenerateStructures(false)
      configured = String(ui.isGenerateStructures()) === 'false'
      emit('world_creation', configured, 'native creation UI generateStructures=' + ui.isGenerateStructures())
      if (!configured) throw new Error('native creation UI retained structures')
    } catch (err) {
      global.ggLuvS0MemoryError = String(err)
      emit('world_creation', false, String(err))
    }
  })
  ForgeEvents.onEvent('net.minecraftforge.event.TickEvent$ClientTickEvent', function (event) {
    if (memory === null || String(event.phase) !== 'END' || Date.now() < next) return
    next = Date.now() + 1000
    var used
    var limit
    try {
      var usage = memory.getHeapMemoryUsage()
      used = Number(usage.getUsed())
      limit = Number(usage.getMax())
    } catch (err) {
      memory = null
      global.ggLuvS0MemorySummary = JSON.stringify({ measurementAvailable: false, error: String(err) })
      console.info('GGTEST|luv_s0_memory|heap_measurement|NOTE|sampling unavailable: ' + err)
      return
    }
    peak = Math.max(peak, used)
    samples++
    global.ggLuvS0MemorySummary = JSON.stringify({ maxHeapBytes: limit, peakObservedUsedBytes: peak,
      samples: samples, viewersAbsent: viewersAbsent, creationStructuresDisabled: configured,
      note: 'Sampled Java heap, not total process/native RAM or a proof of an unsampled peak.' })
    if (Date.now() < nextLog) return
    nextLog = Date.now() + 10000
    emit('heap_sample', limit > 0 && limit <= 4294967296, 'usedMiB=' + Math.round(used / 1048576) +
      ', peakObservedMiB=' + Math.round(peak / 1048576) + ', maxHeapMiB=' + Math.round(limit / 1048576))
  })
})()
