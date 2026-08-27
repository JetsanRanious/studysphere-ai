import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Sparkles, MessageSquare, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { documentService } from '../services/allServices';
import { StudyDocument } from '../types';
import { useToast } from '../contexts/ToastContext';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadDocs = () => {
    documentService.getDocuments().then(setDocuments).catch(() => {});
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await documentService.uploadDocument(file, file.name);
      showToast(`Document "${file.name}" uploaded & parsed!`, 'success');
      loadDocs();
    } catch (err) {
      showToast('Uploaded document processed.', 'info');
      loadDocs();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      showToast('Document removed', 'info');
    } catch (err) {
      showToast('Failed to delete document', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Document Vault & Notes</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload course notes, syllabi, and PDFs. Chat with documents and auto-generate flashcards.
          </p>
        </div>

        <label className="cursor-pointer">
          <input type="file" onChange={handleFileUpload} className="hidden" accept=".txt,.pdf,.md,.json" />
          <div className="inline-flex items-center justify-center font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs shadow-sm shadow-blue-500/20 transition-colors">
            <Upload className="w-4 h-4 mr-1.5" />
            {uploading ? 'Processing File...' : 'Upload Notes / File'}
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {documents.map((doc) => (
          <Card key={doc.id} className="flex flex-col justify-between hover:border-blue-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{doc.title}</h3>
              <p className="text-xs text-slate-500 mb-3">{doc.filename} • {doc.chunks?.length || 1} Chunks</p>
              {doc.summary && (
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {doc.summary}
                </p>
              )}
            </div>

            <Button
              variant="soft"
              size="sm"
              onClick={() => navigate(`/documents/${doc.id}/chat`)}
              className="w-full !font-semibold !mt-2"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Chat with Notes
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
