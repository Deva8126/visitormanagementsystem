import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import WebcamCapture from '../components/WebcamCapture';
import VisitorPass from '../components/VisitorPass';
import {
  UserPlus,
  User,
  MapPin,
  Phone,
  HelpCircle,
  Users2,
  CreditCard,
  Hash,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Upload,
  Camera,
  FileText,
  Trash2
} from 'lucide-react';

import { PURPOSE_DATA } from '../utils/purposeData';
import { getRoomNumber } from '../utils/roomMapping';

const ID_TYPE_OPTIONS = [
  'Aadhaar Card',
  'Government ID',
  'Employee ID',
  'Driving License',
  'Passport',
  'Voter ID Card',
  'Other'
];

export default function EntryForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mobile: '',
    purpose: '',
    purposeType: '',
    purposeCategory: '',
    purposeSubcategory: '',
    customPurpose: '',
    roomNo: '',
    hostName: '',
    idType: '',
    idNumber: ''
  });
  const [photo, setPhoto] = useState(null);
  const [document, setDocument] = useState(null);
  const [isDocCameraOpen, setIsDocCameraOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredVisitor, setRegisteredVisitor] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'purposeType') {
      setFormData(prev => ({
        ...prev,
        purposeType: value,
        purposeCategory: '',
        purposeSubcategory: '',
        customPurpose: '',
        purpose: '',
        roomNo: ''
      }));
      setErrors(prev => ({
        ...prev,
        purposeType: '',
        purposeCategory: '',
        purposeSubcategory: '',
        customPurpose: '',
        roomNo: ''
      }));
    } else if (name === 'purposeCategory') {
      setFormData(prev => ({
        ...prev,
        purposeCategory: value,
        purposeSubcategory: '',
        customPurpose: '',
        purpose: '',
        roomNo: ''
      }));
      setErrors(prev => ({
        ...prev,
        purposeCategory: '',
        purposeSubcategory: '',
        customPurpose: '',
        roomNo: ''
      }));
    } else if (name === 'purposeSubcategory') {
      const autoRoom = value === 'Other' ? '' : getRoomNumber(formData.purposeType, formData.purposeCategory, value);
      setFormData(prev => ({
        ...prev,
        purposeSubcategory: value,
        customPurpose: '',
        purpose: value === 'Other' ? '' : `${prev.purposeType} - ${prev.purposeCategory} - ${value}`,
        roomNo: autoRoom
      }));
      setErrors(prev => ({
        ...prev,
        purposeSubcategory: '',
        customPurpose: '',
        roomNo: ''
      }));
    } else if (name === 'customPurpose') {
      setFormData(prev => ({
        ...prev,
        customPurpose: value,
        purpose: `${prev.purposeType} - ${prev.purposeCategory} - Other (${value})`
      }));
      setErrors(prev => ({
        ...prev,
        customPurpose: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Visitor Name is required';
    if (!formData.address.trim()) newErrors.address = 'Organization/Address is required';

    const mobileRegex = /^[0-9+\s]{10,15}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Enter a valid mobile (10 to 15 digits)';
    }

    if (!formData.purposeType) newErrors.purposeType = 'Select purpose type';
    if (!formData.purposeCategory) newErrors.purposeCategory = 'Select category';
    if (!formData.purposeSubcategory) newErrors.purposeSubcategory = 'Select subcategory';
    if (formData.purposeSubcategory === 'Other' && !formData.customPurpose.trim()) {
      newErrors.customPurpose = 'Enter custom purpose of visit';
    }

    if (formData.purposeType === 'Officers / Official Visitors' && !formData.roomNo.trim()) {
      newErrors.roomNo = 'Room Number is required for official visits';
    }

    if (!formData.hostName.trim()) newErrors.hostName = 'Host Name (Person to meet) is required';
    if (!formData.idType) newErrors.idType = 'Select Identification Type';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID Number is required';

    if (!photo) {
      newErrors.photo = 'Webcam snapshot capture is mandatory';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const finalPurpose = formData.purposeSubcategory === 'Other'
        ? `${formData.purposeType} - ${formData.purposeCategory} - Other (${formData.customPurpose.trim()})`
        : `${formData.purposeType} - ${formData.purposeCategory} - ${formData.purposeSubcategory}`;

      const payload = {
        ...formData,
        purpose: finalPurpose,
        photo,
        document
      };

      const response = await API.post('/visitors/register', payload);
      setRegisteredVisitor(response.data);
      setSuccess(true);
      setErrors({});
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        // Validation errors list from Express-Validator
        const backendErrors = {};
        err.response.data.errors.forEach(e => {
          backendErrors[e.path] = e.msg;
        });
        setErrors(backendErrors);
      } else {
        setServerError(err.response?.data?.error || 'Failed to submit visitor check-in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, document: 'Please select an image file.' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocument(reader.result);
        setErrors(prev => ({ ...prev, document: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      mobile: '',
      purpose: '',
      purposeType: '',
      purposeCategory: '',
      purposeSubcategory: '',
      customPurpose: '',
      roomNo: '',
      hostName: '',
      idType: '',
      idNumber: ''
    });
    setPhoto(null);
    setDocument(null);
    setRegisteredVisitor(null);
    setSuccess(false);
    setServerError('');
    setErrors({});
  };

  if (success && registeredVisitor) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-2xl text-center shadow-sm">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-emerald-900">Check-In Successful!</h2>
          <p className="text-sm text-emerald-700 mt-1">
            Visitor <span className="font-bold">{registeredVisitor.name}</span> has been logged under token <span className="font-bold">{registeredVisitor.token}</span>.
          </p>
        </div>

        {/* Printable Pass Widget Card */}
        <VisitorPass visitor={registeredVisitor} onPrintComplete={() => { }} />

        <div className="text-center">
          <button
            onClick={resetForm}
            className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 shadow transition cursor-pointer"
          >
            Register Next Visitor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-slate-800 transition cursor-pointer"
          title="Go Back"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-corporate-600" />
            Visitor Check-In Registration
          </h2>
          <p className="text-sm text-slate-500 font-medium">Record visitor identification logs and issue physical entry passes.</p>
        </div>
      </div>

      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="font-semibold">{serverError}</span>
        </div>
      )}

      {/* Main layout splitting Details vs Webcam Capture */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
            Visitor Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Visitor Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Visitor Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${errors.name ? 'border-red-500' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs font-semibold mt-1">{errors.name}</p>}
            </div>

            {/* Address / Org */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Organization / Full Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. Google DeepMind Inc. / London"
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${errors.address ? 'border-red-500' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.address && <p className="text-red-500 text-xs font-semibold mt-1">{errors.address}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 9876543210"
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${errors.mobile ? 'border-red-500' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-xs font-semibold mt-1">{errors.mobile}</p>}
            </div>

            {/* Dropdown 1: Purpose Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Purpose Type
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <HelpCircle className="h-4 w-4" />
                </span>
                <select
                  name="purposeType"
                  value={formData.purposeType}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${errors.purposeType ? 'border-red-500' : 'border-slate-200'
                    }`}
                >
                  <option value="">-- Choose Type --</option>
                  <option value="Officers / Official Visitors">OFFICIERS /OFFICIAL VISITORS</option>
                  <option value="Other Than Official">OTHER THAN OFFICIAL/OFFICER VISITORS</option>
                </select>
              </div>
              {errors.purposeType && <p className="text-red-500 text-xs font-semibold mt-1">{errors.purposeType}</p>}
            </div>

            {/* Dropdown 2: Category */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <HelpCircle className="h-4 w-4" />
                </span>
                <select
                  name="purposeCategory"
                  value={formData.purposeCategory}
                  onChange={handleInputChange}
                  disabled={!formData.purposeType}
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${errors.purposeCategory ? 'border-red-500' : 'border-slate-200'
                    } ${!formData.purposeType ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="">-- Choose Category --</option>
                  {formData.purposeType &&
                    Object.keys(PURPOSE_DATA[formData.purposeType]).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
              {errors.purposeCategory && <p className="text-red-500 text-xs font-semibold mt-1">{errors.purposeCategory}</p>}
            </div>

            {/* Dropdown 3: Subcategory */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Subcategory / Officer / Section
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <HelpCircle className="h-4 w-4" />
                </span>
                <select
                  name="purposeSubcategory"
                  value={formData.purposeSubcategory}
                  onChange={handleInputChange}
                  disabled={!formData.purposeCategory}
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${errors.purposeSubcategory ? 'border-red-500' : 'border-slate-200'
                    } ${!formData.purposeCategory ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="">-- Choose Subcategory --</option>
                  {formData.purposeCategory &&
                    PURPOSE_DATA[formData.purposeType][formData.purposeCategory].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
              </div>
              {errors.purposeSubcategory && <p className="text-red-500 text-xs font-semibold mt-1">{errors.purposeSubcategory}</p>}
            </div>

            {/* Room No. */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Room No.
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Hash className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="roomNo"
                  value={formData.roomNo}
                  onChange={handleInputChange}
                  readOnly={formData.purposeSubcategory !== 'Other'}
                  placeholder={formData.purposeSubcategory === 'Other' ? "Enter room number..." : "Auto-populated"}
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${
                    errors.roomNo ? 'border-red-500' : 'border-slate-200'
                  } ${
                    formData.purposeSubcategory !== 'Other' ? 'bg-slate-100 opacity-80 cursor-not-allowed' : 'bg-slate-50'
                  }`}
                />
              </div>
              {errors.roomNo && <p className="text-red-500 text-xs font-semibold mt-1">{errors.roomNo}</p>}
            </div>

            {/* Custom Purpose input (dynamic) */}
            {formData.purposeSubcategory === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Custom Purpose Details
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <HelpCircle className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    name="customPurpose"
                    value={formData.customPurpose}
                    onChange={handleInputChange}
                    placeholder="Describe specific purpose..."
                    className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${errors.customPurpose ? 'border-red-500' : 'border-slate-200'
                      }`}
                  />
                </div>
                {errors.customPurpose && <p className="text-red-500 text-xs font-semibold mt-1">{errors.customPurpose}</p>}
              </div>
            )}

            {/* Host Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Host Name (To Meet)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Users2 className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleInputChange}
                  placeholder="e.g. Dr. Jatin"
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${errors.hostName ? 'border-red-500' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.hostName && <p className="text-red-500 text-xs font-semibold mt-1">{errors.hostName}</p>}
            </div>

            {/* ID Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                ID Document Type
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <CreditCard className="h-4 w-4" />
                </span>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${errors.idType ? 'border-red-500' : 'border-slate-200'
                    }`}
                >
                  <option value="">-- Choose ID Type --</option>
                  {ID_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              {errors.idType && <p className="text-red-500 text-xs font-semibold mt-1">{errors.idType}</p>}
            </div>

            {/* ID Number */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                ID Document Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Hash className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 1234-5678-9012"
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-corporate-500 transition ${errors.idNumber ? 'border-red-500' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.idNumber && <p className="text-red-500 text-xs font-semibold mt-1">{errors.idNumber}</p>}
            </div>

            {/* Upload Document Field */}
            <div className="md:col-span-2 border-t border-slate-100 pt-5 mt-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Upload Document / Verification
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />

              {!document ? (
                <div className="flex flex-col sm:flex-row gap-4 p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl items-center justify-center text-center">
                  <div className="flex flex-col items-center gap-1 sm:mr-4">
                    <FileText className="h-8 w-8 text-slate-450" />
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Internal Storage Only</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-450 rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Select Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDocCameraOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Capture Camera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-250 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-20 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shadow-sm flex-shrink-0">
                      <img src={document} alt="Document Preview" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Verification Document Loaded</h4>
                      <p className="text-[10px] font-semibold text-emerald-705">Ready for secure database upload</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDocument(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white text-red-650 hover:bg-red-50 hover:text-red-750 border border-red-250 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              )}
              {errors.document && <p className="text-red-500 text-xs font-semibold mt-1">{errors.document}</p>}
            </div>

          </div>
        </div>

        {/* Right Column: Webcam Capture */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 self-start">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
            Visitor Photo Capture
          </h3>

          <WebcamCapture onCapture={(photoData) => setPhoto(photoData)} initialPhoto={photo} />
          {errors.photo && (
            <p className="text-red-500 text-xs font-semibold text-center mt-2">{errors.photo}</p>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-corporate-600 text-white rounded-xl font-bold text-sm shadow hover:bg-corporate-700 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Pass & Uploading...
                </>
              ) : (
                'Check-In & Generate Pass'
              )}
            </button>
          </div>
        </div>

      </form>

      {/* Camera Document Capture Modal Overlay */}
      {isDocCameraOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Capture ID Verification Document</h3>
              <button
                type="button"
                onClick={() => setIsDocCameraOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <WebcamCapture
              onCapture={(docPhoto) => {
                if (docPhoto) {
                  setDocument(docPhoto);
                  setIsDocCameraOpen(false);
                }
              }}
              initialPhoto={null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
