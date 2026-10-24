# Era MV

La fábrica deja de caber en una sala. Aparecen los polímeros, los combustibles y líneas que se cruzan: el silicio suelta CO que acaba en metanol, la madera da ácido acético y carbono, el etileno sale del etanol y el ácido gastado vuelve a destilarse. Un multibloque nuestro sustituye a diez máquinas sueltas. La era acaba cuando el circuito de HV sale de una línea propia y la central aguanta HV.

Se entra con lo que deja LV: casco MV (`gtceu:mv_machine_hull`), escotilla de energía MV, 8 circuitos electrónicos MV (`gtceu:good_electronic_circuit`), un EBF de cuproníquel corriendo a 120 EU/t y una red AE2 con una CPU de 16k.

## Ruta

1. **Red MV.** Cable de cobre con goma (9 de caucho crudo del invernadero + 1 azufre → 1 296 mB de goma), búfer, casco y escotillas MV sobre el transformador LV→MV (4 A → 1 A) de la puerta de LV. La central crece con calderas grandes de bronce (creosota, biomasa) y turbinas MV (`gtceu:mv_steam_turbine`) hasta que llegan los combustibles (paso 7).
2. **Máquinas MV** (`gtceu:mv_<máquina>`). Motor (hilo doble de cuproníquel + varillas de aluminio), pistón, bomba, brazo y cinta (goma). Dos piezas cruzan líneas: el cortador pide sierra de acero vanádico y el grabador láser, un emisor con esmeralda sin tacha (veta de berilio del Nether).
3. **Planta de mineral** (nuestra). Todo lo siguiente come metal: cromo, vanadio, níquel, manganeso, plata y oro. La planta procesa las menas enteras y reparte los secundarios.
4. **Kanthal y aceros.** Rubí (veta profunda de redstone) → electrólisis → cromo y aluminio; el aluminio gana una segunda vía: bauxita de la veta de mica → electrólisis MV (60 EU/t: 15 bauxita → 6 aluminio + 1 rutilo + 9 000 mB de O₂), con rutilo de sobra para EV. Kanthal (hierro + aluminio + cromo, EBF de cuproníquel a 1 800 K) → baño químico MV → hilo → bobina Kanthal (2 700 K). Acero vanádico (vanadio + cromo + 7 de acero) e inoxidable (6 de hierro + cromo + manganeso + níquel, EBF a 1 700 K).
5. **Silicio y obleas.** 3 SiO₂ + 2 carbono → lingote caliente (EBF Kanthal, 2 273 K, 120 EU/t, 2 000 mB de CO) → baño químico MV. Boule: 32 de polvo de silicio + 1 polvo pequeño de GaAs (EBF a 1 784 K, circuito 2). Cortadora MV (16 obleas) → grabador láser MV (lente roja = ILC, verde = RAM) → cortadora → chips.
6. **Carbono renovable.** Invernadero MV → troncos y cultivos → pirólisis (`gtceu:pyrolyse_oven`), cervecería y fermentación → **biorrefinería** (nuestra): etanol, metanol, ácido acético, acetona, fenol, benceno, creosota.
7. **Aceite y combustibles.** Perforadora de fluidos MV de GTM → alambique → desulfurar con H₂ → mezclador → diésel. Biodiésel de aceite de semilla y metanol. Generadores MV.
8. **Polímeros.** Etanol + ácido sulfúrico → etileno → PE; salmuera → cloro → cloruro de vinilo → PVC; goma del invernadero.
9. **Circuitos.** Tablero fenólico (polvo de madera + cola) → tablero bueno (plata + persulfato o FeCl₃), diodos con GaAs, transistores (silicio + estaño + PE), resistencias de carbón. ILC → integrado básico → integrado bueno (MV) → integrado avanzado (HV): 2 buenos + 2 ILC + 2 RAM + 4 transistores + 8 hilos finos de electrum + 8 pernos de cobre recocido (arco de GTM, verificar).
10. **Salida.** Ver *Puerta a HV*.

## Generación automática de recursos

Mismo patrón que LV: un catalizador que no se gasta y entradas que salen de otra línea. Lo que MV necesita sigue saliendo del Overworld y el Nether.

### Perforadora de vetas MV (escalón de la familia)

