const layers = [
  { id: 'intersections', label: 'Danger zones', dot: '#f87171' },
  { id: 'parking', label: 'Street parking', dot: '#60a5fa' },
  { id: 'bike', label: 'Bike routes', dot: '#34d399' },
  { id: 'heatmap', label: 'Risk heatmap', dot: '#fb923c' },
];

export default function LayerControl({ activeLayers, onToggle }) {
  return (
    <div className="absolute top-3 right-3 z-[1000] bg-[#161a23]/90 backdrop-blur-sm rounded-lg py-2 px-1 shadow-lg min-w-[140px]">
      {layers.map((layer) => {
        const active = activeLayers.includes(layer.id);
        return (
          <button
            key={layer.id}
            onClick={() => onToggle(layer.id)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[12px] transition-colors text-left ${
              active ? 'text-gray-200' : 'text-gray-500'
            } hover:bg-white/[0.05]`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 transition-opacity"
              style={{ backgroundColor: layer.dot, opacity: active ? 1 : 0.25 }}
            />
            {layer.label}
          </button>
        );
      })}
    </div>
  );
}
