import { Link, useLocation } from 'react-router-dom';

const nav = [
  { label: 'App Demo', to: '/' },
  { label: 'Register', to: '/register' },
  { label: 'Contacts', to: '/contacts' },
  { label: 'SOS', to: '/sos' },
  { label: 'Incidents', to: '/incidents' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Architecture', to: '/architecture' },
  { label: 'Invoice', to: '/invoice' },
  { label: 'Presentation', to: '/presentation' },
];

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
        active ? 'bg-white/20 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-[#0D2B5E] px-6 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1565C0] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">IS</span>
          </div>
          <span className="text-white font-bold text-sm">iScream</span>
        </div>

        <div className="h-4 w-px bg-white/20" />

        <div className="flex gap-2 flex-wrap">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-300 text-xs font-semibold">Demo Online</span>
        </div>
      </div>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

