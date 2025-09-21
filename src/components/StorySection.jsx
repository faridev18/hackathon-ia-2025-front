import { Upload, Cpu, FileText } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Téléchargez vos documents",
    description: "Importez facilement vos documents fonciers ou images satellites dans notre plateforme sécurisée.",
  },
  {
    icon: Cpu,
    title: "L'IA analyse et vérifie",
    description:
      "Notre intelligence artificielle examine vos données, détecte les anomalies et vérifie l'authenticité.",
  },
  {
    icon: FileText,
    title: "Recevez votre rapport",
    description: "Obtenez un rapport détaillé avec l'assistance de notre chatbot pour toute question.",
  },
]

export function StorySection() {
  return (
    <section id="story" className="py-24 bg-gray-900/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Comment ça marche ?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto text-pretty">
            Un processus simple en 3 étapes pour sécuriser et vérifier vos données foncières.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transform -translate-y-1/2"></div>
            <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transform -translate-y-1/2"></div>

            {steps.map((step, index) => (
              <div key={index} className="custom-card relative">
                <div className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 relative">
                    <step.icon className="h-8 w-8 text-green-400" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
