import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <AuthForm mode="login" />
    </div>
  );
}
