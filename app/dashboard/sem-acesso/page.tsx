"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfiguracoesPage() {
    return (
        <div className="space-y-6 items-center text-center">
            <Card>
                <CardContent>
                    <div className="flex h-[300px] items-center text-center justify-center">
                        <div className="flex-cols space-y-4">
                            <h1 className="text-3xl text-center text-emerald-700 font-bold">
                                Acesso Negado
                            </h1>
                            <div className="flex-shrink-0">
                                <span className="text-muted-foreground">
                                    Não tem permissão para aceder a este recurso do sistema. Contacte o administrador
                                    para saber mais.
                                </span>
                            </div>

                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}