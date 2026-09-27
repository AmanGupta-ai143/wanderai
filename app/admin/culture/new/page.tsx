import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import CultureForm from "@/components/admin/CultureForm";

export default function NewCulturePage() {
  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Add culture item</h1>
        <CultureForm mode="create" />
      </AdminShell>
    </AdminGuard>
  );
}
