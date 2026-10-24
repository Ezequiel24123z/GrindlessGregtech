# Auditoría de complejidad por tier — Gregtech Grindless (v0.5.0)

Fecha: 2026-10-24. Fuentes: `AGENTS.md`, `DECISIONS.md`, `docs/viaje.md`, `docs/eras/*.md`, `pack/kubejs/startup_scripts/grindless/**`, `pack/kubejs/server_scripts/grindless/**`, `pack/config/ftbquests/quests/chapters/*_age.snbt`, informes del validador (`scratch/release/val-0.5.0/*.{txt,json}`), `docs/investigacion/espacio/gtm-tiers.md`.

Vapor–HV están **construidos** (código KubeJS real, probado en partida). EV–IV están **diseñados** (`docs/eras/ev.md`, `iv.md`), sin código ni validador propio todavía (no hay `ev.json`/`iv.json` en `tools/analysis/tiers/`, ni `ev_age`/`iv_age` completos en el libro). Esa distinción se mantiene en todas las tablas.

## 1. Tabla maestra

| Métrica | Vapor | LV | MV | HV | EV (diseño) | IV (diseño) |
|---|---|---|---|---|---|---|
| Multibloques propios (registrados) | 5 | 6 | 6 | 7 | 7 (0 construidos) | 8 (0 construidos) |
| Multibloques de GTM que se vuelven útiles | — (sin electricidad) | EBF + máquinas de 1 bloque | perforadora de fluidos MV | cleanroom, cracker, reactor químico grande, caldera/turbina grandes de acero | congelador, torre destilación, motor/turbina de combustión y gas grandes, large miner EV | línea de ensamblaje, large miner IV, paralelo ×4, quantum chest/tank |
| Líneas de proceso (tabuladas en la era) | ~4 (reconstruidas, sin tabla propia) | 4 (+ AE2 como mega-línea aparte, ~20 pasos) | 5 | 6 (+ proyecto cohete, + syngas) | 9 | 8 |
| Pasos medios por línea | ~1.5 | ~5 | ~4.5 | ~5 | ~4 | ~4.5 |
| Misiones (capítulo `*_age.snbt`) | 46 | 51 | 47 | 42 | 12 (de ~25 planeadas) | 0 (de ~22 planeadas) |
| Ítems en la puerta (gate) | 36 | 143 | 279 | 407 | — | — |
| Ítems automatizables (auto) | 27 | 88 | 193 | 295 | — | — |
| Reglas de orden de eras que vigila el validador | 6 | 14 | 22 | 37 | — | — |
| Horas de juego (estimado) | 3–5 | 7–11 | 10–15 | 18–26 | 30–45 | 45–70 |

Las cifras de misiones de LV/MV/HV son **las de antes de la reescritura** (`DECISIONS.md`: "LV, MV, HV... rehechos por seis escritores en paralelo... van en la v0.5.1"); no sirven todavía para medir tendencia. EV tiene solo el capítulo "Lunar Base" (12 misiones): el tramo de Marte, platino y nano del propio `ev.md` aún no está escrito.

## 2. Detalle por tier

### Vapor — 5 multibloques: `steam_vein_drill`, `steam_greenhouse`, `steam_blast_furnace`, `coking_battery`, `steam_observatory`
Líneas: coque (+creosota+gas), bronce, acero (alto horno de vapor), vetas, madera/cultivos, carta lunar (borrador). Cruces ya presentes: coque→creosota (combustible/madera tratada) y gas de hulla→LV (turbina, destiladora) y MV (biorrefinería); ceniza→LV (fertilizante); piedra de la perforadora→LV (lodo) y MV (centrífuga). Es decir: **vapor ya nace cruzando hacia LV/MV**, aunque la regla de exponencialidad aún no existía.

### LV — 6 multibloques: `lv_vein_drill`, `lv_greenhouse`, `submerged_arc_furnace`, `sulfide_roaster`, `heliostat_tower`, `optical_observatory`
Líneas tabuladas (`lv.md`): mineral completo (5 pasos), zafiro→aluminio (2), sal→persulfato y FeCl₃ (6), galio+arsénico→diodos (6). Además, fuera de tabla: AE2 híbrido (~20 recetas propias, la "mega-línea" de la era), horno de arco (3 recetas), tostador de sulfuros (6 tostaciones + quemador), torre solar, simulador de criaturas (7 especies). Cruces destacados ya resueltos: plata del tostador→espejos de la torre solar; óxidos del tostador→electrolizador→Zn/Pb/Sb/Cu y su O₂ vuelve al EBF; CO del arco (circuito 2)→MV (metanol); impactita del arco necesita certus cargado de AE2.

