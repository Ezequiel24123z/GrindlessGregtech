# tools/assets

Generadores de las texturas propias del pack. Todo es pixel art procedural de 16x16: cada píxel sale de código (paletas, mapas de texto y un pequeño sombreador), no se copia ni se retoca nada de GTM ni de otros mods. El estilo sigue a GregTech: luz arriba a la izquierda, relieve con 3-5 tonos por material, contorno selectivo en los objetos y ningún píxel semitransparente.

| Script | Qué hace |
|---|---|
| `Pixel.Lib.ps1` | Librería común: lienzo ARGB, paletas (carácter → color), mapas de texto, contorno selectivo, escritor de PNG determinista (solo `IHDR`, `IDAT` y `IEND`, deflate sin compresión) y `.png.mcmeta`. |
| `Build-SteamTextures.ps1` | Escribe las texturas de la era de vapor en `pack/kubejs/assets/grindless/textures/`. |
| `Build-SteamPreview.ps1` | Hoja de revisión a x8 con las carcasas, los fotogramas y los objetos. Solo es una vista previa: no se publica. |
| `Build-LVTextures.ps1` | Escribe las texturas de la era LV (perforadora, invernadero, horno de arco, simulador de criaturas, electrodo y modelos de criatura) en `pack/kubejs/assets/grindless/textures/`. |
| `Build-LVPreview.ps1` | Hoja de revisión a x8 de la era LV: cada overlay sobre su carcasa o casco, todos los fotogramas, vista de cueva oscura y pared 3x3. Solo es una vista previa: no se publica. |
| `Build-MVTextures.ps1` | Escribe las texturas de la era MV (perforadora, invernadero, planta de mineral, biorrefinería y broca de acero vanádico) en `pack/kubejs/assets/grindless/textures/`. |
| `Build-MVPreview.ps1` | Hoja de revisión a x8 de la era MV: cada overlay sobre su carcasa y sobre las cuatro carcasas MV, todos los fotogramas, vista de cueva oscura, pared 3x3 y la broca junto a las de bronce y acero. Solo es una vista previa: no se publica. |
| `Build-HVTextures.ps1` | Escribe las texturas de la era HV (refinería, reformador, perforadora, invernadero, llave del End, catalizadores y broca de titanio) en `pack/kubejs/assets/grindless/textures/`. |
| `Build-HVPreview.ps1` | Hoja de revisión a x8 de la era HV: cada overlay sobre su carcasa y sobre cuatro carcasas, todos los fotogramas, vista de cueva oscura, pared 3x3, la llave del End junto a las del Vacío y el Llano y la progresión de brocas. Solo es una vista previa: no se publica. |
| `Build-EVTextures.ps1` | Escribe las texturas de la era EV (planta de platino, perforadora, electrodo de platino y broca de acero de tungsteno) en `pack/kubejs/assets/grindless/textures/`. |
| `Build-EVPreview.ps1` | Hoja de revisión a x8 de la era EV: cada overlay sobre su carcasa y sobre cuatro carcasas, todos los fotogramas, vista de cueva oscura, pared 3x3, el electrodo de platino junto al de grafito y la progresión de brocas. Solo es una vista previa: no se publica. |

## Regenerar

