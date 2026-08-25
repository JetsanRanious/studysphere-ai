import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, UploadCloud, Trash2, Bot, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { documentService } from '../services/allServices';
import { StudyDocument } from '../types';
import { useToast } from '../contexts/ToastContext';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (e) {
      showToast('Error loading documents', 'error');
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await documentService.uploadDocument(file, file.name.split('.')[0]);
      showToast(`Document '${file.name}' processed and indexed for AI! +25 XP`, 'success');
      loadDocuments();
    } catch (e) {
      showToast('Failed to upload and process document', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentService.deleteDocument(id);
      showToast('Document deleted', 'info');
      loadDocuments();
    } catch (e) {
      showToast('Failed to delete document', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Study Documents</h1>
          <p className="text-xs text-slate-500 mt-0.5">Upload PDFs, Word docs, and notes to enable AI RAG context search</p>
        </div>

        <label className="cursor-pointer">
          <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.doc,.txt" className="hidden" />
          <span className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors">
            <UploadCloud className="w-4 h-4 mr-1.5" />
            {uploading ? 'Processing & Indexing...' : 'Upload Document'}
          </span>
        </label>
      </div>

      {documents.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No documents uploaded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Upload your lecture slides, notes, or research papers to unlock AI summaries, quizzes, and instant question answering.
          </p>
          <label className="cursor-pointer inline-block">
            <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.doc,.txt" className="hidden" />
            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors">
              <UploadCloud className="w-4 h-4 mr-1.5" /> Upload Your First Document
            </span>
          </label>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                    {doc.file_type}
                  </span>
                  <Badge variant={doc.status === 'ready' ? 'emerald' : 'amber'}>
                    {doc.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-slate-800 mb-1 truncate">{doc.title}</h3>
                <p className="text-xs text-slate-400 mb-4 truncate">{doc.filename}</p>

                <div className="text-xs text-slate-500 space-y-1 mb-4">
                  <p>• Size: {(doc.file_size_bytes / 1024).toFixed(1)} KB</p>
                  <p>• Searchable Chunks: {doc.chunk_count}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button size="sm" variant="soft" onClick={() => navigate(`/chat?docId=${doc.id}`)}>
                  <Bot className="w-3.5 h-3.5 mr-1" /> Chat with PDF
                </Button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-slate-300 hover:text-rose-600 p-1.5 rounded transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
