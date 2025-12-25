import { db } from "../server/db";
import { verificationHadiths } from "../shared/schema";
import { sql } from "drizzle-orm";

const additionalHadiths = [
  { text: "من قال سبحان الله وبحمده مائة مرة حطت خطاياه وإن كانت مثل زبد البحر", status: "صحيح", source: "صحيح البخاري (6405)", explanation: "صحيح متفق عليه" },
  { text: "كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن سبحان الله وبحمده سبحان الله العظيم", status: "صحيح", source: "صحيح البخاري (6406)", explanation: "صحيح" },
  { text: "من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت", status: "صحيح", source: "صحيح النسائي (9928)", explanation: "صحيح" },
  { text: "من قال لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير في يوم مائة مرة كانت له عدل عشر رقاب", status: "صحيح", source: "صحيح البخاري (6403)", explanation: "صحيح" },
  { text: "أفضل الذكر لا إله إلا الله وأفضل الدعاء الحمد لله", status: "حسن", source: "سنن الترمذي (3383)", explanation: "حسنه الترمذي" },
  { text: "من صلى البردين دخل الجنة", status: "صحيح", source: "صحيح البخاري (574)", explanation: "صحيح - البردان: الفجر والعصر" },
  { text: "من صلى الصبح فهو في ذمة الله", status: "صحيح", source: "صحيح مسلم (657)", explanation: "صحيح" },
  { text: "ركعتا الفجر خير من الدنيا وما فيها", status: "صحيح", source: "صحيح مسلم (725)", explanation: "صحيح" },
  { text: "صلاة الجماعة أفضل من صلاة الفذ بسبع وعشرين درجة", status: "صحيح", source: "صحيح البخاري (645)", explanation: "متفق عليه" },
  { text: "الصلاة على وقتها", status: "صحيح", source: "صحيح البخاري (527)", explanation: "صحيح - أفضل الأعمال" },
  { text: "ما من عبد يسجد لله سجدة إلا رفعه الله بها درجة وحط عنه بها خطيئة", status: "صحيح", source: "صحيح مسلم (488)", explanation: "صحيح" },
  { text: "أقرب ما يكون العبد من ربه وهو ساجد فأكثروا الدعاء", status: "صحيح", source: "صحيح مسلم (482)", explanation: "صحيح" },
  { text: "لا يرد القضاء إلا الدعاء ولا يزيد في العمر إلا البر", status: "حسن", source: "سنن الترمذي (2139)", explanation: "حسنه الألباني" },
  { text: "الدعاء هو العبادة", status: "صحيح", source: "سنن الترمذي (3247)", explanation: "صحيح" },
  { text: "ليس شيء أكرم على الله من الدعاء", status: "حسن", source: "سنن الترمذي (3370)", explanation: "حسنه الألباني" },
  { text: "الدعاء مخ العبادة", status: "ضعيف", source: "ضعيف الترمذي (3371)", explanation: "ضعيف" },
  { text: "سيد الاستغفار أن تقول اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك", status: "صحيح", source: "صحيح البخاري (6306)", explanation: "صحيح" },
  { text: "من استغفر للمؤمنين والمؤمنات كتب الله له بكل مؤمن ومؤمنة حسنة", status: "حسن", source: "حسن لغيره", explanation: "حسنه الألباني" },
  { text: "من قال أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه غفر الله له وإن كان فر من الزحف", status: "صحيح", source: "صحيح أبي داود (1517)", explanation: "صحيح" },
  { text: "طوبى لمن وجد في صحيفته استغفاراً كثيراً", status: "صحيح", source: "صحيح ابن ماجه (3818)", explanation: "صحيح" },
  { text: "إن ربكم حيي كريم يستحيي من عبده إذا رفع يديه إليه أن يردهما صفراً", status: "صحيح", source: "صحيح أبي داود (1488)", explanation: "صحيح" },
  { text: "ادعوا الله وأنتم موقنون بالإجابة", status: "حسن", source: "حسن - سنن الترمذي", explanation: "حسنه الألباني" },
  { text: "لا يزال لسانك رطباً من ذكر الله", status: "صحيح", source: "صحيح الترمذي (3375)", explanation: "صحيح" },
  { text: "أحب الكلام إلى الله أربع سبحان الله والحمد لله ولا إله إلا الله والله أكبر", status: "صحيح", source: "صحيح مسلم (2137)", explanation: "صحيح" },
  { text: "الباقيات الصالحات سبحان الله والحمد لله ولا إله إلا الله والله أكبر", status: "صحيح", source: "صحيح مسلم (2695)", explanation: "صحيح" },
  { text: "من قال حين يصبح وحين يمسي سبحان الله وبحمده مائة مرة لم يأت أحد يوم القيامة بأفضل مما جاء به", status: "صحيح", source: "صحيح مسلم (2692)", explanation: "صحيح" },
  { text: "ألا أنبئكم بخير أعمالكم وأزكاها عند مليككم ذكر الله", status: "صحيح", source: "صحيح الترمذي (3377)", explanation: "صحيح" },
  { text: "مثل الذي يذكر ربه والذي لا يذكر ربه مثل الحي والميت", status: "صحيح", source: "صحيح البخاري (6407)", explanation: "صحيح" },
  { text: "ما جلس قوم مجلساً لم يذكروا الله فيه ولم يصلوا على نبيهم إلا كان عليهم ترة", status: "صحيح", source: "صحيح الترمذي (3380)", explanation: "صحيح" },
  { text: "كفارة المجلس سبحانك اللهم وبحمدك أشهد أن لا إله إلا أنت أستغفرك وأتوب إليك", status: "صحيح", source: "صحيح أبي داود (4859)", explanation: "صحيح" },
  
  { text: "النظافة من الإيمان", status: "ضعيف", source: "لا أصل له", explanation: "لا أصل له بهذا اللفظ - والصحيح الطهور شطر الإيمان" },
  { text: "اعمل لدنياك كأنك تعيش أبداً واعمل لآخرتك كأنك تموت غداً", status: "موضوع", source: "لا أصل له مرفوعاً", explanation: "ليس بحديث" },
  { text: "أنت ومالك لأبيك", status: "ضعيف", source: "ضعيف ابن ماجه (2291)", explanation: "ضعيف بهذا اللفظ" },
  { text: "القناعة كنز لا يفنى", status: "موضوع", source: "لا أصل له", explanation: "ليس بحديث" },
  { text: "من لا يشكر الناس لا يشكر الله", status: "صحيح", source: "صحيح أبي داود (4811)", explanation: "صحيح" },
  { text: "خيركم خيركم لأهله وأنا خيركم لأهلي", status: "صحيح", source: "صحيح الترمذي (3895)", explanation: "صحيح" },
  { text: "أكمل المؤمنين إيماناً أحسنهم خلقاً", status: "صحيح", source: "صحيح أبي داود (4682)", explanation: "صحيح" },
  { text: "ما شيء أثقل في ميزان المؤمن يوم القيامة من حسن الخلق", status: "صحيح", source: "صحيح الترمذي (2002)", explanation: "صحيح" },
  { text: "إنما بعثت لأتمم مكارم الأخلاق", status: "صحيح", source: "صحيح الجامع (2349)", explanation: "صحيح" },
  { text: "المسلم من سلم المسلمون من لسانه ويده", status: "صحيح", source: "صحيح البخاري (10)", explanation: "صحيح متفق عليه" },
  { text: "المؤمن للمؤمن كالبنيان يشد بعضه بعضاً", status: "صحيح", source: "صحيح البخاري (481)", explanation: "متفق عليه" },
  { text: "مثل المؤمنين في توادهم وتراحمهم وتعاطفهم مثل الجسد الواحد", status: "صحيح", source: "صحيح مسلم (2586)", explanation: "صحيح" },
  { text: "المرء على دين خليله فلينظر أحدكم من يخالل", status: "حسن", source: "حسن - سنن أبي داود", explanation: "حسنه الألباني" },
  { text: "الأرواح جنود مجندة فما تعارف منها ائتلف وما تناكر منها اختلف", status: "صحيح", source: "صحيح البخاري (3336)", explanation: "صحيح" },
  { text: "تهادوا تحابوا", status: "حسن", source: "حسن - الأدب المفرد", explanation: "حسنه الألباني" },
  { text: "لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه", status: "صحيح", source: "صحيح البخاري (13)", explanation: "متفق عليه" },
  { text: "ارحموا من في الأرض يرحمكم من في السماء", status: "صحيح", source: "صحيح أبي داود (4941)", explanation: "صحيح" },
  { text: "الراحمون يرحمهم الرحمن", status: "صحيح", source: "صحيح الترمذي (1924)", explanation: "صحيح" },
  { text: "ليس منا من لم يرحم صغيرنا ويعرف حق كبيرنا", status: "صحيح", source: "صحيح الترمذي (1919)", explanation: "صحيح" },
  { text: "من لا يرحم لا يرحم", status: "صحيح", source: "صحيح البخاري (5997)", explanation: "صحيح" },
  
  { text: "يد الله مع الجماعة", status: "حسن", source: "سنن الترمذي (2166)", explanation: "حسن" },
  { text: "الجماعة رحمة والفرقة عذاب", status: "ضعيف", source: "ضعيف", explanation: "ضعيف جداً" },
  { text: "عليكم بالجماعة وإياكم والفرقة", status: "حسن", source: "سنن الترمذي (2165)", explanation: "حسن" },
  { text: "من فارق الجماعة شبراً فمات فميتته جاهلية", status: "صحيح", source: "صحيح البخاري (7054)", explanation: "صحيح" },
  { text: "لا تزال طائفة من أمتي ظاهرين على الحق", status: "صحيح", source: "صحيح مسلم (1920)", explanation: "صحيح" },
  { text: "أمتي أمة مرحومة", status: "صحيح", source: "صحيح أبي داود (4278)", explanation: "صحيح" },
  { text: "لا تجتمع أمتي على ضلالة", status: "صحيح", source: "صحيح - رواه أحمد", explanation: "صحيح بمجموع طرقه" },
  { text: "إذا مات ابن آدم انقطع عمله إلا من ثلاث صدقة جارية أو علم ينتفع به أو ولد صالح يدعو له", status: "صحيح", source: "صحيح مسلم (1631)", explanation: "صحيح" },
  { text: "خير الناس أنفعهم للناس", status: "حسن", source: "حسن لغيره", explanation: "حسنه الألباني" },
  { text: "لا يشكر الله من لا يشكر الناس", status: "صحيح", source: "صحيح أبي داود (4811)", explanation: "صحيح" },
  
  { text: "الوقت كالسيف إن لم تقطعه قطعك", status: "موضوع", source: "لا أصل له", explanation: "ليس بحديث - من كلام الحكماء" },
  { text: "أنا عربي والقرآن عربي", status: "موضوع", source: "لا أصل له", explanation: "لا أصل له" },
  { text: "الجار قبل الدار", status: "موضوع", source: "لا أصل له مرفوعاً", explanation: "ليس بحديث" },
  { text: "الصوم جنة من النار", status: "صحيح", source: "صحيح البخاري (1894)", explanation: "صحيح" },
  { text: "من صام رمضان إيماناً واحتساباً غفر له ما تقدم من ذنبه", status: "صحيح", source: "صحيح البخاري (38)", explanation: "متفق عليه" },
  { text: "من قام رمضان إيماناً واحتساباً غفر له ما تقدم من ذنبه", status: "صحيح", source: "صحيح البخاري (37)", explanation: "متفق عليه" },
  { text: "من قام ليلة القدر إيماناً واحتساباً غفر له ما تقدم من ذنبه", status: "صحيح", source: "صحيح البخاري (1901)", explanation: "متفق عليه" },
  { text: "العمرة إلى العمرة كفارة لما بينهما والحج المبرور ليس له جزاء إلا الجنة", status: "صحيح", source: "صحيح البخاري (1773)", explanation: "متفق عليه" },
  { text: "من حج فلم يرفث ولم يفسق رجع كيوم ولدته أمه", status: "صحيح", source: "صحيح البخاري (1521)", explanation: "صحيح" },
  { text: "لبيك اللهم لبيك لبيك لا شريك لك لبيك إن الحمد والنعمة لك والملك لا شريك لك", status: "صحيح", source: "صحيح البخاري (1549)", explanation: "صحيح" },
  
  { text: "إذا دخل أحدكم المسجد فليركع ركعتين قبل أن يجلس", status: "صحيح", source: "صحيح البخاري (1163)", explanation: "متفق عليه" },
  { text: "صلاة في مسجدي هذا خير من ألف صلاة فيما سواه إلا المسجد الحرام", status: "صحيح", source: "صحيح البخاري (1190)", explanation: "متفق عليه" },
  { text: "لا تشد الرحال إلا إلى ثلاثة مساجد المسجد الحرام ومسجدي هذا والمسجد الأقصى", status: "صحيح", source: "صحيح البخاري (1189)", explanation: "متفق عليه" },
  { text: "من بنى مسجداً لله بنى الله له بيتاً في الجنة", status: "صحيح", source: "صحيح البخاري (450)", explanation: "متفق عليه" },
  { text: "المساجد بيوت الله", status: "صحيح", source: "صحيح - رواه الطبراني", explanation: "صحيح" },
  { text: "إذا أتيتم الصلاة فعليكم بالسكينة", status: "صحيح", source: "صحيح البخاري (636)", explanation: "صحيح" },
  
  { text: "الكلمة الطيبة صدقة", status: "صحيح", source: "صحيح البخاري (2989)", explanation: "متفق عليه" },
  { text: "تبسمك في وجه أخيك صدقة", status: "صحيح", source: "صحيح الترمذي (1956)", explanation: "صحيح" },
  { text: "اليد العليا خير من اليد السفلى", status: "صحيح", source: "صحيح البخاري (1427)", explanation: "متفق عليه" },
  { text: "ما نقصت صدقة من مال", status: "صحيح", source: "صحيح مسلم (2588)", explanation: "صحيح" },
  { text: "اتقوا النار ولو بشق تمرة", status: "صحيح", source: "صحيح البخاري (1417)", explanation: "متفق عليه" },
  { text: "الصدقة تطفئ الخطيئة كما يطفئ الماء النار", status: "صحيح", source: "صحيح الترمذي (614)", explanation: "صحيح" },
  { text: "ما من يوم يصبح العباد فيه إلا ملكان ينزلان فيقول أحدهما اللهم أعط منفقاً خلفاً", status: "صحيح", source: "صحيح البخاري (1442)", explanation: "متفق عليه" },
  { text: "من تصدق بعدل تمرة من كسب طيب ولا يقبل الله إلا الطيب فإن الله يتقبلها بيمينه", status: "صحيح", source: "صحيح البخاري (1410)", explanation: "صحيح" },
  { text: "سبعة يظلهم الله في ظله يوم لا ظل إلا ظله", status: "صحيح", source: "صحيح البخاري (660)", explanation: "متفق عليه" },
  
  { text: "طلب العلم فريضة على كل مسلم", status: "صحيح", source: "صحيح ابن ماجه (224)", explanation: "صحيح" },
  { text: "من سلك طريقاً يلتمس فيه علماً سهل الله له طريقاً إلى الجنة", status: "صحيح", source: "صحيح مسلم (2699)", explanation: "صحيح" },
  { text: "إن الملائكة لتضع أجنحتها لطالب العلم رضاً بما يصنع", status: "صحيح", source: "صحيح أبي داود (3641)", explanation: "صحيح" },
  { text: "فضل العالم على العابد كفضل القمر ليلة البدر على سائر الكواكب", status: "صحيح", source: "صحيح أبي داود (3641)", explanation: "صحيح" },
  { text: "العلماء ورثة الأنبياء", status: "صحيح", source: "صحيح أبي داود (3641)", explanation: "صحيح" },
  { text: "منهومان لا يشبعان طالب علم وطالب دنيا", status: "ضعيف", source: "ضعيف الترغيب (102)", explanation: "ضعيف" },
  { text: "خير الكسب كسب العامل إذا نصح", status: "حسن", source: "حسن - مسند أحمد", explanation: "حسنه الألباني" },
  { text: "ما أكل أحد طعاماً قط خيراً من أن يأكل من عمل يده", status: "صحيح", source: "صحيح البخاري (2072)", explanation: "صحيح" },
  { text: "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه", status: "حسن", source: "حسن - رواه البيهقي", explanation: "حسنه الألباني" },
  
  { text: "المرء مع من أحب", status: "صحيح", source: "صحيح البخاري (6168)", explanation: "متفق عليه" },
  { text: "لا تحقرن من المعروف شيئاً ولو أن تلقى أخاك بوجه طلق", status: "صحيح", source: "صحيح مسلم (2626)", explanation: "صحيح" },
  { text: "إياكم والظن فإن الظن أكذب الحديث", status: "صحيح", source: "صحيح البخاري (5143)", explanation: "متفق عليه" },
  { text: "لا تباغضوا ولا تحاسدوا ولا تدابروا وكونوا عباد الله إخواناً", status: "صحيح", source: "صحيح البخاري (6065)", explanation: "صحيح" },
  { text: "المستشار مؤتمن", status: "صحيح", source: "صحيح أبي داود (5128)", explanation: "صحيح" },
  { text: "الدين النصيحة", status: "صحيح", source: "صحيح مسلم (55)", explanation: "صحيح" },
  
  { text: "ليس الشديد بالصرعة إنما الشديد الذي يملك نفسه عند الغضب", status: "صحيح", source: "صحيح البخاري (6114)", explanation: "متفق عليه" },
  { text: "لا تغضب ولك الجنة", status: "صحيح", source: "صحيح الترغيب (2749)", explanation: "صحيح" },
  { text: "من كظم غيظاً وهو قادر على أن ينفذه دعاه الله على رؤوس الخلائق", status: "حسن", source: "حسن - سنن أبي داود", explanation: "حسنه الألباني" },
  { text: "إذا غضب أحدكم وهو قائم فليجلس فإن ذهب عنه الغضب وإلا فليضطجع", status: "صحيح", source: "صحيح أبي داود (4782)", explanation: "صحيح" },
  
  { text: "الحياء من الإيمان", status: "صحيح", source: "صحيح البخاري (24)", explanation: "متفق عليه" },
  { text: "الحياء لا يأتي إلا بخير", status: "صحيح", source: "صحيح البخاري (6117)", explanation: "متفق عليه" },
  { text: "الحياء خير كله", status: "صحيح", source: "صحيح مسلم (37)", explanation: "صحيح" },
  { text: "إذا لم تستح فاصنع ما شئت", status: "صحيح", source: "صحيح البخاري (3484)", explanation: "صحيح" },
  
  { text: "خير يوم طلعت عليه الشمس يوم الجمعة", status: "صحيح", source: "صحيح مسلم (854)", explanation: "صحيح" },
  { text: "من اغتسل يوم الجمعة غسل الجنابة ثم راح فكأنما قرب بدنة", status: "صحيح", source: "صحيح البخاري (881)", explanation: "متفق عليه" },
  { text: "إن في الجمعة لساعة لا يوافقها عبد مسلم وهو قائم يصلي يسأل الله شيئاً إلا أعطاه إياه", status: "صحيح", source: "صحيح البخاري (935)", explanation: "متفق عليه" },
  { text: "أكثروا الصلاة علي يوم الجمعة فإنه مشهود تشهده الملائكة", status: "صحيح", source: "صحيح ابن ماجه (1085)", explanation: "صحيح" },
  { text: "من قرأ سورة الكهف يوم الجمعة أضاء له من النور ما بين الجمعتين", status: "صحيح", source: "صحيح الجامع (6470)", explanation: "صحيح" },
  
  { text: "تسحروا فإن في السحور بركة", status: "صحيح", source: "صحيح البخاري (1923)", explanation: "متفق عليه" },
  { text: "عجلوا الفطر وأخروا السحور", status: "صحيح", source: "صحيح - رواه أحمد", explanation: "صحيح" },
  { text: "من فطر صائماً كان له مثل أجره", status: "صحيح", source: "صحيح الترمذي (807)", explanation: "صحيح" },
  { text: "الصيام والقرآن يشفعان للعبد يوم القيامة", status: "صحيح", source: "صحيح الترغيب (973)", explanation: "صحيح" },
  { text: "من صام يوماً في سبيل الله باعد الله وجهه عن النار سبعين خريفاً", status: "صحيح", source: "صحيح البخاري (2840)", explanation: "متفق عليه" },
  { text: "للصائم فرحتان فرحة عند فطره وفرحة عند لقاء ربه", status: "صحيح", source: "صحيح البخاري (1904)", explanation: "صحيح" },
];

