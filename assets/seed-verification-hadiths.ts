import { db } from "../server/db";
import { verificationHadiths, bukhariHadiths, muslimHadiths } from "../shared/schema";
import { sql } from "drizzle-orm";

interface HadeethEncHadith {
  id: string;
  title: string;
  hadeeth: string;
  attribution: string;
  grade: string;
  explanation: string;
}

async function fetchHadeethEncCategory(categoryId: number): Promise<HadeethEncHadith[]> {
  try {
    const response = await fetch(
      `https://hadeethenc.com/api/v1/hadeeths/list/?language=ar&category_id=${categoryId}&page=1&per_page=500`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.log(`Failed to fetch category ${categoryId}`);
    return [];
  }
}

async function fetchHadeethDetails(hadithId: string): Promise<HadeethEncHadith | null> {
  try {
    const response = await fetch(
      `https://hadeethenc.com/api/v1/hadeeths/one/?language=ar&id=${hadithId}`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function mapGrade(grade: string): "صحيح" | "حسن" | "ضعيف" | "موضوع" {
  if (!grade) return "صحيح";
  const lowerGrade = grade.toLowerCase();
  if (lowerGrade.includes("صحيح") || lowerGrade.includes("متفق")) return "صحيح";
  if (lowerGrade.includes("حسن")) return "حسن";
  if (lowerGrade.includes("ضعيف") || lowerGrade.includes("ضعّف")) return "ضعيف";
  if (lowerGrade.includes("موضوع") || lowerGrade.includes("مكذوب") || lowerGrade.includes("باطل")) return "موضوع";
  return "صحيح";
}

async function seedFromBukhariMuslim() {
  console.log("Adding hadiths from Bukhari and Muslim as صحيح...");
  
  const bukhari = await db.select().from(bukhariHadiths).limit(3000);
  const muslim = await db.select().from(muslimHadiths).limit(3000);
  
  console.log(`Found ${bukhari.length} Bukhari and ${muslim.length} Muslim hadiths`);
  
  const batchSize = 100;
  let count = 0;
  
  for (let i = 0; i < bukhari.length; i += batchSize) {
    const batch = bukhari.slice(i, i + batchSize).map(h => ({
      text: h.text.substring(0, 2000),
      status: "صحيح" as const,
      source: `صحيح البخاري - كتاب ${h.bookName} - حديث ${h.hadithNumber}`,
      narrator: null,
      explanation: null,
    }));
    
    await db.insert(verificationHadiths).values(batch).onConflictDoNothing();
    count += batch.length;
    process.stdout.write(`\rInserted ${count} Bukhari hadiths...`);
  }
  console.log("");
  
  count = 0;
  for (let i = 0; i < muslim.length; i += batchSize) {
    const batch = muslim.slice(i, i + batchSize).map(h => ({
      text: h.text.substring(0, 2000),
      status: "صحيح" as const,
      source: `صحيح مسلم - كتاب ${h.bookName} - حديث ${h.hadithNumber}`,
      narrator: null,
      explanation: null,
    }));
    
    await db.insert(verificationHadiths).values(batch).onConflictDoNothing();
    count += batch.length;
    process.stdout.write(`\rInserted ${count} Muslim hadiths...`);
  }
  console.log("");
}

async function seedFromHadeethEnc() {
  console.log("Fetching hadiths from HadeethEnc API...");
  
  const categories = [1, 2, 3, 4, 5, 6, 7, 59, 60, 62, 63, 64, 65, 121, 122, 124, 133, 134, 135, 136, 137, 138];
  
  let totalHadiths = 0;
  const batchSize = 50;
  let hadithBatch: any[] = [];
  
  for (const categoryId of categories) {
    console.log(`Fetching category ${categoryId}...`);
    const hadiths = await fetchHadeethEncCategory(categoryId);
    
    for (const hadith of hadiths) {
      if (!hadith.hadeeth || hadith.hadeeth.length < 10) continue;
      
      hadithBatch.push({
        text: hadith.hadeeth.substring(0, 2000),
        status: mapGrade(hadith.grade || "صحيح"),
        source: hadith.attribution || "موسوعة الأحاديث",
        narrator: null,
        explanation: hadith.explanation ? hadith.explanation.substring(0, 1000) : null,
      });
      
      if (hadithBatch.length >= batchSize) {
        await db.insert(verificationHadiths).values(hadithBatch).onConflictDoNothing();
        totalHadiths += hadithBatch.length;
        process.stdout.write(`\rInserted ${totalHadiths} HadeethEnc hadiths...`);
        hadithBatch = [];
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  if (hadithBatch.length > 0) {
    await db.insert(verificationHadiths).values(hadithBatch).onConflictDoNothing();
    totalHadiths += hadithBatch.length;
  }
  
  console.log(`\nTotal HadeethEnc hadiths: ${totalHadiths}`);
}

async function seedWeakAndFabricatedHadiths() {
  console.log("Adding known weak and fabricated hadiths for reference...");
  
  const weakHadiths = [
    { text: "اطلبوا العلم ولو بالصين", status: "ضعيف", source: "ضعيف الجامع (1005)", explanation: "ضعيف جداً - ضعفه الألباني" },
    { text: "حب الوطن من الإيمان", status: "موضوع", source: "الموضوعات لابن الجوزي", explanation: "لا أصل له - موضوع" },
    { text: "نظافة المؤمن من إيمانه", status: "ضعيف", source: "ضعيف الجامع", explanation: "لا أصل له بهذا اللفظ" },
    { text: "الجنة تحت أقدام الأمهات", status: "ضعيف", source: "المقاصد الحسنة", explanation: "ضعيف - والصحيح: الجنة عند رجليها" },
    { text: "خير الأسماء ما حُمِّد وعُبِّد", status: "ضعيف", source: "ضعيف الجامع (2859)", explanation: "ضعيف - ضعفه الألباني" },
    { text: "المؤمن يأكل في معى واحد والكافر يأكل في سبعة أمعاء", status: "صحيح", source: "صحيح البخاري (5393)", explanation: "صحيح" },
    { text: "اختلاف أمتي رحمة", status: "موضوع", source: "الموضوعات", explanation: "لا أصل له" },
    { text: "أنا مدينة العلم وعلي بابها", status: "موضوع", source: "الموضوعات لابن الجوزي", explanation: "موضوع - لا يصح" },
    { text: "من لم تنهه صلاته عن الفحشاء والمنكر لم يزدد من الله إلا بعداً", status: "موضوع", source: "الموضوعات", explanation: "لا يصح مرفوعاً" },
    { text: "السفر قطعة من العذاب", status: "صحيح", source: "صحيح البخاري (1804)", explanation: "صحيح متفق عليه" },
    { text: "ما خاب من استخار ولا ندم من استشار", status: "ضعيف", source: "ضعيف الجامع (5150)", explanation: "ضعيف - ضعفه الألباني" },
    { text: "أدبني ربي فأحسن تأديبي", status: "ضعيف", source: "السلسلة الضعيفة (2041)", explanation: "لا يصح" },
    { text: "الصبر نصف الإيمان", status: "ضعيف", source: "ضعيف الجامع", explanation: "ضعيف" },
    { text: "رجعنا من الجهاد الأصغر إلى الجهاد الأكبر", status: "موضوع", source: "الموضوعات", explanation: "لا أصل له" },
    { text: "توكل على الله ثم على فلان", status: "ضعيف", source: "ضعيف", explanation: "لا يصح هذا اللفظ" },
    { text: "أعمار أمتي بين الستين والسبعين", status: "حسن", source: "سنن الترمذي (3550)", explanation: "حسنه الترمذي والألباني" },
    { text: "ما ترك عبد شيئاً لله إلا عوضه الله خيراً منه", status: "صحيح", source: "مسند أحمد", explanation: "صححه الألباني" },
    { text: "لو كان بعدي نبي لكان عمر", status: "حسن", source: "سنن الترمذي (3686)", explanation: "حسنه الألباني" },
    { text: "علماء أمتي كأنبياء بني إسرائيل", status: "موضوع", source: "الموضوعات", explanation: "لا أصل له" },
    { text: "من قرأ سورة يس في ليلة ابتغاء وجه الله غفر له", status: "ضعيف", source: "السلسلة الضعيفة (6243)", explanation: "ضعيف جداً" },
    { text: "لكل شيء قلب وقلب القرآن يس", status: "ضعيف", source: "ضعيف الترمذي (2887)", explanation: "ضعيف" },
    { text: "اقرءوا على موتاكم يس", status: "ضعيف", source: "ضعيف أبي داود (3121)", explanation: "ضعيف" },
    { text: "الدال على الخير كفاعله", status: "صحيح", source: "صحيح مسلم (1893)", explanation: "صحيح" },
    { text: "إن الله جميل يحب الجمال", status: "صحيح", source: "صحيح مسلم (91)", explanation: "صحيح" },
    { text: "تفاءلوا بالخير تجدوه", status: "ضعيف", source: "لا أصل له", explanation: "لا أصل له مرفوعاً" },
    { text: "المرأة عورة", status: "ضعيف", source: "ضعيف الترغيب", explanation: "ضعيف" },
    { text: "الناس سواسية كأسنان المشط", status: "ضعيف", source: "ضعيف", explanation: "ضعيف جداً بهذا اللفظ" },
    { text: "أوصيكم بالنساء خيراً", status: "صحيح", source: "صحيح مسلم (1468)", explanation: "صحيح" },
    { text: "استوصوا بالنساء خيراً فإنهن عوان عندكم", status: "صحيح", source: "سنن الترمذي (1163)", explanation: "صحيح" },
    { text: "لا صلاة لجار المسجد إلا في المسجد", status: "ضعيف", source: "ضعيف الجامع (6331)", explanation: "ضعيف - موقوف على علي" },
    { text: "من حسن إسلام المرء تركه ما لا يعنيه", status: "حسن", source: "سنن الترمذي (2317)", explanation: "حسنه النووي" },
    { text: "خير الكلام ما قل ودل", status: "ضعيف", source: "لا أصل له مرفوعاً", explanation: "من كلام العرب وليس حديثاً" },
    { text: "العين حق ولو كان شيء سابق القدر لسبقته العين", status: "صحيح", source: "صحيح مسلم (2188)", explanation: "صحيح" },
    { text: "لو يعلم المار بين يدي المصلي ماذا عليه لكان أن يقف أربعين خيراً له من أن يمر بين يديه", status: "صحيح", source: "صحيح البخاري (510)", explanation: "صحيح" },
    { text: "العجلة من الشيطان", status: "حسن", source: "سنن الترمذي (2012)", explanation: "حسنه الألباني" },
    { text: "التأني من الله والعجلة من الشيطان", status: "حسن", source: "السلسلة الصحيحة (1795)", explanation: "حسنه الألباني" },
    { text: "أحبب حبيبك هوناً ما", status: "حسن", source: "سنن الترمذي (1997)", explanation: "حسنه الألباني" },
    { text: "يسروا ولا تعسروا وبشروا ولا تنفروا", status: "صحيح", source: "صحيح البخاري (69)", explanation: "متفق عليه" },
    { text: "لا ترجعوا بعدي كفاراً يضرب بعضكم رقاب بعض", status: "صحيح", source: "صحيح البخاري (121)", explanation: "صحيح" },
    { text: "كل مسكر حرام", status: "صحيح", source: "صحيح البخاري (5585)", explanation: "صحيح" },
    { text: "ما أسكر كثيره فقليله حرام", status: "صحيح", source: "سنن أبي داود (3681)", explanation: "صحيح" },
    { text: "لعن الله الخمر وشاربها وساقيها وبائعها ومبتاعها وعاصرها ومعتصرها وحاملها والمحمولة إليه", status: "صحيح", source: "سنن أبي داود (3674)", explanation: "صححه الألباني" },
    { text: "الخمر أم الخبائث", status: "حسن", source: "السلسلة الصحيحة (1854)", explanation: "حسنه الألباني" },
    { text: "كفى بالمرء كذباً أن يحدث بكل ما سمع", status: "صحيح", source: "صحيح مسلم (5)", explanation: "صحيح" },
    { text: "من كذب علي متعمداً فليتبوأ مقعده من النار", status: "صحيح", source: "صحيح البخاري (110)", explanation: "متواتر" },
    { text: "بلغوا عني ولو آية", status: "صحيح", source: "صحيح البخاري (3461)", explanation: "صحيح" },
    { text: "نضر الله امرأ سمع منا حديثاً فحفظه حتى يبلغه غيره", status: "صحيح", source: "سنن الترمذي (2656)", explanation: "صحيح" },
    { text: "رب مبلغ أوعى من سامع", status: "صحيح", source: "صحيح البخاري (67)", explanation: "صحيح" },
    { text: "الدين يسر", status: "صحيح", source: "صحيح البخاري (39)", explanation: "صحيح" },
    { text: "ولن يشاد الدين أحد إلا غلبه", status: "صحيح", source: "صحيح البخاري (39)", explanation: "صحيح" },
    { text: "إنما الأعمال بالخواتيم", status: "صحيح", source: "صحيح البخاري (6607)", explanation: "صحيح" },
    { text: "من أحب لقاء الله أحب الله لقاءه", status: "صحيح", source: "صحيح البخاري (6507)", explanation: "متفق عليه" },
    { text: "أكثروا ذكر هادم اللذات", status: "حسن", source: "سنن الترمذي (2307)", explanation: "حسنه الألباني" },
    { text: "كفى بالموت واعظاً", status: "حسن", source: "صحيح الترغيب (3333)", explanation: "حسن لغيره" },
    { text: "اذكروا الموت فإنه هادم اللذات", status: "صحيح", source: "صحيح الجامع (848)", explanation: "صحيح" },
    { text: "كل ابن آدم خطاء وخير الخطائين التوابون", status: "حسن", source: "سنن الترمذي (2499)", explanation: "حسنه الألباني" },
  ];
  
  const batchSize = 50;
  for (let i = 0; i < weakHadiths.length; i += batchSize) {
    const batch = weakHadiths.slice(i, i + batchSize).map(h => ({
      text: h.text,
      status: h.status as "صحيح" | "حسن" | "ضعيف" | "موضوع",
      source: h.source,
      narrator: null,
      explanation: h.explanation,
    }));
    await db.insert(verificationHadiths).values(batch).onConflictDoNothing();
  }
  
  console.log(`Added ${weakHadiths.length} reference hadiths with various grades`);
}

async function main() {
  console.log("Starting verification hadiths seeding...\n");
  
  const existing = await db.select({ count: sql<number>`count(*)` }).from(verificationHadiths);
  console.log(`Existing verification hadiths: ${existing[0]?.count || 0}`);
  
  if ((existing[0]?.count || 0) > 1000) {
    console.log("Already have enough hadiths. Skipping seeding.");
    return;
  }
  
  await db.delete(verificationHadiths);
  console.log("Cleared existing verification hadiths\n");
  
  await seedFromBukhariMuslim();
  await seedFromHadeethEnc();
  await seedWeakAndFabricatedHadiths();
  
  const final = await db.select({ count: sql<number>`count(*)` }).from(verificationHadiths);
  console.log(`\nTotal verification hadiths: ${final[0]?.count}`);
  
  const grades = await db.execute(sql`
    SELECT status, COUNT(*) as count 
    FROM verification_hadiths 
    GROUP BY status
  `);
  console.log("\nHadiths by grade:");
  for (const row of grades.rows as any[]) {
    console.log(`  ${row.status}: ${row.count}`);
  }
}

main()
  .then(() => {
    console.log("\nSeeding completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