Desde la raíz del repo. `-ExecutionPolicy Bypass` solo afecta a ese proceso (Windows PowerShell 5.1 bloquea scripts sin firmar por defecto).

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamTextures.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamTextures.ps1 -Only drill,keys
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamTextures.ps1 -Credits
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamPreview.ps1 -Out C:\ruta\steam-assets.png -Casing C:\ruta\carcasa_16x16.png
```

- `-Only` admite `drill`, `greenhouse`, `bits`, `probe`, `sample` y `keys`.
- `-Credits` imprime las filas de la tabla «Assets» de `CREDITS.md`.
- `-Casing` es opcional y solo da contexto a la vista previa (sirve cualquier PNG de 16x16, por ejemplo la carcasa de bronce de GTM extraída del jar y guardada fuera del repo). Sin él se usa un fondo de bronce liso dibujado por código.
- Se puede ejecutar tantas veces como se quiera: la salida es idéntica byte a byte. Al terminar, el script comprueba tamaño, píxeles opacos o transparentes, ausencia de negro puro, núcleo en grises y que cada píxel emisivo exista igual en la capa de color.

## Qué se genera

| Archivo (bajo `textures/`) | Notas |
|---|---|
| `block/multiblock/steam_vein_drill/overlay_front.png` | Cara del controlador de la perforadora: manómetro, tubería, lámpara de presión y ventana con la broca. |
| `.../overlay_front_active.png` + `.mcmeta` | 8 fotogramas, `frametime` 3: broca girando, dos pistones, vapor de escape, aguja temblando. |
| `.../overlay_front_active_emissive.png` + `.mcmeta` | Solo lo que brilla: lámpara verde y la punta de la broca. |
| `block/multiblock/steam_greenhouse/` (los mismos tres) | Panel de cristal con marco de latón y un plantón. 8 fotogramas, `frametime` 4: hojas, gota de riego, vapor y brillo del cristal. El emisivo lleva el LED verde y reflejos de las hojas. |
| `item/bronze_drill_bit.png`, `item/steel_drill_bit.png` | Brocas helicoidales cónicas (rampa naranja-marrón y rampa gris-azulada). |
| `item/empty_vein_probe.png` | Sonda de cristal con tapón de bronce, vacía. |
| `item/vein_sample_frame.png` | Capa 0, sin tinte: la misma sonda con el interior transparente. |
| `item/vein_sample_core.png` | Capa 1, solo grises, para que el juego la tiña con el color de cada veta. No pisa ningún píxel de la capa 0. |
| `item/void_key.png`, `item/flat_key.png` | Llave del Vacío (metal oscuro, paletón estrellado) y Llave del Llano (paletón en capas de hierba, tierra y piedra). |

Los overlays siguen la convención de las carcasas de GTM: fondo transparente, detalles solo en el overlay, `_active` animado como tira vertical y `_emissive` con solo los píxeles que brillan. Si falta `overlay_front_paused`, GTM usa `overlay_front`.

## Cómo se retoca

- Los colores están al principio de cada bloque (`New-Palette`), con una letra por color. Los mapas de texto (`$DrillBase`, `$GhBase`, `$CoreRows`) se editan a mano: `.` deja el píxel, `_` lo borra.
- Las brocas (objetos) y la broca de la ventana usan el mismo sombreador (`Draw-Helix`): cono o cilindro iluminado desde arriba a la izquierda con una hélice. Con varios filetes y paso largo salen estrías inclinadas; en la ventana la fase avanza un cuarto por fotograma para que gire.
- Cada archivo nuevo se anota en `CREDITS.md`, en la tabla «Assets».

## Era LV

Mismo método (`Pixel.Lib.ps1`, mapas de texto, paletas y sombreadores pequeños; nada copiado de GTM) con otra paleta: acero oscuro **neutro**, como los grises de los overlays de GTM sobre sus carcasas cálidas, con acentos pequeños y saturados (lámpara roja y verde, cinta amarilla y negra, naranja del cobre y de la colada).

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LVTextures.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LVTextures.ps1 -Only drill,models
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LVTextures.ps1 -Credits
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LVPreview.ps1 -Out C:\ruta\lv-assets.png -SteelCasing C:\ruta\machine_casing_solid_steel.png -HeatproofCasing C:\ruta\machine_casing_heatproof.png -LvHull C:\ruta\lv_side.png
```

- `-Only` admite `drill`, `greenhouse`, `arc`, `simulator`, `electrode` y `models` (también con coma y `-File`). `-Verbose` avisa si un dibujo posterior tapa un píxel emisivo.
- La vista previa acepta `-Section drill,greenhouse,arc,simulator,items,models` y `-Scale` para revisar una sola pieza más grande. Las tres carcasas son solo contexto (cualquier PNG de 16x16, por ejemplo las de GTM extraídas del jar y guardadas fuera del repo); sin ellas se usan fondos dibujados por código.
- La comprobación final es la del vapor y además: ningún píxel opaco en el anillo exterior de la carcasa (1 px en los multibloques, 2 px en la máquina, que va sobre el casco) y el núcleo del modelo solo pinta donde la capa 0 tiene píxeles.
- Salida idéntica byte a byte en cada ejecución.

