# Era EV

EV es titanio, platino y química fina, y aquí los multibloques pasan a ser la forma normal de producir: las recetas llegan a 1 920 EU/t, piden ácidos, gases y cámara limpia a la vez, y la máquina suelta se queda corta. El titanio solo sale de la Luna, así que el primer trabajo de EV es que la base lunar trabaje sola y conectada con casa: un trípode que perfora, un campo solar que la alimenta, una celda que saca oxígeno del regolito y titanio de la ilmenita sin cloro y una planta que licúa gases con el frío lunar, todo enlazado por AE2. En la Tierra, la planta de platino cierra la química fina y los circuitos nano son la pared. Al final, una antena en la cara oculta de la Luna traza la ruta a **Marte**, el único sitio con tungsteno: sin él no hay acero de tungsteno ni IV. EV junta cuatro multibloques nuestros (tres nuevos y la planta de platino), tres escalones de familia y los de GTM.

Se entra con lo que deja el final de HV. En la Tierra: casco EV de titanio lunar, central de 8 192 EU/t, cámara limpia, congelador, torre, reactor grande y red AE2 con 256k. En la Luna: el cohete de nivel 1, el traje, la perforadora lunar, el helio-3 guardado, las Waystones y el primer puente AE2 Tierra–Luna.

## Ruta

1. **Red EV.** Transformador HV→EV, búferes y escotillas EV (las de 4, 16 y 64 A empiezan aquí). Turbinas grandes de gas (`gtceu:gas_large_turbine`: casco EV, 2 circuitos EV, 4 engranajes y 2 tubos grandes de inox; 4 096 EU/t con el rotor al 100 %) con gas de refinería y calderas grandes de titanio, hasta los 32 768 EU/t de la puerta.
2. **Escotillas ME.** `gtceu:me_input_bus`, `me_output_bus`, `me_input_hatch` y `me_output_hatch` (EV; las de reserva y el búfer de patrones son de LuV). Cada multibloque pide a la red y le devuelve, también en la Luna.
3. **Base lunar I.** Campo solar lunar y búferes. El trípode EV sustituye a la perforadora lunar de HV y manda la ilmenita a casa por un bus ME.
4. **Base lunar II.** Celda de regolito (volátiles, O₂ y metales del regolito, titanio de la ilmenita sin cloro y el ladrillo sinterizado de las estructuras lunares) y planta criogénica (oxígeno, nitrógeno y helio líquidos con el frío de la noche lunar).
5. **Red entre planetas.** Troncal de túneles P2P, energía por el puente y pares nuevos sin viaje (ver *La red AE2*).
6. **Química fina.** Ácido nítrico en un paso (`nitric_acid_from_elements`, reactor grande), HCl y la mezcla de nitración de la línea de platino de GT-- (verificar id). La mezcla de metales se separa en la centrífuga EV (900 EU/t), ya sin ilmenita.
7. **Platino.** Planta de platino: menas de sulfuro → Pt, Pd, Rh y Ru, con los lazos cerrados dentro.
8. **Circuitos nano.** Boule de fósforo (EBF, 2 484 K) → obleas → chips NOR; oblea nano (oblea de CPU + 16 fibras de carbono + 576 mB de glowstone, reactor EV, cámara limpia) → ordenador nano (`gtceu:nano_processor_computer`). Es la pared.
9. **El wither.** Modelo de esqueleto atrofiado (HV) → wither (EV): estrella del Nether, que se guarda para IV.
10. **La ruta a Marte.** Antena de espacio profundo (Luna) → carta de Marte → cohete de nivel 2 con piezas de titanio.
11. **Marte, a mano.** Primera visita en cohete: waystone, 2 menas por veta y la mitad marciana del puente. Después, el procesador de atmósfera y el trípode marciano.
12. **Tungsteno y salida.** Scheelita de Marte → tungsteno → acero de tungsteno y bobina RTM, y la *Puerta a IV*.

## Herencia de HV

Todo esto llega hecho en la versión del final de HV:

- **Cohete de nivel 1.** Piezas básicas de GCYR con inox y kapton K; plataforma y escáner de cohetes en HV. Sube el kit lunar; para Marte hace falta el nivel 2.
- **Traje espacial.** El de HV, con 16 cubos de O₂ en el peto (unos 40 minutos). GCYR lo deja entre 60 y 363 K: vale para la Luna (113 K) y Marte (208 K), no para Venus ni Mercurio.
- **Perforadora lunar.** Solo perfora en la Luna. EV la cambia por el trípode y la usa en su receta.
- **Titanio.** El primero sale del Kroll en la Tierra con ilmenita lunar (lazo Mg/Cl₂ y congelador). EV lo gasta en cascos, carcasas, tubos y barriles; la celda lo hace después en la Luna.
- **Helio-3.** Se guarda para la fusión; la celda suma el suyo. Nada de EV lo gasta.
- **Waystones y /home de FTB.** Tras la primera visita la gente viaja gratis. En Marte, la waystone de la primera visita es la vuelta.
- **Puente AE2 Tierra–Luna.** Un par con una mitad hecha en cada extremo; lleva materiales y fluidos. EV lo convierte en troncal.
- **Lo demás:** refinería y reformador, cámara limpia, congelador, torre, reactor grande con PTFE, bobina de nicromo, las vetas del End (ahora de MV, con su platino) y la perforadora HV (tope 32, broca de inox).

