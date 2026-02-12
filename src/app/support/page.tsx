'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy, MessageSquare, Calendar, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SupportPage() {

    const whatsappLink = "https://wa.me/5511957211546?text=Ol%C3%A1%2C%20Leonardo%21%20Preciso%20de%20ajuda%20com%20o%20BriqueBoost.";
    // Lembre-se de substituir pelo seu link real do Calendly
    const calendlyLink = "https://calendly.com/d/ckz6-qdd-xbc/reuniao-briqueboost";

    return (
        <div className="flex justify-center items-start pt-10">
            <Card className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border-slate-800 rounded-3xl">
                <CardHeader className="text-center items-center">
                    <div className="bg-blue-500/10 p-4 rounded-full mb-4">
                        <LifeBuoy className="h-10 w-10 text-blue-400" />
                    </div>
                    <CardTitle className="font-headline text-3xl text-slate-100">Suporte & Onboarding</CardTitle>
                    <CardDescription className="text-slate-400 max-w-md">
                        Precisa de ajuda ou quer uma apresentação guiada da plataforma? Entre em contato ou agende um horário.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-4">
                    <div className="flex justify-center items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-300">
                            <User className="h-5 w-5 text-slate-500" />
                            <span className="font-medium">Responsável:</span>
                            <span>Leonardo</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button asChild className="w-full h-14 text-base bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300">
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Enviar Mensagem
                        </a>
                    </Button>
                    <Button asChild className="w-full h-14 text-base bg-blue-600 hover:bg-blue-500">
                        <a href={calendlyLink} target="_blank" rel="noopener noreferrer">
                            <Calendar className="mr-2 h-5 w-5" />
                            Agendar Onboarding
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
