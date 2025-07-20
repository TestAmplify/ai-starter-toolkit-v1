
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ArrowLeft, Zap, Copy, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Summarizer = () => {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const sampleText = `Artificial Intelligence (AI) has rapidly evolved from a concept in science fiction to a transformative technology that's reshaping industries worldwide. Machine learning, a subset of AI, enables computers to learn and make decisions without explicit programming. Deep learning, which uses neural networks with multiple layers, has been particularly successful in areas like image recognition, natural language processing, and game playing. Companies across various sectors are now integrating AI into their operations to improve efficiency, reduce costs, and enhance customer experiences. However, the rise of AI also brings challenges, including concerns about job displacement, privacy, and the need for proper regulation. As we move forward, it's crucial to develop AI responsibly, ensuring that its benefits are widely shared while minimizing potential risks.`;

  const summarizeText = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to summarize",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (!apiKey) {
        // Demo mode - simple extractive summarization
        setTimeout(() => {
          const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
          const keyPoints = sentences
            .slice(0, Math.min(3, sentences.length))
            .map(s => s.trim())
            .join(". ") + (sentences.length > 3 ? "." : "");
          
          setSummary(`📝 Summary (Demo Mode):\n\n${keyPoints}\n\n💡 Key takeaway: This is a simplified demo summary. For AI-powered summaries, add your OpenAI API key.`);
          setLoading(false);
        }, 1500);
        return;
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert at summarizing text. Provide a concise, well-structured summary that captures the main points and key insights. Format your response with bullet points for clarity."
            },
            {
              role: "user",
              content: `Please summarize the following text:\n\n${text}`
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error("Failed to summarize text");
      }

      const data = await response.json();
      setSummary(data.choices[0]?.message?.content || "No summary generated");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to summarize text. Using demo mode.",
        variant: "destructive"
      });
      // Fallback to demo summary
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const keyPoints = sentences
        .slice(0, Math.min(3, sentences.length))
        .map(s => s.trim())
        .join(". ") + ".";
      setSummary(`📝 Demo Summary:\n\n${keyPoints}`);
    } finally {
      setLoading(false);
    }
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied!",
      description: "Summary copied to clipboard"
    });
  };

  const loadSample = () => {
    setText(sampleText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-green-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Text Summarizer
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="space-y-6">
              {/* API Key */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">OpenAI API Key (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-... (leave empty for demo mode)"
                  />
                </CardContent>
              </Card>

              {/* Text Input */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Text to Summarize</CardTitle>
                    <Button
                      onClick={loadSample}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      Load Sample
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your text here..."
                    className="min-h-[300px] resize-none"
                  />
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">
                      {text.length} characters
                    </span>
                    <Button
                      onClick={summarizeText}
                      disabled={loading || !text.trim()}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      {loading ? (
                        <>
                          <Zap className="mr-2 h-4 w-4 animate-spin" />
                          Summarizing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Summarize
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Output Panel */}
            <div className="space-y-6">
              {/* Summary Output */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Summary</CardTitle>
                    {summary && (
                      <Button
                        onClick={copySummary}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {summary ? (
                    <div className="bg-gradient-to-br from-white to-green-50 p-4 rounded-lg border border-green-100">
                      <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">
                        {summary}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-green-400" />
                      <p>Your summary will appear here</p>
                      <p className="text-sm mt-2">
                        Enter text and click "Summarize" to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Tips for Better Summaries
                  </h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Use clear, well-structured text</li>
                    <li>• Longer texts work better for AI summarization</li>
                    <li>• Try different types of content (articles, reports, etc.)</li>
                    <li>• Demo mode provides simple extraction-based summaries</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summarizer;
