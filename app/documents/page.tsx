// File: /app/documents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FaRocket, FaThLarge, FaPlusCircle, FaFolder, FaBrain, FaFilePdf, FaFileUpload, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';

interface UserDocument {
  id: string;
  file_name: string;
  document_type: string;
  created_at: string;
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'resume'); // Default ke 'resume' untuk saat ini

    try {
      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='flex'>
      <div className="sidebar">
        <div className="sidebar-header"><div className="logo"><FaRocket /> CareerPilot</div></div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="nav-item"><FaThLarge /> Job Tracker</Link>
          <Link href="/jobs/add" className="nav-item"><FaPlusCircle /> Add Job</Link>
          <Link href="/documents" className="nav-item active"><FaFolder /> Documents</Link>
          <Link href="/interview" className="nav-item"><FaBrain /> AI Tools</Link>
        </nav>
        <div className="user-profile">
            <div className="user-avatar">{session?.user?.email?.charAt(0).toUpperCase() || 'U'}</div>
            <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{session?.user?.email}</div>
                <button onClick={() => signOut()} style={{fontSize: '0.8rem', color: '#667eea', background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>Logout</button>
            </div>
        </div>
      </div>

      <main className="main-content">
        <div className="header">
          <div className="header-left">
            <h1 className="header-title">Document Library</h1>
            <p className="header-subtitle">Manage your resumes, cover letters, and other files</p>
          </div>
          <div className="header-actions">
            <label className="add-job-btn cursor-pointer">
              {isUploading ? <><FaSpinner className="animate-spin" /> Uploading...</> : <><FaFileUpload /> Upload Document</>}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept=".pdf,.doc,.docx" />
            </label>
          </div>
        </div>

        <div className="p-8">
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            <div className="bg-white rounded-lg shadow p-6">
                {isLoading ? <p className="text-center p-8">Loading documents...</p> : (
                    <ul className="divide-y divide-gray-200">
                        {documents.length > 0 ? documents.map(doc => (
                            <li key={doc.id} className="py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <FaFilePdf className="text-3xl text-red-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{doc.file_name}</p>
                                        <p className="text-sm text-gray-500">
                                            Type: <span className="font-medium capitalize">{doc.document_type.replace('_', ' ')}</span> | Uploaded: {format(new Date(doc.created_at), 'dd MMM yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        )) : <p className="text-center text-gray-500 py-8">No documents uploaded. Click "Upload Document" to get started.</p>}
                    </ul>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}