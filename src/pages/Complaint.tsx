import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";

const Complaint = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    photoUrl: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(data);
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !profile) {
      toast.error("Sesi tidak valid");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("complaints").insert([{
      user_id: session.user.id,
      room_number: profile.room_number,
      email: profile.email,
      phone: profile.phone,
      description: formData.description,
      location: formData.location as any,
      photo_url: formData.photoUrl || null,
    }]);

    if (error) {
      toast.error("Gagal mengirim pengaduan: " + error.message);
    } else {
      toast.success("Pengaduan berhasil dikirim!");
      navigate("/complaint-history");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <nav className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Jevan Kost</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Form Pengaduan</CardTitle>
            <CardDescription>
              Sampaikan keluhan atau masalah fasilitas kos Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input value={`${profile?.first_name} ${profile?.last_name}`} disabled />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email} disabled />
              </div>

              <div className="space-y-2">
                <Label>Nomor Telepon</Label>
                <Input value={profile?.phone} disabled />
              </div>

              <div className="space-y-2">
                <Label>Nomor Kamar</Label>
                <Input value={profile?.room_number} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lokasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room">Kamar</SelectItem>
                    <SelectItem value="parking">Parkiran</SelectItem>
                    <SelectItem value="kitchen">Dapur</SelectItem>
                    <SelectItem value="bathroom">Kamar Mandi</SelectItem>
                    <SelectItem value="common_area">Area Umum</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Masalah</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan masalah yang Anda alami..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoUrl">URL Foto Bukti (Opsional)</Label>
                <Input
                  id="photoUrl"
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Mengirim..." : "Kirim Pengaduan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Complaint;