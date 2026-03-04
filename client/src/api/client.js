async function post(endpoint, data) {
  const res = await fetch(`/api/calculate${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ errors: [`HTTP fout: ${res.status}`] }))
    throw new Error(errorData.errors?.[0] || `API fout: ${res.status}`)
  }
  return res.json()
}

export const api = {
  salaryProjection: (data) => post('/salary-projection', data),
  fire: (data, scenario) => post('/fire', { ...data, scenario }),
  homeSaleStrategies: (data) => post('/home-sale-strategies', data),
}
