# Grindless: la campaña, resumida como guion para Gregtech Grindless

Fuente: el repo *Grindless* de Ezequiel24123z (MIT, del propio usuario), clonado en `research/space/grindless-earlygame/`, commit `30226c2` (main, 2026-10-23). Lo he leído sin modificarlo.

Las citas `archivo:línea` son relativas a ese clon: **R** `README.md` · **D** `docs/DECISIONS.md` · **M** `docs/MACHINES.md` · **P** `docs/PROCESSES.md` · **B** `docs/BUILD-OUT.md` · **J/** `common/src/main/java/io/github/ezequiel24123z/grindless/` · **RES/** `common/src/main/resources/`. **GG:** es este repo y **S:** la carpeta `files/` de la sesión.

**Estado en la fuente.** De T3 a T15 todo es diseño. Luna, el Drift, Sagitario, el cohete y la estación existen como prototipos registrados, pero sin receta de supervivencia (D:4952-4958, R:1182-1187). Ningún tier está aceptado (R:2229-2232).

**⚑ = cambio ya decidido para GG que no está en Grindless.** La Luna y el primer cohete llegan al final de HV. El final es llegar al agujero negro y hacerlo explotar, y con él el universo (GG:DECISIONS.md:46).

---

## 1. La escalera T0–T15

- **Energía.** Tecnología, controlador y energía suben juntos con `F(n) = 8 × 4ⁿ` (R:253-256, R:274). Es la escalera de voltajes de GT: LV–IV son alias de F1–F5 (R:1332-1333). Así, T0 = ULV … T13 = OpV, T14 ≈ MAX, y T15 queda por encima de GT.
- **Cuatro líneas.** Cada tier trenza materiales, química, control y energía. Se cruzan durante el tier y convergen en la Control Matrix del siguiente (R:8-10, P:368-371, P:424-433). Desde T2, ninguna línea cierra su producto sin otra (D:4930-4931).
- **Forma de cada tier.** «an entry bootstrap, several interacting route expansions, a logistics or scaling problem, a signature project and a frontier matrix» (P:394-395). Crece por decisiones nuevas, no por cantidades ni tiempos (D:4933-4935).
- **Arquitecturas de Matrix.** Relay T1–T3, Integrated T4–T6, Superconducting T7–T9, Photonic T10–T12 (cristales zero-g, láseres, óptica) y Causal T13–T15 (materia exótica, relojes distribuidos, control relativista). Cada una fabrica más barato los ratings viejos (D:4908-4918).

Fuentes de la tabla: tema (R:1450-1467), líneas M · Q · C · E (P:375-390) y cierre (B:475-490). El resto se cita en la celda. El cierre siempre es la Matrix del tier siguiente o, en T15, el objetivo final (D:5016).

| Tier (F, GT) | Tema | Líneas trenzadas: M · Q · C · E | Firma | Lugares | Recurso exclusivo | Hito | Cómo acaba |
|---|---|---|---|---|---|---|---|
| **T0 Bootstrap** (8, ULV) | Escape velocity | M agregado geológico y fracciones metálicas · Q cerámica, biomasa y vidrio · C redstone y calibración del Data Core · E fuente F0 y taller | Taller conectado: Quern, Clay Mixer, Firing Chamber, Settling Trough, Geological Collector, Biocultivator, Biomass Dynamo (M:49-58) | Mundo base, Superflat primero (R:3-4) | — | Se acaba picar a mano (R:1480) | 5 Relay Matrix T1, hechas a mano |
| **T1 Voltaic** (32, LV) | Familias básicas | M molienda, reducción, chapas, varillas, engranajes y vidrio renovable · Q agua, gases de tostación y aislante cerámico · C hilo de cobre, bobinas, relés y Assembler · E generador térmico y primer pilón | Thermal Generator, Pulverizer, Arc Furnace, Press y Assembler (P:439-440); las familias básicas de máquinas (D:8174) | + Factory World opcional, plano y sin recursos gratis (R:2294-2299) | — | El Assembler acaba con el crafteo a mano (R:1480-1481) | Relay Matrix T2 |
| **T2 Industrial** (128, MV) | Bucles cerrados | M acero, lavado B2/B3, fundido y colada · Q azufre, redstone sintética, electrólisis, aire, salmuera y resina · C motores, bombas y lógica cableada · E vapor y solar | Proceso de contacto (Chemical Reactor), Wire Mill, Chemical Washer, Electrolysis Cell y Atmospheric Intake (R:2369-2372) | Mundo base | — | — | Matrix T3 |
| **T3 Arc** (512, HV) | Construcción con energía | M refractarios, fluidos calientes y aleaciones duras · Q primeros hidrocarburos y el medio de la Arc Cell · C controladores, cajas logísticas y Construction Drones · E Arc Reactor alimentado | Arc Reactor de FU directa con Arc Cells, y el Arc Exosuit con el mismo reactor en miniatura (R:967-984); drones hasta ~15³ (M:593-596) | Mundo base. ⚑ GG: Luna y cohete | — | Primer multibloque diseñado (P:378) | Matrix T4, con drones y Arc Reactor en marcha |
| **T4 Precision** (2 048, EV) | Pureza y control | M silicio electrónico, cerámicas técnicas y nobles recuperados · Q química a presión, nítrico y HCl, etchant, polímeros y agua ultrapura · C litografía, Integrated Matrices, circuitos y patrones · E acondicionamiento de energía; campus de varias líneas | Lithography Unit (R:1801); Research Station, cuyos patrones son catalizadores y no desbloqueos (R:1475-1478); Replicator (R:1833) | Mundo base | — | — | Primera frontera Integrated |
| **T5 Nuclear** (8 192, IV) | Núcleos diseñados | M vainas, moderadores, reflectores y aleaciones antirradiación · Q UF6, agua pesada, limpieza de refrigerante y reprocesado · C controladores endurecidos y sensores · E fisión, intercambiadores y salas de turbinas | Fission Reactor paramétrico que hace SCRAM en vez de explotar (R:1056-1070, M:633); cascadas de centrífugas (P:923-930); Deep Core Drill con «weighted planetary pool» (R:442-444) | Mundo base | — | — | Ciclo de combustible completo y núcleo diseñado |
| **T6 Cryogenic** (32 768, LuV) | Frío profundo | M aleaciones superconductoras e imanes de alto campo · Q helio líquido, criógenos y separación del combustible de fusión · C control de bajo ruido e interconexión superconductora · E bancos de pulso y red criogénica | Cryogenic Plant y Superconductor (R:1803, R:1672) | Mundo base | — (el deuterio entra aquí, R:1920; luego es la firma de Kryos) | — | Criógenos, imanes y pulso listos para la fusión |
| **T7 Fusion** (131 072, ZPM) | Plasma sostenido | M paredes antineutrones, mantas y Containment Rings · Q cría D-T, D-D y recuperación de helio · C diagnóstico de plasma · E fusión sostenida; drones hasta ~32³ | Fusion Reactor: la ignición la paga la red vieja y, si pierde contención, se apaga sin daños (R:1072-1084); ciclos D-T → D-D → D-³He → p-¹¹B (M:680-687) | Mundo base | — | — | Bucle D-T cerrado con su manta |
| **T8 Particle** (524 288, UV) | Núcleos a medida | M isótopos, láminas blanco y precursores exóticos · Q preparación de blancos y separación de radionúclidos · C temporización del haz y detectores · E el tamaño del anillo decide las reacciones | Particle Accelerator: transmutación, síntesis exótica (antimateria, isótopos exóticos, materia extraña), creación de materia e investigación (R:1088-1095, M:672-674) | Mundo base | — (los isótopos exóticos entran aquí, R:1920; luego son firma de Erebus) | La escasez pasa a ser un problema de energía (R:1097-1100) | Exóticos de frontera |
| **T9 Quantum** (2 097 152, UHV) | Materia programable | M sustratos coherentes, metamateriales y Matter programable · Q deposición nanoquímica y refrigerantes cuánticos · C Quantum Cores, replicación y Quantum Assembler · E almacén de fase y fusión aneutrónica | Quantum Assembler y Matter Condenser (R:1115-1116) | Mundo base | — (la materia extraña entra aquí, R:1920; luego es firma de Erebus) | La fábrica terrestre es un campus (P:384) | Campus terrestre con control cuántico |
| **T10 Orbital** (8 388 608, UEV) | Suelo y órbita | M compuestos, ablativos, aleaciones de vacío y cristales zero-g · Q propelentes, soporte vital y criogenia orbital · C guiado, buses de satélite, relés y Photonic Matrices · E cohetes, Mass Driver y solar orbital; fábrica en dos sitios | Launch Pad y cohete, Mass Driver y Orbital Catcher, Orbital Platform, satélites y Rectenna, industria de vacío, Orbital Assembly Bay (R:1863-1892); Assembly Field (R:616-617); Exotic Exosuit (R:948) | Órbita y Luna; el vuelo local no sale de la estrella (R:263-265, M:770) | Helio-3 (R:1199, R:1920) y productos de vacío y microgravedad (R:1170-1174) | Primera energía pasiva a gran escala: el satélite solar (R:1154) | Suelo y órbita forman una red abastecida |
| **T11 Planetary** (33 554 432, UIV) | Mundos como infraestructura | M regolito y materiales de construcción de cada mundo · Q ISRU atmosférico, soporte vital cerrado y combustibles locales · C telepresencia, Colony Cores, Deep Survey y rutas interplanetarias · E varios mundos, Space Elevator y Horizon Gates | Telepresence Terminal y Proxy Frame, Colony Core, Drop Pod Bay, Interplanetary Router, Space Elevator, Horizon Gate y Deep Survey Satellite (R:1877-1893) | Los seis mundos de respaldo o los del mod espacial (§2.3) | El recurso firma de cada mundo (R:1197-1205) | **Kardashev I** (R:260-261) | Varios mundos forman un sistema industrial que se recupera |
| **T12 Stellar** (134 217 728, UXV) | Una estrella como infraestructura | M materia sacada de la estrella y materiales de la Stellar Forge · Q separación de plasma estelar y medios extremos · C control fotónico estelar y coordinación de enjambres · E Dyson network e industria de sistema | Stellar Forge y Dyson Network; Planetary Engine en T11–T12 (M:774-779) | La estrella natal | Star-lifted matter (P:387) | **Kardashev II** | Procesado estelar y Dyson a escala Tipo II |
| **T13 Interstellar** (536 870 912, OpV) | Varios sistemas | M materiales traídos de varios sistemas · Q combustibles de larga duración, criógenos y química de viaje en bucle cerrado · C Causal Matrices, relojes distribuidos y transporte de estado de proceso · E estación supralumínica, el Drift y fábrica multisistema | Supraluminal Station y Causal Buffer (M:776-777) | El Drift y otros sistemas | Componentes de otros sistemas (P:388); el Drift no da nada (D:4202-4203) | Salir de la estrella natal (R:1465) | Varios sistemas intercambian producción por la ruta supralumínica |
| **T14 Galactic** (2 147 483 648, ≈MAX) | Industria que se expande sola | M antimateria industrial, materia exótica estable y estructuras de singularidad · Q medios de aniquilación y recuperación galáctica · C sondas autorreplicantes, rutas causales y computación distribuida · E energía de singularidad y expansión abstracta | Singularity Reactor (R:1102-1106); Fusion Lance y Singularity Charge (R:1037-1040) | La galaxia, en abstracto | Antimateria industrial y materia exótica estable (P:389) | **Kardashev III** | Autoexpansión, antimateria y singularidad a escala Tipo III |
| **T15 Event Horizon** (8 589 934 592, sin GT) | El centro galáctico | M blindaje relativista y estructuras contra la acreción · Q bucles finales criogénicos, de plasma y de antimateria · C navegación galáctica, tiempo y telemetría del horizonte · E la ruta a Sagitario | Infraestructura del horizonte: aproximación, blindaje y extracción (M:780) | Sagitario | Recursos de acreción, ya en el postgame (D:4947-4949) | Llegar es la victoria. ⚑ GG: llegar y detonar | La ruta completa llega a Sagitario |

- **Escala de los multibloques.** A mano 3³–5³ (T2), drones ~15³ (T3–T5), enjambres ~32³ (T6–T9), Assembly Field con estructuras de chunks (T10–T12) y flotas de construcción abstractas entre mundos y sistemas (T13–T15) (M:593-599).
- **Fabricación tardía.** En T10–T12 el proceso orbital y de campo da componentes, controladores y secciones estructurales. En T13–T15 hay producción distribuida de sistemas enormes, sin máquinas normales automáticas (R:1621-1622).
- **⚑ Luna en HV.** En Grindless la Luna está en T10, que numéricamente es UEV. GG la adelanta siete tiers. El Launch Pad de Grindless pide «Particle-era materials, Quantum guidance and an Orbital Matrix» (R:1133), es decir, piezas de T8–T10 que en HV aún no existen.

---

## 2. Espacio y lugares

### 2.1 Cómo se viaja

| Tier | Medio | Qué hace | Fuente |
|---|---|---|---|
| T10 | Launch Pad + Rocket | El multibloque monta y lanza cohetes. El cohete sale de una línea y se gasta al lanzarlo. Sirve para el primer viaje y para todo lo que lleve tripulación | R:1133-1134, R:1139 |
| T10 | Mass Driver | Manda carga a órbita solo con energía. Barato por kg e inútil para lo frágil o vivo. Convierte el espacio «from an event into infrastructure» | R:1135, R:1139-1141 |
| T10 | Orbital Platform | La estación: módulos lanzados que crecen hasta ser una base | R:1136 |
| T11 | Space Elevator | Enlace permanente suelo-órbita, de mucho caudal y solo energía. Deja obsoleto el Mass Driver | R:1295 |
| T11 | Horizon Gate | Par de anillos. El lejano se entrega una vez (cohete, Mass Driver o paquete de colonia). Las personas pasan baratas; la carga puede pasar, pero cuesta más por kg que el Mass Driver. Las direcciones salen del Deep Survey. Nether y End solo por datapack | R:1272-1284, D:2735-2748, M:704-711 |
| T13 | Supraluminal Station | La estación es el viaje interestelar: ni enlace ni cohete | M:777, D:4301-4303 |
| T15 | Ruta final | Navegación galáctica y blindaje relativista hasta Sagitario | P:390, D:4945 |

- **Cómo lo hace el prototipo.** El cohete sube un bloque por tick hasta el techo del mundo y abre un mapa de aterrizaje con el mundo base y Luna. Nether, End, Drift y agujero negro no salen en el mapa (D:4282-4290). La ida cuesta 102 400 FU y la vuelta es gratis, para no dejar al jugador tirado en un mundo sin red (D:4291-4296).
- **La estación del prototipo.** Sube al techo y llega al Drift (6 553 600 FU a la ida). Del Drift a Sagitario es gratis, y de Sagitario vuelve gratis a la litera guardada (D:4384-4396, D:4470-4475, D:4489-4495).
- **Enlaces viejos.** El Lunar Link y el Starward Link quedan como marcadores de prueba, no como atajos (R:1186-1187; RES/assets/grindless/lang/en_us.json:182-183).
- **Idea histórica no hecha.** Orbes de teletransporte de un material mágico, justo antes del vuelo espacial, para volver a un planeta ya pisado. «Not implemented. Not next.» (B:727).

### 2.2 Luna

- **Diseño.** «Airless, low gravity, close». Peligro: vacío. Recurso firma: helio-3, «premium fusion fuel» (R:1199). Se llega con el programa de vuelo local de T10, no con una receta de teletransporte (R:263-265, D:4079-4081).
- **Prototipo.** Dimensión `grindless:luna`, plana: 1 capa de bedrock y 64 de `grindless:lunar_regolith` (RES/data/grindless/dimension/luna.json:9-12, J/planet/PlanetCatalogue.java:30-33). Cielo del End y noche fija (RES/data/grindless/dimension_type/luna.json:13, 25). Sin spawns ni menas, y sin daño de vacío ni soporte vital (D:4113-4117).
- **Helio-3.** Todas las vetas de Luna son helio-3. Es el reactivo `grindless:helium_3`, no una mena ni un `forge:raw_materials`, para que no se pique con pico ni aparezca en el Overworld (D:4100-4102, D:4119-4124, J/planet/PlanetCatalogue.java:14-16). La forma gas queda para después (P:348).
- **Para qué sirve.** Fusión D-³He, aneutrónica, «tying fusion to the orbital layer» (M:686, P:944). Junto al deuterio de Kryos mejora la fusión madura (R:1309). El regolito se beneficia en T11 (P:386).
- **⚑ GG.** La Luna llega al final de HV, siete tiers antes que en Grindless.

### 2.3 Mundos de respaldo (si no hay mod espacial)

| Mundo | Carácter | Peligro | Recurso firma | Para qué, según la fuente |
|---|---|---|---|---|
| Luna | Sin aire, baja gravedad, cerca | Vacío | Helio-3 | Fusión D-³He (M:686) |
| Tharsis | Desierto frío, atmósfera fina | Frío, tormentas de polvo | Vetas de hierro muy ricas | Hierro que el Overworld ya tiene (D:4090-4092) |
| Vulcan | Volcánico, caliente, denso | Calor, ceniza | Metales pesados, geotermia | — |
| Kryos | Luna de hielo con océano interior | Frío extremo | Deuterio, volátiles criogénicos | Fusión madura (R:1309) |
| Erebus | Planeta errante, sin estrella, oscuro | Oscuridad, radiación | Isótopos exóticos, materia extraña | «the strange-matter world» (D:2752) |
| Thalassa | Océano, aire espeso | Presión, corrosión | Química a alta presión, volátiles disueltos | Condiciones de proceso, no menas (D:2749-2751) |
| Helios | Anclado por marea | Calor de día, frío de noche | Condiciones extremas, «not a second ore list» | Ídem |

Tabla de R:1197-1205. Thalassa y Helios entraron con la Horizon Gate (D:2749-2751). En la fuente no aparece ningún otro mundo con nombre; los demás lugares son el mundo base, el Factory World, la órbita, el Drift y Sagitario.

- **Planetas distintos, mismos materiales.** Cada mundo tiene su propio reparto de vetas sobre el mismo registro de materiales: «Planets are not reskins» (R:1207-1211). «Do not invent unique untaggable ores that only exist there» (D:2752-2753).
- **Dónde construir importa.** La solar depende de la distancia a la estrella, cada peligro pide su soporte vital y la gravedad cambia el coste del Mass Driver (R:1213-1214).
- **Mods espaciales.** El README dice que, si hay un mod espacial, se usan sus planetas (R:1189-1195). ADR-0088 lo invierte (§5.3).

### 2.4 El Drift

- «the dark between the home star and the galactic centre» (J/star/DriftCatalogue.java:6-8). Es una sola parada: una cubierta `grindless:drift_deck` sobre bedrock, sin vetas. «It is not a planet and not a mining dimension» (D:4198-4203, RES/data/grindless/dimension/drift.json:9-12).
- Pertenece a T13 y se llega en la Supraluminal Station (R:1185-1186, D:4172-4173). Se rechazó una cadena de estrellas con nombre: «One hop is the route.» (D:4224).

### 2.5 Sagitario, el centro galáctico

- **El lugar.** Dimensión `grindless:sagittarius`: una masa sólida de `grindless:horizon_shell` de 16 bloques, sin cielo y con techo (D:4476-4478, RES/data/grindless/dimension_type/sagittarius.json:8-9, 16).
- **La sala.** Al llegar se talla una sala de 7×4×7 con la litera en (0, 2, 0), una Arrival Mark con luz 15 y un pozo de 3×3 para salir. Son 286 celdas. La cáscara y la marca son irrompibles y no tienen objeto. La sala se vuelve a tallar en cada llegada, «so the room cannot be kept as a base» (D:4479-4488, J/centre/CentreChamber.java:15-16).
- **La llegada.** El mensaje dice «The galactic centre. Arriving is the victory.» (RES/assets/grindless/lang/en_us.json:358). Salir te devuelve gratis a la litera guardada. El cohete nunca vuela allí (D:4489-4495).
- **Estado.** La sala es «a prototype destination, not the final amount of gameplay at the centre» (D:4949-4950). No hay receta del agujero negro antes de T15 (D:4958).

### 2.6 Estaciones y otros lugares

- **Orbital Platform (T10).** «Your space station. Built from launched modules; expands into a real base.» (R:1136). Los módulos salen del Orbital Assembly Bay (R:1174).
- **Supraluminal Station (T13).** Un asiento sobre una Station Berth. Llegar al techo es llegar, sin menú (D:4378-4383).
- **Factory World.** Mundo plano a mediodía para construir, con las vetas finitas normales; no es un atajo de recursos (R:2294-2299, D:5417).

### 2.7 Satélites (T10; Deep Survey en T11)

- **Sin mantenimiento.** Son permanentes: «no orbital decay, no refuelling, no maintenance minigame». Cuestan energía y masa de lanzamiento (R:1147-1149, D:437-442).
- **Survey.** Mapa de vetas desde órbita, «the single most useful object in the mod» (R:1153).
- **Solar Power.** Luz sin noche, radiada a una Rectenna (R:1154).
- **Relay.** Lleva la red a otras dimensiones y da ancho de banda, que gastan la telepresencia y las colonias (R:1155).
- **Sentinel.** Mapa de Resonance, aviso de enjambres y blancos para ataques orbitales (R:1156).
- **Logistics.** Drop pods y rutas de objetos entre suelo, estación y colonias (R:1157).
- **Deep Survey.** Estudia otros planetas; hace falta para explotar uno que no has pisado (R:1158).
- La constelación es un diseño en sí: cobertura, ancho de banda y consumo (R:1160-1161).

### 2.8 Cuatro formas de explotar un mundo (R:1216-1284)

1. **En persona.** Volar, aterrizar y construir, con el soporte vital del peligro: exotraje o base presurizada (R:1221-1227). Exotic Exosuit con blindaje antirradiación y soporte vital orbital (R:948); módulos de vacío, calor y radiación en T10 (R:1919).
2. **Telepresencia.** Un Proxy Frame en el otro mundo y una Telepresence Terminal en casa. Gasta ancho de banda y energía, y la latencia crece con la distancia. Si destruyen el cuerpo pierdes el cuerpo, no el inventario: «Failure costs materials, never progress» (R:1229-1244).
3. **Colonias.** Un Colony Core aterriza y trabaja solo. Su producción depende de módulos, riqueza de la veta y energía. Envía a casa por Mass Driver a un Orbital Catcher o por drop pod. Su integridad baja con el peligro y se repone con suministros automatizables. Se simula en abstracto, sin forzar chunks (R:1246-1270, D:415-421). En T11 las rutinas de Operator Drone corren en colonias (R:692-693).
4. **Horizon Gate.** Ir andando tras entregar el anillo lejano (R:1272-1284).

### 2.9 Logística orbital

Orbital Catcher (recibe las cápsulas del Mass Driver), Drop Pod Bay y Landing Beacon (entrega en superficie), Rectenna (energía radiada), Interplanetary Router (objetos entre suelo, estación y colonias) y Space Elevator en T11 (R:1286-1295). «Presence is the gate; bulk is the driver.» (R:1306).

### 2.10 Industria orbital

- **Máquinas.** Vacuum Furnace (sin oxidación, más pureza), Zero-G Crystallizer (cristales perfectos, «the only source of the substrates advanced circuits need»), Orbital Cryo Plant (el espacio ya es frío: licuar cuesta una fracción), Vacuum Deposition Chamber (películas finas y aleaciones exóticas) y Orbital Assembly Bay (lo que la gravedad no deja construir) (R:1163-1174).
- **Por qué subir.** Vacío y gravedad cero son condiciones de proceso, y la órbita es «a manufacturing necessity rather than a victory lap» (M:696-698). La industria orbital no emite Resonance a la superficie (R:1176-1178).
- **Rutas.** El cuarto camino al silicio electrónico es orbital: «A player in orbit stops thinking about it» (M:743-746, P:995). El agua ultrapura tiene ruta de vacío en T10 (P:1000). Las Photonic Matrices salen de cristales zero-g (D:4912).
- **Todos los sistemas ganan algo.** La red llega a otras dimensiones, los satélites mapean vetas, la logística se vuelve interplanetaria, el traje es soporte vital y el helio-3 y el deuterio mejoran la fusión (R:1297-1309).

---

## 3. Megaestructuras y final

### 3.1 Kardashev

Tipo I es la energía de un planeta (T11), Tipo II la de una estrella (T12) y Tipo III la de una galaxia (T14). Son hitos con nombre: «A Flux Unit is not a physical watt» (R:258-261, D:3584-3587).

### 3.2 Megaestructuras y proyectos firma

| Proyecto | Tier | Qué hace | Por qué no es solo una máquina más grande |
|---|---|---|---|
| Ground Array | Sin tier | Anillo 3×3 que guarda 6 553 600 FU | Prototipo retirado hasta que la ruta lo coloque (D:3978-3980, D:4025-4039) |
| Assembly Field | T10 | Materializa un plano entero | Estructuras medidas en chunks (R:616-617, M:598) |
| Space Elevator | T11 | Enlace permanente suelo-órbita | La órbita pasa a ser parte de la fábrica (M:773) |
| Horizon Gate | T11 | Par de anillos | «a milestone on the way, not the victory» (D:3590-3591) |
| Planetary Engine | T11–T12 | Control de órbita a largo plazo | Cambia la insolación y lo que puede procesar una colonia (M:779) |
| Dyson Network | T12 | Captación estelar | Tipo II escalando un sistema orbital, «not one trophy block» (M:774) |
| Stellar Forge | T12 | Proceso a temperatura y presión estelares | Materiales que no aguanta ninguna cámara terrestre u orbital (M:775) |
| Causal Buffer | T13 | Guarda estado de proceso, no objetos | Lotes grandes migran entre sistemas (M:776) |
| Supraluminal Station | T13 | Viaje al Drift | Transporte interestelar (M:777) |
| Singularity Reactor | T14 | Microsingularidad alimentada con Matter | El límite pasa a ser llevar y coordinar la energía. Apoya el Tipo III y la ruta final, pero no es la victoria (R:1102-1106, M:778) |
| Infraestructura del horizonte | T15 | Aproximación, blindaje y extracción postgame | Llegar es la victoria; acreción y energía rotacional siguen siendo útiles después (M:780) |

Antes de ADR-0107 el Dyson era un «Dyson Collector» solar en anillo orbital a F8–F9, «the source that outruns a singularity». La Stellar Forge era «necessarily orbital» y el Planetary Engine «moves a colony» (D:3988-3993).

### 3.3 Energía tardía, antimateria y autorreplicación

- **Energía.** F10 da 8 388 608 FU/t y F15 8 589 934 592 FU/t (R:1347-1352). F15 es el último nombre. Tras llegar, la infraestructura del agujero negro escala dentro de T15 hasta `Long.MAX_VALUE` FU/t, sin F16–F30 (R:1370-1372, D:4892-4897).
- **Antimateria.** Primero sale del acelerador en T8 (R:1093). En T14 es industrial, con medios de aniquilación (P:389), y en T15 hay bucles de servicio de antimateria (P:390).
- **Contención.** El helio líquido sirve «later singularity containment» (P:345). El Containment Ring pasa a «particle, singularity and horizon systems later» (R:1674).
- **Autorreplicación.** La expansión galáctica es «abstract and self-replicating» y T14 trae «self-replicating probes» (P:401-402, P:389). Pero ADR-0188 corrige: «The earlier self-replicating-factory interpretation overextended automation» (D:9121). Las máquinas normales se montan a mano (R:1575-1578, M:133). Lo que se replica son sondas y expansión abstracta, no máquinas.
- **Navegación final y blindaje.** Blindaje relativista y estructuras contra la acreción; navegación galáctica, tiempo y telemetría del horizonte (P:390, R:1467, R:2276).

### 3.4 Llegar, y lo que viene después

- **Objetivo.** «The goal is to reach the black hole at the centre of the Milky Way in T15. Arriving is the victory, and the way there is the station, not a link» (R:269-270).
- **Un final finito.** El interior es «a finite finale» (D:3593). Se rechazan «An empty "you arrived" anecdote» y «An endless second game inside the hole» (D:3637-3638).
- **Postgame T15.** «accretion resources, rotational-energy extraction and the climb toward the absolute Flux rate» (D:4947-4949). No es un tier más ni hace falta para ganar (R:271-272). Se rechazó explícitamente «Making black-hole extraction the victory condition» (D:4976-4977).
- **El atajo que se quitó.** Con recetas Industrial se llegaba al centro en T2, saltándose T3–T6 y todos los Kardashev. «A survival victory at T2 makes the actual campaign optional.» (D:4846-4849, D:4974-4975).
- **⚑ GG.** Nuestro final cambia «llegar = victoria» por llegar y detonar el agujero negro, y con él el universo. Sigue siendo un final finito, ni vacío ni infinito. Lectura posible, que no está en Grindless: la explotación del agujero negro (acreción y energía rotacional) deja de ser postgame y pasa a ser el camino hacia la detonación.

---

## 4. Principios de diseño para el espacio

- **Recompensa, no trofeo.** «going to space must be a payoff, not a trophy»: cada objeto orbital trabaja para la base (R:1126-1127).
- **El espacio abre el juego.** «Factorio launches a rocket and the game ends. Here it is where the game opens up.» (R:1122).
- **Sin tareas de mantenimiento.** «no orbital decay, no refuelling, no maintenance minigame» (R:1147-1148). «Orbital upkeep would be a recurring chore» (D:441-442).
- **Infraestructura, no evento.** El Mass Driver «converts space from an event into infrastructure» (R:1140-1141).
- **Matar el viaje repetido.** «The Horizon Gate is what kills the commute» (R:1141-1142). La telepresencia «deletes the commute» (R:1244). «gates remove repeated travel» (R:1482).
- **Personas por la puerta, carga por el lanzador.** «Presence is the gate; bulk is the driver.» (R:1306). «People cheap, bulk expensive» (D:2742).
- **La puerta se gana.** El anillo lejano se entrega una vez: «That is the factory payoff, not a free portal.» (D:2739-2741).
- **Nunca un mundo para minar.** «A Horizon Gate never opens a world whose only job is "more ore."» (D:2745-2746).
- **Planetas como repartos.** «Planets are not reskins» (R:1209). Nada de menas únicas sin tag (D:2752-2753).
- **El sitio es una decisión.** «*where* you build is a genuine engineering decision» (R:1213-1214).
- **Colonias abstractas.** «Colonies are simulated abstractly, not tick-by-tick» (R:1259). «Force-loading remote bases is how servers die» (D:418).
- **Ritmo de atención.** «a colony wants attention every few hours, not every few minutes», y esa atención se puede automatizar (R:1268-1270).
- **Fallar cuesta material, no progreso.** «Failure costs materials, never progress.» (R:1238-1239). Los reactores se apagan en vez de explotar (R:1067-1070, R:1082-1083).
- **Volver es gratis.** La vuelta no consume para no dejar al jugador tirado sin red (D:4293-4294, D:4394-4395).
- **La órbita es necesaria.** «a manufacturing necessity rather than a victory lap» (M:698).
- **Nada de trofeos.** «Every endgame system has a real use. Nothing here is a trophy block.» (M:787-788).
- **Siempre hay que construir.** «Post-scarcity in *materials* is not post-scarcity in *throughput*.» (M:786).
- **Física, no máquinas.** «at the end, the factory stops being made of machines and starts being made of physics.» (M:763-764).
- **Complejidad sí, tareas no.** «Complexity rises; chores do not.» (P:402). «Solving a larger problem is progression; repeating a solved action is grind.» (D:4938-4939).
- **Cada automatización quita una repetición.** El extractor quita picar, el Assembler el crafteo, los drones colocar, los satélites prospectar, las puertas viajar y las colonias tickear lejos (R:1480-1483).
- **Sin atajos.** «A survival victory at T2 makes the actual campaign optional.» (D:4974-4975).
- **Misiones que no bloquean.** El libro sigue la ruta y nunca bloquea una máquina (R:280-281, D:4547-4553).
- **Ritmo antiguo.** «orbit is 25+ hours in» (R:2007), escrito para la escalera vieja de siete tiers.

---

## 5. Qué pasa a un pack de GregTech y qué no

### 5.1 Sistemas del mod Grindless que no pasan

| Sistema | Dónde | Por qué no pasa | Qué queda como idea o pieza GT |
|---|---|---|---|
| Flux Network: pilones, FU, apagones proporcionales, infravoltaje suave | R:295-347, R:1313-1413 | GT tiene EU, cables y sus propias reglas de voltaje | La escalera 8×4ⁿ, que ya es la de GT |
| Control Matrices, cinco arquitecturas, Research Station | R:1415-1483 | GT ya escalona con circuitos y voltaje | Cada tier acaba en un objeto de salida, y la tecnología nueva abarata la vieja (como las generaciones de circuitos de GT) |
| Vetas por chunk, agotamiento, Deep Bore, Deep Core Drill | R:349-446 | GT tiene sus vetas y perforadoras | El beat «el satélite te da el mapa de vetas» |
| Replicación de materia: Scanner, Deconstructor, Replicator, Matter Condenser | R:448-482, R:1827-1834 | Sistema propio | Que sobre material no significa que sobre producción (M:784-786) |
| Cintas, drones, Operator Drones, Flux Conduits, Phase Network | R:484-788 | GG usa tuberías de GT y AE2 | Multibloques cada vez mayores según la era (M:593-599) |
| Fluidos con temperatura y presión | R:790-910 | Otro modelo de fluidos | — |
| Exotrajes modulares y Arc Reactor en miniatura | R:935-984 | GT tiene sus armaduras | «The Exosuit becomes life support» (R:1307). GCYR trae un Oxygen Spreader (S:gtm-src/GCYR_Machines.java:66) |
| Resonance, Aberraciones, torretas y armas | R:986-1046 | Sistema propio del mod | Llevar la industria sucia a la órbita (R:1176-1178), solo si GG tuviera algo parecido |
| Multibloques paramétricos simulados antes de construir | M:567-617 | GT usa patrones fijos | El tamaño que crece por era |
| Libro de misiones propio | D:4542-4553 | GG usa FTB Quests | Que no bloquee nada |
| Registro por tags e integración con mods espaciales | R:1925-1990 | Infraestructura del mod | «Si hay mod espacial, usa sus planetas» (R:1189-1193): GCYR ya trae vetas en la Luna y Marte (S:gtm-src/GCYR_Ores.java:22-27, 41-48) |
| Telepresencia, Proxy Frame, Colony Core simulado, Horizon Gate, Interplanetary Router, drop pods | R:1216-1295 | Necesitan código propio; no salen de piezas GT o KubeJS sin más | Los beats de §5.2: se rehacen o se dejan fuera |
| Peajes en FU, enlaces y cohete que sube al techo | D:4127-4134, D:4282-4296 | Números y bloques del mod | Pagar solo la ida y volver gratis |

### 5.2 Lo que sí pasa: campaña, beats e ideas

- **El arco.** Los 16 tiers con nombre y tema, y las cuatro líneas que convergen en un objeto de salida (R:1450-1467, P:373-390).
- **Los hitos.** Kardashev I en Planetary, II en Stellar y III en Galactic (R:260-261), con las megaestructuras de §3.2 entre medias.
- **Los lugares y sus recursos.** Luna con helio-3, los seis mundos con su firma, el Drift vacío y Sagitario sellado (§2).
- **La escalera de transporte.** Cohete, Mass Driver, estación, ascensor, puerta, estación supralumínica y ruta final (§2.1).
- **Los satélites.** Mapa, energía radiada, relé, centinela, logística y sondeo lejano, sin mantenimiento (§2.7).
- **Las cuatro formas de explotar un mundo**, como beats (§2.8).
- **La industria orbital como razón para subir:** vacío, gravedad cero y frío (§2.10). Las recetas de GTM admiten `.dimension(...)` (S:gtm-src/ChemistryRecipes.java:102), así que un proceso puede exigir la órbita y un recurso su mundo.
- **Piezas GCYR que ya cubren beats.** Dyson System Controller (S:gtm-src/GCYR_Machines.java:177), Space Elevator (:204), Space Station Packager (:125) y Drone Hangar (:248). Ojo: GCYR está congelado hasta rediseñar el espacio (GG:DECISIONS.md:50).
- **Las dimensiones del prototipo.** Son datapacks planos y MIT del propio usuario (RES/data/grindless/dimension/{luna,drift,sagittarius}.json). Se pueden portar a `pack/kubejs/data/` registrando sus bloques con KubeJS y rehaciendo la sala de Sagitario como script (J/centre/CentreChamber.java). La atribución va en `CREDITS.md`.
- **Los principios de §4.**

### 5.3 Contradicciones y huecos en la fuente

- **Planetas.** R:1189-1195 y R:1979-1983 dicen «si hay mod espacial, usa sus planetas». ADR-0088 lo invierte («Planets are original», D:3588-3590), y R:1974-1977 deja esas filas como diseño en espera.
- **Horizon Gate.** ADR-0068 la ponía en T6 (D:2735); ADR-0107 la pasa a T11 (D:4941-4945, R:1137).
- **Nombre de la Matrix.** El Launch Pad pide «an Orbital Matrix» (R:1133), pero la arquitectura de T10 se llama Photonic (R:1436).
- **Dyson.** Collector a F8–F9 antes de ADR-0107 (D:3988-3990) frente a la Dyson Network de T12 (M:774).
- **Autorreplicación.** P:389, P:401-402 y R:1473 la mantienen; ADR-0188 la recorta para las máquinas normales (D:9121, R:1575-1578).
- **Luna.** Tiene peligro de vacío en el diseño (R:1199), pero en el prototipo no hay daño de vacío ni soporte vital (D:4116-4117).
- **Agujero negro.** El interior debe ser «a finite finale» (D:3593), pero la sala actual es solo un destino de prueba (D:4949-4950).
- **Abierto en la fuente.** El formato de dirección y el coste de la Horizon Gate (M:854-856). También dónde se cruza la línea orbital con el final de GT: «Grindless should complement rather than duplicate» (M:852-853).
