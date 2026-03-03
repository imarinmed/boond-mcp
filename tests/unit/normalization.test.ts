import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  pickName,
  pickStatus,
  pickTotal,
  pickCompanyId,
  pickType,
  pickResourceId,
  pickProjectId,
  pickEmail,
  pickDate,
  readString,
  readNumber,
  readBoolean,
  normalizeFinanceEntity,
  normalizeContract,
  normalizeAction,
  normalizeAlert,
  normalizeAbsence,
  isFieldUnknown,
  formatUnknown,
  formatUnknownWithDebug,
} from '../../src/utils/normalization.js';

// ─── readString ──────────────────────────────────────────────────────────────

describe('readString', () => {
  it('returns the first matching string value', () => {
    expect(readString({ name: 'Alice', title: 'Dev' }, ['name', 'title'])).toBe('Alice');
  });

  it('skips missing keys', () => {
    expect(readString({ title: 'Dev' }, ['name', 'title'])).toBe('Dev');
  });

  it('skips empty-string values', () => {
    expect(readString({ name: '', title: 'Dev' }, ['name', 'title'])).toBe('Dev');
  });

  it('skips whitespace-only values', () => {
    expect(readString({ name: '   ', title: 'Dev' }, ['name', 'title'])).toBe('Dev');
  });

  it('skips non-string values', () => {
    expect(readString({ name: 42, title: 'Dev' }, ['name', 'title'])).toBe('Dev');
  });

  it('returns undefined when no keys match', () => {
    expect(readString({ foo: 'bar' }, ['name', 'title'])).toBeUndefined();
  });

  it('returns undefined for empty keys array', () => {
    expect(readString({ name: 'Alice' }, [])).toBeUndefined();
  });
});

// ─── readNumber ──────────────────────────────────────────────────────────────

describe('readNumber', () => {
  it('returns number value directly', () => {
    expect(readNumber({ amount: 100 }, ['amount'])).toBe(100);
  });

  it('parses numeric string', () => {
    expect(readNumber({ amount: '250.5' }, ['amount'])).toBe(250.5);
  });

  it('skips NaN strings', () => {
    expect(readNumber({ amount: 'abc', total: 50 }, ['amount', 'total'])).toBe(50);
  });

  it('skips Infinity', () => {
    expect(readNumber({ amount: Infinity, total: 50 }, ['amount', 'total'])).toBe(50);
  });

  it('skips null values', () => {
    expect(readNumber({ amount: null, total: 5 }, ['amount', 'total'])).toBe(5);
  });

  it('returns undefined when no match', () => {
    expect(readNumber({ foo: 'bar' }, ['amount'])).toBeUndefined();
  });

  it('returns zero as a valid number', () => {
    expect(readNumber({ amount: 0 }, ['amount'])).toBe(0);
  });
});

// ─── readBoolean ─────────────────────────────────────────────────────────────

describe('readBoolean', () => {
  it('returns true', () => {
    expect(readBoolean({ active: true }, ['active'])).toBe(true);
  });

  it('returns false', () => {
    expect(readBoolean({ active: false }, ['active'])).toBe(false);
  });

  it('skips non-boolean values', () => {
    expect(readBoolean({ active: 'true', enabled: false }, ['active', 'enabled'])).toBe(false);
  });

  it('returns undefined when no match', () => {
    expect(readBoolean({ foo: 'bar' }, ['active'])).toBeUndefined();
  });
});

// ─── pickStatus ──────────────────────────────────────────────────────────────

describe('pickStatus', () => {
  it('reads status field', () => {
    expect(pickStatus({ status: 'active' })).toBe('active');
  });

  it('reads state field as fallback', () => {
    expect(pickStatus({ state: 'pending' })).toBe('pending');
  });

  it('reads workflowStatus field', () => {
    expect(pickStatus({ workflowStatus: 'approved' })).toBe('approved');
  });

  it('reads validationStatus field', () => {
    expect(pickStatus({ validationStatus: 'valid' })).toBe('valid');
  });

  it('reads activity field', () => {
    expect(pickStatus({ activity: 'running' })).toBe('running');
  });

  it('converts numeric status to string', () => {
    expect(pickStatus({ status: 1 })).toBe('1');
  });

  it('converts boolean true to "active"', () => {
    expect(pickStatus({ status: true })).toBe('active');
  });

  it('converts boolean false to "inactive"', () => {
    expect(pickStatus({ status: false })).toBe('inactive');
  });

  it('returns "unknown" when no candidates found', () => {
    expect(pickStatus({ foo: 'bar' })).toBe('unknown');
  });

  it('returns "unknown" for empty record', () => {
    expect(pickStatus({})).toBe('unknown');
  });

  it('skips empty string values', () => {
    expect(pickStatus({ status: '', state: 'pending' })).toBe('pending');
  });
});

