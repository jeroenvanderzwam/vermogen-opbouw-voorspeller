import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Wallet, Building2, PiggyBank, Home, ArrowUpRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import useFinancialStore from '@/store/useFinancialStore'
import { formatEuro, formatPercent } from '@/lib/utils'

const COLORS = ['#1a56db', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2']

function WealthCard({ title, amount, icon: Icon, color, description }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatEuro(amount)}</p>
            {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-gray-700">{formatEuro(payload[0].value)}</p>
        <p className="text-sm text-gray-500">{formatPercent(payload[0].payload.percentage)}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const store = useFinancialStore()
  const {
    bankrekeningen,
    deGiroPortfolio,
    nnWerkgeversPensioen,
    deGiroPersoonlijkPensioen,
    woning,
    loon,
  } = store

  const bankSaldo = bankrekeningen.reduce((sum, r) => sum + r.saldo, 0)
  const portfolio = deGiroPortfolio.huidigeSaldo
  const werkgeversPensioen = nnWerkgeversPensioen.opgebouwdKapitaal
  const persoonlijkPensioen = deGiroPersoonlijkPensioen.huidigSaldo
  const overwaarde = Math.max(0, woning.woningwaarde - woning.hypotheekSchuld)
  const totaal = bankSaldo + portfolio + werkgeversPensioen + persoonlijkPensioen + overwaarde

  const maandelijksSpaarsaldo = loon.nettoMaandloon - loon.maandelijkseUitgaven

  // FIRE target (monthly expenses * 300 = 25x annual = 4% rule)
  const fireTarget = loon.maandelijkseUitgaven * 12 * 25
  const liquidVermogen = bankSaldo + portfolio
  const firePercentage = Math.min(100, (liquidVermogen / fireTarget) * 100)

  const pieData = [
    { name: 'Bankrekeningen', value: bankSaldo, percentage: (bankSaldo / totaal) * 100 },
    { name: 'DeGiro Portfolio', value: portfolio, percentage: (portfolio / totaal) * 100 },
    { name: 'Werkgevers Pensioen', value: werkgeversPensioen, percentage: (werkgeversPensioen / totaal) * 100 },
    { name: 'Persoonlijk Pensioen', value: persoonlijkPensioen, percentage: (persoonlijkPensioen / totaal) * 100 },
    { name: 'Overwaarde Woning', value: overwaarde, percentage: (overwaarde / totaal) * 100 },
  ].filter(d => d.value > 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overzicht van je huidige vermogenspositie</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-5 pb-5">
            <p className="text-sm text-blue-600 font-medium">Maandelijks spaarsaldo</p>
            <p className="text-2xl font-bold text-blue-900">{formatEuro(maandelijksSpaarsaldo)}</p>
            <p className="text-xs text-blue-500 mt-0.5">netto - uitgaven</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-5 pb-5">
            <p className="text-sm text-green-600 font-medium">Bruto maandloon</p>
            <p className="text-2xl font-bold text-green-900">{formatEuro(loon.brutoMaandloon)}</p>
            <p className="text-xs text-green-500 mt-0.5">netto: {formatEuro(loon.nettoMaandloon)}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-5 pb-5">
            <p className="text-sm text-purple-600 font-medium">Overwaarde woning</p>
            <p className="text-2xl font-bold text-purple-900">{formatEuro(overwaarde)}</p>
            <p className="text-xs text-purple-500 mt-0.5">
              {woning.verkoopGepland ? `Verkoop gepland: ${woning.verwachteVerkoopDatum}` : 'Geen verkoop gepland'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wealth categories */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <WealthCard
          title="Bankrekeningen"
          amount={bankSaldo}
          icon={Wallet}
          color="bg-blue-500"
          description={`${bankrekeningen.length} rekeningen`}
        />
        <WealthCard
          title="DeGiro Portfolio"
          amount={portfolio}
          icon={TrendingUp}
          color="bg-violet-500"
          description={`${deGiroPortfolio.verwachtJaarlijksRendement}% verwacht rendement`}
        />
        <WealthCard
          title="NN Werkgevers Pensioen"
          amount={werkgeversPensioen}
          icon={Building2}
          color="bg-emerald-500"
          description={`Pensioenleeftijd: ${nnWerkgeversPensioen.verwachtPensioenLeeftijd} jaar`}
        />
        <WealthCard
          title="DeGiro Persoonlijk Pensioen"
          amount={persoonlijkPensioen}
          icon={PiggyBank}
          color="bg-amber-500"
          description={`${deGiroPersoonlijkPensioen.verwachtRendement}% verwacht rendement`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total wealth */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Totaal vermogen</p>
                <p className="text-4xl font-bold mt-1">{formatEuro(totaal)}</p>
                <p className="text-blue-200 text-sm mt-2">incl. pensioen & woning</p>
              </div>
              <Home className="w-12 h-12 text-blue-300" />
            </div>
            <div className="mt-4 pt-4 border-t border-blue-500">
              <p className="text-blue-200 text-sm">Liquide vermogen</p>
              <p className="text-2xl font-semibold">{formatEuro(liquidVermogen)}</p>
            </div>
          </CardContent>
        </Card>

        {/* FIRE progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔥</span> FIRE Voortgang
            </CardTitle>
            <CardDescription>
              4% regel: doelvermogen {formatEuro(fireTarget)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Liquide vermogen</span>
                  <span className="font-medium">{formatPercent(firePercentage)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, firePercentage)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Huidig liquide</p>
                <p className="font-semibold">{formatEuro(liquidVermogen)}</p>
              </div>
              <div>
                <p className="text-gray-500">Doelvermogen</p>
                <p className="font-semibold">{formatEuro(fireTarget)}</p>
              </div>
              <div>
                <p className="text-gray-500">Nog nodig</p>
                <p className="font-semibold text-orange-600">{formatEuro(Math.max(0, fireTarget - liquidVermogen))}</p>
              </div>
              <div>
                <p className="text-gray-500">Maandelijkse uitgaven</p>
                <p className="font-semibold">{formatEuro(loon.maandelijkseUitgaven)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vermogensverdeling</CardTitle>
          <CardDescription>Huidige verdeling van je vermogen over categorieën</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value, entry) => (
                    <span className="text-sm text-gray-700">
                      {value} ({formatEuro(entry.payload.value)})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
