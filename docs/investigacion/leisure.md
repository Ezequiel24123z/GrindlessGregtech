# GregTech Leisure (GTL) → Gregtech Grindless: qué nos llevamos

Investigación pura, sin tocar el repo. Pregunta del usuario: boost de power (calderas/turbinas/combustible), red de energía inalámbrica (¿covers?, ¿LV?), y todo el QoL/multibloques propios de GTL.

## 0. Fuentes y método

- **Copia local de GTL** (instancia `GTL1452-CurseForge-original`, "Factoria Plana EN", GTL **1.4.5.2**, GTLCore **1.2.3.1-fix9**, mc1.20.1): `session-state/.../research/gtl-raw/` — `cfg/gtceu.yaml` y `cfg/gtlcore.yaml` reales, `kubejs/` real (startup/server scripts, 17 300 líneas en `gtceu.js`), `jars/_list_*.txt` (listados de .jar, sin binarios), `jars/gtlcore_classes_*.txt` (nombres de clase del bytecode decompilado, solo para localizar qué hace cada cosa — no se reproduce código), `gtceu_recipes.tsv` (volcado de recetas), `machines_table2.md` (las 158 estructuras, generado en una sesión anterior).
- Ya había una investigación previa (sesión anterior) volcada en `gtl_body.md`/`gtl_appx.md` dentro de esa misma carpeta: la reaproveché y la verifiqué/amplié en vez de repetirla. `CREDITS.md` y `docs/viaje.md` ya tenían un veredicto previo ("GTL: licencia poco clara, solo ideas"); lo confirmo con texto legal exacto más abajo.
- **Web/GitHub:** repo del modpack (`EasterFG/GTLCore` es el único remanente público del núcleo, `nutant233/*` da 404 hoy), Modrinth/CurseForge de cada addon, y el código fuente de los mods que SÍ son nuestros (LGPL/MIT) vía búsqueda semántica de su repo.
- Nuestro pack: `pack/mods/*.pw.toml`, `pack/config/gtceu.yaml` (el real, 7 líneas), `AGENTS.md`, `CREDITS.md`, `docs/viaje.md`, y el script `pack/kubejs/server_scripts/grindless/integration/gtca.js` (decisiones ya tomadas sobre GTCA que afectan directamente la pregunta de power).

---

## 1. Licencias

### 1.1 El modpack GTL (configs, KubeJS, misiones)

| Dónde | Licencia declarada | Evidencia |
|---|---|---|
| Zip de la instancia (raíz) | **CC BY-NC-SA 4.0** (Atribución-NoComercial-CompartirIgual) | Archivo `LICENSE` en la raíz de la instancia, texto verbatim de CC, fechado 2026-08-14. Copia local: `research/gtl-raw/LICENSE`. |
| La misma página de CurseForge del modpack | **LGPLv3** | Campo "License" del proyecto CurseForge `gregtech-leisure` (id 1695369, autor **nutant233**). |

**Esto ya es una contradicción de origen**: el propio autor declara dos licencias incompatibles para el mismo contenido (CC-BY-NC-SA es *compartir-igual*, "viral" sobre el texto/datos; LGPLv3 es una licencia de software de bibliotecas, pensada para código, no para assets/quests). No hay forma de que ambas sean ciertas a la vez. El usuario cree que GTL es permisivo: **no lo es** — en el mejor caso (LGPLv3) solo cubre código con atribución y aviso de cambios; en el peor (CC-BY-NC-SA, lo que de verdad firma el `LICENSE` del zip) cualquier copia literal de sus scripts/misiones contagiaría *ShareAlike* a lo nuestro.

### 1.2 Los mods específicos de GTL

| Mod | Licencia declarada | Evidencia | Nota |
|---|---|---|---|
| **GTLCore** (núcleo: 158 multibloques, 74 tipos de receta, ~270 mixins) | "LGPLv3.0" (campo `mod_license`) | `gradle.properties` del repo público `EasterFG/GTLCore` (rama `gtl-1431`, v1.1.1): `mod_license=LGPLv3.0`, sin archivo `LICENSE`. | El repo público se detiene en v1.1.1; nuestra copia es la 1.2.3.1-fix9, código privado sin repo visible (`nutant233/GTLCore` → 404 hoy). El propio README de GTL confiesa partes de Gregicality Legacy (GPL-3.0), GTNH (LGPL-3.0/"Other"), Twist Space Technology (GPL-3.0) y **Epimorphism Modern (AGPL-3.0)** — una etiqueta "LGPL" no se sostiene sobre código derivado de GPL/AGPL. |
| **GTMThings** (hatches/covers inalámbricos — ver §3) | `mods.toml` interno dice `license = "LGPLv3.0"` | `other/gtmthings_mods.toml` en la copia local | **CurseForge y el repo del autor (`liansishen/GTMThings`) lo marcan "All Rights Reserved"** (sin LICENSE en GitHub). Build `1.3.5.b` usada por GTL es un fork privado, no está en Modrinth. Veredicto: **no redistribuible**, pese al `mods.toml`. |
| ad_astra_rocketed (cohetes T5-T7) | **All rights reserved** (celsiusqc) | `mods.toml` embebido | Dependencia dura del viaje interplanetario de GTL. |
| ae2CraftingTree / Useful Clipboard | All rights reserved | `mods.toml` embebido | QoL de AE2 de GTL. |
| wildcard_pattern (build `-gtl`) | MIT | `mods.toml` embebido | Único mod "propio del pack" con licencia limpia. |
| GTMUtils / GTCA / GTM Extended Features (**ya en nuestro pack**, no son de GTL) | **LGPL-3.0** los tres | Modrinth API: `KMnOsM3N`, `jIPykDYO`, `9MCfIDeI` | No son mods de GTL; los menciono porque resuelven piezas equivalentes a GTLCore/GTMThings (§2 y §3). |

### 1.3 Texturas

El propio `README.md` de GTL confiesa (sección "鸣谢作品" = "obras agradecidas") que no son suyas:

> 部分处理线，多方块结构，**纹理**来自 Gregicality Legacy / GTNH / Twist Space Technology / Gregicality Science / **Mekanism** / Deeper And Darker.

Ni GTL tiene derecho a re-licenciar esas texturas (Gregicality Legacy GPL-3.0, GTNH LGPL-3.0, Twist Space Tech GPL-3.0, Mekanism MIT, Deeper And Darker AGPL-3.0). **Nunca copiar un PNG de GTL.**

### 1.4 Veredicto honesto (el usuario cree que es permisivo — no lo es del todo)

| Qué | Veredicto |
|---|---|
| ¿Incluir el jar de GTLCore o GTMThings vía packwiz? | **No.** GTLCore: sin repo público de nuestra versión, mixins atados a GTM 1.4.4, procedencia GPL/AGPL bajo etiqueta LGPL insostenible. GTMThings: ARR en CurseForge. |
| ¿Copiar scripts KubeJS o misiones literalmente? | **No.** CC-BY-NC-SA (ShareAlike) contagiaría nuestra licencia; y la propia CurseForge dice LGPL para el mismo contenido — demasiado contradictorio para confiar. |
| ¿Copiar texturas? | **Nunca** — ni GTL tiene derecho a cederlas. |
| ¿Reimplementar la idea/mecánica/números con nuestro propio código? | **Sí.** Ideas, proporciones y topologías no son copyrightables; es lo que ya hace `CREDITS.md` ("ideas only"). Dar crédito a "GregTech Leisure (nutant233 et al.)" y, cuando GTL mismo lo cite, a GTNH/TST/Gregicality Legacy/GT++ en nuestro `CREDITS.md`. |
| Nota menor | Nuestro `CREDITS.md` cita "GT Community Pack… LGPL-2.1"; el `LICENSE` real del repo (`GregTechCEu/GregTech-Community-Pack`, verificado por la API de GitHub) es **LGPL-3.0** (coincide con lo que GTL también declara para el mismo origen). Vale corregir la cita; no cambia ninguna conclusión. |

