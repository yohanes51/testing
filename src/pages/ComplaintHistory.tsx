import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching complaints:", error);
      } else {
        setComplaints(data || []);
      }
      setLoading(false);
    };

    fetchComplaints();
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      in_progress: "default",
      completed: "outline",
    };

    const labels: any = {
      pending: "Menunggu",
      in_progress: "Dalam Perbaikan",
      completed: "Selesai",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getLocationLabel = (location: string) => {
    const labels: any = {
      room: "Kamar",
      parking: "Parkiran",
      kitchen: "Dapur",
      bathroom: "Kamar Mandi",
      common_area: "Area Umum",
      other: "Lainnya",
    };
    return labels[location] || location;
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

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Riwayat Pengaduan</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada pengaduan
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                        <TableCell>{getLocationLabel(complaint.location)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {complaint.description}
                        </TableCell>
                        <TableCell>
                          {format(new Date(complaint.created_at), "dd MMM yyyy, HH:mm", {
                            locale: indonesianLocale,
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintHistory;