import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("jaryq-shimmer rounded-md", className)}
      {...props}
    />
  )
}

function SkeletonText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton
      className={cn("h-3 w-full rounded-md", className)}
      {...props}
    />
  )
}

function SkeletonCover({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton
      className={cn("aspect-[3/4] w-full rounded-xl", className)}
      {...props}
    />
  )
}

function SkeletonCircle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton
      className={cn("aspect-square w-12 rounded-full", className)}
      {...props}
    />
  )
}

export { Skeleton, SkeletonText, SkeletonCover, SkeletonCircle }
