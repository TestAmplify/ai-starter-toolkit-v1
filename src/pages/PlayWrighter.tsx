
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Play, Copy, Settings, Info } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useApiKey } from "@/contexts/ApiKeyContext";
import ApiKeyConfig from "@/components/ApiKeyConfig";

const PlayWrighter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { openaiApiKey } = useApiKey();
  const [testCase, setTestCase] = useState("");
  const [playwrightCode, setPlaywrightCode] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [priority, setPriority] = useState("medium");
  const [testOptions, setTestOptions] = useState({
    responsive: false,
    accessibility: false,
    interactive: true,
    forms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testMetadata, setTestMetadata] = useState(null);

  // Handle incoming data from navigation state
  useEffect(() => {
    if (location.state?.testCase) {
      setTestCase(location.state.testCase);
    }
  }, [location.state]);

  const parseTestRequirements = (testCaseText) => {
    const text = testCaseText.toLowerCase();
    const requirements = [];
    
    if (text.includes('responsive') || text.includes('mobile') || text.includes('tablet')) {
      requirements.push('responsive');
    }
    if (text.includes('accessibility') || text.includes('a11y') || text.includes('alt text')) {
      requirements.push('accessibility');
    }
    if (text.includes('click') || text.includes('interact') || text.includes('button')) {
      requirements.push('interactive');
    }
    if (text.includes('form') || text.includes('submit') || text.includes('input')) {
      requirements.push('forms');
    }
    
    return requirements;
  };

  const generateSystemPrompt = () => {
    return `You are a Playwright automation expert. Generate clean, serverless-ready Playwright test code using this EXACT structure:

REQUIRED STRUCTURE:
async function runTest(page, expect) {
  try {
    // Navigation
    await page.goto('{{BASE_URL}}');
    await page.waitForLoadState('networkidle');
    
    // Authentication (if credentials provided)
    ${username && password ? `
    await page.fill('[name="username"], [name="email"], #username, #email', '${username}');
    await page.fill('[name="password"], #password', '${password}');
    await page.click('[type="submit"], button[type="submit"], .login-btn, .submit-btn');
    await page.waitForLoadState('networkidle');
    console.log('✓ Authentication completed');` : ''}
    
    // Your generated test code here
    
    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

SELECTOR PATTERNS TO USE:
- Headlines: 'h1, .headline, [data-testid="headline"], [role="heading"]'
- Subheadings: 'h2, h3, .subheading, [data-testid="subheading"]'
- CTA Buttons: 'button, [role="button"], .cta, .btn-primary, [data-testid="cta"]'
- Forms: 'form, .form, [data-testid="form"]'
- Navigation: 'nav, .nav, [role="navigation"]'

REQUIREMENTS:
- Use smart selectors with fallbacks
- Include console.log for each successful test
- Use await expect(locator).toBeVisible() for visibility checks
- Use await expect(locator).toContainText('text') for text validation
- Add proper error handling
- Generate serverless-ready code (no imports)
- Use waitForLoadState('networkidle') after navigation/interactions

RESPONSIVE TESTING (if requested):
const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1280, height: 800 }
];

for (const viewport of viewports) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await expect(page.locator('h1, .headline').first()).toBeVisible();
  console.log(\`✓ \${viewport.name} view - layout responsive\`);
}

ACCESSIBILITY TESTING (if requested):
const title = await page.title();
console.log(\`✓ Page title: \${title}\`);

const imagesWithoutAlt = await page.locator('img:not([alt])').count();
console.log(\`✓ Images without alt text: \${imagesWithoutAlt}\`);

FORM TESTING (if requested):
await page.fill('[name="email"], #email', 'test@example.com');
await page.click('[type="submit"], button[type="submit"]');
await page.waitForLoadState('networkidle');
console.log('✓ Form submission successful');

Return ONLY the function code, no explanations.`;
  };

  const generateTestPrompt = () => {
    const detectedRequirements = parseTestRequirements(testCase);
    const enabledOptions = Object.entries(testOptions)
      .filter(([_, enabled]) => enabled)
      .map(([option, _]) => option);
    
    const allRequirements = [...new Set([...detectedRequirements, ...enabledOptions])];
    
    return `Generate Playwright test code for:
BASE_URL: ${baseUrl || 'https://your-app.com'}
PRIORITY: ${priority}
TEST_REQUIREMENTS: ${allRequirements.join(', ')}

TEST CASES:
${testCase}

Include these test types based on requirements:
${allRequirements.includes('responsive') ? '- Responsive design testing across viewports' : ''}
${allRequirements.includes('accessibility') ? '- Accessibility checks (titles, alt text)' : ''}
${allRequirements.includes('interactive') ? '- Interactive element testing (clicks, hovers)' : ''}
${allRequirements.includes('forms') ? '- Form validation and submission testing' : ''}

Generate clean, executable code following the exact structure provided.`;
  };

  const generatePlaywrightCode = async () => {
    if (!testCase.trim()) return;
    
    if (!openaiApiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your OpenAI API key first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
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
              content: generateSystemPrompt()
            },
            {
              role: "user",
              content: generateTestPrompt()
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate Playwright code");
      }

      const data = await response.json();
      const generatedCode = data.choices[0]?.message?.content || "No code generated";
      setPlaywrightCode(generatedCode);
      
      // Generate metadata
      const detectedRequirements = parseTestRequirements(testCase);
      const enabledOptions = Object.entries(testOptions)
        .filter(([_, enabled]) => enabled)
        .map(([option, _]) => option);
      
      setTestMetadata({
        testCount: 3 + enabledOptions.length * 2,
        features: [...new Set([...detectedRequirements, ...enabledOptions])],
        priority: priority
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate Playwright code. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(playwrightCode);
      toast({
        title: "Copied!",
        description: "Playwright code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const handleTestOptionChange = (option, checked) => {
    setTestOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl">
              <Play className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">PlayWrighter</h1>
              <p className="text-gray-600">Generate clean, serverless-ready Playwright scripts</p>
            </div>
          </div>
        </div>

        {/* API Key Configuration */}
        <ApiKeyConfig />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Configuration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Test Configuration
                </CardTitle>
                <CardDescription>
                  Configure your test environment and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Base URL</label>
                  <input
                    type="url"
                    placeholder="https://your-app.com"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      placeholder="test-user"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      placeholder="test-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Test Options */}
                <div>
                  <label className="block text-sm font-medium mb-3">Test Options</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="responsive"
                        checked={testOptions.responsive}
                        onCheckedChange={(checked) => handleTestOptionChange('responsive', checked)}
                      />
                      <Label htmlFor="responsive" className="text-sm">Responsive Design Testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accessibility"
                        checked={testOptions.accessibility}
                        onCheckedChange={(checked) => handleTestOptionChange('accessibility', checked)}
                      />
                      <Label htmlFor="accessibility" className="text-sm">Accessibility Checks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="interactive"
                        checked={testOptions.interactive}
                        onCheckedChange={(checked) => handleTestOptionChange('interactive', checked)}
                      />
                      <Label htmlFor="interactive" className="text-sm">Interactive Element Testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="forms"
                        checked={testOptions.forms}
                        onCheckedChange={(checked) => handleTestOptionChange('forms', checked)}
                      />
                      <Label htmlFor="forms" className="text-sm">Form Validation</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Case Input */}
            <Card>
              <CardHeader>
                <CardTitle>Test Case Input</CardTitle>
                <CardDescription>
                  Describe your test scenarios in natural language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Example: 
Test the main homepage for:
- Headline visibility and correct text
- CTA button functionality  
- Form submission with validation
- Mobile responsiveness
- Accessibility compliance"
                  value={testCase}
                  onChange={(e) => setTestCase(e.target.value)}
                  className="min-h-[200px]"
                />
                
                <Button
                  onClick={generatePlaywrightCode}
                  disabled={isLoading || !testCase.trim()}
                  className="w-full"
                >
                  {isLoading ? "Generating..." : "Generate Playwright Code"}
                </Button>

                {/* Test Metadata */}
                {testMetadata && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Info className="h-4 w-4" />
                      <span className="font-medium">Test Preview:</span>
                    </div>
                    <div className="mt-2 text-sm text-blue-600">
                      <p>Estimated tests: {testMetadata.testCount}</p>
                      <p>Features: {testMetadata.features.join(', ')}</p>
                      <p>Priority: {testMetadata.priority}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Playwright Code</CardTitle>
                  <CardDescription>
                    Clean, serverless-ready test script
                  </CardDescription>
                </div>
                {playwrightCode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {playwrightCode ? (
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-[600px]">
                  <pre>{playwrightCode}</pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generated Playwright code will appear here</p>
                  <p className="text-sm mt-2">Configure your settings and describe your test cases to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayWrighter;
