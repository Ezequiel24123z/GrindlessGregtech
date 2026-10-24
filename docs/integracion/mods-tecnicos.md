# Mods técnicos y mágicos: integración con GregTech

Borrador para el orquestador. Solo diseño: no se ha instalado nada ni escrito ningún script. Parte de la visión del usuario (entra todo lo bueno, pero pasando por GregTech) y de lo que hacen Monifactory, TerraFirmaGreg, Star Technology, CTNH y Cosmic Frontiers. Las versiones se comprobaron en Modrinth el 2026-10-24 (1.20.1, Forge); lo demás lleva *(verificar)*.

## Reglas de integración

1. **Entra lo que añade un lenguaje que GT no tiene** (mecánica y trenes, lógica programable, magia). Lo que repite una máquina de GT sale; si dos hacen lo mismo, se queda la mejor.
2. **La puerta son piezas de GT.** Los 3–6 objetos que abren un mod se rehacen con circuito (`#gtceu:circuits/<tier>`), casco, motor y placas del tier: se quitan por id o tipo y se vuelven a añadir en el ensamblador de GT, con el mismo id de objeto (Star Tech, Monifactory). Las tablas viven en `data/mod_gates.js` y las recetas salen de un bucle.
3. **Energía solo en EU.** Con `nativeEUToFE` (4 FE por EU) los cables de GT ya alimentan consumidores FE y los conversores FE→EU están activos (`config/gtceu.yaml`). Por eso ningún mod puede fabricar un generador: sería EU gratis (como el generador de miel de Productive Bees, ya quitado). Create, maná, Source y presión tienen su propia energía y no se convierten.
4. **Mena y proceso son de GT.** Se quitan las recetas ajenas que aplastan, lavan, inyectan o disuelven mena, los generadores de mena (Orechid, vetas de Create, espíritus mineros) y las aleaciones baratas. Solo las perforadoras nuestras dan mena de forma automática.
5. **Un solo material.** Almost Unified con `gtceu` primero y tags: ni segundo cobre, ni zinc, ni latón.
6. **Los mobs van al simulador.** Fuera spawners, trituradores y pozos de otros mods. El XP sale del simulador, no de matar.
7. **Carril paralelo, nunca puerta obligatoria.** Ninguna receta de la ruta principal pasa por estos mods (mv.md ya lo dice de Create).
8. **Un `integration/<mod>.js` por mod**, con la cabecera que dice qué se quita y por qué (como `pipez.js` y `productivebees.js`). Lo quitado se oculta también en EMI (client script, como las nukelists de Monifactory).

## Qué hacen otros packs

| Pack (licencia) | Qué hace |
|---|---|
| Monifactory (LGPL-3.0) | Thermal: borra las máquinas y deja extrusor (solo piedra), acumulador, crisol (solo lava) e insolador. Ender IO: aleaciones, vidrio y condensadores por aleador y autoclave GT. Create ("diversión, no funcionalidad"): quita los tipos `create:deploying`, `crushing`, `milling` y `pressing` y la manivela; el mecanismo de precisión y las carcasas, en el ensamblador; andesita en el mezclador; cintas de goma. Integrated Dynamics: sin squeezer ni drying basin, menril por extractor GT. Flux Networks: polvo en baño químico, núcleo en ensamblador LuV. No usa Mekanism. |
| Star Technology (MIT) | `mass_removals.js` con tres listas (`toRemoveOutput`, `Id`, `Type`); dinamos de Thermal hechos en el ensamblador GT; `create/base.js` (placas GT con `create:pressing`); hypertubes por ensamblador; Flux con polvo en LCR; guardas `//requires: modid`. Nuestro catálogo anota que su carril de Create deja de servir pasado EV. |
| TerraFirmaGreg (LGPL-3.0 en su KubeJS; el libro de misiones no tiene licencia) | Greate con 5 tiers (andesita, acero, aluminio, inox, titanio) y capacidad 32 SU ×4 por tier (`startup_scripts/greate/*`); `greate/recipes.removes.js`; `create_additions/recipes.js` borra todo CCA y rehace unas 6 recetas con GT. Sin Mekanism, Thermal, Ender IO ni magia. |
| CTNH, Create: New Horizon (LGPL-3.0; arte CC BY-NC) | Create + GT + magia. La integración vive en mods Java propios (CTNH-Core, CT++, CTNH-Mana): máquinas GT con entrada cinética y maná dentro de máquinas GT (`BTManaContainerTrait`). Reescribe Orechid con menas GT (59 recetas) y los meteoros de Blood Magic: justo lo que aquí se quita. |
| Cosmic Frontiers (LGPL-3.0; rama actual 1.21.1) | Ars Nouveau y Occultism rehechos con piezas GT; la magia como materia prima de cadenas GT (`SourceDiesel.js`); láminas de Create → placas GT con `replaceInput` global (ellos mismos avisan de que es lento). |
| GTL (licencia no clara: solo ideas) | Ender IO (+Evolution), Re:Avaritia y Ad Astra sobre GTM; sin Mekanism, Thermal ni Create. |

