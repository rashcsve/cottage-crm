import { AppShell } from "@/app/components/AppShell";
import { LoginForm } from "@/app/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AppShell title="Přihlášení">
      <LoginForm />
    </AppShell>
  );
}
