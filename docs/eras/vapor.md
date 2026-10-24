# Era de vapor

Aquí empieza el juego, sin electricidad. Coque, ladrillos, bronce, calderas y acero. Las máquinas de vapor hacen el trabajo sucio y, antes de salir, el mineral y la madera ya llegan solos.

## Ruta

1. **Arranque.** Madera, pedernal y las herramientas de GT (mortero, martillo, lima). Se pica a mano lo justo: un poco de cobre, estaño, hierro y carbón. Arcilla y arena para los ladrillos.
2. **Coque.** Horno de coque (`gtceu:coke_oven`): carbón a coque, troncos a carbón vegetal. La creosota sale como subproducto y sirve de combustible en la caldera líquida o para impregnar madera.
3. **Bronce.** Bronce en polvo con el mortero y fundido. Primeras placas y engranajes.
4. **Vapor.** Caldera de carbón de baja presión (`gtceu:lp_steam_solid_boiler`) y bomba primitiva (`gtceu:primitive_pump`) para el agua. Máquinas de vapor de un bloque: macerador, compresor, martillo, extractor, horno y aleador.
5. **Sin pico.** Aquí se acaba el picar:
   - Minero de vapor de GTM (`gtceu:lp_steam_miner`): saca el mineral de una veta real que tenga debajo.
   - **Perforadora de vetas a vapor** (nuestra): saca de forma indefinida la veta que marque la muestra.
   - **Invernadero de vapor** (nuestro): madera, resina y cultivos.
   - Trituradora de rocas de vapor (`gtceu:lp_steam_rock_crusher`): roca y adoquín con agua y lava al lado.
6. **Acero.** Alto horno primitivo (`gtceu:primitive_blast_furnace`): hierro y coque dan acero. Con el acero llegan las máquinas de alta presión y la broca de acero.
   - Después, el **alto horno de vapor** (nuestro) hace acero directamente de la mena, más rápido, a cambio de vapor.
   - La **batería de coque** (nuestra) coquiza como 6 o 7 hornos de coque y guarda el gas de hulla para LV.
7. **Puerta a LV.** Turbina de vapor LV (`gtceu:lv_steam_turbine`), primer circuito LV, casco LV y cable de estaño con goma. Cuando eso funciona, la era está superada.

## Multibloques nuestros

Se registran en `gtceu:` porque así funciona el registro de máquinas de GTM. Los objetos propios van en `grindless:`.

### Perforadora de vetas a vapor — `gtceu:steam_vein_drill`

Qué gana: mineral sin límite y sin tener que mudarse de veta. Ninguna máquina de un bloque genera mineral; el minero de vapor solo recoge el que ya hay en el mundo y lo agota.

- **Tipo de receta:** `gtceu:vein_drilling`. El mismo tipo lo usarán las perforadoras eléctricas de LV y siguientes.
- **Entradas de cada receta:**
  - una **muestra de veta** (`grindless:vein_sample_<veta>`), que no se consume;
  - una **broca** (`grindless:bronze_drill_bit` o `grindless:steel_drill_bit`), que se gasta por probabilidad (bronce alrededor del 10 % por ciclo, acero alrededor del 4 %);
  - agua (unos 100 mB por ciclo) si el multibloque admite escotilla de fluidos; si no, solo vapor.
- **Salidas:** el mineral en bruto (`raw_*`) de la veta, en proporción a los pesos de la veta en GTM, más un subproducto inerte de piedra que se puede tirar.
- **Tabla de vetas:** se genera desde las vetas del Overworld de GTM 7.5.3. Un único archivo de datos alimenta todas las recetas. Las vetas profundas (por debajo de Y 0) solo admiten la broca de acero; las demás admiten las dos, y la de acero rinde más.
- **Muestra de veta:** se craftea una vez con una sonda vacía (placas de bronce y vidrio) y dos menas en bruto de esa veta. Se consiguen picando una vez o con el minero de vapor.
- **Ritmo orientativo:** con 4 en paralelo, unas 40-60 menas por minuto. A pleno rendimiento gasta unos 50-60 mB/t de vapor, así que pide varias calderas o una caldera grande de bronce.
- **Estructura:** una torre visible de unos 3×3 de base y 5-7 de alto, con marcos de bronce o acero y casco de vapor. Lleva bus de entrada, bus de salida, escotilla de vapor y escotilla de agua.

### Invernadero de vapor — `gtceu:steam_greenhouse`

Qué gana: madera, resina y comida sin talar ni plantar. Ninguna máquina de un bloque de GTM hace crecer árboles.

