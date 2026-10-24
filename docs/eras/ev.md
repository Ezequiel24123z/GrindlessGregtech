# Era EV

EV es titanio, platino y química fina. En HV los multibloques eran proyectos que se planifican; en EV son la forma normal de producir: las recetas llegan a los 1 920 EU/t, piden ácidos, gases y cámara limpia a la vez, y la máquina suelta se queda corta. Los multibloques piden a la red de AE2 por escotillas ME (de EV) y le devuelven el producto. Un multibloque nuestro, la planta de platino, sustituye a trece recetas de GTM repartidas entre cuatro tipos de máquina y cierra el lazo del cloro. Salir de EV duele por la química: cuatro metales de un mismo polvo, un ácido nítrico y un cloro que no pueden fallar, y circuitos nano que piden fibra de carbono, fósforo y platino. EV junta dos multibloques nuestros nuevos y once de GTM que hay que coordinar.

Se entra con lo que deja HV: casco EV (`gtceu:ev_machine_hull`) y escotilla de energía EV, 8 circuitos EV (`gtceu:micro_processor_computer`), congelador de vacío y torre con aire líquido, reactor químico grande con PTFE, epoxi y gasolina, una central de 8 192 EU/t con transformador HV→EV, una red AE2 con CPU de 256k, la perforadora HV con el End, la refinería y el reformador.

## Ruta

1. **Red EV.** Transformador HV→EV (4 A → 1 A), búferes y escotillas EV (las de 4 A y 16 A empiezan en EV; dos escotillas del mismo escalón suben un tier). La central suma turbinas grandes de gas (`gtceu:gas_large_turbine`: casco EV, 2 circuitos EV, 4 engranajes de inox y 2 tubos grandes de inox; ≈ 4 096 EU/t cada una) con gas de refinería, y calderas grandes de titanio (`gtceu:large_titanium_boiler`) con turbinas de vapor, hasta los 32 768 EU/t de la puerta.
2. **Escotillas ME.** `gtceu:me_input_bus`, `me_output_bus`, `me_input_hatch` y `me_output_hatch` (bus o escotilla EV + interfaz de AE2 + 2 tarjetas de velocidad, ensamblador a 480 EU/t). Desde aquí la refinería, la planta de mineral y el reactor grande piden a la red y devuelven a ella: la logística deja de ser un cable por máquina.
3. **Aire, nitrógeno y ácido nítrico.** La torre (`gtceu:distillation_tower`) separa el aire líquido. N₂ + H₂ → amoníaco (`ammonia_from_elements`, 384 EU/t) → reactor grande (`nitric_acid_from_ammonia`: 4 000 de O₂ + 1 000 de NH₃ → 1 000 de HNO₃ + agua) → agua regia (`aqua_regia`: 1 000 de HNO₃ + 2 000 de HCl, mezclador). El HCl sale de Cl₂ + H₂ (`hydrochloric_acid`).
4. **Mezcla de metales.** El polvo de piedra de la planta de mineral pasa por `stone_dust_separation` (MV) y la mezcla de metales por la centrífuga EV (900 EU/t): hematita, bauxita, pirolusita, baritina, cromita e ilmenita. Es el destino del ripio de MV.
5. **Platino.** Las menas de sulfuro (calcopirita, calcocita, bornita, tetraedrita, pentlandita; cooperita del End) se reparten: macerador y lavadora → mena purificada → planta de platino (ataque → PGS; separación → Pt, Pd, Rh y Ru; la mezcla Ir/Os se guarda). Pd (1 828 K), Rh (2 237 K) y Ru (2 607 K) salen del EBF Kanthal como lingote caliente y se enfrían en el congelador; Rh y Ru piden escotilla EV.
6. **Tungsteno.** Scheelite (End) + 2 000 de HCl → ácido túngstico (baño químico, 960 EU/t) → electrólisis → polvo → EBF de nicromo (3 600 K, 1 920 EU/t, escotilla EV) → lingote caliente → congelador → tungsteno. Acero de tungsteno: mezclador EV, EBF 3 000 K y congelador.
7. **Aleación RTM.** 4 Ru + 2 W + 1 Mo (mezclador EV) → EBF 3 000 K → congelador → una bobina RTM (`coil_rtm_alloy`, 4 500 K): la prueba del rutenio.
8. **Cámara limpia y circuitos nano.** Boule de fósforo → chips NOR; oblea de CPU + 16 fibras de carbono + 576 mB de glowstone → oblea nano (reactor químico EV) → corte → procesador nano → ensamblaje nano → ordenador nano (`gtceu:nano_processor_computer`). Es la pared.
9. **El wither.** Modelo de esqueleto atrofiado (HV) → cráneos → modelo del wither (EV) → estrella del Nether, que no se gasta hasta IV.
10. **Logística y salida.** Super cofre y tanque EV (`gtceu:ev_super_chest`, `gtceu:ev_super_tank`; campo generador MV, con boro del bórax) y la *Puerta a IV*.