- **Registro:** `gtceu:mv_vein_drill`, tipo `gtceu:vein_drilling`, la misma spec de patrón y la misma tabla de vetas que LV (`lv/multis.js` y `lv/vein_drilling.js`); sin builder tiered de GTM, como LV.
- **Decisión: el End se queda en HV.** MV no pide nada de allí: aluminio (zafiro o bauxita), cromo (rubí), vanadio (magnetita), esmeralda (berilio del Nether) y sal salen del Overworld y el Nether. Las vetas del End (bauxita, magnetita, naquadah, pechblenda, scheelita, sheldonita) o repiten lo que ya sale del Overworld o son materiales de HV–EV, y el viaje (ojo de ender, portal) pide equipo que MV aún no tiene.
- **Gana al LV:** el mismo modificador de paralelos (`bores`: voltaje ÷ 8 EU/t) con tope 16 en vez de 8. Una escotilla MV (128 EU/t) llena las 16 corridas: ×6 sobre el vapor y el doble que la LV con dos escotillas. Y una broca de acero vanádico (`grindless:vanadium_steel_drill_bit`, ~1 % por ciclo; ~0,5 % con lodo) hecha con vanadio y cromo de la planta de mineral: la perforadora paga su propia broca. Si el balance pide menos, tope 8 y la ganancia queda en una escotilla y la broca.
- **Cierra el círculo:** muestra y agua como en LV. El polvo de piedra deja de sobrar: lodo (LV) y el resto a la centrífuga (ver *Fluidos base*).

### Aceite y gas: la perforadora de fluidos de GTM

- **Decisión:** se usa `gtceu:mv_fluid_drilling_rig` tal cual, no una nuestra. Ya trae prospección, yacimientos (`oil_deposit`, `raw_oil_deposit`, `light_oil_deposit`, `heavy_oil_deposit`, `natural_gas_deposit`, `salt_water_deposit`) y un coste que cruza líneas: casco MV, 4 marcos de acero, 4 circuitos, 4 motores, 4 bombas y 4 engranajes de acero vanádico.
- **Lo que se arregla:** `worldgen.oreVeins.infiniteBedrockOresFluids: true` en `config/gtceu.yaml` (la veta no se agota y nadie se muda) y, por datos, yacimientos propios para `grindless:flat` y `grindless:void` (evento de vetas de fluido de GTM, verificar). Buscar es exploración de una vez: si bajo la base hay gas o agua salada, se mueve la perforadora una sola vez.
- **Por qué no una nuestra:** con vetas infinitas una muestra de yacimiento no gana nada y obligaría a conseguir la primera gota de crudo.
- **Cierra el círculo:** solo gasta EU. Las arenas bituminosas (veta `oilsands_vein`) dan además 2 000 mB de aceite pesado por polvo en la centrífuga (30 EU/t), una fuente de reserva (verificar que la perforadora entrega esa mena).

### Invernadero MV

- **Registro:** `gtceu:mv_greenhouse`, tipo `gtceu:greenhouse`, la misma spec que LV y `bores` con tope 16. Fertilizante por circuito y la misma tabla de cultivos: troncos, resina de goma, caña, patata, setas y bayas para pirólisis, biomasa y goma.
- **Decisión:** sin granja de árboles aparte: el invernadero ya junta troncos, resina y cultivos, y no hay pasos que unir.
- **Gana:** tope 16 y una entrada opcional de CO₂ (200 mB por ciclo): +50 % de salida y devuelve 100 mB de O₂, que vuelve al EBF. El CO₂ sigue siendo inerte y se puede vaciar (decisión 9 de LV); el invernadero y el metanol (`methanol_from_dioxide`: 6 000 mB de H₂ por 1 000 de CO₂) le dan uso. Viene del horno de arco y de destilar gas de madera y biomasa fermentada.
- **Cierra el círculo:** plantón o semilla sin gasto, agua de la bomba, fertilizante de la química. Troncos y cultivos alimentan pirólisis, biomasa y goma.

### Criaturas

- `gtceu:mv_creature_simulator` ya existe: `lv/creatures.js` registra el simulador de LV a EV. `mobs.json` trae en MV el creeper (4 pólvora por 1 salitre, 120 EU/t) y en HV el blaze (varas, 480 EU/t). MV no pide ningún modelo nuevo.
- Sin blaze en MV: en GTM el polvo de blaze sale de un reactor químico de HV (carbono + azufre, 480 EU/t) y la vara del simulador también es de HV. Las EnderChests de MV piden solo la perla del simulador de LV; el ojo de ender (emisores y sensores HV, portal del End) queda para HV.

### Fluidos base, sal y piedra

- **Aire, N₂ y O₂:** LV. El N₂ acelera la pirólisis (320 t en vez de 640, a 96 EU/t).
- **Agua y destilada:** bomba y alambique (`distill_water_small`, circuito 5). La destilada es medio de lavado y de enfriado de lingotes calientes.
- **Sal:** salmuera del yacimiento `salt_water_deposit` (perforadora de fluidos) o veta de sales + agua (mezclador) → electrólisis LV: 3 NaOH + 1 000 mB de Cl₂ + 1 000 mB de H₂ por 1 000 mB de salmuera. H₂ y O₂ también salen de la electrólisis del agua.
- **Piedra:** el polvo de piedra va al lodo (LV) o a `stone_dust_separation` (MV, 120 EU/t): cuarcita, feldespato, mármol, biotita, sodalita y mezcla de metales. La mezcla se guarda: separarla es EV (900 EU/t).
- **Cierra el círculo:** sal, azufre, madera, aceite y agua salen de la perforadora, el invernadero y la bomba. Lo demás es EU.

## Multibloques nuestros

### Planta de mineral: `gtceu:ore_plant` (el de la era)

Qué gana: **varios pasos en uno sin saltarse ninguno**. Hace la cadena completa de GTM (macerar, lavar, centrifugar con calor, macerar) en una pasada y entrega todos los secundarios. Con una escotilla procesa 3,6 menas/min: lo mismo que diez máquinas sueltas (4 maceradores, 3 lavadores y 3 centrífugas térmicas) con sus buses y un clasificador por secundario.

- **Tipo de receta:** `gtceu:ore_processing` (nuevo, verificar colisión de id).
- **Receta:** 1 mena en bruto (`raw_*`) + 2 000 mB de agua (o 200 mB de destilada con circuito 2) → 2 polvos + los tres secundarios de la cadena de GTM con su esperanza (≈80 %, ≈67 % y ≈28 %) + 4 polvo de piedra (el ripio). Energía de la cadena, sin descuento: 1 000 t a 40 EU/t (la cadena suelta gasta 39 200 EU por mena). El modificador de paralelos de LV (`bores`, tope 6) hace el resto: una escotilla MV (128 V) lleva 3 menas a la vez y dos, 6 (240 EU/t). Se generan desde `OreProperty` de GTM, sin tabla propia. Las menas con reactivo propio (persulfato, mercurio) lo piden en una escotilla de fluidos.
- **Estructura:** nave de 7×3×4 con tres estaciones: trituradora (2 `gtceu:steel_gearbox`), lavado (vidrio y escotillas de fluidos) y horno (`gtceu:heatproof_machine_casing`). Carcasa `gtceu:solid_machine_casing` ≥ 28, 1–2 escotillas de energía MV, bus de entrada, 2 buses de salida y 2 escotillas de fluidos (agua y reactivo).
- **Se fabrica con lo que sustituye:** casco MV + macerador, lavador de mineral, centrífuga térmica y centrífuga MV (`gtceu:mv_macerator`, `mv_ore_washer`, `mv_thermal_centrifuge`, `mv_centrifuge`) + 4 circuitos MV.
- **Qué no hace:** menas de gema (siguen al tamiz), separación electromagnética (HV) y el baño químico de menas especiales.
- **Por qué no es un cubo grande:** (1) su tipo de receta no existe en ninguna máquina de un bloque (mena + agua → polvos + secundarios + ripio); (2) misma salida y misma energía por mena que la cadena: gana pasos, buses y sitio, no rendimiento por EU; (3) pide condiciones (agua, reactivo, destino del ripio y de cada secundario), no cantidad.
- **Subproductos:** polvo de piedra (inerte): lodo o `stone_dust_separation`. Secundarios: cada uno a su línea. Si el bus se llena la planta se para: el ripio no se olvida.

### Biorrefinería: `gtceu:biorefinery` (segundo, recortable)

Qué gana: **rendimiento y pasos en uno**. El alambique saca una sola fracción por pasada y el resto no llega a producirse. La biorrefinería es una columna de capas que las recoge todas, pero solo de entradas orgánicas; el crudo y el aire líquido son de la torre de GTM en HV (circuitos EV).