## Veredicto por mod

KEEP entra · LATER entra más adelante o es opcional · DROP fuera. Era = cuándo se abre.

| Mod (versión) | Veredicto | Era | Por qué |
|---|---|---|---|
| Create 6.0.8 + kubejs-create | KEEP | LV–EV | Contraptions, trenes, crafteo mecánico y ensamblaje secuenciado: complejidad que GT no tiene |
| Greate 0.0.82 (MIT) | KEEP | LV–EV | El puente Create×GT; compila contra GTM 7.5.3, KubeJS 2001.6.5 y EMI 1.1.22 (nuestro stack) |
| Create Connected, Deco, Copycats | KEEP | LV | Decoración industrial; sustituye la estética de Immersive Engineering |
| Steam 'n' Rails 1.7.3 | KEEP | LV–HV | Único mod de trenes |
| Create Stock Bridge 0.2.0 (MIT) | KEEP | LV | Une el Stock Ticker con AE2 |
| Create Enchantment Industry 2.5.4b (+Dragons Plus) | KEEP | MV | Encantado automático; el XP sale del simulador |
| Create Hypertube 0.6.0 | KEEP (opcional) | MV | Transporte rápido de objetos que Create no trae |
| Create Vintage 1.6.4 (MIT), Low-Heated, Liquid Fuel | LATER | MV | Vintage añade vacío y vibración que Greate no copia; los otros dos mueven el calor de Create a combustibles GT. Se decide tras el lote A |
| Create Crafts & Additions | DROP | – | El alternador es SU→FE→EU gratis; el viento ya da SU en cualquier sitio |
| Create New Age, Steam Powered | DROP | – | Generadores FE y un segundo vapor |
| Create Diesel Generators, TFMG | DROP | – | Petroquímica y acero que GT ya hace |
| Create Ore Excavation, Northstar | DROP | – | Excavadora de vetas (las perforadoras son nuestras); Northstar solapa GCYR |
| Mekanism + Generators, Tools, Additions (10.4.16) | DROP | – | Cadena de polvos ×2 a ×5 sobre la mena, Digital Miner (cantera), solar y viento = EU gratis; ningún pack GTM lo integra |
| Applied Mekanistics, Pretty Pipez | DROP | – | Dependen de Mekanism |
| Thermal Foundation, Expansion, Dynamics, Cultivation, Innovation (11.0.x) | DROP | – | Monifactory y Star Tech borran sus máquinas; lo que conservan (extrusor, acumulador, crisol, insolador, dinamos) ya lo cubren nuestras bombas, triturador, lava colocada, invernadero y generadores GT; sus metales duplican GT |
| Industrial Foregoing 3.5.22 | DROP | – | Laser Drill, Mob Crusher, Plant Gatherer y procesador de mena son cantera, granja de mobs, invernadero y mena barata. Titanium se queda (lo pide Functional Storage) |
| Ender IO 6.2.18-beta | DROP | – | Port incompleto; conduits repiten Pipez, LaserIO y AE2; spawner y soul binder son granja de mobs |
| Immersive Engineering 10.2.0 | DROP | – | Excavadora, triturador y horno de arco repiten GT; molino y dinamo son FE gratis |
| Integrated Dynamics 1.31.3 (+Tunnels, Terminals) | KEEP | MV | Lógica programable que lee inventarios, fluidos y energía de máquinas GT; nada igual en GT ni AE2 |
| PneumaticCraft 6.0.23 | LATER | HV | Presión, drones y plataforma de ensamblaje: complejidad real, pero es un segundo árbol (refinería, plásticos) |
| Flux Networks (solo CurseForge) | LATER | LuV | FE inalámbrica; ya hay `eup2p` y, en gtmutils, un puente inalámbrico *(verificar su tier)*. Si entra, con la puerta de Monifactory |
| Draconic Evolution 3.1.2 | DROP | – | Segundo endgame con energía propia; pide Brandon's Core y CodeChicken Lib; sin precedente en packs GTM |
| Re:Avaritia 1.4.2 | LATER | UEV+ | Sumidero final (caja extrema, catalizador infinito); GTL lo trae sobre GTM. Se decide con el diseño UHV+ |
| Botany Pots 13.0.43 (LGPL-2.1) | KEEP | LV | Cultivo compacto con tolva, apto para cualquier planta; no sustituye al invernadero |
| Productive Bees 12.6.0 / Trees 0.2.6 | KEEP (decidido) | MV | Cría y madera decorativa; paneles solo por máquinas GT (`productivebees.js` ya está) |
| Mystical Agriculture (+Agradditions) | DROP | – | Esencia → lingotes y gemas es duplicar material y saltar la cadena; Star Tech lo quitó |
| Botania 1.20.1-456 | KEEP | MV–HV | Red de maná y jardín automatizable: magia técnica sin equivalente GT |
| Occultism 1.158.0 (+occultism-kubejs) | KEEP | MV–HV | Espíritus, rituales y familiares |
| Ars Nouveau 4.12.7 | LATER | HV | Hechizos y Source; es la tercera magia, la primera en caer si pesa |
| Blood Magic 3.3.8 | DROP | – | Sacrificio y pozo de sufrimiento (granja de mobs), meteoros y ritual del imán (mena y cantera) |
| GCYR 0.2.9 (ya instalado) | KEEP | EV–UV | Cohetes por piezas, estaciones, satélites, esfera de Dyson y los planetas Luna, Marte, Mercurio, Venus y Proxima b; hv.md decide el primer cohete en EV |
| Ad Astra 1.15.21 (+Rocketed, canned food) | DROP | – | GCYR da los mismos planetas; Monifactory, TFG y GTL lo usan porque no traen GCYR |
| Almost Unified 0.11.0 | KEEP | lote A | Un solo material con `gtceu` primero; Monifactory y Star Tech lo usan |

