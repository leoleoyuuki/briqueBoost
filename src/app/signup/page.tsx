import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="h-16 w-16 text-primary" />
          <h1 className="mt-4 text-4xl font-bold font-headline text-primary">
            BriqueBoost
          </h1>
          <p className="mt-2 text-center text-muted-foreground">
            Crie sua conta e comece a lucrar hoje mesmo.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
