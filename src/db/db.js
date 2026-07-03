import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

const buildDirectUri = async (srvUri) => {
  const match = srvUri.match(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(?:\/([^?]*))?(?:\?(.+))?/
  );
  if (!match) throw new Error("Invalid mongodb+srv URI");

  const [, user, pass, host, dbName = "", queryStr = ""] = match;

  const resolver = new dns.Resolver();
  resolver.setServers(["8.8.8.8", "8.8.4.4"]);

  const resolveSrv = (h) =>
    new Promise((ok, fail) =>
      resolver.resolveSrv(`_mongodb._tcp.${h}`, (e, r) => (e ? fail(e) : ok(r)))
    );

  const resolveTxt = (h) =>
    new Promise((ok) =>
      resolver.resolveTxt(h, (e, r) => ok(e ? [] : r))
    );

  const [srvRecords, txtRecords] = await Promise.all([
    resolveSrv(host),
    resolveTxt(host),
  ]);

  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
  const txtOptions = txtRecords.flat().join("&");
  const params = [txtOptions, queryStr, "tls=true"].filter(Boolean).join("&");

  return `mongodb://${user}:${pass}@${hosts}/${dbName}?${params}`;
};

const connectDB = async () => {
  console.log("🔄 MongoDB connect করার চেষ্টা করছি...");

  try {
    const uri = process.env.MONGODB_URI;
    
    const connectionUri = uri.startsWith("mongodb+srv://")
      ? await buildDirectUri(uri)
      : uri;

    const conn = await mongoose.connect(connectionUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