## Herencia de HV

- **Titanio.** Dueño: la puerta de HV (Kroll con lazo Mg/Cl₂, enfriado en el congelador). EV lo gasta en carcasas (`gtceu:stable_machine_casing`), calderas, tubos y cascos. No hay receta nueva; si el lazo se rompe, EV se para.
- **Nicromo.** Dueño: HV (`coil_nichrome`, ensamblador). EV lo usa en el EBF de 3 600 K: tungsteno, acero de tungsteno y RTM.
- **Torre, congelador y aire líquido.** Dueño: HV. EV usa la torre para el aire y el congelador para los lingotes calientes.
- **El End.** Dueño: la perforadora HV. EV pide scheelite (tungsteno) y sheldonita (platino y paladio); las vetas radiactivas esperan a IV.
- **Mezcla de metales.** Dueño: EV (paso 4); en HV se guardó.
- **Reformador.** Su catalizador de platino sale del End; con la planta, el platino deja de depender solo del End.
- **Wither.** HV lo dejó para EV (paso 9 y *Criaturas*).

## Generación automática de recursos

EV no abre fuentes nuevas: sube el escalón de las que hay y añade el wither. Tungsteno y platino salen de las vetas del End de HV y de las menas de sulfuro de siempre. No hay invernadero EV: la familia termina en HV.

### Perforadora de vetas EV

- **Registro:** `gtceu:ev_vein_drill`, tipo `gtceu:vein_drilling`, la spec y las tablas de LV a HV (`lv/multis.js`, `lv/vein_drilling.js`); sin tabla nueva. Carcasa `gtceu:stable_machine_casing` y marcos de titanio (verificar).
- **Decisión: sin vetas nuevas.** `naquadah_vein` y `pitchblende_vein_end` (plutonio y uranio) siguen esperando a IV: nada de EV pide radón ni uranio. La llave y la muestra no cambian.
- **Gana al HV:** tope 64 en `bores` (una escotilla EV, 2 048 V ÷ 8, sobra: ×24 sobre el vapor; abierto a balance) y broca de acero de tungsteno (`grindless:tungsten_steel_drill_bit`, ~0,25 % por ciclo; ~0,12 % con lodo) hecha con la scheelite que saca la propia perforadora.
- **Cierra el círculo:** muestra y agua, sin viajes. Da scheelite (tungsteno), sheldonita (platino) y los sulfuros del PGS.

### Aceite, gas y aire

- **Aceite y gas:** la perforadora de fluidos HV (`gtceu:hv_fluid_drilling_rig`, ×16, casco EV) alimenta la refinería y la central; la de EV (×64) pide casco IV. Los 32 768 EU/t de la puerta son ≈ 4 100 mB/s de gas de refinería (160 EU/mB) en ocho turbinas; el propano (232), el butano (296) y el benceno (352) de la refinería rinden más por mB.
- **Aire:** colector de gas y centrífuga (N₂, O₂); aire líquido y torre como en HV (N₂, O₂, CO₂, He, Ar). El aire del Nether (`liquid_nether_air`, congelador EV: CO, H₂S, SO₂, He-3, Ne) es opcional: nada de EV lo pide.
- **Cloro, ácidos y H₂:** Cl₂ y H₂ de la salmuera y el agua; HCl, HNO₃ (paso 3) y H₂SO₄ del azufre de la planta de mineral y del H₂S de la refinería.
- **Cierra el círculo:** crudo, sal, aire, agua y azufre salen de perforadoras y colectores; scheelite y sulfuros, de vetas. Lo demás es EU.

