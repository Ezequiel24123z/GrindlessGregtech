# Era HV

Aquí el pack se convierte en un pack de GregTech de verdad: el crudo se refina, se craquea y acaba en plásticos; el titanio sale de una cadena de cloro y magnesio; y los circuitos de EV piden cámara limpia. Los multibloques son proyectos: se planifican antes de colocarse. Salir de HV duele por la línea, no por picar, y al final el primer cohete lleva a la Luna, el único sitio con titanio: se pisa una vez, para traer dos menas de cada veta, y una perforadora lunar hace el resto. Un multibloque nuestro, la refinería, hace en una pasada lo que GTM reparte entre cuatro pasadas de alambique, cuatro reactores de desulfuración y un cracker. HV junta cuatro multibloques nuestros y ocho de GTM que hay que coordinar.

Se entra con lo que deja MV: casco HV (`gtceu:hv_machine_hull`) y escotilla de energía HV, 8 circuitos integrados avanzados (`gtceu:advanced_integrated_circuit`), una central MV de 2 048 EU/t con transformador a HV, la planta de mineral, un EBF Kanthal corriendo y una red AE2 con CPU de 64k.

## Ruta

1. **Red HV.** Transformador MV→HV (4 A → 1 A), búferes y escotillas HV. La central crece con caldera grande de acero y turbina grande de vapor (circuitos HV) y, cuando llega la gasolina (paso 4), con generadores HV hasta los 8 192 EU/t de la puerta.
2. **Máquinas HV.** Emisor y sensor HV piden ojo de ender, que desde la v0.5.0 es de MV (blaze del simulador MV → extractor → baño químico a 120 EU/t, `mv.md`; la receta vanilla se quita por KubeJS). En HV el reactor químico da además polvo de blaze de carbono y azufre (`blaze_powder`, 480 EU/t). La sierra del cortador HV pide acero rojo (paso 7).
3. **Aceite y refinería.** Perforadora de fluidos MV → refinería (nuestra) → combustibles sin azufre, gas de refinería, nafta y H₂S. El reformador (nuestro) convierte nafta en aromáticos y devuelve H₂ a la refinería. El gas va a la destilería (metano) y, hasta que haya gasolina, el diésel mueve la central.
4. **Craqueo, plásticos y gasolina.** Nafta + vapor en el cracker de GTM (`gtceu:cracker`) o en la refinería → etileno, propeno, butadieno y benceno. PTFE (cloroformo + HF), epoxi (glicerol de MV, benceno y propeno) y SBR. Con PTFE se forma el reactor químico grande (`gtceu:large_chemical_reactor`): nafta + gas de refinería + metanol + acetona (de MV) → gasolina cruda, y con tolueno → gasolina (1 600 EU/mB, cinco veces la nafta).
5. **Cámara limpia y circuitos EV.** `gtceu:cleanroom` (casco HV, circuito HV, 3 filtros, 2 rotores de inox, 2 motores HV), paredes de plascreto (`gtceu:plascrete`, placas de PE) y techo de filtros. Cadena: CPU (oblea de MV) → microprocesador → ensamblaje (2 micros, 4 inductores, 8 condensadores, 4 RAM) → estación de trabajo dentro de la cámara (2 ensamblajes, 4 diodos, 4 RAM, hilo de electrum y 16 pernos de aleación azul). Es la pared: congelador y torre piden circuitos EV.
6. **Congelador de vacío y titanio.** `gtceu:vacuum_freezer` (2 circuitos EV) enfría los lingotes calientes de titanio y hace aire líquido. Kroll: ilmenita lunar (paso 8) → TiCl₄ → EBF Kanthal con magnesio → lingote caliente → congelador. El MgCl₂ vuelve a magnesio con sodio (lazo Mg/Cl₂).
7. **Aleaciones serias.** Acero negro (níquel + bronce negro + 3 de acero; EBF 1 758 K, baño) → acero rojo (oro rosa + latón + 2 de acero + 4 de acero negro; EBF Kanthal 1 813 K, 480 EU/t, baño): oro, plata, cobre, cinc y níquel de la planta de mineral. Nicromo (4 níquel + 1 cromo; EBF 2 700 K, 1 920 EU/t con dos escotillas HV, congelador) para la bobina de EV.
8. **La Luna.** Cohete y traje de GCYR (HV, de inox: `integration/gcyr.js`; los motores se prueban en el banco de pruebas, los depósitos y el escudo de los motores salen del autoclave de composites y el chip de destino se escribe con la carta de alunizaje: ver *El primer cohete*) → un viaje por dos menas de cada veta lunar → muestras → perforadora lunar (ver *Perforadora lunar*): ilmenita (el único titanio del pack) y helio-3. Después, Waystones y `/home` para ir y volver gratis, y el puente cuántico Tierra-Luna de AE2 para objetos, fluidos y energía. El End (platino del catalizador del reformador, paladio) es de MV desde la v0.5.0.
9. **Almacenamiento serio.** Celdas y CPU de 256k, barriles de inox y titanio, super cofres y tanques de GT (ver *Almacenamiento*).
10. **Salida.** Ver *Puerta a EV*.

