import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import FoodForm from "@/components/admin/FoodForm";

export default function NewFoodPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Add food item</h1>
        <FoodForm mode="create" />
      </AdminShell>
    </AdminGuard>
  );
}
