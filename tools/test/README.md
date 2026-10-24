# Banco de pruebas (PC de casa)

Sube `pack/` (más `tools/test/overlay/`) al PC de casa, arranca un servidor o un cliente **limpios** (mundo nuevo, sin estado previo) y devuelve logs y un resumen PASS/FAIL. Todo lo pesado corre allí, en `D:\GregtechGrindless`; aquí solo se lanza y se lee.

## Cómo se llama

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Suite server `
  -Commands 'kubejs custom_command gg_ping' -WaitForLog 'GGTEST\|PING\|PASS'
```

| Suite | Qué hace | Éxito |
|---|---|---|
| `server` | Forge dedicado (mundo normal, semilla fija), arranca hasta `Done`, ejecuta `-Commands` por RCON, espera los `-WaitForLog`, para con `stop`. | Arranca, los comandos responden, los marcadores aparecen, parada limpia. |
| `client` | HeadlessMC + mc-runtime-test: crea un mundo en un jugador y sale. El cliente es el **real** del pack (Embeddium, ImmediatelyFast, …) con OpenGL por software (ver "Cliente sin GPU"). | Salida 0, `Successfully finished.`, sin crash report. |
| `both` | Servidor y luego cliente (una sola reserva del PC). | Los dos. |

Parámetros útiles (todos opcionales):

- `-Commands 'cmd1;;cmd2'` comandos RCON en orden, o `-CommandsFile` (uno por línea). **Con `-File`, PowerShell no separa listas con comas: usa `;;`.**
- `-WaitForLog 'regex1;;regex2@@90'` expresiones que deben aparecer en `logs\kubejs\server.log` o `latest.log` (el `@@90` fija su plazo en segundos; por defecto `-WaitTimeoutSec 180`).
- `-Flat` mundo plano; `-Seed`; `-ServerXms/-ServerXmx` (4G/7G); `-ServerProp 'difficulty=peaceful'`.
- `-BootTimeoutSec` (900), `-ClientTimeoutSec` (1800), `-CommandTimeoutSec` (300), `-LockWaitMin` (120).
- `-ClientRenderer mesa|stub` (por defecto `mesa`) y `-ClientExclude 'regex;;regex'` (solo útil con `stub`; ver abajo).
- `-Strict` también falla con etapas WARN, líneas ERROR no permitidas o errores de KubeJS.
- `-SkipRefresh` (solo si el índice ya está fresco: el banco lo comprueba antes de subir y avisa si no), `-PackDir`, `-OverlayDir`, `-OutDir`, `-ShowWarnings`.
- No existe `-KeepServerRunning`: el servidor siempre se para al acabar.

Antes de subir, `tools\Update-PackIndex.ps1` deja los textos de `pack/` en UTF-8 sin BOM y LF y ejecuta `packwiz refresh`.

## Cliente sin GPU ni ventana

El PC de casa se maneja por SSH (sesión 0 de Windows: sin monitor ni escritorio), y el `-lwjgl` de HeadlessMC es un stub cuyo `glFenceSync` devuelve 0, que revienta Embeddium (`Failed to create fence object`, sin opción de configuración). Por eso el modo por defecto (`-ClientRenderer mesa`) usa **OpenGL real por CPU** y no toca el conjunto de mods:

