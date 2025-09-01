import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MindTrack</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hesap Oluştur</h1>
          <p className="text-gray-600">14 gün ücretsiz deneme başlatın</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Ücretsiz Deneme Başlat</CardTitle>
            <CardDescription>
              Kredi kartı gerekmez. İstediğiniz zaman iptal edin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input id="name" placeholder="Dr. John Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="practice">Pratik Adı</Label>
              <Input id="practice" placeholder="Johnson Therapy Practice" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialty">Uzmanlık</Label>
              <select id="specialty" className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">Seçiniz</option>
                <option value="psychiatrist">Psikiyatrist</option>
                <option value="psychologist">Psikolog</option>
                <option value="therapist">Terapist</option>
                <option value="counselor">Danışman</option>
              </select>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Ücretsiz Deneme Başlat
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Kayıt olarak <Link href="/terms" className="text-blue-600">Kullanım Şartları</Link> ve{' '}
              <Link href="/privacy" className="text-blue-600">Gizlilik Politikası</Link>'nı kabul etmiş olursunuz.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
