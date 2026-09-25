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
// Comma-separated so extra origins (Vercel preview URLs, a custom domain
// later) can be added from the dashboard without a code change.
const ALLOWED_ORIGINS = [
  ...(process.env.ADMIN_APP_ORIGIN || "http://localhost:5173").split(","),
  ...(process.env.CUSTOMER_APP_ORIGIN || "http://localhost:5174").split(","),
]
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
// verify: captures the exact raw request bytes onto req.rawBody. The Razorpay
// webhook signature is computed over the raw body, not the parsed object -
// this is the cheapest way to keep that available without a second,
// route-specific body parser just for one endpoint.
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Serves uploaded product images: /uploads/<category-slug>/<file> -> uploads/<category-slug>/<file> on disk
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// /health doubles as the keep-warm target for an external cron ping, which
// is what stops a free-tier host sleeping between morning orders.
app.get("/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes); // no auth - customer site reads from here

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found.", errors: null });
});

app.use(errorHandler);

module.exports = app;
