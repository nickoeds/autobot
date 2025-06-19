import { ToolCallContentPartComponent } from "@assistant-ui/react";
import { TruckIcon, PackageIcon, MapPinIcon, BuildingIcon } from "lucide-react";

// Interface for delivery data
interface Delivery {
  do_number: string;
  status: string;
  company_name: string;
  address: string;
  instructions?: string;
  items_count: number;
  items: string;
  verification_code?: number;
}

interface DriverDeliveriesResult {
  success: boolean;
  driver_name: string;
  delivery_count?: number;
  deliveries?: Delivery[];
  error?: string;
}

export const DriverDeliveriesFallback: ToolCallContentPartComponent = ({
  result,
}) => {
  // Show animated loading state while fetching
  if (result === undefined) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="animate-pulse">
          <TruckIcon className="size-4 text-gray-500" />
        </div>
        <span className="text-gray-600 text-sm">
          loading driver deliveries...
        </span>
      </div>
    );
  }

  // Parse the result if it's a string
  const parsedResult: DriverDeliveriesResult = typeof result === "string" ? JSON.parse(result) : result;
  
  // Handle error case
  if (!parsedResult.success) {
    return (
      <div className="flex items-center gap-2 py-2">
        <TruckIcon className="size-4 text-gray-500" />
        <span className="text-gray-600 text-sm">
          failed to get deliveries for {parsedResult.driver_name}: {parsedResult.error}
        </span>
      </div>
    );
  }

  const deliveries = parsedResult.deliveries || [];
  
  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'dispatched':
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <TruckIcon className="size-5 text-gray-600" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {parsedResult.driver_name}&apos;s Deliveries
          </h3>
          <p className="text-sm text-gray-600">
            {parsedResult.delivery_count} delivery{parsedResult.delivery_count !== 1 ? 's' : ''} assigned
          </p>
        </div>
      </div>

      {/* No deliveries message */}
      {deliveries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <PackageIcon className="size-12 mx-auto mb-2 text-gray-300" />
          <p>No deliveries found for {parsedResult.driver_name}</p>
        </div>
      )}

      {/* Deliveries list */}
      {deliveries.map((delivery, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
          {/* Header with DO number and status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PackageIcon className="size-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                DO #{delivery.do_number}
              </span>
            </div>
                         <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(delivery.status)}`}>
               {delivery.status}
             </span>
          </div>

          {/* Company and address */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <BuildingIcon className="size-3 text-gray-500" />
              <span className="text-gray-700 font-medium">{delivery.company_name}</span>
            </div>
            
                         <div className="flex items-start gap-2 text-sm">
               <MapPinIcon className="size-3 text-gray-500 mt-0.5" />
               <span className="text-gray-700 leading-tight">{delivery.address}</span>
             </div>
           </div>

           {/* Instructions or notes */}
           {delivery.instructions && (
             <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
               <span className="font-medium text-yellow-800">Note: </span>
               <span className="text-yellow-700">{delivery.instructions}</span>
             </div>
           )}

           {/* Items summary */}
           <div className="mb-3">
             <div className="text-xs text-gray-600 mb-1">
               Items ({delivery.items_count}):
             </div>
             <div className="text-xs text-gray-700 leading-relaxed">
               {delivery.items.split(', ').map((item, index) => (
                 <div key={index} className="mb-1">
                   <span className="text-gray-800">{item.split(' (')[0]}</span>
                   {item.includes('(') && (
                     <span className="text-gray-500 font-mono ml-2">
                       ({item.split('(')[1].replace(')', '')})
                     </span>
                   )}
                 </div>
               ))}
               {delivery.items_count > 3 && (
                 <div className="text-gray-500 italic">
                   ... and {delivery.items_count - 3} more items
                 </div>
               )}
             </div>
           </div>

          {/* Verification code if available */}
          {delivery.verification_code && (
            <div className="mt-2 text-xs text-gray-600">
              Verification Code: <span className="font-mono font-bold">{delivery.verification_code}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 