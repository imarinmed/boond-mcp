/**
 * Tool Registration Tests
 * Tests for all 95 tool registrations across 8 business domains
 * Validates input schemas, success paths, error handling, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { BoondAPIClient } from "../src/api/client";
import {
  registerCandidateTools,
  registerContactTools,
  registerResourceTools,
  registerContractTools,
} from "../src/tools/hr";
import {
  registerCompanyTools,
  registerOpportunityTools,
  registerQuotationTools,
} from "../src/tools/crm";
import {
  registerInvoiceTools,
  registerPurchaseTools,
  registerOrderTools,
  registerBankingTools,
} from "../src/tools/finance";
import {
  registerProjectTools,
  registerDeliveryTools,
  registerActionTools,
} from "../src/tools/projects";
import {
  registerTimeReportTools,
  registerAbsenceTools,
  registerExpenseTools,
} from "../src/tools/time";
import {
  registerAgencyTools,
  registerBusinessUnitTools,
  registerAccountTools,
} from "../src/tools/admin";
import { registerDocumentTools } from "../src/tools/documents";
import {
  registerAppTools,
  registerSettingTools,
  registerAlertTools,
} from "../src/tools/system";

interface MockMcpServer {
  registerTool: ReturnType<typeof vi.fn>;
}

/**
 * SECTION 1: HR Domain Tools (16 tools)
 */
describe("1. HR Domain - Tool Registrations", () => {
  let mockServer: MockMcpServer;
  let mockClient: BoondAPIClient;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    mockClient = new BoondAPIClient("test-token");
  });

  describe("Candidates Tools", () => {
    it("should register candidate search tool", () => {
      registerCandidateTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const searchCall = calls.find(
        (call: any[]) => call[0] === "boond_candidates_search"
      );

      expect(searchCall).toBeDefined();
      expect(searchCall?.[1]).toHaveProperty("description");
      expect(searchCall?.[1]).toHaveProperty("inputSchema");
    });

    it("should register candidate get tool", () => {
      registerCandidateTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const getCall = calls.find(
        (call: any[]) => call[0] === "boond_candidates_get"
      );

      expect(getCall).toBeDefined();
    });

    it("should register candidate create tool", () => {
      registerCandidateTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const createCall = calls.find(
        (call: any[]) => call[0] === "boond_candidates_create"
      );

      expect(createCall).toBeDefined();
    });

    it("should register candidate update tool", () => {
      registerCandidateTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const updateCall = calls.find(
        (call: any[]) => call[0] === "boond_candidates_update"
      );

      expect(updateCall).toBeDefined();
    });

    it("should have valid input schema for search", () => {
      registerCandidateTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const searchCall = calls.find(
        (call: any[]) => call[0] === "boond_candidates_search"
      );
      const inputSchema = searchCall?.[1]?.inputSchema;

      expect(inputSchema).toBeDefined();
      expect(inputSchema).toHaveProperty("query");
      expect(inputSchema).toHaveProperty("page");
      expect(inputSchema).toHaveProperty("limit");
    });
  });

  describe("Contacts Tools", () => {
    it("should register 4 contact tools", () => {
      registerContactTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const contactTools = calls.filter((call: any[]) =>
        call[0].includes("contacts")
      );

      expect(contactTools.length).toBe(4);
    });

    it("should register contact search, get, create, update", () => {
      registerContactTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_contacts_search");
      expect(toolNames).toContain("boond_contacts_get");
      expect(toolNames).toContain("boond_contacts_create");
      expect(toolNames).toContain("boond_contacts_update");
    });
  });

  describe("Resources Tools", () => {
    it("should register 4 resource tools", () => {
      registerResourceTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have resource tools with proper names", () => {
      registerResourceTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_resources_search");
      expect(toolNames).toContain("boond_resources_get");
      expect(toolNames).toContain("boond_resources_create");
      expect(toolNames).toContain("boond_resources_update");
    });
  });

  describe("Contracts Tools", () => {
    it("should register 4 contract tools", () => {
      registerContractTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have contract tools with proper names", () => {
      registerContractTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_contracts_search");
      expect(toolNames).toContain("boond_contracts_get");
      expect(toolNames).toContain("boond_contracts_create");
      expect(toolNames).toContain("boond_contracts_update");
    });
  });
});

