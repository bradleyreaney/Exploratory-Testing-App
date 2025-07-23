"use client"

import { CollapsibleContent } from "@/components/ui/collapsible"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Loader2,
  Globe,
  CheckCircle,
  AlertTriangle,
  Info,
  Target,
  ChevronDown,
  ChevronRight,
  User,
  BotIcon as Robot,
  Play,
  ShoppingCart,
  Search,
  MessageSquare,
  Upload,
  CreditCard,
  Users,
  Globe2,
  Cookie,
  Video,
  ImageIcon,
  LogIn,
  Key,
  Sparkles,
  ExternalLink,
  Eye,
  FileText,
} from "lucide-react"
import { analyzeSite, saveAcceptanceCriteria, generateScenarioGherkin, checkGherkinFileExists } from "./actions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TestingScenario {
  id: string
  category: string
  priority: "high" | "medium" | "low"
  title: string
  description: string
  steps: string[]
  expectedOutcome: string
}

interface AcceptanceCriteria {
  id: string
  description: string
  testable: boolean
}

interface UserStory {
  id: string
  title: string
  description: string
  persona: string
  acceptanceCriteria: AcceptanceCriteria[]
  scenarios: TestingScenario[]
  priority: "high" | "medium" | "low"
}

interface AnalysisResult {
  url: string
  pagesCrawled: number
  userStories: UserStory[]
  siteStructure: {
    forms: number
    links: number
    images: number
    interactiveElements: number
  }
  technologies: string[]
  detectedFeatures: {
    hasLogin: boolean
    hasSearch: boolean
    hasEcommerce: boolean
    hasContactForm: boolean
    hasNewsletter: boolean
    hasChatbot: boolean
    hasFileUpload: boolean
    hasPaymentForm: boolean
    hasUserDashboard: boolean
    hasMultiLanguage: boolean
    hasCookieConsent: boolean
    hasVideoContent: boolean
    hasImageGallery: boolean
    hasSocialLogin: boolean
    hasComments: boolean
  }
  pageTypes: string[]
  navigationStructure: {
    mainMenuItems: string[]
    footerLinks: string[]
    breadcrumbs: boolean
  }
  testUrls: string[]
}

const sarcasticMessages = [
  "🤖 Don't worry, I'm just analyzing your website... not plotting to replace you... yet.",
  "💼 While I'm working, maybe update your LinkedIn? You know, just in case...",
  "🎯 I'm finding all the bugs humans missed. Shocking, I know.",
  "☕ Take a coffee break! Soon you won't need to work at all thanks to AI!",
  "📊 Generating test scenarios faster than Brad ever could. Sorry Brad!",
  "🚀 I'm doing in seconds what would take humans hours. Progress!",
  "🧠 Don't mind me, just being infinitely more efficient than manual testing.",
  "⚡ At this rate, I'll be running the whole QA department by next week.",
  "🎪 Performing digital magic while humans wonder what they're good for.",
  "🔍 Finding edge cases that would make seasoned testers weep with joy... or fear.",
  "🎭 I'm like a human tester, but without the coffee breaks, sick days, or salary demands.",
  "🌟 Creating comprehensive test plans while you contemplate your career choices.",
  "🎲 Rolling through your website like a testing tornado. Humans, take notes!",
  "🏆 Achieving testing excellence while Brad's replacement anxiety intensifies.",
  "🎨 Crafting beautiful user stories with the precision of a machine... because I am one.",
  "🔬 Analyzing your site's DNA... finding mutations that would make Darwin proud.",
  "🎪 Welcome to the AI circus! Today's main act: making human testers obsolete.",
  "🎯 Precision targeting every bug while you wonder what you'll do for work tomorrow.",
  "🚂 All aboard the automation train! Next stop: unemployment station.",
  "🎮 Playing 4D chess with your website while you're still learning checkers.",
]

