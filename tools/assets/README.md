# tools/assets

Generadores de las texturas propias del pack. Todo es pixel art procedural de 16x16: cada píxel sale de código (paletas, mapas de texto y un pequeño sombreador), no se copia ni se retoca nada de GTM ni de otros mods. El estilo sigue a GregTech: luz arriba a la izquierda, relieve con 3-5 tonos por material, contorno selectivo en los objetos y ningún píxel semitransparente.

| Script | Qué hace |
|---|---|
| `Pixel.Lib.ps1` | Librería común: lienzo ARGB, paletas (carácter → color), mapas de texto, contorno selectivo, escritor de PNG determinista (solo `IHDR`, `IDAT` y `IEND`, deflate sin compresión) y `.png.mcmeta`. |
| `Build-SteamTextures.ps1` | Escribe las texturas de la era de vapor en `pack/kubejs/assets/grindless/textures/`. |
| `Build-SteamPreview.ps1` | Hoja de revisión a x8 con las carcasas, los fotogramas y los objetos. Solo es una vista previa: no se publica. |

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
