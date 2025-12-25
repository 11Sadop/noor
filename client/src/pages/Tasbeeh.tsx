import { Header } from "@/components/Header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { RotateCcw, Check, ChevronDown, ChevronUp, Infinity } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TasbeehItem {
  id: number;
  text: string;
  target: number | null;
  virtueHadith: string;
  virtueSource: string;
  category: "post_prayer" | "general";
}

const tasbeehItems: TasbeehItem[] = [
  {
    id: 1,
    text: "سُبْحَانَ اللهِ (٣٣) - الْحَمْدُ لِلَّهِ (٣٣) - اللهُ أَكْبَرُ (٣٣) - لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ (١)",
    target: 100,
    virtueHadith: "من سبح الله في دبر كل صلاة ثلاثاً وثلاثين، وحمد الله ثلاثاً وثلاثين، وكبر الله ثلاثاً وثلاثين، ثم قال تمام المائة: لا إله إلا الله وحده لا شريك له، غفرت خطاياه وإن كانت مثل زبد البحر",
    virtueSource: "صحيح مسلم",
    category: "post_prayer"
  },
  {
    id: 2,
    text: "أَسْتَغْفِرُ اللهَ",
    target: 3,
    virtueHadith: "كان النبي صلى الله عليه وسلم إذا سلم من الصلاة استغفر ثلاثاً",
    virtueSource: "صحيح مسلم",
    category: "post_prayer"
  },
  {
    id: 3,
    text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    target: 1,
    virtueHadith: "كان النبي صلى الله عليه وسلم إذا سلم من الصلاة قال هذا الدعاء",
    virtueSource: "صحيح مسلم",
    category: "post_prayer"
  },
  {
    id: 4,
    text: "آيَةُ الْكُرْسِيِّ",
    target: 1,
    virtueHadith: "من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت",
    virtueSource: "صحيح النسائي",
    category: "post_prayer"
  },
  {
    id: 5,
    text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
    target: 100,
    virtueHadith: "من قال سبحان الله وبحمده مائة مرة حين يصبح وحين يمسي لم يأت أحد يوم القيامة بأفضل مما جاء به إلا أحد قال مثل ما قال أو زاد عليه",
    virtueSource: "صحيح مسلم",
    category: "general"
  },
  {
    id: 6,
    text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    target: 100,
    virtueHadith: "من قالها في يوم مائة مرة كانت له عدل عشر رقاب وكتبت له مائة حسنة ومحيت عنه مائة سيئة وكانت له حرزاً من الشيطان",
    virtueSource: "صحيح البخاري",
    category: "general"
  },
  {
    id: 7,
    text: "سُبْحَانَ اللهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ",
    target: null,
    virtueHadith: "يُغرس لك بكل كلمة شجرة في الجنة",
    virtueSource: "سنن ابن ماجه",
    category: "general"
  },
  {
    id: 8,
    text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    target: null,
    virtueHadith: "من صلى علي صلاة واحدة صلى الله عليه عشراً",
    virtueSource: "صحيح مسلم",
    category: "general"
  },
  {
    id: 9,
    text: "أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ",
    target: 100,
    virtueHadith: "من لزم الاستغفار جعل الله له من كل ضيق مخرجاً ومن كل هم فرجاً ورزقه من حيث لا يحتسب",
    virtueSource: "سنن أبي داود",
    category: "general"
  },
  {
    id: 10,
    text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ",
    target: null,
    virtueHadith: "لا حول ولا قوة إلا بالله كنز من كنوز الجنة",
    virtueSource: "صحيح البخاري",
    category: "general"
  },
  {
    id: 11,
    text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ الْعَظِيمِ",
    target: null,
    virtueHadith: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن",
    virtueSource: "صحيح البخاري",
    category: "general"
  },
  {
    id: 12,
    text: "حَسْبِيَ اللهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    target: 7,
    virtueHadith: "من قالها حين يصبح وحين يمسي سبع مرات كفاه الله ما أهمه",
    virtueSource: "سنن أبي داود",
    category: "general"
  },
  {
    id: 13,
    text: "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    target: 3,
    virtueHadith: "من قالها ثلاث مرات إذا أصبح وثلاث مرات إذا أمسى لم يضره شيء",
    virtueSource: "سنن أبي داود",
    category: "general"
  },
  {
    id: 14,
    text: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    target: 3,
    virtueHadith: "من قالها حين يمسي ثلاث مرات لم تضره حُمَة تلك الليلة",
    virtueSource: "صحيح مسلم",
    category: "general"
  },
  {
    id: 15,
    text: "رَضِيتُ بِاللهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ نَبِيًّا",
    target: 3,
    virtueHadith: "من قالها ثلاثاً حين يصبح وثلاثاً حين يمسي كان حقاً على الله أن يُرضيه يوم القيامة",
    virtueSource: "مسند أحمد",
    category: "general"
  },
  {
    id: 16,
    text: "سُبْحَانَ اللهِ عَدَدَ خَلْقِهِ، سُبْحَانَ اللهِ رِضَا نَفْسِهِ، سُبْحَانَ اللهِ زِنَةَ عَرْشِهِ، سُبْحَانَ اللهِ مِدَادَ كَلِمَاتِهِ",
    target: 3,
    virtueHadith: "أفضل من أن يذكر الله من أول النهار إلى أن يمسي",
    virtueSource: "صحيح مسلم",
    category: "general"
  },
  {
    id: 17,
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
    target: 3,
    virtueHadith: "سلوا الله العفو والعافية، فإن أحداً لم يُعطَ بعد اليقين خيراً من العافية",
    virtueSource: "سنن الترمذي",
    category: "general"
  },
  {
    id: 18,
    text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    target: 3,
    virtueHadith: "دعاء علمه النبي صلى الله عليه وسلم لفاطمة رضي الله عنها",
    virtueSource: "صحيح الجامع",
    category: "general"
  },
  {
    id: 19,
    text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
    target: 3,
    virtueHadith: "كان النبي صلى الله عليه وسلم يقولها كل يوم",
    virtueSource: "سنن أبي داود",
    category: "general"
  },
  {
    id: 20,
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
    target: 3,
    virtueHadith: "كان النبي صلى الله عليه وسلم يكثر من هذا الدعاء",
    virtueSource: "صحيح البخاري",
    category: "general"
  }
];

