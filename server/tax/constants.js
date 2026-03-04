const TAX_CONSTANTS = {
  2025: {
    box3HeffingsvrijVermogen: 57000,
    box3RentementspercentageSpaargeld: 1.44,
    box3RendementspercentageBeleggingen: 6.17,
    box3BelastingTarief: 36,
    jaarruimteFranchise: 18475,       // AOW-franchise 2025
    jaarruimtePercentage: 30,          // WTP-percentage vanaf 2023
    jaarruimteFactorAMultiplier: 6.27, // Factor A vermenigvuldiger 2025
    jaarruimteMaximum: 35798,          // Absolute maximum jaarruimte 2025
    aowLeeftijd: 67,
    // Box 1 schijven 2025
    schijven: [
      { tot: 38441, tarief: 35.82 },
      { tot: 76817, tarief: 37.48 },
      { tot: Infinity, tarief: 49.50 },
    ],
    // Heffingskortingen (simplified)
    algemeneheffingskorting: { max: 3362, afbouwInkomen: 24814, afbouwPercentage: 6.63 },
    arbeidskorting: { max: 5052, afbouwInkomen: 39898, afbouwPercentage: 6.51 },
  }
};

module.exports = TAX_CONSTANTS;
