import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAnalysis, listMyAnalyses } from "@/lib/resume-analysis.functions";


const opts = (analysisId: string) =>
  queryOptions({
    queryKey: ["resume-analysis", analysisId],
    queryFn: () => getAnalysis({ data: { analysisId } }),
  });

export const Route = createFileRoute("/_authenticated/resume-analyses/$analysisId")({
  head: () => ({ meta: [{ title: "Resume Analysis | Discover Diplomacy" }] }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(opts(params.analysisId)),
  component: AnalysisReport,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="max-w-3xl mx-auto p-8" role="alert">Couldn't load the report: {error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout><div className="max-w-3xl mx-auto p-8">Analysis not found.</div></SiteLayout>
  ),
});

function ScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 70;
  const stroke = 12;
  const c = 2 * Math.PI * radius;
  const offset = c - (clamped / 100) * c;
  const color =
    clamped >= 75 ? "hsl(142 71% 45%)" : clamped >= 60 ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)";
  const verdict =
    clamped >= 90 ? "Interview-ready"
    : clamped >= 75 ? "Strong, minor gaps"
    : clamped >= 60 ? "Competent but generic"
    : clamped >= 40 ? "Significant issues"
    : "Likely screened out";

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-44 h-44 shrink-0">
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
          <circle
            cx="90" cy="90" r={radius} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 600ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold tabular-nums">{clamped}</div>
          <div className="text-xs text-muted-foreground">out of 100</div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-sm uppercase tracking-wide text-muted-foreground">Overall score</div>
        <div className="text-2xl font-semibold">{verdict}</div>
        <p className="text-sm text-muted-foreground max-w-md">
          Scoring blends ATS-safety, impact, keyword alignment, clarity, and relevance to your target field and level.
        </p>
      </div>
    </div>
  );
}

function AnalysisReport() {
  const { analysisId } = Route.useParams();
  const { data } = useSuspenseQuery(opts(analysisId));

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">
              <Link to="/resume-analyses" className="hover:underline">← All analyses</Link>
            </div>
            <h1 className="text-3xl font-semibold mt-2">{data.targetField}</h1>
            <div className="text-muted-foreground mt-1 text-sm">
              {data.experienceLevel} · {data.resumeFilename ?? "Resume"} · {new Date(data.createdAt).toLocaleString()}
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/resume-review">New analysis</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <ScoreGauge score={data.overallScore ?? 0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              What the ATS sees
              <Badge variant="secondary">Extracted plain text</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 rounded-md border bg-muted/30">
              <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                {data.extractedText || "No extracted text available."}
              </pre>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-2">
              This is roughly what an applicant tracking system parses out of your file. If it looks garbled or sections are missing, fix the source document first.
            </p>
          </CardContent>
        </Card>

        <Accordion type="multiple" defaultValue={["ats", "keywords", "wording", "formatting"]} className="space-y-3">
          <AccordionItem value="ats" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-3">
                <span className="font-semibold">ATS issues</span>
                <Badge variant="outline">{data.atsIssues.length}</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {data.atsIssues.length === 0 ? (
                <p className="text-sm text-muted-foreground">No parsing problems flagged.</p>
              ) : (
                <ul className="space-y-2 list-disc pl-5">
                  {data.atsIssues.map((item, i) => (
                    <li key={i} className="text-sm">{item}</li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="keywords" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-3">
                <span className="font-semibold">Keyword gaps</span>
                <Badge variant="outline">{data.keywordGaps.length}</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {data.keywordGaps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Strong keyword coverage for this field.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.keywordGaps.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">{kw}</Badge>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="wording" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-3">
                <span className="font-semibold">Wording suggestions</span>
                <Badge variant="outline">{data.wordingSuggestions.length}</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {data.wordingSuggestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rewrites suggested.</p>
              ) : (
                <div className="space-y-4">
                  {data.wordingSuggestions.map((s, i) => (
                    <div key={i} className="grid md:grid-cols-2 gap-3 rounded-md border p-3 bg-background">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Original</div>
                        <p className="text-sm whitespace-pre-wrap">{s.original}</p>
                      </div>
                      <div className="md:border-l md:pl-3">
                        <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-1">Improved</div>
                        <p className="text-sm whitespace-pre-wrap">{s.improved}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="formatting" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-3">
                <span className="font-semibold">Formatting notes</span>
                <Badge variant="outline">{data.formattingNotes.length}</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {data.formattingNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No formatting notes.</p>
              ) : (
                <ul className="space-y-2 list-disc pl-5">
                  {data.formattingNotes.map((n, i) => (
                    <li key={i} className="text-sm">{n}</li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <PastAnalyses currentId={data.id} />
      </div>
    </SiteLayout>
  );
}

import { listMyAnalyses } from "@/lib/resume-analysis.functions";
const listOpts = () =>
  queryOptions({ queryKey: ["my-resume-analyses"], queryFn: () => listMyAnalyses() });

function PastAnalyses({ currentId }: { currentId: string }) {
  const { data } = useSuspenseQuery(listOpts());
  const others = data.filter((a) => a.id !== currentId);
  if (others.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Past analyses</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {others.map((a) => (
            <li key={a.id}>
              <Link
                to="/resume-analyses/$analysisId"
                params={{ analysisId: a.id }}
                className="flex items-center gap-4 py-3 hover:bg-muted/40 rounded-md px-2 -mx-2"
              >
                <span className="tabular-nums font-semibold w-10 text-right">{a.overallScore ?? "—"}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-medium truncate">{a.targetField}</span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {a.experienceLevel} · {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
