# Era IV

IV es tungsteno, naquadah y producir en serie. En EV los multibloques eran lo normal; en IV la receta ya no cabe en una máquina ni en una mano: la línea de ensamblaje pide hasta 16 ingredientes en orden, un motor de LuV lleva 64 hilos finos de ruridit y la central pasa de 32 768 a 131 072 EU/t. Los materiales se vuelven radiactivos y piden traje. Si el jugador sigue crafteando de uno en uno, el pack está mal: IV entrega el kit de producción en serie (escotillas ME, línea de ensamblaje alimentada por AE2, escotilla de paralelo, cubos de GCYM) y la puerta lo exige. La primera fusión de GTM es de LuV (pide circuitos ZPM y 64 UHPIC): en IV su lugar lo ocupa la central de motores extremos, que junta combustible, oxígeno líquido, lubricante y red. Un multibloque nuestro nuevo, la planta de naquadah; la planta de platino aprende el modo del iridio y el osmio; la perforadora abre las vetas radiactivas. Salir de IV duele por el iridio, las estrellas cuánticas y la línea, no por picar.

Se entra con lo que deja EV: casco IV (`gtceu:iv_machine_hull`) y una oblea HPIC, 8 ordenadores nano (`gtceu:nano_processor_computer`), motor y bomba IV, una bobina RTM (4 500 K), la planta de platino con la mezcla Ir/Os guardada, una central de 32 768 EU/t con transformador EV→IV, escotillas ME, una red AE2 con CPU de 256k y la estrella del wither.

## Ruta

1. **Red IV.** Casco IV → cortadora IV (`gtceu:iv_cutter`) → chips HPIC → escotillas de energía IV (2 A; dos del mismo escalón suben un tier: LuV). Transformador EV→IV (4 A → 1 A) y búferes. La central de EV (32 768 EU/t) aguanta hasta el paso 10, pero la planta de naquadah (30 720 EU/t) casi la vacía: se corre con búferes y sin otra línea pesada a la vez.
2. **HSS-G y la bobina de 5 400 K.** 5 acero de tungsteno + 1 Cr + 2 Mo + 1 V (mezclador EV; cromo y vanadio de `magnetite_end`, molibdeno de la veta del Nether) → EBF 4 200 K con bobina RTM → congelador. Bobina HSS-G (`coil_hssg`, ensamblador IV: 8 hilos dobles de HSS-G + 8 láminas de carburo de tungsteno + 144 mB de tungsteno fundido): el EBF llega a 5 400 K, el techo de IV.
3. **Perforadora IV y vetas radiactivas.** `gtceu:iv_vein_drill` con broca de HSS-G. Segundo viaje al End con el traje de MV (`gtceu:hazmat_*`): 2 menas de `naquadah_vein` y 2 de `pitchblende_vein_end`. Desde ahí, sin viajes.
4. **Radón y estrellas.** Pechblenda, uraninita y plutonio-239 → U-238 y Pu-239 (centrífuga) → radón (reactor grande: 10 000 mB de aire + 1 de U-238 + 8 lingotes de Pu-239 que vuelven como polvo; AE2 y un horno cierran el lazo) → baño químico: estrella del wither + 1 250 mB de radón = `gtceu:quantum_star`; ojo de ender + 250 mB = `gtceu:quantum_eye`.
5. **Iridio y osmio.** Planta de platino, modo 3 (dos escotillas EV): la mezcla Ir/Os guardada da Ir (EBF 4 500 K) y Os (EBF con dos escotillas IV). Después, ruridit (2 Ru + 1 Ir), paladio chapado en rodio (3 Pd + 1 Rh) y HSS-S (6 HSS-G + 2 Ir + 1 Os; EBF 5 000 K).
6. **Samario, niobio y superconductores.** Monacita (veta del Nether) → samario (centrífuga, EBF 5 400 K) → imán; piroclor (apatito) → niobio → NbTi (mezclador IV); SmFeAsO, el superconductor de IV (mezclador IV).
7. **Naquadah.** Mena del End → polvo → EBF 5 000 K → lingote → boule con 16 bloques de silicio, GaAs y 8 000 mB de argón (EBF 5 400 K) → obleas de naquadah, que dan más chips por oblea al grabar (verificar cifras). La planta separa el resto; la tanda de prueba es de LuV (dos escotillas IV).
8. **Sensores, emisores y línea de ensamblaje.** Sensor IV (varilla de iridio + estrella cuántica) y emisor IV (4 varillas + estrella); carcasa de control (HPIC + 4 circuitos EV + sensor + emisor + motor IV + marco de TS) y unidad de línea; controlador `gtceu:assembly_line` (casco IV + 2 brazos IV + 4 carcasas + 2 circuitos IV). Escáneres EV (ojos cuánticos) e IV (estrellas) para investigar.
9. **Paralelo y GCYM.** Escotilla de paralelo IV (sensor + emisor + 4 circuitos LuV + casco IV + 2 cables dobles de platino; ×4) y los cubos de GCYM (circuitos IV + la máquina IV del mismo tipo + piezas de tungsteno; el mezclador grande pide un rotor de osmiridio y queda para LuV). `large_packer` y `alloy_blast_smelter` suben a IV.
10. **Central de motores extremos.** 4 × `gtceu:extreme_combustion_engine` (un circuito LuV cada uno) con oxígeno líquido, lubricante y gasolina de alto octanaje: 131 072 EU/t. Transformador IV→LuV y búferes.
11. **Circuitos LuV y salida.** `gtceu:nano_processor_mainframe` (ensamblador de circuitos EV en cámara limpia: 2 ordenadores nano + 16 inductores y 32 condensadores SMD + 16 RAM + hilo de cobre recocido): 8 se gastan en los motores y el paralelo y 4 quedan en la red. Casco LuV, un motor LuV hecho por la línea desde la red y la *Puerta a LuV*.

