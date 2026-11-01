// priority: 6827
// Gregtech Grindless - names, tooltips and EMI lines of MAX+'s three 30 Doradus machines (startup_scripts/grindless/maxplus/tarantula.js; package XP-B1):
//
//   gtceu.<type>, block.gtceu.<machine>, grindless.machine.<machine>.tooltip.0   the recipe types and the controllers
//   gtceu.recipe.<data key>.<recipe>                                             the EMI line of each keyed row (the machines' own rows and the
//                                                                                older P6, P7, P17, P20 and P21 steps on machines whose type has a key)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.tarantula_stellar_lift', 'Tarantula Stellar Lift', 'Elevador estelar de la T\u00e1rantula'],
        ['block.gtceu.tarantula_stellar_lift', 'Tarantula Stellar Lift', 'Elevador estelar de la T\u00e1rantula'],
        ['grindless.machine.tarantula_stellar_lift.tooltip.0', '\u00a77Lifts raw VMS plasma off an R136 star at 30 Doradus. Wears a lift nozzle.', '\u00a77Eleva plasma VMS crudo de una estrella R136 en 30 Doradus. Desgasta una tobera de elevaci\u00f3n.'],
        ['gtceu.pair_instability_crucible', 'Pair-Instability Crucible', 'Crisol de inestabilidad de pares'],
        ['block.gtceu.pair_instability_crucible', 'Pair-Instability Crucible', 'Crisol de inestabilidad de pares'],
        ['grindless.machine.pair_instability_crucible.tooltip.0', '\u00a77Burns confined VMS plasma into a nickel-56 slug and ime ash. Wears a crucible liner.', '\u00a77Quema plasma VMS confinado en un lingote de n\u00edquel-56 y ceniza de ime. Desgasta un revestimiento de crisol.'],
        ['gtceu.nickel_56_burner', 'Nickel-56 Burner', 'Quemador de n\u00edquel-56'],
        ['block.gtceu.nickel_56_burner', 'Nickel-56 Burner', 'Quemador de n\u00edquel-56'],
        ['grindless.machine.nickel_56_burner.tooltip.0', '\u00a77A generator: the decay chain of a shielded nickel-56 cask feeds a MAX 16 A dynamo hatch.', '\u00a77Un generador: la cadena de desintegraci\u00f3n de un bid\u00f3n blindado de n\u00edquel-56 alimenta un hatch din\u00e1mo MAX de 16 A.'],

        ['gtceu.recipe.grindless_tarantula_stellar_lift.raw_vms_plasma', 'Circuit 1: raw VMS plasma lifted off an R136 star at 2^35 EU/t; wears a lift nozzle 1 in 32 (line P6).', 'Circuito 1: plasma VMS crudo elevado de una estrella R136 a 2^35 EU/t; desgasta una tobera 1 de cada 32 (l\u00ednea P6).'],
        ['gtceu.recipe.grindless_pair_instability_crucible.ni56_slug', 'Circuit 1: confined VMS plasma burned into a nickel-56 slug and ime ash at 2^35 EU/t; wears a crucible liner 1 in 16 (line P7).', 'Circuito 1: plasma VMS confinado quemado en un lingote de n\u00edquel-56 y ceniza de ime a 2^35 EU/t; desgasta un revestimiento 1 de cada 16 (l\u00ednea P7).'],
        ['gtceu.recipe.grindless_nickel_56_burner.co56_cask', 'Circuit 1: a shielded nickel-56 cask decays to cobalt-56 and makes 2^34 EU/t (line P7).', 'Circuito 1: un bid\u00f3n blindado de n\u00edquel-56 decae a cobalto-56 y produce 2^34 EU/t (l\u00ednea P7).'],
        ['gtceu.recipe.grindless_nickel_56_burner.spent_fe56_cask', 'Circuit 2: the cobalt-56 cask decays to iron-56 and makes 2^33 EU/t (line P7).', 'Circuito 2: el bid\u00f3n de cobalto-56 decae a hierro-56 y produce 2^33 EU/t (l\u00ednea P7).'],

        ['gtceu.recipe.grindless_plasma_mass_filtering.vms_core_plasma', 'Circuit 6: raw VMS plasma filtered to its core fraction at 30 Doradus (line P6).', 'Circuito 6: plasma VMS crudo filtrado a su fracci\u00f3n n\u00facleo en 30 Doradus (l\u00ednea P6).'],
        ['gtceu.recipe.grindless_frc_forming.confined_vms_plasma', 'Circuit 4: core VMS plasma confined in a field-reversed configuration at 30 Doradus (line P6).', 'Circuito 4: plasma VMS n\u00facleo confinado en configuraci\u00f3n de campo invertido en 30 Doradus (l\u00ednea P6).'],
        ['gtceu.recipe.grindless_hot_cell.shielded_ni56_cask', 'Circuit 24: a canned nickel-56 slug sealed into a lead and boron carbide cask (line P7).', 'Circuito 24: un lingote enlatado de n\u00edquel-56 sellado en un bid\u00f3n de plomo y carburo de boro (l\u00ednea P7).'],
        ['gtceu.recipe.grindless_hot_cell.spent_fe56_cask_iron', 'Circuit 26: a spent iron-56 cask opened for its iron and lead (line P7).', 'Circuito 26: un bid\u00f3n gastado de hierro-56 abierto para recuperar hierro y plomo (l\u00ednea P7).'],
        ['gtceu.recipe.grindless_single_crystal_casting.sx_turbine_blade', 'Circuit 4: a single-crystal turbine blade cast from nickel superalloy plates under argon (line P17).', 'Circuito 4: un \u00e1labe de turbina monocristalino fundido de placas de superaleaci\u00f3n bajo arg\u00f3n (l\u00ednea P17).'],
        ['gtceu.recipe.grindless_electron_beam.tbc_coated_blade', 'A single-crystal blade given its thermal barrier coat under argon (line P17).', 'Un \u00e1labe monocristalino con su barrera t\u00e9rmica aplicada bajo arg\u00f3n (l\u00ednea P17).'],
        ['gtceu.recipe.grindless_electron_beam.sealed_liner', 'An infiltrated liner sealed with a tungsten skin under argon (line P21).', 'Un revestimiento infiltrado sellado con piel de wolframio bajo arg\u00f3n (l\u00ednea P21).'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_nozzle_former', 'Circuit 17: a silicon carbide nozzle former grown on tungsten steel (line P20).', 'Circuito 17: una horma de tobera de carburo de silicio crecida sobre acero de wolframio (l\u00ednea P20).'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.infiltrated_liner', 'Circuit 18: a bound degenerate billet infiltrated into a crucible liner blank (line P21).', 'Circuito 18: un tocho degenerado ligado infiltrado en un esbozo de revestimiento de crisol (l\u00ednea P21).'],
        ['gtceu.recipe.grindless_coated_conductor.nozzle_tape', 'Circuit 11: a nozzle former coated into superconducting tape (line P20).', 'Circuito 11: una horma de tobera recubierta como cinta superconductora (l\u00ednea P20).'],
        ['gtceu.recipe.grindless_magnet_winding.nozzle_winding', 'Circuit 17: nozzle tape wound with coils into a nozzle winding (line P20).', 'Circuito 17: cinta de tobera bobinada con bobinas en un devanado de tobera (l\u00ednea P20).'],
        ['gtceu.recipe.grindless_megabar.densified_liner', 'Circuit 15: a sealed liner pressed to megabar density with graded Z billets (line P21).', 'Circuito 15: un revestimiento sellado prensado a densidad de megabar con tochos de Z graduado (l\u00ednea P21).']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
