import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("turnstile_load_failed"));
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

type Props = {
  siteKey: string;
  onToken: (token: string | null) => void;
};

const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile({ siteKey, onToken }, ref) {
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useImperativeHandle(ref, () => ({
    reset: () => {
      try {
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
      } catch {
        /* widget gone */
      }
      onTokenRef.current(null);
    },
  }));

  useEffect(() => {
    let alive = true;
    loadTurnstileScript()
      .then(() => {
        if (!alive || !boxRef.current || !window.turnstile || widgetId.current) return;
        widgetId.current = window.turnstile.render(boxRef.current, {
          sitekey: siteKey,
          theme: "auto",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => {
        /* offline / blocked: parent keeps the form disabled until a token exists */
      });
    return () => {
      alive = false;
      try {
        if (widgetId.current) window.turnstile?.remove(widgetId.current);
      } catch {
        /* widget gone */
      }
      widgetId.current = null;
    };
  }, [siteKey]);

  return <div ref={boxRef} style={{ minHeight: 65, display: "flex", justifyContent: "center", margin: "12px 0 4px" }} />;
});

export default Turnstile;
