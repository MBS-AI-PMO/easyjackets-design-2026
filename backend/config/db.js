import dns from "node:dns";
import mongoose from "mongoose";
import colors from "colors";
const connectDB = async () => {
  try {
    // Some local resolvers refuse the SRV lookup Atlas needs; set
    // DNS_SERVERS=1.1.1.1,8.8.8.8 to route the lookup around them.
    if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()));
    const url = process.env.MONGO_URL;
    console.log(`📡 Attempting to connect to MongoDB: ${url?.replace(/:([^@]+)@/, ':****@')}`);
    const conn = await mongoose.connect(url);
    console.log(
      `Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white
    );
  } catch (err) {
    console.log(`Error in Mongodb ${err}`.bgRed.white);
  }
};

export default connectDB;
