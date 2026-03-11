import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';

import AppDemo from './pages/AppDemo.jsx';
import Register from './pages/Register.jsx';
import Contacts from './pages/Contacts.jsx';
import Sos from './pages/Sos.jsx';
import Incidents from './pages/Incidents.jsx';
import Admin from './pages/Admin.jsx';
import Architecture from './pages/Architecture.jsx';
import Invoice from './pages/Invoice.jsx';
import Presentation from './pages/Presentation.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AppDemo />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/sos" element={<Sos />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/dashboard" element={<Admin />} />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/presentation" element={<Presentation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