- **Tipo de receta:** `gtceu:greenhouse`. Lo compartirán los invernaderos eléctricos.
- **Entradas:** un plantón o semilla como catalizador (no se gasta), agua y, si se quiere, fertilizante (harina de hueso o el fertilizante de GT) para más producción.
- **Salidas:**
  - árboles vanilla: troncos, alguna vez un plantón y palos;
  - árbol de caucho de GTM: troncos de caucho y resina pegajosa;
  - cultivos: trigo, caña de azúcar, zanahoria, patata, remolacha, calabaza y sandía.
- **Ritmo orientativo:** unos 6 troncos cada 30 s por paralelo sin fertilizante. Con fertilizante, unas 1,5 veces más.
- **Estructura:** unos 5×5×5. Suelo de tierra, paredes y techo de vidrio y esqueleto de casco de vapor. Tiene que verse como un invernadero.

### Alto horno de vapor — `gtceu:steam_blast_furnace`

Qué gana: pasos y velocidad. El horno y el alto horno primitivo en una sola máquina: toma la mena y da acero. Una estructura hace tanto acero como 6 o 7 altos hornos primitivos, así que las brocas de acero de la perforadora dejan de ser el cuello de botella.

- **Tipo de receta:** `gtceu:steelmaking` (fabricación de acero).
- **Receta:** 4 de hierro + 4 de coque + 1 de fundente → 4 lingotes de acero + 1 de ceniza. 8 EU/t y 2 400 ticks por carga.
  - **Hierro:** mena en bruto o triturada de hierro, magnetita, hematita, goethita o limonita amarilla, y lingote o polvo de hierro. Una receta por fila de la tabla `kubejs/data/grindless/tables/steam_blast_furnace.json`.
  - **Fundente** (`#grindless:blast_furnace_fluxes`): calcita en bruto, en polvo o en bloque. La calcita sale de la veta de lapislázuli.
  - **Fuera:** la pirita es un sulfuro y espera al tostador de LV.
- **Ritmo:** 4 cargas a la vez y 1,5 veces más lentas: 16 lingotes cada 180 s, unos 5,3 por minuto. Gasta unos 57 mB/t de vapor (12 800 mB por lingote).
- **Comparación con GTM.** El alto horno primitivo (`gtceu:primitive_blast_furnace`) hace 1 lingote de hierro + 1 de coque → 1 de acero + 1/9 de ceniza en 1 500 ticks, de uno en uno, y el hierro hay que fundirlo antes.
  - **El rendimiento es el de GT.** Una mena en bruto da 1 acero, como fundirla da 1 lingote. Una triturada también da 1, y macerar una en bruto da 2 trituradas, o sea 2 de acero. Gasta 1 coque por acero, como el primitivo.
  - **Lo que cuesta:** vapor (el primitivo no gasta nada más), una línea de coque, otra de calcita y una estructura mayor con acero en el controlador.
- **Estructura** (3 × 7 × 3):
  - crisol: casco de vapor con las piezas (escotilla de vapor, bus de entrada y 1 o 2 buses de salida);
  - etalaje: ladrillo refractario, tres toberas (tuberías de bronce o acero) y el controlador;
  - cuba: ladrillo refractario hueco (el hueco tiene que estar vacío);
  - arriba: cuatro postes de marco (bronce o acero) y el bajante, dos tuberías.
- **Controlador:** el alto horno primitivo, placas de acero, una tubería de bronce, engranajes de bronce y casco de vapor.

### Batería de coque con subproductos — `gtceu:coking_battery`

Qué gana: rendimiento. Coquiza como el horno de coque y además recupera el gas de hulla, que el horno de coque pierde.

- **Tipo de receta:** `gtceu:coking` (coquización).
- **Receta:** 1 de carbón → 1 de coque + 500 mB de creosota + 125 mB de gas de hulla. 4 EU/t y 360 ticks.
- **Ritmo:** 4 cámaras a la vez: 4 de carbón cada 27 s, como 6 o 7 hornos de coque. Gasta unos 28 mB/t de vapor (3 840 mB por carbón, lo que dan unos 180 mB de su propia creosota en una caldera líquida de alta presión).
- **Por qué estos números** (por carbón, recetas de GTM 7.5.3):

  | Máquina | Era | Coque | Creosota | Gas de hulla | Coste |
  |---|---|---|---|---|---|
  | Horno de coque | Vapor | 1 | 500 mB | — | 900 ticks y nada más |
  | **Batería de coque** | Vapor | 1 | 500 mB | 125 mB | 3 840 mB de vapor |
  | Horno de pirólisis, con vapor | MV | 1 | — | 250 mB | 62,5 mB de vapor y 96 EU/t |
  | Horno de pirólisis, con N₂ | MV | 1 | 500 mB | — | 62,5 mB de N₂ y 96 EU/t |

  - El coque se queda 1:1. El horno de coque industrial de GT Community Additions daba 2 de coque por carbón y 3,4 veces la creosota, y por eso se quitó.
  - La creosota es la del horno de coque.
  - El gas es la mitad del que recupera el horno de pirólisis de MV; la otra mitad calienta los hornos (una batería real quema el 40-50 % de su propio gas bajo las cámaras).
  - En EU de LV (96 EU por mB de gas de hulla en la turbina de gas; unos 10,5 EU por mB de creosota en una caldera líquida de alta presión), un carbón vale unos 5 250 EU en el horno de coque, unos 15 300 EU aquí (descontado el vapor) y unos 22 000 EU en el horno de pirólisis. Mejor que la máquina de vapor de GTM y por debajo de la de MV.
