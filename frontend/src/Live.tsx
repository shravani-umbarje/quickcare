// API-connected screens: login, ambulance booking + tracking, home care, my bookings, hospital portal.
// Uses the existing QuickCare CSS classes. No mock data: every list/stat comes from the backend.
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { api, recommender, setSession, phoneOk, type User } from './api'

function useLoad<T>(path: string, ms = 0, rec = false) {
  const [data, setData] = useState<T | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [n, setN] = useState(0)
  useEffect(() => {
    let live = true
    const run = () => (rec ? recommender<T>(path) : api<T>(path)).then((d) => { if (live) { setData(d); setError('') } }).catch((e) => live && setError(e.message)).finally(() => live && setLoading(false))
    run(); const t = ms ? setInterval(run, ms) : 0
    return () => { live = false; if (t) clearInterval(t) }
  }, [path, ms, n, rec])
  return { data, error, loading, reload: () => setN((x) => x + 1) }
}
function Async({ loading, error, empty, emptyText, children }: { loading: boolean; error: string; empty?: boolean; emptyText?: string; children: ReactNode }) {
  if (loading) return <p className="f-state">Loading…</p>
  if (error) return <p className="f-state f-bad" role="alert">{error}</p>
  if (empty) return <p className="f-state f-empty">{emptyText ?? 'Nothing here yet.'}</p>
  return <>{children}</>
}
const Head = ({ title, sub }: { title: string; sub: string }) => <div className="page-header"><h1>{title}</h1><p>{sub}</p></div>
const Field = ({ label, err, children }: { label: string; err?: string; children: ReactNode }) => <label className="f-label">{label}{children}<span className="f-err">{err}</span></label>
const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : '')
const mapUrl = (la: number, ln: number) => `https://www.openstreetmap.org/export/embed.html?bbox=${ln - 0.01},${la - 0.01},${ln + 0.01},${la + 0.01}&layer=mapnik&marker=${la},${ln}`

/** Run an action with loading + error handling. */
function useAction() {
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const run = async <T,>(fn: () => Promise<T>, okText?: string): Promise<T | null> => {
    setBusy(true); setMsg(null)
    try { const r = await fn(); if (okText) setMsg({ ok: true, text: okText }); return r } catch (e: any) { setMsg({ ok: false, text: e.message }); return null } finally { setBusy(false) }
  }
  const note = msg && <p className={`f-state ${msg.ok ? 'f-ok' : 'f-bad'}`} role="status">{msg.text}</p>
  return { busy, run, note }
}

export function Login({ onDone }: { onDone: (u: User) => void }) {
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [errs, setErrs] = useState<Record<string, string>>({}), a = useAction()
  const submit = async (e: FormEvent) => {
    e.preventDefault(); const er: Record<string, string> = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = 'Enter a valid email.'; if (!pw) er.pw = 'Enter your password.'
    setErrs(er); if (Object.keys(er).length) return
    const r = await a.run(() => api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: { email, password: pw }, auth: false }))
    if (r) { setSession(r.token, r.user); onDone(r.user) }
  }
  return <main className="f-login"><form className="panel f-card" onSubmit={submit} noValidate><h1>Sign in to QuickCare</h1>
    <Field label="Email" err={errs.email}><input className="f-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></Field>
    <Field label="Password" err={errs.pw}><input className="f-input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></Field>
    <button className="primary-button" disabled={a.busy}>{a.busy ? 'Signing in…' : 'Sign in'}</button>{a.note}</form></main>
}

