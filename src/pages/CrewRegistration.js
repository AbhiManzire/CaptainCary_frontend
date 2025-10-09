import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, FileText, User, Mail, Phone, MapPin, Calendar, Ship, FileCheck, ArrowLeft, Home, UserCheck } from 'lucide-react';
import { api } from '../utils/api';
import NotificationService from '../services/notificationService';

const RANKS = [
  'Master / Captain', 'Chief Officer', '2nd Officer', '3rd Officer',
  'Chief Engineer', '2nd Engineer', 'ETO', 'AB (Able Seaman)',
  'OS (Ordinary Seaman)', 'Bosun', 'Motorman', 'Oiler',
  'Cook / Chief Cook', 'Messman', 'Deck Cadet', 'Engine Cadet',
  'Welder / Fitter', 'Rigger', 'Crane Operator', 'HLO / HDA',
  'Marine Electrician', 'Safety Officer', 'Yacht Skipper / Delivery Crew',
  'Project Engineer', 'Marine Surveyor', 'Others'
];

const VESSEL_TYPES = [
  'Tanker', 'AHTS', 'Yacht', 'Barge', 'Container', 'Bulk Carrier', 'Offshore', 'Other'
];

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
  'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad',
  'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland',
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
  'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone',
  'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
  'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];


const REQUIRED_DOCUMENTS = ['cv', 'passport', 'cdc', 'stcw', 'coc', 'seamanBook', 'visa'];
const OPTIONAL_DOCUMENTS = ['photo'];

