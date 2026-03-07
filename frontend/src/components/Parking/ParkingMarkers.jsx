import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { parkingApi } from '../../api';
import toast from 'react-hot-toast';

function createParkingIcon(status) {
  const color = status === 'available' ? '#34d399' : '#f87171';
  return L.divIcon({
    html: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="2" fill="${color}" opacity="0.85"/></svg>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function ParkingMarkers({ spots, onUpdate }) {
  const toggleStatus = async (spot) => {
    const newStatus = spot.status === 'available' ? 'taken' : 'available';
    try {
      // NOTE: Parking backend has been deleted.
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
      icon={createParkingIcon(spot.status)}
    >
      <Popup>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5, minWidth: 150 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {spot.streetName || 'Street parking'}
          </div>
          <div style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 500,
            padding: '1px 6px',
            borderRadius: 4,
            background: spot.status === 'available' ? '#d1fae5' : '#fee2e2',
            color: spot.status === 'available' ? '#065f46' : '#991b1b',
          }}>
            {spot.status === 'available' ? 'Open' : 'Occupied'}
          </div>
          {spot.restrictions && (
            <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 6 }}>
              {spot.restrictions}
            </div>
          )}
          <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>
            Last updated {new Date(spot.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button
            onClick={() => toggleStatus(spot)}
            style={{
              marginTop: 8,
              width: '100%',
              fontSize: 11,
              fontWeight: 500,
              padding: '5px 0',
              borderRadius: 4,
              border: '1px solid #d1d5db',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            {spot.status === 'available' ? "I'm parking here" : "Spot is free now"}
          </button>
        </div>
      </Popup>
    </Marker>
  ));
}
