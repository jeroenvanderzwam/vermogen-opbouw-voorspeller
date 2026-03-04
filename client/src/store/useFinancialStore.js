import { create } from 'zustand'
import seedData from '../../../data/mijn-gegevens.json'

const SEED_HASH_KEY = 'financialDataSeedHash'
const DATA_KEY = 'financialData'

function loadFromStorage() {
  try {
    const currentHash = JSON.stringify(seedData)
    const storedHash = localStorage.getItem(SEED_HASH_KEY)

    // Als mijn-gegevens.json veranderd is, gooi localStorage weg
    if (storedHash !== currentHash) {
      localStorage.removeItem(DATA_KEY)
      localStorage.setItem(SEED_HASH_KEY, currentHash)
      return null
    }

    const saved = localStorage.getItem(DATA_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Could not load from localStorage:', e)
  }
  return null
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
          localStorage.setItem(DATA_KEY, JSON.stringify(toSave))
        } catch (e) {
          console.warn('Could not save to localStorage:', e)
        }
        return newState
      })
    },

    resetToSeed: () => {
      try {
        localStorage.removeItem(DATA_KEY)
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
