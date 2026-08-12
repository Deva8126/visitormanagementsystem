import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { 
  UserCheck, 
  Search, 
  Clock, 
  ArrowRightLeft, 
  Loader2, 
  AlertCircle,
  LogOut,
  CheckCircle2
} from 'lucide-react';

export default function Exit() {
  const [loading, setLoading] = useState(true);
  const [insideVisitors, setInsideVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [actionLoading, setActionLoading] = useState(null); // stores token of active row checking out
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsideVisitors();
  }, []);

  const fetchInsideVisitors = async () => {
    try {
      setLoading(true);
      const response = await API.get('/visitors/history');
      // Filter only those who are currently 'Inside'
      const inside = (response.data || []).filter(v => v.status === 'Inside');
      // Sort: oldest first (longest time inside)
      inside.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setInsideVisitors(inside);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve inside visitor logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (token, visitorName) => {
    setActionLoading(token);
    setError('');
    setToastMessage('');
    
    try {
      await API.put(`/visitors/exit/${token}`);
      
      // Toast notification
      setToastMessage(`Checked out ${visitorName} successfully.`);
      
      // Update local array
      setInsideVisitors(prev => prev.filter(v => v.token !== token));
      
      // Auto-clear toast after 3 seconds
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || `Failed to checkout visitor ${token}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter local list
  const filtered = insideVisitors.filter(v => {
    const q = searchQuery.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.token.toLowerCase().includes(q) || v.hostName.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-corporate-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-semibold text-sm">Querying checked-in tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-corporate-600" />
          Visitor Exit Terminal
        </h2>
        <p className="text-sm text-slate-500 font-medium">Verify visitor identities and register check-out checkout logs.</p>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Search Bar filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inside visitors by name, token, host..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-250 rounded-lg text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 shadow-sm self-start md:self-auto">
          {insideVisitors.length} Visitors Currently Inside
        </div>
      </div>

      {/* Grid of Inside Visitors Card Panels */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(v => (
            <div key={v.token} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
              {/* Header card with name & token */}
              <div className="p-5 flex gap-4">
                {/* Image */}
                <div className="h-16 w-16 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex-shrink-0 shadow-inner flex items-center justify-center">
                  {v.photoUrl ? (
                    <img src={v.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Photo</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-corporate-700 bg-corporate-50 border border-corporate-100 px-2 py-0.5 rounded">
                      {v.token}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mt-1.5 truncate">{v.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{v.address}</p>
                </div>
              </div>

              {/* Host and check-in details */}
              <div className="px-5 pb-5 space-y-2 text-xs border-b border-slate-100 text-slate-600 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">To Meet (Host)</span>
                  <span className="font-semibold text-slate-800">{v.hostName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Room No</span>
                  <span className="font-semibold text-slate-800">{v.roomNo || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Purpose</span>
                  <span className="font-medium text-slate-500">{v.purpose}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Checked In</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-corporate-500" />
                    {new Date(v.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action checkout button */}
              <div className="p-3 bg-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-500" />
                  Status: Inside
                </span>
                <button
                  onClick={() => handleCheckout(v.token, v.name)}
                  disabled={actionLoading === v.token}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow hover:bg-red-700 hover:shadow-red-800/10 transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading === v.token ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  Mark Exit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-16 text-center border border-slate-200 rounded-2xl shadow-sm">
          <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No visitors inside the building</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
            {searchQuery ? 'Adjust your search query' : 'All checked-in logs have checked-out.'}
          </p>
        </div>
      )}
    </div>
  );
}
