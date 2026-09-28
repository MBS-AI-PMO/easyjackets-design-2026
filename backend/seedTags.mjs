import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import mongoose from 'mongoose';
import SiteTag from './models/SiteTag.js';

const tags = [
  {
    name: "Theme Color",
    tagType: "meta",
    attributes: { name: "theme-color", content: "#000000" }
  },
  {
    name: "Site Description",
    tagType: "meta",
    attributes: { name: "description", content: "Design your own custom varsity and letterman jackets at Easy Jackets. Premium quality materials, personalized embroidery, and worldwide shipping." }
  },
  {
    name: "Main Title",
    tagType: "title",
    content: "Easy Jackets | Custom Varsity & Letterman Jackets"
  },
  {
    name: "Ahrefs Verification",
    tagType: "meta",
    attributes: { name: "ahrefs-site-verification", content: "15c433078cef99c876264eac6cf8541644f4eb9ec54762653521d53cf9ade655" }
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to DB');

    // Check if they already exist so we don't duplicate on reruns
    const count = await SiteTag.countDocuments();
    if (count > 0) {
      console.log('Tags already seeded. Dropping existing tags...');
      await SiteTag.deleteMany({});
    }

    await SiteTag.insertMany(tags);
    console.log('Inserted tags successfully!');
  } catch (error) {
    console.error('Error seeding db:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
