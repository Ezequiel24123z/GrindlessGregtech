# Era IV

IV es nuclear y abre los planetas interiores. Hasta EV la energía casi siempre se quemaba; en IV se diseña. El uranio del End se enriquece en la celda caliente y se monta en núcleos, y el reactor los quema sin humo, cría plutonio y deja tritio para la fusión. Eso ocupa el sitio de la primera fusión, que sigue en LuV. Con el cohete de nivel 3 y el traje térmico, IV va a la vez a Venus y a Mercurio: el naquadah sale solo de las vetas profundas de Venus, a 90 bar, y el iridio y el osmio solo de la corteza de Mercurio. Los dos alimentan LuV. IV trae también el kit para fabricar en serie: la línea de ensamblaje que pide a AE2, la escotilla de paralelo y los cubos de GCYM. El usuario lo dijo así: «Tungsteno, naquadah si existe y la primera fusión o lo que ocupe su lugar. Si el jugador sigue crafteando de uno en uno, el pack está mal.»

Se entra con lo que deja EV (`ev.md`): casco IV de acero de tungsteno (el tungsteno solo sale de Marte), la base lunar automática (titanio), el puesto de Marte (tungsteno, tierras raras, hielo con deuterio), la planta de platino, la planta criogénica, el cohete de nivel 2 y el traje de HV, el puente cuántico Tierra–Luna–Marte, estrellas del Nether del wither guardadas, ordenadores nano y una central de 32 768 EU/t con transformador EV→IV.

## Ruta

1. **Red IV y HSS-G.** Cortadora IV en cámara limpia → chips HPIC → escotillas IV (casco IV, 2 cables de W, 2 HPIC, bobina de voltaje IV y NaK; dos del mismo escalón suben un tier). HSS-G: mezclador EV (5 TS + Cr + 2 Mo + V → 9) → EBF de 4 200 K con bobina RTM → bobina `hssg_coil_block` (ensamblador IV: 8 hilos dobles de HSS-G, 8 láminas de WC y 144 mB de W) → EBF a 5 400 K.
2. **Uranio.** Con la broca de acero de tungsteno (`grindless:tungsten_steel_drill_bit`, que `ev.md` pasa a IV), las perforadoras de casa abren `pitchblende_vein_end`: pechblenda → uraninita, torio y plomo.
3. **Celda caliente.** Enriquecimiento (UF₆ en una pasada) y radón con el plutonio dentro → estrella cuántica (estrella del Nether + 1 250 mB de Rn) → campo generador IV (SmFeAsO, con samario de Marte).
4. **Reactor.** Núcleos LEU con agua ligera; con el agua pesada de Marte, el doble de energía y tritio. La central deja de ir justa.
5. **Traje térmico y cohete de nivel 3.** PBI (reactor IV) → tejidos aislantes de GCYR → mejora térmica del traje (ensamblador IV); sin ella, Venus (737 K) y Mercurio (440 K) matan. Motor y tanque de nivel 3 con acero de tungsteno y la carta de la antena de EV.
6. **Venus, a mano.** Muestra de naquadah, pila RTG de arranque, carcasas hechas allí, mitad del puente y motor térmico. Después, la perforadora presurizada.
7. **Mercurio, a mano.** Muestra de iridosmina, campo solar y pila RTG, mitad del puente y perforadora de lado nocturno.
8. **Naquadah.** Planta de naquadah → polvo → EBF de 5 000 K → lingote → boule (EBF de 5 400 K) → obleas de naquadah (8 obleas de CPU cada una, en cámara limpia).
9. **Iridio y osmio.** Planta de platino, modo 3 → Ir (EBF de 4 500 K) y Os (EBF a 30 720 EU/t: dos escotillas IV). Después, ruridit, HSS-S, NbTi y paladio chapado en rodio.
10. **En serie.** Sensor y emisor IV (iridio + estrella) → carcasas de control → línea de ensamblaje alimentada por AE2; escotilla de paralelo y GCYM.
11. **Salida.** El interferómetro saca la carta del sistema exterior. Casco LuV, motor LuV hecho por la línea y *Puerta a LuV*.

## Herencia de EV

- **Tungsteno (Marte).** Acero de tungsteno en cascos, carcasas, bidones y HSS-G. Sin el puesto de Marte, IV se para.
- **Titanio (base lunar).** NbTi y las placas de la mejora térmica. La base sigue sola.
- **Hielo con deuterio (Marte).** IV lo convierte en agua pesada (`ev.md`): moderador del reactor. El deuterio, que en la Tierra ya no sale, se guarda para la fusión.
- **Helio de la Luna.** Helio líquido para enfriar los lingotes calientes de naquadah (5 000 K).
- **Tierras raras (Marte).** Samario: SmFeAsO, el superconductor de IV, e imanes de LuV.
- **Planta de platino.** Pt, Pd, Rh y Ru como hasta ahora, y gana el modo 3. El Pd hace el Pd/C del naquadah enriquecido.
- **Planta criogénica y torre de Ostwald.** Nitrógeno líquido (perforadora de Mercurio de día), LOX y LH₂ (cohete), HNO₃ (reprocesado).
- **Wither, nano, antena y AE2.** Estrellas del Nether → estrellas cuánticas; ordenadores nano → mainframes de LuV; la antena de espacio profundo (`gtceu:deep_space_antenna`) escribe la carta de Venus y Mercurio; la red de EV (troncal de P2P, energía como FE y pares que hace la base) es de donde crece la de IV.

