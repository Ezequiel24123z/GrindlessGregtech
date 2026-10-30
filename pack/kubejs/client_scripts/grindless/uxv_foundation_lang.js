// priority: 1601
// Gregtech Grindless - names and tooltips of the UXV foundation (startup_scripts/grindless/uxv/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//   grindless:<material> (GT material)       material.grindless.<n>
//   gtceu:uxv_<machine> (hull and hatches)   block.gtceu.uxv_<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // id, en name, es name, en tip 0, es tip 0, en tip 1, es tip 1
    var ITEMS = [
        ['uxv_electric_motor', 'UXV Electric Motor (old)', 'Motor eléctrico UXV (antiguo)', 'A motor wound with a strand tape and driven at 134 MV.', 'Un motor bobinado con cinta de hebra y alimentado a 134 MV.', 'Old item: crafts 1:1 into the GregTech component.', 'Objeto antiguo: se convierte 1:1 en el componente de GregTech.'],
        ['uxv_electric_pump', 'UXV Electric Pump (old)', 'Bomba eléctrica UXV (antiguo)', 'A pump for fluids that would eat a lesser seal.', 'Una bomba para fluidos que destruirían un sello menor.', 'Old item: crafts 1:1 into the GregTech component.', 'Objeto antiguo: se convierte 1:1 en el componente de GregTech.'],
        ['uxv_conveyor_module', 'UXV Conveyor Module (old)', 'Módulo transportador UXV (antiguo)', 'A belt that moves parts without touching them.', 'Una cinta que mueve piezas sin tocarlas.', 'Old item: crafts 1:1 into the GregTech component.', 'Objeto antiguo: se convierte 1:1 en el componente de GregTech.'],
        ['uxv_electric_piston', 'UXV Electric Piston (old)', 'Pistón eléctrico UXV (antiguo)', 'A prestressed piston that pushes without play.', 'Un pistón pretensado que empuja sin holgura.', 'Old item: crafts 1:1 into the GregTech component.', 'Objeto antiguo: se convierte 1:1 en el componente de GregTech.'],
        ['uxv_robot_arm', 'UXV Robot Arm (old)', 'Brazo robótico UXV (antiguo)', 'An arm that places a part to within a nanometre.', 'Un brazo que coloca una pieza con precisión de nanómetro.', 'Old item: crafts 1:1 into the GregTech component.', 'Objeto antiguo: se convierte 1:1 en el componente de GregTech.'],
        ['uxv_sensor', 'UXV Sensor (old)', 'Sensor UXV (antiguo)', 'A superfluid gyroscope read by a magnetic tunnel junction.', 'Un giroscopio superfluido leído por una unión túnel magnética.', 'Old item: crafts 1:1 into the GregTech component.', 'Objeto antiguo: se convierte 1:1 en el componente de GregTech.'],
        ['uxv_emitter', 'UXV Emitter (old)', 'Emisor UXV (antiguo)', 'A source of gamma light that comes from annihilation.', 'Una fuente de luz gamma que nace de la aniquilación.', 'Old item: crafts 1:1 into the GregTech component.', 'Objeto antiguo: se convierte 1:1 en el componente de GregTech.'],
        ['uxv_field_generator', 'UXV Field Generator (old)', 'Generador de campo UXV (antiguo)', 'A field-reversed plasma held in a strand coil.', 'Un plasma de campo invertido sostenido en una bobina de hebra.', 'Old item: crafts 1:1 into the GregTech component.', 'Objeto antiguo: se convierte 1:1 en el componente de GregTech.'],

        ['cofeb_target', 'CoFeB Sputter Target', 'Blanco de pulverización de CoFeB', 'Bonded CoFeB for the magnetic layers.', 'CoFeB adherido para las capas magnéticas.', 'Spent targets are pressed again.', 'Los blancos gastados se prensan de nuevo.'],
        ['mgo_target', 'MgO Sputter Target', 'Blanco de pulverización de MgO', 'The oxide barrier of a tunnel junction.', 'La barrera de óxido de una unión túnel.', 'Spent targets are pressed again.', 'Los blancos gastados se prensan de nuevo.'],
        ['heusler_target', 'Heusler Sputter Target', 'Blanco de pulverización Heusler', 'Co2MnSi, a half-metal for the free layers.', 'Co2MnSi, un semimetal para las capas libres.', 'Spent targets are pressed again.', 'Los blancos gastados se prensan de nuevo.'],
        ['saf_target_set', 'SAF Target Set', 'Juego de blancos SAF', 'The Ru spacer and pinned layers of a synthetic antiferromagnet.', 'El espaciador de Ru y las capas fijas de un antiferromagnético sintético.', 'Spent targets are pressed again.', 'Los blancos gastados se prensan de nuevo.'],
        ['ta_seed_target', 'Ta Seed Target', 'Blanco semilla de Ta', 'Tantalum for the seed layer under a stack.', 'Tántalo para la capa semilla bajo una pila.', 'Spent targets are pressed again.', 'Los blancos gastados se prensan de nuevo.'],
        ['srruo3_target', 'SrRuO3 Target', 'Blanco de SrRuO3', 'An oxide electrode for pulsed laser deposition.', 'Un electrodo de óxido para deposición láser pulsada.', 'Used up in the oxide PLD chamber.', 'Se consume en la cámara PLD de óxidos.'],
        ['la_bfo_target', 'La-BFO Target', 'Blanco de La-BFO', 'La-doped bismuth ferrite, a multiferroic.', 'Ferrita de bismuto dopada con La, un multiferroico.', 'Used up in the oxide PLD chamber.', 'Se consume en la cámara PLD de óxidos.'],
        ['cofeb_ingot', 'CoFeB Ingot', 'Lingote de CoFeB', 'A glassy magnetic alloy, melted levitated.', 'Una aleación magnética vítrea, fundida en levitación.', 'Ground to powder for targets.', 'Se muele a polvo para blancos.'],
        ['heusler_ingot', 'Heusler Ingot', 'Lingote Heusler', 'Co2MnSi melted levitated.', 'Co2MnSi fundido en levitación.', 'Ground to powder for targets.', 'Se muele a polvo para blancos.'],
        ['terfenol_d_ingot', 'Terfenol-D Ingot', 'Lingote de Terfenol-D', 'The most magnetostrictive alloy known.', 'La aleación más magnetoestrictiva conocida.', 'Grown into a rod in a Bridgman furnace.', 'Se crece hasta una barra en un horno Bridgman.'],
        ['ni_mn_ga_ingot', 'Ni-Mn-Ga Ingot', 'Lingote de Ni-Mn-Ga', 'A shape-memory alloy with a magnetic trigger.', 'Una aleación con memoria de forma y disparo magnético.', 'Grown into a crystal in a Bridgman furnace.', 'Se crece hasta un cristal en un horno Bridgman.'],
        ['ta_foil', 'Ta Foil', 'Lámina de Ta', 'Tantalum foil for spin-orbit torque layers.', 'Lámina de tántalo para capas de par espín-órbita.', 'Rolled from a Ta ingot.', 'Laminada a partir de un lingote de Ta.'],
        ['pt_sheet', 'Pt Sheet', 'Chapa de Pt', 'A thin platinum sheet for antennas and crucibles.', 'Una chapa fina de platino para antenas y crisoles.', 'The offcuts go back to the platinum plant.', 'Los recortes vuelven a la planta de platino.'],
        ['dysco3_substrate', 'DyScO3 Substrate', 'Sustrato de DyScO3', 'A lattice-matched base for oxide films.', 'Una base de red compatible para películas de óxido.', 'Grown by the Czochralski method.', 'Se crece con el método Czochralski.'],
        ['ggg_wafer', 'GGG Wafer', 'Oblea de GGG', 'Gadolinium gallium garnet, the base for YIG.', 'Granate de galio y gadolinio, la base del YIG.', 'Cut from a Czochralski boule.', 'Se corta de una bola Czochralski.'],
        ['hbn_crystal', 'hBN Crystal', 'Cristal de hBN', 'A flake of hexagonal boron nitride.', 'Una escama de nitruro de boro hexagonal.', 'Insulates the layers of a van der Waals stack.', 'Aísla las capas de una pila de van der Waals.'],
        ['wte2_crystal', 'WTe2 Crystal', 'Cristal de WTe2', 'A layered crystal with a strong spin-orbit effect.', 'Un cristal laminar con un fuerte efecto espín-órbita.', 'Grown by chemical vapour transport.', 'Se crece por transporte químico de vapor.'],
        ['fgt_crystal', 'Fe3GeTe2 Crystal', 'Cristal de Fe3GeTe2', 'A layered ferromagnet that works as a thin flake.', 'Un ferromagneto laminar que funciona como escama fina.', 'Grown by chemical vapour transport.', 'Se crece por transporte químico de vapor.'],
        ['mtj_stack_wafer', 'MTJ Stack Wafer', 'Oblea con pila MTJ', 'A wafer carrying a magnetic tunnel junction stack.', 'Una oblea con una pila de unión túnel magnética.', 'Made in the MTJ sputter cluster.', 'Se hace en el clúster de pulverización MTJ.'],
        ['mram_stack_wafer', 'MRAM Stack Wafer', 'Oblea con pila MRAM', 'A wafer carrying a memory stack with a Heusler layer.', 'Una oblea con una pila de memoria con capa Heusler.', 'Made in the MTJ sputter cluster.', 'Se hace en el clúster de pulverización MTJ.'],
        ['saf_track_wafer', 'SAF Track Wafer', 'Oblea con pista SAF', 'A wafer carrying a racetrack stack.', 'Una oblea con una pila de pista de carreras.', 'Made in the MTJ sputter cluster.', 'Se hace en el clúster de pulverización MTJ.'],
        ['mtj_die', 'MTJ Die', 'Dado MTJ', 'A magnetic tunnel junction, probed and diced.', 'Una unión túnel magnética, probada y cortada.', 'Part of the spintronic circuits.', 'Parte de los circuitos espintrónicos.'],
        ['mram_wafer', 'MRAM Wafer', 'Oblea MRAM', 'A wafer of finished magnetic memory.', 'Una oblea de memoria magnética terminada.', 'Part of the spintronic circuits.', 'Parte de los circuitos espintrónicos.'],
        ['srruo3_electrode_wafer', 'SrRuO3 Electrode Wafer', 'Oblea con electrodo de SrRuO3', 'An oxide electrode grown on a substrate.', 'Un electrodo de óxido crecido sobre un sustrato.', 'Made in the oxide PLD chamber.', 'Se hace en la cámara PLD de óxidos.'],
        ['me_switch_wafer', 'ME Switch Wafer', 'Oblea de interruptor ME', 'A magnetoelectric switch film on an oxide stack.', 'Una película de interruptor magnetoeléctrico sobre una pila de óxido.', 'Made in the oxide PLD chamber.', 'Se hace en la cámara PLD de óxidos.'],
        ['sot_readout_stack', 'SOT Readout Stack', 'Pila de lectura SOT', 'A stack that reads a spin by its torque.', 'Una pila que lee un espín por su par.', 'Made in the vdW stacking cell.', 'Se hace en la celda de apilado vdW.'],
        ['meso_logic_die', 'MESO Logic Die', 'Dado lógico MESO', 'A magnetoelectric spin-orbit logic die.', 'Un dado lógico magnetoeléctrico espín-órbita.', 'Part of the spintronic circuits.', 'Parte de los circuitos espintrónicos.'],
        ['racetrack_chip', 'Racetrack Chip', 'Chip de pista de carreras', 'A memory where domain walls run along a track.', 'Una memoria donde paredes de dominio corren por una pista.', 'Made in the racetrack fab.', 'Se hace en la fábrica de pistas.'],
        ['magnonic_bus', 'Magnonic Bus', 'Bus magnónico', 'A YIG waveguide that carries spin waves.', 'Una guía de ondas de YIG que lleva ondas de espín.', 'Made in the YIG LPE furnace line.', 'Se hace en la línea del horno LPE de YIG.'],
        ['sin_membrane', 'SiN Membrane', 'Membrana de SiN', 'A thin silicon nitride film that holds an aperture.', 'Una película fina de nitruro de silicio que sostiene una apertura.', 'Back-etched before use.', 'Se graba por detrás antes de usarla.'],
        ['nanoaperture_array', 'Nanoaperture Array', 'Matriz de nanoaperturas', 'Holes 70 nm wide written in a membrane.', 'Agujeros de 70 nm escritos en una membrana.', 'Used in the weak link of a gyroscope.', 'Se usa en el enlace débil de un giroscopio.'],
        ['rf_carpet_board', 'RF Carpet Board', 'Placa de alfombra RF', 'Electrodes that sweep ions to a nozzle.', 'Electrodos que barren iones hacia una boquilla.', 'Part of a gas stopping cell.', 'Parte de una celda de frenado de gas.'],
        ['kr_f2_premix', 'KrF2 Premix', 'Premezcla de KrF2', 'The gas charge of an excimer laser.', 'La carga de gas de un láser excímero.', 'Used up as the laser fires.', 'Se gasta mientras el láser dispara.'],
        ['krf_excimer_laser', 'KrF Excimer Laser', 'Láser excímero de KrF', 'The light source of the oxide PLD chamber.', 'La fuente de luz de la cámara PLD de óxidos.', 'A machine part, not a machine.', 'Una pieza de máquina, no una máquina.'],
        ['pt_lpe_crucible', 'Pt LPE Crucible', 'Crisol de Pt para LPE', 'A platinum crucible for a molten flux.', 'Un crisol de platino para un fundente fundido.', 'A machine part of the YIG LPE furnace.', 'Una pieza del horno LPE de YIG.'],
        ['gas_stopping_cell', 'Gas Stopping Cell', 'Celda de frenado de gas', 'A helium cell that stops fast ions.', 'Una celda de helio que frena iones rápidos.', 'A machine part of the MNT collider.', 'Una pieza del colisionador MNT.'],
        ['shequid_gyro', 'SHeQUID Gyroscope', 'Giroscopio SHeQUID', 'A superfluid helium quantum interference gyroscope.', 'Un giroscopio de interferencia cuántica de helio superfluido.', 'Made at the SHeQUID works.', 'Se hace en la planta SHeQUID.'],

        ['stno_stack_wafer', 'STNO Stack Wafer', 'Oblea con pila STNO', 'A thick free layer for a spin-torque oscillator.', 'Una capa libre gruesa para un oscilador de par de espín.', 'Made in the MTJ sputter cluster.', 'Se hace en el clúster de pulverización MTJ.'],
        ['stno_array', 'STNO Array', 'Matriz STNO', 'Oscillators that pulse in phase as a spin-wave source.', 'Osciladores que laten en fase como fuente de ondas de espín.', 'Feeds the magnonic bus.', 'Alimenta el bus magnónico.'],
        ['gum_metal_billet', 'Gum Metal Billet', 'Tocho de Gum Metal', 'A Ti-Nb-Ta-Zr-O billet that bends like rubber.', 'Un tocho de Ti-Nb-Ta-Zr-O que se dobla como goma.', 'Sintered in the powder bed.', 'Se sinteriza en el lecho de polvo.'],
        ['gum_metal_blank', 'Gum Metal Blank', 'Pieza en bruto de Gum Metal', 'A blank cut for a flexspline.', 'Una pieza en bruto cortada para un flexspline.', 'Made from a gum metal billet.', 'Se hace de un tocho de Gum Metal.'],
        ['gum_metal_flexspline', 'Gum Metal Flexspline', 'Flexspline de Gum Metal', 'A cup that flexes without fatigue.', 'Una copa que se flexiona sin fatiga.', 'Part of a strain wave gear.', 'Parte de un engranaje de onda de deformación.'],
        ['uxv_strain_wave_gear', 'UXV Strain Wave Gear', 'Engranaje de onda de deformación UXV', 'A gear with no backlash and a huge ratio.', 'Un engranaje sin juego y con una relación enorme.', 'Used in the UXV robot arm.', 'Se usa en el brazo robótico UXV.'],
        ['encoder_ring', 'Encoder Ring', 'Anillo codificador', 'A ring that tells a joint its angle.', 'Un anillo que le dice a una articulación su ángulo.', 'Becomes a multipole ring.', 'Se convierte en un anillo multipolo.'],
        ['multipole_encoder_ring', 'Multipole Encoder Ring', 'Anillo codificador multipolo', 'A ring with many magnetic poles for fine angles.', 'Un anillo con muchos polos magnéticos para ángulos finos.', 'Read by a TMR encoder.', 'Lo lee un codificador TMR.'],
        ['tmr_encoder', 'TMR Encoder', 'Codificador TMR', 'A tunnel magnetoresistance angle sensor.', 'Un sensor de ángulo de magnetorresistencia túnel.', 'Part of the UXV robot arm.', 'Parte del brazo robótico UXV.'],
        ['ga2o3_wafer', 'Ga2O3 Wafer', 'Oblea de Ga2O3', 'A wide-gap oxide wafer from edge-defined growth.', 'Una oblea de óxido de banda ancha de crecimiento definido por borde.', 'Cut into power dies.', 'Se corta en dados de potencia.'],
        ['ga2o3_power_die', 'Ga2O3 Power Die', 'Dado de potencia de Ga2O3', 'A switch that stands very high voltages.', 'Un interruptor que soporta voltajes muy altos.', 'Part of the UXV energy hatches.', 'Parte de los hatches de energía UXV.'],
        ['mu_metal_foil', 'Mu-Metal Foil', 'Lámina de mu-metal', 'A foil that shields a part from stray fields.', 'Una lámina que protege una pieza de campos parásitos.', 'Part of shielded circuits.', 'Parte de circuitos blindados.'],
        ['shielded_interposer', 'Shielded Interposer', 'Interpositor blindado', 'A carrier board inside a mu-metal shield.', 'Una placa portadora dentro de un blindaje de mu-metal.', 'Part of the Mk6 fusion ring.', 'Parte del anillo de fusión Mk6.'],
        ['finemet_ribbon', 'Finemet Ribbon', 'Cinta de Finemet', 'A nanocrystalline ribbon spun from a melt.', 'Una cinta nanocristalina hilada de una masa fundida.', 'Wound into a toroid.', 'Se bobina en un toroide.'],
        ['finemet_toroid', 'Finemet Toroid', 'Toroide de Finemet', 'A wound ring of Finemet ribbon.', 'Un anillo bobinado de cinta de Finemet.', 'Annealed into a core.', 'Se recuece hasta un núcleo.'],
        ['finemet_core', 'Finemet Core', 'Núcleo de Finemet', 'A soft magnetic core with very low loss.', 'Un núcleo magnético blando con pérdidas muy bajas.', 'Part of the UXV voltage coil.', 'Parte de la bobina de voltaje UXV.'],
        ['uxv_voltage_coil', 'UXV Voltage Coil', 'Bobina de voltaje UXV', 'A coil that steps a hatch up to UXV voltage.', 'Una bobina que sube un hatch al voltaje UXV.', 'Part of the UXV hull and hatches.', 'Parte del casco y los hatches UXV.'],

        ['fm257_target', 'Fm-257 Target', 'Blanco de Fm-257', 'A target wheel loaded with fermium-257.', 'Una rueda blanco cargada con fermio-257.', 'Spent wheels come back as actinide waste.', 'Las ruedas gastadas vuelven como residuo de actínidos.'],
        ['cm248_target', 'Cm-248 Target', 'Blanco de Cm-248', 'A target wheel loaded with curium-248.', 'Una rueda blanco cargada con curio-248.', 'Spent wheels come back as actinide waste.', 'Las ruedas gastadas vuelven como residuo de actínidos.'],
        ['element_121_recoil', 'Element 121 Recoil', 'Retroceso del elemento 121', 'A few atoms of element 121, caught on a foil.', 'Unos pocos átomos del elemento 121, atrapados en una lámina.', 'Counted in the superheavy census.', 'Se cuenta en el censo de superpesados.'],
        ['element_122_recoil', 'Element 122 Recoil', 'Retroceso del elemento 122', 'A few atoms of element 122, caught on a foil.', 'Unos pocos átomos del elemento 122, atrapados en una lámina.', 'Counted in the superheavy census.', 'Se cuenta en el censo de superpesados.'],
        ['superheavy_census_iii', 'Superheavy Census III', 'Censo de superpesados III', 'The decay chains of elements 121 and 122.', 'Las cadenas de desintegración de los elementos 121 y 122.', 'Points to the island of stability.', 'Apunta a la isla de estabilidad.'],
        ['spent_actinide_target', 'Spent Actinide Target', 'Blanco de actínidos gastado', 'A used Fm, Es or Cm target, still radioactive.', 'Un blanco de Fm, Es o Cm usado, aún radiactivo.', 'Reprocessed in the cyclotron works.', 'Se reprocesa en la planta del ciclotrón.'],
        ['u238_ion_source', 'U-238 Ion Source', 'Fuente de iones de U-238', 'Uranium-238 ready to be ionised.', 'Uranio-238 listo para ionizarse.', 'Feeds the heavy ion collider.', 'Alimenta el colisionador de iones pesados.'],
        ['u238_beam_charge', 'U-238 Beam Charge', 'Carga de haz de U-238', 'A charge of uranium ions for the collider.', 'Una carga de iones de uranio para el colisionador.', 'Used up by the collider.', 'Se consume en el colisionador.'],
        ['island_nuclide', 'Island Nuclide', 'Nucleido de la isla', 'A nuclide near the island of stability.', 'Un nucleido cerca de la isla de estabilidad.', 'Measured for the island chart.', 'Se mide para la carta de la isla.'],
        ['island_chart', 'Island Chart', 'Carta de la isla', 'A chart of the island of stability.', 'Una carta de la isla de estabilidad.', 'A data item, kept.', 'Un objeto de datos, se conserva.'],

        ['tetrataenite_lamination', 'Tetrataenite Lamination', 'Laminación de tetrataenita', 'A thin sheet of ordered iron-nickel.', 'Una chapa fina de hierro-níquel ordenado.', 'Stacked into a rotor.', 'Se apila en un rotor.'],
        ['tetrataenite_rotor', 'Tetrataenite Rotor', 'Rotor de tetrataenita', 'A rotor of a meteorite magnet with no rare earths.', 'Un rotor de imán meteorítico sin tierras raras.', 'Part of the UXV electric motor.', 'Parte del motor eléctrico UXV.'],
        ['strand_stator', 'Strand Stator', 'Estátor de hebra', 'A stator wound from a pasta strand.', 'Un estátor bobinado con hebra de pasta.', 'Part of the UXV electric motor.', 'Parte del motor eléctrico UXV.'],
        ['strand_tape', 'Strand Tape', 'Cinta de hebra', 'A strand pressed into a tape.', 'Una hebra prensada en una cinta.', 'Wound into coils.', 'Se bobina en bobinas.'],
        ['alip_duct', 'ALIP Duct', 'Conducto ALIP', 'A duct for a liquid-metal induction pump.', 'Un conducto para una bomba de inducción de metal líquido.', 'Part of the UXV electric pump.', 'Parte de la bomba eléctrica UXV.'],
        ['w184_cvi_preform', 'W-184 CVI Preform', 'Preforma CVI de W-184', 'A woven tungsten-184 fibre body.', 'Un cuerpo de fibra de wolframio-184 tejido.', 'Infiltrated in the CVI furnace.', 'Se infiltra en el horno CVI.'],
        ['terfenol_d_rod', 'Terfenol-D Rod', 'Barra de Terfenol-D', 'A rod grown along its best axis.', 'Una barra crecida a lo largo de su mejor eje.', 'Part of the UXV electric piston.', 'Parte del pistón eléctrico UXV.'],
        ['ni_mn_ga_crystal', 'Ni-Mn-Ga Crystal', 'Cristal de Ni-Mn-Ga', 'A single crystal that changes shape in a field.', 'Un monocristal que cambia de forma en un campo.', 'Part of the UXV electric piston.', 'Parte del pistón eléctrico UXV.'],
        ['cnt_bumper_weave', 'CNT Bumper Weave', 'Tejido paragolpes de CNT', 'A carbon nanotube weave that stops dust.', 'Un tejido de nanotubos de carbono que detiene polvo.', 'The outer layer of a Whipple shield.', 'La capa exterior de un escudo Whipple.'],
        ['cnt_whipple_shield', 'CNT Whipple Shield', 'Escudo Whipple de CNT', 'A spaced shield against hypervelocity dust.', 'Un escudo espaciado contra polvo hipervelocidad.', 'Protects the far platforms.', 'Protege las plataformas lejanas.'],
        ['frc_cartridge', 'FRC Cartridge', 'Cartucho FRC', 'A field-reversed plasma formed and sealed.', 'Un plasma de campo invertido formado y sellado.', 'Part of the UXV field generator.', 'Parte del generador de campo UXV.'],
        ['gamma_laser_module', 'Gamma Laser Module', 'Módulo láser gamma', 'A module that fires annihilation photons.', 'Un módulo que dispara fotones de aniquilación.', 'Part of the UXV emitter.', 'Parte del emisor UXV.'],
        ['positron_stack', 'Positron Stack', 'Pila de positrones', 'Positrons held in a trap stack.', 'Positrones retenidos en una pila de trampas.', 'Used up by the annihilation laser.', 'Se consume en el láser de aniquilación.'],
        ['ti44_core', 'Ti-44 Core', 'Núcleo de Ti-44', 'A core of titanium-44 for a gamma source.', 'Un núcleo de titanio-44 para una fuente gamma.', 'Part of the gamma laser module.', 'Parte del módulo láser gamma.'],
        ['si28_ash', 'Si-28 Ash', 'Ceniza de Si-28', 'Silicon-28 from oxygen burning.', 'Silicio-28 de la combustión de oxígeno.', 'Goes to the silicon-28 wafer line.', 'Va a la línea de obleas de silicio-28.'],

        ['raw_pasta', 'Raw Pasta', 'Pasta cruda', 'Crust matter from a neutron star, unsorted.', 'Materia de corteza de una estrella de neutrones, sin clasificar.', 'It exists only at Vela.', 'Solo existe en Vela.'],
        ['spaghetti_phase', 'Spaghetti Phase', 'Fase espagueti', 'Nuclear matter in long rods.', 'Materia nuclear en barras largas.', 'Drawn into strands.', 'Se estira en hebras.'],
        ['lasagna_phase', 'Lasagna Phase', 'Fase lasaña', 'Nuclear matter in flat sheets.', 'Materia nuclear en láminas planas.', 'Pressed into plates.', 'Se prensa en placas.'],
        ['gnocchi_fragment', 'Gnocchi Fragment', 'Fragmento de ñoqui', 'Nuclear matter in small lumps.', 'Materia nuclear en pequeños grumos.', 'Sorted before use.', 'Se clasifica antes de usarla.'],
        ['anti_phase_residue', 'Anti-Phase Residue', 'Residuo antifase', 'What is left when a phase is split.', 'Lo que queda cuando se separa una fase.', 'Goes back to the crust.', 'Vuelve a la corteza.'],
        ['lasagna_plate', 'Lasagna Plate', 'Placa de lasaña', 'A plate of nuclear matter in the lasagna phase.', 'Una placa de materia nuclear en fase lasaña.', 'Part of the UXV hull.', 'Parte del casco UXV.'],
        ['pasta_core_sample', 'Pasta Core Sample', 'Muestra de núcleo de pasta', 'A core drilled from the crust.', 'Un núcleo perforado de la corteza.', 'Sorted into phases.', 'Se clasifica en fases.'],
        ['ejecta_knot_dust', 'Ejecta Knot Dust', 'Polvo de nudo de eyecciones', 'Dust of a knot flung out by a supernova.', 'Polvo de un nudo lanzado por una supernova.', 'It is rich in titanium-44.', 'Es rico en titanio-44.'],
        ['refractory_condensate', 'Refractory Condensate', 'Condensado refractario', 'The first solid to condense from a hot cut.', 'El primer sólido que condensa de un corte caliente.', 'Split into ordinary metals.', 'Se separa en metales comunes.'],
        ['metal_condensate', 'Metal Condensate', 'Condensado metálico', 'Metal that condenses from a heavy cut.', 'Metal que condensa de un corte pesado.', 'Split into ordinary metals.', 'Se separa en metales comunes.'],
        ['silicate_condensate', 'Silicate Condensate', 'Condensado de silicato', 'Rock that condenses from a heavy cut.', 'Roca que condensa de un corte pesado.', 'Split into ordinary minerals.', 'Se separa en minerales comunes.'],

        ['vela_glitch_timing', 'Vela Glitch Timing', 'Temporización del glitch de Vela', 'Pulse times around a glitch of the Vela pulsar.', 'Tiempos de pulso alrededor de un glitch del púlsar de Vela.', 'Becomes a glitch record.', 'Se convierte en un registro de glitch.'],
        ['vela_glitch_record', 'Vela Glitch Record', 'Registro de glitch de Vela', 'A reduced record of a pulsar glitch.', 'Un registro reducido de un glitch de púlsar.', 'A data item.', 'Un objeto de datos.'],
        ['cygnus_vlbi_record', 'Cygnus VLBI Record', 'Registro VLBI de Cygnus', 'Interferometer data from Cygnus X-1.', 'Datos de interferómetro de Cygnus X-1.', 'A data item.', 'Un objeto de datos.'],
        ['elevator_log', 'Elevator Log', 'Registro del ascensor', 'The log of a run of the stellar elevator.', 'El registro de un viaje del ascensor estelar.', 'A data item.', 'Un objeto de datos.'],
        ['ti44_map', 'Ti-44 Map', 'Mapa de Ti-44', 'Where titanium-44 sits in the remnant.', 'Dónde está el titanio-44 en el remanente.', 'A data item.', 'Un objeto de datos.'],
        ['arm_chart', 'Arm Chart', 'Carta del brazo', 'A chart of the galactic arm.', 'Una carta del brazo galáctico.', 'A data item.', 'Un objeto de datos.'],
        ['bulge_chart', 'Bulge Chart', 'Carta del bulbo', 'A chart of the galactic bulge.', 'Una carta del bulbo galáctico.', 'A data item.', 'Un objeto de datos.'],
        ['pasta_strand_repeater', 'Pasta Strand Repeater', 'Repetidor de hebra de pasta', 'A repeater that links a wireless network by a strand.', 'Un repetidor que enlaza una red inalámbrica con una hebra.', 'The link of the UXV wireless row.', 'El enlace de la fila inalámbrica UXV.']
    ]

    // id, en name, es name, en tip 0, es tip 0, en tip 1, es tip 1
    var BLOCKS = [
        ['uxv_fusion_casing', 'UXV Fusion Casing', 'Carcasa de fusión UXV', 'A wall of W-184 fibre that faces the hottest plasma.', 'Una pared de fibra de W-184 frente al plasma más caliente.', 'The structure block of the Mk6 fusion reactor.', 'Bloque de estructura del reactor de fusión Mk6.']
    ]

    // kind, id, en name, es name
    var NAMES = [
        ['material', 'pasta_strand', 'Pasta Strand', 'Hebra de pasta'],
        ['material', 'titanium_44', 'Titanium-44', 'Titanio-44'],
        ['material', 'fermium_257', 'Fermium-257', 'Fermio-257'],
        ['material', 'tungsten_184', 'Tungsten-184', 'Wolframio-184'],
        ['material', 'oxygen_16', 'Oxygen-16', 'Oxígeno-16'],
        ['material', 'cofeb', 'CoFeB', 'CoFeB'],
        ['material', 'co2mnsi', 'Co2MnSi (Heusler)', 'Co2MnSi (Heusler)'],
        ['material', 'terfenol_d', 'Terfenol-D', 'Terfenol-D'],
        ['material', 'ni2mnga', 'Ni2MnGa', 'Ni2MnGa'],
        ['material', 'dysco3', 'Dysprosium Scandate', 'Escandato de disprosio'],
        ['material', 'srruo3', 'Strontium Ruthenate', 'Rutenato de estroncio'],
        ['material', 'la_bfo', 'La-Doped Bismuth Ferrite', 'Ferrita de bismuto dopada con La'],
        ['material', 'ggg', 'Gadolinium Gallium Garnet', 'Granate de galio y gadolinio'],
        ['material', 'yig', 'Yttrium Iron Garnet', 'Granate de itrio y hierro'],
        ['material', 'hbn', 'Hexagonal Boron Nitride', 'Nitruro de boro hexagonal'],
        ['material', 'wte2', 'Tungsten Ditelluride', 'Ditelururo de wolframio'],
        ['material', 'fe3gete2', 'Iron Germanium Telluride', 'Telururo de hierro y germanio'],
        ['gmaterial', 'stellar_plasma', 'Stellar Plasma', 'Plasma estelar'],
        ['gmaterial', 'disk_plasma', 'Accretion Disk Plasma', 'Plasma de disco de acreción'],
        ['gmaterial', 'filtered_disk_plasma', 'Filtered Disk Plasma', 'Plasma de disco filtrado'],
        ['gmaterial', 'flux_loaded_plasma', 'Flux-Loaded Plasma', 'Plasma cargado de flujo'],
        ['gmaterial', 'stellar_hydrogen_cut', 'Stellar Hydrogen Cut', 'Corte de hidrógeno estelar'],
        ['gmaterial', 'stellar_helium_cut', 'Stellar Helium Cut', 'Corte de helio estelar'],
        ['gmaterial', 'stellar_cno_cut', 'Stellar CNO Cut', 'Corte de CNO estelar'],
        ['gmaterial', 'stellar_heavy_cut', 'Stellar Heavy Cut', 'Corte pesado estelar'],
        ['gmaterial', 'triple_alpha_fuel', 'Triple-Alpha Fuel', 'Combustible triple alfa'],
        ['gmaterial', 'carbon_burning_fuel', 'Carbon-Burning Fuel', 'Combustible de combustión de carbono'],
        ['gmaterial', 'oxygen_burning_fuel', 'Oxygen-Burning Fuel', 'Combustible de combustión de oxígeno'],
        ['gmaterial', 'cno_ash_plasma', 'CNO Ash Plasma', 'Plasma de ceniza CNO'],
        ['gmaterial', 'helium_burning_ash_plasma', 'Helium-Burning Ash Plasma', 'Plasma de ceniza de combustión de helio'],
        ['gmaterial', 'carbon_burning_ash_plasma', 'Carbon-Burning Ash Plasma', 'Plasma de ceniza de combustión de carbono'],
        ['gmaterial', 'oxygen_burning_ash_plasma', 'Oxygen-Burning Ash Plasma', 'Plasma de ceniza de combustión de oxígeno'],
        ['gmaterial', 'lpe_flux', 'LPE Flux', 'Fundente LPE'],
        ['gmaterial', 'he_6n', 'Helium-6N', 'Helio 6N'],
        ['gmaterial', 'mnt_product_gas', 'MNT Product Gas', 'Gas de productos MNT'],
        ['gmaterial', 'finemet_melt', 'Finemet Melt', 'Masa fundida de Finemet'],
        ['gmaterial', 'volatile_condensate', 'Volatile Condensate', 'Condensado volátil'],

        ['machine', 'uxv_machine_hull', 'UXV Machine Hull', 'Casco de máquina UXV'],
        ['machine', 'uxv_energy_input_hatch', 'UXV Energy Hatch', 'Hatch de energía UXV'],
        ['machine', 'uxv_energy_output_hatch', 'UXV Dynamo Hatch', 'Hatch de dinamo UXV'],
        ['machine', 'uxv_energy_input_hatch_16a', 'UXV 16A Energy Hatch', 'Hatch de energía UXV 16A'],
        ['machine', 'uxv_energy_output_hatch_16a', 'UXV 16A Dynamo Hatch', 'Hatch de dinamo UXV 16A']
    ]

    var PREFIX = { material: 'material.gtceu.', gmaterial: 'material.grindless.', machine: 'block.gtceu.' }

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            var add = function (key, value) { event.add('grindless', key, value) }
            var tipped = function (kind) {
                return function (e) {
                    add(kind + '.grindless.' + e[0], e[1 + li])
                    add('tooltip.grindless.' + e[0] + '.0', e[3 + li])
                    add('tooltip.grindless.' + e[0] + '.1', e[5 + li])
                }
            }
            ITEMS.forEach(tipped('item'))
            BLOCKS.forEach(tipped('block'))
            NAMES.forEach(function (e) { add(PREFIX[e[0]] + e[1], e[2 + li]) })
        })
    })
})()
