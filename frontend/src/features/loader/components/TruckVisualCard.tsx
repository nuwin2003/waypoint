import truckInfoImage from '../../../assets/truck-info.png';

interface TruckVisualCardProps {
  plate?: string;
}

export function TruckVisualCard({ plate = 'truck' }: TruckVisualCardProps) {
  return (
    <div className="loader-truck-visual">
      <img
        src={truckInfoImage}
        alt={`Cargo diagram for ${plate}`}
      />
    </div>
  );
}