| Archivo (bajo `textures/`) | Se dibujó sobre | Notas |
|---|---|---|
| `block/multiblock/lv_vein_drill/` (`overlay_front`, `_active` y `_active_emissive`, con `.mcmeta`) | `machine_casing_solid_steel` | Ventana de torre con el motor eléctrico de cobre arriba y la broca de acero mordiendo roca con mena; cinta amarilla y negra y lámpara en la base. 8 fotogramas, `frametime` 2: reflejo girando por los bobinados, brillo en la broca, chispas, lámpara verde. El emisivo lleva lámpara, chispas, punta caliente y el chispazo del motor. |
| `block/multiblock/lv_greenhouse/` (los mismos tres) | `machine_casing_solid_steel` | Panel de cristal en marco de acero: barra de luz de cultivo, plantón, flor, seta y enredadera sobre tierra. 8 fotogramas, `frametime` 4: balanceo, destellos de crecimiento y luz que parpadea. En reposo la lámpara está apagada y las plantas, más oscuras. El emisivo lleva la barra, su luz sobre el cristal, los destellos y los LED. |
| `block/multiblock/submerged_arc_furnace/` (los mismos tres) | `machine_casing_heatproof` | Barra de cobre, tres electrodos de grafito en pinzas y un baño fundido. 8 fotogramas, `frametime` 3: el arco salta de un electrodo a otro y el baño parpadea. En reposo: costra oscura con brasas. El emisivo lleva el baño, las puntas y los arcos. |
| `block/machines/creature_simulator/` (los mismos tres) | casco LV (`casings/voltage/lv/side`) | Pantalla con un holograma de criatura de bloques, barra de nivel, plataforma, LED y ranura de tarjeta. 8 fotogramas, `frametime` 3: un haz de escaneo recorre la figura. En reposo: silueta apagada. El emisivo lleva la figura, el haz, la barra, la plataforma y el LED. |
| `item/graphite_electrode.png` | | Varilla de grafito oscuro y algo brillante (diagonal, como las varillas de GT) con el extremo roscado. |
| `item/creature_model_base.png` | | Capa 0, sin tinte: tarjeta de datos con pantalla oscura y contactos dorados. |
| `item/creature_model_core.png` | | Capa 1, solo grises, para teñir por criatura: el mismo bloque-criatura de la pantalla del simulador y el LED de la tarjeta. Solo pinta sobre la pantalla y el LED de la capa 0. Con tintes medios o claros se ve bien; los muy oscuros se pierden sobre la pantalla. |
| `item/blank_creature_model.png` | | La misma tarjeta con la silueta a medias (tablero apagado) y el LED rojo: modelo sin datos. |

### Cómo se retoca (LV)

- Los marcos, la rampa de acero neutra (`$SteelSpec`, letras `A`-`J` de claro a oscuro) y las paletas de cada pieza están al principio de su bloque. Los mapas de texto (`$DrillBase`, `$GhBase`, `$SafBase`, `$SimBase`, `$MobRows`) se editan a mano; lo que se mueve (broca, plantas, baño, haz de escaneo) se dibuja por código fotograma a fotograma.
- El ruido del baño del horno sale de `Get-Noise` (un hash de posición y fotograma), no de un generador aleatorio, para que la salida no cambie.
- Los mismos píxeles-criatura sirven al holograma de la máquina y al núcleo del modelo (`$MobRows`): si se cambia la silueta cambian los dos.

## Era MV

