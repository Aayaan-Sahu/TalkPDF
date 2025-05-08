import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ProductPage: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPdfFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!pdfFile) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('files', pdfFile);
    try {
      const res = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload PDF');
      setUploading(false);
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 px-0">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-8 py-6 border-b bg-white/80 backdrop-blur z-10 animate-fade-in-down duration-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-primary">TalkPDF</span>
        </div>
        <div>
          <button
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold shadow rounded-xl px-6 py-2 transition-all duration-200 border border-gray-200"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center animate-fade-in-up">
          <h1 className="text-3xl font-bold mb-4">Upload a PDF to Start Chatting</h1>
          <p className="mb-6 text-lg text-center text-gray-500">Drag & drop your PDF file here, or click to select one. After uploading, you'll be able to chat with your document!</p>
          <div
            {...getRootProps()}
            className={`w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer mb-6 ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            {pdfFile ? (
              <span className="text-lg font-medium text-primary">{pdfFile.name}</span>
            ) : isDragActive ? (
              <span className="text-gray-400">Drop the PDF here...</span>
            ) : (
              <span className="text-gray-400">Drag & drop a PDF here, or click to select</span>
            )}
          </div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <button
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-lg shadow hover:bg-gray-700 transition disabled:opacity-50"
            onClick={handleUpload}
            disabled={!pdfFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload & Start Chatting'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage; 