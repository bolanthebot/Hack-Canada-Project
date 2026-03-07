import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

function createParkingIcon(source) {
  const isGreenP = source === 'green_p';
  const color = isGreenP ? '#22C55E' : '#3b82f6';
  return L.divIcon({
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="drop-shadow-md">
            <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" stroke-width="2"/>
            <text x="12" y="16" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">P</text>
           </svg>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function ParkingMarkers({ spots }) {
  return spots.map((spot) => (
    <Marker
      key={spot._id}
      position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
      icon={createParkingIcon(spot.source)}
    >
      <Popup>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5, minWidth: 150 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {spot.streetName || 'Street parking'}
          </div>

          {spot.source === 'green_p' ? (
            <div style={{ color: '#059669', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Green P Parking</div>
          ) : (
            <div style={{ color: '#2563eb', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Street Parking</div>
          )}
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