Mismo método y la misma rampa de acero neutra que LV (`$SteelSpec`), para que los controladores MV sigan en la familia de overlays de GTM. Lo que marca el escalón son los acentos **azules** (panel rayado de la base, balizas y luces) y la lámpara de estado, roja en reposo y verde al trabajar.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MVTextures.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MVTextures.ps1 -Only plant,bit
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MVTextures.ps1 -Credits
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MVPreview.ps1 -Out C:\ruta\mv-assets.png -AluminiumCasing C:\ruta\machine_casing_frost_proof.png -StainlessCasing C:\ruta\machine_casing_clean_stainless_steel.png -SteelCasing C:\ruta\machine_casing_solid_steel.png -HeatproofCasing C:\ruta\machine_casing_heatproof.png
```

- `-Only` admite `drill`, `greenhouse`, `plant`, `bio` y `bit` (también con coma y `-File`). `-Verbose` avisa si un dibujo posterior tapa un píxel emisivo.
- La vista previa acepta `-Section drill,greenhouse,plant,bio,bit` y `-Scale`. Las cuatro carcasas son solo contexto (cualquier PNG de 16x16, por ejemplo las de GTM extraídas del jar y guardadas fuera del repo); sin ellas se usan fondos dibujados por código. Además de su carcasa, cada overlay se ve sobre las cuatro (aluminio, inoxidable, acero macizo y termorresistente): todas las caras llevan marco oscuro propio y el anillo exterior de 1 px vacío, así que se leen en la que acabe usando el multibloque.
- La comprobación final es la de LV (tamaño, alfa binario, sin negro puro, `.mcmeta` de 4 a 8 fotogramas, anillo exterior vacío, emisivo contenido en la capa de color) y además que cada animación cambie de verdad entre fotogramas. Todos los bucles son de 8 fotogramas con periodos que dividen a 8 (2, 4 u 8), así que el salto del último al primero no se nota.
- Salida idéntica byte a byte en cada ejecución.

| Archivo (bajo `textures/`) | Se dibujó sobre | Notas |
|---|---|---|
| `block/multiblock/mv_vein_drill/` (`overlay_front`, `_active` y `_active_emissive`, con `.mcmeta`) | `gtceu:block/casings/solid/machine_casing_frost_proof` (aluminio) | Torre de celosía de aluminio alrededor de un cabezal motriz de acero con la broca de acero vanádico (lavanda) mordiendo roca con mena; cable de potencia por la pared derecha, panel azul rayado y lámpara en la base. 8 fotogramas, `frametime` 2: broca y sarta girando, chispas, pulso azul por el cable, balizas y lámpara verde. El emisivo lleva la ventana del cabezal, las balizas, la punta, las chispas, el pulso, las franjas azules y la lámpara. |
| `block/multiblock/mv_greenhouse/` (los mismos tres) | `.../machine_casing_clean_stainless_steel` (inoxidable) | Tres lámparas de cultivo sobre un panel de cristal con árbol, caña de azúcar y arbusto con bayas sobre tierra; tubería de CO₂ por la base y subiendo por el borde derecho, con dos boquillas que soplan gas al cristal. 8 fotogramas, `frametime` 4: balanceo, destellos de crecimiento, parpadeo de las lámparas, bolitas de luz por la tubería y bocanadas de gas. En reposo: lámparas apagadas, cristal frío y plantas oscuras. El emisivo lleva las lámparas y su luz, los destellos, la copa del árbol, la banda azul de la tubería, las bolitas y los LED. |
| `block/multiblock/ore_plant/` (los mismos tres) | `.../machine_casing_solid_steel` | El buque insignia de la era: tres estaciones de izquierda a derecha, **trituradora** (tolva de mena y dos rodillos dentados que engranan sobre una fila de mena), **balsa de lavado** (agua con burbujas y una mota de mena) y **horno** (ladrillo que pasa a amarillo blanco, con chimenea), con una lámpara por estación y una cinta de luz por el suelo. 8 fotogramas, `frametime` 3: los dientes avanzan, los reflejos recorren los rodillos, suben burbujas, el horno chisporrotea y rayas de luz corren por la cinta. En reposo: agua oscura y brasas. El emisivo lleva el agua de la superficie, las burbujas, el horno entero, las lámparas y la cinta. El horno de la planta es de carcasa termorresistente dentro del multibloque, pero la cara del controlador va sobre acero macizo (`docs/eras/mv.md`). |
| `block/multiblock/biorefinery/` (los mismos tres) | `.../machine_casing_solid_steel` | Columna de destilación de vidrio con cuatro fracciones (lima, verde, ámbar y marrón), una llave a cada lado por fracción en el color de su banda, condensador arriba y llama de rehervidor debajo; panel azul rayado y lámpara en la base. 8 fotogramas, `frametime` 4: burbujas que suben, gotas que caen de las llaves de arriba abajo y llama que parpadea. En reposo: fracciones apagadas y lámpara roja. El emisivo lleva la mitad clara de cada banda, las llaves, las gotas, las burbujas, la llama y la base. |
| `item/vanadium_steel_drill_bit.png` | | Broca helicoidal de acero vanádico (lavanda `B59FCC`, el color del material en GTM), un paso por encima de la de acero: algo más ancha, con la punta más larga y tres estrías anchas. |

### Cómo se retoca (MV)

- La rampa de acero (`$SteelSpec`, letras `A`-`J`) y la azul MV (`$BlueSpec`, letras `a`-`g`) son comunes; las paletas de cada pieza están al principio de su bloque (`New-Pal` falla si una letra se repite). Los mapas de texto (`$DrillBase`, `$GhBase`, `$PlantBase`, `$BioBase`) se editan a mano; lo que se mueve se dibuja por código fotograma a fotograma (`Draw-Roller` para los rodillos de la planta).
- El horno y la llama de la columna usan `Get-Noise` (un hash de posición y fotograma, no un generador aleatorio) para que la salida no cambie.
- La broca usa el mismo sombreador (`Draw-Helix`) que las de vapor, en una copia local para no tocar `Build-SteamTextures.ps1`; solo cambian la rampa (`$RampVanadiumSteel`) y los parámetros.

## Era HV

Mismo método y la misma rampa de acero neutra que LV y MV (`$SteelSpec`). Lo que marca el escalón son los acentos **naranjas** (franjas de la base, lámparas y calor, `$OrangeSpec`) y, en la refinería y el reformador, un acero inoxidable limpio algo más frío y claro (`$StainSpec`).

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HVTextures.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HVTextures.ps1 -Only refinery,keys
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HVTextures.ps1 -Credits
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HVPreview.ps1 -Out C:\ruta\hv-assets.png -StainlessCasing C:\ruta\machine_casing_clean_stainless_steel.png -TitaniumCasing C:\ruta\machine_casing_stable_titanium.png -SteelCasing C:\ruta\machine_casing_solid_steel.png -HeatproofCasing C:\ruta\machine_casing_heatproof.png
```

