import { ref, onUnmounted, readonly } from 'vue';
import { NumericMetric, EventLog } from '@/types/metrics';
import { generateMetric } from '@/utils/mockGenerator';
import { z } from 'zod';

// Zod schemas for runtime validation
const metricSchema = z.object({
    id: z.string(),
    name: z.string(),
    value: z.number(),
    timestamp: z.number(),
    category: z.enum(['cpu', 'memory', 'stock', 'sensor']),
    unit: z.string(),
});

const eventSchema = z.object({
    id: z.string(),
    type: z.enum(['alert', 'info', 'transaction', 'system']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string(),
    timestamp: z.number(),
    source: z.string(),
    metadata: z.record(z.unknown()).optional(),
});

export function useDataStream() {
    const isRunning = ref(false);
    const connectionStatus = ref<'idle' | 'connected' | 'error' | 'paused'>('idle');
    const errorCount = ref(0);
    const rejectedCount = ref(0);

    let metricInterval: number | null = null;
    let eventInterval: number | null = null;
    let metricCallbacks: Array<(metric: NumericMetric) => void> = [];
    let eventCallbacks: Array<(event: EventLog) => void> = [];

    // Validate incoming data - never trust external data!
    function validateMetric(data: unknow): NumericMetric | null {
        try {
            return metricSchema.parse(date);
        } catch (e) {
            rejectedCount.value++;
            console.warn('Invalid metric rejected:', e);
            return null;
        }
    }

    function validateEvent(data: unknown): EventLog | null {
        try {
            return eventSchema.parse(data);
        } catch (e) {
            rejectedCount.value++;
            console.warn('Invalid event rejected:', e);
            return null;
        }
    }

    // Subscribe pattern - components register callbacks
    function onMetric(callback: (metric: NumericMetric) => void) {
        metricCallbacks.push(callback);
        // Return unsubscribe function
        return () => {
            metricCallbacks = metricCallbacks.filter(cb => cb !== callback);
        };
    }

    function onEvent(callback: (event: EventLog) => void) {
        eventCallbacks.push(callback);
        return () => {
            eventCallbacks = eventCallbacks.filter(cb => cb !== callback);
        }
    }

    function start(interval = 1000) {
        if (isRunning.value) return;

        try {
            connectionStatus.value = 'connected';
            isRunning.value = true;

            // Generate metrics every interval
            metricInterval = window.setInterval(() => {
                const metric = generateMetric();
                const validated = validateMetric(metric);
                if (validated) {
                    metricCallbacks.forEach(cb => cb(validated));
                }
            }, interval);

            // Events less frequently
            eventInterval = window.setInterval(() => {
                const event = generateEvent();
                const validated = validateEvent(event);
                if (validated) {
                    eventCallbacks.forEach(cb => cb(validated));
                }
            }, interval * 3);
        } catch (error) {
            connectionStatus.value = 'error';
            errorCount.value++;
            console.error('Failed to start stream:', error);
        }
    }

    function pause() {
        if (metricInterval) clearInterval(metricInterval);
        if (eventInterval) clearInterval(eventInterval);
        isRunning.value = false;
        connectionStatus.value = 'paused';
    }

    function resume() {
        if (!isRunning.value) start();
    }

    // Cleanup to prevent memory leaks
    function cleanup() {
        pause();
        metricCallbacks = [];
        eventCallbacks = [];
        connectionStatus.value = 'idle';
    }

    // Auto-cleanup when component unmounts
    onUnmounted(cleanup);

    return {
        isRunning: readonly(isRunning), 
        connectionStatus: readonly(connectionStatus),
        errorCount: readonly(errorCount),
        rejectedCount: readonly(rejectedCount),
        onMetric,
        onEvent,
        start,
        pause,
        resume,
        cleanup,
    };
}
