// priority: 1652
// Gregtech Grindless - names and tooltips of UXV's accretion disk skimmer, FRC former and BZ dynamo, and the strand coil
// (startup_scripts/grindless/uxv/cygnus_disk.js; package UXV-B3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   item.grindless.strand_coil, tooltip.grindless.strand_coil.N
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.accretion_disk_skimmer', 'Accretion Disk Skimmer', 'Écumador del disco de acreción'],
        ['block.gtceu.frc_former', 'FRC Former', 'Formador de FRC'],
        ['block.gtceu.bz_dynamo', 'BZ Dynamo', 'Dinamo BZ'],
        ['gtceu.disk_skimming', 'Disk Skimming', 'Écumado del disco'],
        ['gtceu.frc_forming', 'FRC Forming', 'Formación de FRC'],
        ['gtceu.blandford_znajek', 'Blandford-Znajek', 'Blandford-Znajek'],
        ['item.grindless.strand_coil', 'Strand Coil', 'Bobina de hebra'],
        ['tooltip.grindless.strand_coil.0', 'An FRC cartridge wound in strand tape.', 'Un cartucho de FRC bobinado con cinta de hebra.'],
        ['tooltip.grindless.strand_coil.1', 'Made in the naquadria magnet works; two go into a UXV field generator.', 'Se fabrica en la planta de imanes de naquadria; dos entran en un generador de campo UXV.'],

        ['grindless.machine.accretion_disk_skimmer.tooltip.0',
            'A shallow bowl facing the accretion disk, with a throat behind it: a magnetic scoop that takes the disk\'s plasma. It only runs in Cygnus X-1 orbit.',
            'Un cuenco poco profundo frente al disco de acreción, con una garganta detrás: una pala magnética que toma el plasma del disco. Solo funciona en la órbita de Cygnus X-1.'],
        ['grindless.machine.accretion_disk_skimmer.tooltip.1',
            'Circuit 1 skim: 1,000 mB of disk plasma at 134 MEU/t for 1,200 t. The scoop\'s metallic hydrogen winding wears 5% a run.',
            'Circuito 1 écumado: 1.000 mB de plasma de disco a 134 MEU/t durante 1.200 t. El devanado de hidrógeno metálico de la pala se desgasta un 5 % por ejecución.'],
        ['grindless.machine.accretion_disk_skimmer.tooltip.2',
            'Winding bus and energy go on the floor of the mouth, at the back; the plasma output behind the throat: 1 input bus, 1-2 energy hatches, 1 output hatch. Accepts a parallel hatch.',
            'El bus de devanados y la energía van en el suelo de la boca, detrás; la salida de plasma, tras la garganta: 1 bus de entrada, 1-2 escotillas de energía, 1 de salida. Acepta una escotilla de paralelos.'],
        ['grindless.machine.frc_former.tooltip.0',
            'A linear theta-pinch lying on its side: a coil-ringed formation tube, a capacitor bank and a capture chamber. It forms field-reversed plasmoids. Circuit 1 only runs in Cygnus X-1 orbit.',
            'Un theta-pinch lineal tumbado: un tubo de formación con anillos de bobinas, un banco de condensadores y una cámara de captura. Forma plasmoides de configuración invertida. El circuito 1 solo funciona en la órbita de Cygnus X-1.'],
        ['grindless.machine.frc_former.tooltip.1',
            'Circuit 1 cartridge: filtered disk plasma and four MH windings (10% worn) trap a plasmoid in a cartridge. Circuit 2 flux loading: filtered disk plasma becomes flux-loaded plasma and hydrogen.',
            'Circuito 1 cartucho: plasma de disco filtrado y cuatro devanados MH (10 % de desgaste) atrapan un plasmoide en un cartucho. Circuito 2 carga de flujo: el plasma de disco filtrado se convierte en plasma cargado de flujo e hidrógeno.'],
        ['grindless.machine.frc_former.tooltip.2',
            'Plasma goes in at the formation end, the back; the cartridge bus and outputs at the capture chamber, the front; energy on the capacitor bank: 1 input bus, 1 output bus, 1 input hatch, 1-2 output hatches, 1-2 energy hatches. Accepts a parallel hatch.',
            'El plasma entra por el extremo de formación, detrás; el bus del cartucho y las salidas, en la cámara de captura, delante; la energía, en el banco de condensadores: 1 bus de entrada, 1 de salida, 1 escotilla de entrada, 1-2 de salida, 1-2 de energía. Acepta una escotilla de paralelos.'],
        ['grindless.machine.bz_dynamo.tooltip.0',
            'A torus round a jet column: the Blandford-Znajek process, power from a black hole\'s spin. It is a generator and only runs in Cygnus X-1 orbit.',
            'Un toro alrededor de una columna de chorro: el proceso de Blandford-Znajek, energía del giro de un agujero negro. Es un generador y solo funciona en la órbita de Cygnus X-1.'],
        ['grindless.machine.bz_dynamo.tooltip.1',
            'Circuit 1: 400 mB of flux-loaded plasma give 1,073,741,824 EU/t for 200 t, one run at a time, through two UIV 16 A dynamo hatches or one UXV 16 A dynamo hatch.',
            'Circuito 1: 400 mB de plasma cargado de flujo dan 1.073.741.824 EU/t durante 200 t, una ejecución a la vez, por dos escotillas de dinamo UIV de 16 A o una UXV de 16 A.'],
        ['grindless.machine.bz_dynamo.tooltip.2',
            'The flux-plasma input sits on the front spoke and the dynamo hatches on the outer rim: 1 input bus, 1 input hatch, 1-2 dynamo hatches.',
            'La entrada de plasma de flujo va en el radio delantero y las escotillas de dinamo en el borde exterior: 1 bus de entrada, 1 escotilla de entrada, 1-2 escotillas de dinamo.'],

        ['emi.grindless.info.accretion_disk_skimmer.0',
            'The disk plasma it takes is the accretion disk\'s own, so the skimmer must stand in Cygnus X-1 orbit. It needs a hydrogen-cooled controller and a metallic hydrogen winding that wears slowly.',
            'El plasma de disco que toma es el del propio disco de acreción, así que el écumador debe estar en la órbita de Cygnus X-1. Necesita un controlador refrigerado con hidrógeno y un devanado de hidrógeno metálico que se desgasta despacio.'],
        ['emi.grindless.info.accretion_disk_skimmer.1',
            'Nothing is wasted: the plasma goes to the plasma mass filter, whose filtered disk plasma feeds the FRC former, and from there the cartridges, the field generator and the BZ dynamo\'s fuel.',
            'No se desperdicia nada: el plasma va al filtro de masa de plasma, cuyo plasma de disco filtrado alimenta el formador de FRC, y de ahí los cartuchos, el generador de campo y el combustible del dinamo BZ.'],
        ['emi.grindless.info.frc_former.0',
            'Cartridges are formed in Cygnus X-1 orbit, where the disk plasma is, and carry the field-reversed plasmoid for the rest of the game. Flux loading works anywhere the plasma is carried.',
            'Los cartuchos se forman en la órbita de Cygnus X-1, donde está el plasma del disco, y llevan el plasmoide de configuración invertida el resto del juego. La carga de flujo funciona en cualquier sitio al que se lleve el plasma.'],
        ['emi.grindless.info.frc_former.1',
            'The cartridge makes the field generator\'s strand coil and shields the trip through Vela\'s wind. The plasma lost in flux loading recombines to 100 mB of hydrogen a run, which goes to stock.',
            'El cartucho hace la bobina de hebra del generador de campo y protege el viaje por el viento de Vela. El plasma perdido en la carga de flujo se recombina en 100 mB de hidrógeno por ejecución, que va a la reserva.'],
        ['emi.grindless.info.bz_dynamo.0',
            'It stands in Cygnus X-1 orbit beside the black hole: field lines threading the horizon carry the spin\'s power out through the jet. Only 400 mB of flux-loaded plasma are needed per 200 t.',
            'Está en la órbita de Cygnus X-1 junto al agujero negro: las líneas de campo que atraviesan el horizonte sacan la energía del giro por el chorro. Solo hacen falta 400 mB de plasma cargado de flujo cada 200 t.'],
        ['emi.grindless.info.bz_dynamo.1',
            'Generous, never free: skimming, filtering and flux loading the 400 mB cost about 1.3e11 EU; one run returns 2.15e11 EU, about 1.6 times the chain. It leaves nothing behind and its power is for the wireless network.',
            'Generosa, nunca gratis: écumar, filtrar y cargar de flujo los 400 mB cuesta unos 1,3e11 EU; una ejecución devuelve 2,15e11 EU, unas 1,6 veces la cadena. No deja residuos y su energía es para la red inalámbrica.'],

        ['gtceu.recipe.grindless_disk_skimming.skim_disk',
            'Circuit 1: the scoop takes 1,000 mB of the accretion disk\'s plasma; its metallic hydrogen winding wears 5%.',
            'Circuito 1: la pala toma 1.000 mB del plasma del disco de acreción; su devanado de hidrógeno metálico se desgasta un 5 %.'],
        ['gtceu.recipe.grindless_frc_forming.form_cartridge',
            'Circuit 1: a theta-pinch on four MH windings (10% worn) traps a field-reversed plasmoid in a cartridge.',
            'Circuito 1: un theta-pinch sobre cuatro devanados MH (10 % de desgaste) atrapa un plasmoide de configuración invertida en un cartucho.'],
        ['gtceu.recipe.grindless_frc_forming.load_flux',
            'Circuit 2: the pinch loads the plasma with flux for the BZ dynamo; the plasma lost recombines to hydrogen.',
            'Circuito 2: el pinch carga el plasma de flujo para el dinamo BZ; el plasma perdido se recombina en hidrógeno.'],
        ['gtceu.recipe.grindless_blandford_znajek.spin_down',
            'Circuit 1: field lines carry the black hole\'s spin out through the jet: 400 mB of flux-loaded plasma, 2^30 EU/t for 200 t.',
            'Circuito 1: las líneas de campo sacan el giro del agujero negro por el chorro: 400 mB de plasma cargado de flujo, 2^30 EU/t durante 200 t.'],
        ['gtceu.recipe.grindless_naquadria_magnets.strand_coil',
            'Circuit 9: four turns of strand tape wind an FRC cartridge on a tungsten steel former; cold-tested in the helium charge.',
            'Circuito 9: cuatro vueltas de cinta de hebra bobinan un cartucho de FRC sobre un molde de acero de wolframio; probada en frío con la carga de helio.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
