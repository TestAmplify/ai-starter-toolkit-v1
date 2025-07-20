
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, ArrowLeft, Copy, RefreshCw, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ColorPalette {
  name: string;
  colors: string[];
  description: string;
}

const Colors = () => {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const predefinedPalettes: ColorPalette[] = [
    {
      name: "Ocean Breeze",
      colors: ["#0D92F4", "#77CDFF", "#F95454", "#C62E2E", "#FFFFFF"],
      description: "Cool and refreshing blues with vibrant red accents"
    },
    {
      name: "Sunset Vibes",
      colors: ["#FF6B35", "#F7931E", "#FFD23F", "#06FFA5", "#4D4D4D"],
      description: "Warm oranges and yellows with a pop of green"
    },
    {
      name: "Forest Deep",
      colors: ["#2D5A27", "#40826D", "#95D5B2", "#F1FAEE", "#1D3557"],
      description: "Natural greens with soft white and deep navy"
    },
    {
      name: "Purple Dreams",
      colors: ["#7209B7", "#A663CC", "#4CC9F0", "#7209B7", "#F72585"],
      description: "Vibrant purples and blues with a splash of pink"
    },
    {
      name: "Minimalist",
      colors: ["#2C3E50", "#34495E", "#95A5A6", "#BDC3C7", "#ECF0F1"],
      description: "Clean grays and blues for modern designs"
    },
    {
      name: "Autumn Leaves",
      colors: ["#8B4513", "#D2691E", "#CD853F", "#F4A460", "#FFF8DC"],
      description: "Warm browns and oranges inspired by fall"
    }
  ];

  // Simple color generator functions
  const generateRandomColor = () => {
    return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  };

  const generateComplementaryPalette = (baseColor: string) => {
    const colors = [baseColor];
    for (let i = 0; i < 4; i++) {
      colors.push(generateRandomColor());
    }
    return colors;
  };

  const generateRandomPalette = () => {
    setLoading(true);
    
    setTimeout(() => {
      const baseColor = generateRandomColor();
      const colors = generateComplementaryPalette(baseColor);
      
      const paletteNames = [
        "Random Harmony", "Creative Mix", "Color Burst", "Vibrant Blend",
        "Dynamic Combo", "Fresh Palette", "Bold Choice", "Unique Mix"
      ];
      
      const name = paletteNames[Math.floor(Math.random() * paletteNames.length)];
      
      setCurrentPalette({
        name,
        colors,
        description: "AI-generated random color palette"
      });
      
      setLoading(false);
    }, 800);
  };

  const selectPredefinedPalette = () => {
    const randomPalette = predefinedPalettes[Math.floor(Math.random() * predefinedPalettes.length)];
    setCurrentPalette(randomPalette);
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Copied!",
      description: `Color ${color} copied to clipboard`
    });
  };

  const copyPalette = () => {
    if (currentPalette) {
      const paletteText = currentPalette.colors.join(", ");
      navigator.clipboard.writeText(paletteText);
      toast({
        title: "Palette Copied!",
        description: "All colors copied to clipboard"
      });
    }
  };

  const exportPalette = () => {
    if (!currentPalette) return;
    
    const css = currentPalette.colors.map((color, index) => 
      `  --color-${index + 1}: ${color};`
    ).join('\n');
    
    const cssContent = `:root {\n${css}\n}`;
    
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPalette.name.toLowerCase().replace(/\s+/g, '-')}-palette.css`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported!",
      description: "Palette exported as CSS file"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-orange-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Color Generator
              </h1>
            </div>
          </div>

          {/* Control Panel */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Generate Color Palettes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={generateRandomPalette}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Random Palette
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={selectPredefinedPalette}
                  variant="outline"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Curated Palette
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Palette Display */}
          {currentPalette && (
            <Card className="border-0 shadow-xl mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentPalette.name}</CardTitle>
                    <p className="text-gray-600 mt-1">{currentPalette.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={copyPalette}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy All
                    </Button>
                    <Button
                      onClick={exportPalette}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSS
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {currentPalette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="group cursor-pointer"
                      onClick={() => copyColor(color)}
                    >
                      <div
                        className="w-full h-32 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-center">
                        <p className="font-mono text-sm font-semibold text-gray-800">
                          {color.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Click to copy
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sample Palettes */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Sample Palettes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predefinedPalettes.map((palette, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer"
                    onClick={() => setCurrentPalette(palette)}
                  >
                    <div className="p-4 border rounded-lg group-hover:shadow-lg transition-shadow duration-300">
                      <h3 className="font-semibold text-gray-800 mb-2">{palette.name}</h3>
                      <div className="flex gap-1 mb-3 h-8">
                        {palette.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="flex-1 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">{palette.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-800 mb-2">🎨 How to use</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Click on any color to copy its hex code</li>
                <li>• Use "Copy All" to get all colors at once</li>
                <li>• Export as CSS file for web development</li>
                <li>• Generate random palettes for inspiration</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Colors;
