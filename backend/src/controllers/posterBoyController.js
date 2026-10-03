const User = require("../models/User");
const PosterBoyProfile = require("../models/PosterBoyProfile");
const Category = require("../models/Category");
const {
  POSTER_BOY_CATEGORY_SLUG,
  getSkillMap,
  resolveSkillIds,
  deriveCityFromAddress,
} = require("../utils/posterBoyCategory");

const SKILL_MAX = 30;
const SKILL_LENGTH_MAX = 60;
const WORK_MEDIA_MAX = 10;
const ADDRESS_MIN = 5;
const ADDRESS_MAX = 300;

const PROFILE_FIELDS = [
  "aadhaarNumber",
  "languages",
  "address",
  "city",
  "gpsCoordinates",
  "skills",
  "categoryId",
  "skillIds",
  "workMedia",
];

const sanitizeProfileData = (body) => ({
  aadhaarNumber: typeof body.aadhaarNumber === "string" ? body.aadhaarNumber.trim() : "",
  languages: Array.isArray(body.languages) ? body.languages : [],
  address: typeof body.address === "string" ? body.address.trim() : "",
  city: typeof body.city === "string" ? body.city.trim() : "",
  gpsCoordinates: {
    lat:
      body.gpsCoordinates && body.gpsCoordinates.lat !== undefined && body.gpsCoordinates.lat !== null && body.gpsCoordinates.lat !== ""
        ? Number(body.gpsCoordinates.lat)
        : null,
    lng:
      body.gpsCoordinates && body.gpsCoordinates.lng !== undefined && body.gpsCoordinates.lng !== null && body.gpsCoordinates.lng !== ""
        ? Number(body.gpsCoordinates.lng)
        : null,
  },
  skills: Array.isArray(body.skills) ? body.skills : [],
  workMedia: Array.isArray(body.workMedia) ? body.workMedia : [],
});

const validateProfile = (data) => {
  const errors = {};

  if (!/^\d{12}$/.test(data.aadhaarNumber)) {
    errors.aadhaarNumber = "Aadhaar number must be exactly 12 digits";
  }

  const languages = data.languages
    .filter((l) => typeof l === "string" && l.trim())
    .map((l) => l.trim());
  if (languages.length < 1) {
    errors.languages = "Please select at least one language";
  }

  if (data.address.length < ADDRESS_MIN) {
    errors.address = `Address must be at least ${ADDRESS_MIN} characters`;
  } else if (data.address.length > ADDRESS_MAX) {
    errors.address = `Address must be at most ${ADDRESS_MAX} characters`;
  }

  const skills = [...new Set(data.skills.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim()))];
  if (skills.length < 1) {
    errors.skills = "Please select at least one skill";
  } else if (skills.length > SKILL_MAX) {
    errors.skills = `You can add at most ${SKILL_MAX} skills`;
  } else if (skills.some((s) => s.length > SKILL_LENGTH_MAX)) {
    errors.skills = `Each skill must be at most ${SKILL_LENGTH_MAX} characters`;
  } else if (skills.some((s) => s.toLowerCase() === "others")) {
    // "Others" is only a UI affordance — the real value lives in the custom chips.
    errors.skills = 'Please type your custom skill instead of saving "Others"';
  }

  const workMedia = data.workMedia.filter((m) => m && typeof m.url === "string" && m.url.trim());
  if (workMedia.length > WORK_MEDIA_MAX) {
    errors.workMedia = `You can upload at most ${WORK_MEDIA_MAX} work images or videos`;
  } else if (workMedia.some((m) => !/^https?:\/\//.test(m.url.trim()))) {
    errors.workMedia = "Work media URLs must be valid http(s) links";
  } else if (workMedia.some((m) => !["image", "video"].includes(m.resourceType))) {
    errors.workMedia = "Work media type must be image or video";
  }

  return { errors, skills, languages, workMedia };
};

const buildPayload = (data, skills, languages, workMedia) => ({
  aadhaarNumber: data.aadhaarNumber,
  languages,
  address: data.address,
  city: data.city,
  gpsCoordinates: data.gpsCoordinates,
  skills,
  workMedia: workMedia.map((m) => ({ url: m.url.trim(), resourceType: m.resourceType })),
});

/**
 * Resolves the "Poster Boy" parent category id and the skill-name -> subcategory-id
 * map so the public listing can filter by category or by an individual skill.
 * Custom ("Others") skills resolve to no id and stay searchable as free text.
 */
const getPosterBoyCategoryRefs = async () => {
  const parent = await Category.findOne({ slug: POSTER_BOY_CATEGORY_SLUG });
  if (!parent) return { categoryId: null, skillMap: new Map() };
  return { categoryId: parent._id, skillMap: await getSkillMap(parent._id) };
};

const readApprovedUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { error: { status: 404, message: "User not found" } };
  if (user.role !== "POSTER_BOY") {
    return { error: { status: 403, message: "Access denied. Insufficient permissions." } };
  }
  if (user.approvalStatus !== "approved") {
    return {
      error: {
        status: 403,
        message: "Account is pending approval. Please wait for admin approval.",
        pendingApproval: true,
      },
    };
  }
  return { user };
};

const publicUser = (user) => ({
  fullName: user.fullName,
  email: user.email,
  phone: user.phone || null,
  whatsappNumber: user.whatsappNumber || null,
  approvalStatus: user.approvalStatus,
  publicId: user.publicId || null,
});

