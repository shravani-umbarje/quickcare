import { AmbulanceBooking, HomeCareBooking, HospitalLive, Login, MyBookings } from './Live'
import { getUser, signOut, type User } from './api'
import { createElement, useState, type ButtonHTMLAttributes, type ChangeEvent, type InputHTMLAttributes } from 'react'

type IconName =
  | 'ambulance'
  | 'arrow'
  | 'activity'
  | 'bell'
  | 'building'
  | 'camera'
  | 'calendar'
  | 'chevron'
  | 'clock'
  | 'document'
  | 'family'
  | 'heart'
  | 'home'
  | 'lab'
  | 'location'
  | 'menu'
  | 'nurse'
  | 'phone'
  | 'profile'
  | 'shield'
  | 'sparkle'
  | 'upload'
  | 'user'
  | 'x'

const iconPaths: Record<IconName, React.ReactNode> = {
  activity: <path d="M3 12h4l2-7 4 14 2-7h6" />,
  ambulance: (
    <>
      <path d="M3 11.5V7.7c0-.7.5-1.2 1.2-1.2H14v8H6a3 3 0 0 0-3-3Z" />
      <path d="M14 9h3.1c.5 0 .9.2 1.2.6l2.2 2.9v2H19" />
      <circle cx="7.5" cy="15.5" r="2" />
      <circle cx="17" cy="15.5" r="2" />
      <path d="M8.5 9.5h3M10 8v3" />
    </>
  ),
  arrow: <path d="m9 18 6-6-6-6" />,
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M10 19h4" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16M17 9h3v12M8 7h2M13 7h1M8 11h2M13 11h1M8 15h2M13 15h1M3 21h18" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h6M9 17h5" />
    </>
  ),
  family: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2" />
      <path d="M3 20a6 6 0 0 1 12 0M14 16a5 5 0 0 1 7 4" />
    </>
  ),
  heart: (
    <>
      <path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z" />
      <path d="M7 12h3l1.2-2.5L13 15l1.2-3H17" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v11h14V10M9 21v-7h6v7" />
    </>
  ),
  lab: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 15h9" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  nurse: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0M9 3.8V2h6v1.8M9.5 15l2.5 3 2.5-3" />
    </>
  ),
  phone: (
    <path d="M21 16.5v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6 19.7 19.7 0 0 1-3.1-8.7A2 2 0 0 1 3.1 1.5h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L7.1 9.4a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.4 1.9.6 2.9.7a2 2 0 0 1 1.7 2.1Z" />
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  sparkle: <path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8L12 3ZM5 16l.7 2.3L8 19l-2.3.7L5 22l-.7-2.3L2 19l2.3-.7L5 16ZM19 14l.7 2.3 2.3.7-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />,
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20a6 6 0 0 1 12 0" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
}

function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {iconPaths[name]}
    </svg>
  )
}

function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return createElement('button', { className, ...props })
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return createElement('input', props)
}

function Heading({ level, children }: { level: 1 | 2 | 3; children: React.ReactNode }) {
  return createElement(`h${level}`, null, children)
}

const navItems = [
  { label: 'Home', icon: 'home' as IconName },
  { label: 'Bookings', icon: 'calendar' as IconName },
  { label: 'Records', icon: 'document' as IconName },
  { label: 'Family', icon: 'family' as IconName },
  { label: 'Profile', icon: 'profile' as IconName },
]

type PortalRole = 'Patient' | 'Driver' | 'Hospital' | 'Laboratory'

const portalNav: Record<Exclude<PortalRole, 'Patient'>, { label: string; icon: IconName }[]> = {
  Driver: [
    { label: 'Overview', icon: 'home' },
    { label: 'Requests', icon: 'bell' },
    { label: 'Trips', icon: 'ambulance' },
    { label: 'Documents', icon: 'document' },
    { label: 'Profile', icon: 'profile' },
  ],
  Hospital: [
    { label: 'Overview', icon: 'home' },
    { label: 'Requests', icon: 'ambulance' },
    { label: 'Admissions', icon: 'building' },
    { label: 'Documents', icon: 'document' },
    { label: 'Profile', icon: 'profile' },
  ],
  Laboratory: [
    { label: 'Overview', icon: 'home' },
    { label: 'Test orders', icon: 'lab' },
    { label: 'Samples', icon: 'activity' },
    { label: 'Documents', icon: 'document' },
    { label: 'Profile', icon: 'profile' },
  ],
}

