"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
  Ticket,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateCouponDialog } from "./CreateCouponDialog";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from "@/services/adminService";

export function CouponList({ type = "USER" }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getCoupons(page, search, type);
      setCoupons(res.data.coupons || []);
      setPagination(res.data.pagination || { total: 0, pages: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [page, search, type]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    setPage(1);
  }, [search, type]);

  const handleCreate = () => {
    setEditingCoupon(null);
    setDialogOpen(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError("");
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, data);
        setMessage("Coupon updated successfully");
      } else {
        await createCoupon(data);
        setMessage("Coupon created successfully");
      }
      setDialogOpen(false);
      setEditingCoupon(null);
      fetchCoupons();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      setError("");
      await toggleCouponStatus(coupon._id);
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDeleteClick = (coupon) => {
    setDeletingCoupon(coupon);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCoupon) return;
    try {
      setDeleting(true);
      setError("");
      await deleteCoupon(deletingCoupon._id);
      setMessage("Coupon deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingCoupon(null);
      fetchCoupons();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete coupon");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${type === "VENDOR" ? "vendor" : "user"} coupons...`}
          />
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-destructive hover:text-destructive"
            onClick={() => setError("")}
          >
            Dismiss
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No Coupons Found"
          description={
            search
              ? "No coupons match your search."
              : `No ${type === "VENDOR" ? "vendor" : "user"} coupons created yet.`
          }
          action={
            !search ? (
              <Button onClick={handleCreate} size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Create First Coupon
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Text</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-bold">
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {coupon.discountPercent}%
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {coupon.text || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        {coupon.assignedTo ? (
                          <>
                            <p className="text-sm font-medium truncate">
                              {coupon.assignedTo.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {coupon.assignedTo.email}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            All {type === "VENDOR" ? "Vendors" : "Users"}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {coupon.validUntil ? formatDate(coupon.validUntil) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={coupon.status === "active" ? "success" : "warning"}
                        className="capitalize"
                      >
                        {coupon.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(coupon.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(coupon)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleToggleStatus(coupon)}
                          title={coupon.status === "active" ? "Deactivate" : "Activate"}
                        >
                          <CheckCircle
                            className={`h-4 w-4 ${
                              coupon.status === "active"
                                ? "text-emerald-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(coupon)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of{" "}
                {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <CreateCouponDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        coupon={editingCoupon}
        type={type}
        loading={submitting}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${deletingCoupon?.code}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingCoupon(null);
        }}
        loading={deleting}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
