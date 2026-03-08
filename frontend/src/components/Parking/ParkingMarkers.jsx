import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

function createParkingIcon() {
  return L.divIcon({
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="drop-shadow-md">
            <circle cx="12" cy="12" r="11" fill="#22C55E" stroke="white" stroke-width="2"/>
            <text x="12" y="16" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">P</text>
           </svg>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function ParkingMarkers({ spots, onUpdate }) {
  const toggleStatus = async (spot) => {
    const newStatus = spot.status === 'available' ? 'taken' : 'available';
    try {
      await parkingApi.report({
        location: spot.location,
        status: newStatus,
        streetName: spot.streetName,
      });
      toast.success(`Spot updated`);
      onUpdate?.();
    } catch {
      toast.error('Update failed');
    }
  };
  return spots.map((spot) => (
    <Marker
      key={spot._id}
      position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
      icon={createParkingIcon()}
    >
      <Popup>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5, minWidth: 150 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {spot.streetName || 'Street parking'}
          </div>

          <div style={{ color: '#059669', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Green P Parking</div>
          {spot.rate && <div style={{ fontSize: 12 }}><strong>Rate:</strong> {spot.rate}</div>}
          {spot.capacity > 0 && <div style={{ fontSize: 12 }}><strong>Capacity:</strong> {spot.capacity} spots</div>}
          {spot.carparkType && <div style={{ fontSize: 12 }}><strong>Type:</strong> {spot.carparkType}</div>}
          {spot.paymentMethods?.length > 0 && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
              <strong>Payment:</strong> {spot.paymentMethods.join(', ')}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  ));
}
