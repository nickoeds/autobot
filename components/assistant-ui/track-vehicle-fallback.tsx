import { ToolCallContentPartComponent } from "@assistant-ui/react";
import { CarIcon, MapPinIcon, BatteryIcon, GaugeIcon, ClockIcon, ExternalLinkIcon } from "lucide-react";

// Interface for tracked vehicle data
interface TrackedVehicle {
  success: boolean;
  name: string;
  lat?: number;
  lng?: number;
  address?: string;
  battery?: number;
  speed?: number;
  max_speed?: number;
  avg_speed?: number;
  tracked_at?: string;
  connection?: string;
  googleMapsUrl?: string;
  error?: string;
}

export const TrackVehicleFallback: ToolCallContentPartComponent = ({
  result,
}) => {
  // Show animated loading state while tracking
  if (result === undefined) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="animate-pulse">
          <CarIcon className="size-4 text-gray-500" />
        </div>
        <span className="text-gray-600 text-sm">
          tracking vehicle...
        </span>
      </div>
    );
  }

  // Parse the result if it's a string
  const parsedResult = typeof result === "string" ? JSON.parse(result) : result;
  
  // Handle error case
  if (!parsedResult.success) {
    return (
      <div className="flex items-center gap-2 py-2">
        <CarIcon className="size-4 text-gray-500" />
        <span className="text-gray-600 text-sm">
          vehicle tracking failed: {parsedResult.error}
        </span>
      </div>
    );
  }

  const vehicles = parsedResult.results || [];
  
  // Battery level color mapping
  const getBatteryColor = (battery: number) => {
    if (battery >= 60) return 'text-green-700 bg-green-50';
    if (battery >= 30) return 'text-yellow-700 bg-yellow-50';
    return 'text-red-700 bg-red-50';
  };

  // Connection status color mapping
  const getConnectionColor = (connection: string) => {
    switch (connection?.toLowerCase()) {
      case 'online':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'offline':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {vehicles.map((vehicle: TrackedVehicle, index: number) => {
        // Handle individual vehicle errors
        if (!vehicle.success) {
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 max-w-md bg-white">
              <div className="flex items-center gap-2">
                <CarIcon className="size-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {vehicle.name || `Vehicle ${index + 1}`}
                </span>
              </div>
              <div className="text-sm text-red-600 mt-2">
                {vehicle.error}
              </div>
            </div>
          );
        }

        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4 max-w-md bg-white">
            {/* Header with vehicle name and connection status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CarIcon className="size-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {vehicle.name}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getConnectionColor(vehicle.connection || '')}`}>
                {vehicle.connection || 'Unknown'}
              </span>
            </div>

            {/* Location information */}
            <div className="space-y-2 mb-3">
              {vehicle.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPinIcon className="size-3 text-gray-500 mt-0.5" />
                  <span className="text-gray-700 leading-tight">{vehicle.address}</span>
                </div>
              )}
              
              {vehicle.lat && vehicle.lng && (
                <div className="text-xs text-gray-500">
                  Coordinates: {vehicle.lat.toFixed(6)}, {vehicle.lng.toFixed(6)}
                </div>
              )}
            </div>

            {/* Vehicle metrics */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {vehicle.battery !== undefined && (
                <div className="flex items-center gap-2">
                  <BatteryIcon className="size-3 text-gray-500" />
                  <span className={`text-xs px-2 py-1 rounded ${getBatteryColor(vehicle.battery)}`}>
                    {vehicle.battery}%
                  </span>
                </div>
              )}
              
              {vehicle.speed !== undefined && (
                <div className="flex items-center gap-2">
                  <GaugeIcon className="size-3 text-gray-500" />
                  <span className="text-xs text-gray-700">
                    {vehicle.speed} km/h
                  </span>
                </div>
              )}
              
              {vehicle.max_speed !== undefined && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Max: {vehicle.max_speed} km/h</span>
                </div>
              )}
              
              {vehicle.avg_speed !== undefined && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Avg: {vehicle.avg_speed} km/h</span>
                </div>
              )}
            </div>

            {/* Last tracked time */}
            {vehicle.tracked_at && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <ClockIcon className="size-3" />
                <span>Last tracked: {new Date(vehicle.tracked_at).toLocaleString()}</span>
              </div>
            )}

            {/* Google Maps integration */}
            {vehicle.googleMapsUrl && (
              <div className="border-t border-gray-100 pt-3">
                <div className="space-y-2">
                  {/* Embedded Google Maps - only show if API key is available */}
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                    <div className="w-full h-48 rounded border border-gray-200 overflow-hidden">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${vehicle.lat},${vehicle.lng}&zoom=14`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Location of ${vehicle.name}`}
                      />
                    </div>
                  )}
                  
                  {/* Link to open in Google Maps */}
                  <a
                    href={vehicle.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLinkIcon className="size-3" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}; 