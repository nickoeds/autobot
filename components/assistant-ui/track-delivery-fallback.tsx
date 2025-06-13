import { ToolCallContentPartComponent } from "@assistant-ui/react";
import { TruckIcon, PackageIcon, MapPinIcon, ClockIcon, UserIcon, XIcon } from "lucide-react";
import { useState } from "react";

export const TrackDeliveryFallback: ToolCallContentPartComponent = ({
  result,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Show animated loading state while tracking
  if (result === undefined) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="animate-pulse">
          <TruckIcon className="size-4 text-gray-500" />
        </div>
        <span className="text-gray-600 text-sm">
          tracking delivery...
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
        <PackageIcon className="size-4 text-gray-500" />
        <span className="text-gray-600 text-sm">
          tracking failed: {parsedResult.error}
        </span>
      </div>
    );
  }

  const delivery = parsedResult;
  const photos = delivery.proof_of_delivery?.photos || [];
  
  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'in_progress':
      case 'out_for_delivery':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'failed':
      case 'returned':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 max-w-md bg-white">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TruckIcon className="size-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            DO #{delivery.do_number}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(delivery.status)}`}>
          {delivery.status || 'Unknown'}
        </span>
      </div>

      {/* Essential delivery info */}
      <div className="space-y-2 mb-3">
        {delivery.recipient && (
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="size-3 text-gray-500" />
            <span className="text-gray-700">{delivery.recipient}</span>
          </div>
        )}
        
        {delivery.deliveryAddress && (
          <div className="flex items-start gap-2 text-sm">
            <MapPinIcon className="size-3 text-gray-500 mt-0.5" />
            <span className="text-gray-700 leading-tight">{delivery.deliveryAddress}</span>
          </div>
        )}
        
        {delivery.eta && (
          <div className="flex items-center gap-2 text-sm">
            <ClockIcon className="size-3 text-gray-500" />
            <span className="text-gray-700">ETA: {new Date(delivery.eta).toLocaleString()}</span>
          </div>
        )}
        
        {delivery.tracking_number && (
          <div className="text-xs text-gray-500">
            Tracking: {delivery.tracking_number}
          </div>
        )}
      </div>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs text-gray-600 mb-2">Proof of Delivery</div>
          <div className="flex gap-2 flex-wrap">
            {photos.map((photo: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(photo)}
                className="relative overflow-hidden rounded border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <img
                  src={photo}
                  alt={`Delivery photo ${index + 1}`}
                  className="w-12 h-12 object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Signature */}
      {delivery.proof_of_delivery?.signatureUrl && (
        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="text-xs text-gray-600 mb-2">Signature</div>
          <button
            onClick={() => setSelectedImage(delivery.proof_of_delivery.signatureUrl)}
            className="relative overflow-hidden rounded border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <img
              src={delivery.proof_of_delivery.signatureUrl}
              alt="Delivery signature"
              className="w-16 h-12 object-cover"
            />
          </button>
        </div>
      )}

      {/* Full-size image modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
            >
              <XIcon className="size-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size delivery image"
              className="max-w-full max-h-full object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 