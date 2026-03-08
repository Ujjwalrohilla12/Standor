import { useState } from 'react';
import { X } from 'lucide-react';
import { annotationsApi } from '../utils/api';
import { toast } from 'sonner';

export default function AnnotationModal({ packet, onClose, onSave }) {
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [severity, setSeverity] = useState('info');
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSave = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      const annotation = {
        packetId: packet.id,
        userId: 'current-user',
        userName: 'John Doe',
        comment: comment.trim(),
        tags,
        severity,
      };
      await annotationsApi.create(annotation);
      onSave?.(annotation);
      toast.success('Annotation saved');
      onClose();
    } catch {
      onSave?.({ packetId: packet.id, userId: 'current-user', userName: 'John Doe', comment: comment.trim(), tags, severity });
      toast.success('Annotation saved locally');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      data-testid="annotation-modal"
    >
      <div
        className="bg-ns-bg-800 rounded-xl max-w-lg w-full p-6 border border-white/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Add Annotation</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white" data-testid="close-modal-btn">
            <X size={18} />
          </button>
        </div>

        <div className="bg-white/[0.03] rounded-lg p-3 mb-5 border border-white/[0.06]">
          <div className="text-[10px] text-neutral-600 mb-1">Packet</div>
          <div className="font-mono text-xs text-neutral-300">
            {packet.protocol} | {packet.src}:{packet.srcPort} → {packet.dst}:{packet.dstPort}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-neutral-400 mb-2">Severity</label>
          <div className="flex gap-2">
            {['info', 'warning', 'critical'].map(val => (
              <button
                key={val}
                onClick={() => setSeverity(val)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                  severity === val
                    ? 'bg-white text-black'
                    : 'bg-white/[0.04] text-neutral-400 border border-white/[0.08] hover:border-white/[0.15]'
                }`}
                data-testid={`severity-${val}-btn`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-neutral-400 mb-2">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe what you found..."
            rows={3}
            className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-neutral-600 focus:border-white/[0.2] outline-none resize-none"
            data-testid="annotation-comment-input"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-medium text-neutral-400 mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tag..."
              className="flex-1 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-white placeholder-neutral-600 focus:border-white/[0.2] outline-none"
              data-testid="tag-input"
            />
            <button
              onClick={addTag}
              className="px-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg text-xs text-neutral-300 hover:text-white"
              data-testid="add-tag-btn"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-white/[0.06] text-neutral-300 rounded-full text-[10px] font-medium flex items-center gap-1.5" data-testid={`tag-${tag}`}>
                {tag}
                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-white">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!comment.trim() || saving}
            className="flex-1 py-2.5 bg-white text-black rounded-lg font-semibold text-sm hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors"
            data-testid="save-annotation-btn"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-white/[0.1] rounded-lg text-sm text-neutral-400 hover:text-white transition-colors"
            data-testid="cancel-annotation-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
