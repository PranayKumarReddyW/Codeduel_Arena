import { AppShell } from "@/components/duel";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Welcome title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 rounded-lg" />
          <Skeleton className="h-4 w-52 rounded" />
        </div>

        {/* Top 2 Cards: Profile Badge + Hero Find Match Banner */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* User Profile Card Skeleton */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-3.5 w-20 rounded" />
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-14 rounded" />
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <div className="mt-4 flex justify-between pt-3 border-t border-border/40">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>

          {/* Hero Banner Skeleton */}
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-card p-6 lg:col-span-2">
            <div className="flex flex-col justify-between h-full gap-6 sm:flex-row sm:items-center">
              <div className="space-y-3 max-w-sm">
                <Skeleton className="h-4 w-36 rounded-full" />
                <Skeleton className="h-8 w-56 rounded-lg" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Skeleton className="h-12 w-32 rounded-lg" />
                <Skeleton className="h-12 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="mt-4 h-9 w-20 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Bottom 2 Panels: Weekly Activity & Recent Battles */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Weekly Activity Panel */}
          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-36 rounded" />
            </div>
            <div className="h-64 flex items-end justify-between gap-4 pt-4 px-2">
              {[40, 65, 30, 85, 55, 90, 45].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <Skeleton className="w-full rounded-t-md" style={{ height: `${h}%` }} />
                  <Skeleton className="h-3 w-8 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Battles Panel */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-3.5 w-16 rounded" />
            </div>
            <div className="space-y-3.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-5 w-10 rounded" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Skeleton className="h-4 w-10 ml-auto rounded" />
                    <Skeleton className="h-3 w-12 ml-auto rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

