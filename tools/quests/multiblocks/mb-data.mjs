// The few hand choices of the Multiblocks chapter (docs/quests.md; gen.mjs does the rest from a gg_dump).

export const CHAPTER = {
  file: 'multiblocks',
  title: 'Multiblocks',
  subtitle: 'Every multiblock controller you can build, tier by tier',
  // "Quality of Life" group; its chapters use order_index 0-5
  groupId: '7C6BF927E205E2F4',
  order: 6,
  icon: 'gtceu:electric_blast_furnace',
};

// Band order, top to bottom. A band with no controllers is skipped; a later tier is added here when it lands.
export const TIERS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max'];

// The tiers whose gate decides where a controller of the other mods goes: every tier up to the dump's implemented era
// that has a tools/analysis/tiers/<tier>.json.
export const gateTiers = (implemented, hasConfig) => TIERS.slice(0, TIERS.indexOf(implemented) + 1).filter(hasConfig);

export const TIER_NAMES = {
  steam: 'Steam', lv: 'LV', mv: 'MV', hv: 'HV', ev: 'EV', iv: 'IV', luv: 'LuV', zpm: 'ZPM', uv: 'UV', uhv: 'UHV',
  uev: 'UEV', uiv: 'UIV', uxv: 'UXV', opv: 'OpV', max: 'MAX',
};

// A band's label icon: the tier's machine hull; Steam has no hull, so its bronze casing.
export const LABEL_ICON_OVERRIDES = { steam: 'gtceu:bronze_machine_casing' };
export const labelIcon = (tier) => LABEL_ICON_OVERRIDES[tier] || `gtceu:${tier}_machine_hull`;

// Era folders of startup_scripts/grindless/: a multiblock registered there shows in that tier's band.
export const ERA_FOLDERS = new Set(TIERS);

// Display names of the mods a controller can come from (the subtitle). gtceu: is "GregTech" (ours is "Grindless").
export const MOD_NAMES = {
  gtceu: 'GregTech',
  gtca: 'GT Community Additions',
  extendedfeatures: 'GTM Extended Features',
  gtnn: 'GT--',
  gcyr: 'Gregicality Rocketry',
  gtmutils: 'GregTech Modern Utilities',
};

// A controller placed by hand, each with its reason: id -> { tier, why }. Empty: every placement is computed.
export const OVERRIDES = {};
