import { eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { urlShortenerTable } from "./db/schema";

function generateShortcode(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shortcode = "";
  for (let i = 0; i < length; i++) {
    shortcode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortcode;
}

async function createShortUrl(originalUrl: string) {
  let shortcode = "";
  let exists = true;

  // Ensure shortcode uniqueness
  while (exists) {
    shortcode = generateShortcode();
    exists =
      (
        await db
          .select()
          .from(urlShortenerTable)
          .where(eq(urlShortenerTable.short_code, shortcode))
      ).length > 0;
  }

  await db
    .insert(urlShortenerTable)
    .values({ original_url: originalUrl, short_code: shortcode });

  return shortcode;
}

function generateDummyUrl(index: number) {
  const domains = ["example.com", "testsite.org", "dummy.net", "mysite.io"];
  const paths = ["about", "contact", "blog", "product", "category", "search"];
  const queries = ["?id=123", "?ref=abc", "?page=2", "?sort=asc"];

  const domain = domains[Math.floor(Math.random() * domains.length)];
  const path = paths[Math.floor(Math.random() * paths.length)];
  const query =
    Math.random() < 0.5
      ? queries[Math.floor(Math.random() * queries.length)]
      : "";

  return `https://${domain}/${path}/${index}${query}`;
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString();
}

async function main(count: number) {
  const start = new Date();
  console.log(`🚀 Started at: ${getTimestamp()}`);

  for (let i = 1; i <= count; i++) {
    const dummyUrl = generateDummyUrl(i);
    const shortcode = await createShortUrl(dummyUrl);
    console.log(`[${i}] Shortened: ${dummyUrl} => ${shortcode}`);
  }

  const end = new Date();
  console.log(`✅ Seeding completed at: ${getTimestamp()}`);
  console.log(`🕒 Total time: ${end.getTime() - start.getTime()} ms`);
}

async function mainSelect(count: number) {
  const start = new Date();
  console.log(`🚀 Started at: ${getTimestamp()}`);

  for (let i = 1; i <= count; i++) {
    await db
      .select({ url: urlShortenerTable.original_url })
      .from(urlShortenerTable)
      .where(
        inArray(urlShortenerTable.short_code, [
          "E6ligJ",
          "13nwTo",
          "xDVbh9",
          "9waxb8",
          "4kA8iE",
        ])
      );
    console.log(`[${i}] Fetched 5 URLs`);
  }

  const end = new Date();
  console.log(`✅ Fetching completed at: ${getTimestamp()}`);
  console.log(`🕒 Total time: ${end.getTime() - start.getTime()} ms`);
}

// main(10000000);
mainSelect(1000000);