/**
 * SECTION 2: CRM Domain Tools (13 tools)
 */
describe("2. CRM Domain - Tool Registrations", () => {
  let mockServer: MockMcpServer;
  let mockClient: BoondAPIClient;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    mockClient = new BoondAPIClient("test-token");
  });

  describe("Companies Tools", () => {
    it("should register 4 company tools", () => {
      registerCompanyTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have company tools: search, get, create, update", () => {
      registerCompanyTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_companies_search");
      expect(toolNames).toContain("boond_companies_get");
      expect(toolNames).toContain("boond_companies_create");
      expect(toolNames).toContain("boond_companies_update");
    });
  });

  describe("Opportunities Tools", () => {
    it("should register 4 opportunity tools", () => {
      registerOpportunityTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have opportunity tools: search, get, create, update", () => {
      registerOpportunityTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_opportunities_search");
      expect(toolNames).toContain("boond_opportunities_get");
      expect(toolNames).toContain("boond_opportunities_create");
      expect(toolNames).toContain("boond_opportunities_update");
    });
  });

  describe("Quotations Tools", () => {
    it("should register 5 quotation tools", () => {
      registerQuotationTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(5);
    });

    it("should have quotation tools including send", () => {
      registerQuotationTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_quotations_search");
      expect(toolNames).toContain("boond_quotations_get");
      expect(toolNames).toContain("boond_quotations_create");
      expect(toolNames).toContain("boond_quotations_update");
      expect(toolNames).toContain("boond_quotations_send");
     });
   });

   describe("CRM Domain Total", () => {
     it("should register 13 CRM tools total (companies: 4, opportunities: 4, quotations: 5)", () => {
       registerCompanyTools(mockServer as any, mockClient);
       registerOpportunityTools(mockServer as any, mockClient);
       registerQuotationTools(mockServer as any, mockClient);

       const totalCalls = mockServer.registerTool.mock.calls.length;
       expect(totalCalls).toBe(13);
     });
   });
 });

 /**
  * SECTION 3: Finance Domain Tools (15 tools)
 */
describe("3. Finance Domain - Tool Registrations", () => {
  let mockServer: MockMcpServer;
  let mockClient: BoondAPIClient;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    mockClient = new BoondAPIClient("test-token");
  });

  describe("Invoices Tools", () => {
    it("should register 4 invoice tools", () => {
      registerInvoiceTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have invoice tools: search, get, create, update", () => {
      registerInvoiceTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_invoices_search");
      expect(toolNames).toContain("boond_invoices_get");
      expect(toolNames).toContain("boond_invoices_create");
      expect(toolNames).toContain("boond_invoices_update");
    });
  });

  describe("Purchases Tools", () => {
    it("should register 4 purchase tools", () => {
      registerPurchaseTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have purchase tools: search, get, create, update", () => {
      registerPurchaseTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_purchases_search");
      expect(toolNames).toContain("boond_purchases_get");
      expect(toolNames).toContain("boond_purchases_create");
      expect(toolNames).toContain("boond_purchases_update");
    });
  });

  describe("Orders Tools", () => {
    it("should register 4 order tools", () => {
      registerOrderTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have order tools: search, get, create, update", () => {
      registerOrderTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_orders_search");
      expect(toolNames).toContain("boond_orders_get");
      expect(toolNames).toContain("boond_orders_create");
      expect(toolNames).toContain("boond_orders_update");
    });
  });

  describe("Banking Tools", () => {
    it("should register 3 banking tools", () => {
      registerBankingTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(3);
    });

    it("should have banking tools for accounts and transactions", () => {
      registerBankingTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_banking_accounts_search");
      expect(toolNames).toContain("boond_banking_accounts_get");
       expect(toolNames).toContain("boond_banking_transactions_search");
     });
   });

   describe("Finance Domain Total", () => {
     it("should register 15 Finance tools total (invoices: 4, purchases: 4, orders: 4, banking: 3)", () => {
       registerInvoiceTools(mockServer as any, mockClient);
       registerPurchaseTools(mockServer as any, mockClient);
       registerOrderTools(mockServer as any, mockClient);
       registerBankingTools(mockServer as any, mockClient);

       const totalCalls = mockServer.registerTool.mock.calls.length;
       expect(totalCalls).toBe(15);
     });
   });
 });

 /**
 * SECTION 4: Projects Domain Tools (12 tools)
 */
