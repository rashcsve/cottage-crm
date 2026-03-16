import { AppShell } from "@/app/components/AppShell";
import { SignupForm } from "@/app/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AppShell title="Registrace">
      <SignupForm />
    </AppShell>
  );
}