### MV — 6 multibloques: `mv_vein_drill`, `mv_greenhouse`, `ore_plant`, `biorefinery`, `engine_test_stand`, `radio_telescope`
Líneas tabuladas (`mv.md`): silicio→chips (7), pirólisis→fracciones (2 pasos, 8+ ramas), combustibles (5), etileno→PE/PVC (5), mineral→planta (3). La planta de mineral y la biorrefinería son **generadas desde las recetas reales de GTM** (`ore_plant.js`, `biorefinery.js`): no hay tabla propia, así que cualquier cruce que ya exista en la química de GT llega gratis. Cruces explícitos hacia HV, ya documentados como "herencia": glicerol, mezcla de metales, metanol/acetona, nafta.

### HV — 7 multibloques: `hv_vein_drill`, `hv_greenhouse`, `refinery`, `reformer`, `syngas_plant`, `composite_autoclave`, `lunar_drill`
Líneas tabuladas (`hv.md`): crudo→combustibles (6), craqueo→olefinas/aromáticos (4), PTFE (3), epoxi/SBR (7), titanio (5), circuitos EV (4). Más el **proyecto del primer cohete** (banco de pruebas MV → autoclave HV → motor/depósito, ~6-8 pasos cruzando MV+HV) y la planta de gas de síntesis (6 recetas). El catalizador de la refinería ya cruza 3 líneas de mineral (cobalto del níquel, molibdeno del Nether, sílice de la arena): es el mejor ejemplo ya construido de "cruce profundo".

### EV (diseño) — 7 multibloques: `regolith_cell`, `cryogenic_plant`, `atmosphere_processor`, `platinum_plant` (nuevos) + `ev_vein_drill`, `lunar_solar_array`, `deep_space_antenna` (escalones)
9 líneas tabuladas en `ev.md`. Es la primera era con **reservas explícitas a 2-3 eras vista**: helio→lingotes IV, helio-3→fusión LuV, nitrógeno líquido→perforadora de Mercurio (IV), Ir/Os→refino IV, CaCl₂ en bucle con la Luna. Dos sitios (Luna automática, Marte a mano).

### IV (diseño) — 8 multibloques: `fission_reactor`, `hot_cell`, `naquadah_plant` (nuevos) + `pressurized_vein_drill`, `mercury_vein_drill`, `venus_heat_engine`, `mercury_solar_field`, `interferometer` (escalones)
8 líneas tabuladas en `iv.md`. Sigue reservando hacia delante: tritio→fusión LuV, sulfato enriquecido/trinio→LuV, solución de naquadria→ZPM, Cs→naquadria ZPM. Dos sitios simultáneos (Venus + Mercurio).

## 3. Veredicto: ¿crece exponencial, lineal o plano?

| Eje | Vapor→LV | LV→MV | MV→HV | HV→EV | EV→IV | Patrón |
|---|---|---|---|---|---|---|
| Multibloques propios | ×1.2 | ×1.0 | ×1.17 | ×1.0 | ×1.14 | **Plano** (+0 a +1 por tier) |
| Multibloques GTM desbloqueados (aprox., por tier) | — → 2 | 2 → 1 | 1 → 4 | 4 → 6 | 6 → 7 | No monótono (MV solo añade 1), pero crece y satura hacia IV |
| Líneas tabuladas | ×1.0 | ×1.25 | ×1.2 | ×1.5 | ×0.89 | **Lineal**, con techo (~4-9) |
| Gate (ítems, delta real) | +107 | +136 | +128 | — | — | **Lineal** (incrementos casi iguales, no crecientes) |
| Auto (ítems, delta real) | +61 | +105 | +102 | — | — | **Lineal** |
| Reglas de orden de eras (validador) | ×2.33 | ×1.57 | ×1.68 | — | — | **La más rápida de las medidas**, sub-exponencial pero crece |
| Misiones | ×1.11 | ×0.92 | ×0.89 | ×0.29* | 0† | **No concluyente** (rescritura en curso) |
| Horas (estimado, punto medio) | ×2.25 | ×1.39 | ×1.76 | ×1.7 | ×1.53 | La que más se acerca a "exponencial", pero es estimación |

\* EV solo lleva el capítulo de la Luna; no es comparable todavía. † IV: 0 de ~22 planeadas, el capítulo no está escrito.

**Conclusión:** hoy el crecimiento es **lineal a plano en los ejes estructurales** (multibloques, líneas, ítems de la puerta), no exponencial en sentido estricto — un eje exponencial real daría *razones crecientes* (36→107→214→428...), y aquí las razones **decrecen** o se mantienen. Esto es coherente con una decisión que ya está en `DECISIONS.md` ("desde EV, cada era lleva 2-3 multibloques nuevos"): el propio pack ya fijó un objetivo de crecimiento **lineal** en número de multibloques, no exponencial. Lo que sí puede crecer más rápido sin inflar cantidades ni tiempos es la **densidad del grafo de cruces**: cada multibloque nuevo que además enlaza con 2+ líneas anteriores (no solo la inmediata) hace que el número de *conexiones* crezca más rápido que el número de *nodos* — eso es lo que ya se ve en el salto EV/IV (reservas a 2-3 eras vista) frente a vapor/LV (reservas a 1 era vista), y es la señal más parecida a "exponencial" que hay en los datos. El cumplimiento en lo ya construido (Vapor–HV) es razonable y no hace falta rehacerlo, tal como ya decidiste; el libro de misiones de LV/MV/HV sí debería remedir tras la reescritura de v0.5.1 para tener una cifra fiable.

## 4. Cambios pequeños, Steam→HV

Reglas: aditivos, sin tocar la forma de ningún multibloque, sin subir cantidades ni tiempos — la complejidad entra por un paso, una condición o un cruce nuevos. Todas usan ítems/fluidos que ya existen en el pack.

### LV

| # | Propuesta | Detalle de receta | Archivos | Valor/esfuerzo |
|---|---|---|---|---|
| L1 | El CO₂ por defecto del horno de arco (circuito 1, receta `silicon`) hoy se ventea (`arc_furnace.js`: *"CO2 is vented"*). Adelantar a LV la variante CO₂ que MV ya planea para su invernadero. | Nueva variante circuito 3 del `lv_greenhouse`: catalizador sin gastar + 100 mB `gtceu:carbon_dioxide` + 100 mB agua → +25 % de salida (la mitad del ×3 de MV) + 50 mB `gtceu:oxygen`. Mismo tiempo/EU que la base. | `server_scripts/grindless/lv/greenhouse.js` (nuevo bloque tipo `fertilizerVariant`); comentario en `lv/arc_furnace.js` | **Alto/Bajo** — 0 ítems nuevos, patrón ya existe en `mv/family_greenhouse.js` |
| L2 | El agua destilada que la Torre Solar devuelve (4 mB por 640 de vapor) no se usa en ningún otro multibloque de LV; el horno de arco solo admite agua normal en su receta de obsidiana. | Nueva receta `obsidian_distilled` (circuito 2): 32× adoquín + electrodo (azar) + 4000 mB `gtceu:distilled_water` → 4× obsidiana + 10 % de posibilidad de 1× `gtceu:quartz_sand_dust` extra. Mismo EU/t y duración que la receta de agua normal. | `server_scripts/grindless/lv/arc_furnace.js` | **Alto/Bajo** — enlaza dos multibloques de LV que hoy no se hablan |
| L3 | El antimonio del tostador (estibinita/tetraedrita → electrolizador) no tiene destino más allá del lingote. | Receta alternativa del espejo del heliostato: 1× placa de acero + 1× lámina de plata (en vez de 2) + 1× polvo de antimonio + 1× panel de vidrio + 1× engranaje pequeño de acero → 1 espejo (mismo ítem, mismo EU/t). | `server_scripts/grindless/lv/heliostat_tower.js` | **Medio/Bajo** — 0 ítems nuevos, pero valor más cosmético |
| L4 | El carbono sobrante de HV (refinería/syngas, "Carbono (1/9 por tanda) → blaze, acero") no tiene uso en LV; daría un tercer origen al electrodo de grafito. | Receta alternativa del electrodo: 4× `gtceu:carbon_dust` + barra de acero → 1 electrodo (misma receta que con polvo de grafito). *Verificar que `gtceu:carbon_dust` existe como ítem distinto del grafito en GTM 7.5.3 antes de aplicarlo.* | `server_scripts/grindless/lv/arc_furnace.js` | **Medio/Medio** — cruce hacia atrás (HV→LV) con mayor valor narrativo, pero con un supuesto por confirmar |

### MV