- **Tipo de receta:** `gtceu:bio_distillation` (nuevo), generado de las recetas de `gtceu:distillation_tower` con entrada orgánica: subproductos del carbón vegetal, alquitrán, vinagre y gas de madera, biomasa (también fermentada), aceite de semilla, creosota, alquitrán y gas de carbón, ácidos diluidos. Mismas proporciones; EU/t ≤ 120 con la misma energía por receta, sin bonus.
- **Estructura:** torre de 3×3 con 4–8 capas, carcasa `gtceu:solid_machine_casing` y tubos `gtceu:steel_pipe_casing`, una escotilla de salida por capa, escotilla de entrada, bus de salida (fertilizante, polvo de madera), energía MV. Usa la clase de la torre de GTM (verificar desde KubeJS).
- **Por qué no es un cubo grande:** el alambique tiene 1 salida y la columna hasta 8, y no simplifica: obliga a dar destino a cada fracción. Ahí cruzan las líneas.
- **Después:** en HV la torre de GTM hace lo mismo y más; la biorrefinería queda como versión barata. Sin ella, las fracciones salen del alambique una por pasada.

### Descartadas

- **Cubos grandes** (GCYM y las `t_large_*` de Star Technology): solo velocidad. GTM trae los GCYM en IV.
- **Fábrica universal** (GTL): une máquinas de cualquier tipo y borra las líneas que dan identidad a MV (circuitos, polímeros).
- **Sistema de presión y vacío** (GCYS): pide Java y redes propias. Si hace falta, entra en HV con el cracker.
- **Motor de combustión multibloque** (hueco entre LV y EV en GTM): 16 generadores MV dan 2 048 EU/t con unos 85 mB/s de diésel. No hace falta.
- **Minero de roca madre de GTM** (`gtceu:mv_bedrock_ore_miner`): apagado por defecto (`doBedrockOres`) y sin vetas de roca madre. La perforadora de vetas nuestra ya hace ese trabajo con muestra.

## Líneas de proceso nuevas

| Línea | Pasos | Subproductos → destino |
|---|---|---|
| Silicio → chips | arena → SiO₂ (electrólisis, 8 arena por polvo) y carbón → carbono (centrífuga) → EBF Kanthal → baño químico → boule → cortadora → grabador → ILC y RAM | CO (2 000 mB por lingote, 64 000 por boule): metanol (`methanol_from_monoxide`: 4 H₂ por CO, 96 EU/t) o tanque (tóxico: se contiene, no se vacía). Ceniza (1/9): fertilizante |
| Pirólisis → fracciones | 16 troncos → horno (el circuito elige la fracción; con N₂ va el doble de rápido) → biorrefinería | Carbón vegetal (20 por tanda): resistencias, pólvora y carbón activado (con N₂), el filtro del traje. Creosota: lubricante (`distill_creosote`) o caldera. Fenol, benceno, tolueno y xileno: tanques para HV–EV (epoxi, SBR, gasolina); el sobrante, turbina de gas o generador. Metanol: biodiésel y acetato de metilo. Ácido acético y acetona: cola (acetato de vinilo → PVA) para el tablero fenólico. Gas de madera: turbina de gas (24 EU/mB) o destilado (metano a la turbina, CO₂ al invernadero o al metanol). Ceniza oscura (50 % del carbón): centrífuga a ceniza y carbono (el carbono vuelve al silicio) o fertilizante |
| Combustibles | crudo → alambique (una fracción por pasada; la torre de HV las recoge todas) → fracciones con azufre → desulfurar con H₂ (reactor LV) → 5 000 de ligero + 1 000 de pesado → mezclador → 6 000 de diésel. Biodiésel: aceite de semilla + metanol + sosa | H₂S: ácido sulfúrico (`sulfuric_acid_from_sulfide`). Gas de refinería: turbina de gas (160 EU/mB) o destilado (metano, etano, helio). Nafta: generador (320 EU/mB) o tanque para el cracker de HV. Glicerol del biodiésel: guardado para HV (con CO₂ da etileno). Diésel 480 EU/mB, biodiésel 256, etanol 192 |
| Etileno → PE y PVC | biomasa (cervecería) → alambique → 600 mB de etanol por 1 000; etanol + H₂SO₄ → etileno (120 EU/t) → PE; 2 Cl₂ + etileno → cloruro de vinilo → PVC | Ácido diluido: alambique, 2/3 de ácido + agua (lazo). HCl: vuelve (O₂ + HCl + etileno → cloruro de vinilo). NaOH: bisulfato → persulfato (placas) o catalizador del biodiésel. H₂: metanol y desulfuración. Polvo de madera de la destilación (50 %): tablero fenólico |
| Mineral → planta | perforadora → planta (agua) → polvos → aleaciones y EBF | Polvo de piedra (4 por mena): lodo o centrífuga MV. Secundarios: azufre, galio, indio, cobalto… cada uno a su línea |

