import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import EventForm from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Add event</h1>
        <EventForm mode="create" />
      </AdminShell>
    </AdminGuard>
  );
}
