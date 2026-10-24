# Era LV

La primera fábrica eléctrica: cables, máquinas de un bloque, química pequeña, centrifugado, lavado de mineral y los primeros circuitos de verdad. Los recursos pasan a ser eléctricos y más rápidos, AE2 se desbloquea entera y la era acaba cuando MV se alimenta sin ir justo.

Se entra con lo que deja el vapor: turbina de vapor LV (`gtceu:lv_steam_turbine`), primer circuito LV, casco LV y cable de estaño con goma.

## Ruta

1. **Red LV.** Cable de estaño con goma, casco (`gtceu:lv_machine_hull`), escotilla de energía (`gtceu:lv_energy_input_hatch`) y búfer de baterías (`gtceu:lv_battery_buffer_4x`). La caldera grande de bronce (`gtceu:bronze_large_boiler`, unos 800 mB/t de vapor, verificar) mueve unas 12 turbinas (64 mB/t y 32 EU/t cada una) y también quema biomasa y creosota.
2. **Máquinas de un bloque.** Con motor, pistón, bomba, cinta y brazo LV salen macerador, lavador de mineral, centrífuga, centrífuga térmica, electrolizador, mezclador, reactor químico, ensamblador, ensamblador de circuitos, prensa de formado, polarizador, autoclave, baño químico, empaquetadora, cervecería, fermentador, alambique, colector de gas y triturador de rocas (`gtceu:lv_<máquina>`).
3. **Mineral eléctrico.** Perforadora de vetas LV (nuestra) y la línea completa: macerar, lavar, centrifugar con calor y centrifugar.
4. **Verde y criaturas.** Invernadero LV (nuestro) → biomasa → simulador de criaturas: huesos, hilo, slime, lana, cuero, plumas y perlas de ender.
5. **Química pequeña.** Aire → N₂ y O₂; azufre → ácido sulfúrico; sal + ácido → bisulfato y HCl → persulfato y cloruro férrico; creosota → lubricante → lodo de perforación.
6. **Circuitos de verdad.** Circuito electrónico LV en lote, placa buena, galio + arsénico → diodos → circuito electrónico MV.
7. **Horno de arco y AE2.** El horno de arco sumergido (nuestro) da silicio, polvo del cielo y obsidiana. Con cuarzo, silicio, cielo y perlas se monta AE2 entera.
8. **Aluminio.** Zafiro de veta profunda → electrolizador LV → aluminio → casco MV.
9. **Salida.** Central LV con holgura, transformador LV→MV y EBF corriendo a 120 EU/t. Ver *Puerta a MV*.

## Generación automática de recursos

Cada recurso tiene un catalizador que no se gasta y entradas que salen de otra línea. Nada se recoge a mano más de una vez.

### Perforadora de vetas LV: multibloque nuestro

- **Decisión:** multibloque `gtceu:lv_vein_drill`, tipo `gtceu:vein_drilling` y la misma tabla de vetas del vapor. GTM trae `KJSTieredMultiblockBuilder`: un registro da LV, MV y HV (verificar uso desde KubeJS).
- **Por qué no un bloque suelto:** (1) la regla del vapor es que ningún bloque suelto genera mineral; (2) un bloque se apila sin límite, una torre pide sitio y casco; (3) GTM ya hace así sus perforadoras (`gtceu:mv_fluid_drilling_rig`, `gtceu:mv_bedrock_ore_miner`).
- **Estructura:** la torre del vapor (3×3 de base, 5–7 de alto) con marcos y casco de acero, escotilla de energía LV, bus de entrada (muestra y broca), bus de salida y escotilla de fluidos.
- **Gana al vapor:** ritmo orientativo ×2 a unos 30 EU/t y **lodo de perforación** (`gtceu:drilling_fluid`): +50 % de mineral y la mitad de desgaste de broca. Funciona en cualquier dimensión, también Llano y Vacío, porque la muestra sustituye a la veta.
- **Cierra el círculo:** la muestra no se gasta; la broca de acero se gasta por probabilidad (~4 % por ciclo, ~2 % con lodo); el agua sale de la bomba; el polvo de piedra de la perforadora vuelve como lodo (1 polvo + 20 mB de lubricante + 4 980 mB de agua → 5 000 mB, receta de GTM).

### Invernadero LV: escalón eléctrico

- **Registro:** `gtceu:lv_greenhouse`, tipo `gtceu:greenhouse` (el del vapor). 5×5×5, casco de acero, vidrio, suelo de tierra y escotilla de energía LV.
- **Gana:** ritmo ×2 y fertilizante por circuito (1 = base; 2 + fertilizante = doble salida a mitad de tiempo). Añade setas, flores, bayas y enredaderas (biomasa y tintes).
- **Fertilizante** (`gtceu:fertilizer`): mezclador LV (tierra + 2 serrín + 4 arena + agua → 4) o reactor químico (calcita, apatito, TCP o ceniza con azufre o fosfato). Es el destino honesto de la ceniza del horno de arco y del apatito.
- **Cierra el círculo:** plantón o semilla no se gasta; agua de la bomba; el fertilizante sale de la química; la biomasa sobrante va a la caldera grande.

