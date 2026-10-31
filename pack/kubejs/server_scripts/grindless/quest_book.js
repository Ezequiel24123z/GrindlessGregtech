// priority: -21899
// Gregtech Grindless - quest book bootstrap.
//
// Two independent things live here:
//  - Every player gets an FTB Quests book the first time they log in, tracked per-player via
//    persistent data so it only ever happens once (losing/dropping the book afterwards does not
//    re-trigger it - that is what the recovery recipe below is for).
//  - A cheap, shapeless recovery recipe for `ftbquests:book` itself: paper for the pages, any
//    plank for the cover. No mob drops, no tools, just in case the book ends up in lava.
//    (FTB Quests keeps all progress on the server/team side, never in the book's own NBT, so
//    crafting a fresh copy never resets anything.)
//
// NOTE ON `var`: PlayerEvents.loggedIn and ServerEvents.recipes can both run more than once in a
// single server session (every login; a /kubejs reload). KubeJS's Rhino fork throws on a second
// `const`/`let` declaration inside a function body that gets invoked again, so every local below
// is declared with `var` on purpose (see server_scripts/grindless/dimensions.js for the same rule).

const FIRST_LOGIN_PD_KEY = 'grindless_got_quest_book'

PlayerEvents.loggedIn(function (event) {
    var player = event.player
    var data = player.persistentData
    if (data.getBoolean(FIRST_LOGIN_PD_KEY)) return

    data.putBoolean(FIRST_LOGIN_PD_KEY, true)
    player.give('ftbquests:book')
})

ServerEvents.recipes(function (event) {
    event.shapeless('ftbquests:book', ['minecraft:paper', '#minecraft:planks'])
        .id('grindless:quest_book_recovery')
})