---

## 2. Power: cómo infla GTL la generación

**Nuestro `pack/config/gtceu.yaml` actual tiene 7 líneas** (`enableFEConverters: true`, `infiniteBedrockOresFluids: true`, `enableMaintenance: false`) — no toca ni una sola clave de energía. Partimos de los valores por defecto de GTM 7.5.3 al 100 %.

### 2.1 Calderas pequeñas (de un bloque) — `machines.smallBoilers` en `cfg/gtceu.yaml`

Archivo real de la instancia GTL: `research/gtl-raw/cfg/gtceu.yaml`. El propio archivo trae en comentario el valor por defecto de GTM (el mismo mod, mismo proyecto Modrinth `7tG215v7` que el nuestro — ver §3.3 para la prueba de que es el mismo mod, no un fork):

| Clave | Default GTM | Valor en GTL | Factor |
|---|---|---|---|
| `solidBoilerBaseOutput` (caldera sólida) | 120 | **960** | ×8 |
| `hpSolidBoilerBaseOutput` (sólida alta presión) | 300 | **2400** | ×8 |
| `liquidBoilerBaseOutput` (líquida) | 240 | **1920** | ×8 |
| `hpLiquidBoilerBaseOutput` (líquida alta presión) | 600 | **4800** | ×8 |
| `solarBoilerBaseOutput` (solar) | 120 | **960** | ×8 |
| `hpSolarBoilerBaseOutput` (solar alta presión) | 360 | **2880** | ×8 |

Las seis variantes están multiplicadas por **exactamente ×8**, mB de vapor/segundo a temperatura máxima. Es un único factor global, aplicado a mano a cada clave (no hay una clave "multiplicador de calderas" única).

### 2.2 Calderas grandes (multibloque) — `machines.largeBoilers`

| Clave | Default GTM | Valor en GTL | Factor |
|---|---|---|---|
| `steamPerWater` (conversión agua→vapor) | 160 | **160** | **×1 — sin cambios** |
| `bronzeBoilerMaxTemperature` | 800 | **6400** | ×8 |
| `bronzeBoilerHeatSpeed` | 1 | 1 | ×1 |
| `steelBoilerMaxTemperature` | 1800 | **12800** | ×7,11 |
| `steelBoilerHeatSpeed` | 1 | **2** | ×2 |
| `titaniumBoilerMaxTemperature` | 3200 | **25600** | ×8 |
| `titaniumBoilerHeatSpeed` | 1 | **4** | ×4 |
| `tungstensteelBoilerMaxTemperature` | 6400 | **51200** | ×8 |
| `tungstensteelBoilerHeatSpeed` | 2 | **8** | ×4 |

Lectura: **la proporción vapor:agua no cambia** (sigue costando 1 mB de agua por 160 mB de vapor); lo que sube es el **techo de temperatura** (×8, menos en la caldera de acero, que sube "solo" ×7,11 — posiblemente para no romper la escalera LV-vapor/MV-acero) y la **velocidad de calentamiento** (bronce igual, acero ×2, titanio ×4, tungstensteel ×4). Con el techo más alto y el calentamiento más rápido, una caldera llega antes a un régimen que antes era inalcanzable y lo sostiene con el mismo combustible por ciclo de calor — de ahí el "mucho más vapor" sin tocar el coste de agua.

### 2.3 Quemadores/turbinas (EU por mB de combustible): **sin cambios encontrados**

Busqué en los tres sitios donde GTM permite tocar esto y **ninguno toca combustión/gas/semifluido/vapor estándar**:

1. `cfg/gtceu.yaml` no tiene ninguna clave de eficiencia de generador (revisado completo, arriba está el único bloque de energía).
2. Los 74 tipos de receta que registra GTLCore (`research/gtl-raw/recipetypes.txt`) solo añaden **4** de categoría `generator`: `SEMI_FLUID_GENERATOR_FUELS` (mismo id que el de GTM — referencia, no redefinición, usada por el "Chemical Energy Devourer" de IV para fusionar varios combustibles en un controlador), `ROCKET_ENGINE_FUELS` y `NAQUADAH_REACTOR` (nuevos, generadores propios de GTLCore) y `SUPERCRITICAL_STEAM_TURBINE_FUELS` (turbina propia nueva, id `supercritical_steam_turbine`). **No aparecen** `combustion_generator`, `gas_turbine`, `steam_turbine` ni `plasma_generator` en esa lista — es decir, GTLCore no los toca.
3. `kubejs/server_scripts/gtceu.js` (17 300 líneas) solo tiene dos recetas que *mencionan* turbinas, y son de **ensamblaje del ítem** (fabricar el bloque "Supercritical Steam Turbine"/"Supercritical Mega Steam Turbine" en un ensamblador), no recetas de combustible.

**Conclusión importante para la petición del usuario**: GTL **no** hace "que las turbinas consuman menos" ni sube el EU/mB de los generadores estándar — el vapor normal, el combustión, el gas y el semifluido siguen con los valores de fábrica de GTM. Lo que GTL hace es **alimentar las mismas turbinas con muchísimo más vapor** (calderas más grandes/calientes) y, para quien quiera más, ofrece generadores *nuevos y alternativos* (Supercritical Steam Turbine, Naquadah Reactor, Chemical Energy Devourer) con sus propios números — no un multiplicador global de eficiencia.

### 2.4 ¿Multiplicador global de combustible/duración?

`cfg/gtlcore.yaml` (el config del *mod*, no de GTM) trae `durationMultiplier: 1.0` — es decir, **ni siquiera GTL acelera recetas globalmente**; su `oreMultiplier: 4` es solo para minado, no aplica a combustible. No existe un "multiplicador de combustible" global en ninguno de los dos archivos de configuración.

### 2.5 Ya tuvimos esta conversación: GTCA y "energía de la nada"

Antes de recomendar nada, ojo con esto: **ya instalamos GT Community Additions (GTCA, LGPL-3.0, lo tenemos)**, que trae un *Steam Pressurizer* → *Turbina de alta presión/sobrecalentada* y un *Extreme Heat Exchanger* → *Supercritical (SHD) Steam Turbine* — mecánicamente **el mismo tipo de cadena** que querríamos copiar de GTL (vapor normal → procesarlo → mucho más EU por mB). Pero `pack/kubejs/server_scripts/grindless/integration/gtca.js` ya **las quitó todas**, con esta razón escrita en el propio script:

