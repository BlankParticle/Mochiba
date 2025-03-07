import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react";
import { DropdownMenuContent, DropdownMenuItem } from "@web/components/ui/dropdown-menu";
import { DropdownMenu, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@web/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@web/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Separator } from "@web/components/ui/separator";
import { Calendar } from "@web/components/ui/calendar";
import { Textarea } from "@web/components/ui/textarea";
import { nextSaturday } from "date-fns/nextSaturday";
import { Button } from "@web/components/ui/button";
import { Switch } from "@web/components/ui/switch";
import { Label } from "@web/components/ui/label";
import { EmailDisplay } from "./email-display";
import { addHours } from "date-fns/addHours";
import type { Route } from "./+types/email";
import { addDays } from "date-fns/addDays";
import { format } from "date-fns/format";
import { trpc } from "@web/lib/trpc";

export default function Email({ params }: Route.ClientLoaderArgs) {
  if (!params.id) return null;
  return <MailDisplay id={params.id} />;
}

export function MailDisplay({ id }: { id: string }) {
  const { data: mail } = trpc.threads.getSingleThread.useQuery(
    { id },
    {
      staleTime: Infinity,
    },
  );
  const today = new Date();

  if (!mail) return null;
  return (
    <div className="flex h-[calc(100svh-4rem)] w-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">Snooze</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 border-r px-2 py-4">
                  <div className="px-4 text-sm font-medium">Snooze until</div>
                  <div className="grid min-w-[250px] gap-1">
                    <Button variant="ghost" className="justify-start font-normal">
                      Later today{" "}
                      <span className="text-muted-foreground ml-auto">
                        {format(addHours(today, 4), "E, h:m b")}
                      </span>
                    </Button>
                    <Button variant="ghost" className="justify-start font-normal">
                      Tomorrow
                      <span className="text-muted-foreground ml-auto">
                        {format(addDays(today, 1), "E, h:m b")}
                      </span>
                    </Button>
                    <Button variant="ghost" className="justify-start font-normal">
                      This weekend
                      <span className="text-muted-foreground ml-auto">
                        {format(nextSaturday(today), "E, h:m b")}
                      </span>
                    </Button>
                    <Button variant="ghost" className="justify-start font-normal">
                      Next week
                      <span className="text-muted-foreground ml-auto">
                        {format(addDays(today, 7), "E, h:m b")}
                      </span>
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <Calendar />
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex items-start p-4">
          <div className="flex items-start gap-4 text-sm">
            <Avatar>
              <AvatarImage alt={mail.emails[0].from} />
              <AvatarFallback>
                {mail.emails[0].from
                  .split("<")[0]
                  .split(" ")
                  .map((chunk) => chunk[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <div className="font-semibold">{mail.emails[0].from}</div>
              <div className="line-clamp-1 text-xs">{mail.emails[0].subject}</div>
              <div className="line-clamp-1 text-xs">
                <span className="font-medium">Reply-To:</span> {mail.emails[0].from}
              </div>
            </div>
          </div>
          {mail.emails[0].date && (
            <div className="text-muted-foreground ml-auto text-xs">
              {format(new Date(mail.emails[0].date), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <div className="flex-1 overflow-y-auto">
          <div className="flex w-full flex-col items-center gap-2">
            {mail.emails.map((email) => (
              <EmailDisplay html={email.bodyHtml} emailId={email.id} key={email.id} />
            ))}
          </div>
        </div>
        <Separator className="mt-auto" />
        <div className="p-4">
          <form>
            <div className="grid gap-4">
              <Textarea className="p-4" placeholder={`Reply ${mail.emails[0].from}...`} />
              <div className="flex items-center">
                <Label htmlFor="mute" className="flex items-center gap-2 text-xs font-normal">
                  <Switch id="mute" aria-label="Mute thread" /> Mute this thread
                </Label>
                <Button onClick={(e) => e.preventDefault()} size="sm" className="ml-auto">
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
