import Card from '../components/Card.jsx';

export default function Presentation() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Presentation</h2>
      <Card title="Talking points" tone="dark">
        <ul className="list-disc pl-5 text-slate-700 space-y-1">
          <li>Fast SOS triggering and reliable delivery</li>
          <li>Trusted contacts with GPS location share</li>
          <li>Admin queue for monitoring and status updates</li>
          <li>Phase 2: on-device detection and integrations</li>
        </ul>
      </Card>
    </div>
  );
}