## Venus y Mercurio

- **Cohete de nivel 3.** GCYR trae Venus y Mercurio en nivel 2, como Marte (verificado en el jar); `ev.md` los sube a 3 por datapack para que el cohete de Marte no llegue. GCYR calcula el nivel como (motor + tanque) / 2, e IV hace las dos piezas de nivel 3 con el plugin de KubeJS de GCYR (`grindless:iv_rocket_motor` y `grindless:iv_fuel_tank`, verificar): tanque = 2 bidones de acero de tungsteno + 6 placas de kapton K + marco de TS (lo que GCYR pedía para el avanzado); motor = 4 propulsores avanzados + 2 motores IV + 6 placas de kapton K + marco de TS. Ensamblador IV, con la carta de la antena como catalizador. El élite de GCYR (ZPM) queda para más adelante.
- **Traje.** La puerta del viaje es la mejora térmica de GCYR (`gcyr:space_suit_thermal_upgrade_smithing_template`, ensamblador a 7 680 EU/t: 3 tejidos de escudo térmico, 3 tejidos aislantes con PBI, 2 placas de titanio y 2 láminas de kapton K). En la primera visita basta el depósito del peto. En las bases, el esparcidor de oxígeno IV de GCYR (`gcyr:iv_oxygen_spreader`, verificar receta).
- **Primera visita, a mano.** Se baja con una pila RTG, un ensamblador IV y piezas de casa. Se pican dos menas de la veta para la muestra, se hacen allí las carcasas del sitio y la mitad del puente, y se deja un Waystone. Después se viaja gratis.

| | Venus | Mercurio |
|---|---|---|
| Entorno (GCYR) | 737 K, CO₂ a 92 bar, nubes de H₂SO₄, sin O₂, superficie oscura (luz 6) | 440 K de día, vacío, luz 19 (×6,7 en la tabla de planetas) |
| Reglas | sin combustión; el calor multiplica el refrigerante; la solar no rinde | sin combustión ni lodo (vacío); de día la broca se quema sin nitrógeno líquido |
| Energía del sitio | motor térmico: el calor del suelo contra un radiador alto | campo solar de día; pila RTG o búferes de noche |
| Solo sale de allí | naquadah (veta profunda) | iridosmina: iridio y osmio |
| Piezas hechas allí | carcasa presurizada de regolito venusiano (`gcyr:venusian_regolith`) | carcasa de escudo térmico de roca de Mercurio (`gcyr:mercury_rock`) |
| Además | colector de gases: CO₂ abajo y ácido sulfúrico en las nubes (condición de altura) | antena del interferómetro |

Las carcasas de sitio salen de recetas con `.dimension(...)`: hay que ir y montarlas allí. Las vetas de GCYR en Venus y Mercurio salen de la generación (la de tungstotitanato daría tungsteno fuera de Marte), y `gtceu:naquadah_vein` pasa del End a Venus (`GTCEuServerEvents.oreVeins`).

Lo que se monta allí, y solo trabaja allí: en Venus, la perforadora presurizada (que también sirve en Marte), el motor térmico, el colector de gases (sus recetas de Venus) y una mitad del puente; en Mercurio, la perforadora de lado nocturno, el campo solar, la antena del interferómetro y otra mitad del puente. Las pilas RTG valen en cualquier sitio. El detalle está en *Escalones de familia*.

## Generación automática de recursos

| Recurso | De dónde | Máquina |
|---|---|---|
| Naquadah (y Pu-239 de la misma veta) | veta profunda de Venus | perforadora presurizada |
| Iridio y osmio | veta de iridosmina de Mercurio (`gtceu:iridosmine`, material nuevo, verificar) | perforadora de Mercurio → planta de platino |
| Uranio, torio y plomo | `pitchblende_vein_end` con broca de acero de tungsteno; torio también del berilio del Nether | perforadoras de casa |
| Agua pesada y deuterio | hielo de Marte (`ev.md`) | torre de destilación de GTM (receta nuestra) |
| Pu-239, tritio, Xe, Kr, Cs y Nd | cría, moderador y reprocesado | reactor y celda caliente |
| Radón | uranio + aire, con el plutonio dentro; también el aire del End | celda caliente; colector grande de Extended Features |
| CO₂ y H₂SO₄ | aire y nubes de Venus | colector de gases de GTM |

Cierra el círculo: muestras, brocas y agua, sin más viajes. Los cinco mundos mandan a la misma red. No hay invernadero IV ni criatura nueva: el simulador acaba en EV.

## Multibloques nuestros

### Reactor de núcleos diseñados: `gtceu:fission_reactor` (el de la era)

Qué gana: **la energía de IV sin quemar nada, con un reactor que GTM no tiene.** GTM 7.5.3 no trae fisión y DeaFission no carga. El reactor convierte un ciclo de combustible (enriquecer, montar, quemar y reprocesar) en energía constante, cría plutonio y deja tritio para la fusión.