> «el mod no tiene interruptor de configuración y construye sus recetas en Java, así que todo se hace aquí» … «Steam Pressurizer (HV) 6 400 mB de vapor + 480 EU → 640 mB de vapor de alta presión que vale 8 000 EU en una turbina (el vapor valía 3 200): **energía de la nada**» … «Extreme Heat Exchanger + turbina SHD: plasma de fusión → vapor supercrítico → 3,4-3,7× el EU de la turbina de plasma de GTM para el mismo plasma»

Es decir: **ya identificamos y rechazamos explícitamente** una cadena de "vapor mejorado = mucho más EU por el mismo combustible" por romper la regla de que "ningún addon procesa más barato que GT en su era". Si ahora el usuario quiere más power "a la Leisure", hay que decidir **conscientemente** si:
- (a) se sube un multiplicador de calderas estilo GTL (como §2.1/2.2, transparente, afecta a todo el mundo igual, no reintroduce las recetas ya retiradas), o
- (b) se reconsidera la cadena de GTCA que ya se quitó (reabrir esa decisión).

No tomo esa decisión aquí (es investigación); solo la dejo señalada porque el usuario pidió "verificar honestamente" y esto es un choque directo con una decisión ya tomada en este mismo pack.

### 2.6 Dónde vive cada cosa (resumen para implementar más tarde)

| Qué | Dónde |
|---|---|
| Salida de calderas pequeñas/grandes, temperatura, velocidad de calentamiento | `pack/config/gtceu.yaml` → añadir bloque `machines.smallBoilers` / `machines.largeBoilers` (hoy ausente = valores de fábrica) |
| EU/mB de combustión, gas, semifluido, vapor estándar | **No configurable por YAML ni KubeJS de forma soportada** — son propiedades Java por combustible/tier en GTM; GTL tampoco las toca. Un cambio aquí exigiría un addon Java o aceptar que solo se toca el lado "calderas". |
| Generadores nuevos con su propio EU/mB (Naquadah Reactor, Supercritical Steam Turbine, Chemical Energy Devourer) | Específicos de GTLCore, no redistribuible (§1). Lo equivalente nuestro-compatible ya instalado es GTCA (retirado por decisión previa, §2.5) y GTM Extended Features (no toca combustibles). |

---

## 3. Red de energía inalámbrica

### 3.1 Cómo funciona en GTL — no son covers, son hatches con "frecuencia"

El mecanismo de GTL **no vive en GTLCore**: vive en un mod aparte, **GTMThings** (autor `liansishen`, mod id `gtmthings`, build `1.3.5.b` empaquetada dentro de GTL). Evidencia: `other/gtmthings_mods.toml` (dependencia dura `gtceu [1.4.2-SNAPSHOT,)`) y el listado de assets del jar (`jars/_list_gtmthings.txt`), que contiene modelos `assets/gtmthings/models/block/machine/part/wireless_energy_hatch.json` y `wireless_energy_hatch_16a.json` — son **hatches de parte** (`part/`), no covers.

Descripción funcional (核心模组/CurseForge, verificada por búsqueda web dirigida a la página y al repo del autor):

- El "无线能源仓" (**wireless energy hatch**) es un hatch normal que se coloca en un multibloque (o en una máquina de un bloque) igual que cualquier hatch de energía.
- Cada hatch tiene una **frecuencia** y se **vincula automáticamente a tu red eléctrica o a tu equipo de FTB Teams** (clic derecho para cambiar de dueño/desvincular).
- Se **rellena/drena solo, cada tick**, desde esa frecuencia — funciona **entre dimensiones**.
- Hay variantes por tramo de amperaje: **LV-HV** y **EV-MAX** (múltiples amperajes), es decir, hay un hatch de voltaje bajo utilizable desde LV, y otros de voltaje/amperaje mayor para más adelante — **no es una sola pieza "desbloqueada en LV que ya sirve para todo"**: el techo de potencia de cada hatch sigue el tier en que se fabrica.
- Aparte de la energía, GTL tiene por separado (créditos de `gtl_appx.md`, confirmado en el catálogo por era): **wireless covers**, **wireless monitor/interface** (para ver/gestionar una máquina a distancia) — esto sí son covers, pero son para *monitorización*, no para transporte de EU.

**Licencia (repetido de §1 porque es la pieza crítica aquí): GTMThings es "All Rights Reserved"** según CurseForge y el repo del propio autor (sin LICENSE). **No podemos incluir ese jar.** Y GTL usa una build privada `1.3.5.b` no publicada siquiera en Modrinth, atada a GTM `1.4.2+` (versión vieja, ver §3.3).

### 3.2 ¿Lo que ya tenemos nos sirve? — sí, con matices, y ya lo tenemos instalado

Repasé exactamente los mods que cita el propio usuario (`pack/mods/*.pw.toml`):

| Mod nuestro | Licencia | Qué hace de verdad (código fuente, no solo la descripción) | ¿Sirve para "wireless EU desde LV, pocos cables"? |
|---|---|---|---|
| **eup2p** "EU P2P Tunnel" (`pack/mods/eup2p.pw.toml`, MIT, repo `lostmyself8/EUP2P`) | MIT | Es un **P2P Tunnel de AE2** (como los de ítems/fluidos/FE que ya existen), especializado en EU: `EUP2PTunnelPart extends CapabilityP2PTunnelPart<…, IEnergyContainer>`. Dos tuneles con la misma frecuencia en **la misma red ME** transportan EU entre sí sin tender cable de GT entre ambos puntos. Se obtiene en la pestaña de AE2 y se sintoniza con clic derecho de un cable/alambre de GTM. | **Sí, ya disponible, sin tocar nada.** Requiere tener ya una red ME en ambos extremos (que es justo nuestra columna de transporte entre eras, según `docs/viaje.md`), no requiere ningún tier de GT concreto más allá de lo que ya pida tener AE2. |
| **gregtech-modern-utilities** "GTMUtils" (`pack/mods/gregtech-modern-utilities.pw.toml`, LGPL-3.0, repo `Omicron-Industries/GregTech-Modern-Utilities`) | LGPL-3.0 | Trae un verdadero **puente inalámbrico multibloque**: `WEBHubMachine` / `WEBReceiverMachine` (antes llamado "Wireless Active Transformer"/PTERB). Cada uno tiene una `frequency` (int); el Hub junta la energía de sus hatches de entrada locales y la vuelca a un mapa global indexado por frecuencia **y dimensión** (`ResourceKey<Level>` + `BlockPos`), el Receiver la saca de ahí — **sí es cruzado entre dimensiones**, igual que GTMThings. Tiene sistema de refrigerante opcional (`UtilConfig.webCoolantBaseDrain`/`webCoolantIOMultiplier`, ambos en 0 por defecto = desactivado) y puede explotar si GTM no tiene "transformadores activos inofensivos". | **Mecánicamente sí, pero NO está a LV**: su receta (`UtilRecipes.java`, assembly line) pide placas de **Neutronium ×32**, sensores/emisores/generadores de campo **UV**, circuitos **UHV** — es decir, está gateado a **UHV**, como sucesor del Active Transformer. No hay ningún hatch "de un bloque" para máquinas sueltas en este mod. |
| **gtm-extended-features** "Extended Features" (LGPL-3.0-only) | LGPL-3.0 | Tiene hatches ópticos inalámbricos (datos/investigación) y lo admite en su propio README: *"Potential additions: Wireless ME/Stocking hatches, **Wireless EU**, Wireless CWU"* — **todavía no existe**, está en su lista de planes, no implementado. | No, hoy no. |
| **appflux** "Applied Flux" (LGPL-3.0, repo `GlodBlock/ExtendedAE`) | LGPL-3.0 | Celdas de ME que guardan **FE** (Forge Energy), no EU de GT directamente. | No es EU; solo sirve si se pasa por un convertidor EU↔FE (los 64A Energy Converters de GTMUtils, o el `enableFEConverters` que ya tenemos activado en `gtceu.yaml`). |
| **gtca** / **gtnn** / **gtceu-terminals** | LGPL-3.0 | Ninguno trae transporte inalámbrico de EU. | No. |

