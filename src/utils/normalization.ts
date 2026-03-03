import type { Invoice, Order, Purchase, Contract, Action, Alert, Absence } from '../types/boond.js';

// Debug mode flag - enable with BOOND_DEBUG_FIELDS=true
const DEBUG_FIELDS = process.env['BOOND_DEBUG_FIELDS'] === 'true';

export interface NormalizedFields {
  status?: string;
  companyId?: string;
  total?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  name?: string;
  email?: string;
  resourceId?: string;
  projectId?: string;
}

export function readString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

export function readNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

export function readBoolean(record: Record<string, unknown>, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
}

export function pickStatus(record: Record<string, unknown>): string {
  const candidates = ['status', 'state', 'workflowStatus', 'validationStatus', 'activity'];
  for (const key of candidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'active' : 'inactive';
    }
  }
  return 'unknown';
}

export function pickCompanyId(record: Record<string, unknown>): string {
  const candidates = ['companyId', 'clientId', 'customerId', 'accountId', 'dependsOnId'];
  for (const key of candidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return 'unknown';
}

export function pickTotal(record: Record<string, unknown>): string {
  const candidates = [
    'total',
    'amount',
    'totalAmount',
    'sum',
    'amountWithoutTaxes',
    'amountExcludingTax',
    'netAmount',
  ];
  const value = readNumber(record, candidates);
  return value !== undefined ? String(value) : 'unknown';
}

export function pickType(record: Record<string, unknown>): string {
  const candidates = ['type', 'contractType', 'typeLabel', 'kind', 'category'];
  for (const key of candidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return 'unknown';
}

export function pickResourceId(record: Record<string, unknown>): string {
  const candidates = ['resourceId', 'dependsOnId', 'consultantId'];
  for (const key of candidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return 'unknown';
}

export function pickProjectId(record: Record<string, unknown>): string {
  const candidates = ['projectId', 'missionId', 'assignmentId'];
  for (const key of candidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return 'unknown';
}

export function pickName(record: Record<string, unknown>): string {
  const candidates = [
    'name',
    'title',
    'reference',
    'label',
    'projectName',
    'projectTitle',
    'fullName',
  ];
  for (const key of candidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return '';
}

export function pickEmail(record: Record<string, unknown>): string {
  const candidates = ['email', 'email1', 'email_1', 'mail', 'primaryEmail'];
  for (const key of candidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  const emails = record['emails'];
  if (Array.isArray(emails)) {
    const first = emails.find((e): e is string => typeof e === 'string' && e.trim().length > 0);
    if (first) return first;
  }

  if (emails && typeof emails === 'object') {
    const values = Object.values(emails as Record<string, unknown>);
    const first = values.find((v): v is string => typeof v === 'string' && v.trim().length > 0);
    if (first) return first;
  }

  return 'not available';
}

export function pickDate(record: Record<string, unknown>, keys: string[]): string {
  const value = readString(record, keys);
  if (!value) return 'unknown';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
}

export function normalizeFinanceEntity<T extends Invoice | Order | Purchase>(
  entity: T
): T & { _normalized: NormalizedFields } {
  const record = entity as unknown as Record<string, unknown>;

  return {
    ...entity,
    _normalized: {
      status: pickStatus(record),
      companyId: pickCompanyId(record),
      total: pickTotal(record),
    },
  };
}

export function normalizeContract(
  contract: Contract
): Contract & { _normalized: NormalizedFields } {
  const record = contract as unknown as Record<string, unknown>;

  return {
    ...contract,
    _normalized: {
      resourceId: pickResourceId(record),
      type: pickType(record),
      status: pickStatus(record),
      startDate: pickDate(record, ['startDate', 'startsAt', 'start']),
    },
  };
}

export function normalizeAction(action: Action): Action & { _normalized: NormalizedFields } {
  const record = action as unknown as Record<string, unknown>;

  return {
    ...action,
    _normalized: {
      name: pickName(record) || `Action #${action.id}`,
      status: pickStatus(record),
    },
  };
}

export function normalizeAlert(alert: Alert): Alert & { _normalized: NormalizedFields } {
  const record = alert as unknown as Record<string, unknown>;

  const typeCandidates = ['type', 'kind', 'category', 'state'];
  const severityCandidates = ['severity', 'level', 'priority', 'importance'];
  const messageCandidates = ['message', 'title', 'text', 'body', 'description'];

  let type = 'info';
  for (const key of typeCandidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      type = value;
      break;
    }
  }

  let severity = 'unknown';
  for (const key of severityCandidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      severity = value;
      break;
    }
  }

  let message = `Alert #${alert.id}`;
  for (const key of messageCandidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      message = value;
      break;
    }
  }

  return {
    ...alert,
    _normalized: {
      type,
      status: severity,
      name: message,
    },
  };
}

export function normalizeAbsence(absence: Absence): Absence & { _normalized: NormalizedFields } {
  const record = absence as unknown as Record<string, unknown>;

  return {
    ...absence,
    _normalized: {
      resourceId: pickResourceId(record),
      type: pickType(record),
      status: pickStatus(record),
      startDate: pickDate(record, ['startDate', 'startsAt', 'fromDate', 'from']),
      endDate: pickDate(record, ['endDate', 'endsAt', 'toDate', 'to']),
    },
  };
}

export function isFieldUnknown(value: string | undefined): boolean {
  return !value || value === 'unknown' || value === 'undefined';
}

export function formatUnknown(
  label: string,
  value: string | undefined,
  strictMode = false
): string {
  if (!isFieldUnknown(value)) {
    return `${label}: ${value}`;
  }

  if (strictMode) {
    return `${label}: [missing_from_api]`;
  }

  if (DEBUG_FIELDS) {
    return `${label}: unknown [debug: no valid candidates found]`;
  }

  return `${label}: unknown`;
}

export function formatUnknownWithDebug(
  fieldName: string,
  candidates: unknown[],
  fallback: string = 'unknown'
): string {
  if (!DEBUG_FIELDS) return fallback;
  const candidateInfo = candidates.map((c, i) => `[${i}]: ${JSON.stringify(c)}`).join(', ');
  return `${fallback} [${fieldName}: ${candidateInfo}]`;
}
