import {
  InboxIcon,
  PlusIcon,
  FileEditIcon,
  PlaneTakeoffIcon,
  TrashIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@web/components/ui/button";
import { NavLink } from "react-router";
import { cn } from "@web/lib/utils";

const mailboxes: {
  name: string;
  icon: LucideIcon;
  key: string;
}[] = [
  {
    name: "Inbox",
    icon: InboxIcon,
    key: "inbox",
  },
  {
    name: "Drafts",
    icon: FileEditIcon,
    key: "drafts",
  },
  {
    name: "Sent",
    icon: PlaneTakeoffIcon,
    key: "sent",
  },
  {
    name: "Trash",
    icon: TrashIcon,
    key: "trash",
  },
];

export function AppSidebar({ active }: { active: string }) {
  return (
    <div className="min-w-64 border-r">
      <div className="flex items-center justify-center px-2 py-4">
        <Button size="lg" className="w-full">
          <PlusIcon />
          New Email
        </Button>
      </div>
      <div className="relative flex flex-col gap-2 p-2">
        {mailboxes.map((mailbox) => (
          <NavLink key={mailbox.key} to={`/${mailbox.key}`}>
            <div
              className={cn(
                "hover:bg-accent/70 flex gap-4 rounded-sm px-4 py-3 font-semibold",
                active === mailbox.key ? "bg-accent/60 text-gray-200" : "text-muted-foreground",
              )}
            >
              <mailbox.icon className="size-6" />
              <span>{mailbox.name}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