### 3.3 Sobre la "opción A" (incluir el jar de GTM/GTLCore)

Confirmé con la API de Modrinth que **nuestro GTM (`gtceu-1.20.1-7.5.3`) y el de GTL (`GregTechCEu 1.20.1-1.4.4`) son el mismo proyecto de Modrinth, `7tG215v7`** (nuestro `.pw.toml` descarga de `cdn.modrinth.com/data/7tG215v7/…`, exactamente el mismo id que cita la investigación previa para la build de GTL). O sea: **GTL no usa un fork de GTM**, usa una build *mucho* más vieja del mismo mod (su numeración "1.4.4" es un esquema de versión anterior al "7.x" que usamos ahora; mismo proyecto, ~año y medio de distancia aprox., con cambios de API constantes: el propio changelog de 7.5.3 toca cosas internas de recetas/hatches). GTLCore son ~270 mixins contra esa build vieja y depende de bloques `kubejs:*` que solo existen si cargas también el KubeJS de GTL (CC-BY-NC-SA). **Opción A descartada**, confirmando lo que ya concluyó la investigación previa.

### 3.4 Recomendación

**Combinar Opción C (lo que ya tenemos) con una adaptación pequeña, no Opción A ni Opción B pura:**

1. **Ya hoy, sin cambios:** quien no quiera tender cable de GT puede usar el **EU P2P Tunnel** en cuanto tenga red ME — en nuestro pack eso es pronto (LV/MV, columna de transporte ya decidida en `docs/viaje.md`). Esto ya cubre el caso de uso real que describe el usuario ("ayuda para quien no quiera usar muchos cables") sin escribir una línea de código.
2. **Para un verdadero "hatch inalámbrico" como el de GTL, con reparto por frecuencia y entre dimensiones:** el único camino con licencia limpia y ya instalado es el **WEB Hub/Receiver de GTMUtils (LGPL-3.0)** — mecánicamente es *lo mismo* que GTMThings (ambos son primos del Active Transformer de GTM), pero viene gateado a **UHV**, no a LV. Para parecerse a GTL habría que **re-tierarlo por KubeJS**: quitar su receta de ensamblaje (`assembly_line`, UHV) y añadir una propia en un tier bajo — esto es legal (LGPL permite modificar) y técnico (es una receta de `assembly_line`, se puede sustituir con el patrón que ya usa `gtca.js` para otras recetas). Yo **no** recomiendo bajarlo literalmente a LV tal cual lo pide el usuario: nuestra propia regla de progresión ("la energía es una habilidad de cada era") y el precedente de §2.5 (ya se retiró una mecánica de GTCA por "potencia barata antes de tiempo") apuntan a que el punto correcto es más bien **HV** — que es, de hecho, el mismo tier en que **el propio GTL** empieza a permitir hatches inalámbricos en *multibloques* (el LV de GTL es solo para máquinas sueltas de un bloque). Dejar el single-block / P2P a LV y el puente multibloque a HV reproduce la curva real de GTL, no solo su titular de marketing ("está en LV").
3. **No tocar nada de GTMThings ni de ningún jar de GTL** — su único camino limpio es reimplementar la idea (que es exactamente lo que GTMUtils ya hizo de forma independiente).

---

## 4. QoL y multibloques propios — lista completa por era

Fuente primaria de esta sección: `machines_table2.md` (las 158 estructuras de GTLCore, generadas del bytecode decompilado: id, tier de receta, crédito en el tooltip, tipo(s) de receta, tamaño) cruzado con la prosa por era de `gtl_body.md` (qué gana cada una). Columna **Reutilizable**: todo es "solo ideas" (§1); indico entre paréntesis si GTL mismo créditó una fuente externa (esa fuente tiene su propia licencia, no la de GTL). Columna **Conflicto** marca choques con nuestras reglas: **[V]** minero/recurso sin veta o planeta, **[C]** "creativo"/sin coste real, **[P]** paralelos/cantidades absurdas, **[$]** mercado de monedas, **[Pl]** rompe exclusividad planetaria (extrae de un planeta sin ir).

### 4.1 QoL que no es un multibloque (herramientas, red, entorno)

| Función | Tier | Qué gana | Implementación | Reutilizable | Conflicto |
|---|---|---|---|---|---|
| Red de energía inalámbrica (hatches por frecuencia) | LV (1 bloque) → HV (multibloque) → 16A | Evita tender cable | GTMThings (Java, ARR) | No (ARR) — ver §3 | — |
| Wireless covers / wireless monitor / wireless interface | LV | Ver/gestionar una máquina a distancia | GTMThings (Java, ARR) | No (ARR) | — |
| Scanner de datos mundiales (World Data Scanner) → `overworld/nether/end_data` | LV→EV | "Escanea una vez" y el dato (no consumible) habilita recolectores de gas/mineros de vacío/incubadoras para siempre | GTLCore (Java) | Idea sí | [V] si se usa para minar sin veta |
| Patrones AE2: wildcard pattern tool, throughput monitor, ME Pattern Relay, Pattern Modifier, Configuration Copy Tool, Pattern Box (36/página), ME Pattern Buffer (aislado, proxy, 72 slots) | LV→UHV | Logística de patrones a gran escala sin miles de Interfaces | `wildcard_pattern` (MIT, reusable tal cual) + GTLCore (mixins AE2, no reusable) | Parcial (solo la MIT) | — |
| Hatches de ambiente: Cleaning (HV) → Sterile (ZPM) → Law (UEV); Gravity Control Hatch (0/1-99/100, UV) | HV→UEV | Sustituyen la sala limpia / emulan gravedad cero o alta sin ir a una estación | GTLCore (Java) | Idea sí — GTM ya trae cleanroom y hatch de limpieza; lo nuevo es "ambiente como pieza" | — |
| Mantenimiento: Auto Maintenance Hatch, Configurable Maintenance Hatch | HV→IV | Nunca se avería / tiempo de receta ajustable sin más EU | GTLCore (Java) | Idea con matiz | [C] la Configurable (tiempo gratis, ver §4.4) |
| Pila de investigación: Research Station + Object Holder + HPCA + fibra óptica, Data Access Hatch → Data Bank → hatches ópticos (cableados/inalámbricos) | LuV→UHV | Investigación como recurso (CWU/t) | GTM de serie + GTLCore (hatches inalámbricos) | Idea sí (ya tenemos Extended Features con hatches ópticos inalámbricos, LGPL) | — |
| Pequeño mercado de misiones ("Small Market"): créditos → Bottle of Time, Fermium flight armour, Vajra, ítems de Avaritia | — | Atajos comprables | Misiones + Re-Avaritia | No | [$] |

