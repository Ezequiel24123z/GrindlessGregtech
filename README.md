# Gregtech Grindless

Pack de GregTech enorme para Minecraft 1.20.1 (Forge) sobre GregTech Modern 7.5.3. Junta lo mejor de los packs técnicos y de GregTech con una regla: **aquí no se recolecta a mano**. Todo recurso básico que pida la progresión se puede generar de forma automática dentro de su era, desde la Steam Age. El procesado sigue siendo GregTech de verdad, y la dificultad sube por complejidad, no por cantidad ni por esperas.

## Estado

| Era | Estado |
|---|---|
| Vapor | Jugable desde `v0.1.0`: coque, bronce, vapor, acero, perforadora de vetas e invernadero de vapor propios, y puerta a LV. |
| LV | Jugable desde `v0.2.0`: perforadora e invernadero LV, horno de arco sumergido, simulador de criaturas, AE2 entera en LV y 150 mods. |
| MV | Jugable desde `v0.3.0`: planta de mineral, biorrefinería, perforadora e invernadero MV, petróleo infinito (también en el Llano y el Vacío) y 207 mods. |
| HV | Jugable desde `v0.4.0`: refinería (destila, hidrotrata y craquea en una pasada), reformador, perforadora HV con vetas del End e invernadero HV. |
| Lo que viene | El pack se convierte en un viaje hasta el agujero negro del centro de la galaxia. La primera parada es la Luna, al final de HV. |

## Cómo jugar (Prism Launcher)

**Canal jugable (recomendado).** Se actualiza solo y conserva tu mundo.

1. Descarga `Gregtech-Grindless-jugable.zip` de la [versión "Canal jugable"](https://github.com/Ezequiel24123z/GrindlessGregtech/releases/tag/canal-jugable).
2. En Prism: *Añadir instancia → Importar → elige el zip*.
3. Arranca. La primera vez descarga unos 400 MB de mods.

Antes de cada arranque, la instancia se pone al día desde la rama `jugable`, que solo avanza a versiones probadas. FTB Backups 2 hace copias del mundo en la carpeta `backups` de la instancia.

**Una versión fija.** Crea una instancia de Minecraft 1.20.1 con Forge 47.4.28 y Java 17. Pon [packwiz-installer-bootstrap.jar](https://github.com/packwiz/packwiz-installer-bootstrap/releases) en la carpeta `minecraft` de la instancia. Después, en *Editar instancia → Ajustes → Comandos personalizados*, pon como comando previo al lanzamiento:

```
"$INST_JAVA" -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/Ezequiel24123z/GrindlessGregtech/v0.4.0/pack/pack.toml
```
## Para desarrollar

Lee [AGENTS.md](AGENTS.md). Las decisiones están en [DECISIONS.md](DECISIONS.md) y los créditos y licencias en [CREDITS.md](CREDITS.md).
