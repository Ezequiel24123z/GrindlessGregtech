// AF-X (finding M1-02): the Horizon Shard can be made. It is the Horizon Collector's catalyst and a kept input of both creative-core rows, so a
// world that loses the shard (or a pack that ends without the Welcome quest reward) must be able to make another, or the ending can be locked.
// One recipe on the mirror shell (gtceu:black_hole_bomb, at Sgr A* like the shell's own recipes): 2 seed wave packets (about 4.5e12 EU along L18),
// 1 final spin map and 4 horizon phase locks -> 1 shard, VA[MAX] for 1,200 t. Dearer than any MAX component and every input is automated.
// Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var VA_MAX = Number(GTValues.VA[14])
  var SITE = 'gcyr:black_hole_orbit'
  var KEY = 'grindless_black_hole_bomb'
  var NAME = 'horizon_shard'
  var G = global.grindless || (global.grindless = {})
  G.horizonShard = { recipe: 'grindless:black_hole_bomb/' + NAME, made: false }

  ServerEvents.recipes(function (event) {
    try {
      var items = ['2x grindless:seed_wave_packet', '1x grindless:final_spin_map', '4x grindless:horizon_phase_lock']
      var out = '1x grindless:horizon_shard'
      var missing = items.concat([out]).filter(function (s) { return !Item.exists(String(s).replace(/^\d+x /, '')) })
      if (missing.length > 0) {
        console.error(LOG + 'horizon shard skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.black_hole_bomb('grindless:' + NAME)
      b.circuit(5)
      items.forEach(function (s) { b.itemInputs(s) })
      b.itemOutputs(out)
      b.dimension(SITE)
      b.addDataString(KEY, NAME)
      b.EUt(VA_MAX).duration(1200)
      G.horizonShard.made = true
    } catch (e) {
      console.error(LOG + 'horizon shard failed: ' + e)
    }
  })
})()
