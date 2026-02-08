const Listing = require("../models/listing");

module.exports.index = (async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
})

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate("reviews")
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};


// module.exports.createListing = (async (req, res, next) => {
//     console.log("user:", req.user);
//     const listingData = req.body.listing;
//     listingData.image = {
//         url: listingData.image || "/images/default.jpg",
//         filename: "listingimage",
//     };
//     const newListing = new Listing(listingData);
//     console.log("USER ID:", req.user?._id);
//     newListing.owner = req.user._id;
//     await newListing.save();
//     req.flash("success", "New listing created1");
//     res.redirect("/listings");
// })
module.exports.createListing = (async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
        url: url,
        filename: filename,
    };
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
})


module.exports.renderEditForm = (async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing you requested not found");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
})

// module.exports.updateListing = (async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(id,{ ...req.body.listing });
//     if(typeof  req.file !== "undefined"){
//     let url = req.file.path;
//     let filename = req.file.filename;
//     listing.image = {
//         url: url,
//         filename: filename,
//     };
//     await listing.save();}
//     req.flash("success", "Listing updated!");
//     res.redirect(`/listings/${id}`);
// })
// module.exports.updateListing = (async (req, res) => {
//     try {
//         const { id } = req.params;
//         const listing = req.body.listing;

//         listing.image = {
//             url: listing.image || "/images/default.jpg",
//             filename: "listingimage",
//         };

//         await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//         req.flash("success", "Listing updated!");
//         res.redirect(`/listings/${id}`);
//     } catch (err) {
//         console.log(err);
//         res.send("Error updating listing");
//     }
// })

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // update all normal fields (price, title, location, country, description...)
  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true, runValidators: true }
  );

  // update image only if a new file is uploaded
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


module.exports.destoryListing = (async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
})