- **Tipo:** `gtceu:fission_core`, un generador (verificar `generator(true)` en KubeJS y los dinamos IV de 16 A). Cada receta es un núcleo diseñado: combustible por moderador. Los ciclos son de 20 s. El ensamblaje se gasta por azar (0,5 % por ciclo, unos 67 min) y el gastado sale con la misma probabilidad. El agua de refrigeración (2 000 mB por canal y ciclo) se pierde en la torre.

| Núcleo | Entra, además del agua | EU/t por canal | Sale |
|---|---|---|---|
| LEU, agua ligera | ensamblaje LEU | 16 384 | gastado |
| LEU, agua pesada | ensamblaje LEU + 5 mB de agua pesada por ciclo (el moderador se activa) | 32 768 | gastado + 5 mB de tritio |
| MOX, agua pesada | ensamblaje MOX (quema plutonio) + 5 mB de agua pesada | 32 768 | gastado + 5 mB de tritio |
| Reproductor | núcleo de Pu con manto de U-238 | 8 192 | gastado con más Pu del que entró |

- **Canales:** hasta 4 a la vez (paralelo nuestro, como `bores`). Un reactor lleno con agua pesada da 131 072 EU/t: la central de la puerta.
- **SCRAM, no explosión:** si falta agua o el bus de gastados está lleno, se para al acabar el ciclo. Fallar cuesta material, nunca progreso (la campaña de Grindless).
- **Estructura:** vasija de carcasa a prueba de radiación (`gtnn:radiation_proof_machine_casing`: plomo denso, marco de TS y hormigón; ensamblador IV), 4 canales de tubería de TS, sala de turbinas (`gtceu:tungstensteel_turbine_casing`) y respiraderos; buses de ensamblajes y de gastados, escotillas de agua, moderador y tritio, y dinamos IV. Admite escotillas ME.
- **Se fabrica con:** casco IV, campo generador IV (la celda caliente va antes), 2 bombas IV y 4 circuitos IV.
- **Subproductos:** gastados → celda caliente. Tritio → se guarda para la fusión. Agua → torre.
- **Cifras a ajustar:** un LEU con agua pesada da unos 2,6 G EU, frente a lo que cuesta montarlo. Si no cuadra, bajan los canales y los motores extremos completan la central.

### Celda caliente: `gtceu:hot_cell`

Qué gana: **lo radiactivo no pasa por las manos, y hace dos recetas imposibles en pequeño.** GTM marca como radiactivos el uranio, el plutonio, el radón y el tritio; aquí entran por buses y salen a la red. El circuito elige el modo. El 1 y el 4 se componen con las recetas vivas, con la misma energía y rendimiento, como la planta de platino de EV; el 2 y el 3 son nuestros.

1. **Enriquecimiento:** 3 uraninita + 4 000 mB de HF → 0,1 U-235 + 0,9 U-238 + 2 000 mB de agua + 4 000 mB de F₂ (etapas `uranium_hexafluoride`, `uranium_hexafluoride_separation` y las dos electrólisis). El UF₆ no sale y el flúor vuelve: la celda devuelve más F₂ del que pide.
2. **Combustible:** ensamblajes LEU (U-235 + U-238 + O₂, con vaina de lámina de TS), MOX (Pu + U-238) y reproductor; pastillas RTG (óxido de plutonio); fuente de neutrones de Pu-Be (`grindless:pube_neutron_source`, con berilio del Nether).
3. **Reprocesado** (PUREX): gastado + HNO₃ → U-238 y Pu-239 de vuelta + Xe, Kr, Cs y Nd + NOₓ para la torre de Ostwald + residuo vitrificado (`gtnn:radioactive_waste`, un ítem de GT-- sin uso).
4. **Radón:** U-238 + 10 000 mB de aire → 1 000 mB de Rn (`radon_from_uranium_238`). Los 8 lingotes de plutonio que GTM devuelve en polvo se quedan dentro como catalizador, y se acaba el lazo polvo → lingote.

- **Estructura:** celdas de carcasa a prueba de radiación, ventanas de vidrio laminado y manipuladores; 1 o 2 escotillas IV; admite ME.
- **Se fabrica con:** casco IV, centrífuga, reactor químico y electrolizador IV, 2 brazos IV y 4 circuitos IV.
- **Subproductos:** F₂ → el HF de la planta de naquadah. Xe → naquadah enriquecido. Kr y Nd → gases nobles e imanes. Cs → se guarda para la naquadria (ZPM). Residuo → se guarda contenido y nunca se vacía. Torio → se guarda; plomo → carcasas.
- **Recortable:** sin reprocesado ni reproductor queda lo esencial: enriquecer, LEU y radón.

### Planta de naquadah: `gtceu:naquadah_plant`

Qué gana: **la ventana de neutrones sin manos y el superácido dentro.** La línea viva es la de GT--, al estilo de GTNH: el óxido de naquadah solo da naquadah en el activador de neutrones de GT--, que pide mantener la energía de los neutrones en una ventana (220–230 MeV el naquadah, 460–480 el enriquecido y 1 050–1 100 la naquadria) con aceleradores y polvo de grafito o berilio. La planta compone las etapas vivas y cambia la ventana por la fuente de Pu-Be en el bus (se gasta por azar, ≈ 1 % por tanda) más el EU de los aceleradores (cifras a ajustar).

