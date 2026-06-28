import { FormSectionSkeleton } from "@/components/molecules/skeletons/form-section-skeleton";

export function ProvisionFormSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6" aria-busy="true" aria-label="Loading form">
      <FormSectionSkeleton fields={4} />
      <FormSectionSkeleton fields={6} />
      <FormSectionSkeleton fields={3} />
    </div>
  );
}
