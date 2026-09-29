"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  MoreHorizontal,
  Building2,
  MapPin,
  Eye,
} from "lucide-react";
import {
  getPendingApprovals,
  updateBusinessStatus,
  updateProfileChangeStatus,
  getAdminBusinessById,
} from "../../services/adminService";
import { PageHeader } from "../../components/shared/page-header";
import { EmptyState } from "../../components/shared/empty-state";
import { PageLoader } from "../../components/shared/page-loader";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

const AdminApprovals = () => {
  const [businesses, setBusinesses] = useState([]);
  const [profileChanges, setProfileChanges] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [profileActionLoading, setProfileActionLoading] = useState(null);
  const [profileConfirm, setProfileConfirm] = useState(null);
  const [changeDetailId, setChangeDetailId] = useState(null);
  const [changeDetail, setChangeDetail] = useState(null);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState("");

  const fetchApprovals = async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getPendingApprovals(p);
      setBusinesses(res.data.businesses);
      setProfileChanges(res.data.profileChanges || []);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals(page);
  }, [page]);

  const getChangeType = (b) => {
    if (b.pendingChange?.type === "DELETE") return "DELETE";
    if (b.pendingChange?.type === "EDIT") return "EDIT";
    if (b.status === "pending") return "NEW";
    return null;
  };

  const changeTypeMeta = {
    NEW: { label: "New Registration", className: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400" },
    EDIT: { label: "Change Request", className: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400" },
    DELETE: { label: "Delete Request", className: "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400" },
  };

  const humanizeKey = (key) =>
    String(key)
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/^./, (c) => c.toUpperCase());

  const formatDiffValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    if (Array.isArray(value)) {
      if (!value.length) return "—";
      return value
        .map((item) =>
          item && typeof item === "object" ? JSON.stringify(item) : String(item)
        )
        .join(", ");
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") {
      const text = JSON.stringify(value);
      return text.length > 160 ? `${text.slice(0, 160)}…` : text;
    }
    return String(value);
  };

  const computeChanges = (business) => {
    const data = business?.pendingChange?.data || {};
    return Object.keys(data)
      .filter((key) => !["vendor", "createdAt", "updatedAt", "__v"].includes(key))
      .map((key) => ({ field: key, before: business[key], after: data[key] }))
      .filter(
        (c) => JSON.stringify(c.before ?? null) !== JSON.stringify(c.after ?? null)
      );
  };

  const openChangeDetail = async (id) => {
    setChangeDetailId(id);
    setChangeDetail(null);
    setChangeError("");
    setChangeLoading(true);
    try {
      const res = await getAdminBusinessById(id);
      setChangeDetail(res.data.business);
    } catch (err) {
      setChangeError(err.response?.data?.message || "Failed to load vendor changes");
    } finally {
      setChangeLoading(false);
    }
  };

  const closeChangeDetail = () => {
    setChangeDetailId(null);
    setChangeDetail(null);
    setChangeError("");
  };

  const handleAction = async (id, status) => {
    try {
      setActionLoading(id);
      setError("");
      await updateBusinessStatus(id, status);
      setBusinesses((prev) => prev.filter((b) => b._id !== id));
      setPagination((prev) =>
        prev ? { ...prev, total: prev.total - 1 } : prev
      );
      setConfirmAction(null);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status} business`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProfileAction = async (id, status) => {
    try {
      setProfileActionLoading(id);
      setError("");
      await updateProfileChangeStatus(id, status);
      setProfileChanges((prev) => prev.filter((p) => p._id !== id));
      setProfileConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status} profile change`);
    } finally {
      setProfileActionLoading(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Approvals"
        description="Review new business registrations, vendor change requests, deletions and profile edits."
      />

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-destructive hover:text-destructive"
            onClick={() => setError("")}
          >
            Dismiss
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <PageLoader text="Loading pending approvals..." />
          ) : businesses.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Clock}
                title={
                  profileChanges.length === 0
                    ? "No Pending Approvals"
                    : "No Business Requests"
                }
                description={
                  profileChanges.length === 0
                    ? "All caught up! No businesses waiting for review."
                    : "Vendor profile changes are listed below."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead className="hidden sm:table-cell">Vendor</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((b) => {
                    const changeType = getChangeType(b);
                    const meta = changeType ? changeTypeMeta[changeType] : null;
                    return (
                    <TableRow key={b._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-xs font-semibold">
                              {getInitials(b.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">{b.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {b.description?.slice(0, 40) || "No description"}
                            </p>
                            {meta && (
                              <span
                                className={`inline-block mt-1.5 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.className}`}
                              >
                                {meta.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="min-w-0">
                          <p className="text-sm truncate">{b.vendor?.fullName || "-"}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {b.vendor?.email || ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {b.city ? (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {b.city}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {new Date(b.pendingChange?.submittedAt || b.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {(changeType === "EDIT" || changeType === "DELETE") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="relative h-8 w-8 p-0"
                              title="View vendor changes"
                              onClick={() => openChangeDetail(b._id)}
                              disabled={changeLoading && changeDetailId === b._id}
                            >
                              {changeLoading && changeDetailId === b._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-ping rounded-full bg-red-500" />
                              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                              <span className="sr-only">View changes</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900"
                            onClick={() =>
                              setConfirmAction({
                                id: b._id,
                                status: "approved",
                                name: b.name,
                                type: changeType,
                              })
                            }
                            disabled={actionLoading === b._id}
                          >
                            {actionLoading === b._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}
                            <span className="ml-1 hidden sm:inline">Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                            onClick={() =>
                              setConfirmAction({
                                id: b._id,
                                status: "rejected",
                                name: b.name,
                                type: changeType,
                              })
                            }
                            disabled={actionLoading === b._id}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="ml-1 hidden sm:inline">Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {profileChanges.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="border-b px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">
                Vendor Profile Changes
              </h3>
              <p className="text-xs text-muted-foreground">
                Profile edits submitted by vendors, waiting for approval.
              </p>
            </div>

            <div className="divide-y">
              {profileChanges.map((p) => {
                const change = p.pendingProfileChange || {};
                return (
                  <div
                    key={p._id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">
                          {change.fullName || p.fullName}
                        </p>
                        <span className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                          Change Request
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.email}
                        {p.publicId ? ` · ${p.publicId}` : ""}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          Name: {change.fullName || "-"}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          Phone: {change.phone || "-"}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          WhatsApp: {change.whatsappNumber || "-"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Requested{" "}
                        {change.submittedAt
                          ? new Date(change.submittedAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 self-start sm:self-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900"
                        onClick={() =>
                          setProfileConfirm({
                            id: p._id,
                            status: "approved",
                            name: change.fullName || p.fullName,
                          })
                        }
                        disabled={profileActionLoading === p._id}
                      >
                        {profileActionLoading === p._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-1 hidden sm:inline">Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                        onClick={() =>
                          setProfileConfirm({
                            id: p._id,
                            status: "rejected",
                            name: change.fullName || p.fullName,
                          })
                        }
                        disabled={profileActionLoading === p._id}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="ml-1 hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!changeDetailId}
        onOpenChange={(open) => !open && closeChangeDetail()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {changeDetail?.pendingChange?.type === "DELETE"
                ? "Delete Request"
                : "Vendor Changes"}
            </DialogTitle>
            <DialogDescription>
              {changeDetail
                ? `What the vendor submitted for "${changeDetail.name}"`
                : "Loading vendor changes..."}
            </DialogDescription>
          </DialogHeader>

          {changeLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading changes...
            </div>
          ) : changeError ? (
            <p className="py-6 text-sm text-destructive">{changeError}</p>
          ) : changeDetail?.pendingChange?.type === "DELETE" ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                The vendor requested to delete this business listing.
              </div>
              <p className="text-xs text-muted-foreground">
                Submitted{" "}
                {changeDetail.pendingChange?.submittedAt
                  ? new Date(changeDetail.pendingChange.submittedAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          ) : (
            (() => {
              const changes = computeChanges(changeDetail);
              return (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Submitted{" "}
                    {changeDetail?.pendingChange?.submittedAt
                      ? new Date(
                          changeDetail.pendingChange.submittedAt
                        ).toLocaleString()
                      : "-"}
                  </p>
                  {changes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No field-level differences found.
                    </p>
                  ) : (
                    <div className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
                      {changes.map((c) => (
                        <div
                          key={c.field}
                          className="rounded-lg border border-border p-3"
                        >
                          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            {humanizeKey(c.field)}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                            <span className="max-w-full break-words rounded-md bg-red-50 px-2 py-1 text-red-700 line-through dark:bg-red-950 dark:text-red-400">
                              {formatDiffValue(c.before)}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="max-w-full break-words rounded-md bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                              {formatDiffValue(c.after)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeChangeDetail}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!profileConfirm}
        onOpenChange={(open) => !open && setProfileConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {profileConfirm?.status === "approved"
                ? "Approve Profile Change"
                : "Reject Profile Change"}
            </DialogTitle>
            <DialogDescription>
              {profileConfirm?.status === "approved"
                ? `Apply the submitted profile changes for "${profileConfirm?.name}"? They will go live immediately.`
                : `Reject the submitted profile changes for "${profileConfirm?.name}"? The current profile stays unchanged.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProfileConfirm(null)}
              disabled={profileActionLoading === profileConfirm?.id}
            >
              Cancel
            </Button>
            <Button
              variant={profileConfirm?.status === "approved" ? "default" : "destructive"}
              onClick={() =>
                profileConfirm &&
                handleProfileAction(profileConfirm.id, profileConfirm.status)
              }
              disabled={profileActionLoading === profileConfirm?.id}
            >
              {profileActionLoading === profileConfirm?.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {profileConfirm?.status === "approved" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.status === "approved"
                ? confirmAction?.type === "DELETE"
                  ? "Approve Deletion"
                  : confirmAction?.type === "EDIT"
                    ? "Approve Changes"
                    : "Approve Business"
                : confirmAction?.type === "DELETE"
                  ? "Reject Deletion"
                  : confirmAction?.type === "EDIT"
                    ? "Reject Changes"
                    : "Reject Business"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.status === "approved"
                ? confirmAction?.type === "DELETE"
                  ? `Delete "${confirmAction?.name}" permanently? This cannot be undone.`
                  : confirmAction?.type === "EDIT"
                    ? `Publish the submitted changes for "${confirmAction?.name}"? They will go live immediately.`
                    : `Are you sure you want to approve "${confirmAction?.name}"? This business will become visible on the platform.`
                : confirmAction?.type === "DELETE"
                  ? `Cancel the delete request for "${confirmAction?.name}"? The business stays listed.`
                  : confirmAction?.type === "EDIT"
                    ? `Reject the submitted changes for "${confirmAction?.name}"? The published listing stays unchanged.`
                    : `Are you sure you want to reject "${confirmAction?.name}"? The vendor will be notified.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={actionLoading === confirmAction?.id}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction?.status === "approved" ? "default" : "destructive"}
              onClick={() =>
                confirmAction && handleAction(confirmAction.id, confirmAction.status)
              }
              disabled={actionLoading === confirmAction?.id}
            >
              {actionLoading === confirmAction?.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {confirmAction?.status === "approved" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApprovals;
