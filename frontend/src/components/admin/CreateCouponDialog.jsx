"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchUsersForCoupon } from "@/services/adminService";

export function CreateCouponDialog({
  open,
  onOpenChange,
  onSubmit,
  coupon = null,
  type = "USER",
  loading = false,
}) {
  const isEdit = !!coupon;

  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [text, setText] = useState("");
  const [assignedTo, setAssignedTo] = useState(null);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [status, setStatus] = useState("active");
  const [errors, setErrors] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code || "");
      setDiscountPercent(coupon.discountPercent?.toString() || "");
      setText(coupon.text || "");
      setAssignedTo(coupon.assignedTo || null);
      setValidFrom(coupon.validFrom ? new Date(coupon.validFrom).toISOString().split("T")[0] : "");
      setValidUntil(coupon.validUntil ? new Date(coupon.validUntil).toISOString().split("T")[0] : "");
      setStatus(coupon.status || "active");
    } else {
      setCode("");
      setDiscountPercent("");
      setText("");
      setAssignedTo(null);
      setValidFrom("");
      setValidUntil("");
      setStatus("active");
    }
    setErrors({});
    setSearchQuery("");
    setSearchResults([]);
  }, [coupon, open]);

  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      setSearching(true);
      const role = type === "VENDOR" ? "VENDOR" : "USER";
      const res = await searchUsersForCoupon(query, role);
      setSearchResults(res.data.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const validate = () => {
    const newErrors = {};
    if (!code.trim()) newErrors.code = "Coupon code is required";
    const disc = Number(discountPercent);
    if (!discountPercent || isNaN(disc) || disc < 1 || disc > 100) {
      newErrors.discountPercent = "Enter a valid percentage (1-100)";
    }
    if (validFrom && validUntil && new Date(validUntil) < new Date(validFrom)) {
      newErrors.validUntil = "End date cannot be before start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      code: code.trim().toUpperCase(),
      discountPercent: Number(discountPercent),
      text: text.trim(),
      assignedTo: assignedTo?._id || null,
      type,
      validFrom: validFrom || null,
      validUntil: validUntil || null,
      status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the coupon details below."
              : `Create a new coupon for ${type === "VENDOR" ? "vendors" : "users"}. Leave user unassigned to make it available to all.`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <form onSubmit={handleSubmit} className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Coupon Code *</Label>
              <Input
                id="coupon-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. DIWALI50"
                className="font-mono"
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-discount">Discount Percentage (%) *</Label>
              <Input
                id="coupon-discount"
                type="number"
                min="1"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="e.g. 30"
              />
              {errors.discountPercent && (
                <p className="text-xs text-destructive">{errors.discountPercent}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-text">Coupon Text (Optional)</Label>
              <Input
                id="coupon-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Diwali Voucher, Special Offer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-valid-from">Valid From (Optional)</Label>
                <Input
                  id="coupon-valid-from"
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-valid-until">Valid Until (Optional)</Label>
                <Input
                  id="coupon-valid-until"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
                {errors.validUntil && (
                  <p className="text-xs text-destructive">{errors.validUntil}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assign {type === "VENDOR" ? "Vendor" : "User"} (Optional)</Label>
              {assignedTo ? (
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{assignedTo.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {assignedTo.email}
                      {assignedTo.publicId ? ` (${assignedTo.publicId})` : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAssignedTo(null)}
                    className="ml-2 shrink-0"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${type === "VENDOR" ? "vendors" : "users"} by name, email, or ID...`}
                      className="pl-9"
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {searchResults.length > 0 && (
                    <ScrollArea className="h-40 rounded-md border border-border">
                      <div className="p-1">
                        {searchResults.map((user) => (
                          <button
                            key={user._id}
                            type="button"
                            onClick={() => {
                              setAssignedTo(user);
                              setSearchQuery("");
                              setSearchResults([]);
                            }}
                            className="flex w-full flex-col rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                          >
                            <span className="font-medium">{user.fullName}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                              {user.publicId ? ` (${user.publicId})` : ""}
                            </span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                  {searchQuery && !searching && searchResults.length === 0 && (
                    <p className="text-xs text-muted-foreground">No users found.</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Leave empty to make this coupon available to all {type === "VENDOR" ? "vendors" : "users"}.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-status">Status</Label>
              <select
                id="coupon-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} onClick={handleSubmit}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Coupon" : "Create Coupon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
