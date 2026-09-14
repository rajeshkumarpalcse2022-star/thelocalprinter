"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, MapPin, Phone, Clock, Heart, Globe, Mail,
  MessageCircle, Loader2, CheckCircle, Tag, Languages, CreditCard,
  FileText, ShoppingBag, Star, Send, Trash2, Edit2, MessageSquare,
  Camera, Wrench, Users, ShoppingCart, Shield, FileImage, ClipboardList,
  Package, X, ChevronLeft, ChevronRight, Eye, ExternalLink, Sun, Moon,
} from "lucide-react";
import {
  getBusinessDetails, getPublicBusinessDetails, addToWishlist, removeFromWishlist,
  getBusinessReviews, getMyReview, createReview, updateReview, deleteReview,
} from "../../services/userService";
import { PageLoader } from "../../components/shared/page-loader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import CopyableId from "../../components/admin/CopyableId";
import { useAuth } from "../../context/AuthContext";

const Section = ({ title, icon: Icon, children }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const Field = ({ label, value, mono, link }) => {
  const display = value || "Not provided";
  const isNA = !value;
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      {link && value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1 break-all"
        >
          {value} <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ) : (
        <p
          className={`text-sm break-all ${
            mono ? "font-mono" : ""
          } ${isNA ? "text-muted-foreground italic" : "text-foreground"}`}
        >
          {display}
        </p>
      )}
    </div>
  );
};

const BoolField = ({ label, value }) => (
  <div className="space-y-0.5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <Badge variant={value ? "default" : "secondary"} className="text-xs">
      {value ? "Yes" : "No"}
    </Badge>
  </div>
);

const ArrayField = ({ label, value }) => {
  const items = Array.isArray(value) ? value : [];
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <Badge key={i} variant="outline" className="text-xs font-normal">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Not provided</p>
      )}
    </div>
  );
};

