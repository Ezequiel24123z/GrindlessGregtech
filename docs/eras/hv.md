# Era HV

Aquí el pack se convierte en un pack de GregTech de verdad: el crudo se refina, se craquea y acaba en plásticos; el titanio sale de una cadena de cloro y magnesio; y los circuitos de EV piden cámara limpia. Los multibloques son proyectos: se planifican antes de colocarse. Salir de HV duele por la línea, no por picar: el End se pisa una sola vez, para traer dos menas de cada veta. Un multibloque nuestro, la refinería, hace en una pasada lo que GTM reparte entre cuatro pasadas de alambique, cuatro reactores de desulfuración y un cracker. HV junta cuatro multibloques nuestros y ocho de GTM que hay que coordinar.

Se entra con lo que deja MV: casco HV (`gtceu:hv_machine_hull`) y escotilla de energía HV, 8 circuitos integrados avanzados (`gtceu:advanced_integrated_circuit`), una central MV de 2 048 EU/t con transformador a HV, la planta de mineral, un EBF Kanthal corriendo y una red AE2 con CPU de 64k.

## Ruta

1. **Red HV.** Transformador MV→HV (4 A → 1 A), búferes y escotillas HV. La central crece con caldera grande de acero y turbina grande de vapor (circuitos HV) y, cuando llega la gasolina (paso 4), con generadores HV hasta los 8 192 EU/t de la puerta.
2. **Máquinas HV y ojo de ender.** Emisor y sensor HV piden ojo de ender (la receta vanilla se quita por KubeJS): carbono + azufre → polvo de blaze (reactor químico, `blaze_powder`, 480 EU/t) → extractor (144 mB de blaze líquido, reciclaje de GTM, verificar el id) → baño químico HV con la perla del simulador (`eye_of_ender`, 480 EU/t). La sierra del cortador HV pide acero rojo (paso 7).
3. **Aceite y refinería.** Perforadora de fluidos MV → refinería (nuestra) → combustibles sin azufre, gas de refinería, nafta y H₂S. El reformador (nuestro) convierte nafta en aromáticos y devuelve H₂ a la refinería. El gas va a la destilería (metano) y, hasta que haya gasolina, el diésel mueve la central.
4. **Craqueo, plásticos y gasolina.** Nafta + vapor en el cracker de GTM (`gtceu:cracker`) o en la refinería → etileno, propeno, butadieno y benceno. PTFE (cloroformo + HF), epoxi (glicerol de MV, benceno y propeno) y SBR. Con PTFE se forma el reactor químico grande (`gtceu:large_chemical_reactor`): nafta + gas de refinería + metanol + acetona (de MV) → gasolina cruda, y con tolueno → gasolina (1 600 EU/mB, cinco veces la nafta).
5. **Cámara limpia y circuitos EV.** `gtceu:cleanroom` (casco HV, circuito HV, 3 filtros, 2 rotores de inox, 2 motores HV), paredes de plascreto (`gtceu:plascrete`, placas de PE) y techo de filtros. Cadena: CPU (oblea de MV) → microprocesador → ensamblaje (2 micros, 4 inductores, 8 condensadores, 4 RAM) → estación de trabajo dentro de la cámara (2 ensamblajes, 4 diodos, 4 RAM, hilo de electrum y 16 pernos de aleación azul). Es la pared: congelador y torre piden circuitos EV.
6. **Congelador de vacío y titanio.** `gtceu:vacuum_freezer` (2 circuitos EV) enfría los lingotes calientes de titanio y hace aire líquido. Kroll: ilmenita (End) o rutilo de la bauxita de MV → TiCl₄ → EBF Kanthal con magnesio → lingote caliente → congelador. El MgCl₂ vuelve a magnesio con sodio (lazo Mg/Cl₂).
7. **Aleaciones serias.** Acero negro (níquel + bronce negro + 3 de acero; EBF 1 758 K, baño) → acero rojo (oro rosa + latón + 2 de acero + 4 de acero negro; EBF Kanthal 1 813 K, 480 EU/t, baño): oro, plata, cobre, cinc y níquel de la planta de mineral. Nicromo (4 níquel + 1 cromo; EBF 2 700 K, 1 920 EU/t con dos escotillas HV, congelador) para la bobina de EV.
8. **El End.** Ojo de ender → llave → un viaje por 2 menas de cada veta → muestra → perforadora HV: ilmenita, tungsteno (EV), platino (catalizador del reformador) y paladio.
9. **Almacenamiento serio.** Celdas y CPU de 256k, barriles de inox y titanio, super cofres y tanques de GT (ver *Almacenamiento*).
10. **Salida.** Ver *Puerta a EV*.

