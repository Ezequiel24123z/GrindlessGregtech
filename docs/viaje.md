# Gregtech Grindless: el viaje al agujero negro

El usuario aprobó esta tabla el 2026-10-24, con los cambios de la última sección. Es la guía del pack. Cada era se diseña en detalle al llegar a ella, en `docs/eras/`.

La investigación de apoyo está en `docs/investigacion/espacio/`:
- la campaña de `grindless-earlygame` (`grindless-campaign.md`);
- lo que hacen otros packs (`packs-space.md`);
- los mods espaciales (`space-mods.md`);
- lo que trae GTM 7.5.3 por tier (`gtm-tiers.md`);
- el catálogo de máquinas candidatas (`machines-catalog.md`).

## Cómo casan Grindless y GregTech

- **Energía.** Grindless sube con `8 × 4ⁿ`, que es exactamente la escalera de voltajes de GT: T0 = vapor/ULV … T14 = MAX. Su T15 (8 590 millones por tick) no existe en GT. El final es el proyecto de MAX con varios amperios (4 A de MAX = T15); no se inventa un voltaje falso.
- **Industria.** Los temas T0–T9 de Grindless caen 1:1 en Vapor–UHV, y son justo lo que GT trae ahí:

  | Tema de Grindless | Era de GT |
  |---|---|
  | Precisión | EV |
  | Nuclear | IV |
  | Criogenia | LuV |
  | Fusión | ZPM |
  | Partículas | UV |
  | Cuántica | UHV |
- **Espacio.** En Grindless empieza en T10 (UEV). Aquí empieza al final de HV, así que sus etapas se adelantan:

  | Etapa de Grindless | Eras aquí |
  |---|---|
  | Orbital (T10) | HV–LuV |
  | Planetaria y Kardashev I (T11) | IV–ZPM |
  | Estelar y Kardashev II (T12) | UV–UHV |
  | Interestelar (T13) | UEV–UXV |
  | Galáctica y Kardashev III (T14) | OpV |
  | Horizonte de sucesos (T15) | MAX |

## La tabla