### Criaturas

`gtceu:ev_creature_simulator` ya existe (LV a EV). EV añade dos filas a `mobs.json`: **esqueleto atrofiado** (tier 3, 480 EU/t, 15 s, 100 mB de biomasa; 4 huesos y 1 cráneo con 25 %) y **wither** (tier 4, 1 920 EU/t, 30 s, 400 mB; 1 estrella del Nether por ciclo; mineral: ceniza, `gtceu:ash_dust`, verificar; impresión con 3 cráneos y un juego de ítems que no choque con los demás). La regla de la tabla se cumple: 400 × 20 ÷ 600 = 13 mB/s ≤ 20 en EV. La estrella no se gasta hasta IV (estrella cuántica).

## Multibloques nuestros

### Planta de platino: `gtceu:platinum_plant` (el de la era)

Qué gana: **pasos en uno y lazos cerrados.** La línea de GTM son 13 recetas en cuatro tipos de máquina (mezclador, reactor químico, centrífuga, electrolizador), deja seis productos a medias que hay que guardar y volver a meter (uno, el RuO₄, tóxico) y suelta el cloro, el hidrógeno y el SO₃ al aire. La planta recibe PGS y ácidos y entrega los metales; el cloro, el azufre y lo tóxico dan la vuelta dentro.

- **Tipo de receta:** `gtceu:pgm_refining` (nuevo, verificar colisión de id), siete recetas escritas a mano (seis de ataque, una de separación) con las cifras y la energía de `PlatGroupMetalsRecipes`, sin descuento. El circuito elige el modo:
  1. **Ataque** (circuito 1): 1 mena purificada de sulfuro + 100 mB de HNO₃ → 2 PGS (4 con cooperita) y la disolución de Cu o Ni, que se electroliza dentro: 1 polvo + 1 000 mB de H₂SO₄ + 1 000 mB de O. Seis recetas, una por mena. Esa electrólisis no existe en GTM (la disolución no tiene consumidor): es nuestra.
  2. **Separación** (circuito 2), por 6 PGS: entran 400 mB de HNO₃, 600 de HCl, 500 de agua y 2/3 de carbono; salen 1 Pt, 0,6 Pd, 0,33 Rh y 0,33 Ru (por esperanza), 1 mezcla Ir/Os, 2 de residuo, 1,2 de NH₄Cl, 500 mB de O₂, 670 de CO₂ y 200 de H₂. Energía: ≈ 564 000 EU, la suma de las etapas (≈ 295 t a 1 920 EU/t). Dentro se cierran dos lazos: el Cl₂ del platino y el H₂ del inerte dan 800 de HCl (de los 1 400 que gasta la tanda) y el SO₃ del rodio, con agua, devuelve los 500 de H₂SO₄ gastados.
- **Condición propia:** electrodos de platino (`grindless:platinum_electrode`, platino sobre titanio) en el bus de entrada, ≈ 0,1 % por tanda (cifra a ajustar). El primer platino es el del End (HV); después la planta paga sus electrodos.
- **Estructura:** nave de 5×7×5 con carcasa inerte (`gtceu:inert_machine_casing`, PTFE: el agua regia no la ataca) ≥ 24, tubos de titanio (`gtceu:titanium_pipe_casing`), vidrio templado (`gtceu:tempered_glass`), bus de entrada (PGS, mena purificada, carbono, electrodos), bus de salida (metales, mezcla, residuo, NH₄Cl), 3 escotillas de entrada de fluidos (HNO₃, HCl, agua), 4 de salida (O₂, CO₂, H₂, H₂SO₄ del ataque) y 1–2 escotillas de energía EV. Admite escotillas ME (verificar).
- **Se fabrica con lo que sustituye:** casco EV + reactor químico EV + centrífuga EV + electrolizador EV + 2 bombas EV + 4 circuitos EV (`gtceu:ev_chemical_reactor`, `gtceu:ev_centrifuge`, `gtceu:ev_electrolyzer`).
- **Ritmo:** ≈ 4 Pt por minuto con una escotilla EV, sin paralelos. El platino no es de cantidad: es de química.
- **Por qué no es un cubo grande:** (1) ninguna máquina de GTM junta esas cuatro máquinas ni guarda las mezclas a medias; (2) no da paralelos ni descuento: la energía es la suma de las etapas; (3) pide tres líneas de fluido (nítrico, cloro, agua) y un destino para cada una de las siete salidas: si un bus o una escotilla se llena, se para.
- **Subproductos:** lo tóxico (Cl₂, SO₃, RuO₄) no sale de la planta. O₂ → aire. CO₂ → invernadero (sumidero útil). H₂ → amoníaco o refinería. H₂SO₄ del ataque → lazo del ácido sulfúrico. NH₄Cl → electrólisis (N, H, Cl), que vuelve al lazo. Residuo de lodo de platino: inerte, se vacía. Mezcla Ir/Os: se guarda; nada de EV pide iridio ni osmio, y su etapa (`rarest_metal_mixture_separation`, reactor grande con dos escotillas EV) se abre cuando IV la pida.
- **Recortable:** sin electrodos y sin el modo de ataque queda lo esencial (el de separación). Si el cloro no cierra, se quita y queda la cadena de GTM por máquinas.

