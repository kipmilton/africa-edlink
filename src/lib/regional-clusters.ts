import { resolveCountryProfile } from "@/lib/currency";

export type ClusterCode = "EAST_ANG" | "WEST_ANG" | "WEST_FRA" | "SOUTH_ANG";
export type PreferredTimeSlot = "7-9" | "9-11" | "11-1" | "2-4" | "4-5" | "5-7";
export type PreferredLanguage = "en" | "fr";

export type RegionalCluster = {
  code: ClusterCode;
  label: string;
  shortLabel: string;
  timezone: string;
  language: PreferredLanguage;
  countries: string[];
};

export const PREFERRED_TIME_OPTIONS: { value: PreferredTimeSlot; label: string }[] = [
  { value: "7-9", label: "7-9" },
  { value: "9-11", label: "9-11" },
  { value: "11-1", label: "11-1" },
  { value: "2-4", label: "2-4" },
  { value: "4-5", label: "4-5" },
  { value: "5-7", label: "5-7 PM" },
];

export const REGIONAL_CLUSTERS: RegionalCluster[] = [
  {
    code: "EAST_ANG",
    label: "East & Southern Africa",
    shortLabel: "East/Southern Anglophone",
    timezone: "EAT / CAT",
    language: "en",
    countries: ["KE", "UG", "TZ", "RW", "ET", "ZM"],
  },
  {
    code: "WEST_ANG",
    label: "West Africa Anglophone",
    shortLabel: "West Anglophone",
    timezone: "WAT / GMT",
    language: "en",
    countries: ["NG", "GH", "SL", "LR"],
  },
  {
    code: "WEST_FRA",
    label: "West & Central Africa Francophone",
    shortLabel: "Francophone West & Central",
    timezone: "GMT / WAT",
    language: "fr",
    countries: ["SN", "CI", "CM", "CD", "CG", "BF", "BJ", "TG", "NE", "GA"],
  },
  {
    code: "SOUTH_ANG",
    label: "Southern Cone",
    shortLabel: "Southern Cone SAST",
    timezone: "SAST",
    language: "en",
    countries: ["ZA", "ZW", "NA", "BW"],
  },
];

const CLUSTER_BY_COUNTRY = new Map(
  REGIONAL_CLUSTERS.flatMap((cluster) => cluster.countries.map((country) => [country, cluster] as const)),
);

export function resolveRegionalCluster(countryCodeOrName: string | undefined | null): RegionalCluster {
  const profile = resolveCountryProfile(countryCodeOrName);
  const code = (profile?.code ?? countryCodeOrName ?? "").trim().toUpperCase();
  return CLUSTER_BY_COUNTRY.get(code) ?? REGIONAL_CLUSTERS[0];
}

export function clusterLabel(code: string | undefined | null): string {
  return REGIONAL_CLUSTERS.find((cluster) => cluster.code === code)?.shortLabel ?? "East/Southern Anglophone";
}

export function clusterTimezone(code: string | undefined | null): string {
  return REGIONAL_CLUSTERS.find((cluster) => cluster.code === code)?.timezone ?? "EAT / CAT";
}

export function clusterLanguage(code: string | undefined | null): PreferredLanguage {
  return REGIONAL_CLUSTERS.find((cluster) => cluster.code === code)?.language ?? "en";
}