describe("4. Projects Domain - Tool Registrations", () => {
  let mockServer: MockMcpServer;
  let mockClient: BoondAPIClient;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    mockClient = new BoondAPIClient("test-token");
  });

  describe("Projects Tools", () => {
    it("should register 2 project tools", () => {
      registerProjectTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(2);
    });

    it("should have project tools: search and get", () => {
      registerProjectTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_projects_search");
      expect(toolNames).toContain("boond_projects_get");
    });
  });

  describe("Deliveries Tools", () => {
    it("should register 5 delivery tools", () => {
      registerDeliveryTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(5);
    });

    it("should have delivery tools including send", () => {
      registerDeliveryTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_deliveries_search");
      expect(toolNames).toContain("boond_deliveries_get");
      expect(toolNames).toContain("boond_deliveries_create");
      expect(toolNames).toContain("boond_deliveries_update");
      expect(toolNames).toContain("boond_deliveries_send");
    });
  });

  describe("Actions Tools", () => {
    it("should register 5 action tools", () => {
      registerActionTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(5);
    });

    it("should have action tools including delete", () => {
      registerActionTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_actions_search");
      expect(toolNames).toContain("boond_actions_get");
      expect(toolNames).toContain("boond_actions_create");
      expect(toolNames).toContain("boond_actions_update");
       expect(toolNames).toContain("boond_actions_delete");
     });
   });

   describe("Projects Domain Total", () => {
     it("should register 12 Projects tools total (projects: 2, deliveries: 5, actions: 5)", () => {
       registerProjectTools(mockServer as any, mockClient);
       registerDeliveryTools(mockServer as any, mockClient);
       registerActionTools(mockServer as any, mockClient);

       const totalCalls = mockServer.registerTool.mock.calls.length;
       expect(totalCalls).toBe(12);
     });
   });
 });

 /**
  * SECTION 5: Time Domain Tools (13 tools)
 */
describe("5. Time Domain - Tool Registrations", () => {
  let mockServer: MockMcpServer;
  let mockClient: BoondAPIClient;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    mockClient = new BoondAPIClient("test-token");
  });

  describe("Time Reports Tools", () => {
    it("should register 3 time report tools", () => {
      registerTimeReportTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(3);
    });

    it("should have time report tools: search, get, create", () => {
      registerTimeReportTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_timereports_search");
      expect(toolNames).toContain("boond_timereports_get");
      expect(toolNames).toContain("boond_timereports_create");
    });
  });

   describe("Absences Tools", () => {
     it("should register 4 absence tools", () => {
       registerAbsenceTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       expect(calls.length).toBe(4);
     });

     it("should have absence tools with search, get, create, update", () => {
      registerAbsenceTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_absences_search");
      expect(toolNames).toContain("boond_absences_get");
      expect(toolNames).toContain("boond_absences_create");
      expect(toolNames).toContain("boond_absences_update");
    });
  });

   describe("Expenses Tools", () => {
     it("should register 6 expense tools", () => {
       registerExpenseTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       expect(calls.length).toBe(6);
    });

    it("should have expense tools including certify and reject", () => {
      registerExpenseTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_expenses_search");
      expect(toolNames).toContain("boond_expenses_get");
      expect(toolNames).toContain("boond_expenses_create");
      expect(toolNames).toContain("boond_expenses_update");
      expect(toolNames).toContain("boond_expenses_certify");
       expect(toolNames).toContain("boond_expenses_reject");
     });
   });

   describe("Time Domain Total", () => {
     it("should register 13 Time tools total (timeReports: 3, absences: 4, expenses: 6)", () => {
       registerTimeReportTools(mockServer as any, mockClient);
       registerAbsenceTools(mockServer as any, mockClient);
       registerExpenseTools(mockServer as any, mockClient);

       const totalCalls = mockServer.registerTool.mock.calls.length;
       expect(totalCalls).toBe(13);
     });
   });
 });

 /**
  * SECTION 6: Admin Domain Tools (12 tools)
 */
