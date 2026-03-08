import { useState } from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';

export default function PacketFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({ protocol: '', entropyFlag: false, search: '' });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'TLS', 'DNS', 'ICMP'];

  return (
    <div className="border-b border-white/[0.06] p-3" data-testid="packet-filters">
      <div className="relative mb-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
        <input
          type="text"
          placeholder="Search packets..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-white placeholder-neutral-600 focus:border-white/[0.2] outline-none transition-colors"
          data-testid="packet-search-input"
        />
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-xs text-neutral-500 hover:text-white py-1 transition-colors"
        data-testid="toggle-filters-btn"
      >
        <span className="flex items-center gap-1.5 font-medium">
          <Filter size={12} />
          Filters
        </span>
        <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="space-y-3 mt-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-medium text-neutral-600 mb-1">Protocol</label>
            <select
              value={filters.protocol}
              onChange={(e) => handleFilterChange('protocol', e.target.value)}
              className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-white focus:border-white/[0.2] outline-none"
              data-testid="protocol-filter"
            >
              <option value="">All</option>
              {protocols.map(proto => (
                <option key={proto} value={proto}>{proto}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.entropyFlag}
              onChange={(e) => handleFilterChange('entropyFlag', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-neutral-600 bg-transparent accent-white"
              data-testid="entropy-filter"
            />
            <span className="text-xs text-neutral-400">High entropy only</span>
          </label>
        </div>
      )}
    </div>
  );
}