## Herencia de MV

- **El End y el viaje.** Dueño: la perforadora HV (`veins_end.json`) y la llave del End. Un viaje, dos menas por veta (decisión 4 de LV).
- **Ojo de ender.** Dueño: el paso 2. El blaze sale de carbono y azufre; las varas del simulador de HV son la otra vía (a polvo en el macerador).
- **Mezcla de metales.** Dueño: EV (centrífuga, 900 EU/t). En HV sigue guardada o no se separa (el polvo de piedra va al lodo). No hay receta nueva.
- **Glicerol.** Dos destinos: epiclorhidrina (`epichlorohydrin_from_glycerol`, epoxi) y etileno (`ethylene_from_glycerol`: 1 000 mB de glicerol + 1 000 de CO₂ → 2 000 de etileno + 5 000 de O₂, 200 EU/t), que da uso al CO₂ inerte del horno de arco.
- **Metanol y acetona.** Dueño: la gasolina cruda (reactor grande, paso 4). El metanol sale del CO del silicio y la acetona de la biorrefinería; en MV solo tenían destinos pequeños (biodiésel, cola).

## Generación automática de recursos

Mismo patrón que LV y MV: un catalizador que no se gasta y entradas de otra línea. Lo que HV necesita sale de MV, salvo el End.

### Perforadora de vetas HV (el End)

- **Registro:** `gtceu:hv_vein_drill`, tipo `gtceu:vein_drilling`, la spec y la tabla de LV y MV (`lv/multis.js`, `lv/vein_drilling.js`) más la tabla nueva `veins_end.json`.
- **Decisión: cuatro vetas del End, no seis.** `bauxite_vein_end` (bauxita, ilmenita, aluminio), `magnetite_vein_end` (magnetita, vanadio, cromita, oro), `scheelite_vein` (scheelita, tungstato, litio) y `sheldonite_vein` (bornita, cooperita, platino, paladio). `naquadah_vein` y `pitchblende_vein_end` son radiactivas y nadie las pide antes de IV.
- **Muestra y viaje:** la muestra se hace con 2 menas de la veta, así que basta un viaje. Llave del End (`grindless:end_key`, receta con un ojo de ender; mismo ayudante que las del Vacío y el Llano) lleva a `minecraft:the_end` y devuelve al punto de origen. No hay que matar al dragón. Las rocas indicadoras de GTM y el prospector HV (`gtceu:prospector.hv`, verificar alcance) marcan dónde mirar.
- **Gana al MV:** tope 32 en `bores` (una escotilla HV, 512 V ÷ 8, llena las 32 corridas: ×12 sobre el vapor; abierto a balance) y broca de titanio (`grindless:titanium_drill_bit`, ~0,5 % por ciclo; ~0,25 % con lodo) hecha con el titanio de Kroll. Hasta entonces sirve la vanádica.
- **Cierra el círculo:** muestra y agua, sin más viajes. Da ilmenita (titanio), tungsteno y platino (EV).

### Aceite, gas y aire

- **Aceite:** sigue `gtceu:mv_fluid_drilling_rig` (`oil`, `raw_oil`, `light_oil`, `heavy_oil`, `natural_gas`; 100–300 mB/s por yacimiento). La de HV (`gtceu:hv_fluid_drilling_rig`, ×16) pide casco EV y es de EV; una MV ya alimenta a dos refinerías. El gas natural se desulfura a gas de refinería (`desulfurize_natural_gas`).
- **Aire:** colector de gas y centrífuga (N₂, O₂) como en MV. El aire líquido (`liquid_air`, congelador, 480 EU/t) y los gases nobles son de la puerta; el helio también sale del gas de refinería (`distill_refinery_gas`).
- **Craqueo:** la materia sale de la refinería (nafta, ligero, pesado y gas); el vapor, de la caldera con agua de la bomba; el H₂, de la electrólisis o del reformador.
- **H₂, Cl₂ y flúor:** H₂ y Cl₂ de la electrólisis de agua y salmuera. Flúor de topacio y topacio azul (veta del Nether), lepidolita (sales) o bastnasita (monacita) → HF con H₂ (`hydrofluoric_acid_from_elements`). Magnesio de la magnesita (veta de olivino) y sodio de la sal.
- **Cierra el círculo:** crudo, sal, topacio, magnesita y metales salen de perforadoras; lo demás es EU.

