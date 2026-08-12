import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { exportToCSV, exportToExcel } from '../utils/export';
import { 
  History as HistoryIcon,
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  Download,
  Eye, 
  X,
  Loader2,
  AlertCircle,
  Printer,
  ArrowLeft,
  FileText
} from 'lucide-react';
import VisitorPass from '../components/VisitorPass';

export default function History() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [error, setError] = useState('');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [hostFilter, setHostFilter] = useState('');

  // Modal Image Preview
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterData();
  }, [search, dateFilter, hostFilter, visitors]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await API.get('/visitors/history');
      // Sort: recent check-ins first
      const sorted = (response.data || []).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setVisitors(sorted);
      setFilteredVisitors(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch visitor records. Is the database connected?');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...visitors];

    // 1. Search Query (Token or Name)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        v => v.name.toLowerCase().includes(q) || v.token.toLowerCase().includes(q)
      );
    }

    // 2. Date Filter
    if (dateFilter) {
      result = result.filter(v => v.timestamp && v.timestamp.startsWith(dateFilter));
    }

    // 3. Host Filter
    if (hostFilter.trim()) {
      const h = hostFilter.toLowerCase();
      result = result.filter(v => v.hostName.toLowerCase().includes(h));
    }

    setFilteredVisitors(result);
  };

  const handleExportCSV = () => {
    const fields = {
      timestamp: 'Timestamp',
      token: 'Token No',
      name: 'Visitor Name',
      address: 'Address / Org',
      mobile: 'Mobile Number',
      purpose: 'Purpose of Visit',
      hostName: 'Host Name (To Meet)',
      roomNo: 'Room No',
      idType: 'ID Type',
      idNumber: 'ID Number',
      photoUrl: 'Photo URL',
      status: 'Status',
      exitTime: 'Exit Time',
      documentUrl: 'Document URL'
    };
    exportToCSV(filteredVisitors, fields, `CGST_Export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExcel = () => {
    const fields = {
      timestamp: 'Timestamp',
      token: 'Token No',
      name: 'Visitor Name',
      address: 'Address / Org',
      mobile: 'Mobile Number',
      purpose: 'Purpose of Visit',
      hostName: 'Host Name (To Meet)',
      roomNo: 'Room No',
      idType: 'ID Type',
      idNumber: 'ID Number',
      photoUrl: 'Photo URL',
      status: 'Status',
      exitTime: 'Exit Time',
      documentUrl: 'Document URL'
    };
    exportToExcel(filteredVisitors, fields, `CGST_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-corporate-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-semibold text-sm">Loading historical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <HistoryIcon className="h-6 w-6 text-corporate-600" />
              Visitor History Logs
            </h2>
            <p className="text-sm text-slate-500 font-medium">Verify historical records, search logs, and run reports.</p>
          </div>
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={!filteredVisitors.length}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!filteredVisitors.length}
            className="flex items-center gap-2 px-4 py-2 bg-corporate-600 text-white rounded-xl text-xs font-bold hover:bg-corporate-700 transition shadow-md shadow-corporate-900/10 disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Filter panel bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Search Visitor / Token
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. T1001 or John Doe"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-250 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Filter by Date
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Calendar className="h-4 w-4" />
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-250 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition"
            />
          </div>
        </div>

        {/* Host Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Filter by Host Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <User className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={hostFilter}
              onChange={(e) => setHostFilter(e.target.value)}
              placeholder="e.g. Dr. Jatin"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-250 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Grid Log List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-6">Photo</th>
                <th className="py-3.5 px-4">Token</th>
                <th className="py-3.5 px-4">Visitor Name</th>
                <th className="py-3.5 px-4">Host Name</th>
                <th className="py-3.5 px-4">Room No</th>
                <th className="py-3.5 px-4">Purpose</th>
                <th className="py-3.5 px-4">Check-In Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6">Exit Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((v) => (
                  <tr key={v.token} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-6">
                      <div 
                        className="relative group h-9 w-9 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition"
                        onClick={() => setActivePhoto(v.photoUrl)}
                      >
                        {v.photoUrl ? (
                          <img src={v.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] font-bold text-slate-450">N/A</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-corporate-700">{v.token}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-800 flex items-center gap-2">
                          {v.name}
                          {v.documentUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhoto(v.documentUrl);
                              }}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-650 hover:bg-corporate-50 hover:text-corporate-700 border border-slate-200 hover:border-corporate-200 rounded text-[10px] font-bold transition cursor-pointer"
                              title="Click to view verification document"
                            >
                              <FileText className="h-3 w-3" />
                              Doc
                            </button>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">{v.address} • {v.mobile}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-850">{v.hostName}</td>
                    <td className="py-3 px-4 text-xs font-bold text-[#0B4C8C]">{v.roomNo || '—'}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-500">{v.purpose}</td>
                    <td className="py-3 px-4 text-xs">
                      {new Date(v.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        v.status === 'Inside' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-650 border-slate-200'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-xs text-slate-500">
                      {v.exitTime 
                        ? new Date(v.exitTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                        : '—'
                      }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400 font-medium">
                    No visitor records found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table footer row counts */}
        <div className="bg-slate-55 flex justify-between items-center py-3 px-6 border-t border-slate-100 text-xs font-bold text-slate-500">
          <span>Showing {filteredVisitors.length} of {visitors.length} entries</span>
        </div>
      </div>

      {/* Full Photo Modal Overlay */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative max-w-sm w-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xl p-4">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900 text-white p-1.5 rounded-full transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-[4/5] bg-slate-100 rounded-xl overflow-hidden mt-6 shadow-inner">
              <img src={activePhoto} alt="Visitor Photo" className="w-full h-full object-cover" />
            </div>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4">
              {activePhoto.includes('_doc') ? 'Verification Document' : 'Authorized Gate Capture'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
