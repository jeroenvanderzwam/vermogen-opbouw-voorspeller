import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Check } from 'lucide-react'
import * as RadixSwitch from '@radix-ui/react-switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useFinancialStore from '@/store/useFinancialStore'

function SavedBadge({ show }) {
  if (!show) return null
  return (
    <Badge variant="success" className="ml-2">
      <Check className="w-3 h-3 mr-1" /> Opgeslagen
    </Badge>
  )
}

function FormField({ label, name, register, type = 'number', suffix, prefix, onBlur, step = '0.01' }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-gray-500 text-sm pointer-events-none">{prefix}</span>
        )}
        <Input
          id={name}
          type={type}
          step={step}
          className={prefix ? 'pl-7' : suffix ? 'pr-12' : ''}
          {...register(name, { valueAsNumber: type === 'number', onBlur })}
        />
        {suffix && (
          <span className="absolute right-3 text-gray-500 text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  )
}

function ProfielEnInkomenTab() {
  const store = useFinancialStore()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      geboortejaar: store.profile.geboortejaar,
      doelleeftijd: store.profile.doelleeftijd,
      brutoMaandloon: store.loon.brutoMaandloon,
      nettoMaandloon: store.loon.nettoMaandloon,
      maandelijkseUitgaven: store.loon.maandelijkseUitgaven,
      verwachteLoongroei: store.loon.verwachteLoongroei,
      inflatie: store.loon.inflatie,
    },
  })

  const handleBlur = (field, value) => {
    store.updateField(field, parseFloat(value) || value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Profiel
            <SavedBadge show={saved} />
          </CardTitle>
          <CardDescription>Jouw persoonlijke gegevens voor de berekeningen</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="geboortejaar">Geboortejaar</Label>
            <Input
              id="geboortejaar"
              type="number"
              defaultValue={store.profile.geboortejaar}
              onBlur={(e) => handleBlur('profile.geboortejaar', parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="doelleeftijd">Doelleeftijd voor projectie</Label>
            <Input
              id="doelleeftijd"
              type="number"
              defaultValue={store.profile.doelleeftijd}
              onBlur={(e) => handleBlur('profile.doelleeftijd', parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3 col-span-2">
            <Label className="mb-0">Fiscaal partner</Label>
            <RadixSwitch.Root
              checked={store.profile.fiscaalPartner}
              onCheckedChange={(checked) => {
                store.updateField('profile.fiscaalPartner', checked)
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
              }}
              className="w-10 h-6 rounded-full bg-gray-200 data-[state=checked]:bg-blue-600 relative outline-none cursor-pointer"
            >
              <RadixSwitch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
            </RadixSwitch.Root>
            <span className="text-sm text-gray-600">
              {store.profile.fiscaalPartner ? 'Ja' : 'Nee'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inkomen & Uitgaven</CardTitle>
          <CardDescription>Jouw huidige inkomsten en uitgaven per maand</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brutoMaandloon">Bruto maandloon</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
              <Input
                id="brutoMaandloon"
                type="number"
                className="pl-7"
                defaultValue={store.loon.brutoMaandloon}
                onBlur={(e) => handleBlur('loon.brutoMaandloon', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="nettoMaandloon">Netto maandloon</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
              <Input
                id="nettoMaandloon"
                type="number"
                className="pl-7"
                defaultValue={store.loon.nettoMaandloon}
                onBlur={(e) => handleBlur('loon.nettoMaandloon', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="maandelijkseUitgaven">Maandelijkse uitgaven</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
              <Input
                id="maandelijkseUitgaven"
                type="number"
                className="pl-7"
                defaultValue={store.loon.maandelijkseUitgaven}
                onBlur={(e) => handleBlur('loon.maandelijkseUitgaven', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="verwachteLoongroei">Verwachte loongroei (%/jaar)</Label>
            <div className="relative">
              <Input
                id="verwachteLoongroei"
                type="number"
                step="0.1"
                className="pr-8"
                defaultValue={store.loon.verwachteLoongroei}
                onBlur={(e) => handleBlur('loon.verwachteLoongroei', parseFloat(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span>
            </div>
          </div>
          <div>
            <Label htmlFor="inflatie">Verwachte inflatie (%/jaar)</Label>
            <div className="relative">
              <Input
                id="inflatie"
                type="number"
                step="0.1"
                className="pr-8"
                defaultValue={store.loon.inflatie}
                onBlur={(e) => handleBlur('loon.inflatie', parseFloat(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BankrekeningenTab() {
  const store = useFinancialStore()
  const [saved, setSaved] = useState(false)
  const [rekeningen, setRekeningen] = useState(store.bankrekeningen)

  const handleChange = (index, field, value) => {
    const updated = rekeningen.map((r, i) =>
      i === index ? { ...r, [field]: field === 'saldo' || field === 'rente' ? parseFloat(value) || 0 : value } : r
    )
    setRekeningen(updated)
    store.updateField('bankrekeningen', updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addRekening = () => {
    const newRekening = {
      id: `rekening-${Date.now()}`,
      naam: 'Nieuwe rekening',
      saldo: 0,
      rente: 0,
      type: 'spaarrekening',
    }
    const updated = [...rekeningen, newRekening]
    setRekeningen(updated)
    store.updateField('bankrekeningen', updated)
  }

  const removeRekening = (index) => {
    const updated = rekeningen.filter((_, i) => i !== index)
    setRekeningen(updated)
    store.updateField('bankrekeningen', updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bankrekeningen</h3>
          <SavedBadge show={saved} />
        </div>
        <Button variant="outline" onClick={addRekening}>
          <Plus className="w-4 h-4" /> Rekening toevoegen
        </Button>
      </div>

      {rekeningen.map((rekening, index) => (
        <Card key={rekening.id}>
          <CardContent className="pt-5">
            <div className="grid grid-cols-4 gap-4 items-end">
              <div>
                <Label>Naam</Label>
                <Input
                  defaultValue={rekening.naam}
                  onBlur={(e) => handleChange(index, 'naam', e.target.value)}
                />
              </div>
              <div>
                <Label>Saldo (€)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
                  <Input
                    type="number"
                    className="pl-7"
                    defaultValue={rekening.saldo}
                    onBlur={(e) => handleChange(index, 'saldo', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Rente (%/jaar)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    className="pr-8"
                    defaultValue={rekening.rente}
                    onBlur={(e) => handleChange(index, 'rente', e.target.value)}
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Type</Label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                    defaultValue={rekening.type}
                    onChange={(e) => handleChange(index, 'type', e.target.value)}
                  >
                    <option value="betaalrekening">Betaalrekening</option>
                    <option value="spaarrekening">Spaarrekening</option>
                  </select>
                </div>
                <Button
                  variant="danger"
                  className="px-3"
                  onClick={() => removeRekening(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function BeleggingenTab() {
  const store = useFinancialStore()
  const [saved, setSaved] = useState(false)

  const handleBlur = (field, value) => {
    store.updateField(`deGiroPortfolio.${field}`, parseFloat(value) || 0)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          DeGiro Portfolio
          <SavedBadge show={saved} />
        </CardTitle>
        <CardDescription>Jouw beleggingsportfolio instellingen</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <Label>Huidig saldo (€)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
            <Input
              type="number"
              className="pl-7"
              defaultValue={store.deGiroPortfolio.huidigeSaldo}
              onBlur={(e) => handleBlur('huidigeSaldo', e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Verwacht jaarlijks rendement (%)</Label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              className="pr-8"
              defaultValue={store.deGiroPortfolio.verwachtJaarlijksRendement}
              onBlur={(e) => handleBlur('verwachtJaarlijksRendement', e.target.value)}
            />
            <span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span>
          </div>
        </div>
        <div>
          <Label>Maandelijkse inleg (€)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
            <Input
              type="number"
              className="pl-7"
              defaultValue={store.deGiroPortfolio.maandelijkseInleg}
              onBlur={(e) => handleBlur('maandelijkseInleg', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PensioenTab() {
  const store = useFinancialStore()
  const [savedNN, setSavedNN] = useState(false)
  const [savedDG, setSavedDG] = useState(false)

  const handleNNBlur = (field, value) => {
    store.updateField(`nnWerkgeversPensioen.${field}`, parseFloat(value) || 0)
    setSavedNN(true)
    setTimeout(() => setSavedNN(false), 2000)
  }

  const handleDGBlur = (field, value) => {
    store.updateField(`deGiroPersoonlijkPensioen.${field}`, parseFloat(value) || 0)
    setSavedDG(true)
    setTimeout(() => setSavedDG(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            NN Werkgevers Pensioen
            <SavedBadge show={savedNN} />
          </CardTitle>
          <CardDescription>Pensioenbijdragen via je werkgever</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Opgebouwd kapitaal (€)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
              <Input type="number" className="pl-7" defaultValue={store.nnWerkgeversPensioen.opgebouwdKapitaal}
                onBlur={(e) => handleNNBlur('opgebouwdKapitaal', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Pensioenleeftijd</Label>
            <Input type="number" defaultValue={store.nnWerkgeversPensioen.verwachtPensioenLeeftijd}
              onBlur={(e) => handleNNBlur('verwachtPensioenLeeftijd', parseInt(e.target.value))} />
          </div>
          <div>
            <Label>Maandelijkse werkgeversbijdrage (€)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
              <Input type="number" className="pl-7" defaultValue={store.nnWerkgeversPensioen.maandelijkseWerkgeversBijdrage}
                onBlur={(e) => handleNNBlur('maandelijkseWerkgeversBijdrage', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Maandelijkse werknemersbijdrage (€)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
              <Input type="number" className="pl-7" defaultValue={store.nnWerkgeversPensioen.maandelijkseWerknemersBijdrage}
                onBlur={(e) => handleNNBlur('maandelijkseWerknemersBijdrage', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Pensioenrendement (%/jaar)</Label>
            <div className="relative">
              <Input type="number" step="0.1" className="pr-8" defaultValue={store.nnWerkgeversPensioen.pensioenrendement}
                onBlur={(e) => handleNNBlur('pensioenrendement', e.target.value)} />
              <span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            DeGiro Persoonlijk Pensioen (Lijfrente)
            <SavedBadge show={savedDG} />
          </CardTitle>
          <CardDescription>Eigen pensioenbelegging via DeGiro lijfrente</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Huidig saldo (€)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
              <Input type="number" className="pl-7" defaultValue={store.deGiroPersoonlijkPensioen.huidigSaldo}
                onBlur={(e) => handleDGBlur('huidigSaldo', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Maandelijkse inleg (€)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
              <Input type="number" className="pl-7" defaultValue={store.deGiroPersoonlijkPensioen.maandelijkseInleg}
                onBlur={(e) => handleDGBlur('maandelijkseInleg', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Verwacht rendement (%/jaar)</Label>
            <div className="relative">
              <Input type="number" step="0.1" className="pr-8" defaultValue={store.deGiroPersoonlijkPensioen.verwachtRendement}
                onBlur={(e) => handleDGBlur('verwachtRendement', e.target.value)} />
              <span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WoningTab() {
  const store = useFinancialStore()
  const [saved, setSaved] = useState(false)

  const handleBlur = (field, value) => {
    store.updateField(`woning.${field}`, parseFloat(value) || value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const overwaarde = Math.max(0, store.woning.woningwaarde - store.woning.hypotheekSchuld)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Woning
          <SavedBadge show={saved} />
        </CardTitle>
        <CardDescription>
          Woningwaarde en hypotheek. Huidige overwaarde: <strong>€{overwaarde.toLocaleString('nl-NL')}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <Label>Woningwaarde (€)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
            <Input type="number" className="pl-7" defaultValue={store.woning.woningwaarde}
              onBlur={(e) => handleBlur('woningwaarde', e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Hypotheekschuld (€)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">€</span>
            <Input type="number" className="pl-7" defaultValue={store.woning.hypotheekSchuld}
              onBlur={(e) => handleBlur('hypotheekSchuld', e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Jaarlijkse waardegroei (%)</Label>
          <div className="relative">
            <Input type="number" step="0.1" className="pr-8" defaultValue={store.woning.jaarlijkseWaardegroei}
              onBlur={(e) => handleBlur('jaarlijkseWaardegroei', e.target.value)} />
            <span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span>
          </div>
        </div>
        <div>
          <Label>Verwachte verkoopdatum</Label>
          <Input type="month" defaultValue={store.woning.verwachteVerkoopDatum}
            onBlur={(e) => {
              store.updateField('woning.verwachteVerkoopDatum', e.target.value)
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            }} />
        </div>
        <div className="flex items-center gap-3 col-span-2">
          <Label className="mb-0">Verkoop gepland</Label>
          <RadixSwitch.Root
            checked={store.woning.verkoopGepland}
            onCheckedChange={(checked) => {
              store.updateField('woning.verkoopGepland', checked)
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            }}
            className="w-10 h-6 rounded-full bg-gray-200 data-[state=checked]:bg-blue-600 relative outline-none cursor-pointer"
          >
            <RadixSwitch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
          </RadixSwitch.Root>
          <span className="text-sm text-gray-600">
            {store.woning.verkoopGepland ? 'Ja' : 'Nee'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DataInput() {
  const store = useFinancialStore()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mijn Gegevens</h1>
          <p className="text-gray-500 mt-1">Beheer je financiële gegevens. Wijzigingen worden automatisch opgeslagen.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (confirm('Weet je zeker dat je alle gegevens wilt resetten naar de standaardwaarden?')) {
              store.resetToSeed()
            }
          }}
        >
          Reset naar standaard
        </Button>
      </div>

      <Tabs defaultValue="profiel">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profiel">Profiel & Inkomen</TabsTrigger>
          <TabsTrigger value="bankrekeningen">Bankrekeningen</TabsTrigger>
          <TabsTrigger value="beleggingen">Beleggingen</TabsTrigger>
          <TabsTrigger value="pensioen">Pensioen</TabsTrigger>
          <TabsTrigger value="woning">Woning</TabsTrigger>
        </TabsList>

        <TabsContent value="profiel">
          <ProfielEnInkomenTab />
        </TabsContent>
        <TabsContent value="bankrekeningen">
          <BankrekeningenTab />
        </TabsContent>
        <TabsContent value="beleggingen">
          <BeleggingenTab />
        </TabsContent>
        <TabsContent value="pensioen">
          <PensioenTab />
        </TabsContent>
        <TabsContent value="woning">
          <WoningTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