## La base lunar

En EV la Luna pasa de sitio que se visita a fábrica que trabaja sola. Sus máquinas solo producen allí: todas sus recetas llevan `.dimension('gcyr:luna')` y sus estructuras piden ladrillo de regolito sinterizado, que solo se hace en la Luna. Se pueden montar en otro sitio, pero no trabajan.

### Reglas de la Luna

- **Vacío: no arde nada.** Los combustibles de generadores, turbinas de gas y calderas grandes llevan `.dimension('gcyr:luna', true)` (las calderas pequeñas no usan recetas: verificar).
- **Frío: criogenia barata.** La planta criogénica tira el calor al cielo negro: de noche licúa a mitad de energía que el congelador de GTM.
- **Luz ×1,4, solo de día.** Energía solar de día; de noche, búferes o la Tierra por el puente.
- **Sin agua líquida: no hay lodo.** El trípode perfora en seco (la broca se gasta el doble) o enfriado con nitrógeno líquido.

### La red AE2: escalón EV

AE2 es la columna entre planetas (decisión del usuario) y mejorarla es un objetivo de la era.

- **De dónde se parte.** HV dejó un par Tierra–Luna: un puente cuántico que une las dos redes en una (32 canales y la energía de AE2 compartida).
- **Escotillas ME en la Luna.** Trípode, celda y planta criogénica piden y entregan a la red de casa: el titanio llega a la Tierra sin que nadie lo mueva.
- **Troncal.** Túneles P2P de ME por el puente (32 canales cada uno): la base lunar tiene red completa sin más pares.
- **Energía.** Túneles P2P de FE por el puente y convertidores de GTM a los dos lados (`gtceu:ev_16a_energy_converter`: 32 768 EU/t por pareja; verificar id y el impuesto de AE2 por FE). La Tierra cubre la noche lunar y el sobrante solar del día baja a casa.
- **Pares sin viaje.** La mitad lunar de cada par nuevo la fabrica la propia base (con una pieza de la celda; se ajusta a la receta de HV): la red crece sola.
- **Marte.** Primer par Tierra–Marte al final de la era. Su mitad marciana se monta allí en la primera visita, y una celda de energía de AE2 cargada en casa arranca ese lado (verificar).
- **Objetivo de la era:** un segundo par Tierra–Luna hecho por la base, troncal de 64 canales o más, 32 768 EU/t cruzando y el par de Marte.

## Marte, al final de EV

- **Cómo se llega.** Marte pide cohete de nivel 2 (`rocket_tier` 2 en su planeta de GCYR, que calcula el nivel como (motor + tanque) / 2). GCYR hace el tanque y el motor avanzados en IV con acero de tungsteno, que sale de Marte: imposible. Se rehacen en EV con titanio: tanque = 2 barriles de titanio (`gtceu:titanium_drum`) + 6 placas de kapton K + marco de titanio; motor = 4 propulsores avanzados (`gtceu:advanced_power_thruster`, motor HV) + 6 placas de kapton K + marco de titanio. Ensamblador EV, con la carta de Marte como catalizador. Combustible: 14 cubos, sea cual sea (GCYR pide lo mismo desde la Tierra que desde la Luna).
- **La primera visita, a mano.** Ida en cohete con el kit en la mochila: waystone, piezas de la mitad marciana del puente, celda de energía de AE2 cargada, zapatas de ladrillo sinterizado y los controladores del trípode y del procesador. Allí: la waystone (la vuelta es por ella), 2 menas de cada veta para las muestras (también de hielo: verificar que Marte lo genera) y el puente.
- **Lo primero que se monta.** El puente (energía y piezas llegan de casa), el procesador de atmósfera (O₂ para el traje y metano: la energía del sitio) y el trípode con las muestras. Desde ahí la scheelita baja sola.
- **Lo que solo da Marte.** Tungsteno (scheelita y tungstato), tierras raras (un material propio con mena, hecho en KubeJS, del que sale el samario; el neodimio sigue en el Nether porque el motor EV lo pide desde HV) y hielo con unas cinco veces más deuterio que el agua de la Tierra, que IV convierte en agua pesada. `veins_mars.json` lleva solo esas tres vetas, y en el mundo de Marte se generan solo ellas: las de hierro, níquel, cobre y cinc de GCYR salen (Marte no es "más de lo mismo").
- **Reglas de Marte.** Aire fino de CO₂ sin O₂: la combustión solo va con oxígeno (metalox = metano + O₂ en el mezclador, quemado en turbina de gas con `.dimension('gcyr:mars')`; los demás combustibles, con la inversa). Luz ×0,43: el solar apenas da. 0,38 g y 208 K: el traje de HV basta. El polvo y el equipo presurizado son de IV.

## Generación automática de recursos

### Trípode EV: `gtceu:ev_vein_drill` (Luna y Marte)

