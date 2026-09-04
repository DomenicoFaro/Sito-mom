import { redirect } from "next/navigation";
import { getStaffProfile } from "@/lib/staff";
import { StaffHeader } from "@/components/StaffHeader";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getStaffProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/staff/login");
  }

  return (
    <div className="min-h-screen bg-abyss text-ink">
      <StaffHeader profile={profile} />
      <AdminNav />
      {children}
    </div>
  );
}
