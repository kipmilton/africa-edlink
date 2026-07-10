import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Award } from "lucide-react";

export const Route = createFileRoute("/verify/$id")({
  head: () => ({ meta: [{ title: "Verify Certificate — Serenog" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { id } = useParams({ from: "/verify/$id" });
  const { certificates } = useApp();
  const cert = certificates.find((c) => c.id === id);

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-heading text-xl font-extrabold">Serenog</Link>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Credential Verification</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        {!cert ? (
          <Card className="p-12 text-center">
            <h1 className="text-2xl font-bold">Certificate not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">This credential ID is not recognized.</p>
            <Button asChild className="mt-6"><Link to="/">Back home</Link></Button>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-3 bg-primary p-4 text-primary-foreground">
              <ShieldCheck className="h-6 w-6" />
              <div>
                <p className="text-sm font-bold">Verified Credential</p>
                <p className="text-xs opacity-80">This certificate is official and verified by our institution.</p>
              </div>
              <Badge variant="secondary" className="ml-auto rounded-full bg-white text-primary">Authentic</Badge>
            </div>
            <div className="p-8 text-center">
              <Award className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Certificate of Completion</p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold">{cert.studentName}</h1>
              <p className="mt-3 text-muted-foreground">has successfully completed</p>
              <p className="mt-1 text-xl font-bold text-primary">{cert.courseName}</p>
              <p className="mt-1 text-sm text-muted-foreground">Cohort {cert.cohortNumber} · issued {new Date(cert.issuedAt).toLocaleDateString()}</p>
              {cert.fileDataUrl && <img src={cert.fileDataUrl} alt="Certificate" className="mx-auto mt-6 max-h-[420px] rounded border" />}
            </div>
            <div className="border-t bg-muted/30 p-4 text-center text-xs text-muted-foreground">
              Credential ID: {cert.id}
            </div>
          </Card>
        )}
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Serenog · Bilingual Tech Education for Africa
        </div>
      </footer>
    </div>
  );
}