// priority: 6690
// Gregtech Grindless - EMI info pages of the MAX+ controllers that had none (P8-H1; the process audit's m_info_missing check). Each
// page is kubejs/assets/emi/recipe/additions/grindless/maxplus_<machine>.json (type emi:info) with these keys: what the machine does
// and what it is for. The recipe lines and tooltips stay in each machine's own *_lang.js. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['emi.grindless.info.condensate_refinery.0',
            'The only machine that handles Kerr condensate, the stationary cloud of field around Sgr A* tapped as a bulk medium (pack fiction on real superradiance physics). It settles the tapped condensate into a stable liquid and binds older exotic matter into it: neutronium, strange matter, kerr strand and degenerate matter.'],
        ['emi.grindless.info.condensate_refinery.1',
            'The boil-off the settling sheds is kept and recompressed into condensate again, so nothing is vented. Its bound materials feed the bound-matter press, the loom and the condensate assembler. It runs only in Sgr A* orbit.'],

        ['emi.grindless.info.bound_matter_press.0',
            'Presses condensate-bound ingots into plates under the shell\'s field: the only source of horizon compressed plates, which the MAX+ tree needs by the ten thousand. It also makes the strange plates, the containment cores and the graded laminate.'],
        ['emi.grindless.info.bound_matter_press.1',
            'Its inputs are the bound ingots of the condensate refinery. The press flash it sheds is fed back into the next bound-neutronium row. It runs only in Sgr A* orbit.'],

        ['emi.grindless.info.hills_slingshot.0',
            'Takes a probe out of the Galaxy without a rocket. It binds an intergalactic relay probe to a canned counterweight in a tight pair, then drops the pair on a plunging orbit past Sgr A*: the tide splits them and the probe leaves at hypervelocity (the Hills mechanism).'],
        ['emi.grindless.info.hills_slingshot.1',
            'It is the only launcher of the launched intergalactic probe. The counterweight falls into the hole. It runs only in Sgr A* orbit.'],

        ['emi.grindless.info.tarantula_stellar_lift.0',
            'Stellar lifting at 30 Doradus: magnetic fields heat a very massive star of the R136 cluster and funnel its outer layers off as raw VMS plasma, CNO-processed matter that no smaller star exposes.'],
        ['emi.grindless.info.tarantula_stellar_lift.1',
            'Each run wears a lift nozzle. The plasma goes to the plasma mass filter and then to the pair-instability crucible; the helium-rich fraction it sheds has its own use further down the line. It runs only at 30 Doradus.'],

        ['emi.grindless.info.pair_instability_crucible.0',
            'Forces the burning of a pair-instability supernova on lifted core plasma in a magnetic pinch, making a nickel-56 slug: its only source. The silicon, sulfur, calcium and argon the burn leaves come out as intermediate-mass ash and are recovered.'],
        ['emi.grindless.info.pair_instability_crucible.1',
            'The slug is the fuel of the Nickel-56 Burner. Each run wears a crucible liner. It runs only at 30 Doradus.'],

        ['emi.grindless.info.nickel_56_burner.0',
            'A generator. A shielded nickel-56 cask decays to cobalt-56 and then to iron-56, and the decay heat drives supercritical CO2 turbines into a MAX 16 A dynamo hatch. The first row leaves a cobalt-56 cask, the second a spent iron-56 cask that goes to the hot cell, which returns the iron.'],
        ['emi.grindless.info.nickel_56_burner.1',
            'The power is generous, not free: every cask costs a stellar lift and a crucible run first. It runs only at 30 Doradus.'],

        ['emi.grindless.info.pristine_gas_works.0',
            'Scoops pristine gas out of the Magellanic Stream: gas with a tenth of solar metallicity, deuterium near its Big Bang abundance and helium-3 never cycled through a star. A magnetic scoop module does the work and wears.'],
        ['emi.grindless.info.pristine_gas_works.1',
            'The pristine deuterium and helium-3 fuel the Primordial Fusion Torus; the protium goes back to home as ordinary hydrogen. It runs only at the Magellanic Stream.'],

        ['emi.grindless.info.primordial_fusion_torus.0',
            'A generator. Deuterium and helium-3 from the pristine gas works fuse, mostly aneutronic, and a direct converter takes the charged products into a MAX 16 A dynamo hatch. The neutral beam injector and the converter wear.'],
        ['emi.grindless.info.primordial_fusion_torus.1',
            'It is a KubeJS generator multiblock, not a GTM fusion tier. Its fuel costs a gas works run, so the power is generous but not free. It runs only at the Magellanic Stream.'],

        ['emi.grindless.info.blueshift_forge.0',
            'Hangs a target in the blueshifted light of the M31 nucleus: near the horizon the bulge\'s light arrives as MeV gamma rays, a photon bath for photonuclear reactions. An enriched molybdenum target comes out as the photonuclear mix of the p-process.'],
        ['emi.grindless.info.blueshift_forge.1',
            'The tether and the window wear. It runs only at the M31 nucleus.'],

        ['emi.grindless.info.void_crystal_fab.0',
            'Grows crystal in the emptiness of the Local Group filament, a 2.7 K sink with no dust: a C12 seed plate becomes void-grown diamond under methane and hydrogen, and a holographic block is written there too.'],
        ['emi.grindless.info.void_crystal_fab.1',
            'The void-grown diamond is the lattice of the femtosecond writer\'s NV crystals. It runs only in the filament.'],

        ['emi.grindless.info.meta_material_loom.0',
            'Weaves the four horizon meta-materials in one machine, from bound plates, kerr strand and condensate: shielding, waveguide, conduit and valve. About 380,000 of each are needed by the Hyperstargate, so it is run with parallels.'],
        ['emi.grindless.info.meta_material_loom.1',
            'The boil-off it sheds goes back to the condensate refinery. It is the only route to these four materials and runs at home.'],

        ['emi.grindless.info.multi_plasma_blender.0',
            'Blends eight plasmas, one from each place the pack has worked (stellar, lifted, filtered, very-massive-star, p-process, jet, hot flow and kerr condensate), into horizon crystal slurry. Only source of the slurry.'],
        ['emi.grindless.info.multi_plasma_blender.1',
            'The slurry feeds the horizon crystal furnace. It runs only in Sgr A* orbit.'],

        ['emi.grindless.info.horizon_crystal_furnace.0',
            'Grows the Hyperstargate\'s core and controller crystals from horizon crystal slurry, kept hot by condensate rather than coils. The pack refuses the two weeks of the real recipe and pays in slurry and parallel runs instead.'],
        ['emi.grindless.info.horizon_crystal_furnace.1',
            'One core crystal takes four million mB of slurry, the most one MAX fluid hatch holds. It runs only in Sgr A* orbit.'],

        ['emi.grindless.info.condensate_assembler.0',
            'A condensate-bath assembler: recipes take dozens of inputs and a great volume of Kerr condensate. Only source of the horizon containment plate, the chevron core, the horizon mesh and the frame parts of the Hyperstargate.'],
        ['emi.grindless.info.condensate_assembler.1',
            'Its boil-off goes back to the condensate refinery. It runs only in Sgr A* orbit.'],

        ['emi.grindless.info.hyper_assembly_array.0',
            'A multiblock for recipes with dozens of distinct inputs, which no single machine can take: it builds every grid craft of the Hyperstargate and its creative items, one row per item, under a condensate bath.'],
        ['emi.grindless.info.hyper_assembly_array.1',
            'It has 81 input buses and runs at home. Use a MAX+ parallel hatch to run several copies at once.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
