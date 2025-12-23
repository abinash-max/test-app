import { NavLink } from "react-router-dom";
import { Home, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              Personalize
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-smooth",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )
              }
            >
              <Home className="h-4 w-4" />
              <span>Home Goods</span>
            </NavLink>
            <NavLink
              to="/fashion"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-smooth",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )
              }
            >
              <Shirt className="h-4 w-4" />
              <span>Fashion</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
