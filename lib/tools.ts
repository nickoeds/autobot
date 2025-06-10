import { tool } from "ai";
import { z } from "zod";
import mysql from "mysql2/promise";

// SQL Database Query tool
export const sqlQueryTool = tool({
  description: "Execute SQL queries on the ap_autopart database, specifically on the iLines table. Use this to retrieve data about auto parts.",
  parameters: z.object({
    query: z.string().describe("The SQL query to execute (SELECT statements only for security). Should query the iLines table in ap_autopart database."),
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

        return {
          success: true,
          query: query,
          results: rows,
          rowCount: Array.isArray(rows) ? rows.length : 0,
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