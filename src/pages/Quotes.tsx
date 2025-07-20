import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Quote, Sparkles, Copy, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useApiKey } from "@/contexts/ApiKeyContext";
import ApiKeyConfig from "@/components/ApiKeyConfig";

const Quotes = () => {
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const { openaiApiKey } = useApiKey();
  const [topic, setTopic] = useState("motivation");
  const navigate = useNavigate();
  const { toast } = useToast();

  const sampleQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle"
  ];

  const generateQuote = async () => {
    setLoading(true);
    
    try {
      if (!openaiApiKey) {
        // Use sample quotes if no API key
        const randomQuote = sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)];
        setTimeout(() => {
          setQuote(randomQuote);
          setLoading(false);
        }, 1000);
        return;
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-2025-04-14",
          messages: [
            {
              role: "system",
              content: `Generate an inspirational quote about ${topic}. Return only the quote with attribution if known, formatted as: "Quote text" - Author`
            }
          ],
          max_tokens: 100,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate quote");
      }

      const data = await response.json();
      setQuote(data.choices[0]?.message?.content || "No quote generated");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quote. Using sample quote instead.",
        variant: "destructive"
      });
      const randomQuote = sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)];
      setQuote(randomQuote);
    } finally {
      setLoading(false);
    }
  };

  const copyQuote = () => {
    navigator.clipboard.writeText(quote);
    toast({
      title: "Copied!",
      description: "Quote copied to clipboard"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-purple-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Quote className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Quote Generator
              </h1>
            </div>
          </div>

          {/* API Key Configuration */}
          <ApiKeyConfig />

          {/* Topic Input */}
          <Card className="mb-6 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quote Topic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="motivation, success, life, etc."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="text-center mb-8">
            <Button
              onClick={generateQuote}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Quote
                </>
              )}
            </Button>
          </div>

          {/* Quote Display */}
          {quote && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
              <CardContent className="p-8">
                <div className="text-center">
                  <Quote className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <blockquote className="text-xl md:text-2xl font-medium text-gray-800 mb-6 leading-relaxed">
                    {quote}
                  </blockquote>
                  <Button
                    onClick={copyQuote}
                    variant="outline"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-800 mb-2">💡 How it works</h3>
              <p className="text-blue-700 text-sm">
                Without an API key, you'll get curated sample quotes. With an OpenAI API key, 
                you'll get AI-generated quotes on any topic you choose!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Quotes;
