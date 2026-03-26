import { AppShell } from "@/app/[locale]/components/AppShell";
import { LoginForm } from "@/app/[locale]/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AppShell title="Přihlášení">
      <LoginForm />
    </AppShell>
  );
}