const FALLBACK_TYPES = [{ key: 'cardiac', label: 'Cardiac / chest pain' }, { key: 'stroke', label: 'Stroke' }, { key: 'trauma', label: 'Accident / trauma' }, { key: 'pregnancy', label: 'Pregnancy / delivery' }, { key: 'breathing', label: 'Breathing difficulty' }, { key: 'minor', label: 'Minor injury / fever' }]   // used only if /emergency-types is unreachable
type Pickup = { address: string; lat: number; lng: number }
export function AmbulanceBooking() {
  const [step, setStep] = useState(1), [bookingId, setBookingId] = useState(new URLSearchParams(location.search).get('id') || '')
  const [f, setF] = useState({ emergencyType: '', severity: 'serious', patientName: '', contactPhone: '', notes: '' }), [errs, setErrs] = useState<Record<string, string>>({})
  const types = useLoad<{ key: string; label: string }[]>('/api/v1/emergency-types', 0, true)
  const [addr, setAddr] = useState(''), [lat, setLat] = useState(''), [lng, setLng] = useState(''), [gps, setGps] = useState(''), [rec, setRec] = useState<any>(null), a = useAction()
  useEffect(() => { if (bookingId) setStep(4) }, [bookingId])
  const toLocation = (e: FormEvent) => {
    e.preventDefault(); const er: Record<string, string> = {}
    if (!f.emergencyType) er.emergencyType = 'Choose the emergency type.'; if (f.patientName.trim().length < 2) er.patientName = "Enter the patient's name."; if (!phoneOk(f.contactPhone)) er.contactPhone = 'Enter a valid 10-digit mobile number.'
    setErrs(er); if (Object.keys(er).length) return; setStep(2)
    if (!navigator.geolocation) return setGps('This device cannot share location. Enter it manually.')
    setGps('Finding your location…')
    navigator.geolocation.getCurrentPosition((p) => { setLat(p.coords.latitude.toFixed(6)); setLng(p.coords.longitude.toFixed(6)); setGps('') }, () => setGps('Location access is off. Enter the address and coordinates manually.'))
  }
  const pickup: Pickup = { address: addr.trim(), lat: +lat, lng: +lng }
  const toConfirm = async () => {
    const er: Record<string, string> = {}
    if (!pickup.address) er.address = 'Enter the pickup address.'; if (!lat || !lng || Math.abs(pickup.lat) > 90 || Math.abs(pickup.lng) > 180) er.location = 'Enter valid coordinates or use your device location.'
    setErrs(er); if (Object.keys(er).length) return; setStep(3); setRec(null)
    try { setRec(await recommender('/api/v1/recommendations', { emergency_type: f.emergencyType, latitude: pickup.lat, longitude: pickup.lng })) } catch { setRec({ unavailable: true }) }   // booking stays possible
  }
  const send = async () => { const r = await a.run(() => api<{ id: string }>('/ambulance/bookings', { method: 'POST', body: { ...f, pickup, recommendationId: rec?.id ?? null } })); if (r) { history.replaceState(null, '', `?id=${encodeURIComponent(r.id)}`); setBookingId(r.id) } }
  const track = useLoad<any>(bookingId ? `/ambulance/bookings/${encodeURIComponent(bookingId)}` : '/ambulance/bookings/none', bookingId ? 5000 : 0)
  const b = track.data, ended = b && ['completed', 'cancelled'].includes(b.status)
  const cancel = async () => { if (confirm('Cancel this ambulance request?') && (await a.run(() => api(`/ambulance/bookings/${encodeURIComponent(bookingId)}/cancel`, { method: 'POST' })))) track.reload() }
  return <div className="provider-page"><Head title="Request ambulance" sub="Tell us what is happening and where to send help" />
    <div className="f-steps">{[1, 2, 3, 4].map((i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>
    {step === 1 && <form className="panel f-card" onSubmit={toLocation} noValidate><h2>Emergency details</h2>
      <Field label="Emergency type" err={errs.emergencyType}><select className="f-input" value={f.emergencyType} onChange={(e) => setF({ ...f, emergencyType: e.target.value })}><option value="">{types.loading ? 'Loading…' : 'Select…'}</option>{(types.data ?? FALLBACK_TYPES).map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</select></Field>
      <Field label="Severity"><select className="f-input" value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })}><option value="critical">Critical</option><option value="serious">Serious</option><option value="stable">Stable</option></select></Field>
      <Field label="Patient name" err={errs.patientName}><input className="f-input" value={f.patientName} onChange={(e) => setF({ ...f, patientName: e.target.value })} /></Field>
      <Field label="Contact phone" err={errs.contactPhone}><input className="f-input" inputMode="tel" value={f.contactPhone} onChange={(e) => setF({ ...f, contactPhone: e.target.value })} /></Field>
      <Field label="Notes (optional)"><textarea className="f-input" rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
      <button className="primary-button">Continue to location</button></form>}
    {step === 2 && <section className="panel f-card"><h2>Confirm pickup location</h2>{gps && <p className="f-state">{gps}</p>}
      {lat && lng && !errs.location && <iframe className="f-map" title="Pickup location" src={mapUrl(+lat, +lng)} />}
      <Field label="Pickup address" err={errs.address}><input className="f-input" value={addr} onChange={(e) => setAddr(e.target.value)} /></Field>
      <div className="f-row"><Field label="Latitude"><input className="f-input" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} /></Field><Field label="Longitude" err={errs.location}><input className="f-input" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} /></Field></div>
      <div className="f-row"><button className="secondary-button" onClick={() => setStep(1)}>Back</button><button className="primary-button" onClick={toConfirm}>Confirm location</button></div></section>}
    {step === 3 && <section className="panel f-card"><h2>Confirm booking</h2><p><b>{f.emergencyType}</b> ({f.severity}) · {f.patientName}, {f.contactPhone}<br />{pickup.address}</p>
      {rec?.unavailable && <p className="f-state">Recommendation is unavailable right now. You can still send the request.</p>}
      {rec && !rec.unavailable && <div className="f-state f-ok"><b>Suggested: {rec.ambulance_type_label}</b>{rec.hospital ? ` to ${rec.hospital.name} (${rec.hospital.distance_km} km)` : ''}<br />{rec.reason}{rec.used_fallback && ' (rule-based fallback used)'}{!!rec.alternatives?.length && <><br />Alternatives: {rec.alternatives.map((h: any) => `${h.name} (${h.distance_km} km)`).join(', ')}</>}</div>}
      <div className="f-row"><button className="secondary-button" onClick={() => setStep(2)}>Back</button><button className="emergency-button" disabled={a.busy} onClick={send}>{a.busy ? 'Sending…' : 'Send ambulance request'}</button></div>{a.note}</section>}
    {step === 4 && <section className="panel f-card" aria-live="polite"><h2>Ambulance tracking</h2>
      <Async loading={track.loading} error={track.error}>{b && <>
        <p className="f-state f-ok">Status: <b>{b.status}</b>{b.etaMinutes != null && ` · Arrives in about ${b.etaMinutes} min`}</p>
        {b.ambulance ? <p>{b.ambulance.plate} · Driver {b.ambulance.driverName} · <a href={`tel:${b.ambulance.phone}`}>{b.ambulance.phone}</a></p> : <p>Finding the nearest ambulance…</p>}
        {b.hospital && <p>Destination: {b.hospital.name}</p>}
        {b.location && <iframe className="f-map" title="Live ambulance location" src={mapUrl(b.location.lat, b.location.lng)} />}
        {!ended && b.status !== 'arrived' && <button className="secondary-button" disabled={a.busy} onClick={cancel}>Cancel request</button>}{a.note}</>}</Async></section>}
  </div>
}