### 4.2 Multibloques — Vapor, LV, MV (ULV→MV)

| Nombre (id) | Tier | Qué gana | Impl | Reutilizable | Conflicto |
|---|---|---|---|---|---|
| Familia de multibloques de vapor pequeños (martillo, compresor, fundición de aleación, mezclador, baño, lavadora — 6 bloques) | Vapor | **8 paralelos** sobre la receta de un bloque | GTLCore (`LargeSteamParallelMultiblockMachine`) | Idea sí | — |
| Familia "Large Steam X" (macerador, centrífuga, térmica, baño, lavadora, ensamblador — 7 bloques) | Vapor→LV | **64 paralelos**; el de circuitos usa un núcleo de Ensamblador Molecular de AE2 | GTLCore | Idea sí | — |
| Steam Oven (de serie, retocado) | Vapor | 256 paralelos en horno | GTM + ajuste | Idea sí | — |
| **Dimensionally Transcendent Steam Oven / Dirt Forge** (`dimensionally_transcendent_steam_oven`, `_dirt_forge`) | Vapor | Sin energía, **524 288 paralelos** | GTLCore (créd. GTNH) | Idea (GTNH, sin licencia clara → solo ideas) | **[C][P]** atajo puro, puente de acero sin coste |
| **Primitive Void Ore Miner** (`primitive_void_ore`, apagado por config) | Vapor | 64 minerales en bruto aleatorios **por tick** | GTLCore | Idea | **[V][P]** |
| Ancient Reactor Core (altar 3×3) | Vapor | Abre la dimensión "Ancient World" (mineral más rico) | KubeJS | Idea | — |
| Generator Array (`generator_array`) | LV | Hasta 16 generadores apilados, salida ×2; modo "red inalámbrica" | GTLCore | Idea | — |
| Industrial Slaughterhouse (`slaughterhouse`) | LV | Granja de mobs: circuito 1/2 elige lista pasiva/hostil, drops virtuales (sirve en Pacífico) o entidades reales | GTLCore | Idea | — |
| Universal Factories: Processing (11 tipos), Assembly (2), Separation (7), Mixing (4) — `processing_plant`, `assemble_plant`, `separated_plant`, `mixed_plant` | MV | Metes el bloque de un solo tier dentro del controlador; un 3×3×3 cubre 11-24 tipos de receta | GTLCore (créd. GTNH) | Idea (GTNH) | — |
| Advanced Multi Smelter (`advanced_multi_smelter`) | MV | Funde **recetas distintas a la vez** (paralelo cruzado); +2× paralelo por cada 900 K de más | GTLCore | Idea | [P] si se deja crecer sin tope |
| Greenhouse (`greenhouse`) | MV | Auto madera/resina/cultivos con luz de cielo | GTLCore | Idea — ya tenemos el equivalente en GTCA (`green_house`), **retirado por nuestro propio `gtca.js`** por ser más barato que nuestra familia de invernaderos | — |
| Weather Controller (`weather_control`) | MV | Circuito 1/2/3 = clima despejado/lluvia/tormenta | GTLCore | Idea | — |
| Lava Furnace (`lava_furnace`) | MV | Horno sin combustible, alimentado por lava | GTLCore | Idea | — |

### 4.3 Multibloques — HV, EV, IV

| Nombre (id) | Tier | Qué gana | Impl | Reutilizable | Conflicto |
|---|---|---|---|---|---|
| Cleaning Maintenance Hatch | HV | Sala limpia dentro de cualquier multibloque | GTLCore | Idea | — |
| Desulfurizer (`desulfurizer`) | HV | Desulfuración en un paso, paralelo cruzado | GTLCore | Idea | — |
| **Fishing Ground** (`fishing_ground`) | HV→EV | Catalizador de pesca + tabla de botín: comida, Damascus, **moneda de oro antigua, fragmentos de Zero-Point-Module** | GTLCore | Idea | **[C]** el botín de ZPM es batería creativa por azar |
| Void Miner (`void_miner`) | EV (receta HV) | Fluido + lechada de gema + dato → 1 de 22 vetas del Overworld, ~20 %/intento | GTLCore | Idea | **[V]** mineral sin veta real, aunque exige una línea previa |
| Large Greenhouse (`large_greenhouse`) | EV | Cultivos/árboles con sol simulado, sin necesitar cielo | GTLCore | Idea | — |
| Large Gas Collector (`large_gas_collector`) | EV→LuV | Gases simulados por catalizador de datos, sin estar en la dimensión | GTLCore | Idea | [Pl] roza la exclusividad planetaria |
| Large Recycler (`large_recycler`) | EV | Basura/objetos → chatarra, ×4 paralelo/tier sobre EV | GTLCore (créd. ninguno) | Idea — nosotros ya quitamos el equivalente de GTCA (`recycler`, scrap box de ítem aleatorio) por `gtca.js` | — |
| Wireless ME Network (núcleo AE2 + marcador) | EV | Cualquier hatch de ME se une a la red sin cable, cruzando dimensión | GTLCore + mixins AE2 | No (mixins) | — |
| **24 máquinas "Large X" estilo GCyM** (Arc Smelter, Assembler, Autoclave, Brewer, Centrifuge, Chemical Bath, Circuit Assembler, Cutter, Distillery, Electrolyzer, Electromagnet, Engraving Laser, Extractor, Extruder, Maceration Tower, Material Press, Mixer, Packer, Pyrolyse Oven, Rock Crusher, Sifting Funnel, Solidifier, Wiremill — ver `machines_table2.md` filas `large_*`) | IV | ×0,6 tiempo, ×0,8 EU, hatch de paralelo; algunas fusionan 2-4 tipos de receta | GTLCore | Idea | — ("mismo bloque, más grande" — solo las que fusionan tipos aportan complejidad real) |
| Alloy Blast Smelter / Blaze Blast Furnace (créd. GT++) / Cold Ice Freezer (créd. GT++) | IV | Funde mezclador+EBF en un paso; BBF fijo ×64 con Liquid Blaze; freezer fijo ×64 con Liquid Ice | GTLCore | Idea (GT++, sin licencia confirmada) | — |
| **Fission Reactor** (`fission_reactor`) | IV | Barras de combustible/refrigerante reales, calor con límite de explosión, refrigerante NaK→vapor supercrítico, auto-OC | GTLCore | Idea | — (central gestionada, con riesgo real: encaja con nuestras reglas) |
| Heat Exchanger (`heat_exchanger`, créd. GTNH) | IV→LuV | Fluido caliente → vapor/vapor supercrítico en un solo paso | GTLCore | Idea (GTNH) — ya tuvimos el equivalente de GTCA y lo retiramos (§2.5) | — |
| Chemical Energy Devourer (`chemical_energy_devourer`) | IV | Combustión + semifluido + turbina de gas + motor de cohete en un controlador | GTLCore | Idea | — |
| Digestion Tank / Dissolving Tank (créd. GTNH) | IV | Química de tierras raras; proporción de fluido incorrecta devora la entrada sin dar nada | GTLCore | Idea (GTNH) | — |
| Disassembler (`disassembly`) | LuV (receta IV) | Deshace hatches/máquinas en piezas | GTLCore | Idea | — |