## Herencia de EV

- **Mezcla Ir/Os.** Dueño: la planta de platino (EV, la guarda). IV la abre en el paso 5: sin ella no hay sensores, ruridit ni HSS-S.
- **Estrella del wither.** Dueño: EV. IV la gasta: cada sensor y cada emisor IV lleva una estrella cuántica y una línea de 7 cortes tiene 11 carcasas de control (con las 4 del controlador), o sea 22 estrellas.
- **RTM, tungsteno y nicromo.** Dueño: EV. IV los gasta en carcasas robustas de acero de tungsteno (motores extremos, perforadora IV), en el HSS-G (EBF 4 200 K con bobina RTM) y en el carburo de la bobina.
- **Ordenadores nano y cámara limpia.** Dueño: EV (la pared). IV gasta dos por mainframe LuV; la línea nano no cambia.
- **Sensores, emisores y campo generador EV.** Dueño: IV (EV los dejó: piden ojo cuántico, o sea radón). De ellos salen el escáner EV y los cofres y tanques cuánticos de LuV.
- **Escotillas ME.** Dueño: EV. IV las pone en las plantas y en la línea de ensamblaje (fluidos y salida; sus buses de ítems son ULV, no ME).
- **Gasolina de alto octanaje.** Dueño: EV (opcional). IV la recomienda: los motores extremos gastan la mitad con ella.
- **Perforadora de fluidos EV (×64, casco IV).** Dueño: EV, que la deja lista. IV la abre.
- **El End.** Dueño: la perforadora HV. `naquadah_vein` y `pitchblende_vein_end` esperaban en `veins_excluded.json` hasta IV.

## Generación automática de recursos

IV abre las vetas radiactivas del End y el escalón EV de la perforadora de fluidos; no hay invernadero ni criatura nuevos. HSS-G, samario, niobio e iridio salen de vetas que ya hay y de la planta de platino.

### Perforadora de vetas IV

- **Registro:** `gtceu:iv_vein_drill`, tipo `gtceu:vein_drilling`, la spec y las tablas de LV a EV (`lv/multis.js`, `lv/vein_drilling.js`). Carcasa `gtceu:robust_machine_casing` y marcos de acero de tungsteno (verificar).
- **Decisión: las dos vetas radiactivas.** `naquadah_vein` (naquadah y plutonio 239) y `pitchblende_vein_end` (pechblenda y uraninita) pasan de `veins_excluded.json` a `veins_end.json`, con muestra de 2 menas cada una. La muestra (`grindless:vein_sample_*`) no irradia; las menas salen por el bus a la red (verificar si la mena cruda irradia).
- **Gana al EV:** tope 128 en `bores` (una escotilla IV, 8 192 V ÷ 8, sobra: ×48 sobre el vapor) y broca de HSS-G (`grindless:hssg_drill_bit`, ~0,2 % por ciclo; ~0,1 % con lodo; cifras a ajustar) hecha con el cromo, el vanadio y el molibdeno que sacan las perforadoras anteriores.
- **Cierra el círculo:** muestra y agua, sin más viajes. Da naquadah, uranio y plutonio. Ninguna otra veta es nueva.

### Aceite, gas y aire

