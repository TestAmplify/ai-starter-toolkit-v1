import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Play, Copy, Settings } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);

  // Handle incoming data from navigation state
  useEffect(() => {
    if (location.state?.testCase) {
      setTestCase(location.state.testCase);
    }
  }, [location.state]);

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
              content: `You are a Playwright automation expert. Convert test cases into working Playwright test scripts. Use modern Playwright syntax with proper selectors, waits, and assertions. Include configuration and setup code.`
            },
            {
              role: "user",
              content: `Create a Playwright test script for these test cases. Use base URL: ${baseUrl || 'https://your-app.com'}, username: ${username || 'test-user'}, password: ${password || 'test-password'}. Test cases: ${testCase}`
            }
          ],
          max_tokens: 1500,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate Playwright code");
      }

      const data = await response.json();
      setPlaywrightCode(data.choices[0]?.message?.content || "No code generated");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate Playwright code. Please check your API key and try again.",
        variant: "destructive"
      });
      // Fallback to mock code for demo
      const mockCode = `import { test, expect } from '@playwright/test';

test.describe('Generated Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('${baseUrl || 'https://your-app.com'}');
  });

  test('Login Test Case', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Fill login credentials
    await page.fill('[data-testid="username"]', '${username || 'your-username'}');
    await page.fill('[data-testid="password"]', '${password || 'your-password'}');
    
    // Click login button
    await page.click('[data-testid="login-button"]');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('Form Validation Test', async ({ page }) => {
    // Click submit without filling required fields
    await page.click('[data-testid="submit-button"]');
    
    // Verify validation messages appear
    await expect(page.locator('text=This field is required')).toBeVisible();
  });

  test('Navigation Test', async ({ page }) => {
    // Test navigation elements
    await page.click('nav >> text=Home');
    await expect(page).toHaveURL(/.*home/);
    
    await page.click('nav >> text=Profile');
    await expect(page).toHaveURL(/.*profile/);
  });
});`;
      
      setPlaywrightCode(mockCode);
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
              <p className="text-gray-600">Generate Playwright scripts from test cases</p>
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
                  Configure your test environment settings
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
              </CardContent>
            </Card>

            {/* Test Case Input */}
            <Card>
              <CardHeader>
                <CardTitle>Test Case Input</CardTitle>
                <CardDescription>
                  Paste your test case description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your test case here...
Example: 
Test Case: User Login
1. Navigate to login page
2. Enter valid credentials  
3. Click login button
4. Verify successful login"
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
                    Ready-to-use Playwright test script
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
                  <p className="text-sm mt-2">Configure your settings and input test cases to get started</p>
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
