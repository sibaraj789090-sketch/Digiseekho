import React, { useState } from 'react';
import { dataService } from '../../lib/dataService';
import { MediaItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  Image as ImageIcon,
  FileCheck
} from 'lucide-react';

export const AdminMedia: React.FC = () => {
  const { showToast } = useApp();
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => dataService.getMedia());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.file_url);
    setCopiedId(item.id);
    showToast('Image URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    dataService.deleteMedia(id);
    setMediaList(dataService.getMedia());
    showToast('Image removed from Media Library', 'info');
  };

  // Simulated drag/drop file or custom URL upload
  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl) {
      showToast('Please provide an image URL or upload a file.', 'error');
      return;
    }

    const newItem = dataService.addMedia({
      title: uploadTitle || 'Uploaded Image',
      file_url: uploadUrl,
      file_name: uploadTitle.toLowerCase().replace(/\s+/g, '_') + '.jpg',
      file_size: 250000,
      mime_type: 'image/jpeg',
      alt_text: uploadAlt || uploadTitle
    });

    setMediaList(dataService.getMedia());
    setUploadTitle('');
    setUploadAlt('');
    setUploadUrl('');
    setIsUploading(false);
    showToast('Image successfully added to Media Library!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadUrl(result);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Media Library ({mediaList.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Store, optimize, and organize photos with accessible alt attributes
          </p>
        </div>

        <button
          onClick={() => setIsUploading(prev => !prev)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Upload Drawer / Box */}
      {isUploading && (
        <form onSubmit={handleAddMedia} className="p-6 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Upload & Ingest New Image
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Choose Local Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Or Enter Direct Image URL
              </label>
              <input
                type="text"
                value={uploadUrl}
                onChange={e => setUploadUrl(e.target.value)}
                placeholder="/src/assets/images/... or https://..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Image Title
              </label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                placeholder="e.g. AI Prompt Architecture Diagram"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                SEO & Screen-Reader Alt Text
              </label>
              <input
                type="text"
                value={uploadAlt}
                onChange={e => setUploadAlt(e.target.value)}
                placeholder="Detailed description of what the image depicts..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Save to Library
            </button>
          </div>
        </form>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {mediaList.map(item => (
          <div
            key={item.id}
            className="group bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div 
              onClick={() => setPreviewItem(item)}
              className="aspect-16/10 bg-slate-100 dark:bg-slate-800 cursor-pointer overflow-hidden relative"
            >
              <img
                src={item.file_url}
                alt={item.alt_text || item.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </div>
            </div>

            <div className="p-3.5">
              <div className="font-semibold text-xs text-slate-900 dark:text-white truncate mb-1" title={item.title}>
                {item.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate mb-3" title={item.alt_text}>
                Alt: {item.alt_text || 'None'}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(item)}
                  className="text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded"
                  title="Delete Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-sm">
                {previewItem.title}
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="aspect-16/10 rounded-lg overflow-hidden bg-slate-100 mb-4">
              <img src={previewItem.file_url} alt={previewItem.alt_text} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <strong>Alt Text:</strong> {previewItem.alt_text || 'N/A'}
              </div>
              <div className="font-mono text-[11px] truncate">
                <strong>URL:</strong> {previewItem.file_url}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