- **Forma y piezas nuevas.** Tres patas de marco de titanio sobre zapatas de ladrillo sinterizado, cuerpo de carcasa estable de titanio en alto, sarta de tubo de titanio entre las patas y dos alas de paneles solares. Bus de entrada (broca y muestra), 2 buses de salida (uno ME), 1 escotilla de fluidos (nitrógeno líquido) y 1–2 escotillas EV.
- **Registro.** Tipo `gtceu:vein_drilling`, la spec y el veto de LV a HV y el código del scratch (`ev/family_multis.js`, `bores` con tope 64, probado en servidor): cambian el patrón y la broca.
- **Vetas.** Las lunares de HV (`.dimension('gcyr:luna')`) y, al final, las tres de Marte (`.dimension('gcyr:mars')`). Ninguna de la Tierra: para eso sigue la perforadora HV.
- **Reglas.** En seco la broca se gasta el doble; con 50 mB de nitrógeno líquido por corrida, como con lodo. De día, las alas le pagan la mitad de la energía en la Luna y casi nada en Marte (modificador por dimensión y hora; verificar que puede bajar el EU/t).
- **Broca de titanio** (`grindless:titanium_drill_bit`: HV la dejó registrada y oculta para los mundos viejos, con conversión 1:1 a la de inox; en EV vuelve a ser broca y la conversión se quita): ~1 % por corrida en seco y ~0,25 % con nitrógeno líquido (cifras a ajustar). La paga el titanio que saca. La de acero de tungsteno pasa a IV.
- **Gana a la perforadora lunar:** tope 64, salida directa a casa y perfora Marte. Se hace con ella dentro, casco EV, 2 motores y 1 bomba EV, 2 circuitos EV y placas de titanio.

### Lo demás

- **Tierra.** La perforadora HV sigue con Overworld, Nether y End, y no hay perforadora EV en la Tierra (el mineral sobra: el cuello es el procesado). Perforadora de fluidos HV (casco EV, ×16) para crudo y gas. Aire, gases nobles, cloro y ácidos, como en HV.
- **Luna.** El regolito sale del trípode (la piedra que suelta, molida; verificar el material) y la celda lo convierte en O₂, metales y volátiles; la planta criogénica licúa lo que hace falta.
- **Marte.** El CO₂ del aire, para el procesador; el hielo, a la red para IV.
- **Criaturas.** El simulador EV (ya registrado) suma a `mobs.json` el esqueleto atrofiado (tier 3) y el wither (tier 4, 1 920 EU/t, 30 s, 400 mB de biomasa, 1 estrella por ciclo). La estrella se guarda para IV.
- **Cierra el círculo:** crudo, aire, sal y menas de la Tierra salen de perforadoras; ilmenita y regolito, del trípode lunar; scheelita, tierras raras y hielo, del marciano. Lo demás es EU.

## Multibloques nuestros

### Celda de regolito: `gtceu:regolith_cell` (Luna, el de la era)

Qué gana: **recetas que en la Tierra no existen.** Oxígeno en un mundo sin aire, titanio sin cloro ni magnesio y el ladrillo con el que se levanta toda la base lunar.

- **Tipo de receta:** `gtceu:regolith_processing` (nuevo, verificar colisión de id), todas con `.dimension('gcyr:luna')`. El circuito elige el modo:
  1. **Volátiles** (circuito 1): regolito calentado → He, He-3, H₂, N₂ y algo de agua, en la proporción real: mucho H₂ y He, una pizca de He-3 (cifras a ajustar).
  2. **Electrólisis** (circuito 2): regolito fundido → O₂ + hierro + silicio. Con ilmenita y la carga de electrolito → lingote de titanio + hierro + O₂ (reducción en sal fundida, como el proceso FFC). Energía: la suma de las etapas del Kroll que sustituye (rutilo, TiCl₄, EBF y congelador), sin descuento (verificar).
  3. **Sinterizado** (circuito 3): regolito → ladrillo de regolito sinterizado (`grindless:sintered_regolith`). Los primeros, lentos, salen de un horno eléctrico en la Luna con la misma condición.
- **Condición propia:** ánodo de platino (`grindless:platinum_electrode`, el de la planta de platino; los primeros, con platino del End), que se gasta en ~0,1 % de las tandas, y carga de electrolito de CaCl₂ (`grindless:molten_salt_charge`), que no se gasta. El CaCl₂ sale del lazo Solvay de la Tierra y, al final, del tungsteno.
- **Estructura:** nave de 5×5×4 de ladrillo sinterizado, crisol de carcasa estable de titanio con bobinas de nicromo y techo de vidrio templado; bus de entrada, bus de salida, 5 escotillas de salida de fluidos y 1–2 escotillas EV. Admite escotillas ME.
- **Se fabrica con:** casco EV + electrolizador EV + horno eléctrico EV + 2 bombas EV + 4 circuitos EV.
- **Por qué no es un cubo grande:** (1) sus recetas no existen en la Tierra y solo corren en la Luna; (2) el titanio sin cloro es un proceso que GTM no tiene y lo paga con la misma energía; (3) pide ánodos de la planta de platino, carga de electrolito y un destino para cada salida: si una escotilla se llena, se para.
- **Subproductos:** O₂ y N₂ → planta criogénica, traje o red. Hierro → acero de la base. Silicio → paneles del campo solar. He → planta criogénica (helio líquido para IV). He-3 → reserva de fusión. H₂ → red de casa (refinería). Agua: inerte, se vacía.
- **Recortable:** sin el modo de titanio quedan el O₂, los volátiles y el ladrillo; el titanio sigue por Kroll.