### 4.4 Multibloques — LuV, ZPM, UV

| Nombre (id) | Tier | Qué gana | Impl | Reutilizable | Conflicto |
|---|---|---|---|---|---|
| Fusion Reactor MK1 (de serie) + Compressed Fusion Reactor | LuV | OC sin pérdidas + paralelos + hatch láser en la versión comprimida | GTM + GTLCore | Idea | — |
| Neutron Activator (créd. GTNH), ISA Mill (créd. GTNH), Industrial Flotation Cell (créd. GT++), Vacuum Drying Furnace (créd. GT++) | LuV | Línea alterna de minerales (Rh/Ru/Ir/Os/La/Er/Eu directo); OC sin pérdidas | GTLCore | Idea (GTNH/GT++) — **ya instalamos el equivalente real en GTCA** (IsaMill, Flotation Cell Regulator) y lo re-gateamos a ZPM, no lo quitamos (`gtca.js`, bloque `FROTH`) | — |
| Chemical Plant (créd. GCY/Gregicality Legacy, GPL-3.0) | LuV | LCR con paralelos | GTLCore | Idea (GCY=GPL-3.0, solo ideas) | — |
| Wood Distillation Plant (`wood_distillation`) | LuV | 16 troncos + N₂ → ceniza + ~15 fluidos orgánicos sin petróleo | GTLCore | Idea | — |
| Incubator / Large Incubator (`incubator`) | ZPM | Cultivos (células madre, esencias, espíritu de Glacio) | GTLCore | Idea | [Pl] si genera recursos de otro planeta sin ir |
| **Large Void Miner** (`large_void_miner`, créd. GCY) | ZPM | Modo preciso (esencia de veta) o aleatorio (≤216 minerales/intento) | GTLCore | Idea (GCY=GPL-3.0) | **[V][P]** el modo aleatorio |
| Integrated Ore Processor (créd. GTNH) | ZPM | Un circuito (1-7) elige la cadena completa de proceso de mineral | GTLCore | Idea (GTNH) | — |
| Petrochemical Plant | ZPM | Petróleo+vapor → todas las fracciones sin intermedios | GTLCore | Idea | — |
| Mega Alloy Blast Smelter / Mega Blast Furnace | ZPM | Versión láser de ABS/EBF | GTLCore | Idea | — |
| Block Conversion Room / Large (+Conversion Simulation Card, Fast card) | ZPM | Convierte bloques del mundo en otros (incl. esencias de veta) | GTLCore | Idea | [V] ruta alternativa de minerales |
| Decay Hastener (`decay_hastener`) | ZPM | Acelera cadenas de desintegración (no se mina radio, se desintegra) | GTLCore | Idea | — |
| Super Particle Collider (créd. TST, GPL-3.0) | ZPM | Antimateria desde fluidos acelerados | GTLCore | Idea (TST=GPL-3.0) | — |
| Nano Forge T1 (créd. GTNH) | ZPM | Economía de "enjambre" nano como catalizador de paralelo | GTLCore | Idea (GTNH) | [P] si se deja crecer en cascada (T1→T2→T3) |
| Void Fluid Drilling Rig (fluidos atados al planeta) | ZPM | Cada destino da su propia familia de fluidos (He/He-3 Luna, Rn Marte…) | GTLCore | Idea — esto sí respeta "lo de un planeta no sale en la Tierra" si se ata a la dimensión | — |
| Space Elevator + módulos (Resource Collection, Assembly, Power Module MK1-6) | UV | Mina/perfora planetas lejanos sin bajar, con drones no consumibles | GTLCore (créd. GTNH) | Idea (GTNH) | **[Pl]** explota un planeta sin ir — choca directo con "lo que sale de un planeta no se hace en la Tierra" salvo que se interprete como "ya fuiste una vez, ahora drones" |
| Circuit Assembly Line, Advanced Assembly Line, Component Assembly Line (créd. GTNH) | UV | Robots/catalizadores en el bus de entrada deciden el paralelo | GTLCore | Idea (GTNH) | — |
| Deep Chemical Distorter (créd. TST, GPL-3.0) | UV | Colapsa una línea entera (PGM, PPS, epoxi…) en una receta con catalizador de enjambre | GTLCore | Idea (TST=GPL-3.0) | — |
| Super Blast Smelter, Mega Vacuum Freezer, Plasma Condenser | UV | Versión láser de ABS+Smelter+EBF / freezer / condensador de plasma | GTLCore | Idea | — |
| **Large Naquadah Reactor** (créd. GTNH) | UV | Hasta 1A MAX; primer generador láser | GTLCore | Idea (GTNH) | — |
| Molecular Assembler Matrix (+ núcleos) | UV | "Ensamblador molecular" de AE2 sin EU, autocraft sin máquinas | GTLCore + AE2 | No (mixins AE2) | **[C]** autocraft sin coste de energía |
| Gravity Control Hatch | UV | Emula gravedad cero/alta en cualquier sitio | GTLCore | Idea | — |

### 4.5 Multibloques — UHV en adelante (megaestructuras)

| Nombre (id) | Tier | Qué gana | Impl | Reutilizable | Conflicto |
|---|---|---|---|---|---|
| Familia "Mega X" láser (Stellar Forge créd. GCY, Engraving Laser Plant créd. TST, PCB Factory créd. GTNH, Suprachronal Assembly Line créd. TST, Dimensional Focus Engraving Array, Cooling Tower, Field Extruder Factory créd. TST, Mega Wiremill/Presser/Extractor/Canner/Distillery créd. TST, Mega Assembly Plant créd. GTNH, Crystalline Infinity créd. TST, Holy Separator créd. TST, Large Chemical Plant, Rare Earth Centrifuge, Superconducting EM Factory, Transfinite Computation Array) | UHV | OC sin pérdidas + paralelo de hatch; varias fusionan 3-5 tipos de receta | GTLCore | Idea (créditos mixtos TST/GTNH/GCY = todos GPL-3.0 o sin licencia clara, solo ideas) | — |
| Matter Fabricator (chatarra→bola de materia/amplificador UU) | UHV | Cierra el ciclo de la chatarra | GTLCore | Idea | — |
| Advanced Infinite Driller | UEV | Perfora todos los fluidos de un área de 5×5 chunks a la vez | GTLCore | Idea | **[V][Pl]** |
| Advanced Integrated Ore Processor (créd. TST) | UEV | Paralelo cruzado de **2,1 mil millones** | GTLCore | Idea (TST) | **[P]** cantidad absurda |
| SPS Crafting / Advanced SPS, Aggregation Device, Magic Manufacturer, Super Computer, Bedrock Drilling Rig | UEV | Fabrica plasmas/materiales imposibles en bloque suelto; "núcleos" (core draconico, etc.); maná como fluido; polvo de bedrock infinito | GTLCore | Idea | **[V]** el Bedrock Drilling Rig (bedrock infinito) |
| Neutron Vortex (créd. ninguno) | UIV | **16 777 216 paralelos** a la velocidad de 2 | GTLCore | Idea | **[P]** |
| Mass Fabricator (créd. GCY), DT Plasma Forge (créd. GTNH), Nano Forge T2 (créd. GTNH), Cosmic Probe Surface Reception (créd. GCY), Stellar Ultimate Material Forge Factory | UIV | UU-matter sin fin; sondas cósmicas como catalizador no consumible | GTLCore | Idea (GCY/GTNH) | **[V]** las sondas cósmicas (recursos sin ir) |
| **Element Copier** (créd. GCY), **Dragon Egg Copier** | UXV | Duplica **cualquier** polvo/fluido de elemento o fragmento de mundo | GTLCore | Idea (GCY=GPL-3.0) | **[C][V]** copiadora = fin de la escasez, rompe "cada subproducto tiene un destino honesto" |
| Nano Forge T3 (créd. GTNH) + **Nano Core** (créd. TST) | UXV | Economía de enjambre apilada; sucesor sin EU salvo láser | GTLCore | Idea | — |
| **Dyson Sphere Control System** (créd. GTNH) | UXV | Lanza hasta 10 000 módulos; cada uno +2A MAX | GTLCore | Idea (GTNH) | **[P]** número de módulos |
| QFT (créd. GT++) | UXV | Condensa Radox/alambre de espacio-tiempo | GTLCore | Idea | — |
| **Annihilate Generator "Artificial Star"** | OpV | Hasta **67 108 864 A MAX** | GTLCore | Idea | **[P][C]** |
| **Eye of Harmony** (créd. GTNH) | OpV (receta MAX) | "Simulación del cosmos": entra carga, salen **todos** los polvos de elemento | GTLCore | Idea (GTNH) | **[C]** final creativo de verdad (lo que `docs/viaje.md` ya advirtió: *"el final: MAX acaba en modo creativo, un final sin gracia; hay que evitarlo"*) |
| Door of Creation, Creative Computer, Creative Aggregator, Creative Power Source, Creative Data Access Hatch, Gravitation Shockburst (cofres de comandos) | MAX | Cómputo infinito, energía MAX+16, crafteo de bloques de comando | GTLCore | No procede | **[C]** modo creativo explícito |

