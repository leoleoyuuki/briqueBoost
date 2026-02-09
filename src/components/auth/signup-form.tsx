'use client';

import Link from "next/link";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, AuthErrorCodes } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

function getFriendlyAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case AuthErrorCodes.EMAIL_EXISTS:
        return 'Este endereço de e-mail já está em uso por outra conta.';
      case AuthErrorCodes.INVALID_EMAIL:
        return 'O formato do e-mail é inválido. Por favor, verifique e tente novamente.';
      case AuthErrorCodes.WEAK_PASSWORD:
        return 'A senha é muito fraca. Tente uma senha mais forte com pelo menos 6 caracteres.';
      default:
        return 'Ocorreu um erro desconhecido durante o cadastro. Por favor, tente novamente.';
    }
}

export function SignupForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with name
        await updateProfile(user, { displayName: name });

        // Create user document in Firestore
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
            id: user.uid,
            name: name,
            email: user.email,
            createdAt: serverTimestamp(),
        });
        
        router.push('/dashboard');
    } catch (e: any) {
      const friendlyMessage = getFriendlyAuthErrorMessage(e.code);
      setError(friendlyMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Crie sua conta</CardTitle>
          <CardDescription>É rápido e fácil. Vamos começar!</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erro no Cadastro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" placeholder="Seu nome completo" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <div className="text-center text-sm">
                Já tem uma conta?{" "}
                <Link href="/" className="underline text-primary">
                Faça login
                </Link>
            </div>
        </CardFooter>
      </Card>
    </form>
  );
}