1. **Naquadah** (circuito 1): `neutron_activator/naquadah` (4 óxido + 6 000 mB de HSbF₆ → 2 naquadah + 2 TiF₃ + Ga al 50 %), `fluoroantimonic_acid`, `antimony_trifluoride` y `titanium_trifluoride_separation` (EBF de 1 941 K → titanio + HF). Por cada 2 de naquadah entran unos 15 polvos de Sb₂O₃ (6 de antimonio) y unos 40 000 mB de flúor como HF; el H₂ y el HF de las etapas vuelven dentro.
2. **Enriquecido** (circuito 2; receta de LuV, con dos escotillas IV y cámara limpia; verificar que GTM la da a un multibloque): óxido enriquecido → sulfato de naquadah enriquecido. Etapas: reactor (1 920 EU/t), hexafluoruro (7 680), xenón (cámara limpia), planta química de GT-- (30 720, con Pd/C y AuF₃), mezclador con H₂SO₄ y activador. El residuo pasa por el deshidratador y la electrólisis, que devuelven Xe, Au, SbF₃ y HF.

- **Estructura:** carcasa inerte (PTFE) ≥ 40, tubos de PTFE, cámara de activación de carcasa a prueba de radiación y vidrio laminado; bus de entrada (óxido, Sb₂O₃ y fuente), bus de salida, 3 escotillas de entrada (HF, H₂ y H₂SO₄) y 1 o 2 escotillas IV; admite ME.
- **Se fabrica con:** casco IV, reactor químico, mezclador y centrífuga IV, 2 bombas IV y 4 circuitos IV.
- **Subproductos:** titanio → al lazo del titanio (ver *Decisiones*). Galio → arseniuro de galio de la boule. Sulfato enriquecido y sulfuro de trinio → se guardan para los EBF de 7 000 y 7 200 K (LuV). Solución de naquadria (radiactiva) → se guarda contenida hasta ZPM.
- **Por qué no es un cubo grande:** ninguna máquina de GTM junta activador, reactores y EBF; la energía es la suma de las etapas, y pide flúor, antimonio y la fuente de la celda caliente.
- **Recortable:** el modo 2 pasa a LuV; sin la planta queda la línea suelta de GT-- con su activador.

### Escalones de familia

- **Perforadora presurizada** (`gtceu:pressurized_vein_drill`): pozo cerrado contra la presión, camisa de tubos de TS, carcasa inerte contra el ácido y carcasa presurizada de regolito. En Venus (`.dimension('gcyr:venus')`) corre la veta de naquadah con broca de acero de tungsteno; en vez de lodo usa agua destilada, que sale como vapor: es el impuesto del calor (cuatro veces lo que pide el lodo), y el vapor es inerte (se tira o mueve una turbina). En Marte corre sus tres vetas con filtros de polvo: es el equipo presurizado que `ev.md` dejó para IV. Tope de 128 en `bores` (el trípode, 64).
- **Perforadora de Mercurio** (`gtceu:mercury_vein_drill`): baja, bajo un parasol de escudo térmico y con radiadores. De noche perfora en seco y la broca de acero de tungsteno se gasta el doble; de día solo trabaja con nitrógeno líquido (verificar que el Mercurio de GCYR tiene noche; si no, siempre lo pide). Veta de iridosmina.
- **Energía de sitio** (sigue a la torre solar de espejos de LV y al campo solar lunar de EV, `gtceu:lunar_solar_array`):
  - **Motor térmico de Venus** (`gtceu:venus_heat_engine`): placa caliente en el suelo y una chimenea de radiadores de 16 bloques hacia las nubes, que es el foco frío. Con `.dimension('gcyr:venus')`, 200 mB de agua destilada por ciclo de 20 s → 8 192 EU/t, de día y de noche. Fuera de Venus no hay ese calor.
  - **Campo solar de Mercurio** (`gtceu:mercury_solar_field`): el campo lunar con parasol de escudo térmico. De día rinde ×6,7 (la Luna, ×1,4); de noche, nada.
  - **Pila RTG** (`gtceu:rtg`, máquina de un bloque; verificar el generador sencillo de KubeJS): pastilla de óxido de plutonio que se gasta por azar (≈ 1 por hora) → 2 048 EU/t constantes. Arranca cada base y cubre la noche de Mercurio.
- **Observatorio, escalón 5: interferómetro** (`gtceu:interferometer`): la antena de Mercurio (noche y vacío) junta sus datos con los de la antena de espacio profundo de la Luna por la red. Da la carta del sistema exterior (el cinturón y Júpiter, el viaje de LuV) y la primera señal de Sagitario A*.
- **Planta de platino, modo 3** (circuito 3): iridosmina → Ir + Os con la cadena viva de GT-- (`rarest_metal_residue_ebf`, destilación del OsO₄ y `osmium_dust_completion`; `iridium_metal_residue_process` → IrO₂ → ácido de iridio → `iridium_chloride` → `iridium_chloride_separation` con calcio). La etapa de entrada es nuestra: iridosmina + salitre + salmuera (EBF de 775 K) → mezcla rarísima, como `rarest_metal_residue`, ajustada para dar 3 Ir por cada Os. El OsO₄ y el Cl₂ no salen, y el CaCl₂ va a electrólisis. Admite la escotilla de paralelo.