### Planta criogénica: `gtceu:cryogenic_plant` (Luna)

Qué gana: **líquidos que GTM no hace y frío del sitio.** GTM licúa aire, O₂ y helio en el congelador (`liquid_air`, `liquid_oxygen`, `liquid_helium`: 1 920 EU/t, 240 t por cubo los dos últimos), pero no tiene nitrógeno ni hidrógeno líquidos. En la Luna, de noche, los radiadores tiran el calor a un cielo negro: la planta licúa varios gases en una estructura y gasta la mitad.

- **Tipo de receta:** `gtceu:cryogenic_processing` (nuevo, verificar id), con `.dimension('gcyr:luna')`. Una receta por gas: O₂ → oxígeno líquido, He → helio líquido, N₂ → nitrógeno líquido (fluido nuevo en KubeJS: GTM 7.5.3 no lo tiene) y H₂ → hidrógeno líquido (solo si IV le da uso). De noche (`.daytime(true)`, verificar), la mitad de energía que el congelador; de día, la misma.
- **Condición propia:** el sitio y la hora. No hay catalizador: la ventaja es el frío.
- **Estructura:** torre de 3×3×7 de carcasa a prueba de heladas (`gtceu:frostproof_machine_casing`) sobre ladrillo sinterizado, con un ala de radiadores hacia el cielo; 2 escotillas de entrada, 4 de salida y 1–2 escotillas EV. Admite escotillas ME.
- **Se fabrica con:** casco EV + congelador de vacío de GTM + 2 bombas EV + 4 circuitos EV.
- **Por qué no es un cubo grande:** hace un líquido que GTM no tiene (el nitrógeno; el hidrógeno, si IV lo pide), solo gana energía por el sitio y la hora (en la Tierra no corre) y cada líquido tiene un consumidor con nombre.
- **Destinos:** nitrógeno líquido → refrigerante del trípode (EV) y de la perforadora de Mercurio (IV). Oxígeno líquido → motores extremos de IV (su alternativa a la fisión). Helio líquido → lingotes de 5 000 K o más (IV). Hidrógeno líquido: GCYR pide 14 cubos de cualquier combustible, así que el hidrolox solo entra si IV lo hace obligatorio.

### Procesador de atmósfera: `gtceu:atmosphere_processor` (Marte)

Qué gana: **una receta que solo existe en Marte y tres máquinas en una.** Toma el CO₂ del aire, hace hidrógeno con agua y lo junta con el CO₂ (Sabatier): oxígeno y metano, el comburente y el combustible de la base. Es lo primero que se monta en Marte después del puente.

- **Tipo de receta:** `gtceu:atmosphere_processing` (nuevo, verificar id), con `.dimension('gcyr:mars')`. El aire lo toma de fuera, como el colector de gas. Una receta: agua → CH₄ + O₂ (neto de electrólisis y Sabatier: CO₂ + 2 H₂O → CH₄ + 2 O₂), con la energía de las dos etapas de GTM (cifras a fijar).
- **Condición propia:** catalizador de rutenio (`grindless:ruthenium_catalyst`), con rutenio de la planta de platino, que se gasta por probabilidad.
- **Estructura:** 5×5×6 de carcasa estable de titanio: toma de aire con filtros de polvo arriba, pila de electrólisis y reactor; escotilla de entrada (agua), 2 de salida (CH₄ y O₂), bus del catalizador y 1–2 escotillas EV.
- **Se fabrica con:** casco EV + colector de gas EV + electrolizador EV + reactor químico EV + 4 circuitos EV.
- **Por qué no es un cubo grande:** el aire marciano solo existe allí, junta tres máquinas que GTM tiene sueltas y cruza dos planetas (rutenio de la Tierra, agua de casa).
- **Subproductos:** O₂ → trajes y metalox. CH₄ → metalox para las turbinas de Marte o la red de casa. El agua del hielo, rica en deuterio, se guarda para IV: el procesador usa la de casa.

### Planta de platino: `gtceu:platinum_plant` (Tierra)

Hecha y probada en el scratch (`scratch/ev-plant/src/`), sin aplicar. Qué gana: **pasos en uno y lazos cerrados.** La línea viva es la de GT-- (al estilo GTNH, sustituye a la de GTM): unas cuarenta recetas en una docena de máquinas, con lazos de polvo, amoníaco y tetróxido de rutenio (tóxico) entre ellas.