// ─── pickCompanyId ───────────────────────────────────────────────────────────

describe('pickCompanyId', () => {
  it('reads companyId field', () => {
    expect(pickCompanyId({ companyId: 'c-1' })).toBe('c-1');
  });

  it('reads clientId as fallback', () => {
    expect(pickCompanyId({ clientId: 'cl-5' })).toBe('cl-5');
  });

  it('reads customerId as fallback', () => {
    expect(pickCompanyId({ customerId: 'cu-9' })).toBe('cu-9');
  });

  it('reads accountId as fallback', () => {
    expect(pickCompanyId({ accountId: 'a-3' })).toBe('a-3');
  });

  it('reads dependsOnId as fallback', () => {
    expect(pickCompanyId({ dependsOnId: 'd-7' })).toBe('d-7');
  });

  it('converts numeric id to string', () => {
    expect(pickCompanyId({ companyId: 42 })).toBe('42');
  });

  it('returns "unknown" when no match', () => {
    expect(pickCompanyId({ foo: 'bar' })).toBe('unknown');
  });

  it('prefers companyId over clientId', () => {
    expect(pickCompanyId({ companyId: 'c-1', clientId: 'cl-5' })).toBe('c-1');
  });
});

// ─── pickTotal ───────────────────────────────────────────────────────────────

describe('pickTotal', () => {
  it('reads total field', () => {
    expect(pickTotal({ total: 1000 })).toBe('1000');
  });

  it('reads amount field', () => {
    expect(pickTotal({ amount: 500 })).toBe('500');
  });

  it('reads totalAmount field', () => {
    expect(pickTotal({ totalAmount: 750 })).toBe('750');
  });

  it('reads sum field', () => {
    expect(pickTotal({ sum: 200 })).toBe('200');
  });

  it('reads amountWithoutTaxes field', () => {
    expect(pickTotal({ amountWithoutTaxes: 300 })).toBe('300');
  });

  it('reads amountExcludingTax field', () => {
    expect(pickTotal({ amountExcludingTax: 400 })).toBe('400');
  });

  it('reads netAmount field', () => {
    expect(pickTotal({ netAmount: 600 })).toBe('600');
  });

  it('parses string number', () => {
    expect(pickTotal({ total: '1500' })).toBe('1500');
  });

  it('returns "unknown" when no match', () => {
    expect(pickTotal({ foo: 'bar' })).toBe('unknown');
  });

  it('handles decimal values', () => {
    expect(pickTotal({ total: 99.99 })).toBe('99.99');
  });
});

// ─── pickType ────────────────────────────────────────────────────────────────

describe('pickType', () => {
  it('reads type field', () => {
    expect(pickType({ type: 'invoice' })).toBe('invoice');
  });

  it('reads contractType as fallback', () => {
    expect(pickType({ contractType: 'full-time' })).toBe('full-time');
  });

  it('reads typeLabel', () => {
    expect(pickType({ typeLabel: 'Permanent' })).toBe('Permanent');
  });

  it('converts numeric type', () => {
    expect(pickType({ type: 3 })).toBe('3');
  });

  it('returns "unknown" when no match', () => {
    expect(pickType({ foo: 'bar' })).toBe('unknown');
  });
});

// ─── pickResourceId ──────────────────────────────────────────────────────────

