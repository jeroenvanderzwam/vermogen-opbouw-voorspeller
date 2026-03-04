const TAX_CONSTANTS = require('./constants');

function berekenNettoloon(brutoJaar, jaar = 2025) {
  const constants = TAX_CONSTANTS[jaar] || TAX_CONSTANTS[2025];

  // Calculate Box 1 tax
  let belasting = 0;
  let restInkomen = brutoJaar;
  const schijven = constants.schijven;

  for (let i = 0; i < schijven.length; i++) {
    if (restInkomen <= 0) break;
    const schijf = schijven[i];
    const ondergrens = i > 0 ? schijven[i - 1].tot : 0;
    const schijfBreedte = schijf.tot === Infinity ? restInkomen : Math.min(schijf.tot - ondergrens, restInkomen);
    const belastbaarInSchijf = Math.max(0, Math.min(schijfBreedte, restInkomen));
    belasting += belastbaarInSchijf * (schijf.tarief / 100);
    restInkomen -= belastbaarInSchijf;
  }

  // Algemene heffingskorting
  let ahk = constants.algemeneheffingskorting.max;
  if (brutoJaar > constants.algemeneheffingskorting.afbouwInkomen) {
    ahk = Math.max(
      0,
      ahk - (brutoJaar - constants.algemeneheffingskorting.afbouwInkomen) * (constants.algemeneheffingskorting.afbouwPercentage / 100)
    );
  }

  // Arbeidskorting
  let ak = Math.min(constants.arbeidskorting.max, brutoJaar * 0.08231); // simplified phase-in
  if (brutoJaar > constants.arbeidskorting.afbouwInkomen) {
    ak = Math.max(
      0,
      ak - (brutoJaar - constants.arbeidskorting.afbouwInkomen) * (constants.arbeidskorting.afbouwPercentage / 100)
    );
  }

  const nettobelasting = Math.max(0, belasting - ahk - ak);
  return brutoJaar - nettobelasting;
}

module.exports = { berekenNettoloon };
