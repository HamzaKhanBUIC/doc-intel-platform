/**
 * Enterprise Telemetry, Audit Logs & Metrics Engine
 * Tracks p50/p90/p99 latency percentiles, error rates, throughput counters,
 * and exposes Prometheus-compatible metrics.
 */

export class MetricsLogger {
  constructor() {
    this.counters = {
      documentsIngested: 0,
      documentsAutoApproved: 0,
      documentsReviewRequired: 0,
      documentsRejected: 0,
      erpExports: {
        quickbooks: 0,
        xero: 0,
        netsuite: 0,
        sap: 0,
        csv: 0
      },
      validationErrors: 0,
      duplicateDetected: 0
    };

    this.latencies = [];
    this.auditLogs = [];
  }

  /**
   * Record document processing duration
   * @param {number} durationMs
   */
  recordLatency(durationMs) {
    this.latencies.push(durationMs);
    if (this.latencies.length > 5000) {
      this.latencies.shift();
    }
  }

  incrementCounter(name, subKey = null) {
    if (subKey && this.counters[name] && typeof this.counters[name] === 'object') {
      this.counters[name][subKey] = (this.counters[name][subKey] || 0) + 1;
    } else if (this.counters[name] !== undefined) {
      this.counters[name]++;
    }
  }

  logEvent(level, action, message, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      action,
      message,
      metadata
    };
    this.auditLogs.push(entry);
    if (this.auditLogs.length > 1000) {
      this.auditLogs.shift();
    }
    return entry;
  }

  getMetricsSummary() {
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const count = sorted.length;
    const p50 = count > 0 ? sorted[Math.floor(count * 0.50)] : 0;
    const p90 = count > 0 ? sorted[Math.floor(count * 0.90)] : 0;
    const p99 = count > 0 ? sorted[Math.floor(count * 0.99)] : 0;
    const avg = count > 0 ? sorted.reduce((a, b) => a + b, 0) / count : 0;

    return {
      counters: this.counters,
      latency: {
        samples: count,
        avgMs: Math.round(avg * 100) / 100,
        p50Ms: Math.round(p50 * 100) / 100,
        p90Ms: Math.round(p90 * 100) / 100,
        p99Ms: Math.round(p99 * 100) / 100
      },
      memoryUsage: process.memoryUsage(),
      uptimeSeconds: Math.round(process.uptime())
    };
  }

  getPrometheusMetrics() {
    const summary = this.getMetricsSummary();
    return [
      `# HELP doc_intel_ingested_total Total documents ingested`,
      `# TYPE doc_intel_ingested_total counter`,
      `doc_intel_ingested_total ${summary.counters.documentsIngested}`,
      ``,
      `# HELP doc_intel_auto_approved_total Total documents auto-approved`,
      `# TYPE doc_intel_auto_approved_total counter`,
      `doc_intel_auto_approved_total ${summary.counters.documentsAutoApproved}`,
      ``,
      `# HELP doc_intel_latency_p50_ms 50th percentile processing latency in ms`,
      `# TYPE doc_intel_latency_p50_ms gauge`,
      `doc_intel_latency_p50_ms ${summary.latency.p50Ms}`,
      ``,
      `# HELP doc_intel_latency_p99_ms 99th percentile processing latency in ms`,
      `# TYPE doc_intel_latency_p99_ms gauge`,
      `doc_intel_latency_p99_ms ${summary.latency.p99Ms}`,
      ``,
      `# HELP doc_intel_memory_heap_used_bytes Memory heap used in bytes`,
      `# TYPE doc_intel_memory_heap_used_bytes gauge`,
      `doc_intel_memory_heap_used_bytes ${summary.memoryUsage.heapUsed}`
    ].join('\n');
  }
}
