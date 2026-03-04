const TAX_CONSTANTS = require('../tax/constants');

function calculateHomeSaleStrategies(data) {
  const { loon, woning } = data;
  const jaar = 2025;
  const constants = TAX_CONSTANTS[jaar];

  // Calculate freed equity
  const verkoopkosten = woning.woningwaarde * 0.02;
  const vrijgekomenKapitaal = Math.max(0, woning.woningwaarde - woning.hypotheekSchuld - verkoopkosten);

  // Jaarruimte calculation for lijfrente
  const brutoJaarloon = loon.brutoMaandloon * 12;
  const pensioenaangroei = (data.nnWerkgeversPensioen?.maandelijkseWerkgeversBijdrage +
    data.nnWerkgeversPensioen?.maandelijkseWerknemersBijdrage) * 12 || 0;
  const jaarruimte = Math.max(
    0,
    constants.jaarruimtePercentage / 100 * (brutoJaarloon - constants.jaarruimteFranchise) - pensioenaangroei
  );

  // Helper: compound growth
  function futureValue(principal, rate, years, annualContribution = 0) {
    let value = principal;
    for (let i = 0; i < years; i++) {
      value = value * (1 + rate) + annualContribution;
    }
    return value;
  }

  // Strategy A: Spaarrekening (2.5%)
  const spaarRendement = 0.025;
  const box3SpaarTarief = constants.box3RentementspercentageSpaargeld / 100 * constants.box3BelastingTarief / 100;
  const spaarNettoRendement = spaarRendement - box3SpaarTarief;

  const stratA10 = futureValue(vrijgekomenKapitaal, spaarNettoRendement, 10);
  const stratA20 = futureValue(vrijgekomenKapitaal, spaarNettoRendement, 20);

  // Strategy B: ETF Beleggen (7%)
  const etfRendement = 0.07;
  const box3EtfTarief = constants.box3RendementspercentageBeleggingen / 100 * constants.box3BelastingTarief / 100;
  const etfNettoRendement = etfRendement - box3EtfTarief;

  const stratB10 = futureValue(vrijgekomenKapitaal, etfNettoRendement, 10);
  const stratB20 = futureValue(vrijgekomenKapitaal, etfNettoRendement, 20);

  // Strategy C: Lijfrente / Banksparen
  const lijfrenteRendement = 0.07;
  const belastingTeruggave = Math.min(jaarruimte, vrijgekomenKapitaal) * 0.3748; // middenschijf tarief
  const lijfrenteInleg = Math.min(jaarruimte, vrijgekomenKapitaal);
  const restVrij = vrijgekomenKapitaal - lijfrenteInleg;

  // Lijfrente grows tax-deferred, rest invested in ETF
  const lijfrente10 = futureValue(lijfrenteInleg + belastingTeruggave, lijfrenteRendement, 10);
  const restEtf10 = futureValue(restVrij, etfNettoRendement, 10);
  // At withdrawal, taxed at Box 1 (simplified: 37.48%)
  const lijfrente10Netto = lijfrente10 * (1 - 0.3748) + restEtf10;

  const lijfrente20 = futureValue(lijfrenteInleg + belastingTeruggave, lijfrenteRendement, 20);
  const restEtf20 = futureValue(restVrij, etfNettoRendement, 20);
  const lijfrente20Netto = lijfrente20 * (1 - 0.3748) + restEtf20;

  // Strategy D: Hypotheek aflossen (mortgage rate 4%)
  const hypotheekRente = 0.04;
  // Return equivalent = interest saved (4%), no Box 3 impact, no liquidity
  const stratD10 = futureValue(vrijgekomenKapitaal, hypotheekRente, 10);
  const stratD20 = futureValue(vrijgekomenKapitaal, hypotheekRente, 20);

  const strategies = [
    {
      id: 'spaarrekening',
      naam: 'Spaarrekening',
      beschrijving: 'Vrijgekomen overwaarde parkeren op een spaarrekening bij je bank.',
      risicoNiveau: 'Laag',
      voordelen: [
        'Veilig en direct beschikbaar',
        'FSCS/DGS garantie tot €100.000',
        'Geen koersverlies mogelijk',
      ],
      nadelen: [
        'Laag rendement (2,5%)',
        'Box 3 belasting op fictief rendement',
        'Reëel vermogen daalt door inflatie',
      ],
      waarde10Jaar: Math.round(stratA10),
      waarde20Jaar: Math.round(stratA20),
      effectiefNettoRendement: Math.round(spaarNettoRendement * 1000) / 10,
      belastingToelichting: `Box 3: ${(box3SpaarTarief * 100).toFixed(2)}% effectieve belasting op spaargeld`,
    },
    {
      id: 'etf-beleggen',
      naam: 'ETF Beleggen (DeGiro)',
      beschrijving: 'Investeren in brede markt ETFs zoals VWRL of S&P 500 via DeGiro.',
      risicoNiveau: 'Gemiddeld',
      voordelen: [
        'Historisch hoog rendement (7% gemiddeld)',
        'Brede spreiding via wereldwijde ETFs',
        'Liquide - snel te verkopen indien nodig',
      ],
      nadelen: [
        'Koersverlies mogelijk op korte termijn',
        'Box 3 belasting op fictief beleggingsrendement (6,17%)',
        'Vereist enige beleggingskennis',
      ],
      waarde10Jaar: Math.round(stratB10),
      waarde20Jaar: Math.round(stratB20),
      effectiefNettoRendement: Math.round(etfNettoRendement * 1000) / 10,
      belastingToelichting: `Box 3: ${(box3EtfTarief * 100).toFixed(2)}% effectieve belasting op beleggingen`,
    },
    {
      id: 'lijfrente',
      naam: 'Lijfrente / Banksparen',
      beschrijving: 'Belastingvrij opbouwen via lijfrente of banksparen binnen de jaarruimte.',
      risicoNiveau: 'Gemiddeld',
      voordelen: [
        `Belastingvoordeel: ~€${Math.round(belastingTeruggave).toLocaleString('nl-NL')} aftrek in jaar 1`,
        'Geen Box 3 belasting tijdens opbouw',
        `Jaarruimte: €${Math.round(jaarruimte).toLocaleString('nl-NL')} per jaar`,
      ],
      nadelen: [
        'Niet vrij opneembaar voor pensioenleeftijd',
        'Uitkeringen belast in Box 1 bij uitkeren',
        `Max aftrekbaar: €${Math.round(jaarruimte).toLocaleString('nl-NL')} (jaarruimte)`,
      ],
      waarde10Jaar: Math.round(lijfrente10Netto),
      waarde20Jaar: Math.round(lijfrente20Netto),
      effectiefNettoRendement: Math.round(lijfrenteRendement * 1000) / 10,
      belastingToelichting: 'Belastingvrije opbouw, uitkering belast in Box 1 (~37,5%)',
      jaarruimte: Math.round(jaarruimte),
      belastingTeruggave: Math.round(belastingTeruggave),
    },
    {
      id: 'hypotheek-aflossen',
      naam: 'Hypotheek Aflossen',
      beschrijving: 'Extra aflossen op de hypotheek om rentelasten te verlagen.',
      risicoNiveau: 'Laag',
      voordelen: [
        'Gegarandeerd rendement gelijk aan hypotheekrente (4%)',
        'Geen Box 3 belasting',
        'Verlaagt maandlasten direct',
        'Bijleenregeling: overwaarde verplicht inbrengen bij nieuwe woning',
      ],
      nadelen: [
        'Kapitaal niet liquide beschikbaar',
        'Lager rendement dan beleggen op lange termijn',
        'Bijleenregeling bij terugkeer naar koop',
      ],
      waarde10Jaar: Math.round(stratD10),
      waarde20Jaar: Math.round(stratD20),
      effectiefNettoRendement: hypotheekRente * 100,
      belastingToelichting: 'Geen Box 3. Rendement is gelijk aan bespaarde hypotheekrente.',
    },
  ];

  return {
    woningwaarde: woning.woningwaarde,
    hypotheekSchuld: woning.hypotheekSchuld,
    overwaarde: woning.woningwaarde - woning.hypotheekSchuld,
    verkoopkosten: Math.round(verkoopkosten),
    vrijgekomenKapitaal: Math.round(vrijgekomenKapitaal),
    jaarruimte: Math.round(jaarruimte),
    strategies,
  };
}

module.exports = { calculateHomeSaleStrategies };