const postPrayerItems = tasbeehItems.filter(item => item.category === "post_prayer");
const generalItems = tasbeehItems.filter(item => item.category === "general");

export default function TasbeehPage() {
  const { toast } = useToast();
  const [count, setCount] = useLocalStorage("tasbeeh_count", 0);
  const [selectedItemId, setSelectedItemId] = useLocalStorage<number>("tasbeeh_selected_item", 1);
  const [completedItems, setCompletedItems] = useLocalStorage<number[]>("tasbeeh_completed_items", []);
  const [expandedCategory, setExpandedCategory] = useState<"post_prayer" | "general" | null>(null);

  const selectedItem = tasbeehItems.find(item => item.id === selectedItemId) || tasbeehItems[0];
  const target = selectedItem.target;
  const isUnlimited = target === null;
  const percentage = isUnlimited ? 0 : Math.min((count / target) * 100, 100);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    if (navigator.vibrate) navigator.vibrate(10);

    if (!isUnlimited && newCount >= target) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      
      const newCompletedItems = completedItems.includes(selectedItem.id) 
        ? completedItems 
        : [...completedItems, selectedItem.id];
      setCompletedItems(newCompletedItems);

      const currentIndex = tasbeehItems.findIndex(item => item.id === selectedItemId);
      const nextIndex = (currentIndex + 1) % tasbeehItems.length;
      const nextItem = tasbeehItems[nextIndex];

      const limitedItems = tasbeehItems.filter(i => i.target !== null);
      const completedLimitedItems = newCompletedItems.filter(id => 
        tasbeehItems.find(i => i.id === id)?.target !== null
      );

      if (completedLimitedItems.length >= limitedItems.length) {
        toast({
          title: "ما شاء الله! أكملت جميع الأذكار",
          description: "بارك الله فيك",
        });
        setCompletedItems([]);
        setSelectedItemId(tasbeehItems[0].id);
      } else {
        toast({
          title: "أحسنت! أكملت الذكر",
          description: `التالي: ${nextItem.text.substring(0, 30)}...`,
        });
        setSelectedItemId(nextItem.id);
      }
      
      setCount(0);
    }
  };

  const selectItem = (item: TasbeehItem) => {
    setSelectedItemId(item.id);
    setCount(0);
  };

  const resetDailyProgress = () => {
    setCompletedItems([]);
    toast({
      title: "تم التصفير",
      description: "تم تصفير جميع الأذكار المكتملة",
    });
  };

  const toggleCategory = (category: "post_prayer" | "general") => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const renderCategorySection = (
    items: TasbeehItem[], 
    title: string, 
    category: "post_prayer" | "general"
  ) => {
    const isExpanded = expandedCategory === category;
    const completedCount = items.filter(item => completedItems.includes(item.id)).length;
    
    return (
      <div className="mb-3">
        <button
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover-elevate transition-all"
          data-testid={`button-category-${category}`}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            <span className="text-xs text-muted-foreground">
              {completedCount}/{items.filter(i => i.target !== null).length}
            </span>
          </div>
          <span className="font-bold text-base">{title}</span>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-3">
                {items.map((item) => {
                  const isCompleted = completedItems.includes(item.id);
                  const isSelected = item.id === selectedItemId;
                  const itemIsUnlimited = item.target === null;
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectItem(item)}
                      className={cn(
                        "w-full text-right p-3 rounded-xl border transition-all",
                        isSelected
                          ? "bg-primary/20 border-primary"
                          : isCompleted 
                            ? "bg-primary/5 border-primary/30" 
                            : "bg-card border-border/50 hover-elevate"
                      )}
                      data-testid={`button-tasbeeh-item-${item.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {itemIsUnlimited ? (
                              <Infinity className="w-4 h-4" />
                            ) : (
                              <>{item.target}x</>
                            )}
                          </span>
                        </div>
                        
                        <p className="flex-1 font-arabic text-base leading-relaxed truncate">
                          {item.text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-background flex flex-col">
      <Header title="المسبحة" />
      
      <main className="flex-1 flex flex-col p-4">
        
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-48 h-48 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-secondary fill-none stroke-[8px]"
              />
              {!isUnlimited && (
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="stroke-primary fill-none stroke-[8px] transition-all duration-300 ease-out"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * percentage) / 100}
                  strokeLinecap="round"
                />
              )}
            </svg>

            <button
              onClick={increment}
              className="absolute inset-3 rounded-full bg-card shadow-lg border-2 border-secondary flex flex-col items-center justify-center active:scale-95 transition-transform duration-100"
              data-testid="button-tasbeeh-increment"
            >
              <motion.span 
                key={count}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-bold font-mono text-primary"
              >
                {count}
              </motion.span>
              {isUnlimited ? (
                <span className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
                  <Infinity className="w-4 h-4" />
                </span>
              ) : (
                <span className="text-muted-foreground text-xs mt-1">من {target}</span>
              )}
            </button>
          </div>

          <button 
            onClick={() => setCount(0)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 hover:bg-secondary/50 text-muted-foreground transition-colors text-sm"
            data-testid="button-tasbeeh-reset"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تصفير</span>
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <p className="font-arabic text-xl text-center leading-relaxed text-foreground mb-3" dir="rtl">
            {selectedItem.text}
          </p>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
              {isUnlimited ? (
                <>
                  <Infinity className="w-3 h-3" />
                  <span>لا محدود</span>
                </>
              ) : (
                <>{target} مرة</>
              )}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
              {selectedItem.virtueSource}
            </span>
          </div>
          <div className="bg-secondary/20 rounded-xl p-3">
            <p className="text-sm text-muted-foreground text-center leading-relaxed" dir="rtl">
              <span className="font-medium text-foreground">الفضل: </span>
              {selectedItem.virtueHadith}
            </p>
          </div>
        </div>

        <div className="flex-1">
          {completedItems.length > 0 && (
            <div className="flex justify-end mb-3">
              <button
                onClick={resetDailyProgress}
                className="text-xs text-destructive hover:underline"
                data-testid="button-reset-completed"
              >
                تصفير المكتمل
              </button>
            </div>
          )}

          {renderCategorySection(postPrayerItems, "تسبيح بعد الصلاة", "post_prayer")}
          {renderCategorySection(generalItems, "أذكار عامة", "general")}
        </div>

      </main>
    </div>
  );
}