### Escalones de familia

La perforadora EV (arriba) y el simulador EV, ya registrado. La torre, el reactor grande, el cracker y la cámara limpia de GTM se usan tal cual: son lo normal en EV. Hay un solo multibloque nuevo porque la regla de la casa lo deja ahí: en EV la dificultad crece en líneas que se cruzan (platino, cloro, tungsteno, nano) y en las escotillas ME, no en cubos.

### Descartadas

- **Planta de tungsteno o de titanio, fábrica de circuitos** (síntesis en una caja): la regla de la casa es *separaciones → planta nuestra; síntesis (Kroll, tungsteno, circuitos, polímeros) → línea de GTM*, como en la decisión 6 de HV.
- **Cubos grandes** (GCYM, `t_large_*`): GTM los trae en IV con la escotilla de paralelo; antes solo darían velocidad.
- **Matriz de procesado** (processing array): GTM 7.5.3 no la trae y sería paralelos puros.
- **Minero grande y de roca madre** (GTM): la perforadora con muestra ya hace ese trabajo.

## Líneas de proceso nuevas

| Línea | Pasos | Subproductos → destino |
|---|---|---|
| Platino | mena de sulfuro → macerador → lavadora → mena purificada → planta, ataque (+ 100 mB de HNO₃ → PGS) → planta, separación (+ agua regia → Pt, Pd, Rh, Ru) → EBF Kanthal y congelador para Pd, Rh y Ru | Disolución de Cu/Ni: electrólisis dentro (polvo + H₂SO₄ + O). Cl₂ y H₂: HCl dentro. SO₃: H₂SO₄ dentro. NH₄Cl: electrólisis. Residuo: se vacía. Mezcla Ir/Os: se guarda |
| Ácido nítrico y cloro | N₂ (centrífuga o torre) + H₂ → amoníaco (`ammonia_from_elements`) → reactor grande (`nitric_acid_from_ammonia`) → HNO₃; Cl₂ + H₂ → HCl; mezclador → agua regia | Agua: caldera o invernadero. NH₄Cl del platino: devuelve N y Cl |
| Tungsteno y aleaciones | scheelite + 2 000 de HCl → ácido túngstico (`tungstic_acid_from_scheelite`) → W (`tungstic_acid_electrolysis`) → EBF de nicromo 3 600 K y congelador. Acero de tungsteno (EBF 3 000 K, congelador), carburo (3 058 K) y RTM (Ru + W + Mo, 3 000 K, congelador) | CaCl₂: lechada de bauxita (`bauxite_slurry_from_*`, mezclador HV). H₂ y O₂ de la electrólisis: red. Tungstato (otra mena): LiCl (verificar destino) |
| Circuitos nano | boule de fósforo (`phosphorus_boule`, EBF 2 484 K) → oblea NOR → chips NOR. Oblea de CPU + 16 fibras de carbono (autoclave, epoxi) + glowstone → oblea nano (reactor químico EV, 1 200 t) → corte → procesador nano → ensamblaje nano → ordenador nano (tablero avanzado, 8 diodos SMD de GaAs y hilo fino de platino, 4 chips NOR, 16 RAM, soldadura ×2); todo en cámara limpia, con ensamblador de circuitos de 600 EU/t | Epoxi, ácido y persulfato: lazos de HV. El platino sale de la planta. Las piezas no dejan restos |
| Mezcla de metales | polvo de piedra → `stone_dust_separation` (MV) → mezcla → centrífuga EV (`metal_mixture_separation`, 900 EU/t, 1 000 t) → hematita, bauxita, pirolusita, baritina, cromita, ilmenita | Ilmenita: Kroll. Cromita: nicromo. Bauxita: aluminio. Pirolusita: manganeso. Hematita: hierro. Baritina: se guarda |
| Gasolina de alto octanaje (opcional) | octano (refinería, modo 2 con ligero) + ETBE (buteno + etanol) + N₂O → reactor grande EV (`high_octane_gasoline`, 50 t): 20 000 de gasolina + 2 000 de octano + 2 000 de N₂O + 1 000 de tolueno + 1 000 de ETBE → 32 000 mB (3 200 EU/mB) | Combustible de los generadores HV y de los motores de IV, el doble por mB que la gasolina; no hace falta antes. Gas sobrante: turbinas |

