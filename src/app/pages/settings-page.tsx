import { User, Bell, Shield, Palette, Database } from "lucide-react";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Configurações</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 pb-24 sm:pb-8">
        {/* Profile Settings */}
        <Card className="p-4 sm:p-6 bg-white border-gray-200">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <h2 className="font-semibold text-sm sm:text-base text-gray-900">Perfil</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm">Nome</Label>
              <Input id="name" defaultValue="Usuário" className="bg-white border-gray-300 h-10 sm:h-11 text-sm sm:text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="usuario@email.com"
                className="bg-white border-gray-300 h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base">
              Salvar Alterações
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-4 sm:p-6 bg-white border-gray-200">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <h2 className="font-semibold text-sm sm:text-base text-gray-900">Notificações</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1 min-w-0">
                <Label className="text-xs sm:text-sm">Lembretes de leitura</Label>
                <p className="text-xs text-gray-600">
                  Receba lembretes diários para manter sua sequência
                </p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1 min-w-0">
                <Label className="text-xs sm:text-sm">Conquistas</Label>
                <p className="text-xs text-gray-600">
                  Notificações quando desbloquear novas conquistas
                </p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1 min-w-0">
                <Label className="text-xs sm:text-sm">Progresso de metas</Label>
                <p className="text-xs text-gray-600">
                  Atualizações semanais sobre o progresso das suas metas
                </p>
              </div>
              <Switch className="flex-shrink-0" />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-4 sm:p-6 bg-white border-gray-200">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <h2 className="font-semibold text-sm sm:text-base text-gray-900">Aparência</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1 min-w-0">
                <Label className="text-xs sm:text-sm">Modo escuro</Label>
                <p className="text-xs text-gray-600">
                  Ative o tema escuro para reduzir o cansaço visual
                </p>
              </div>
              <Switch className="flex-shrink-0" />
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-4 sm:p-6 bg-white border-gray-200">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <h2 className="font-semibold text-sm sm:text-base text-gray-900">Privacidade & Segurança</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <Button variant="outline" className="w-full justify-start h-10 sm:h-11 text-sm sm:text-base">
              Alterar senha
            </Button>
            <Button variant="outline" className="w-full justify-start h-10 sm:h-11 text-sm sm:text-base">
              Gerenciar dados pessoais
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 h-10 sm:h-11 text-sm sm:text-base">
              Excluir conta
            </Button>
          </div>
        </Card>

        {/* Data */}
        <Card className="p-4 sm:p-6 bg-white border-gray-200">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <h2 className="font-semibold text-sm sm:text-base text-gray-900">Dados</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <Button variant="outline" className="w-full justify-start h-10 sm:h-11 text-sm sm:text-base">
              Exportar biblioteca
            </Button>
            <Button variant="outline" className="w-full justify-start h-10 sm:h-11 text-sm sm:text-base">
              Importar livros (CSV)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}