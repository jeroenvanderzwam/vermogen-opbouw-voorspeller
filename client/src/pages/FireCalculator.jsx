import React, { useState, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { Flame, Calculator, AlertCircle, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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

const SCENARIO_COLORS = {
  pessimistisch: '#dc2626',
  neutraal: '#1a56db',
  optimistisch: '#059669',
}

const SCENARIO_LABELS = {
  pessimistisch: 'Pessimistisch',
  neutraal: 'Neutraal',
  optimistisch: 'Optimistisch',
}

function ScenarioCard({ naam, scenario }) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{SCENARIO_LABELS[naam]}</h3>
        <Badge
          variant={naam === 'pessimistisch' ? 'danger' : naam === 'optimistisch' ? 'success' : 'default'}
        >
          {(scenario.rendement * 100).toFixed(1)}% rendement
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-gray-500">Benodigd vermogen</p>
          <p className="font-bold text-gray-900">{formatEuro(scenario.benodigdVermogen)}</p>
        </div>
        <div>
          <p className="text-gray-500">Huidig vermogen</p>
          <p className="font-bold text-gray-900">{formatEuro(scenario.huidigVermogen)}</p>
        </div>
        <div>
          <p className="text-gray-500">Opnamepercentage</p>
          <p className="font-bold text-gray-900">{formatPercent(scenario.withdrawalRate * 100)}</p>
        </div>
        <div>
          <p className="text-gray-500">Voortgang</p>
          <p className="font-bold text-gray-900">{scenario.percentageBereikt}%</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${Math.min(100, scenario.percentageBereikt)}%`,
            backgroundColor: SCENARIO_COLORS[naam],
          }}
        />
      </div>

      {scenario.fireJaar ? (
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-green-700 font-semibold">
            FIRE bereikbaar in {scenario.jaarTotFire} jaar
          </p>
          <p className="text-green-600 text-sm">
            Jaar {scenario.fireJaar} op leeftijd {scenario.fireLeeftijd}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-gray-500 text-sm">FIRE nog niet bereikbaar binnen 40 jaar</p>
        </div>
      )}
    </div>
  )
}

export default function FireCalculator() {
  const store = useFinancialStore()
  const [maandelijkseUitgaven, setMaandelijkseUitgaven] = useState(store.loon.maandelijkseUitgaven)
  const [withdrawalRate, setWithdrawalRate] = useState(4)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCalculate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = store.getFinancialData()
      const res = await api.fire({
        ...data,
        maandelijkseDoelUitgaven: maandelijkseUitgaven,
      })
      setResult(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [store, maandelijkseUitgaven])

  // Build combined chart data from all scenarios
  const chartData = result
    ? (() => {
        const allYears = new Set()
        Object.values(result.scenarios).forEach((s) => {
          s.trajectory.forEach((t) => allYears.add(t.jaar))
        })

        return Array.from(allYears)
          .sort()
          .map((jaar) => {
            const entry = { jaar }
            Object.entries(result.scenarios).forEach(([naam, scenario]) => {
              const point = scenario.trajectory.find((t) => t.jaar === jaar)
              if (point) {
                entry[naam] = point.vermogen
                entry['doelvermogen'] = point.benodigdVermogen
              }
            })
            return entry
          })
      })()
    : []

  // Current scenario (neutraal) for quick display
  const neutraal = result?.scenarios?.neutraal

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Flame className="w-7 h-7 text-orange-500" />
          FIRE Calculator
        </h1>
        <p className="text-gray-500 mt-1">
          Bereken wanneer je financieel onafhankelijk bent (Financial Independence, Retire Early)
        </p>
      </div>

      {/* Input card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Instellingen</CardTitle>
          <CardDescription>Vul je gewenste maandelijkse uitgaven in bij FIRE</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="maanduitgaven">Gewenste maandelijkse uitgaven bij FIRE (€)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
                <Input
                  id="maanduitgaven"
                  type="number"
                  className="pl-7"
                  value={maandelijkseUitgaven}
                  onChange={(e) => setMaandelijkseUitgaven(parseFloat(e.target.value) || 0)}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Jaarlijks: {formatEuro(maandelijkseUitgaven * 12)}
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label>Veilig opnamepercentage (SWR)</Label>
                <span className="text-sm font-bold text-blue-700">{withdrawalRate}%</span>
              </div>
              <Slider
                min={3}
                max={5}
                step={0.5}
                value={[withdrawalRate]}
                onValueChange={([v]) => setWithdrawalRate(v)}
                className="mt-3"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>3% (conservatief)</span><span>5% (agressief)</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium">Benodigdvermogen berekening:</p>
            <p className="mt-1">
              Jaarlijkse uitgaven ({formatEuro(maandelijkseUitgaven * 12)}) ÷ {withdrawalRate}% =
              <strong className="ml-1">{formatEuro((maandelijkseUitgaven * 12) / (withdrawalRate / 100))}</strong>
            </p>
          </div>

          <Button onClick={handleCalculate} disabled={loading} className="w-full sm:w-auto">
            <Calculator className="w-4 h-4" />
            {loading ? 'Berekenen...' : 'Bereken FIRE datum'}
          </Button>
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

      {result && (
        <>
          {/* Quick summary */}
          {neutraal && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm text-orange-600">Benodigd vermogen</p>
                  <p className="text-xl font-bold text-orange-900">{formatEuro(neutraal.benodigdVermogen)}</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm text-blue-600">Huidig liquide vermogen</p>
                  <p className="text-xl font-bold text-blue-900">{formatEuro(neutraal.huidigVermogen)}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm text-green-600">Voortgang FIRE doel</p>
                  <p className="text-xl font-bold text-green-900">{neutraal.percentageBereikt}%</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm text-purple-600">AOW impact (na 67)</p>
                  <p className="text-xl font-bold text-purple-900">{formatEuro(result.aowJaarlijks)}/jaar</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Scenario cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Object.entries(result.scenarios).map(([naam, scenario]) => (
              <ScenarioCard key={naam} naam={naam} scenario={scenario} />
            ))}
          </div>

          {/* Line chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Vermogensgroei naar FIRE</CardTitle>
              <CardDescription>
                Drie scenario's voor vermogensgroei. De horizontale lijn is het benodigde FIRE vermogen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 60, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="jaar" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis tick={<EuroYAxisTick />} />
                    <Tooltip formatter={(value, name) => [formatEuro(value), SCENARIO_LABELS[name] || name]} />
                    <Legend formatter={(value) => SCENARIO_LABELS[value] || value} />
                    <ReferenceLine
                      y={result.scenarios.neutraal.benodigdVermogen}
                      stroke="#f59e0b"
                      strokeDasharray="6 3"
                      label={{ value: 'FIRE doel', position: 'insideTopRight', fontSize: 11, fill: '#f59e0b' }}
                    />
                    {Object.entries(SCENARIO_COLORS).map(([naam, color]) => (
                      <Line
                        key={naam}
                        type="monotone"
                        dataKey={naam}
                        stroke={color}
                        strokeWidth={naam === 'neutraal' ? 2.5 : 1.5}
                        dot={false}
                        strokeDasharray={naam === 'pessimistisch' ? '4 2' : naam === 'optimistisch' ? '4 2' : undefined}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AOW explanation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 text-base flex items-center gap-2">
                <Info className="w-4 h-4" />
                AOW Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>
                Wanneer je de AOW-leeftijd bereikt (momenteel 67 jaar), ontvang je maandelijks AOW van de overheid.
                Dit verlaagt de benodigde opname uit je portfolio.
              </p>
              <p>
                <strong>Geschatte AOW:</strong> ~{formatEuro(result.aowJaarlijks / 12)}/maand (bruto).
                Dit betekent dat je benodigd FIRE vermogen <em>na AOW-leeftijd</em> lager is:
                ongeveer{' '}
                <strong>
                  {formatEuro(result.scenarios.neutraal.benodigdVermogenNaAOW)}
                </strong>{' '}
                (bij 4% regel).
              </p>
              <p className="text-xs text-blue-600">
                * AOW-bedrag is een schatting op basis van 2025 tarieven. Raadpleeg mijnpensioenoverzicht.nl voor exacte bedragen.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-16 text-gray-400">
          <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Klik op "Bereken FIRE datum" om je financiële vrijheidsdatum te zien</p>
        </div>
      )}
    </div>
  )
}
