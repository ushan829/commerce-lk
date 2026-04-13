import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function checkAds() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database not found");
    const ads = await db.collection("ads").find({}).toArray();

    console.log(`Found ${ads.length} ads:`);
    ads.forEach((ad, i) => {
      console.log(`\n--- Ad ${i + 1} ---`);
      console.log(`ID: ${ad._id}`);
      console.log(`Title: ${ad.title}`);
      console.log(`Position: "${ad.position}"`);
      console.log(`isActive: ${ad.isActive} (Type: ${typeof ad.isActive})`);
      console.log(`Status: ${ad.status}`);
      console.log(`Active: ${ad.active}`);
      console.log(`Type: ${ad.type}`);
      console.log(`StartDate: ${ad.startDate}`);
      console.log(`EndDate: ${ad.endDate}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAds();