### Invernadero HV

- `gtceu:hv_greenhouse`, tipo `gtceu:greenhouse`, la misma spec con `bores` en 32. **Decisión: solo el escalón.** HV no pide más madera ni cultivos que MV: el carbono nuevo sale del petróleo. Sigue dando goma natural, aceite de semilla (biodiésel → glicerol) y el sumidero útil del CO₂.

### Criaturas

- `gtceu:hv_creature_simulator` ya existe (LV a EV) y `mobs.json` trae el blaze en HV (480 EU/t, 2 varas por 1 polvo de carbón). HV no pide modelos nuevos: el wither (estrella del Nether) se decide en EV.

## Multibloques nuestros

### Refinería: `gtceu:refinery` (el de la era)

Qué gana: **pasos en uno y rendimiento.** El alambique saca una fracción por pasada y las otras tres no llegan a producirse: tener las cuatro cuesta ×4 de crudo. La torre de GTM pide circuitos EV; con circuitos HV solo hay alambique. La refinería hace crudo + H₂ → cuatro fracciones sin azufre en una pasada, y craquea y separa lo que sale.

- **Tipo de receta:** `gtceu:refining` (nuevo, verificar colisión de id), generado de las recetas de GTM con sus proporciones y la energía de la suma de etapas, sin descuento. El circuito elige el modo:
  1. **Refino** (circuito 1): 50 mB de crudo (`distill_oil`; `raw_oil`, `light_oil` y `heavy_oil` con sus cifras) + ≈ 23 mB de H₂ → 15 pesado, 50 ligero, 20 nafta y 60 gas, sin azufre, + ≈ 11 mB de H₂S. 20 t a ≈ 100 EU/t (torre 96 más desulfuración).
  2. **Craqueo con H₂** (circuito 2): nafta, ligero, pesado o gas de refinería + H₂ → gases ya separados (butano, propano, etano, metano; `lightly_hydro_crack_*` + `distill_*cracked*`). El craqueo del gas de refinería devuelve parte del H₂.
  3. **Craqueo con vapor** (circuito 3): lo mismo con vapor (`lightly_steam_crack_*`, 240 EU/t): por 1 000 mB de nafta, 200 de etileno, 200 de propeno, 150 de butadieno, 150 de benceno y 40 de tolueno, más pesado, ligero, buteno y metano.
- **Estructura:** base reactora de 7×7×3 y columna de 3×3 de 6 a 12 capas: carcasa `gtceu:clean_machine_casing`, tubos `gtceu:steel_pipe_casing`, una escotilla de salida de fluidos por capa (hasta 8), 2 de entrada (crudo y H₂ o vapor), bus de entrada (catalizador), bus de salida (carbono) y 1–2 escotillas de energía HV. Usa la clase de la torre de GTM (verificar desde KubeJS); si no, salidas libres.
- **Condición propia:** catalizador (`grindless:hydrotreating_catalyst`: cobalto, molibdeno y sílice de la electrólisis de arena) en el bus de entrada, ≈ 0,05 % por pasada (cifra a ajustar). Cobalto de la veta de níquel del Overworld, molibdeno de la del Nether: cruza tres líneas de mineral.
- **Se fabrica con lo que sustituye:** casco HV + alambique HV + 2 reactores químicos HV (`gtceu:hv_distillery`, `gtceu:hv_chemical_reactor`) + 2 bombas HV + 4 circuitos HV.
- **Ritmo:** la sobrecarga normal de GT da ≈ 100 mB/s con una escotilla HV y ≈ 200 con dos; sin paralelos. Una perforadora MV alimenta a dos refinerías.
- **Por qué no es un cubo grande:** (1) su tipo de receta cruza tres máquinas de GTM y tiene más salidas de fluido que ninguna; (2) no da paralelos ni descuento: gana pasos y crudo (×4 sobre el alambique), no energía por mB; (3) pide H₂, catalizador y un destino para cada fracción: si una escotilla se llena, se para.
- **Subproductos:** H₂S → ácido sulfúrico (`sulfuric_acid_from_sulfide`) o azufre. Gas de refinería → destilería (metano para el PTFE, etano, propano, butano, helio) o turbina (160 EU/mB). Ligero y pesado → diésel o craqueo; nafta → reformador, craqueo, gasolina cruda o, si sobra, generador (320 EU/mB). Carbono (1/9 por tanda) → blaze, acero. Butadieno (204 EU/mB) y butano sobrantes → turbina.