**Recuento:** 158 multibloques catalogados (`machines_table2.md`), de los cuales calculo del orden de **25-30 con conflicto marcado** (mineros/copiadoras/paralelos absurdos/creativo/mercado), y el resto (~130) son ideas reutilizables sin choque de regla, aunque **ninguno** se puede copiar como jar/textura/texto (§1). A eso se suman los QoL no-multibloque de §4.1 (red inalámbrica, patrones, entorno, investigación, mercado).

---

## 5. Plan de portado — recomendación por grupo

| Grupo | Recomendación | Por qué |
|---|---|---|
| **Boost de calderas pequeñas/grandes (§2.1-2.2)** | **Reimplementar vía config**: añadir a `pack/config/gtceu.yaml` un bloque `machines.smallBoilers`/`largeBoilers` con factores propios (no hace falta copiar el ×8 exacto de GTL — son solo números de fábrica de GTM, no hay nada que "portar" realmente, es una clave de config nuestra). Cero riesgo de licencia (es nuestro propio GTM). | Es la pieza que GTL de verdad cambia para "más vapor"; no toca turbinas. |
| **EU/mB de combustión/gas/semifluido/vapor estándar** | **No tocar / no hay nada que portar.** Si de verdad se quiere bajar el consumo global de combustible habría que: (a) aceptar que solo se puede hacer vía una cadena de proceso tipo GTCA (ver siguiente fila), o (b) un addon Java propio (fuera de alcance de KubeJS). | GTL tampoco lo hace; no existe una pieza de GTL que copiar aquí. |
| **Cadena "vapor mejorado → mucho más EU" (Steam Pressurizer/Heat Exchanger/Supercritical Turbine)** | **Gatear a una era posterior y re-decidir explícitamente, no reinstaurar sin más.** Ya se quitó de GTCA en `integration/gtca.js` por "energía de la nada". Si el usuario, tras leer el porqué, la quiere de vuelta, re-habilitarla con recetas más caras (gated a IV/LuV con coste real) es técnicamente trivial (ya está en el jar que tenemos, LGPL, basta con no removerla o añadir una versión más cara en KubeJS) — pero es una decisión de diseño, no un hallazgo de investigación. | Choca con una decisión previa explícita de este mismo pack; no es un "no" automático, es un "pregunta antes de tocar". |
| **Red inalámbrica — single-block / "pocos cables"** | **Documentar y usar lo que ya existe:** EU P2P Tunnel (MIT, ya instalado). Ninguna tarea de desarrollo. | Ya resuelve el caso de uso real descrito por el usuario, con la mejor licencia posible (MIT) y sin nada que portar. |
| **Red inalámbrica — puente multibloque entre bases/dimensiones** | **Adaptar vía KubeJS**: re-gatear la receta de ensamblaje del WEB Hub/Receiver de GTMUtils (hoy UHV) a un tier más bajo (HV, para igualar el tramo en que GTL habilita sus hatches de multibloque) sustituyendo su receta `assembly_line` por una nuestra. Legal (LGPL-3.0, ya lo tenemos), técnicamente acotado (es una receta, no un mixin). | Es el único camino con licencia limpia que replica de verdad "frecuencia + cruce de dimensión"; GTMThings (el que usa GTL) es ARR. |
| **QoL de patrones de AE2** (wildcard, pattern box/modifier/relay, buffers) | **Mezcla:** `wildcard_pattern` (MIT) ya es instalable tal cual si se desea; el resto (buffers de 72 slots, aislamiento, proxy) son mixins de GTLCore sobre AE2 → **reimplementar en KubeJS es inviable** (hace falta tocar comportamiento de red AE2) y copiarlo no es legal. Mirar antes si **Extended Features / GTMUtils** (LGPL, ya instalados) ya cubren el mismo hueco (varios lo hacen: buffers expandidos, hatches de stock con etiqueta). | Evita reinventar lo que addons LGPL ya instalados resuelven. |
| **Hatches de ambiente** (Cleaning/Sterile/Law, Gravity Control) | **Reimplementar en KubeJS, gateado a una era posterior** (HV para limpieza — GTM ya trae cleanroom y un hatch de limpieza de serie, así que es solo una variante de recipe/tier — y UV/UEV para gravedad/esterilidad cuando lleguemos a esas eras de diseño). | Baja complejidad, encaja con "la dificultad por condiciones, no por sala gigante" que ya usamos. |
| **Slaughterhouse (granja de mobs automática)** | **Reimplementar en KubeJS** como type de receta nuevo gateado a LV, con lista de mobs por circuito y modo "drops virtuales" (sirve en Pacífico). Lo único que no tenemos hoy y llena un hueco real (auto-comida/cuero/pólvora desde LV). | No pisa ninguna familia nuestra existente; GTL mismo lo gatea en LV, coherente con nuestro propio calendario. |
| **Universal Factories / fusión de varios tipos de receta en un controlador** | **Tomar la idea, no la escala.** Cuando diseñemos un multibloque nuevo de MV/HV, usar "fusiona N tipos de receta" como criterio de qué "gana" (ya es la regla 4 de `AGENTS.md`), no como copia 1:1 de las Universal Factories. | Ya tenemos nuestra propia familia por era; no hace falta una pieza más que compita con ella. |
| **Las 24 "Large X" de IV (familia GCyM)** | **Omitir.** La investigación previa (`gtl_body.md` §4) ya las marcó como "mismo bloque, más grande" sin ganar complejidad real, salvo las que fusionan 2-4 tipos (esas sí, ver fila anterior). | Repetir eso solo infla cantidad, contra la regla 2. |
| **Fission Reactor gestionado (barras, calor, explosión, refrigerante NaK)** | **Adaptar/gatear a una era posterior** (IV, como en GTL) y diseñarlo cuando toque esa era en detalle — es el mejor candidato de todo GTL para "potencia por complejidad real" (riesgo de explosión, refrigerante con coeficiente, auto-OC). | GTM no trae fisión de serie; aporta algo que de verdad no tenemos y encaja con la regla 2. |
| **Pila de investigación (Research Station/HPCA/Data Bank)** | **Ya existe en GTM de serie.** Solo portar lo que GTL añade encima: hatches ópticos inalámbricos — y eso ya lo tenemos vía Extended Features (LGPL). | Cero trabajo adicional real. |
| **Familia "Mega X" láser de UHV+ (fusiona 3-5 tipos, OC sin pérdidas)** | **Diferir** a cuando diseñemos esas eras (hoy el pack va por HV/EV/IV según los checkpoints). Buen patrón a reimplementar entonces. | No es urgente; mantiene el principio de "cada era se diseña al llegar a ella" de `AGENTS.md`. |
| **Mineros de vacío (Void Miner, Large Void Miner, Advanced Infinite Driller, Bedrock Drilling Rig, Primitive Void Ore Miner)** | **Omitir.** | Conflicto directo con la regla "ningún recurso sin veta o planeta" — son minería sin veta por diseño. |
| **Space Elevator + drones (minar otro planeta sin ir)** | **Omitir tal cual; adaptar con matiz si se quiere algo similar.** Si se reintroduce la idea de "escanear y automatizar a distancia", debe exigir **una base real ya construida en el planeta** primero (coherente con nuestra propia regla de "lo que sale de un planeta no se hace en la Tierra" y con el modo de juego ya decidido: primero se visita y automatiza en persona, EV-LuV, luego se opera desde la órbita). | Ya lo marcamos como conflicto en `docs/viaje.md`/`CREDITS.md` (vetas escaneadas una vez = solo ideas). |
| **Element Copier / Dragon Egg Copier** | **Omitir.** | Elimina la escasez; rompe la regla 3 ("cada subproducto tiene un destino honesto"). |
| **Paralelos absurdos** (Neutron Vortex 16,7M, Advanced Integrated Ore Processor 2,1 mil millones, Infinity+ coils, MAX parallel hatch) | **Omitir el número; quedarse con el "catalizador/condición" si lo hay** (p. ej. "+2 paralelo por cada 900 K de más" es una buena regla si se tapa con un techo bajo, ≤64). | Regla 2: la dificultad no sube por cantidad bruta. |
| **Final "creativo" (Eye of Harmony, Door of Creation, Creative Computer/Aggregator/Power Source, cofres de comando)** | **Omitir por completo.** | Ya lo dice `docs/viaje.md`: *"el final: MAX acaba en modo creativo, un final sin gracia; hay que evitarlo"*. Nuestro propio final (la concha de espejos sobre Sagitario A\*) ya es la alternativa. |
| **Small Market (comprar atajos con créditos de misión)** | **Omitir.** | Regla 5: las misiones dan premio pequeño, nunca atajos de progresión. |

