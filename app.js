if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbUrl = process.env.ATLASDB_URL;
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const bookingRoutes = require('./routes/bookings');

// ✅ Require all routes at top
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const aiRoutes = require("./routes/ai");
const paymentRoutes = require('./routes/payments');

// ✅ DB connect
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// ✅ View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsmate);

// ✅ Middlewares - MUST be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ✅ AI routes (after body parsers)
app.use("/api", aiRoutes);

// ✅ Session store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", () => {
  console.log("Error in MONGO session store");
});

const sessionOptions = {
  store: store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ✅ Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Locals middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ✅ Demo route
app.get("/demouser", async (req, res) => {
  const fakeUser = new User({
    email: "student@gmail.com",
    username: "delta-student",
  });
  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});

// ✅ App routes - ALL routes here
app.use('/payments', paymentRoutes);  // ✅ Payment routes
app.use('/bookings', bookingRoutes);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ✅ 404 handler - MUST be last
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ✅ Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// ✅ Server listen
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server is listening to port ${PORT}`);
});