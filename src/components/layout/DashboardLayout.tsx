import Sidebar from "./Sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid grid-cols-[15rem_1fr]">
        <Sidebar />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