### Drops de criaturas: tipo propio, sin HNN

- **Elegido:** tipo de receta `gtceu:creature_simulation` y máquina `gtceu:lv_creature_simulator` (un bloque, LV–EV).
- **Por qué no Hostile Neural Networks** (MIT, 1.20.1): (1) usa FE y queda fuera de las recetas de GT: sin circuito programado, escotillas ni categoría en EMI; (2) sus modelos se entrenan matando y habría que reescribirlos, como hizo Monifactory; (3) con tipo propio modelos y drops viven en una tabla (`mobs.json`) y cada ciclo gasta entradas reales; (4) una dependencia menos.
- **Receta:** modelo (`grindless:creature_model_<id>`, no se gasta) + biomasa + el mineral de la criatura + circuito programado (elige la tirada). La biomasa es 25 mB por ciclo de 10 s en LV, 50 para el enderman y el creeper y 100 para el blaze: un fermentador del mismo tier alimenta un simulador. Salen los drops; la biomasa se consume y no hay subproducto.
- **Modelos:** el ensamblador los imprime con un modelo en blanco y 8 unidades del mineral que luego consumen. Nadie mata nada.

| Modelo | Mineral por ciclo | Salida (orientativa, 10 s a 30 EU/t) |
|---|---|---|
| Esqueleto | 1 TCP (veta de apatito) | 4 huesos |
| Araña | 1 azufre | 6 hilos |
| Slime | 1 goma cruda (invernadero) | 4 bolas de slime |
| Oveja | nada | 4 lana |
| Vaca | nada | 2 cuero y 2 carne cruda |
| Gallina | nada | 4 plumas y 1 huevo |
| Enderman | 2 obsidiana en polvo | 1 perla (20 s) |

- **Perla inicial:** GTM pide perlas ya en LV (generador de campo LV, cubiertas de vaciado) y su síntesis es HV y con berilio, que solo hay en el Nether. El modelo de Enderman es el único que pide 1 perla real (misión "Primera perla" o una caza única); desde ahí se multiplican.
- **Cierra el círculo:** el modelo no se gasta; biomasa del invernadero; minerales de la perforadora.

### Fluidos base

- **Agua:** bomba primitiva del vapor y `gtceu:lv_pump`. En Llano y Vacío cuenta el bioma (usar llanura).
- **Aire:** `gtceu:lv_gas_collector` (10 000 mB por 200 t a 16 EU/t) y centrífuga: 3 900 mB de N₂ + 1 000 mB de O₂. El resto del aire es inerte y se vierte.
- **Lava:** se coloca una vez junto a la trituradora de rocas (no se gasta). No se fabrica: quemada en una caldera daría más energía de la que cuesta.
- **Obsidiana:** horno de arco (adoquín fundido y templado con agua). Va al polvo del cielo.
- **Sal y salmuera:** mezclador (sal + agua) y electrolizador.
- **Aceite:** no hay en LV (la perforadora de fluidos de GTM es MV). El combustible de LV es lo que queman las calderas: biomasa, coque y creosota.
- **Cierra el círculo:** colector y bomba solo gastan EU; la lava se coloca una vez.

### Piedra, arena, grava y arcilla

- **Piedra y adoquín:** triturador de rocas LV (andesita, granito y diorita pasan a MV; obsidiana, a HV).
- **Grava y arena:** martillo LV (adoquín → grava → arena, 16 EU/t), macerador (arena → arena de cuarzo) y tamiz LV (`gtceu:lv_sifter`: grava → pedernal).
- **Arcilla:** entrada propia "sedimentos" en la tabla de vetas (arcilla, arena roja, pedernal). Solo hace falta para ladrillos y cerámica.
- **Cierra el círculo:** todo sale de roca, agua y EU.

## Multibloques nuestros

### Horno de arco sumergido: `gtceu:submerged_arc_furnace` (el de la era)

Qué gana: **recetas imposibles en pequeño**. En GTM el silicio pide 2 273 K y 120 EU/t (EBF con Kanthal, MV) y ningún bloque LV reduce óxidos. Este horno reduce a LV con dos escotillas (2 A).

