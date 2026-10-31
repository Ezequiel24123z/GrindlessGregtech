// priority: -6730
// -----------------------------------------------------------------------------------------------
// OpV circuits (package OpV-A2, docs/eras/opv.md "A2. Circuits", process lines 11-18): the intermediates of the cryo-CMOS, Nb TSV, cryogenic
// optical link, InP HEMT, GaN MMIC and SDD lines and two fluids. No machine of our own and no recipe type: every step runs on an older machine
// (rows marked OpV-A2 in their own files) or on GTM's cutter, assembler and closed-loop cooler (server_scripts/grindless/opv/circuits.js).
// The ids are published in global.grindless.opvCircuits.
//
//   The finished parts (cryo_cmos_die, nb_tsv_interposer, cryo_optical_link, hemt_amplifier, gated_2deg_wafer, gan_mmic, sdd_die) are
//     F1's (startup_scripts/grindless/opv/foundation.js): read, never created here.
//   Fluids: GTM gives a material created by KubeJS the gtceu: fluid namespace, so both keep it (gtceu:si28_trichlorosilane,
//     gtceu:gan_mocvd_exhaust).
//
// Textures: tools/assets/Build-OpVCircuitsTextures.ps1. Names: client_scripts/grindless/opv_circuits_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const OPVC = G.opvCircuits || (G.opvCircuits = {})

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    // line 11: Si-28 polysilicon
    si28_poly_rod: { stack: 64 },
    // line 12: Fe-doped InP and the gated 2DEG
    si_inp_boule: { stack: 16 },
    si_inp_wafer: { stack: 64 },
    inp_scrap: { stack: 64 },
    inas_qw_wafer: { stack: 64 },
    hbn_capped_2deg_wafer: { stack: 64 },
    // line 13: cryo-CMOS
    gate_stack_soi_wafer: { stack: 64 },
    cryo_cmos_litho_wafer: { stack: 64 },
    cryo_cmos_implanted_wafer: { stack: 64 },
    cryo_cmos_metal_wafer: { stack: 64 },
    untested_cryo_cmos_die: { stack: 64 },
    gold_overspray: { stack: 64 },
    // line 14: the Nb TSV interposer and the NbTiN film
    rrr_nb_target: { stack: 16 },
    tsv_via_wafer: { stack: 64 },
    nb_filled_tsv_wafer: { stack: 64 },
    bonded_tsv_interposer: { stack: 64 },
    nbtin_film_wafer: { stack: 64 },
    // line 15: the cryogenic optical link
    ln_on_soi_wafer: { stack: 64 },
    ln_soi_waveguide_wafer: { stack: 64 },
    snspd_link_wafer: { stack: 64 },
    // line 16: the InP HEMT amplifier
    inp_hemt_epi_wafer: { stack: 64 },
    hemt_gated_wafer: { stack: 64 },
    isolated_hemt_wafer: { stack: 64 },
    // line 17: GaN on semi-insulating SiC
    hpsi_sic_wafer: { stack: 64 },
    gan_sic_epi_wafer: { stack: 64 },
    gan_gated_wafer: { stack: 64 },
    // line 18: the silicon drift detector
    sdd_ring_wafer: { stack: 64 },
    sdd_anode_wafer: { stack: 64 }
  }

  // material key -> form, colour and formula
  const MATERIALS = {
    'gtceu:si28_trichlorosilane': { form: 'liquid', colour: 0xC8D8C0, formula: '\u00B2\u2078SiHCl\u2083' },
    'gtceu:gan_mocvd_exhaust': { form: 'gas', colour: 0xB8C0A8, formula: '(CH\u2084)(NH\u2083)Ga' }
  }

  OPVC.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  OPVC.materials = Object.keys(MATERIALS)
  OPVC.fluids = Object.keys(MATERIALS)
  // F1's parts these lines finish: read, never created here
  OPVC.existing = ['grindless:gated_2deg_wafer', 'grindless:cryo_cmos_die', 'grindless:nb_tsv_interposer', 'grindless:cryo_optical_link',
    'grindless:hemt_amplifier', 'grindless:gan_mmic', 'grindless:sdd_die', 'grindless:inas_al_wafer', 'grindless:si28_soi_wafer']
  OPVC.mainframe = 'gtnn:cosmic_mainframe'

  OPVC.ids = {}
  function camel(name) { return name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() }) }
  Object.keys(ITEMS).forEach(function (name) { OPVC.ids[camel(name)] = 'grindless:' + name })
  Object.keys(MATERIALS).forEach(function (key) { OPVC.ids[camel(key.slice(key.indexOf(':') + 1))] = key })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MATERIALS).forEach(function (key) {
      var spec = MATERIALS[key]
      var material = event.create(key)
      if (spec.form === 'gas') material.gas()
      else material.liquid()
      material.color(spec.colour).formula(spec.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
