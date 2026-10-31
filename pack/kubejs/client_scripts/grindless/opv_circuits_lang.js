// Gregtech Grindless - names and tooltips of the OpV circuit lines (startup_scripts/grindless/opv/circuits.js, package OpV-A2):
//
//   grindless:<item>          item.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (fluid)  material.gtceu.<n>
//   recipe rows               gtceu.recipe.<dataKey>.<name> (the EMI line of each row on an older machine with a data key)
//
// The finished parts (cryo_cmos_die, nb_tsv_interposer, cryo_optical_link, hemt_amplifier, gated_2deg_wafer, gan_mmic, sdd_die) are named by
// client_scripts/grindless/opv_foundation_lang.js. Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts.
// Names go in en_us and es_es.
(function () {
    // id, en name, es name, en tip 0, es tip 0, en tip 1, es tip 1
    var ITEMS = [
        ['si28_poly_rod', 'Si-28 Polysilicon Rod', 'Varilla de polisilicio Si-28', 'Isotopically pure silicon grown from Si-28 trichlorosilane in the MOCVD reactor.', 'Silicio isotópicamente puro crecido a partir de triclorosilano Si-28 en el reactor MOCVD.', 'Zone-refined into a Si-28 float-zone ingot.', 'Se refina por zonas en un lingote de zona flotante Si-28.'],
        ['si_inp_boule', 'Semi-Insulating InP Boule', 'Lingote de InP semiaislante', 'Indium phosphide pulled with a trace of iron under a boron oxide cap.', 'Fosfuro de indio estirado con una traza de hierro bajo una capa de óxido de boro.', 'The iron pins the Fermi level: no leakage at 4 K.', 'El hierro fija el nivel de Fermi: sin fugas a 4 K.'],
        ['si_inp_wafer', 'Semi-Insulating InP Wafer', 'Oblea de InP semiaislante', 'The substrate of the 2DEG and HEMT epitaxy.', 'El sustrato de la epitaxia del 2DEG y del HEMT.', 'Sawn from a semi-insulating InP boule.', 'Cortada de un lingote de InP semiaislante.'],
        ['inp_scrap', 'InP Scrap', 'Desecho de InP', 'Kerf, boule ends and wafer edges of indium phosphide.', 'Serrín, extremos de lingote y bordes de oblea de fosfuro de indio.', 'Leached back to indium in the extraction cascade.', 'Se lixivia de vuelta a indio en la cascada de extracción.'],
        ['inas_qw_wafer', 'InAs Quantum Well Wafer', 'Oblea de pozo cuántico de InAs', 'A shallow InAs quantum well grown by MBE on semi-insulating InP.', 'Un pozo cuántico de InAs poco profundo crecido por MBE sobre InP semiaislante.', 'An epitaxial aluminium film comes next.', 'Después viene una película epitaxial de aluminio.'],
        ['hbn_capped_2deg_wafer', 'hBN-Capped 2DEG Wafer', 'Oblea 2DEG con capa de hBN', 'The InAs/Al wafer under an annealed hBN gate dielectric.', 'La oblea InAs/Al bajo un dieléctrico de puerta de hBN recocido.', 'Gates are written on it by STM lithography.', 'Sus puertas se escriben por litografía STM.'],
        ['gate_stack_soi_wafer', 'Gate Stack SOI Wafer', 'Oblea SOI con pila de puerta', 'Si-28 on insulator under a hafnium oxide and titanium nitride gate stack.', 'Si-28 sobre aislante bajo una pila de puerta de óxido de hafnio y nitruro de titanio.', 'Exposed in the BEUV scanner.', 'Se expone en el escáner BEUV.'],
        ['cryo_cmos_litho_wafer', 'Patterned Cryo-CMOS Wafer', 'Oblea cryo-CMOS litografiada', 'The gate stack patterned at 6.7 nm.', 'La pila de puerta grabada a 6,7 nm.', 'Its sources and drains are implanted next.', 'Después se implantan sus fuentes y drenadores.'],
        ['cryo_cmos_implanted_wafer', 'Implanted Cryo-CMOS Wafer', 'Oblea cryo-CMOS implantada', 'Arsenic-implanted sources and drains, ready for the metal.', 'Fuentes y drenadores implantados con arsénico, listos para el metal.', 'Gold is sputtered on in the MTJ sputter tool.', 'Se le pulveriza oro en la herramienta de pulverización MTJ.'],
        ['cryo_cmos_metal_wafer', 'Metallised Cryo-CMOS Wafer', 'Oblea cryo-CMOS metalizada', 'Gold interconnect over the cryo-CMOS transistors.', 'Interconexión de oro sobre los transistores cryo-CMOS.', 'Diced into untested dies.', 'Se corta en chips sin probar.'],
        ['untested_cryo_cmos_die', 'Untested Cryo-CMOS Die', 'Chip cryo-CMOS sin probar', 'A cryo-CMOS controller die that has not yet been cold.', 'Un chip controlador cryo-CMOS que aún no ha estado en frío.', 'Tested at 4 K in the helium refrigerator.', 'Se prueba a 4 K en el refrigerador de helio.'],
        ['gold_overspray', 'Gold Overspray', 'Exceso de oro pulverizado', 'Gold scraped from the sputter shields.', 'Oro raspado de los escudos de pulverización.', 'Dissolved back to gold in the platinum plant.', 'Se disuelve de vuelta a oro en la planta de platino.'],
        ['rrr_nb_target', 'High-RRR Niobium Target', 'Blanco de niobio de alto RRR', 'A sputter target of SRF-grade niobium on a copper backing plate.', 'Un blanco de pulverización de niobio de grado SRF sobre una placa de cobre.', 'Fills the TSVs and makes the NbTiN film.', 'Rellena los TSV y forma la película de NbTiN.'],
        ['tsv_via_wafer', 'TSV Via Wafer', 'Oblea con vías TSV', 'Float-zone silicon with through-silicon vias etched in it.', 'Silicio de zona flotante con vías a través del silicio grabadas.', 'The vias are filled with niobium.', 'Las vías se rellenan de niobio.'],
        ['nb_filled_tsv_wafer', 'Nb-Filled TSV Wafer', 'Oblea TSV rellena de Nb', 'Every via filled with high-RRR niobium.', 'Cada vía rellena de niobio de alto RRR.', 'Bonded to an oxidised handle wafer.', 'Se une a una oblea soporte oxidada.'],
        ['bonded_tsv_interposer', 'Bonded TSV Interposer', 'Intercalador TSV unido', 'The niobium TSV wafer bonded and thinned on its handle.', 'La oblea TSV de niobio unida y adelgazada sobre su soporte.', 'Cooled below 9.2 K so each via is checked superconducting.', 'Se enfría por debajo de 9,2 K para comprobar que cada vía es superconductora.'],
        ['nbtin_film_wafer', 'NbTiN Film Wafer', 'Oblea con película de NbTiN', 'A reactively sputtered niobium titanium nitride film on sapphire.', 'Una película de nitruro de niobio y titanio pulverizada reactivamente sobre zafiro.', 'High kinetic inductance, low loss.', 'Alta inductancia cinética, bajas pérdidas.'],
        ['ln_on_soi_wafer', 'LN-on-SOI Wafer', 'Oblea LN sobre SOI', 'A lithium niobate film sliced onto Si-28 on insulator.', 'Una película de niobato de litio cortada sobre Si-28 sobre aislante.', 'Waveguides are written in it next.', 'Después se escriben guías de onda en ella.'],
        ['ln_soi_waveguide_wafer', 'LN-on-SOI Waveguide Wafer', 'Oblea de guías LN sobre SOI', 'Femtosecond-written waveguides and modulators in the LN film.', 'Guías de onda y moduladores escritos con femtosegundos en la película de LN.', 'NbN detectors are added in the SNSPD foundry.', 'Se le añaden detectores de NbN en la fundición SNSPD.'],
        ['snspd_link_wafer', 'SNSPD Link Wafer', 'Oblea de enlace SNSPD', 'Modulators and NbN nanowire detectors on one LN-on-SOI chip.', 'Moduladores y detectores de nanohilos de NbN en un chip LN sobre SOI.', 'Pigtailed to fibre in the fibre draw tower.', 'Se conecta a fibra en la torre de estirado de fibra.'],
        ['inp_hemt_epi_wafer', 'InP HEMT Epi Wafer', 'Oblea epitaxial HEMT de InP', 'An InGaAs/InAlAs channel grown by MBE on semi-insulating InP.', 'Un canal InGaAs/InAlAs crecido por MBE sobre InP semiaislante.', 'Its T-gates are exposed in the BEUV scanner.', 'Sus puertas en T se exponen en el escáner BEUV.'],
        ['hemt_gated_wafer', 'Gated HEMT Wafer', 'Oblea HEMT con puertas', 'Sub-50 nm T-gates over the HEMT channel.', 'Puertas en T de menos de 50 nm sobre el canal HEMT.', 'Isolated by helium implantation.', 'Se aísla por implantación de helio.'],
        ['isolated_hemt_wafer', 'Isolated HEMT Wafer', 'Oblea HEMT aislada', 'Each transistor isolated from its neighbours by helium damage.', 'Cada transistor aislado de sus vecinos por daño de helio.', 'Diced into cryogenic amplifiers.', 'Se corta en amplificadores criogénicos.'],
        ['hpsi_sic_wafer', 'HPSI SiC Wafer', 'Oblea de SiC HPSI', 'High-purity semi-insulating silicon carbide.', 'Carburo de silicio semiaislante de alta pureza.', 'The substrate of the GaN epitaxy.', 'El sustrato de la epitaxia de GaN.'],
        ['gan_sic_epi_wafer', 'GaN-on-SiC Epi Wafer', 'Oblea epitaxial de GaN sobre SiC', 'An AlGaN/GaN heterostructure on semi-insulating SiC.', 'Una heteroestructura AlGaN/GaN sobre SiC semiaislante.', 'Its gates are exposed in the BEUV scanner.', 'Sus puertas se exponen en el escáner BEUV.'],
        ['gan_gated_wafer', 'Gated GaN Wafer', 'Oblea de GaN con puertas', 'GaN transistors with their gates written.', 'Transistores de GaN con sus puertas escritas.', 'Passivated and plated into MMICs in the SiC device fab.', 'Se pasiva y metaliza en MMIC en la fábrica de dispositivos de SiC.'],
        ['sdd_ring_wafer', 'SDD Drift Ring Wafer', 'Oblea de anillos de deriva SDD', 'Boron-implanted drift rings on float-zone silicon.', 'Anillos de deriva implantados con boro en silicio de zona flotante.', 'The anode is exposed in the BEUV scanner.', 'El ánodo se expone en el escáner BEUV.'],
        ['sdd_anode_wafer', 'SDD Anode Wafer', 'Oblea de ánodo SDD', 'The drift rings around a small collecting anode.', 'Los anillos de deriva alrededor de un pequeño ánodo colector.', 'Metallised and diced in the MTJ sputter tool.', 'Se metaliza y corta en la herramienta de pulverización MTJ.']
    ]

    // kind, id, en, es
    var NAMES = [
        ['material', 'si28_trichlorosilane', 'Si-28 Trichlorosilane', 'Triclorosilano Si-28'],
        ['material', 'gan_mocvd_exhaust', 'GaN MOCVD Exhaust', 'Escape de MOCVD de GaN']
    ]
    var PREFIX = { material: 'material.gtceu.' }

    // EMI lines of this package's rows on older machines whose types carry a data key (gtceu.recipe.<dataKey>.<name>)
    var RECIPES = [
        ['gtceu.recipe.grindless_crystal_growth.si_inp_boule', 'Circuit 21: semi-insulating InP pulled with a trace of iron under the boron oxide cap', 'Circuito 21: InP semiaislante estirado con una traza de hierro bajo la capa de óxido de boro'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.inas_qw', 'Circuit 9: an InAs quantum well on semi-insulating InP; half the arsenic comes back', 'Circuito 9: un pozo cuántico de InAs sobre InP semiaislante; la mitad del arsénico vuelve'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.inp_hemt_epi', 'Circuit 10: the InGaAs/InAlAs HEMT channel on semi-insulating InP; half the arsenic comes back', 'Circuito 10: el canal HEMT InGaAs/InAlAs sobre InP semiaislante; la mitad del arsénico vuelve'],
        ['gtceu.recipe.grindless_beuv_lithography.cryo_cmos_exposure', 'Circuit 4: the cryo-CMOS gates; the mirror comes out fouled', 'Circuito 4: las puertas cryo-CMOS; el espejo sale sucio'],
        ['gtceu.recipe.grindless_beuv_lithography.tsv_exposure', 'Circuit 5: the through-silicon vias of the Nb interposer', 'Circuito 5: las vías a través del silicio del intercalador de Nb'],
        ['gtceu.recipe.grindless_beuv_lithography.hemt_gate_exposure', 'Circuit 6: the T-gates of the InP HEMT', 'Circuito 6: las puertas en T del HEMT de InP'],
        ['gtceu.recipe.grindless_beuv_lithography.gan_gate_exposure', 'Circuit 7: the gates of the GaN-on-SiC transistors', 'Circuito 7: las puertas de los transistores de GaN sobre SiC'],
        ['gtceu.recipe.grindless_beuv_lithography.sdd_anode_exposure', 'Circuit 8: the collecting anode inside the drift rings', 'Circuito 8: el ánodo colector dentro de los anillos de deriva'],
        ['gtceu.recipe.grindless_stm_lithography.gate_2deg', 'Circuit 4: gate electrodes written through the hBN cap; the helium boils off', 'Circuito 4: electrodos de puerta escritos a través de la capa de hBN; el helio se evapora'],
        ['gtceu.recipe.grindless_mtj_sputtering.cryo_cmos_metal', 'Circuit 5: gold interconnect from foil; the overspray goes to the platinum plant', 'Circuito 5: interconexión de oro desde lámina; el exceso va a la planta de platino'],
        ['gtceu.recipe.grindless_mtj_sputtering.nb_tsv_fill', 'Circuit 6: the vias filled with RRR niobium; the trim goes to scrap', 'Circuito 6: las vías rellenas de niobio RRR; el recorte va a chatarra'],
        ['gtceu.recipe.grindless_mtj_sputtering.nbtin_film', 'Circuit 7: NbTiN sputtered in nitrogen onto sapphire', 'Circuito 7: NbTiN pulverizado en nitrógeno sobre zafiro'],
        ['gtceu.recipe.grindless_mtj_sputtering.sdd_metal', 'Circuit 8: aluminium contacts, then the wafer is diced into four SDD dies', 'Circuito 8: contactos de aluminio y luego la oblea se corta en cuatro chips SDD'],
        ['gtceu.recipe.grindless_ion_slicing.tsv_bond', 'Circuit 5: the via wafer bonded to an oxidised handle and thinned', 'Circuito 5: la oblea de vías unida a un soporte oxidado y adelgazada'],
        ['gtceu.recipe.grindless_ion_slicing.ln_on_soi', 'Circuit 6: a lithium niobate film sliced onto Si-28 SOI; the donor is often reused', 'Circuito 6: una película de niobato de litio cortada sobre SOI Si-28; el donante suele reutilizarse'],
        ['gtceu.recipe.grindless_femtosecond_writing.ln_soi_waveguides', 'Circuit 6: waveguides and modulators written in the LN film', 'Circuito 6: guías de onda y moduladores escritos en la película de LN'],
        ['gtceu.recipe.grindless_snspd_fabrication.snspd_link', 'Circuit 6: NbN nanowire detectors on the LN-on-SOI link chip', 'Circuito 6: detectores de nanohilos de NbN en el chip de enlace LN sobre SOI'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.hpsi_sic', 'Circuit 8: a high-purity SiC layer grown from methyltrichlorosilane', 'Circuito 8: una capa de SiC de alta pureza crecida desde metiltriclorosilano'],
        ['gtceu.recipe.grindless_silicon_carbide.gan_mmic', 'Circuit 6: the gated GaN wafer passivated, plated and diced into four MMICs', 'Circuito 6: la oblea de GaN con puertas pasivada, metalizada y cortada en cuatro MMIC'],
        ['gtceu.recipe.grindless_photonic_integration.cosmic_mainframe', 'Circuit 8: the cosmic mainframe, joined from the four cryogenic parts', 'Circuito 8: el mainframe cósmico, unido desde las cuatro piezas criogénicas']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            var add = function (key, value) { event.add('grindless', key, value) }
            ITEMS.forEach(function (e) {
                add('item.grindless.' + e[0], e[1 + li])
                add('tooltip.grindless.' + e[0] + '.0', e[3 + li])
                add('tooltip.grindless.' + e[0] + '.1', e[5 + li])
            })
            NAMES.forEach(function (e) { add(PREFIX[e[0]] + e[1], e[2 + li]) })
            RECIPES.forEach(function (e) { add(e[0], e[1 + li]) })
        })
    })
})()