- **Tipo de receta:** `gtceu:arc_smelting` (nuevo).
- **Estructura:** 3×3×4, carcasa termorresistente (`gtceu:heatproof_machine_casing`, verificar) ≥ 12, chimenea de un bloque con escotilla silenciadora, 2 escotillas de energía LV, bus de entrada (materia y electrodos), bus de salida y escotilla de fluidos.
- **Electrodos:** `grindless:graphite_electrode` (grafito de la veta de diamante, torno LV). Se gastan por probabilidad (~3 % por ciclo), como las brocas.
- **Recetas** (orientativas, 64 EU/t y 200–300 t):
  1. **Silicio:** 3 arena de cuarzo + 2 coque en polvo → 1 lingote de silicio, ceniza (1/9) y 2 000 mB de CO₂ por la chimenea.
  2. **Impactita:** 4 obsidiana en polvo + 4 arena de cuarzo + 1 certus cargado → 4 polvo del cielo (`ae2:sky_dust`). Es roca fundida por un impacto, como las tectitas.
  3. **Obsidiana:** 32 adoquines + 4 000 mB de agua → 4 obsidiana (fundido y templado).
- **Por qué no es un cubo grande:** ninguna máquina de un bloque tiene estas recetas y piden condiciones (dos escotillas, electrodos, chimenea), no cantidad. En MV el EBF con Kanthal llegará al silicio por otro camino.
- **Subproductos:** el CO₂ es inerte y se ventea (con circuito 2 sale CO a un tanque, útil en MV para metanol); la ceniza va a fertilizante; la escoria de piedra va al lodo de perforación.

### Perforadora de vetas LV (segundo multibloque)

Misma familia que la del vapor, descrita arriba. Gana ritmo y rendimiento con una entrada nueva, el lodo, que enlaza con su propio subproducto. Tiene el tamaño de la torre del vapor: no es "la misma receta en un cubo mayor", es un escalón de la familia con otra energía y otro lazo de materiales.

### Tostador de sulfuros: `gtceu:sulfide_roaster` (LV reforzado)

Qué gana: **pasos, calor de vuelta y plata en LV**. GTM tuesta los sulfuros en el EBF con 3 000 mB de oxígeno separado por polvo (120 EU/t, 120 t, 1 200 K) y deja el SO₂ para dos reactores químicos más (SO₂ + O₂ → SO₃; SO₃ + agua → ácido). En LV el oxígeno sale de la centrífuga de aire (1 000 mB por 10 000 de aire en 80 s): una sola tostación seguida pediría unas 40 centrífugas. El tostador lo hace todo en un ciclo y con aire.

- **Tipo de receta:** `gtceu:sulfide_roasting` (`startup_scripts/grindless/lv/sulfide_roaster.js`, recetas en `server_scripts/grindless/lv/sulfide_roaster.js`).
- **Estructura:** 5 × 7 × 3. Horno de carcasa termorresistente sobre cuatro patas de acero, parrilla de cajas de fuego de acero (GTM las enciende mientras trabaja), lecho fluidizado (aire) y una torre de contacto de acero encima. Exactamente 2 escotillas de energía, 1 bus de entrada, 2 escotillas de entrada (aire y agua), 1 bus de salida y 2 escotillas de salida (ácido y vapor).
- **Recetas.** Las del EBF de GTM, con los mismos sólidos, la misma energía y el mismo tiempo (30 V × 4 A = 120 EU/t, 120 t). Se leyeron en el volcado de 0.4.1 y en `MachineRecipeLoader`, y la prueba las compara con el EBF en partida.

  | Mena | Sólidos (iguales al EBF) | Ácido (mB) | Vapor (mB) | Aire (mB) | Agua (mB) |
  |---|---|---|---|---|---|
  | Esfalerita | zincita + 1/9 de ceniza | 1 000 | 3 200 | 15 000 | 1 020 |
  | Pirita | hematita + 1/9 de ceniza | 2 000 | 6 400 | 15 000 | 2 040 |
  | Galena | masicot + 6 pepitas de plata | 1 000 | 3 200 | 15 000 | 1 020 |
  | Estibina | trióxido de antimonio + 1/9 de ceniza | 1 500 | 4 800 | 15 000 | 1 530 |
  | Tetraedrita | óxido cúprico + 3 pizcas de trióxido de antimonio | 2 000 | 6 400 | 15 000 | 2 040 |
  | Azufre (quemador) | — | 1 000 | 3 200 | 7 500 | 1 020 (30 EU/t, 60 t) |

- **De dónde salen los números:**
  - Aire: los 3 000 mB de oxígeno del EBF × 5, porque el aire es un quinto oxígeno. El convertidor usa el oxígeno que sobra de ese aire, como en una planta real, y el nitrógeno sale inerte con los gases de cola.
  - Ácido: 1 mB por mB de SO₂ del EBF, con el agua 1:1 de GTM.
  - Vapor: 3 200 mB por cada 1 000 de SO₂, más su agua a 1:160. Por una turbina LV vuelve entre el 11 % y el 22 % de la energía del ciclo.
  - El quemador de azufre devuelve algo menos de lo que gasta: no es una fuente de energía.