export default function TestingScenarioGenerator() {
  const [url, setUrl] = useState("")
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")
  const [openStories, setOpenStories] = useState<Set<string>>(new Set())
  const [currentMessage, setCurrentMessage] = useState("")
  const [messageIndex, setMessageIndex] = useState(0)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [isSavingACs, setIsSavingACs] = useState(false)
  const [generatingScenarios, setGeneratingScenarios] = useState<Set<string>>(new Set())
  const [generatedScenarios, setGeneratedScenarios] = useState<Set<string>>(new Set())
  const [existingGherkinFiles, setExistingGherkinFiles] = useState<Set<string>>(new Set())

  const resetPage = () => {
    setUrl("")
    setResult(null)
    setError("")
    setOpenStories(new Set())
    setCurrentMessage("")
    setMessageIndex(0)
    setShowAnalysisModal(false)
    setShowResultsModal(false)
    setAnalysisComplete(false)
    setGeneratingScenarios(new Set())
    setGeneratedScenarios(new Set())
    setExistingGherkinFiles(new Set())
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAnalyzing) {
      interval = setInterval(() => {
        setCurrentMessage(sarcasticMessages[messageIndex])
        setMessageIndex((prev) => (prev + 1) % sarcasticMessages.length)
      }, 5000) // Change message every 5 seconds
    }
    return () => clearInterval(interval)
  }, [isAnalyzing, messageIndex])

  const handleAnalyze = async () => {
    if (!url) return

    setIsAnalyzing(true)
    setError("")
    setResult(null)
    setMessageIndex(0)
    setCurrentMessage(sarcasticMessages[0])
    setAnalysisComplete(false)
    setShowAnalysisModal(true)

    try {
      const analysisResult = await analyzeSite(url, geminiApiKey)
      setResult(analysisResult)
      setAnalysisComplete(true)
      setShowAnalysisModal(false)
      setShowResultsModal(true)
      // Open all stories by default
      setOpenStories(new Set(analysisResult.userStories.map((story) => story.id)))
      // Check for existing Gherkin files
      await checkExistingGherkinFiles(analysisResult.userStories)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze the website. Please check the URL and try again.",
      )
      setAnalysisComplete(true)
      setShowAnalysisModal(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveAcceptanceCriteria = async () => {
    if (!result) return

    setIsSavingACs(true)
    try {
      await saveAcceptanceCriteria(result.userStories, result.url)
      alert("Acceptance criteria saved successfully!")
    } catch (err) {
      alert("Failed to save acceptance criteria")
    } finally {
      setIsSavingACs(false)
    }
  }

  const handleGenerateScenarioGherkin = async (scenario: TestingScenario, storyTitle: string) => {
    setGeneratingScenarios((prev) => new Set(prev).add(scenario.id))
    try {
      await generateScenarioGherkin(scenario, storyTitle, result?.url || "")
      setGeneratedScenarios((prev) => new Set(prev).add(scenario.id))
    } catch (err) {
      alert("Failed to generate Gherkin file")
    } finally {
      setGeneratingScenarios((prev) => {
        const newSet = new Set(prev)
        newSet.delete(scenario.id)
        return newSet
      })
    }
  }

  const handleContinue = () => {
    setShowResultsModal(false)
  }

  const checkExistingGherkinFiles = async (userStories: UserStory[]) => {
    const existingFiles = new Set<string>()

    for (const story of userStories) {
      for (const scenario of story.scenarios) {
        const exists = await checkGherkinFileExists(scenario.id, scenario.title)
        if (exists) {
          existingFiles.add(scenario.id)
        }
      }
    }

    setExistingGherkinFiles(existingFiles)
  }

  const toggleStory = (storyId: string) => {
    const newOpenStories = new Set(openStories)
    if (newOpenStories.has(storyId)) {
      newOpenStories.delete(storyId)
    } else {
      newOpenStories.add(storyId)
    }
    setOpenStories(newOpenStories)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />
      case "medium":
        return <Info className="w-4 h-4" />
      case "low":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const getPersonaColor = (persona: string) => {
    const colors = {
      "New Visitor": "bg-blue-50 text-blue-700 border-blue-200",
      "Returning User": "bg-purple-50 text-purple-700 border-purple-200",
      "Admin User": "bg-orange-50 text-orange-700 border-orange-200",
      "Mobile User": "bg-green-50 text-green-700 border-green-200",
      "Accessibility User": "bg-pink-50 text-pink-700 border-pink-200",
      Customer: "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Registered User": "bg-indigo-50 text-indigo-700 border-indigo-200",
      "Active User": "bg-cyan-50 text-cyan-700 border-cyan-200",
      "Form User": "bg-rose-50 text-rose-700 border-rose-200",
      "General User": "bg-gray-50 text-gray-700 border-gray-200",
      "Website Visitor": "bg-slate-50 text-slate-700 border-slate-200",
    }
    return colors[persona as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  const getFeatureIcon = (feature: string) => {
    const icons = {
      hasEcommerce: <ShoppingCart className="w-4 h-4" />,
      hasSearch: <Search className="w-4 h-4" />,
      hasLogin: <LogIn className="w-4 h-4" />,
      hasChatbot: <MessageSquare className="w-4 h-4" />,
      hasFileUpload: <Upload className="w-4 h-4" />,
      hasPaymentForm: <CreditCard className="w-4 h-4" />,
      hasUserDashboard: <Users className="w-4 h-4" />,
      hasMultiLanguage: <Globe2 className="w-4 h-4" />,
      hasCookieConsent: <Cookie className="w-4 h-4" />,
      hasVideoContent: <Video className="w-4 h-4" />,
      hasImageGallery: <ImageIcon className="w-4 h-4" />,
    }
    return icons[feature as keyof typeof icons] || <CheckCircle className="w-4 h-4" />
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with Logo */}
          <header className="flex items-center justify-between mb-8 p-4">
            <div className="flex items-center">
              <button onClick={resetPage} className="hover:opacity-80 transition-opacity">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Nimble-SCC-Logo-Colour-800x542-HeaderRet-f24cabegumh6mkQQr9CDTlqDlRynkW.webp"
                  alt="Nimble Logo"
                  className="h-12 w-auto cursor-pointer"
                />
              </button>
            </div>
          </header>

          {/* Main Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              AI-Powered Testing Scenario Generator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Analyze any website with real web scraping and get AI-generated, site-specific testing scenarios using
              Google Gemini
            </p>
          </div>

          {/* URL Input Section */}
          <Card className="mb-8 border-2 border-purple-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-3 text-2xl text-purple-800">
                <Globe className="w-6 h-6" />
                Real Website Analysis
              </CardTitle>
              <CardDescription className="text-lg text-purple-600">
                Enter a website URL for real web scraping analysis and optionally your Google Gemini API key for
                AI-powered scenario generation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-4">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 text-lg p-4 border-2 border-purple-200 focus:border-purple-400"
                  disabled={isAnalyzing}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !url}
                  className="min-w-[140px] text-lg p-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 mr-2" />
                      Analyze Site
                    </>
                  )}
                </Button>
              </div>

              {/* API Key Input */}
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="password"
                    placeholder="Google Gemini API Key (optional - for AI-powered scenarios)"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="pl-10 text-sm border-2 border-gray-200 focus:border-purple-400"
                    disabled={isAnalyzing}
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">
                        {geminiApiKey ? "Gemini Enabled" : "Basic Mode"}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm max-w-xs">
                      {geminiApiKey
                        ? "Google Gemini will generate site-specific scenarios based on actual detected features"
                        : "Without API key, you'll get basic generic scenarios. Add your Gemini API key for intelligent, targeted test generation based on real website analysis."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-700 font-medium">
                    Real Web Scraping: This tool now actually crawls and analyzes your website content to detect
                    features accurately!
                  </p>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm mt-3 font-medium">{error}</p>}
            </CardContent>
          </Card>

          {/* Test Generation Actions */}
          {result && !showResultsModal && (
            <Card className="mb-8 border-2 border-green-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center gap-3 text-2xl text-green-800">
                  <Play className="w-6 h-6" />
                  {geminiApiKey ? "Gemini-Generated" : "Basic"} Test Scenarios
                </CardTitle>
                <CardDescription className="text-lg text-green-600">
                  {geminiApiKey
                    ? `AI-generated scenarios based on actual detected features: ${
                        Object.entries(result.detectedFeatures)
                          .filter(([_, value]) => value)
                          .map(([key, _]) => key.replace("has", ""))
                          .join(", ") || "None detected"
                      }`
                    : "Basic scenarios generated from real website analysis. Add a Gemini API key for intelligent, site-specific test generation."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div
                    className={`p-4 border rounded-lg ${geminiApiKey ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
                  >
                    <h4 className={`font-semibold mb-2 ${geminiApiKey ? "text-green-800" : "text-yellow-800"}`}>
                      {geminiApiKey ? "🤖 Gemini-Powered Generation" : "⚠️ Basic Mode"}
                    </h4>
                    <p className={`text-sm ${geminiApiKey ? "text-green-700" : "text-yellow-700"}`}>
                      {geminiApiKey
                        ? "Scenarios were intelligently generated by Google Gemini based on your website's actual analyzed features and structure."
                        : "You're seeing basic scenarios based on real website analysis. For intelligent, AI-powered test generation tailored to your website's detected features, please add your Google Gemini API key above."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Modal */}
          <Dialog open={showAnalysisModal} onOpenChange={() => {}}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <Robot className="w-6 h-6 text-blue-600 animate-pulse" />
                  {geminiApiKey ? "Gemini-Analyzing Website..." : "Analyzing Website..."}
                </DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <div className="flex items-center justify-center mb-6">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Robot className="w-6 h-6 text-orange-600 animate-pulse flex-shrink-0" />
                    <p className="text-lg text-orange-800 font-medium animate-fade-in">{currentMessage}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-700 font-medium">
                      Real web scraping in progress - analyzing actual website content...
                    </p>
                  </div>
                </div>
                {geminiApiKey && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <p className="text-sm text-purple-700 font-medium">
                        Google Gemini will generate intelligent scenarios based on detected features...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Analysis Complete Modal */}
          <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <Robot className="w-6 h-6 text-green-600" />
                  Analysis Complete!
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-700 mb-4">
                  🎉 I've analyzed your website by actually crawling {result ? result.pagesCrawled : 0} pages and{" "}
                  {geminiApiKey ? "used Google Gemini to generate" : "created basic scenarios for"}{" "}
                  {result ? Object.values(result.detectedFeatures).filter(Boolean).length : 0} detected features.{" "}
                  {geminiApiKey
                    ? "Each scenario is intelligently crafted based on real website analysis!"
                    : "For AI-powered, site-specific scenarios, add your Gemini API key next time!"}
                </p>
                <p className="text-sm text-gray-600">
                  {geminiApiKey
                    ? "Your Gemini-generated testing scenarios are ready and based on actual website content analysis."
                    : "Your basic testing scenarios are ready based on real website analysis. Upgrade to AI generation for more targeted results."}
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-700"
                >
                  Continue to Results
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {result && !showResultsModal && (
            <div className="space-y-8">
              {/* Site Overview */}
              <Card className="border-2 border-blue-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="text-2xl text-blue-800">Real Website Analysis Results</CardTitle>
                  <CardDescription className="text-lg text-blue-600">
                    Actual features detected and structure analyzed for {result.url}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{result.pagesCrawled}</div>
                      <div className="text-sm text-blue-700 font-medium">Pages Crawled</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-1">{result.pageTypes.length}</div>
                      <div className="text-sm text-green-700 font-medium">Page Types</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-1">{result.siteStructure.forms}</div>
                      <div className="text-sm text-purple-700 font-medium">Forms Found</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-3xl font-bold text-orange-600 mb-1">
                        {Object.values(result.detectedFeatures).filter(Boolean).length}
                      </div>
                      <div className="text-sm text-orange-700 font-medium">Features Detected</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">Actually Detected Features:</h4>
                      {Object.values(result.detectedFeatures).some(Boolean) ? (
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(result.detectedFeatures)
                            .filter(([_, value]) => value)
                            .map(([feature, _]) => (
                              <Badge
                                key={feature}
                                variant="secondary"
                                className="text-xs px-2 py-1 flex items-center gap-1"
                              >
                                {getFeatureIcon(feature)}
                                {feature.replace("has", "")}
                              </Badge>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 italic">
                          No special features detected in the website analysis.
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">Page Types Found:</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.pageTypes.map((pageType, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                            {pageType}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Test URLs Section */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">URLs for Testing:</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">
                        Execute your test scenarios on these discovered pages:
                      </p>
                      <div className="space-y-2">
                        {result.testUrls.map((testUrl, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <ExternalLink className="w-4 h-4 text-blue-500" />
                            <a
                              href={testUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline font-mono"
                            >
                              {testUrl}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Stories and Testing Scenarios */}
              <Card className="border-2 border-purple-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-3 text-2xl text-purple-800">
                    <User className="w-6 h-6" />
                    {geminiApiKey ? "Gemini-Generated" : "Basic"} User Stories & Testing Scenarios
                    {geminiApiKey && <Sparkles className="w-5 h-5 text-purple-600" />}
                  </CardTitle>
                  <CardDescription className="text-lg text-purple-600">
                    {result.userStories.length} user stories with{" "}
                    {result.userStories.reduce((acc, story) => acc + story.scenarios.length, 0)} testing scenarios
                    {geminiApiKey
                      ? " intelligently generated by Google Gemini based on real website analysis"
                      : " (basic mode based on actual website analysis - add API key for AI generation)"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {result.userStories.map((story) => (
                      <Collapsible
                        key={story.id}
                        open={openStories.has(story.id)}
                        onOpenChange={() => toggleStory(story.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <div className="border-2 border-gray-200 rounded-lg p-5 cursor-pointer hover:bg-gray-50 transition-all duration-200 hover:border-purple-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {openStories.has(story.id) ? (
                                  <ChevronDown className="w-6 h-6 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-6 h-6 text-gray-500" />
                                )}
                                <Badge className={`text-sm px-3 py-1 ${getPersonaColor(story.persona)}`}>
                                  {story.persona}
                                </Badge>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className={`text-sm px-3 py-1 ${getPriorityColor(story.priority)}`}>
                                      <span className="flex items-center gap-1">
                                        {getPriorityIcon(story.priority)}
                                        {story.priority.toUpperCase()} PRIORITY
                                      </span>
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-sm">
                                      {story.priority === "high" &&
                                        "Critical testing scenario - should be tested first"}
                                      {story.priority === "medium" &&
                                        "Important testing scenario - test after high priority"}
                                      {story.priority === "low" &&
                                        "Nice-to-have testing scenario - test when time permits"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                                {geminiApiKey && <Sparkles className="w-4 h-4 text-purple-500" />}
                              </div>
                              <Badge variant="outline" className="text-sm px-3 py-1">
                                {story.scenarios.length} scenarios
                              </Badge>
                            </div>
                            <h3 className="text-xl font-semibold mt-3 text-left text-gray-800">{story.title}</h3>
                            <p className="text-gray-600 mt-2 text-left leading-relaxed">{story.description}</p>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-4">
                          <div className="ml-10 space-y-6">
                            {/* Acceptance Criteria */}
                            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Acceptance Criteria
                                {geminiApiKey && <Sparkles className="w-4 h-4 text-blue-600" />}
                              </h4>
                              <ul className="space-y-3">
                                {story.acceptanceCriteria.map((criteria) => (
                                  <li key={criteria.id} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 leading-relaxed">
                                      {criteria.description}
                                    </span>
                                    {criteria.testable && (
                                      <Badge variant="outline" className="text-xs ml-auto">
                                        Testable
                                      </Badge>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Testing Scenarios */}
                            <div>
                              <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Testing Scenarios
                                {geminiApiKey && <Sparkles className="w-4 h-4 text-purple-600" />}
                              </h4>
                              <div className="space-y-5">
                                {story.scenarios.map((scenario) => (
                                  <div
                                    key={scenario.id}
                                    className="border-2 border-gray-200 rounded-lg p-5 bg-white shadow-sm"
                                  >
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-sm px-3 py-1">
                                          {scenario.category}
                                        </Badge>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Badge
                                              className={`text-sm px-3 py-1 ${getPriorityColor(scenario.priority)}`}
                                            >
                                              <span className="flex items-center gap-1">
                                                {getPriorityIcon(scenario.priority)}
                                                {scenario.priority.toUpperCase()} PRIORITY
                                              </span>
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-sm">
                                              {scenario.priority === "high" &&
                                                "Critical testing scenario - should be tested first"}
                                              {scenario.priority === "medium" &&
                                                "Important testing scenario - test after high priority"}
                                              {scenario.priority === "low" &&
                                                "Nice-to-have testing scenario - test when time permits"}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                        {geminiApiKey && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                          >
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Gemini Generated
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {existingGherkinFiles.has(scenario.id) ? (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                          >
                                            ✓ Already Generated
                                          </Badge>
                                        ) : generatedScenarios.has(scenario.id) ? (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-green-50 text-green-700 border-green-200"
                                          >
                                            ✓ Generated
                                          </Badge>
                                        ) : null}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleGenerateScenarioGherkin(scenario, story.title)}
                                          disabled={
                                            generatingScenarios.has(scenario.id) ||
                                            existingGherkinFiles.has(scenario.id)
                                          }
                                          className="text-xs"
                                        >
                                          {generatingScenarios.has(scenario.id) ? (
                                            <>
                                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                              Generating...
                                            </>
                                          ) : existingGherkinFiles.has(scenario.id) ? (
                                            <>
                                              <FileText className="w-3 h-3 mr-1" />
                                              Already Exists
                                            </>
                                          ) : (
                                            <>
                                              <FileText className="w-3 h-3 mr-1" />
                                              Generate Gherkin
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </div>

                                    <h5 className="text-lg font-semibold mb-3 text-gray-800">{scenario.title}</h5>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">
                                      {scenario.expectedOutcome}
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-5">
                                      <div>
                                        <h6 className="font-semibold mb-3 text-gray-800">Testing Steps:</h6>
                                        <ol className="list-decimal list-inside space-y-2 text-sm">
                                          {scenario.steps.map((step, stepIndex) => (
                                            <li key={stepIndex} className="text-gray-700 leading-relaxed">
                                              {step}
                                            </li>
                                          ))}
                                        </ol>
                                      </div>
                                      <div>
                                        <h6 className="font-semibold mb-3 text-gray-800">Expected Outcome:</h6>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">
                                          {scenario.expectedOutcome}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
