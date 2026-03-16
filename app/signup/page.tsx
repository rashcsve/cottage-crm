import { AppShell } from "@/components/AppShell";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AppShell title="Registrace">
      <SignupForm />
    </AppShell>
  );
}