- **Estructura** (5 × 4 × 3):
  - base: casco de vapor con la escotilla de vapor y 1 o 2 buses de salida (el coque);
  - tres cámaras de ladrillo de coque entre dos paredes de hogar de bronce; el controlador es la puerta de la cámara del medio;
  - techo: casco de vapor con el bus de entrada (la boca de carga) y las dos escotillas de salida de fluidos (creosota y gas), y el colector de gas en medio (tuberías de bronce o acero).
- **Controlador:** dos hornos de coque, placas y engranajes de bronce, una tubería de bronce y casco de vapor.
- **Escotilla ULV de salida de fluidos.** En GTM 7.5.3 solo se fabrica en el ensamblador (LV), y ninguna pieza de vapor saca fluidos de un multibloque de vapor: la escotilla de la bomba solo admite agua y la del horno de coque solo funciona con él. Por eso tiene receta a mano: casco ULV + vidrio + 2 de resina pegajosa (la cola). Efectos secundarios pequeños:
  - con un destornillador pasa a ser la escotilla ULV de entrada (receta de GTM; ninguna máquina de vapor la usa);
  - la bomba primitiva bombea el doble de agua con ella que con su escotilla.

### Observatorio de relojería — `gtceu:steam_observatory`

Qué gana: es lo único que hace la primera carta de la Luna (`grindless:lunar_chart_draft`). Abre la familia del observatorio, la que cuenta el viaje (`docs/viaje.md`): los datos de navegación solo salen de mirar.

- **Tipo de receta:** `gtceu:stargazing` (observación al ocular).
- **Receta:** 4 de papel + 1 de polvo de carbón (la tinta) → 1 carta lunar (borrador). 8 EU/t de vapor y 400 ticks (600 en el multibloque de vapor: 30 s). Una carta cada vez.
- **Condiciones** (de GTM, puestas en la receta):
  - de noche (la condición de día, invertida);
  - con el cielo despejado (nivel de lluvia por debajo de 0,2);
  - con el controlador en Y 100 o más (`posY 100..319`): por encima de la bruma del valle y del humo de los hornos de coque.
  - Si amanece o llueve a medio dibujo, la máquina espera y no pierde lo hecho (`regressWhenWaiting(false)`). En EMI, una línea dice la regla en palabras.
- **Por qué no es grind:** una noche despejada llega sola y una torre de 40 bloques se levanta en un momento (en el Llano, el suelo está en Y 63). No hay azar ni tiempos inflados: la observación dura 30 s y siempre da la carta.
- **Estructura** (3 × 6 × 5, al aire libre):
  - plataforma de casco de vapor con la escotilla de vapor y un bus de entrada y otro de salida;
  - pilar de ladrillo de piedra;
  - caja de engranajes de bronce (el mecanismo de relojería) entre dos horquillas de marco de bronce;
  - tubo de tuberías de bronce que sube en diagonal hacia atrás, con un vidrio arriba (el objetivo).
  - El latón del dibujo es el bronce de GTM: el latón pide cinc y en vapor no hay.
- **Controlador:** vidrio, una tubería de bronce (el tubo), engranajes de bronce, el casco de bronce, placas de bronce y un reloj (el mecanismo). Todo es de vapor, así que se fabrica en cualquier era posterior: un mundo que ya está en LV también lo construye.
- **La carta no se gasta.** El observatorio óptico (LV) la lee sin gastarla. Se copia a mano: borrador + papel + polvo de carbón → 2.

#### Decisiones tomadas (observatorio, 2026-10-24)