---

## Resumen ejecutivo

| Pregunta | Respuesta corta |
|---|---|
| **¿Es GTL permisivo?** | No tanto como cree el usuario. El propio modpack se autodeclara **CC BY-NC-SA 4.0** en el zip y **LGPLv3** en CurseForge — contradicción de origen. GTLCore dice "LGPL" sobre una base que admite código GPL/AGPL (Epimorphism Modern). GTMThings (el mod del hatch inalámbrico) es **All Rights Reserved** pese a lo que diga su `mods.toml`. Las texturas son prestadas de otros 5 proyectos (GPL/LGPL/MIT/AGPL) y ni GTL tiene derecho a cederlas. Veredicto que se mantiene: **solo ideas, nunca jar/textura/texto**. |
| **Power** | GTL multiplica **×8** la salida de las 6 calderas pequeñas y el techo de temperatura de las 4 calderas grandes (`machines.smallBoilers`/`largeBoilers` en `cfg/gtceu.yaml`); la conversión agua→vapor (`steamPerWater`) **no cambia** (160). **No se encontró ningún cambio** al EU/mB de combustión, gas, semifluido ni vapor estándar — las turbinas siguen siendo las de GTM de fábrica; GTL solo las alimenta con mucho más vapor y ofrece generadores nuevos opcionales (Naquadah Reactor, Supercritical Steam Turbine propio, Chemical Energy Devourer). Importante: ya **retiramos una cadena casi idéntica de GTCA** (Steam Pressurizer → Supercritical Turbine) por ser "energía de la nada" — cualquier reintroducción debe ser una decisión consciente, no un calco. |
| **Energía inalámbrica** | No son covers: son **hatches con frecuencia** (mod GTMThings, ARR, no redistribuible) que se vinculan a tu red/equipo y cruzan dimensión; LV solo para bloques sueltos, los multibloques esperan a tramos de amperaje mayores. Opción A (incluir el jar) descartada: mismo proyecto Modrinth que nuestro GTM pero una build mucho más vieja (1.4.4 vs 7.5.3), con ~270 mixins y dependencia del KubeJS de GTL. **Ya tenemos dos piezas reales y con licencia limpia**: EU P2P Tunnel (MIT, funciona ya, vía red ME) para "pocos cables" desde pronto, y el WEB Hub/Receiver de GregTech Modern Utilities (LGPL-3.0, ya instalado) como puente multibloque de verdad por frecuencia — pero viene gateado a UHV de fábrica, habría que re-tierarlo por KubeJS a HV para igualar la sensación de GTL. Recomendación: **Opción C combinada**, no A ni B puras. |
| **QoL y multibloques** | **158 multibloques** catalogados + un bloque de QoL no-multibloque (red inalámbrica, patrones AE2, hatches de ambiente, mantenimiento, pila de investigación, mercado de misiones). Unos **25-30** chocan con nuestras reglas (mineros/copiadoras sin veta, paralelos de millones, final "creativo", mercado de monedas, minería planetaria sin ir) — se listan y flagean todos igualmente, no se ocultan. El resto (~130) son ideas sin choque de regla pero **ninguno** es copiable literalmente (§1). |
| **Top conflictos a vigilar** | (1) Mineros/perforadoras de vacío y copiadoras de elemento — minan o duplican sin veta/planeta. (2) Paralelos de millones (Neutron Vortex, Advanced Integrated Ore Processor, Infinity+ coils). (3) Final de MAX en "modo creativo" (Eye of Harmony, Door of Creation, Creative Computer). (4) Small Market (créditos de misión → atajos). (5) Space Elevator con drones minando planetas sin ir — choca con nuestra propia regla de exclusividad planetaria. (6) La propia cadena de power "barata" ya la rechazamos una vez en GTCA; repetirla con otro mod sería contradecirnos sin querer. |

---

*Informe de investigación únicamente — no se ha tocado ningún archivo de `pack/`. Archivo: `research/gtl/leisure-port.md`.*

