import { tool } from "ai";
import { z } from "zod";
import mysql from "mysql2/promise";

// Type definitions for Detrack API response objects
interface DeliveryItem {
  sku: string;
  description: string;
  quantity: number;
  serial_numbers: string[];
}

interface DeliveryMilestone {
  status: string;
  pod_at: string;
  reason: string;
}

// Vehicle tracking interfaces
interface VehicleData {
  name: string;
  lat: number;
  lng: number;
  address: string;
  batt: number;
  speed: number;
  max_speed: number;
  avg_speed: number;
  tracked_at: string;
  connection: string;
  no_gps?: boolean;
}

interface VehicleApiEntry {
  status: string;
  name: string;
  vehicle?: VehicleData;
  errors?: Array<{ message: string }>;
}

interface VehicleApiResponse {
  results: VehicleApiEntry[];
}

// SQL Database Query tool
export const sqlQueryTool = tool({
  description: "Execute SQL queries on the ap_autopart database, specifically on the iLines table. Use this to retrieve data about auto parts. Results returned are limited to 20 rows maximum.",
  parameters: z.object({
    query: z.string().describe("The SQL query to execute (SELECT statements only for security). Should query the iLines table in ap_autopart database. Results will be limited to 20 rows maximum in the response."),
  }),
  execute: async ({ query }) => {
    try {
      // Validate that only SELECT queries are allowed for security
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery.startsWith('select')) {
        throw new Error("Only SELECT queries are allowed for security reasons");
      }

      // Create database connection
      const connection = await mysql.createConnection({
        host: '88.208.224.141',
        port: 3306,
        user: 'pavlo',
        password: '8b2M_7xw0',
        database: 'ap_autopart'
      });

      try {
        // Execute the query
        const [rows, fields] = await connection.execute(query);
        
        // Close the connection
        await connection.end();

        // Limit results to 20 rows maximum
        const allRows = Array.isArray(rows) ? rows : [];
        const limitedResults = allRows.slice(0, 20);
        const wasLimited = allRows.length > 20;

        return {
          success: true,
          query: query,
          results: limitedResults,
          rowCount: limitedResults.length,
          totalRowCount: allRows.length,
          resultsLimited: wasLimited,
          fields: fields?.map(field => ({
            name: field.name,
            type: field.type
          }))
        };
      } catch (queryError) {
        await connection.end();
        throw queryError;
      }
    } catch (error) {
      return {
        success: false,
        query: query,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        results: []
      };
    }
  },
});

export const trackDeliveryTool = tool({
  description:
    "Track a customer's delivery using the Detrack API. Provide the delivery order (DO) number to get the latest status.",
  parameters: z.object({
    do_number: z.string().describe("The delivery order number to track."),
  }),
  execute: async ({ do_number }) => {
    try {
      const apiKey = process.env.DETRACK_API_KEY;
      if (!apiKey) {
        throw new Error("Detrack API key is not configured.");
      }

      const url = `https://app.detrack.com/api/v2/dn/jobs/${do_number}?type=Delivery`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Detrack API error: ${response.status} ${
            errorData.message || response.statusText
          }`
        );
      }

      const result = await response.json();

      if (!result.data) {
        throw new Error(
          "Invalid response format from Detrack API: missing 'data' field."
        );
      }
      const job = result.data;

      // Extracting essential information based on Detrack API documentation
      const essentialInfo = {
        status: job.status,
        trackingStatus: job.tracking_status,
        do_number: job.do_number,
        tracking_number: job.tracking_number,
        order_number: job.order_number,
        deliveryDate: job.date,
        eta: job.live_eta || job.eta_time,
        recipient: job.deliver_to_collect_from,
        deliveryAddress: job.address,
        items: job.items.map((item: DeliveryItem) => ({
          sku: item.sku,
          description: item.description,
          quantity: item.quantity,
          serial_numbers: item.serial_numbers,
        })),
        proof_of_delivery: {
          signedAt: job.signed_at,
          signatureUrl: job.signature_file_url,
          photos: [
            job.photo_1_file_url,
            job.photo_2_file_url,
            job.photo_3_file_url,
            job.photo_4_file_url,
            job.photo_5_file_url,
          ].filter(Boolean),
        },
        statusHistory: job.milestones.map((milestone: DeliveryMilestone) => ({
          status: milestone.status,
          timestamp: milestone.pod_at,
          reason: milestone.reason,
        })),
        lastReason: job.last_reason,
      };

      return {
        success: true,
        ...essentialInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
}); 

export const trackVehicleTool = tool({
  description:
    "Track the GPS location and details of a delivery vehicle by name using the Detrack API. Returns real-time latitude, longitude, address, battery, speed, and a Google Maps link.",
  parameters: z.object({
    vehicle_names: z.array(z.string()).nonempty().describe("List of vehicle names to track, e.g., ['Anthony']"),
  }),
  execute: async ({ vehicle_names }) => {
    try {
      const apiKey = process.env.DETRACK_API_KEY;
      if (!apiKey) {
        throw new Error("Detrack API key is not configured.");
      }

      const response = await fetch("https://app.detrack.com/api/v1/vehicles/view.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(vehicle_names),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Detrack Vehicle API error: ${response.status} ${errorData.message || response.statusText}`);
      }

      const result: VehicleApiResponse = await response.json();
      if (!result.results) {
        throw new Error("Invalid response format from Detrack API: missing 'results' field.");
      }

      const vehicleInfo = result.results.map((entry: VehicleApiEntry) => {
        if (entry.status === "ok" && entry.vehicle && !entry.vehicle.no_gps) {
          const v = entry.vehicle;
          const mapsLink = `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`;
          return {
            success: true,
            name: v.name,
            lat: v.lat,
            lng: v.lng,
            address: v.address,
            battery: v.batt,
            speed: v.speed,
            max_speed: v.max_speed,
            avg_speed: v.avg_speed,
            tracked_at: v.tracked_at,
            connection: v.connection,
            googleMapsUrl: mapsLink,
          };
        } else {
          return {
            success: false,
            name: entry.name,
            error: entry.errors?.[0]?.message || "Vehicle not found or GPS unavailable.",
          };
        }
      });

      return {
        success: true,
        results: vehicleInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});