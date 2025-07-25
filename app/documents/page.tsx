'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { FaFilePdf, FaDownload, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';
import { UserDocument } from '@/lib/types-and-utils';
import { supabase } from '@/lib/supabase';

const DocumentDownloader = ({ doc }: { doc: UserDocument }) => {
  const handleDownload = async () => {
    const { data } = supabase.storage.from('userdocuments').getPublicUrl(doc.file_path);
    if (!data || !data.publicUrl) {
      alert("Could not get download link. Please try again.");
      return;
    }
    window.open(data.publicUrl, '_blank');
  };

  return (
    <button onClick={handleDownload} className="text-gray-500 hover:text-indigo-600 transition-colors" title="Download">
      <FaDownload />
    </button>
  );
};


const DocumentItem = ({ doc }: { doc: UserDocument }) => (
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
    <DocumentDownloader doc={doc} />
  </li>
);


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className='flex'>
      <Sidebar />
      <main className="main-content">
        <div className="header">
          <h1 className="header-title">Document Library</h1>
          <p className="header-subtitle">Manage all your uploaded documents here.</p>
        </div>

        <div className="p-8">
          {isLoading && <div className="flex justify-center items-center p-8"><FaSpinner className="animate-spin text-2xl text-indigo-500" /></div>}
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
          
          {!isLoading && !error && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {documents.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {documents.map(doc => <DocumentItem key={doc.id} doc={doc} />)}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-8">No documents found. Upload one to get started.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}