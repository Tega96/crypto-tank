export type Severity = 'info' | 'warning' | 'critical'

export interface FeedEvent {
    id: string;
    title: string;
    message: string;
    severity: Severity;
    timestamp: number
}