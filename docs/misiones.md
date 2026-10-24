# Misiones: guía del libro

Esta guía manda sobre todo lo que se escriba en `pack/config/ftbquests/quests/`. Léela entera antes de tocar un capítulo. Las reglas salen de lo que pidió el usuario, de leer los libros de otros packs de GregTech y de jugar las primeras horas de este pack con GTM 7.5.3 delante.

Los capítulos de referencia son `welcome.snbt` y `steam_age.snbt`: si una regla no queda clara, mira cómo se resolvió allí.

## 1. Lo que pide el usuario

Literal, de sus mensajes:

- «Las misiones: cortas, concretas y con voz de alguien que ha jugado. Las cantidades van en el visor de recetas, no en un párrafo. Nada de informes ni de lenguaje de auditoría. Las misiones enseñan la era, dan un premio pequeño y nunca bloquean recetas. La primera misión deja al jugador en la Steam Age con lo justo. El libro se puede recuperar si se pierde.»
- Queja sobre el libro anterior: los textos suenan a IA, no tienen mucha lógica, el orden es raro y las subdependencias no están bien colocadas. Hay misiones flotando sin depender de nada, líneas largas que cruzan el capítulo y ramas sin orden visible.
- La primera hora tiene que ir paso a paso y con dependencias reales: madera y piedra → herramientas de GT (para qué sirve cada una) → cobre y estaño (vetas, rocas de superficie) → polvos con el mortero y mezcla → bronce → horno de coque → calderas y máquinas de vapor → nuestra perforadora (y por qué) → acero → puerta a LV.
- Una misión temprana regala el juego completo de herramientas de neutronio irrompibles, para quitar el grind de herramientas.
- Inspirarse en los libros de otros packs y copiar de los que tengan licencia que lo permita.

## 2. Fuentes

Se leyeron los archivos de misiones, no los resúmenes. Copias de trabajo en la carpeta de la sesión (`files/research/quests-src/`).

| Pack | Repositorio | Licencia | Uso |
|---|---|---|---|
| GregTech Community Pack Modern | `GregTechCEu/GregTech-Modern-Community-Pack` | LGPL-2.1 (todo el repo, misiones incluidas) | Fuente principal: es GTM 1.20.1 sin recetas cambiadas, así que sus datos de mecánicas valen tal cual. Se adapta texto con atribución. |
| Monifactory | `Omicron-Industries/Monifactory` | LGPL-3.0 | GTM 1.20.1 con muchas recetas cambiadas (acero mezclando polvos, goma a martillo): sus hechos no se copian sin comprobarlos en nuestro volcado. Se toma estructura y tono. |
| Star Technology | `StarT-Dev-Team/Star-Technology` | MIT (© 2023 trulyno) | GTM 1.20.1 en skyblock. Lo mejor que hay en textos cortos con voz y en tareas que enseñan la cadena paso a paso. |
| Cosmic Frontiers | `Frontiers-PackForge/CosmicFrontiers` | LGPL-3.0 | Ya está en 1.21.1. Sirve de contraejemplo de forma (ver tabla). |
| GregTech Leisure (GTL) | instancia del usuario (`files/research/gtl-raw/`) | no clara | Solo ideas, ni texto ni estructura copiada (sección 12). |
| Nomi-CEu, GregTech Community Pack 1.12 | `Nomi-CEu/Nomi-CEu`, `GregTechCEu/GregTech-Community-Pack` | LGPL-3.0 | No se usaron: BetterQuesting y GTCEu 1.12. GTCP Modern cubre lo mismo en nuestra versión de GT. |
| GTNH, TerraFirmaGreg, GT Odyssey | — | solo referencia | No se usaron para esta guía. |

Lo que se copie o adapte de una fuente con licencia se anota en `CREDITS.md`, sección *Misiones*, con el capítulo y la misión.

## 3. Cómo están hechos los buenos libros

Medidas de los capítulos de Vapor a HV (las calcula `files/scratch/quests-overhaul/stats.mjs` sobre los SNBT). «Atrás» = dependencias que apuntan contra el sentido de lectura; «p90» = el 90 % de las líneas mide menos que eso, en casillas.

| Capítulo | Misiones | Inicios | Atrás | Línea mediana | p90 | Palabras (mediana) |
|---|---:|---:|---:|---:|---:|---:|
| GTCP Modern, Introduction | 25 | 4 | 4 | 1,5 | 2,1 | 125 |
| GTCP Modern, Steam Age | 40 | 0 | 17 | 1,4 | 2,3 | 96 |
| GTCP Modern, LV | 75 | 0 | 26 | 1,5 | 4,5 | 96 |
| Monifactory, Genesis | 55 | 1 | 24 | 2,3 | 11,4 | 76 |
| Star Technology, Industrial Revolution | 82 | 1 | 20 | 2,0 | 4,0 | 12 |
| GTL, Where It Begins | 45 | 8 | 6 | 2,0 | 4,3 | 22 |
| Cosmic Frontiers, The First Steps | 124 | 15 | 54 | 2,0 | 6,0 | 22 |
| **Grindless, Vapor (antes)** | 33 | 1 | 1 | **4,7** | **12,5** | 31 |
| **Grindless, Vapor (ahora)** | 41 | 0 | 0 | 2,5 | 3,6 | 29 |

Lo que hacen bien:

