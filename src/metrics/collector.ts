import { createServer, ServerResponse } from 'http';

interface Counter {
  name: string;
  help: string;
  value: number;
  labels: Record<string, string>;
}

interface Gauge {
  name: string;
  help: string;
  value: number;
  labels: Record<string, string>;
}

interface Histogram {
  name: string;
  help: string;
  buckets: number[];
  values: number[];
  labels: Record<string, string>;
}

/**
 * Prometheus Metrics Collector
 */
export class MetricsCollector {
  private counters: Map<string, Counter> = new Map();
  private gauges: Map<string, Gauge> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private server: ReturnType<typeof createServer> | null = null;
  private port: number;

  constructor(port: number = 9090) {
    this.port = port;
    this.registerDefaultMetrics();
  }

  /**
   * Start metrics HTTP server
   */
  start(): void {
    this.server = createServer((req, res) => {
      if (req.url === '/metrics' && req.method === 'GET') {
        this.handleMetricsRequest(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    this.server.listen(this.port, () => {
      console.log(`Metrics server listening on port ${this.port}`);
    });
  }

  /**
   * Stop metrics server
   */
  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  /**
   * Increment counter
   */
  incrementCounter(name: string, labels: Record<string, string> = {}, value: number = 1): void {
    const key = this.getMetricKey(name, labels);
    const counter = this.counters.get(key);
    
    if (counter) {
      counter.value += value;
    } else {
      this.counters.set(key, {
        name,
        help: this.getHelpText(name),
        value,
        labels,
      });
    }
  }

  /**
   * Set gauge value
   */
  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, {
      name,
      help: this.getHelpText(name),
      value,
      labels,
    });
  }

  /**
   * Observe histogram value
   */
  observeHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    const histogram = this.histograms.get(key);
    
    if (histogram) {
      histogram.values.push(value);
    } else {
      this.histograms.set(key, {
        name,
        help: this.getHelpText(name),
        buckets: [0.1, 0.5, 1, 2.5, 5, 10],
        values: [value],
        labels,
      });
    }
  }

  /**
   * Handle metrics request
   */
  private handleMetricsRequest(res: ServerResponse): void {
    const output: string[] = [];

    // Add counters
    for (const counter of this.counters.values()) {
      output.push(`# HELP ${counter.name} ${counter.help}`);
      output.push(`# TYPE ${counter.name} counter`);
      const labels = this.formatLabels(counter.labels);
      output.push(`${counter.name}${labels} ${counter.value}`);
      output.push('');
    }

    // Add gauges
    for (const gauge of this.gauges.values()) {
      output.push(`# HELP ${gauge.name} ${gauge.help}`);
      output.push(`# TYPE ${gauge.name} gauge`);
      const labels = this.formatLabels(gauge.labels);
      output.push(`${gauge.name}${labels} ${gauge.value}`);
      output.push('');
    }

    // Add histograms
    for (const histogram of this.histograms.values()) {
      output.push(`# HELP ${histogram.name} ${histogram.help}`);
      output.push(`# TYPE ${histogram.name} histogram`);
      
      const labels = this.formatLabels(histogram.labels);
      
      // Output buckets
      for (const bucket of histogram.buckets) {
        const bucketLabels = { ...histogram.labels, le: bucket.toString() };
        const bucketLabelStr = this.formatLabels(bucketLabels);
        const count = histogram.values.filter(v => v <= bucket).length;
        output.push(`${histogram.name}_bucket${bucketLabelStr} ${count}`);
      }
      
      // +Inf bucket
      const infLabels = { ...histogram.labels, le: '+Inf' };
      output.push(`${histogram.name}_bucket${this.formatLabels(infLabels)} ${histogram.values.length}`);
      output.push(`${histogram.name}_sum${labels} ${histogram.values.reduce((a, b) => a + b, 0)}`);
      output.push(`${histogram.name}_count${labels} ${histogram.values.length}`);
      output.push('');
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(output.join('\n'));
  }

  /**
   * Format labels for Prometheus
   */
  private formatLabels(labels: Record<string, string>): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';
    
    const labelStr = entries.map(([k, v]) => `${k}="${v}"`).join(',');
    return `{${labelStr}}`;
  }

  /**
   * Get metric key
   */
  private getMetricKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return labelStr ? `${name}:${labelStr}` : name;
  }

  /**
   * Get help text for metric
   */
  private getHelpText(name: string): string {
    const helpTexts: Record<string, string> = {
      'boond_requests_total': 'Total number of requests',
      'boond_requests_duration_seconds': 'Request duration in seconds',
      'boond_tools_executed_total': 'Total number of tools executed',
      'boond_api_errors_total': 'Total number of API errors',
      'boond_active_connections': 'Number of active connections',
      'boond_tenants_total': 'Total number of tenants',
      'boond_workflows_executed_total': 'Total number of workflows executed',
    };
    return helpTexts[name] || name;
  }

  /**
   * Register default metrics
   */
  private registerDefaultMetrics(): void {
    // Initialize common counters
    this.counters.set('boond_requests_total', {
      name: 'boond_requests_total',
      help: 'Total number of requests',
      value: 0,
      labels: {},
    });
  }
}

// Global metrics collector instance
export const metricsCollector = new MetricsCollector();
