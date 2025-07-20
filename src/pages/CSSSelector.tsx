
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, Copy, Code2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApiKey } from "@/contexts/ApiKeyContext";
import { toast } from "sonner";

interface GeneratedSelector {
  selector: string;
  type: string;
  description: string;
  specificity: string;
}

const CSSSelector = () => {
  const navigate = useNavigate();
  const { openaiApiKey, setOpenaiApiKey } = useApiKey();
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [htmlInput, setHtmlInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectors, setSelectors] = useState<GeneratedSelector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSelectors = async () => {
    if (!openaiApiKey) {
      toast.error("Please enter your OpenAI API key first");
      return;
    }

    if (activeTab === 'text' && !htmlInput.trim()) {
      toast.error("Please enter HTML content");
      return;
    }

    if (activeTab === 'image' && !imageFile) {
      toast.error("Please upload an image");
      return;
    }

    setIsLoading(true);
    try {
      const messages = [];
      
      if (activeTab === 'text') {
        messages.push({
          role: "system",
          content: `You are a CSS selector expert. Analyze the provided HTML and generate 5 different CSS selectors for targeting elements. For each selector, provide:
          1. The CSS selector itself
          2. Type (ID, Class, Attribute, Descendant, etc.)
          3. Description of what it targets
          4. Specificity level (Low, Medium, High)
          
          Format your response as JSON array with objects containing: selector, type, description, specificity`
        });
        
        messages.push({
          role: "user",
          content: `Generate CSS selectors for this HTML:\n\n${htmlInput}`
        });
      } else {
        messages.push({
          role: "system",
          content: `You are a CSS selector expert. Analyze the provided webpage screenshot and generate 5 different CSS selectors for common elements you can identify. For each selector, provide:
          1. The CSS selector itself
          2. Type (ID, Class, Attribute, Descendant, etc.)
          3. Description of what it targets
          4. Specificity level (Low, Medium, High)
          
          Format your response as JSON array with objects containing: selector, type, description, specificity`
        });
        
        messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate CSS selectors for elements visible in this webpage screenshot:"
            },
            {
              type: "image_url",
              image_url: {
                url: imagePreview
              }
            }
          ]
        });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          max_tokens: 1500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsedSelectors = JSON.parse(content);
        setSelectors(parsedSelectors);
        toast.success("CSS selectors generated successfully!");
      } catch (parseError) {
        // Fallback: try to extract selectors from non-JSON response
        const lines = content.split('\n').filter((line: string) => line.includes('selector') || line.includes('.')).slice(0, 5);
        const fallbackSelectors = lines.map((line: string, index: number) => ({
          selector: line.trim(),
          type: "Mixed",
          description: "Generated selector",
          specificity: "Medium"
        }));
        setSelectors(fallbackSelectors);
      }
    } catch (error) {
      console.error('Error generating selectors:', error);
      toast.error("Failed to generate CSS selectors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copySelector = (selector: string, index: number) => {
    navigator.clipboard.writeText(selector);
    setCopiedIndex(index);
    toast.success("Selector copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllSelectors = () => {
    const allSelectors = selectors.map(s => s.selector).join('\n');
    navigator.clipboard.writeText(allSelectors);
    toast.success("All selectors copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl">
                <Code2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">CSS Selector Generator</h1>
                <p className="text-gray-600">Generate reliable CSS selectors from HTML or screenshots</p>
              </div>
            </div>
          </div>

          {/* API Key Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">OpenAI API Configuration</CardTitle>
              <CardDescription>Enter your OpenAI API key to use the CSS selector generator</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="password"
                placeholder="Enter your OpenAI API key"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Input Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Input Content</CardTitle>
              <CardDescription>Choose your input method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Button 
                  variant={activeTab === 'text' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('text')}
                >
                  HTML Text
                </Button>
                <Button 
                  variant={activeTab === 'image' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('image')}
                >
                  Image Upload
                </Button>
              </div>

              {activeTab === 'text' ? (
                <Textarea
                  placeholder="Paste your HTML content here..."
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  rows={10}
                  className="mb-4"
                />
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="max-w-xs mx-auto"
                    />
                    <p className="text-sm text-gray-500 mt-2">Upload a screenshot of the webpage</p>
                  </div>
                  
                  {imagePreview && (
                    <div className="mt-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full h-auto rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={generateSelectors} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Generating..." : "Generate CSS Selectors"}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {selectors.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Generated CSS Selectors</CardTitle>
                    <CardDescription>Click to copy individual selectors</CardDescription>
                  </div>
                  <Button onClick={copyAllSelectors} variant="outline">
                    Copy All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectors.map((selector, index) => (
                    <div 
                      key={index}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded">
                              {selector.type}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {selector.specificity} Specificity
                            </span>
                          </div>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            {selector.selector}
                          </code>
                          <p className="text-sm text-gray-600 mt-1">{selector.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copySelector(selector.selector, index)}
                        >
                          {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSSSelector;
