// priority: -18424
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
      .itemInputs('2x gtceu:dense_titanium_plate', '2x gtceu:tantalum_plate', 'gtceu:hsss_frame', '1x grindless:zircaloy_cladding_tube')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 144), Fluid.of('gtceu:lubricant', 250))
      .itemOutputs('2x ' + IO.blocks.vault).EUt(7680).duration(100)
    gt.assembly_line('grindless:luv/heat_exchanger_bundle')
      .itemInputs(IO.blocks.concrete, '4x gtceu:tungsten_steel_small_fluid_pipe', '2x grindless:platinum_gauze',
        '2x grindless:zircaloy_cladding_tube')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 144), Fluid.of('gtceu:lubricant', 250))
      .itemOutputs(t.bundle).EUt(7680).duration(200)

    gt.assembly_line('grindless:fumarole_condenser')
      .itemInputs('gtceu:luv_machine_hull', '2x gtceu:luv_electric_pump', '4x #gtceu:circuits/luv', '4x grindless:zircaloy_cladding_tube',
        '2x grindless:platinum_gauze')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 576), Fluid.of('gtceu:lubricant', 500))
      .itemOutputs(IO.condenser.machine).EUt(30720).duration(600)
    // Crafted before landing on Io, so no sulfur concrete: the bundles it wears are fed in on Io (R.intake).
    gt.assembly_line('grindless:volcanic_intake')
      .itemInputs('gtceu:luv_machine_hull', 'gtceu:luv_electric_motor', '2x gtceu:luv_electric_pump', '4x #gtceu:circuits/luv',
        '2x grindless:platinum_gauze', '2x grindless:zircaloy_cladding_tube')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 576), Fluid.of('gtceu:lubricant', 500))
      .itemOutputs(IO.intake.machine).EUt(30720).duration(600)  })
})()