## Almacenamiento y logística

- **Escotillas ME (EV):** `me_input_bus`, `me_output_bus`, `me_input_hatch`, `me_output_hatch` piden lo configurado a la red y le devuelven la salida. Nuestros multibloques las aceptan por las mismas habilidades que los buses normales (`Pat.part('input_bus')` y compañía; verificar). Las de reserva, patrón y proxy son de LuV: fuera.
- **Super cofre y tanque EV:** campo generador MV (ojo de ender + hilo cuádruple de MgB₂). El boro sale del bórax, subproducto de la sal gema y del litio. Los cofres y tanques cuánticos son de IV.
- **AE2:** la base está entera desde LV y no cambia. Los addons, en *Mods e integración*.
- **Dos escotillas EV = IV.** Un multibloque con dos escotillas del mismo escalón corre recetas de un tier más (8 192 EU/t): el reactor grande ya puede hacer una oblea de IV.

## Puerta a IV

| Qué se construye | Qué prueba |
|---|---|
| Casco IV (`gtceu:iv_machine_hull`: carcasa IV de 8 placas de acero de tungsteno, 2 cables de platino, PTFE) | tungsteno y platino en lote, y el PTFE de HV |
| 8 ordenadores nano (`gtceu:nano_processor_computer`) hechos en cámara limpia | la línea nano entera: fósforo, fibra de carbono, diodos de platino y oblea nano |
| Motor IV (varillas de acero de tungsteno, imán de neodimio, cable doble de tungsteno, hilo doble de grafeno) y bomba IV (tubo de acero de tungsteno, anillos de SBR, motor IV) | grafeno, neodimio y SBR sostenidos; la goma sola ya no vale |
| EBF de nicromo sacando tungsteno y acero de tungsteno, y una bobina RTM | el tungsteno de la scheelite y el rutenio de la planta |
| Planta de platino formada y corriendo, con la mezcla Ir/Os guardada | la química fina: agua regia, cloro cerrado, cuatro metales |
| Central EV de 32 768 EU/t o más (turbinas grandes de gas), 2 búferes y transformador EV→IV (4 A → 1 A) | "sin ir justo": IV cabe con el búfer sobre el 50 % |
| Reactor grande con dos escotillas EV haciendo una oblea HPIC (`hpic_wafer`, 7 680 EU/t, cámara limpia) | IV ya se alimenta; cortar la oblea es de IV |
| Red AE2 con CPU de 256k que fabrica el motor IV con patrones, con una escotilla ME en la planta o el reactor | el multibloque como forma normal de producir |
| Perforadora EV, simulador del wither, perforadora de fluidos HV y planta de platino 10 minutos sin tocarlos | la generación se sostiene sola |

Abre IV: casco y escotillas IV (HPIC: la oblea sale en EV, el corte pide una cortadora IV), motor, bomba, pistón, brazo y cinta IV, perforadora de fluidos EV (casco IV, ×64), escotilla de paralelo IV y los multibloques GCYM, las vetas radiactivas del End y el radón, la estrella cuántica y el campo generador (la estrella del wither ya está), sensores y emisores IV (iridio: etapa Ir/Os del reactor grande), la línea de ensamblaje, el motor de combustión grande (circuitos IV), los procesadores cuánticos, `deafission` y el primer cohete.