## Herencia de MV

- **La Luna y el viaje.** Dueño: la perforadora lunar (`veins_moon.json`), el cohete y el traje. Un viaje, dos menas por veta (decisión 4 de LV). El End y su llave son de MV.
- **Ojo de ender.** Dueño: MV (`mv.md`). En HV el blaze también sale de carbono y azufre.
- **Mezcla de metales.** Dueño: EV (centrífuga, 900 EU/t). En HV sigue guardada o no se separa (el polvo de piedra va al lodo). No hay receta nueva.
- **Glicerol.** Dos destinos: epiclorhidrina (`epichlorohydrin_from_glycerol`, epoxi) y etileno (`ethylene_from_glycerol`: 1 000 mB de glicerol + 1 000 de CO₂ → 2 000 de etileno + 5 000 de O₂, 200 EU/t), que da uso al CO₂ inerte del horno de arco.
- **Metanol y acetona.** Dueño: la gasolina cruda (reactor grande, paso 4). El metanol sale del CO del silicio y la acetona de la biorrefinería; en MV solo tenían destinos pequeños (biodiésel, cola).

## Generación automática de recursos

Mismo patrón que LV y MV: un catalizador que no se gasta y entradas de otra línea. Lo que HV necesita sale de MV, salvo la Luna.

### Perforadora de vetas HV

- **Registro:** `gtceu:hv_vein_drill`, tipo `gtceu:vein_drilling`, la spec y la tabla de LV y MV (`lv/multis.js`, `lv/vein_drilling.js`) más la tabla nueva `veins_end.json`.
- **Vetas del End (de MV desde la v0.5.0).** Con la broca de inox y lodo las corre también la HV (`vein_drilling/hv/`); con la vanádica son de la MV (`vein_drilling/mv/`). Cuatro: `bauxite_vein_end` (bauxita y aluminio: la ilmenita se fue a la Luna), `magnetite_vein_end` (magnetita, vanadio, cromita, oro), `sheldonite_vein` (bornita, cooperita, platino, paladio) y la de circón de GTCA. La de scheelita se fue a Marte; `naquadah_vein` y `pitchblende_vein_end` son radiactivas y esperan a IV.
- **Muestra y viaje:** la muestra se hace con 2 menas de la veta, así que basta un viaje. Llave del End (`grindless:end_key`, receta con un ojo de ender; mismo ayudante que las del Vacío y el Llano) lleva a `minecraft:the_end` y devuelve al punto de origen. No hay que matar al dragón. Las rocas indicadoras de GTM y el prospector HV (`gtceu:prospector.hv`, verificar alcance) marcan dónde mirar.
- **Gana al MV:** tope 32 en `bores` (una escotilla HV, 512 V ÷ 8, llena las 32 corridas: ×12 sobre el vapor; abierto a balance) y broca de acero inoxidable (`grindless:stainless_steel_drill_bit`, ~0,5 % por ciclo; ~0,25 % con lodo). HV no tiene titanio (ver *HV sin titanio*, al final); la vanádica sigue valiendo.
- **Cierra el círculo:** muestra y agua, sin más viajes. Del End da platino y paladio (EV), aluminio, vanadio y cromo.

### Perforadora lunar (la Luna)

- **Registro:** `gtceu:lunar_drill`, tipo propio `gtceu:lunar_drilling` (ninguna perforadora de la Tierra corre una veta lunar ni la lunar una de la Tierra), tabla `veins_moon.json`, recetas en `moon/lunar_drilling.js`, todas con `.dimension('gcyr:luna')`: se forma en cualquier sitio y solo trabaja en la Luna.
- **Forma (la familia cambia de forma):** un módulo de aterrizaje de 7×5×5: tres patas de marco de inox sobre losas de regolito, cuerpo de carcasa de inox limpio con las escotillas, dos alas de sensores de luz y una sarta de tubos de acero que baja por el cuerpo, con un mástil encima.
- **Vetas:** `ilmenite_moon` (ilmenita, olivino, cromita, hierro: la única fuente de titanio del pack), en seco con la broca de inox (3,75 menas por corrida, 0,5 % de desgaste), y `regolith_moon` (el regolito: 5 mB de helio-3 por corrida, solo de día). 8 EU/t y 200 t por corrida, tope 32 (una escotilla HV). Muestras: dos menas o bloques de cada veta traídos a mano en el primer viaje.
- **Energía:** nada arde en el vacío. Baterías traídas de la Tierra y, con el puente cuántico, la central de casa por túneles P2P de EU (eup2p) o FE de Applied Flux.
- **Puente:** una semilla cuántica lunar (reactor químico HV en la Luna: perla de ender + 250 mB de helio-3) y una singularidad de AE2 en una explosión dan un par entrelazado marcado para la Luna. Una cámara fuera de la Tierra expulsa las singularidades de otro planeta. Lo de calidad de vida no tiene límites entre planetas: cofres, tanques, bolsas y cajones ender, tapas ender, Modular Routers y Waystones (placas incluidas) funcionan igual en la Luna.
- **Lo releva EV:** la perforadora trípode EV (Luna y Marte, broca de titanio) y la celda de regolito (O₂, titanio sin cloro, ladrillos de regolito sinterizado).

