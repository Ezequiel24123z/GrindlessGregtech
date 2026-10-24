# Decisiones

Una línea por decisión. La más reciente, abajo.

- 2026-10-24 · Versión: Minecraft 1.20.1 + Forge 47.4.x + GregTech Modern 7.5.3 (fijada) + KubeJS 2001.6.5. Es la última GTM estable, tiene el mayor ecosistema de addons y es donde viven Monifactory, Star Technology, TerraFirmaGreg y GTL. La rama 1.21.1 no saca estable desde julio de 2025 y la 8.0 está en pre-release con la API rota.
- 2026-10-24 · Los multibloques se escriben en KubeJS a través de un helper propio de patrones, para poder migrar a GTM 8.0 (MultiblockPatternBuilder) sin reescribirlos uno a uno.
- 2026-10-24 · Mods fijados con packwiz en `pack/`. Se prefiere Modrinth. De CurseForge solo entran mods que permitan distribución o que tengan URL oficial (por ejemplo, maven de FTB).
- 2026-10-24 · Mundo normal (ni skyblock ni vacío como inicio). Picar a mano sirve para arrancar y nunca es obligatorio para progresar.
- 2026-10-24 · Visor de recetas: EMI, con JEI instalado como base para los mods que solo traen plugin de JEI.
- 2026-10-24 · Mineral automático en vapor: Perforadora de vetas a vapor (nuestra). La veta se elige con una muestra que no se gasta y la broca se desgasta por probabilidad. La tabla de vetas es la misma para las perforadoras eléctricas de los tiers siguientes.
- 2026-10-24 · Madera y plantas automáticas en vapor: Invernadero de vapor (nuestro). El plantón o la semilla actúa como catalizador y no se gasta.
- 2026-10-24 · AE2 entra completo y se puede desbloquear entero en LV (lo pide el usuario).
- 2026-10-24 · "Working station" se interpreta como Crafting Station (edición J/EMI), a la espera de que el usuario lo confirme.
- 2026-10-24 · Las dimensiones Vacío y Llano se hacen con datapack vanilla dentro de KubeJS, con una llave de viaje que se gana por misión desde el principio. Los mods de dimensiones disponibles son pequeños y poco mantenidos.
- 2026-10-24 · ~~Misiones en español~~ → **Misiones en inglés** (cambio pedido por el usuario). Los nombres de objetos llevan `en_us` y `es_es`.
- 2026-10-24 · Los libros de misiones de otros packs se estudian y se copian o adaptan si la licencia lo permite, con atribución en CREDITS.md: Star Technology (MIT), Monifactory y Nomi-CEu (LGPL-3.0). GTNH (CC BY-NC-SA), TerraFirmaGreg (sin licencia) y GTL (licencia no clara) se usan solo como referencia.
- 2026-10-24 · Las pruebas se hacen en el PC de casa por SSH, solo dentro de `D:\GregtechGrindless`, con una JVM a la vez. Son 2-3 pruebas por tier (arranque, multibloques, integración) más una validación estática de que las recetas son alcanzables.
- 2026-10-24 · GTLCore queda fuera: está atado a GTM 1.4.4 y su licencia no es clara. GTL, GT Odyssey y GTNH sirven solo como fuente de ideas, sin copiar código, texto ni texturas.
- 2026-10-24 · Gregicality Science y Gregicality Multiblocks (MIT) se pueden portar con atribución. De Gregicality legacy y Susy-Core (GPL-3.0) solo se toman ideas.
- 2026-10-24 · Licencia del propio pack: pendiente de que la elija el usuario. Propuesta: LGPL-3.0 para el código y CC BY-SA 4.0 para las texturas.
- 2026-10-24 · EMI queda fijado en 1.1.22: la 1.1.24 choca en el cliente con AllTheLeaks (mixin de `EmiPlugin` cargado demasiado pronto). AllTheLeaks se queda.
- 2026-10-24 · Las pruebas de cliente usan OpenGL real por software (Mesa llvmpipe, en una copia privada del JDK en el PC de casa) y no el stub de LWJGL. Embeddium, ModernFix y LDLib no arrancan con el stub.
- 2026-10-24 · La perforadora y el invernadero de vapor no usan agua ni fertilizante: la escotilla ULV de fluidos solo se fabrica en ensambladora (LV). Las variantes con fluido y con fertilizante llegan con las máquinas LV.
- 2026-10-24 · Las vetas profundas (diamante, mica, redstone) solo se perforan con la broca de acero.
- 2026-10-24 · AE2 en LV, híbrida: solo se rehacen sus entradas con máquinas GT LV. Las prensas salen de la prensa de formado y no de los meteoritos, y el silicio de AE2 sale del horno de arco sumergido. El resto de AE2 se queda como viene.
- 2026-10-24 · El horno de arco sumergido hace obsidiana y no lava, porque la lava fabricada daba más energía en una caldera de la que costaba.
- 2026-10-24 · Drops de criaturas con un tipo de receta propio (simulador de criaturas LV–EV). Los modelos se imprimen sin matar nada; la primera perla de ender la da una misión. Un fermentador alimenta un simulador.
- 2026-10-24 · Las vetas del Nether solo se perforan en LV con lodo de perforación. Las del End se dejan para HV.
- 2026-10-24 · Mods añadidos por lotes probados en servidor y cliente: rendimiento, QoL, almacenamiento/logística y decoración (150 en total). Yeetus Experimentus quita el aviso de ajustes experimentales; Carry On no puede coger bloques de GT; Reliable EMI queda fuera (no es compatible con EMI 1.1.22).
- 2026-10-24 · Cada test de overlay usa su propia franja del Overworld (ver AGENTS.md), porque los tests corren a la vez en el mismo servidor.
