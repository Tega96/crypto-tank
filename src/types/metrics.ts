export interface NumericMetric {
    id: string;
    name: string;
    value: number;
    timestamp: number;
    category: 'cpu' | 'memory' | 'network' | 'stock' | 'sensor';
    unit: string;
}

export interface EventLog {
    id: string;
    type: 'alert' | 'info' | 'transaction' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: number;
    source: string;
    metadata?: Record<string, unknown>;
}

export interface DashboardConfig {
    maxMetricsBuffer: number; // how many points to keep in memory
    maxEventsBufffer: number;
    defaultTimeRange: number;
    updateThrottle: number;
}