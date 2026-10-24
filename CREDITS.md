# Créditos

El pack no redistribuye mods: packwiz los descarga de su fuente oficial (Modrinth, CurseForge o el maven del autor). Cada mod conserva su licencia.

## Base

| Qué | Autor | Licencia | Uso |
|---|---|---|---|
| GregTech CEu Modern 7.5.3 | GregTechCEu | LGPL-3.0 | Mod base. Casings y texturas de GTM se referencian sin copiarlas. |
| KubeJS, Rhino | Latvian / KubeJS-Mods | LGPL-3.0 | Scripts del pack. |
| FTB Quests, Library, Teams | FTB | Licencia del autor | Libro de misiones. |

## Ideas y procesos

Las ideas no se copian como texto ni como código: se rehacen con nuestras reglas y se dice de dónde salen.

| Idea en Gregtech Grindless | De dónde sale | Licencia de la fuente | Qué tomamos |
|---|---|---|---|
| Perforadora de vetas con muestra que no se gasta | GregTech Leisure (datos escaneados una vez como catalizador; minero de vacío con veta por circuito), Monifactory (la cabeza del microminero elige la tabla) | GTL: no está clara (solo ideas). Monifactory: LGPL-3.0 | El concepto. La implementación es nuestra. |
| Broca que se desgasta por probabilidad | Star Technology (mallas con desgaste por probabilidad) | MIT | El concepto. |
| Una sola tabla de vetas para todos los tiers | Packs de la familia skyblock y GTE2 (tabla compartida de automatización de mineral) | Varias | El concepto. |
| Invernadero de vapor con plantón como catalizador | Star Technology (Tree Synthesizer, semillas como catalizador), Monifactory (Greenhouse de MV), ejemplo de Greenhouse de la documentación de GTM | MIT / LGPL-3.0 / CC0 | El concepto, adelantado a la era de vapor. |
| Tabla de vetas (pesos y alturas) | GTM 7.5.3, `GTOres.java` | LGPL-3.0 | Datos de las vetas del Overworld y del Nether |
| Fertilizante elegido por circuito en el invernadero LV | Monifactory | LGPL-3.0 | El concepto |
| Lodo de perforación como bonificación de la perforadora LV | Receta de lodo de GTM | LGPL-3.0 | La receta existente como insumo |
| Simulador de criaturas con modelos que no se gastan y sin matar | Monifactory y Nomifactory (Deep Mob Learning); Hostile Neural Networks como alternativa descartada | LGPL-3.0 / MIT | El concepto. La implementación es nuestra. |
| AE2 fabricada con máquinas GT (prensas en prensa de formado, sin meteoritos) | Star Technology | MIT | El concepto |
| Horno de arco sumergido (silicio, polvo del cielo y obsidiana en LV) | Idea propia, a partir del hueco de silicio en LV que señala la investigación | — | — |
| Planta de mineral (toda la cadena de GT en una pasada, misma energía) | GTMoreOreProcessing y GTE2 (Ore Processing Factory) | LGPL-3.0 | El concepto. Las recetas se componen desde las de GTM. |
| Controlador fabricado con las máquinas que sustituye | Star Technology | MIT | El concepto |
| Biorrefinería (columna de fracciones orgánicas) | Clase `DistillationTowerMachine` y recetas de la torre de GTM | LGPL-3.0 | Se reutilizan la clase y las recetas |
| CO₂ en el invernadero (más producción, devuelve O₂) | Star Technology | MIT | El concepto |

## Misiones

No se ha copiado texto literal de ningún libro. Se han adaptado convenciones de estructura y diseño de tareas.

| Qué | De dónde sale | Licencia | Qué tomamos |
|---|---|---|---|
| Una misión por máquina; tareas opcionales hermanas para LP/HP; forma de engranaje solo para multibloques clave | Star Technology, `config/ftbquests/quests/chapters/early_game.snbt` | MIT | Convenciones de estructura |
| Opciones base de `data.snbt`, un grupo de capítulos con nombre, premio pequeño por misión | Monifactory, `config/ftbquests/quests/data.snbt`, `chapter_groups.snbt`, `chapters/groundwork.snbt` | LGPL-3.0 | Convenciones de estructura y opciones (archivo derivado) |
| Comprobación cruzada de IDs de GTM | TerraFirmaGreg | Sin licencia | Solo consulta |

