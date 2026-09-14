"use client";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { getVendorProfile } from "../../services/vendorService";
import { PageHeader } from "../../components/shared/page-header";
import { PageLoader } from "../../components/shared/page-loader";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";

const VendorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getVendorProfile();
        setProfile(res.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <div className="text-destructive p-6">{error}</div>;

  const joinedDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const profileFields = [
    { icon: User, label: "Full Name", value: profile.fullName },
    { icon: Mail, label: "Email Address", value: profile.email },
    { icon: Phone, label: "Phone", value: profile.phone || "Not provided" },
    { icon: Shield, label: "Role", value: profile.role },
    { icon: Calendar, label: "Member Since", value: joinedDate },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="My Profile"
        description="View your account details."
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-4 p-6 bg-primary text-primary-foreground">
          <Avatar className="h-16 w-16 border-2 border-white/20">
            <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
              {profile.fullName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{profile.fullName}</h2>
            <Badge variant="secondary" className="mt-1 bg-white/20 text-white border-0 hover:bg-white/20">
              {profile.role}
            </Badge>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {profileFields.map(({ icon: Icon, label, value }, i) => (
              <div key={label} className={`flex items-start gap-3 p-4 ${i < profileFields.length - 1 ? "border-b sm:border-b-0" : ""} ${i % 2 === 0 ? "sm:border-r" : ""}`}>
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-3 p-4 border-t sm:border-t-0 sm:border-l">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle size={16} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Account Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${profile.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span className="text-sm font-medium text-foreground">{profile.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfile;