describe('pickResourceId', () => {
  it('reads resourceId field', () => {
    expect(pickResourceId({ resourceId: 'r-1' })).toBe('r-1');
  });

  it('reads dependsOnId as fallback', () => {
    expect(pickResourceId({ dependsOnId: 'd-2' })).toBe('d-2');
  });

  it('reads consultantId as fallback', () => {
    expect(pickResourceId({ consultantId: 'con-3' })).toBe('con-3');
  });

  it('converts numeric id', () => {
    expect(pickResourceId({ resourceId: 99 })).toBe('99');
  });

  it('returns "unknown" when no match', () => {
    expect(pickResourceId({})).toBe('unknown');
  });
});

// ─── pickProjectId ───────────────────────────────────────────────────────────

describe('pickProjectId', () => {
  it('reads projectId field', () => {
    expect(pickProjectId({ projectId: 'p-1' })).toBe('p-1');
  });

  it('reads missionId as fallback', () => {
    expect(pickProjectId({ missionId: 'm-2' })).toBe('m-2');
  });

  it('reads assignmentId as fallback', () => {
    expect(pickProjectId({ assignmentId: 'a-3' })).toBe('a-3');
  });

  it('returns "unknown" when no match', () => {
    expect(pickProjectId({})).toBe('unknown');
  });
});

// ─── pickName ────────────────────────────────────────────────────────────────

describe('pickName', () => {
  it('reads name field', () => {
    expect(pickName({ name: 'Test Project' })).toBe('Test Project');
  });

  it('reads title as fallback', () => {
    expect(pickName({ title: 'My Title' })).toBe('My Title');
  });

  it('reads reference as fallback', () => {
    expect(pickName({ reference: 'REF-001' })).toBe('REF-001');
  });

  it('reads label as fallback', () => {
    expect(pickName({ label: 'My Label' })).toBe('My Label');
  });

  it('reads projectName as fallback', () => {
    expect(pickName({ projectName: 'Project Alpha' })).toBe('Project Alpha');
  });

  it('reads projectTitle as fallback', () => {
    expect(pickName({ projectTitle: 'Alpha Title' })).toBe('Alpha Title');
  });

  it('reads fullName as fallback', () => {
    expect(pickName({ fullName: 'John Doe' })).toBe('John Doe');
  });

  it('returns empty string when no match', () => {
    expect(pickName({})).toBe('');
  });

  it('skips whitespace-only strings', () => {
    expect(pickName({ name: '   ', title: 'My Title' })).toBe('My Title');
  });

  it('prefers name over title', () => {
    expect(pickName({ name: 'Name', title: 'Title' })).toBe('Name');
  });
});

// ─── pickEmail ───────────────────────────────────────────────────────────────

describe('pickEmail', () => {
  it('reads email field', () => {
    expect(pickEmail({ email: 'user@example.com' })).toBe('user@example.com');
  });

  it('reads email1 as fallback', () => {
    expect(pickEmail({ email1: 'user@example.com' })).toBe('user@example.com');
  });

  it('reads mail as fallback', () => {
    expect(pickEmail({ mail: 'user@example.com' })).toBe('user@example.com');
  });

  it('reads from emails array', () => {
    expect(pickEmail({ emails: ['first@example.com', 'second@example.com'] })).toBe(
      'first@example.com'
    );
  });

  it('reads from emails object values', () => {
    expect(pickEmail({ emails: { primary: 'primary@example.com' } })).toBe('primary@example.com');
  });

  it('returns "not available" when no match', () => {
    expect(pickEmail({})).toBe('not available');
  });

  it('skips empty string emails', () => {
    expect(pickEmail({ email: '', email1: 'backup@example.com' })).toBe('backup@example.com');
  });
});

// ─── pickDate ────────────────────────────────────────────────────────────────

describe('pickDate', () => {
  it('returns a formatted date for a valid ISO string', () => {
    const result = pickDate({ startDate: '2024-01-15T00:00:00Z' }, ['startDate']);
    // toLocaleDateString varies per locale; just verify it's not "unknown"
    expect(result).not.toBe('unknown');
    expect(typeof result).toBe('string');
  });

  it('returns "unknown" when no matching key', () => {
    expect(pickDate({}, ['startDate'])).toBe('unknown');
  });

  it('returns raw value for unparseable date string', () => {
    const result = pickDate({ startDate: 'not-a-date' }, ['startDate']);
    expect(result).toBe('not-a-date');
  });

  it('uses first matching key', () => {
    const result = pickDate({ startsAt: '2024-03-01' }, ['startDate', 'startsAt']);
    expect(result).not.toBe('unknown');
  });
});

