// Gregtech Grindless - names, tooltips and messages of the Hologram Projector (grindless:hologram_projector) and the tooltip
// line of GTM's Terminal, which works like the projector in this pack (server_scripts/grindless/steam/hologram_projector.js).
// Minecraft merges lang entries from every script, so ClientEvents.lang works wherever it is declared (as steam_content_lang.js).
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('item.grindless.hologram_projector', 'Hologram Projector')
    add('tooltip.grindless.hologram_projector.0', 'Right-click a multiblock controller: shows a hologram of the structure for 30 s. Click again to hide it.')
    add('tooltip.grindless.hologram_projector.1', 'Sneak + right-click: builds the structure from your inventory. It only places the default blocks (casings, coils, glass, frames, pipes...): never hatches, buses or other parts, and it never breaks a block.')
    add('tooltip.grindless.hologram_projector.2', 'In creative it places everything without using items.')
    add('tooltip.grindless.terminal_projector', 'In this pack it works like the Hologram Projector: it never places hatches.')

    add('message.grindless.projector.hologram_on', 'Hologram of %s for %s s. Click again to hide it.')
    add('message.grindless.projector.hologram_off', 'Hologram hidden.')
    add('message.grindless.projector.no_hologram', '%s has no hologram.')
    add('message.grindless.projector.formed', '%s is already formed.')
    add('message.grindless.projector.unreadable', "The projector can't read %s.")
    add('message.grindless.projector.header', 'Hologram Projector: %s')
    add('message.grindless.projector.placed', 'Placed: %2$s')
    add('message.grindless.projector.missing', 'Missing: %2$s')
    add('message.grindless.projector.parts', 'Parts go here (%s): %s')
    add('message.grindless.projector.needs', 'To form, it also needs: %s')
    add('message.grindless.projector.blocked', 'Left as they are (%s): %s')
    add('message.grindless.projector.complete', 'Every default block is in place.')
    add('message.grindless.projector.summary', 'Placed: %s · missing: %s · part cells: %s · left as they are: %s')
    add('message.grindless.projector.count', '%s × %s')
    add('message.grindless.projector.or_similar', '%s or similar')
    add('message.grindless.projector.at', '%s at %s')
    add('message.grindless.projector.more', 'and %s more')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('item.grindless.hologram_projector', 'Proyector de hologramas')
    add('tooltip.grindless.hologram_projector.0', 'Clic derecho en el controlador de un multibloque: muestra un holograma de la estructura durante 30 s. Otro clic lo oculta.')
    add('tooltip.grindless.hologram_projector.1', 'Agachado + clic derecho: construye la estructura con los bloques de tu inventario. Solo pone los bloques base (carcasas, bobinas, vidrio, marcos, tuberías...): nunca escotillas, buses ni otras piezas, y nunca rompe un bloque.')
    add('tooltip.grindless.hologram_projector.2', 'En creativo lo pone todo sin gastar objetos.')
    add('tooltip.grindless.terminal_projector', 'En este pack funciona como el proyector de hologramas: nunca pone escotillas.')

    add('message.grindless.projector.hologram_on', 'Holograma de %s durante %s s. Otro clic lo oculta.')
    add('message.grindless.projector.hologram_off', 'Holograma oculto.')
    add('message.grindless.projector.no_hologram', '%s no tiene holograma.')
    add('message.grindless.projector.formed', '%s ya está formado.')
    add('message.grindless.projector.unreadable', 'El proyector no puede leer %s.')
    add('message.grindless.projector.header', 'Proyector de hologramas: %s')
    add('message.grindless.projector.placed', 'Colocado: %2$s')
    add('message.grindless.projector.missing', 'Falta: %2$s')
    add('message.grindless.projector.parts', 'Aquí van piezas (%s): %s')
    add('message.grindless.projector.needs', 'Para formarse también necesita: %s')
    add('message.grindless.projector.blocked', 'Se dejan como están (%s): %s')
    add('message.grindless.projector.complete', 'Todos los bloques base están en su sitio.')
    add('message.grindless.projector.summary', 'Colocados: %s · faltan: %s · huecos para piezas: %s · sin tocar: %s')
    add('message.grindless.projector.count', '%s × %s')
    add('message.grindless.projector.or_similar', '%s o similar')
    add('message.grindless.projector.at', '%s en %s')
    add('message.grindless.projector.more', 'y %s más')
})

// GTM's Terminal: a line that says what it does here
ItemEvents.tooltip(event => {
    event.add('gtceu:terminal', Text.translate('tooltip.grindless.terminal_projector').gray())
})
