import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="h-24 w-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-xl">
              <Shield className="h-14 w-14 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Jevan Kost
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sistem Pengaduan Kos yang Mudah dan Efisien
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Masuk
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Daftar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
