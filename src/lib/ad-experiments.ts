export type AdExperimentVariant = "control" | "value";

type AdExperimentConfig = {
  experimentId: string;
  defaultVariant: AdExperimentVariant;
  variants: AdExperimentVariant[];
};

export const adExperimentConfigBySlot: Record<string, AdExperimentConfig> = {
  "home-inline-1": { experimentId: "home-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
  "roles-inline-1": { experimentId: "roles-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
  "trends-inline-backend": { experimentId: "trends-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
  "trends-inline-designer": { experimentId: "trends-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
  "trends-inline-pm": { experimentId: "trends-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
  "scenarios-inline-backend": { experimentId: "scenario-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
  "scenarios-inline-designer": { experimentId: "scenario-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
  "scenarios-inline-pm": { experimentId: "scenario-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
  "compare-inline-1": { experimentId: "compare-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
  "briefings-inline-1": { experimentId: "briefings-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
  "insights-inline-1": { experimentId: "insights-slot-copy", defaultVariant: "control", variants: ["control", "value"] },
};

/**
 * 문자열 기반 해시를 만든다.
 * @param input 해시 입력 문자열
 * @returns 0 이상의 정수 해시값
 */
function hashString(input: string) {
  let hash = 0;
  for (const char of input) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 슬롯별 실험 설정을 반환한다.
 * @param slotId 광고 슬롯 ID
 * @returns 슬롯 실험 설정
 */
export function getAdExperimentConfig(slotId: string) {
  return adExperimentConfigBySlot[slotId] ?? {
    experimentId: "default-slot-copy",
    defaultVariant: "control",
    variants: ["control", "value"],
  };
}

/**
 * 방문자 식별자와 슬롯 ID를 기반으로 안정적인 A/B variant를 계산한다.
 * @param slotId 광고 슬롯 ID
 * @param visitorId 방문자 식별자
 * @returns 선택된 광고 variant
 */
export function resolveAdExperimentVariant(slotId: string, visitorId: string): AdExperimentVariant {
  const config = getAdExperimentConfig(slotId);
  const variantIndex = hashString(`${slotId}:${visitorId}`) % config.variants.length;
  return config.variants[variantIndex] ?? config.defaultVariant;
}
