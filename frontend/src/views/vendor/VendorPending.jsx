"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Clock, LogOut, Printer } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

const VendorPending = () => {
  const { user, logout, vendorOnboarding } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-6">
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Printer size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Local Printer</span>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-5">
                <Clock size={36} />
              </div>

              <h1 className="text-xl font-bold text-foreground mb-2">
                Business Details Submitted Successfully
              </h1>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Your business registration has been successfully submitted.
              </p>

              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 mb-5 gap-1.5 px-3 py-1.5 flex-wrap justify-center">
                <Clock size={14} className="shrink-0" />
                <span>Status: Pending Admin Approval</span>
              </Badge>

              {vendorOnboarding?.businessName && (
                <div className="p-3 bg-muted rounded-lg mb-5 text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Business Name</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{vendorOnboarding.businessName}</p>
                </div>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Our admin team is reviewing your business details.
                You will get access to your Vendor Dashboard once your business is approved.
              </p>

              <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorPending;