### Reformador catalítico: `gtceu:reformer` (segundo, recortable)

Qué gana: **H₂ y aromáticos.** GTM no reforma: el benceno sale del craqueo con vapor (150 por 1 000 de nafta craqueada) y el H₂ sale sobre todo de la electrólisis. El reformador convierte la nafta en benceno, tolueno y H₂, y le devuelve a la refinería el H₂ que gasta. Le da al platino del End un uso en HV.

- **Tipo de receta:** `gtceu:reforming` (nuevo, verificar colisión de id), 2–3 recetas escritas a mano. Orientativo, a fijar con el balance de H₂: 1 000 mB de nafta → ≈ 300 de benceno + ≈ 150 de tolueno + ≈ 1 200 de H₂, 80 t a 240 EU/t. Con esas cifras, toda la nafta de un crudo medio (`oil`) reformada devuelve ≈ 105 % del H₂ que gastó el refino; el crudo pesado (`heavy_oil`) deja a deber y pide H₂ de la electrólisis. Elegir yacimiento y repartir la nafta (reformador, gasolina, craqueo) son decisiones.
- **Condición propia:** catalizador de platino (`grindless:reforming_catalyst`: platino del End sobre sílice) en el bus de entrada, ≈ 0,05 % por pasada.
- **Estructura:** 5×5×6, carcasa `gtceu:clean_machine_casing`, una escotilla de entrada (nafta), tres de salida (benceno, tolueno, H₂), bus de catalizador y una escotilla de energía HV. Casco HV + reactor químico HV + 2 bombas HV + 4 circuitos HV.
- **Por qué no es un cubo grande:** su receta no existe en ninguna máquina de GTM, no da paralelos ni descuento y obliga a enrutar: la nafta sale de la refinería y el H₂ vuelve a ella. Sin platino no corre.
- **Subproductos:** H₂ → refinería o metanol (`methanol_from_dioxide`); lo que sobre se vacía (en GTM el H₂ no es peligroso). Benceno → estireno, cumeno o turbina (352 EU/mB). Tolueno → gasolina (1 000 por 10 000 de gasolina cruda) o generador (320 EU/mB).
- **Recortable:** si el H₂ no cierra o el platino falla, se quita y la refinería sigue con H₂ de la electrólisis.

### Escalones de familia

La perforadora y el invernadero HV (arriba). La torre de GTM no se sustituye: queda para aire líquido y química general en EV.

### Descartadas

- **Planta de titanio nuestra (Kroll en una caja):** borra la línea que da identidad a HV. Se queda la cadena de GTM entera.
- **Sistema de presión y vacío** (GCYS, MIT): pide Java (escotillas de presión, compresor axial). El vacío es el congelador de GTM.
- **Cubos grandes y fundición de aleaciones** (GCYM, `t_large_*`): solo velocidad; GTM trae los GCYM en IV.
- **Minero grande y de roca madre** (GTM): la perforadora con muestra ya hace ese trabajo.

## Líneas de proceso nuevas

