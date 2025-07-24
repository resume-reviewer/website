// File: /components/jobs/AddJobForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCheck, FaMagic, FaSpinner, FaArrowLeft, FaArrowRight, FaSave, FaFileAlt, FaPlus, FaThLarge } from 'react-icons/fa';

interface UserDocument {
  id: string;
  file_name: string;
}

export default function AddJobForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    job_url: '',
    company_name: '',
    job_title: '',
    location: '',
    application_deadline: '',
    job_description: '',
    notes: '',
    selected_resume_id: '',
  });
  
  const [availableResumes, setAvailableResumes] = useState<UserDocument[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentStep === 2) {
      const fetchResumes = async () => {
        setIsLoadingResumes(true);
        try {
          const res = await fetch('/api/documents');
          if (!res.ok) throw new Error('Failed to fetch resumes');
          const allDocs = await res.json();
          const resumes = allDocs.filter((doc: any) => doc.document_type === 'resume');
          setAvailableResumes(resumes);
          if (resumes.length > 0 && !formData.selected_resume_id) {
            setFormData(prev => ({ ...prev, selected_resume_id: resumes[0].id }));
          }
        } catch (err) {
          console.error("Could not fetch resumes:", err);
        } finally {
          setIsLoadingResumes(false);
        }
      };
      fetchResumes();
    }
  }, [currentStep, formData.selected_resume_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAutoFill = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!formData.job_url) return;
    setIsScraping(true);
    setError('');
    try {
      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.job_url }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch job data.');
      }
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        job_title: data.jobTitle || prev.job_title,
        company_name: data.companyName || prev.company_name,
        location: data.location || prev.location,
        job_description: data.jobDescription || prev.job_description,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsScraping(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.company_name || !formData.job_title)) {
      alert('Please fill in Company Name and Job Title.');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);
  
  const handleSubmit = async () => {
    if (!formData.selected_resume_id) {
        alert('A Resume/CV is required. Please select one.');
        return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const { selected_resume_id, ...jobData } = formData;
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save job.');
      }
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="progress-steps">
        <div className="progress-line" style={{ width: `${Math.min(100, ((currentStep - 1) / 2) * 100)}%` }}></div>
        {[1, 2, 3].map(step => (
          <div key={step} className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
            <div className="step-circle">{currentStep > step ? <FaCheck /> : step}</div>
            <div className="step-label">{['Job Details', 'Documents', 'Review'][step - 1]}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Step 1: Job Details */}
        <div className={`form-section ${currentStep === 1 ? 'active' : ''}`}>
            <h2 className="section-title">Job Information</h2>
            <p className="section-subtitle">Start by pasting the job link for auto-fill, or fill manually.</p>
            
            <label className="form-label">
                Paste job URL (LinkedIn, Indeed, etc.)
                <button 
                  className="ml-2 text-sm text-indigo-600 font-semibold flex items-center gap-1"
                  onClick={handleAutoFill}
                  disabled={isScraping}
                >
                  {isScraping ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                  {isScraping ? 'Auto Filling...' : 'Auto Fill'}
                </button>
            </label>
            <div className="form-group mb-6">
                <input type="url" name="job_url" value={formData.job_url} onChange={handleInputChange} className="form-input" placeholder="https://..." />
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Company Name <span className="required">*</span></label>
                    <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Job Title <span className="required">*</span></label>
                    <input type="text" name="job_title" value={formData.job_title} onChange={handleInputChange} className="form-input" required />
                </div>
            </div>
            {/* Tambahkan field lain dari desain jika diperlukan */}
        </div>

        {/* Step 2: Documents */}
        <div className={`form-section ${currentStep === 2 ? 'active' : ''}`}>
          <h2 className="section-title">Required Documents</h2>
          <p className="section-subtitle">A Resume/CV is required for each application.</p>
          <div className="document-checklist">
            <div className="checklist-title"><FaFileAlt /> Document Checklist</div>
            {isLoadingResumes ? <p>Loading resumes...</p> : (
              <div className="document-item">
                <div className="checkbox checked"></div>
                <div className="document-label">Resume / CV <span className="required">*</span></div>
                {availableResumes.length > 0 ? (
                  <select name="selected_resume_id" value={formData.selected_resume_id} onChange={handleInputChange} className="form-select ml-auto">
                    {availableResumes.map(resume => <option key={resume.id} value={resume.id}>{resume.file_name}</option>)}
                  </select>
                ) : (
                  <Link href="/documents" className='upload-btn'>
                    <FaPlus /> Upload Resume
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Step 3: Review */}
        <div className={`form-section ${currentStep === 3 ? 'active' : ''}`}>
          <h2 className="section-title">Review & Save</h2>
          <p className="section-subtitle">Confirm your job details before saving.</p>
          <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
            <div><strong className='text-gray-500'>Company:</strong> <span className='font-semibold'>{formData.company_name}</span></div>
            <div><strong className='text-gray-500'>Position:</strong> <span className='font-semibold'>{formData.job_title}</span></div>
            <div><strong className='text-gray-500'>Resume:</strong> <span className='font-semibold'>{availableResumes.find(r => r.id === formData.selected_resume_id)?.file_name || 'Not selected'}</span></div>
          </div>
        </div>
        
        {/* Step 4: Success */}
        <div className={`form-section ${currentStep === 4 ? 'active' : ''}`}>
            <div className="success-animation">
                <div className="success-icon"><FaCheck /></div>
                <h2 className="success-title">Job Added Successfully!</h2>
                <p className="success-message">This job is now available on your tracker board.</p>
                <div className="flex gap-4 justify-center mt-8">
                    <button type="button" className="nav-btn btn-primary" onClick={() => router.push('/dashboard')}><FaThLarge /> View in Tracker</button>
                </div>
            </div>
        </div>
      </form>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="form-navigation">
          <button type="button" className="nav-btn btn-secondary" onClick={prevStep} style={{ visibility: currentStep > 1 ? 'visible' : 'hidden' }}>
            <FaArrowLeft /> Previous
          </button>
          {currentStep < 3 && <button type="button" className="nav-btn btn-primary" onClick={nextStep}>Next <FaArrowRight /></button>}
          {currentStep === 3 && <button type="button" className="nav-btn btn-success" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Job</button>}
        </div>
      )}
    </div>
  );
}