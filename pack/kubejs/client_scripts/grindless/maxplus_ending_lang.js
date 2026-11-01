// priority: 7008
// XP-Z1b: the ending's title, subtitle and the epilogue book's pages (docs/eras/maxplus.md "The ending"; the pages joined with a space are that text).
;(function () {
  var PAGES = [
    'The gate held. On the far side of a horizon that should have had no far side, there was ground, and on the ground a city.',
    'It was older than anything you had built, and it had been built by someone who had done what you did:',
    'the drills, the furnaces, the long lines of machines, the stars harvested one by one, the last hole in the middle of everything held still for one moment of crossing.',
    'Whoever they were, they had arrived, and stayed, and gone quiet. Their towers still stand. Nothing here needs you. Nothing here can be made.',
    'You brought one thing across: an archive of every living line you ever grew, sealed in silica, waiting.',
    'What you do now is not written in any recipe. Look up. That is the way you came.'
  ]

  ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    add('grindless.ending.title', 'Beyond the Horizon')
    add('grindless.ending.subtitle', 'The gate held.')
    add('grindless.ending.book.title', 'Epilogue')
    add('grindless.ending.book.author', 'The road to the end')
    PAGES.forEach(function (text, i) { add('grindless.ending.book.page.' + (i + 1), text) })
  })
})()