| Línea | Pasos | Subproductos → destino |
|---|---|---|
| Crudo → combustibles | yacimiento → refinería (modo 1) → ligero + pesado → mezclador → diésel (480 EU/mB). Gasolina: 16 000 de nafta + 2 000 de gas de refinería + 1 000 de metanol + 1 000 de acetona → 20 000 de gasolina cruda (reactor grande, `raw_gasoline`, 480 EU/t) + 1 000 de tolueno por 10 000 → gasolina (`gasoline`, 1 600 EU/mB) | H₂S: ácido o azufre. Gas de refinería: destilería o turbina. Pesado sobrante: craqueo (modo 2). El metanol y la acetona de MV encuentran aquí su destino grande |
| Craqueo → olefinas y aromáticos | nafta (o ligero, pesado, gas) + vapor → refinería (modo 3) o cracker → etileno (PE, PVC), propeno, butadieno, benceno, tolueno. Nafta → reformador → benceno, tolueno y H₂ | Carbono: blaze y acero. Etano, propano y metano: turbina o craqueo moderado en el cracker. El H₂ del reformador vuelve a la refinería |
| PTFE | metano + 6 000 de Cl₂ → cloroformo (`chloroform`, 3 000 de HCl); + 4 HF → TFE (`tetrafluoroethylene_from_chloroform`, 240 EU/t, 6 HCl) → PTFE (`ptfe_from_oxygen`) | HCl: cloruro de vinilo (PVC), epiclorhidrina y ácido. PTFE: casco inerte (`gtceu:inert_machine_casing`) y tubos del reactor grande |
| Epoxi y SBR | glicerol + HCl → epiclorhidrina; benceno + propeno + ácido fosfórico → cumeno (`cumene_from_benzene`) → fenol + acetona → bisfenol A → + epiclorhidrina + 3 NaOH → epoxi. Estireno (etileno + benceno) + butadieno + O₂ → SBR crudo (240 EU/t) → + azufre → goma | Agua salada del epoxi: electrólisis (Cl₂ y Na). Acetona: cola. SBR: sustituye a la goma en bombas y cintas EV y es obligatoria desde IV (anillos de silicona o SBR) |
| Titanio | ilmenita → rutilo (`rutile_from_ilmenite`, EBF 1 700 K, 480 EU/t) o rutilo de MV → `titanium_tetrachloride` (2 C + rutilo + 4 000 de Cl₂, 400 t) → `titanium_from_tetrachloride` (EBF 2 141 K, 480 EU/t, 800 t; + 2 Mg) → lingote caliente → congelador | CO (2 000 mB por TiCl₄): metanol o tanque (tóxico, se contiene). CO₂ del rutilo: inerte. Hierro forjado: acero. MgCl₂: `salt_from_magnesium_chloride` (3 MgCl₂ + 2 Na → Mg + 4 sal), la sal vuelve a la electrólisis |
| Circuitos EV | boule → obleas → CPU; condensadores, inductores, diodos y RAM → ensamblaje → estación de trabajo en cámara limpia (`gtceu:micro_processor_computer`, soldadura ×2); aleación azul = 4 electrotina (redstone + electrum, o veta de salitre) + 1 plata | Ácido y persulfato de los tableros: lazos de MV. Las piezas no dejan restos |

## Almacenamiento serio

- **AE2:** HV sube la capacidad, no la mecánica: celda y CPU de 256k con circuito HV y placa de inox (unas 2 recetas reescritas). AE2 sigue híbrido (decisión 1 de LV).
- **Coprocesadores:** `expanded-ae` (lote 2) trae de ×2 a 1M; en HV solo los pequeños, con circuitos MV y HV; los grandes esperan a EV–IV (verificar ids y recetas).
- **GT:** barriles de inox y titanio (`gtceu:stainless_steel_drum`, `gtceu:titanium_drum`), `gtceu:hv_super_chest` y `gtceu:hv_super_tank` (LV a EV en GTM; verificar capacidad) y búferes.
- **Escotillas ME de GTM: EV** (`me_input_bus` y similares). En HV las máquinas se alimentan con buses de exportación de AE2, interfaces y LaserIO o Pipez: la logística no es la pared.
- **Fuera:** AdvancedAE (reemplaza piezas de AE2 y junta la química en una caja) y MEGA Cells (IV).

## Puerta a EV

| Qué se construye | Qué prueba |
|---|---|
| Casco EV (`gtceu:ev_machine_hull`: carcasa EV de 8 placas de titanio, 2 cables de aluminio, PE) y escotilla de energía EV | el titanio de Kroll con su lazo Mg/Cl₂ y el aluminio, en lote |
| 8 circuitos EV (`gtceu:micro_processor_computer`, `#gtceu:circuits/ev`) hechos en cámara limpia | boule → CPU → ensamblaje → estación; aleación azul y plata sostenidas |
| Motor EV (varillas de titanio, imán de neodimio, cable doble de aluminio, hilo doble de Kanthal) y bomba EV (tubo de titanio, rotor de inox, anillos de goma) | neodimio de la veta de monacita (Nether), titanio, Kanthal y goma sostenidos |
| Congelador de vacío y torre de destilación (`gtceu:distillation_tower`: 4 circuitos EV) con aire líquido corriendo | el aire se separa y la torre de GTM hace lo que la refinería no hace |
| Reactor químico grande formado, con PTFE, epoxi y gasolina en lote | la línea de flúor, el glicerol, el metanol y la acetona de MV y el cracker cierran |
| Central HV de 8 192 EU/t o más (gasolina, calderas y turbinas grandes), 2 búferes y transformador HV→EV (4 A → 1 A) | "sin ir justo": EV cabe con el búfer sobre el 50 % |
| Red AE2 con una CPU de 256k que fabrica el motor EV con patrones | AE2 sigue siendo la logística |
| Perforadora HV con una veta del End, invernadero, simulador, perforadora de fluidos, refinería y reformador 10 minutos sin tocarlos | la generación se sostiene sola |