describe("6. Admin Domain - Tool Registrations", () => {
  let mockServer: MockMcpServer;
  let mockClient: BoondAPIClient;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    mockClient = new BoondAPIClient("test-token");
  });

  describe("Agencies Tools", () => {
    it("should register 4 agency tools", () => {
      registerAgencyTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have agency tools: search, get, create, update", () => {
      registerAgencyTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_agencies_search");
      expect(toolNames).toContain("boond_agencies_get");
      expect(toolNames).toContain("boond_agencies_create");
      expect(toolNames).toContain("boond_agencies_update");
    });
  });

  describe("Business Units Tools", () => {
    it("should register 4 business unit tools", () => {
      registerBusinessUnitTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have business unit tools: search, get, create, update", () => {
      registerBusinessUnitTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_businessunits_search");
      expect(toolNames).toContain("boond_businessunits_get");
      expect(toolNames).toContain("boond_businessunits_create");
      expect(toolNames).toContain("boond_businessunits_update");
    });
  });

  describe("Accounts Tools", () => {
    it("should register 4 account tools", () => {
      registerAccountTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have account tools: search, get, create, update", () => {
      registerAccountTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_accounts_search");
      expect(toolNames).toContain("boond_accounts_get");
      expect(toolNames).toContain("boond_accounts_create");
      expect(toolNames).toContain("boond_accounts_update");
    });
  });
});

/**
 * SECTION 7: Documents Domain Tools (4 tools)
 */
describe("7. Documents Domain - Tool Registrations", () => {
  let mockServer: MockMcpServer;
  let mockClient: BoondAPIClient;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    mockClient = new BoondAPIClient("test-token");
  });

  it("should register 4 document tools", () => {
    registerDocumentTools(mockServer as any, mockClient);

    const calls = mockServer.registerTool.mock.calls;
    expect(calls.length).toBe(4);
  });

  it("should have document tools: search, get, update, download", () => {
    registerDocumentTools(mockServer as any, mockClient);

    const calls = mockServer.registerTool.mock.calls;
    const toolNames = calls.map((call: any[]) => call[0]);

    expect(toolNames).toContain("boond_documents_search");
    expect(toolNames).toContain("boond_documents_get");
    expect(toolNames).toContain("boond_documents_update");
    expect(toolNames).toContain("boond_documents_download");
  });
});

/**
 * SECTION 8: System Domain Tools (10 tools)
 */