- **Tipo `gtceu:pgm_refining`,** compuesto al cargar la partida desde las recetas de GT-- (si cambian, se recompone; si faltan, el log lo dice). Circuito 1, ataque: 9 menas purificadas de pentlandita o calcopirita → lodo de platino + Ni o Cu + O₂ + H₂SO₄, con la electrólisis dentro. Circuito 2, separación: platino, paladio, y rodio con rutenio. Mismas proporciones y misma energía que la línea suelta, sin paralelos.
- **Condición:** electrodo de platino (`grindless:platinum_electrode`, platino sobre titanio, 0,1 %).
- **Estructura:** nave de 5×7×5 de carcasa inerte (≥ 24), tubos de titanio y vidrio templado; 1–2 escotillas EV, 1 bus de entrada y 1 de salida, 3 escotillas de entrada y 4 de salida. Admite escotillas ME.
- **Salidas:** Pt, Pd, Rh, Ru y lo que la línea suelta, cada cosa con destino. La mezcla Ir/Os y el residuo de iridio se guardan (el viaje pone Ir y Os en Mercurio: ver *Decisiones*).
- **Nuevo con el viaje:** sus electrodos son los ánodos de la celda lunar, y su rutenio, el catalizador del procesador marciano y la RTM.

### Escalones de familia

- **Perforadora:** el trípode EV (arriba).
- **Energía: campo solar lunar** (`gtceu:lunar_solar_array`). Paso de la torre de espejos de LV: sin espejos, sin caldera y sin agua; paneles de silicio de la celda en marcos de titanio sobre ladrillo sinterizado, con radiadores. Generador sin entradas, solo de día, en la Luna (×1,4) o en Marte (×0,43); potencia por panel a ajustar. Se hace como el panel solar grande de TFG (solo la idea). De noche, búferes y el puente.
- **Observatorio: antena de espacio profundo** (`gtceu:deep_space_antenna`, Luna). Paso del radiotelescopio de MV: plato en la cara oculta, a salvo del ruido de radio de la Tierra. Con energía escribe la carta de Marte en un `gtceu:data_stick` (`grindless:mars_chart`, catalizador de las piezas de nivel 2), y su misión abre con la primera señal de Sagitario A\*.
- **Invernadero: sin escalón EV.** En la Luna nada pide plantas: el O₂ sale de la celda. La cúpula sellada espera a una base que la necesite.
- **Lo de GTM:** EBF, reactor grande, torre, congelador, cámara limpia y turbinas grandes, tal cual.

### Descartadas

- **Torre de Ostwald:** el reactor grande de GTM ya hace `nitric_acid_from_elements` (N₂ + 3 H₂ + 4 O₂ → HNO₃) en un paso a HV, y los NOₓ (también los del reprocesado de IV) vuelven a nítrico con `nitric_acid_from_dioxide_1` y `_2`. Sería un cubo.
- **Estirador de cristales en la Luna** (boules con menos defectos): los cristales en microgravedad son de la fundición orbital de LuV (`viaje.md`), y un EBF con buena bobina ya va igual de rápido.
- **Cañón de masas:** AE2 ya mueve todo entre planetas; sería transporte duplicado. La idea se guarda para cuando la red tenga un límite que él supere.
- **Depósito de propelente:** la evaporación sería un castigo que tira trabajo; los tanques y AE2 guardan los fluidos.
- **Perforadora EV en la Tierra** (la del scratch, 3×6×3): la HV sobra. Su código pasa al trípode.
- **Cubos de GCYM y escotilla de paralelo:** IV, como estaba.

## Líneas de proceso nuevas

| Línea | Pasos | Subproductos → destino |
|---|---|---|
| Titanio lunar | trípode → ilmenita → celda, modo 2 (carga de CaCl₂, ánodo de platino) → lingote de titanio. En la Tierra, el Kroll de HV con ilmenita que baja por el puente | O₂: planta criogénica, traje o red. Hierro: acero de la base. CaCl₂: no se gasta |
| Regolito y volátiles | regolito → celda: modo 1 → He, He-3, H₂, N₂ y agua; modo 2 → O₂, Fe y Si; modo 3 → ladrillo sinterizado | He-3: reserva de fusión. He y N₂: planta criogénica. H₂: red de casa. Agua: se vacía. Si: paneles solares |
| Criogenia lunar | O₂, N₂ y He de la celda (o de casa por el puente) → planta criogénica, de noche a mitad de energía → oxígeno, nitrógeno y helio líquidos | Nitrógeno líquido: trípode (EV) y perforadora de Mercurio (IV). Oxígeno líquido: motores extremos (IV). Helio líquido: lingotes de 5 000 K (IV) |
| Platino | mena de sulfuro → macerador → lavadora → mena purificada → planta, ataque → lodo → planta, separación → Pt, Pd, Rh y Ru; EBF y congelador para los lingotes calientes | Ni y Cu: planta de mineral. H₂SO₄: lazo del sulfúrico. Ir/Os y residuo de iridio: se guardan |
| Nítrico y cloro | N₂ + 3 H₂ + 4 O₂ → HNO₃ (`nitric_acid_from_elements`, reactor grande); Cl₂ + H₂ → HCl; nítrico + sulfúrico → mezcla de nitración (GT--) | Agua: red. El cloro de la línea vuelve dentro de la planta |
| Circuitos nano | boule de fósforo (EBF) → obleas → grabado y corte en cámara limpia → chips NOR; CPU → oblea nano (reactor EV, 1 200 t) → procesador, ensamblaje y ordenador nano | Epoxi, ácidos y persulfato: lazos de HV. Las piezas no dejan restos |
| Atmósfera marciana | aire de Marte + agua → procesador (rutenio) → CH₄ + O₂ → mezclador → metalox → turbina de gas en Marte | O₂ sobrante: trajes. CH₄ sobrante: red de casa |
| Tungsteno (final) | scheelita + 2 000 mB de HCl → ácido túngstico (baño, 960 EU/t) → electrólisis (W + 2 000 mB de H₂ + 4 000 de O₂) → EBF de nicromo a 3 600 K → congelador. Acero de tungsteno: W + acero (mezclador EV) → EBF 3 000 K → congelador. RTM: Ru + W + Mo → EBF 3 000 K → bobina de 4 500 K | CaCl₂: carga de la celda. LiCl (del tungstato): litio. H₂ y O₂: red |
| Mezcla de metales | polvo de piedra → `stone_dust_separation` → mezcla → `metal_mixture_separation` (900 EU/t) → hematita, bauxita, pirolusita, baritina y cromita | Cada una a su línea; la baritina se guarda. La ilmenita sale de la receta |

