"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  Eye,
  Pencil,
  Loader2,
  MoreHorizontal,
  Building2,
  CheckCircle,
  XCircle,
  UserX,
  UserCheck,
} from "lucide-react";
import {
  getBusinesses,
  deleteBusiness,
  toggleBusinessStatus,
  updateBusinessStatus,
} from "../../services/adminService";
import BusinessViewDialog from "./BusinessViewDialog";
import { PageHeader } from "../../components/shared/page-header";
import { StatusBadge } from "../../components/shared/status-badge";
import { EmptyState } from "../../components/shared/empty-state";
import { PageLoader } from "../../components/shared/page-loader";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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
import CopyableId from "../../components/admin/CopyableId";

const AdminBusinesses = () => {
  const router = useRouter();
  const [businesses, setBusinesses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchBusinesses = async (p = 1, s = "", st = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getBusinesses(p, s, st);
      setBusinesses(res.data.businesses);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses(page, search, statusFilter === "all" ? "" : statusFilter);
  }, [page, statusFilter]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchBusinesses(1, value, statusFilter === "all" ? "" : statusFilter);
    }, 400);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPage(1);
    fetchBusinesses(1, search, statusFilter === "all" ? "" : statusFilter);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      setError("");
      await deleteBusiness(deleteTarget._id);
      setBusinesses((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      if (pagination) {
        const newTotal = pagination.total - 1;
        const newPages = Math.ceil(newTotal / pagination.limit);
        setPagination((prev) => ({ ...prev, total: newTotal, pages: newPages }));
        if (page > newPages && newPages > 0) setPage(newPages);
      }
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete business");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleApproveReject = async () => {
    if (!confirmAction) return;
    try {
      setConfirmLoading(true);
      setError("");
      const { target, action } = confirmAction;
      const newStatus = action === "approve" ? "approved" : "rejected";

      await updateBusinessStatus(target._id, newStatus);

      setBusinesses((prev) =>
        prev.map((b) => (b._id === target._id ? { ...b, status: newStatus } : b))
      );
      setConfirmAction(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleToggle = async (biz) => {
    try {
      setActionLoading(biz._id);
      setError("");
      const res = await toggleBusinessStatus(biz._id);
      setBusinesses((prev) =>
        prev.map((b) => (b._id === biz._id ? { ...b, isActive: res.data.business.isActive } : b))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
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
        title="Businesses"
        description="Manage all businesses on the platform."
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
          <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 flex-1 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by business, vendor, or public ID..."
                  value={search}
                  onChange={handleSearchChange}
                  onSubmit={handleSearchSubmit}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {pagination && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {pagination.total} business{pagination.total !== 1 ? "es" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <PageLoader text="Loading businesses..." />
          ) : businesses.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Businesses Found"
              description={
                search || statusFilter !== "all"
                  ? "No businesses match your criteria."
                  : "No businesses have been registered yet."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead className="hidden sm:table-cell">Vendor</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-semibold">
                              {getInitials(b.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                              {b.name}
                            </p>
                            <div className="flex items-center gap-1.5">
                              {b.categoryId?.image && (b.categoryId.image.trim().startsWith('<') ? <div className="h-4 w-4 [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: b.categoryId.image }} /> : <img src={b.categoryId.image} alt="" className="h-4 w-4 object-contain" />)}
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {b.category || "-"}
                              </p>
                            </div>
                            {b.serviceIds && b.serviceIds.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {b.serviceIds.map((service) => (
                                  <Badge key={service._id} variant="secondary" className="text-[10px]">
                                    {service.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[150px]">
                            {b.vendor?.fullName || "-"}
                          </p>
                          {b.vendor?.publicId && (
                            <CopyableId id={b.vendor.publicId} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {b.city || "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewTarget(b)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/businesses/${b._id}/edit`)
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            {b.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-emerald-600 focus:text-emerald-600"
                                  onClick={() =>
                                    setConfirmAction({ target: b, action: "approve" })
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    setConfirmAction({ target: b, action: "reject" })
                                  }
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggle(b)}
                              disabled={actionLoading === b._id}
                            >
                              {actionLoading === b._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : b.isActive ? (
                                <UserX className="mr-2 h-4 w-4" />
                              ) : (
                                <UserCheck className="mr-2 h-4 w-4" />
                              )}
                              {b.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(b)}
                              disabled={deleteLoading}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
                    <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">
                      {pagination.page} / {pagination.pages}
                    </span>
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                      const totalPages = pagination.pages;
                      const currentPage = pagination.page;
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(totalPages, startPage + 4);
                      if (endPage - startPage < 4) {
                        startPage = Math.max(1, endPage - 4);
                      }
                      const pageNum = startPage + i;
                      if (pageNum > endPage) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          className="w-9 hidden sm:inline-flex"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
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

      {/* View Dialog */}
      <BusinessViewDialog
        open={!!viewTarget}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
        businessId={viewTarget?._id}
      />

      {/* Approve/Reject Dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === "approve" ? "Approve Business" : "Reject Business"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {confirmAction?.action === "approve" ? "approve" : "reject"}{" "}
              <strong>{confirmAction?.target?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={confirmLoading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction?.action === "approve" ? "default" : "destructive"}
              onClick={handleApproveReject}
              disabled={confirmLoading}
            >
              {confirmLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmAction?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Business</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBusinesses;
