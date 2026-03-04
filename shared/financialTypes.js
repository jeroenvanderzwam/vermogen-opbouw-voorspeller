/**
 * Financial Data Shape Documentation
 * This file documents the shape of the financial data used throughout the application.
 * It serves as a contract between the frontend and backend.
 */

/**
 * The complete financial data object shape:
 *
 * {
 *   profile: {
 *     geboortejaar: number,        // Year of birth (e.g. 1991)
 *     fiscaalPartner: boolean,     // Whether the user has a fiscal partner
 *     doelleeftijd: number,        // Target age for wealth projection (e.g. 40)
 *   },
 *
 *   loon: {
 *     brutoMaandloon: number,      // Gross monthly salary in EUR
 *     nettoMaandloon: number,      // Net monthly salary in EUR (informational)
 *     maandelijkseUitgaven: number, // Monthly expenses in EUR
 *     verwachteLoongroei: number,  // Expected annual salary growth in % (e.g. 3)
 *     inflatie: number,            // Expected annual inflation in % (e.g. 2.5)
 *   },
 *
 *   bankrekeningen: [
 *     {
 *       id: string,                // Unique identifier / account name
 *       naam: string,              // Display name
 *       saldo: number,             // Current balance in EUR
 *       rente: number,             // Interest rate in % (e.g. 1.25)
 *       type: string,              // 'betaalrekening' | 'spaarrekening'
 *     }
 *   ],
 *
 *   deGiroPortfolio: {
 *     huidigeSaldo: number,        // Current portfolio value in EUR
 *     verwachtJaarlijksRendement: number, // Expected annual return in % (e.g. 7)
 *     maandelijkseInleg: number,   // Monthly contribution in EUR
 *     opmerking: string,           // Optional note (e.g. "S&P en VWRL")
 *   },
 *
 *   nnWerkgeversPensioen: {
 *     opgebouwdKapitaal: number,   // Accrued pension capital in EUR
 *     verwachtPensioenLeeftijd: number, // Expected pension age (e.g. 67)
 *     maandelijkseWerkgeversBijdrage: number, // Monthly employer contribution in EUR
 *     maandelijkseWerknemersBijdrage: number, // Monthly employee contribution in EUR
 *     pensioenrendement: number,   // Expected pension fund return in % (e.g. 4)
 *   },
 *
 *   deGiroPersoonlijkPensioen: {
 *     huidigSaldo: number,         // Current balance in EUR
 *     maandelijkseInleg: number,   // Monthly contribution in EUR
 *     verwachtRendement: number,   // Expected annual return in % (e.g. 7)
 *     type: string,                // 'lijfrente' | 'banksparen'
 *   },
 *
 *   woning: {
 *     woningwaarde: number,        // Current home value in EUR
 *     hypotheekSchuld: number,     // Outstanding mortgage in EUR
 *     verkoopGepland: boolean,     // Whether sale is planned
 *     verwachteVerkoopDatum: string, // Expected sale date in 'YYYY-MM' format
 *     jaarlijkseWaardegroei: number, // Expected annual value growth in % (e.g. 3)
 *   },
 * }
 */

/**
 * Salary projection snapshot shape (returned by /api/calculate/salary-projection):
 *
 * {
 *   jaar: number,                  // Calendar year
 *   leeftijd: number,              // Age in that year
 *   brutoJaarloon: number,         // Gross annual salary in EUR
 *   nettoJaarloon: number,         // Net annual salary in EUR (after Box 1 tax)
 *   jaarlijkseUitgaven: number,    // Annual expenses in EUR
 *   jaarsaldo: number,             // Annual surplus (netto - uitgaven)
 *   bankSaldo: number,             // Bank balance at year end
 *   portfolioSaldo: number,        // Investment portfolio at year end
 *   pensioensaldo: number,         // Pension balance (shown only from retirement age)
 *   overwaarde: number,            // Home equity (0 after house is sold)
 *   box3Belasting: number,         // Annual Box 3 tax in EUR
 *   totaalVermogen: number,        // Total wealth (bank + portfolio - tax + equity)
 *   woningVerkocht: boolean,       // Whether the house has been sold
 * }
 */

/**
 * FIRE calculation result shape (returned by /api/calculate/fire):
 *
 * {
 *   maandelijkseUitgaven: number,  // Target monthly expenses
 *   jaarlijkseUitgaven: number,    // Target annual expenses
 *   huidigVermogen: number,        // Current liquid wealth
 *   aowJaarlijks: number,          // Approximate annual AOW benefit
 *   scenarios: {
 *     pessimistisch: FireScenario,
 *     neutraal: FireScenario,
 *     optimistisch: FireScenario,
 *   }
 * }
 *
 * FireScenario:
 * {
 *   withdrawalRate: number,        // Safe withdrawal rate (e.g. 0.04)
 *   rendement: number,             // Expected return (e.g. 0.07)
 *   benodigdVermogen: number,      // Required wealth for FIRE
 *   benodigdVermogenNaAOW: number, // Required wealth after AOW kicks in
 *   huidigVermogen: number,        // Current wealth
 *   percentageBereikt: number,     // % of FIRE goal reached
 *   jaarTotFire: number | null,    // Years until FIRE
 *   fireJaar: number | null,       // Calendar year of FIRE
 *   fireLeeftijd: number | null,   // Age at FIRE
 *   jaarlijksBespaard: number,     // Annual savings
 *   trajectory: [{
 *     jaar: number,
 *     leeftijd: number,
 *     vermogen: number,
 *     benodigdVermogen: number,
 *     bereikt: boolean,
 *   }],
 * }
 */

/**
 * Home sale strategies result shape (returned by /api/calculate/home-sale-strategies):
 *
 * {
 *   woningwaarde: number,          // Home value
 *   hypotheekSchuld: number,       // Outstanding mortgage
 *   overwaarde: number,            // Home equity
 *   verkoopkosten: number,         // Estimated selling costs (2%)
 *   vrijgekomenKapitaal: number,   // Net freed capital after sale
 *   jaarruimte: number,            // Tax-deductible pension space
 *   strategies: [Strategy]
 * }
 *
 * Strategy:
 * {
 *   id: string,
 *   naam: string,
 *   beschrijving: string,
 *   risicoNiveau: string,          // 'Laag' | 'Gemiddeld' | 'Hoog'
 *   voordelen: string[],
 *   nadelen: string[],
 *   waarde10Jaar: number,          // Projected value after 10 years
 *   waarde20Jaar: number,          // Projected value after 20 years
 *   effectiefNettoRendement: number, // Annualized net return %
 *   belastingToelichting: string,  // Tax explanation
 * }
 */

module.exports = {};