## Mods e integración

| Mod | Slug | Uso en EV |
|---|---|---|
| Expanded AE | `expanded-ae` | lote 2: coprocesadores medianos con circuitos EV y titanio; los de 1M, a IV (verificar ids y recetas) |
| ExtendedAE | `extended-ae` | sigue a revisar: solapa con el anterior |
| GTM Advanced Hatch, Modern AE2 Additions | `gtm-advanced-hatch`, `modern-ae2-additions` | a revisar: que no dupliquen las escotillas ME de GTM |
| GT Community Additions | `gt-community-additions` | ya instalado: revisar PCB Factory, Nano Forge, Mega Oil Cracker, Mega Chemical Reactor y Polymerizer (tier sin comprobar) |
| GTM Extended Features | `gtm-extended-features` | ya instalado: quitar `platinum_processing_line` (Synthesis Vessel, IV) y `end_stone_processing` (Rock Processing Plant, EV) |
| GCYR | `gcyr` | el primer cohete se propone en IV |
| DeaFission | `deafission` | IV (combustible de uranio y torio) |
| MEGA Cells | `mega` | IV (manda lv.md) |
| Create, Greate, Productive Bees | `create`, `greate`, `productivebees` | sin cambios; las abejas solo dan materiales por máquinas de GT (regla de MV) |

Ningún mod nuevo es obligatorio: máquinas, tipos de receta, electrodos y modelos son KubeJS.

- **Startup:** tipo `gtceu:pgm_refining`; máquinas `platinum_plant` y `ev_vein_drill` con el helper de patrones; `bores` en 64 para EV; ítems `grindless:tungsten_steel_drill_bit`, `grindless:platinum_electrode` y los modelos `grindless:creature_model_wither_skeleton` y `grindless:creature_model_wither`. El `widen` de la planta: 3 fluidos de entrada, 4 de salida, 3 ítems de entrada y 7 de salida.
- **Server:** las 7 recetas de `pgm_refining` a mano, en una tabla, con las cifras de `PlatGroupMetalsRecipes`; la broca de tungsteno en `BITS` de `lv/vein_drilling.js`; dos filas en `mobs.json`; `integration/extendedfeatures.js` quita `platinum_processing_line` y `end_stone_processing`; puertas de `expanded-ae` con circuitos EV; la misión de la puerta pide el ordenador nano, no la etiqueta `#gtceu:circuits/iv`.
- **Config:** nada nuevo. Comprobar que GTM Extended Features carga en servidor (Modrinth la marca solo cliente, verificar).
- **Misiones:** capítulo "Fábrica EV" con unas 16, una por paso y por multibloque, premio pequeño y sin bloquear recetas.
- **Pruebas:** (1) arranca; (2) la planta de platino y la perforadora EV se forman y procesan; (3) mena purificada → PGS → Pt, Pd, Rh, Ru; scheelite → W → EBF; boule → ordenador nano; y `-Tier ev` sin huérfanas.

## Riesgos y dudas

- **Solapes con addons.** La Synthesis Vessel de GTM Extended Features trae `platinum_processing_line` a 7 680 EU/t: por cada 6 PGS da 2 Pt, 1,5 Pd, 1 Ru, 1,5 Rh, 1 Os y 1 Ir (GTM: 1 Pt, 0,6 Pd, 0,33 Ru, 0,33 Rh) y devuelve ácido. La Rock Processing Plant (EV) da tungstato y platino de piedra del End. De GTCA quedan PCB Factory, Nano Forge, Mega Oil Cracker, Mega Chemical Reactor y Polymerizer, que pueden saltar circuitos y química (tier sin comprobar). Hay que quitarlas o retocarlas antes de las pruebas.
- **La planta de platino.** Siete recetas nuestras con esperanzas que son fracciones de la cadena de GTM. El HCl cierra el 57 % por dentro (800 de 1 400 mB por tanda) y el rutenio es lo corto: una bobina RTM son ≈ 4,6 Ru, unos 80 PGS. Si el balance no cierra, se sube el rendimiento (nunca el tiempo) o se quita la planta.
- **La pared es la línea nano.** Boule de fósforo (EBF, 12 000 t), fibra de carbono, 4 chips NOR y 8 diodos por ordenador, y cámara limpia con máquinas de 600 EU/t. El IV de GTM también sale de la línea de procesador (`mainframe_iv`, solo HV y sin platino): la misión nombra el nano, pero las máquinas aceptan cualquier circuito IV. Si 8 son demasiados, la puerta baja a 4.
- **El End y la scheelite.** El tungsteno solo sale de la veta del End: si la llave o la muestra fallan, EV se para en el paso 6. Plan B: la misma veta en una dimensión propia, como el Vacío y el Llano.
- **Radiactivos y cuánticos.** Los procesadores cuánticos, el campo generador EV y la estrella cuántica piden radón (uranio o plutonio del End radiactivo, o aire de ender de IV): pasan a IV y corrigen "Abre EV" de hv.md. El motor de combustión grande pide circuitos IV, no EV.