| # | Propuesta | Detalle de receta | Archivos | Valor/esfuerzo |
|---|---|---|---|---|
| M1 | El invernadero MV solo combina fertilizante+CO₂ (circuito 2); la biomasa fermentada de la biorrefinería/cervecería no alimenta ningún invernadero. | Nueva variante circuito 3: catalizador sin gastar + 50 mB `gtceu:fermented_biomass` (sin fertilizante ni CO₂) → ×2 la salida base, mismo tiempo/EU que la receta base (no la mitad). Un camino más barato para quien ya fermenta pero no tiene la línea de ácido/CO₂ montada. | `server_scripts/grindless/mv/family_greenhouse.js` | **Alto/Bajo** — mismo patrón que la variante existente, 0 ítems nuevos |
| M2 | Las vetas MV no tienen variante de "lixiviado": el ácido sulfúrico del tostador de LV solo se usa en química, nunca en la perforadora. | Tercera variante por veta (Overworld + Nether) en la Perforadora MV: broca + muestra + 50 mB `gtceu:sulfuric_acid` → mismo rendimiento base + una posibilidad extra (p. ej. 500/10000) del material más raro de la veta. Se añade al mismo bucle que ya genera las otras dos variantes, así que cubre todas las vetas de una vez. | `server_scripts/grindless/mv/family_vein_drilling.js` | **Alto/Medio** — toca muchas recetas pero con una sola plantilla |
| M3 | La carta del lugar de alunizaje (radiotelescopio) exige "sin tormenta"; hoy no hay forma de saltarse esa condición. | Receta alternativa `lunar_landing_chart_shielded`: mapa y efemérides sin gastar + 2× papel + 1× `#forge:small_dusts/silver` (recubrimiento reflectante) → misma carta, pero con `.thunder(0.6, true)` en vez de `0.2` (tolera más tormenta, no la anula). | `server_scripts/grindless/observatory/recipes.js` | **Medio/Bajo** — reutiliza la plata que ya usan las placas fotográficas |

### HV

| # | Propuesta | Detalle de receta | Archivos | Valor/esfuerzo |
|---|---|---|---|---|
| H1 | El H₂S de la refinería hoy solo da ácido o azufre; `hv.md` señala como riesgo abierto que el H₂ "con crudo pesado no cierra". | Nueva variante del quemador del tostador de sulfuros: 1000 mB `gtceu:hydrogen_sulfide` + el mismo aire/agua que el quemador de azufre → 1000 mB ácido sulfúrico + vapor + 500 mB `gtceu:hydrogen` extra (H₂S → S + H₂ es química real). Mismo EU/t y duración que el quemador de azufre existente. | `server_scripts/grindless/lv/sulfide_roaster.js` | **Alto/Bajo** — cierra un riesgo ya documentado en `hv.md`, 0 ítems nuevos |
| H2 | La ceniza de la planta de gas de síntesis solo va a centrífuga o fertilizante; el catalizador de hidrotratamiento de la refinería solo tiene una receta (cobalto+molibdeno+sílice). | Receta alternativa del catalizador: 1× `gtceu:cobalt_dust` + 1× `gtceu:molybdenum_dust` + 3× `gtceu:ash_dust` (en vez de sílice) → 4 catalizadores. Cierra un lazo dentro de HV (syngas↔refinería). | `server_scripts/grindless/hv/refinery_crafting.js` | **Alto/Bajo** — 0 ítems nuevos, receta alternativa pura |
| H3 | El nitrógeno del autoclave de composites se ventea tras cada curado sin ningún uso (`hv.md`: *"se ventea tras cada curado"*). | Variante del modo 1 (gasificación) de la planta de gas de síntesis que acepta 500 mB `gtceu:nitrogen` como gas portador en vez de aire ambiente, mismos sólidos/vapor/salidas, mismo EU/t y duración: un segundo camino de entrada, no un bono. | `server_scripts/grindless/hv/syngas_plant.js` | **Medio/Medio** — cruza el proyecto del cohete con la química de HV, pero exige encajar en la tabla generadora existente |

## 5. Objetivos desde EV para que el crecimiento sea exponencial

El eje que de verdad puede componerse sin inflar cantidades es la **densidad de cruces**: no basta con añadir multibloques (`DECISIONS.md` ya fija 2-3 por era, cifra lineal a propósito), hay que exigir que cada línea nueva enlace con **más líneas anteriores y más lejanas** que la era previa.

### Tabla de objetivos (EV–UV) y regla general después

