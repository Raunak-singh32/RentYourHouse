const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi
    .object({
      title: joi.string().required(),
      description: joi.string().required(),
      location: joi.string().required(),
      country: joi.string().required(),

      price: joi.number().required().min(0),
      image: joi.string().allow("", null),

      categories: joi
  .alternatives()
  .try(
    joi.array().items(
      joi.string().valid(
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
        "luxury"
      )
    ),
    joi.string().valid(
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
      "luxury"
    )
  )
  .optional(),


      // ✅ Existing fields
      propertyType: joi
        .string()
        .valid(
          "apartment",
          "house",
          "villa",
          "hotel",
          "hostel",
          "guesthouse",
          "other"
        )
        .required(),

      roomType: joi
        .string()
        .valid("entire_place", "private_room", "shared_room")
        .required(),

      guests: joi.number().min(1).max(50).required(),
      bedrooms: joi.number().min(0).max(20).required(),
      beds: joi.number().min(0).max(50).required(),
      bathrooms: joi.number().min(0).max(20).required(),

      amenities: joi
        .alternatives()
        .try(joi.array().items(joi.string()), joi.string())
        .optional(),

      extraAmenities: joi.string().allow("").max(300).optional(),

      city: joi.string().allow("").max(50).optional(),
      state: joi.string().allow("").max(50).optional(),
      pincode: joi.string().allow("").max(10).optional(),
    })
    .required(),
});

module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().required().min(1).max(5),
      comment: joi.string().required(),
    })
    .required(),
});