async function main() {
  console.log("Adding more hadiths to verification database...\n");
  
  const existing = await db.select({ count: sql<number>`count(*)` }).from(verificationHadiths);
  console.log(`Current verification hadiths: ${existing[0]?.count || 0}`);
  
  const batchSize = 50;
  let added = 0;
  
  for (let i = 0; i < additionalHadiths.length; i += batchSize) {
    const batch = additionalHadiths.slice(i, i + batchSize).map(h => ({
      text: h.text,
      status: h.status as "صحيح" | "حسن" | "ضعيف" | "موضوع",
      source: h.source,
      narrator: null,
      explanation: h.explanation,
    }));
    
    await db.insert(verificationHadiths).values(batch).onConflictDoNothing();
    added += batch.length;
    process.stdout.write(`\rInserted ${added}/${additionalHadiths.length} hadiths...`);
  }
  
  const final = await db.select({ count: sql<number>`count(*)` }).from(verificationHadiths);
  console.log(`\n\nTotal verification hadiths: ${final[0]?.count}`);
  
  const grades = await db.execute(sql`
    SELECT status, COUNT(*) as count 
    FROM verification_hadiths 
    GROUP BY status
    ORDER BY count DESC
  `);
  console.log("\nHadiths by grade:");
  for (const row of grades.rows as any[]) {
    console.log(`  ${row.status}: ${row.count}`);
  }
}

main()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
