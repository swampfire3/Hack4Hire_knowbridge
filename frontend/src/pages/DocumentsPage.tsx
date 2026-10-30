import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const DocumentsPage: React.FC = () => {
  const { currentUser, documents, clients, addDocument } = useApp();
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>(
    currentUser?.role === 'admin' ? 'all' : (currentUser?.assignedClientId || '')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocVersion, setNewDocVersion] = useState('v1.0');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [targetClientId, setTargetClientId] = useState(currentUser?.assignedClientId || '');
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentUser) return null;

  // Filter docs according to role & tenant
  const filteredDocuments = documents.filter((doc) => {
    if (currentUser.role !== 'admin') {
      if (doc.clientId !== currentUser.assignedClientId) return false;
    } else if (selectedClientFilter !== 'all') {
      if (doc.clientId !== selectedClientFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.clientName.toLowerCase().includes(q) ||
        doc.version.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !targetClientId || !newDocVersion.trim()) return;
    setIsUploading(true);
    setUploadFeedback(null);
    const result = await addDocument(selectedFile, targetClientId, newDocVersion.trim());
    setIsUploading(false);

    if (!result.success) {
      setUploadFeedback({ type: 'error', text: result.message });
      return;
    }

    setUploadFeedback({ type: 'success', text: result.message });
    setSelectedFile(null);
    setNewDocVersion('v1.0');
    window.setTimeout(() => {
      setShowUploadModal(false);
      setUploadFeedback(null);
    }, 1500);
  };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-7 selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F3E8D5] tracking-tight">Document Repository</h1>
          <p className="text-xs md:text-sm text-[#C9B9A5] mt-1">
            {currentUser.role === 'admin'
              ? 'Manage and ingest digital client documentation, versions, and Qdrant chunk indexes'
              : `Active verified documentation accessible for ${currentUser.assignedClientName}`}
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={clients.length === 0}
            className="px-4 py-2.5 rounded-xl bg-[#C8874A] text-[#241D19] font-bold text-xs flex items-center gap-2 hover:bg-[#D99A5E] shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#241D19] p-4 rounded-2xl border border-[#3D3027]">
        <div className="flex flex-wrap items-center gap-3">
          {currentUser.role === 'admin' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8F7B68] uppercase">Client:</span>
              <select
                value={selectedClientFilter}
                onChange={(e) => setSelectedClientFilter(e.target.value)}
                className="text-xs rounded-xl border border-[#44362D] bg-[#1C1714] px-3 py-2 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A]"
              >
                <option value="all">All Clients ({documents.length})</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F7B68] flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[16px]">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#44362D] bg-[#1C1714] text-[#F3E8D5] text-xs placeholder:text-[#8F7B68] focus:outline-none focus:border-[#C8874A]"
            />
          </div>
        </div>

        <span className="text-xs text-[#8F7B68] font-medium">
          Showing {filteredDocuments.length} document{filteredDocuments.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Documents Table */}
      <div className="bg-[#241D19] border border-[#3D3027] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="border-b border-[#342923] text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4">Client Tenant</th>
                <th className="px-6 py-4">Version</th>
                <th className="px-6 py-4">File Size</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#342923]">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[#8F7B68]">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#2A211B]/60 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#342923] border border-[#44362D] text-[#D99A5E] flex items-center justify-center font-bold text-[10px] shrink-0">
                        {doc.type}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#F3E8D5] text-xs md:text-sm truncate">{doc.name}</div>
                        <div className="text-[11px] text-[#8F7B68]">By {doc.uploadedBy}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#1C1714] border border-[#3D3027] text-[#C9B9A5]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8874A]"></span>
                        {doc.clientName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#F3E8D5] font-semibold text-xs">
                      {doc.version}
                    </td>
                    <td className="px-6 py-4 text-[#8F7B68] text-xs">
                      {doc.fileSize}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${
                          doc.status === 'indexed'
                            ? 'bg-[#2D3A2D] text-[#B5C99F] border-[#53684B]'
                            : doc.status === 'processing'
                            ? 'bg-[#403323] text-[#E4BD72] border-[#755B36]'
                            : 'bg-[#402A25] text-[#E8A394] border-[#70473D]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            doc.status === 'indexed'
                              ? 'bg-[#91A982]'
                              : doc.status === 'processing'
                              ? 'bg-[#E0B765] animate-pulse'
                              : 'bg-[#D47D68]'
                          }`}
                        ></span>
                        <span>{doc.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#8F7B68] text-xs">
                      {doc.uploadedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#342923] flex items-center justify-between text-xs text-[#8F7B68]">
          <span>Documents are parsed into semantic chunks and embedded with Qdrant collection vectors</span>
          <span>Role-scoped ingest</span>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#342923] rounded-3xl border border-[#58483B] max-w-md w-full p-6 md:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#F3E8D5]">Upload Client Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#8F7B68] hover:text-[#F3E8D5] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {uploadFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold border ${
                  uploadFeedback.type === 'success'
                    ? 'bg-[#2D3A2D] text-[#B5C99F] border-[#53684B]'
                    : 'bg-[#402A25] text-[#E8A394] border-[#70473D]'
                }`}
              >
                {uploadFeedback.text}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#E9DCC9] block mb-1">Target Client</label>
                <select
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#58483B] bg-[#241D19] px-3 py-2.5 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E9DCC9] block mb-1">Document Version Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. v1.0 or 2026-Q4"
                  value={newDocVersion}
                  onChange={(e) => setNewDocVersion(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#58483B] bg-[#241D19] px-3.5 py-2.5 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E9DCC9] block mb-1">File (PDF or DOCX)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs rounded-xl border border-[#58483B] bg-[#241D19] px-3 py-2 text-[#C9B9A5] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#44362D] file:text-[#D99A5E] hover:file:bg-[#58483B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#44362D]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#58483B] text-xs text-[#C9B9A5] hover:bg-[#241D19] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-4 py-2 rounded-xl bg-[#C8874A] text-[#241D19] text-xs font-bold hover:bg-[#D99A5E] disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? 'Ingesting…' : 'Upload & Index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};