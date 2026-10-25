# Test bench (home PC)

It uploads `pack/` (plus `tools/test/overlay/`) to the home PC, starts a **clean** server or client (new world, no previous state) and returns logs and a PASS/FAIL summary. All the heavy work runs there, in `D:\GregtechGrindless`; here it is only launched and read.

## How to run it

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Suite server `
  -Commands 'kubejs custom_command gg_ping' -WaitForLog 'GGTEST\|PING\|PASS'
```

| Suite | What it does | Success |
|---|---|---|
| `server` | Dedicated Forge (normal world, fixed seed): starts until `Done`, runs `-Commands` over RCON, waits for the `-WaitForLog` patterns, stops with `stop`. | It starts, the commands respond, the markers appear, clean shutdown. |
| `client` | HeadlessMC + mc-runtime-test: creates a world with one player and exits. The client is the pack's **real** client (Embeddium, ImmediatelyFast, …) with software OpenGL (see "Client without GPU"). | Exit code 0, `Successfully finished.`, no crash report. |
| `both` | Server and then client (one slot on the PC). | Both. |

Useful parameters (all optional):

- `-Commands 'cmd1;;cmd2'`: RCON commands, in order, or `-CommandsFile` (one per line). **With `-File`, PowerShell does not split lists on commas: use `;;`.**
- `-WaitForLog 'regex1;;regex2@@90'`: expressions that must appear in `logs\kubejs\server.log` or `latest.log` (the `@@90` sets their deadline in seconds; default `-WaitTimeoutSec 180`).
- `-Flat` flat world; `-Seed`; `-ServerXms/-ServerXmx` (4G/7G); `-ServerProp 'difficulty=peaceful'`.
- `-BootTimeoutSec` (900), `-ClientTimeoutSec` (1800), `-CommandTimeoutSec` (300), `-LockWaitMin` (120).
- `-SettleSec` (15): after `Done`, the server waits at least this long before RCON/`-Commands`, and longer while a datapack reload is in progress (e.g. the one that Additional Placements triggers ~2 s after `Done` and that restarts the KubeJS scripts). Its own stage `settle` (`results\server\settle.txt` lists what was detected); `0` disables it. If a reload starts later than the minimum, raise it.
- `-Slots` (2): how many Minecraft JVMs can run at the same time on the PC; `-Slots 1` = just one, as before. `-SlotMinFreeGb` (9): available RAM needed to share the PC (see "The home PC").
- `-ClientRenderer mesa|stub` (default `mesa`) and `-ClientExclude 'regex;;regex'` (only useful with `stub`; see below).
- `-Strict` also fails on WARN stages, ERROR lines that are not allowed, or KubeJS errors.
- `-SkipRefresh` (only if the index is already fresh: the bench checks this before uploading and warns if it is not), `-PackDir`, `-OverlayDir`, `-OutDir`, `-ShowWarnings`.
- There is no `-KeepServerRunning`: the server always stops when it finishes.

Before uploading, `tools\Update-PackIndex.ps1` sets the text files in `pack/` to UTF-8 without BOM and LF, and runs `packwiz refresh`.

## Client without GPU or window

The home PC is driven over SSH (Windows session 0: no monitor and no desktop), and HeadlessMC's `-lwjgl` is a stub whose `glFenceSync` returns 0, which crashes Embeddium (`Failed to create fence object`, with no config option). That is why the default mode (`-ClientRenderer mesa`) uses **real OpenGL on the CPU** and does not touch the mod set:

- **Mesa llvmpipe** (pal1000/mesa-dist-win 26.2.4): Mesa's `opengl32.dll` next to `java.exe` in a **private copy** of JDK 17 (`D:\GregtechGrindless\tools\jdk17-mesa`; the system JDK is not modified) and `GALLIUM_DRIVER=llvmpipe`. It provides OpenGL 4.6 without a GPU. The bench checks that the game JVM loaded Mesa's `opengl32.dll`/`libgallium_wgl.dll` (`Mesa llvmpipe GL confirmed` in the `client-launch` stage), and the overlay logs `GGTEST|CLIENT-GL|renderer=…`.
- **Real LWJGL**: HeadlessMC turns on its stub when it runs with `--offline` and an "offline" account; a fake account from another provider in `hmc\home-mesa\.auth` avoids it (the game only logs an authentication 401, which is in the allowlist).
- **No monitor**: `earlyWindowControl = false` is set in `config\fml.toml` for the test client only (Forge's startup window aborts without a monitor).
- **"Experimental Settings" warning**: because the pack ships worldgen data, Minecraft asks when a world is created, and mc-runtime-test cannot answer. `overlay/kubejs/startup_scripts/gg_test_client.js` presses "Yes" (a Forge tick event; KubeJS's `ClientEvents.tick` does not fire without a world).
- To keep it light, `renderDistance:4`, `simulationDistance:5` and `maxFps:30` are forced. If the client hangs, `-ClientTimeoutSec` kills it and leaves `hang-jstack.txt` and `hang-jcmd.txt` (live threads and open screens) in `results\client\`.

`-ClientRenderer stub` (HeadlessMC `-lwjgl`, no OpenGL) **does not work for this pack**; it is only kept as a plan B for small packs. Tested with the real client: the stub first takes down Embeddium (`Failed to create fence object`, it has no config option), then ModernFix (`StbStitcher`: `Struct cannot be cast to STBRPRect`) and then GTM's LDLib (`GL Shader Allocation Fail!`); removing all of them is no longer "the real client". By default the stub removes only Embeddium (`-ClientExclude '^embeddium[-_+0-9]'`; `-ClientExclude none` to remove nothing). `pack/` is never touched.

## Result

Output goes to the console and is saved in `-OutDir` (by default `…\files\test-runs\<date>-<suite>\`):

- `summary.txt` / `summary.json`: stages with status and duration, `GGTEST|` lines, crash reports (with the cause), KubeJS errors, and `ERROR` lines that are not in `log-allowlist.txt`.
- `results\server\` and `results\client\`: `logs\latest.log`, `debug.log`, `logs\kubejs\*.log`, `crash-reports\`, `hs_err\`, `kubejs-exported\` (whatever a test writes to `kubejs/exported/`), `mods.txt`, `rcon.log`, `settle.txt` (server); on the client also `client-hmc-stdout.log` and, if it hangs, `hang-jstack.txt`/`hang-jcmd.txt`. Note: HeadlessMC kills the game as soon as a crash report appears, so the folder may come out empty (the cause is then taken from the log).
- Exit code: `0` PASS, `1` FAIL, `2` failure of the bench itself (no results).

FAIL if a stage fails, there is a crash report, or a `GGTEST|…|FAIL` line appears. `WARN` stages (KubeJS errors, forced stop) do not fail unless `-Strict` is used.

## Writing a test (overlay)

Scripts in `tools/test/overlay/` are copied **on top of** the instance on the home PC and never go into the pack. Example (`overlay/kubejs/server_scripts/gg_test_harness.js`):

```js
ServerEvents.customCommand('gg_ping', event => { console.info('GGTEST|PING|PASS'); return 1 })
```

It is run with `-Commands 'kubejs custom_command gg_ping'`. Output convention: `GGTEST|<suite>|<check>|PASS` or `|FAIL (detail)`; the summary counts them, and any `FAIL` makes the run fail. `GGTEST|READY` is printed when the server loads. The overlay also applies to the client (`startup_scripts/gg_test_client.js` and `client_scripts/gg_test_client.js` go there).

Tip for KubeJS 6.5 (Rhino), observed here: inside event handlers, `const`/`let` can throw `redeclaration of var X`; use `var` and `function () {}`. Also, KubeJS's `ClientEvents.tick` only fires when a world and player are loaded.

Vanilla names in KubeJS 2001.6.5: its mixins (`@RemapForJS`) rename some members for the scripts, and the Mojang name **does not exist** (nor the SRG name): `Entity#getYRot/getXRot` → `getYaw/getPitch`, `getUUID/getStringUUID` → `getUuid/getStringUuid`, `tickCount` → `age`, `Level#getGameTime` → `getTime`, `Level#dimension()` → `getDimensionKey`, `Player#closeContainer` → `closeMenu`, `Direction#getStepX/Y/Z` → `getX/Y/Z`; `Entity#level()` is hidden (use `getLevel()`). The full list is in the KubeJS and Rhino mixins (`EntityMixin`, `LevelMixin`, `ItemStackMixin`, `DirectionMixin`…). The `server` suite has no player: code that uses one is tested in the `client` suite.

### Tests with a real player (`client` suite)

In the `client` suite the overlay's server scripts run on the integrated server with the real `ServerPlayer`, and the two halves of a test (server and client, same JVM) talk to each other through a `ConcurrentHashMap` stored in `global`.

- **They are turned on with a marker**, because the client has no `-Commands`: copy `overlay/` to another folder, add `kubejs/config/<test>.json` = `{"enabled": true}` and run `-Suite client -OverlayDir <that folder>`. One marker per run: the tests move the same player.
  - `gg_test_dimension_keys.json`: the three travel keys with real right-click, there and back, and the warning when a key fails (`gg_test_dimension_keys.js` in `server_scripts/`, `client_scripts/` and `startup_scripts/`).
  - `gg_test_gcyr_flight.json`: GCYR's flight to the Moon and back (#91), the Rocket Scanner (#122) and the rocket's flames hitting its pilot. The scanner part also runs in the `server` suite: `-Commands 'kubejs custom_command gg_test_gcyr_flight' -WaitForLog 'GGTEST\|gcyr_flight\|DONE@@600'`.
- `gg_test_hidden.json`: what EMI shows with the hiding in `integration/hidden.js` (index and recipes: items from later eras and scrap are out; the perlite, Mars' rock, the titanium drill bit and the conversion of the old scheelite vein sample are in) and that JEI runs under EMI (`gg_test_hidden.js` in `server_scripts/` and `client_scripts/`). The server part (tags, recipes removed and kept) also runs in the `server` suite: `-Commands 'kubejs custom_command gg_test_hidden' -WaitForLog 'GGTEST\|hidden\|DONE'`.
- `gg_test_quest_book.json`: the quest book with a real player (`gg_test_quest_book.js` in `server_scripts/` and `client_scripts/`). It completes *Arrival* and *The Neutronium Toolbox* with `ftbquests change_progress`, claims their rewards with `TeamData#claimReward` (what the button does), checks the tools (GTM NBT, no wear, pickaxe and magnet, 3x3 mining hammer, description on the client) and takes screenshots of the open book in `kubejs/exported/gg_book_*.png`. Loading the book (quests and dependencies per chapter, item ids, the toolbox) runs in the `server` suite: `-Commands 'kubejs custom_command gg_test_quests' -WaitForLog 'GGTEST\|quests\|DONE@@900'`.
- **Keeping the client running:** mc-runtime-test exits when the player's `tickCount` reaches 100 with no screen open; the client half lowers it (`age`) while the test runs.
- **Real right-click:** the client half holds the use key down for one tick (`options.keyUse.setDown`) and Minecraft does the rest, as with the mouse.

`log-allowlist.txt`: one .NET regex per line for the harmless ERROR/WARN lines; keep it short and specific.

## The home PC

- It only writes to `D:\GregtechGrindless` (`tools`, `cache`, `sync`, `hmc`, `incoming`, `runs`). Never to PrismLauncher, `D:\Grindless` or `.minecraft`.
- **At most 2 JVMs at a time** (`-Slots`): each run takes a *slot*, a file `runs\.lock` (slot 0, the original lock) or `runs\.lock.1`, `.lock.2`… with PID and time (heartbeat every 30 s; expires after 60 min or when the PID no longer exists). Runs that wait queue up (FIFO) and check every 15 s. Rules: (1) the limit is min(own `-Slots`, the `-Slots` of each active run), and a run from an old version of the bench counts as exclusive; (2) to overlap with another run, you need **available** RAM (Windows' "Available" figure: free + reusable cache; the free list alone sits around 7 GB even at rest) >= `-SlotMinFreeGb` (9 GB) **minus** what the runs that are still starting their JVM are going to reserve (server 0.75·Xmx, client 6.5 GB; this is deducted for 40 s after the JVM starts, measured when the slot is taken and repeated every 15 s while waiting); (3) each slot has its own port window (slot 0: server 25565 / RCON 25575; slot 1: 25585 / 25595; …), so two runs never share a port.
- **Orphans**: only JVMs from runs whose slot has expired are killed (the server carries `-Dgg.run=<id>` on its command line; the client and packwiz-installer carry `runs\<id>\`). Never the JVM of another active slot, nor unrelated processes (PrismLauncher, `D:\Grindless`). Shared resources (downloads into `tools\`, Forge installation, the `sync\<pack>-<side>` directory and its copy) are protected with a system mutex; the client in slot N>0 uses its own `hmc\slotN\` (HeadlessMC's config and `.minecraft`; the first time, it installs Forge again). Any manual experiment that uses a JVM must take a slot and keep a short time limit.
- Caches: Forge per version (`cache\forge-server`), mods per pack and side (`sync\`; packwiz-installer downloads them once), HeadlessMC's client (`hmc\`), Mesa and its private JDK (`tools\mesa`, `tools\jdk17-mesa`). Each run copies what was synced to `runs\<id>\`; the last 3 are kept.
- A CurseForge mod that does not allow distribution makes `sync-*` fail: put its jar in `D:\GregtechGrindless\cache\manual-mods\`.
- The remote scripts (`tools/test/remote/*.ps1`) are copied to `tools\remote\<hash>\` only if missing: they are uploaded to a temporary folder, which is then renamed, so the final folder is always complete even when several runs upload at the same time.

## Files

`Invoke-GGTest.ps1` (local entry point) · `Show-GGResults.ps1` (summary; use it to re-read an old `-OutDir`) · `log-allowlist.txt` · `overlay/` · `remote/` (`gg-common`, `gg-tools`, `gg-server`, `gg-client`, `gg-collect`, `Run-GGTest`).