## Almacenamiento y logística

- **Escotillas ME (EV)** en todas nuestras máquinas, por las mismas habilidades que los buses normales. En la Luna y Marte son el enlace con casa.
- **Super cofre y tanque EV** (campo generador MV): stock fuera de la red.
- **AE2:** la base sigue entera desde LV; los coprocesadores grandes de los addons, con circuitos EV (ya decidido). Los objetos ender cruzan planetas sin límite (decisión del usuario).

## Puerta a IV

| Qué se construye | Qué prueba |
|---|---|
| Casco IV (`gtceu:iv_machine_hull`: carcasa de placas de acero de tungsteno, cables de platino, PTFE) | tungsteno de Marte y platino de la planta, en lote |
| 8 ordenadores nano (`gtceu:nano_processor_computer`) | la línea nano entera |
| Bobina RTM (`gtceu:rtm_alloy_coil_block`) | rutenio de la planta, tungsteno de Marte y molibdeno del Nether |
| Motor IV y bomba IV | acero de tungsteno y cable de tungsteno de Marte, neodimio del Nether y grafeno |
| Base lunar 10 minutos sin tocarla: trípode, celda, planta criogénica y campo solar mandando titanio y líquidos a casa | la Luna automática |
| Base de Marte con el procesador y el trípode mandando scheelita por el par Tierra–Marte | Marte automático |
| Red entre planetas EV: segundo par lunar hecho por la base, troncal de 64 canales o más, 32 768 EU/t cruzando y el par de Marte | AE2 como columna del viaje |
| Central de 32 768 EU/t, 2 búferes y transformador EV→IV | "sin ir justo" |
| Planta de platino formada y corriendo con escotillas ME | la química fina y el multibloque como forma normal de producir |

Abre IV: casco y escotillas IV; motor, bomba, pistón, brazo y cinta IV; el cohete de nivel 3 a Venus y Mercurio y la mejora térmica del traje; las tierras raras y el deuterio de Marte; los radiactivos, el radón y las estrellas cuánticas; los sensores, emisores y campos generadores EV (piden radón y uranio); la línea de ensamblaje y la escotilla de paralelo.

## Validador

Reglas nuevas en `tools/analysis/tiers/ev.json`:

- **Titanio solo de la Luna.** Nada fuera de la cadena lunar da ilmenita, rutilo, TiCl₄ ni titanio. Fugas que se cortan: la ilmenita de `bauxite_vein_end` (se queda en la v0.4.1 y sale cuando llega la Luna) y el rutilo de `bauxite_sludge_centrifuge` (decididos), los subproductos de mena de la bauxita (rutilo) y del aluminio (ilmenita, rutilo) y una nueva, la ilmenita (5,75 %) de `metal_mixture_separation`. Ninguna otra mena de GTM los da (comprobado). El titanio del naquadah (Venus, IV) no rompe la regla: llega después y no es de la Tierra.
- **Tungsteno solo de Marte.** Scheelita y tungstato, solo en `veins_mars.json`: fuera la veta del End (decidido) y la de Venus de GCYR. Ninguna mena de GTM da tungsteno como subproducto (comprobado); revisar GT-- y GTCA.
- **Helio-3 de la Luna; samario y deuterio de Marte.** Fuera de la Tierra `helium_separation` y el He-3 del aire del Nether (con la Luna de HV), y ahora el samario de `rare_earth_separation` y el deuterio de `hydrogen_separation` y del aire de ender. En GTM solo la fusión gasta D, T y He-3 (verificar addons, como el reactor térmico de GTCA).
- **Nada de EV pide algo de IV.** Ni tungsteno antes de Marte (el cohete de nivel 2, el traje, el trípode y su broca, la antena y la mitad marciana van sin él), ni radiactivos ni ojo cuántico (sensores, emisores y campo generador EV se quedan en IV), ni circuitos IV, ni naquadah, iridio u osmio.
- **EV en dos subetapas.** El validador parte la era en *Luna* y *Marte*: nada del camino a Marte puede pedir tungsteno, samario ni deuterio.
- **Máquinas del sitio.** Toda receta de la celda, la planta criogénica, el campo solar, la antena y las vetas lunares lleva `.dimension('gcyr:luna')`; las del procesador y las vetas marcianas, `.dimension('gcyr:mars')`.

