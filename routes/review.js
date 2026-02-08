const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middlewares.js");

const reviewController = require("../controllers/reviews.js");

// post route for adding a review to a listing
router.post("/",isLoggedIn , validateReview, wrapAsync(reviewController.createReview));

// delete route for removing a review from a listing
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;