export function HomeCareBooking({ initial }: { initial: 'nurse' | 'doctor' | 'sample' }) {
  const [kind, setKind] = useState(initial), [tests, setTests] = useState<string[]>([]), [f, setF] = useState({ reason: '', date: '', timeSlot: '', address: '', phone: '' }), [errs, setErrs] = useState<Record<string, string>>({}), a = useAction()
  const lab = useLoad<{ id: string; name: string }[]>(kind === 'sample' ? '/lab/tests' : '/lab/tests?skip=1'), list = useLoad<any[]>('/homecare/bookings'), today = new Date().toISOString().slice(0, 10)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); const er: Record<string, string> = {}
    if (kind === 'sample' && !tests.length) er.tests = 'Select at least one test.'; if (kind !== 'sample' && f.reason.trim().length < 3) er.reason = 'Tell us the reason for the visit.'
    if (!f.date || f.date < today) er.date = 'Choose today or a later date.'; if (!f.timeSlot) er.timeSlot = 'Choose a time slot.'; if (f.address.trim().length < 5) er.address = 'Enter the full home address.'; if (!phoneOk(f.phone)) er.phone = 'Enter a valid 10-digit mobile number.'
    setErrs(er); if (Object.keys(er).length) return
    const base = { date: f.date, timeSlot: f.timeSlot, address: f.address.trim(), phone: f.phone.trim() }
    const r = await a.run(() => kind === 'sample' ? api<any>('/homecare/sample-collections', { method: 'POST', body: { ...base, tests } }) : api<any>('/homecare/visits', { method: 'POST', body: { ...base, type: kind, reason: f.reason.trim() } }), 'Booked.')
    if (r) { setTests([]); setF({ reason: '', date: '', timeSlot: '', address: '', phone: '' }); list.reload() }
  }
  return <div className="provider-page"><Head title="Home healthcare" sub="Nurse and doctor visits, or sample collection at home" />
    <form className="panel f-card" onSubmit={submit} noValidate>
      <Field label="Service"><select className="f-input" value={kind} onChange={(e) => setKind(e.target.value as any)}><option value="nurse">Nurse visit</option><option value="doctor">Doctor visit</option><option value="sample">Home sample collection</option></select></Field>
      {kind === 'sample' ? <Field label="Tests" err={errs.tests}><Async loading={lab.loading} error={lab.error} empty={!lab.data?.length} emptyText="No lab tests are available right now.">
        <select className="f-input" multiple size={5} value={tests} onChange={(e) => setTests([...e.target.selectedOptions].map((o) => o.value))}>{lab.data?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Async></Field>
        : <Field label="Reason for visit" err={errs.reason}><textarea className="f-input" rows={2} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>}
      <div className="f-row"><Field label="Date" err={errs.date}><input className="f-input" type="date" min={today} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Time slot" err={errs.timeSlot}><select className="f-input" value={f.timeSlot} onChange={(e) => setF({ ...f, timeSlot: e.target.value })}><option value="">Select…</option>{['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'].map((s) => <option key={s}>{s}</option>)}</select></Field></div>
      <Field label="Home address" err={errs.address}><input className="f-input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
      <Field label="Contact phone" err={errs.phone}><input className="f-input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
      <button className="primary-button" disabled={a.busy}>{a.busy ? 'Booking…' : 'Book'}</button>{a.note}</form>
    <section className="panel f-card"><h2>Your home-care bookings</h2><Async loading={list.loading} error={list.error} empty={!list.data?.length} emptyText="No home-care bookings yet.">
      {list.data?.map((x) => <div className="document-row" key={x.id}><div><strong>{x.type === 'sample' ? 'Home lab test' : `Home ${x.type} visit`}</strong><span>{fmt(x.scheduledFor)} {x.timeSlot}</span></div><span className="status status-scheduled">{x.status}</span></div>)}</Async></section></div>
}

