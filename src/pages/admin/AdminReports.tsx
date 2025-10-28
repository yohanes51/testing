import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Complaint {
  id: string;
  location: string;
  status: string;
  created_at: string;
  description: string;
}

const AdminReports = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [locationStats, setLocationStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
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

    fetchData();
  };

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching complaints:", error);
      return;
    }

    setComplaints(data || []);

    const stats: Record<string, number> = {};
    data?.forEach((complaint) => {
      stats[complaint.location] = (stats[complaint.location] || 0) + 1;
    });
    setLocationStats(stats);

    setLoading(false);
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Data Laporan</h1>
          <p className="text-muted-foreground">Ringkasan dan statistik pengaduan</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lokasi Pengaduan Terbanyak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(locationStats)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([location, count]) => (
                    <div key={location} className="flex justify-between items-center">
                      <span className="capitalize">{location}</span>
                      <Badge>{count} pengaduan</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Pengaduan</span>
                  <Badge>{complaints.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Menunggu</span>
                  <Badge variant="secondary">
                    {complaints.filter((c) => c.status === "pending").length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Dalam Perbaikan</span>
                  <Badge>
                    {complaints.filter((c) => c.status === "in_progress").length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Selesai</span>
                  <Badge>
                    {complaints.filter((c) => c.status === "completed").length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengaduan Lengkap</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint, index) => (
                  <TableRow key={complaint.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="capitalize">{complaint.location}</TableCell>
                    <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                    <TableCell>{new Date(complaint.created_at).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;