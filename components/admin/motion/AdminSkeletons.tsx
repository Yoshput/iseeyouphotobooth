import React from "react";

export function AdminDashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat data dashboard..."
      className="flex flex-col h-full min-h-0 space-y-4 animate-pulse pointer-events-none"
    >
      {/* Banner Skeleton */}
      <div className="flex-shrink-0 rounded-3xl border border-isy-line bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2.5">
            <div className="h-6 w-48 rounded-full bg-isy-mist border border-isy-line/60" />
            <div className="h-7 w-64 rounded-xl bg-isy-mist" />
            <div className="h-4 w-80 rounded-md bg-isy-mist/70" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-32 rounded-xl bg-isy-mist" />
            <div className="h-10 w-32 rounded-xl bg-isy-mist" />
            <div className="h-10 w-28 rounded-xl bg-isy-mist" />
          </div>
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-isy-line bg-white p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded-md bg-isy-mist" />
              <div className="h-9 w-9 rounded-xl bg-isy-mist" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div className="h-8 w-16 rounded-lg bg-isy-mist" />
              <div className="h-4 w-20 rounded-md bg-isy-mist" />
            </div>
            <div className="h-3 w-28 rounded-md bg-isy-mist/60 pt-1" />
          </div>
        ))}
      </div>

      {/* Two Column Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Left Column: Recent Content */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-48 rounded-md bg-isy-mist" />
            <div className="h-4 w-20 rounded-md bg-isy-mist/60" />
          </div>
          <div className="rounded-2xl border border-isy-line bg-white shadow-xs divide-y divide-isy-line overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-20 rounded-md bg-isy-mist" />
                    <div className="h-4 w-14 rounded-full bg-isy-mist" />
                  </div>
                  <div className="h-4 w-48 rounded-md bg-isy-mist/80" />
                </div>
                <div className="h-4 w-24 rounded-md bg-isy-mist/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Audit Log */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 rounded-md bg-isy-mist" />
            <div className="h-4 w-16 rounded-md bg-isy-mist/60" />
          </div>
          <div className="rounded-2xl border border-isy-line bg-white shadow-xs divide-y divide-isy-line overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-isy-mist shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-32 rounded-md bg-isy-mist" />
                  <div className="h-3 w-44 rounded-md bg-isy-mist/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminTableSkeleton({
  title = "Memuat data...",
  columnCount = 5,
  rowCount = 6,
}: {
  title?: string;
  columnCount?: number;
  rowCount?: number;
}) {
  return (
    <div
      role="status"
      aria-label={title}
      className="flex flex-col h-full min-h-0 space-y-4 animate-pulse pointer-events-none"
    >
      {/* Top Header Card */}
      <div className="flex-shrink-0 rounded-2xl border border-isy-line bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-isy-mist" />
          <div className="h-3.5 w-64 rounded-md bg-isy-mist/70" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-isy-mist" />
      </div>

      {/* Filter / Search Bar */}
      <div className="flex-shrink-0 flex items-center gap-3">
        <div className="h-10 flex-1 rounded-xl bg-white border border-isy-line" />
        <div className="h-10 w-32 rounded-xl bg-white border border-isy-line" />
      </div>

      {/* Table Skeleton */}
      <div className="flex-1 min-h-0 rounded-2xl border border-isy-line bg-white shadow-xs overflow-hidden p-4">
        <div className="space-y-3">
          <div className="h-8 w-full rounded-lg bg-isy-mist/60" />
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-isy-mist/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