- **Catalizador:** `grindless:contact_catalyst`. Vanadio (centrífuga LV de la magnetita vanádica) + 4 de diatomita en el mezclador LV → 4. Se desgasta por probabilidad, en el 2 % de los ciclos.
- **Subproductos y su destino:**
  - Zincita, masicot, trióxido de antimonio y óxido cúprico → electrolizador LV: cinc, plomo, antimonio y cobre, y su oxígeno vuelve para el acero del EBF.
  - Hematita → cualquier horno: hierro.
  - Pepitas de plata → lingote, y de ahí a los espejos de la torre solar.
  - Ceniza → fertilizante. Ácido → química de GT. Vapor → turbinas.
  - El SO₂ nunca sale de la máquina.

### Torre solar de heliostatos: `gtceu:heliostat_tower` (LV reforzado)

Qué gana: **vapor sin combustible**. Es la primera central solar y el primer paso de la familia de energía: torre de heliostatos → campo solar lunar → estación solar orbital → Dyson. Ninguna máquina pequeña de LV saca vapor del sol en cantidad (la caldera solar de GTM da 120 mB por segundo).

- **Tipo de receta:** `gtceu:solar_steam` (`startup_scripts/grindless/lv/heliostat_tower.js`, recetas en `server_scripts/grindless/lv/heliostat_tower.js`).
- **Estructura:** 7 × 11 × 7.
  - Una casa de bombas de 3 × 3 con el controlador en la puerta.
  - Una torre de celosía de acero con el tubo ascendente dentro.
  - Arriba, el receptor: 3 × 3 × 2 cajas de fuego de acero, que GTM enciende mientras trabaja, y un mástil.
  - Detrás de la torre, 28 espejos de heliostato en cuatro filas de siete.
  - 1 escotilla de energía, 1 de entrada y 1 de salida.
- **Recetas:** 50 mB de agua o de agua destilada → 8 000 mB de vapor cada 10 t, es decir, **800 mB/t**. Consume 16 EU/t (motores de los espejos y bomba). Sin overclock ni paralelos: lo marca el campo, no la escotilla.
- **La regla del sol** (la que gobernará las bases de la Luna y Mercurio):
  - Un ciclo solo empieza si pasa en lo alto de la torre la misma prueba que la caldera solar de GTM (`GTUtil.canSeeSunClearly`: cielo abierto, de día, sin lluvia ni nieve encima, fuera del End) y si las cuatro esquinas del campo ven el cielo. Si no, el controlador dice "No llega el sol al receptor".
  - La condición de día de GTM, que se ve en EMI, detiene el ciclo en curso al anochecer.
  - En los desiertos no llueve. El Nether y el End nunca cuentan como día.
- **Equilibrio frente a las calderas:**
  - De día da lo que una caldera grande de bronce a todo fuego (800 mB/t, 12,5 turbinas LV), sin combustible ni línea de combustible.
  - De noche o con lluvia no da nada. De media, algo menos de media caldera: el día de Minecraft es poco menos de la mitad del ciclo.
  - La noche se cubre con el vapor del día guardado en tanques multibloque de GTM. El de acero guarda 1 000 000 mB, y una noche de 10 turbinas pide unos 8.
  - Cuesta 28 espejos plateados (56 láminas de plata), la torre y las turbinas.
- **Agua:** 1 mB de agua da 160 de vapor, como en las calderas grandes. La turbina LV devuelve 4 mB de agua destilada por cada 640 de vapor, justo lo que pide un ciclo, así que el circuito de agua se puede cerrar.
- **Espejo:** `grindless:heliostat_mirror`, en el ensamblador LV: placa de acero, 2 láminas de plata, un panel de cristal y un engranaje pequeño de acero. La plata sale de la veta de galena o del tostador, así que las dos máquinas se cruzan.

#### Decisiones tomadas (LV reforzado, 2026-10-24)

1. Las tostaciones copian las del EBF de GTM sin tocar sus sólidos ni su energía. Solo cambian tres cosas: aire en vez de oxígeno, ácido en vez de SO₂ y vapor de vuelta.
2. Aire = 5 × el oxígeno del EBF, y el convertidor usa el que sobra, sin aire extra.
3. El tostador también quema azufre suelto, como una planta de ácido, con balance de energía negativo.
4. El catalizador de contacto es vanadio sobre diatomita y se desgasta por probabilidad (2 %), como los electrodos y las brocas.
5. Quedan fuera la calcopirita, la pentlandita y la cobaltita: el catálogo pedía estas cinco, y la cobaltita da trióxido de arsénico, que habría que contener.
6. La torre solar da 800 mB/t de día, sin overclock.
7. El sol se comprueba con la función de la caldera solar de GTM más las esquinas del campo. La lluvia solo cuenta en biomas donde llueve o nieva.
8. La torre no tiene almacén propio: la noche se cubre con los tanques multibloque de GTM.
9. El espejo es un bloque propio con modelo y texturas propios, y lleva plata.

