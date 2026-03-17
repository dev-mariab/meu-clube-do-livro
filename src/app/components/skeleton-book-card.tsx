import { Skeleton } from "./ui/skeleton";

export function SkeletonBookCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Book Cover Skeleton */}
      <Skeleton className="aspect-[2/3] w-full" />

      {/* Book Info Skeleton */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
