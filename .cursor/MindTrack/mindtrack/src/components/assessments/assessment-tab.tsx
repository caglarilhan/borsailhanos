"use client";

import * as React from "react";
import AssessmentForm from "@/components/assessments/assessment-form";

export default function AssessmentTab() {
  return (
    <AssessmentForm
      clientId="demo-client"
      clientName="Demo Client"
      onComplete={async () => {
        // TODO: Persist via API
      }}
      onCancel={() => {}}
    />
  );
}