- **Una espina y ramas.** GTL pone la espina en una fila (`Where It Begins`: piedra → vetas → menas → herramientas → polvos → bronce, cada dos casillas) y las ramas en filas por encima y por debajo. Monifactory hace lo mismo en vertical. Star Technology usa una rejilla de dos casillas y nada se sale de ella.
- **Líneas cortas.** En los buenos, nueve de cada diez líneas miden menos de 2,5–4,5 casillas. El libro viejo de Vapor tenía la mediana en 4,7 y líneas de 20 casillas.
- **Hitos que se distinguen.** Engranaje o rombo y un tamaño mayor para el multibloque o la salida del capítulo; las secundarias, más pequeñas (GTCP 0,66 frente a 0,75 y 1,2).
- **Las tareas enseñan la cadena.** Star Technology pide en *Firebrick* polvo de arcilla, polvo de ladrillo, polvo de arcilla refractaria, arcilla prensada, ladrillo y bloque: la misión es la receta, y el texto queda en una línea.
- **«Cualquier material».** GTCP pide herramientas con `itemfilters:tag` (`gtceu:tools/crafting_hammers`) para que valga cualquier martillo.
- **Bloques de estructura con número.** Star Technology y GTCP piden 25 ladrillos de horno de coque y 32 ladrillos refractarios: el número es el de la estructura.
- **Recompensas que sirven para el paso siguiente.** GTCP regala polvo de arcilla al hacer el macerador y placas de bronce al hacer el fundidor.

Lo que no hay que copiar:

- GTCP escribe párrafos de cien palabras con chistes y «Lore»; vale como fuente de datos, no de tono.
- GTCP tiene 17 líneas hacia atrás en Vapor (el capítulo se lee en espiral) y Cosmic Frontiers 15 inicios y 54 líneas hacia atrás en 124 misiones: es el mapa disperso del que se queja el usuario.
- Monifactory y GTL ponen misiones de información sueltas, sin dependencias, alrededor del inicio.

Ejemplos cortos de las fuentes, para el tono:

- Star Technology (MIT), *Coke Oven*: «A staple of any GregTech pack. Get some tasty creosote to coat your planks in.»
- Star Technology (MIT), *Firebrick*: «The building-block of any primitive machine.»
- GTCP Modern (LGPL-2.1), *Steam Macerator*: «The macerator will output only the first item shown in recipes from EMI. The other slots are locked until you make a HV Macerator.»
- GTCP Modern (LGPL-2.1), *This Rocks!*: «These little guys indicate the type of veins that are below them.»
- Monifactory (LGPL-3.0), *Some Starter Tools*: «Hammers can be used to turn two ingots into one plate. Plates can make a File, Files can make Rods, etc.» (útil como cadena, pero lleva cantidades en el texto: aquí no).

## 4. Forma

La rejilla es la de FTB Quests: una casilla = una unidad de `x`/`y`.

- **Columnas cada 2 casillas** en `x`; **filas cada 1,5** en `y`. Posiciones en múltiplos de 0,25 como mucho.
- **Se lee de izquierda a derecha.** Toda dependencia está a la izquierda de su misión o, si es una caída corta, en la misma columna.
- **La espina va en `y = 0`**: el camino mínimo para salir de la era, de la primera misión a la última.
- **Una fila por subtema.** Por encima de la espina, una cosa (en Vapor: coque y bomba arriba a la izquierda; perforadora e invernadero arriba a la derecha); por debajo, otra (fundidor, hierro forjado, piezas del circuito). Un subtema no cambia de fila a mitad de camino.
- **Las secundarias cuelgan de lo que amplían**, en la columna siguiente, una o dos filas por encima o por debajo.
- **Tamaños y formas:**

  | Papel | Forma | Tamaño |
  |---|---|---|
  | Inicio del capítulo | `rsquare` | 1,5 |
  | Paso normal | hexágono (por defecto) | 1 |
  | Máquina o multibloque importante | `gear` | 1,25 (1,5 si es el multibloque de la era) |
  | Lectura (tarea de marca) | `circle` | 0,75, o 1 si está en la espina |
  | Secundaria opcional (`optional: true`) | hexágono | 0,75 |
  | Hito a mitad de capítulo | `rsquare` | 1,25 |
  | Salida del capítulo | `diamond` | 1,5–2 |

- **Distancias:** ninguna línea de más de 5 casillas (dos columnas y dos filas como mucho), ninguna línea que pase por debajo de otra misión, y entre cajas al menos 0,25 casillas de aire. Evita cruces; si hay uno, mueve una rama de fila.
- **`autofocus_id`** del capítulo apunta a su primera misión, para que el libro se abra ahí.
- **`subtitle`** del capítulo: una línea con el paso del viaje (sección 9).

## 5. Dependencias

- **Una dependencia es un requisito de verdad:** sin el objeto de esa misión no se puede hacer esta. La otra razón válida es el **orden de montaje de una sola máquina** (sonda → muestra → perforadora; tubos → resistencias y placas → aleación roja → circuito).
- **Nunca** se pone una dependencia solo para colocar una misión, ni se encadenan temas que no tienen que ver.
- No hace falta listar todos los ingredientes. Si el requisito de verdad queda lejos (más de 5 casillas), el texto lo nombra y la dependencia va al paso cercano que tenga sentido. Ejemplo: la perforadora de vapor lleva un minero de vapor en la receta, pero cuelga de la muestra y de las brocas, y su texto dice «built around the steam miner».
- **Un único inicio por capítulo.** El primer capítulo del libro empieza sin dependencias; cada capítulo de era empieza en una misión que depende de la salida del anterior (Vapor depende de *Bronze*, LV de *LV Steam Turbine*). Ninguna misión flota.
- `dependency_requirement: "one_completed"` solo para «cualquiera de estas rutas sirve».
- Las misiones de otras pestañas (calidad de vida) que pidan algo de una era dependen de la misión de esa era donde se abre, no de nada suelto.

