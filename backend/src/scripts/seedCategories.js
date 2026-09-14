const mongoose = require("mongoose");
const Category = require("../models/category");
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

const svgIcons = {
  "digital-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="16" width="48" height="32" rx="4" stroke="#F45116" stroke-width="3"/><rect x="20" y="48" width="24" height="4" rx="1" fill="#F45116"/><rect x="16" y="52" width="32" height="2" rx="1" fill="#F45116"/><circle cx="32" cy="32" r="8" stroke="#F45116" stroke-width="2"/><path d="M28 32h8M32 28v8" stroke="#F45116" stroke-width="2"/></svg>`,
  "offset-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="6" y="20" width="52" height="28" rx="3" stroke="#F45116" stroke-width="3"/><circle cx="18" cy="34" r="6" stroke="#F45116" stroke-width="2"/><circle cx="46" cy="34" r="6" stroke="#F45116" stroke-width="2"/><path d="M24 34h16" stroke="#F45116" stroke-width="2"/><rect x="22" y="12" width="20" height="8" rx="2" fill="#F45116"/></svg>`,
  "large-format-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="8" width="48" height="36" rx="2" stroke="#F45116" stroke-width="3"/><path d="M16 44v12h32V44" stroke="#F45116" stroke-width="3"/><path d="M24 20l8-8 8 8" stroke="#F45116" stroke-width="2"/><path d="M32 12v20" stroke="#F45116" stroke-width="2"/></svg>`,
  "packaging-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M32 8L8 20v24l24 12 24-12V20L32 8z" stroke="#F45116" stroke-width="3"/><path d="M8 20l24 12 24-12" stroke="#F45116" stroke-width="2"/><path d="M32 32v24" stroke="#F45116" stroke-width="2"/></svg>`,
  "signage": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="12" width="48" height="28" rx="4" stroke="#F45116" stroke-width="3"/><path d="M32 40v16" stroke="#F45116" stroke-width="3"/><path d="M24 56h16" stroke="#F45116" stroke-width="3"/><text x="32" y="30" text-anchor="middle" fill="#F45116" font-size="12" font-weight="bold">SIGN</text></svg>`,
  "promotional-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M12 8h40l-4 48H16L12 8z" stroke="#F45116" stroke-width="3"/><path d="M24 8V4h16v4" stroke="#F45116" stroke-width="2"/><circle cx="32" cy="30" r="8" stroke="#F45116" stroke-width="2"/><path d="M29 27l2 2 4-4" stroke="#F45116" stroke-width="2"/></svg>`,
  "photo-personalized": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="8" width="48" height="48" rx="4" stroke="#F45116" stroke-width="3"/><circle cx="24" cy="24" r="6" fill="#F45116"/><path d="M8 44l14-14 10 10 8-8 16 16" stroke="#F45116" stroke-width="2"/></svg>`,
  "wedding-event": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M32 12C20 12 12 22 12 30c0 12 20 22 20 22s20-10 20-22c0-8-8-18-20-18z" stroke="#F45116" stroke-width="3"/><path d="M28 28l4 4 8-8" stroke="#F45116" stroke-width="2"/></svg>`,
  "3d-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M32 8L8 24v16l24 16 24-16V24L32 8z" stroke="#F45116" stroke-width="3"/><path d="M8 24l24 16 24-16" stroke="#F45116" stroke-width="2"/><path d="M32 40v16" stroke="#F45116" stroke-width="2"/></svg>`,
  "textile-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M16 16h32v40H16z" stroke="#F45116" stroke-width="3"/><path d="M20 16V12a12 12 0 0124 0v4" stroke="#F45116" stroke-width="2"/><path d="M24 32h16M24 40h12" stroke="#F45116" stroke-width="2"/></svg>`,
  "screen-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="10" y="10" width="44" height="44" rx="2" stroke="#F45116" stroke-width="3"/><path d="M10 32h44" stroke="#F45116" stroke-width="1"/><path d="M32 10v44" stroke="#F45116" stroke-width="1"/><circle cx="32" cy="32" r="10" stroke="#F45116" stroke-width="2"/></svg>`,
  "uv-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="20" stroke="#F45116" stroke-width="3"/><path d="M32 12v8M32 44v8M12 32h8M44 32h8" stroke="#F45116" stroke-width="2"/><circle cx="32" cy="32" r="8" fill="#F45116"/></svg>`,
  "sublimation-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="16" y="20" width="32" height="28" rx="4" stroke="#F45116" stroke-width="3"/><path d="M24 20V16a8 8 0 0116 0v4" stroke="#F45116" stroke-width="2"/><circle cx="32" cy="34" r="6" stroke="#F45116" stroke-width="2"/></svg>`,
  "digital-sign": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="8" width="48" height="32" rx="4" stroke="#F45116" stroke-width="3"/><path d="M32 40v16" stroke="#F45116" stroke-width="3"/><rect x="16" y="16" width="32" height="16" rx="2" fill="#F45116" opacity="0.2"/></svg>`,
  "corporate-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="12" y="8" width="40" height="48" rx="3" stroke="#F45116" stroke-width="3"/><path d="M20 20h24M20 28h24M20 36h16" stroke="#F45116" stroke-width="2"/><rect x="20" y="44" width="24" height="4" rx="1" fill="#F45116"/></svg>`,
  "stationery-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="14" y="8" width="36" height="48" rx="2" stroke="#F45116" stroke-width="3"/><path d="M14 16h36" stroke="#F45116" stroke-width="2"/><path d="M22 24h20M22 32h20M22 40h12" stroke="#F45116" stroke-width="1.5"/></svg>`,
  "label-sticker": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M12 32l20-20 20 20-20 20L12 32z" stroke="#F45116" stroke-width="3"/><circle cx="32" cy="32" r="6" fill="#F45116"/></svg>`,
  "calendar-printing": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="12" width="48" height="44" rx="4" stroke="#F45116" stroke-width="3"/><path d="M8 24h48" stroke="#F45116" stroke-width="2"/><path d="M20 8v8M44 8v8" stroke="#F45116" stroke-width="2"/><rect x="16" y="30" width="8" height="6" rx="1" fill="#F45116"/><rect x="28" y="30" width="8" height="6" rx="1" fill="#F45116" opacity="0.4"/></svg>`,
  "book-publication": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M12 8h40a4 4 0 014 4v40a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="#F45116" stroke-width="3"/><path d="M16 8v48" stroke="#F45116" stroke-width="2"/><path d="M24 20h24M24 28h24M24 36h16" stroke="#F45116" stroke-width="1.5"/></svg>`,
  "menu-restaurant": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="12" y="8" width="40" height="48" rx="4" stroke="#F45116" stroke-width="3"/><path d="M20 20h24M20 30h20M20 40h16" stroke="#F45116" stroke-width="2"/><circle cx="44" cy="44" r="8" stroke="#F45116" stroke-width="2"/></svg>`,
  "exhibition-display": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="8" width="36" height="48" rx="2" stroke="#F45116" stroke-width="3"/><path d="M44 8v48" stroke="#F45116" stroke-width="2"/><rect x="48" y="16" width="8" height="32" rx="1" fill="#F45116" opacity="0.3"/></svg>`,
  "id-access-card": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="16" width="48" height="32" rx="4" stroke="#F45116" stroke-width="3"/><circle cx="24" cy="30" r="6" stroke="#F45116" stroke-width="2"/><path d="M36 28h12M36 36h8" stroke="#F45116" stroke-width="2"/></svg>`,
  "invitation-greeting": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="12" width="48" height="40" rx="4" stroke="#F45116" stroke-width="3"/><path d="M8 12l24 18 24-18" stroke="#F45116" stroke-width="2"/><path d="M32 30v18" stroke="#F45116" stroke-width="1.5"/></svg>`,
  "marketing-material": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M16 8l-8 24 8 24h32l8-24-8-24H16z" stroke="#F45116" stroke-width="3"/><path d="M24 24h16M24 32h12" stroke="#F45116" stroke-width="2"/></svg>`,
  "packaging-branding": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M32 8L8 20v24l24 12 24-12V20L32 8z" stroke="#F45116" stroke-width="3"/><path d="M32 32v24" stroke="#F45116" stroke-width="2"/><path d="M8 20l24 12" stroke="#F45116" stroke-width="1.5"/><path d="M56 20l-24 12" stroke="#F45116" stroke-width="1.5"/></svg>`,
  "office-business": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="16" width="48" height="36" rx="3" stroke="#F45116" stroke-width="3"/><path d="M20 16V12h24v4" stroke="#F45116" stroke-width="2"/><path d="M16 28h32M16 36h24" stroke="#F45116" stroke-width="1.5"/></svg>`,
  "outdoor-advertising": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="4" y="8" width="56" height="32" rx="2" stroke="#F45116" stroke-width="3"/><path d="M16 40v16h32V40" stroke="#F45116" stroke-width="2"/><text x="32" y="28" text-anchor="middle" fill="#F45116" font-size="10" font-weight="bold">AD</text></svg>`,
  "custom-specialty": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="#F45116" stroke-width="3"/><path d="M32 16v32M16 32h32" stroke="#F45116" stroke-width="2"/><circle cx="32" cy="32" r="8" stroke="#F45116" stroke-width="2"/></svg>`,
};

const categories = [
  { name: "Digital Printing", subcategories: ["Visiting Card Printing", "Flyer Printing", "Brochure Printing", "Poster Printing", "Photo Printing", "ID Card Printing"] },
  { name: "Offset Printing", subcategories: ["Book Printing", "Magazine Printing", "Newspaper Printing", "Catalog Printing", "Letterhead Printing", "Envelope Printing"] },
  { name: "Large Format Printing", subcategories: ["Banner Printing", "Flex Printing", "Hoarding Printing", "Vinyl Printing", "Backlit Printing", "Standee Printing"] },
  { name: "Packaging Printing", subcategories: ["Box Printing", "Paper Bag Printing", "Label Printing", "Sticker Printing", "Packaging Sleeve Printing"] },
  { name: "Signage", subcategories: ["Acrylic Sign Board", "LED Sign Board", "Glow Sign Board", "3D Letter Sign", "Metal Sign Board", "Direction Sign Board"] },
  { name: "Promotional Printing", subcategories: ["Promotional T-Shirt", "Promotional Mug", "Cap Printing", "Keychain Printing", "Corporate Gifts"] },
  { name: "Photo & Personalized Printing", subcategories: ["Photo Album", "Photo Frame", "Canvas Printing", "Personalized Calendar", "Personalized Gifts"] },
  { name: "Wedding & Event Printing", subcategories: ["Wedding Card", "Invitation Card", "Birthday Invitation", "Event Ticket", "Thank You Card"] },
  { name: "3D Printing", subcategories: ["3D Prototype", "3D Model Printing", "Custom 3D Parts", "Architectural Model", "Product Prototype"] },
  { name: "Textile Printing", subcategories: ["T-Shirt Printing", "Hoodie Printing", "Fabric Printing", "Custom Cloth Printing", "DTF Printing"] },
  { name: "Screen Printing", subcategories: ["T-Shirt Screen Printing", "Fabric Screen Printing", "Poster Screen Printing", "Sticker Screen Printing"] },
  { name: "UV Printing", subcategories: ["UV Flatbed Printing", "UV Acrylic Printing", "UV Wood Printing", "UV Glass Printing", "UV Metal Printing"] },
  { name: "Sublimation Printing", subcategories: ["Mug Sublimation", "T-Shirt Sublimation", "Bottle Sublimation", "Cushion Sublimation", "Keychain Sublimation"] },
  { name: "Digital Sign Printing", subcategories: ["Shop Sign Printing", "Office Sign Printing", "Direction Signs", "Safety Signs", "Promotional Signs"] },
  { name: "Corporate Printing", subcategories: ["Company Brochure", "Corporate Folder", "Letterhead", "Business Cards", "Presentation Folder", "Corporate Stationery"] },
  { name: "Stationery Printing", subcategories: ["Notebook Printing", "Diary Printing", "Notepad Printing", "Receipt Book Printing", "Register Printing"] },
  { name: "Label & Sticker Printing", subcategories: ["Product Labels", "Barcode Labels", "Vinyl Stickers", "Transparent Stickers", "Die Cut Stickers"] },
  { name: "Calendar Printing", subcategories: ["Wall Calendar", "Table Calendar", "Desk Calendar", "Pocket Calendar", "Custom Calendar"] },
  { name: "Book & Publication Printing", subcategories: ["Paperback Books", "Hardcover Books", "School Books", "Children Books", "Training Manuals"] },
  { name: "Menu & Restaurant Printing", subcategories: ["Restaurant Menu", "Cafe Menu", "Takeaway Menu", "Table Tent", "Food Packaging"] },
  { name: "Exhibition & Display Printing", subcategories: ["Rollup Standee", "X Banner", "Exhibition Backdrop", "Display Board", "Promotional Wall"] },
  { name: "ID & Access Card Printing", subcategories: ["Employee ID Card", "Student ID Card", "Membership Card", "PVC Card", "Access Card"] },
  { name: "Invitation & Greeting Printing", subcategories: ["Wedding Invitation", "Birthday Invitation", "Anniversary Card", "Greeting Card", "Thank You Card"] },
  { name: "Marketing Material Printing", subcategories: ["Leaflet", "Brochure", "Flyer", "Poster", "Catalogue", "Promotional Folder"] },
  { name: "Packaging & Branding", subcategories: ["Custom Boxes", "Branded Bags", "Product Sleeves", "Packaging Labels", "Shipping Boxes"] },
  { name: "Office & Business Printing", subcategories: ["Invoice Printing", "Quotation Printing", "Letterhead Printing", "Business Forms", "Office Envelopes"] },
  { name: "Outdoor Advertising", subcategories: ["Billboard Printing", "Hoarding Printing", "Outdoor Banner", "Pole Banner", "Building Wrap"] },
  { name: "Custom & Specialty Printing", subcategories: ["Metal Printing", "Wood Printing", "Acrylic Printing", "Glass Printing", "Leather Printing", "Custom Print Products"] },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const existingCount = await Category.countDocuments({ type: "parent" });
    console.log(`Existing parent categories: ${existingCount}`);

    if (existingCount >= 28) {
      console.log("28+ parent categories already exist. Skipping seed.");
      await mongoose.disconnect();
      return;
    }

    let createdParents = 0;
    let createdSubs = 0;

    for (const cat of categories) {
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const existing = await Category.findOne({ slug, type: "parent" });

      let parentId;
      if (existing) {
        console.log(`Parent already exists: ${cat.name}`);
        parentId = existing._id;
        if (!existing.image && svgIcons[slug]) {
          existing.image = svgIcons[slug];
          await existing.save();
          console.log(`  Updated image for: ${cat.name}`);
        }
      } else {
        try {
          const parent = await Category.create({
            name: cat.name,
            slug,
            type: "parent",
            image: svgIcons[slug] || "",
            isActive: true,
            description: `${cat.name} services`,
          });
          parentId = parent._id;
          createdParents++;
          console.log(`Created parent: ${cat.name}`);
        } catch (err) {
          if (err.code === 11000) {
            const fallback = await Category.findOne({ name: cat.name, type: "parent" });
            if (fallback) {
              parentId = fallback._id;
              console.log(`Parent name conflict, found existing: ${cat.name}`);
            }
          } else {
            throw err;
          }
        }
      }

      for (const subName of cat.subcategories) {
        const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const existingSub = await Category.findOne({ slug: subSlug, type: "subcategory" });
        const existingByName = await Category.findOne({ name: subName, type: "subcategory" });
        if (!existingSub && !existingByName) {
          try {
            await Category.create({
              name: subName,
              slug: subSlug,
              type: "subcategory",
              parentId,
              isActive: true,
              description: `${subName} services`,
            });
            createdSubs++;
            console.log(`  Created subcategory: ${subName}`);
          } catch (err) {
            if (err.code === 11000) {
              console.log(`  Subcategory name conflict (skipping): ${subName}`);
            } else {
              throw err;
            }
          }
        } else {
          console.log(`  Subcategory already exists: ${subName}`);
        }
      }
    }

    console.log(`\nSeed complete!`);
    console.log(`Parent categories created: ${createdParents}`);
    console.log(`Subcategories created: ${createdSubs}`);

    const totalParents = await Category.countDocuments({ type: "parent" });
    const totalSubs = await Category.countDocuments({ type: "subcategory" });
    console.log(`Total parents in DB: ${totalParents}`);
    console.log(`Total subcategories in DB: ${totalSubs}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Seed error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
