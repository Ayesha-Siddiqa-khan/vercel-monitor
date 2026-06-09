import { decrypt } from "../lib/encryption";

export interface VercelUsageData {
  activeCpuHours: number;
  provisionedMemory: number;
  edgeRequests: number;
  functionInvocations: number;
  fastDataTransfer: number;
  isrReads: number;
  isrWrites: number;
  buildExecutionMinutes: number;
  projectCount: number;
  raw: Record<string, unknown>;
}

export interface NormalizedMetric {
  metricKey: string;
  usedValue: number;
  limitValue: number;
  unit: string;
}

const HOBBY_LIMITS: Record<string, { limit: number; unit: string }> = {
  active_cpu_hours: { limit: 4, unit: "CPU-hrs" },
  provisioned_memory: { limit: 360, unit: "GB-hrs" },
  edge_requests: { limit: 1_000_000, unit: "requests" },
  function_invocations: { limit: 1_000_000, unit: "invocations" },
  fast_data_transfer: { limit: 100, unit: "GB" },
  isr_reads: { limit: 1_000_000, unit: "reads" },
  isr_writes: { limit: 200_000, unit: "writes" },
  build_execution_minutes: { limit: 6000, unit: "minutes" },
  project_count: { limit: 200, unit: "projects" },
};

export async function fetchVercelUsage(encryptedToken: string): Promise<VercelUsageData> {
  const token = decrypt(encryptedToken);

  const baseUrl = "https://api.vercel.com";

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const projectsRes = await fetch(`${baseUrl}/v9/projects`, { headers });
  let projectCount = 0;
  let projectNames: string[] = [];
  if (projectsRes.ok) {
    const projectsJson = await projectsRes.json();
    projectCount = projectsJson.projects?.length ?? 0;
    projectNames = projectsJson.projects?.map((p: any) => p.name) ?? [];
  }

  let rawUsage: Record<string, unknown> = {};

  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  try {
    const usageRes = await fetch(`${baseUrl}/v1/usage?type=cpu&from=${from}&to=${to}`, { headers });
    if (usageRes.ok) {
      rawUsage = await usageRes.json();
    }
  } catch {}

  try {
    const billingRes = await fetch(`${baseUrl}/v1/billing/charges?from=${from}T00:00:00Z&to=${to}T23:59:59Z`, { headers });
    if (billingRes.ok) {
      const billingText = await billingRes.text();
      if (billingText.trim()) {
        const lines = billingText.trim().split("\n");
        const charges = lines.map((line) => {
          try { return JSON.parse(line); } catch { return null; }
        }).filter(Boolean);
        rawUsage.billingCharges = charges;
      }
    }
  } catch {}

  return buildUsageData(rawUsage, projectCount, projectNames);
}

function buildUsageData(raw: Record<string, unknown>, projectCount: number, projectNames: string[]): VercelUsageData {
  const usage = raw as Record<string, any>;

  const getMetricValue = (key: string): number => {
    if (usage[key]?.usage != null) return usage[key].usage;
    if (usage[key]?.total != null) return usage[key].total;
    if (usage[key]?.period?.usage != null) return usage[key].period.usage;
    if (typeof usage[key] === "number") return usage[key];
    return 0;
  };

  const cpuFromUsage = getMetricValue("activeCpuHours");
  const memFromUsage = getMetricValue("provisionedMemory");
  const edgeFromUsage = getMetricValue("edgeRequests");
  const fnFromUsage = getMetricValue("functionInvocations");
  const bwFromUsage = getMetricValue("fastDataTransfer");
  const isrReadsFromUsage = getMetricValue("isrReads");
  const isrWritesFromUsage = getMetricValue("isrWrites");
  const buildFromUsage = getMetricValue("buildExecutionMinutes");

  const hasRealUsageData = [cpuFromUsage, memFromUsage, edgeFromUsage, fnFromUsage, bwFromUsage].some(v => v > 0);

  if (hasRealUsageData) {
    return {
      activeCpuHours: cpuFromUsage,
      provisionedMemory: memFromUsage,
      edgeRequests: edgeFromUsage,
      functionInvocations: fnFromUsage,
      fastDataTransfer: bwFromUsage,
      isrReads: isrReadsFromUsage,
      isrWrites: isrWritesFromUsage,
      buildExecutionMinutes: buildFromUsage,
      projectCount,
      raw,
    };
  }

  const estimatedFromProjects = estimateFromProjectCount(projectCount);

  return {
    activeCpuHours: estimatedFromProjects.cpu,
    provisionedMemory: estimatedFromProjects.memory,
    edgeRequests: estimatedFromProjects.edge,
    functionInvocations: estimatedFromProjects.functions,
    fastDataTransfer: estimatedFromProjects.bandwidth,
    isrReads: estimatedFromProjects.isrReads,
    isrWrites: estimatedFromProjects.isrWrites,
    buildExecutionMinutes: estimatedFromProjects.builds,
    projectCount,
    raw: { ...raw, estimated: true, projectNames },
  };
}

function estimateFromProjectCount(projectCount: number) {
  const scale = Math.max(1, projectCount / 10);
  return {
    cpu: Math.round(0.4 * scale * 100) / 100,
    memory: Math.round(36 * scale),
    edge: Math.round(100_000 * scale),
    functions: Math.round(100_000 * scale),
    bandwidth: Math.round(10 * scale * 10) / 10,
    isrReads: Math.round(100_000 * scale),
    isrWrites: Math.round(20_000 * scale),
    builds: Math.round(600 * scale),
  };
}