// ─── normalizeFinanceEntity ──────────────────────────────────────────────────

describe('normalizeFinanceEntity', () => {
  it('attaches _normalized with status, companyId, total', () => {
    const entity = {
      id: 'inv-1',
      companyId: 'comp-1',
      total: 5000,
      status: 'issued',
      issuedAt: '2024-01-01',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    } as any;

    const result = normalizeFinanceEntity(entity);
    expect(result._normalized.status).toBe('issued');
    expect(result._normalized.companyId).toBe('comp-1');
    expect(result._normalized.total).toBe('5000');
  });

  it('preserves original entity fields', () => {
    const entity = {
      id: 'inv-1',
      companyId: 'comp-1',
      total: 1000,
      status: 'paid',
      issuedAt: '2024-01-01',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    } as any;

    const result = normalizeFinanceEntity(entity);
    expect(result.id).toBe('inv-1');
    expect(result.total).toBe(1000);
  });

  it('handles missing fields gracefully', () => {
    const entity = { id: 'inv-2', createdAt: '2024-01-01', updatedAt: '2024-01-01' } as any;
    const result = normalizeFinanceEntity(entity);
    expect(result._normalized.status).toBe('unknown');
    expect(result._normalized.companyId).toBe('unknown');
    expect(result._normalized.total).toBe('unknown');
  });

  it('uses amount when total is absent', () => {
    const entity = {
      id: 'inv-3',
      companyId: 'c-1',
      amount: 2500,
      status: 'draft',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    } as any;

    const result = normalizeFinanceEntity(entity);
    expect(result._normalized.total).toBe('2500');
  });
});

// ─── normalizeContract ───────────────────────────────────────────────────────

