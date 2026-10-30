// priority: 7400
// LuV B6 names: the fumarole condenser and the volcanic intake (startup_scripts/grindless/luv/io_surface.js).
ClientEvents.lang('en_us', function (event) {
  function add(k, v) { event.add('grindless', k, v) }
  add('block.gtceu.fumarole_condenser', 'Fumarole Condenser')
  add('block.gtceu.volcanic_intake', 'Volcanic Intake')
  add('gtceu.fumarole_condensing', 'Fumarole Condensing')
  add('gtceu.volcanic_heat', 'Volcanic Heat')
  add('grindless.machine.fumarole_condenser.tooltip.0', '§7Condenses Io\'s volcanic gases into germanium and indium.')
  add('grindless.machine.fumarole_condenser.no_voiding', 'The condenser keeps what it makes: switch voiding off')
  add('grindless.machine.fumarole_condenser.off_io', 'Off Io: only the separation (circuit 2) runs here')
  add('grindless.machine.volcanic_intake.tooltip.0', '§7Generates power from Io\'s volcanic heat.')
  add('grindless.machine.volcanic_intake.off_io', 'No volcanic heat here: the intake only works on Io')
})
ClientEvents.lang('es_es', function (event) {
  function add(k, v) { event.add('grindless', k, v) }
  add('block.gtceu.fumarole_condenser', 'Condensador de fumarolas')
  add('block.gtceu.volcanic_intake', 'Toma volcánica')
  add('gtceu.fumarole_condensing', 'Condensación de fumarolas')
  add('gtceu.volcanic_heat', 'Calor volcánico')
  add('grindless.machine.fumarole_condenser.tooltip.0', '§7Condensa los gases volcánicos de Ío en germanio e indio.')
  add('grindless.machine.fumarole_condenser.no_voiding', 'El condensador guarda lo que produce: desactiva el vaciado')
  add('grindless.machine.fumarole_condenser.off_io', 'Fuera de Ío: aquí solo funciona la separación (circuito 2)')
  add('grindless.machine.volcanic_intake.tooltip.0', '§7Genera energía con el calor volcánico de Ío.')
  add('grindless.machine.volcanic_intake.off_io', 'Aquí no hay calor volcánico: la toma solo funciona en Ío')
})
