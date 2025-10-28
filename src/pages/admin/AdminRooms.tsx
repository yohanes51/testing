
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Room {
  id: string;
  room_number: string;
  room_name: string;
  description: string | null;
  photo_url: string | null;
}

const AdminRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    room_number: "",
    room_name: "",
    description: "",
    photo_url: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchRooms();
  }, []);

  const checkAdminAndFetchRooms = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchRooms();
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("room_number", { ascending: true });

    if (error) {
      toast.error("Gagal memuat data kamar");
      return;
    }

    setRooms(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRoom) {
      const { error } = await supabase
        .from("rooms")
        .update(formData)
        .eq("id", editingRoom.id);

      if (error) {
        toast.error("Gagal memperbarui data kamar");
        return;
      }

      toast.success("Data kamar berhasil diperbarui");
    } else {
      const { error } = await supabase
        .from("rooms")
        .insert([formData]);

      if (error) {
        toast.error("Gagal menambahkan kamar");
        return;
      }

      toast.success("Kamar berhasil ditambahkan");
    }

    setIsDialogOpen(false);
    setEditingRoom(null);
    resetForm();
    fetchRooms();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kamar ini?")) return;

    const { error } = await supabase
      .from("rooms")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus kamar");
      return;
    }

    toast.success("Kamar berhasil dihapus");
    fetchRooms();
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_name: room.room_name,
      description: room.description || "",
      photo_url: room.photo_url || "",
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingRoom(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      room_number: "",
      room_name: "",
      description: "",
      photo_url: "",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">Memuat...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Data Kamar</CardTitle>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kamar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id}>
                {room.photo_url && (
                  <img
                    src={room.photo_url}
                    alt={room.room_name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg">{room.room_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">No. {room.room_number}</p>
                  <p className="text-sm mb-4">{room.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(room)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(room.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Kamar" : "Tambah Kamar"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="room_number">Nomor Kamar</Label>
              <Input
                id="room_number"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="room_name">Nama Kamar</Label>
              <Input
                id="room_name"
                value={formData.room_name}
                onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="photo_url">URL Foto</Label>
              <Input
                id="photo_url"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            <Button type="submit" className="w-full">
              {editingRoom ? "Perbarui" : "Tambah"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminRooms;
