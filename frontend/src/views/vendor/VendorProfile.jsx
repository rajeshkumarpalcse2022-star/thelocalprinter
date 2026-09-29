"use client";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle,
  Pencil,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getVendorProfile,
  updateVendorProfile,
} from "../../services/vendorService";
import { PageHeader } from "../../components/shared/page-header";
import { PageLoader } from "../../components/shared/page-loader";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const VendorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ fullName: "", phone: "", whatsappNumber: "" });

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEdit = () => {
    setSaveError("");
    setForm({
      fullName: profile?.fullName || "",
      phone: profile?.phone || "",
      whatsappNumber: profile?.whatsappNumber || "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      setSaveError("Full name must be at least 2 characters");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const res = await updateVendorProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
      });
      setNotice(res.message || "Profile change submitted for admin approval.");
      setEditOpen(false);
      await fetchProfile();
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to submit profile change");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <div className="text-destructive p-6">{error}</div>;

  const joinedDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pendingChange = profile.pendingProfileChange || null;

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
        description="Profile changes go live only after admin approval."
        actions={
          <Button onClick={openEdit} className="gap-2" disabled={!!pendingChange}>
            <Pencil size={16} />
            Edit Profile
          </Button>
        }
      />

      {notice && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <span>{notice}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
            onClick={() => setNotice("")}
          >
            Dismiss
          </Button>
        </div>
      )}

      {pendingChange && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Profile change waiting for admin approval</p>
            <p className="mt-1 text-xs leading-relaxed opacity-90">
              Requested on {new Date(pendingChange.submittedAt).toLocaleString()}
              {pendingChange.fullName ? ` · New name: ${pendingChange.fullName}` : ""}
              {pendingChange.phone ? ` · New phone: ${pendingChange.phone}` : ""}
              . Your current profile stays live until approved.
            </p>
          </div>
        </div>
      )}

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

      <Dialog open={editOpen} onOpenChange={(open) => !saving && setEditOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Your changes will be reviewed by an admin before they go live.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {saveError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                value={form.whatsappNumber}
                onChange={(e) => setForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
                placeholder="Enter WhatsApp number"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit for Approval"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorProfile;
