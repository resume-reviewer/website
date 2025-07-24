// File: /components/jobs/AddJobForm.tsx
'use client';

import { useState, useEffect, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaMagic, FaSpinner, FaArrowLeft, FaArrowRight, FaSave, FaFileAlt, FaPlus, FaUpload, FaLink, FaRobot } from 'react-icons/fa';
import { JobApplication } from '@/lib/types-and-utils'; // Pastikan tipe ini diperbarui

// Tipe untuk dokumen yang akan diunggah dalam flow ini
interface DocumentForUpload {
  id: string; // ID sementara untuk UI
  type: 'resume' | 'cover-letter' | 'diploma' | 'portfolio' | 'references';
  label: string;
  file?: File;
  link?: string;
  status: 'pending' | 'generating' | 'uploading' | 'completed';
}

export default function AddJobForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    job_url: '',
    company_name: '',
    job_title: '',
    location: '',
    application_deadline: '',
    salary: '', // Tambahkan properti salary
    priority: 'medium', // Tambahkan properti priority
    job_description: '',
    notes: ''
  });
  
  const [documents, setDocuments] = useState<DocumentForUpload[]>([
    { id: 'doc1', type: 'resume', label: 'Resume / CV', status: 'pending' },
    { id: 'doc2', type: 'cover-letter', label: 'Cover Letter', status: 'pending' },
    { id: 'doc3', type: 'diploma', label: 'Diploma / Certificate', status: 'pending' },
    { id: 'doc4', type: 'portfolio', label: 'Portfolio', status: 'pending' },
    { id: 'doc5', type: 'references', label: 'References', status: 'pending' }
  ]);
  
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePrioritySelect = (priority: 'high' | 'medium' | 'low') => {
    setFormData(prev => ({ ...prev, priority }));
  };
  
  const handleAutoFill = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!formData.job_url) return;
    const btn = e.currentTarget;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Extracting...';
    btn.classList.add('loading');
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
      btn.innerHTML = '<i class="fas fa-check"></i> Extracted!';
      btn.style.background = '#10b981';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      btn.innerHTML = '<i class="fas fa-magic"></i> Auto Fill';
      btn.style.background = '';
    } finally {
      setIsScraping(false);
      btn.classList.remove('loading');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocuments(docs => docs.map(doc => doc.id === docId ? { ...doc, file, status: 'completed' } : doc));
    }
  };
  
  const triggerFileInput = (docId: string) => {
    document.getElementById(`file-input-${docId}`)?.click();
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
    setIsSubmitting(true);
    setError('');
    try {
      // 1. Create the job to get an ID
      const jobResponse = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!jobResponse.ok) {
        throw new Error('Failed to save job details.');
      }
      const newJob = await jobResponse.json();
      const jobId = newJob.id;

      // 2. Upload documents associated with the new job ID
      for (const doc of documents) {
        if (doc.file) {
          const docFormData = new FormData();
          docFormData.append('file', doc.file);
          docFormData.append('documentType', doc.type);
          docFormData.append('job_id', jobId); // Mengaitkan dokumen dengan pekerjaan

          await fetch('/api/documents', {
            method: 'POST',
            body: docFormData,
          });
          // Error handling per file bisa ditambahkan di sini
        }
      }
      
      setCurrentStep(4); // Pindah ke layar sukses
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateSummary = () => {
    if (currentStep !== 3) return;
    document.getElementById('summaryCompany')!.textContent = formData.company_name || '-';
    document.getElementById('summaryPosition')!.textContent = formData.job_title || '-';
    document.getElementById('summaryLocation')!.textContent = formData.location || '-';
    document.getElementById('summaryPriority')!.textContent = formData.priority || 'Medium';
  };

  useEffect(() => {
    if (currentStep === 3) updateSummary();
  }, [currentStep, formData]);


  // Fungsi untuk mereset form jika pengguna ingin menambah pekerjaan lain
  const addAnother = () => {
      // Reset state ke nilai awal
      setCurrentStep(1);
      setFormData({
          job_url: '', company_name: '', job_title: '', location: '',
          application_deadline: '', salary: '', priority: 'medium',
          job_description: '', notes: ''
      });
      setDocuments([
          { id: 'doc1', type: 'resume', label: 'Resume / CV', status: 'pending' },
          { id: 'doc2', type: 'cover-letter', label: 'Cover Letter', status: 'pending' },
          { id: 'doc3', type: 'diploma', label: 'Diploma / Certificate', status: 'pending' },
          { id: 'doc4', type: 'portfolio', label: 'Portfolio', status: 'pending' },
          { id: 'doc5', type: 'references', label: 'References', status: 'pending' }
      ]);
      setError('');
      setIsScraping(false);
      setIsSubmitting(false);
  };


  return (
    <div className="form-container max-w-3xl mx-auto">
      <div className="progress-steps">
        <div className="progress-line" style={{ width: `${Math.min(100, ((currentStep - 1) / 2) * 100)}%` }}></div>
        {['Job Details', 'Documents', 'Review'].map((label, index) => {
          const step = index + 1;
          return (
            <div key={step} className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > step ? <FaCheck /> : step}</div>
              <div className="step-label">{label}</div>
            </div>
          );
        })}
      </div>
      
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Step 1: Job Details */}
        <div className={`form-section ${currentStep === 1 ? 'active' : ''}`}>
          <h2 className="section-title">Job Information</h2>
          <p className="section-subtitle">Start by pasting the job link for auto-fill, or fill manually.</p>
          
          <div className="url-input-container relative mb-8">
            <input type="url" name="job_url" value={formData.job_url} onChange={handleInputChange} className="url-input w-full" placeholder="Paste job URL (LinkedIn, Indeed, etc.)" />
            <button type="button" className="auto-fill-btn" onClick={handleAutoFill} disabled={isScraping}>
              <FaMagic className="mr-2" /> Auto Fill
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group"><label className="form-label">Company Name <span className="required">*</span></label><input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="form-input" required /></div>
            <div className="form-group"><label className="form-label">Job Title <span className="required">*</span></label><input type="text" name="job_title" value={formData.job_title} onChange={handleInputChange} className="form-input" required /></div>
          </div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Location</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} className="form-input" /></div>
            <div className="form-group"><label className="form-label">Application Deadline</label><input type="date" name="application_deadline" value={formData.application_deadline} onChange={handleInputChange} className="form-input" /></div>
          </div>
          <div className="form-grid single"><div className="form-group"><label className="form-label">Salary Range</label><input type="text" name="salary" value={formData.salary} onChange={handleInputChange} className="form-input" placeholder="e.g., Rp 15.000.000 - 20.000.000" /></div></div>
          
          <div className="form-group"><label className="form-label">Priority Level</label>
            <div className="priority-selection flex gap-4 mb-8">
              <div className={`priority-option priority-high flex-1 ${formData.priority === 'high' ? 'selected' : ''}`} onClick={() => handlePrioritySelect('high')}><div className="priority-icon">🔥</div><div className="priority-label">High Priority</div></div>
              <div className={`priority-option priority-medium flex-1 ${formData.priority === 'medium' ? 'selected' : ''}`} onClick={() => handlePrioritySelect('medium')}><div className="priority-icon">⚡</div><div className="priority-label">Medium Priority</div></div>
              <div className={`priority-option priority-low flex-1 ${formData.priority === 'low' ? 'selected' : ''}`} onClick={() => handlePrioritySelect('low')}><div className="priority-icon">🟢</div><div className="priority-label">Low Priority</div></div>
            </div>
          </div>
          
          <div className="form-grid single"><div className="form-group"><label className="form-label">Job Description Highlights</label><textarea name="job_description" value={formData.job_description} onChange={handleInputChange} className="form-textarea" placeholder="Key requirements..."></textarea></div></div>
        </div>

        {/* Step 2: Documents */}
        <div className={`form-section ${currentStep === 2 ? 'active' : ''}`}>
          <h2 className="section-title">Required Documents</h2>
          <p className="section-subtitle">Select and upload the documents needed for this application.</p>
          <div className="document-checklist">
            <div className="checklist-title"><FaFileAlt /> Document Checklist</div>
            {documents.map(doc => (
              <div key={doc.id} className="document-item">
                <div className={`checkbox ${doc.status === 'completed' ? 'checked' : ''}`}></div>
                <div className="document-label">{doc.label} {doc.type === 'resume' && <span className="required">*</span>}</div>
                <input type="file" id={`file-input-${doc.id}`} className="hidden" onChange={(e) => handleFileChange(e, doc.id)} />
                {doc.type === 'cover-letter' ? (
                  <button type="button" className="upload-btn ml-auto"><FaMagic className="mr-1" /> Generate with AI</button>
                ) : doc.type === 'portfolio' ? (
                  <button type="button" className="upload-btn ml-auto"><FaLink className="mr-1" /> Add Link</button>
                ) : (
                  <button type="button" className="upload-btn ml-auto" onClick={() => triggerFileInput(doc.id)}>
                    {doc.file ? <><FaCheck className="mr-1"/> {doc.file.name}</> : <><FaUpload className="mr-1"/> Upload</>}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="form-grid single"><div className="form-group"><label className="form-label">Notes & HR Contact</label><textarea name="notes" value={formData.notes} onChange={handleInputChange} className="form-textarea" placeholder="Add notes about the recruiter..."></textarea></div></div>
        </div>
        
        {/* Step 3: Review */}
        <div className={`form-section ${currentStep === 3 ? 'active' : ''}`}>
            <h2 className="section-title">Review & AI Actions</h2>
            <p className="section-subtitle">Confirm your job details and see available AI tools.</p>
            <div className="ai-actions-preview mb-8">
                <div className="ai-preview-title"><FaRobot /> AI Tools Available</div>
                <div className="ai-actions-grid"><div className="ai-action"><div className="ai-action-icon">🎯</div><div className="ai-action-label">Resume Match Review</div></div><div className="ai-action"><div className="ai-action-icon">✍️</div><div className="ai-action-label">Cover Letter Generator</div></div><div className="ai-action"><div className="ai-action-icon">💡</div><div className="ai-action-label">Job Insights</div></div></div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold mb-4 text-gray-800">Job Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><div className="text-sm text-gray-500">COMPANY</div><div id="summaryCompany" className="font-semibold">-</div></div>
                    <div><div className="text-sm text-gray-500">POSITION</div><div id="summaryPosition" className="font-semibold">-</div></div>
                    <div><div className="text-sm text-gray-500">LOCATION</div><div id="summaryLocation" className="font-semibold">-</div></div>
                    <div><div className="text-sm text-gray-500">PRIORITY</div><div id="summaryPriority" className="font-semibold capitalize">{formData.priority}</div></div>
                </div>
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
        
        {/* Step 4: Success */}
        <div className={`form-section ${currentStep === 4 ? 'active' : ''}`}>
            <div className="success-animation">
                <div className="success-icon"><FaCheck /></div>
                <h2 className="success-title">Job Added Successfully!</h2>
                <p className="success-message">Your job and documents have been added to the tracker.</p>
                <div className="flex gap-4 justify-center mt-8">
                    <button type="button" className="nav-btn btn-secondary" onClick={addAnother}><FaPlus /> Add Another Job</button>
                    <button type="button" className="nav-btn btn-success" onClick={() => router.push('/dashboard')}>View in Tracker</button>
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