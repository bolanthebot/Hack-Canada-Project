const layers = [
  { id: 'intersections', label: 'Safety Zones', dot: '#f43f5e' },
  { id: 'greenp', label: 'Green P Parking', dot: '#22C55E' },
  { id: 'street_parking', label: 'Street Parking', dot: '#3b82f6' },
  { id: 'bike', label: 'Bike Corridors', dot: '#10b981' },
  { id: 'heatmap', label: 'Risk Heatmap', dot: '#f59e0b' },
];

export default function LayerControl({ activeLayers, onToggle }) {
  return (
<div className="absolute right-2 bottom-20 sm:right-3 sm:bottom-3 z-[1000] bg-[#161a23]/90 backdrop-blur-sm rounded-lg py-2 px-1 shadow-lg min-w-[140px] max-w-[calc(100vw-1rem)]">
  <div className="px-2.5 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
    Display Layers
  </div>

  <div className="space-y-0.5">
    {layers.map((layer) => {
      const active = activeLayers.includes(layer.id);

      return (
        <button
          key={layer.id}
          onClick={() => onToggle(layer.id)}
          className={`group w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded text-[12px] transition-colors text-left ${
            active ? "text-gray-200" : "text-gray-500"
          } hover:bg-white/[0.05]`}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0 transition-opacity"
              style={{
                backgroundColor: layer.dot,
                opacity: active ? 1 : 0.25,
              }}
            />
            <span className="truncate">{layer.label}</span>
          </div>

          {/* Active check indicator */}
          <div
            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
              active ? "border-blue-500 bg-blue-500" : "border-gray-500"
            }`}
          >
            {active && (
              <svg
                viewBox="0 0 24 24"
                className="w-2 h-2 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </button>
      );
    })}
  </div>
</div>
  );
}
