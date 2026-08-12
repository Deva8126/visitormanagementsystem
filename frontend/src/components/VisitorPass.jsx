import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ShieldCheck } from 'lucide-react';
import cgstLogo from '../assets/CGST LOGO.png';
import emblem from '../assets/emblem.png';

const PassCard = ({ visitor, qrPayload }) => {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Bar */}
      <div
        className="bg-[#0B4C8C] text-white text-[10px] font-extrabold uppercase py-2 flex items-center justify-center select-none text-center tracking-widest px-1.5 border-b border-slate-200"
      >
        CGST BHAWAN GHAZIABAD • SECURITY DIVISION
      </div>
      {/* Main Pass Body */}
      <div className="flex-1 p-5 flex flex-col justify-between relative bg-white overflow-hidden">
        {/* Background Watermark (Centered Security Pattern) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-40">
          <img
            src={cgstLogo}
            alt="Watermark Pattern"
            className="w-72 h-72 object-contain select-none pointer-events-none"
          />
          <span className="text-xl font-black tracking-widest text-[#0B4C8C] mt-2 select-none pointer-events-none uppercase">
            CGST BHAWAN GHAZIABAD
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-blue-900 pb-2 mb-2.5 relative z-10">
          {/* Left Logo */}
          <img src={cgstLogo} alt="CGST Logo" className="h-14 w-14 object-contain flex-shrink-0" />

          {/* Center Text */}
          <div className="text-center flex-1 px-2">
            <h4 className="font-serif font-black text-lg tracking-widest text-blue-900 uppercase leading-none">
              सी.जी.एस.टी. भवन गाजियाबाद / CGST BHAWAN GHAZIABAD
            </h4>
            <p className="text-[11px] font-bold text-blue-800 border-t border-blue-200 mt-2.5 pt-2.5 leading-none uppercase tracking-wider">
              आगंतुक विवरण / Visitor Details
            </p>
          </div>

          {/* Right Logo */}
          <img src={emblem} alt="India Emblem Logo" className="h-14 w-14 object-contain flex-shrink-0" />
        </div>

        {/* Pass Content split layout */}
        <div className="flex-1 grid grid-cols-12 gap-5 mt-2 relative z-10 items-stretch overflow-hidden">
          {/* Left Column: Info Grid & Return Note */}
          <div className="col-span-8 flex flex-col justify-between border border-slate-200 p-3.5 rounded-xl bg-white/70 backdrop-blur-[0.5px]">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11.5px] leading-tight text-slate-800">
              <div>
                <span className="font-bold text-slate-500">पंजीकरण संख्या / Reg No :</span>
                <span className="font-extrabold text-[#0B4C8C] ml-1">{visitor.token}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">पंजीकरण तिथि / Reg Date :</span>
                <span className="font-semibold text-slate-800 ml-1">
                  {new Date(visitor.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-500">समय / Meeting Time :</span>
                <span className="font-semibold text-slate-800 ml-1">
                  {new Date(visitor.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-500">प्रिंट तिथि / Printed On :</span>
                <span className="font-semibold text-slate-800 ml-1">
                  {new Date(visitor.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <div className="col-span-2 border-t border-slate-100 pt-1 mt-0.5">
                <span className="font-bold text-slate-500">नाम / Name :</span>
                <span className="font-extrabold text-slate-900 ml-1 uppercase text-[12px]">{visitor.name}</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold text-slate-500">पता / Address :</span>
                <span className="font-medium text-slate-800 ml-1">{visitor.address}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">मोबाइल / Mobile No :</span>
                <span className="font-semibold text-slate-800 ml-1">{visitor.mobile}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">पहचान विवरण / ID Details :</span>
                <span className="font-semibold text-slate-800 ml-1">{visitor.idType}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">पहचान संख्या / ID No :</span>
                <span className="font-semibold text-slate-800 ml-1">{visitor.idNumber}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">वैध तिथि / Valid Date :</span>
                <span className="font-bold text-emerald-700 ml-1">
                  {new Date(visitor.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-1 mt-0.5">
                <span className="font-bold text-slate-500">मिलने को / To Meet :</span>
                <span className="font-extrabold text-slate-900 ml-1 uppercase">{visitor.hostName}</span>
              </div>
              <div className="border-t border-slate-100 pt-1 mt-0.5">
                <span className="font-bold text-slate-500">कमरा संख्या / Room No :</span>
                <span className="font-extrabold text-[#0B4C8C] ml-1">{visitor.roomNo || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold text-slate-500">उद्देश्य / Purpose :</span>
                <span className="font-medium text-slate-800 ml-1">{visitor.purpose}</span>
              </div>
              <div className="col-span-2 border-t border-slate-100 pt-1 mt-0.5">
                <span className="font-bold text-slate-500">स्वागत अधिकारी / Reception Officer :</span>
                <span className="font-extrabold text-slate-900 ml-1 uppercase">
                  {visitor.registeredBy || (typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('cgst_user') || '{}').name : '') || 'Front Desk Receptionist'}
                </span>
              </div>
            </div>

            {/* Return Pass Note */}
            <div className="border-t border-slate-100 pt-2 text-center mt-2.5">
              <p className="text-[8px] text-slate-400 font-bold leading-normal">
                (कार्यालय से बाहर जाते समय मुलाकात अपना पास स्वागत अधिकारी को लौटाएं) /<br />
                (The visitor should return the pass to the Reception Officer while exiting)
              </p>
            </div>
          </div>

          {/* Right Column: Photograph, QR Code, Signature Area */}
          <div className="col-span-4 flex flex-col justify-between items-center border border-slate-200 p-3.5 rounded-xl bg-white/70 backdrop-blur-[0.5px]">
            {/* Visitor Photograph (Top) */}
            <div className="flex flex-col items-center">
              <div className="w-[28mm] h-[34mm] border border-slate-300 bg-slate-50 rounded overflow-hidden shadow-sm flex items-center justify-center">
                {visitor.photoUrl ? (
                  <img
                    src={visitor.photoUrl}
                    alt="Visitor"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/100x120?text=Photo';
                    }}
                  />
                ) : (
                  <span className="text-[8px] text-slate-400 font-bold">NO IMG</span>
                )}
              </div>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 leading-none">
                Visitor Photo / आगंतुक फोटो
              </span>
            </div>

            {/* QR Scanner (Middle) */}
            <div className="flex flex-col items-center my-3">
              <div className="p-1 border border-slate-200 rounded bg-white shadow-sm flex items-center justify-center">
                <QRCodeSVG value={qrPayload} size={64} level="M" />
              </div>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 leading-none">
                Scan Entry / प्रवेश स्कैन
              </span>
            </div>

            {/* Reception Officer Signature (Bottom) */}
            <div className="w-full text-center border-t border-dashed border-slate-300 pt-2 flex flex-col items-center justify-end flex-1 min-h-[50px]">
              <div className="h-6"></div> {/* Blank spacer for physical signature */}
              <p className="text-[9px] font-extrabold text-slate-800 uppercase tracking-widest leading-none">
                Reception Officer Signature
              </p>
              <p className="text-[7.5px] text-slate-400 font-semibold mt-1 leading-none uppercase">
                CGST Bhawan Ghaziabad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="bg-[#0B4C8C] text-white text-[10px] font-extrabold uppercase py-2 flex items-center justify-center select-none text-center tracking-widest px-1.5 border-t border-slate-200"
      >
        सी.जी.एस.टी. भवन गाजियाबाद • Visitor Pass
      </div>
    </div>
  );
};

export default function VisitorPass({ visitor, onPrintComplete, title = "Pass Generated Successfully" }) {
  if (!visitor) return null;

  // Format QR code content exactly as requested
  const qrPayload = JSON.stringify({
    token: visitor.token,
    visitor: visitor.name,
    host: visitor.hostName,
    time: visitor.timestamp ? visitor.timestamp.substring(0, 16) : ''
  });

  const handlePrint = () => {
    window.print();
    if (onPrintComplete) {
      onPrintComplete();
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-md max-w-4xl mx-auto w-full">
      <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-1.5">
        <ShieldCheck className="h-4.5 w-4.5 text-corporate-600" />
        {title}
      </h3>

      {/* Responsive layout-bounded scaling wrapper to prevent clipping of headers/footers */}
      <div className="w-full flex items-center justify-center mb-6">
        <div className="relative overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-md w-[302px] h-[213px] sm:w-[516px] sm:h-[364px] md:w-[635px] md:h-[448px] lg:w-[794px] lg:h-[560px]">
          <div 
            className="absolute top-0 left-0 origin-top-left transform scale-[0.38] sm:scale-[0.65] md:scale-[0.8] lg:scale-[1]"
            style={{ width: '794px', height: '560px' }}
          >
            <PassCard visitor={visitor} qrPayload={qrPayload} />
          </div>
        </div>
      </div>

      {/* Actual Hidden Target Element for physical printing (Matches index.css selector) */}
      <div id="printable-pass" className="hidden">
        <PassCard visitor={visitor} qrPayload={qrPayload} />
      </div>

      {/* User Actions */}
      <button
        onClick={handlePrint}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#0B4C8C] text-white rounded-xl font-bold text-sm shadow hover:bg-blue-900 transition cursor-pointer"
      >
        <Printer className="h-5 w-5" />
        Print Visitor Pass
      </button>
    </div>
  );
}
