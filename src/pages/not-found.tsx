import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, ArrowLeft, Search } from "lucide-react"
import { useNavigate } from "react-router"

export const NotFound = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate("/")
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          {/* 404 Number */}
          <div className="space-y-2">
            <h1 className="text-8xl font-bold text-slate-300 select-none">404</h1>
            <div className="w-16 h-1 bg-slate-300 mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-800">Página no encontrada</h2>
            <p className="text-slate-600 leading-relaxed">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>

          {/* Search Icon Illustration */}
          <div className="py-4">
            <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleGoHome} className="w-full" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Ir al inicio
            </Button>

            <Button onClick={handleGoBack} variant="outline" className="w-full bg-transparent" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver atrás
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-slate-500 pt-4">
            Si crees que esto es un error, por favor{" "}
            <button
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={() => (window.location.href = "mailto:support@example.com")}
            >
              contáctenos
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}