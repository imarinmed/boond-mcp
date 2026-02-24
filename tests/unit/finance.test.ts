import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from '../mocks/mock-api-client.js';

describe('Finance Domain Tools', () => {
  beforeEach(() => {
    mockClient.reset();
  });

  describe('Invoices', () => {
    it('should search invoices', async () => {
      const result = await mockClient.searchInvoices({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].status).toBeDefined();
    });

    it('should search invoices with query', async () => {
      const result = await mockClient.searchInvoices({ query: 'Q1' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get invoice by id', async () => {
      const result = await mockClient.getInvoice('inv-123');
      expect(result.id).toBe('inv-123');
      expect(result.total).toBeDefined();
    });

    it('should create invoice', async () => {
      const data = {
        companyId: 'comp-123',
        total: 5000,
        issuedAt: new Date().toISOString(),
      };
      const result = await mockClient.createInvoice(data);
      expect(result.total).toBe(5000);
    });

    it('should update invoice', async () => {
      const data = { description: 'Updated description' };
      const result = await mockClient.updateInvoice('inv-123', data);
      expect(result.description).toBe('Updated description');
    });

    it('should delete invoice', async () => {
      await mockClient.deleteInvoice('inv-123');
      expect(mockClient.calls[0].method).toBe('deleteInvoice');
    });

    it('should pay invoice', async () => {
      const result = await mockClient.payInvoice('inv-123');
      expect(result.status).toBe('paid');
      expect(result.paidAt).toBeDefined();
    });
  });

  describe('Purchases', () => {
    it('should search purchases', async () => {
      const result = await mockClient.searchPurchases({});
      expect(result.data).toHaveLength(5);
    });

    it('should get purchase by id', async () => {
      const result = await mockClient.getPurchase('purchase-123');
      expect(result.id).toBe('purchase-123');
    });

    it('should create purchase', async () => {
      const data = {
        companyId: 'comp-123',
        total: 1000,
        orderedAt: new Date().toISOString(),
      };
      const result = await mockClient.createPurchase(data);
      expect(result.total).toBe(1000);
    });

    it('should update purchase', async () => {
      const data = { status: 'invoiced' as const };
      const result = await mockClient.updatePurchase('purchase-123', data);
      expect(result.status).toBe('invoiced');
    });

    it('should delete purchase', async () => {
      await mockClient.deletePurchase('purchase-123');
      expect(mockClient.calls[0].method).toBe('deletePurchase');
    });
  });

  describe('Orders', () => {
    it('should search orders', async () => {
      const result = await mockClient.searchOrders({});
      expect(result.data).toHaveLength(5);
    });

    it('should get order by id', async () => {
      const result = await mockClient.getOrder('order-123');
      expect(result.id).toBe('order-123');
    });

    it('should create order', async () => {
      const data = {
        companyId: 'comp-123',
        total: 2500,
      };
      const result = await mockClient.createOrder(data);
      expect(result.total).toBe(2500);
    });

    it('should update order', async () => {
      const data = { status: 'shipped' as const };
      const result = await mockClient.updateOrder('order-123', data);
      expect(result.status).toBe('shipped');
    });

    it('should delete order', async () => {
      await mockClient.deleteOrder('order-123');
      expect(mockClient.calls[0].method).toBe('deleteOrder');
    });
  });

  describe('Banking', () => {
    it('should search banking accounts', async () => {
      const result = await mockClient.searchBankingAccounts();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].balance).toBeDefined();
    });

    it('should create banking transaction', async () => {
      const data = {
        accountId: 'acc-123',
        amount: 500,
        type: 'credit' as const,
        date: new Date().toISOString(),
        description: 'Test transaction',
      };
      const result = await mockClient.createBankingTransaction(data);
      expect(result.amount).toBe(500);
      expect(result.id).toBeDefined();
    });
  });
});