Abre EV: casco y escotillas EV (4 A y 16 A), perforadora de fluidos HV (casco EV, ×16), escotillas ME de GTM, turbina grande de gas y motor de combustión grande, gasolina de alto octanaje (reactor grande EV: gasolina + octano + óxido nitroso + tolueno + ETBE), acero de tungsteno (tungsteno del End; bobina de nicromo), circuitos nano y cuánticos (platino del End) y el campo generador EV (estrella del Nether).

## Mods e integración

| Mod | Slug | Uso en HV |
|---|---|---|
| Expanded AE | `expanded-ae` | ya en el lote 2: proveedor de 72 ranuras y coprocesadores; HV gatea los grandes con circuitos HV e inox (verificar recetas) |
| ExtendedAE | `extended-ae` | a revisar: solapa con el anterior; si entra, solo bus de E/S ×8, conector inalámbrico y modificador de patrones con circuitos HV; sin celdas infinitas, cristal instantáneo ni inscriptor extendido |
| AdvancedAE | `advancedae` | se propone descartarlo (lv.md lo lista para HV–EV) |
| GTM Advanced Hatch, Modern AE2 Additions | `gtm-advanced-hatch`, `modern-ae2-additions` | a revisar: HV o más; que no duplique las escotillas ME de GTM |
| MEGA Cells | `mega` | IV (manda lv.md) |
| GCYR | `gcyr` | no se abre en HV; el primer cohete se decide en EV |
| Sophisticated Backpacks y Storage, Storage Drawers de GT | `sophisticated-backpacks`, `sophisticated-storage`, `gregtech-storage-drawers` | nivel 3 con inox y titanio |
| Create y Greate | `create`, `greate` | sin cambios |

Ningún mod nuevo es obligatorio: máquinas, tipos de receta, llave y catalizadores son KubeJS.

- **Startup:** tipos `gtceu:refining` y `gtceu:reforming`; máquinas `refinery`, `reformer`, `hv_vein_drill` y `hv_greenhouse` con el helper de patrones; `bores` en 32 para HV; ítems `grindless:titanium_drill_bit`, `grindless:hydrotreating_catalyst`, `grindless:reforming_catalyst` y `grindless:end_key`. El `widen` de la refinería: 2 fluidos de entrada, 8 de salida, 1 ítem de entrada y 1 de salida.
- **Server:** generar `refining` desde `distillation_tower` (crudo) y `cracker` + torre (craqueo); las 2–3 recetas de `reforming` a mano en una tabla; `veins_end.json` y la broca de titanio en `lv/vein_drilling.js`; la llave en `dimensions.js`; quitar la receta vanilla `minecraft:ender_eye` (en GTM solo la quita `recipes.hardMiscRecipes`, que se llevaría también el horno y la mesa de crafteo); recetas de 256k de AE2; puertas de los mods de la tabla con circuitos HV.
- **Config:** `config/gtceu.yaml` ya trae FE y vetas infinitas de fluido; falta decidir `machines.enableMaintenance` (riesgo 5) y comprobar `recipes.enableExtractorRecycling` (activo por defecto): de él sale el blaze líquido.
- **Misiones:** capítulo "Fábrica HV" con unas 14, una por paso y por multibloque, premio pequeño y sin bloquear recetas.
- **Pruebas:** (1) arranca; (2) refinería, reformador, perforadora HV e invernadero HV se forman y procesan; (3) crudo → refinería → nafta → gasolina; nafta → cracker → etileno → PE; boule → estación de trabajo; rutilo → titanio, y `-Tier hv` sin huérfanas.

## Riesgos y dudas

- **Refinería y reformador.** Unas 13 recetas generadas (4 crudos, 8 de craqueo, gas natural) y 2–3 del reformador con cifras que son nuestras y no de GTM. La clase de la torre reusada desde KubeJS está sin comprobar (si falla, salidas libres, sin capas). Cambia una frase de mv.md: allí el crudo era de la torre de GTM; aquí la torre queda para aire líquido y química general.
- **El End.** Un viaje con el dragón vivo; hay que comprobar que la llave sirve para una dimensión vanilla. Plan B: dimensión propia con las vetas, por datapack como el Vacío y el Llano.
- **La pared es la línea de circuitos EV.** Cámara limpia, 16 pernos de aleación azul por estación (electrotina, plata, redstone profunda), condensadores, inductores y diodos. Si 8 estaciones son demasiadas, la puerta baja a 4 tras una pasada de balance.
- **H₂, Cl₂ y CO.** La refinería gasta ≈ 0,46 mB de H₂ por mB de crudo medio; el Kroll, 4 000 mB de Cl₂ por lingote y deja 2 000 de CO; el PTFE, 6 000 de Cl₂ por cloroformo. El H₂ sale de la electrólisis y, con crudo medio, casi cierra solo con el reformador; con crudo pesado no. Si el balance falla se corta el reformador y el H₂ es de la electrólisis.
- **Mantenimiento y peligros.** GTM pide escotilla de mantenimiento por defecto en cámara limpia, cracker, torre y EBF, y nuestros multibloques no la llevan. Los peligros siguen activos (`gameplay.hazardsEnabled`); la radiactividad del End queda fuera hasta IV.

Créditos a anotar en `CREDITS.md`: refinería como complejo petroquímico (idea de GTNH y Star Technology, MIT) y reformado catalítico (idea de GCYS, MIT); columna (clase de la torre de GTM, LGPL-3.0); planta de titanio nuestra, sistema de presión y vacío y cubos grandes quedan como alternativas descartadas.

## Decisiones propuestas

1. **El End entra en HV con cuatro vetas** (`veins_end.json`); las radiactivas esperan a IV. Muestra de 2 menas y un viaje.
2. **Llave del End** (`grindless:end_key`, receta con ojo de ender). El portal vanilla sigue valiendo y no hay que matar al dragón. Plan B: dimensión propia.
3. **Dos multibloques nuevos: la refinería** (`gtceu:refining`, el circuito elige el modo, catalizador de cobalto y molibdeno) **y el reformador** (`gtceu:reforming`, platino del End; recortable). Escalones de familia: perforadora HV (tope 32) e invernadero HV (solo el escalón). Cracker, cámara limpia, reactor grande, congelador y torre se usan tal cual.
4. **La torre de GTM queda para aire líquido y química general (EV);** el crudo es de la refinería. Se ajusta la frase de mv.md.
5. **El ojo de ender** sale de polvo de blaze (carbono + azufre) → extractor → baño químico, y se quita la receta vanilla (perla + polvo de blaze); las varas del simulador son la otra vía.
6. **Titanio, circuitos EV, plásticos y gasolina son las cadenas de GTM enteras,** sin atajo nuestro. El congelador (2 circuitos EV) ata el titanio al circuito EV: ese orden es la línea. La gasolina (1 600 EU/mB) es el combustible de la central HV.
7. **Glicerol** a epiclorhidrina y etileno; **mezcla de metales** guardada hasta EV.
8. **Almacenamiento:** AE2 256k con circuitos HV, `expanded-ae` gateado, `extended-ae` a revisar, AdvancedAE fuera, MEGA en IV, escotillas ME de GTM en EV; barriles, super cofres y tanques de GT.
9. **Mantenimiento:** apagar `machines.enableMaintenance` en `config/gtceu.yaml`; nada de lo nuestro lo pide y es un trámite, no una línea.

## Decisiones tomadas (orquestador, 2026-10-24)

Se aprueban las nueve propuestas, con dos precisiones:

- **Llave del End.** Lleva al End vanilla, a una plataforma segura lejos de la isla central, y vuelve como las otras llaves. No hace falta matar al dragón: basta con traer dos menas de cada veta del End una sola vez.
- **Mantenimiento.** Ya está apagado en todo el pack desde MV (`DECISIONS.md`).
- **AE2 base sigue entera en LV** (lo pide el usuario), celdas de 256k incluidas. La propuesta 8 queda así: en HV solo se ponen puertas a los addons (`expanded-ae`, `extended-ae` si se queda), a los barriles, supercofres y tanques de GT, y a las escotillas ME de GTM en EV. Nada de AE2 base pide circuitos HV.