import { useState } from 'react';
import { X } from 'lucide-react';

export default function LayerInspectorModal({ layer, packet, onClose }) {
  const [activeTab, setActiveTab] = useState('parsed');

  if (!layer || !packet) return null;

  const layerKey = layer.name.toLowerCase().replace(' ', '');
  const layerData = packet.layers[layerKey] || packet.layers[layer.name.toLowerCase()] || null;
  const rawBytes = JSON.stringify(layerData, null, 2);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      data-testid="layer-inspector-modal"
    >
      <div
        className="bg-ns-bg-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-white/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-semibold text-white">Layer {layer.id}: {layer.name}</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{layer.description}</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white" data-testid="close-inspector-btn">
            <X size={18} />
          </button>
        </div>

        <div className="flex border-b border-white/[0.06]">
          {['parsed', 'raw', 'hex'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-xs font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'text-white border-white'
                  : 'text-neutral-500 border-transparent hover:text-neutral-300'
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab === 'raw' ? 'Raw JSON' : tab === 'hex' ? 'Hex View' : 'Parsed Data'}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 160px)' }}>
          {activeTab === 'parsed' && (
            <div className="space-y-2">
              {layerData && typeof layerData === 'object' ? (
                Object.entries(layerData).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-4 p-3 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                    <div className="text-xs font-medium text-neutral-500 min-w-[100px]">{key}</div>
                    <div className="text-xs text-neutral-200 font-mono">{String(value)}</div>
                  </div>
                ))
              ) : (
                <div className="text-neutral-600 text-sm text-center py-8">No data available for this layer</div>
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <pre className="text-xs font-mono text-neutral-300 bg-white/[0.02] p-4 rounded-lg border border-white/[0.04] overflow-x-auto">
              {rawBytes || 'null'}
            </pre>
          )}

          {activeTab === 'hex' && (
            <div className="font-mono text-[10px] text-neutral-400 bg-white/[0.02] p-4 rounded-lg border border-white/[0.04] leading-relaxed">
              {(rawBytes || '').split('').map((char, i) => (
                <span key={i} className="mr-1">
                  {char.charCodeAt(0).toString(16).padStart(2, '0')}
                  {(i + 1) % 16 === 0 && <br />}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.06]">
          <span className="text-[10px] text-neutral-600 font-mono">Packet: {packet.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg text-xs text-neutral-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