## Puerta a HV

| Qué se construye | Qué prueba |
|---|---|
| Casco HV (`gtceu:hv_machine_hull`: carcasa HV de acero inoxidable, 2 placas de PE, 2 cables de oro) y escotilla de energía HV | el acero inoxidable y las placas de PE salen de sus líneas |
| 8 circuitos integrados avanzados (`gtceu:advanced_integrated_circuit`, `#gtceu:circuits/hv`) | silicio → boule → obleas → ILC y RAM, transistores con PE, electrum, cobre recocido y tablero bueno con cola funcionan en lote |
| Motor HV (varillas de inox, cable doble de plata, hilo doble de electrum) y bomba HV (tubo de inox, anillos de goma) | aleaciones, plata y goma sostenidas |
| Traje antipeligro completo (`gtceu:hazmat_*`: placas de PVC, goma, plomo, vidrio y un filtro de máscara de PE y carbón activado) | la línea de PVC cierra el lazo del HCl y la pirólisis con N₂ da el carbón activado |
| Central MV de 2 048 EU/t o más (diésel, etanol o gas), 2 búferes y transformador MV→HV (4 A → 1 A) | "sin ir justo": HV cabe con el búfer sobre el 50 % |
| EBF Kanthal con la boule corriendo y la planta con cromo y vanadio | MV funciona de verdad |
| Red AE2 con una CPU de 64k que fabrica el motor HV con patrones | AE2 sigue siendo la logística |
| Mineral, invernadero, simulador, perforadora de fluidos y planta 10 minutos sin tocarlos | la generación se sostiene sola |

Abre HV: casco y escotillas HV, cámara limpia (`gtceu:cleanroom`: casco HV, circuito HV, 3 filtros, 2 rotores de inox y 2 motores HV), cracker (`gtceu:cracker`), reactor químico grande (tubos de PTFE), caldera grande de acero y turbina grande de vapor (circuitos HV), torre de destilación (circuitos EV), perforadora de vetas HV (End) e invernadero HV.

## Mods e integración

| Mod | Slug | Uso en MV |
|---|---|---|
| Applied Flux | `appflux` | FE en la red AE2; recetas con circuitos MV y aluminio, EU→FE con los conversores de GTM |
| AE2WTLib y terminal de crafteo | `applied-energistics-2-wireless-terminals`, `ae2-wcwt` | terminales inalámbricos: batería GT + circuito MV (lv.md manda: MV) |
| EnderChests y EnderTanks | `enderchests`, `endertanks` | perla de ender del simulador de LV (fuente automática) + placas de aluminio y circuito MV |
| Productive Bees | `productivebees` | colmenas con circuito MV; panales por centrífuga y mezclador GT, sin menas directas |
| Sophisticated Backpacks y Storage Drawers de GT | `sophisticated-backpacks`, `gregtech-storage-drawers` | nivel 2: placas de aluminio y acero |
| Create y Greate | `create`, `greate` | sin cambios: ninguna receta de MV pasa por Create |

Ningún mod nuevo es obligatorio: máquinas, tipos de receta y brocas son KubeJS.

- **Startup:** tipos `gtceu:ore_processing` y `gtceu:bio_distillation`; máquinas `ore_plant`, `biorefinery`, `mv_vein_drill` y `mv_greenhouse` con el helper de patrones; `bores` recibe el tope por escalón (LV 8, MV 16, planta 6); ítem `grindless:vanadium_steel_drill_bit`. El `widen` de LV deja `greenhouse` en 2 fluidos de entrada (agua y CO₂) y 1 de salida (O₂).
- **Server:** generar `ore_processing` desde `OreProperty` y `bio_distillation` desde las recetas de la torre con entrada orgánica; la broca vanádica entra en `BITS` de `lv/vein_drilling.js`; variantes del invernadero con CO₂. Puertas de los mods de la tabla con circuitos MV.
- **Config:** `config/gtceu.yaml` ya activa `compat.energy.enableFEConverters`; se añade `worldgen.oreVeins.infiniteBedrockOresFluids: true`. Los peligros de GTM (`gameplay.hazardsEnabled`, activos por defecto) se quedan: el traje es parte de la puerta.
- **Misiones:** capítulo "Fábrica MV" con unas 12, una por paso, premio pequeño y sin bloquear recetas.
- **Pruebas:** (1) arranca; (2) planta, biorrefinería, perforadora e invernadero MV se forman y procesan; (3) mena → polvo + secundarios; troncos → pirólisis → fracciones; arena → silicio → boule → obleas → circuito HV, y `-Tier mv` sin huérfanas.