### Aceite, gas y aire

- **Aceite:** sigue `gtceu:mv_fluid_drilling_rig` (`oil`, `raw_oil`, `light_oil`, `heavy_oil`, `natural_gas`; 100–300 mB/s por yacimiento). La de HV (`gtceu:hv_fluid_drilling_rig`, ×16) pide casco EV y es de EV; una MV ya alimenta a dos refinerías. El gas natural se desulfura a gas de refinería (`desulfurize_natural_gas`).
- **Aire:** colector de gas y centrífuga (N₂, O₂) como en MV. El aire líquido (`liquid_air`, congelador, 480 EU/t) y los gases nobles son de la puerta; el helio también sale del gas de refinería (`distill_refinery_gas`).
- **Craqueo:** la materia sale de la refinería (nafta, ligero, pesado y gas); el vapor, de la caldera con agua de la bomba; el H₂, de la electrólisis o del reformador.
- **H₂, Cl₂ y flúor:** H₂ y Cl₂ de la electrólisis de agua y salmuera. Flúor de topacio y topacio azul (veta del Nether), lepidolita (sales) o bastnasita (monacita) → HF con H₂ (`hydrofluoric_acid_from_elements`). Magnesio de la magnesita (veta de olivino) y sodio de la sal.
- **Cierra el círculo:** crudo, sal, topacio, magnesita y metales salen de perforadoras; lo demás es EU.

### Invernadero HV

- `gtceu:hv_greenhouse`, tipo `gtceu:greenhouse`, la misma spec con `bores` en 32. **Decisión: solo el escalón.** HV no pide más madera ni cultivos que MV: el carbono nuevo sale del petróleo. Sigue dando goma natural, aceite de semilla (biodiésel → glicerol) y el sumidero útil del CO₂.

### Criaturas

- `gtceu:hv_creature_simulator` ya existe (LV a EV) y `mobs.json` trae el blaze en MV desde la v0.5.0 (120 EU/t, 2 varas por 1 polvo de carbón). HV no pide modelos nuevos: el wither (estrella del Nether) se decide en EV.

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

### Autoclave de composites: `gtceu:composite_autoclave` (el camino al primer cohete)

Qué gana: **una receta imposible en pequeño**. Curar una pieza grande de fibra y epoxi con calor y presión de nitrógeno no lo hace ninguna máquina de un bloque (el autoclave de GTM cristaliza gemas con un solo fluido). Es la única fuente de dos piezas del primer cohete (ver *El primer cohete*).

- **Tipo de receta:** `gtceu:composite_curing` (nuevo). 300 t a 480 EU/t. El nitrógeno presuriza el recipiente y se ventea al acabar cada curado (es inerte: ventearlo es su destino).
  - **Loseta de escudo térmico ablativo** (`grindless:ablative_heat_shield_tile`): 4 láminas de fibra de vidrio (de GCYR; la fibra sale del baño químico HV, `integration/gcyr.js`) + 250 mB de epoxi + 500 mB de N₂ → 2 losetas. Son el escudo de la base del motor (contra la llama que vuelve, bajo los depósitos): dos por motor.
  - **Depósito envuelto en composite** (`grindless:composite_overwrapped_tank`, un COPV): 1 barril de acero inoxidable (el forro) + 4 láminas de para-aramida + 250 mB de epoxi + 500 mB de N₂ → 1 depósito. Dos por depósito de combustible básico, en lugar de los dos barriles desnudos.
- **Estructura:** 5×7×4. Un recipiente a presión tumbado sobre dos soportes de marco de inox, con el eje hacia el jugador: carcasa octogonal de 5×5 de inox limpio alrededor de una cámara de 3×3 (aire) en las dos rodajas del medio, el fondo cerrado detrás y la puerta delante (el controlador en el centro de la puerta), y la línea de nitrógeno (carcasa de tubo de acero) encima. Escotillas en la carcasa: 1–2 de energía HV, bus de entrada (fibras y forros), bus de salida y 2 de entrada (epoxi y nitrógeno).
- **Controlador:** casco HV + 2 autoclaves HV + 2 bombas HV (la presión) + 4 circuitos HV, en la mesa de crafteo.
- **Líneas que cruza:** la fibra de vidrio (sílice + epoxi), la para-aramida (reactor químico grande, la misma línea que la tela del traje), el epoxi (glicerol, benceno, propeno) y el nitrógeno del aire.
- **Por qué no es un cubo grande:** su tipo de receta no existe en ninguna máquina, no da paralelos ni descuento y pide dos fluidos.

### Planta de gas de síntesis: `gtceu:syngas_plant` (el hidrógeno del cohete y de la refinería)

Qué gana: **varios pasos en uno y una reacción que no hace ninguna máquina pequeña.** GTM no gasifica con vapor ni tiene la reacción de desplazamiento del gas de agua: su CO solo va a metanol, ácido acético, alguna síntesis o al electrolizador, y el carbón solo da CO quemándolo con O₂. La planta gasifica carbono en polvo o el combustible pesado de la refinería con vapor, desplaza el CO con más vapor sobre un catalizador y separa los gases, cada uno a su escotilla. También convierte en H₂ el CO que sobra en HV.

