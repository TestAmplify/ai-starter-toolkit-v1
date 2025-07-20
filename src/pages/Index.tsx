
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, MessageCircle, FileText, Palette, Sparkles, ArrowRight, Bot, Bug } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const tools = [
    {
      title: "Quote Generator",
      description: "Get inspirational quotes powered by AI",
      icon: Quote,
      path: "/quotes",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      textColor: "text-purple-600"
    },
    {
      title: "AI Chat",
      description: "Have a conversation with AI assistant",
      icon: MessageCircle,
      path: "/chat",
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      textColor: "text-blue-600"
    },
    {
      title: "Text Summarizer",
      description: "Summarize long text into key points",
      icon: FileText,
      path: "/summarizer",
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      textColor: "text-green-600"
    },
    {
      title: "Color Generator",
      description: "Generate beautiful color palettes",
      icon: Palette,
      path: "/colors",
      color: "bg-gradient-to-br from-orange-500 to-red-500",
      textColor: "text-orange-600"
    },
    {
      title: "Test Case Pro",
      description: "Convert user stories to comprehensive test cases",
      icon: FileText,
      path: "/test-cases",
      color: "bg-gradient-to-br from-indigo-500 to-purple-500",
      textColor: "text-indigo-600"
    },
    {
      title: "PlayWrighter",
      description: "Generate Playwright scripts from test cases",
      icon: FileText,
      path: "/playwright",
      color: "bg-gradient-to-br from-teal-500 to-cyan-500",
      textColor: "text-teal-600"
    },
    {
      title: "Puppeteer Generator",
      description: "Generate Puppeteer scripts for browser automation",
      icon: Bot,
      path: "/puppeteer",
      color: "bg-gradient-to-br from-blue-500 to-green-500",
      textColor: "text-blue-600"
    },
    {
      title: "StackTrace Analyzer",
      description: "Get actionable debugging suggestions from error traces",
      icon: Bug,
      path: "/stacktrace",
      color: "bg-gradient-to-br from-red-500 to-orange-500",
      textColor: "text-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Multi-Tool
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A collection of simple AI-powered tools for beginners. No backend required - just connect your API keys and start exploring!
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-12">
          {tools.map((tool, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">{tool.title}</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      {tool.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={() => navigate(tool.path)}
                  className={`w-full ${tool.textColor} bg-white border-2 border-current hover:text-white hover:bg-current transition-all duration-300 group-hover:scale-105`}
                  variant="outline"
                >
                  Try it now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Getting Started Section */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              🚀 Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  1
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Get API Keys</h3>
                <p className="text-sm text-gray-600">
                  Sign up for OpenAI and get your API key (some tools work without it too!)
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  2
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Choose a Tool</h3>
                <p className="text-sm text-gray-600">
                  Click on any tool above to start exploring AI capabilities
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  3
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Start Creating</h3>
                <p className="text-sm text-gray-600">
                  Generate quotes, chat with AI, and discover what's possible!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
