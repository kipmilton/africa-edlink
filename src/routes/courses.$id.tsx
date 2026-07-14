import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  GraduationCap,
  Languages,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/courses/$id")({
  head: () => ({ meta: [{ title: "Course details - Serenog" }] }),
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
        <Button asChild className="mt-4">
          <Link to="/courses">Back to courses</Link>
        </Button>
      </div>
    );
  }

  const delivery =
    course.delivery === "online"
      ? "Online"
      : course.delivery === "physical"
        ? "Physical"
        : "Hybrid";

  return (
    <div className="bg-background">
      <section className="border-b bg-white">
        <div className="container-section py-10 sm:py-14">
          <Button asChild variant="ghost" className="-ml-3 mb-6">
            <Link to="/courses">
              <ArrowLeft className="h-4 w-4" /> Back to courses
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {delivery}
              </Badge>
              <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                {course.title[lang]}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {course.desc[lang]}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl px-7">
                  <Link to="/enroll/$id" params={{ id: course.id }}>
                    Enroll Now
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl px-7">
                  <Link to="/contact">Ask a Question</Link>
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden rounded-xl border bg-white p-0 shadow-sm">
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.title[lang]}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-muted text-muted-foreground">
                  <GraduationCap className="h-12 w-12" />
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="container-section grid gap-6 py-12 lg:grid-cols-[1fr_320px]">
        <Card className="rounded-xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-bold">About this course</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {course.what[lang]}
              </p>
            </section>
            <section>
              <h2 className="font-heading text-2xl font-bold">What's new</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {course.whatsnew[lang]}
              </p>
            </section>
            <section>
              <h2 className="font-heading text-2xl font-bold">Who this is for</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {course.for[lang]}
              </p>
            </section>
          </div>
        </Card>

        <Card className="h-fit rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Tuition ({country})
          </p>
          <p className="mt-2 text-3xl font-black text-primary">
            {formatPrice(course.basePriceUSD, currency)}
          </p>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex gap-3">
              <GraduationCap className="mt-0.5 h-4 w-4 text-primary" />
              <span>Cohort size: {course.cohortSize} learners</span>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-primary" />
              <span>Delivery: {delivery}</span>
            </div>
            <div className="flex gap-3">
              <Languages className="mt-0.5 h-4 w-4 text-primary" />
              <span>Language: English / French</span>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <span>Certificate upon graduation</span>
            </div>
          </div>
          <Button asChild className="mt-6 w-full rounded-xl">
            <Link to="/enroll/$id" params={{ id: course.id }}>
              Enroll Now
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
