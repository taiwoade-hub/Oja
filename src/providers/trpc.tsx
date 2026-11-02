import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";
import { handleClientDemoBatch } from "@/lib/clientStore";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount) => failureCount < 1,
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input instanceof Request
      ? input.url
      : String(input);

  const isStaticHost =
    typeof window !== "undefined" &&
    (window.location.hostname.endsWith("github.io") ||
      window.location.hostname.includes("pages.dev") ||
      window.location.protocol === "file:");

  const extractPayloads = async () => {
    let inputParams: Record<string, any> = {};
    try {
      const url = new URL(urlStr, window?.location?.href ?? "http://localhost");
      const inputQuery = url.searchParams.get("input");
      if (inputQuery) {
        inputParams = JSON.parse(inputQuery);
      }
    } catch {}

    let bodyObj: any = undefined;
    if (init?.body && typeof init.body === "string") {
      try {
        bodyObj = JSON.parse(init.body);
      } catch {}
    } else if (input instanceof Request && !init?.body) {
      try {
        const cloned = input.clone();
        const text = await cloned.text();
        if (text) bodyObj = JSON.parse(text);
      } catch {}
    }

    return { inputParams, bodyObj };
  };

  // If deployed to GitHub Pages or static host, intercept immediately without making a doomed network call
  if (isStaticHost) {
    const { inputParams, bodyObj } = await extractPayloads();
    return handleClientDemoBatch(urlStr, inputParams, bodyObj);
  }

  // Otherwise, try network request first (dev server or full-stack production server)
  try {
    const res = await globalThis.fetch(input, {
      ...(init ?? {}),
      credentials: "include",
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return res;
    }

    // Server returned HTML (e.g. 404/500), fall back to client demo batch to avoid JSON.parse error
    const { inputParams, bodyObj } = await extractPayloads();
    return handleClientDemoBatch(urlStr, inputParams, bodyObj);
  } catch (_err) {
    // Network offline / connection refused, fall back to client demo batch
    const { inputParams, bodyObj } = await extractPayloads();
    return handleClientDemoBatch(urlStr, inputParams, bodyObj);
  }
}

const base = import.meta.env.BASE_URL || "/";
const trpcUrl = `${base.endsWith("/") ? base : `${base}/`}api/trpc`;

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: trpcUrl,
      transformer: superjson,
      fetch(input, init) {
        return safeFetch(input, init);
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
