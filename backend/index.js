// packages
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import opencage from "opencage-api-client";
import axios from "axios";

// Utiles
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import AdressRoutes from "./routes/addressRoutes.js";
import BrandRoutes from "./routes/brandRoutes.js";
import TaxRoutes from './routes/taxRoutes.js';
import BannerRoutes from "./routes/bannerRoutes.js";
import OfferRoutes from './routes/offerRoutes.js'
import cors from 'cors';

dotenv.config();
const port = process.env.PORT || 5000;
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY || '';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const EXCHANGE_API_DOMAIN = process.env.EXCHANGE_API_DOMAIN || '';

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", AdressRoutes);
app.use("/api/brands", BrandRoutes);
app.use('/api/tax', TaxRoutes);
app.use('/api/banner',BannerRoutes);
app.use('/api/offer',OfferRoutes);

app.get("/api/config/paypal", (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});
app.get('/api/config/exchange',(req,res)=>{
  res.send({apikey:process.env.EXCHANGE_API_KEY })
})

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

app.listen(port, () => console.log(`Server running on port: ${port}`));