- **Tipo de receta:** `gtceu:syngas`, seis recetas escritas desde la química real en una tabla (`server_scripts/grindless/hv/syngas_plant.js`). El circuito elige el modo:

  | Circuito | Reacción | Entra | Sale | EU |
  |---|---|---|---|---|
  | 1, gasificación | C + H₂O → CO + H₂ | 1 polvo + 1 000 mB de vapor | 1 000 de CO + 2 000 de H₂ | 480 EU/t × 60 t |
  | 1, gasificación | CH₂ + H₂O → CO + 2 H₂ | 1 000 de combustible pesado + 1 000 de vapor | 1 000 de CO + 4 000 de H₂ | 480 × 60 |
  | 2, gas para metanol | 3 C + 4 H₂O → 2 CO + 4 H₂ + CO₂ | 3 polvos + 4 000 de vapor | 2 000 de CO + 8 000 de H₂ + 1 000 de CO₂ | 480 × 220 |
  | 3, hidrógeno | C + 2 H₂O → CO₂ + 2 H₂ | 1 polvo + 2 000 de vapor | 4 000 de H₂ + 1 000 de CO₂ | 480 × 100 |
  | 3, hidrógeno | CH₂ + 2 H₂O → CO₂ + 3 H₂ | 1 000 de combustible pesado + 2 000 de vapor | 6 000 de H₂ + 1 000 de CO₂ | 480 × 100 |
  | 4, desplazamiento | CO + H₂O → CO₂ + H₂ | 1 000 de CO + 1 000 de vapor | 2 000 de H₂ + 1 000 de CO₂ | 480 × 40 |

  El polvo es cualquiera de la etiqueta `#grindless:gasifier_feed`: carbón, coque, carbón vegetal o carbono (gasificador de flujo arrastrado: pide la carga pulverizada; la planta de mineral ya da el carbón en polvo). Los polvos dan ceniza con la probabilidad de GTM para el carbón (1 de cada 9 por mol). El modo 2 da justo la proporción CO + 4 H del metanol de GTM (`methanol_from_monoxide`); el combustible pesado ya la da en el modo 1.
