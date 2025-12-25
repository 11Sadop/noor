import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";

export function useVisitorTracking() {
  const hasTracked = useRef(false);

  const { mutate: trackVisit } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/stats/track");
      return res.json();
    },
  });

  const { data: visitorData } = useQuery<{ count: number }>({
    queryKey: ["/api/stats/visitors"],
  });

  useEffect(() => {
    const sessionKey = "noor_session_tracked";
    const isTracked = sessionStorage.getItem(sessionKey);
    
    if (!isTracked && !hasTracked.current) {
      hasTracked.current = true;
      trackVisit();
      sessionStorage.setItem(sessionKey, "true");
    }
  }, [trackVisit]);

  return { visitorCount: visitorData?.count || 0 };
}
