import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { 
  Settings as SettingsIcon,
  ShieldCheck, 
  HelpCircle, 
  Globe, 
  Database,
  Cloud,
  FileCheck,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettingsStatus();
  }, []);

  const fetchSettingsStatus = async () => {
    try {
      setLoading(true);
      const response = await API.get('/settings/status');
      setStatus(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not read backend connection logs. Ensure authorization token is active.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-corporate-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-semibold text-sm">Validating configuration channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-corporate-600" />
          Settings & Cloud Integration
        </h2>
        <p className="text-sm text-slate-500 font-medium">Verify credentials, review logs storage endpoints, and access setup guides.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Integration Status Grid */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Google Cloud Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Cloud className="h-5 w-5 text-corporate-600" />
              Google Cloud API Integration
            </h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-sm font-semibold text-slate-700">Database Driver Status</span>
              {status.googleIntegration.enabled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-sm">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Google Cloud Mode Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 border border-slate-250 rounded-full text-xs font-bold">
                  <XCircle className="h-3.5 w-3.5" />
                  Google Integration Disabled
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Auth Client Link</span>
                <span className="font-bold text-slate-700">{status.googleIntegration.serviceAccount}</span>
              </div>
              <div className="flex flex-col py-2 border-b border-slate-100 gap-1.5">
                <span className="text-slate-400">Target Google Sheet ID</span>
                <span className="font-mono text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 truncate select-all">
                  {status.googleIntegration.sheetId}
                </span>
              </div>
              <div className="flex flex-col py-2 gap-1.5">
                <span className="text-slate-400">Target Drive Photo Folder ID</span>
                <span className="font-mono text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 truncate select-all">
                  {status.googleIntegration.folderId}
                </span>
              </div>
            </div>
          </div>

          {/* Local Storage Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Database className="h-5 w-5 text-corporate-600" />
              Local Storage (Auto-Fallback)
            </h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-sm font-semibold text-slate-700">Fallback Driver Status</span>
              {status.localFallback.active ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-250 rounded-full text-xs font-bold shadow-sm">
                  <CheckCircle className="h-3.5 w-3.5 animate-pulse" />
                  Local JSON Mode Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 border border-slate-200 rounded-full text-xs font-bold">
                  Standby / Inactive
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Local Database File (`db.json`)</span>
                <span className="font-bold text-slate-700">{status.localFallback.databaseFileExists ? 'Initialized' : 'Not Found'}</span>
              </div>
              <div className="flex flex-col py-2 border-b border-slate-100 gap-1.5">
                <span className="text-slate-400">Uploads Path</span>
                <span className="text-slate-500 font-mono bg-slate-50 p-1.5 rounded border border-slate-200 truncate">
                  backend/data/uploads/
                </span>
              </div>
              <div className="flex flex-col py-2 gap-1.5">
                <span className="text-slate-400">Local JSON DB Path</span>
                <span className="text-slate-500 font-mono bg-slate-50 p-1.5 rounded border border-slate-200 truncate">
                  backend/data/db.json
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Integration Instructions Panel */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="h-5 w-5 text-corporate-600" />
          Google Cloud Setup Guide
        </h3>
        
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          If you want to store check-in lists inside Google Sheets and visitor photos inside Google Drive, follow these configuration instructions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-600">
          <div className="p-4 bg-slate-50 border border-slate-250 rounded-xl space-y-2">
            <span className="font-bold text-corporate-800 text-sm">Step 1: Setup GCP Console</span>
            <p className="font-medium text-slate-500">
              Create a project on the Google Cloud Console. Enable the **Google Sheets API** and **Google Drive API**. Generate a **Service Account** credential key in JSON format.
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-250 rounded-xl space-y-2">
            <span className="font-bold text-corporate-800 text-sm">Step 2: Share Spreadsheets/Folders</span>
            <p className="font-medium text-slate-500">
              Create a spreadsheet and a Drive folder. Share BOTH of them with the Service Account email address, granting them **Editor** permissions.
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-250 rounded-xl space-y-2">
            <span className="font-bold text-corporate-800 text-sm">Step 3: Update Environments</span>
            <p className="font-medium text-slate-500">
              Open the backend `.env` configuration file. Enter the sheet ID, folder ID, service account email, and service account private key. Restart the backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
