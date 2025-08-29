/**
 * Progress Component - Visual progress indicator
 * 
 * Bu component ne işe yarar:
 * - Progress bar display
 * - Loading state indication
 * - Completion tracking
 * - Professional UI styling
 */

"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

/**
 * Progress Component - Ana progress component'i
 * Bu component ne işe yarar:
 * - Radix UI progress primitive'ini extend eder
 * - Custom styling ve behavior ekler
 * - Accessibility features sağlar
 * - Professional appearance
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      // Base styles - Temel stiller
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));

// Display name for React DevTools - React DevTools için display name
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
