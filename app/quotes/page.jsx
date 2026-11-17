'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAuthToken } from '@/utils/SessionHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selected, setSelected] = useState(null);

  const token = getAuthToken();

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (status) params.set('status', status);

      const res = await fetch(`${API_URL}/quotes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed');
      setQuotes(json.data);
      setPagination(json.pagination);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, token]);

  useEffect(() => { load(1); }, [load]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      toast.success('Status updated');
      load(pagination.page);
    } catch (e) { toast.error(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this quote?')) return;
    try {
      const res = await fetch(`${API_URL}/quotes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      toast.success('Deleted');
      load(pagination.page);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Quote Requests</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search number / name / email / route…"
          className="border rounded px-3 py-2 flex-1"
        />
        <select value={status} onChange={e => setStatus(e.target.value)}
                className="border rounded px-3 py-2">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="quoted">Quoted</option>
          <option value="converted">Converted</option>
          <option value="closed">Closed</option>
        </select>
        <button onClick={() => load(1)} className="bg-slate-800 text-white px-4 rounded">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Quote #</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Name / Company</th>
              <th className="p-3 text-left">Email / Phone</th>
              <th className="p-3 text-left">Route</th>
              <th className="p-3 text-left">Freight</th>
              <th className="p-3 text-left">Weight</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} className="p-6 text-center text-slate-500">Loading…</td></tr>
            )}
            {!loading && quotes.length === 0 && (
              <tr><td colSpan={9} className="p-6 text-center text-slate-500">No quotes yet.</td></tr>
            )}
            {!loading && quotes.map(q => (
              <tr key={q._id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-mono text-xs">{q.quoteNumber}</td>
                <td className="p-3">{new Date(q.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  <div>{q.name}</div>
                  {q.company && <div className="text-xs text-slate-500">{q.company}</div>}
                </td>
                <td className="p-3">
                  <div>{q.email}</div>
                  <div className="text-xs text-slate-500">{q.phone}</div>
                </td>
                <td className="p-3">{q.origin} → {q.destination}</td>
                <td className="p-3">{q.freightType}</td>
                <td className="p-3">{q.weight}</td>
                <td className="p-3">
                  <select value={q.status} onChange={e => updateStatus(q._id, e.target.value)}
                          className="border rounded px-2 py-1 text-xs">
                    <option value="new">new</option>
                    <option value="reviewed">reviewed</option>
                    <option value="quoted">quoted</option>
                    <option value="converted">converted</option>
                    <option value="closed">closed</option>
                  </select>
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => setSelected(q)}
                          className="text-blue-600 hover:underline text-xs">View</button>
                  <button onClick={() => remove(q._id)}
                          className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button key={i} onClick={() => load(i + 1)}
              className={`px-3 py-1 rounded border ${pagination.page === i + 1 ? 'bg-slate-800 text-white' : ''}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
             onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-3">Quote {selected.quoteNumber}</h2>
            <dl className="text-sm space-y-1">
              <Row k="Name"          v={selected.name} />
              <Row k="Company"       v={selected.company || '—'} />
              <Row k="Email"         v={selected.email} />
              <Row k="Phone"         v={selected.phone} />
              <Row k="Address"       v={selected.address} />
              <Row k="Origin"        v={selected.origin} />
              <Row k="Destination"   v={selected.destination} />
              <Row k="Freight Type"  v={selected.freightType} />
              <Row k="Weight"        v={selected.weight} />
              <Row k="Instructions"  v={selected.instructions || '—'} />
              <Row k="Status"        v={selected.status} />
              <Row k="Submitted"     v={new Date(selected.createdAt).toLocaleString()} />
              
            </dl>
            <button onClick={() => setSelected(null)}
                    className="mt-4 bg-slate-800 text-white px-4 py-2 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3 border-b py-1">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}