| Era | Viaje | Solo sale de allí | Máquinas nuevas (nuestras) | Abre |
|---|---|---|---|---|
| **Vapor** (T0) | La Tierra: Overworld, Vacío y Llano. El observatorio dibuja la primera carta de la Luna. | — | perforadora e invernadero de vapor (ya están), alto horno de vapor, batería de coque, observatorio de relojería | LV |
| **LV** (T1) | el Nether (ya está) | las vetas del Nether | perforadora, invernadero, horno de arco y simulador de criaturas (ya están); tostador de sulfuros con planta de ácido, torre solar de espejos, observatorio óptico | MV |
| **MV** (T2) | el End (sale de HV, que solo debe abrir la Luna) | las vetas del End: bauxita, vanadio y cromo, platino, circonio | planta de mineral y biorrefinería (ya están); banco de pruebas de motores, radiotelescopio | HV |
| **HV** (T3) | la **Luna**, al final de la era, con el primer cohete y a mano | **titanio** (ilmenita lunar) y helio-3, que se guarda para la fusión | refinería y reformador (ya están); autoclave de composites, planta de gas de síntesis, complejo de lanzamiento, perforadora lunar (solo forma en la Luna) | EV: sin titanio lunar no hay casco EV |
| **EV** (T4) | base lunar automática y conectada con casa; **Marte** al final | tungsteno, tierras raras, hielo con deuterio | planta de platino, celda de regolito con horno de volátiles y planta criogénica (Luna), procesador de atmósfera (Marte), trípode EV y campo solar lunar | IV: acero de tungsteno |
| **IV** (T5) | **Venus y Mercurio** a la vez | naquadah (vetas de Venus a 90 bar), iridio y osmio (corteza de Mercurio) | reactor de fisión (núcleos diseñados), celda caliente (radioquímica y pastillas RTG), planta de naquadah, perforadora presurizada (Venus) y de lado nocturno (Mercurio), motor térmico de Venus, campo solar de Mercurio | LuV |
| **LuV** (T6) | **cinturón de asteroides y lunas de Júpiter** (Ío, Europa, Ganímedes); primera estación orbital | cultivos del océano de Europa (circuitos vivos), metales de asteroide | fundición en microgravedad, procesador de asteroides, criobot, toma volcánica de Ío, rectena (energía mandada desde la órbita) | ZPM |
| **ZPM** (T7) | **Saturno** (Titán, Encélado) y los gigantes de hielo **desde la órbita, sin bajar** | helio-3 y deuterio a granel, tolinas de Titán | fusión como infraestructura, láser de minería orbital, sifón de gigantes gaseosos, astillero orbital, ascensor espacial. **Kardashev I**: todo el sistema solar trabaja | UV |
| **UV** (T8) | Plutón y el cinturón de Kuiper desde la órbita; primera sonda a otra estrella | hielos exóticos | acelerador de partículas, lanzador de velas láser | UHV |
| **UHV** (T9) | **Alfa Centauri** (Próxima b): la sonda abre la primera puerta | flora alienígena | par de puertas de curvatura, enjambre de Dyson alrededor del Sol. **Kardashev II** | UEV |
| **UEV** (T10) | varias estrellas a la vez (Sirio, Barnard…) | materia degenerada de enana blanca | forja estelar, colector de nebulosa | UIV |
| **UIV** (T11) | estrellas de neutrones, púlsares y el primer agujero negro, Cygnus X-1 | neutronio, metales del proceso r | motor de Penrose (ensayo con un agujero negro), ordenador Matrioshka | UXV |
| **UXV** (T12) | el brazo de la galaxia: muchos sistemas a la vez | plasma estelar, plasma del disco de acreción | elevador estelar, espumadora del disco de acreción | OpV |
| **OpV** (T13) | el bulbo galáctico | antimateria industrial, materia exótica estable | forja de Kugelblitz (microagujeros negros hechos con luz), sondas que se replican solas. **Kardashev III** | MAX |
| **MAX** (T14–T15) | **Sagitario A\***, el centro de la galaxia | — | **la concha de espejos**: el multibloque más grande del pack. Rodea el agujero negro, amplifica una onda hasta que estalla y con él estalla el universo | el final |

Los materiales exactos de cada fila se fijan al diseñar cada era. La forma general es lo que se aprueba aquí.

## La Luna en HV: dos opciones

**A. Titanio. Elegida por el usuario.**
- **Qué es:** la ilmenita del mar lunar (las muestras del Apolo llegan a ~10 % de TiO₂).
- **Por qué EV la necesita:** el casco EV y casi toda máquina EV llevan titanio, así que la Luna es la puerta a EV. Como EV gasta mucho titanio, automatizar la base lunar es el primer trabajo de EV.
- **Qué hay que cambiar:**
  - Quitar el titanio de la Tierra: la ilmenita de la veta del End y el rutilo que sale de la bauxita.
  - Cambiar la broca de titanio de la perforadora HV.
  - El helio-3 viene de regalo para la fusión.

**B. Platino y paladio.**
- **Qué es:** metal de meteoritos en el regolito.
- **Por qué EV lo necesita:** alimenta la planta de platino, la pieza estrella de EV.
- **Qué hay que cambiar:** la línea de platino de GT-- saca el platino de los sulfuros de la Tierra. Hacerlo solo lunar obliga a romper esa línea, y el platino pesa menos que el titanio en EV.

## Las vetas del End

Hoy HV abre el End y, con la Luna, abriría dos sitios. Propuesta: **el End pasa a MV**, que hoy no abre ningún sitio.
- **El orden queda así:** el Nether (LV, hacia abajo), el End (MV, más allá del mundo) y la Luna (HV, arriba).
- **Qué hay que bajar a MV:** el ojo de ender y la llave del End. El blaze pasa de HV a MV en el simulador.
- **Qué sale de la veta del End:**
  - la ilmenita, que va a la Luna con la opción A;
  - la scheelita, que va a Marte.