- `-Only` admite `refinery`, `reformer`, `drill`, `greenhouse`, `keys`, `catalysts` y `bit` (también con coma y `-File`). `-Verbose` avisa si un dibujo posterior tapa un píxel emisivo.
- La vista previa acepta `-Section refinery,reformer,drill,greenhouse,items` y `-Scale`. Las cuatro carcasas son solo contexto (cualquier PNG de 16x16, por ejemplo las de GTM extraídas del jar y guardadas fuera del repo); sin ellas se usan fondos dibujados por código. Además de su carcasa, cada overlay se ve sobre las cuatro (inoxidable limpio, titanio estable, acero macizo y termorresistente).
- `docs/eras/hv.md` solo fija la carcasa de la refinería y del reformador (`gtceu:clean_machine_casing`). Para la perforadora y el invernadero se tomó la de titanio estable, la de la familia, como la de aluminio en MV. Todas las caras llevan marco oscuro propio y el anillo exterior de 1 px vacío, así que se leen igual en las demás.
- La comprobación final es la de MV (tamaño, alfa binario, sin negro puro, `.mcmeta` de 4 a 8 fotogramas, anillo exterior vacío, emisivo contenido en la capa de color, animación que cambia de verdad). Todos los bucles son de 8 fotogramas con periodos que dividen a 8, y la salida es idéntica byte a byte en cada ejecución.