- **Unidades honestas:** son las de GTM: 1 000 mB son un mol y su hidrógeno son átomos (la electrólisis da 2 000 mB por 1 000 de agua). El vapor es H₂O en el propio material de GTM, y 1 000 mB cuentan como un mol de agua, como cuando el craqueador y el horno de pirólisis lo toman de reactivo. El combustible pesado cuenta como CH₂ (cadena larga). Cada receta cuadra el carbono, el hidrógeno y el oxígeno; la prueba lo comprueba.
- **Energía:** la suma de las etapas, sin descuento: 28 800 EU por gasificación (es endotérmica, +131 kJ/mol) y 19 200 por desplazamiento con la captura del CO₂ (la reacción da calor, −41 kJ/mol; regenerar la amina pide más). Todo a 480 EU/t, sin paralelos; con dos escotillas HV sube un escalón como cualquier máquina de GTM. El H₂ sale a 12 EU/mB en el modo 3 (9,6 en el desplazamiento, 8 desde combustible pesado), frente a 22,5 de la electrólisis en LV (90 con la sobrecarga a HV) y 9 más el metano en el reformado de metano de GTM. Ningún bucle gana a lo que GTM ya da: dos carbones por los modos 1 y 3 más el `methane_shortcut` de GTM dan un metano (112 000 EU en turbina) por 81 600 EU, unos 15 000 EU por carbón, menos que la pirólisis de GTM (unos 22 000 de gas de carbón por carbón, y el coque se queda); tres carbones por el modo 2 y el reactor de metanol dan dos metanoles (128 000 EU) por 128 640 EU.
- **Condición propia:** catalizador de desplazamiento (`grindless:shift_catalyst`: 3 de magnetita + 1 de cromo → 4 en el mezclador; el óxido de hierro y cromo del desplazamiento de alta temperatura real) en el bus de entrada, ≈ 0,05 % por pasada, solo en los modos que desplazan (2, 3 y 4). La gasificación sola no lo pide. Cruza la veta de magnetita del Overworld con el cromo del inox.
- **Estructura:** 9×7×3 (ancho × alto × fondo). Suelo de 9×3 de carcasa limpia de inox, el único sitio de las escotillas. Encima, de izquierda a derecha: el gasificador (carcasa termorresistente alrededor de un hueco, un anillo de 8 bobinas de Kanthal en medio y la tapa con la salida del gas), los dos tambores de desplazamiento (inox limpio sobre un núcleo de tubos de acero, separados por cuatro marcos de inox) y la columna absorbedora de CO₂ (inox limpio, seis bloques de alto, mirilla de cristal templado). Un colector de tubo de acero une las tres por arriba. Escotillas: 1–2 de energía HV, bus de entrada (carga y catalizador), bus de salida (ceniza), 1–2 de entrada (vapor, y CO o combustible pesado) y 2–3 de salida (cada una guarda un gas: si un gas no tiene sitio la receta no arranca, nada se pierde ni se mezcla).
- **Controlador:** casco HV + reactor químico HV (el desplazamiento) + centrífuga HV (la separación de gases) + 2 bombas HV + 4 circuitos HV, en la mesa de crafteo.
- **El CO que sobra en HV:** el silicio (horno de arco y EBF: 2 000 mB por lingote, y cada boule pide 32), el gas de madera de la biorrefinería y el aire del Nether. El Kroll (2 000 por TiCl₄) ya no cuenta: el titanio es de EV y de la Luna.
- **El H₂ que pide HV:** la refinería (≈ 0,46 mB por mB de crudo medio y 0,8 con el pesado, que con el reformador apenas recupera un 22 %; el craqueo con H₂, 2 000 por 1 000 de carga) y el cohete. GCYR quema H₂ como combustible de nivel 1, pero 8 B de `gtceu:rocket_fuel` piden unos 26,7 B de H₂ y 2,7 B de CO por el metanol y el amoniaco de la dimetilhidracina y del N₂O₄: con la planta son unos 4 polvos en el modo 2 (el metanol) y otros 4 en el modo 3 (el amoniaco), unos 333 000 EU (la electrólisis pide 600 000 en LV y 2,4 millones sobrecargada a HV).
- **Diferencia con el reformador:** el reformador convierte nafta en aromáticos sobre platino y su H₂ es un subproducto que devuelve a la refinería el H₂ del crudo medio; no toma vapor, ni carbón, ni CO, ni da CO₂. La planta hace H₂ (o gas de síntesis) de carbono sólido y del fondo pesado con vapor, desplaza el CO y captura el CO₂. Ninguna de las dos reforma metano: eso ya lo hace un reactor químico de GTM (`carbon_dioxide_from_methane`).
- **Subproductos:** H₂ → refinería, amoniaco, HF, metanol o el cohete. CO (tóxico en GTM: se contiene) → metanol (el modo 2 es su gas exacto), ácido acético, butiraldehído, o vuelve a la planta en el modo 4. CO₂ (inerte en GTM, sin peligro: se puede tirar) → invernaderos MV y HV, etileno desde glicerol, metanol desde CO₂, sosa, bicarbonato, vuelta a CO con carbono o electrólisis. Ceniza → centrífuga de GTM (cal viva, potasa, magnesia…) o fertilizante.
- **Por qué no es un cubo grande:** su tipo de receta no existe en ninguna máquina, no da paralelos ni descuento y pide vapor de la central, carga de la perforadora, catalizador de dos vetas y un destino para cada gas.
- **Decisiones tomadas (planta de gas de síntesis, 2026-10-24):**
  1. Seis recetas y no una por carga: los cuatro polvos entran por una etiqueta propia (`grindless:gasifier_feed`), con la misma ceniza.
  2. Solo carga pulverizada: el gasificador es de flujo arrastrado, como los de carbón en polvo reales; las gemas pasan por el macerador.
  3. El vapor es el reactivo, a 1 000 mB por mol de agua (el material de GTM es H₂O); no se pide agua aparte.
  4. El combustible pesado es el "residuo pesado": cuenta como CH₂ y le da al fondo del crudo pesado un destino que cierra su deuda de H₂.
  5. Sin metano: el reformado de metano ya es de GTM. El reformador sigue siendo de nafta.
  6. El catalizador solo se pide donde hay desplazamiento, y es de hierro y cromo; el de cobre y cinc de baja temperatura se descarta (no aporta otra decisión al jugador).
  7. El CO₂ sale capturado y puro: tirarlo es honesto porque en GTM es inerte, y tiene seis usos de GTM y del pack.

### Escalones de familia

La perforadora y el invernadero HV (arriba). La torre de GTM no se sustituye: queda para aire líquido y química general en EV.

### Descartadas

- **Planta de titanio nuestra (Kroll en una caja):** borra la línea que da identidad a HV. Se queda la cadena de GTM entera.
- **Sistema de presión y vacío** (GCYS, MIT): pide Java (escotillas de presión, compresor axial). El vacío es el congelador de GTM.
- **Cubos grandes y fundición de aleaciones** (GCYM, `t_large_*`): solo velocidad; GTM trae los GCYM en IV.
- **Minero grande y de roca madre** (GTM): la perforadora con muestra ya hace ese trabajo.

## El primer cohete: la cadena de piezas

El primer cohete deja de ser una receta de ensambladora y pasa a ser un proyecto que cruza MV y HV. El cohete sigue siendo el de GCYR, hecho con sus bloques (plataforma `gcyr:launch_pad`, torre de marcos de inox, `gcyr:seat`, `gcyr:basic_fuel_tank` y `gcyr:basic_rocket_motor`); solo cambian las recetas de sus piezas, todas en `integration/gcyr_launch_road.js` (lo de `integration/gcyr.js`, escáner, tela, fibra y traje, sigue igual).