### Descartadas

- **Fundición solar de Mercurio** (`viaje.md`): fundir osmio con sol se saltaría la receta de LuV del osmio. El iridio y el osmio se refinan en casa. Queda de plan B si la base de Mercurio se queda corta.
- **Recolector de nubes como multibloque:** lo hace el colector de gases de GTM con condición de altura.
- **Satélite de prospección:** pasa a LuV, donde empiezan las órbitas sin bajar. En IV la muestra se pica a mano.
- **Cúpula sellada en Marte** (propuesta de `ev.md`): ninguna base de IV pide plantas; espera a la que las pida.
- **Fisión externa y activador propio:** DeaFission no carga, y el activador de GT-- se queda suelto.
- **Fábrica de componentes** (Star Technology, MIT; línea de componentes de GT--): síntesis en una caja. Plan B de LuV.

## La fisión, y lo que no es fisión

- **La fisión nuestra es la energía de IV** y ocupa el sitio de la primera fusión. La Mk1 de GTM (`gtceu:luv_fusion_reactor`: 4 circuitos ZPM, 64 UHPIC, placas dobles de Pu-241 y de osmiridio, y 2 campos IV) se queda en LuV; IV guarda su combustible.
- **Reactores de naquadah de GT--** (`gtnn:*_naquadah_reactor`, de EV a UV): se quedan como están. Queman naquadah enriquecido o naquadria (del I, a 2 048 EU/t, al V, a 524 288), que salen de EBF de 7 000 K o más, así que en la práctica son la energía nuclear de LuV en adelante. El grande (ZPM) quema los combustibles líquidos excitados.
- **Motores extremos de GTM:** la alternativa sin uranio (circuito LuV, LOX y gasolina de alto octanaje).
- **Radiación:** el traje antirradiación sigue siendo obligatorio (regla de MV); con la celda caliente y AE2 no hace falta tocar nada.

## Nada de uno en uno

- **Línea de ensamblaje desde AE2.** El controlador lleva casco IV, 2 brazos IV, 4 carcasas de control y 2 circuitos IV. Cada carcasa de control lleva sensor y emisor IV (iridio y estrella cuántica), y la carcasa de la línea un engranaje de ruridit: sin Mercurio no hay línea. Los buses de ítems son ULV de un hueco y van en orden (verificado en `GTMultiMachines`). Por eso cada corte lleva un bus de exportación de AE2 fijado a su ingrediente y frenado por un emisor de nivel; los fluidos entran por escotillas 1× (hasta 4) y la salida va a un bus ME. Cada línea hace un producto en continuo. La investigación usa el escáner (barra de datos).
- **Escotilla de paralelo IV (×4):** sensor, emisor, 4 circuitos IV (decidido: GTM pide LuV), casco IV y 2 cables dobles de platino. La aceptan GCYM, los cubos de addons y nuestras plantas (celda caliente, planta de naquadah y planta de platino). El reactor ya tiene sus canales.
- **GCYM en IV:** circuitos IV, la máquina IV del mismo tipo y piezas de TS o WC (verificado en `GCYMRecipes`). `large_packer` y `alloy_blast_smelter` suben a IV; el mezclador grande pide un rotor de osmiridio (LuV). El megarreactor y el megacracker de GTCA y la Maceration Stack de GT-- llegan en IV (decidido).
- **Dos escotillas IV = LuV:** osmio, oblea UHPIC y modo 2 del naquadah. Los ensambladores grandes de GCYM llevan una sola escotilla.
- **Plan B:** la Expanded Assembly Line de Extended Features (acepta buses ME) con controlador tipo GCYM. La línea de componentes de GT-- sigue sin receta.
- **Cofre y tanque cuánticos IV:** el stock de las líneas, fuera de la red.

## AE2 entre planetas: el paso de IV

EV deja la troncal de túneles P2P de ME, la energía como FE con convertidores de GTM (32 768 EU/t cruzando) y los pares que hace la base. IV sube un escalón:

- **Dos pares más,** Tierra–Venus y Tierra–Mercurio. Su mitad lejana se monta allí en la primera visita y los dos lados van con chunks cargados (FTB Chunks).
- **EU sin convertir:** túneles P2P de EU (`eup2p`) por el puente en lugar de FE con convertidores, sin el impuesto de AE2 y al amperaje de IV (verificar que cruzan dimensiones). Objetivo: 131 072 EU/t cruzando. El motor térmico manda a casa lo que sobra y el reactor cubre la noche de Mercurio.
- **Capacidad:** MEGA (procesador del ensamblador de circuitos IV) y los coprocesadores de 32k de Expanded AE. La red guarda y fabrica con lo que llega de cinco mundos.
- **La red alimenta la línea:** los buses de exportación de cada corte piden a todos los planetas a la vez.

## Líneas de proceso nuevas