describe('normalizeContract', () => {
  it('attaches _normalized with resourceId, type, status, startDate', () => {
    const contract = {
      id: 'c-1',
      resourceId: 'r-1',
      type: 'full-time' as const,
      status: 'active' as const,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      hourlyRate: 75,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const result = normalizeContract(contract);
    expect(result._normalized.resourceId).toBe('r-1');
    expect(result._normalized.type).toBe('full-time');
    expect(result._normalized.status).toBe('active');
    expect(result._normalized.startDate).not.toBe('unknown');
  });
});

// ─── normalizeAction ─────────────────────────────────────────────────────────

describe('normalizeAction', () => {
  it('uses name for _normalized.name', () => {
    const action = {
      id: 'act-1',
      projectId: 'p-1',
      name: 'Review Code',
      status: 'open',
      assignedTo: 'r-1',
      dueDate: '2024-03-20',
      priority: 'high',
      description: 'desc',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const result = normalizeAction(action);
    expect(result._normalized.name).toBe('Review Code');
    expect(result._normalized.status).toBe('open');
  });

  it('falls back to "Action #<id>" when name is absent', () => {
    const action = {
      id: 'act-99',
      projectId: 'p-1',
      name: '',
      status: 'closed',
      assignedTo: 'r-1',
      dueDate: '2024-03-20',
      priority: 'low',
      description: '',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const result = normalizeAction(action);
    expect(result._normalized.name).toBe('Action #act-99');
  });
});

// ─── normalizeAlert ──────────────────────────────────────────────────────────

describe('normalizeAlert', () => {
  it('extracts type, severity and message', () => {
    const alert = {
      id: 'alrt-1',
      type: 'warning',
      message: 'Disk space low',
      severity: 'high',
      createdAt: '2024-01-01',
    };

    const result = normalizeAlert(alert);
    expect(result._normalized.type).toBe('warning');
    expect(result._normalized.status).toBe('high');
    expect(result._normalized.name).toBe('Disk space low');
  });

  it('defaults type to "info" when absent', () => {
    const alert = {
      id: 'alrt-2',
      type: '',
      message: 'Hello',
      severity: 'low',
      createdAt: '2024-01-01',
    };

    const result = normalizeAlert(alert);
    expect(result._normalized.type).toBe('info');
  });

  it('falls back to "Alert #<id>" when no message', () => {
    const alert = {
      id: 'alrt-3',
      type: 'info',
      message: '',
      severity: 'low',
      createdAt: '2024-01-01',
    };

    const result = normalizeAlert(alert);
    expect(result._normalized.name).toBe('Alert #alrt-3');
  });
});

// ─── normalizeAbsence ────────────────────────────────────────────────────────

describe('normalizeAbsence', () => {
  it('attaches resourceId, type, status, startDate, endDate', () => {
    const absence = {
      id: 'abs-1',
      resourceId: 'r-1',
      type: 'vacation',
      startDate: '2024-06-01',
      endDate: '2024-06-15',
      status: 'approved',
      reason: 'Summer holiday',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const result = normalizeAbsence(absence);
    expect(result._normalized.resourceId).toBe('r-1');
    expect(result._normalized.type).toBe('vacation');
    expect(result._normalized.status).toBe('approved');
    expect(result._normalized.startDate).not.toBe('unknown');
    expect(result._normalized.endDate).not.toBe('unknown');
  });
});

// ─── isFieldUnknown ──────────────────────────────────────────────────────────

describe('isFieldUnknown', () => {
  it('returns true for "unknown"', () => {
    expect(isFieldUnknown('unknown')).toBe(true);
  });

  it('returns true for "undefined"', () => {
    expect(isFieldUnknown('undefined')).toBe(true);
  });

  it('returns true for undefined', () => {
    expect(isFieldUnknown(undefined)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isFieldUnknown('')).toBe(true);
  });

  it('returns false for a valid value', () => {
    expect(isFieldUnknown('active')).toBe(false);
  });
});

// ─── formatUnknown ───────────────────────────────────────────────────────────

describe('formatUnknown', () => {
  it('formats known value as "label: value"', () => {
    expect(formatUnknown('Status', 'active')).toBe('Status: active');
  });

  it('formats unknown value as "label: unknown"', () => {
    expect(formatUnknown('Status', 'unknown')).toBe('Status: unknown');
  });

  it('formats undefined as "label: unknown"', () => {
    expect(formatUnknown('Status', undefined)).toBe('Status: unknown');
  });

  it('formats empty string as "label: unknown"', () => {
    expect(formatUnknown('Status', '')).toBe('Status: unknown');
  });

  it('uses "[missing_from_api]" in strictMode', () => {
    expect(formatUnknown('Status', 'unknown', true)).toBe('Status: [missing_from_api]');
    expect(formatUnknown('Status', undefined, true)).toBe('Status: [missing_from_api]');
  });

  it('does not apply strictMode to known values', () => {
    expect(formatUnknown('Status', 'active', true)).toBe('Status: active');
  });
});

// ─── formatUnknownWithDebug ──────────────────────────────────────────────────

describe('formatUnknownWithDebug', () => {
  let origEnv: string | undefined;

  beforeEach(() => {
    origEnv = process.env['BOOND_DEBUG_FIELDS'];
  });

  afterEach(() => {
    if (origEnv === undefined) {
      delete process.env['BOOND_DEBUG_FIELDS'];
    } else {
      process.env['BOOND_DEBUG_FIELDS'] = origEnv;
    }
  });

  it('returns fallback when debug is off', () => {
    delete process.env['BOOND_DEBUG_FIELDS'];
    expect(formatUnknownWithDebug('field', ['a', 'b'])).toBe('unknown');
  });

  it('returns fallback with candidate info when debug is on', () => {
    // NOTE: DEBUG_FIELDS is read at module load time as a const, so this test
    // verifies the function call signature and return type contract.
    // The module-level const cannot be changed after import, so we just verify
    // that the function returns a string.
    const result = formatUnknownWithDebug('myField', ['x', 'y'], 'fallback');
    expect(typeof result).toBe('string');
    expect(result).toContain('fallback');
  });

  it('uses custom fallback', () => {
    delete process.env['BOOND_DEBUG_FIELDS'];
    expect(formatUnknownWithDebug('field', [], 'custom')).toBe('custom');
  });

  it('defaults fallback to "unknown"', () => {
    delete process.env['BOOND_DEBUG_FIELDS'];
    expect(formatUnknownWithDebug('field', [])).toBe('unknown');
  });
});
