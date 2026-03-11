import Card from '../components/Card.jsx';

export default function Architecture() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Architecture (Demo)</h2>
      <Card title="Context" tone="primary">
        <p className="text-slate-700">
          Citizen triggers SOS. iScream records incident, notifies trusted contacts, and surfaces the event in an admin queue.
          This demo uses local storage. MVP will use a backend API and a messaging provider.
        </p>
      </Card>
    </div>
  );
}