### Observatorio óptico: `gtceu:optical_observatory` (LV reforzado)

Qué gana: es lo único que hace el **mapa fotográfico de la Luna** (`grindless:lunar_map`) y las **efemérides lunares** (`grindless:lunar_ephemeris`). Es el segundo paso de la familia del observatorio (`docs/viaje.md`) y gana cielo: ya no hace falta la altura.

- **Tipo de receta:** `gtceu:astrophotography` (`startup_scripts/grindless/observatory/machines.js`, recetas en `server_scripts/grindless/observatory/recipes.js`).
- **Receta:** el borrador de vapor, que no se gasta (es la carta para orientarse) + 4 placas fotográficas + 2 de papel → 1 mapa + 1 efemérides. 30 EU/t y 600 ticks (30 s).
- **Placa fotográfica** (`grindless:photographic_plate`): ensamblador LV, 2 placas de vidrio + 1 montón pequeño de polvo de plata (la emulsión) → 2 placas, 16 EU/t y 100 ticks. La plata sale de la veta de galena o del tostador.
- **Condiciones:** de noche y con el cielo despejado, a cualquier altura (las exposiciones largas vencen a la bruma). Si llueve a medias, espera y no pierde lo hecho.
- **Estructura** (5 × 6 × 5):
  - anillo de suelo de carcasa de acero macizo con las piezas: 1 o 2 escotillas de energía, un bus de entrada y otro de salida;
  - dos hiladas de muro de ladrillo de piedra, con el controlador a la altura de los ojos;
  - cúpula escalonada de carcasa de acero con la rendija abierta: sus dos casillas tienen que quedar vacías;
  - dentro, el refractor: base de ladrillo, marco de acero, caja de engranajes de acero (el motor de seguimiento), dos tuberías de acero que asoman por la rendija y un vidrio arriba.
- **Controlador:** vidrio, un sensor LV (el portaplacas), dos motores LV (el seguimiento), el casco LV, circuitos LV y placas de acero.
- **Las cartas no se gastan.** El radiotelescopio (MV) lee el mapa y las efemérides sin gastarlos. Copias a mano: mapa + placa fotográfica → 2 (una copia por contacto) y efemérides + papel + polvo de carbón → 2.

#### Decisiones tomadas (observatorio óptico, 2026-10-24)

1. El mapa y las efemérides salen de la misma observación: es una noche de trabajo, no dos.
2. El borrador de vapor no se gasta. Si el jugador pierde el mapa, no tiene que volver a vapor.
3. La cúpula es de carcasa de acero y los muros de ladrillo de piedra: unas 30 carcasas, como el invernadero LV, para que la estructura no sea un muro de cantidad.
4. La rendija se exige abierta (aire): es la forma del observatorio, no un coste.

### Descartadas

- **Motor de vapor multibloque.** Es un hueco real de GTM (no hay generador multibloque en LV ni MV). Se descarta: LV se cubre con la caldera grande y las turbinas, y GTM trae turbinas grandes en EV. Si hiciera falta, entraría en MV con combustible procesado, no crudo.
- **Planta de mineral** (macerar, lavar y centrifugar en uno). Se deja para MV o HV: en LV hay que aprender la cadena paso a paso.
- **Fábrica universal** (varios tipos de máquina en un controlador). Demasiado pronto: aún no hay cadenas que justifiquen unirlas.

## AE2 en LV

AE2 15.4.11 queda como viene (canales 8/32). Cambia cómo se fabrica: se quitan el inscriptor y el cargador (bloques y recetas `ae2:inscriber` y `ae2:charger`) y las recetas de crafteo de AE2, y cada familia pasa por una máquina GT LV desde una tabla única (`ae2_gt.json`). Los bloques de red llevan un casco LV como cuerpo, como una máquina GT. El coste es de complejidad (cuarzo, silicio, cielo, perlas); las cantidades son las de AE2: un componente 256k cuesta 121 procesadores (81 de lógica y 40 de cálculo), ~360 cristales de certus y 121 de silicio. Es la meta de fin de LV.