- **Aceite:** `gtceu:ev_fluid_drilling_rig` (×64, casco IV, carcasa robusta de TS). Los 4 motores gastan ≈ 410 mB/s de gasolina de alto octanaje (≈ 260 mB/s de gasolina más aditivos), o ≈ 820 mB/s de gasolina normal. La perforadora EV y la refinería de HV alcanzan (verificar el rendimiento de la veta de crudo).
- **Aire y oxígeno líquido:** aire líquido → torre → O₂ → congelador de vacío → oxígeno líquido (≈ 320 mB/s para 4 motores: 4 mB/tick cada uno; verificar la receta). Argón (8 000 mB por boule), helio y gases nobles: aire, como en EV. El aire de ender (`distill_liquid_ender_air`) también da radón, pero la veta ya lo da: opcional.
- **Hidrógeno, flúor, ácidos y lubricante:** electrólisis, minerales de flúor (HV), H₂SO₄ y lubricante de la creosota o de la refinería; no cambian.
- **Cierra el círculo:** crudo, aire, agua, sal y azufre de perforadoras y colectores; naquadah, uranio, tungsteno, vanadio, cromo, molibdeno, niobio, samario y platino, de vetas y de la planta de platino. Lo demás es EU.

### Criaturas

IV no añade criatura: el simulador (`gtceu:ev_creature_simulator`) acaba en EV. Cambia el gasto: el wither da 1 estrella por ciclo de 30 s y IV las gasta en estrellas cuánticas (22 para la línea, 1 por campo generador). Sin cambios en `mobs.json`.

## Multibloques nuestros

### Planta de naquadah: `gtceu:naquadah_plant` (el de la era)

Qué gana: **pasos en uno, lazos cerrados y lo peligroso dentro.** La línea de GTM son 13 recetas en cinco tipos de máquina (reactor, centrífuga, mezclador, torre, EBF), con dos soluciones impuras que hay que guardar y volver a meter, un catalizador de antimonio y flúor que el jugador devuelve a mano y un residuo de naquadria (radiactivo, riesgo 3). La planta recibe naquadah y ácido y entrega sulfatos, titanio e indio; el antimonio y el flúor dan la vuelta dentro.

- **Tipo de receta:** `gtceu:naquadah_refining` (nuevo, verificar colisión de id), dos recetas a mano con las cifras y la energía de `NaquadahRecipes`, sin descuento:
  1. **Separación** (circuito 1), por 6 de naquadah. Entra (neto): 6 de polvo de naquadah, 3 000 mB de H₂SO₄, 2 000 de H₂ y ½ de calcio; el catalizador, 4 de SbF₃, no se consume (`notConsumable`: verificar) y su carga única sale de la línea de GTM (estibina de la tetraedrita del Nether → Sb → Sb₂O₃ → SbF₃). Sale: 6 de sulfato de naquadah enriquecido, 6 de sulfato de naquadria, 1 de sulfuro de trinio, 1 de titanio, ½ de indio, 1 de fosfuro de calcio, ½ de BaS y ½ de GaS. Energía: la suma de las etapas, ≈ 20,9 M EU (separación 18,4 M a 30 720 EU/t, dos centrífugas EV, seis etapas HV y el titanio): 30 720 EU/t, ≈ 680 t.
  2. **Recuperación** (circuito 2): fosfuro de calcio, BaS y GaS → calcio, fósforo, bario, galio y azufre (electrólisis; verificar que se descomponen). El calcio vuelve a la separación y el azufre, al lazo del ácido sulfúrico.
