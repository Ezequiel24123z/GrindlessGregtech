# Cómo se trabaja en este repo

Gregtech Grindless es un pack de GregTech Modern (Minecraft 1.20.1, Forge) en el que nada se recolecta a mano. Antes de tocar nada, lee este archivo, `DECISIONS.md` y la última nota de `docs/sesiones/`.

## Estructura

| Ruta | Qué hay |
|---|---|
| `pack/` | Raíz de packwiz: `pack.toml`, `index.toml`, `mods/*.pw.toml`, `config/`, `defaultconfigs/`, `kubejs/`. |
| `pack/kubejs/startup_scripts/grindless/` | Registros: objetos, bloques, tipos de receta y máquinas. |
| `pack/kubejs/server_scripts/grindless/` | Recetas, integración de otros mods y eventos. |
| `pack/kubejs/data/grindless/` | Datapack: dimensiones, tags y loot. |
| `pack/kubejs/assets/grindless/` | Texturas, modelos e idiomas propios. |
| `pack/config/ftbquests/quests/` | Libro de misiones. |
| `docs/eras/` | Diseño corto de cada era. |
| `docs/sesiones/` | Nota de cierre de cada sesión. |
| `tools/test/` | Banco de pruebas remoto (ver su `README.md`). |

## Reglas del pack

1. Ningún recurso que la progresión pida de forma repetida se recolecta a mano por obligación. Picar a mano solo sirve para arrancar.
2. La dificultad sube por complejidad (pasos, condiciones, multibloques, líneas cruzadas), nunca por cantidad bruta ni por tiempos inflados.
3. Cada subproducto tiene un destino honesto. Lo inerte se puede tirar, lo peligroso se contiene y lo que servirá después se dice. Nada de recetas tontas.
4. Cada era tiene al menos un multibloque nuestro que gana algo: velocidad, rendimiento, una receta imposible en pequeño o varios pasos en uno.
5. Las misiones son cortas, en inglés, dan un premio pequeño y nunca bloquean recetas. Antes de escribir un capítulo se mira cómo lo resuelven otros packs. Se copia y adapta solo de los que tienen licencia que lo permite (ver `CREDITS.md`), siempre con atribución.
6. Si este archivo choca con lo que hace GTM 7.5.3, manda GTM.

## KubeJS

- **IDs:** objetos y bloques propios en `grindless:`. Máquinas y tipos de receta en `gtceu:`, porque así los registra GTM.
- **Patrones:** los multibloques se definen siempre a través del helper de patrones de `pack/kubejs/startup_scripts/grindless/`. Cuando llegue GTM 8.0, se cambia el helper y no cada multibloque.
- **Datos:** las tablas (vetas, cultivos…) viven en archivos de datos y las recetas se generan desde ellas. No se escriben a mano recetas repetitivas.
- **Texto:** los nombres de objetos y máquinas van en `en_us` (inglés) y `es_es` (español). Las misiones van solo en inglés.
- **Integración:** las recetas de otros mods que rompan la progresión se rehacen para que pasen por máquinas de GregTech.
- **Rhino (KubeJS 6):** dentro de funciones o callbacks que se ejecutan más de una vez, usa `var` y no `const`/`let`. Si no, salta "redeclaration of var".
- **Nombres vanilla (KubeJS 2001.6.5):** algunos miembros cambian de nombre para los scripts y el de Mojang no existe: `getYRot`/`getXRot` son `getYaw`/`getPitch`, `getStringUUID` es `getStringUuid`, `tickCount` es `age` y `Level#getGameTime` es `getTime`; `Entity#level()` está oculto (usa `getLevel()`). Lista completa en `tools/test/README.md`. Lo que use un jugador se prueba en la suite `client`.

## packwiz

- **Binario:** packwiz no tiene releases; se descarga de `https://nightly.link/packwiz/packwiz/workflows/go/main/Windows%2064-bit.zip`.
- **Añadir un mod fijado:** `packwiz mr add <url de la versión>`. Después, comprueba el `side` en su `.pw.toml`.
- **Índice:** tras cambiar archivos dentro de `pack/`, ejecuta `packwiz refresh`. `index.toml` no se edita a mano.
- **CurseForge:** solo entra un mod si permite distribución o si tiene una URL oficial de descarga.

## Pruebas