## Puertas por tier

| Tier | Pieza GT de la puerta | Qué abre |
|---|---|---|
| Vapor | placas de acero y bronce | Nada de estos mods: ejes y decoración de Create, sin máquinas |
| LV | `#gtceu:circuits/lv`, motor y brazo LV | Create (deployer, crafter, brazo; prensa, mezcladora y sierra de Greate en acero), vías de Steam 'n' Rails, Stock Bridge, Botany Pots |
| MV | `#gtceu:circuits/mv`, aluminio | Greate en aluminio, bogies de Steam 'n' Rails, Enchantment Industry, Hypertube, Integrated Dynamics, Botania (esparcidor, piscina), Occultism |
| HV | `#gtceu:circuits/hv`, inox | Greate en inox, locomotoras, Tunnels, placa de terra, Ars Nouveau, PneumaticCraft |
| EV | `#gtceu:circuits/ev`, titanio | Greate en titanio (aquí termina el carril de Create); primer cohete de GCYR |
| LuV+ | sensor y emisor LuV | Flux Networks; Re:Avaritia con investigación |

## Cómo entran

### Create + Greate (LV a EV)

- **Aporta:** contraptions, cintas, brazos y deployers, trenes, crafteo mecánico y ensamblaje secuenciado. Es el lenguaje de automatización visual que GT no tiene. Greate pone tiers de GT a ejes, engranajes, ruedas, prensas, mezcladoras y sierras. Create trae Flywheel, Ponder y Registrate dentro (Modrinth no pide dependencias).
- **Puerta:** Create abre en LV (el vapor ya tiene sus multibloques): mecanismo de precisión, deployer, brazo y crafter piden circuito LV y motor o brazo LV hechos en el ensamblador. Andesita por mezclador GT, cintas con goma del invernadero (no alga), carcasas con placa de latón o acero. Tiers de Greate por material de eje: andesita → acero (LV) → aluminio (MV) → inox (HV) → titanio (EV); se cortan ahí, como TFG (`AVAILABLE_GREATE_MATERIAL_TIERS`, capacidad 32, 128, 512, 2 048 y 8 192 SU). Las recetas de crafteo de Greate se quitan y se rehacen en el ensamblador (TFG); antes se prueba `enableHardCreateRecipes = true`.
- **Se quita o se reencamina:**
  - Worldgen de Create: `zinc_ore`, `striated_ores_overworld` y `striated_ores_nether` (biome_modifier → `forge:none` en el datapack de KubeJS). GTM solo quita la mena vanilla.
  - La rama 1.20.1 de Create trae 82 recetas `create:crushing` (55 de mena o `raw_*`), 47 `milling` y 17 `splashing`. Las de `raw_*` usan el tag `forge:raw_materials/<metal>` y solo exigen que el tag exista, así que con GT quedan activas casi todas (hierro, cobre, oro, zinc, estaño, plomo, plata, níquel…): la rueda aplasta la mena en bruto de GT, da XP de regalo y se salta la cadena. Lavar `crushed_raw_iron` da 9 pepitas y 0,75 de redstone que GT no da. Se quita todo `create:crushing` (Monifactory también), el `splashing` de `crushed_raw_*` y su fundición a lingote; `milling` solo se queda para plantas y hueso *(revisar)*.
  - Greate: `ignoredRecipeTypes = [gtceu:macerator, gtceu:ore_washer]`. Ninguna máquina Create o Greate procesa mena ni muele materiales GT; forma (bender → prensa), corta (cutter → sierra), mezcla y compacta sí. `disableConflictingRecipes = true` y `useCreateItemsInRecipes = false` (config `greate-recipes`).
  - Manivela (se abusa en contraptions, como dice Monifactory) y mezclas de latón o zinc que den un segundo lingote (AU + tags, no `replaceInput` global).