- **Mesa llvmpipe** (pal1000/mesa-dist-win 26.2.4): `opengl32.dll` de Mesa junto a `java.exe` en una **copia privada** del JDK 17 (`D:\GregtechGrindless\tools\jdk17-mesa`; el JDK del sistema no se modifica) y `GALLIUM_DRIVER=llvmpipe`. Da OpenGL 4.6 sin GPU. El banco comprueba que la JVM del juego cargó `opengl32.dll`/`libgallium_wgl.dll` de Mesa (`Mesa llvmpipe GL confirmed` en la etapa `client-launch`) y el overlay registra `GGTEST|CLIENT-GL|renderer=…`.
- **LWJGL real**: HeadlessMC activa su stub si va `--offline` con cuenta "offline"; una cuenta falsa de otro proveedor en `hmc\home-mesa\.auth` lo evita (el juego solo registra un 401 de autenticación, que está en el allowlist).
- **Sin monitor**: se pone `earlyWindowControl = false` en `config\fml.toml` solo del cliente de prueba (la ventana de arranque de Forge aborta sin monitor).
- **Aviso "ajustes experimentales"**: como el pack trae datos de worldgen, Minecraft pregunta al crear el mundo y mc-runtime-test no sabe contestar. `overlay/kubejs/startup_scripts/gg_test_client.js` pulsa "Sí" (evento de tick de Forge; el `ClientEvents.tick` de KubeJS no dispara sin mundo).
- Para ir ligero se fuerza `renderDistance:4`, `simulationDistance:5`, `maxFps:30`. Si el cliente se cuelga, `-ClientTimeoutSec` lo mata y deja `hang-jstack.txt` y `hang-jcmd.txt` (hilos y pantallas vivas) en `results\client\`.

`-ClientRenderer stub` (HeadlessMC `-lwjgl`, sin OpenGL) **no sirve para este pack**; queda solo como plan B para packs pequeños. Probado con el cliente real: el stub tumba primero Embeddium (`Failed to create fence object`, no tiene opción de configuración), luego ModernFix (`StbStitcher`: `Struct cannot be cast to STBRPRect`) y luego LDLib de GTM (`GL Shader Allocation Fail!`); quitarlos a todos ya no es "el cliente real". Por defecto el stub quita solo Embeddium (`-ClientExclude '^embeddium[-_+0-9]'`; `-ClientExclude none` para no quitar nada). Nunca se toca `pack/`.

## Resultado

Sale por consola y se guarda en `-OutDir` (por defecto `…\files\test-runs\<fecha>-<suite>\`):

- `summary.txt` / `summary.json`: etapas con estado y duración, líneas `GGTEST|`, crash reports (con la causa), errores de KubeJS, líneas `ERROR` que no están en `log-allowlist.txt`.
- `results\server\` y `results\client\`: `logs\latest.log`, `debug.log`, `logs\kubejs\*.log`, `crash-reports\`, `hs_err\`, `kubejs-exported\` (lo que un test escriba en `kubejs/exported/`), `mods.txt`, `rcon.log`; en el cliente también `client-hmc-stdout.log` y, si se cuelga, `hang-jstack.txt`/`hang-jcmd.txt`. Ojo: HeadlessMC mata el juego en cuanto aparece un crash report, así que puede salir vacío (la causa se saca entonces del log).
- Código de salida: `0` PASS, `1` FAIL, `2` fallo del propio banco (sin resultados).

FAIL si falla una etapa, hay crash report o alguna línea `GGTEST|…|FAIL`. Las etapas `WARN` (errores de KubeJS, parada forzada) no fallan salvo con `-Strict`.

## Escribir un test (overlay)

Los scripts de `tools/test/overlay/` se copian **encima** de la instancia en el PC de casa y nunca van en el pack. Ejemplo (`overlay/kubejs/server_scripts/gg_test_harness.js`):

```js
ServerEvents.customCommand('gg_ping', event => { console.info('GGTEST|PING|PASS'); return 1 })
```

Se lanza con `-Commands 'kubejs custom_command gg_ping'`. Convención de salida: `GGTEST|<suite>|<comprobación>|PASS` o `|FAIL (detalle)`; el resumen las cuenta y cualquier `FAIL` hace fallar la ejecución. `GGTEST|READY` sale al cargar el servidor. El overlay también se aplica al cliente (ahí van `startup_scripts/gg_test_client.js` y `client_scripts/gg_test_client.js`).

Truco de KubeJS 6.5 (Rhino) observado aquí: dentro de manejadores de eventos, `const`/`let` pueden lanzar `redeclaration of var X`; usa `var` y `function () {}`. Y `ClientEvents.tick` de KubeJS solo dispara con mundo y jugador cargados.

`log-allowlist.txt`: una regex .NET por línea con los ERROR/WARN benignos; mantenla corta y concreta.

## El PC de casa

- Solo se escribe en `D:\GregtechGrindless` (`tools`, `cache`, `sync`, `hmc`, `incoming`, `runs`). Nunca en PrismLauncher, `D:\Grindless` ni `.minecraft`.
- **Una sola JVM a la vez**: `runs\.lock` guarda PID y hora (latido cada 30 s; caduca a los 60 min o si el PID ya no existe). Quien espera hace cola (FIFO) y consulta cada 15 s. Al coger el candado se matan JVM huérfanas de esas carpetas. Cualquier experimento a mano que use una JVM debe coger el mismo candado y llevar un plazo corto.
- Cachés: Forge por versión (`cache\forge-server`), mods por pack y lado (`sync\`, los descarga packwiz-installer una vez), cliente de HeadlessMC (`hmc\`), Mesa y su JDK privado (`tools\mesa`, `tools\jdk17-mesa`). Cada ejecución copia lo sincronizado a `runs\<id>\`; se conservan las 3 últimas.
- Un mod de CurseForge sin distribución hace fallar `sync-*`: deja su jar en `D:\GregtechGrindless\cache\manual-mods\`.
- Los scripts remotos (`tools/test/remote/*.ps1`) se copian en cada ejecución a `tools\remote\<hash>\`.

## Archivos

`Invoke-GGTest.ps1` (entrada local) · `Show-GGResults.ps1` (resumen; sirve para releer un `-OutDir` viejo) · `log-allowlist.txt` · `overlay/` · `remote/` (`gg-common`, `gg-tools`, `gg-server`, `gg-client`, `gg-collect`, `Run-GGTest`).
