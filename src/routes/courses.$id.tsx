import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/courses/$id")({
  head: () => ({ meta: [{ title: "Course details — Serenog" }] }),
  component: CourseDetail,
});

function CourseDetail() {
  const { id } = useParams({ from: "/courses/$id" });
  const { courses, currency, country, lang } = useApp();
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Button asChild className="mt-4"><Link to="/courses">Back to courses</Link></Button>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <Badge variant="secondary" className="rounded-full">{course.delivery === "online" ? "Online" : "Physical"}</Badge>
          <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">{course.title[lang]}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{course.desc[lang]}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="rounded-xl border bg-primary/5 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tuition ({country})</p>
              <p className="text-2xl font-black text-primary">{formatPrice(course.basePriceUSD, currency)}</p>
            </div>
            <Button asChild size="lg"><Link to="/enroll/$id" params={{ id: course.id }}>Enroll Now</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 grid gap-6 lg:grid-cols-3">
        {course.image && (
          <Card className="overflow-hidden p-0 lg:col-span-3">
            <img src={course.image} alt="" className="h-64 w-full object-cover" />
          </Card>
        )}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-bold">About this course</h2>
          <p className="mt-2 text-muted-foreground">{course.what[lang]}</p>
          <h3 className="mt-6 font-bold">What's new</h3>
          <p className="mt-1 text-muted-foreground">{course.whatsnew[lang]}</p>
          <h3 className="mt-6 font-bold">Who is this for</h3>
          <p className="mt-1 text-muted-foreground">{course.for[lang]}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold">Program details</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>· Cohort size: {course.cohortSize}</li>
            <li>· Delivery: {course.delivery}</li>
            <li>· Language: EN / FR</li>
            <li>· Bilingual mentorship</li>
            <li>· Certificate upon graduation</li>
          </ul>
          <Button asChild className="mt-4 w-full"><Link to="/enroll/$id" params={{ id: course.id }}>Enroll Now</Link></Button>
        </Card>
      </section>
    </div>
  );
}