export function MyBookings({ onNew, onOpen }: { onNew: () => void; onOpen: (id: string) => void }) {
  const amb = useLoad<any[]>('/ambulance/bookings'), hc = useLoad<any[]>('/homecare/bookings')
  const rows = [...(amb.data ?? []).map((x) => ({ k: `a${x.id}`, t: 'AMBULANCE', title: `${x.emergencyType ?? 'Ambulance'} request`, d: x.createdAt, s: x.status, id: x.id })), ...(hc.data ?? []).map((x) => ({ k: `h${x.id}`, t: x.type === 'sample' ? 'LAB TEST' : 'HOME ' + String(x.type).toUpperCase(), title: x.type === 'sample' ? 'Home sample collection' : `${x.type} visit`, d: x.scheduledFor, s: x.status, id: '' }))]
  return <div className="provider-page"><Head title="My bookings" sub="Track and manage your care appointments" /><div className="page-actions"><button className="primary-button" onClick={onNew}>+ New booking</button></div>
    <section className="booking-list panel"><Async loading={amb.loading || hc.loading} error={amb.error || hc.error} empty={!rows.length} emptyText="No bookings yet. Request an ambulance or book a home visit.">
      {rows.map((r) => <div className="booking-row" key={r.k}><div className="appointment-copy"><div className="appointment-tag">{r.t}</div><h3>{r.title}</h3><p>{fmt(r.d)}</p></div><span className="status status-scheduled">{r.s}</span>{r.id && <button className="secondary-button compact" onClick={() => onOpen(r.id)}>Track</button>}</div>)}</Async></section></div>
}