| Objeto AE2 | Máquina GT | Entradas clave |
|---|---|---|
| Cuarzo certus (`ae2:certus_quartz_crystal`) | macerador (vapor) → `lv_centrifuge` → `lv_autoclave` | arena → arena de cuarzo → polvo de certus (25 % por 2 de arena, receta de GTM) → cristal con agua |
| Certus cargado | `lv_polarizer` (receta nueva) | cristal de certus, solo EU (sustituye al cargador de AE2) |
| Cristal de fluix | `lv_mixer` | certus cargado + redstone + cuarcita o cuarzo + agua → 2 |
| Polvos (certus, fluix, ender, cielo) | macerador | cristal, perla o bloque |
| Silicio | horno de arco sumergido | arena de cuarzo + coque; sale `gtceu:silicon_ingot` y se añade a `forge:silicon` |
| Polvo y piedra del cielo | horno de arco; `lv_electric_furnace` (verificar que lee la fundición de AE2) | obsidiana + arena + certus cargado; polvo → bloque → liso |
| 4 prensas | `lv_forming_press` | placa de acero + certus, diamante, lingote de oro o silicio |
| Impresos (cálculo, ingeniería, lógica, silicio) | `lv_forming_press` | prensa sin gastar + certus, diamante (veta profunda), oro o silicio |
| Procesadores (3) | `lv_circuit_assembler` | impreso + silicio impreso + redstone |
| Núcleos y cartas | `lv_assembler` | núcleos: cuarzo (certus o cuarcita) + polvo de fluix + procesador de lógica; cartas: oro, hierro, redstone y procesador |
| Vidrio de cuarzo, fibra, cable de fluix | `lv_assembler` | polvo de cuarzo + vidrio; fibra + fluix |
| Controlador | `lv_assembler` | casco LV + 4 piedra del cielo lisa + 4 fluix + procesador de ingeniería |
| Disco, interfaz, proveedor de patrones, terminales, buses, monitores, emisores, P2P | `lv_assembler` | casco LV (bloques) o placa de acero (partes) + núcleos o procesadores |
| Componentes 1k a 256k | `lv_assembler` | 1k = lógica + certus + redstone; cada escalón = 3 del anterior + cálculo + vidrio de cuarzo + polvo (glowstone; cielo en 256k) |
| Celdas de objeto y fluido, carcasas | `lv_packer` | carcasa (vidrio de cuarzo, redstone, hierro o cobre) + componente |
| CPU: unidad, almacenamiento 1k a 256k, coprocesador, monitor | `lv_assembler` | unidad + componente o procesador de ingeniería |
| Ensamblador molecular | `lv_assembler` | casco LV + núcleos de formación y aniquilación + vidrio de cuarzo |
| Energía: celda, celda densa, aceptor, cámara de vibración | `lv_assembler` y `gtceu:lv_1a_energy_converter` (verificar) | certus + fluix + vidrio; EU→FE a 4 FE por EU |
| Perla de fluix, receptor, punto de acceso, refuerzo inalámbrico | `lv_assembler` | perla de ender (simulador) + polvo de fluix |
| Espacial (componentes, pilón, puerto, ancla) y cuántico (enlace, anillo) | `lv_assembler` | perlas de fluix + procesadores; la singularidad sale del condensador de AE2 y se entrelaza con el ritual de AE2 (explosión) |
| Cristal budding | en el mundo, con agua | certus cargado + bloque; opcional como granja |
| Herramientas, pinturas, tarjeta de memoria | `lv_assembler` | cristales de certus o fluix + hierro |

- **Energía de la red:** convertidor EU→FE + aceptor de energía, o cámara de vibración con coque. La manivela solo sirve para arrancar.
- **Prensas sin meteoritos:** se estampan en la prensa de formado con una placa de acero y el material que luego imprimen (certus, diamante, oro, silicio). El grabador láser LV no entra: sus obleas son MV.
- **Sin atajos:** las prensas de los meteoritos se apagan (config de AE2, verificar `spawnPressesInMeteoritesEnabled`) y se quita el "silicio de polvo de certus".
- **Sumidero inerte:** el condensador de AE2 acepta polvo de piedra y grava sobrantes.
- **Después:** ExtendedAE y AdvancedAE (HV–EV), Applied Flux y AE2WTLib (MV), MEGA Cells (IV, más de 256k) y las escotillas ME de GTM (EV).

## Líneas de proceso nuevas

| Línea | Pasos | Subproductos → destino |
|---|---|---|
| Mineral completo | mena en bruto → macerador → lavador (agua; persulfato con bauxita, esfalerita, estibina e ilmenita) → centrífuga térmica → macerador → centrífuga | polvo de piedra: inerte (lodo, condensador o se tira); secundarios (14 % al macerar, 1/3 al lavar): cada uno a su línea (galio, azufre, cinc, hierro, aluminio) |
| Zafiro → aluminio | veta de zafiro (profunda, broca de acero) → polvo → `lv_electrolyzer` (30 EU/t); la mena también suelta aluminio como secundario (14 %) | O₂: acero del EBF; zafiro verde: mismo camino; almandino y piropo: polvo guardado, su electrólisis es MV |
| Sal → persulfato y FeCl₃ | azufre + O₂ → SO₂ → SO₃ → H₂SO₄; sal + H₂SO₄ → bisulfato + HCl; bisulfato → persulfato; hierro + HCl → FeCl₃ | H₂ (del persulfato y del FeCl₃): tanque, destino MV (metanol, amoníaco), inflamable, no se ventea; sobrante de HCl: tanque |
| Galio + arsénico → diodos | bauxita lavada → centrífuga térmica → macerador (14 % de galio); rejalgar → electrólisis → arsénico y azufre; mezclador → GaAs; ensamblador → diodo | azufre: ácido y simulador; antimonio y baritina del rejalgar: guardados |

