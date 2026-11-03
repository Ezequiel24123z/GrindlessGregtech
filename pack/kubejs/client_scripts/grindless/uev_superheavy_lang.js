// priority: 4900
// Gregtech Grindless - names and tooltips of UEV's superheavy line (startup_scripts/grindless/uev/superheavy.js; package UEV-A2):
//
//   block.gtceu.<machine>, gtceu.<type>                           machine and recipe type names (three of each)
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1                the twelve items
//   material.gtceu.<n>                                            the six new gases
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe of the three types
//   gtceu.recipe.grindless_hot_cell.<row>                         the EMI line of the four older hot cell rows
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [id, [en name, en tip 0, en tip 1]]
    var ITEMS = [
        ['target_wheel_blank',
            ['Blank Target Wheel', 'A titanium wheel with foil windows, ready to be loaded with a transcurium target.', 'The hot cell gives it back after a run.']],
        ['activated_target_wheel',
            ['Activated Target Wheel', 'A target wheel out of the cyclotron beam, too radioactive to handle.', 'Store it in the hot cell: it comes back as a blank wheel.']],
        ['sealed_capsule',
            ['Sealed Capsule', 'A lead-lined titanium capsule that holds a few atoms of a superheavy element.', 'Fill it in the superheavy chemistry lab.']],
        ['flerovium_atoms',
            ['Flerovium Atoms', 'A handful of flerovium atoms caught on a membrane.', 'Feeds the superheavy census.']],
        ['livermorium_atoms',
            ['Livermorium Atoms', 'A handful of livermorium atoms caught on a membrane.', 'Feeds the superheavy census.']],
        ['tennessine_atoms',
            ['Tennessine Atoms', 'A handful of tennessine atoms caught on a membrane.', 'Seal them into a capsule in the superheavy chemistry lab.']],
        ['oganesson_atoms',
            ['Oganesson Atoms', 'A handful of oganesson atoms caught on a membrane.', 'Feeds the superheavy census.']],
        ['moscovium_atoms',
            ['Moscovium Atoms', 'A handful of moscovium atoms caught on a membrane.', 'Feeds the superheavy census.']],
        ['cast_polycarbonate_film',
            ['Cast Polycarbonate Film', 'Polycarbonate dissolved in acetone and cast flat.', 'Stretched into track-detector foil, or laminated with lead into a capsule liner.']],
        ['lead_polymer_liner',
            ['Lead-Polymer Liner', 'Lead foil laminated on cast polycarbonate.', 'Fitted in a titanium shell to make a sealed capsule (circuit 23); also lines the OpV Li-6 hydride shield.']],
        ['ca48_plasma_bunch',
            ['Calcium-48 Plasma Bunch', 'Calcium-48 ionised from the oven charge in helium.', 'The platinum filament burns out in the arc. Accelerated into a beam (circuit 20).']],
        ['polycarbonate_foil',
            ['Polycarbonate Foil', 'A thin polycarbonate film, the track detector of the heavy ion cyclotron.', 'Made from polycarbonate dust.']],
        ['ion_tracked_foil',
            ['Ion-Tracked Foil', 'Polycarbonate foil pierced by a xenon beam: every ion left a damaged track.', 'Etch it in sodium hydroxide to open the tracks.']],
        ['etched_membrane',
            ['Etched Membrane', 'A track-etched membrane with pores a few nanometres wide.', 'Used up by the recoil separator.']],
        ['berkelium_oxide_dust',
            ['Berkelium Oxide Dust', 'Berkelium dioxide, the target material of the tennessine wheel.', 'Made from berkelium nitrate.']]
    ]

    var MATERIALS = [
        ['flerovium_recoil_gas', 'Flerovium Recoil Gas'],
        ['livermorium_recoil_gas', 'Livermorium Recoil Gas'],
        ['tennessine_recoil_gas', 'Tennessine Recoil Gas'],
        ['oganesson_recoil_gas', 'Oganesson Recoil Gas'],
        ['moscovium_recoil_gas', 'Moscovium Recoil Gas'],
        ['phosgene', 'Phosgene']
    ]

    var MACHINES = [
        ['heavy_ion_cyclotron', 'Superheavy Factory', 'heavy_ion_irradiation', 'Heavy Ion Irradiation',
            'Dubna\'s U-400 and its gas-filled separator on one beam line: a calcium-48 beam from the ion source is accelerated by the SRF cavity and hits an actinide target; a helium chamber takes the recoil, and dipole magnets bend the recoiling atoms away from the beam onto an etched membrane. Neither the cavity nor the helium is used up.',
            'Heavy Ion Irradiation, circuit 1: flerovium (plutonium-244). 2: livermorium (curium-248). 3: tennessine (target wheel). 4: oganesson (californium-249). 5: moscovium (americium). 6: xenon beam on polycarbonate foil. Recoil Separation, circuits 1-5 as above: one recoil gas and one etched membrane give one atom item; the helium comes back.',
            'It uses energy. Parts go in the bottom layer: 1-4 energy hatches, 1-2 input buses, 1-2 output buses, up to 2 input and 2 output hatches.',
            'Voiding is off: the recoil gases, the helium and the activated wheel must never be thrown away.'],
        ['superheavy_chemistry_lab', 'Superheavy Chemistry Lab', 'superheavy_chemistry', 'Superheavy Chemistry',
            'Gas chromatography on gold and the capsule line: a few atoms at a time are counted, sorted and sealed.',
            'Circuit 1: tennessine atoms in a sealed capsule give a tennessine sample (stored; no recipe uses it). 2: flerovium, livermorium, moscovium and oganesson atoms on gold foil give the superheavy census.',
            'It uses energy. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses.',
            'Voiding is off: the atoms and the samples must never be thrown away.']
    ]

    // [key, en]
    var ENTRIES = []

    // [en tip 0] of each controller: the rest of the old tooltip moved to its EMI info page
    var TIP0 = {
        heavy_ion_cyclotron: ['§7Fires a calcium-48 beam at actinide targets to make superheavy atoms.'],
        superheavy_chemistry_lab: ['§7Counts, sorts and seals a few superheavy atoms at a time.']
    }

    ENTRIES.push(['gtceu.recoil_separation', 'Recoil Separation'])

    MACHINES.forEach(function (m) {
        ENTRIES.push(['block.gtceu.' + m[0], m[1]])
        ENTRIES.push(['gtceu.' + m[2], m[3]])
        ENTRIES.push(['grindless.machine.' + m[0] + '.tooltip.0', TIP0[m[0]][0]])
        ENTRIES.push(['emi.grindless.info.' + m[0] + '.2', m[4]])
        ENTRIES.push(['emi.grindless.info.' + m[0] + '.3', m[5]])
        ENTRIES.push(['emi.grindless.info.' + m[0] + '.4', m[6]])
        ENTRIES.push(['grindless.machine.' + m[0] + '.no_voiding', m[7]])
    })

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1][0]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[1][1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[1][2]])
    })
    MATERIALS.forEach(function (m) {
        ENTRIES.push(['material.gtceu.' + m[0], m[1]])
    })

    // [type, recipe, en]
    var RECIPES = [
        ['heavy_ion_irradiation', 'flerovium', 'Circuit 1: plutonium-244 target hit by calcium-48; flerovium recoil gas. The cavity and the helium are not used up'],
        ['heavy_ion_irradiation', 'livermorium', 'Circuit 2: curium-248 hit by calcium-48; livermorium recoil gas'],
        ['heavy_ion_irradiation', 'tennessine', 'Circuit 3: a berkelium target wheel hit by calcium-48; tennessine recoil gas, and the wheel comes out activated (to the hot cell)'],
        ['heavy_ion_irradiation', 'oganesson', 'Circuit 4: californium-249 hit by calcium-48; oganesson recoil gas'],
        ['heavy_ion_irradiation', 'moscovium', 'Circuit 5: americium hit by calcium-48; moscovium recoil gas'],
        ['heavy_ion_irradiation', 'ion_track', 'Circuit 6: a xenon beam through polycarbonate foil; the xenon is recovered (900 of 1,000 mB)'],
        ['recoil_separation', 'flerovium', 'Circuit 1: flerovium recoil gas through an etched membrane; the helium comes back'],
        ['recoil_separation', 'livermorium', 'Circuit 2: livermorium recoil gas through an etched membrane; the helium comes back'],
        ['recoil_separation', 'tennessine', 'Circuit 3: tennessine recoil gas through an etched membrane; the helium comes back'],
        ['recoil_separation', 'oganesson', 'Circuit 4: oganesson recoil gas through an etched membrane; the helium comes back'],
        ['recoil_separation', 'moscovium', 'Circuit 5: moscovium recoil gas through an etched membrane; the helium comes back'],
        ['superheavy_chemistry', 'tennessine_sample', 'Circuit 1: tennessine atoms sealed in a capsule; the sample is only stored, nothing uses it up'],
        ['superheavy_chemistry', 'superheavy_census', 'Circuit 2: flerovium, livermorium, moscovium and oganesson atoms counted on gold foil']
    ]
    RECIPES.forEach(function (r) {
        ENTRIES.push(['gtceu.recipe.grindless_' + r[0] + '.' + r[1], r[2]])
    })

    var HOT_CELL = [
        ['californium_252_store', 'Circuit 8: californium-252 decays to curium-248 in storage (2.6 years)'],
        ['berkelium_249_store', 'Circuit 9: berkelium-249 decays to californium-249 in storage (330 days)'],
        ['tritium_store', 'Circuit 10: tritium decays to helium-3 in storage (12 years)'],
        ['target_wheel_return', 'Circuit 11: an activated target wheel cools down and comes back as a blank wheel']
    ]
    HOT_CELL.forEach(function (r) {
        ENTRIES.push(['gtceu.recipe.grindless_hot_cell.' + r[0], r[1]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
