import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Calculator } from "lucide-react";

export default function Zakat() {
  const [amount, setAmount] = useState("");
  const [zakatAmount, setZakatAmount] = useState<number | null>(null);
  const [goldPrice, setGoldPrice] = useState("250");

  const NISAB_GOLD_GRAMS = 85;
  const ZAKAT_RATE = 0.025;

  const calculateZakat = () => {
    const totalAmount = parseFloat(amount) || 0;
    const goldPricePerGram = parseFloat(goldPrice) || 250;
    const nisabValue = NISAB_GOLD_GRAMS * goldPricePerGram;

    if (totalAmount >= nisabValue) {
      setZakatAmount(totalAmount * ZAKAT_RATE);
    } else {
      setZakatAmount(0);
    }
  };

  const nisabValue = NISAB_GOLD_GRAMS * (parseFloat(goldPrice) || 250);

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-secondary/20">
      <Header title="حاسبة الزكاة" showBack />

      <main className="container max-w-md mx-auto px-4 space-y-6 pt-4">
        <Card className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Calculator className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">احسب زكاة مالك</h2>
            <p className="text-sm text-muted-foreground">
              الزكاة ركن من أركان الإسلام
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">
                سعر جرام الذهب (ريال)
              </label>
              <Input
                type="number"
                value={goldPrice}
                onChange={(e) => setGoldPrice(e.target.value)}
                placeholder="250"
                className="text-right"
                dir="ltr"
                data-testid="input-gold-price"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">
                إجمالي المال (ريال)
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                className="text-right"
                dir="ltr"
                data-testid="input-amount"
              />
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">نصاب الزكاة</p>
              <p className="text-lg font-bold text-primary">
                {nisabValue.toLocaleString("ar-SA")} ريال
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (85 جرام ذهب)
              </p>
            </div>

            <Button
              onClick={calculateZakat}
              className="w-full"
              size="lg"
              data-testid="button-calculate-zakat"
            >
              احسب الزكاة
            </Button>
          </div>

          {zakatAmount !== null && (
            <div className="bg-primary/10 rounded-2xl p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">مقدار الزكاة</p>
              <p className="text-4xl font-bold text-primary">
                {zakatAmount.toLocaleString("ar-SA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-muted-foreground">ريال</p>
              {zakatAmount === 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  المبلغ أقل من النصاب - لا تجب الزكاة
                </p>
              )}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-bold text-sm">معلومات عن الزكاة</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-right">
            <li>- نسبة الزكاة: 2.5% من المال</li>
            <li>- النصاب: ما يعادل 85 جرام من الذهب</li>
            <li>- يجب أن يمر على المال حول كامل (سنة هجرية)</li>
            <li>- تجب الزكاة في الأموال النامية</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
