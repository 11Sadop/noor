import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { useVisitorTracking } from "@/hooks/use-visitor-tracking";

// Pages
import Home from "@/pages/Home";
import PrayerTimes from "@/pages/PrayerTimes";
import AdhkarPage from "@/pages/Adhkar";
import DuasPage from "@/pages/Duas";
import TasbeehPage from "@/pages/Tasbeeh";
import SettingsPage from "@/pages/Settings";
import WardPage from "@/pages/Ward";
import ProtectionPage from "@/pages/Protection";
import ZakatPage from "@/pages/Zakat";
import QiblaPage from "@/pages/Qibla";
import HadithCollectionsPage from "@/pages/HadithCollections";
import HadithVerifyPage from "@/pages/HadithVerify";
import NotFound from "@/pages/not-found";

function Router() {
  useVisitorTracking();
  
  return (
    <div className="relative min-h-screen font-sans antialiased text-foreground bg-background">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/prayer-times" component={PrayerTimes} />
        <Route path="/adhkar" component={AdhkarPage} />
        <Route path="/duas" component={DuasPage} />
        <Route path="/tasbeeh" component={TasbeehPage} />
        <Route path="/ward" component={WardPage} />
        <Route path="/protection" component={ProtectionPage} />
        <Route path="/zakat" component={ZakatPage} />
        <Route path="/qibla" component={QiblaPage} />
        <Route path="/hadith-collections" component={HadithCollectionsPage} />
        <Route path="/hadith-verify" component={HadithVerifyPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
