'use client';

import Link from "next/link";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, AuthErrorCodes } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case AuthErrorCodes.INVALID_EMAIL:
      return 'O formato do e-mail é inválido. Por favor, verifique e tente novamente.';
    case AuthErrorCodes.USER_DELETED:
      return 'Esta conta de usuário foi excluída.';
    case AuthErrorCodes.INVALID_PASSWORD:
    case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
      return 'A senha ou o e-mail estão incorretos. Por favor, tente novamente.';
    case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
      return 'O acesso a esta conta foi temporariamente desativado due a muitas tentativas de login. Tente novamente mais tarde.';
    default:
      return 'Ocorreu um erro desconhecido durante o login. Por favor, tente novamente.';
  }
}

export function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (e: any) {
      const friendlyMessage = getFriendlyAuthErrorMessage(e.code);
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <Card className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800 rounded-3xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl text-slate-100">Acesse sua conta</CardTitle>
          <CardDescription className="text-slate-400">Bem-vindo de volta! Faça login para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erro no Login</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-400">Email</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} 
                   className="bg-slate-800 border-slate-700 rounded-xl h-11" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-slate-400">Senha</Label>
            <Input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                   className="bg-slate-800 border-slate-700 rounded-xl h-11" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl h-11 text-base font-medium" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          <div className="text-center text-sm text-slate-400">
            Não tem uma conta?{" "}
            <Link href="/signup" className="underline text-blue-400 hover:text-blue-300">
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