Créditos a anotar en `CREDITS.md`: planta de platino (idea de la línea de platino de GTNH, solo la idea; recetas y cifras de GTM, LGPL-3.0); escotillas ME (GTM, LGPL-3.0); electrodos como condición (misma idea que los catalizadores de HV); planta de titanio o de tungsteno, fábrica de circuitos (GTCA), cubos grandes y matriz de procesado quedan como alternativas descartadas.

## Decisiones propuestas

1. **Regla de la casa:** separaciones → planta nuestra; síntesis (Kroll, tungsteno, circuitos, polímeros) → línea de GTM. La planta de platino es la única de EV.
2. **Un multibloque nuevo: la planta de platino** (`gtceu:pgm_refining`, dos modos por circuito, electrodos de platino; recortable). Escalón de familia: perforadora EV (tope 64, broca de acero de tungsteno); sin invernadero EV y sin vetas nuevas.
3. **Ir/Os y todo lo radiactivo pasan a IV:** la mezcla Ir/Os se guarda; uranio, plutonio, radón, estrella cuántica, campo generador EV/IV, procesadores cuánticos y `deafission` esperan. Corrige "Abre EV" de hv.md.
4. **Wither en EV** (modelo + esqueleto atrofiado en HV); la estrella se guarda para IV.
5. **Ningún GCYM antes de IV:** necesitan la escotilla de paralelo y sin ella solo son velocidad. En EV lo normal son los multibloques de GTM y los nuestros, con escotillas ME.
6. **Energía EV:** turbinas grandes de gas con gas de refinería (8 × 4 096 EU/t). El motor de combustión grande pide circuitos IV (corrige hv.md) y la gasolina de alto octanaje es opcional.
7. **Puerta = 8 ordenadores nano:** la misión nombra el ítem, aunque las máquinas de IV acepten cualquier circuito IV.
8. **Addons:** quitar `platinum_processing_line` y `end_stone_processing`; revisar PCB Factory, Nano Forge, Mega Oil Cracker, Mega Chemical Reactor y Polymerizer.
9. **Almacenamiento:** escotillas ME y super cofre y tanque EV; `expanded-ae` medianos, `extended-ae` a revisar, MEGA y `deafission` en IV; el primer cohete de `gcyr`, en IV.
10. **Mezcla de metales:** se separa en EV (centrífuga de 900 EU/t): es el destino del ripio de MV.

## Decisiones tomadas (orquestador, 2026-10-24)

Se aprueban las diez propuestas, con dos precisiones:

- **Addons:** la limpieza de la propuesta 8 se hace ya, no en EV. El agente de lotes de mods revisa todos los addons de GT. Ningún mod puede procesar más barato que GT en su era ni rebajar nuestros multibloques.
- **Planta de platino:** es la pieza estrella de EV. Si se recorta, el platline de GTM queda tal cual, sin atajos de addons.

- **Más multibloques (actualización tras IV):** la propuesta 1 se relaja. EV tendrá 2–3 multibloques nuestros nuevos (ver `docs/eras/iv.md` y `docs/eras/ampliacion.md`). La planta de platino lee las recetas cargadas en la partida, porque GT-- cambia el platline de GTM por uno al estilo GTNH; las cifras de arriba basadas en `PlatGroupMetalsRecipes` quedan como referencia.