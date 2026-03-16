import { AppShell } from "@/components/AppShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AppShell title="Přihlášení">
      <LoginForm />
    </AppShell>
  );
}
