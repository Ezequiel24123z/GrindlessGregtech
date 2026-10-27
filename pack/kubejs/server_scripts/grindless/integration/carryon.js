// priority: -14224
// -----------------------------------------------------------------------------------------------
// Carry On (carryon): GregTech machines, multiblock controllers, pipes, cables and covers must not be picked up.
// A picked-up controller loses its formed state, covers and paint, and moving pipes or cables would duplicate or void
// their network data. Mechanism: Carry On's own data tag #carryon:block_blacklist (read by its ListHandler), filled with
// every block of the gtceu namespace (our KubeJS multiblocks are registered as gtceu:* as well).
// Era: always (not a progression item, a safety rule).
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.tags('block', function (event) {
    event.add('carryon:block_blacklist', /^gtceu:/)
  })
})()