- **Condición propia:** un reflector de neutrones (`gtceu:neutron_reflector`: ensamblador MV de 4 000 t con 1 placa de ruridit + 4 placas dobles de berilio + 2 de carburo de tungsteno + 4 608 mB de aleación de estaño) en el bus de entrada, ≈ 12 % por tanda (cifra a ajustar). Cruza cuatro líneas: platino (ruridit), Nether (berilio), tungsteno y estaño. La fusión de LuV los gastará.
- **Estructura:** nave de 7×7×5 con carcasa inerte (`gtceu:inert_machine_casing`: el FSbA no ataca el PTFE) ≥ 40, tubos de PTFE (`gtceu:ptfe_pipe_casing`), vidrio laminado (`gtceu:laminated_glass`), bus de entrada (naquadah, calcio, reflectores, SbF₃), bus de salida, 2 escotillas de entrada de fluidos (H₂SO₄, H₂), ninguna de salida y **dos escotillas de energía IV**: la separación es una receta de LuV y dos del mismo escalón suben un tier. Admite escotillas ME (verificar).
- **Se fabrica con lo que sustituye:** casco IV + reactor químico IV + centrífuga IV + mezclador IV + destilador IV + 2 bombas IV + 4 circuitos IV (`gtceu:iv_chemical_reactor`, `iv_centrifuge`, `iv_mixer`, `iv_distillery`).
- **Ritmo:** una tanda de 6 de naquadah cada ≈ 34 s (las cifras de medio se doblan: tanda de 12 cada ≈ 68 s). No es de cantidad: 6 polvos dan, tras los EBF, 1 lingote de naquadah enriquecido, 1 de naquadria y ½ de trinio. Sin paralelos: 30 720 EU/t ya llenan las dos escotillas.
- **Por qué no es un cubo grande:** (1) ninguna máquina de GTM junta reactor, centrífuga, mezclador, torre y EBF ni guarda las soluciones a medias; (2) no da paralelos ni descuento: la energía es la suma de las etapas; (3) pide dos líneas de fluido, un catalizador de antimonio cargado una vez, un reflector que cruza cuatro líneas y un destino para cada una de las ocho salidas: si un bus se llena, se para.
- **Subproductos:** el SbF₃ y el flúor no salen: el SbF₃ es catalizador y, de los 4 000 mB de HF de la cadena, 3 000 vuelven del titanio y 1 000 como F₂, que la planta devuelve a HF con 1 000 mB de H₂ (`hydrofluoric_acid_from_elements`; por eso el neto pide 2 000 de H₂; verificar). Titanio → lazo del titanio. Indio, bario y galio → se guardan (ITBTC de LuV, arseniuro de galio). Fósforo → línea del fósforo. Sulfato de naquadah enriquecido y sulfuro de trinio → se guardan para los EBF de 7 000 K y 7 200 K (bobina de naquadah). Sulfato de naquadria (radiactivo): se guarda en la red hasta ZPM, nunca se vacía.
- **Recortable:** sin reflector y sin recuperación queda la separación; si el balance de Sb, F, S y H no cierra, se quita y queda la cadena de GTM por máquinas (la separación sigue siendo de LuV: reactor grande con dos escotillas IV). Crece en LuV con un modo de reducción (bobina de naquadah).

### Planta de platino: modo 3 y paralelo

- **Modo 3 de `gtceu:pgm_refining`** (circuito 3), por 7 mezclas Ir/Os: entran 7 mezclas y 8 000 mB de H₂; salen 1 Ir, 1 Os, 5 000 mB de agua y 1 de residuo. El HCl (4 000 mB) y el OsO₄ (tóxico) dan la vuelta dentro. Energía ≈ 3,15 M EU (≈ 410 t a 7 680 EU/t: dos escotillas EV).
- **Paralelo:** la planta admite la escotilla de paralelo IV (×4: cuatro tandas a la vez con 4× la energía, sin descuento). El iridio es el único cuello de cantidad de IV; esta es la palanca (nunca el tiempo).

### Escalones de familia

La perforadora IV (arriba). No hay simulador IV. El EBF, el reactor grande, la torre, la línea de ensamblaje, los motores extremos y los cubos de GCYM de GTM se usan tal cual. Hay un solo multibloque nuevo porque la regla de la casa lo deja ahí: las separaciones son nuestras (platino, naquadah), las síntesis, de GTM.

### Descartadas

- **Fisión propia.** El orquestador la dejó para más tarde: los motores extremos llevan la central. Si LuV pide un consumidor de uranio y plutonio, se decide allí.
- **Activador de neutrones de GTNH.** Necesita Java (energía cinética de neutrones); el reflector como condición guarda la idea sin copiarla.
- **Fusión o pre-fusión propia.** GTM trae la suya en LuV (siguiente sección): otro cubo.
- **Fábrica de componentes** (Compact Assembly Line y Component Nexus de Star Technology, MIT): síntesis en una caja, contra la regla de la casa. Queda de plan B para LuV si la línea con AE2 no evita el crafteo manual.
- **Planta de radiactivos y GCYM antes de IV.** Radón y estrellas se hacen con GTM y un lazo de AE2; los cubos, como en EV.

## La primera fusión, o lo que ocupa su lugar

GTM 7.5.3 pone la fusión Mk1 (`gtceu:fusion_reactor_mk1`, línea de ensamblaje, VA[LuV]) al final de LuV: 4 circuitos ZPM, 64 UHPIC (con naquadah fundido), 2 campos generadores IV, una bobina superconductora (3 456 mB de trinio fundido) y vidrio y carcasa con PBI, reflectores y placas de naquadah. En IV no cabe y no hay fusión nuestra. Ocupan su lugar:

- **La central de motores extremos.** Casco IV, carcasa robusta de TS, 2 pistones IV, 2 motores IV, 1 circuito LuV y cable de HSS-G. 8 192 EU/t cada uno y 32 768 con oxígeno líquido (4 mB/tick; el empuje pide dos escotillas de dinamo IV, verificar) y 1 mB de lubricante cada 72 ticks. Cuatro = 131 072 EU/t (la puerta: 4 × V[LuV]) con ≈ 410 mB/s de gasolina de alto octanaje (3 200 EU/mB) y ≈ 320 mB/s de oxígeno líquido.
- **Combustible de fusión.** Deuterio, tritio y helio-3 (`hydrogen_separation`, `deuterium_separation`, `helium_separation`; verificar), plutonio-241 (centrífuga de la línea radiactiva) y los 2 campos generadores IV: se hacen en IV y se guardan para LuV.
- **Qué prueba:** que cuatro líneas (combustible, comburente, lubricante y red) no fallan a la vez y que IV ya fabrica todo lo que la fusión pide menos lo de LuV.

## Líneas de proceso nuevas

| Línea | Pasos | Subproductos → destino |
|---|---|---|
| HSS y bobinas | mezclador EV (5 TS + 1 Cr + 2 Mo + 1 V → 9 HSS-G) → EBF 4 200 K (bobina RTM) → congelador. Bobina `coil_hssg` → EBF 5 400 K. HSS-S: 6 HSS-G + 2 Ir + 1 Os → EBF 5 000 K | Sin restos; el calor se va en el congelador. Carburo y tungsteno fundido: de EV |
| Iridio, osmio y aleaciones del platino | planta de platino, modo 3 → Ir (EBF 4 500 K) y Os (EBF con dos escotillas IV: receta de LuV). Ruridit (mezclador IV, EBF 4 500 K), paladio chapado en rodio (mezclador IV, EBF 4 500 K) y NbTi (mezclador IV, EBF 4 500 K). El osmiridio (mezclador de LuV) queda para LuV | Agua: caldera o invernadero. Residuo: inerte, se vacía. HCl y OsO₄: dentro |
| Radiactivos, radón y estrella | pechblenda, uraninita y Pu-239 (macerador, lavadora, centrífuga) → U-238 y Pu-239 → radón (reactor grande) → baño químico: estrella del wither + 1 250 mB, ojo de ender + 250 mB | Pu-239: lazo polvo ↔ lingote por AE2. Pu-241: placa de la fusión. U-235 y torio: se guardan (verificar riesgo); nada se vacía |
| Naquadah | mena → polvo → EBF 5 000 K → lingote → boule (EBF 5 400 K) → obleas de naquadah (cortadora IV) → grabado láser. Separación en la planta; con la bobina de naquadah, EBF de 7 000 K (enriquecido) | Pu-239 de la veta: al radón. El resto, en la planta |
| PBI y kapton K | PBI (`polybenzimidazole`, reactor IV): difenilisoftalato + diaminobencidina (reactor grande IV) → PBI + 1 000 mB de fenol. Kapton K de GCYR (dianhídrido piromelítico + oxidianilina; verificar) | Fenol: vuelve al lazo. Lodo de oxidianilina (GCYR): verificar destino. PBI: tubería del cubo mezclador y fusión de LuV |
| Tierras raras, samario y niobio | monacita → `monazite_extraction` → `rare_earth_separation` (centrífuga) → Sm, Nd, Ce, Y, La, Cd; Sm → EBF 5 400 K → imán; piroclor → niobio; SmFeAsO (mezclador IV) | Nd: imanes. Ce, Y, La, Cd: se guardan, sin consumidor en IV (verificar) |

## Producción en serie

La regla de IV: nada se fabrica de uno en uno. Lo que IV entrega para cumplirla:

- **Línea de ensamblaje desde la red.** Sus buses de ítems son ULV de un hueco y van en orden (los ME no valen): un bus de exportación de AE2 por corte, fijado a su ingrediente, y la línea fabrica un componente en continuo; la salida vuelve por un bus de salida ME y los fluidos entran por escotillas ME (verificar). La red hace los ingredientes con patrones normales y `merequester` mantiene el stock del componente (verificar). La investigación se hace una vez: escáner EV para el motor, la bomba, el pistón, la cinta y el brazo LuV (900 t); escáner IV para el sensor, el emisor y el campo LuV (2 400 t).
- **Paralelo y cubos de GCYM.** Escotilla de paralelo IV ×4 (LuV ×16): solo GCYM, los cubos de addons y nuestras plantas la aceptan (el EBF y el reactor grande de GTM no). Los cubos piden circuitos IV, la máquina IV del mismo tipo y piezas de tungsteno; sin paralelo solo son velocidad.
- **Dos escotillas IV = LuV, salvo en los ensambladores de GCYM.** La línea de ensamblaje, el reactor grande, el EBF, nuestras plantas y los demás cubos de GCYM (el tope de dos escotillas, verificar) admiten dos escotillas del mismo escalón y corren recetas de un tier más (separación del naquadah, osmio). `large_assembler` y `large_circuit_assembler` llevan exactamente una (verificado en `GCYMMachines`): solo paralelizan. Las recetas de ensamblador de LuV (bobinas de voltaje, bobina de naquadah) y el mezclador de LuV (osmiridio) piden la máquina de LuV.
- **Cofre y tanque cuánticos IV** (`gtceu:iv_quantum_chest`, `gtceu:iv_quantum_tank`; campo generador HV): el stock de la línea fuera de la red.
- **AE2.** Patrones para cubos y plantas (un patrón de procesado lleva 9 entradas: verificar); `mega` y los coprocesadores aguantan los pedidos grandes. Cada línea queda configurada para un producto: no hay patrón por receta de ensamblaje.

