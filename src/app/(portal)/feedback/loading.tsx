import { ListPageSkeleton } from "@/components/molecules/skeletons/admin-page-skeletons";

export default function FeedbackLoading() {
  return <ListPageSkeleton ariaLabel="Loading feedback" filterFields={1} />;
}
