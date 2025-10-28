import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ClipboardList, FileText, User, LogOut, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Berhasil logout");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <nav className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Jevan Kost</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Selamat Datang, {profile?.first_name}!
          </h2>
          <p className="text-muted-foreground">
            Sistem pengaduan kos untuk penghuni Jevan Kost
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/complaint")}>
            <CardHeader>
              <AlertCircle className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Buat Pengaduan</CardTitle>
              <CardDescription>
                Laporkan masalah atau keluhan fasilitas kos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Adukan Sekarang</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/complaint-history")}>
            <CardHeader>
              <FileText className="h-10 w-10 text-secondary mb-2" />
              <CardTitle>Riwayat Pengaduan</CardTitle>
              <CardDescription>
                Lihat status dan detail pengaduan Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Lihat Riwayat</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/profile")}>
            <CardHeader>
              <User className="h-10 w-10 text-accent-foreground mb-2" />
              <CardTitle>Profil Saya</CardTitle>
              <CardDescription>
                Kelola informasi akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Lihat Profil</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tentang Sistem Pengaduan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sistem Pengaduan Jevan Kost memudahkan penghuni untuk melaporkan masalah fasilitas,
              kebersihan, atau kerusakan yang terjadi di area kos. Setiap pengaduan akan diproses
              dan ditindaklanjuti oleh tim pengelola kos untuk memberikan kenyamanan maksimal bagi
              seluruh penghuni.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;