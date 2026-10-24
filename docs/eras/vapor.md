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

## Subproductos

- La piedra de la perforadora es inerte y se puede tirar. En LV también puede ir a la centrífuga.
- Los plantones sobrantes van a compostaje (bolas de planta en LV) o a biomasa más adelante.
- La creosota del horno de coque es combustible o madera tratada. No se inventa ninguna receta solo para "aprovecharla".

## Dimensiones de construcción

Desde la primera misión se pueden ganar dos llaves gratis:

- **Llave del Vacío** (`grindless:void_key`): lleva a `grindless:void`, una dimensión vacía. La primera vez crea una plataforma pequeña bajo los pies.
- **Llave del Llano** (`grindless:flat_key`): lleva a `grindless:flat`, una dimensión totalmente llana con capas de piedra debajo, para construir la fábrica en terreno plano. Si GTM lo permite, también tendrá vetas en el subsuelo.

Usar la llave otra vez devuelve al Overworld, al punto desde el que se salió. Las llaves también se pueden craftear barato por si se pierden.

## Misiones

El libro está en inglés y sigue esta ruta. Su estructura, los tipos de tarea, la disposición y las recompensas se toman de los libros de misiones de otros packs de GTM. Si la licencia lo permite, se adaptan sus textos con atribución.

## Puerta de salida

Se sale de la era cuando hay acero, una turbina de vapor LV que genera energía de forma estable y el primer circuito LV. La validación estática comprueba que coque, bronce, vapor, acero, turbina LV, circuito LV y casco LV se pueden fabricar sin comandos, partiendo solo de lo que da el mundo.