const shapeProfile = (profile) => {
  if (!profile) return null;
  return {
    _id: profile._id,
    aadhaarNumber: profile.aadhaarNumber,
    languages: profile.languages,
    address: profile.address,
    city: profile.city,
    gpsCoordinates: profile.gpsCoordinates,
    skills: profile.skills,
    categoryId: profile.categoryId || null,
    skillIds: profile.skillIds || [],
    workMedia: profile.workMedia,
    status: profile.status,
    profileCompleted: profile.profileCompleted,
    hasPendingChange: !!(profile.pendingChange && profile.pendingChange.data),
    pendingChangeAt: (profile.pendingChange && profile.pendingChange.submittedAt) || null,
    pendingChangeData: (profile.pendingChange && profile.pendingChange.data) || null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

// GET /api/posterboy/profile
exports.getProfile = async (req, res) => {
  try {
    const { error, user } = await readApprovedUser(req.user.userId);
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        ...(error.pendingApproval ? { pendingApproval: true } : {}),
      });
    }

    const profile = await PosterBoyProfile.findOne({ user: user._id });

    return res.status(200).json({
      success: true,
      data: {
        user: publicUser(user),
        profile: shapeProfile(profile),
      },
    });
  } catch (error) {
    console.error("Get poster boy profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/posterboy/profile
exports.updateProfile = async (req, res) => {
  try {
    const { error, user } = await readApprovedUser(req.user.userId);
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        ...(error.pendingApproval ? { pendingApproval: true } : {}),
      });
    }

    const data = sanitizeProfileData(req.body);
    const { errors, skills, languages, workMedia } = validateProfile(data);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.entries(errors).map(([field, message]) => ({ field, message })),
      });
    }

    const payload = buildPayload(data, skills, languages, workMedia);
    // City drives the location filter. It is normally filled by the GPS
    // reverse-geocode; when the poster boy typed the address by hand we fall
    // back to parsing it so the profile is not invisible to city search.
    payload.city = data.city || deriveCityFromAddress(data.address);
    const { categoryId, skillMap } = await getPosterBoyCategoryRefs();
    payload.categoryId = categoryId;
    payload.skillIds = resolveSkillIds(skills, skillMap);

    let profile = await PosterBoyProfile.findOne({ user: user._id });

    if (!profile) {
      profile = new PosterBoyProfile({
        user: user._id,
        ...payload,
        status: "pending",
        profileCompleted: true,
      });
      await profile.save();
      return res.status(200).json({
        success: true,
        message: "Profile submitted for admin approval",
        data: { profile: shapeProfile(profile) },
      });
    }

    if (profile.status !== "approved") {
      // First submission still under review (or rejected) → resubmit in place.
      PROFILE_FIELDS.forEach((field) => {
        profile[field] = payload[field];
      });
      profile.status = "pending";
      profile.profileCompleted = true;
      await profile.save();
      return res.status(200).json({
        success: true,
        message: "Profile submitted for admin approval",
        data: { profile: shapeProfile(profile) },
      });
    }

    // Already approved → stage the edits, live fields stay untouched.
    profile.pendingChange = { data: payload, submittedAt: new Date() };
    await profile.save();
    return res.status(200).json({
      success: true,
      message: "Profile changes submitted for admin approval",
      data: { profile: shapeProfile(profile) },
    });
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join(", "),
      });
    }
    console.error("Update poster boy profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/poster-boys/:id/profile-status   (ADMIN)
exports.adminUpdateProfileStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
    }

    const profile = await PosterBoyProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Poster boy profile not found" });
    }

    const hasPendingChange = !!(profile.pendingChange && profile.pendingChange.data);

    if (hasPendingChange && status === "approved") {
      const merged = profile.pendingChange.data || {};
      PROFILE_FIELDS.forEach((field) => {
        if (merged[field] !== undefined) profile[field] = merged[field];
      });
      profile.pendingChange = null;
      profile.status = "approved";
    } else if (hasPendingChange && status === "rejected") {
      profile.pendingChange = null;
      profile.status = "approved";
    } else {
      profile.status = status;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: `Poster boy profile ${status}`,
      data: { profile: shapeProfile(profile) },
    });
  } catch (error) {
    console.error("Update poster boy profile status error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/poster-boys   (ADMIN)
exports.getPosterBoys = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || "").trim();

    const filter = { role: "POSTER_BOY" };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { whatsappNumber: { $regex: search, $options: "i" } },
        { publicId: { $regex: search, $options: "i" } },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("fullName email whatsappNumber phone publicId approvalStatus isActive createdAt"),
    ]);

    const profiles = await PosterBoyProfile.find({ user: { $in: users.map((u) => u._id) } });
    const byUser = new Map(profiles.map((p) => [String(p.user), p]));

    const items = users.map((u) => {
      const profile = byUser.get(String(u._id));
      return {
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        whatsappNumber: u.whatsappNumber,
        phone: u.phone,
        publicId: u.publicId,
        approvalStatus: u.approvalStatus,
        isActive: u.isActive,
        createdAt: u.createdAt,
        profile: profile
          ? {
              _id: profile._id,
              status: profile.status,
              skills: profile.skills,
              languages: profile.languages,
              address: profile.address,
              aadhaarNumber: profile.aadhaarNumber,
              workMedia: profile.workMedia,
              profileCompleted: profile.profileCompleted,
              hasPendingChange: !!(profile.pendingChange && profile.pendingChange.data),
              pendingChangeAt: (profile.pendingChange && profile.pendingChange.submittedAt) || null,
              submittedAt: profile.updatedAt,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      },
    });
  } catch (error) {
    console.error("Get poster boys error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
