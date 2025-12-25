import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { BookOpen, ChevronLeft, Search, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface Hadith {
  id: number;
  hadithNumber: number;
  bookNumber: number;
  bookName: string;
  text: string;
}

interface Book {
  bookNumber: number;
  bookName: string;
  count: number;
}

interface HadithQueryResult {
  hadiths: Hadith[];
  total: number;
  books: Book[];
}

export default function HadithCollections() {
  const [selectedCollection, setSelectedCollection] = useState<"bukhari" | "muslim" | null>(null);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [expandedHadith, setExpandedHadith] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAllBooks, setShowAllBooks] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [selectedBook]);

  const buildQueryUrl = (collection: string, p: number, book: number | null, search: string) => {
    const params = new URLSearchParams();
    params.set('page', p.toString());
    params.set('limit', limit.toString());
    if (book !== null) params.set('book', book.toString());
    if (search) params.set('search', search);
    return `/api/hadith/${collection}?${params.toString()}`;
  };

  const bukhariQuery = useQuery<HadithQueryResult>({
    queryKey: ['hadith-bukhari', page, selectedBook, debouncedSearch],
    queryFn: async () => {
      const res = await fetch(buildQueryUrl('bukhari', page, selectedBook, debouncedSearch));
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: selectedCollection === "bukhari",
  });

  const muslimQuery = useQuery<HadithQueryResult>({
    queryKey: ['hadith-muslim', page, selectedBook, debouncedSearch],
    queryFn: async () => {
      const res = await fetch(buildQueryUrl('muslim', page, selectedBook, debouncedSearch));
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: selectedCollection === "muslim",
  });

  const currentQuery = selectedCollection === "bukhari" ? bukhariQuery : muslimQuery;
  const data = currentQuery.data;
  const isLoading = currentQuery.isLoading;
  const isError = currentQuery.isError;
  const books = data?.books || [];
  const hadiths = data?.hadiths || [];
  const total = data?.total || 0;

  const visibleBooks = showAllBooks ? books : books.slice(0, 10);

  const bukhariStatsQuery = useQuery<HadithQueryResult>({
    queryKey: ['hadith-bukhari-stats'],
    queryFn: async () => {
      const res = await fetch('/api/hadith/bukhari?page=1&limit=1');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !selectedCollection,
  });

  const muslimStatsQuery = useQuery<HadithQueryResult>({
    queryKey: ['hadith-muslim-stats'],
    queryFn: async () => {
      const res = await fetch('/api/hadith/muslim?page=1&limit=1');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !selectedCollection,
  });

  if (!selectedCollection) {
    return (
      <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-secondary/20">
        <Header title="كتب الحديث" showBack />
        
        <main className="container max-w-md mx-auto px-4 space-y-4 pt-4">
          <Card 
            className="p-6 cursor-pointer hover-elevate"
            onClick={() => setSelectedCollection("bukhari")}
            data-testid="card-bukhari"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">صحيح البخاري</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  أصح كتاب بعد كتاب الله
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {bukhariStatsQuery.data?.total || "..."} حديث - {bukhariStatsQuery.data?.books.length || "..."} كتاب
                </p>
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover-elevate"
            onClick={() => setSelectedCollection("muslim")}
            data-testid="card-muslim"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">صحيح مسلم</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  ثاني أصح كتاب بعد صحيح البخاري
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {muslimStatsQuery.data?.total || "..."} حديث - {muslimStatsQuery.data?.books.length || "..."} كتاب
                </p>
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          <Link href="/hadith-verify">
            <Card 
              className="p-6 cursor-pointer hover-elevate"
              data-testid="card-verify-hadith"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <span className="text-2xl font-bold">؟</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">التحقق من الحديث</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    تأكد من صحة أي حديث
                  </p>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-secondary/20">
      <Header 
        title={selectedCollection === "bukhari" ? "صحيح البخاري" : "صحيح مسلم"} 
        showBack 
      />
      
      <main className="container max-w-md mx-auto px-4 space-y-3 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (selectedBook !== null) {
              setSelectedBook(null);
              setSearchQuery("");
            } else {
              setSelectedCollection(null);
            }
          }}
          className="mb-2"
          data-testid="button-back-collections"
        >
          <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
          {selectedBook !== null ? "العودة للكتب" : "العودة للقائمة"}
        </Button>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث في الأحاديث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
            dir="rtl"
            data-testid="input-search-hadith"
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <Card className="p-6 text-center">
            <p className="text-destructive">حدث خطأ في تحميل الأحاديث</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => currentQuery.refetch()}
            >
              إعادة المحاولة
            </Button>
          </Card>
        )}

        {!isLoading && !isError && selectedBook === null && !debouncedSearch && (
          <>
            <p className="text-sm text-muted-foreground text-center">
              اختر كتاباً للتصفح أو ابحث مباشرة ({total} حديث)
            </p>
            
            <div className="space-y-2">
              {visibleBooks.map((book) => (
                <Card
                  key={book.bookNumber}
                  className="p-3 cursor-pointer hover-elevate"
                  onClick={() => setSelectedBook(book.bookNumber)}
                  data-testid={`card-book-${book.bookNumber}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {book.bookNumber}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{book.bookName}</p>
                      <p className="text-xs text-muted-foreground">{book.count} حديث</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>

            {books.length > 10 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAllBooks(!showAllBooks)}
                data-testid="button-show-more-books"
              >
                {showAllBooks ? (
                  <>
                    <ChevronUp className="w-4 h-4 ml-2" />
                    عرض أقل
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 ml-2" />
                    عرض جميع الكتب ({books.length})
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {!isLoading && !isError && (selectedBook !== null || debouncedSearch) && (
          <>
            <p className="text-sm text-muted-foreground text-center">
              {selectedBook !== null && books.find(b => b.bookNumber === selectedBook)?.bookName}
              {` - عدد النتائج: ${total}`}
            </p>

            {hadiths.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">لا توجد نتائج</p>
              </Card>
            ) : (
              <>
                {hadiths.map((hadith) => (
                  <Card 
                    key={hadith.id} 
                    className="p-4 cursor-pointer hover-elevate"
                    onClick={() => setExpandedHadith(expandedHadith === hadith.id ? null : hadith.id)}
                    data-testid={`card-hadith-${selectedCollection}-${hadith.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {hadith.hadithNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">{hadith.bookName}</p>
                        <p 
                          className={`font-arabic text-base leading-relaxed ${expandedHadith === hadith.id ? '' : 'line-clamp-2'}`}
                          dir="rtl"
                        >
                          {hadith.text}
                        </p>
                        {hadith.text.length > 100 && (
                          <button 
                            className="text-xs text-primary mt-2"
                            data-testid={`button-expand-hadith-${hadith.id}`}
                          >
                            {expandedHadith === hadith.id ? "عرض أقل" : "عرض المزيد"}
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {total > hadiths.length && (
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      data-testid="button-prev-page"
                    >
                      السابق
                    </Button>
                    <span className="flex items-center text-sm text-muted-foreground px-2">
                      صفحة {page} من {Math.ceil(total / limit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page * limit >= total}
                      onClick={() => setPage(p => p + 1)}
                      data-testid="button-next-page"
                    >
                      التالي
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
