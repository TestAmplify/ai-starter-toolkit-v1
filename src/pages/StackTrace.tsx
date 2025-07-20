import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bug, Copy, Search, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApiKey } from "@/contexts/ApiKeyContext";
import ApiKeyConfig from "@/components/ApiKeyConfig";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  rootCause: string;
  errorType: string;
  language: string;
  suggestions: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  problematicCode?: string;
  lineNumber?: string;
}

const StackTrace = () => {
  const navigate = useNavigate();
  const { openaiApiKey } = useApiKey();
  const { toast } = useToast();
  
  const [stackTrace, setStackTrace] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeStackTrace = async () => {
    if (!stackTrace.trim()) {
      toast({
        title: "Stack trace required",
        description: "Please paste an error stack trace to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const systemPrompt = `You are a precise debugging assistant. Analyze stack traces and provide concise, actionable solutions.

RESPONSE FORMAT (JSON):
{
  "rootCause": "Brief explanation of what caused the error",
  "errorType": "Type of error (Runtime, Syntax, Build, etc.)",
  "language": "Detected programming language/framework",
  "suggestions": [
    {
      "title": "Action item title",
      "description": "Specific step to fix the issue",
      "priority": "high|medium|low"
    }
  ],
  "problematicCode": "The specific line/code causing the issue (if identifiable)",
  "lineNumber": "Line number where error occurs (if available)"
}

RULES:
1. Be concise and actionable - no long explanations
2. Provide 3-5 specific suggestions max
3. Prioritize suggestions (high/medium/low)
4. Focus on the immediate fix, not theory
5. Include specific code fixes when possible
6. Detect language/framework from stack trace patterns
7. Identify the exact line causing the issue when possible`;

      const userPrompt = `Analyze this stack trace and provide debugging suggestions:

${stackTrace}

Provide a JSON response with root cause analysis and specific fix suggestions.`;

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
          throw new Error('Failed to analyze stack trace');
        }

        const data = await response.json();
        const analysisText = data.choices[0].message.content;
        
        try {
          const analysisResult = JSON.parse(analysisText);
          setAnalysis(analysisResult);
        } catch (parseError) {
          // Fallback if JSON parsing fails
          setAnalysis({
            rootCause: "Error parsing response - please try again",
            errorType: "Analysis Error",
            language: "Unknown",
            suggestions: [
              {
                title: "Retry Analysis",
                description: "The analysis response couldn't be parsed. Please try again.",
                priority: "high"
              }
            ]
          });
        }
      } else {
        // Mock data for demonstration
        const mockAnalysis: AnalysisResult = {
          rootCause: "Null pointer exception when accessing undefined object property",
          errorType: "Runtime Error",
          language: "JavaScript/TypeScript",
          suggestions: [
            {
              title: "Add null check",
              description: "Check if object exists before accessing properties: if (obj && obj.property)",
              priority: "high"
            },
            {
              title: "Use optional chaining",
              description: "Replace obj.property with obj?.property to safely access nested properties",
              priority: "high"
            },
            {
              title: "Initialize variables",
              description: "Ensure variables are properly initialized before use",
              priority: "medium"
            },
            {
              title: "Add error boundaries",
              description: "Implement error boundaries to catch and handle runtime errors gracefully",
              priority: "low"
            }
          ],
          problematicCode: "Cannot read property 'name' of undefined",
          lineNumber: "Line 42"
        };
        
        setAnalysis(mockAnalysis);
      }
      
      toast({
        title: "Analysis complete",
        description: "Stack trace has been analyzed successfully",
      });
    } catch (error) {
      console.error('Error analyzing stack trace:', error);
      toast({
        title: "Analysis failed",
        description: "Please check your API key and try again",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyAnalysis = async () => {
    if (!analysis) return;
    
    const formattedAnalysis = `## Stack Trace Analysis

**Root Cause:** ${analysis.rootCause}
**Error Type:** ${analysis.errorType}
**Language:** ${analysis.language}
${analysis.lineNumber ? `**Location:** ${analysis.lineNumber}` : ''}
${analysis.problematicCode ? `**Problematic Code:** ${analysis.problematicCode}` : ''}

## Fix Suggestions:

${analysis.suggestions.map((suggestion, index) => 
  `${index + 1}. **${suggestion.title}** (${suggestion.priority} priority)
   ${suggestion.description}`
).join('\n\n')}`;

    await navigator.clipboard.writeText(formattedAnalysis);
    toast({
      title: "Copied to clipboard",
      description: "Analysis has been copied to your clipboard",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
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
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl">
              <Bug className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">StackTrace Analyzer</h1>
              <p className="text-gray-600">Get actionable debugging suggestions from error traces</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  Error Stack Trace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="stackTrace">Paste your error stack trace here</Label>
                  <Textarea
                    id="stackTrace"
                    value={stackTrace}
                    onChange={(e) => setStackTrace(e.target.value)}
                    placeholder={`Example:
TypeError: Cannot read property 'name' of undefined
    at UserComponent.render (UserComponent.js:42:15)
    at ReactCompositeComponent._renderValidatedComponentWithoutOwnerOrContext
    at ReactCompositeComponent._renderValidatedComponent
    ...`}
                    className="min-h-[300px] mt-2 font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={analyzeStackTrace}
              disabled={isAnalyzing || !stackTrace.trim()}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Stack Trace
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
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">API Key Required</span>
                  </div>
                  <ApiKeyConfig />
                </CardContent>
              </Card>
            )}

            {analysis && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Analysis Results
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAnalysis}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Error Type</Label>
                        <p className="text-gray-900">{analysis.errorType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Language</Label>
                        <p className="text-gray-900">{analysis.language}</p>
                      </div>
                      {analysis.lineNumber && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Location</Label>
                          <p className="text-gray-900 font-mono text-sm">{analysis.lineNumber}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Root Cause</Label>
                      <p className="text-gray-900 mt-1">{analysis.rootCause}</p>
                    </div>

                    {analysis.problematicCode && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Problematic Code</Label>
                        <code className="block bg-red-50 border border-red-200 p-2 rounded text-sm mt-1">
                          {analysis.problematicCode}
                        </code>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Fix Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(suggestion.priority)}`}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{index + 1}. {suggestion.title}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(suggestion.priority)}`}>
                              {suggestion.priority}
                            </span>
                          </div>
                          <p className="text-sm opacity-90">{suggestion.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackTrace;