- **Poder:** la SU no se convierte: ni alternador ni conversor, así que CCA queda fuera. Ruedas, molinos y motor de vapor de Create solo mueven máquinas Create y Greate; Greate limita 8 ruedas por red y la RPM por material de eje. El vapor de GT y el de Create (calderas de Steam 'n' Rails) son redes separadas. Opcional: Create Liquid Fuel para que los quemadores de blaze usen combustibles GT (datos `blaze_burner_fuel` de CTNH).
- **Riesgos:** Greate (0.0.x, en desarrollo) convierte las recetas GT al cargar con un mixin a `RecipeManager.apply`; esas recetas no se pueden quitar por entrada, solo por id o salida. Otros mods que tocan la carga de recetas (FastSuite, ModernFix) *(verificar)*. Hace más lenta la recarga y llena EMI de recetas. Colisión de ids de material con GTCA y GT-- *(verificar al arrancar)*. Flywheel con Oculus y shaders *(probar cliente)*. **Plan B** si el banco lo rechaza: Create sin procesado, como Monifactory (quitar `create:crushing`, `milling` y `pressing`; dejar crafter, deployer, cintas y trenes).

### Complementos de Create

- **Steam 'n' Rails (LV–HV):** vías de acero y goma en LV, bogies con motor MV, locomotoras con circuito HV e inox. Sus calderas son de Create.
- **Stock Bridge (LV):** circuito LV más piezas de AE2. **Hypertube (MV):** latón y circuito MV (Star Tech: ensamblador a 30 EU/t).
- **Enchantment Industry (MV):** blaze enchanter y disenchanter con circuito MV y acero. El XP sale de una receta del simulador de criaturas hacia fluido de XP (idea de Monifactory) *(verificar id del fluido)*. Se quitan el XP de las pepitas de Create y cualquier receta que obligue a matar.

