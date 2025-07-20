
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApiKeyProvider } from "@/contexts/ApiKeyContext";
import Index from "./pages/Index";
import Quotes from "./pages/Quotes";
import Chat from "./pages/Chat";
import Summarizer from "./pages/Summarizer";
import Colors from "./pages/Colors";
import TestCases from "./pages/TestCases";
import PlayWrighter from "./pages/PlayWrighter";
import Puppeteer from "./pages/Puppeteer";
import StackTrace from "./pages/StackTrace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ApiKeyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/summarizer" element={<Summarizer />} />
            <Route path="/colors" element={<Colors />} />
            <Route path="/test-cases" element={<TestCases />} />
            <Route path="/playwright" element={<PlayWrighter />} />
            <Route path="/puppeteer" element={<Puppeteer />} />
            <Route path="/stacktrace" element={<StackTrace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ApiKeyProvider>
  </QueryClientProvider>
);

export default App;
