const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

const adminRoutes = require("./routes/index");
const publicRoutes = require("./routes/public/public.routes");
const { errorHandler } = require("./middlewares/errorHandler.middleware");

const app = express();

// Two frontends now talk to this API: the admin panel and the customer site.
// Both origins need CORS clearance; only the admin one ever sends the auth cookie.
const ALLOWED_ORIGINS = [
  process.env.ADMIN_APP_ORIGIN || "http://localhost:5173",
  process.env.CUSTOMER_APP_ORIGIN || "http://localhost:5174",
];

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Serves uploaded product images: /uploads/<category-slug>/<file> -> uploads/<category-slug>/<file> on disk
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes); // no auth - customer site reads from here

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found.", errors: null });
});

app.use(errorHandler);

module.exports = app;
