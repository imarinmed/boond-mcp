/**
 * Contract tools registration
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchParamsSchema,
  createContractSchema,
  contractIdSchema,
  updateContractWithIdSchema,
} from "../../types/schemas.js";
import type { Contract, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";
import { ValidationError } from "../../api/client.js";

/**
 * Format contract list for display
 */
function formatContractList(result: SearchResponse<Contract>): string {
  if (result.data.length === 0) {
    return "No contracts found.";
  }

  const contracts = result.data.map((contract) => {
    const lines: string[] = [];
    lines.push(`📋 Contract ID: ${contract.id}`);
    lines.push(`   Resource: ${contract.resourceId}`);
    lines.push(`   Type: ${contract.type}`);
    lines.push(`   Status: ${contract.status}`);
    lines.push(`   Start Date: ${contract.startDate}`);
    if (contract.endDate) lines.push(`   End Date: ${contract.endDate}`);
    if (contract.hourlyRate) lines.push(`   Hourly Rate: $${contract.hourlyRate}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} contract(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${contracts.join("\n\n")}`;
}

/**
 * Format single contract details
 */
function formatContract(contract: Contract): string {
  const lines: string[] = [];
  lines.push(`📋 Contract: ${contract.id}`);
  lines.push(`Resource ID: ${contract.resourceId}`);
  lines.push(`Type: ${contract.type}`);
  lines.push(`Status: ${contract.status}`);
  lines.push(`Start Date: ${contract.startDate}`);
  if (contract.endDate) lines.push(`End Date: ${contract.endDate}`);
  if (contract.hourlyRate) lines.push(`Hourly Rate: $${contract.hourlyRate}`);
  if (contract.createdAt) lines.push(`Created: ${contract.createdAt}`);
  if (contract.updatedAt) lines.push(`Updated: ${contract.updatedAt}`);

  return lines.join("\n");
}

export function registerContractTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  /**
   * boond_contracts_search - Search contracts
   */
  server.registerTool(
    "boond_contracts_search",
    {
      description: "Search contracts by resource, type, or other criteria",
      inputSchema: searchParamsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchContracts(validated);
        const text = formatContractList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "contracts");
      }
    }
  );

  /**
   * boond_contracts_get - Get contract by ID
   */
  server.registerTool(
    "boond_contracts_get",
    {
      description: "Get a contract by ID",
      inputSchema: contractIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = contractIdSchema.parse(params);
        const contract = await client.getContract(validated.id);
        const text = formatContract(contract);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Contract");
      }
    }
  );

  /**
   * boond_contracts_create - Create new contract
   */
  server.registerTool(
    "boond_contracts_create",
    {
      description: "Create a new contract",
      inputSchema: createContractSchema.shape,
    },
    async (params) => {
      try {
        const validated = createContractSchema.parse(params);
        const contract = await client.createContract(validated);
        const text = formatContract(contract);

        return {
          content: [
            {
              type: "text",
              text: `Contract created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "creating", "Contract");
      }
    }
  );

  /**
   * boond_contracts_update - Update existing contract
   */
  server.registerTool(
    "boond_contracts_update",
    {
      description: "Update an existing contract",
      inputSchema: updateContractWithIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = updateContractWithIdSchema.parse(params);
        const { id, ...updateData } = validated;

        if (!id) {
          throw new ValidationError("Contract ID is required");
        }

        const contract = await client.updateContract(id, updateData);
        const text = formatContract(contract);

        return {
          content: [
            {
              type: "text",
              text: `Contract updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Contract");
      }
    }
  );
}
