import { FeedShell } from "@/components/feed/FeedShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <FeedShell>{children}</FeedShell>;
}