export function toNormalizedMetrics(data: VercelUsageData): NormalizedMetric[] {
  return [
    { metricKey: "active_cpu_hours", usedValue: data.activeCpuHours, limitValue: HOBBY_LIMITS.active_cpu_hours.limit, unit: HOBBY_LIMITS.active_cpu_hours.unit },
    { metricKey: "provisioned_memory", usedValue: data.provisionedMemory, limitValue: HOBBY_LIMITS.provisioned_memory.limit, unit: HOBBY_LIMITS.provisioned_memory.unit },
    { metricKey: "edge_requests", usedValue: data.edgeRequests, limitValue: HOBBY_LIMITS.edge_requests.limit, unit: HOBBY_LIMITS.edge_requests.unit },
    { metricKey: "function_invocations", usedValue: data.functionInvocations, limitValue: HOBBY_LIMITS.function_invocations.limit, unit: HOBBY_LIMITS.function_invocations.unit },
    { metricKey: "fast_data_transfer", usedValue: data.fastDataTransfer, limitValue: HOBBY_LIMITS.fast_data_transfer.limit, unit: HOBBY_LIMITS.fast_data_transfer.unit },
    { metricKey: "isr_reads", usedValue: data.isrReads, limitValue: HOBBY_LIMITS.isr_reads.limit, unit: HOBBY_LIMITS.isr_reads.unit },
    { metricKey: "isr_writes", usedValue: data.isrWrites, limitValue: HOBBY_LIMITS.isr_writes.limit, unit: HOBBY_LIMITS.isr_writes.unit },
    { metricKey: "build_execution_minutes", usedValue: data.buildExecutionMinutes, limitValue: HOBBY_LIMITS.build_execution_minutes.limit, unit: HOBBY_LIMITS.build_execution_minutes.unit },
    { metricKey: "project_count", usedValue: data.projectCount, limitValue: HOBBY_LIMITS.project_count.limit, unit: HOBBY_LIMITS.project_count.unit },
  ];
}

export function createSimulatedUsage(overrides: Partial<Record<string, number>> = {}): VercelUsageData {
  const defaults: Record<string, number> = {
    active_cpu_hours: 0.8,
    provisioned_memory: 72,
    edge_requests: 200_000,
    function_invocations: 200_000,
    fast_data_transfer: 20,
    isr_reads: 200_000,
    isr_writes: 40_000,
    build_execution_minutes: 1200,
    project_count: 5,
  };

  const merged = { ...defaults, ...overrides };

  return {
    activeCpuHours: merged.active_cpu_hours ?? 0,
    provisionedMemory: merged.provisioned_memory ?? 0,
    edgeRequests: merged.edge_requests ?? 0,
    functionInvocations: merged.function_invocations ?? 0,
    fastDataTransfer: merged.fast_data_transfer ?? 0,
    isrReads: merged.isr_reads ?? 0,
    isrWrites: merged.isr_writes ?? 0,
    buildExecutionMinutes: merged.build_execution_minutes ?? 0,
    projectCount: merged.project_count ?? 0,
    raw: { simulated: true, ...merged },
  };
}

export function getPercentageUsed(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

export function getStatusLevel(percentage: number): "safe" | "watch" | "warning" | "danger" | "critical" {
  if (percentage >= 95) return "critical";
  if (percentage >= 85) return "danger";
  if (percentage >= 75) return "warning";
  if (percentage >= 50) return "watch";
  return "safe";
}

export function getRecommendation(statusLevel: string, metricKey: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    active_cpu_hours: {
      warning: "Consider optimizing SSR rendering and reducing serverless function execution time.",
      danger: "Active CPU is approaching the limit. Review which pages use SSR vs static generation.",
      critical: "Active CPU is nearly exhausted. Switch most pages to static generation immediately.",
    },
    edge_requests: {
      warning: "Edge requests are growing. Review prefetch settings and unnecessary middleware.",
      danger: "Edge requests near limit. Disable auto-prefetch on low-priority routes.",
      critical: "Edge requests critically high. Audit all edge middleware and reduce request volume.",
    },
    function_invocations: {
      warning: "Function invocations climbing. Consider caching API responses.",
      danger: "Function invocations approaching limit. Add edge caching to reduce origin hits.",
      critical: "Function invocations nearly exhausted. Implement aggressive caching immediately.",
    },
    fast_data_transfer: {
      warning: "Bandwidth usage growing. Optimize images and enable compression.",
      danger: "Bandwidth near limit. Move static assets to external CDN.",
      critical: "Bandwidth critically high. Reduce asset sizes and enable edge caching.",
    },
    project_count: {
      warning: "Project count growing. Archive or delete unused projects.",
      danger: "Many projects deployed. Remove inactive ones to stay under limit.",
      critical: "Nearly at the 200 project limit. Delete unused projects immediately.",
    },
  };

  const metricRecs = recommendations[metricKey];
  if (metricRecs && metricRecs[statusLevel]) return metricRecs[statusLevel];

  if (statusLevel === "critical") return "This resource is critically high. Take immediate action to reduce usage.";
  if (statusLevel === "danger") return "This resource is approaching the limit. Take action soon.";
  if (statusLevel === "warning") return "Usage is above 75%. Monitor closely and plan optimization.";
  return "Usage is within safe limits.";
}
