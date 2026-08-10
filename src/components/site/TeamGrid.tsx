import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeam, type TeamProfile } from "@/lib/team";

function Initials({ name }: { name: string }) {
  const label = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className="grid h-full w-full place-items-center bg-primary/10 text-2xl font-black text-primary">
      {label}
    </div>
  );
}

export function TeamCard({ member }: { member: TeamProfile }) {
  return (
    <Card className="overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="h-48 w-full overflow-hidden bg-muted">
        {member.imageUrl ? (
          <img src={member.imageUrl} alt={member.fullName} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Initials name={member.fullName} />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-base font-bold text-foreground">{member.fullName}</h3>
          <Badge variant="secondary" className="shrink-0 rounded-full text-[10px] font-bold uppercase tracking-wide">
            {member.kind === "tutor" ? "Tutor" : "Management"}
          </Badge>
        </div>
        <p className="mt-1 text-sm font-semibold text-primary">{member.role}</p>
        {member.experience ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{member.experience}</p>
        ) : null}
      </div>
    </Card>
  );
}

export function TeamGrid({ limit, kind }: { limit?: number; kind?: "management" | "tutor" }) {
  const { profiles, loading } = useTeam();
  const visible = useMemo(() => {
    let list = profiles.filter((p) => p.isActive);
    if (kind) list = list.filter((p) => p.kind === kind);
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }, [profiles, kind, limit]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading team…</p>;
  }
  if (visible.length === 0) {
    return (
      <Card className="rounded-xl border border-dashed bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold text-muted-foreground">
          Team profiles will appear here as soon as they are published.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((member) => (
        <TeamCard key={member.id} member={member} />
      ))}
    </div>
  );
}
