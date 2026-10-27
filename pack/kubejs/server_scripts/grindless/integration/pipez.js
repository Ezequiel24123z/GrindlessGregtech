// priority: -15624
// -----------------------------------------------------------------------------------------------
// Pipez (pipez): the energy pipe and the universal pipe (which also carries energy) move Forge Energy (FE).
// Power in this pack is EU over GregTech cables (voltage tiers, amperage, loss). An FE pipe is a cable that skips all of
// that, so both recipes are removed; item and fluid pipes stay (GT pipes + covers stay the progression path, Pipez is the
// configurable alternative with filters and priorities). Era: never for the FE pipes.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    event.remove({ id: 'pipez:energy_pipe' })
    event.remove({ id: 'pipez:universal_pipe' })
  })
})()
