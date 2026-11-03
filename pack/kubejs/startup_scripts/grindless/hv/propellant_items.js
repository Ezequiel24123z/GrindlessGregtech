// Gregtech Grindless - D1-HV-PROP: the HV propellant fluid (docs/eras/lines-steam-hv.md, line H2).
//
//   gtceu:aerozine_50   hydrazine + unsymmetrical dimethylhydrazine, 1:1. The mixer in server_scripts/grindless/hv/propellants.js makes it,
//                       and it is the only fuel gtceu:rocket_fuel is mixed from (with dinitrogen tetroxide).
//
// A GT material with only a liquid form: its fluid is gtceu:aerozine_50 and its bucket gtceu:aerozine_50_bucket. Names: client_scripts/grindless/hv_propellants_lang.js.
(function () {
  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create('aerozine_50')
      .liquid()
      .color(0xD8C36A)
      .formula('N2H4(C2H8N2)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })
})()
