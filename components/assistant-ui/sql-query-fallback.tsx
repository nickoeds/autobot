import { ToolCallContentPartComponent } from "@assistant-ui/react";
import { DatabaseIcon } from "lucide-react";

export const SqlQueryFallback: ToolCallContentPartComponent = ({
  result,
}) => {
  // Show animated loading state while searching
  if (result === undefined) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="animate-spin">
          <DatabaseIcon className="size-4 text-gray-500" />
        </div>
        <span className="text-gray-600 text-sm">
          searching db...
        </span>
      </div>
    );
  }

  // Parse the result if it's a string
  const parsedResult = typeof result === "string" ? JSON.parse(result) : result;
  
  // Show static completion state
  if (parsedResult.success) {
    const resultCount = parsedResult.rowCount || parsedResult.results?.length || 0;
    return (
      <div className="flex items-center gap-2 py-2">
        <DatabaseIcon className="size-4 text-gray-600" />
        <span className="text-gray-600 y-600 text-sm">
          retrieved {resultCount} result{resultCount !== 1 ? 's' : ''} from db
        </span>
      </div>
    );
  } else {
    // Handle error case
    return (
      <div className="flex items-center gap-2 py-2">
        <DatabaseIcon className="size-4 text-gray-500" />
        <span className="text-gray-600 text-sm">
          search failed
        </span>
      </div>
    );
  }
}; 