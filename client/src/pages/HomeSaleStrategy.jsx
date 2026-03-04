import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Home, Info, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import useFinancialStore from '@/store/useFinancialStore'
import { api } from '@/api/client'
import { formatEuro, formatPercent } from '@/lib/utils'

const RISK_BADGE_VARIANTS = {
  Laag: 'success',
  Gemiddeld: 'warning',
  Hoog: 'danger',
}

const STRATEGY_COLORS = {
  spaarrekening: '#1a56db',
  'etf-beleggen': '#7c3aed',
  lijfrente: '#059669',
  'hypotheek-aflossen': '#d97706',
}

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

function StrategyCard({ strategy }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{strategy.naam}</CardTitle>
            <CardDescription className="mt-1">{strategy.beschrijving}</CardDescription>
          </div>
          <Badge variant={RISK_BADGE_VARIANTS[strategy.risicoNiveau] || 'default'}>
            {strategy.risicoNiveau}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Returns */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-500">Netto rendement</p>
            <p className="text-lg font-bold text-gray-900">{strategy.effectiefNettoRendement}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Waarde na 10 jaar</p>
            <p className="text-base font-bold text-blue-700">{formatEuro(strategy.waarde10Jaar)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Waarde na 20 jaar</p>
            <p className="text-base font-bold text-purple-700">{formatEuro(strategy.waarde20Jaar)}</p>
          </div>
        </div>

        {/* Tax info */}
        <div className="flex items-start gap-2 text-xs text-gray-600 bg-blue-50 p-2.5 rounded">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>{strategy.belastingToelichting}</span>
        </div>

        {/* Voordelen & Nadelen */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wider">Voordelen</p>
            <ul className="space-y-1">
              {strategy.voordelen.map((v, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-700 mb-1 uppercase tracking-wider">Nadelen</p>
            <ul className="space-y-1">
              {strategy.nadelen.map((n, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Jaarruimte for lijfrente */}
        {strategy.jaarruimte && (
          <div className="p-2.5 bg-green-50 rounded text-xs text-green-800">
            <strong>Jaarruimte:</strong> {formatEuro(strategy.jaarruimte)} |{' '}
            <strong>Belastingteruggave jaar 1:</strong> {formatEuro(strategy.belastingTeruggave)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function HomeSaleStrategy() {
  const store = useFinancialStore()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const data = store.getFinancialData()
    setLoading(true)
    api.homeSaleStrategies(data)
      .then((res) => {
        setResult(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-16 text-gray-400">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p>Strategieën berekenen...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Fout bij laden</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const barData = result
    ? [
        { naam: '10 jaar', ...Object.fromEntries(result.strategies.map((s) => [s.naam, s.waarde10Jaar])) },
        { naam: '20 jaar', ...Object.fromEntries(result.strategies.map((s) => [s.naam, s.waarde20Jaar])) },
      ]
    : []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verkoopstrategie Woning</h1>
        <p className="text-gray-500 mt-1">
          Vergelijk strategieën voor het investeren van de vrijgekomen overwaarde
        </p>
      </div>

      {result && (
        <>
          {/* Summary */}
          <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0">
            <CardContent className="pt-6">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <p className="text-blue-200 text-sm">Woningwaarde</p>
                  <p className="text-xl font-bold">{formatEuro(result.woningwaarde)}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Hypotheekschuld</p>
                  <p className="text-xl font-bold text-red-300">-{formatEuro(result.hypotheekSchuld)}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Verkoopkosten (2%)</p>
                  <p className="text-xl font-bold text-red-300">-{formatEuro(result.verkoopkosten)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-blue-200 text-sm">Netto vrijgekomen</p>
                  <p className="text-3xl font-bold">{formatEuro(result.vrijgekomenKapitaal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bar chart comparison */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Vergelijking 10 vs 20 jaar</CardTitle>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button>
                      <Info className="w-4 h-4 text-gray-400" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Box 3 belasting wordt berekend op basis van de 2025 tarieven.</p>
                    <p className="mt-1">Lijfrente waarden zijn na Box 1 belasting bij uitkering.</p>
                  </TooltipContent>
                </UITooltip>
              </div>
              <CardDescription>
                Verwachte waarde per strategie na 10 en 20 jaar. Rekening houdend met belastingen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 20, left: 60, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="naam" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={<EuroYAxisTick />} />
                    <Tooltip
                      formatter={(value, name) => [formatEuro(value), name]}
                    />
                    <Legend />
                    {result.strategies.map((s) => (
                      <Bar
                        key={s.id}
                        dataKey={s.naam}
                        fill={STRATEGY_COLORS[s.id] || '#6b7280'}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Strategy cards */}
          <div className="grid grid-cols-2 gap-4">
            {result.strategies.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))}
          </div>

          {/* Box 3 explanation */}
          <Card className="mt-6 bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 text-base">Box 3 Belasting Uitleg</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800 space-y-2">
              <p>
                <strong>Box 3</strong> belasting wordt berekend op basis van een fictief rendement over je vermogen boven de vrijstelling (2025: €57.000 per persoon).
              </p>
              <p>
                <strong>Spaargeld:</strong> fictief rendement 1,44% × 36% belasting = ~0,52% effectieve belasting
              </p>
              <p>
                <strong>Beleggingen:</strong> fictief rendement 6,17% × 36% belasting = ~2,22% effectieve belasting
              </p>
              <p>
                <strong>Lijfrente:</strong> geen Box 3 tijdens opbouw. Uitkering belast in Box 1 (37,48% voor middenschijf).
              </p>
              <p>
                <strong>Bijleenregeling:</strong> als je een nieuw huis koopt, ben je verplicht de overwaarde in te brengen om hypotheekrenteaftrek te behouden.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
