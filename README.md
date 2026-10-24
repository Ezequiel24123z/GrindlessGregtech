# Gregtech Grindless

Pack de GregTech enorme para Minecraft 1.20.1 (Forge) sobre GregTech Modern 7.5.3. Junta lo mejor de los packs técnicos y de GregTech con una regla: **aquí no se recolecta a mano**. Todo recurso básico que pida la progresión se puede generar de forma automática dentro de su era, desde la Steam Age. El procesado sigue siendo GregTech de verdad, y la dificultad sube por complejidad, no por cantidad ni por esperas.

## Estado

| Era | Estado |
|---|---|
| Vapor | Jugable desde `v0.1.0`: coque, bronce, vapor, acero, perforadora de vetas e invernadero de vapor propios, y puerta a LV. |
| LV | Jugable desde `v0.2.0`: perforadora e invernadero LV, horno de arco sumergido, simulador de criaturas, AE2 entera en LV y 150 mods. |
| MV | En desarrollo: planta de mineral, biorrefinería, perforadora e invernadero MV, petróleo y polímeros. |

## Cómo jugar (Prism Launcher)

1. Crea una instancia de Minecraft 1.20.1 con Forge 47.4.28 y Java 17.
2. Descarga [packwiz-installer-bootstrap.jar](https://github.com/packwiz/packwiz-installer-bootstrap/releases) en la carpeta `minecraft` de la instancia.
3. En *Editar instancia → Ajustes → Comandos personalizados*, pon como comando previo al lanzamiento:

   ```
   "$INST_JAVA" -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/Ezequiel24123z/GrindlessGregtech/v0.2.0/pack/pack.toml
   ```

4. Arranca. packwiz descarga los mods desde sus fuentes oficiales y los mantiene en la versión fijada.

Al crear el mundo sale un aviso de "ajustes experimentales" por las dimensiones del pack; dale a continuar.

## Para desarrollar

Lee [AGENTS.md](AGENTS.md). Las decisiones están en [DECISIONS.md](DECISIONS.md) y los créditos y licencias en [CREDITS.md](CREDITS.md).
