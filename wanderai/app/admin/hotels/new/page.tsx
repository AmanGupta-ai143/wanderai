import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import HotelForm from "@/components/admin/HotelForm";

export default function NewHotelPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Add hotel</h1>
        <HotelForm mode="create" />
      </AdminShell>
    </AdminGuard>
  );
}