| Pieza | Cómo se hace | Máquinas |
|---|---|---|
| Propulsor calificado (`grindless:qualified_power_thruster`) | 4 propulsores de potencia de GTM + 200 mB de RP-1 + 300 mB de O₂ → 4 (encendido estático MV, 120 EU/t, 300 t) | ensambladora (propulsor), banco de pruebas (MV) |
| Loseta ablativa y depósito envuelto | ver *Autoclave de composites* | autoclave de composites (HV) |
| Motor sin probar (`grindless:untested_rocket_motor`) | 4 propulsores calificados + 2 losetas ablativas + 4 placas de Kapton K + 1 marco de inox (antes: 4 propulsores + 6 de Kapton K + marco) | ensambladora HV, 480 EU/t, 300 t |
| **Motor de cohete básico** | motor sin probar + 500 mB de combustible de cohete → motor + 250 mB de CO₂ + 500 mB de agua (el N₂ se ventea). La receta de ensambladora de GCYR desaparece: el motor solo sale del banco | banco de pruebas con 1 escotilla HV o 2 MV, 480 EU/t, 400 t |
| **Depósito de combustible básico** | 2 depósitos envueltos + 6 placas de Kapton K + 1 marco de inox (antes: 2 barriles de inox) | ensambladora HV, 480 EU/t, 300 t |
| Asiento, plataforma, torre | como en GCYR (asiento: ensambladora MV; plataforma: hormigón negro, marco de acero y tinte amarillo) | — |
| Escáner de cohetes | `integration/gcyr.js`: casco HV, 4 circuitos HV, 2 placas de inox y 2 plataformas | mesa de crafteo |
| **Chip de destino** (`gcyr:id_chip`) | lámina de hierro magnético + placa de PE + la carta de alunizaje del radiotelescopio (`grindless:lunar_landing_chart`, MV), que se queda en la mesa. Mientras el observatorio no esté en el pack, el chip mantiene la receta de GCYR | mesa de crafteo |
| Traje | `integration/gcyr.js`, y 16 B de O₂ en el peto (enlatador de fluidos) antes de salir | — |
| Combustible | 8 B o más de `gtceu:rocket_fuel` para la Luna (los dos depósitos guardan 10 B; cada tramo quema unos 1,2 B) | reactor químico HV (dimetilhidracina) + mezclador |

- **Cuánto pide el primer cohete:** de 4 a 6 motores (con 6, 2 depósitos y 1 asiento el cohete de la prueba de vuelo sube a 5 bloques por tick: empuje 24, peso 19; con 4 apenas sube), 2 depósitos y 1 asiento. Son 16–24 propulsores (4–6 encendidos MV), 4–6 curados de losetas, 4 curados de depósitos, 4–6 encendidos HV y 2–3 B de combustible de más para las pruebas.
- **Por qué así:** la dificultad sube por pasos y líneas cruzadas (RP-1 de MV, fibra de vidrio, para-aramida, epoxi, nitrógeno, combustible de cohete), no por cantidad: las cifras de GCYR se quedan y ningún tiempo se infla. Cada subproducto tiene destino (CO₂ y agua del banco a sus escotillas; el N₂ del autoclave, inerte, se ventea).
- **Sin multibloque de lanzamiento nuevo:** el escáner y la plataforma de GCYR ya son el complejo de lanzamiento y ya son de HV; no hay hueco que justifique otro.
- **Decisiones tomadas (camino al cohete, 2026-10-24):**
  1. El motor básico de GCYR solo sale del banco de pruebas: ningún cohete vuela con un motor sin probar. El encendido quema el mismo combustible con el que vuela el cohete.
  2. El escudo térmico va en el motor (escudo de la base, contra la llama) y no en el asiento: así el encendido estático también lo prueba, y el asiento sigue siendo el de GCYR.
  3. El depósito básico cambia sus dos barriles por dos depósitos envueltos en para-aramida; el Kapton K se queda como aislante.
  4. La carta de alunizaje va en el chip de destino y no en el escáner: el chip lleva el destino del vuelo, cada lanzamiento pide uno (la carta no se gasta y cuenta en cada vuelo), y `integration/gcyr.js` no se toca. El escáner se fabrica una sola vez.
  5. El autoclave consume el nitrógeno y no lo devuelve: se ventea tras cada curado, como en un autoclave real.

## Líneas de proceso nuevas