### Integrated Dynamics (MV)

- **Aporta:** variables, lectores, escritores y operadores. Lee por capabilities lo que hay dentro de máquinas GT sin cables de redstone. Pide Cyclops Core (ya está por Colossal Chests) y Common Capabilities.
- **Puerta:** programador lógico, lectores y proxy con circuito MV; Tunnels con HV.
- **Se quita:** squeezer y drying basin (mena con extras; Monifactory los quita por id), el menril pasa por extractor, solidificador y mezclador de GT, y el generador de carbón y la batería (FE).

### Plantas: Botany Pots, Productive Bees y Trees

- **Botany Pots (LV):** macetas con acero GT. Solo flores, hongos, bayas, tintes y comida; los árboles, la madera y la resina siguen siendo del invernadero, que gana en rendimiento por circuito y fertilizante. Suelos con fertilizante GT. Datos `botanypots:crop` y `soil` desde KubeJS.
- **Productive Bees y Trees (MV):** decidido. Trees es beta y All Rights Reserved: cría y 160 maderas decorativas; si trae árboles de recurso, se quitan *(verificar)*.

### Botania (MV a HV)

- **Aporta:** maná, esparcidores, flores generadoras y jardines que se automatizan; es magia con "cables" visibles. Curios y Patchouli ya están.
- **Puerta:** el manasteel se infunde con lingote de acero GT, no de hierro; esparcidor y piscina piden circuito MV; la placa de terra pide perla del simulador, diamante GT y circuito HV. Los élficos y Gaia, EV o más.
- **Se quita:** `botania:orechid` (16 recetas) y `orechid_ignem` (3): mena a partir de piedra y maná (CTNH las reescribe con menas GT; aquí no). De las 139 de `mana_infusion` se quitan los `*_dupe` de conjuración (carbón, redstone, glowstone, cuarzo, grava, netherrack, nieve, arena de almas) y las que cambian materiales que GT controla (`flint_to_gunpowder`, `glowstone_dust_to_redstone`, `redstone_to_glowstone_dust`, `ender_pearl_from_ghast_tear`, `rotten_flesh_to_leather`). También el Mana Fluxfield (FE). Ids de la rama 1.20.x.
- **Poder:** maná propio. Si algún día se quiere maná como entrada de una receta GT, CTNH lo hace con un mod Java; aquí no.

### Occultism (MV a HV)

- **Aporta:** espíritus, rituales y familiares. Geckolib y Curios ya están; faltan Modonomicon y Smartbrainlib.
- **Puerta:** rituales con gemas y placas GT de MV (certus, plata, aluminio), como hace Cosmic Frontiers con `gtceu:certus_quartz_gem`.
- **Se quita:** `occultism:crushing` (181 recetas que dan 2 polvos por mena en bruto, activas para todo metal GT cuyo tag exista), `occultism:miner` (86 tablas de mena) y los rituales del minero y la mina dimensional (Cosmic Frontiers los conserva; aquí son mena mágica). El almacenamiento dimensional se oculta: AE2 lo cubre.

### Opcionales: Ars Nouveau, PneumaticCraft, Flux Networks, Re:Avaritia

