import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { EJSON } from "bson";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(backendRoot, "..");
const backupRoot = path.join(projectRoot, "EJ Backup");

dotenv.config({ path: path.join(backendRoot, ".env") });

const uri = process.env.MONGO_URL;
const timestamped = process.argv.includes("--timestamped");
const cleanTimestamped = process.argv.includes("--clean-timestamped");

if (!uri) {
  console.error("MONGO_URL is missing from node-backend/.env");
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputDir = timestamped ? path.join(backupRoot, `db-backup-${timestamp}`) : backupRoot;

const getDbName = (connectionUri) => {
  const parsed = new URL(connectionUri);
  const dbName = parsed.pathname.replace(/^\//, "");
  return dbName || "database";
};

const listJsonBackupFiles = async (dir, dbName) => {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => name.startsWith(`${dbName}.`) && name.endsWith(".json"))
      .sort();
  } catch {
    return [];
  }
};

const modelCollectionNames = async () => {
  const modelsDir = path.join(backendRoot, "models");
  const pluralize = mongoose.pluralize();

  try {
    const files = await fs.readdir(modelsDir);
    const modelNames = new Set();

    for (const file of files.filter((name) => name.endsWith(".js"))) {
      const source = await fs.readFile(path.join(modelsDir, file), "utf8");
      const matches = source.matchAll(/mongoose\.model\(\s*["']([^"']+)["']/g);

      for (const match of matches) {
        modelNames.add(match[1]);
      }
    }

    return [...modelNames]
      .map((name) => pluralize(name.toLowerCase()))
      .sort();
  } catch {
    return [];
  }
};

const withoutSystemCollections = (collections) =>
  collections.filter((collection) => !collection.startsWith("system."));

const difference = (left, right) => {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
};

const removeTimestampedBackupDirs = async () => {
  const entries = await fs.readdir(backupRoot, { withFileTypes: true });
  const backupRootResolved = path.resolve(backupRoot);

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("db-backup-")) {
      continue;
    }

    const target = path.resolve(backupRoot, entry.name);

    if (!target.startsWith(`${backupRootResolved}${path.sep}`)) {
      throw new Error(`Refusing to remove path outside backup root: ${target}`);
    }

    await fs.rm(target, { recursive: true, force: true });
  }
};

const connectMongo = async () => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    return client;
  } catch (error) {
    await client.close().catch(() => {});

    const isSrvLookupFailure =
      uri.startsWith("mongodb+srv://") &&
      ["ECONNREFUSED", "ETIMEOUT", "ENOTFOUND", "EAI_AGAIN"].includes(error.code);

    if (!isSrvLookupFailure) {
      throw error;
    }

    const dnsServers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,1.1.1.1")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    if (!dnsServers.length) {
      throw error;
    }

    console.log("System DNS failed MongoDB SRV lookup; retrying with configured DNS servers.");
    dns.setServers(dnsServers);

    const retryClient = new MongoClient(uri);
    await retryClient.connect();
    return retryClient;
  }
};

const main = async () => {
  const dbName = getDbName(uri);
  await fs.mkdir(outputDir, { recursive: true });

  const client = await connectMongo();
  const pendingFiles = [];

  try {
    const db = client.db(dbName);
    const liveCollections = withoutSystemCollections(
      (await db.listCollections({}, { nameOnly: true }).toArray())
        .map((collection) => collection.name)
        .sort()
    );

    const counts = {};

    for (const collectionName of liveCollections) {
      const collection = db.collection(collectionName);
      const docs = await collection.find({}).sort({ _id: 1 }).toArray();
      counts[collectionName] = docs.length;

      const targetFile = path.join(outputDir, `${dbName}.${collectionName}.json`);
      const tempFile = timestamped ? targetFile : `${targetFile}.${timestamp}.tmp`;

      await fs.writeFile(
        tempFile,
        `${EJSON.stringify(docs, null, 2)}\n`,
        "utf8"
      );

      pendingFiles.push({ tempFile, targetFile });
    }

    if (!timestamped) {
      for (const { tempFile, targetFile } of pendingFiles) {
        await fs.rename(tempFile, targetFile);
      }
    }

    const existingRootFiles = await listJsonBackupFiles(backupRoot, dbName);
    const existingRootCollections = existingRootFiles.map((name) =>
      name.slice(`${dbName}.`.length, -".json".length)
    );
    const modelCollections = await modelCollectionNames();

    const report = {
      createdAt: new Date().toISOString(),
      database: dbName,
      outputDir,
      collectionCount: liveCollections.length,
      documentCounts: counts,
      liveCollections,
      existingRootBackupCollections: existingRootCollections,
      modelCollections,
      missingFromExistingRootBackup: difference(liveCollections, existingRootCollections),
      missingFromNewBackup: difference(liveCollections, liveCollections),
      rootBackupFilesWithoutLiveCollection: difference(existingRootCollections, liveCollections),
      modelCollectionsMissingFromLiveDatabase: difference(modelCollections, liveCollections),
      liveCollectionsWithoutModelFile: difference(liveCollections, modelCollections),
    };

    if (timestamped) {
      await fs.writeFile(
        path.join(outputDir, "backup-report.json"),
        `${JSON.stringify(report, null, 2)}\n`,
        "utf8"
      );
    }

    if (cleanTimestamped) {
      await removeTimestampedBackupDirs();
    }

    console.log(`Backup complete: ${outputDir}`);
    console.log(`Collections exported: ${liveCollections.length}`);
    console.log(
      `Missing from existing root backup: ${report.missingFromExistingRootBackup.length || "none"}`
    );
    console.log(
      `Root backup files without live collection: ${
        report.rootBackupFilesWithoutLiveCollection.length || "none"
      }`
    );
    console.log(
      `Model collections missing from live database: ${
        report.modelCollectionsMissingFromLiveDatabase.length || "none"
      }`
    );
  } finally {
    if (!timestamped) {
      await Promise.all(
        pendingFiles.map(({ tempFile }) => fs.rm(tempFile, { force: true }).catch(() => {}))
      );
    }

    await client.close();
  }
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
