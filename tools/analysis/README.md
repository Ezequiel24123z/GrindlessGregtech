# Validador estático de progresión

Comprueba, tier por tier y **sin comandos**, dos cosas sobre el pack tal como queda cargado (recetas finales tras los scripts):

1. **Puerta** (paso 1): la puerta al siguiente tier se puede fabricar. Se permite recoger a mano lo que está en el mundo.
2. **Automático** (paso 2): los recursos base los reponen máquinas (perforadora de vetas, invernadero, bomba, perforadora de fluidos, trituradora de rocas...), no manos. Solo cuenta lo que se recoge a mano una vez para arrancar.

## Cómo se ejecuta

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\analysis\Invoke-Reachability.ps1 -Tier mv   # steam | lv | mv
```

Un solo comando: sube `pack\` y un overlay mínimo (solo `gg_dump.js`) al PC de casa con `tools\test\Invoke-GGTest.ps1`, arranca un servidor limpio, lanza `kubejs custom_command gg_dump`, recoge `kubejs\exported\*.json` y ejecuta `reachability.mjs` con Node. Tarda 2-8 min (más si el PC está ocupado: una sola JVM a la vez). El informe sale por pantalla y en `tools\analysis\out\<fecha>-<tier>\report-<tier>.txt/.json`. Código de salida: `0` PASS, `1` FAIL/WARN, `2` fallo de la herramienta.

| Opción | Efecto |
|---|---|
| `-SkipDump [-DumpDir <carpeta>]` | no arranca el servidor; reutiliza un volcado (por defecto el último, `out\latest.txt`) |
| `-Pass gate\|auto` | solo la puerta o solo la generación automática |
| `-Dimension all\|<id>` | dimensión donde está la fábrica; `all` (por defecto) recorre las de `contexts` del tier (Overworld, `grindless:flat`, `grindless:void`) y da un veredicto global |
| `-Explain <texto>` / `-Detail` | derivación completa de los objetivos que contengan el texto / de todos |
| `-NodeExe <ruta>` | Node ≥ 18; si falta se busca `$env:GG_NODE`, el PATH, `.work\node` y, si no hay, se descarga un Node LTS portátil (zip oficial, con SHA-256) |

Solo el análisis, a mano: `node tools\analysis\reachability.mjs --tier mv --dump <carpeta> [--dimension <id>|all] [--pass gate|auto] [--explain texto] [--json salida.json] [--quiet]`.
Pruebas del propio validador: `node tools\analysis\test\run.mjs`.

## El volcado (`tools/test/overlay/kubejs/server_scripts/gg_dump.js`)

Solo en el overlay de pruebas, nunca en el pack. Escribe en `kubejs/exported/`:

- `recipes.json`: todas las recetas finales con su JSON crudo (`a:1` = añadida por un script); `tags.json`: miembros de cada etiqueta que usa una receta; `items.json`: objetos y fluidos registrados.
- `machines.json`: máquinas GT y sus tipos de receta; `veins.json`: vetas de mena por capa y dimensión.
- `fluid_veins.json`: yacimientos de la perforadora de fluidos de GTM (fluido, peso, rendimientos y dimensiones donde pueden salir; `dims: null` = todas).
- `config.json`: interruptores de la config de GTM que deciden la progresión (`worldgen.oreVeins.infiniteBedrockOresFluids`, `machines.enableMaintenance`, `machines.doBedrockOres`, `gameplay.hazardsEnabled`, `compat.energy.enableFEConverters`). Lo que no se puede leer queda en `null`: el análisis nunca supone un valor por defecto.
- `structures.json`: descripción en datos de los patrones de multibloque del pack (`global.grindless.structures` de `lib/patterns.js`); `info.json`.

Marcadores en el log: `GGTEST|dump|COLLECTED|READY|STRUCTURES|DONE|FAIL`.

## Cómo razona

- **Recursos**: objetos (`gtceu:coke_gem`), fluidos (`fluid:gtceu:steam`), máquina construida (`m:<id>`) y máquina funcionando (`run:<id>` = construida + lo que gasta al operar). Una ranura de receta se cumple con cualquier alternativa (miembros de la etiqueta).
- **Capital** (no se gasta; basta con tenerlo una vez): muestra, herramienta, pieza de multibloque, fluido adyacente (`chance 0`). **Catalizador**: gasto por probabilidad (la broca).
- **Máquinas**: una receta solo vale si hay una máquina del tier que acepte su tipo, su EU/t (`maxEUt`) y su temperatura (`ebf_temp` contra las bobinas).
- **Paso 1**: punto fijo mínimo desde el mundo. PASS/FAIL por objetivo; un FAIL lleva la **cadena mínima de bloqueo** y las raíces que faltan (sin receta, solo a mano, máquina inexistente, etiqueta vacía, yacimiento que no admite la dimensión...).
- **Paso 2**: "se sostiene" = derivación bien fundada desde fuentes que no gastan nada (perforadora, invernadero, bomba, trituradora, perforadora de fluidos) donde solo el combustible de las máquinas y los catalizadores pueden cerrar el círculo (vapor → perforadora → carbón → caldera → vapor; la broca sale del bronce que sale de perforar). Los ciclos sin fuente (comprimir ↔ descomprimir) no cuentan. Estados: sostenido (PASS), finito (WARN: se agota), solo arranque, solo a mano, imposible.
- **Energía**: claves abstractas `eu:lv`, `eu:mv`, `eu:hv` (las dan turbinas, generadores y transformadores del tier) y `ae:power`; no hay cables ni amperios. **Tensión de un multibloque** (GTM 7.5.3, `WorkableElectricMultiblockMachine.getMaxVoltage`): con 2 o más escotillas de energía del nivel más alto cuenta un escalón más (V[nivel+1]), da igual el amperaje; la receta cabe si su nivel de tensión es ≤ el de la máquina. `energy: {voltage, hatches?}` lo calcula: dos escotillas LV = 128 V (MV), dos MV = 512 V (HV); `hatches` sale del patrón (`structures.json`) en los multibloques del pack y se declara en los de GTM. Las máquinas de un solo bloque (`gtceu:lv_*`, `gtceu:mv_*`) se quedan en la tensión de su escalón. **EBF**: `coilTemp` (cuproníquel 1800 K, Kanthal 2700 K) + 100 K por escalón sobre MV.
- **Dimensión**: la fábrica está en una sola dimensión (`dimension`, por defecto Overworld). Una receta con condición de dimensión solo vale donde dice, y los yacimientos de fluidos solo cuentan si su filtro admite esa dimensión.

## Configuración (`tiers/<tier>.json`)

- **Base**: `unconditionalTypes` (crafteo y transformaciones en el mundo, p. ej. `ae2:transform`: siempre), `typeAliases`, `ignoreTypes` (globs), `toolTags`, `fluidContainers`, `conditions` (`adjacent_fluid`; `cleanroom`, `research`, `environmental_hazard` y `ae2_circumstance_explosion` no se pueden cumplir; el resto se ignora; una condición numérica con tope, `{"field":..,"max":..}`, descarta las recetas que piden más), `contexts` (dimensiones que recorre `--dimension all`).
- **`world[]`** (lo que da el mundo): `mode` `manual`|`auto`, `bootstrap`, `via` (máquina que lo repone), `finite`, `enabled:false`, `items`, `template`+`fromVeins`+`overrides` (menas del registro de vetas), `dimensions` (solo en esas), `requires:[{config,equals}]` (solo si la config de GTM vale eso), `sustainedIf:{config,equals}` (si no, la fuente se agota: WARN) y `fromFluidVeins` (`true` o `{fluids:[..]}`: fluidos de los yacimientos de `fluid_veins.json` que admiten la dimensión).
- **`machines[]`**: `machine`, `id` (variante: el mismo objeto con otra energía o bobina), `types`, `maxEUt`, `needs`, `parts`, `partsFromStructure`, `partAbilities` (de esta máquina, tapa clave a clave los del tier), `energy`, `coilTemp`, `optional`. `machinesFromRegistry[]`: todas las máquinas de un bloque con un prefijo (`gtceu:mv_`) y su `maxEUt`. `partAbilities`: qué objetos cumplen cada pieza de un patrón (`energy_input` → escotillas LV y MV...). `synthetic[]`: calderas, transformadores, generadores, `ae:power`: reglas que no son recetas (`consumes`, `capital`, `produces`, `fuelOf`).
- **`targets[]` y `autoTargets[]`**: `item`|`fluid`|`anyOf`|`allOf`|`kind:"recipe"` con `type`, `output`, `input` (un id o una lista: la receta debe tenerlos todos) y `dimension`. Opciones: `without:["sintética:caldera-solar"]` (sostenerse sin esas reglas, globs sobre sus nombres), `allowFinite:true`, `optional:true` (si falla da WARN y no tumba el veredicto), `expect:"unreachable"` (en `targets`, comprobación de fuga: PASS si NO se consigue en este tier) o `expect:"not-automatic"` (en `autoTargets`: PASS si ninguna máquina lo repone solo). `targetsFromVeins[]`/`autoTargetsFromVeins[]` generan un objetivo por veta del registro (`{id}` = id de la veta sin el trozo `_vein`; `requireItem` salta las vetas cuyo objeto —la muestra de la tabla de la perforadora— no existe: son de otros mods y el informe las lista).
- **Herencia**: `extends` hereda de otro tier (listas y mapas se suman; un elemento del hijo con el mismo id sustituye al del padre), `inheritTargets` hereda también sus objetivos (regresión) y `dropTargets:[ids]` quita los que ya no valen (una fuga del LV que en MV deja de serlo).
- **Multibloques del pack**: con `partsFromStructure:true` las piezas salen de `structures.json` (carcasa con mínimo, piezas por habilidad, marcos, tuberías), traducidas con `partAbilities`; `parts` queda de reserva y el análisis avisa si el volcado no trae la estructura. **AE2**: `ae2:inscriber`, `ae2:charger` y `ae2:transform` se leen como recetas; el inscriptor y el cargador necesitan `ae:power`.

## Qué cubre cada tier

- **steam**: coque → bronce → vapor → acero → turbina LV, circuito LV y casco LV; en automático, menas, troncos, resina, piedra, agua, carbón y coque con perforadora, invernadero y bomba.
- **lv** (hereda steam): máquinas LV del registro, multibloques LV, simulador de criaturas, electrodo, entradas de AE2, puerta a MV (aluminio por el EBF con 2 escotillas LV, casco MV, circuito MV, transformador LV→MV); en automático, menas del Nether con lodo (un objetivo por veta), criaturas, silicio, polvo del cielo, obsidiana, N₂/O₂, ácido sulfúrico, fertilizante y aire en las tres dimensiones. Fugas: `auto-lava-no-automatica`.
- **mv** (hereda lv): red MV (transformador, turbina y generadores), máquinas MV, EBF con escotillas MV y bobina Kanthal, horno de pirólisis, perforadora de fluidos de GTM, nuestras perforadora e invernadero MV, planta de mineral, biorrefinería (opcional) y broca vanádica, aceros, silicio → boule → obleas → chips, PE, PVC, diésel, traje antipeligro y puerta a HV (casco, 8 circuitos avanzados, motor y bomba HV, transformador MV→HV); en automático, petróleo (necesita `worldgen.oreVeins.infiniteBedrockOresFluids: true`), metanol, etanol, etileno, O₂ del invernadero con CO₂, polvos de la planta y las cadenas de aleaciones, silicio y plásticos. Fugas: el ojo de ender y el blaze no salen antes de HV.

## Límites

- Cualitativo: ignora cantidades, tiempos y rendimientos; una salida con probabilidad cuenta como producida. Dice que la producción *existe* y se sostiene, no que *alcance* para el consumo. El yacimiento de salmuera de GTM solo sale en océanos y no se cuenta.
- Las partes de los multibloques que NO son del pack (coke oven, PBF, bomba primitiva, EBF, pirólisis, perforadora de fluidos...) se copian a mano en `machines[].parts`; las de los del pack salen de `structures.json`. El validador avisa si un id no existe, no si un patrón de GTM cambió. De GTM solo están los multibloques que declara cada tier: las recetas de los demás (reactor químico grande, congelador de vacío, craqueo, torre de destilación, compresor de implosión...) cuentan como "sin máquina" (por prudencia: puede dar un FAIL de más, nunca un PASS de más).
- El mundo es una lista honesta pero manual: sin botín de mobs (`enabled:false`) y sin menas vanilla (GTM las quita; salen de las vetas de GT).
- No entran las recetas de reciclaje que GT inyecta en tiempo de ejecución ni `ae2:entropy`/`matter_cannon`/`facade`. Cables, escotillas y amperios no se modelan: que una red MV aguante 4 A o que los 16 generadores quepan no se comprueba.
- Las condiciones de receta se ignoran salvo las de `conditions`; la dimensión se comprueba en todas las recetas con condición de dimensión.