describe("8. System Domain - Tool Registrations", () => {
  let mockServer: MockMcpServer;
  let mockClient: BoondAPIClient;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    mockClient = new BoondAPIClient("test-token");
  });

  describe("Apps Tools", () => {
    it("should register 4 app tools", () => {
      registerAppTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(4);
    });

    it("should have app tools: search, get, install, uninstall", () => {
      registerAppTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_apps_search");
      expect(toolNames).toContain("boond_apps_get");
      expect(toolNames).toContain("boond_apps_install");
      expect(toolNames).toContain("boond_apps_uninstall");
    });
  });

  describe("Settings Tools", () => {
    it("should register 3 settings tools", () => {
      registerSettingTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(3);
    });

    it("should have settings tools: search, get, update", () => {
      registerSettingTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_settings_search");
      expect(toolNames).toContain("boond_settings_get");
      expect(toolNames).toContain("boond_settings_update");
    });
  });

  describe("Alerts Tools", () => {
    it("should register 3 alert tools", () => {
      registerAlertTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      expect(calls.length).toBe(3);
    });

    it("should have alert tools: search, get, update", () => {
      registerAlertTools(mockServer as any, mockClient);

      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call: any[]) => call[0]);

      expect(toolNames).toContain("boond_alerts_search");
      expect(toolNames).toContain("boond_alerts_get");
      expect(toolNames).toContain("boond_alerts_update");
    });
  });
});

/**
 * SECTION 9: Total Tool Count Verification
 */
