import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Settings, Link, Copy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useApiKey } from "@/contexts/ApiKeyContext";
import ApiKeyConfig from "@/components/ApiKeyConfig";

const TestCases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { openaiApiKey } = useApiKey();
  const [userStory, setUserStory] = useState("");
  const [testCases, setTestCases] = useState("");
  const [jiraUrl, setJiraUrl] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showJiraConfig, setShowJiraConfig] = useState(false);

  const generateTestCases = async () => {
    if (!userStory.trim()) return;
    
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
              content: "You are a QA expert. Convert user stories into comprehensive test cases. Format each test case with: Title, Given/When/Then steps, and Priority level. Be thorough and cover happy path, edge cases, and error scenarios."
            },
            {
              role: "user",
              content: `Create comprehensive test cases for this user story: ${userStory}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate test cases");
      }

      const data = await response.json();
      setTestCases(data.choices[0]?.message?.content || "No test cases generated");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate test cases. Please check your API key and try again.",
        variant: "destructive"
      });
      // Fallback to mock data for demo
      const mockTestCases = `
**Test Cases for User Story:**

**Test Case 1: Happy Path - Successful Login**
- Given: User is on the login page
- When: User enters valid credentials
- Then: User should be redirected to dashboard
- Priority: High

**Test Case 2: Invalid Credentials**
- Given: User is on the login page  
- When: User enters invalid username/password
- Then: Error message should be displayed
- Priority: High

**Test Case 3: Empty Fields Validation**
- Given: User is on the login page
- When: User clicks login without entering credentials
- Then: Validation errors should appear
- Priority: Medium

**Test Case 4: Password Reset Flow**
- Given: User clicks "Forgot Password"
- When: User enters valid email
- Then: Password reset email should be sent
- Priority: Medium
      `;
      setTestCases(mockTestCases);
    } finally {
      setIsLoading(false);
    }
  };

  const copyTestCases = async () => {
    if (!testCases) return;
    
    try {
      await navigator.clipboard.writeText(testCases);
      toast({
        title: "Copied!",
        description: "Test cases copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy test cases",
        variant: "destructive",
      });
    }
  };

  const pasteToPlaywright = () => {
    if (!testCases) return;
    
    // Navigate to PlayWrighter with the test cases data
    navigate("/playwright", { state: { testCase: testCases } });
    
    toast({
      title: "Transferred!",
      description: "Test cases sent to PlayWrighter",
    });
  };

  const syncWithJira = async () => {
    if (!jiraUrl || !jiraToken) {
      alert("Please configure JIRA settings first");
      return;
    }
    
    // Simulate JIRA sync
    alert("Test cases would be synced to JIRA (demo mode)");
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
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Test Case Pro</h1>
              <p className="text-gray-600">Convert user stories to comprehensive test cases</p>
            </div>
          </div>
        </div>

        {/* API Key Configuration */}
        <ApiKeyConfig />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                User Story Input
              </CardTitle>
              <CardDescription>
                Paste your user story and generate comprehensive test cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your user story here... 
Example: As a user, I want to be able to log into the application so that I can access my dashboard..."
                value={userStory}
                onChange={(e) => setUserStory(e.target.value)}
                className="min-h-[200px]"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={generateTestCases}
                  disabled={isLoading || !userStory.trim()}
                  className="flex-1"
                >
                  {isLoading ? "Generating..." : "Generate Test Cases"}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowJiraConfig(!showJiraConfig)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  JIRA
                </Button>
              </div>

              {/* JIRA Configuration */}
              {showJiraConfig && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      JIRA Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <input
                      type="url"
                      placeholder="JIRA URL (e.g., https://company.atlassian.net)"
                      value={jiraUrl}
                      onChange={(e) => setJiraUrl(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    />
                    <input
                      type="password"
                      placeholder="JIRA API Token"
                      value={jiraToken}
                      onChange={(e) => setJiraToken(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    />
                    <Button
                      onClick={syncWithJira}
                      size="sm"
                      className="w-full"
                      disabled={!testCases}
                    >
                      Sync to JIRA
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Test Cases</CardTitle>
                  <CardDescription>
                    AI-generated test cases ready for your testing workflow
                  </CardDescription>
                </div>
                {testCases && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyTestCases}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={pasteToPlaywright}
                      className="flex items-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Paste
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {testCases ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {testCases}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generated test cases will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestCases;
