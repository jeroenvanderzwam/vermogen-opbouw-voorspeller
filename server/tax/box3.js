const TAX_CONSTANTS = require('./constants');

function berekenBox3(spaargeld, beleggingen, schulden = 0, fiscaalPartner = false, jaar = 2025) {
  const constants = TAX_CONSTANTS[jaar] || TAX_CONSTANTS[2025];
  const vrijstelling = fiscaalPartner
    ? constants.box3HeffingsvrijVermogen * 2
    : constants.box3HeffingsvrijVermogen;

  const totaalVermogen = spaargeld + beleggingen - schulden;
  const grondslag = Math.max(0, totaalVermogen - vrijstelling);

  if (grondslag <= 0) return 0;

  // Proportional split of grondslag
  const totaalBruto = spaargeld + beleggingen;
  const spaardeel = totaalBruto > 0 ? spaargeld / totaalBruto : 0;
  const beleggingsdeel = 1 - spaardeel;

  const fictiefRendement =
    grondslag * spaardeel * (constants.box3RentementspercentageSpaargeld / 100) +
    grondslag * beleggingsdeel * (constants.box3RendementspercentageBeleggingen / 100);

  return fictiefRendement * (constants.box3BelastingTarief / 100);
}

module.exports = { berekenBox3 };
