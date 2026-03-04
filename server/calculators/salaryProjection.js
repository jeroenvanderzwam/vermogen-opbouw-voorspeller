const { berekenNettoloon } = require('../tax/inkomstenbelasting');
const { berekenBox3 } = require('../tax/box3');

function calculateSalaryProjection(data) {
  const { profile, loon, bankrekeningen, deGiroPortfolio, nnWerkgeversPensioen, deGiroPersoonlijkPensioen, woning } = data;

  const huidigJaar = new Date().getFullYear();
  const geboortejaar = profile.geboortejaar;
  const huidigLeeftijd = huidigJaar - geboortejaar;
  const doelleeftijd = profile.doelleeftijd || 40;
  const doelJaar = geboortejaar + doelleeftijd;

  // Parse house sale date
  let verkoopJaar = null;
  let verkoopMaand = null;
  if (woning.verkoopGepland && woning.verwachteVerkoopDatum) {
    const parts = woning.verwachteVerkoopDatum.split('-');
    verkoopJaar = parseInt(parts[0]);
    verkoopMaand = parseInt(parts[1]) || 1;
  }

  // Initial values
  let brutoMaandloon = loon.brutoMaandloon;
  let maandelijkseUitgaven = loon.maandelijkseUitgaven;
  const loongroeiPct = (data.loongroei !== undefined ? data.loongroei : loon.verwachteLoongroei) / 100;
  const inflatiePct = (data.inflatie !== undefined ? data.inflatie : loon.inflatie) / 100;
  const portfolioRendement = (data.rendement !== undefined ? data.rendement : deGiroPortfolio.verwachtJaarlijksRendement) / 100;

  // Bank saldo: only savings accounts earn interest
  let bankSaldo = bankrekeningen.reduce((sum, r) => sum + r.saldo, 0);
  const spaarSaldo = bankrekeningen
    .filter(r => r.type === 'spaarrekening')
    .reduce((sum, r) => sum + r.saldo, 0);
  const spaarRente = bankrekeningen
    .filter(r => r.type === 'spaarrekening')
    .reduce((sum, r) => {
      const saldoRatio = spaarSaldo > 0 ? r.saldo / spaarSaldo : 0;
      return sum + r.rente * saldoRatio;
    }, 0) / 100;

  let currentSpaarSaldo = spaarSaldo;
  let currentBetaalSaldo = bankSaldo - spaarSaldo;

  // Portfolio saldo
  let portfolioSaldo = deGiroPortfolio.huidigeSaldo;
  const portfolioMaandelijksInleg = deGiroPortfolio.maandelijkseInleg;

  // Persoonlijk pensioen
  let persoonlijkPensioenSaldo = deGiroPersoonlijkPensioen.huidigSaldo;
  const persoonlijkPensioenInleg = deGiroPersoonlijkPensioen.maandelijkseInleg;
  const persoonlijkPensioenRendement = deGiroPersoonlijkPensioen.verwachtRendement / 100;

  // Werkgevers pensioen
  let werkgeversPensioenSaldo = nnWerkgeversPensioen.opgebouwdKapitaal;
  const pensioenLeeftijd = nnWerkgeversPensioen.verwachtPensioenLeeftijd || 67;
  const werkgeversBijdrage = nnWerkgeversPensioen.maandelijkseWerkgeversBijdrage;
  const werknemersBijdrage = nnWerkgeversPensioen.maandelijkseWerknemersBijdrage;
  const pensioenRendement = nnWerkgeversPensioen.pensioenrendement / 100;

  // Woning
  let woningwaarde = woning.woningwaarde;
  let hypotheekSchuld = woning.hypotheekSchuld;
  let woningVerkocht = false;
  let overwaardeVrij = 0;

  const snapshots = [];

  for (let jaar = huidigJaar; jaar <= doelJaar; jaar++) {
    const leeftijd = jaar - geboortejaar;

    // Is this the year the house is sold?
    if (!woningVerkocht && verkoopJaar && jaar >= verkoopJaar) {
      const verkoopkosten = woningwaarde * 0.02;
      overwaardeVrij = woningwaarde - hypotheekSchuld - verkoopkosten;
      // Add freed equity to portfolio
      portfolioSaldo += Math.max(0, overwaardeVrij);
      woningwaarde = 0;
      hypotheekSchuld = 0;
      woningVerkocht = true;
    }

    // Calculate annual income
    const brutoJaarloon = brutoMaandloon * 12;
    const nettoJaarloon = berekenNettoloon(brutoJaarloon);
    const jaarlijkseUitgaven = maandelijkseUitgaven * 12;

    // Jaarsaldo (income minus expenses)
    const jaarsaldo = nettoJaarloon - jaarlijkseUitgaven;

    // Bank saldo: compound savings account interest
    currentSpaarSaldo = currentSpaarSaldo * (1 + spaarRente);

    // Portfolio: annual growth + monthly investments + surplus income
    const jaarlijksePortfolioInleg = portfolioMaandelijksInleg * 12;
    const surplusInvestment = jaarsaldo > jaarlijksePortfolioInleg ? jaarsaldo - jaarlijksePortfolioInleg : 0;
    portfolioSaldo = portfolioSaldo * (1 + portfolioRendement) + jaarlijksePortfolioInleg + surplusInvestment;

    // Personal pension growth
    persoonlijkPensioenSaldo = persoonlijkPensioenSaldo * (1 + persoonlijkPensioenRendement) +
      persoonlijkPensioenInleg * 12;

    // Employer pension growth
    werkgeversPensioenSaldo = werkgeversPensioenSaldo * (1 + pensioenRendement) +
      (werkgeversBijdrage + werknemersBijdrage) * 12;

    // Woning appreciation (if not sold)
    if (!woningVerkocht && woningwaarde > 0) {
      woningwaarde = woningwaarde * (1 + woning.jaarlijkseWaardegroei / 100);
    }

    const overwaarde = woningVerkocht ? 0 : Math.max(0, woningwaarde - hypotheekSchuld);
    bankSaldo = currentSpaarSaldo + currentBetaalSaldo;

    // Box 3 tax (on bank savings + portfolio)
    const box3Belasting = berekenBox3(
      currentSpaarSaldo,
      portfolioSaldo,
      0,
      profile.fiscaalPartner
    );

    // Pension only shown from retirement age
    const pensioensaldo = leeftijd >= pensioenLeeftijd
      ? werkgeversPensioenSaldo + persoonlijkPensioenSaldo
      : 0;

    const totaalVermogen = bankSaldo + portfolioSaldo - box3Belasting + overwaarde;

    snapshots.push({
      jaar,
      leeftijd,
      brutoJaarloon: Math.round(brutoJaarloon),
      nettoJaarloon: Math.round(nettoJaarloon),
      jaarlijkseUitgaven: Math.round(jaarlijkseUitgaven),
      jaarsaldo: Math.round(jaarsaldo),
      bankSaldo: Math.round(bankSaldo),
      portfolioSaldo: Math.round(portfolioSaldo),
      persoonlijkPensioenSaldo: Math.round(persoonlijkPensioenSaldo),
      werkgeversPensioenSaldo: Math.round(werkgeversPensioenSaldo),
      pensioensaldo: Math.round(pensioensaldo),
      overwaarde: Math.round(overwaarde),
      box3Belasting: Math.round(box3Belasting),
      totaalVermogen: Math.round(totaalVermogen),
      woningVerkocht,
    });

    // Grow salary and expenses for next year
    brutoMaandloon = brutoMaandloon * (1 + loongroeiPct);
    maandelijkseUitgaven = maandelijkseUitgaven * (1 + inflatiePct);
  }

  return snapshots;
}

module.exports = { calculateSalaryProjection };
