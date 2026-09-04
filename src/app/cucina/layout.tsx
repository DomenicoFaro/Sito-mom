import { redirect } from "next/navigation";
import { getStaffProfile } from "@/lib/staff";
import { StaffHeader } from "@/components/StaffHeader";

export default async function CucinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getStaffProfile();
  if (!profile || !["cucina", "admin"].includes(profile.role)) {
    redirect("/staff/login");
  }

  return (
    <div className="min-h-screen bg-abyss text-ink">
      <StaffHeader profile={profile} />
      {children}
    </div>
  );
}