- **Banco:** `tools/test/Invoke-GGTest.ps1`. Sube el pack al PC de casa, arranca servidor o cliente limpios y devuelve los logs.
- **PC de casa:**
  - Acceso: `ezequiel@192.168.1.150`.
  - Solo se escribe dentro de `D:\GregtechGrindless`.
  - Nunca se tocan la carpeta de PrismLauncher del usuario, `D:\Grindless` ni su `.minecraft`.
  - Solo una JVM a la vez; el banco usa un candado.
  - Los clientes de prueba arrancan con todo el sonido a cero (`Set-GGClientOptions` en `tools/test/remote/gg-client.ps1`). El usuario los oye si no.
- **Qué probar por tier (2-3 pruebas):**
  1. El pack arranca y crea mundo.
  2. Nuestros multibloques se forman y procesan.
  3. Integración: las recetas existen, la generación automática funciona y la puerta al tier siguiente se puede fabricar.
- **Si una prueba falla:** se arregla y se repite esa, no todas.
- **No se vuelve a probar lo que ya está probado:**
  - Si un mecanismo ya pasó su prueba en partida (un multibloque que forma y procesa, un tipo de receta, una tabla que genera recetas), el contenido nuevo que solo lo usa no se prueba otra vez en partida. Por ejemplo: más recetas en un multibloque o más filas en una tabla.
  - Ese contenido se valida barato: el validador de recetas (`tools/analysis`), las comprobaciones estáticas y que el pack arranque sin errores de KubeJS.
  - Se prueba en partida solo lo nuevo, lo que cambia el mecanismo o algo que ya falló antes.
  - Antes de lanzar una prueba cara, hay que poder decir qué duda nueva resuelve.
  - Al etiquetar una versión se pasan las pruebas de lo que ha cambiado y las del tier nuevo, no la batería entera.
- **Scripts de prueba:** van en `tools/test/overlay/` y no se publican con el pack.
- **Zonas de prueba:** los tests se lanzan casi a la vez en el mismo servidor, así que cada uno construye y limpia solo su franja del Overworld (Y 98–112). Las franjas tienen 64 bloques de ancho en X y empiezan en Z 0:

  | Test | X |
  |---|---|
  | vapor | 0–31 |
  | criaturas | 64–95 |
  | AE2 | 64–79, pero en Z 64–79 |
  | multibloques LV | 256–319 |
  | planta MV | 512–575 |
  | multibloques MV | 768–831 |
  | multibloques HV | 1024–1087 |
  | refinería HV | 1280–1343 (Y 98–113) |
  | planta EV | 1536–1599 |
  | multibloques EV | 1792–1855 |
  | planta IV | 2048–2111 |
  | multibloques IV | 2304–2367 |

  Para un test nuevo se sigue en saltos de 256.

## Licencias

- Antes de copiar algo, mira su licencia en `CREDITS.md`.
  - MIT o LGPL: se puede usar con atribución.
  - GPL, no comercial o todos los derechos reservados: solo ideas.
- Toda idea, multibloque o asset nuevo se anota en `CREDITS.md`.

## Memoria del proyecto

- `DECISIONS.md`: una línea por decisión importante.
- `CREDITS.md`: origen y licencia de cada idea, multibloque o asset.
- `docs/sesiones/AAAA-MM-DD.md`: al cerrar sesión, qué funciona, qué está roto y qué viene después.

## Git

- Cuenta personal `Ezequiel24123z`, nunca la corporativa.
- Commits pequeños y con mensaje claro.
- **Versiones:** antes de etiquetar (`vX.Y.Z`), sube `version` en `pack/pack.toml` y pasa `tools/Update-PackIndex.ps1`. Solo se etiqueta lo que ha pasado las pruebas del tier.

## Canal jugable

El usuario juega mientras se desarrolla.
- **Rama `jugable`:** es su canal. Solo avanza a una etiqueta `vX.Y.Z` que haya pasado las pruebas: `git push origin vX.Y.Z^{commit}:refs/heads/jugable`.
- **Al moverla:** se le manda un resumen corto con qué hay de nuevo y qué cambia en su partida.
- **Instancia de Prism:** la genera `tools/prism/Build-PrismInstance.ps1` y está en la versión de GitHub `canal-jugable`. Se actualiza sola al arrancar con packwiz-installer-bootstrap, así que solo se rehace si cambian la URL del canal o el bootstrap.
- **Partidas compatibles:**
  - No se quita un objeto, bloque o fluido registrado. Se deja registrado y oculto en EMI, con una receta que lo convierte 1:1 en su sustituto (como la broca de titanio).
  - Las dimensiones no cambian de id.
  - Si cambia la forma de un multibloque, la nota de la versión lo dice, porque el jugador tiene que rehacerlo.
  - Los cambios de vetas y de mundo solo afectan a los chunks nuevos o a las recetas.