| Línea | Pasos | Subproductos → destino |
|---|---|---|
| Ciclo del uranio | pechblenda → centrífuga (uraninita, torio y plomo) → celda: UF₆ y cascada → U-235 y U-238 → ensamblajes → reactor → gastados → reprocesado | F: lazo dentro de la celda. Pu y U: vuelven. Xe, Kr, Cs y Nd: ver la celda. Residuo: contenido |
| Radón y estrella | celda, modo 4 → radón → baño químico: estrella del Nether + 1 250 mB → estrella cuántica; ojo de ender + 250 mB → ojo cuántico | Pu: no sale de la celda |
| Naquadah | Venus → planta de mineral → óxido → planta de naquadah → polvo → EBF de 5 000 K → lingote → boule (EBF de 5 400 K) → obleas; UHPIC (reactor grande, dos escotillas IV, 576 mB de naquadah fundido) | Ti y Ga: ver la planta. Óxido enriquecido (28 % de la mena): modo 2, o se guarda |
| Iridio y osmio | Mercurio → iridosmina → planta de platino, modo 3 → Ir (EBF de 4 500 K) y Os (EBF, dos escotillas IV) → ruridit (2 Ru + Ir), HSS-S (6 HSS-G + 2 Ir + Os) y osmiridio (LuV) | OsO₄ y Cl₂: dentro. Lodo de platino: oro y sílice |
| Superconductores IV | samario (Marte) → SmFeAsO (mezclador IV); niobio (pirocloro y tantalita) + titanio → NbTi; 3 Pd + Rh → paladio chapado en rodio | — |
| Agua pesada | hielo de Marte → agua (cinco veces más deuterio) → torre de destilación (receta nuestra) → agua pesada (`grindless:heavy_water`, verificar) → reactor; electrólisis → deuterio | Agua ligera: a la red. O₂: aire. Tritio del reactor: fusión |
| Traje | PBI (reactor IV; el fenol vuelve), kapton K y para-aramida (GCYR), fibra de vidrio → tejidos → mejora térmica | Fenol y HCl de la aramida: lazos |
| Venus | colector: CO₂ abajo y ácido sulfúrico en las nubes | CO₂: invernaderos. H₂SO₄: naquadah enriquecido y planta de platino |

## Misiones

Capítulo **«IV — Inner Planets»**, en inglés, con unas 22 misiones de premio pequeño que no bloquean recetas. Se abre con lo que ve el observatorio de EV: el brillo de Mercurio pegado al Sol y las nubes de Venus. Se cierra con el interferómetro, que da la carta del cinturón y de Júpiter y, por primera vez, una fuente de radio en el centro de la galaxia: Sagitario A* (así se descubrió en 1974). El objetivo final aparece en el cielo, y ninguna misión promete una máquina que aún no existe.

- **Casa:** *Hotter Steel* (bobina de HSS-G), *Yellowcake* (pechblenda), *Behind Lead Glass* (celda caliente), *Cascade* (U-235), *First Core*, *Criticality* (reactor), *Heavy Water* (tritio) y *Quantum Star*.
- **Viaje:** *Heat Shield* (mejora térmica), *Under the Clouds* y *Ninety Bar* (Venus y su perforadora), *Heat Engine*, *Day of Fire* y *Night Shift* (Mercurio) y *Five Worlds, One Network* (puentes).
- **Salida:** *Naquadah*, *Iridium and Osmium*, *Sensors and Emitters*, *The Line* (motor LuV desde AE2), *Parallel*, *The Dark Heart* (Sagitario A*) y *Gate to LuV*.
- **Referencias:** las misiones de línea de ensamblaje y nucleares de Star Technology (MIT) y Monifactory (LGPL) se adaptan con atribución; de GTNH, solo ideas.

## Puerta a LuV

| Qué se construye | Qué prueba |
|---|---|
| Casco LuV (`gtceu:luv_machine_hull`: carcasa de paladio chapado en rodio, 2 cables de NbTi y PTFE) | Pd y Rh de la planta de platino, niobio y titanio lunar |
| Motor LuV hecho por la línea de ensamblaje desde la red, sin tocar nada | Mercurio (HSS-S y ruridit), Marte (imán de samario), AE2 y la investigación |
| Oblea UHPIC (reactor grande con dos escotillas IV, en cámara limpia) y un lingote de naquadah | Venus y el truco de las dos escotillas |
| Un lingote de osmio (EBF a 30 720 EU/t) | Mercurio y la receta de LuV |
| 4 mainframes nano en la red | la línea nano en lote |
| 131 072 EU/t sostenidos (un reactor lleno, o reactor y motores extremos), 2 búferes y transformador IV→LuV | la fisión ocupa el sitio de la fusión |
| Guardados: tritio (moderador), deuterio (Marte), Pu-241 (centrífuga del plutonio) y 2 campos generadores IV | la fusión Mk1 de LuV |
| Escotilla de paralelo IV en una planta nuestra | la producción en serie |
| Bases de Venus y Mercurio 10 minutos sin tocarlas, con su energía y sus puentes | las bases se sostienen solas |
| Carta del sistema exterior (interferómetro) | el viaje siguiente |