- **Ars Nouveau (HV):** se rehace con piezas GT como en Cosmic Frontiers (aparato de encantamiento, pedestales y núcleo arcano con placa de inox y circuito HV). Se quitan Drygmy (granja de mobs), el golem de amatista y cualquier ritual o familiar que dé menas o drops *(verificar ids)*. Sus 26 recetas de `crush` son tintes y piedra: no hace falta tocarlas.
- **PneumaticCraft (HV):** se quitan los lagos de petróleo, la refinería y el mezclador de plástico (GT hace petroquímica y polímeros), la dínamo neumática (FE gratis) y se rehace el hierro comprimido con acero GT. Cámara de presión con inox y circuito HV.
- **Flux Networks (LuV):** polvo por baño químico y núcleo en ensamblador LuV (Monifactory). Solo con distribución confirmada.
- **Re:Avaritia (UEV+):** sin Neutron Collector ni Compressor (GT tiene neutronio); el catalizador infinito sale de una línea de ensamblaje con investigación.

### GCYR y Almost Unified

- **GCYR:** camino al espacio (LGPL-3.0, adaptable con atribución). Sus cohetes piden kapton e inox a 480 EU/t (visto en el lote 6): se abren en EV, no en HV (hv.md). Ad Astra fuera: sus generadores y su oxígeno duplican GT y sus planetas están en GCYR.
- **Almost Unified:** se descartó cuando solo había GTM; con Create y Greate hace falta. `config/almostunified/unify.json` con `gtceu` primero *(verificar claves)*. Evita el `replaceInput` global de Cosmic Frontiers.

## Energía y puentes

- **EU ↔ FE:** `nativeEUToFE` y `euToFeRatio = 4` alimentan consumidores FE desde cables GT; los conversores usan `feToEuRatio = 4`. Mientras no haya generadores ajenos, ese puente no regala nada.
- **Generadores que se quitan en los mods que entran:** Botania (Mana Fluxfield), Integrated Dynamics (generador de carbón y batería), PneumaticCraft (dínamo neumática) y Productive Bees (generador de miel, ya quitado). En los que no entran, el generador es parte del motivo (Thermal, Mekanism Generators, Immersive Engineering, CCA, New Age).
- **SU de Create:** red propia, sin puente a EU ni a vapor. CTNH sí tiene un puente cinético en Java (CT++); aquí no se mezclan SU y EU.
- **Maná, Source y presión:** propios. La magia puede ser materia prima de cadenas GT (Cosmic Frontiers) pero nunca fabrica menas, lingotes, circuitos ni fluidos GT.

## Riesgos y dudas

- **Orden de carga y recetas:** Greate y Almost Unified reescriben recetas al cargar. Hay que fijar el orden frente a FastSuite y ModernFix y medir el tiempo de recarga antes y después del lote A.
- **Worldgen:** tras cada lote se repite `gg_test_worldgen` (línea base del lote 6: 96 471 bloques de mena GT, 0 de vanilla). Vigilar Create, Occultism (mena de iesnium) y Botania.
- **EMI:** Greate y lo que se oculta añaden recetas y huérfanas; se revisan con la validación estática del tier (`Invoke-Reachability.ps1`).
- **Versiones:** Create 6.0.8 y Botania 456 son las últimas en Modrinth para 1.20.1. Thermal (2024) y Mekanism (2025-05) están congeladas; Ars Nouveau 4.12.7 (2025-06) y Productive Trees 0.2.6 (2024-08) no se mueven.
- **Distribución:** Flux Networks no está en Modrinth. `packwiz cf add` solo si su página permite distribuirlo (AGENTS.md).
- **Dudas de ids:** los de Ars Nouveau y Occultism (rituales, familiares) no se han comprobado contra los jars; se leen en el banco antes de escribir cada `integration/<mod>.js`.

## Orden de lotes

