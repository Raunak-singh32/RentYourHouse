const Listing = require("../models/listing");
// const Review = require("../models/review"); // not needed because delete hook is in model

// ✅ INDEX with category filter
// /listings?cat=mountains
// /listings?cat=iconic
// /listings?cat=trending  -> show all
module.exports.index = async (req, res) => {
  const { cat } = req.query;

  let filter = {};
  if (cat && cat !== "trending") {
    filter = { categories: cat }; // MongoDB matches array contains value
  }

  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", { allListings, selectedCat: cat || "trending" });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews").populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // ✅ normalize amenities (string -> array)
  if (req.body.listing.amenities && !Array.isArray(req.body.listing.amenities)) {
    req.body.listing.amenities = [req.body.listing.amenities];
  }

  // ✅ normalize categories (string -> array)
  if (req.body.listing.categories && !Array.isArray(req.body.listing.categories)) {
    req.body.listing.categories = [req.body.listing.categories];
  }

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "listing you requested not found");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // ✅ normalize amenities (string -> array)
  if (req.body.listing.amenities && !Array.isArray(req.body.listing.amenities)) {
    req.body.listing.amenities = [req.body.listing.amenities];
  }

  // ✅ normalize categories (string -> array)
  if (req.body.listing.categories && !Array.isArray(req.body.listing.categories)) {
    req.body.listing.categories = [req.body.listing.categories];
  }

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true, runValidators: true }
  );

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destoryListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

// ✅ Price Prediction API (keep it, not using now)
module.exports.predictPrice = async (req, res) => {
  const L = req.body.listing || req.body;

  let base = 800;

  const locationStr = `${L.city || ""} ${L.location || ""}`.toLowerCase();
  if (locationStr.includes("mumbai")) base += 1200;
  else if (locationStr.includes("delhi")) base += 1000;
  else if (locationStr.includes("bangalore")) base += 900;
  else if (locationStr.includes("kolkata")) base += 600;
  else if (locationStr.includes("goa")) base += 1300;

  const propertyBoost = {
    apartment: 200,
    house: 300,
    villa: 900,
    hotel: 700,
    hostel: -150,
    guesthouse: 150,
    other: 0,
  };
  base += propertyBoost[L.propertyType] || 0;

  const roomMult = { entire_place: 1.25, private_room: 1.0, shared_room: 0.8 };
  base = Math.round(base * (roomMult[L.roomType] || 1));

  base += Number(L.guests || 0) * 120;
  base += Number(L.bedrooms || 0) * 350;
  base += Number(L.bathrooms || 0) * 250;

  const predicted = Math.max(300, Math.round(base / 50) * 50);
  res.json({ predictedPrice: predicted });
};