## El primer cohete (GCYR)

- **Piezas:** tanque avanzado (2 barriles de acero de tungsteno + 6 placas de kapton K + marco de TS) y motor avanzado (4 propulsores avanzados `gtceu:advanced_power_thruster` + 6 placas de kapton K + marco de TS), ensamblador IV; plataforma (HV) y escáner de cohetes (EV). Combustible de nivel 0: gasolina o diésel de la refinería. GCYR trae piezas básicas a nivel HV: se quitan y el primer cohete es el avanzado (verificar niveles y destinos).
- **Alcance:** la Luna, ida y vuelta. No trae nada obligatorio: las vetas de las dimensiones de `gcyr` siguen en `veins_excluded.json` hasta "space" y la puerta no lo pide. Capítulo lateral con premio.

## Puerta a LuV

| Qué se construye | Qué prueba |
|---|---|
| Casco LuV (`gtceu:luv_machine_hull`: carcasa LuV de 8 placas de paladio chapado en rodio, 2 cables de NbTi, 2 de PTFE) | rodio, paladio, niobio y PTFE en lote |
| 4 mainframes nano (`gtceu:nano_processor_mainframe`) en la red, además de los 8 que gastan los motores extremos y la escotilla de paralelo | la línea nano ×3: 24 ordenadores nano en total |
| Motor LuV hecho por la línea de ensamblaje desde la red (imán de samario, HSS-S, 64 hilos finos de ruridit, NbTi, lubricante), sin tocar nada | línea + investigación + AE2 + iridio y osmio |
| Un lingote de osmio (EBF 4 500 K con dos escotillas IV: receta de LuV) y uno de naquadah (EBF 5 000 K) | el truco de las dos escotillas, el iridio y el osmio de la planta de platino y el naquadah de la veta |
| Planta de naquadah con una tanda hecha (6 de naquadah → sulfatos, sulfuro de trinio, titanio e indio) | la separación de LuV con dos escotillas IV y el lazo del antimonio y el flúor |
| 2 campos generadores IV, plutonio-241, deuterio y tritio guardados | la fusión de LuV |
| Central de 4 motores extremos (131 072 EU/t o más), 2 búferes y transformador IV→LuV | "sin ir justo" |
| Escotilla de paralelo IV corriendo en la planta de platino o en un cubo de GCYM | el kit de producción en serie |
| Perforadora IV, perforadora de fluidos EV, planta de platino y planta de naquadah 10 minutos sin tocarlas | la generación se sostiene sola |

Abre LuV: casco y escotillas LuV, motor, bomba, pistón, brazo, cinta, sensor, emisor y campo generador LuV; el mezclador y el ensamblador de LuV (osmiridio, bobinas de voltaje, bobina de naquadah de 7 200 K con hilo de naquadah y láminas de osmio); el naquadah enriquecido y el trinio (EBF de 7 000 y 7 200 K); la escotilla de paralelo LuV (×16) y el mezclador grande; la fusión Mk1 y su combustible; el `me_pattern_buffer` (hilo de europio); los cofres y tanques cuánticos LuV (campo generador EV) y, aparte, el espacio.

## Mods e integración

| Mod | Slug | Uso en IV |
|---|---|---|
| MEGA Cells | `mega` | IV: toda la familia entra por el procesador de acumulación con un circuito IV (`integration/megacells.js`, hecho); si las celdas grandes (16M o más) resultan baratas para IV, se suben con circuitos LuV (verificar) |
| Expanded AE | `expanded-ae` | coprocesador ×32k con circuito IV (`integration/expandedae.js`, hecho); ×1M, LuV |
| ExtendedAE, MERequester | `extended-ae`, `merequester` | HV; sin puertas nuevas. `merequester` mantiene el stock de la línea (verificar) |
| GTM Extended Features | `gtm-extended-features` | su `expanded_assembly_line` acepta buses ME y su `robust_alloy_materializer` tiene sobrecarga perfecta: decidir con el agente de lotes (nada más barato que GT) |
| GCYR | `gcyr` | primer cohete avanzado, sin piezas básicas |
| DeaFission | `deafission` | fuera: no carga en 7.5.3 y no hay fisión externa (`docs/integracion/mods-tecnicos.md`) |
| GT Community Additions, Create, Greate, Productive Bees | `gt-community-additions`, `create`, `greate`, `productivebees` | sin cambios; las abejas solo dan materiales por máquinas de GT (regla de MV) |