## Riesgos y dudas

- **Planta de mineral.** Unas 100 recetas generadas de `OreProperty`: secundarios que coinciden en dos etapas, menas de gema y con reactivo propio, ruido en EMI. El ritmo (3,6 o 7,2 menas/min) lo fija la potencia y la perforadora siempre sobra: si se queda corto, más escotillas o más plantas, nunca menos energía por mena. Alternativa: tabla propia solo para las excepciones.
- **Aceite en Llano y Vacío.** Los yacimientos por datos y la config infinita no están probados en dimensiones propias. Si no funcionan, la muestra de yacimiento (perforadora nuestra) pasa a ser la vía.
- **CO, H₂ y peligros.** El silicio suelta 64 000 mB de CO por boule y el metanol pide 4 H₂ por CO: el H₂ (electrólisis del agua; la salmuera deja cloro de sobra) se dimensiona con el silicio, o el CO se guarda en tanques. El metanol va a biodiésel, acetato de metilo y generadores (64 EU/mB). Hay que enseñar el traje antes de la química.
- **Biorrefinería.** Reusar la clase de la torre de GTM desde KubeJS no está comprobado (si falla, salidas a escotillas libres, sin capas) y en HV la torre la releva. Es la pieza recortable del alcance.
- **Heredado a HV.** El End (muestra de veta, portal), el ojo de ender (polvo de blaze del reactor químico HV), la separación de la mezcla de metales (EV) y el glicerol guardado deben tener dueño en el diseño de HV.

Créditos a anotar en `CREDITS.md`: planta de mineral (idea de GTMoreOreProcessing y GTE2, LGPL-3.0); controlador como suma de las máquinas que sustituye y entrada de CO₂ en el invernadero (ideas de Star Technology, MIT); columna de la biorrefinería (clase de la torre de GTM, LGPL-3.0); fábrica universal (GTL) y cubos grandes (Star Technology, GCYM) quedan como alternativas descartadas.

## Decisiones propuestas

1. **El End se queda en HV.** La tabla de vetas de MV es la de LV (Overworld y Nether).
2. **Aceite con la perforadora de fluidos de GTM** y vetas infinitas por config. No hay perforadora de fluidos nuestra.
3. **Dos multibloques nuestros:** planta de mineral (la de la era) y biorrefinería (recortable). Escalones de familia: perforadora (tope 16 de paralelos, abierto a balance) e invernadero MV; el simulador ya es el de LV.
4. **El CO va a metanol** (o a un tanque) y el CO₂ sigue siendo inerte: el invernadero y `methanol_from_dioxide` le dan uso y el invernadero devuelve O₂. No hay recetas nuestras de quemar CO.
5. **Sin blaze en MV.** En GTM el polvo de blaze es un reactor químico de HV y el ojo de ender queda para HV. La ceniza oscura va a la centrífuga (carbono para el silicio) o al fertilizante.
6. **Los peligros de GTM siguen activos** y el traje antipeligro es parte de la puerta.

## Decisiones tomadas (orquestador, 2026-10-24)

Se aprueban las seis propuestas, con estas precisiones:

- **EBF en MV:** el Kanthal y el inoxidable piden 480 EU/t en el EBF, así que el EBF de MV lleva **dos escotillas MV** (suben un tier, como las dos LV llevaban al aluminio). Hay que decirlo en la ruta y en las misiones.
- **Mantenimiento:** desactivado en todo el pack (ver `DECISIONS.md`). Los multibloques de GTM no piden escotilla de mantenimiento.

- **Aceite en Llano y Vacío.** Si los yacimientos por datos de GTM no funcionan en dimensiones propias, se usa una muestra de yacimiento con nuestra perforadora (misma familia que las vetas). No se mete una perforadora de fluidos nueva.
- **Productive Bees en MV.** Los panales solo dan materiales a través de máquinas GT (centrífuga y mezclador). Ninguna abeja da menas, lingotes ni polvos directamente. Es una segunda forma de automatizar, no un atajo.