El polvo de piedra de GTM se separa en MV (`stone_dust_separation`, 120 EU/t). Se baja a LV por KubeJS para cumplir lo que dice vapor.md.

## Puerta a MV

| Qué se construye | Qué prueba |
|---|---|
| Casco MV (`gtceu:mv_machine_hull`) y escotilla de energía MV | el aluminio sale de la línea del zafiro sin pedir MV |
| 8 circuitos electrónicos MV (`#gtceu:circuits/mv`, verificar) | placa buena y diodos con galio + arsénico funcionan |
| Central LV de 512 EU/t o más (2 calderas grandes y ~16 turbinas, o biomasa), 2 búferes y transformador LV→MV (4 A → 1 A) | "sin ir justo": MV cabe con el búfer sobre el 50 % |
| Escotilla de energía MV en el EBF (`gtceu:mv_energy_input_hatch`), alimentada por el transformador LV→MV, corriendo `steel_from_iron` (hierro + 200 mB de O₂, 120 EU/t) con el O₂ del colector | MV llega por cable de verdad, no con dos escotillas LV, y el EBF queda listo |
| Red AE2 con controlador y una CPU de 16k que fabrica una pieza LV (el motor LV) con patrones | AE2 ya es la logística |
| Mineral, invernadero y simulador 10 minutos sin tocarlos | la generación eléctrica se sostiene sola |

Abre MV: casco y escotillas MV, pirólisis (casco MV), perforadora de fluidos MV (aceite) y la perforadora de vetas MV.

## Mods e integración

| Mod | Slug | Uso |
|---|---|---|
| Applied Energistics 2 (ya está) | `ae2` | recetas rehechas con GT |
| Crafting Station (ya está) | `crafting-station-jei-edition-updated` | sin cambios |
| ME Requester (opcional) | `merequester` | pedir piezas de la red a las máquinas (LGPL-3.0) |
| AE2 Crafting Tree Refreshed (opcional) | `ae2-crafting-tree-refreshed` | árbol de crafteo (LGPL-3.0) |
| Más adelante | `extended-ae`, `advancedae`, `appflux`, `mega`, `applied-energistics-2-wireless-terminals` | ver AE2, "Después" |

Ningún mod nuevo es obligatorio: máquinas, tipos de receta y modelos son KubeJS.

- **Startup:** tipos `gtceu:creature_simulation` y `gtceu:arc_smelting`; máquinas `lv_vein_drill`, `lv_greenhouse`, `lv_creature_simulator` y `submerged_arc_furnace`, con el helper de patrones y casings de GTM; ítems `grindless:blank_creature_model`, `grindless:creature_model_<id>` y `grindless:graphite_electrode`. Texturas: un icono genérico teñido por modelo.
- **Server:** quitar por tipo `ae2:inscriber` y `ae2:charger`, las recetas `ae2:transform` de certus y fluix y las de crafteo de AE2; quitar también `silicon_from_certus_quartz_dust`. Todo se regenera desde `ae2_gt.json` y `mobs.json`.
- **Tags:** unir `forge:gems/certus_quartz` (GT y AE2 tienen el mismo cristal: las salidas de GT se cambian por la de AE2) y añadir el silicio de GT a `forge:silicon`.
- **Dimensiones:** el aire de GTM solo vale en `overworld`; añadir recetas de colector con `.dimension('grindless:void')` y `.dimension('grindless:flat')`, y bioma llanura en ambas.
- **Misiones:** capítulo "Fábrica LV" con unas 9 misiones, una por paso, premio pequeño y sin bloquear recetas.
- **Pruebas:** (1) arranca; (2) los cuatro multibloques y máquinas nuevos se forman y procesan; (3) arena → certus → fluix → procesador → controlador, y zafiro → aluminio → casco MV.

## Riesgos y dudas

