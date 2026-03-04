import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Dashboard from '@/pages/Dashboard'
import DataInput from '@/pages/DataInput'
import SalaryProjection from '@/pages/SalaryProjection'
import HomeSaleStrategy from '@/pages/HomeSaleStrategy'
import FireCalculator from '@/pages/FireCalculator'

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-60 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gegevens" element={<DataInput />} />
          <Route path="/projectie" element={<SalaryProjection />} />
          <Route path="/woning" element={<HomeSaleStrategy />} />
          <Route path="/fire" element={<FireCalculator />} />
        </Routes>
      </main>
    </div>
  )
}