## Mods e integración

| Mod | Slug | Uso en EV |
|---|---|---|
| GCYR | `gcyr` | tanque y motor avanzados rehechos en EV con titanio (`integration/gcyr.js` los dejó sin tocar en HV); vetas de Marte nuestras; Venus y Mercurio suben a `rocket_tier` 3 por datapack (si no, el cohete de Marte llega y solo los para el calor, que se aguanta con pociones: verificar) |
| AE2 | `ae2` | sin cambios en la base: puente cuántico y túneles P2P de ME y de FE |
| GT-- | `gtnn` | su línea de platino viva es la que compone la planta |
| Waystones, FTB Essentials, FTB Chunks | `waystones`, `ftb-essentials`, `ftb-chunks-forge` | viajes entre planetas (verificar que crucen dimensión) y carga forzada de los dos extremos de cada puente |
| ExtendedAE, Expanded AE | `extended-ae`, `expanded-ae` | coprocesadores grandes con circuitos EV (ya decidido) |

Ningún mod nuevo: máquinas, tipos de receta, ítems, fluidos y reglas son KubeJS y datapack.

- **Startup:** tipos `pgm_refining`, `regolith_processing`, `cryogenic_processing` y `atmosphere_processing`; máquinas `platinum_plant`, `regolith_cell`, `cryogenic_plant`, `atmosphere_processor`, `ev_vein_drill` (trípode), `lunar_solar_array` y `deep_space_antenna` con el helper de patrones; bloques e ítems `sintered_regolith`, `molten_salt_charge`, `mars_chart`, `ruthenium_catalyst`, `platinum_electrode`, el panel de las alas, el material de tierras raras de Marte y las muestras de Marte; fluidos `liquid_nitrogen`, `methalox` y, si IV lo pide, `liquid_hydrogen`; textos en `en_us` y `es_es`.
- **Server:** recetas de los tipos nuevos; `veins_mars.json` con sus muestras; piezas avanzadas de GCYR; prohibiciones de combustión (Luna, Marte) y metalox; los cortes del *Validador*; dos filas en `mobs.json`.
- **Datos:** `pack/kubejs/data/gcyr/gcyr/planets/venus.json` y `mercury.json` con `rocket_tier` 3, y la generación de Marte con solo nuestras tres vetas.
- **Pruebas:** las dimensiones de GCYR, las condiciones de dimensión y de hora, el generador solar y el P2P entre planetas son mecanismo nuevo y se prueban en partida, en franjas nuevas (Luna X 2560–2623, Marte X 2816–2879, Y 98–112). Lo demás, con el validador `-Tier ev` partido en Luna y Marte.

## Misiones

Capítulo **"EV — Moonbase"** de la pestaña de eras, en inglés: unas 25 misiones cortas, con premio pequeño y sin bloquear recetas. Es el paso en el que se oye por primera vez el centro de la galaxia:

- **Abre** con la Luna ya pisada: "Titanium only exists up here. Make the Moon work without you."
- **La base:** campo solar, trípode, celda, ladrillo sinterizado y planta criogénica, con la ilmenita llegando a casa por un bus ME.
- **Una red, dos mundos:** escotillas ME, troncal, energía por el puente y el segundo par hecho por la base.
- **Química fina:** nítrico, planta de platino, ordenador nano y wither, sobre el borrador `scratch/ev-quests/ev_age.snbt` (sus textos cambian: el tungsteno ya no sale del End y la mezcla de metales no da ilmenita).
- **La cara oculta:** la antena. "With Earth's noise blocked by 3,474 km of rock, the antenna hears a steady hiss from Sagittarius: the heart of the galaxy, 26,000 light-years away. You will go there. Mars first."
- **Horizonte rojo:** carta de Marte, cohete de nivel 2, aterrizaje (misión de dimensión `gcyr:mars`), waystone, puente, procesador y trípode marciano.
- **Cierra** con el casco IV: "Mars gave you tungsten. Venus and Mercury burn. That's next."
- Ninguna misión nombra un multibloque que todavía no existe.

## Riesgos

