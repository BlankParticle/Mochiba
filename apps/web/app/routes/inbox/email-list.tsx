import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { NavLink } from "react-router";
import { trpc } from "@web/lib/trpc";
import { cn } from "@web/lib/utils";

export function EmailList({ id }: { id: string | null }) {
  const { data: threads, isLoading } = trpc.threads.getThreads.useQuery({
    mailbox: "inbox",
  });

  return (
    <ScrollArea className="h-[calc(100svh-4rem)] w-[500px] overflow-auto border-r py-2">
      <div className="flex flex-col gap-2 px-2">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          threads?.map((thread) => (
            <NavLink
              key={thread.publicId}
              className={cn(
                "hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                id === thread.publicId && "bg-muted",
              )}
              to={`./${thread.publicId}`}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{thread.subject}</div>
                  </div>
                  <div
                    className={cn(
                      "ml-auto text-xs",
                      id === thread.publicId ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {formatDistanceToNow(thread.updatedAt, {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className="text-xs font-medium">{thread.subject}</div>
              </div>
              <div className="text-muted-foreground line-clamp-2 text-xs">
                {thread.emails[0]?.bodyText.substring(0, 300) ?? "[Empty Email]"}
              </div>
            </NavLink>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