Abre LuV: casco, escotillas y componentes LuV (línea de ensamblaje); mezclador y ensamblador LuV (osmiridio, y bobina de naquadah de 7 200 K con hilo de naquadah y láminas de osmio); naquadah enriquecido y trinio; paralelo ×16 y mezclador grande; la fusión Mk1; los reactores de naquadah de GT--; y el viaje al cinturón de asteroides y a las lunas de Júpiter.

## Validador (`-Tier iv`)

- **Naquadah solo de Venus.** Toda receta que dé naquadah, naquadah enriquecido, naquadria o sus óxidos sale de la veta de Venus: ninguna veta en el End y ninguna abeja (salen el panal de naquadah y la abeja que se hace en el EBF con un bloque de naquadah). Las aleaciones de GTCA que se descomponen en naquadah lo piden antes: son lazos.
- **Iridio y osmio solo de Mercurio.** El platline de la Tierra deja de dar `iridium_metal_residue` y `rarest_metal_mixture` (en el centrifugado del lodo y en `rarest_metal_residue`, que se queda con el rutenato). Sin abeja de osmio. La espuma de platino de GTCA es de ZPM. Las descomposiciones (HSS-S, ruridit, osmiridio y aleación de naquadah) son lazos.
- **Tungsteno solo de Marte:** sin la veta de tungstotitanato de Venus.
- **Titanio:** de la Luna y, desde IV, también el del TiF₃ del naquadah de Venus (excepción declarada).
- **IV en tres subetapas:** casa, Venus y Mercurio, como EV se parte en Luna y Marte. Nada del camino a Venus y Mercurio (cohete de nivel 3, mejora térmica, carcasas de sitio y mitades del puente) pide naquadah, iridio ni osmio.
- **Nada de IV pide algo de LuV:** ni metales de asteroide, ni cultivos de Europa, ni productos de EBF de 7 000 K o más (naquadah enriquecido, trinio), ni de fusión (europio, americio).
- **La puerta se fabrica** solo con lo que dan IV y las eras anteriores.

## Mods e integración

| Mod | Slug | Uso en IV |
|---|---|---|
| GCYR | `gcyr` | motor y tanque de nivel 3 con su plugin de KubeJS (Venus y Mercurio en nivel 3: datapack de `ev.md`), mejora térmica (IV) y esparcidor IV; fuera las vetas de Venus y Mercurio |
| GT-- | `gtnn` | línea de naquadah viva (la planta la compone), activador suelto, reactores de naquadah (LuV), carcasa a prueba de radiación y residuo radiactivo |
| Productive Bees | `productivebees` | fuera las abejas de naquadah y de osmio |
| MEGA Cells, Expanded AE | `mega`, `expanded-ae` | IV (decidido) |
| EU P2P Tunnel | `eup2p` | energía entre planetas como EU, sin convertidores |
| GTM Extended Features | `gtm-extended-features` | colector grande (aire del End: Rn y Xe); Expanded Assembly Line de plan B |
| Waystones, FTB Chunks, FTB Essentials | `waystones`, `ftb-chunks-forge`, `ftb-essentials` | viajes gratis y bases cargadas |

Ningún mod nuevo.

- **Startup:** tipos `fission_core`, `hot_cell` y `naquadah_refining`; máquinas `fission_reactor`, `hot_cell`, `naquadah_plant`, `pressurized_vein_drill`, `mercury_vein_drill`, `venus_heat_engine`, `mercury_solar_field`, `interferometer` (los multibloques, con el helper de patrones) y `rtg`; material `gtceu:iridosmine` y fluido `grindless:heavy_water` (verificar si EV ya lo trae); motor y tanque de nivel 3 (plugin de GCYR); ítems de ensamblajes, gastados, pastilla RTG, fuente de Pu-Be, carcasas de sitio y muestras; modificador de canales del reactor.
- **Server:** recetas compuestas desde las vivas (celda, modos 1 y 4; planta de naquadah; platino, modo 3) y las nuestras en tablas. Vetas: `naquadah_vein` a Venus, iridosmina en Mercurio, fuera las de GCYR en Venus y Mercurio, `veins_venus.json` y `veins_mercury.json`, y pechblenda con la broca de acero de tungsteno. Platline sin Ir/Os, abejas fuera y condiciones de dimensión, altura y noche.
- **Config:** nada nuevo. Venus y Mercurio entran en la tabla de planetas de EV.
- **Pruebas:** (1) arranca; (2) reactor, celda caliente y planta de naquadah se forman y procesan (franjas de planta y multibloques IV); (3) en Venus y Mercurio (franjas nuevas tras las de EV: Venus X 3072–3135 y Mercurio X 3328–3391, Y 98–112) las perforadoras, el motor térmico y el campo solar se forman y solo trabajan allí, y el cohete de nivel 3 llega; y `-Tier iv` sin huérfanas.

## Riesgos y dudas

