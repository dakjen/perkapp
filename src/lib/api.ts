async function request(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export async function login(email: string, password: string, role: string) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  })
}

export async function createCompany(name: string, email: string, password: string) {
  return request('/api/companies', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export async function fetchCompany(id: string) {
  return request(`/api/companies?id=${id}`)
}

export async function fetchMembers(companyId: string) {
  return request(`/api/members?company_id=${companyId}`)
}

export async function addMember(data: any) {
  return request('/api/members', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function fetchTransactions(companyId: string, memberId?: string) {
  let url = `/api/transactions?company_id=${companyId}`
  if (memberId) url += `&member_id=${memberId}`
  return request(url)
}

export async function updateTransaction(id: string, status: string, rejectionNote?: string) {
  return request('/api/transactions', {
    method: 'PATCH',
    body: JSON.stringify({ id, status, rejection_note: rejectionNote }),
  })
}

export async function fetchPerks(companyId: string) {
  return request(`/api/perks?company_id=${companyId}`)
}

export async function createPerk(data: any) {
  return request('/api/perks', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updatePerk(data: any) {
  return request('/api/perks', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deletePerk(id: string) {
  return request('/api/perks', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  })
}