const T = ({ head, children }: { head: string[]; children: ReactNode }) => <div className="f-scroll"><table className="f-table"><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
export function HospitalLive({ active }: { active: string }) {
  if (active === 'Requests') return <HRequests />
  if (active === 'Admissions') return <HAdmissions />
  if (active === 'Documents') return <HDocuments />
  if (active === 'Profile') return <HProfile />
  return <HOverview />
}
function HOverview() {
  const o = useLoad<any>('/hospital/overview', 10000), arr = useLoad<any[]>('/hospital/incoming-ambulances', 10000)
  const d = o.data
  return <div className="provider-page"><Head title="Hospital overview" sub="Coordinate emergency arrivals, transfers and available capacity" />
    <Async loading={o.loading} error={o.error}>{d && <section className="provider-stats">{([[d.incomingPatients, 'Incoming patients', `${d.arrivingSoon} arriving soon`], [d.bedsAvailable, 'Beds available', `${d.icuBeds} ICU beds`], [d.activeTransfers, 'Active transfers', `${d.highPriorityTransfers} high priority`], [`${d.avgHandoverMin} min`, 'Avg. handover', '']] as const).map(([v, l, s]) => <div className="provider-stat" key={l}><div><strong>{v}</strong><span>{l}</span><small>{s}</small></div></div>)}</section>}</Async>
    <section className="panel f-card"><h2>Ambulance arrivals</h2><Async loading={arr.loading} error={arr.error} empty={!arr.data?.length} emptyText="No ambulances are heading here right now.">
      <T head={['Ambulance', 'Case', 'ETA', 'Priority']}>{arr.data?.map((x, i) => <tr key={x.id ?? i}><td>{x.plate}</td><td>{x.emergencyType}{x.patientSummary ? ` · ${x.patientSummary}` : ''}</td><td>{x.etaMinutes} min</td><td><span className={`status ${x.severity === 'critical' ? 'status-critical' : 'status-scheduled'}`}>{x.severity}</span></td></tr>)}</T></Async></section></div>
}
function HRequests() {
  const l = useLoad<any[]>('/hospital/transfer-requests'), [f, setF] = useState({ patientName: '', priority: 'priority', reason: '', destination: '' }), [errs, setErrs] = useState<Record<string, string>>({}), a = useAction()
  const submit = async (e: FormEvent) => {
    e.preventDefault(); const er: Record<string, string> = {}
    if (f.patientName.trim().length < 2) er.patientName = "Enter the patient's name."; if (f.reason.trim().length < 3) er.reason = 'Describe the condition.'; if (f.destination.trim().length < 2) er.destination = 'Enter the destination.'
    setErrs(er); if (Object.keys(er).length) return
    if (await a.run(() => api('/hospital/transfer-requests', { method: 'POST', body: f }), 'Request sent.')) { setF({ patientName: '', priority: 'priority', reason: '', destination: '' }); l.reload() }
  }
  return <div className="provider-page"><Head title="Requests" sub="Request an ambulance or transfer and follow its status" />
    <form className="panel f-card" onSubmit={submit} noValidate><h2>New transfer request</h2>
      <div className="f-row"><Field label="Patient name" err={errs.patientName}><input className="f-input" value={f.patientName} onChange={(e) => setF({ ...f, patientName: e.target.value })} /></Field><Field label="Priority"><select className="f-input" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}><option value="critical">Critical</option><option value="priority">Priority</option><option value="scheduled">Scheduled</option></select></Field></div>
      <Field label="Reason or condition" err={errs.reason}><input className="f-input" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
      <Field label="Destination hospital" err={errs.destination}><input className="f-input" value={f.destination} onChange={(e) => setF({ ...f, destination: e.target.value })} /></Field>
      <button className="primary-button" disabled={a.busy}>{a.busy ? 'Sending…' : 'Request ambulance'}</button>{a.note}</form>
    <section className="panel f-card"><h2>Your requests</h2><Async loading={l.loading} error={l.error} empty={!l.data?.length} emptyText="No requests yet.">
      <T head={['Patient', 'Reason', 'Priority', 'Status']}>{l.data?.map((x) => <tr key={x.id}><td>{x.patientName}</td><td>{x.reason}</td><td>{x.priority}</td><td><span className="status status-scheduled">{x.status}</span></td></tr>)}</T></Async></section></div>
}
function HAdmissions() {
  const cap = useLoad<{ generalBeds: number; icuBeds: number }>('/hospital/capacity'), pre = useLoad<any[]>('/hospital/pre-admissions'), a = useAction(), [g, setG] = useState(''), [i, setI] = useState(''), [err, setErr] = useState('')
  useEffect(() => { if (cap.data) { setG(String(cap.data.generalBeds)); setI(String(cap.data.icuBeds)) } }, [cap.data])
  const save = async (e: FormEvent) => { e.preventDefault(); if (!/^\d+$/.test(g) || !/^\d+$/.test(i)) return setErr('Enter whole numbers, 0 or more.'); setErr(''); await a.run(() => api('/hospital/capacity', { method: 'PUT', body: { generalBeds: +g, icuBeds: +i } }), 'Capacity saved.') }
  const decide = async (id: string, status: string) => { if (await a.run(() => api(`/hospital/pre-admissions/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } }))) pre.reload() }
  return <div className="provider-page"><Head title="Admissions" sub="Bed capacity and pre-admission requests" />
    <form className="panel f-card" onSubmit={save} noValidate><h2>Bed and ICU capacity</h2><Async loading={cap.loading} error={cap.error}>
      <div className="f-row"><Field label="General beds free"><input className="f-input" type="number" min={0} value={g} onChange={(e) => setG(e.target.value)} /></Field><Field label="ICU beds free" err={err}><input className="f-input" type="number" min={0} value={i} onChange={(e) => setI(e.target.value)} /></Field></div>
      <button className="primary-button" disabled={a.busy}>Save capacity</button></Async>{a.note}</form>
    <section className="panel f-card"><h2>Pre-admission requests</h2><Async loading={pre.loading} error={pre.error} empty={!pre.data?.length} emptyText="No pre-admission requests.">
      <T head={['Patient', 'Case', 'Status', '']}>{pre.data?.map((x) => <tr key={x.id}><td>{x.patientName}</td><td>{x.emergencyType}</td><td><span className="status status-scheduled">{x.status}</span></td><td>{x.status === 'pending' && <><button className="primary-button compact" disabled={a.busy} onClick={() => decide(x.id, 'accepted')}>Accept</button> <button className="secondary-button compact" disabled={a.busy} onClick={() => decide(x.id, 'rejected')}>Reject</button></>}</td></tr>)}</T></Async></section></div>
}
function HDocuments() {
  const l = useLoad<any[]>('/hospital/documents'), [name, setName] = useState(''), [file, setFile] = useState<File | null>(null), [errs, setErrs] = useState<Record<string, string>>({}), a = useAction()
  const submit = async (e: FormEvent) => {
    e.preventDefault(); const er: Record<string, string> = {}
    if (name.trim().length < 2) er.name = 'Enter a document name.'; if (!file) er.file = 'Choose a file.'; else if (file.size > 10e6) er.file = 'File is larger than 10 MB.'
    setErrs(er); if (Object.keys(er).length || !file) return
    const fd = new FormData(); fd.append('name', name.trim()); fd.append('file', file)
    if (await a.run(() => api('/hospital/documents', { method: 'POST', body: fd }), 'Document uploaded.')) { setName(''); setFile(null); l.reload() }
  }
  return <div className="provider-page"><Head title="Documents" sub="Keep your verification documents up to date" />
    <form className="panel f-card" onSubmit={submit} noValidate><h2>Upload a document</h2>
      <Field label="Document name" err={errs.name}><input className="f-input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="File (PDF, JPG or PNG, up to 10 MB)" err={errs.file}><input className="f-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
      <button className="primary-button" disabled={a.busy}>{a.busy ? 'Uploading…' : 'Upload'}</button>{a.note}</form>
    <section className="panel document-list"><div className="section-heading"><div><h2>Uploaded files</h2></div></div><Async loading={l.loading} error={l.error} empty={!l.data?.length} emptyText="No documents uploaded yet.">
      {l.data?.map((x) => <div className="document-row" key={x.id}><div><strong>{x.name}</strong><span>{fmt(x.uploadedAt)}</span></div><span className="status status-confirmed">{x.status}</span></div>)}</Async></section></div>
}
function HProfile() {
  const p = useLoad<any>('/hospital/profile'), [f, setF] = useState({ name: '', registrationNo: '', phone: '', address: '' }), [errs, setErrs] = useState<Record<string, string>>({}), a = useAction()
  useEffect(() => { if (p.data) setF({ name: p.data.name ?? '', registrationNo: p.data.registrationNo ?? '', phone: p.data.phone ?? '', address: p.data.address ?? '' }) }, [p.data])
  const submit = async (e: FormEvent) => {
    e.preventDefault(); const er: Record<string, string> = {}
    if (f.name.trim().length < 2) er.name = 'Enter the hospital name.'; if (!f.registrationNo.trim()) er.registrationNo = 'Enter the registration number.'; if (!phoneOk(f.phone)) er.phone = 'Enter a valid 10-digit number.'; if (f.address.trim().length < 5) er.address = 'Enter the full address.'
    setErrs(er); if (Object.keys(er).length) return; if (await a.run(() => api('/hospital/profile', { method: 'PUT', body: f }), 'Profile saved.')) p.reload()
  }
  return <div className="provider-page"><Head title="Hospital profile" sub="Details shown to ambulance crews and patients" />
    <Async loading={p.loading} error={p.error}>{p.data && <p className="f-state f-ok">Profile readiness: {p.data.readinessPercent}%</p>}
      <form className="panel f-card" onSubmit={submit} noValidate>
        <Field label="Hospital name" err={errs.name}><input className="f-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Registration number" err={errs.registrationNo}><input className="f-input" value={f.registrationNo} onChange={(e) => setF({ ...f, registrationNo: e.target.value })} /></Field>
        <Field label="Emergency desk phone" err={errs.phone}><input className="f-input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Address" err={errs.address}><textarea className="f-input" rows={2} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
        <button className="primary-button" disabled={a.busy}>Save profile</button>{a.note}</form></Async></div>
}