- **La fisión en KubeJS.** El generador multibloque, los dinamos de 16 A y el paralelo de canales están sin probar, y el balance de EU por ensamblaje es nuestro. Plan B: los motores extremos llevan la central.
- **La línea de GT--.** Componer el activador sin su ventana, la etapa en cámara limpia del modo 2 y el gasto de antimonio y flúor. Plan B: solo el modo 1, o la línea suelta con el activador.
- **GCYR en Venus y Mercurio.** El calor y la mejora térmica, las piezas de nivel 3 por el plugin de KubeJS, los fallos de lanzamiento y de cambio de dimensión (#91 y #122), mover vetas y quitar las de GCYR, y saber si Mercurio tiene noche. Hay que probarlo en partida antes de cerrar IV.
- **Iridio y osmio solo de Mercurio.** El material nuevo y el corte del platline cambian la planta de platino de EV. Plan B: menas de iridio y osmio de GTM en la veta y la planta de mineral, sin modo 3.
- **Cinco mundos cargados.** Bases con chunks cargados en la Luna, Marte, Venus y Mercurio, más P2P de EU entre dimensiones: hay que vigilar el TPS con spark.

Créditos a anotar en `CREDITS.md`: reactor de núcleos diseñados (campaña de Grindless, T5, MIT, del usuario; física real: PWR, CANDU, MOX y reproductores); celda caliente (idea del PUREX de Gregicality legacy, solo la idea; física real); planta de naquadah (línea viva de GT--, licencia por comprobar; idea de GTNH); iridosmina, motor térmico de Venus, RTG e interferómetro (física e historia reales: Sagitario A*, 1974); traje y cohetes (GCYR, LGPL-3.0); fundición solar y satélite de prospección como alternativas aplazadas.

## Decisiones propuestas

1. **IV es la era nuclear.** Un reactor de fisión nuestro, de núcleos diseñados, ocupa el sitio de la primera fusión, que sigue en LuV (la de GTM). Los motores extremos quedan de alternativa. Cambia la central de 4 motores extremos de la versión anterior.
2. **Tres multibloques nuevos:** reactor, celda caliente y planta de naquadah. La planta lee las recetas vivas de GT-- y cambia la ventana del activador por una fuente de Pu-Be; su modo 2 (enriquecido) es una receta de LuV con dos escotillas IV.
3. **Escalones de familia:** perforadora presurizada (Venus, y Marte con filtros de polvo) y de Mercurio (de lado nocturno), con broca de acero de tungsteno y tope 128; motor térmico de Venus y campo solar de Mercurio; pila RTG; interferómetro; y el modo 3 de la planta de platino. En casa no hay perforadora IV: la broca de acero de tungsteno abre la pechblenda en las de antes.
4. **Naquadah solo de Venus:** `gtceu:naquadah_vein` pasa del End a Venus (generación y tabla) y salen las abejas de naquadah.
5. **Iridio y osmio solo de Mercurio:** material nuevo `gtceu:iridosmine` en una veta de Mercurio. El platline de la Tierra deja de soltar la mezcla Ir/Os y el residuo de iridio, así que se cierra la duda 10 de `ev.md`: no hay nada que refinar en la Tierra. Salen las abejas de osmio.
6. **Viaje:** Venus y Mercurio en nivel 3 (datapack de `ev.md`), con motor y tanque de nivel 3 hechos en IV con el plugin de KubeJS de GCYR y la carta de la antena; la mejora térmica de GCYR (IV) es la otra mitad de la puerta. La primera visita es a mano, con pila RTG y carcasas hechas allí; después, Waystones. Las vetas de GCYR en Venus y Mercurio salen.
7. **AE2 en IV:** pares a Venus y Mercurio, energía como EU por P2P (`eup2p`) en lugar de FE con convertidores, 131 072 EU/t cruzando, MEGA y coprocesadores de 32k de Expanded AE.
8. **Producción en serie:** línea de ensamblaje con un bus de exportación de AE2 por corte, paralelo IV con circuitos IV y GCYM en IV (con `large_packer` y `alloy_blast_smelter`). Plan B: la Expanded Assembly Line.
9. **El titanio del naquadah (TiF₃) se acepta desde IV:** es de Venus, no de la Tierra, y la regla de la Luna sirve para EV.
10. **Reactores de naquadah de GT--:** se quedan sin tocar y son la energía nuclear de LuV en adelante.
11. **Cambios a `viaje.md`:** la fundición solar sale (plan B) y el satélite de prospección pasa a LuV.
12. **Puerta a LuV:** casco LuV, motor LuV de la línea desde la red, UHPIC y osmio con dos escotillas IV, 131 072 EU/t de fisión, combustible de fusión guardado, bases de Venus y Mercurio solas y la carta del sistema exterior.

## Decisiones tomadas (orquestador, 2026-10-24)

Se aprueban las doce propuestas, con estas precisiones:

- **El reactor de fisión depende de los generadores de KubeJS.** Si un multibloque generador de KubeJS no saca EU por escotillas dinamo en GTM 7.5.3, se prueba antes que nada en partida y, si falla, el reactor da vapor a las turbinas grandes de GTM: mismo sitio en la ruta, otra salida.
- **El material `iridosmine` se registra con KubeJS** (`gtceu:iridosmine`) y solo aparece en la tabla de vetas de Mercurio. El validador comprueba que el iridio y el osmio no salen en la Tierra.
- **`viaje.md` se ajusta.** En la fila de IV, la fundición solar pasa a plan B, el satélite de prospección pasa a LuV y entran el reactor, la celda caliente y la planta de naquadah.
- **IV se construye después de EV.** Este documento es la guía hasta entonces.