## Assets

Cada textura propia se anota aquí con su origen.

| Archivo | Origen | Licencia |
|---|---|---|
| `pack/kubejs/assets/grindless/textures/block/multiblock/steam_vein_drill/overlay_front.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/steam_vein_drill/overlay_front_active.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/steam_vein_drill/overlay_front_active.png.mcmeta` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/steam_vein_drill/overlay_front_active_emissive.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/steam_vein_drill/overlay_front_active_emissive.png.mcmeta` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/steam_greenhouse/overlay_front.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/steam_greenhouse/overlay_front_active.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/steam_greenhouse/overlay_front_active.png.mcmeta` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/steam_greenhouse/overlay_front_active_emissive.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/steam_greenhouse/overlay_front_active_emissive.png.mcmeta` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/bronze_drill_bit.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/steel_drill_bit.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/empty_vein_probe.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/vein_sample_frame.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/vein_sample_core.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/void_key.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/flat_key.png` | Generada con tools/assets/Build-SteamTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/lv_vein_drill/overlay_front.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/lv_vein_drill/overlay_front_active.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/lv_vein_drill/overlay_front_active.png.mcmeta` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/lv_vein_drill/overlay_front_active_emissive.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/lv_vein_drill/overlay_front_active_emissive.png.mcmeta` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/lv_greenhouse/overlay_front.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/lv_greenhouse/overlay_front_active.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/lv_greenhouse/overlay_front_active.png.mcmeta` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/lv_greenhouse/overlay_front_active_emissive.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/lv_greenhouse/overlay_front_active_emissive.png.mcmeta` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/submerged_arc_furnace/overlay_front.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/submerged_arc_furnace/overlay_front_active.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/submerged_arc_furnace/overlay_front_active.png.mcmeta` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/submerged_arc_furnace/overlay_front_active_emissive.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/submerged_arc_furnace/overlay_front_active_emissive.png.mcmeta` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/machines/creature_simulator/overlay_front.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/machines/creature_simulator/overlay_front_active.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/machines/creature_simulator/overlay_front_active.png.mcmeta` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/machines/creature_simulator/overlay_front_active_emissive.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/machines/creature_simulator/overlay_front_active_emissive.png.mcmeta` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/graphite_electrode.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/blank_creature_model.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/creature_model_base.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/creature_model_core.png` | Generada con tools/assets/Build-LVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/mv_vein_drill/overlay_front.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/mv_vein_drill/overlay_front_active.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/mv_vein_drill/overlay_front_active.png.mcmeta` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/mv_vein_drill/overlay_front_active_emissive.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/mv_vein_drill/overlay_front_active_emissive.png.mcmeta` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/mv_greenhouse/overlay_front.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/mv_greenhouse/overlay_front_active.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/mv_greenhouse/overlay_front_active.png.mcmeta` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/mv_greenhouse/overlay_front_active_emissive.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/mv_greenhouse/overlay_front_active_emissive.png.mcmeta` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/ore_plant/overlay_front.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/ore_plant/overlay_front_active.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/ore_plant/overlay_front_active.png.mcmeta` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/ore_plant/overlay_front_active_emissive.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/ore_plant/overlay_front_active_emissive.png.mcmeta` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/biorefinery/overlay_front.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/biorefinery/overlay_front_active.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/biorefinery/overlay_front_active.png.mcmeta` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/biorefinery/overlay_front_active_emissive.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/block/multiblock/biorefinery/overlay_front_active_emissive.png.mcmeta` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
| `pack/kubejs/assets/grindless/textures/item/vanadium_steel_drill_bit.png` | Generada con tools/assets/Build-MVTextures.ps1 (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |
