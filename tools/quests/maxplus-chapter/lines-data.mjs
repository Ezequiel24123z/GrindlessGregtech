// Quest data for the MAX+ process lines that earlier quests only touch: the horizon processor module stage (X1), the iris blade (X2), the Kerr ribbon (X3),
// iron-56 (X5), the HD and helium-3 polarisation (X6) and the thorium navigation clock (X7). Recipes read from the VM dump (9f6c31872), not from the design doc.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: {
    name: 'Horizon lines',
    origin: { x: 22, y: 12 },
    heading: {
      key: 'H_MXL', x: 0, y: 3, deps: ['CI_EMIT'], icon: 'grindless:horizon_processor',
      desc: ['Six process lines the earlier chapters only name: the module stage of the horizon processor, the iris blade, the Kerr ribbon, iron-56, the HD and helium-3 polarisation, and the thorium clock. Each is a real chain; follow the ones you need.'],
    },
  },
};

const l = (key, title, icon, deps, x, y, teach, xpN, task = it(icon, 1)) => ({
  key, kind: 'process', title, icon, deps, x, y, teach, desc: [], tasks: [task], rewards: [xp(xpN)],
});

export const QUESTS = [
  l('LN_STACK', 'Stacked Horizon Module', 'grindless:stacked_horizon_module', ['H_MXL'], 1.5, 0, {
    for: 'Step 30 of the horizon processor line: a shielded quantum module with two horizon logic dies stacked on it by magnetic tunnel junction sputtering.',
    needs: 'The MTJ sputter cluster, 2,400 ticks: a shielded quantum module, two horizon logic dies and programmed circuit 28. 5% of the time it also leaves horizon module scrap.',
    unlocks: 'The linked module. The scrap is leached back into the extraction cascade, so no module is ever lost.',
    automate: 'Modules and dies by ME; send the scrap to the cascade by bus.',
  }, 100),
  l('LN_LINK', 'Linked Horizon Module', 'grindless:linked_horizon_module', ['LN_STACK'], 4, 0, {
    for: 'Step 31: the stack is wired to a horizon interposer by a femtosecond laser, so that the dies share one bus.',
    needs: 'The femtosecond writer, 2,400 ticks: a stacked horizon module, a horizon interposer and programmed circuit 21.',
    unlocks: 'The condensate-cooled module.',
    automate: 'One interposer per module by ME.',
  }, 100),
  l('LN_COOL', 'Condensate-Cooled Module', 'grindless:condensate_cooled_module', ['LN_LINK'], 6.5, 0, {
    for: 'Step 32: the linked module is soaked in Kerr condensate, which holds it at a steady temperature before the final test.',
    needs: 'The condensate refinery, 1,800 ticks: a linked horizon module, a full tank of Kerr condensate and programmed circuit 12.',
    unlocks: 'The tested module.',
    automate: 'Condensate by pipe from the Kerr condensate line.',
  }, 100),
  l('LN_TEST', 'Tested Horizon Module', 'grindless:tested_horizon_module', ['LN_COOL'], 9, 0, {
    for: 'Step 33: the module is cooled to a few millikelvin and tested; only a module that passes continues.',
    needs: 'The millikelvin cryostat works, 2,400 ticks: a condensate-cooled module, a millikelvin cryostat module, programmed circuit 13 and a little helium-3/helium-4 mixture. The mixture is returned, so it only has to be topped up.',
    unlocks: 'The horizon processor.',
    automate: 'Keep the mixture in a loop; cryostat modules by ME.',
  }, 100),
  l('LN_PROC', 'Horizon Processor', 'grindless:horizon_processor', ['LN_TEST'], 11.5, 0, {
    for: 'Step 34, the end of the qubit stage: the tested module is joined to a quantum memory node and a Rydberg logic array. It is the processor of the MAX+ circuits.',
    needs: 'The photonic integration hall, 6,000 ticks: a tested horizon module, a quantum memory node, a Rydberg logic array, two MAX circuits (any) and programmed circuit 14.',
    unlocks: 'The MAX+ processor circuits and the machines that need them.',
    automate: 'Memory nodes and arrays by ME; the five stages run one after another, so a buffer between them keeps the line full.',
  }, 200),

  l('LN_CHARGE', 'Strange Alloy Charge', 'grindless:strange_alloy_charge', ['H_MXL'], 1.5, 1.5, {
    for: 'Step 1 of the iris blade: strangelets melted into tungsten, so that the blade metal holds a strange phase.',
    needs: 'The levitation melter, 2,400 ticks: four fed strangelets, four tungsten dust, helium and programmed circuit 23. Half the time it leaves melter dross.',
    unlocks: 'The oriented blade blank.',
    automate: 'Fed strangelets by ME from the strangelet line; the dross goes to the voiding line.',
  }, 100),
  l('LN_BLANK', 'Oriented Blade Blank', 'grindless:oriented_blade_blank', ['LN_CHARGE'], 4, 1.5, {
    for: 'Step 2: a single crystal of tantalum carbide and rhenium, grown with one grain direction so the blade does not crack along it.',
    needs: 'The single crystal foundry, 1,200 ticks: four Kerr strange plates, 16 tantalum carbide dust, eight rhenium dust, programmed circuit 29 and a little argon, for two blanks.',
    unlocks: 'The densified blade.',
    automate: 'Plates and dust by ME; argon by pipe.',
  }, 100),
  l('LN_DENSE', 'Densified Blade', 'grindless:densified_blade', ['LN_BLANK'], 6.5, 1.5, {
    for: 'Step 3: the blank is pressed at a megabar to close every pore.',
    needs: 'The megabar press, 900 ticks: two oriented blade blanks, four tantalum carbide plates and programmed circuit 18, for two blades.',
    unlocks: 'The edged blade.',
    automate: 'Blanks and plates by ME.',
  }, 100),
  l('LN_EDGE', 'Edged Blade', 'grindless:edged_blade', ['LN_DENSE'], 9, 1.5, {
    for: 'Step 4: the blade is turned to its edge. The swarf is tantalum carbide dust, which goes back into the blank.',
    needs: 'A lathe, 600 ticks: one densified blade. It returns one tantalum carbide dust.',
    unlocks: 'The coated blade.',
    automate: 'Send the dust back to the foundry by bus.',
  }, 100),
  l('LN_COAT', 'Coated Iris Blade', 'grindless:coated_iris_blade', ['LN_EDGE'], 11.5, 1.5, {
    for: 'Step 5: a niobium nitride coat, laid by electron beam, makes the edge hold against the horizon.',
    needs: 'The electron beam furnace, 900 ticks: two edged blades, two niobium nitride plates and argon, for two blades. Most of the argon is returned.',
    unlocks: 'The iris blade.',
    automate: 'Keep the argon in a loop.',
  }, 100),
  l('LN_BLADE', 'Iris Blade', 'grindless:iris_blade', ['LN_COAT'], 14, 1.5, {
    for: 'Step 6 of the iris blade: the blade of the Horizon Iris, the part of the Hyperstargate that opens and closes the ring.',
    needs: 'The hyper assembly array, 1,200 ticks: a coated iris blade, 12 horizon compressed plates, eight Kerr strange plates, two MAX+ electric pistons, a MAX+ conveyor module, programmed circuit 5 and a large tank of Kerr condensate.',
    unlocks: 'The Horizon Iris.',
    automate: 'The six steps are one line; plates and pistons by ME, condensate by pipe.',
  }, 200),

  l('LN_HDMIX', 'HD Equilibrium Mix', 'gtceu:hd_equilibrium_mix_bucket', ['H_MXL'], 1.5, 3, {
    for: 'Step 1 of the helium-3 polarisation line: primordial deuterium and hydrogen are made to meet on platinum, so half of the molecules become HD.',
    needs: 'A chemical reactor, 400 ticks: one platinum dust, primordial deuterium and hydrogen in equal parts, for twice that of HD equilibrium mix.',
    unlocks: 'Pure HD.',
    automate: 'Hydrogen and deuterium by pipe; platinum by ME.',
  }, 100, ck()),
  l('LN_PUREHD', 'Pure HD', 'gtceu:pure_hd_bucket', ['LN_HDMIX'], 4, 3, {
    for: 'Step 2: the mix is distilled. The plain hydrogen and deuterium that come out go back into the reactor.',
    needs: 'A distillation tower, 400 ticks: the mix gives pure HD, and half as much again returns as hydrogen and primordial deuterium in equal parts.',
    unlocks: 'Frozen-spin HD.',
    automate: 'Pipe the two returned fluids back to step 1: the loop is closed.',
  }, 100, ck()),
  l('LN_FROZEN', 'Frozen-Spin HD', 'grindless:frozen_spin_hd', ['LN_PUREHD'], 6.5, 3, {
    for: 'Step 3: HD cooled to a few millikelvin in a field keeps its spins in line. It is the spin-ordered target of the horizon fusion lines.',
    needs: 'The nuclear demagnetisation cooler, 2,400 ticks: pure HD, for one frozen-spin HD.',
    unlocks: 'Spin-ordered targets for the horizon fusion lines.',
    automate: 'Pure HD by pipe; the target out by bus.',
  }, 100),
  l('LN_PHE3', 'Polarised Helium-3', 'gtceu:polarized_helium_3_bucket', ['LN_FROZEN'], 9, 3, {
    for: 'Step 4: pristine helium-3 is pumped with a MAX emitter so that its spins line up. It feeds the polarised fusion stellarator.',
    needs: 'The photonic foundry, 1,200 ticks: pristine helium-3 and a MAX emitter, which is only rarely used up.',
    unlocks: 'Polarised fusion.',
    automate: 'Pristine helium-3 by pipe from its line; replace emitters from ME.',
  }, 150, ck()),

  l('LN_FE56', 'Iron-56', 'gtceu:iron_56_plate', ['H_MXL'], 1.5, 4.5, {
    for: 'The iron of the shield casings, recovered from the spent Fe-56 cask of the nickel-56 line.',
    needs: 'The hot cell, 600 ticks: a spent Fe-56 cask and programmed circuit 26 give a stack of iron-56 in dust form and some lead plate. The dust is pressed to plate as any metal.',
    unlocks: 'The Fe-56 shield casing, the primordial cryostat casing, the void diamond window and the horizon gate casing.',
    automate: 'Casks by ME from the nickel-56 line; the lead returns to the lead stock.',
  }, 100),
  l('LN_RIBBON', 'Kerr Ribbon', 'grindless:kerr_ribbon', ['H_MXL'], 1.5, 6, {
    for: 'The ribbon of the tether: sixteen Kerr strand wires laid on a ribbon segment. It carries the load that the proof test then confirms.',
    needs: 'The tether ribbon works, 800 ticks: 16 Kerr strand wires, a tether ribbon segment and programmed circuit 14. The proof test then loads two ribbons with liquid helium, which is returned as gas.',
    unlocks: 'The proof-loaded ribbon of the star-lift tether.',
    automate: 'Wire by ME; the helium goes through a cooler back to liquid.',
  }, 100),
  l('LN_CLOCK', 'Thorium Navigation Clock', 'grindless:thorium_nav_clock', ['LN_RIBBON'], 4, 6, {
    for: 'The clock of the launch line: two nuclear clocks and thorium plate tuned together, so that a probe knows where it is by the beat of a nucleus.',
    needs: 'The nuclear clock lab, 1,200 ticks: two nuclear clocks, eight thorium plate, programmed circuit 9 and argon.',
    unlocks: 'The navigation core of the probe.',
    automate: 'Clocks from their own line by ME; argon by pipe.',
  }, 100),
];
