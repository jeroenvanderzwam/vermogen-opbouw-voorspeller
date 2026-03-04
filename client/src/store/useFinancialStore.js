import { create } from 'zustand'

const seedData = {
  profile: { geboortejaar: 1991, fiscaalPartner: false, doelleeftijd: 40 },
  loon: {
    brutoMaandloon: 5600,
    nettoMaandloon: 3800,
    maandelijkseUitgaven: 1800,
    verwachteLoongroei: 3,
    inflatie: 2.5,
  },
  bankrekeningen: [
    { id: 'Hr J van der Zwam', naam: 'Betaalrekening', saldo: 1000, rente: 0, type: 'betaalrekening' },
    { id: 'Spaardoel Toprekening', naam: 'Spaarrekening', saldo: 5000, rente: 1.25, type: 'spaarrekening' },
  ],
  deGiroPortfolio: {
    huidigeSaldo: 20000,
    verwachtJaarlijksRendement: 7,
    maandelijkseInleg: 1000,
  },
  nnWerkgeversPensioen: {
    opgebouwdKapitaal: 25000,
    verwachtPensioenLeeftijd: 67,
    maandelijkseWerkgeversBijdrage: 200,
    maandelijkseWerknemersBijdrage: 200,
    pensioenrendement: 4,
  },
  deGiroPersoonlijkPensioen: {
    huidigSaldo: 3500,
    maandelijkseInleg: 250,
    verwachtRendement: 7,
    type: 'lijfrente',
  },
  woning: {
    woningwaarde: 290000,
    hypotheekSchuld: 65000,
    verkoopGepland: true,
    verwachteVerkoopDatum: '2026-08',
    jaarlijkseWaardegroei: 3,
  },
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('financialData')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Could not load from localStorage:', e)
  }
  return null
}

function setNestedValue(obj, path, value) {
  const parts = path.split('.')
  const result = { ...obj }
  let current = result

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    // Handle array indices like bankrekeningen.0.saldo
    const index = parseInt(part)
    if (!isNaN(index)) {
      // current is an array, we need to clone it
      // This case is handled by the parent
    } else {
      current[part] = Array.isArray(current[part])
        ? [...current[part]]
        : { ...current[part] }
      current = current[part]
    }
  }

  const lastPart = parts[parts.length - 1]
  const lastIndex = parseInt(lastPart)
  if (!isNaN(lastIndex)) {
    current[lastIndex] = value
  } else {
    current[lastPart] = value
  }

  return result
}

function setNestedValueDeep(obj, pathParts, value) {
  if (pathParts.length === 0) return value

  const [head, ...rest] = pathParts
  const index = parseInt(head)

  if (Array.isArray(obj)) {
    const arr = [...obj]
    arr[index] = setNestedValueDeep(arr[index], rest, value)
    return arr
  } else {
    return {
      ...obj,
      [head]: setNestedValueDeep(obj[head], rest, value),
    }
  }
}

const useFinancialStore = create((set, get) => {
  const initialData = loadFromStorage() || seedData

  return {
    ...initialData,

    updateField: (path, value) => {
      set((state) => {
        const pathParts = path.split('.')
        const newState = setNestedValueDeep(state, pathParts, value)
        // Save to localStorage
        const toSave = {
          profile: newState.profile,
          loon: newState.loon,
          bankrekeningen: newState.bankrekeningen,
          deGiroPortfolio: newState.deGiroPortfolio,
          nnWerkgeversPensioen: newState.nnWerkgeversPensioen,
          deGiroPersoonlijkPensioen: newState.deGiroPersoonlijkPensioen,
          woning: newState.woning,
        }
        try {
          localStorage.setItem('financialData', JSON.stringify(toSave))
        } catch (e) {
          console.warn('Could not save to localStorage:', e)
        }
        return newState
      })
    },

    resetToSeed: () => {
      try {
        localStorage.removeItem('financialData')
      } catch (e) {
        console.warn('Could not clear localStorage:', e)
      }
      set({ ...seedData })
    },

    getTotaalVermogen: () => {
      const state = get()
      const bankSaldo = state.bankrekeningen.reduce((sum, r) => sum + r.saldo, 0)
      const portfolio = state.deGiroPortfolio.huidigeSaldo
      const pensioen = state.nnWerkgeversPensioen.opgebouwdKapitaal + state.deGiroPersoonlijkPensioen.huidigSaldo
      const overwaarde = Math.max(0, state.woning.woningwaarde - state.woning.hypotheekSchuld)
      return bankSaldo + portfolio + pensioen + overwaarde
    },

    getOverwaarde: () => {
      const state = get()
      return Math.max(0, state.woning.woningwaarde - state.woning.hypotheekSchuld)
    },

    getFinancialData: () => {
      const state = get()
      return {
        profile: state.profile,
        loon: state.loon,
        bankrekeningen: state.bankrekeningen,
        deGiroPortfolio: state.deGiroPortfolio,
        nnWerkgeversPensioen: state.nnWerkgeversPensioen,
        deGiroPersoonlijkPensioen: state.deGiroPersoonlijkPensioen,
        woning: state.woning,
      }
    },
  }
})

export default useFinancialStore
