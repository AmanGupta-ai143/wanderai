import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import DestinationForm from "@/components/admin/DestinationForm";

export default function NewDestinationPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Add destination</h1>
        <DestinationForm mode="create" />
      </AdminShell>
    </AdminGuard>
  );
}