- **Un tipo de receta por observatorio** (`stargazing`, `astrophotography`, `radio_astronomy`), no uno compartido como en la perforadora. Así cada carta solo sale de su máquina, y EMI lo enseña.
- **Las cartas se hacen una vez.** La máquina siguiente las pide sin gastarlas, y cualquier carta se copia en la mesa (original + soporte en blanco → 2). La copia sale de los cristales de coordenadas de Star Technology (MIT); su azar no: su buscador dimensional da el cristal con un 5 % de probabilidad.
- **El validador no modela las condiciones del cielo:** las da por cumplidas. Las prueba `gg_test_observatory` en partida, también que el observatorio se niega cuando falla cada una.
- **La tinta es polvo de carbón.** El tinte negro sale de la tinta de calamar o de la rosa marchita, que en vapor no se automatizan.

## Subproductos

- La piedra de la perforadora es inerte y se puede tirar. En LV puede ir al lodo de perforación y en MV a la centrífuga, como hace GTM.
- Los plantones sobrantes van a compostaje (bolas de planta en LV) o a biomasa más adelante.
- La creosota del horno de coque es combustible o madera tratada. No se inventa ninguna receta solo para "aprovecharla".
- La creosota de la batería de coque es la misma: combustible de caldera o madera tratada.
- La ceniza del alto horno de vapor es la escoria: la cal del fundente y la ceniza del coque. Es inerte y se puede tirar (la papelera de Trash Cans ya está en vapor). En LV, el reactor químico de GTM hace fertilizante con calcita + 3 de ceniza + agua, y la centrífuga la separa en cal viva, magnesia, potasa, carbonato de sodio y algo de hematita.
- Los gases del tragante del alto horno de vapor (CO₂ y CO) salen por el bajante, como en el alto horno primitivo.
- El gas de hulla de la batería es inflamable y venenoso: se guarda en tanques (bidones o un tanque multibloque) y, si su escotilla se llena, la batería se para.
  - En LV alimenta la turbina de gas (96 EU/mB) y la destiladora (alquitrán, amoníaco, etilbenceno o CO₂, con un poco de polvo de coque de vuelta).
  - En MV va a la biorrefinería y a la torre de destilación de GTM.
  - En vapor no se quema: no se añade ninguna receta de caldera que no tenga GTM.

## Dimensiones de construcción

Desde la primera misión se pueden ganar dos llaves gratis:

- **Llave del Vacío** (`grindless:void_key`): lleva a `grindless:void`, una dimensión vacía. La primera vez crea una plataforma pequeña bajo los pies.
- **Llave del Llano** (`grindless:flat_key`): lleva a `grindless:flat`, una dimensión totalmente llana con capas de piedra debajo, para construir la fábrica en terreno plano. Si GTM lo permite, también tendrá vetas en el subsuelo.

Usar la llave otra vez devuelve al Overworld, al punto desde el que se salió. Las llaves también se pueden craftear barato por si se pierden.

## Misiones

El libro está en inglés y sigue esta ruta. Su estructura, los tipos de tarea, la disposición y las recompensas se toman de los libros de misiones de otros packs de GTM. Si la licencia lo permite, se adaptan sus textos con atribución.

## Puerta de salida

Se sale de la era cuando hay acero, una turbina de vapor LV que genera energía de forma estable y el primer circuito LV. La validación estática comprueba que coque, bronce, vapor, acero, turbina LV, circuito LV y casco LV se pueden fabricar sin comandos, partiendo solo de lo que da el mundo.

## Decisiones tomadas: alto horno de vapor y batería de coque (2026-10-24)

- **El alto horno de vapor gana pasos y velocidad, no rendimiento.** Da 1 acero por mena, como fundirla y pasarla por el alto horno primitivo, y 1 coque por acero. Quien macera antes saca 2, igual que en GT.
- **La batería gana rendimiento sin pasar a GTM.** Coque 1:1, la creosota del horno de coque y la mitad del gas del horno de pirólisis de MV. Por carbón queda entre el horno de coque y el de pirólisis.
- **La escotilla ULV de salida de fluidos se puede fabricar a mano en vapor.** No hay otra forma de sacar fluidos de un multibloque de vapor. La perforadora y el invernadero de vapor no cambian de forma: siguen sin agua ni fertilizante.
- **La escoria es la ceniza de GTM.** No se crea un objeto nuevo. La ceniza de GTM ya es cal, magnesia y potasa, y tiene destino en LV.
- **El gas de hulla espera a LV.** En vapor se guarda en tanques. No se le da receta de caldera, porque GTM no la tiene.
- **Los dos trabajan con 4 paralelos**, como la perforadora y el invernadero de vapor.
- **El controlador se fabrica con la máquina de GTM que sustituye:** el alto horno primitivo, y dos hornos de coque. El alto horno de vapor pide además acero, así que el primitivo sigue siendo el arranque del acero.
- **El fundente es calcita en bruto, en polvo o en bloque.** La pirita queda fuera del alto horno: es un sulfuro y antes hay que tostarla (LV).
