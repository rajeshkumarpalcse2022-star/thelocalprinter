"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import {
  Tags,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  Loader2,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  Eye,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../../services/adminService";
import { PageHeader } from "../../components/shared/page-header";
import { StatusBadge } from "../../components/shared/status-badge";
import { EmptyState } from "../../components/shared/empty-state";
import { PageLoader } from "../../components/shared/page-loader";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingType, setEditingType] = useState("parent");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    type: "parent",
    parentId: "",
    image: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState("parent");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [viewTarget, setViewTarget] = useState(null);
  const [subcategoryNames, setSubcategoryNames] = useState([""]);
  const debounceRef = useRef(null);
  const fileInputRef = useRef(null);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const fetchCategories = async (p = 1, q = "") => {
    try {
      setLoading(true);
      setError("");
      const res = await getCategories(p, q);
      setCategories(res.data.categories);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page, search);
  }, [page]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchCategories(1, value);
    }, 400);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPage(1);
    fetchCategories(1, search);
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateParent = () => {
    setEditing(null);
    setEditingType("parent");
    setForm({
      name: "",
      slug: "",
      description: "",
      type: "parent",
      parentId: "",
      image: "",
    });
    setFormError("");
    setShowForm(true);
  };

  const openCreateSubcategory = (parentId) => {
    setEditing(null);
    setEditingType("subcategory");
    setForm({
      name: "",
      slug: "",
      description: "",
      type: "subcategory",
      parentId: parentId || "",
      image: "",
    });
    setSubcategoryNames([""]);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (cat, type = "parent") => {
    setEditing(cat);
    setEditingType(type);
    if (type === "subcategory") {
      setForm({
        name: cat.name,
        slug: cat.slug || "",
        description: cat.description || "",
        type: "subcategory",
        parentId: cat.parentId?._id || cat.parentId || "",
        image: "",
      });
    } else {
      setForm({
        name: cat.name,
        slug: cat.slug || "",
        description: cat.description || "",
        type: "parent",
        parentId: "",
        image: cat.image || "",
      });
    }
    setFormError("");
    setShowForm(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "image/svg+xml") {
      setFormError("Only SVG files are allowed");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug === generateSlug(prev.name) || prev.slug === ""
        ? generateSlug(value)
        : prev.slug,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingType === "subcategory" && !editing && !form.parentId) {
      setFormError("Parent category is required");
      return;
    }
    if (editingType === "subcategory" && editing) {
      if (!form.name.trim()) {
        setFormError("Name is required");
        return;
      }
    } else if (editingType === "subcategory" && !editing) {
      const validNames = subcategoryNames.filter((n) => n.trim());
      if (validNames.length === 0) {
        setFormError("At least one subcategory name is required");
        return;
      }
    } else {
      if (!form.name.trim()) {
        setFormError("Name is required");
        return;
      }
    }
    try {
      setSaving(true);
      setFormError("");
      if (editing) {
        if (editingType === "subcategory") {
          await updateSubcategory(editing._id, {
            name: form.name.trim(),
            parentId: form.parentId,
          });
        } else {
          await updateCategory(editing._id, {
            name: form.name.trim(),
            description: form.description,
            image: form.image,
          });
        }
      } else {
        if (editingType === "subcategory") {
          const validNames = subcategoryNames.filter((n) => n.trim());
          for (const name of validNames) {
            await createSubcategory({
              name: name.trim(),
              parentId: form.parentId,
            });
          }
        } else {
          await createCategory({
            name: form.name.trim(),
            description: form.description,
            type: "parent",
            image: form.image,
          });
        }
      }
      setShowForm(false);
      fetchCategories(page, search);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      setActionLoading(id);
      setError("");
      await toggleCategoryStatus(id);
      fetchCategories(page, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      setError("");
      if (deleteType === "subcategory") {
        await deleteSubcategory(deleteTarget._id);
      } else {
        await deleteCategory(deleteTarget._id);
      }
      setDeleteTarget(null);
      fetchCategories(page, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage business categories and subcategories."
        actions={
          <Button onClick={openCreateParent}>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        }
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
          <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
                className="pl-9"
              />
            </div>
            {pagination && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {pagination.total} categor{pagination.total !== 1 ? "ies" : "y"}
              </span>
            )}
          </div>

          {loading ? (
            <PageLoader text="Loading categories..." />
          ) : categories.length === 0 ? (
            <EmptyState
              icon={Tags}
              title="No Categories"
              description={
                search
                  ? "No categories match your search."
                  : "Create your first category to organize businesses."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden md:table-cell">Services</TableHead>
                    <TableHead className="hidden sm:table-cell">URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <Fragment key={cat._id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleRow(cat._id)}
                          >
                            {expandedRows[cat._id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {cat.image ? (
                              cat.image.trim().startsWith('<') ? (
                                <div className="h-8 w-8 flex-shrink-0 rounded border object-contain bg-muted p-1 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: cat.image }} />
                              ) : (
                                <img src={cat.image} alt={cat.name} className="h-8 w-8 flex-shrink-0 rounded border object-contain bg-muted" />
                              )
                            ) : (
                              <div className="h-8 w-8 flex-shrink-0 rounded border bg-muted flex items-center justify-center">
                                <Tags className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate">{cat.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {cat.services && cat.services.length > 0 ? (
                              cat.services.map((sub) => (
                                <Badge key={sub._id} variant="secondary" className="text-xs">
                                  {sub.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="font-mono text-xs">
                            {cat.slug}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={cat.isActive ? "active" : "inactive"} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatDate(cat.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Actions</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewTarget(cat)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(cat, "parent")}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openCreateSubcategory(cat._id)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Subcategory
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggle(cat._id)}
                                disabled={actionLoading === cat._id}
                              >
                                {actionLoading === cat._id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Power className="mr-2 h-4 w-4" />
                                )}
                                {cat.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setDeleteTarget(cat);
                                  setDeleteType("parent");
                                }}
                                disabled={actionLoading === cat._id}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {expandedRows[cat._id] &&
                        cat.services &&
                        cat.services.map((sub) => (
                          <TableRow key={sub._id} className="bg-muted/30">
                            <TableCell></TableCell>
                            <TableCell>
                              <div className="pl-6 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                <p className="text-sm">{sub.name}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell"></TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="outline" className="font-mono text-xs">
                                {sub.slug}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={sub.isActive ? "active" : "inactive"} />
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                              {formatDate(sub.createdAt)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <span className="sr-only">Actions</span>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-4 w-4"
                                    >
                                      <circle cx="12" cy="12" r="1" />
                                      <circle cx="12" cy="5" r="1" />
                                      <circle cx="12" cy="19" r="1" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEdit(sub, "subcategory")}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                      setDeleteTarget(sub);
                                      setDeleteType("subcategory");
                                    }}
                                    disabled={actionLoading === sub._id}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </Fragment>
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

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false);
          setSubcategoryNames([""]);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? editingType === "subcategory"
                  ? "Edit Subcategory"
                  : "Edit Category"
                : editingType === "subcategory"
                ? "New Subcategory"
                : "New Category"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details below."
                : editingType === "subcategory"
                ? "Add a new subcategory under a parent category."
                : "Add a new parent category to organize businesses."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {!editing && (
              <div className="space-y-2">
                <Label>
                  Category Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={editingType}
                  onValueChange={(val) => {
                    setEditingType(val);
                    setForm((prev) => ({ ...prev, type: val, parentId: "", image: "" }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent Category</SelectItem>
                    <SelectItem value="subcategory">Sub Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingType === "subcategory" && (
              <div className="space-y-2">
                <Label>
                  Parent Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.parentId}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, parentId: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingType === "subcategory" && !editing ? (
              <div className="space-y-2">
                <Label>
                  Subcategory Names <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Enter at least one subcategory name. Leave the last field blank if done.</p>
                {subcategoryNames.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={val}
                      onChange={(e) => {
                        const updated = [...subcategoryNames];
                        updated[idx] = e.target.value;
                        if (idx === subcategoryNames.length - 1 && e.target.value.trim()) {
                          updated.push("");
                        }
                        setSubcategoryNames(updated);
                      }}
                      placeholder={`Subcategory ${idx + 1}`}
                      autoFocus={idx === 0}
                    />
                    {subcategoryNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSubcategoryNames(subcategoryNames.filter((_, i) => i !== idx))}
                        className="text-destructive hover:text-destructive/80 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="cat-name">
                  {editingType === "subcategory" ? "Subcategory" : "Category"} Name{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cat-name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Printing, Business Cards..."
                  autoFocus
                />
              </div>
            )}

            {editingType === "parent" && (
              <div className="space-y-2">
                <Label htmlFor="cat-image">Category Image (SVG)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="cat-image"
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="flex-1"
                  />
                  {form.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {form.image && (
                  form.image.trim().startsWith('<') ? (
                    <div className="h-16 w-16 rounded border object-contain bg-muted mt-2 p-2 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: form.image }} />
                  ) : (
                    <img src={form.image} alt="Preview" className="h-16 w-16 rounded border object-contain bg-muted mt-2" />
                  )
                )}
              </div>
            )}

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {deleteType === "subcategory" ? "Subcategory" : "Category"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              {deleteType === "parent" &&
                " This will also delete all subcategories under it."}{" "}
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

      {/* View Category Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {viewTarget?.image ? (
                viewTarget.image.trim().startsWith('<') ? (
                  <div className="h-16 w-16 rounded-lg border object-contain bg-muted p-2 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: viewTarget.image }} />
                ) : (
                  <img src={viewTarget.image} alt={viewTarget.name} className="h-16 w-16 rounded-lg border object-contain bg-muted" />
                )
              ) : (
                <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center">
                  <Tags className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{viewTarget?.name}</h3>
                <p className="text-sm text-muted-foreground">{viewTarget?.slug}</p>
              </div>
            </div>
            {viewTarget?.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{viewTarget.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                <StatusBadge status={viewTarget?.isActive ? "active" : "inactive"} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                <p className="text-sm">{viewTarget && formatDate(viewTarget.createdAt)}</p>
              </div>
            </div>
            {viewTarget?.services && viewTarget.services.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Services / Subcategories</p>
                <div className="flex flex-wrap gap-2">
                  {viewTarget.services.map((sub) => (
                    <Badge key={sub._id} variant="secondary">{sub.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTarget(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
