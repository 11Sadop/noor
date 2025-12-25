import { motion } from "framer-motion";
import { Copy, Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ContentCardProps {
  arabic: string;
  translation: string;
  transliteration?: string | null;
  reference?: string | null;
  virtueHadith?: string | null;
  virtueSource?: string | null;
  count?: number;
  countLabel?: string | null;
  category?: string;
}

export function ContentCard({ arabic, translation, transliteration, reference, virtueHadith, virtueSource, count, countLabel }: ContentCardProps) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showVirtue, setShowVirtue] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${arabic}\n\n${translation}`);
    toast({
      title: "تم النسخ",
      description: "يمكنك الآن مشاركته مع الآخرين",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleCopy} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={() => setIsBookmarked(!isBookmarked)} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors">
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-right font-arabic text-2xl md:text-3xl leading-loose text-foreground/90 py-2">
          {arabic}
        </p>

        {transliteration && (
          <p className="text-sm italic text-muted-foreground border-r-2 border-primary/20 pr-4 text-right">
            {transliteration}
          </p>
        )}

        <div className="space-y-2 text-right">
          <p className="text-base text-foreground/80 leading-relaxed">
            {translation}
          </p>
          {reference && (
            <p className="text-xs text-primary font-medium">
              {reference}
            </p>
          )}
        </div>

        {(count || countLabel) && (
          <div className="flex justify-start">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              {countLabel ? countLabel : count === 1 ? "مرة واحدة" : `التكرار: ${count} مرة`}
            </span>
          </div>
        )}

        {virtueHadith && (
          <div className="pt-2 border-t border-border/50">
            <button 
              onClick={() => setShowVirtue(!showVirtue)}
              className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer flex-row-reverse"
            >
              {showVirtue ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>فضل هذا الذكر</span>
            </button>
            
            {showVirtue && (
              <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm font-arabic text-right leading-relaxed text-foreground/80">
                  {virtueHadith}
                </p>
                {virtueSource && (
                  <p className="text-xs text-primary font-medium mt-2 text-right">
                    — {virtueSource}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
