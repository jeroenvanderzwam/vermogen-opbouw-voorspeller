import React, { useState, useCallback } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import useFinancialStore from '@/store/useFinancialStore'
import { api } from '@/api/client'
import { formatEuro, formatPercent } from '@/lib/utils'

function EuroYAxisTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#6b7280" fontSize={11}>
        {payload.value >= 1000000
          ? `€${(payload.value / 1000000).toFixed(1)}M`
          : `€${Math.round(payload.value / 1000)}K`}
      </text>
    </g>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold mb-2">Jaar {label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-medium">{formatEuro(entry.value)}</span>
          </div>
        ))}
        {payload[0]?.payload?.totaalVermogen && (
          <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between gap-4">
            <span className="font-semibold">Totaal</span>
            <span className="font-bold">{formatEuro(payload[0].payload.totaalVermogen)}</span>
          </div>
        )}
      </div>
    )
  }
  return null
}

export default function SalaryProjection() {
  const store = useFinancialStore()
  const [loongroei, setLoongroei] = useState(store.loon.verwachteLoongroei)
  const [inflatie, setInflatie] = useState(store.loon.inflatie)
  const [rendement, setRendement] = useState(store.deGiroPortfolio.verwachtJaarlijksRendement)
  const [realTerms, setRealTerms] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCalculate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = store.getFinancialData()
      const res = await api.salaryProjection({
        ...data,
        loongroei,
        inflatie,
        rendement,
      })
      setResult(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [store, loongroei, inflatie, rendement])

  // Adjust for inflation in "real terms" toggle
  const chartData = result
    ? result.map((row, i) => {
        const factor = realTerms ? Math.pow(1 + inflatie / 100, i) : 1
        return {
          naam: `${row.jaar}\n(${row.leeftijd}j)`,
          jaar: row.jaar,
          leeftijd: row.leeftijd,
          Bank: Math.round(row.bankSaldo / factor),
          Portfolio: Math.round(row.portfolioSaldo / factor),
          Overwaarde: Math.round(row.overwaarde / factor),
          Pensioen: Math.round((row.persoonlijkPensioenSaldo + row.werkgeversPensioenSaldo) / factor),
          totaalVermogen: Math.round(row.totaalVermogen / factor),
        }
      })
    : []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vermogen op {store.profile.doelleeftijd}</h1>
        <p className="text-gray-500 mt-1">
          Projectie van je vermogensopbouw van nu tot je {store.profile.doelleeftijd}e verjaardag
        </p>
      </div>

      {/* Scenario sliders */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Scenario instellingen</CardTitle>
          <CardDescription>Pas de parameters aan voor verschillende scenario's</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Loongroei</label>
                <span className="text-sm font-bold text-blue-700">{loongroei}%</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={0.5}
                value={[loongroei]}
                onValueChange={([v]) => setLoongroei(v)}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1%</span><span>10%</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Inflatie</label>
                <span className="text-sm font-bold text-orange-600">{inflatie}%</span>
              </div>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[inflatie]}
                onValueChange={([v]) => setInflatie(v)}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span><span>5%</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Beleggingsrendement</label>
                <span className="text-sm font-bold text-green-700">{rendement}%</span>
              </div>
              <Slider
                min={2}
                max={15}
                step={0.5}
                value={[rendement]}
                onValueChange={([v]) => setRendement(v)}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>2%</span><span>15%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleCalculate} disabled={loading}>
              <Calculator className="w-4 h-4" />
              {loading ? 'Berekenen...' : 'Bereken projectie'}
            </Button>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={realTerms}
                onChange={(e) => setRealTerms(e.target.checked)}
                className="rounded"
              />
              Toon reëel (gecorrigeerd voor inflatie)
            </label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Berekening mislukt</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-16 text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Klik op "Bereken projectie" om de vermogensgroei te zien</p>
        </div>
      )}

      {result && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {(() => {
              const last = result[result.length - 1]
              const first = result[0]
              return (
                <>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-5 pb-5">
                      <p className="text-sm text-blue-600">Totaal vermogen op {last.leeftijd}</p>
                      <p className="text-xl font-bold text-blue-900">{formatEuro(last.totaalVermogen)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-5 pb-5">
                      <p className="text-sm text-green-600">Portfolio op {last.leeftijd}</p>
                      <p className="text-xl font-bold text-green-900">{formatEuro(last.portfolioSaldo)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-5 pb-5">
                      <p className="text-sm text-purple-600">Pensioen opgebouwd</p>
                      <p className="text-xl font-bold text-purple-900">
                        {formatEuro(last.werkgeversPensioenSaldo + last.persoonlijkPensioenSaldo)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="pt-5 pb-5">
                      <p className="text-sm text-amber-600">Box 3 belasting/jaar</p>
                      <p className="text-xl font-bold text-amber-900">{formatEuro(last.box3Belasting)}</p>
                    </CardContent>
                  </Card>
                </>
              )
            })()}
          </div>

          {/* Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                Vermogensgroei over tijd
                {realTerms && <Badge variant="secondary" className="ml-2">Reëel</Badge>}
              </CardTitle>
              <CardDescription>
                Gestapeld overzicht van bankrekeningen, portfolio, overwaarde en pensioen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 60, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="jaar"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickFormatter={(val, i) => {
                        const row = chartData[i]
                        return row ? `${val}\n(${row.leeftijd}j)` : val
                      }}
                    />
                    <YAxis tick={<EuroYAxisTick />} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Bank"
                      stackId="1"
                      stroke="#1a56db"
                      fill="#dbeafe"
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="Portfolio"
                      stackId="1"
                      stroke="#7c3aed"
                      fill="#ede9fe"
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="Overwaarde"
                      stackId="1"
                      stroke="#059669"
                      fill="#d1fae5"
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="Pensioen"
                      stackId="1"
                      stroke="#d97706"
                      fill="#fef3c7"
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Jaarlijks overzicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">Jaar</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">Leeftijd</th>
                      <th className="text-right py-2 px-3 text-gray-600 font-medium">Bruto loon</th>
                      <th className="text-right py-2 px-3 text-gray-600 font-medium">Netto loon</th>
                      <th className="text-right py-2 px-3 text-gray-600 font-medium">Jaarsaldo</th>
                      <th className="text-right py-2 px-3 text-gray-600 font-medium">Portfolio</th>
                      <th className="text-right py-2 px-3 text-gray-600 font-medium">Box 3</th>
                      <th className="text-right py-2 px-3 text-gray-600 font-medium">Totaal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((row, i) => (
                      <tr
                        key={row.jaar}
                        className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="py-2 px-3 font-medium">{row.jaar}</td>
                        <td className="py-2 px-3">{row.leeftijd}</td>
                        <td className="py-2 px-3 text-right">{formatEuro(row.brutoJaarloon)}</td>
                        <td className="py-2 px-3 text-right">{formatEuro(row.nettoJaarloon)}</td>
                        <td className={`py-2 px-3 text-right font-medium ${row.jaarsaldo >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                          {formatEuro(row.jaarsaldo)}
                        </td>
                        <td className="py-2 px-3 text-right">{formatEuro(row.portfolioSaldo)}</td>
                        <td className="py-2 px-3 text-right text-red-600">-{formatEuro(row.box3Belasting)}</td>
                        <td className="py-2 px-3 text-right font-bold">{formatEuro(row.totaalVermogen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