const VideoPlayer = ({ url, label }) => {
  if (!url) {
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-muted-foreground italic">Not provided</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video src={url} controls className="w-full max-h-[300px] object-contain">
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

const ImageViewer = ({ url, label }) => {
  const [open, setOpen] = useState(false);
  if (!url) {
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-muted-foreground italic">Not provided</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div
        className="relative group cursor-pointer rounded-lg overflow-hidden border"
        onClick={() => setOpen(true)}
      >
        <img src={url} alt={label} className="w-full h-40 object-cover transition-transform group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <button className="absolute top-4 right-4 text-white hover:text-white/80 z-10" onClick={() => setOpen(false)}>
            <X className="h-6 w-6" />
          </button>
          <img src={url} alt={label} className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

const SlideshowViewer = ({ urls, label }) => {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  if (!urls || urls.length === 0) {
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-muted-foreground italic">Not provided</p>
      </div>
    );
  }
  const prev = () => setCurrent((c) => (c === 0 ? urls.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === urls.length - 1 ? 0 : c + 1));
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{label} ({urls.length} image{urls.length !== 1 ? "s" : ""})</p>
      <div className="relative rounded-lg overflow-hidden border group cursor-pointer" onClick={() => setOpen(true)}>
        <img src={urls[current]} alt={`${label} ${current + 1}`} className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {urls.length > 1 && (
          <>
            <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2.5 hover:bg-black/80" onClick={(e) => { e.stopPropagation(); prev(); }}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2.5 hover:bg-black/80" onClick={(e) => { e.stopPropagation(); next(); }}>
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {current + 1} / {urls.length}
            </div>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Thumb ${i + 1}`}
              className={`h-12 w-12 rounded object-cover border-2 cursor-pointer shrink-0 ${
                i === current ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
              }`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <button className="absolute top-4 right-4 text-white hover:text-white/80 z-10 p-2" onClick={() => setOpen(false)}>
            <X className="h-6 w-6" />
          </button>
          <img src={urls[current]} alt={label} className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          {urls.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3 hover:bg-white/30" onClick={(e) => { e.stopPropagation(); prev(); }}>
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3 hover:bg-white/30" onClick={(e) => { e.stopPropagation(); next(); }}>
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                {current + 1} / {urls.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ENUM_LABELS = {
  orderLimits: { single: "Single Order", minimum: "Minimum Order", bulk: "Bulk Orders", no_limit: "No Limit" },
  serviceType: { print_only: "Print Only", full_with_design: "Full Service (With Design)", full_without_design: "Full Service (Without Design)" },
  customerType: { b2b: "B2B", b2c: "B2C", both: "Both B2B & B2C" },
  orderingMethod: { on_call: "On Call", shop_visit: "Shop Visit", both: "Both" },
};

const UserBusinessDetails = ({ publicMode = false }) => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isUserRole = !publicMode && user?.role === "USER";
  const [business, setBusiness] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, reviewCount: 0, ratingBreakdown: {1:0,2:0,3:0,4:0,5:0} });
  const [myReview, setMyReview] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPagination, setReviewPagination] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [editingReview, setEditingReview] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (publicMode) {
      const saved = localStorage.getItem('search-theme');
      setTheme(saved || 'light');
    }
  }, [publicMode]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('search-theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (publicMode) {
      const html = document.documentElement;
      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, [publicMode, theme]);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const apiFn = publicMode ? getPublicBusinessDetails : getBusinessDetails;
        const res = await apiFn(id);
        setBusiness(res.data.business);
        if (!publicMode) setIsWishlisted(res.data.isWishlisted);
      } catch (err) {
        setError(err.response?.data?.message || "Business not found");
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [id, publicMode]);

  useEffect(() => {
    if (id && !publicMode) {
      getBusinessReviews(id, reviewPage).then((res) => {
        setReviews(res.data.reviews);
        setReviewSummary(res.data.summary || { averageRating: 0, reviewCount: 0, ratingBreakdown: {1:0,2:0,3:0,4:0,5:0} });
        setReviewPagination(res.data.pagination);
      }).catch(() => {});
      getMyReview(id).then((res) => {
        setMyReview(res.data.review);
        if (res.data.review) {
          setReviewRating(res.data.review.rating);
          setReviewComment(res.data.review.comment);
        }
      }).catch(() => {});
    }
  }, [id, reviewPage, submittingReview, publicMode]);

  const handleWishlist = async () => {
    setTogglingWishlist(true);
    try {
      if (isWishlisted) { await removeFromWishlist(id); setIsWishlisted(false); }
      else { await addToWishlist(id); setIsWishlisted(true); }
    } catch (err) { /* silent */ } finally { setTogglingWishlist(false); }
  };

  if (loading) return <PageLoader />;
  if (error) return <div className="text-destructive p-6">{error}</div>;
  if (!business) return null;

  const handleSubmitReview = async () => {
    setReviewError(""); setReviewSuccess("");
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) { setReviewError("Please select a rating"); return; }
    if (!reviewComment.trim()) { setReviewError("Please write a review comment"); return; }
    setSubmittingReview(true);
    try {
      if (editingReview && myReview) {
        await updateReview(myReview._id, { rating: reviewRating, comment: reviewComment.trim() });
        setReviewSuccess("Review updated successfully");
      } else {
        await createReview(id, { rating: reviewRating, comment: reviewComment.trim() });
        setReviewSuccess("Review submitted successfully");
      }
      setShowReviewForm(false); setEditingReview(false); setReviewComment(""); setReviewRating(0);
    } catch (err) { setReviewError(err.response?.data?.message || "Failed to submit review"); }
    finally { setSubmittingReview(false); }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    if (!window.confirm("Delete your review?")) return;
    setSubmittingReview(true);
    try {
      await deleteReview(myReview._id);
      setMyReview(null); setReviewComment(""); setReviewRating(0); setReviewSuccess("Review deleted");
    } catch (err) { setReviewError(err.response?.data?.message || "Failed to delete review"); }
    finally { setSubmittingReview(false); }
  };

  return (
    <div className="p-4 sm:p-6 pt-16 md:pt-24 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1.5 w-fit" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </Button>
        {publicMode && (
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="h-40 md:h-52 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-primary overflow-hidden">
          {business.verificationMedia?.outdoorStoreImage ? (
            <img src={business.verificationMedia.outdoorStoreImage} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <Building2 size={48} />
          )}
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">{business.name}</h1>
              {business.vendor?.publicId && (
                <div className="mt-0.5"><CopyableId id={business.vendor.publicId} /></div>
              )}
              {business.category && (
                <div className="flex items-center gap-1.5 mt-1">
                  {business.categoryId?.image && (business.categoryId.image.trim().startsWith('<') ? <div className="h-4 w-4 [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: business.categoryId.image }} /> : <img src={business.categoryId.image} alt="" className="h-4 w-4 object-contain" />)}
                  <Badge variant="secondary">{business.category}</Badge>
                </div>
              )}
            </div>
            {!publicMode && (
              <Button
                variant={isWishlisted ? "destructive" : "outline"}
                size="sm"
                className="gap-2"
                onClick={handleWishlist}
                disabled={togglingWishlist}
              >
                {togglingWishlist ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />}
                <span className="hidden sm:inline">{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
                <span className="sm:hidden">{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
              </Button>
            )}
          </div>
          {business.city && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
              <MapPin size={14} /> {business.city}{business.address ? `, ${business.address}` : ""}
            </p>
          )}
          {business.description && <p className="text-sm text-muted-foreground leading-relaxed">{business.description}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Business Information */}
        <Section title="Business Information" icon={Building2}>
          <div className="space-y-3">
            <Field label="Business Name" value={business.name} />
            <Field label="Description" value={business.description} />
            <Field label="Established Year" value={business.establishedYear?.toString()} />
            <Field label="Working Hours" value={business.workingHours} />
          </div>
        </Section>

        {/* 2. Contact Details */}
        <Section title="Contact Details" icon={Phone}>
          <div className="space-y-3">
            <Field label="Contact Name" value={business.contactName} />
            <Field label="Phone" value={business.phone} mono />
            <Field label="WhatsApp" value={business.whatsapp} mono />
            <Field label="Email" value={business.contactEmail} />
            <Field label="Website" value={business.website} link />
          </div>
        </Section>

        {/* 3. Category & Location */}
        <Section title="Category & Location" icon={MapPin}>
          <div className="space-y-3">
            <div>
              <Field label="Category" value={business.categoryId?.name || business.category} />
              {business.categoryId?.image && (
                business.categoryId.image.trim().startsWith('<') ? <div className="h-8 w-8 [&>svg]:w-8 [&>svg]:h-8" dangerouslySetInnerHTML={{ __html: business.categoryId.image }} /> : <img src={business.categoryId.image} alt="" className="h-8 w-8 object-contain mt-1" />
              )}
            </div>
            {business.serviceIds && business.serviceIds.length > 0 && (
              <ArrayField
                label="Services"
                value={business.serviceIds.map((s) => s.name || s)}
              />
            )}
            <ArrayField label="Tags" value={business.tags} />
            <Field label="Full Address" value={business.address} />
            <Field label="City" value={business.city} />
            {business.gpsCoordinates?.lat != null && business.gpsCoordinates?.lng != null && (
              <Field label="GPS Coordinates" value={`${business.gpsCoordinates.lat}, ${business.gpsCoordinates.lng}`} mono />
            )}
          </div>
        </Section>

        {/* 4. GST */}
        {!isUserRole && (
          <Section title="GST" icon={FileText}>
            <div className="space-y-3">
              <BoolField label="GST Available" value={business.gstAvailable} />
            </div>
          </Section>
        )}

        {/* 5. Order Limits */}
        <Section title="Order Limits" icon={Package}>
          <div className="space-y-3">
            <Field label="Order Limits" value={ENUM_LABELS.orderLimits[business.orderLimits]} />
          </div>
        </Section>

        {/* 6. Services */}
        <Section title="Services" icon={Wrench}>
          <div className="space-y-3">
            <Field label="Service Type" value={ENUM_LABELS.serviceType[business.serviceType]} />
            <ArrayField label="Add-on Services" value={business.addonServices} />
          </div>
        </Section>

        {/* 7. Customer Type */}
        <Section title="Customer Type" icon={Users}>
          <div className="space-y-3">
            <Field label="Customer Type" value={ENUM_LABELS.customerType[business.customerType]} />
          </div>
        </Section>

        {/* 8. Ordering Method */}
        <Section title="Ordering Method" icon={ShoppingCart}>
          <div className="space-y-3">
            <Field label="Ordering Method" value={ENUM_LABELS.orderingMethod[business.orderingMethod]} />
          </div>
        </Section>

        {/* 9. Payment Modes */}
        <Section title="Payment Modes" icon={CreditCard}>
          <ArrayField label="Payment Methods" value={business.paymentModes} />
        </Section>

        {/* 10. Social Media */}
        <Section title="Social Media" icon={Globe}>
          <div className="space-y-3">
            <Field label="Facebook" value={business.socialMedia?.facebook} link />
            <Field label="Instagram" value={business.socialMedia?.instagram} link />
            <Field label="YouTube" value={business.socialMedia?.youtube} link />
            <Field label="LinkedIn" value={business.socialMedia?.linkedin} link />
            <Field label="Twitter" value={business.socialMedia?.twitter} link />
          </div>
        </Section>

        {/* 11. Verification Media */}
        {(!isUserRole || business.verificationMedia?.outdoorStoreImage || business.verificationMedia?.indoorStoreImage) && (
          <Section title="Verification Media" icon={Camera}>
            <div className="space-y-6">
              {isUserRole ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {business.verificationMedia?.outdoorStoreImage && (
                    <ImageViewer url={business.verificationMedia.outdoorStoreImage} label="Outdoor Store Image" />
                  )}
                  {business.verificationMedia?.indoorStoreImage && (
                    <ImageViewer url={business.verificationMedia.indoorStoreImage} label="Indoor Store Image" />
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <VideoPlayer url={business.verificationMedia?.machineryWorkingVideo} label="Machinery Working Video" />
                    <VideoPlayer url={business.verificationMedia?.completeOutletVideo} label="Complete Outlet Video" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ImageViewer url={business.verificationMedia?.outdoorStoreImage} label="Outdoor Store Image" />
                    <ImageViewer url={business.verificationMedia?.indoorStoreImage} label="Indoor Store Image" />
                  </div>
                  <SlideshowViewer urls={business.verificationMedia?.thumbnailImages || []} label="Thumbnail / Slideshow Images" />
                </>
              )}
            </div>
          </Section>
        )}

        {/* 12. Languages */}
        <Section title="Communication Languages" icon={Languages}>
          <ArrayField label="Languages" value={business.languages} />
        </Section>

        {/* 13. Policies & Additional Services */}
        <Section title="Policies & Additional Services" icon={Shield}>
          <div className="space-y-3">
            <Field label="Return / Replacement Policy" value={business.returnReplacementPolicy} />
            <BoolField label="In-house Designer Available" value={business.inHouseDesignerAvailable} />
            <BoolField label="Customer Location Visit Available" value={business.customerLocationVisitAvailable} />
          </div>
        </Section>

        {/* 14. Sample / Display & File Formats */}
        <Section title="Sample / Display & File Formats" icon={FileImage}>
          <div className="space-y-3">
            <BoolField label="Sample/Display Available" value={business.sampleDisplayAvailable} />
            <ArrayField label="Preferred File Formats" value={business.preferredFileFormats} />
          </div>
        </Section>

        {/* 15. Purchase Order */}
        <Section title="Purchase Order" icon={ClipboardList}>
          <BoolField label="Accepts Orders Without Advance (After Verification)" value={business.acceptsPurchaseOrder} />
        </Section>
      </div>

      {!publicMode && (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Customer Reviews</CardTitle>
          {!myReview && (
            <Button size="sm" className="gap-1.5" onClick={() => { setShowReviewForm(!showReviewForm); setEditingReview(false); setReviewComment(""); setReviewRating(0); }}>
              <MessageSquare size={14} /> Write a Review
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <div className="text-center min-w-[100px]">
              <p className="text-4xl font-extrabold text-foreground">{reviewSummary.averageRating}</p>
              <div className="flex justify-center gap-0.5 my-1">
                {[1,2,3,4,5].map((s) => <Star key={s} size={14} fill={s <= Math.round(reviewSummary.averageRating) ? "#f59e0b" : "none"} color={s <= Math.round(reviewSummary.averageRating) ? "#f59e0b" : "var(--muted-foreground)"} />)}
              </div>
              <p className="text-xs text-muted-foreground">Based on {reviewSummary.reviewCount} reviews</p>
            </div>
            <div className="flex-1 min-w-[200px] space-y-1">
              {[5,4,3,2,1].map((star) => {
                const count = reviewSummary.ratingBreakdown?.[star] || 0;
                const pct = reviewSummary.reviewCount > 0 ? (count / reviewSummary.reviewCount * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5">{star}★</span>
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {myReview && (
            <div className="p-3 rounded-lg bg-muted border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">Your Review</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowReviewForm(true); setEditingReview(true); setReviewRating(myReview.rating); setReviewComment(myReview.comment); }}><Edit2 size={12} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDeleteReview}><Trash2 size={12} /></Button>
                </div>
              </div>
              <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map((s) => <Star key={s} size={12} fill={s <= myReview.rating ? "#f59e0b" : "none"} color={s <= myReview.rating ? "#f59e0b" : "var(--muted-foreground)"} />)}</div>
              <p className="text-sm text-muted-foreground">{myReview.comment}</p>
              <span className="text-xs text-muted-foreground">{new Date(myReview.createdAt).toLocaleDateString()}</span>
            </div>
          )}

          {showReviewForm && (
            <div className="p-4 rounded-lg bg-muted border space-y-3">
              <h4 className="text-sm font-semibold text-foreground">{editingReview ? "Edit Review" : "Write a Review"}</h4>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rating</Label>
                <div className="flex gap-1">{[1,2,3,4,5].map((s) => <button key={s} type="button" onClick={() => setReviewRating(s)}><Star size={24} fill={s <= reviewRating ? "#f59e0b" : "none"} color={s <= reviewRating ? "#f59e0b" : "currentColor"} strokeWidth={s <= reviewRating ? 0 : 2} /></button>)}</div>
              </div>
              <div><Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Comment</Label><Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} placeholder="Share your experience..." /></div>
              {reviewError && <p className="text-xs text-destructive">{reviewError}</p>}
              {reviewSuccess && <p className="text-xs text-emerald-600">{reviewSuccess}</p>}
              <div className="flex gap-2">
                <Button size="sm" className="gap-1.5" onClick={handleSubmitReview} disabled={submittingReview}>
                  {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {editingReview ? "Update" : "Submit"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setShowReviewForm(false); setEditingReview(false); setReviewError(""); setReviewSuccess(""); }}>Cancel</Button>
              </div>
            </div>
          )}

          {reviews.length === 0 && !showReviewForm ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No reviews yet</p>
              <p className="text-xs">Be the first to review this business</p>
            </div>
          ) : (
            <div className="divide-y">
              {reviews.map((r) => (
                <div key={r._id} className="py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{r.user?.fullName?.[0] || "U"}</AvatarFallback></Avatar>
                    <span className="text-sm font-semibold text-foreground">{r.user?.fullName || "User"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map((s) => <Star key={s} size={12} fill={s <= r.rating ? "#f59e0b" : "none"} color={s <= r.rating ? "#f59e0b" : "var(--muted-foreground)"} />)}</div>
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {reviewPagination && reviewPagination.pages > 1 && (
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: reviewPagination.pages }, (_, i) => i + 1).map((p) => (
                <Button key={p} size="sm" variant={p === reviewPage ? "default" : "outline"} className="h-10 w-10 p-0" onClick={() => setReviewPage(p)}>{p}</Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default UserBusinessDetails;
