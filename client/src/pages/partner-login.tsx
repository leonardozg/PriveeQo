import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, User } from "lucide-react";
import { partnerLoginSchema } from "@shared/schema";
import { usePartnerAuth } from "@/hooks/use-partner-auth";
import { z } from "zod";
import priveeLogoPath from "@assets/Hires jpeg-05_1754761049044.jpg";

type LoginFormData = z.infer<typeof partnerLoginSchema>;

export default function PartnerLogin() {
  const { loginMutation } = usePartnerAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(partnerLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4" style={{ fontFamily: 'var(--font-arial)' }}>
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 items-center">
        {/* Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border-gray-200">
            <CardHeader className="text-center pb-4">
              {/* PRIVEE Logo */}
              <div className="mx-auto mb-4">
                <img 
                  src={priveeLogoPath} 
                  alt="PRIVEE Logo" 
                  className="h-40 w-40 mx-auto object-contain"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium tracking-wide">PORTAL DE SOCIOS</p>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Ingresa tu usuario"
                            disabled={loginMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Ingresa tu contraseña"
                              disabled={loginMutation.isPending}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full privee-button-primary"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ingresando...
                      </>
                    ) : (
                      "Ingresar"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-700">
                  <strong>Socios nuevos:</strong> Contacta al administrador para obtener tus credenciales.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section */}
        <div className="flex items-center justify-center lg:pl-8">
          <div className="text-center lg:text-left max-w-lg">
            <div className="mb-6">
              <h2 className="text-2xl text-gray-700 mb-4 font-semibold">
                Portal de Socios Exclusivo
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Plataforma profesional para la creación de cotizaciones de eventos únicos y memorables. 
                Accede a nuestro catálogo completo de servicios premium.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Cotizaciones profesionales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Márgenes personalizables</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Enlaces seguros compartibles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Catálogo completo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}