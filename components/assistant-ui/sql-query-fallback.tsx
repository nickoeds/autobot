import { ToolCallContentPartComponent } from "@assistant-ui/react";
import { DatabaseIcon } from "lucide-react";

export const SqlQueryFallback: ToolCallContentPartComponent = ({
  toolName,
  argsText,
  result,
}) => {
  // Show loading state if no result yet
  if (result === undefined) {
    return (
      <div className="flex items-center gap-3 py-6 px-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="animate-spin">
          <DatabaseIcon className="size-5 text-gray-600" />
        </div>
        <span className="text-gray-700 text-sm font-medium">
          searching database...
        </span>
      </div>
    );
  }

  // Parse the result if it's a string
  const parsedResult = typeof result === "string" ? JSON.parse(result) : result;
  
  // Handle error state
  if (!parsedResult.success) {
    return (
      <div className="py-4 px-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 mb-2">
          <DatabaseIcon className="size-4 text-red-600" />
          <span className="text-red-800 text-sm font-medium">Database Error</span>
        </div>
        <p className="text-red-700 text-sm">{parsedResult.error}</p>
      </div>
    );
  }

  // Handle successful query
  const results = parsedResult.results || [];
  const rowCount = parsedResult.rowCount || 0;

  return (
    <div className="py-4 px-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-3">
        <DatabaseIcon className="size-4 text-gray-600" />
        <span className="text-gray-800 text-sm font-medium">
          Query completed - {rowCount} result{rowCount !== 1 ? 's' : ''} found
        </span>
      </div>
      
      {results.length > 0 && (
        <div className="bg-white rounded border overflow-hidden">
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(results[0]).map((key) => (
                    <th key={key} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 10).map((row: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    {Object.values(row).map((value: any, cellIndex: number) => (
                      <td key={cellIndex} className="px-3 py-2 text-gray-900">
                        {value === null ? (
                          <span className="text-gray-400 italic">null</span>
                        ) : (
                          String(value)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {results.length > 10 && (
            <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600 border-t">
              Showing first 10 of {results.length} results
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 