const portalProfiles: Record<PortalRole, { initials: string; name: string; meta: string }> = {
  Patient: { initials: 'AK', name: 'Arjun Kapoor', meta: 'Patient ID · QC-2048' },
  Driver: { initials: 'RV', name: 'Rahul Verma', meta: 'Driver · AMB-118' },
  Hospital: { initials: 'CH', name: 'CityCare Hospital', meta: 'Partner · HSP-024' },
  Laboratory: { initials: 'ML', name: 'MediLabs Diagnostics', meta: 'Partner · LAB-016' },
}

const services = [
  {
    title: 'Book Ambulance',
    description: 'Emergency or scheduled transport',
    icon: 'ambulance' as IconName,
    theme: 'service-red',
  },
  {
    title: 'Home Nurse',
    description: 'Qualified care at your doorstep',
    icon: 'nurse' as IconName,
    theme: 'service-green',
  },
  {
    title: 'Home Lab Test',
    description: 'Sample collection from home',
    icon: 'lab' as IconName,
    theme: 'service-blue',
  },
]

const recordItems = [
  { name: 'Complete Blood Count', meta: 'Lab report · 12 Jun 2025', status: 'Ready', icon: 'lab' as IconName },
  { name: 'Home Nursing Summary', meta: 'Visit notes · 08 Jun 2025', status: 'Reviewed', icon: 'document' as IconName },
  { name: 'Ambulance Trip Summary', meta: 'Transport · 21 May 2025', status: 'Complete', icon: 'ambulance' as IconName },
]

