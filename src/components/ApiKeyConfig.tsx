
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff, Check } from "lucide-react";
import { useApiKey } from "@/contexts/ApiKeyContext";
import { useToast } from "@/hooks/use-toast";

const ApiKeyConfig = () => {
  const { openaiApiKey, setOpenaiApiKey } = useApiKey();
  const { toast } = useToast();
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const [isEditing, setIsEditing] = useState(!openaiApiKey);

  const handleSave = () => {
    setOpenaiApiKey(tempKey);
    setIsEditing(false);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved and will be used across all tools.",
    });
  };

  const handleEdit = () => {
    setTempKey(openaiApiKey);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempKey("");
    setIsEditing(false);
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
          <Key className="h-5 w-5" />
          OpenAI API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing && openaiApiKey ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">API Key Configured</span>
              </div>
              <div className="text-xs text-gray-600">
                {showKey ? openaiApiKey : "sk-" + "•".repeat(20)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
                className="h-6 w-6 p-0"
              >
                {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              Edit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="openai-key" className="text-sm font-medium text-blue-800">
                OpenAI API Key
              </Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!tempKey.trim()} size="sm">
                Save Key
              </Button>
              {openaiApiKey && (
                <Button variant="outline" onClick={handleCancel} size="sm">
                  Cancel
                </Button>
              )}
            </div>
            <p className="text-xs text-blue-600">
              Your API key is stored locally and will be used across all AI-powered tools.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeyConfig;
