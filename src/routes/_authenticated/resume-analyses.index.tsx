import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listMyAnalyses } from "@/lib/resume-analysis.functions";

const listOpts = () =>
  queryOptions({
    queryKey: ["my-resume-analyses"],
    queryFn: () => listMyAnalyses(),
  });

export const Route = createFileRoute("/_authenticated/resume-analyses/")({
  head: () => ({ meta: [{ title: "Resume Analyses | Discover Diplomacy" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(listOpts()),
  component: AnalysesIndex,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="max-w-3xl mx-auto p-8" role="alert">Couldn't load analyses: {error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout><div className="max-w-3xl mx-auto p-8">Nothing here yet.</div></SiteLayout>
  ),
});

function scoreTone(score: number) {
  if (score >= 75) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (score >= 60) return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
}

function AnalysesIndex() {
  const { data } = useSuspenseQuery(listOpts());

  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold">Your resume analyses</h1>
            <p className="text-muted-foreground mt-1">Review past reports or start a new one.</p>
          </div>
          <Button asChild>
            <Link to="/resume-review">New analysis</Link>
          </Button>
        </div>

        {data.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              No analyses yet. Upload a resume to get your first ATS report.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {data.map((a) => (
              <Link
                key={a.id}
                to="/resume-analyses/$analysisId"
                params={{ analysisId: a.id }}
                className="block"
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`shrink-0 rounded-lg px-3 py-2 text-xl font-bold tabular-nums ${scoreTone(a.overallScore)}`}>
                      {a.overallScore}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{a.targetField}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {a.experienceLevel} · {a.resumeFilename ?? "Resume"} · {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="secondary">View</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
