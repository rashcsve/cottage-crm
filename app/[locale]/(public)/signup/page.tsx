import { AppShell } from "@/app/[locale]/components/AppShell";
import { SignupForm } from "@/app/[locale]/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AppShell title="Registrace">
      <SignupForm />
    </AppShell>
  );
}
