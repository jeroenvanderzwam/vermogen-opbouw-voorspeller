const { berekenBox3 } = require('../tax/box3');

function calculateFire(data, scenario = 'neutraal') {
  const { profile, loon, bankrekeningen, deGiroPortfolio, nnWerkgeversPensioen, deGiroPersoonlijkPensioen, woning } = data;

  const huidigJaar = new Date().getFullYear();
  const geboortejaar = profile.geboortejaar;
  const huidigLeeftijd = huidigJaar - geboortejaar;

  // Withdrawal rates per scenario
  const withdrawalRates = {
    pessimistisch: 0.03,
    neutraal: 0.04,
    optimistisch: 0.05,
  };

  // Returns per scenario (based on portfolio expected return)
  const baseReturn = deGiroPortfolio.verwachtJaarlijksRendement / 100;
  const scenarioReturns = {
    pessimistisch: baseReturn - 0.02,
    neutraal: baseReturn,
    optimistisch: baseReturn + 0.02,
  };

  const maandelijkseUitgaven = data.maandelijkseDoelUitgaven || loon.maandelijkseUitgaven;
  const jaarlijkseUitgaven = maandelijkseUitgaven * 12;

  // Current liquid wealth
  const bankSaldo = bankrekeningen.reduce((sum, r) => sum + r.saldo, 0);
  const portfolioSaldo = deGiroPortfolio.huidigeSaldo;

  // Freed house equity if applicable
  let overwaardeVrij = 0;
  if (woning.verkoopGepland && woning.verwachteVerkoopDatum) {
    const verkoopParts = woning.verwachteVerkoopDatum.split('-');
    const verkoopJaar = parseInt(verkoopParts[0]);
    if (verkoopJaar <= huidigJaar + 1) {
      const verkoopkosten = woning.woningwaarde * 0.02;
      overwaardeVrij = Math.max(0, woning.woningwaarde - woning.hypotheekSchuld - verkoopkosten);
    }
  }

  const huidigVermogen = bankSaldo + portfolioSaldo + overwaardeVrij;

  // AOW impact (reduces required withdrawal after 67)
  const aowMaand = 1400; // approximate gross AOW per month
  const aowJaar = aowMaand * 12;

  // Generate scenarios
  const scenarios = {};

  for (const [scenarioNaam, withdrawalRate] of Object.entries(withdrawalRates)) {
    const rendement = scenarioReturns[scenarioNaam];

    // Benodigdvermogen based on withdrawal rate
    const benodigdVermogen = jaarlijkseUitgaven / withdrawalRate;

    // AOW reduced required capital (after 67)
    const uitgatvNaAOW = Math.max(0, jaarlijkseUitgaven - aowJaar);
    const benodigdVermogenNaAOW = uitgatvNaAOW / withdrawalRate;

    // Annual savings
    const { berekenNettoloon } = require('../tax/inkomstenbelasting');
    const nettoJaarloon = berekenNettoloon(loon.brutoMaandloon * 12);
    const jaarlijksBespaard = nettoJaarloon - jaarlijkseUitgaven +
      deGiroPortfolio.maandelijkseInleg * 12;

    // Year-by-year projection
    let vermogen = huidigVermogen;
    const trajectory = [];
    let fireJaar = null;
    let fireLeeftijd = null;

    for (let i = 0; i <= 40; i++) {
      const jaar = huidigJaar + i;
      const leeftijd = huidigLeeftijd + i;

      if (i > 0) {
        vermogen = vermogen * (1 + rendement) + jaarlijksBespaard;
      }

      const bereikt = vermogen >= benodigdVermogen;

      if (bereikt && fireJaar === null) {
        fireJaar = jaar;
        fireLeeftijd = leeftijd;
      }

      trajectory.push({
        jaar,
        leeftijd,
        vermogen: Math.round(vermogen),
        benodigdVermogen: Math.round(benodigdVermogen),
        bereikt,
      });

      if (bereikt && i > 5) break; // Stop a few years after FIRE
    }

    const percentageBereikt = Math.min(100, (huidigVermogen / benodigdVermogen) * 100);

    scenarios[scenarioNaam] = {
      withdrawalRate,
      rendement,
      benodigdVermogen: Math.round(benodigdVermogen),
      benodigdVermogenNaAOW: Math.round(benodigdVermogenNaAOW),
      huidigVermogen: Math.round(huidigVermogen),
      percentageBereikt: Math.round(percentageBereikt * 10) / 10,
      jaarTotFire: fireJaar ? fireJaar - huidigJaar : null,
      fireJaar,
      fireLeeftijd,
      jaarlijksBespaard: Math.round(jaarlijksBespaard),
      trajectory,
    };
  }

  return {
    maandelijkseUitgaven,
    jaarlijkseUitgaven,
    huidigVermogen: Math.round(huidigVermogen),
    aowJaarlijks: aowJaar,
    scenarios,
  };
}

module.exports = { calculateFire };
