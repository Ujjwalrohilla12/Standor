import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileUp, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadApi } from '../utils/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith('.pcap') || dropped.name.endsWith('.pcapng') || dropped.name.endsWith('.cap'))) {
      setFile(dropped);
      setError(null);
      if (!title) setTitle(dropped.name.replace(/\.(pcap|pcapng|cap)$/, ''));
    } else {
      setError('Please upload a .pcap or .pcapng file');
    }
  }, [title]);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
      if (!title) setTitle(selected.name.replace(/\.(pcap|pcapng|cap)$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const data = await uploadApi.pcap(file, title, tags, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
      });
      setResult(data);
      setUploading(false);
      setTimeout(() => navigate(`/session/${data.session.id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Check your file format.');
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-10 bg-ns-bg-900" data-testid="upload-page">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2" data-testid="upload-heading">Upload Capture</h1>
        <p className="text-sm text-neutral-400 mb-8">Upload a PCAP or PCAP-NG file to begin analysis.</p>

        {/* Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${
            dragOver ? 'border-white/40 bg-white/[0.04]' : file ? 'border-white/20 bg-white/[0.02]' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !file && document.getElementById('file-input').click()}
          data-testid="upload-dropzone"
        >
          <input
            id="file-input"
            type="file"
            accept=".pcap,.pcapng,.cap"
            className="hidden"
            onChange={handleFileSelect}
            data-testid="upload-file-input"
          />

          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileUp size={24} className="text-white/60" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white" data-testid="upload-filename">{file.name}</p>
                  <p className="text-xs text-neutral-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); removeFile(); }} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors" data-testid="upload-remove-file">
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <UploadIcon size={32} className="mx-auto text-neutral-600 mb-3" />
              <p className="text-sm text-neutral-400 mb-1">Drop your capture file here, or click to browse</p>
              <p className="text-xs text-neutral-600">Supports .pcap, .pcapng, .cap files</p>
            </>
          )}
        </div>

        {/* Title & Tags */}
        {file && (
          <div className="mt-6 space-y-4" data-testid="upload-metadata">
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Session Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Suspicious DNS traffic"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-white/20 transition-colors"
                data-testid="upload-title-input"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. dns, malware, incident-42"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-white/20 transition-colors"
                data-testid="upload-tags-input"
              />
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-6" data-testid="upload-progress">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 size={16} className="text-white animate-spin" />
              <span className="text-sm text-neutral-300">Uploading & parsing...</span>
              <span className="text-sm text-neutral-500 ml-auto">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="mt-6 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5" data-testid="upload-success">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Upload successful</span>
            </div>
            <p className="text-xs text-neutral-400">
              Parsed {result.packetCount} packets from {file?.name}. Redirecting to session...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 rounded-lg border border-red-500/20 bg-red-500/5" data-testid="upload-error">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-sm font-medium text-red-300">Upload failed</span>
            </div>
            <p className="text-xs text-neutral-400">{error}</p>
          </div>
        )}

        {/* Upload Button */}
        {file && !uploading && !result && (
          <button
            onClick={handleUpload}
            className="mt-6 w-full py-3 bg-white text-black rounded-lg font-semibold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            data-testid="upload-submit-btn"
          >
            <UploadIcon size={16} />
            Upload & Analyze
          </button>
        )}
      </div>
    </div>
  );
}
