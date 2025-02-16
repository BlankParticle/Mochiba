import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@web/components/ui/dropdown-menu";
import { authClient, type AuthSession } from "@web/lib/auth-client";
import { Avatar, AvatarFallback } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { Link, useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { SunIcon } from "lucide-react";

export function Navbar({ session }: { session: AuthSession | null }) {
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  return (
    <div className="flex h-16 w-full border-b p-4">
      <div className="flex items-center justify-center text-2xl font-bold">Mochiba</div>
      <div className="flex-1" />
      <div className="flex items-end justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme((theme) => (theme === "dark" ? "light" : "dark"))}
        >
          <SunIcon />
        </Button>
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback>{session.user.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={async () => {
                    await authClient.signOut();
                    navigate("/login");
                  }}
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
