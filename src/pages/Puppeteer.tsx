
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bot, Copy, Play, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApiKey } from "@/contexts/ApiKeyContext";
import { ApiKeyConfig } from "@/components/ApiKeyConfig";
import { useToast } from "@/hooks/use-toast";

const Puppeteer = () => {
  const navigate = useNavigate();
  const { openaiApiKey } = useApiKey();
  const { toast } = useToast();
  
  const [testCase, setTestCase] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://example.com');
  const [priority, setPriority] = useState('medium');
  const [responsive, setResponsive] = useState(false);
  const [accessibility, setAccessibility] = useState(false);
  const [forms, setForms] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testMetadata, setTestMetadata] = useState<{
    estimatedTests: number;
    features: string[];
    priority: string;
  } | null>(null);

  const generatePuppeteerCode = async () => {
    if (!testCase.trim()) {
      toast({
        title: "Test case required",
        description: "Please enter a test case description",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const systemPrompt = `You are a Puppeteer code generator. Generate clean, executable Puppeteer code using this exact structure:

async function runTest(page) {
  // Your Puppeteer code here
  console.log('Starting test...');
  
  // Navigation
  await page.goto('${baseUrl}');
  await page.waitForLoadState('networkidle');
  
  // Test implementation
  // Use clean selectors and proper waits
  // Add console.log statements for debugging
  
  console.log('Test completed successfully');
}

IMPORTANT RULES:
1. Use ONLY the function structure above - no imports, no external dependencies
2. Use clean CSS selectors with fallbacks: page.locator('button:has-text("Login"), [data-testid="login-btn"], .login-button').first()
3. Always use proper waits: waitForSelector, waitForLoadState, waitForTimeout
4. Add console.log statements for debugging
5. Handle errors gracefully with try-catch blocks
6. Use page.screenshot() for visual verification when needed
7. For forms: fill inputs, handle dropdowns, submit forms
8. For responsive: test different viewport sizes if requested
9. For accessibility: check ARIA labels, focus states if requested
10. Keep code clean, readable, and production-ready

Generate code based on the test case description and configuration provided.`;

      const userPrompt = `Generate Puppeteer code for this test case:

Test Case: ${testCase}
Base URL: ${baseUrl}
Priority: ${priority}
Responsive Testing: ${responsive}
Accessibility Testing: ${accessibility}
Form Testing: ${forms}

Requirements:
- Use clean selector patterns with fallbacks
- Add proper waits and error handling
- Include console.log statements for debugging
- Make it serverless-compatible (no external imports)
${responsive ? '- Include viewport testing for mobile/desktop' : ''}
${accessibility ? '- Include accessibility checks (ARIA, focus states)' : ''}
${forms ? '- Include form validation and submission testing' : ''}

Generate only the runTest function code.`;

      if (openaiApiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate code');
        }

        const data = await response.json();
        const code = data.choices[0].message.content;
        setGeneratedCode(code);
        
        // Generate metadata
        const features = [];
        if (responsive) features.push('Responsive Testing');
        if (accessibility) features.push('Accessibility Checks');
        if (forms) features.push('Form Validation');
        
        setTestMetadata({
          estimatedTests: testCase.split(/[.!?]/).filter(s => s.trim()).length,
          features,
          priority
        });
      } else {
        // Mock data for demonstration
        const mockCode = `async function runTest(page) {
  console.log('Starting test...');
  
  // Navigate to the application
  await page.goto('${baseUrl}');
  await page.waitForLoadState('networkidle');
  
  // Test implementation based on: ${testCase}
  const button = page.locator('button:has-text("Click"), [data-testid="click-btn"], .click-button').first();
  await button.waitFor({ state: 'visible' });
  await button.click();
  
  // Verify the action
  await page.waitForSelector('.success-message, [data-testid="success"], .result');
  console.log('Action completed successfully');
  
  ${responsive ? `
  // Responsive testing
  await page.setViewportSize({ width: 375, height: 667 }); // Mobile
  await page.screenshot({ path: 'mobile-view.png' });
  
  await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
  await page.screenshot({ path: 'desktop-view.png' });` : ''}
  
  ${accessibility ? `
  // Accessibility checks
  const focusableElements = await page.locator('button, a, input, select, textarea').count();
  console.log(\`Found \${focusableElements} focusable elements\`);` : ''}
  
  console.log('Test completed successfully');
}`;
        
        setGeneratedCode(mockCode);
        setTestMetadata({
          estimatedTests: 1,
          features: responsive || accessibility || forms ? 
            [responsive && 'Responsive Testing', accessibility && 'Accessibility Checks', forms && 'Form Validation'].filter(Boolean) : [],
          priority
        });
      }
      
      toast({
        title: "Code generated successfully",
        description: "Your Puppeteer test code is ready",
      });
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: "Generation failed",
        description: "Please check your API key and try again",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Puppeteer Generator</h1>
              <p className="text-gray-600">Generate Puppeteer scripts for browser automation</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  Test Case Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testCase">Describe your test scenario</Label>
                  <Textarea
                    id="testCase"
                    value={testCase}
                    onChange={(e) => setTestCase(e.target.value)}
                    placeholder="Example: Navigate to the login page, enter valid credentials, click login button, and verify the user is redirected to the dashboard"
                    className="min-h-[120px] mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Priority Level</Label>
                  <RadioGroup value={priority} onValueChange={setPriority} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low">Low - Basic functionality</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium - Standard testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high">High - Comprehensive testing</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium mb-3 block">Test Features</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="responsive" 
                        checked={responsive}
                        onCheckedChange={setResponsive}
                      />
                      <Label htmlFor="responsive">Responsive Testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="accessibility" 
                        checked={accessibility}
                        onCheckedChange={setAccessibility}
                      />
                      <Label htmlFor="accessibility">Accessibility Checks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="forms" 
                        checked={forms}
                        onCheckedChange={setForms}
                      />
                      <Label htmlFor="forms">Form Validation</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={generatePuppeteerCode}
              disabled={isGenerating || !testCase.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Puppeteer Code
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {!openaiApiKey && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-amber-800 mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">API Key Required</span>
                  </div>
                  <ApiKeyConfig />
                </CardContent>
              </Card>
            )}

            {testMetadata && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Test Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Estimated Tests:</span>
                      <p className="text-gray-600">{testMetadata.estimatedTests}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Priority:</span>
                      <p className="text-gray-600 capitalize">{testMetadata.priority}</p>
                    </div>
                    {testMetadata.features.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Features:</span>
                        <p className="text-gray-600">{testMetadata.features.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {generatedCode && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Generated Puppeteer Code</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{generatedCode}</code>
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Puppeteer;
