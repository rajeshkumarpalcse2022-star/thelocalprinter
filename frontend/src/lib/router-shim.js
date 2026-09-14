"use client";

import { useRouter as useNextRouter, usePathname as useNextPathname, useParams as useNextParams, useSearchParams as useNextSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useNavigate() {
  const router = useNextRouter();
  return useCallback(
    (to, options) => {
      if (typeof to === "number") {
        router.back();
      } else {
        router.push(to);
      }
    },
    [router]
  );
}

export function useParams() {
  return useNextParams();
}

export function useLocation() {
  const pathname = useNextPathname();
  return { pathname };
}

export { useNextSearchParams as useSearchParams };
