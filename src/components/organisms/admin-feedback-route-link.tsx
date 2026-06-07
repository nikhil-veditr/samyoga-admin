"use client";

import {
  buildHmsFeedbackLink,
  feedbackRouteLabel,
  isInternalFeedbackRoute,
} from "@/shared/lib/feedback-route-link";

type AdminFeedbackRouteLinkProps = {
  route: string;
};

export function AdminFeedbackRouteLink({ route }: AdminFeedbackRouteLinkProps) {
  const hmsUrl = buildHmsFeedbackLink(route);
  const label = feedbackRouteLabel(route);

  if (hmsUrl) {
    return (
      <p className="mt-1 text-[10px] text-muted">
        {label}:{" "}
        <a
          href={hmsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-primary underline-offset-2 hover:underline"
        >
          {route}
        </a>
      </p>
    );
  }

  if (isInternalFeedbackRoute(route)) {
    return (
      <p className="mt-1 font-mono text-[10px] text-muted" title="Set NEXT_PUBLIC_HMS_APP_URL to enable links">
        {route}
      </p>
    );
  }

  return <p className="mt-1 font-mono text-[10px] text-muted">{route}</p>;
}