| Línea | Pasos | Subproductos → destino |
|---|---|---|
| Crudo → combustibles | yacimiento → refinería (modo 1) → ligero + pesado → mezclador → diésel (480 EU/mB). Gasolina: 16 000 de nafta + 2 000 de gas de refinería + 1 000 de metanol + 1 000 de acetona → 20 000 de gasolina cruda (reactor grande, `raw_gasoline`, 480 EU/t) + 1 000 de tolueno por 10 000 → gasolina (`gasoline`, 1 600 EU/mB) | H₂S: ácido o azufre. Gas de refinería: destilería o turbina. Pesado sobrante: craqueo (modo 2). El metanol y la acetona de MV encuentran aquí su destino grande |
| Craqueo → olefinas y aromáticos | nafta (o ligero, pesado, gas) + vapor → refinería (modo 3) o cracker → etileno (PE, PVC), propeno, butadieno, benceno, tolueno. Nafta → reformador → benceno, tolueno y H₂ | Carbono: blaze y acero. Etano, propano y metano: turbina o craqueo moderado en el cracker. El H₂ del reformador vuelve a la refinería |
| PTFE | metano + 6 000 de Cl₂ → cloroformo (`chloroform`, 3 000 de HCl); + 4 HF → TFE (`tetrafluoroethylene_from_chloroform`, 240 EU/t, 6 HCl) → PTFE (`ptfe_from_oxygen`) | HCl: cloruro de vinilo (PVC), epiclorhidrina y ácido. PTFE: casco inerte (`gtceu:inert_machine_casing`) y tubos del reactor grande |
| Epoxi y SBR | glicerol + HCl → epiclorhidrina; benceno + propeno + ácido fosfórico → cumeno (`cumene_from_benzene`) → fenol + acetona → bisfenol A → + epiclorhidrina + 3 NaOH → epoxi. Estireno (etileno + benceno) + butadieno + O₂ → SBR crudo (240 EU/t) → + azufre → goma | Agua salada del epoxi: electrólisis (Cl₂ y Na). Acetona: cola. SBR: sustituye a la goma en bombas y cintas EV y es obligatoria desde IV (anillos de silicona o SBR) |
| Titanio | ilmenita lunar → rutilo (`rutile_from_ilmenite`, EBF 1 700 K, 480 EU/t) → `titanium_tetrachloride` (2 C + rutilo + 4 000 de Cl₂, 400 t) → `titanium_from_tetrachloride` (EBF 2 141 K, 480 EU/t, 800 t; + 2 Mg) → lingote caliente → congelador | CO (2 000 mB por TiCl₄): metanol o tanque (tóxico, se contiene). CO₂ del rutilo: inerte. Hierro forjado: acero. MgCl₂: `salt_from_magnesium_chloride` (3 MgCl₂ + 2 Na → Mg + 4 sal), la sal vuelve a la electrólisis |
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

Abre EV: casco y escotillas EV (4 A y 16 A), perforadora de fluidos HV (casco EV, ×16), escotillas ME de GTM, turbina grande de gas y motor de combustión grande, gasolina de alto octanaje (reactor grande EV: gasolina + octano + óxido nitroso + tolueno + ETBE), acero de tungsteno (tungsteno de Marte; bobina de nicromo), circuitos nano y cuánticos (platino del End) y el campo generador EV (estrella del Nether).

## Mods e integración

| Mod | Slug | Uso en HV |
|---|---|---|
| Expanded AE | `expanded-ae` | ya en el lote 2: proveedor de 72 ranuras y coprocesadores; HV gatea los grandes con circuitos HV e inox (verificar recetas) |
| ExtendedAE | `extended-ae` | a revisar: solapa con el anterior; si entra, solo bus de E/S ×8, conector inalámbrico y modificador de patrones con circuitos HV; sin celdas infinitas, cristal instantáneo ni inscriptor extendido |
| AdvancedAE | `advancedae` | se propone descartarlo (lv.md lo lista para HV–EV) |
| GTM Advanced Hatch, Modern AE2 Additions | `gtm-advanced-hatch`, `modern-ae2-additions` | a revisar: HV o más; que no duplique las escotillas ME de GTM |
| MEGA Cells | `mega` | IV (manda lv.md) |
| GCYR | `gcyr` | el primer cohete y el traje espacial son de HV, con inox y piezas HV (`integration/gcyr.js`, ver *HV sin titanio*) |
| Sophisticated Backpacks y Storage, Storage Drawers de GT | `sophisticated-backpacks`, `sophisticated-storage`, `gregtech-storage-drawers` | nivel 3 con inox y titanio |
| Create y Greate | `create`, `greate` | sin cambios |

Ningún mod nuevo es obligatorio: máquinas, tipos de receta, llave y catalizadores son KubeJS.

- **Startup:** tipos `gtceu:refining` y `gtceu:reforming`; máquinas `refinery`, `reformer`, `hv_vein_drill` y `hv_greenhouse` con el helper de patrones; `bores` en 32 para HV; ítems `grindless:stainless_steel_drill_bit`, `grindless:hydrotreating_catalyst`, `grindless:reforming_catalyst` y `grindless:end_key`. El `widen` de la refinería: 2 fluidos de entrada, 8 de salida, 1 ítem de entrada y 1 de salida.
- **Server:** generar `refining` desde `distillation_tower` (crudo) y `cracker` + torre (craqueo); las 2–3 recetas de `reforming` a mano en una tabla; `veins_end.json` y la broca de inox en `lv/vein_drilling.js`; la llave en `dimensions.js`; quitar la receta vanilla `minecraft:ender_eye` (en GTM solo la quita `recipes.hardMiscRecipes`, que se llevaría también el horno y la mesa de crafteo); recetas de 256k de AE2; puertas de los mods de la tabla con circuitos HV.
- **Config:** `config/gtceu.yaml` ya trae FE y vetas infinitas de fluido; falta decidir `machines.enableMaintenance` (riesgo 5) y comprobar `recipes.enableExtractorRecycling` (activo por defecto): de él sale el blaze líquido.
- **Misiones:** capítulo "Fábrica HV" con unas 14, una por paso y por multibloque, premio pequeño y sin bloquear recetas.
- **Pruebas:** (1) arranca; (2) refinería, reformador, perforadora HV e invernadero HV se forman y procesan; (3) crudo → refinería → nafta → gasolina; nafta → cracker → etileno → PE; boule → estación de trabajo; rutilo → titanio, y `-Tier hv` sin huérfanas.

