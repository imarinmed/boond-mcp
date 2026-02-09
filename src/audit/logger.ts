import { appendFileSync, existsSync, renameSync } from 'fs';
import type { AuditEvent, AuditFilter } from '../types/audit.js';
import { AuditEventSchema } from '../types/audit.js';

const AUDIT_LOG_PATH = process.env['BOOND_AUDIT_LOG'] || './logs/audit.log';
const MAX_LOG_SIZE = 100 * 1024 * 1024; // 100MB

export class AuditLogger {
  private logPath: string;
  private buffer: AuditEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor(logPath: string = AUDIT_LOG_PATH) {
    this.logPath = logPath;
    this.startAutoFlush();
  }

  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const fullEvent: AuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
    };

    // Validate event
    AuditEventSchema.parse(fullEvent);

    // Add to buffer
    this.buffer.push(fullEvent);

    // Flush if buffer is getting large
    if (this.buffer.length >= 100) {
      this.flush();
    }
  }

  /**
   * Flush buffered events to disk
   */
  flush(): void {
    if (this.buffer.length === 0) return;

    const lines = this.buffer.map(e => JSON.stringify(e)).join('\n') + '\n';
    
    try {
      appendFileSync(this.logPath, lines);
      this.buffer = [];
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Query audit events
   */
  query(_filter: AuditFilter): AuditEvent[] {
    // In a real implementation, this would read from the log file
    // and filter events. For now, return empty array.
    return [];
  }

  /**
   * Rotate log file if it gets too large
   */
  rotateIfNeeded(): void {
    if (!existsSync(this.logPath)) return;

    const stats = require('fs').statSync(this.logPath);
    if (stats.size > MAX_LOG_SIZE) {
      const rotatedPath = `${this.logPath}.${Date.now()}`;
      renameSync(this.logPath, rotatedPath);
    }
  }

  /**
   * Start auto-flush interval
   */
  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Stop auto-flush
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger();
