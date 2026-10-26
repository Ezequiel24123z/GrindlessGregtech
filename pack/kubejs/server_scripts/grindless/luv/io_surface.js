// LuV B6, Io's surface (docs/eras/luv.md, sections 14 and 15). Io's dimension comes only from G.places; every number is marked
// (tune) in the design. Basalt is GTM's rock breaker product (gtceu:rock_breaker/basalt), so sulfur concrete never needs hand-dug rock;
// Biomes O' Plenty's black sand from Io's own ground is the other Ionian rock.
(function () {
  var G = global.grindless
  var IO = G.ioSurface
  var R = IO.recipes = {
    collect: { circuit: 1, eut: 7680, duration: 400, so2: 4000, sulfur: 8, sublimate: 1, onIo: true },
    separate: { circuit: 2, eut: 7680, duration: 200, sublimate: 4, hydrogen: 2000, hcl: 1000, germanium: 2, indium: 1, water: 1000 },
    concrete: { circuit: 3, eut: 1920, duration: 200, sulfur: 8, rock: 8, casings: 8, onIo: true,
      rocks: { basalt: 'minecraft:basalt', black_sand: 'biomesoplenty:black_sand' } },
    intake: { circuit: 1, eut: 32768, duration: 400, so2: 4000, onIo: true,
      // one bundle about every hour per module: 3,600 s / 20 s = 180 runs, 10,000 / 180 = 56
      bundle: 'grindless:heat_exchanger_bundle', wearChance: 56 }
  }
  // Germanium only from Io (luv.md "Only from there"): GTCA's Nether germanite is drilled since LV, and GTM's generated electrolysis of
  // its dust (power-quests-1 dump: 9 germanite -> 2 zinc + 2 iron + 1 germanium + 4 sulfur, 60 EU/t x 414 t) was the only other source
  // before ZPM. Nothing before LuV asks for germanium (the dump's only other user is UV's quantum alloy), so the electrolysis keeps its
  // input, its other outputs and its energy, and its germanium stays bound in the slag.
  IO.germanite = {
    removed: 'gtceu:electrolyzer/decomposition_electrolyzing_germanite',
    input: '9x #forge:dusts/germanite',
    outputs: ['2x gtceu:zinc_dust', '2x gtceu:iron_dust', '4x gtceu:sulfur_dust'],
    eut: 60,
    duration: 414
  }

  ServerEvents.recipes(function (event) {
    var gt = event.recipes.gtceu
    var ge = IO.germanite
    event.remove({ id: ge.removed })
    gt.electrolyzer('grindless:germanite')
      .itemInputs(ge.input).itemOutputs(ge.outputs).EUt(ge.eut).duration(ge.duration)
    var c = R.collect
    G.places.allow(gt[IO.condenser.type]('grindless:collect')
      .circuit(c.circuit)
      .outputFluids(Fluid.of('gtceu:sulfur_dioxide', c.so2))
      .itemOutputs(c.sulfur + 'x gtceu:sulfur_dust', c.sublimate + 'x grindless:ionian_sublimate')
      .EUt(c.eut).duration(c.duration), IO.place)

    var s = R.separate
    gt[IO.condenser.type]('grindless:separate')
      .circuit(s.circuit)
      .itemInputs(s.sublimate + 'x grindless:ionian_sublimate')
      .inputFluids(Fluid.of('gtceu:hydrogen', s.hydrogen))
      .notConsumableFluid(Fluid.of('gtceu:hydrochloric_acid', s.hcl))
      .itemOutputs(s.germanium + 'x gtceu:germanium_dust', s.indium + 'x gtceu:indium_dust')
      .outputFluids(Fluid.of('minecraft:water', s.water))
      .EUt(s.eut).duration(s.duration)

    var k = R.concrete
    Object.keys(k.rocks).forEach(function (name) {
      G.places.allow(gt[IO.condenser.type]('grindless:sulfur_concrete_' + name)
        .circuit(k.circuit)
        .itemInputs(k.sulfur + 'x gtceu:sulfur_dust', k.rock + 'x ' + k.rocks[name])
        .itemOutputs(k.casings + 'x ' + IO.blocks.concrete)
        .EUt(k.eut).duration(k.duration), IO.place)
    })

    var t = R.intake
    G.places.allow(gt[IO.intake.type]('grindless:patera')
      .circuit(t.circuit)
      .notConsumableFluid(Fluid.of('gtceu:sulfur_dioxide', t.so2))
      .chancedInput(t.bundle, t.wearChance, 0)
      .EUt(-t.eut).duration(t.duration), IO.place)

    gt.assembler('grindless:luv/radiation_vault_casing')
      .itemInputs('2x gtceu:dense_titanium_plate', '2x gtceu:tantalum_plate', 'gtceu:hsss_frame')
      .itemOutputs('2x ' + IO.blocks.vault).EUt(7680).duration(100)
    gt.assembler('grindless:luv/heat_exchanger_bundle')
      .itemInputs(IO.blocks.concrete, '4x gtceu:tungsten_steel_small_fluid_pipe')
      .itemOutputs(t.bundle).EUt(7680).duration(200)

    gt.shaped(IO.condenser.machine, ['CPC', ' H ', 'CPC'], {
      C: '#gtceu:circuits/luv', P: 'gtceu:luv_electric_pump', H: 'gtceu:luv_machine_hull'
    }).id('grindless:crafting/fumarole_condenser')
    gt.shaped(IO.intake.machine, ['CMC', 'PHP', 'C C'], {
      C: '#gtceu:circuits/luv', M: 'gtceu:luv_electric_motor', P: 'gtceu:luv_electric_pump', H: 'gtceu:luv_machine_hull'
    }).id('grindless:crafting/volcanic_intake')
  })
})()
