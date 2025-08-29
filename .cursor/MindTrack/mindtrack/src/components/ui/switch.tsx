/**
 * Switch Component - Toggle input component for boolean values
 * 
 * Bu component ne işe yarar:
 * - Boolean değerler için toggle input
 * - Accessible form controls
 * - Professional UI styling
 * - Keyboard navigation support
 */

"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

/**
 * Switch Component - Ana switch component'i
 * Bu component ne işe yarar:
 * - Radix UI switch primitive'ini extend eder
 * - Custom styling ve behavior ekler
 * - Accessibility features sağlar
 * - Professional appearance
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Base styles - Temel stiller
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
      // Transition effects - Geçiş efektleri
      "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      // Disabled state - Devre dışı durumu
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Data state styles - Veri durumu stilleri
      "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    {/* Switch Thumb - Switch başparmağı */}
    <SwitchPrimitives.Thumb
      className={cn(
        // Base thumb styles - Temel başparmak stilleri
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0",
        // Transition effects - Geçiş efektleri
        "transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));

// Display name for React DevTools - React DevTools için display name
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