## Riesgos y dudas

- **Refinería y reformador.** Unas 13 recetas generadas (4 crudos, 8 de craqueo, gas natural) y 2–3 del reformador con cifras que son nuestras y no de GTM. La clase de la torre reusada desde KubeJS está sin comprobar (si falla, salidas libres, sin capas). Cambia una frase de mv.md: allí el crudo era de la torre de GTM; aquí la torre queda para aire líquido y química general.
- **El End.** Un viaje con el dragón vivo; hay que comprobar que la llave sirve para una dimensión vanilla. Plan B: dimensión propia con las vetas, por datapack como el Vacío y el Llano.
- **La pared es la línea de circuitos EV.** Cámara limpia, 16 pernos de aleación azul por estación (electrotina, plata, redstone profunda), condensadores, inductores y diodos. Si 8 estaciones son demasiadas, la puerta baja a 4 tras una pasada de balance.
- **H₂, Cl₂ y CO.** La refinería gasta ≈ 0,46 mB de H₂ por mB de crudo medio; el Kroll, 4 000 mB de Cl₂ por lingote y deja 2 000 de CO; el PTFE, 6 000 de Cl₂ por cloroformo. El H₂ sale de la electrólisis y, con crudo medio, casi cierra solo con el reformador; con crudo pesado no. Si el balance falla se corta el reformador y el H₂ es de la electrólisis. La planta de gas de síntesis cierra la deuda del crudo pesado (gasifica su combustible pesado) y convierte en H₂ el CO que sobra.
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

## HV sin titanio (decisión del usuario, 2026-10-24)

El titanio entra en EV y sale solo de la Luna (`docs/viaje.md`, opción A). Todo HV pasa a acero inoxidable. Lo de arriba que habla de titanio en HV (la línea de Kroll del paso 6 y el barril de titanio) queda superado por eso; la ilmenita del End se queda de momento como fuente (ver la última nota). La puerta a EV (casco, motor y bomba EV) sigue pidiendo titanio, pero ahora es el que se trae de la Luna al final de HV.

- **Auditoría** sobre el volcado de recetas (todo lo que la era HV fabrica y lo que fabrica cada pieza): en GTM 7.5.3 el escalón HV ya era de inox. Ninguna máquina, casco, carcasa, componente, escotilla ni multibloque de GTM de HV pide titanio, y los nuestros (refinería, reformador, perforadora e invernadero HV) tampoco. Lo único que lo pedía era nuestra broca, el escáner de cohetes de GCYR y la muestra de la veta de bauxita del End, porque la hace con ilmenita.
- **Broca HV.** `grindless:stainless_steel_drill_bit`: placas y varillas de inox, mismo desgaste y rendimiento que tenía la de titanio. La de titanio sigue registrada para los mundos viejos, oculta en EMI, y se convierte 1:1 en la de inox.
- **El primer cohete y el traje** (GCYR) son de HV (`integration/gcyr.js`):
  - El escáner de cohetes lleva casco HV, circuitos HV y placas de inox.
  - La tela espacial cambia el polibencimidazol (IV) por una placa de Kapton K (química HV).
  - La fibra de vidrio pasa al baño químico de HV (480 EU/t).
  - El casco y las grebas llevan circuitos HV.
  - El peto lleva una celda grande de inox y circuitos HV, en vez de la de acero de tungsteno.
  - El motor, el depósito básico, el asiento, la plataforma de lanzamiento y el chip de destino ya eran de HV o menos. Después, el camino al cohete rehace el motor, el depósito y el chip (`integration/gcyr_launch_road.js`, ver *El primer cohete*).
- **Oxígeno.** GCYR solo registra el esparcidor de oxígeno de IV en adelante. En el primer viaje el oxígeno va en el depósito del peto (16 cubos, unos 40 minutos), que se llena en un enlatador de fluidos.
- **Vetas del End en la v0.4.1** (transición hasta que la Luna llegue en la v0.5.0, decisión del orquestador):
  - La ilmenita se queda en la veta de bauxita del End, para que el titanio tenga fuente hasta que la sustituya la Luna. La muestra ya no la pide: se hace con bauxita y aluminio (`"sample": false` en `veins_end.json`).
  - La veta de scheelita sale del End (`veins_excluded.json`) con sus recetas, y vuelve en Marte. Su muestra sigue registrada para las partidas que ya la tienen: oculta en EMI, se convierte en una sonda de vetas vacía. El validador confirma que nada de vapor a HV la necesita. El litio sigue saliendo de la veta de sales (lepidolita y espodumena) y de la arcilla.