| Archivo (bajo `textures/`) | Se dibujó sobre | Notas |
|---|---|---|
| `block/multiblock/refinery/` (`overlay_front`, `_active` y `_active_emissive`, con `.mcmeta`) | `gtceu:block/casings/solid/machine_casing_clean_stainless_steel` | El buque insignia de la era: columna de acero inoxidable con tres bandejas, un par de llaves en cada una (tuberías teñidas y una lámpara por fracción: gas, nafta y ligero, de arriba abajo) sobre un reactor ancho con la ventana del horno en tres paneles; vapor sobre la tapa, franjas de peligro y lámpara de estado en la base. 8 fotogramas, `frametime` 3: el horno chisporrotea, el faldón de la columna brilla, las lámparas laten y caen gotas, sale vapor. En reposo: brasas y lámpara roja. El emisivo lleva el horno, el faldón, las lámparas, las gotas, las franjas y la lámpara de estado. |
| `block/multiblock/reformer/` (los mismos tres) | `.../machine_casing_clean_stainless_steel` | Recipiente vertical: tubería de entrada arriba, un lecho de pellets de catalizador con rejilla de soporte y destellos de platino, serpentines de calefacción naranjas a los lados y tres boquillas de salida abajo con una lámpara cada una (benceno, tolueno y H₂). 8 fotogramas, `frametime` 4: el brillo de los serpentines sube por los lados, un pellet de alimentación corre por la entrada y tres destellos de platino en cruz se encienden por turnos. En reposo: lecho frío y serpentines apagados. El emisivo lleva los serpentines, los destellos, la entrada, las lámparas, las franjas y la lámpara de estado. |
| `block/multiblock/hv_vein_drill/` (los mismos tres) | `.../machine_casing_stable_titanium` | Torre de celosía cuyas patas alternan inoxidable y titanio alrededor de un cabezal motriz oscuro con ventana naranja; la broca de titanio muerde piedra del End (crema con vetas violeta y platino). Cable de potencia a la derecha (pulso naranja) y manguera de lodo a la izquierda (bolas marrones). 8 fotogramas, `frametime` 2: broca y sarta girando, chispas, balizas de la corona y del armazón alternas, pulso por el cable. El emisivo lleva la ventana, las balizas, la punta, las chispas, el pulso, las franjas y la lámpara. |
| `block/multiblock/hv_greenhouse/` (los mismos tres) | `.../machine_casing_stable_titanium` | Tres lámparas cálidas de espectro completo sobre un panel de cristal con árbol, trigo y calabazas; boquillas de riego en el raíl, tubería de CO₂ por la base y el borde derecho y banda naranja. 8 fotogramas, `frametime` 4: balanceo, gotas de riego, bocanadas de gas, bolitas de luz por la tubería, parpadeo de las lámparas y destellos de crecimiento. En reposo: lámparas apagadas, cristal frío y plantas oscuras. El emisivo lleva las lámparas y su luz, la banda, las bolitas, los destellos y los LED. |
| `item/end_key.png` | | Llave del End: la silueta de las del Vacío y el Llano (arco, collar, caña y paletón en C) en piedra del End, con un ojo de ender en el arco; el paletón enseña el End (piedra sobre obsidiana sobre vacío). |
| `item/hydrotreating_catalyst.png` | | Copa de acero con banda azul y un montón de pellets de cobalto (azul), molibdeno (lila) y sílice (blanco). |
| `item/reforming_catalyst.png` | | La misma copa con banda dorada y pellets de sílice (marfil) con unos pocos de platino y un destello. |
| `item/titanium_drill_bit.png` | | No estaba en el encargo: la perforadora HV pide `grindless:titanium_drill_bit` y sin textura saldría la de «falta textura». Mismo sombreador que las otras brocas, con la rampa del titanio de GTM (lila rosado, `DCA0F0`). |

### Cómo se retoca (HV)

- Las rampas (`$SteelSpec` letras `A`-`J`, `$OrangeSpec` `a`-`g`, `$StainSpec` `0`-`6` y `$LampSpec` `M`-`S`) son comunes; las letras propias de cada pieza están al principio de su bloque (`New-Pal` falla si una letra se repite). Los mapas de texto (`$WindowBase`, `$HvDrillBase`, `$HgBase`, `$RfmBed`) se editan a mano; lo que se mueve se dibuja por código fotograma a fotograma.
- El horno de la refinería usa `Get-Noise` (un hash de posición y fotograma, no un generador aleatorio) para que la salida no cambie.
- Los pellets de los catalizadores son bolas de 2x2 con luz arriba a la izquierda (`New-Catalyst`): el tono de cada una sale de un hash de su posición, y la copa y el contorno son los mismos en los dos.

## Era EV

