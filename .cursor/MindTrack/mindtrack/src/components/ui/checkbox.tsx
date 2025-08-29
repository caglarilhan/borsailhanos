/**
 * Checkbox Component - Form input for boolean values
 * 
 * Bu component ne işe yarar:
 * - Boolean değerler için form input
 * - Accessible form controls
 * - Professional UI styling
 * - Keyboard navigation support
 */

"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Checkbox Component - Ana checkbox component'i
 * Bu component ne işe yarar:
 * - Radix UI checkbox primitive'ini extend eder
 * - Custom styling ve behavior ekler
 * - Accessibility features sağlar
 * - Professional appearance
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base styles - Temel stiller
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
      // Focus states - Odaklanma durumları
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      // Disabled state - Devre dışı durumu
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Data state styles - Veri durumu stilleri
      "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

// Display name for React DevTools - React DevTools için display name
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
