import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Shield } from "lucide-react";
import { Link } from "wouter";
import priveeLogoPath from "@assets/Hires jpeg-05_1754761049044.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center py-16">
          <div className="flex justify-center items-center gap-6 mb-8">
            <img 
              src={priveeLogoPath} 
              alt="PRIVEE Logo" 
              className="h-20 w-auto"
            />
          </div>
          <p className="text-2xl text-gray-700 mb-8 font-medium">
            Un Santuario para Experiencias Únicas e Inolvidables
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Plataforma profesional para la gestión de cotizaciones de eventos exclusivos.
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin Portal */}
          <Card className="privee-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                <Shield className="h-8 w-8 text-gray-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Portal Administrativo</CardTitle>
              <CardDescription className="text-gray-600">
                Acceso completo para gestión de inventario, cotizaciones y análisis
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Gestión de productos y servicios</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Dashboard con estadísticas completas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Administración de socios</span>
                </div>
              </div>
              <Link href="/admin">
                <Button className="w-full privee-button-primary">
                  Acceder como Administrador
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Partner Portal */}
          <Card className="privee-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Portal de Socios</CardTitle>
              <CardDescription className="text-gray-600">
                Herramientas especializadas para crear cotizaciones profesionales
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Creación de cotizaciones personalizadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Ajuste de márgenes por proyecto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Enlaces compartibles para clientes</span>
                </div>
              </div>
              <Link href="/partner">
                <Button className="w-full privee-button-primary">
                  Acceder como Socio
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Access Information */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="privee-card p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Información de Acceso
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 text-gray-600 mr-2" />
                  Para Administradores
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Requiere credenciales de administrador</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Cambio de contraseña disponible en el panel</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Acceso completo a todas las funciones</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 text-gray-600 mr-2" />
                  Para Socios Nuevos
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Los administradores pueden crear cuentas de socios</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Contacta con el administrador para obtener acceso</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Cambio de contraseña disponible en tu portal</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p className="text-sm">
            © 2024 PRIVEE Eventos Exclusivos. Plataforma profesional de cotizaciones.
          </p>
        </div>
      </div>
    </div>
  );
}