Mismo método y la misma rampa de acero neutra que en las eras anteriores (`$SteelSpec`). Lo que marca el escalón son los acentos **morados** (franjas de la base, lámparas y pulsos de corriente, `$PurpleSpec`) y el acero de tungsteno, azul violáceo (`$TungstenSpec`), de la torre de la perforadora.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVTextures.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVTextures.ps1 -Only plant,electrode
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVTextures.ps1 -Credits
powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVPreview.ps1 -Out C:\ruta\ev-assets.png -PtfeCasing C:\ruta\machine_casing_inert_ptfe.png -TitaniumCasing C:\ruta\machine_casing_stable_titanium.png -TungstenCasing C:\ruta\machine_casing_robust_tungstensteel.png -StainlessCasing C:\ruta\machine_casing_clean_stainless_steel.png
```

- `-Only` admite `plant`, `drill`, `electrode` y `bit` (también con coma y `-File`). `-Verbose` avisa si un dibujo posterior tapa un píxel emisivo.
- La vista previa acepta `-Section plant,drill,items` y `-Scale`. Las cuatro carcasas son solo contexto (cualquier PNG de 16x16, por ejemplo las de GTM extraídas del jar y guardadas fuera del repo); sin ellas se usan fondos dibujados por código. Además de su carcasa, cada overlay se ve sobre las cuatro (PTFE inerte, titanio estable, acero de tungsteno y inoxidable limpio).
- `docs/eras/ev.md` fija la carcasa inerte de PTFE (`gtceu:inert_machine_casing`) para la planta de platino y la estable (`gtceu:stable_machine_casing`, de titanio) para la perforadora. La planta se ve también sobre titanio y acero de tungsteno en la franja de carcasas. Todas las caras llevan marco oscuro propio y el anillo exterior de 1 px vacío, así que se leen igual en cualquiera.
- La comprobación final es la de HV (tamaño, alfa binario, sin negro puro, `.mcmeta` de 4 a 8 fotogramas, anillo exterior vacío, emisivo contenido en la capa de color, animación que cambia de verdad). Todos los bucles son de 8 fotogramas con periodos que dividen a 8, y la salida es idéntica byte a byte en cada ejecución.

| Archivo (bajo `textures/`) | Se dibujó sobre | Notas |
|---|---|---|
| `block/multiblock/platinum_plant/` (`overlay_front`, `_active` y `_active_emissive`, con `.mcmeta`) | `gtceu:block/casings/solid/machine_casing_inert_ptfe` | El buque insignia de la era: una celda de electrólisis de vidrio en el centro con dos electrodos de platino dentro de agua regia (burbujas que suben y esponja de platino en el fondo), una cuba de ácido a cada lado (nítrico a la izquierda, clorhídrico a la derecha) que alimenta la celda por tuberías de titanio, una tubería de inoxidable bajo las tres con acoples de titanio, cables de corriente hasta los terminales de los electrodos, franjas moradas y lámpara de estado. 8 fotogramas, `frametime` 3: los pulsos morados entran por los cables, el ácido corre hacia la celda, suben burbujas desde las puntas, corre corriente por los electrodos, tres destellos de platino en cruz se encienden por turnos, la esponja centellea y dos bolitas de luz recorren la tubería. En reposo: ácidos apagados, electrodos mates y lámpara roja. El emisivo lleva los pulsos, la superficie del agua regia y de las cubas, las burbujas, las puntas y la corriente de los electrodos, los destellos, la esponja, las bolitas, las franjas y la lámpara. |
| `block/multiblock/ev_vein_drill/` (los mismos tres) | `.../machine_casing_stable_titanium` | Torre de acero de tungsteno (un mástil recto que se abre en A, con travesaños) alrededor de un cabezal motriz oscuro con ventana morada; la broca de acero de tungsteno muerde piedra del End rica en mena (scheelita naranja, platino blanco, sulfuros de latón y tungstato violeta). Cable de potencia (pulso morado) y manguera de lodo (bolas marrones) por el marco superior; franjas moradas y lámpara en la base. 8 fotogramas, `frametime` 2: broca y sarta girando (con una luz morada que baja por la sarta), chispas, balizas alternas en las puntas de las patas, pulso por el cable y un destello de platino en cruz cada cuatro fotogramas. El emisivo lleva la ventana, las balizas, la luz de la sarta, la punta, las chispas, el destello, el pulso, las franjas y la lámpara. |
| `item/platinum_electrode.png` | | La varilla diagonal del electrodo de grafito, en platino: cuerpo brillante, el núcleo de titanio a la vista en el extremo cortado, y collar y rosca de titanio; un destello de platino al lado. |
| `item/tungsten_steel_drill_bit.png` | | Broca helicoidal de acero de tungsteno (azul violáceo, `6464A0`, el color del material en GTM): un paso más allá de la de titanio, más ancha y con la punta más larga. Mismo sombreador (`Draw-Helix`) que las otras, en una copia local. |

### Cómo se retoca (EV)

- Las rampas (`$SteelSpec` letras `A`-`J`, `$PurpleSpec` `a`-`g`, `$StainSpec` `0`-`6`, `$LampSpec` `M`-`S` y `$TungstenSpec` `T`-`Y`) son comunes; las letras propias de cada pieza están al principio de su bloque (`New-Pal` falla si una letra se repite). Los mapas de texto (`$WindowBase`, `$EvDrillBase`) y las cadenas de tonos de cada líquido (`$PlatNitric`, `$PlatAqua`, `$PlatHcl`) y de la tubería (`$PlatPipe`) se editan a mano; lo que se mueve se dibuja por código fotograma a fotograma.
- El electrodo reutiliza la geometría del de grafito de LV (varilla diagonal con cuatro píxeles por fila); cambian las rampas (platino y titanio) y el contorno, que ahora toma el tono de cada material.