- **Vetas del Nether y End.** GTM 7.5.3 pone en el Nether el certus, el cuarzo, el berilio, el salitre, el azufre puro, la esfalerita, la tetraedrita y el topacio. LV se arregla sin ellas (certus por arena, azufre por pirita, galio por bauxita), pero MV y HV las pedirán. Hay que decidir ya si la tabla de vetas admite las del Nether y End con una muestra fabricable sin viajar.
- **Aluminio por una sola vía.** El único camino LV es el zafiro: electrólisis (30 EU/t) o el 14 % de aluminio que suelta su mena. Bauxita (60 EU/t) y EBF con zafiro (100 EU/t) son MV. La puerta MV depende de una veta profunda y de la broca de acero; la alternativa es bajar `bauxite_electrolysis` a LV.
- **Silicio en LV.** GTM lo deja en MV (EBF con Kanthal). Falta decidir si el silicio del arco vale también para circuitos de GT o solo para AE2, con ítem o tag propio. Boule y obleas siguen pidiendo MV.
- **Primera perla de ender.** Es la única entrada manual o de misión de la era. Confirmar misión o caza única.
- **Reescritura de AE2.** Unas 150 recetas, con riesgo de huérfanas en EMI y de duplicados GT/AE2. AE2 sigue fijado en 15.4.11.

Créditos a anotar en `CREDITS.md`: fertilizante por circuito en el invernadero (Monifactory, LGPL-3.0); prensas, procesadores y celdas de AE2 por máquinas GT (Star Technology, MIT); modelos de criaturas sin matar (Monifactory y Nomifactory; HNN, MIT, queda como alternativa descartada); lodo de perforación a partir de piedra (receta de GTM).

## Decisiones tomadas (orquestador, 2026-10-24)

Mandan sobre lo de arriba cuando choquen.

1. **AE2 híbrido, no reescrito entero.**
   - El inscriptor y el cargador se quedan, pero se fabrican con piezas LV de GT (casco, motor, circuito).
   - Solo se rehacen las entradas: silicio, prensas (prensa de formado, sin meteoritos), piedra del cielo, controlador, unidad, aceptor de energía, ensamblador molecular, interfaz, proveedor de patrones, inscriptor y cargador.
   - El resto de recetas de AE2 se queda igual, porque ya depende de los procesadores.
   - Son unas 20 recetas en lugar de 150. AE2 sigue siendo AE2 y entra entera en LV.
2. **El silicio del horno de arco es `ae2:silicon`, solo para AE2.** El silicio de GT sigue el orden de GTM (EBF en MV) para no romper sus circuitos. Se quita la receta de AE2 que funde polvo de certus en silicio.
3. **El polvo de piedra no baja a LV.** Es inerte: en LV se tira o va al lodo de perforación, y en MV se separa en la centrífuga como hace GTM. No se tocan recetas de GTM.
4. **Vetas de todas las dimensiones en la misma tabla.**
   - La perforadora de vapor hace las del Overworld, la LV añade las del Nether y la MV o HV las del End.
   - La muestra se fabrica con dos menas de esa veta, así que basta un viaje: es exploración, no grind.
5. **Primera perla de ender:** la da una misión de LV. Desde ahí, el simulador de criaturas la multiplica.
6. **Energía de AE2:** cámara de vibración con coque al principio y conversor EU→FE de GTM si la configuración de 7.5.3 lo permite (verificar). La manivela solo sirve para arrancar.
7. **El horno de arco no hace lava.** Sale más energía quemándola en una caldera de la que cuesta fabricarla. Hace **obsidiana** (adoquín fundido y templado con agua), que es lo que pide el polvo del cielo. Para la trituradora de rocas basta con colocar lava una vez.
8. **Ritmo real de la perforadora LV:** con una escotilla, ×1,5 la de vapor; con dos, ×3. Lleva un modificador de paralelos propio (voltaje ÷ 8 EU/t, máximo 8), porque GTM no hace overclock a recetas de 8 EU/t.
9. **El CO₂ del horno de arco** es inerte: el jugador pone el controlador en modo vaciar fluidos o lo guarda. Con el circuito 2 sale CO para MV.
10. **AE2, cómo quedó:**
    - Los 8 bloques de entrada se hacen en el ensamblador LV.
    - Las prensas salen de la prensa de formado LV.
    - El certus sale del autoclave de GT (da el cristal de AE2) o de la veta de certus del Nether con la perforadora LV.
    - El certus cargado sale del cargador de AE2 o del polarizador LV; el fluix, de la transformación de AE2 o del mezclador LV.
    - La cuarcita cuenta como cuarzo del Nether, así que el núcleo de aniquilación no obliga a ir al Nether.
    - Las prensas no salen en los meteoritos y el convertidor EU→FE de GTM está activado.
11. **Simulador de criaturas:**
    - Cada tirada de botín tiene su circuito programado.
    - Las criaturas pasivas imprimen su modelo con lo que comen (trigo, semillas o hilo).
    - Creeper (pólvora) es de MV y Blaze (varas) de HV.
    - Un fermentador LV alimenta un simulador LV a pleno ritmo (relación 1:1).