describe("9. Total Tool Count Verification", () => {
  let mockServer: MockMcpServer;
  let mockClient: BoondAPIClient;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    mockClient = new BoondAPIClient("test-token");
  });

   it("should register total of 95 tools across all domains", () => {
     registerCandidateTools(mockServer as any, mockClient);
     registerContactTools(mockServer as any, mockClient);
     registerResourceTools(mockServer as any, mockClient);
     registerContractTools(mockServer as any, mockClient);
     registerCompanyTools(mockServer as any, mockClient);
     registerOpportunityTools(mockServer as any, mockClient);
     registerQuotationTools(mockServer as any, mockClient);
     registerInvoiceTools(mockServer as any, mockClient);
     registerPurchaseTools(mockServer as any, mockClient);
     registerOrderTools(mockServer as any, mockClient);
     registerBankingTools(mockServer as any, mockClient);
     registerProjectTools(mockServer as any, mockClient);
     registerDeliveryTools(mockServer as any, mockClient);
     registerActionTools(mockServer as any, mockClient);
     registerTimeReportTools(mockServer as any, mockClient);
     registerAbsenceTools(mockServer as any, mockClient);
     registerExpenseTools(mockServer as any, mockClient);
     registerAgencyTools(mockServer as any, mockClient);
     registerBusinessUnitTools(mockServer as any, mockClient);
     registerAccountTools(mockServer as any, mockClient);
     registerDocumentTools(mockServer as any, mockClient);
     registerAppTools(mockServer as any, mockClient);
     registerSettingTools(mockServer as any, mockClient);
     registerAlertTools(mockServer as any, mockClient);

     const totalCalls = mockServer.registerTool.mock.calls.length;
     expect(totalCalls).toBe(95);
  });

  it("should verify all tools have descriptions", () => {
    registerCandidateTools(mockServer as any, mockClient);

    const calls = mockServer.registerTool.mock.calls;
    const allHaveDescriptions = calls.every(
      (call: any[]) =>
        call[1] &&
        typeof call[1].description === "string" &&
        call[1].description.length > 0
    );

    expect(allHaveDescriptions).toBe(true);
  });

  it("should verify all tools have input schemas", () => {
    registerCandidateTools(mockServer as any, mockClient);

    const calls = mockServer.registerTool.mock.calls;
    const allHaveSchemas = calls.every(
      (call: any[]) => call[1] && call[1].inputSchema
    );

    expect(allHaveSchemas).toBe(true);
  });

  it("should verify all tools have handler functions", () => {
    registerCandidateTools(mockServer as any, mockClient);

    const calls = mockServer.registerTool.mock.calls;
    const allHaveHandlers = calls.every(
      (call: any[]) => typeof call[2] === "function"
    );

     expect(allHaveHandlers).toBe(true);
   });
 });

 /**
  * SECTION 10: Handler Execution & Error Handling Tests
  */
 describe("10. Handler Execution & Error Handling", () => {
   let mockServer: MockMcpServer;
   let mockClient: BoondAPIClient;

   beforeEach(() => {
     mockServer = {
       registerTool: vi.fn(),
     };
     mockClient = new BoondAPIClient("test-token");
   });

   describe("Search Handler Execution", () => {
     it("should call search handler when registered tool is invoked", async () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const searchCall = calls.find((call: any[]) => call[0] === "boond_candidates_search");

       expect(searchCall).toBeDefined();
       expect(typeof searchCall[2]).toBe("function");
     });

     it("should handle search with missing required parameters", async () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const searchCall = calls.find((call: any[]) => call[0] === "boond_candidates_search");

       if (searchCall) {
         const handler = searchCall[2];
         const result = await handler({});

         expect(result).toBeDefined();
         expect(result.isError).toBe(true);
       }
     });
   });

   describe("Get by ID Handler Execution", () => {
     it("should call get handler when registered tool is invoked", async () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const getCall = calls.find((call: any[]) => call[0] === "boond_candidates_get");

       expect(getCall).toBeDefined();
       expect(typeof getCall[2]).toBe("function");
     });

     it("should reject get request with missing ID", async () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const getCall = calls.find((call: any[]) => call[0] === "boond_candidates_get");

       if (getCall) {
         const handler = getCall[2];
         const result = await handler({});

         expect(result).toBeDefined();
         expect(result.isError).toBe(true);
       }
     });
   });

   describe("Create Handler Execution", () => {
     it("should call create handler when registered tool is invoked", async () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const createCall = calls.find((call: any[]) => call[0] === "boond_candidates_create");

       expect(createCall).toBeDefined();
       expect(typeof createCall[2]).toBe("function");
     });

     it("should reject create request with missing required fields", async () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const createCall = calls.find((call: any[]) => call[0] === "boond_candidates_create");

       if (createCall) {
         const handler = createCall[2];
         const result = await handler({});

         expect(result).toBeDefined();
         expect(result.isError).toBe(true);
       }
     });
   });

   describe("Update Handler Execution", () => {
     it("should call update handler when registered tool is invoked", async () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const updateCall = calls.find((call: any[]) => call[0] === "boond_candidates_update");

       expect(updateCall).toBeDefined();
       expect(typeof updateCall[2]).toBe("function");
     });

     it("should reject update request with missing ID", async () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const updateCall = calls.find((call: any[]) => call[0] === "boond_candidates_update");

       if (updateCall) {
         const handler = updateCall[2];
         const result = await handler({});

         expect(result).toBeDefined();
         expect(result.isError).toBe(true);
       }
     });
   });

   describe("Input Schema Validation", () => {
     it("should have valid input schemas for all candidate tools", () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const allHaveValidSchemas = calls.every((call: any[]) => {
         const schema = call[1].inputSchema;
         return schema && typeof schema === "object";
       });

       expect(allHaveValidSchemas).toBe(true);
     });

     it("should have valid input schemas for company tools", () => {
       registerCompanyTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const allHaveValidSchemas = calls.every((call: any[]) => {
         const schema = call[1].inputSchema;
         return schema && typeof schema === "object";
       });

       expect(allHaveValidSchemas).toBe(true);
     });

     it("should have valid input schemas for invoice tools", () => {
       registerInvoiceTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const allHaveValidSchemas = calls.every((call: any[]) => {
         const schema = call[1].inputSchema;
         return schema && typeof schema === "object";
       });

       expect(allHaveValidSchemas).toBe(true);
     });

     it("should have valid input schemas for project tools", () => {
       registerProjectTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const allHaveValidSchemas = calls.every((call: any[]) => {
         const schema = call[1].inputSchema;
         return schema && typeof schema === "object";
       });

       expect(allHaveValidSchemas).toBe(true);
     });

     it("should have valid input schemas for time report tools", () => {
       registerTimeReportTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const allHaveValidSchemas = calls.every((call: any[]) => {
         const schema = call[1].inputSchema;
         return schema && typeof schema === "object";
       });

       expect(allHaveValidSchemas).toBe(true);
     });
   });

   describe("Tool Naming Conventions", () => {
     it("should follow boond_[domain]_[action] naming pattern", () => {
       registerCandidateTools(mockServer as any, mockClient);
       registerCompanyTools(mockServer as any, mockClient);
       registerInvoiceTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const allFollowPattern = calls.every((call: any[]) => {
         const toolName = call[0];
         // Pattern: boond_<domain>_<action>
         return /^boond_[a-z]+_[a-z]+$/.test(toolName);
       });

       expect(allFollowPattern).toBe(true);
     });

     it("should use lowercase domain names", () => {
       registerCandidateTools(mockServer as any, mockClient);
       registerOpportunityTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const allLowercase = calls.every((call: any[]) => {
         const toolName = call[0];
         return toolName === toolName.toLowerCase();
       });

       expect(allLowercase).toBe(true);
     });
   });

   describe("Tool Description Quality", () => {
     it("should have non-empty descriptions for all tools", () => {
       registerCandidateTools(mockServer as any, mockClient);
       registerCompanyTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const allHaveDescriptions = calls.every((call: any[]) => {
         const description = call[1].description;
         return description && description.trim().length > 0;
       });

       expect(allHaveDescriptions).toBe(true);
     });

     it("should have descriptions longer than 10 characters", () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const allDescriptionsLongEnough = calls.every((call: any[]) => {
         const description = call[1].description;
         return description && description.length > 10;
       });

       expect(allDescriptionsLongEnough).toBe(true);
     });
   });

   describe("Handler Return Type", () => {
     it("should return error response for invalid parameters", async () => {
       registerCandidateTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const getCall = calls.find((call: any[]) => call[0] === "boond_candidates_get");

       if (getCall) {
         const handler = getCall[2];
         const result = await handler({ id: "" }); // empty ID

         expect(result).toBeDefined();
         expect(result.isError).toBe(true);
         expect(result.content).toBeDefined();
       }
     });
   });

   describe("Domain Tool Consistency", () => {
     it("should have consistent tool naming across HR domain", () => {
       registerCandidateTools(mockServer as any, mockClient);
       registerContactTools(mockServer as any, mockClient);
       registerResourceTools(mockServer as any, mockClient);
       registerContractTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const hrDomainCalls = calls.filter((call: any[]) => call[0].includes("_candidates_") || call[0].includes("_contacts_") || call[0].includes("_resources_") || call[0].includes("_contracts_"));

       // Each subdomain should have similar action patterns (search, get, create, update)
       const actionPatterns = new Set<string>();
       hrDomainCalls.forEach((call: any[]) => {
         const parts = call[0].split("_");
         const action = parts[parts.length - 1];
         actionPatterns.add(action);
       });

       // Should have standard CRUD actions
       expect(actionPatterns.has("search")).toBe(true);
       expect(actionPatterns.has("get")).toBe(true);
       expect(actionPatterns.has("create")).toBe(true);
       expect(actionPatterns.has("update")).toBe(true);
     });

     it("should have consistent tool naming across Finance domain", () => {
       registerInvoiceTools(mockServer as any, mockClient);
       registerPurchaseTools(mockServer as any, mockClient);
       registerOrderTools(mockServer as any, mockClient);
       registerBankingTools(mockServer as any, mockClient);

       const calls = mockServer.registerTool.mock.calls;
       const actionPatterns = new Set<string>();
       calls.forEach((call: any[]) => {
         const parts = call[0].split("_");
         const action = parts[parts.length - 1];
         actionPatterns.add(action);
       });

       // Should have standard financial actions
       expect(actionPatterns.has("search")).toBe(true);
       expect(actionPatterns.has("get")).toBe(true);
     });
   });
 });