Ningún mod nuevo es obligatorio: máquinas, tipos de receta y ítems son KubeJS.

- **Startup:** tipo `gtceu:naquadah_refining`; máquinas `naquadah_plant` e `iv_vein_drill` con el helper de patrones; `bores` en 128; ítem `grindless:hssg_drill_bit`; la escotilla de paralelo como habilidad de `pgm_refining` (`Pat.part('parallel_hatch')`, verificar). El `widen` de la planta de naquadah: 4 ítems de entrada y 8 de salida, 2 fluidos de entrada y ninguno de salida.
- **Server:** las 2 recetas de `naquadah_refining` y el modo 3 de `pgm_refining` a mano, en tablas con las cifras de `NaquadahRecipes` y `PlatGroupMetalsRecipes`; las dos vetas pasan de `veins_excluded.json` a `veins_end.json` con sus muestras; la broca en `BITS` de `lv/vein_drilling.js`; controladores de `gtceu:large_packer` y `gtceu:alloy_blast_smelter` quitados y vueltos a añadir como el resto de GCYM (circuitos IV + máquina IV del mismo tipo + piezas IV); piezas básicas de `gcyr` fuera; la misión de la puerta pide el mainframe nano y el motor LuV de la línea.
- **Config:** nada nuevo (`orderedAssemblyLineFluids` de GTM, por defecto). Comprobar que las dimensiones de `gcyr` no generan menas fuera de las tablas.
- **Misiones:** capítulo "Fábrica IV" con unas 20, una por paso y por multibloque, premio pequeño y sin bloquear recetas; el cohete es capítulo lateral.
- **Pruebas:** (1) arranca; (2) la planta de naquadah, la de platino (modo 3) y la perforadora IV se forman y procesan; (3) 6 de naquadah → sulfatos, trinio, titanio e indio con el balance de Sb, F, S y H; 7 mezclas → Ir + Os; pechblenda → radón → estrella; HSS-G → bobina; y `-Tier iv` sin huérfanas.

## Riesgos y dudas

- **El iridio y las estrellas son la pared.** Una línea de 7 cortes lleva 11 carcasas de control (11 sensores y 11 emisores = 27,5 Ir y 22 estrellas) y 7 unidades de línea (2 engranajes de ruridit cada una = 18,7 Ir y 37 Ru): ≈ 46 Ir. La escotilla de paralelo suma 2,5 Ir y cada motor LuV ≈ 3,3. Con las cifras de GTM un Ir son 42 PGS (≈ 1 900 PGS la línea). Palancas, en este orden: el paralelo ×4 de la planta, más perforadoras y, si el test de balance lo pide, un rendimiento mayor del modo 3. Nunca el tiempo.
- **El paralelo llega tarde y los ensambladores de GCYM no suben de tier.** La escotilla pide 4 circuitos LuV, sensor y emisor IV: sale al final de IV y el iridio se hace a 1× hasta entonces. Los dos ensambladores grandes llevan una sola escotilla de energía: no corren recetas de LuV (verificado). Si la ruta se atasca, el coste del paralelo baja a circuitos IV por KubeJS.
- **AE2 y la línea de ensamblaje.** Buses ULV en orden, patrones de 9 entradas (verificar) y recetas de 16 ítems y 4 fluidos. La solución (exportación por bus; Expanded Assembly Line de GTM Extended Features) está sin probar; plan B: Compact Assembly Line de Star Technology (MIT) en LuV.
- **Radiactivos y viaje.** Segundo viaje al End con traje; si la mena cruda irradia o la veta falla, plan B: la misma veta en una dimensión propia, como el Vacío y el Llano.
- **Cifras sin comprobar.** Balance neto de la planta de naquadah (Sb, F, S y H), `notConsumable` de fluidos, kapton K de GCYR, propulsores avanzados y nivel de cohete por planeta. Si no cierran, la planta se recorta a la separación y el cohete pasa a LuV.

Créditos a anotar en `CREDITS.md`: planta de naquadah (idea de la línea de naquadah y del activador de neutrones de GTNH, solo la idea; recetas y cifras de GTM, LGPL-3.0); línea de ensamblaje, escotilla de paralelo y cubos de GCYM (GTM, LGPL-3.0); cohete y kapton K (GCYR, licencia por comprobar); Compact Assembly Line y Component Nexus (Star Technology, MIT) como alternativa descartada.

