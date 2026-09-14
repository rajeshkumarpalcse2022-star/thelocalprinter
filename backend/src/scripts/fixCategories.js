const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const Category = require("../models/category");

const MONGODB_URI = process.env.MONGODB_URI;

const svgIcons = {
  "book-publication-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M12 8h40a4 4 0 014 4v40a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="#F45116" stroke-width="3"/><path d="M16 8v48" stroke="#F45116" stroke-width="2"/><path d="M24 20h24M24 28h24M24 36h16" stroke="#F45116" stroke-width="1.5"/></svg>`,
  "digital-sign-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="8" width="48" height="32" rx="4" stroke="#F45116" stroke-width="3"/><path d="M32 40v16" stroke="#F45116" stroke-width="3"/><rect x="16" y="16" width="32" height="16" rx="2" fill="#F45116" opacity="0.2"/></svg>`,
  "exhibition-display-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="8" width="36" height="48" rx="2" stroke="#F45116" stroke-width="3"/><path d="M44 8v48" stroke="#F45116" stroke-width="2"/><rect x="48" y="16" width="8" height="32" rx="1" fill="#F45116" opacity="0.3"/></svg>`,
  "id-access-card-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="16" width="48" height="32" rx="4" stroke="#F45116" stroke-width="3"/><circle cx="24" cy="30" r="6" stroke="#F45116" stroke-width="2"/><path d="M36 28h12M36 36h8" stroke="#F45116" stroke-width="2"/></svg>`,
  "invitation-greeting-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="12" width="48" height="40" rx="4" stroke="#F45116" stroke-width="3"/><path d="M8 12l24 18 24-18" stroke="#F45116" stroke-width="2"/><path d="M32 30v18" stroke="#F45116" stroke-width="1.5"/></svg>`,
  "label-sticker-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M12 32l20-20 20 20-20 20L12 32z" stroke="#F45116" stroke-width="3"/><circle cx="32" cy="32" r="6" fill="#F45116"/></svg>`,
  "marketing-material-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M16 8l-8 24 8 24h32l8-24-8-24H16z" stroke="#F45116" stroke-width="3"/><path d="M24 24h16M24 32h12" stroke="#F45116" stroke-width="2"/></svg>`,
  "menu-restaurant-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="12" y="8" width="40" height="48" rx="4" stroke="#F45116" stroke-width="3"/><path d="M20 20h24M20 30h20M20 40h16" stroke="#F45116" stroke-width="2"/></svg>`,
  "office-business-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="16" width="48" height="36" rx="3" stroke="#F45116" stroke-width="3"/><path d="M20 16V12h24v4" stroke="#F45116" stroke-width="2"/><path d="M16 28h32M16 36h24" stroke="#F45116" stroke-width="1.5"/></svg>`,
  "photo-personalized-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="8" width="48" height="48" rx="4" stroke="#F45116" stroke-width="3"/><circle cx="24" cy="24" r="6" fill="#F45116"/><path d="M8 44l14-14 10 10 8-8 16 16" stroke="#F45116" stroke-width="2"/></svg>`,
  "outdoor-advertising": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="4" y="8" width="56" height="32" rx="2" stroke="#F45116" stroke-width="3"/><path d="M16 40v16h32V40" stroke="#F45116" stroke-width="2"/></svg>`,
  "custom-specialty-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="#F45116" stroke-width="3"/><path d="M32 16v32M16 32h32" stroke="#F45116" stroke-width="2"/><circle cx="32" cy="32" r="8" stroke="#F45116" stroke-width="2"/></svg>`,
};

async function fix() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected");

    // Update missing images
    let updated = 0;
    for (const [slug, image] of Object.entries(svgIcons)) {
      const cat = await Category.findOne({ slug, type: "parent" });
      if (cat && !cat.image) {
        cat.image = image;
        await cat.save();
        updated++;
        console.log("Added image: " + cat.name);
      }
    }
    console.log("Images updated: " + updated);

    // Create missing parents
    const outdoorSvg = svgIcons["outdoor-advertising"];
    const customSvg = svgIcons["custom-specialty-printing"];

    let outdoor = await Category.findOne({ slug: "outdoor-advertising" });
    if (!outdoor) {
      outdoor = await Category.create({ name: "Outdoor Advertising", slug: "outdoor-advertising", type: "parent", image: outdoorSvg, isActive: true, description: "Outdoor Advertising services" });
      console.log("Created: Outdoor Advertising");
    }

    let custom = await Category.findOne({ slug: "custom-specialty-printing" });
    if (!custom) {
      custom = await Category.create({ name: "Custom & Specialty Printing", slug: "custom-specialty-printing", type: "parent", image: customSvg, isActive: true, description: "Custom & Specialty Printing services" });
      console.log("Created: Custom & Specialty Printing");
    }

    // Subcategories
    const subData = [
      { parentSlug: "outdoor-advertising", subs: ["Billboard Printing", "Hoarding Printing", "Outdoor Banner", "Pole Banner", "Building Wrap"] },
      { parentSlug: "custom-specialty-printing", subs: ["Metal Printing", "Wood Printing", "Acrylic Printing", "Glass Printing", "Leather Printing", "Custom Print Products"] },
      { parentSlug: "office-business-printing", subs: ["Invoice Printing", "Quotation Printing", "Letterhead Printing", "Business Forms", "Office Envelopes"] },
    ];

    for (const { parentSlug, subs } of subData) {
      const parent = await Category.findOne({ slug: parentSlug, type: "parent" });
      if (!parent) continue;
      for (const name of subs) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const exists = await Category.findOne({ $or: [{ slug }, { name }] });
        if (!exists) {
          await Category.create({ name, slug, type: "subcategory", parentId: parent._id, isActive: true, description: name + " services" });
          console.log("  Created sub: " + name);
        }
      }
    }

    const totalParents = await Category.countDocuments({ type: "parent" });
    const totalSubs = await Category.countDocuments({ type: "subcategory" });
    console.log("Total parents: " + totalParents);
    console.log("Total subcategories: " + totalSubs);

    await mongoose.disconnect();
    console.log("Done");
  } catch (error) {
    console.error("Error:", error.message);
    await mongoose.disconnect();
  }
}

fix();