## Cada planeta tiene sus reglas

- **Máquinas que solo funcionan allí.** GTM ya admite recetas con condición de dimensión. Además, la estructura de los multibloques lleva piezas que solo se fabrican allí, como el ladrillo de regolito sinterizado. Hay que ir y montarlos en el sitio.
- **Entorno.** Cada planeta tiene un perfil que cambia las recetas:
  - En el vacío no hay combustión, y los procesos de vacío son gratis.
  - Con calor se gasta más refrigerante.
  - Con frío la criogenia sale más barata.
  - Con poca gravedad los cristales crecen más rápido.
  - Con radiación hacen falta carcasas blindadas.
  - La energía solar depende de la luz (Mercurio ×6,7, Luna ×1,4, Marte ×0,43).
- **Energía del sitio.**
  - Solar.
  - Combustibles de allí: metano y oxígeno en Marte, calor en Venus, volcanes en Ío.
  - Pilas RTG.
  - Desde LuV, energía mandada desde la órbita a una rectena.
- **Transporte (decisión del usuario).**
  - Personas: la primera vez en cohete; después, Waystones o los /home de FTB, sin coste.
  - Materiales, fluidos y energía: AE2, con el puente cuántico entre planetas hecho con una mitad en cada extremo.
  - La red AE2 entre planetas mejora con las eras.
  - Los cofres y tanques ender no cruzan a otro planeta.
- **Lo que sale de un planeta no existe en la Tierra.** El validador de recetas lo comprueba para cada recurso, incluidas abejas, subproductos y addons.

## De visitar a dominar

1. **En persona y a mano:** HV–IV (Luna, Marte, Venus y Mercurio).
2. **Bases automáticas conectadas:** EV–LuV.
3. **Estaciones en órbita que explotan sin bajar:** LuV–UV.
4. **Industria del tamaño de una estrella o de un sistema:** UHV–OpV (Dyson, forja estelar, elevador estelar; Kardashev II y III).
5. **El proyecto del agujero negro:** MAX.

## El final

Es un solo proyecto en cuatro etapas, y cada una es un multibloque que gana algo:

| Era | Etapa | Qué hace |
|---|---|---|
| UIV | Motor de Penrose | Ensayo en un agujero negro estelar: saca energía del giro. |
| UXV | Espumadora del disco | Convierte el plasma del disco de acreción en materia exótica. |
| OpV | Forja de Kugelblitz | Hace microagujeros negros con luz, que hay que contener. |
| MAX | Concha de espejos | Rodea Sagitario A\* y amplifica una onda hasta que el agujero estalla. Es el multibloque más grande del pack. |

- **La receta final** pide la energía guardada, la onda semilla de la forja y todos los segmentos en su sitio.
- **Al detonar** el universo estalla: créditos y una semilla de universo nuevo para quien quiera volver a empezar.
- **Dónde:** GCYR trae la dimensión `black_hole_orbit` con un cielo de agujero negro y nada que lleve a ella. Es el sitio perfecto.
- **Lo que hay que preparar antes:** el helper de patrones (hoy 16 filas) tiene que aceptar estructuras mucho más grandes.

## Las familias cambian de forma y de piezas, no solo de color

- **Perforadora:**
  1. torre de bronce (vapor);
  2. celosía de acero con bomba de lodo (LV);
  3. torre de aluminio (MV);
  4. equipo rotatorio de inox (HV);
  5. trípode lunar con alas solares (EV);
  6. equipo presurizado o con camisa de refrigerante (IV);
  7. ancla de arpón en asteroides y criobot en lunas heladas (LuV);
  8. cuchara atmosférica en gigantes gaseosos (ZPM);
  9. espumadora del disco (UXV–MAX).
- **Invernadero:**
  1. casa de cristal;
  2. hidropónico de inox;
  3. cúpula lunar sellada;
  4. anillo hidropónico que gira (gravedad por giro);
  5. biorreactor de algas;
  6. biosfera del arca para el viaje.
