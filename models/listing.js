const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      required: true,
    },
  },

  price: {
    type: Number,
    required: true,
  },

  // Existing fields (keep)
  location: {
    type: String,
  },
  country: {
    type: String,
  },

  // ✅ Categories (multiple)
 
categories: [
  {
    type: String,
    enum: [
      "trending",
      "rooms",
      "iconic",
      "mountains",
      "castles",
      "amazing_pools",
      "camping",
      "farms",
      "arctic",
      "domes",
      "boats",
      "beach",
      "city",
      "luxury",
    ],
  },
],


  // ✅ New fields for price prediction
  propertyType: {
    type: String,
    enum: ["apartment", "house", "villa", "hotel", "hostel", "guesthouse", "other"],
    default: "other",
  },
  roomType: {
    type: String,
    enum: ["entire_place", "private_room", "shared_room"],
    default: "entire_place",
  },

  guests: {
    type: Number,
    min: 1,
    default: 1,
  },
  bedrooms: {
    type: Number,
    min: 0,
    default: 0,
  },
  beds: {
    type: Number,
    min: 0,
    default: 0,
  },
  bathrooms: {
    type: Number,
    min: 0,
    default: 0,
  },

  amenities: [
    {
      type: String, // e.g. "wifi", "ac", "tv"
    },
  ],

  extraAmenities: {
    type: String, // e.g. "power backup, balcony"
    default: "",
  },

  // Optional but helpful structured location (you can fill later)
  city: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  pincode: {
    type: String,
    default: "",
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
