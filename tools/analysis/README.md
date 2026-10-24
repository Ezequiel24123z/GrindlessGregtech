# Validador estático de progresión

Comprueba, tier por tier y **sin comandos**, dos cosas sobre el pack tal como queda cargado (recetas finales tras los scripts):

1. **Puerta** (paso 1): la puerta al siguiente tier se puede fabricar. Se permite recoger a mano lo que está en el mundo.
2. **Automático** (paso 2): los recursos base los reponen máquinas (perforadora de vetas, invernadero, bomba, trituradora de rocas...), no manos. Solo cuenta lo que se recoge a mano una vez para arrancar.

## Cómo se ejecuta

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\analysis\Invoke-Reachability.ps1 -Tier steam
```

Un solo comando: sube `pack\` y un overlay mínimo (solo `gg_dump.js`) al PC de casa con `tools\test\Invoke-GGTest.ps1`, arranca un servidor limpio, lanza `kubejs custom_command gg_dump`, recoge `kubejs\exported\*.json` y ejecuta `reachability.mjs` con Node. Tarda 2-8 min (más si el PC está ocupado: una sola JVM a la vez). El informe sale por pantalla y en `tools\analysis\out\<fecha>-<tier>\report-<tier>.txt/.json`. Código de salida: `0` PASS, `1` FAIL/WARN, `2` fallo de la herramienta.

| Opción | Efecto |
|---|---|
| `-SkipDump [-DumpDir <carpeta>]` | no arranca el servidor; reutiliza un volcado (por defecto el último, `out\latest.txt`) |
| `-Pass gate\|auto` | solo la puerta o solo la generación automática |
| `-Explain <texto>` / `-Detail` | derivación completa de los objetivos que contengan el texto / de todos |
| `-NodeExe <ruta>` | Node ≥ 18; si falta se busca `$env:GG_NODE`, el PATH, `.work\node` y, si no hay, se descarga un Node LTS portátil (zip oficial, con SHA-256) |

Solo el análisis, a mano: `node tools\analysis\reachability.mjs --tier steam --dump <carpeta> [--pass gate|auto] [--explain texto] [--json salida.json] [--quiet]`.
Pruebas del propio validador: `node tools\analysis\test\run.mjs`.

## El volcado (`tools/test/overlay/kubejs/server_scripts/gg_dump.js`)

Solo en el overlay de pruebas, nunca en el pack. Escribe en `kubejs/exported/`: `recipes.json` (todas las recetas finales con su JSON crudo; `a:1` = añadida por un script), `tags.json` (miembros de cada etiqueta que usa una receta), `items.json` (objetos y fluidos registrados), `machines.json` (máquinas GT y sus tipos de receta), `veins.json` (vetas por capa y dimensión) e `info.json`. Marcadores en el log: `GGTEST|dump|COLLECTED|READY|DONE|FAIL`.

## Cómo razona

- **Recursos**: objetos (`gtceu:coke_gem`), fluidos (`fluid:gtceu:steam`), máquina construida (`m:<id>`) y máquina funcionando (`run:<id>` = construida + lo que gasta al operar). Una ranura de receta se cumple con cualquier alternativa (miembros de la etiqueta).
- **Capital** (no se gasta; basta con tenerlo una vez): muestra, herramienta, pieza de multibloque, fluido adyacente (`chance 0`). **Catalizador**: gasto por probabilidad (la broca).
- **Máquinas**: una receta solo vale si hay una máquina del tier que acepte su tipo y su EU/t (`maxEUt`; las de vapor rechazan más de 32).
- **Paso 1**: punto fijo mínimo desde el mundo. PASS/FAIL por objetivo; un FAIL lleva la **cadena mínima de bloqueo** y las raíces que faltan (sin receta, solo a mano, máquina inexistente, etiqueta vacía...).
- **Paso 2**: "se sostiene" = derivación bien fundada desde fuentes que no gastan nada (perforadora, invernadero, bomba, trituradora) donde solo el combustible de las máquinas y los catalizadores pueden cerrar el círculo (vapor → perforadora → carbón → caldera → vapor; la broca sale del bronce que sale de perforar). Los ciclos sin fuente (comprimir ↔ descomprimir) no cuentan. Estados: sostenido (PASS), finito (WARN: minero de vapor, se agota), solo arranque, solo a mano, imposible.

## Configuración (`tiers/<tier>.json`)

`unconditionalTypes` (crafteo: siempre), `typeAliases`, `ignoreTypes` (globs), `toolTags`, `fluidContainers`, `conditions` (`adjacent_fluid`, `cleanroom`, `research`...), `world[]` (qué da el mundo: `manual`|`auto`, `bootstrap`, `via` = máquina que lo repone, `finite`, `enabled:false`, `template`+`fromVeins` para las menas del registro de vetas), `machines[]` (`machine`, `types`, `maxEUt`, `needs`, `parts`), `machinesFromRegistry[]` (todas las `gtceu:lv_*`, p. ej.), `synthetic[]` (calderas, energía: reglas que no son recetas), `targets[]` y `autoTargets[]` (`item`|`fluid`|`anyOf`|`allOf`|`kind:"recipe"`; en `autoTargets`, `without:["sintética:caldera-solar"]` exige sostenerse sin esas reglas, globs sobre sus nombres; `allowFinite:true` acepta fuentes que se agotan). `extends` hereda de otro tier; `inheritTargets` hereda también sus objetivos. `lv.json` es un esqueleto (energía `eu:lv` y máquinas LV del registro).

## Límites

- Cualitativo: ignora cantidades, tiempos y rendimientos; una salida con probabilidad cuenta como producida. Dice que la producción *existe* y se sostiene, no que *alcance* para el consumo.
- Las partes de los multibloques de `machines[].parts` se copian a mano de `pack/kubejs/startup_scripts/grindless/steam/machines.js`; el validador avisa si un id no existe, no si el patrón cambió.
- El mundo es una lista honesta pero manual: sin botín de mobs (`enabled:false`) y sin menas vanilla (GTM las quita; salen de las vetas de GT).
- No entran las recetas de reciclaje que GT inyecta en tiempo de ejecución ni las de AE2 (`ae2:*` ignoradas hasta LV). Cables, hatches y amperios no se modelan.
