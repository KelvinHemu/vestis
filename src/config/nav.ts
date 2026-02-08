import type { LucideIcon } from "lucide-react";
import {
  Store,
  Plus,
  Users,
  Image,
  Grid,
  CreditCard,
} from "lucide-react";

export type NavItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  badge: string | null;
};

export const DASHBOARD_NAV: NavItem[] = [
  { icon: Store, label: "Shop", path: "/shop", badge: null },
  { icon: Plus, label: "Create", path: "/create", badge: null },
  { icon: Users, label: "Models", path: "/models", badge: null },
  { icon: Image, label: "Backgrounds", path: "/backgrounds", badge: null },
  { icon: Grid, label: "Projects", path: "/projects", badge: null },
  { icon: CreditCard, label: "Payment", path: "/payment", badge: null },
];