- **GCYR en partida.** Fallos abiertos al lanzar y al cambiar de dimensión (#91, #122), que se están probando ahora; Marte depende de un segundo vuelo. Plan B: llave a Marte, como la del End, con las mismas reglas.
- **AE2 entre dimensiones.** Cada puente pide sus dos extremos cargados y tres mundos cargados pesan; la energía por P2P paga un impuesto de AE2. Si el rendimiento no aguanta, menos pares y convertidores de más amperaje.
- **Balance de la base lunar.** Titanio sin cloro con la energía del Kroll y líquidos a mitad de precio de noche. Si dejan sin sentido el Kroll o el congelador de casa, se recortan (el modo de titanio rinde menos; la rebaja de la noche baja). Nunca se toca el tiempo.
- **Fugas al quitar recursos de la Tierra.** Ti, W, He-3, Sm y D salen de recetas, subproductos de mena y addons. Una fuga rompe el viaje sin que se note en partida: solo la ve el validador.
- **Iridio, osmio, Venus y Mercurio.** La planta suelta la mezcla Ir/Os y el viaje pone Ir y Os en Mercurio; y el cohete de nivel 2 llega a Venus y Mercurio si no suben a nivel 3. Lo cierra IV; aquí la mezcla se guarda y se propone el nivel 3.

Créditos a anotar en `CREDITS.md`: celda de regolito (electrólisis de regolito fundido de la NASA y el MIT, y proceso FFC de Cambridge: física real), planta criogénica (radiadores al cielo nocturno: física real), procesador de atmósfera (MOXIE y reacción de Sabatier: real), campo solar (panel solar grande de TFG, solo la idea), antena (radiotelescopios en la cara oculta: real), piezas avanzadas y planetas (GCYR, LGPL-3.0). La torre de Ostwald, el estirador de cristales, el cañón de masas y el depósito de propelente quedan como alternativas descartadas.

## Decisiones propuestas

1. **EV = la Luna automática y Marte al final.** Titanio y helio-3 solo de la Luna; tungsteno, samario y hielo con deuterio solo de Marte. La puerta a IV es el acero de tungsteno.
2. **Tres multibloques nuevos:** celda de regolito y planta criogénica (Luna) y procesador de atmósfera (Marte). La planta de platino sigue como está en el scratch y presta electrodos y rutenio a los otros.
3. **Salen de la fila EV de `viaje.md`:** torre de Ostwald (GTM ya hace el nítrico en un paso), cañón de masas (AE2 ya transporta) y depósito de propelente (sería un castigo). El horno de volátiles es un modo de la celda. El estirador de cristales se descarta: es de LuV.
4. **Escalones de familia:** trípode EV (`gtceu:ev_vein_drill`: Luna y Marte, tope 64, broca de titanio, seco o con nitrógeno líquido, alas solares), campo solar lunar y antena de espacio profundo. Sin invernadero EV ni perforadora EV en la Tierra. La broca de acero de tungsteno pasa a IV.
5. **Red AE2, escalón EV:** escotillas ME en la Luna, troncal de P2P de ME, energía por P2P de FE con convertidores EV de 16 A, mitades lunares hechas por la base y el primer par Tierra–Marte.
6. **Marte con cohete de nivel 2 en EV:** tanque y motor avanzados de GCYR rehechos con titanio, carta de Marte como catalizador, 14 cubos y el traje de HV; la vuelta, por waystone. Venus y Mercurio suben a `rocket_tier` 3 (y Próxima b, que ya es 3, más arriba); IV hace sus piezas con el plugin de KubeJS de GCYR.
7. **Marte solo da lo suyo:** tres vetas (tungsteno, tierras raras con un material propio y hielo); las vetas comunes de GCYR salen de Marte.
8. **Reglas del sitio en EV:** en la Luna no arde nada, la criogenia de noche gasta la mitad, la luz es ×1,4 y no hay lodo (nitrógeno líquido); en Marte solo se quema con O₂ (metalox) y la luz es ×0,43.
9. **Cortes en la Tierra:** la ilmenita de `metal_mixture_separation`, el samario de `rare_earth_separation` y el deuterio de `hydrogen_separation` y del aire de ender.
10. **Iridio y osmio:** la mezcla Ir/Os y el residuo de iridio de la planta se guardan; su refino en la Tierra se quita o pide algo de Mercurio (lo fija IV).
11. **Siguen en IV:** radiactivos, radón y estrellas cuánticas; sensores, emisores y campo generador EV; GCYM y paralelo; motor de combustión grande (circuitos IV). El wither se hace en EV y su estrella se guarda.
12. **Energía y pruebas:** turbinas grandes de gas hasta 32 768 EU/t en la Tierra, campo solar con la Tierra de noche en la Luna y metalox en Marte. Lo que cambia de mecanismo se prueba en partida en franjas nuevas; lo demás, con el validador partido en Luna y Marte.

## Decisiones tomadas (orquestador, 2026-10-24)

Se aprueban las doce propuestas, con estas precisiones:

- **Broca de titanio.** En `v0.4.1` queda oculta y se convierte 1:1 en la de inox, porque HV no tiene titanio. EV la vuelve a mostrar como broca del trípode EV, con titanio lunar, y quita la conversión. Las brocas viejas vuelven a servir.
- **La perforadora lunar de HV y el trípode EV son de la misma familia.** El trípode EV cambia de forma y de piezas respecto al de HV, no solo de broca.
- **`viaje.md` se ajusta.** En la fila de EV salen la torre de Ostwald, el cañón de masas y el depósito de propelente, y entra la planta criogénica.
- **EV se construye cuando la Luna funcione en partida** (lo pidió el usuario). Lo que hay en el scratch se reaprovecha: planta de platino, perforadora EV y misiones EV.
