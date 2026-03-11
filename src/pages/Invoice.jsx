import Card from '../components/Card.jsx';

export default function Invoice() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Invoice</h2>
      <Card title="Placeholder" tone="green">
        <p className="text-slate-700">We can plug real invoice generation here later.</p>
      </Card>
    </div>
  );
}
