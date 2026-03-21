import { Suspense } from "react";
import StudentDashboardClient from "./StudentDashboardClient";

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={null}>
      <StudentDashboardClient />
    </Suspense>
  );
}