## 6. Tareas

- La tarea es **lo que el jugador fabrica**, no un cuestionario. Las de marca (`checkmark`) son solo para leer: inicio, información, reglas.
- **Cadena en las tareas:** si el camino tiene pasos intermedios, se pide cada intermedio (contador 1). La misión enseña la receta sin recitarla en el texto.
- **Contador** solo cuando el número es el requisito real: los bloques de una estructura (25 ladrillos de coque, 32 refractarios) o un puñado claro (acero ×16). Lo demás, 1.
- «Cualquier material» o «cualquiera de estos»: `itemfilters:tag` o `itemfilters:or`, con `title` e `icon` en la tarea.
- Nunca se consumen objetos (`consume_items` queda en el valor del libro, `false`).
- Tareas opcionales dentro de una misión (`optional_task: true`) para «uno de estos vale».

## 7. Recompensas

- **Pequeñas y útiles para el paso siguiente:** carbón al hacer el hierro, arcilla al cerrar el bronce, vidrio al aprender el vidrio, brocas al hacer la perforadora. XP para las de lectura.
- Nada que se salte un paso de la era. La excepción es la caja de herramientas de neutronio, que la pidió el usuario.
- Como máximo seis recompensas por misión (la caja de herramientas está en la lista de excepciones del linter).

### Herramientas irrompibles: cómo se hace

- GTM 7.5.3 lee la etiqueta `Unbreakable` en la raíz del NBT del objeto: `ToolHelper.damageItem` sale sin hacer daño y la descripción deja de mostrar usos. `IGTTool#get()` solo la pone si el material es irrompible (el neutronio lo es).
- Una recompensa de FTB Quests con solo el id da un objeto «crudo», sin `Unbreakable` ni las conductas que `get()` añade (área 3x3 del martillo de minería y la pala, imán del neutronio, talar árboles).
- Por eso cada recompensa lleva el NBT exacto de `get()`, volcado en partida con `kubejs custom_command gg_dump_toolbox` (overlay `gg_test_quests.js`), más `Unbreakable: 1b`. La prueba `gg_test_quests` comprueba en partida que no se gastan y que no dan peligro.
- No hay mortero, mazo ni desatascador de neutronio en GTM: van de naquadah y de goma, irrompibles igual. Las herramientas eléctricas de neutronio no entran: necesitan batería y serían de IV.

## 8. Escritura

En inglés. Una a tres frases, setenta palabras como mucho. La voz es de alguien que ya jugó: dice qué hace la cosa aquí y la trampa que conviene saber.

- **Primera frase:** qué es o qué hace en este pack. **Segunda:** la mecánica de GT que pilla a la gente (el respiradero, la caldera que explota, el macerador que solo da la primera salida).
- **Sin cantidades en el texto.** Ni «three copper and one tin» ni «two ingots per plate». Si el número importa: «EMI shows the ratio».
- **Sin recetas recitadas.** El texto no lista ingredientes con números; las tareas y EMI ya lo hacen.
- **Sin voz de informe.** Nada de «here the recipe asks for X instead of Y», «stays as the mod made it», «every byproduct has an honest end»: eso es lenguaje de diseño, no de jugador.
- **Nombres resaltados** con `&6Nombre&r`, solo el objeto o la máquina de la misión.
- **Sin rayas largas** (— o –) y sin «a - b» como sustituto: dos frases.
- **Títulos** cortos y concretos: el nombre de la cosa o lo que se consigue («Coke Oven Bricks», «Sulfur from the Nether», «No More Pickaxe»). Nada de juegos de palabras que escondan el contenido.

### Frases prohibidas

El linter avisa de estas (lista completa en `tools/quests/lint-config.json`): *nothing fancy, nothing exotic, the whole trick, that's really, simple, cheap…, the heart of, for good, on autopilot, the first real, the base has ever…, keep it fed, runs on its own, worth building the moment, embark, delve, dive into, seamless, game-changer, powerhouse, unlock the, unleash, whether you're, it's worth noting, in this quest, this quest will, let's, buckle up, a testament, elevate, journey awaits, the possibilities, say goodbye, just like that, and that's it, trusty, humble, behold*.

