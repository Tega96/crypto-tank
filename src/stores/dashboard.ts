import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import type { NumericMetric, EventLog } from '@/types/metrics';

const MAX_METRICS = 5000;
const MAX_EVENTS = 1000;

export const useDashboardStore = defineStore('dashboard', () => {
    // Shallow refs for performance - we replace entire arrays
    const metricsBuffer = shallowRef<NumericMetric[]>([]);
    const eventsBuffer = shallowRef<EventLog[]>([]);

    // User controls
    const timeRange = ref<number>(5 * 60 * 1000); // 5 minutes default
    const isPaused = ref(false);
    const activeMetricIds = ref<Set<string>>(new Set(['cpu', 'memory', 'stock', 'network']));
    const selectedSeverity = ref<string>('all');
    const searchQuery = ref('');

    // Add new metric - called from the stream subscription
    function addMetric(metric: NumericMetric) {
        if (isPaused.value) return;

        // Create new array (shallow ref optimization)
        const newBuffer = [...metricsBuffer.value];
        // Trim buffer if needed
        if (newBuffer.length > MAX_METRICS) {
            metricsBuffer.value = newBuffer.slice(-MAX_METRICS);
        } else {
            metricsBuffer.value = newBuffer;
        }
    }

    function addEvent(event: EventLog) {
        if (isPaused.value) return;

        // Events are prepended (newest first)
        const newBuffer = [event, ...eventsBuffer.value];
        if (newBuffer.length > MAX_EVENTS) {
            eventsBuffer.value = newBuffer.slice(0, MAX_EVENTS);
        } else {
            eventsBuffer.value = newBuffer;
        }
    }

    // Derived: filter metrics by time range
    const timeFilteredMetrics = computed(() => {
        const cutoff = Date.now() - timeRange.value;
        return metricsBuffer.value.filter(m => m.timestamp >= cutoff);
    });

    // Derived: filter by active categories
    const filteredMetrics = computed(() => {
        return timeFilteredMetrics.value.filter(m => 
            activeMetricIds.value.has(m.category)
        );
    });

    // Derived: filtered events
    const filteredEvents = computed(() => {
        let events = eventsBuffer.value;

        if (selectedSeverity.value !== 'all') {
            events = events.filter(e => e.severity === selectedSeverity.value);
        }

        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            events = events.filter(e => 
                e.message.toLowerCase().includes(query) ||
                e.source.toLowerCase().includes(query)
            );
        }

        return events;
    });

    // Control actions
    function setTimeRange(ms: number) {
        timeRange.value = ms;
    }

    function toggleMetric(category: string) {
        const newSet = new Set(activeMetricIds.value);
        if (newSet.has(category)) {
            newSet.delete(category);
        } else {
            newSet.add(category);
        }
        activeMetricIds.value = newSet;
    }

    function setSeverity(severity: string) {
        selectedSeverity.value = severity;
    }

    function setSearchQuery(query: string) {
        searchQuery.value = query;
    }

    return {
        metricsBuffer,
        eventsBuffer,
        timeRange,
        isPaused,
        activeMetricIds,
        selectedSeverity,
        searchQuery,
        filteredEvents,
        addMetric,
        addEvent,
        setTimeRange,
        toggleMetric,
        setSeverity,
        setSearchQuery,
    };
});