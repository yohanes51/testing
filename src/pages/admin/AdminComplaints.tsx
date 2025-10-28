import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Complaint {
  id: string;
  email: string;
  phone: string;
  room_number: string;
  location: string;
  description: string;
  photo_url: string | null;
  status: string;
  created_at: string;
}

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchComplaints();
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredComplaints(complaints);
    } else {
      setFilteredComplaints(complaints.filter((c) => c.status === statusFilter));
    }
  }, [statusFilter, complaints]);

  const checkAdminAndFetchComplaints = async () => {
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

    fetchComplaints();
  };

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat data pengaduan");
      return;
    }

    setComplaints(data || []);
    setFilteredComplaints(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("complaints")
      .update({ status: newStatus as any })
      .eq("id", id);

    if (error) {
      toast.error("Gagal memperbarui status");
      return;
    }

    toast.success("Status berhasil diperbarui");
    fetchComplaints();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pengaduan ini?")) return;

    const { error } = await supabase
      .from("complaints")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus pengaduan");
      return;
    }

    toast.success("Pengaduan berhasil dihapus");
    fetchComplaints();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      in_progress: "default",
      completed: "default",
    };

    const labels: Record<string, string> = {
      pending: "Menunggu",
      in_progress: "Dalam Perbaikan",
      completed: "Selesai",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
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
        <CardHeader>
          <CardTitle>Data Pengaduan</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="pending">Menunggu</TabsTrigger>
              <TabsTrigger value="in_progress">Dalam Perbaikan</TabsTrigger>
              <TabsTrigger value="completed">Selesai</TabsTrigger>
            </TabsList>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead>No. Kamar</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>{complaint.email}</TableCell>
                  <TableCell>{complaint.phone}</TableCell>
                  <TableCell>{complaint.room_number}</TableCell>
                  <TableCell className="capitalize">{complaint.location}</TableCell>
                  <TableCell>{new Date(complaint.created_at).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setIsDetailOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(complaint.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pengaduan</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedComplaint.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No. HP</p>
                <p className="font-medium">{selectedComplaint.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No. Kamar</p>
                <p className="font-medium">{selectedComplaint.room_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lokasi</p>
                <p className="font-medium capitalize">{selectedComplaint.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deskripsi</p>
                <p className="font-medium">{selectedComplaint.description}</p>
              </div>
              {selectedComplaint.photo_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Foto Bukti</p>
                  <img
                    src={selectedComplaint.photo_url}
                    alt="Bukti pengaduan"
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <Select
                  value={selectedComplaint.status}
                  onValueChange={(value) => handleStatusChange(selectedComplaint.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="in_progress">Dalam Perbaikan</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminComplaints;