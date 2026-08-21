import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, CreditCard, Camera, CheckSquare, 
  Upload, X, ShieldAlert, CheckCircle, 
  ArrowRight, ArrowLeft 
} from 'lucide-react';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import { Card } from '@components/ui/Card';

const isAtLeast18 = (val) => {
  const dob = new Date(val);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
};

const isFutureDate = (val) => {
  const exp = new Date(val);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return exp > today;
};

const wizardSchema = z.object({
  full_legal_name: z
    .string()
    .min(2, 'Full legal name must be at least 2 characters')
    .max(200)
    .trim(),
  date_of_birth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
    .refine(isAtLeast18, 'You must be at least 18 years old to verify'),
  id_type: z.enum(['passport', 'drivers_license', 'state_id'], {
    errorMap: () => ({
      message: 'ID type must be: passport, drivers_license, or state_id',
    }),
  }),
  document_expiration_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
    .refine(isFutureDate, 'Document has already expired'),
});

const steps = [
  { id: 1, label: 'Personal Information', icon: User },
  { id: 2, label: 'Government ID', icon: CreditCard },
  { id: 3, label: 'Liveness Selfie', icon: Camera },
  { id: 4, label: 'Review & Submit', icon: CheckSquare },
];

export default function VerificationWizard({ onSubmit, isSubmitting }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState({ id_front: null, id_back: null, selfie: null });
  const [fileErrors, setFileErrors] = useState({});
  const [certify, setCertify] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      full_legal_name: '',
      date_of_birth: '',
      id_type: 'drivers_license',
      document_expiration_date: '',
    },
    mode: 'onTouched',
  });

  const nextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger();
      if (!isValid) return;
    }
    if (currentStep === 2) {
      const idType = getValues('id_type');
      if (!files.id_front) {
        setFileErrors((prev) => ({ ...prev, id_front: 'Front side of ID is required' }));
        return;
      }
      if (idType !== 'passport' && !files.id_back) {
        setFileErrors((prev) => ({ ...prev, id_back: 'Back side of ID is required for this document type' }));
        return;
      }
    }
    if (currentStep === 3) {
      if (!files.selfie) {
        setFileErrors((prev) => ({ ...prev, selfie: 'Selfie upload is required' }));
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFileDrop = (acceptedFiles, fieldName) => {
    setFileErrors((prev) => ({ ...prev, [fieldName]: null }));
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFileErrors((prev) => ({ ...prev, [fieldName]: 'File exceeds maximum 10MB limit' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFiles((prev) => ({
        ...prev,
        [fieldName]: {
          file,
          previewUrl: URL.createObjectURL(file),
          base64: reader.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (fieldName) => {
    if (files[fieldName]?.previewUrl) {
      URL.revokeObjectURL(files[fieldName].previewUrl);
    }
    setFiles((prev) => ({ ...prev, [fieldName]: null }));
  };

  const onFinalSubmit = () => {
    if (!certify) return;
    const values = getValues();
    
    const formData = new FormData();
    formData.append('full_legal_name', values.full_legal_name);
    formData.append('date_of_birth', values.date_of_birth);
    formData.append('id_type', values.id_type);
    formData.append('document_expiration_date', values.document_expiration_date);
    
    if (files.id_front) {
      formData.append('id_front', files.id_front.file);
    }
    if (files.id_back) {
      formData.append('id_back', files.id_back.file);
    }
    if (files.selfie) {
      formData.append('selfie', files.selfie.file);
    }

    onSubmit(formData);
  };

  const idTypeOptions = [
    { value: 'drivers_license', label: "Driver's License" },
    { value: 'passport', label: 'Passport (No back-side upload needed)' },
    { value: 'state_id', label: 'State-issued Identity Card' },
  ];

  return (
    <div className="space-y-6">
      {/* Stepper indicator */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white font-bold'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                      : 'border text-theme-muted'
                  }`}
                  style={{
                    backgroundColor: !isActive && !isCompleted ? 'var(--color-bg-secondary)' : undefined,
                    borderColor: !isActive && !isCompleted ? 'var(--color-border)' : undefined,
                  }}
                >
                  {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                </div>
                <span
                  className={`hidden sm:inline text-xs ${
                    isActive ? 'font-bold text-brand-400' : 'text-theme-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className="hidden sm:block h-[2px] w-full mx-2"
                  style={{ backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-border)' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Views */}
      <div className="min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && (
              <div className="space-y-4 max-w-xl mx-auto">
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Step 1: Enter Personal Details</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Provide your exact legal name and details matching your government photo ID.
                </p>
                <div className="space-y-4 pt-2">
                  <Controller
                    name="full_legal_name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Full Legal Name"
                        placeholder="e.g. Johnathan Quincy Doe"
                        error={errors.full_legal_name?.message}
                      />
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Controller
                      name="date_of_birth"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          label="Date of Birth"
                          error={errors.date_of_birth?.message}
                        />
                      )}
                    />
                    <Controller
                      name="id_type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="ID Document Type"
                          options={idTypeOptions}
                          error={errors.id_type?.message}
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name="document_expiration_date"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        label="ID Expiration Date"
                        error={errors.document_expiration_date?.message}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 max-w-xl mx-auto">
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Step 2: Upload Identity Document</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Upload clear photo(s) of your valid government ID.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <UploadBox
                    label="Front Side of ID Document"
                    previewUrl={files.id_front?.previewUrl}
                    onDrop={(files) => handleFileDrop(files, 'id_front')}
                    onClear={() => removeFile('id_front')}
                    error={fileErrors.id_front}
                  />

                  {getValues('id_type') !== 'passport' && (
                    <UploadBox
                      label="Back Side of ID Document"
                      previewUrl={files.id_back?.previewUrl}
                      onDrop={(files) => handleFileDrop(files, 'id_back')}
                      onClear={() => removeFile('id_back')}
                      error={fileErrors.id_back}
                    />
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 max-w-xl mx-auto">
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Step 3: Live Selfie Photo</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Take or upload a clear, front-facing selfie photo in good lighting.
                  </p>
                </div>

                <UploadBox
                  label="Selfie Photo"
                  previewUrl={files.selfie?.previewUrl}
                  onDrop={(files) => handleFileDrop(files, 'selfie')}
                  onClear={() => removeFile('selfie')}
                  error={fileErrors.selfie}
                  isSelfie
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 max-w-xl mx-auto">
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Step 4: Review & Submit</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Verify your details before submitting for moderation.
                  </p>
                </div>

                <div className="space-y-4 border rounded-2xl p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                  <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <p className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Legal Name</p>
                      <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{getValues('full_legal_name')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Date of Birth</p>
                      <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{getValues('date_of_birth')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>ID Type</p>
                      <p className="font-semibold capitalize" style={{ color: 'var(--color-text-primary)' }}>
                        {getValues('id_type')?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Expiration Date</p>
                      <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{getValues('document_expiration_date')}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Document Thumbnails</p>
                    <div className="grid grid-cols-3 gap-2">
                      {files.id_front && (
                        <div className="relative rounded-xl overflow-hidden aspect-video border" style={{ borderColor: 'var(--color-border)' }}>
                          <img src={files.id_front.previewUrl} className="h-full w-full object-cover" alt="ID Front" />
                        </div>
                      )}
                      {files.id_back && (
                        <div className="relative rounded-xl overflow-hidden aspect-video border" style={{ borderColor: 'var(--color-border)' }}>
                          <img src={files.id_back.previewUrl} className="h-full w-full object-cover" alt="ID Back" />
                        </div>
                      )}
                      {files.selfie && (
                        <div className="relative rounded-xl overflow-hidden aspect-square border" style={{ borderColor: 'var(--color-border)' }}>
                          <img src={files.selfie.previewUrl} className="h-full w-full object-cover" alt="Selfie" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <input
                    type="checkbox"
                    id="certify"
                    checked={certify}
                    onChange={(e) => setCertify(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border text-brand-500 focus:ring-brand-500 cursor-pointer"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                  <label htmlFor="certify" className="text-xs leading-relaxed cursor-pointer select-none" style={{ color: 'var(--color-text-secondary)' }}>
                    I certify that all uploaded identity documents are valid, unaltered, and belong to me.
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
        {currentStep > 1 ? (
          <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={prevStep} disabled={isSubmitting}>
            Back
          </Button>
        ) : (
          <div />
        )}

        {currentStep < steps.length ? (
          <Button rightIcon={<ArrowRight size={16} />} onClick={nextStep}>
            Continue
          </Button>
        ) : (
          <Button
            onClick={onFinalSubmit}
            disabled={!certify || isSubmitting}
            isLoading={isSubmitting}
            loadingText="Submitting..."
            leftIcon={<CheckCircle size={16} />}
          >
            Submit Request
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper Dropzone Component
function UploadBox({ label, previewUrl, onDrop, onClear, error, isSelfie = false }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
  });

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border aspect-video w-full flex items-center justify-center group" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <img src={previewUrl} className={`h-full w-full ${isSelfie ? 'object-contain' : 'object-cover'}`} alt="Upload Preview" />
          <button
            onClick={onClear}
            className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition-colors text-white"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="flex flex-col items-center justify-center aspect-video w-full border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all hover:border-[var(--color-brand)]"
          style={{ 
            backgroundColor: isDragActive ? 'rgba(91,110,245,0.05)' : 'var(--color-bg-secondary)',
            borderColor: isDragActive ? 'var(--color-brand)' : 'var(--color-border)'
          }}
        >
          <input {...getInputProps()} />
          <Upload size={28} className="mb-2" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Drag & drop or <span style={{ color: 'var(--color-brand)' }}>choose file</span>
          </p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>JPEG, PNG, WEBP up to 10MB</p>
        </div>
      )}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><ShieldAlert size={14} />{error}</p>}
    </div>
  );
}