function App() {
  const [user, setUser] = useState<User | null>(getUser())
  const [careType, setCareType] = useState<'nurse' | 'doctor' | 'sample'>('nurse')
  const [role, setRole] = useState<PortalRole>(({ patient: 'Patient', driver: 'Driver', hospital: 'Hospital', lab: 'Laboratory' } as Record<string, PortalRole>)[getUser()?.role ?? 'patient'] ?? 'Patient')
  const [active, setActive] = useState(getUser()?.role && getUser()?.role !== 'patient' ? 'Overview' : 'Home')
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [bookingService, setBookingService] = useState<string | null>(null)
  const [bookingStep, setBookingStep] = useState(1)
  const [menuOpen, setMenuOpen] = useState(false)

  const startBooking = (service: string) => {   // Home care and ambulance now open real, API-connected pages
    if (/nurse/i.test(service)) { setCareType('nurse'); setActive('Home care') }
    else if (/lab|sample/i.test(service)) { setCareType('sample'); setActive('Home care') }
    else if (/doctor/i.test(service)) { setCareType('doctor'); setActive('Home care') }
    else setActive('Ambulance')
  }

  const finishBooking = () => {
    setBookingStep(3)
  }

  const currentNav = role === 'Patient' ? navItems : portalNav[role]
  const profile = portalProfiles[role]

  const changeRole = (nextRole: PortalRole) => {
    setRole(nextRole)
    setActive(nextRole === 'Patient' ? 'Home' : 'Overview')
    setRoleMenuOpen(false)
    setMenuOpen(false)
  }

  if (!user) return <Login onDone={(u) => { setUser(u); window.location.reload() }} />

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Icon name="heart" size={22} /></div>
          <div>
            <div className="brand-name">QuickCare</div>
            <div className="brand-caption">Private health support</div>
          </div>
        </div>

        <div className="role-switcher">
          <div className="role-label">Viewing workspace</div>
          <Button className="role-trigger" onClick={() => setRoleMenuOpen(!roleMenuOpen)}>
            <span className={`role-icon role-${role.toLowerCase()}`}>
              <Icon name={role === 'Patient' ? 'user' : role === 'Driver' ? 'ambulance' : role === 'Hospital' ? 'building' : 'lab'} size={17} />
            </span>
            <span><strong>{role}</strong><small>Switch portal</small></span>
            <Icon name="chevron" size={14} />
          </Button>
          {roleMenuOpen && (
            <div className="role-menu">
              {(['Patient', 'Driver', 'Hospital', 'Laboratory'] as PortalRole[]).map((portalRole) => (
                <Button className={portalRole === role ? 'role-option role-option-active' : 'role-option'} key={portalRole} onClick={() => changeRole(portalRole)}>
                  <Icon name={portalRole === 'Patient' ? 'user' : portalRole === 'Driver' ? 'ambulance' : portalRole === 'Hospital' ? 'building' : 'lab'} size={16} />
                  <span>{portalRole}</span>
                  {portalRole === role && <Icon name="shield" size={14} />}
                </Button>
              ))}
            </div>
          )}
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          {currentNav.map((item) => (
            <Button
              className={`nav-item ${active === item.label ? 'nav-item-active' : ''}`}
              key={item.label}
              onClick={() => {
                setActive(item.label)
                setMenuOpen(false)
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="help-card">
          <div className="help-icon"><Icon name="phone" size={18} /></div>
          <div className="help-eyebrow">Need help?</div>
          <div className="help-title">Care team available 24/7</div>
          <Button className="help-link">Call support <Icon name="arrow" size={15} /></Button>
        </div>

        <div className="sidebar-user">
          <div className="avatar">{profile.initials}</div>
          <div className="sidebar-user-copy">
            <strong>{profile.name}</strong>
            <span>{profile.meta}</span>
          </div>
          <Icon name="chevron" size={16} />
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">
            <Button className="icon-button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
              <Icon name="menu" />
            </Button>
            <div className="brand-mark brand-mark-small"><Icon name="heart" size={18} /></div>
            <div className="brand-name">QuickCare</div>
          </div>
          <div className="location">
            <div className="location-icon"><Icon name="location" size={18} /></div>
            <div>
              <span>{role === 'Patient' ? 'Your location' : `${role} workspace`}</span>
              <strong>{role === 'Patient' ? 'Indiranagar, Bengaluru' : profile.name}</strong>
            </div>
            <Icon name="chevron" size={15} />
          </div>
          <div className="top-actions">
            <Button className="icon-button notification" aria-label="Notifications">
              <Icon name="bell" />
              <span />
            </Button>
            <div className="top-avatar" role="button" tabIndex={0} title="Sign out" onClick={signOut}>{profile.initials}</div>
          </div>
        </header>

        <div className="content">
          {role === 'Patient' ? (
            <>
              {active === 'Home' && <Home onBook={startBooking} onNavigate={setActive} />}
              {active === 'Ambulance' && <AmbulanceBooking />}
              {active === 'Home care' && <HomeCareBooking key={careType} initial={careType} />}
              {active === 'Bookings' && <MyBookings onNew={() => setActive('Ambulance')} onOpen={(id) => { history.replaceState(null, '', `?id=${encodeURIComponent(id)}`); setActive('Ambulance') }} />}
              {active === 'Records' && <Records />}
              {active === 'Family' && <Family />}
              {active === 'Profile' && <Profile />}
            </>
          ) : role === 'Hospital' ? <HospitalLive active={active} /> : <ProviderPortal role={role} active={active} onNavigate={setActive} />}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {currentNav.map((item) => (
          <Button
            className={`mobile-nav-item ${active === item.label ? 'mobile-nav-active' : ''}`}
            key={item.label}
            onClick={() => setActive(item.label)}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>

      {bookingService && (
        <BookingModal
          service={bookingService}
          step={bookingStep}
          onClose={() => setBookingService(null)}
          onNext={() => setBookingStep(2)}
          onFinish={finishBooking}
        />
      )}
    </div>
  )
}

function Home({ onBook, onNavigate }: { onBook: (service: string) => void; onNavigate: (page: string) => void }) {
  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">Wednesday, 18 June</div>
          <Heading level={1}>Good morning, Arjun</Heading>
          <p>How can we care for you today?</p>
        </div>
        <div className="care-badge"><Icon name="shield" size={17} /> Your care is private & secure</div>
      </section>

      <section className="emergency-banner">
        <div className="emergency-copy">
          <div className="emergency-icon"><Icon name="ambulance" size={30} /></div>
          <div>
            <div className="emergency-label">Emergency assistance</div>
            <Heading level={2}>Need an ambulance right now?</Heading>
            <p>Our nearest verified ambulance can reach you quickly.</p>
          </div>
        </div>
        <Button className="emergency-button" onClick={() => onBook('Emergency Ambulance')}>
          <Icon name="phone" size={18} />
          Request now
        </Button>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <Heading level={2}>Care at your convenience</Heading>
            <p>Trusted medical support, wherever you are</p>
          </div>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <Button className={`service-card ${service.theme}`} key={service.title} onClick={() => onBook(service.title)}>
              <div className="service-icon"><Icon name={service.icon} size={28} /></div>
              <div className="service-copy">
                <Heading level={3}>{service.title}</Heading>
                <p>{service.description}</p>
              </div>
              <div className="service-arrow"><Icon name="arrow" size={18} /></div>
            </Button>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel booking-panel">
          <div className="section-heading">
            <div>
              <Heading level={2}>Upcoming booking</Heading>
              <p>Your next scheduled care</p>
            </div>
            <Button className="text-button" onClick={() => onNavigate('Bookings')}>View all <Icon name="arrow" size={15} /></Button>
          </div>
          <div className="appointment">
            <div className="date-tile"><strong>20</strong><span>JUN</span></div>
            <div className="appointment-copy">
              <div className="appointment-tag">HOME NURSE</div>
              <Heading level={3}>Post-operative nursing care</Heading>
              <p><Icon name="clock" size={15} /> Friday, 10:30 AM · 60 minutes</p>
            </div>
            <div className="nurse-pill">
              <div className="mini-avatar">NS</div>
              <div><span>Assigned nurse</span><strong>Neha Sharma</strong></div>
            </div>
          </div>
        </section>

        <section className="panel records-preview">
          <div className="section-heading">
            <div>
              <Heading level={2}>My records</Heading>
              <p>Recent health activity</p>
            </div>
            <Button className="text-button" onClick={() => onNavigate('Records')}>View all <Icon name="arrow" size={15} /></Button>
          </div>
          <div className="record-preview-list">
            {recordItems.slice(0, 2).map((record) => (
              <div className="record-preview" key={record.name}>
                <div className="record-icon"><Icon name={record.icon} size={18} /></div>
                <div><strong>{record.name}</strong><span>{record.meta}</span></div>
                <Icon name="arrow" size={16} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="family-strip">
        <div className="family-illustration">
          <div className="family-dot family-dot-one"><Icon name="user" /></div>
          <div className="family-dot family-dot-two"><Icon name="user" /></div>
          <div className="family-dot family-dot-three"><Icon name="user" /></div>
        </div>
        <div className="family-copy">
          <div className="eyebrow">FAMILY CARE</div>
          <Heading level={2}>Care for everyone you love</Heading>
          <p>Manage appointments and records for your family from one secure place.</p>
        </div>
        <Button className="secondary-button" onClick={() => onNavigate('Family')}>Manage family <Icon name="arrow" size={16} /></Button>
      </section>
    </>
  )
}

function Bookings({ onBook }: { onBook: () => void }) {
  return (
    <Page title="My bookings" subtitle="Track and manage your care appointments">
      <div className="page-actions"><Button className="primary-button" onClick={onBook}>+ New booking</Button></div>
      <div className="tab-row"><span className="tab-active">Upcoming</span><span>Past</span><span>Cancelled</span></div>
      <section className="booking-list panel">
        <div className="booking-row">
          <div className="date-tile"><strong>20</strong><span>JUN</span></div>
          <div className="appointment-copy"><div className="appointment-tag">HOME NURSE</div><Heading level={3}>Post-operative nursing care</Heading><p><Icon name="clock" size={15} /> Friday, 10:30 AM · 60 minutes</p></div>
          <span className="status status-confirmed">Confirmed</span>
          <Button className="secondary-button compact">View details</Button>
        </div>
        <div className="booking-row">
          <div className="date-tile date-blue"><strong>24</strong><span>JUN</span></div>
          <div className="appointment-copy"><div className="appointment-tag tag-blue">LAB TEST</div><Heading level={3}>Thyroid health package</Heading><p><Icon name="clock" size={15} /> Tuesday, 8:00 AM · Fasting required</p></div>
          <span className="status status-scheduled">Scheduled</span>
          <Button className="secondary-button compact">View details</Button>
        </div>
      </section>
    </Page>
  )
}

function Records() {
  return (
    <Page title="Health records" subtitle="All your care history, safely organised">
      <div className="search-box"><Icon name="document" size={18} /><Input aria-label="Search records" placeholder="Search reports, visits, or tests" /></div>
      <div className="record-stats">
        <div><strong>18</strong><span>Total records</span></div>
        <div><strong>6</strong><span>Lab reports</span></div>
        <div><strong>4</strong><span>Care visits</span></div>
      </div>
      <section className="panel record-full-list">
        {recordItems.map((record) => (
          <div className="record-full" key={record.name}>
            <div className="record-icon"><Icon name={record.icon} /></div>
            <div><Heading level={3}>{record.name}</Heading><p>{record.meta}</p></div>
            <span className="status status-confirmed">{record.status}</span>
            <Button className="icon-button"><Icon name="arrow" /></Button>
          </div>
        ))}
      </section>
    </Page>
  )
}

function Family() {
  const people = [
    { initials: 'AK', name: 'Arjun Kapoor', relation: 'You', tone: 'avatar-green' },
    { initials: 'SK', name: 'Sunita Kapoor', relation: 'Mother · 62 years', tone: 'avatar-coral' },
    { initials: 'RK', name: 'Rohan Kapoor', relation: 'Son · 9 years', tone: 'avatar-blue' },
  ]
  return (
    <Page title="Family" subtitle="Manage care for the people who matter most">
      <div className="page-actions"><Button className="primary-button">+ Add family member</Button></div>
      <div className="people-grid">
        {people.map((person) => (
          <section className="person-card" key={person.name}>
            <div className={`person-avatar ${person.tone}`}>{person.initials}</div>
            <Heading level={3}>{person.name}</Heading>
            <p>{person.relation}</p>
            <div className="person-meta"><span>Bookings <strong>2</strong></span><span>Records <strong>8</strong></span></div>
            <Button className="secondary-button">View profile</Button>
          </section>
        ))}
      </div>
    </Page>
  )
}

function Profile() {
  return (
    <Page title="My profile" subtitle="Personal details and health preferences">
      <section className="profile-card panel">
        <div className="profile-heading">
          <div className="profile-avatar">AK</div>
          <div><Heading level={2}>Arjun Kapoor</Heading><p>Patient ID · QC-2048</p><span className="verified"><Icon name="shield" size={14} /> Verified account</span></div>
          <Button className="secondary-button">Edit profile</Button>
        </div>
        <div className="profile-details">
          <div><span>Phone number</span><strong>+91 98765 43210</strong></div>
          <div><span>Email</span><strong>arjun.k@example.com</strong></div>
          <div><span>Date of birth</span><strong>14 September 1990</strong></div>
          <div><span>Blood group</span><strong>O positive</strong></div>
          <div className="detail-wide"><span>Default address</span><strong>42, 12th Main Road, Indiranagar, Bengaluru 560038</strong></div>
        </div>
      </section>
      <section className="privacy-card"><Icon name="shield" size={24} /><div><Heading level={3}>Your privacy comes first</Heading><p>Your medical information is encrypted and only shared with care professionals you approve.</p></div></section>
    </Page>
  )
}

function Page({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="page">
      <section className="page-header"><div><div className="eyebrow">QUICKCARE</div><Heading level={1}>{title}</Heading><p>{subtitle}</p></div></section>
      {children}
    </div>
  )
}

const providerData = {
  Driver: {
    greeting: 'Ready for your next trip, Rahul?',
    subtitle: 'Stay online to receive nearby ambulance requests.',
    badge: 'Online · Accepting trips',
    primaryAction: 'View live requests',
    stats: [
      ['3', 'Trips today', '+1 from yesterday'],
      ['24 min', 'Avg. response', '4 min faster'],
      ['4.9', 'Driver rating', '128 reviews'],
      ['₹3,840', 'This week', '12 completed trips'],
    ],
    queueTitle: 'Nearby requests',
    queueSubtitle: 'Requests sorted by urgency and distance',
    items: [
      { title: 'Emergency pickup', meta: '100 Feet Road, Indiranagar', detail: '1.2 km away · 3 min', status: 'Critical', tone: 'critical' },
      { title: 'Hospital transfer', meta: 'Manipal Hospital → CityCare', detail: '4.8 km away · 12 min', status: 'Scheduled', tone: 'scheduled' },
      { title: 'Discharge pickup', meta: 'St. Martha’s Hospital', detail: '6.1 km away · 16 min', status: 'Standard', tone: 'confirmed' },
    ],
  },
  Hospital: {
    greeting: 'Good morning, CityCare team',
    subtitle: 'Coordinate emergency arrivals, transfers, and available capacity.',
    badge: 'Emergency desk active',
    primaryAction: 'Request ambulance',
    stats: [
      ['12', 'Incoming patients', '3 arriving soon'],
      ['18', 'Beds available', '6 ICU beds'],
      ['7', 'Active transfers', '2 high priority'],
      ['14 min', 'Avg. handover', 'Within target'],
    ],
    queueTitle: 'Ambulance arrivals',
    queueSubtitle: 'Live arrivals and patient handover status',
    items: [
      { title: 'QC Ambulance · AMB-118', meta: 'Cardiac emergency · Male, 58', detail: 'ETA 6 minutes · Bay 2 assigned', status: 'Critical', tone: 'critical' },
      { title: 'QC Ambulance · AMB-092', meta: 'Road accident · Female, 34', detail: 'ETA 14 minutes · Trauma alerted', status: 'Priority', tone: 'scheduled' },
      { title: 'Inter-hospital transfer', meta: 'Neurology referral · Male, 67', detail: 'Arriving 11:40 AM', status: 'Scheduled', tone: 'confirmed' },
    ],
  },
  Laboratory: {
    greeting: 'Good morning, MediLabs team',
    subtitle: 'Manage home collections, samples, and diagnostic reports.',
    badge: 'Collection service active',
    primaryAction: 'Create test order',
    stats: [
      ['28', 'Orders today', '9 home collections'],
      ['16', 'Samples received', '4 awaiting pickup'],
      ['11', 'Reports ready', '3 need review'],
      ['96%', 'On-time reports', '+2.4% this week'],
    ],
    queueTitle: 'Today’s test orders',
    queueSubtitle: 'Priority collections and pending laboratory work',
    items: [
      { title: 'Complete health package', meta: 'Arjun Kapoor · Home collection', detail: '8:30 AM · Collector assigned', status: 'Collection', tone: 'scheduled' },
      { title: 'Complete blood count', meta: 'Sunita Kapoor · Sample QC-8021', detail: 'Received · Processing', status: 'In lab', tone: 'confirmed' },
      { title: 'Thyroid profile', meta: 'Meera Shah · Sample QC-8016', detail: 'Clinical review pending', status: 'Review', tone: 'critical' },
    ],
  },
} as const

function ProviderPortal({
  role,
  active,
  onNavigate,
}: {
  role: Exclude<PortalRole, 'Patient'>
  active: string
  onNavigate: (page: string) => void
}) {
  const data = providerData[role]
  const [uploadedDocs, setUploadedDocs] = useState<string[]>(['Registration certificate.pdf', 'Service licence.pdf'])
  const [photo, setPhoto] = useState<string | null>(null)

  const handleDocuments = (event: ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(event.target.files ?? []).map((file) => file.name)
    setUploadedDocs((current) => [...current, ...names])
  }

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setPhoto(URL.createObjectURL(file))
  }

  if (active === 'Documents') {
    return (
      <ProviderDocuments role={role} documents={uploadedDocs} onUpload={handleDocuments} />
    )
  }

  if (active === 'Profile') {
    return (
      <ProviderProfile role={role} photo={photo} documents={uploadedDocs} onPhoto={handlePhoto} onUpload={handleDocuments} />
    )
  }

  const sectionTitle = active === 'Overview' ? data.queueTitle : active
  const sectionSubtitle = active === 'Overview' ? data.queueSubtitle : `Manage ${active.toLowerCase()} for your ${role.toLowerCase()} workspace`

  return (
    <div className="provider-page">
      <section className="provider-welcome">
        <div>
          <div className="eyebrow">{role.toUpperCase()} PORTAL</div>
          <Heading level={1}>{active === 'Overview' ? data.greeting : active}</Heading>
          <p>{active === 'Overview' ? data.subtitle : sectionSubtitle}</p>
        </div>
        <div className="provider-actions">
          <span className="online-badge"><span />{data.badge}</span>
          <Button className="primary-button" onClick={() => onNavigate(role === 'Laboratory' ? 'Test orders' : 'Requests')}>{data.primaryAction}</Button>
        </div>
      </section>

      {active === 'Overview' && (
        <section className="provider-stats">
          {data.stats.map(([value, label, trend], index) => (
            <div className="provider-stat" key={label}>
              <div className={`stat-icon stat-tone-${index + 1}`}>
                <Icon name={index === 0 ? 'activity' : index === 1 ? 'clock' : index === 2 ? 'shield' : 'document'} size={19} />
              </div>
              <div><strong>{value}</strong><span>{label}</span><small>{trend}</small></div>
            </div>
          ))}
        </section>
      )}

      <div className="provider-layout">
        <section className="panel provider-queue">
          <div className="section-heading">
            <div><Heading level={2}>{sectionTitle}</Heading><p>{sectionSubtitle}</p></div>
            <Button className="text-button" onClick={() => onNavigate(role === 'Laboratory' ? 'Test orders' : 'Requests')}>View all <Icon name="arrow" size={15} /></Button>
          </div>
          <div className="provider-items">
            {data.items.map((item, index) => (
              <div className="provider-item" key={item.title}>
                <div className={`provider-number number-${item.tone}`}>{String(index + 1).padStart(2, '0')}</div>
                <div className="provider-item-copy">
                  <Heading level={3}>{item.title}</Heading>
                  <p>{item.meta}</p>
                  <span><Icon name={role === 'Driver' ? 'location' : role === 'Hospital' ? 'clock' : 'lab'} size={14} />{item.detail}</span>
                </div>
                <span className={`status status-${item.tone}`}>{item.status}</span>
                <Button className="secondary-button compact">{role === 'Driver' ? 'Review' : 'Open'}</Button>
              </div>
            ))}
          </div>
        </section>

        <aside className="provider-side">
          <section className="panel readiness-card">
            <div className="readiness-ring"><span>92%</span></div>
            <div><Heading level={3}>Profile readiness</Heading><p>Add your latest documents to stay verified.</p></div>
            <Button className="secondary-button" onClick={() => onNavigate('Profile')}>Complete profile</Button>
          </section>
          <section className="provider-help">
            <Icon name="shield" size={22} />
            <div><Heading level={3}>QuickCare partner support</Heading><p>Priority support is available around the clock.</p></div>
            <Button className="icon-button"><Icon name="phone" size={17} /></Button>
          </section>
        </aside>
      </div>
    </div>
  )
}

function ProviderDocuments({
  role,
  documents,
  onUpload,
}: {
  role: Exclude<PortalRole, 'Patient'>
  documents: string[]
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const inputId = `${role.toLowerCase()}-documents`
  return (
    <Page title="Documents" subtitle={`Manage verification and compliance files for your ${role.toLowerCase()} account`}>
      <section className="upload-zone">
        <div className="upload-icon"><Icon name="upload" size={27} /></div>
        <Heading level={2}>Add documents</Heading>
        <p>Upload licences, certificates, insurance, or identity documents.</p>
        <label className="primary-button upload-label" htmlFor={inputId}>Choose files</label>
        <Input className="hidden-file" id={inputId} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={onUpload} />
        <span>PDF, JPG or PNG · Up to 10 MB each</span>
      </section>
      <section className="panel document-list">
        <div className="section-heading"><div><Heading level={2}>Uploaded files</Heading><p>{documents.length} documents in your workspace</p></div></div>
        {documents.map((document, index) => (
          <div className="document-row" key={`${document}-${index}`}>
            <div className="record-icon"><Icon name="document" size={18} /></div>
            <div><strong>{document}</strong><span>Uploaded today · Secure file</span></div>
            <span className="status status-confirmed"><Icon name="shield" size={12} /> Verified</span>
            <Button className="icon-button"><Icon name="menu" size={17} /></Button>
          </div>
        ))}
      </section>
    </Page>
  )
}

function ProviderProfile({
  role,
  photo,
  documents,
  onPhoto,
  onUpload,
}: {
  role: Exclude<PortalRole, 'Patient'>
  photo: string | null
  documents: string[]
  onPhoto: (event: ChangeEvent<HTMLInputElement>) => void
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const profile = portalProfiles[role]
  const photoId = `${role.toLowerCase()}-photo`
  const documentId = `${role.toLowerCase()}-profile-document`
  return (
    <Page title={`${role} profile`} subtitle="Keep your workspace details accurate and verified">
      <section className="panel provider-profile-card">
        <div className="provider-profile-top">
          <div className="photo-upload">
            {photo ? createElement('img', { src: photo, alt: `${role} profile preview` }) : <span>{profile.initials}</span>}
            <label htmlFor={photoId} aria-label="Upload profile photo"><Icon name="camera" size={16} /></label>
            <Input className="hidden-file" id={photoId} type="file" accept="image/*" onChange={onPhoto} />
          </div>
          <div className="provider-profile-copy">
            <Heading level={2}>{profile.name}</Heading>
            <p>{profile.meta}</p>
            <span className="verified"><Icon name="shield" size={14} /> Verified QuickCare partner</span>
          </div>
          <Button className="secondary-button">Edit information</Button>
        </div>
        <div className="profile-details">
          <div><span>Contact number</span><strong>+91 98765 41028</strong></div>
          <div><span>Email address</span><strong>operations@quickcare-partner.in</strong></div>
          <div><span>Registration ID</span><strong>{profile.meta.split('· ')[1]}</strong></div>
          <div><span>Service area</span><strong>Bengaluru Central · 25 km</strong></div>
          <div className="detail-wide"><span>Registered address</span><strong>18, CMH Road, Indiranagar, Bengaluru 560038</strong></div>
        </div>
      </section>

      <section className="panel compact-upload-card">
        <div className="record-icon"><Icon name="upload" size={19} /></div>
        <div><Heading level={3}>Add account document</Heading><p>{documents.length} files already uploaded</p></div>
        <label className="secondary-button upload-label" htmlFor={documentId}>Add document</label>
        <Input className="hidden-file" id={documentId} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={onUpload} />
      </section>
    </Page>
  )
}

function BookingModal({
  service,
  step,
  onClose,
  onNext,
  onFinish,
}: {
  service: string
  step: number
  onClose: () => void
  onNext: () => void
  onFinish: () => void
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Book ${service}`}>
      <section className="modal">
        <div className="modal-top">
          <div><div className="eyebrow">NEW BOOKING</div><Heading level={2}>{service}</Heading></div>
          <Button className="icon-button" aria-label="Close booking" onClick={onClose}><Icon name="x" /></Button>
        </div>
        <div className="stepper">
          {[1, 2, 3].map((number) => <span className={step >= number ? 'step-active' : ''} key={number}>{number}</span>)}
          <div className="step-line" />
        </div>
        {step === 1 && (
          <div className="modal-body">
            <Heading level={3}>Where do you need care?</Heading>
            <p>Confirm your pickup or care location.</p>
            <label className="field-label">Address</label>
            <div className="input-shell"><Icon name="location" size={18} /><Input defaultValue="42, 12th Main Road, Indiranagar" /></div>
            <div className="map-placeholder">
              <div className="map-road road-one" /><div className="map-road road-two" />
              <div className="map-pin"><Icon name="location" size={22} /></div>
              <span>Drag pin to adjust</span>
            </div>
            <Button className="primary-button full-button" onClick={onNext}>Continue to schedule <Icon name="arrow" size={17} /></Button>
          </div>
        )}
        {step === 2 && (
          <div className="modal-body">
            <Heading level={3}>Choose a schedule</Heading>
            <p>Select the best date and time for your care.</p>
            <div className="date-options">
              {['Today', 'Tomorrow', '20 Jun'].map((date, index) => <Button className={index === 1 ? 'date-option date-option-active' : 'date-option'} key={date}><span>{date}</span><strong>{index === 0 ? '18' : index === 1 ? '19' : '20'}</strong></Button>)}
            </div>
            <label className="field-label">Available times</label>
            <div className="time-options"><span>9:00 AM</span><span className="time-active">10:30 AM</span><span>12:00 PM</span><span>3:30 PM</span></div>
            <div className="booking-note"><Icon name="shield" size={18} /><span>A verified care professional will be assigned after confirmation.</span></div>
            <Button className="primary-button full-button" onClick={onFinish}>Confirm booking <Icon name="arrow" size={17} /></Button>
          </div>
        )}
        {step === 3 && (
          <div className="success-state">
            <div className="success-icon"><Icon name="shield" size={36} /></div>
            <div className="eyebrow">BOOKING CONFIRMED</div>
            <Heading level={2}>Your care is on the way</Heading>
            <p>We’ve received your request. You’ll get a confirmation and provider details shortly.</p>
            <div className="confirmation-code"><span>Booking reference</span><strong>QC-18542</strong></div>
            <Button className="primary-button full-button" onClick={onClose}>Done</Button>
          </div>
        )}
      </section>
    </div>
  )
}

export default App
