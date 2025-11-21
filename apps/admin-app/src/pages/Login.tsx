import { Button, Input } from "@marlion/ui";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card max-w-md w-full p-8">
        <h1 className="text-3xl font-bold gradient-text text-center mb-8">
          Admin Login
        </h1>
        <form className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="admin@marliontech.com"
          />
          <Input label="Password" type="password" placeholder="••••••••" />
          <Button className="w-full" size="lg">
            Sign In
          </Button>
        </form>
        <p className="text-center text-marlion-muted mt-6 text-sm">
          Admin access only. No sign-up available.
        </p>
      </div>
    </div>
  );
}