- **Observatorio (familia nueva, la que cuenta el viaje):**
  1. telescopio de relojería;
  2. refractor;
  3. radiotelescopio;
  4. antena de espacio profundo;
  5. interferómetro;
  6. detector de ondas gravitacionales;
  7. el telescopio que fotografía Sagitario A\*, que da los datos del objetivo final.

## Misiones

En inglés, un capítulo por era. Cada capítulo cuenta el paso que te acerca al centro de la galaxia. Se abre con lo que se ve desde el observatorio y se cierra con el viaje siguiente. Nunca se promete un multibloque que no existe todavía.

## Lo que hacen otros packs

- **GTNH:**
  - **Planetas por tier:** la Luna en HV, Marte, Venus y Mercurio en EV, etc.
  - **Ascensor espacial (UV):** módulos que minan planetas sin bajar.
  - **Megaestructuras finales:** el Ojo de la Armonía y la Forja de los Dioses.
  - **El agujero negro "pseudoestable":** se siembra y decae si no se cuida. Es el mejor precedente de nuestro final.
  - **El final de verdad:** la Puerta Estelar.
  - **Lo que cansa:** cohetes y esquemas por mazmorras, aterrizajes a mano, recetas de 111 horas, azar obligatorio y entradas que se pierden si falla la energía. Licencia LGPL/GPL/sin licencia: solo ideas.
- **GregTech Leisure:**
  - **Planetas:** 8 cohetes, cada planeta con su fluido.
  - **Explotación sin volver:** centro espacial con drones que no se gastan.
  - **Cósmico:** esfera de Dyson y Ojo de la Armonía.
  - **El final:** MAX acaba en "modo creativo", un final sin gracia; hay que evitarlo.
  - **Cantidades absurdas:** máquinas de millones de paralelos.
  - **Licencia:** contradictoria; solo ideas.
- **Star Technology:**
  - **Viaje:** se viaja por puertas estelares, no por cohetes.
  - **K.O.M.A.R.U.:** un marco de módulos cuyo mantenimiento sube con el tamaño.
  - **Licencia:** MIT, se puede copiar con atribución.
- **GT Odyssey:**
  - **Planetas:** usa Ad Astra.
  - **Minería remota:** escaneas una dimensión una vez y la minas desde casa ("por fin no hay que plantar mineros por todas partes").
  - **Licencia:** no comercial; solo ideas.
- **Monifactory / Nomifactory:** sin espacio, con misiones de "microverso" que dan lotes fijos. Licencia LGPL.
- **Cosmic Frontiers y Phoenix Forge:** prometen finales que no existen. Hay que evitarlo.

**Qué funciona.**
- Pisar el planeta una vez y después explotarlo desde lejos.
- Megaestructuras que se manejan, con entradas y salidas de verdad.
- Catalizador que no se gasta + reactivo barato = mucho producto.
- Capítulos que resumen la era.

**Qué cansa.**
- Tiempos y azar inflados.
- Ir y volver a mano.
- Muros de cantidad.
- Castigos que tiran el trabajo.
- Finales "creativos" que anulan la logística.
- Prometer lo que no está hecho.

## Mod de espacio

**GCYR, que ya está en el pack, y nada más.** El informe completo está en `space-mods.md`.

**Por qué GCYR.**
- Es de GregTech. Los cohetes se montan con piezas hechas en ensambladoras de GT y queman fluidos de GT.
- Trae la Luna, Marte, Mercurio, Venus, sus órbitas y un esbozo de Próxima b. Se pueden añadir planetas con JSON.
- Tiene oxígeno y temperatura (copiados del código MIT de Ad Astra). El oxígeno lo pone una máquina, el esparcidor de oxígeno.
- Trae una esfera de Dyson y la dimensión `black_hole_orbit` con su shader de agujero negro funcionando.
- Licencia LGPL-3.0: se puede incluir y adaptar con atribución.

**Por qué no los demás.**

