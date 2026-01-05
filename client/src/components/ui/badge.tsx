import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "text-foreground",

        // Status
        [TaskStatusEnum.BACKLOG]: "bg-gray-100 text-gray-600",
        [TaskStatusEnum.TODO]: "bg-blue-100 text-blue-600",
        [TaskStatusEnum.IN_PROGRESS]: "bg-yellow-100 text-yellow-600",
        [TaskStatusEnum.IN_REVIEW]: "bg-purple-100 text-purple-600",
        [TaskStatusEnum.DONE]: "bg-green-100 text-green-600",

        // Priority
        // Priority
        [TaskPriorityEnum.HIGH]: "bg-red-100 text-red-600",
        [TaskPriorityEnum.MEDIUM]: "bg-yellow-100 text-yellow-600",
        [TaskPriorityEnum.LOW]: "bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge };
