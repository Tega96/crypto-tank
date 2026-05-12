import { m } from 'vue-router/dist/index-D_VEAp3P.js';
import type { NumericMetric, EventLog } from '../types/metrics';

// Sine wave with noise for CPU-like patterns
function generateCPUValue(baseTime: number): number {
    const hourOfDay = new Date(baseTime).getHours();
    const baseLoad = Math.sin((hourOfDay / 24) * Math.PI * 2) * 20 + 50;
    const noise = (Math.random() - 0.5) * 10;
    return Math.max(0, Math.min(100, baseLoad + noise));
}

// Random walk for stock-like patterns
let stockPrice = 150;
function generateStockValue(): number {
    const change = (Math.random() - 0.48) * 2; // slightly bullish bias
    stockPrice = Math.max(140, Math.min(160, stockPrice + change));
    return stockPrice;
}

// Memory that gradually climbs then drops (GC simulation)
let memoryBase = 60;
function generateMemoryValue(): number {
    memoryBase += (Math.random() - 0.3) * 2; // slowly climbs
    if (memoryBase > 90) memoryBase = 40; // simulate GC
    return Math.max(20, Math.min(95, memoryBase + (Math.random() - 0.5) * 5));
}

const eventMessages = {
    alert: [
        'High CPU usage detected',
        'Memory threshold exceeded',
        'Network latency spike',
    ],
    info: [
        'User authentication successful',
        'Configuration updated',
        'Backup completed',
    ],
    transaction: [
        'Order #${id} executed',
        'Payment processed for ${amount}',
        'Data sync completed',
    ],
    system: [
        'Service health check passed',
        'Log rotation completed', 
        'Certificate renewed',
    ],
};

const severities = ['low', 'medium', 'high', 'critical'] as const;
const eventTypes = ['alert', 'info', 'transaction', 'system'] as const;

export function generateMetric(): NumericMetric {
    const now = Date.now();
    const categories = ['cpu', 'memory', 'network', 'stock'] as const;
    const category = categories[Math.floor(Math.random() * categories.length)];

    let value: number;
    let unit: string;

    switch (category) {
        case 'cpu': 
            value = generateCPUValue(now);
            unit = '%';
            break;
        case 'memory':
            value = generateMemoryValue();
            unit = '%';
            break;
        case 'stock':
            value = generateStockValue();
            unit = 'USD';
            break;
        default: 
            value = Math.random() * 1000;
            unit = 'MB/s';
            // break;
    }

    return {
        id: `metric-${now}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${category.toUpperCase()} Monitor`,
        value: Math.round(value * 100) / 100,
        timestamp: now,
        category,
        unit,
    }
}

export function generateEvent(): EventLog {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const messages = eventMessages[type];
    const messageTemplate = messages[Math.floor(Math.random() * messages.length)];
    const message = messageTemplate
        .replace('${id}', Math.floor(Math.random() * 10000).toString())
        .replace('${amount}', `$${(Math.random() *1000).toFixed(2)}`);

    return {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        severity: severities[Math.floor(Math.random() * severities.length)],
        message,
        timestamp: Date.now(),
        source: ['system-A', 'system-B', 'gateway-1'][Math.floor(Math.random() * 3)],
        metadata: { version: '1.2.3', region: 'us-east-1'},
    }
}