## Decisiones propuestas

1. **Un multibloque nuevo: la planta de naquadah** (`gtceu:naquadah_refining`: separación y recuperación; reflector de neutrones como condición; dos escotillas IV; recortable). La de platino crece con el modo 3 (Ir/Os) y admite la escotilla de paralelo.
2. **Perforadora IV** (`gtceu:iv_vein_drill`, tope 128, broca de HSS-G) con `naquadah` y `pitchblende_end`: segundo viaje con traje, 2 menas por veta.
3. **La primera fusión se queda en LuV** (la de GTM, con ZPM y UHPIC). En IV: la central de 4 motores extremos con oxígeno líquido (131 072 EU/t) y el combustible de fusión guardado. Sin fusión ni fisión propia.
4. **Producción en serie sin cubo nuestro:** línea de ensamblaje alimentada por AE2, paralelo ×4 y GCYM (los dos ensambladores grandes, con una sola escotilla de energía: sin el truco de las dos). `large_packer` y `alloy_blast_smelter` suben a IV (GTM los pone en EV): corrige la decisión 5 de EV.
5. **Naquadah en IV** = mena → lingote → boule y obleas, y separación en la planta (receta de LuV con dos escotillas IV). La bobina de naquadah, el enriquecido y el trinio abren LuV (mezclador y ensamblador de LuV); la naquadria, ZPM.
6. **Radón y estrella cuántica con GTM tal cual** (reactor grande + lazo de Pu-239 por AE2), sin planta de radiactivos; el traje es obligatorio (regla de MV).
7. **Iridio:** el modo 3 da 1 Ir + 1 Os por 7 mezclas, como GTM; el paralelo ×4 se usa en la planta de platino. Si el test de balance lo pide, el rendimiento sube a 2 Ir (nunca el tiempo).
8. **Primer cohete avanzado en IV, fuera de la puerta:** se quitan las piezas básicas de `gcyr` y las dimensiones espaciales siguen excluidas hasta "space".
9. **Puerta a LuV:** casco LuV, 4 mainframes nano de reserva (12 con los gastados), motor LuV hecho por la línea desde la red, osmio con dos escotillas IV, tanda de la planta de naquadah, central de 131 072 EU/t, combustible de fusión y generación sostenida.
10. **Mods y correcciones a EV:** `mega` en IV (puerta de `megacells.js`; las celdas grandes, a revisar) y `expanded-ae` ×32k en IV; `deafission` fuera (no carga en 7.5.3; corrige ev.md); la gasolina de alto octanaje pasa de opcional a recomendada; Extended Features: decidir su Expanded Assembly Line y su Robust Alloy Materializer.

## Decisiones tomadas (orquestador, 2026-10-24)

Se aprueban las diez propuestas, con estas precisiones:

- **Platino vivo, no el de GTM.** GT-- (`gtnn`) cambia el platline de GTM por uno al estilo GTNH, y la planta de platino de EV ya compone sus recetas leyendo las que están cargadas. El modo 3 (Ir/Os) y la planta de naquadah se hacen igual: se leen las recetas que haya en la partida, y las cifras de este documento se rehacen con ellas.
- **El iridio no puede ser un muro de cantidad.** La escotilla de paralelo IV pide circuitos IV en vez de LuV (KubeJS), así que el ×4 llega a mitad de IV y no al final. Si el test de balance sigue pidiendo más, primero se ponen más perforadoras y plantas y después el modo 3 da 2 Ir. Nunca se toca el tiempo.
- **Extended Features:** en la versión 3.0.0 la Expanded Assembly Line, la Large Cracking Machine y la Large Pyrolysis Oven no tienen receta de controlador. Si la línea con AE2 la necesita, la Expanded Assembly Line recibe en IV un controlador del tipo GCYM: circuitos IV, la línea de GTM y acero de tungsteno. El Robust Alloy Materializer, la Rock Processing Plant y la Synthesis Vessel salen del pack (lo hizo la auditoría de addons).
- **Más multibloques propios:** se relaja la regla de la casa ("las separaciones son nuestras, las síntesis de GTM"). Desde EV, cada era lleva 2–3 multibloques nuestros nuevos, y siempre tienen que ganar algo. Los de IV salen de `docs/eras/ampliacion.md`, que se está redactando, y se suman a la planta de naquadah.
- **Espacio:** el primer cohete se queda como capítulo lateral de IV hasta que la hoja de ruta de LuV en adelante fije la era del espacio. Si la cambia, esta decisión se ajusta.