1. **A · base Create (LV).** Almost Unified, Create, Greate, kubejs-create, Create Connected, Deco y Copycats. Scripts `create.js`, `greate.js`, `almostunified.js` y datapack de worldgen. Pruebas: arranca; sin recetas de mena de Create, sin zinc ni vetas estriadas y recarga medida; andesita → eje → rueda → prensa forma una placa y el mecanismo de precisión sale del ensamblador LV.
2. **B · trenes y puentes (LV–MV).** Steam 'n' Rails, Stock Bridge, Hypertube, Enchantment Industry (+Dragons Plus) con la receta de XP del simulador.
3. **C · lógica y plantas (MV).** Integrated Dynamics (+Tunnels, Terminals), Botany Pots y Productive Trees (con Productive Bees, ya en MV).
4. **D · magia técnica (MV–HV).** Botania y Occultism (+occultism-kubejs). Pruebas: ninguna receta produce menas, y el manasteel y los rituales piden piezas GT.
5. **E · opcionales (HV–EV).** Ars Nouveau y PneumaticCraft, solo con visto bueno del usuario tras ver D.
6. **F · cola (LuV+).** Flux Networks y Re:Avaritia, con el diseño UHV+.

Cada lote: 2–3 pruebas (AGENTS.md), un capítulo corto de misiones en inglés sin bloquear recetas, y si falla se quita ese lote solo.

## Decisiones propuestas

1. **Create y Greate entran en LV** y el carril cinético llega hasta EV (andesita, acero, aluminio, inox, titanio). No procesan mena: Greate ignora `gtceu:macerator` y `gtceu:ore_washer` y se quitan las recetas de mena de Create.
2. **Almost Unified** entra con el lote A como único unificador, `gtceu` primero.
3. **Sin generadores ajenos.** Los consumidores FE se alimentan de cables GT; ningún mod produce energía para la red. La SU, el maná, el Source y la presión no se convierten.
4. **Fuera:** Mekanism y sus addons, Applied Mekanistics, Thermal (los cinco), Industrial Foregoing, Ender IO, Immersive Engineering, Draconic Evolution, Mystical Agriculture, Blood Magic, Ad Astra, Create Crafts & Additions, New Age, Steam Powered, Diesel Generators, TFMG, Ore Excavation y Northstar.
5. **Integrated Dynamics** entra en MV con las puertas de arriba.
6. **Botania y Occultism** entran en MV–HV sin menas ni canteras. **Ars Nouveau y PneumaticCraft** quedan para después de D.
7. **Botany Pots** (LV) solo para flores y comida; árboles y resina, solo en el invernadero.
8. **GCYR es el espacio.** Ad Astra no entra.
9. **Magia = materia prima, no atajo.** Nada mágico fabrica menas, lingotes, circuitos ni fluidos GT.
10. **Plan B de Greate:** si el banco lo rechaza, Create sin procesado (Monifactory).
11. **Pendiente del usuario:** (a) fisión nuclear: GTM no la trae y sus addons no cargan en 7.5.3; si la quiere, Mekanism Generators entra con todo lo demás oculto; (b) Ars Nouveau y PneumaticCraft; (c) Flux Networks y Re:Avaritia; (d) mods solo de CurseForge.

Créditos a anotar en `CREDITS.md`: quitar el procesado de Create y rehacer andesita, mecanismo de precisión y carcasas en el ensamblador (Monifactory, LGPL-3.0); tiers de Greate y capacidad de SU por tier (TerraFirmaGreg, LGPL-3.0); listas de quitar y guardas `//requires` (Star Technology, MIT); magia como materia prima de cadenas GT y recetas de Ars y Occultism con piezas GT (Cosmic Frontiers, LGPL-3.0); Greate (MIT) como puente; descartado: el puente cinético en Java de CTNH (LGPL-3.0).

## Decisiones tomadas (orquestador, 2026-10-24)

Se aprueban las propuestas 1–10. La 11 queda así:

- **(a) Fisión:** no entra por ahora. Si EV o IV la necesitan, será un multibloque nuestro y no Mekanism.
- **(b) Ars Nouveau y PneumaticCraft:** después del lote D, si la magia técnica encaja.
- **(c) Flux Networks y Re:Avaritia:** con el diseño de UHV+.
- **(d) Mods solo de CurseForge:** entran únicamente si permiten distribución.

Los lotes A–D los aplica el agente de lotes de mods en ese orden, cada uno probado sobre una copia antes de fusionarlo.