// File: /app/documents/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { FaFilePdf, FaFolderOpen, FaDownload, FaTrash, FaSpinner, FaBuilding } from 'react-icons/fa';
import { format } from 'date-fns';
import { JobApplication, UserDocument } from '@/lib/types-and-utils';
import { supabase } from '@/lib/supabase'; // Impor Supabase client

interface JobWithDocuments extends JobApplication {
  documents: UserDocument[];
}

// Komponen Aksi Dokumen
const DocumentActions = ({ doc, onDelete }: { doc: UserDocument, onDelete: (docId: string) => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async () => {
    const { data } = supabase.storage.from('userdocuments').getPublicUrl(doc.file_path);
    if (!data || !data.publicUrl) {
      alert("Could not get download link. Please try again.");
      return;
    }
    const link = document.createElement('a');
    link.href = data.publicUrl;
    link.target = '_blank'; // Buka di tab baru atau unduh langsung
    link.download = doc.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${doc.file_name}"? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete document.");
      }
      onDelete(doc.id); // Panggil callback untuk update UI
    } catch (error) {
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button onClick={handleDownload} className="text-gray-500 hover:text-indigo-600 transition-colors" title="Download">
        <FaDownload />
      </button>
      <button onClick={handleDelete} disabled={isDeleting} className="text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50" title="Delete">
        {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
      </button>
    </div>
  );
};


// Komponen Item Dokumen
const DocumentItem = ({ doc, onDelete }: { doc: UserDocument, onDelete: (docId: string) => void }) => (
  <li className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-md transition-colors">
    <div className="flex items-center gap-4">
      <FaFilePdf className="text-2xl text-red-500" />
      <div>
        <p className="font-semibold text-gray-800">{doc.file_name}</p>
        <p className="text-xs text-gray-500">
          Uploaded: {format(new Date(doc.created_at), 'dd MMM yyyy')}
        </p>
      </div>
    </div>
    <DocumentActions doc={doc} onDelete={onDelete} />
  </li>
);


export default function DocumentsPage() {
  const [jobsWithDocs, setJobsWithDocs] = useState<JobWithDocuments[]>([]);
  const [unassociatedDocs, setUnassociatedDocs] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/jobs-with-documents');
      if (!res.ok) throw new Error('Failed to fetch data');
      const { jobsWithDocuments, unassociatedDocuments } = await res.json();
      setJobsWithDocs(jobsWithDocuments);
      setUnassociatedDocs(unassociatedDocuments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteDocument = (deletedDocId: string) => {
    // Hapus dari daftar dokumen yang tidak terikat
    setUnassociatedDocs(prev => prev.filter(doc => doc.id !== deletedDocId));
    // Hapus dari daftar dokumen di dalam setiap pekerjaan
    setJobsWithDocs(prevJobs =>
      prevJobs.map(job => ({
        ...job,
        documents: job.documents.filter(doc => doc.id !== deletedDocId),
      }))
    );
  };

  return (
    <div className='flex'>
      <Sidebar />
      <main className="main-content">
        <div className="header">
          <h1 className="header-title">Document Library</h1>
          <p className="header-subtitle">Your documents, organized by job application.</p>
        </div>

        <div className="p-8 space-y-8">
          {isLoading && <p className="text-center">Loading documents...</p>}
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
          
          {!isLoading && !error && (
            <>
              {jobsWithDocs.map(job => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl text-gray-600">
                          {job.company_name?.charAt(0) || <FaBuilding />}
                      </div>
                      <div>
                          <h2 className="text-xl font-bold text-gray-800">{job.job_title}</h2>
                          <p className="text-md text-gray-600">{job.company_name}</p>
                      </div>
                  </div>
                  {job.documents.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {job.documents.map(doc => <DocumentItem key={doc.id} doc={doc} onDelete={handleDeleteDocument} />)}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500 py-4 border-t">No documents attached to this job.</p>
                  )}
                </div>
              ))}

              {unassociatedDocs.length > 0 && (
                 <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
                   <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                     <FaFolderOpen /> General Documents
                   </h2>
                   <ul className="divide-y divide-gray-200">
                      {unassociatedDocs.map(doc => <DocumentItem key={doc.id} doc={doc} onDelete={handleDeleteDocument} />)}
                   </ul>
                 </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}