const CrewRegistration = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles, fieldName) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  }, []);

  // Create individual dropzones for each field
  const cvDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'cv'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const passportDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'passport'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const cdcDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'cdc'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const stcwDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'stcw'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const cocDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'coc'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const seamanBookDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'seamanBook'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const visaDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'visa'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const photoDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'photo'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const renderDropzone = (dropzone, fieldName, required = false) => {
    const { getRootProps, getInputProps, isDragActive } = dropzone;
    
    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : uploadedFiles[fieldName]
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        {uploadedFiles[fieldName] ? (
          <div className="text-green-600">
            <FileCheck className="mx-auto h-6 w-6 mb-1" />
            <p className="text-sm font-medium">{uploadedFiles[fieldName].name}</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">
              {isDragActive ? 'Drop file here' : 'Click or drag file here'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, JPG, PNG up to 10MB {required && '*'}
            </p>
          </div>
        )}
      </div>
    );
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      console.log('Form data:', data);
      console.log('Uploaded files:', uploadedFiles);
      console.log('Uploaded files keys:', Object.keys(uploadedFiles));
      console.log('Uploaded files values:', Object.values(uploadedFiles));

      // Check required documents
      const missingDocs = REQUIRED_DOCUMENTS.filter(doc => !uploadedFiles[doc]);
      if (missingDocs.length > 0) {
        const docNames = missingDocs.map(doc => {
          switch(doc) {
            case 'cv': return 'CV';
            case 'passport': return 'Passport';
            case 'cdc': return 'CDC';
            case 'stcw': return 'STCW Certificates';
            case 'coc': return 'COC';
            case 'seamanBook': return 'Seaman Book';
            case 'visa': return 'Visa';
            default: return doc;
          }
        });
        toast.error(`Please upload required documents: ${docNames.join(', ')}`);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      // Add files
      Object.keys(uploadedFiles).forEach(fieldName => {
        if (uploadedFiles[fieldName]) {
          formData.append(fieldName, uploadedFiles[fieldName]);
        }
      });

      console.log('Sending FormData with fields:', Array.from(formData.keys()));
      
      // Debug: Check what files are being sent
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`File ${key}:`, value.name, value.size, value.type);
        } else {
          console.log(`Field ${key}:`, value);
        }
      }

      const response = await api.post('/crew/register', formData);

      // Send notifications
      try {
        await NotificationService.notifyCrewConfirmation(data);
        await NotificationService.notifyNewCrewSubmission(data);
      } catch (notificationError) {
        console.error('Notification failed:', notificationError);
        // Don't fail the registration if notifications fail
      }

      // Auto reminders are now created on the backend

      toast.success('Registration successful! We will review your application soon.');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      // Show detailed error message
      if (error.response?.data?.errors) {
        console.log('Detailed validation errors:', error.response.data.errors);
        const errorMessages = error.response.data.errors.map(err => `${err.path}: ${err.msg}`).join(', ');
        toast.error(`Validation failed: ${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Beautiful Header */}
      <header className="bg-white shadow-lg border-b-2 border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="font-medium">Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center">
                <img 
                  src="/logo-main1.png" 
                  alt="CFM Logo" 
                  className="h-12 w-auto"
                />
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
                <Home className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <Link to="/client/login" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
                <UserCheck className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Client Login</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Scrollbar */}
      <div className="max-h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-primary-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-3">Crew Registration</h1>
                <p className="text-primary-100 text-lg">Join our maritime crew database and start your journey</p>
                <div className="mt-4 flex justify-center">
                  {/* <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
                    <span className="text-sm font-medium">Step 1 of 1 - Complete Registration</span>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register('fullName', { required: 'Full name is required' })}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="input-field"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone number is required' })}
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rank / Position *
                  </label>
                  <select
                    {...register('rank', { required: 'Rank is required' })}
                    className="input-field"
                  >
                    <option value="">Select your rank</option>
                    {RANKS.map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                  {errors.rank && (
                    <p className="text-red-500 text-sm mt-1">{errors.rank.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality *
                  </label>
                  <select
                    {...register('nationality', { required: 'Nationality is required' })}
                    className="input-field"
                  >
                    <option value="">Select your nationality</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.nationality && (
                    <p className="text-red-500 text-sm mt-1">{errors.nationality.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Location *
                  </label>
                  <input
                    type="text"
                    {...register('currentLocation', { required: 'Current location is required' })}
                    className="input-field"
                    placeholder="Enter your current location"
                  />
                  {errors.currentLocation && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentLocation.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    {...register('dateOfBirth', { required: 'Date of birth is required' })}
                    className="input-field"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Date *
                  </label>
                  <input
                    type="date"
                    {...register('availabilityDate', { required: 'Availability date is required' })}
                    className="input-field"
                  />
                  {errors.availabilityDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.availabilityDate.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Professional Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Ship className="h-5 w-5 mr-2" />
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sea Time Summary / Joining Availability
                  </label>
                  <textarea
                    {...register('seaTimeSummary')}
                    rows={4}
                    className="input-field"
                    placeholder="Describe your sea time experience and total years of experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Vessel Type
                  </label>
                  <select
                    {...register('preferredVesselType')}
                    className="input-field"
                  >
                    <option value="">Select vessel type</option>
                    {VESSEL_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    {...register('additionalNotes')}
                    rows={3}
                    className="input-field"
                    placeholder="Any additional information you'd like to share"
                  />
                </div>
              </div>
            </section>

            {/* Document Upload */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Document Upload
              </h2>
              
              <div className="space-y-6">
                {/* Required Documents */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Required Documents *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CV (PDF) *
                      </label>
                      {renderDropzone(cvDropzone, 'cv', true)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passport *
                      </label>
                      {renderDropzone(passportDropzone, 'passport', true)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CDC *
                      </label>
                      {renderDropzone(cdcDropzone, 'cdc', true)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        STCW Certificates *
                      </label>
                      {renderDropzone(stcwDropzone, 'stcw', true)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        COC *
                      </label>
                      {renderDropzone(cocDropzone, 'coc', true)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seaman Book / Discharge Book *
                      </label>
                      {renderDropzone(seamanBookDropzone, 'seamanBook', true)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visa *
                      </label>
                      {renderDropzone(visaDropzone, 'visa', true)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photo (Passport Size)
                      </label>
                      {renderDropzone(photoDropzone, 'photo', false)}
                    </div>
                  </div>
                </div>

                {/* Optional Documents */}
                
              </div>
            </section>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #1e40af);
        }
      `}</style>
    </div>
  );
};

export default CrewRegistration;
