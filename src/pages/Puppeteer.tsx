import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Bot, Copy, Play, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApiKey } from "@/contexts/ApiKeyContext";
import ApiKeyConfig from "@/components/ApiKeyConfig";
import { useToast } from "@/hooks/use-toast";

const Puppeteer = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ status: 'ready' | 'needs-update'; issues?: string[] } | null>(null);
  const [showCheckDialog, setShowCheckDialog] = useState(false);
  const [testMetadata, setTestMetadata] = useState<{
    estimatedTests: number;
    features: string[];
    priority: string;
  } | null>(null);

  // Handle incoming test case data from navigation
  useEffect(() => {
    if (location.state?.testCase) {
      setTestCase(location.state.testCase);
    }
  }, [location.state]);

  const checkGeneratedCode = async () => {
    if (!generatedCode.trim()) {
      toast({
        title: "No code to check",
        description: "Generate code first before checking",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    
    try {
      const systemPrompt = `You are a Puppeteer code quality analyzer. Analyze the provided Puppeteer test code and determine if it's ready for use or needs updates.

Check for:
1. Proper Puppeteer syntax (page.$, page.waitForSelector, page.type, etc.)
2. Correct navigation patterns with { waitUntil: 'networkidle0' }
3. Proper error handling with try-catch blocks
4. Complete test coverage based on requirements
5. Missing or incorrect selectors
6. Proper async/await usage
7. Missing console.log statements for debugging
8. Correct function structure

Respond with JSON in this exact format:
{
  "status": "ready" or "needs-update",
  "issues": ["issue 1", "issue 2"] // only if status is "needs-update"
}

If the code is ready, return {"status": "ready"}
If it needs updates, list specific issues that need to be fixed.`;

      const userPrompt = `Analyze this Puppeteer code:

Original Requirements:
- Test Case: ${testCase}
- Base URL: ${baseUrl}
- Features: ${responsive ? 'Responsive Testing, ' : ''}${accessibility ? 'Accessibility Checks, ' : ''}${forms ? 'Form Validation' : ''}

Generated Code:
${generatedCode}

Is this code ready for use or does it need updates?`;

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
            temperature: 0.1,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to check code');
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        setCheckResult(result);
        setShowCheckDialog(true);
      } else {
        // Mock check for demo
        const mockResult = Math.random() > 0.5 ? 
          { status: 'ready' as const } : 
          { 
            status: 'needs-update' as const, 
            issues: ['Missing error handling in navigation', 'Selectors could be more robust', 'Add more console.log statements for debugging'] 
          };
        setCheckResult(mockResult);
        setShowCheckDialog(true);
      }
    } catch (error) {
      console.error('Error checking code:', error);
      toast({
        title: "Check failed",
        description: "Unable to analyze code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdateCode = async () => {
    setShowCheckDialog(false);
    
    if (!checkResult?.issues) return;
    
    // Regenerate code with identified issues as additional context
    setIsGenerating(true);
    
    try {
      const systemPrompt = `You are a Puppeteer code generator. Generate clean, executable Puppeteer code using this exact structure:

async function runTest(page) {
  console.log('Starting test...');
  
  try {
    // Navigation - use proper Puppeteer syntax
    await page.goto('${baseUrl}', { waitUntil: 'networkidle0' });
    
    // Test implementation using authentic Puppeteer methods
    // Use page.$() for single elements, page.$$() for multiple
    // Use page.waitForSelector('selector') for waiting
    // Use page.type('selector', 'text', { delay: 50 }) for typing
    // Use page.click('selector') for clicking
    // Use page.$eval('selector', el => el.textContent) for text extraction
    
    console.log('✓ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

CRITICAL PUPPETEER SYNTAX RULES:
1. Navigation: await page.goto(url, { waitUntil: 'networkidle0' })
2. Element selection: await page.$('selector') or await page.$$('selector')
3. Waiting: await page.waitForSelector('selector')
4. Typing: await page.type('input[name="field"]', 'value', { delay: 50 })
5. Clicking: await page.click('button[type="submit"]')
6. Text extraction: await page.$eval('h1', el => el.textContent)
7. Form submission with navigation: await Promise.all([page.click('submit'), page.waitForNavigation({ waitUntil: 'networkidle0' })])
8. Screenshots: await page.screenshot({ path: 'screenshot.png' })
9. Viewport: await page.setViewport({ width: 1280, height: 800 })
10. Element existence check: const element = await page.$('.selector'); if (!element) throw new Error('Element not found');

IMPORTANT: Fix these specific issues that were identified:
${checkResult.issues.map(issue => `- ${issue}`).join('\n')}

Generate authentic Puppeteer code that addresses all the identified issues.`;

      const userPrompt = `Generate improved Puppeteer code for this test case:

Test Case: ${testCase}
Base URL: ${baseUrl}
Priority: ${priority}
Responsive Testing: ${responsive}
Accessibility Testing: ${accessibility}
Form Testing: ${forms}

Previously identified issues to fix:
${checkResult.issues.map(issue => `- ${issue}`).join('\n')}

Generate only the runTest function with proper Puppeteer syntax and fix all identified issues.`;

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
          throw new Error('Failed to generate updated code');
        }

        const data = await response.json();
        const code = data.choices[0].message.content;
        setGeneratedCode(code);
        
        toast({
          title: "Code updated successfully",
          description: "Your Puppeteer test code has been improved",
        });
      }
    } catch (error) {
      console.error('Error updating code:', error);
      toast({
        title: "Update failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
  console.log('Starting test...');
  
  try {
    // Navigation - use proper Puppeteer syntax
    await page.goto('${baseUrl}', { waitUntil: 'networkidle0' });
    
    // Test implementation using authentic Puppeteer methods
    // Use page.$() for single elements, page.$$() for multiple
    // Use page.waitForSelector('selector') for waiting
    // Use page.type('selector', 'text', { delay: 50 }) for typing
    // Use page.click('selector') for clicking
    // Use page.$eval('selector', el => el.textContent) for text extraction
    
    console.log('✓ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

CRITICAL PUPPETEER SYNTAX RULES:
1. Navigation: await page.goto(url, { waitUntil: 'networkidle0' })
2. Element selection: await page.$('selector') or await page.$$('selector')
3. Waiting: await page.waitForSelector('selector')
4. Typing: await page.type('input[name="field"]', 'value', { delay: 50 })
5. Clicking: await page.click('button[type="submit"]')
6. Text extraction: await page.$eval('h1', el => el.textContent)
7. Form submission with navigation: await Promise.all([page.click('submit'), page.waitForNavigation({ waitUntil: 'networkidle0' })])
8. Screenshots: await page.screenshot({ path: 'screenshot.png' })
9. Viewport: await page.setViewport({ width: 1280, height: 800 })
10. Element existence check: const element = await page.$('.selector'); if (!element) throw new Error('Element not found');

DO NOT USE PLAYWRIGHT SYNTAX:
- NO page.locator() - use page.$() instead
- NO waitForLoadState() - use { waitUntil: 'networkidle0' } in goto()
- NO .waitFor({ state: 'visible' }) - use page.waitForSelector()
- NO setViewportSize() - use page.setViewport()

Generate authentic Puppeteer code that can run with the actual Puppeteer library.`;

      const userPrompt = `Generate Puppeteer code for this test case:

Test Case: ${testCase}
Base URL: ${baseUrl}
Priority: ${priority}
Responsive Testing: ${responsive}
Accessibility Testing: ${accessibility}
Form Testing: ${forms}

Requirements:
- Use authentic Puppeteer syntax (page.$, page.waitForSelector, page.type, etc.)
- Add proper error handling with try-catch blocks
- Include console.log statements for debugging
- Use { delay: 50 } for typing to simulate human behavior
- Handle navigation properly with waitUntil: 'networkidle0'
${responsive ? '- Include viewport testing: await page.setViewport({ width: 375, height: 667 }) for mobile' : ''}
${accessibility ? '- Include accessibility checks using page.$eval to check ARIA attributes' : ''}
${forms ? '- Include form validation: check required fields, error messages after submission' : ''}

Generate only the runTest function with proper Puppeteer syntax.`;

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
        // Mock data with correct Puppeteer syntax
        const mockCode = `async function runTest(page) {
  console.log('Starting test...');
  
  try {
    // Navigate to the application
    await page.goto('${baseUrl}', { waitUntil: 'networkidle0' });
    
    // Test implementation for: ${testCase}
    await page.waitForSelector('button');
    const button = await page.$('button');
    if (!button) throw new Error('Button not found');
    
    await page.click('button');
    console.log('✓ Button clicked successfully');
    
    // Verify the action result
    await page.waitForSelector('.result, [data-testid="result"], .success-message');
    const resultText = await page.$eval('.result, [data-testid="result"], .success-message', 
      el => el.textContent);
    console.log(\`✓ Result: \${resultText}\`);
    
    ${responsive ? `
    // Responsive testing
    console.log('Testing mobile viewport...');
    await page.setViewport({ width: 375, height: 667 });
    await page.screenshot({ path: 'mobile-view.png' });
    console.log('✓ Mobile viewport tested');
    
    console.log('Testing desktop viewport...');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'desktop-view.png' });
    console.log('✓ Desktop viewport tested');` : ''}
    
    ${accessibility ? `
    // Accessibility checks
    const focusableElements = await page.$$('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    console.log(\`✓ Found \${focusableElements.length} focusable elements\`);
    
    const ariaLabels = await page.$$eval('[aria-label], [aria-labelledby]', 
      els => els.map(el => el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')));
    console.log(\`✓ Found \${ariaLabels.length} elements with ARIA labels\`);` : ''}
    
    ${forms ? `
    // Form testing (if forms exist)
    const forms = await page.$$('form');
    if (forms.length > 0) {
      console.log(\`Testing \${forms.length} form(s)...\`);
      
      const inputs = await page.$$('input[required]');
      console.log(\`✓ Found \${inputs.length} required fields\`);
      
      // Test form validation by submitting empty form
      const submitBtn = await page.$('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        await page.click('button[type="submit"], input[type="submit"]');
        await page.waitForTimeout(1000); // Wait for validation messages
        console.log('✓ Form validation tested');
      }
    }` : ''}
    
    console.log('✓ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
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
                        onCheckedChange={(checked) => setResponsive(checked === true)}
                      />
                      <Label htmlFor="responsive">Responsive Testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="accessibility" 
                        checked={accessibility}
                        onCheckedChange={(checked) => setAccessibility(checked === true)}
                      />
                      <Label htmlFor="accessibility">Accessibility Checks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="forms" 
                        checked={forms}
                        onCheckedChange={(checked) => setForms(checked === true)}
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkGeneratedCode}
                        disabled={isChecking}
                      >
                        {isChecking ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        ) : (
                          <Shield className="mr-2 h-4 w-4" />
                        )}
                        Check
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
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

      {/* Check Result Dialog */}
      <AlertDialog open={showCheckDialog} onOpenChange={setShowCheckDialog}>
        <AlertDialogContent className={checkResult?.status === 'needs-update' ? 'border-purple-200 bg-purple-50' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {checkResult?.status === 'ready' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Code is Ready
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                  Code Needs Updates
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {checkResult?.status === 'ready' ? (
                "Your Puppeteer code is ready to use! All syntax and structure checks passed."
              ) : (
                <>
                  <span className="block mb-2">The following issues were identified:</span>
                  <ul className="list-disc list-inside space-y-1 text-purple-700">
                    {checkResult?.issues?.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {checkResult?.status === 'needs-update' ? (
              <>
                <Button variant="outline" onClick={() => setShowCheckDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateCode}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Code'
                  )}
                </Button>
              </>
            ) : (
              <AlertDialogAction onClick={() => setShowCheckDialog(false)}>
                Great!
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Puppeteer;