| Mod | Licencia | Por qué no |
|---|---|---|
| Ad Astra | código MIT y arte con todos los derechos reservados | No tiene ninguna conexión con KubeJS: todos los packs que lo usan escribieron Java. Con GCYR duplicaría el oxígeno, los cohetes y los materiales. |
| Northstar Redux | MIT | Va sobre Create y no tiene ganchos de GT, aunque sí tiene plugin de KubeJS. |
| Creating Space | MIT | Va sobre Create y no tiene plugin de KubeJS. |
| Galacticraft | — | Está muerto en Forge. |

**Lo que hacemos nosotros, sin Java.**
- Las máquinas que solo funcionan en un planeta: la condición de dimensión de las recetas de GTM.
- La gravedad y la radiación: ningún mod las tiene, así que van como reglas por planeta en las recetas.
- Los recursos exclusivos de cada planeta.
- El transporte entre planetas.
- La minería orbital: los satélites y láseres de GCYR no están hechos.

**Lo que hay que arreglar de GCYR.**
- Sus vetas de Marte son materiales de la Tierra: se cambian por las nuestras.
- Sube el primer cohete y el traje espacial a HV. Hoy el escáner de cohetes es de EV y el traje necesita un plástico de IV.
- Tiene dos fallos abiertos al lanzar y al cambiar de dimensión. Hay que probarlos en partida.

## Decisiones del usuario (2026-10-24)

1. **La Luna da titanio (opción A).** El titanio entra en EV y sale solo de la Luna.
2. **El End pasa a MV.** Hay que comprobar que, sin la ilmenita (a la Luna) ni la scheelita (a Marte), la veta del End sigue mereciendo el viaje.
3. **HV sin titanio.** Todo HV pasa a acero inoxidable: máquinas, cascos, brocas (la broca HV es de inox), multibloques y las piezas del cohete y del traje de GCYR. Las texturas HV se rehacen donde haga falta.
4. **Regla del validador:** nada de una era puede pedir un recurso que sale en una era posterior.
5. **Kardashev:** el I en ZPM, el II en UHV y el III en OpV.
6. **Viajes.** La primera visita a cada planeta es en cohete. Después, las personas usan Waystones o los /home de FTB, sin coste extra. Que viajar sea gratis es intencional.
7. **AE2 es la columna del transporte entre planetas:** materiales, fluidos y energía.
   - El puente cuántico entre planetas se fabrica con una mitad hecha en cada extremo, así que hay que ir una vez; después funciona solo.
   - La red entre planetas mejora con las eras (más canales, más capacidad, más energía) y es un objetivo en sí.
   - Los cofres y tanques ender no cruzan a otro planeta.
8. **Misiones.**
   - Una pestaña por era (Vapor → MAX) que cuenta el viaje.
   - Pestañas aparte para los mods de calidad de vida: almacenamiento, AE2 y addons, Productive Bees, Create/Greate si se quedan, Waystones/FTB…
   - Se reutilizan misiones de packs cuya licencia lo permite; si no, se escriben.
   - Todo en inglés.
9. **Post-UHV.** Primero se reutiliza lo que existe en packs externos, Gregicality y packs antiguos con licencia que lo permita (texturas y código incluidos). Crearlo de cero es el último recurso.
10. **Orden de trabajo:**
    1. probar en partida el lanzamiento y el salto de dimensión de GCYR;
    2. HV a inox y versión corregida;
    3. prototipo de la Luna probado en partida;
    4. EV con el viaje y texturas nuevas;
    5. IV diseñada en detalle mientras tanto;
    6. pestañas de misiones de mods externos en paralelo;
    7. un resumen corto al cerrar cada versión.

Lo que sigue abierto lo resuelve el orquestador y lo apunta en `DECISIONS.md`:
- Por encima de UHV, GTM no trae circuitos, cables ni bobinas.
- El helper de patrones tiene que crecer para los multibloques gigantes.
- `ev.md` e `iv.md` se rehacen con el viaje. Lo construido en el scratch se reaprovecha.
