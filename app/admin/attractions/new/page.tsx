import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import AttractionForm from "@/components/admin/AttractionForm";

export default function NewAttractionPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Add attraction</h1>
        <AttractionForm mode="create" />
      </AdminShell>
    </AdminGuard>
  );
}
