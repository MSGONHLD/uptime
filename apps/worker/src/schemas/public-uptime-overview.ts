import { z } from 'zod';

export const publicUptimeOverviewRangeSchema = z.enum(['30d', '90d']);
export type PublicUptimeOverviewRange = z.infer<typeof publicUptimeOverviewRangeSchema>;

export type PublicUptimeOverviewResponse = {
  generated_at: number;
  range: PublicUptimeOverviewRange;
  range_start_at: number;
  range_end_at: number;
  overall: {
    total_sec: number;
    downtime_sec: number;
    unknown_sec: number;
    uptime_sec: number;
    uptime_pct: number;
  };
  monitors: Array<{
    id: number;
    name: string;
    type: 'http' | 'tcp';
    total_sec: number;
    downtime_sec: number;
    unknown_sec: number;
    uptime_sec: number;
    uptime_pct: number;
  }>;
};

const UPTIME_OVERVIEW_RANGES = new Set<PublicUptimeOverviewRange>(['30d', '90d']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isUptimePct(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

function validateTotals(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonNegativeInt(value.total_sec) &&
    isNonNegativeInt(value.downtime_sec) &&
    isNonNegativeInt(value.unknown_sec) &&
    isNonNegativeInt(value.uptime_sec) &&
    isUptimePct(value.uptime_pct)
  );
}

function validateMonitor(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isPositiveInt(value.id) &&
    typeof value.name === 'string' &&
    (value.type === 'http' || value.type === 'tcp') &&
    isNonNegativeInt(value.total_sec) &&
    isNonNegativeInt(value.downtime_sec) &&
    isNonNegativeInt(value.unknown_sec) &&
    isNonNegativeInt(value.uptime_sec) &&
    isUptimePct(value.uptime_pct)
  );
}

function isPublicUptimeOverviewResponse(value: unknown): value is PublicUptimeOverviewResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonNegativeInt(value.generated_at) &&
    typeof value.range === 'string' &&
    UPTIME_OVERVIEW_RANGES.has(value.range as PublicUptimeOverviewRange) &&
    isNonNegativeInt(value.range_start_at) &&
    isNonNegativeInt(value.range_end_at) &&
    validateTotals(value.overall) &&
    Array.isArray(value.monitors) &&
    value.monitors.every(validateMonitor)
  );
}

export const publicUptimeOverviewResponseSchema = z.custom<PublicUptimeOverviewResponse>(
  isPublicUptimeOverviewResponse,
  'Invalid public uptime overview response',
);