Además, sin el linter: tríos retóricos («wood, rubber wood and crops, all on autopilot»), «no X, no Y, just Z», frases que empiezan por «Simple», «Just», «Every…» para sonar rotundas, y cierres morales («That's the Steam Age done»).

### Antes y después (Vapor)

| Antes | Después |
|---|---|
| «Bronze is just copper and tin, nothing exotic. A mortar and a casting mold get you plates and gears before you ever touch a real press.» (además, falso: el bronce no lleva molde) | «Copper dust and tin dust mixed in the grid give bronze dust; EMI shows the ratio. Smelt it into ingots and hammer those into plates.» |
| «Coal or charcoal in, steam out. The Low-Pressure Solid Boiler is the heart of every machine you're about to build. Keep it fed and the whole line runs on its own.» | «Bronze plates, bricks and a furnace. Fill it with water before the first fuel goes in: water poured into a dry, hot boiler blows it up.» |
| «Tin carries current well enough for LV, and a skin of rubber keeps it from shorting against the frame. Simple, cheap, reliable.» | «A tin plate and the wire cutter give tin wire; wire plus a rubber sheet is a tin cable, the LV power line.» |

## 9. El viaje en el libro

- Cada pestaña de era es un paso hacia Sagitario A\* (`docs/viaje.md`). La primera misión del capítulo y el `subtitle` dicen en una línea dónde estamos y qué cambia.
- Cada capítulo acaba en un **hito de salida** (forma de rombo) que nombra el sitio siguiente: Vapor acaba en la turbina LV y anuncia el Nether; HV acaba en la Luna y EV empieza en la base lunar.
- Nunca se promete un multibloque o un sitio que no existe todavía.

## 10. Partidas guardadas e ids

El usuario tiene un mundo. FTB Quests guarda el progreso por id de capítulo, misión, tarea y recompensa.

- **Todo id va de `0000000000000001` a `7FFFFFFFFFFFFFFF`:** 16 cifras hexadecimales en mayúscula y la primera entre 0 y 7. FTB Quests 2001.4 lee los ids con `Long.parseLong(hex, 16)` (`BaseQuestFile#readID`, `QuestObjectBase#parseCodeString`). Un id que empiece por 8–F falla sin avisar: el objeto recibe un id aleatorio en cada carga (su progreso se pierde y su premio se puede volver a reclamar) y toda dependencia hacia él desaparece. Así estaba la mitad del libro hasta la v0.4.1, y de ahí las misiones flotantes de las capturas del usuario. El editor de FTB Quests nunca crea esos ids; los creaban nuestros generadores.
- **Arreglo:** `node tools/quests/fix-ids.mjs --write` quita el bit alto (8 → 0, 9 → 1 … F → 7). Es determinista e idempotente: se puede pasar capítulo a capítulo (`--chapter lv_age`) y los enlaces entre capítulos siguen cuadrando. El linter lo marca como error (`id-range`) y `gg_test_quests` cuenta las dependencias que FTB Quests carga en cada capítulo.
- Si una misión sigue significando lo mismo, **conserva su id** (el ya arreglado), aunque cambie de capítulo, de sitio, de texto o de tareas. Mover una misión a otro archivo no pierde el progreso: *Bronze* y *Sticky Resin* pasaron de Vapor a Bienvenida; el ojo de ender, la llave y las vetas del End, de HV a MV; el titanio y las piezas EV, de HV a EV.
- Lo que no se puede salvar: el progreso de las misiones con id 8–F en mundos de la v0.4.1 o anteriores, porque allí su id era aleatorio. Desde el arreglo, el progreso queda fijo.
- Las tareas que siguen siendo lo mismo conservan su id; las nuevas, id nuevo. Cambiar el contador de una tarea no rompe nada.
- Ids nuevos: sin repetir en todo el libro (el linter lo comprueba) y con la primera cifra 1–7. En Node: `const b = crypto.randomBytes(8); b[0] = (b[0] & 0x7f) | 0x10; b.toString('hex').toUpperCase()`.
- Solo se quita una misión si no tiene equivalente.

## 11. Herramientas

```powershell
# Linter: forma, dependencias, ids, texto y recompensas; imprime misiones y dependencias de cada capítulo
node tools\quests\lint.mjs [--chapter welcome,steam_age] [--items <items.json>] [--tags <tags.json>]

# Ids que FTB Quests no puede leer (primera cifra 8-F): informe, o arreglo con --write
node tools\quests\fix-ids.mjs [--chapter lv_age] [--write] [--map]

# Vista previa: un PNG por capítulo (cajas, líneas, rejilla)
powershell -File tools\quests\Render-QuestPreview.ps1 -Chapter steam_age -OutDir <carpeta> [-Prefix after-]
```

- `--items`/`--tags` usan los `items.json` y `tags.json` de un volcado `gg_dump` (el más reciente, con la Luna: `files/test-runs/hidden-moon-dump1/results/server/kubejs-exported/`). El volcado solo trae las etiquetas que usa alguna receta, así que una etiqueta que falte ahí es un aviso; `gg_test_quests` las comprueba todas en partida.
- Errores: id repetido, id que FTB Quests no lee (8–F), dependencia que no existe o es circular, segundo inicio, misión flotante, cajas solapadas, línea hacia atrás, línea de más de 5 casillas, objeto que no existe, capítulo sin título, misión sin tareas.
- Avisos: fuera de rejilla, cajas casi pegadas, caída vertical de más de 3, línea que pasa por debajo de otra misión, cruces, texto largo, frase prohibida, raya larga o « - » usado como raya, cantidad en el texto, sin recompensa, demasiadas recompensas.
- Excepciones (`lint-config.json`), siempre con su porqué: `allowLongEdges`, `allowRoots`, `manyRewardsOk`, `quantityOk` (un número en el texto que no es de receta: los 8 cubos de combustible de un lanzamiento) y `direction` por capítulo (`ltr` por defecto, `ttb` si un capítulo se lee de arriba abajo).
- **Prueba en partida, servidor:** `tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <copia de pack> -Commands 'kubejs custom_command gg_test_quests' -WaitForLog 'GGTEST\|quests\|DONE@@900'`. Comprueba que cada capítulo carga con su número de misiones **y de dependencias** (`GG_QUESTS_EXPECTED` en `tools/test/overlay/kubejs/server_scripts/gg_test_quests.js`: al cambiar un capítulo se actualizan los dos números, que el linter imprime), que todos los objetos y etiquetas existen y que la caja de herramientas da lo que debe.
- **Prueba en cliente real:** `gg_test_quest_book` (marcador `kubejs/config/gg_test_quest_book.json`, ver `tools/test/README.md`). Completa *Arrival* y la caja con el comando de FTB Quests, reclama sus recompensas por el mismo camino que el botón, comprueba las herramientas (NBT, daño, imán, 3x3, descripción) y saca capturas del libro abierto (`kubejs/exported/gg_book_*.png`). Para fotografiar otro capítulo se añade una entrada a `SHOTS` en `client_scripts/gg_test_quest_book.js`.
- Al banco se le pasa siempre una copia de `pack/` con `-PackDir`: pasa `Update-PackIndex` sobre lo que le des.

Un capítulo está listo cuando el linter da 0 errores y 0 avisos (o avisos explicados), la vista previa se lee de izquierda a derecha sin cruces y `gg_test_quests` pasa.

## 12. Lo que tomamos de GregTech Leisure

Solo ideas; su licencia no deja copiar.

- **Herramientas que no se rompen al principio.** GTL pide fabricar el martillo, la lima y el mortero de hierro y los cambia por versiones irrompibles; aquí se pide un martillo cualquiera y la misión siguiente regala el juego completo.
- **Espina en una fila y ramas arriba y abajo** en el primer capítulo, con dos casillas entre pasos.
- **Avisos de una línea sobre lo que rompe partidas:** no tapar el respiradero de las máquinas de vapor, no echar agua a una caldera seca y caliente, el macerador de vapor no da subproductos hasta HV.
- **Recompensa de reposición** («If You Lost Your Tools»): aquí no hace falta, porque nada se rompe.

No se toma: el mercado de monedas, los atajos (Dimensionally Transcendent Dirt Forge, minero del vacío primitivo) ni las misiones de información sin dependencias alrededor del inicio.

## 13. Capítulos de referencia: Bienvenida y Vapor

**Bienvenida** (16 misiones). Espina: *Arrival → Wood and Stone → Ore Veins → Iron from the Veins → Your First Hammer → The Neutronium Toolbox → Copper and Tin → Grinding Dust → Bronze* (salida). Arriba, EMI, resina y la chuleta de herramientas; abajo, las llaves del Vacío y del Llano, el carbón y las vetas profundas.

**Vapor** (41 misiones). Espina: *Steam Age → Clay and Bricks → Low-Pressure Boiler → Steam Machines → Steam Compressor → Firebricks → Primitive Blast Furnace → Steel → Casting Molds → Glass → Steam Extractor → Sulfur from the Nether → Rubber Sheets → Insulated Cable → LV Machine Hull → LV Steam Turbine* (salida). Arriba a la izquierda, horno de coque y bomba; en la columna de las máquinas, el abanico (minero, macerador, compresor, fundidor, trituradora); arriba a la derecha, la perforadora y el invernadero hasta *No More Pickaxe*; abajo a la derecha, las piezas del circuito.

Por qué este orden, comprobado en el volcado de recetas de la v0.4.0:

- **El vidrio va después del acero.** Con `hardGlassRecipes` de GTM, la arena no se funde en vidrio: hace falta polvo de vidrio y el molde de bloque en el fundidor de aleaciones, y el molde sale de placas de acero. La sonda de vetas y el invernadero llevan vidrio, así que la perforadora y el invernadero llegan tras el acero, no antes como pensaba `docs/eras/vapor.md`.
- **El azufre de vapor solo sale del Nether.** Los maceradores de vapor (y los eléctricos LV y MV) solo sacan la primera salida (`addOutputLimit`), sin subproductos hasta HV. La goma pide azufre, así que la primera goma lleva un viaje al Nether con un mechero de acero, como en GTCP Modern (*S is for Sulfur*). En LV, la centrífuga lo saca del rejalgar de la veta de cobre y estaño.
- **Los ladrillos refractarios necesitan el compresor de vapor** (la arcilla refractaria no se prensa a mano), y el hierro forjado también (las pepitas no se juntan a mano).
- **La caldera grande de bronce pide circuitos LV:** va colgada del circuito, como opcional.

**Probados en partida (24-10-2026, pack con la Luna):** `gg_test_quests` carga los dos con todas sus misiones y dependencias; `gg_test_quest_book`, en un cliente real, completa *Arrival* y *The Neutronium Toolbox*, reclama sus 22 recompensas y comprueba que las 20 herramientas llevan el NBT de GTM, no se gastan, pican, recogen con imán, rompen 3x3 (martillo de minería) y enseñan «Unbreakable» sin líneas de durabilidad. Las capturas del libro se leen de izquierda a derecha.

Los archivos SNBT son la fuente: se editan a mano siguiendo esta guía.

## 14. Plan para Vapor, LV, MV, HV y EV: la Luna por cada instrumento

### La espina del viaje

Cada era mira la Luna con un instrumento mejor, y lo que ve es lo que necesita la siguiente. En cada capítulo es la **fila del cielo**: una fila propia por encima de todas las demás, de izquierda a derecha, que acaba encima de la salida del capítulo.

| Era | Instrumento (id) | Lo que ve el jugador | Carta (id) | La usa |
|---|---|---|---|---|
| Vapor | Clockwork Observatory (`gtceu:steam_observatory`, recetas *Stargazing*) | Al ocular, de noche: mares oscuros, tierras altas claras, los cráteres grandes y sus rayos. Cielo despejado y el controlador a Y 100 o más, por encima de la bruma y del humo de los hornos de coque. | Lunar Chart (Draft) (`grindless:lunar_chart_draft`) | El observatorio óptico, sin gastarla |
| LV | Optical Observatory (`gtceu:optical_observatory`, *Astrophotography*) | En placas fotográficas (`grindless:photographic_plate`): grietas, cadenas de cráteres, sombras largas en el terminador; lo llano y lo abrupto, distinguidos. Y las tablas de dónde estará la Luna cada noche. | Photographic Lunar Map (`grindless:lunar_map`) y Lunar Ephemeris (`grindless:lunar_ephemeris`) | El radiotelescopio, sin gastarlos |
| MV | Radio Telescope (`gtceu:radio_telescope`, *Radio Astronomy*) | Ecos de radar sobre el mapa: mares lisos, campos de rocas, paredes de cráter, y una elipse en un mar llano marcada en rojo. Atraviesa nubes y lluvia; la tormenta ahoga el eco. | Lunar Landing-Site Chart (`grindless:lunar_landing_chart`) | El chip del cohete (HV) |
| HV | El cohete | El sitio de aterrizaje de la carta | — | *Liftoff* → *The Moon* |
| EV | La base lunar | La Luna de cerca: regolito, ilmenita, día y noche lunares | — | — |

Reglas:

- **Nunca se promete una máquina que no ha pasado su prueba.** Hasta que el coordinador diga que una máquina pasó, ni misión ni texto que la nombre. Mientras, la fila del cielo queda vacía; el texto del inicio de cada capítulo puede hablar de la Luna en el cielo, sin máquinas.
- Cuando entre un instrumento: engranaje de 1,25 en la fila del cielo, con el controlador como tarea; a su derecha, la carta (tarea: la carta). La carta de una era es dependencia del instrumento siguiente. Entre capítulos la línea no se dibuja, así que el texto lo dice («the draft from the steam age guides it»).
- El texto dice lo que se ve, en una frase, y la regla del cielo (noche, nubes, altura). La tabla es material, no texto para copiar.
- En HV, cuando la ruta de lanzamiento cambie la receta del chip, *Liftoff* gana la dependencia de la carta de aterrizaje y su texto cambia («the chip is written from the landing-site chart»). Su id no cambia.

### Máquinas en camino

Entran cuando su prueba pase y el coordinador lo diga; cada agente deja su lista en `files/scratch/quest-needs/<agente>.md`.

| Agente | Máquinas | Dónde van | Cómo se enganchan |
|---|---|---|---|
| steam-content | Steam blast furnace, coke battery | Vapor | La batería en la fila del coque, tras *Coke Oven*; el alto horno de vapor tras *Primitive Blast Furnace*, como segunda vía al acero |
| lv-content | Sulfide roaster, heliostat tower | LV | El tostador en la fila del mineral; la torre en la de energía |
| observatory | Los tres observatorios y sus cartas | Vapor, LV, MV | Fila del cielo (arriba) |
| launch-road | Engine test stand, RP-1, propulsores cualificados (MV); autoclave de compuestos, losetas ablativas, tanques envueltos, motor sin probar y encendido estático (HV) | MV y HV | En HV van delante de las piezas del cohete: *Rocket Motors* pasa a depender del encendido estático y *Fuel Tanks* de los tanques envueltos. Sus ids, tareas y textos de pieza no cambian |
| syngas | Syngas plant | HV | Fila de química, tras la refinería: hidrógeno y CO para el metanol y el amoniaco |

### Vapor — «Steam Age: Escape Velocity» (`steam_age.snbt`, 41 misiones, 47 dependencias; hecho)

Solo falta la fila del cielo (por encima de la automatización) y las máquinas de steam-content, cuando pasen.

### LV — «LV: The First Spark» (`lv_age.snbt`, 40 misiones, 46 dependencias)

- **Inicio:** *LV Factory* (id actual), depende de *LV Steam Turbine*. Línea del viaje: primera electricidad; el Nether pasa de viaje de ida y vuelta a sitio que se trabaja.
- **Espina:** red LV (cable, búfer de baterías, escotilla de energía) → *LV Components* (motor, pistón, bomba, cinta, brazo) → *LV Assembler* → bobinas de cuproníquel → *Electric Blast Furnace* (gear 1,5) → *Aluminium* → *MV Machine Hull* → *LV to MV Transformer* (salida, rombo).
- **Ramas:**
  - arriba del todo, la fila del cielo (vacía hasta que pase el observatorio óptico);
  - arriba, mineral: macerador → lavador → centrífuga térmica → centrífuga (con el aviso de que los maceradores LV y MV no dan subproductos) y la *LV Vein Drill* (gear 1,5) con lodo de perforación y *Nether Veins*;
  - arriba, verde: *LV Greenhouse* → fertilizante; simulador de criaturas → modelos → primera perla (el creeper y el blaze, para MV);
  - abajo, química: colector de gases → electrolizador → reactor químico → ácido sulfúrico (el azufre del rejalgar por centrífuga); mezclador;
  - abajo, circuitos: ensamblador de circuitos → placa buena → GaAs → diodos → *MV Circuit*;
  - abajo a la derecha: prensa de formado → electrodo de grafito → *Submerged Arc Furnace* (gear 1,5) y la rama de AE2.
- **AE2:** los pasos de AE2 que hoy viven en LV se quedan en LV como su rama (el usuario quiere AE2 entero en LV). La pestaña de AE2 empieza dependiendo del último de ellos y no los repite.
- **Fuentes:** GTCP Modern `lv__low_voltage` (*Progressing Through LV*, *Electricity Generation*, *But what are Amps?*, *Battery Buffer*, *Machine Auto-Output Behaviour*, *Cover Behaviour*, *Programmed Circuits*, *What is this Mess?: Part Two*, *Cupronickel Coils*, *Gallium Arsenide*, *First MV Circuit!*); Monifactory `genesis` (*A Primer on Power*, *Battery Buffers*, *Charging Items*); Star Technology `industrial_revolution` para el tono.

### MV — «MV: The Far End» (`mv_age.snbt`, 41 misiones, 49 dependencias)

- **Inicio:** *MV Factory*, depende de *LV to MV Transformer* (hoy, de *Electric Blast Furnace*). Línea del viaje: el End, más allá del mundo.
- **Espina:** cable de cobre y red MV → *MV Components* → cromo y aluminio → *Kanthal* → *Stainless Steel* → *Silicon Ingot* → *Silicon Boule* → *Silicon Wafers* → *Integrated Circuits* → *HV Machine Hull* → *MV to HV Transformer* → *Cleanroom* (salida).
- **Fila fija del End** (v0.5.0): *Blaze* (`3C356A1439744E15`) → *Ender Eye* (`3DDBE9267C197FEE`) → *End Key* (`756117B334515EA3`) → *End Veins* (`004525B795119B1B`, depende también de *Vanadium Steel Drill Bit*). Ids, tareas y textos se quedan; la fila se puede mover entera.
- **Ramas:**
  - arriba del todo, la fila del cielo (el radiotelescopio, cuando pase);
  - arriba, mineral: *Ore Plant* (gear 1,5, el multibloque de la era) y *MV Vein Drill* con la broca de acero vanádico; separación del polvo de piedra; la fila del End justo después de la broca;
  - abajo, carbono: *MV Greenhouse* → pirólisis → metanol → *Biorefinery* (gear 1,5);
  - abajo, petróleo y polímeros: *MV Fluid Drilling Rig* → diésel; salmuera y cloro → etileno y PE → PVC;
  - abajo a la derecha: traje antipeligro, AE2 que crece (enlace a su pestaña); la ruta de lanzamiento de MV cuando pase.
- **Arreglos de forma:** las líneas de 14 a 27 casillas desde *MV Grid*, *MV Components* y *Biorefinery* son las que cruzan todo el capítulo (y la fila del End).
- **Fuentes:** GTCP Modern `mv__medium_voltage` (*Transformers*, *Kanthal Coils*, *Stainless Steel*, *Silicon Lottery*, *Moore's Law*, *Polyethylene*, *The Church of Diesel*, *Desulfurization*, *Distillery*, *Pyrolyse Oven*, *Greenhouse*, *Sulfuric Acid*, *Hydrochloric Acid*); Monifactory `groundwork` (silicio, Kanthal) para estructura.

### HV — «HV: Moonshot» (`hv_age.snbt`, 35 misiones, 45 dependencias)

- **Inicio:** *HV Factory*, depende de *Cleanroom* (la salida de MV). Línea del viaje: la Luna, el primer sitio fuera de la Tierra.
- **Espina:** red HV → *HV Components* → *Refinery* (gear 1,5) → craqueo y olefinas → PTFE → *Gasoline* (el reactor químico grande) → el cohete → *The Moon* (salida).
- **Bloque fijo del cohete** (v0.5.0): *Rocket Fuel* (`76D281E9D9C6FD20`), *Rocket Motors* (`5C1D3FB96A9FB74A`), *Fuel Tanks* (`4A6E81ABD8026025`), *Launch Pad* (`7B21622AADB1E1D1`), *Space Suit* (`5615E54AF782990A`) (las cinco cuelgan de *Gasoline*: el para-aramida del traje y el Kapton de motores y tanques salen de esa química), *First Rocket* (`5151DE8D3623EDCF`, escáner y asiento), *Liftoff* (`4A672DF7CF424623`, chip), *The Moon* (`2897E3EB8159710C`, tarea de dimensión `gcyr:luna`). Van por pieza para que la ruta de lanzamiento cambie recetas sin romperlas. Se pueden mover; ids, tareas, textos y dependencias internas se quedan.
- **Ya no están en HV:** ojo de ender, llave y vetas del End (MV); titanio, casco EV, transformador HV→EV, motor y bomba EV y torre de destilación (EV). *Nichrome* se queda en HV como rama: la torre de EV depende de ella.
- **Ramas:**
  - arriba, mineral y verde: *HV Vein Drill*, *HV Greenhouse*, broca de inox;
  - arriba, circuitos: oblea CPU → *Microprocessor Assembly* → *EV Workstation* → *Vacuum Freezer* → *Nichrome*;
  - abajo, química seria: HF → PTFE, epoxi y SBR, aceros negro y rojo; la planta de gas de síntesis cuando pase;
  - abajo a la derecha: bidones, supercofre y supertanque, AE2 en HV.
- **Fuentes:** GTCP Modern `hv__high_voltage` (*High Voltage Machines*, *The Cleanroom*, *Large Chemical Reactor*, *Ice Cold*, *Nichrome Coils*, *Polytetrafluoroethylene*, *HV Circuit Assembler*, *The End of an Era*).

### EV — «EV: Lunar Base» (`ev_age.snbt`, 12 misiones, 14 dependencias; hecho)

Espina: *Lunar Base* (depende de *The Moon*) → *Lunar Samples* → *Lunar Drill* (gear 1,5) → *Titanium* (también de *Vacuum Freezer*, en HV) → *EV Machine Hull* → *HV to EV Transformer* → *EV Motor and Pump* → *Distillation Tower* (también de *Nichrome*). Arriba, *Waystone on the Moon* (opcional). Abajo, *Helium-3* → *Earth-Moon Bridge* → *Power from Earth*. Solo lo que existe hoy; Marte y el resto de EV, cuando existan.

## 15. Pestañas de calidad de vida: qué arreglar

Las cinco están en el grupo *Quality of Life* y se escribieron antes de esta guía. Los ids ya están arreglados (sección 10) y los textos que la v0.5.0 dejaba en falso ya están corregidos (abejas: el blaze es de MV y los panales de ilmenita y titanio solo se procesan en la Luna; AE2: el puente entre planetas es de EV). Lo que sigue sonando a IA es sobre todo « - » como raya, recetas recitadas y voz de diseño. Recuento del linter a 24-10-2026:

| Pestaña | Forma | Texto | Arreglo |
|---|---|---|---|
| **Storage** (21) | Estrella alrededor de *Storage*: 7 líneas hacia atrás, 3 de más de 5 casillas. | 7 rayas; recetas en prosa («Aluminium plates and an MV circuit around the pouch»), voz de diseño («Every byproduct in this pack has an honest end»). | De izquierda a derecha por el orden en que se consigue: cofres y mochilas → cajones → Sophisticated → cofres y tanques ender (funcionan entre planetas: el enlace pequeño y barato; el industrial es el puente AE2 de EV) → bidones y cajas de GT → salida hacia AE2. Las secundarias de cada mod en su fila. |
| **Applied Energistics** (40) | La mejor: espina de izquierda a derecha. Dos líneas largas (*Wireless Access*, *ExtendedAE*) y una columna bajo *ME Controller* que se lee de arriba abajo. | 13 rayas, «runs on its own», recetas recitadas («Three 1k components, a calculation processor…»). | El inicio depende del último paso de AE2 en LV; la columna bajo el controlador pasa a fila; el puente entre planetas se queda en EV y aquí solo se nombra. |
| **Productive Bees** (12) | Limpia. | 5 rayas. | Inicio dependiente de la era en que se abre; recompensas que no sean solo XP. Es el trozo más corto. |
| **Travel and Teams** (16) | Estrella alrededor de *Getting Around*: 5 líneas hacia atrás. | 7 rayas, «the heart of». | Fila de viaje (ala delta, Waystones, pergaminos) y fila de equipo (equipos, hogares, reclamar, cargar chunks) que salen del inicio hacia la derecha; *Other Worlds* como hito, sin repetir lo que dicen *Waystone on the Moon* (EV) y *Lunar Base*. |
| **Workshop** (15) | Estrella alrededor de *Workshop*: 5 líneas hacia atrás; mezcla tres temas. | 11 rayas, «32 blocks» en el texto. | Tres filas: construcción (Effortless, Carry On, Ultimine, decoración), logística (Pipez, LaserIO, Modular Routers, colectores) y ayudas de GT (terminal, tarjeta de memoria, gestor de estructuras). |

En las cinco: casi todas las recompensas son XP (poner algo pequeño y útil) y ninguna está enlazada con la era en que se abre. El texto pasa por las reglas de la sección 8.

## 16. Trozos para escribir en paralelo

Un trozo es un capítulo y lo hace una sola persona. El contrato es esta guía y el linter:

1. Lee `AGENTS.md`, esta guía entera y los dos capítulos de referencia (`welcome.snbt`, `steam_age.snbt`).
2. Toca solo tu archivo de capítulo, su línea de `GG_QUESTS_EXPECTED` en `tools/test/overlay/kubejs/server_scripts/gg_test_quests.js` y, si adaptas algo de otro pack, `CREDITS.md`.
3. Conserva los ids de toda misión que siga significando lo mismo y los bloques marcados como fijos en la sección 14. Ids nuevos según la sección 10.
4. Comprueba cada hecho en el volcado de recetas (`files/test-runs/hidden-moon-dump1/results/server/kubejs-exported/`), no de memoria.
5. Ni misiones ni texto sobre las máquinas en camino de la sección 14.
6. Hecho = linter con 0 errores y 0 avisos en tu capítulo (o avisos explicados en `lint-config.json`), vista previa de izquierda a derecha sin cruces y `gg_test_quests` en el banco con una copia de `pack/`.
7. LF y sin BOM. Sin commits y sin `Update-PackIndex`.

| Trozo | Archivo | Hoy, según el linter | Plan |
|---|---|---|---|
| 1 | `lv_age.snbt` | 8 líneas largas, 2 cruces, 20 bajo otra misión, 33 rayas, «for good» | Sección 14, LV |
| 2 | `mv_age.snbt` | 12 largas, 1 hacia atrás, 13 cruces, 16 bajo otra misión, 29 rayas | Sección 14, MV (fila del End fija) |
| 3 | `hv_age.snbt` | 8 largas, 1 hacia atrás, 2 cruces, 5 bajo otra misión, 20 rayas | Sección 14, HV (bloque del cohete fijo) |
| 4 | `storage.snbt` | 7 hacia atrás, 3 largas, 7 rayas | Sección 15 |
| 5 | `applied_energistics.snbt` | 2 largas, 13 rayas, 1 frase prohibida | Sección 15 |
| 6 | `travel_and_teams.snbt` | 5 hacia atrás, 7 rayas, 1 frase prohibida | Sección 15 |
| 7 | `workshop.snbt` | 5 hacia atrás, 11 rayas, 1 cantidad | Sección 15 |
| 8 | `productive_bees.snbt` | 5 rayas | Sección 15 |

Bienvenida, Vapor y EV no se reparten: están hechos. Las máquinas en camino y la Luna las mete el equipo del libro cuando el coordinador avise.
