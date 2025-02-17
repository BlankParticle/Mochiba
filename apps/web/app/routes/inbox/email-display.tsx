import { fixNonReadableColors, template } from "@web/lib/email-utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@web/lib/utils";

export function EmailDisplay({ html, emailId }: { html: string; emailId: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { resolvedTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);

  const src = useMemo(
    () => URL.createObjectURL(new Blob([template(html, emailId)], { type: "text/html" })),
    [html, emailId],
  );
  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow?.document.body) {
      iframeRef.current.contentWindow.document.body.style.backgroundColor =
        resolvedTheme === "dark" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
      fixNonReadableColors(iframeRef.current.contentWindow.document.body);
    }
  }, [resolvedTheme]);

  return (
    <>
      {!loaded && (
        <div className="flex h-40 w-full items-center justify-center gap-2 rounded-lg p-4">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-xs">Loading email content...</span>
        </div>
      )}
      <iframe
        src={src}
        ref={iframeRef}
        title="Email Content"
        className={cn(
          "w-full rounded-lg border border-none px-4 transition-all duration-1000",
          !loaded && "h-0 opacity-0",
        )}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-scripts"
        onLoad={(event) => {
          if (!event.currentTarget.contentWindow?.document.body) return;
          const iframeBody = event.currentTarget.contentWindow.document.body;
          const dimensions = iframeBody.getBoundingClientRect();
          event.currentTarget.height = dimensions.height.toString();
          iframeBody.style.backgroundColor =
            resolvedTheme === "dark" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
          fixNonReadableColors(iframeBody);
          setLoaded(true);
        }}
      />
    </>
  );
}
