import { useState } from 'react';
import { MapPin, Crosshair } from 'lucide-react';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

export default function LocationPicker({ register, setValue, cityName = 'location_city', latName = 'location_lat', lngName = 'location_lng' }) {
  const [detecting, setDetecting] = useState(false);

  const detectLocation = () => {
    setDetecting(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setValue(latName, pos.coords.latitude);
        setValue(lngName, pos.coords.longitude);
        setDetecting(false);
      },
      () => setDetecting(false)
    );
  };

  return (
    <div className="space-y-2">
      <Input
        label="City"
        placeholder="Your city"
        leftIcon={<MapPin size={16} />}
        {...register(cityName)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        isLoading={detecting}
        loadingText="Detecting..."
        leftIcon={<Crosshair size={14} />}
        onClick={detectLocation}
      >
        Use my location
      </Button>
    </div>
  );
}