| Era | Multibloques propios nuevos | Escalones de familia | Líneas nuevas | Cruces exigidos (que miren ≥2 eras atrás) | Sitios planetarios |
|---|---|---|---|---|---|
| EV | 3–4 | 3 (perforadora, energía, observatorio) | 6–9 | ≥4 | Luna (automática) + Marte (visita) |
| IV | 3 | 5 (2 perforadoras, 2 energía, observatorio) | 6–8 | ≥5 | Venus + Mercurio (a la vez) |
| LuV | 3 | 2–3 (criobot/ancla, rectena, ¿observatorio?) | 5–7 | ≥6 | cinturón + Ío/Europa/Ganímedes + **1ª estación orbital** (sitio sin aterrizar) |
| ZPM | 2–3 | 2–3 | 5–7 | ≥7 | Saturno + gigantes helados, **todo desde órbita** |
| UV | 2 | 1–2 | 4–6 | ≥8 | Plutón/Kuiper en órbita + 1ª sonda interestelar |
| **UHV en adelante (regla general)** | ≥2 | ≥1 | ≥ las de la era anterior | cada línea nueva reutiliza ≥2 intermedios de 2+ eras distintas **y** reserva ≥1 subproducto para ≥2 eras después | 1 sitio nuevo cada 1-2 eras (tabla de `viaje.md`), cada uno con ≥1 regla de validador ("X solo sale de Y") |

### EV vs. el objetivo

`ev.md` **ya cumple o supera** la tabla: 4 multibloques nuevos + 3 escalones (7 en total, por encima del mínimo), 9 líneas tabuladas, y es la primera era con reservas explícitas a 2-3 eras vista (helio→IV, helio-3→fusión LuV, Ir/Os→IV, nitrógeno líquido→perforadora de Mercurio IV). Lo que le falta no es diseño, es **aparato de medición y contenido pendiente**:
- No existe `tools/analysis/tiers/ev.json`: no se puede validar la puerta de EV todavía.
- El capítulo de misiones solo cubre la Luna (12 de ~25): falta Marte, planta de platino, circuitos nano y wither.
- Los riesgos que el propio documento señala (fallos de GCYR al lanzar/cambiar de dimensión, rendimiento de AE2 entre 3 dimensiones) son los que de verdad bloquean, no la falta de cruces.

### IV vs. el objetivo

`iv.md` también **cumple**: 3 multibloques nuevos + 5 escalones (8 en total), 8 líneas, reservas hacia LuV y ZPM (tritio, sulfato enriquecido/trinio, solución de naquadria, Cs). Igual que EV, lo que falta es:
- `tools/analysis/tiers/iv.json` y el capítulo `iv_age.snbt` (0 de ~22 misiones escritas).
- El propio documento marca la fisión en KubeJS como el riesgo nº1 ("si un generador multibloque de KubeJS no saca EU... se prueba antes que nada"): conviene resolver ese spike antes de construir el resto de la era, porque toda la energía de IV depende de él.
- No hay perforadora propia en la Tierra para IV (decisión correcta, ya que la broca de acero de tungsteno sube de tier en las perforadoras que ya existen): no es un hueco, es la regla "no todo escalón de familia tiene que repetirse cada era".

### Lo que viene después de IV

`docs/eras/luv.md`, `zpm.md` y `uv.md` **no existen todavía**: la tabla de objetivos de arriba es el punto de partida para escribirlos. LuV merece atención especial porque introduce un tipo de sitio nuevo — la **estación orbital** (no se aterriza, se opera desde fuera) — que la regla general de ahí en adelante debe dar por normal (ZPM y UV ya no bajan a ningún planeta, per `viaje.md`).

## 6. Resumen de la auditoría

- **Multibloques propios:** 5 (Vapor) → 6 → 6 → 7 (HV construidos); 7 → 8 (EV/IV diseñados). Crecimiento plano, por decisión ya tomada en `DECISIONS.md`.
- **Líneas de proceso:** 4 → 4 → 5 → 6 (construidas); 9 → 8 (diseñadas). Lineal, con cruces cada vez más profundos.
- **Veredicto:** ninguno de los ejes estructurales (multibloques, líneas, ítems de la puerta) es exponencial hoy; son lineales o planos, con razones que decrecen tier a tier. El eje más prometedor es la **profundidad de los cruces hacia adelante**, que sí se acelera de HV a EV/IV.
- No hace falta rehacer Vapor–HV (la regla es nueva); los cuatro-seis cambios pequeños de la sección 4 son el ajuste razonable.
- EV e IV, tal como están diseñados, ya cumplen el objetivo de contenido; lo que falta es el validador propio, el resto del libro de misiones y resolver los riesgos técnicos que cada documento ya señala.
