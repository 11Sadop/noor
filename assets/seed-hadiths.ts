import { db } from "../server/db";
import { bukhariHadiths, muslimHadiths } from "../shared/schema";
import fs from "fs";
import path from "path";

interface SourceHadith {
  id: number;
  idInBook: number;
  chapterId: number;
  bookId: number;
  arabic: string;
  english?: {
    narrator?: string;
    text?: string;
  };
}

interface SourceChapter {
  id: number;
  bookId: number;
  arabic: string;
  english: string;
}

interface SourceData {
  id: number;
  metadata: {
    id: number;
    length: number;
    arabic: { title: string; author: string };
    english: { title: string; author: string };
  };
  chapters: SourceChapter[];
  hadiths: SourceHadith[];
}

async function seedHadiths() {
  console.log("Starting hadith seeding...");

  const scriptsDir = path.dirname(new URL(import.meta.url).pathname);
  const bukhariData: SourceData = JSON.parse(fs.readFileSync(path.join(scriptsDir, "bukhari.json"), "utf-8"));
  const muslimData: SourceData = JSON.parse(fs.readFileSync(path.join(scriptsDir, "muslim.json"), "utf-8"));

  console.log(`Bukhari hadiths: ${bukhariData.hadiths.length}`);
  console.log(`Muslim hadiths: ${muslimData.hadiths.length}`);

  const bukhariChapterMap = new Map<number, string>();
  bukhariData.chapters.forEach((ch) => {
    bukhariChapterMap.set(ch.id, ch.arabic);
  });

  const muslimChapterMap = new Map<number, string>();
  muslimData.chapters.forEach((ch) => {
    muslimChapterMap.set(ch.id, ch.arabic);
  });

  console.log("Clearing existing Bukhari hadiths...");
  await db.delete(bukhariHadiths);

  console.log("Inserting Bukhari hadiths in batches...");
  const bukhariRecords = bukhariData.hadiths.map((h) => ({
    hadithNumber: h.id,
    bookNumber: h.chapterId,
    bookName: bukhariChapterMap.get(h.chapterId) || `كتاب ${h.chapterId}`,
    text: h.arabic,
  }));

  const batchSize = 500;
  for (let i = 0; i < bukhariRecords.length; i += batchSize) {
    const batch = bukhariRecords.slice(i, i + batchSize);
    await db.insert(bukhariHadiths).values(batch);
    console.log(`Bukhari: Inserted ${Math.min(i + batchSize, bukhariRecords.length)}/${bukhariRecords.length}`);
  }

  console.log("Clearing existing Muslim hadiths...");
  await db.delete(muslimHadiths);

  console.log("Inserting Muslim hadiths in batches...");
  const muslimRecords = muslimData.hadiths.map((h) => ({
    hadithNumber: h.id,
    bookNumber: h.chapterId,
    bookName: muslimChapterMap.get(h.chapterId) || `كتاب ${h.chapterId}`,
    text: h.arabic,
  }));

  for (let i = 0; i < muslimRecords.length; i += batchSize) {
    const batch = muslimRecords.slice(i, i + batchSize);
    await db.insert(muslimHadiths).values(batch);
    console.log(`Muslim: Inserted ${Math.min(i + batchSize, muslimRecords.length)}/${muslimRecords.length}`);
  }

  console.log("Seeding complete!");
  console.log(`Total Bukhari: ${bukhariRecords.length}`);
  console.log(`Total Muslim: ${muslimRecords.length}`);
  console.log(`Grand Total: ${bukhariRecords.length + muslimRecords.length}`);

  process.exit(0);
}

seedHadiths().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
