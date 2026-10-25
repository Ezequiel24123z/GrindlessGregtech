// Gregtech Grindless - Traveler's Titles (travelerstitles): the title shown when the player enters a dimension, in English, named as the
// journey of docs/journey.md names them (the Overworld is Earth, where the journey starts). Keys: travelerstitles.<namespace>.<path>
// (optional .color = RGB hex). The Nether and the End keep the mod's own titles. es_es only renames: missing keys (the colours) fall back to en_us.
ClientEvents.lang('en_us', event => {
    event.add('travelerstitles', 'travelerstitles.minecraft.overworld', 'Earth')
    event.add('travelerstitles', 'travelerstitles.grindless.void', 'The Void')
    event.add('travelerstitles', 'travelerstitles.grindless.flat', 'The Flat')
    event.add('travelerstitles', 'travelerstitles.gcyr.luna', 'The Moon')
    event.add('travelerstitles', 'travelerstitles.gcyr.luna.color', 'd8d8d8')
    event.add('travelerstitles', 'travelerstitles.gcyr.mars', 'Mars')
    event.add('travelerstitles', 'travelerstitles.gcyr.mars.color', 'c1440e')
    event.add('travelerstitles', 'travelerstitles.gcyr.venus', 'Venus')
    event.add('travelerstitles', 'travelerstitles.gcyr.venus.color', 'e8c26a')
    event.add('travelerstitles', 'travelerstitles.gcyr.mercury', 'Mercury')
    event.add('travelerstitles', 'travelerstitles.gcyr.mercury.color', 'a0a0a8')
})

ClientEvents.lang('es_es', event => {
    event.add('travelerstitles', 'travelerstitles.minecraft.overworld', 'La Tierra')
    event.add('travelerstitles', 'travelerstitles.grindless.void', 'El Vacío')
    event.add('travelerstitles', 'travelerstitles.grindless.flat', 'El Llano')
    event.add('travelerstitles', 'travelerstitles.gcyr.luna', 'La Luna')
    event.add('travelerstitles', 'travelerstitles.gcyr.mars', 'Marte')
    event.add('travelerstitles', 'travelerstitles.gcyr.venus', 'Venus')
    event.add('travelerstitles', 'travelerstitles.gcyr.mercury', 'Mercurio')
})