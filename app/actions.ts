"use server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { GoogleGenerativeAI } from "@google/generative-ai"

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

interface PageAnalysis {
  url: string
  title: string
  hasLogin: boolean
  hasSearch: boolean
  hasContactForm: boolean
  hasNewsletter: boolean
  hasChatbot: boolean
  hasFileUpload: boolean
  hasPaymentForm: boolean
  hasEcommerce: boolean
  hasVideoContent: boolean
  hasImageGallery: boolean
  hasSocialLogin: boolean
  hasComments: boolean
  forms: number
  links: number
  images: number
  interactiveElements: number
  navigationItems: string[]
  technologies: string[]
  content: string
}

interface SiteAnalysis {
  url: string
  pagesCrawled: number
  pages: PageAnalysis[]
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

interface AnalysisResult extends SiteAnalysis {
  userStories: UserStory[]
}

// Real website analysis using web scraping
async function analyzePage(url: string): Promise<PageAnalysis> {
  try {
    console.log(`Analyzing page: ${url}`)

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : "No title"

    // Analyze content for features
    const htmlLower = html.toLowerCase()
    const content = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    // Count elements
    const forms = (html.match(/<form[^>]*>/gi) || []).length
    const links = (html.match(/<a[^>]*href/gi) || []).length
    const images = (html.match(/<img[^>]*>/gi) || []).length

    // Interactive elements
    const buttons = (html.match(/<button[^>]*>/gi) || []).length
    const inputs = (html.match(/<input[^>]*>/gi) || []).length
    const selects = (html.match(/<select[^>]*>/gi) || []).length
    const textareas = (html.match(/<textarea[^>]*>/gi) || []).length
    const interactiveElements = buttons + inputs + selects + textareas

    // Extract navigation items
    const navMatches = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/gi) || []
    const navigationItems: string[] = []

    navMatches.forEach((nav) => {
      const linkMatches = nav.match(/<a[^>]*>([^<]+)<\/a>/gi) || []
      linkMatches.forEach((link) => {
        const textMatch = link.match(/>([^<]+)</i)
        if (textMatch && textMatch[1].trim()) {
          navigationItems.push(textMatch[1].trim())
        }
      })
    })

    // Detect technologies
    const technologies: string[] = []
    if (htmlLower.includes("react")) technologies.push("React")
    if (htmlLower.includes("next.js") || htmlLower.includes("nextjs")) technologies.push("Next.js")
    if (htmlLower.includes("vue")) technologies.push("Vue.js")
    if (htmlLower.includes("angular")) technologies.push("Angular")
    if (htmlLower.includes("jquery")) technologies.push("jQuery")
    if (htmlLower.includes("bootstrap")) technologies.push("Bootstrap")
    if (htmlLower.includes("tailwind")) technologies.push("Tailwind CSS")
    if (htmlLower.includes("wordpress")) technologies.push("WordPress")

    // Feature detection with more specific patterns
    const hasLogin =
      /login|sign\s*in|log\s*in|signin|authentication|auth/i.test(html) &&
      (html.includes("password") || html.includes("username") || html.includes("email"))

    const hasSearch = /search|<input[^>]*type=["']search|<input[^>]*placeholder[^>]*search/i.test(html)

    const hasContactForm = /contact.*form|form.*contact|<form[^>]*contact|name.*email.*message/i.test(html) && forms > 0

    const hasNewsletter = /newsletter|subscribe|signup.*email|email.*signup/i.test(html)

    const hasChatbot = /chat|bot|support.*chat|live.*chat|intercom|zendesk/i.test(html)

    const hasFileUpload = /<input[^>]*type=["']file/i.test(html)

    const hasPaymentForm = /payment|checkout|credit.*card|paypal|stripe|billing/i.test(html)

    const hasEcommerce = /shop|store|cart|product|buy|purchase|price|\$\d+|add.*to.*cart/i.test(html)

    const hasVideoContent = /<video|youtube|vimeo|embed.*video/i.test(html)

    const hasImageGallery = /gallery|portfolio|<img[^>]*gallery|lightbox/i.test(html) && images > 5

    const hasSocialLogin = /facebook.*login|google.*login|twitter.*login|github.*login|oauth/i.test(html)

    const hasComments = /comment|reply|discussion|disqus/i.test(html)

    return {
      url,
      title,
      hasLogin,
      hasSearch,
      hasContactForm,
      hasNewsletter,
      hasChatbot,
      hasFileUpload,
      hasPaymentForm,
      hasEcommerce,
      hasVideoContent,
      hasImageGallery,
      hasSocialLogin,
      hasComments,
      forms,
      links,
      images,
      interactiveElements,
      navigationItems,
      technologies,
      content: content.substring(0, 1000), // First 1000 chars for context
    }
  } catch (error) {
    console.error(`Error analyzing ${url}:`, error)
    // Return minimal analysis on error
    return {
      url,
      title: "Error loading page",
      hasLogin: false,
      hasSearch: false,
      hasContactForm: false,
      hasNewsletter: false,
      hasChatbot: false,
      hasFileUpload: false,
      hasPaymentForm: false,
      hasEcommerce: false,
      hasVideoContent: false,
      hasImageGallery: false,
      hasSocialLogin: false,
      hasComments: false,
      forms: 0,
      links: 0,
      images: 0,
      interactiveElements: 0,
      navigationItems: [],
      technologies: [],
      content: "",
    }
  }
}

// Discover additional pages to analyze
async function discoverPages(baseUrl: string, mainPageHtml: string): Promise<string[]> {
  const pages = new Set<string>([baseUrl])

  try {
    const domain = new URL(baseUrl).origin

    // Extract links from main page
    const linkMatches = mainPageHtml.match(/<a[^>]*href=["']([^"']+)["']/gi) || []

    for (const linkMatch of linkMatches) {
      const hrefMatch = linkMatch.match(/href=["']([^"']+)["']/i)
      if (hrefMatch) {
        let href = hrefMatch[1]

        // Convert relative URLs to absolute
        if (href.startsWith("/")) {
          href = domain + href
        } else if (href.startsWith("./")) {
          href = domain + href.substring(1)
        } else if (!href.startsWith("http")) {
          continue // Skip invalid URLs
        }

        // Only include pages from the same domain
        if (href.startsWith(domain)) {
          // Filter out common non-page URLs
          if (
            !href.includes("#") &&
            !href.includes("mailto:") &&
            !href.includes("tel:") &&
            !href.includes(".pdf") &&
            !href.includes(".jpg") &&
            !href.includes(".png") &&
            !href.includes(".gif")
          ) {
            pages.add(href)
          }
        }
      }
    }
  } catch (error) {
    console.error("Error discovering pages:", error)
  }

  // Limit to first 5 pages to avoid overwhelming the analysis
  return Array.from(pages).slice(0, 5)
}

// Perform comprehensive site analysis
async function performSiteAnalysis(url: string): Promise<SiteAnalysis> {
  console.log(`Starting comprehensive analysis of: ${url}`)

  // Analyze main page first
  const mainPage = await analyzePage(url)

  // Get the HTML for page discovery
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })
  const mainPageHtml = await response.text()

  // Discover additional pages
  const discoveredUrls = await discoverPages(url, mainPageHtml)
  console.log(`Discovered ${discoveredUrls.length} pages to analyze:`, discoveredUrls)

  // Analyze all discovered pages
  const pages: PageAnalysis[] = []
  for (const pageUrl of discoveredUrls) {
    if (pageUrl !== url) {
      // Skip main page as we already analyzed it
      const pageAnalysis = await analyzePage(pageUrl)
      pages.push(pageAnalysis)
      // Add delay to be respectful to the server
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  // Include main page
  pages.unshift(mainPage)

  // Aggregate features across all pages
  const aggregatedFeatures = {
    hasLogin: pages.some((p) => p.hasLogin),
    hasSearch: pages.some((p) => p.hasSearch),
    hasEcommerce: pages.some((p) => p.hasEcommerce),
    hasContactForm: pages.some((p) => p.hasContactForm),
    hasNewsletter: pages.some((p) => p.hasNewsletter),
    hasChatbot: pages.some((p) => p.hasChatbot),
    hasFileUpload: pages.some((p) => p.hasFileUpload),
    hasPaymentForm: pages.some((p) => p.hasPaymentForm),
    hasUserDashboard: false, // Would need authenticated analysis
    hasMultiLanguage: false, // Would need deeper analysis
    hasCookieConsent: mainPageHtml.toLowerCase().includes("cookie"),
    hasVideoContent: pages.some((p) => p.hasVideoContent),
    hasImageGallery: pages.some((p) => p.hasImageGallery),
    hasSocialLogin: pages.some((p) => p.hasSocialLogin),
    hasComments: pages.some((p) => p.hasComments),
  }

  // Aggregate structure data
  const totalForms = pages.reduce((sum, p) => sum + p.forms, 0)
  const totalLinks = pages.reduce((sum, p) => sum + p.links, 0)
  const totalImages = pages.reduce((sum, p) => sum + p.images, 0)
  const totalInteractive = pages.reduce((sum, p) => sum + p.interactiveElements, 0)

  // Get unique technologies
  const allTechnologies = new Set<string>()
  pages.forEach((p) => p.technologies.forEach((tech) => allTechnologies.add(tech)))

  // Get unique navigation items
  const allNavItems = new Set<string>()
  pages.forEach((p) => p.navigationItems.forEach((item) => allNavItems.add(item)))

  // Determine page types based on content
  const pageTypes = new Set<string>()
  pages.forEach((page) => {
    if (page.url === url) pageTypes.add("Homepage")
    if (page.hasContactForm) pageTypes.add("Contact Page")
    if (page.hasEcommerce) pageTypes.add("Product/Shop Page")
    if (page.title.toLowerCase().includes("about")) pageTypes.add("About Page")
    if (page.title.toLowerCase().includes("service")) pageTypes.add("Services Page")
    if (page.title.toLowerCase().includes("blog")) pageTypes.add("Blog Page")
    if (page.hasImageGallery) pageTypes.add("Gallery Page")
  })

  return {
    url,
    pagesCrawled: pages.length,
    pages,
    siteStructure: {
      forms: totalForms,
      links: totalLinks,
      images: totalImages,
      interactiveElements: totalInteractive,
    },
    technologies: Array.from(allTechnologies),
    detectedFeatures: aggregatedFeatures,
    pageTypes: Array.from(pageTypes),
    navigationStructure: {
      mainMenuItems: Array.from(allNavItems),
      footerLinks: [], // Would need more sophisticated extraction
      breadcrumbs: mainPageHtml.includes("breadcrumb"),
    },
    testUrls: discoveredUrls,
  }
}

// Utility function for exponential backoff delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Generate AI-powered user stories using Google Gemini with retry logic
async function generateAIUserStories(analysis: SiteAnalysis, apiKey: string): Promise<UserStory[]> {
  if (!apiKey) {
    throw new Error("Google Gemini API key is required")
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const detectedFeaturesList = Object.entries(analysis.detectedFeatures)
    .filter(([_, value]) => value)
    .map(([key, _]) => key.replace("has", ""))
    .join(", ")

  // Create detailed page summaries for context
  const pageSummaries = analysis.pages
    .map((page) => `- ${page.url}: "${page.title}" (${page.forms} forms, ${page.links} links, ${page.images} images)`)
    .join("\n")

  const prompt = `
You are an expert QA testing consultant. Based on the REAL website analysis below, generate comprehensive user stories and testing scenarios.

ACTUAL WEBSITE ANALYSIS:
- URL: ${analysis.url}
- Pages Analyzed: ${analysis.pagesCrawled}
- Detected Features: ${detectedFeaturesList || "None detected"}
- Technologies Found: ${analysis.technologies.join(", ") || "None detected"}
- Navigation Items: ${analysis.navigationStructure.mainMenuItems.join(", ") || "None found"}

PAGES ANALYZED:
${pageSummaries}

SITE STRUCTURE:
- Total Forms: ${analysis.siteStructure.forms}
- Total Links: ${analysis.siteStructure.links}
- Total Images: ${analysis.siteStructure.images}
- Interactive Elements: ${analysis.siteStructure.interactiveElements}

TEST URLS TO USE:
${analysis.testUrls.join("\n")}

IMPORTANT: Only generate scenarios for features that were ACTUALLY DETECTED. Do not create scenarios for login, ecommerce, or other features unless they were found in the analysis above.

REQUIREMENTS:
1. Generate 3-5 user stories based ONLY on detected features
2. Each user story must follow "AS [persona], I WANT [goal], SO THAT [benefit]" format
3. Each story should have 2-4 acceptance criteria in Gherkin "GIVEN, WHEN, THEN" format
4. Each story should have 1-3 testing scenarios with detailed steps including prerequisites
5. Use the actual URLs provided above in your test steps
6. Make personas realistic for this specific website
7. Focus on what was actually found, not assumptions

RESPONSE FORMAT (JSON):
{
  "userStories": [
    {
      "id": "story-001",
      "title": "AS [persona], I WANT [specific goal based on detected features], SO THAT [specific benefit]",
      "description": "Detailed description explaining why this story is important for this specific website",
      "persona": "Specific User Type",
      "priority": "high|medium|low",
      "acceptanceCriteria": [
        {
          "id": "ac-001-1",
          "description": "GIVEN [specific context], WHEN [specific action on actual URLs], THEN [specific expected result]",
          "testable": true
        }
      ],
      "scenarios": [
        {
          "id": "scenario-001",
          "category": "Relevant Category",
          "priority": "high|medium|low",
          "title": "Specific Test Scenario Name",
          "description": "What this scenario tests and why it's important for this website",
          "steps": [
            "Prerequisites: Specific setup requirements",
            "Step 1: Navigate to ${analysis.url}",
            "Step 2: Specific action based on detected features",
            "Step 3: Verification step using actual page content"
          ],
          "expectedOutcome": "Specific expected result based on actual website functionality"
        }
      ]
    }
  ]
}

ONLY generate scenarios for features that were actually detected: ${detectedFeaturesList || "basic navigation and content display"}
`

  // Retry configuration
  const maxRetries = 4
  const baseDelay = 2000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No valid JSON found in Gemini response")
      }

      const parsedResponse = JSON.parse(jsonMatch[0])
      return parsedResponse.userStories || []
    } catch (error) {
      console.error(`Gemini API attempt ${attempt} failed:`, error)

      // Handle specific Gemini errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()

        // API key errors - don't retry
        if (
          errorMessage.includes("api_key_invalid") ||
          errorMessage.includes("api key") ||
          errorMessage.includes("invalid api key")
        ) {
          throw new Error("Invalid Google Gemini API key. Please check your API key and try again.")
        }

        // Quota errors - don't retry
        if (errorMessage.includes("quota_exceeded") || errorMessage.includes("quota")) {
          throw new Error("Google Gemini API quota exceeded. Please check your usage limits.")
        }

        // Rate limit errors - retry with backoff
        if (errorMessage.includes("rate_limit_exceeded") || errorMessage.includes("rate limit")) {
          if (attempt < maxRetries) {
            const delayMs = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
            console.log(`Rate limited. Retrying in ${delayMs}ms... (Attempt ${attempt}/${maxRetries})`)
            await delay(delayMs)
            continue
          } else {
            throw new Error(
              "Google Gemini API rate limit exceeded after multiple retries. Please wait a few minutes and try again.",
            )
          }
        }

        // Model overloaded (503) - retry with longer backoff
        if (errorMessage.includes("overloaded") || errorMessage.includes("503")) {
          if (attempt < maxRetries) {
            const delayMs = baseDelay * Math.pow(3, attempt - 1) + Math.random() * 2000
            console.log(`Model overloaded. Retrying in ${delayMs}ms... (Attempt ${attempt}/${maxRetries})`)
            await delay(delayMs)
            continue
          } else {
            throw new Error(
              "Google Gemini model is currently overloaded after multiple retries. Please try again in a few minutes.",
            )
          }
        }

        // Server/network errors - retry
        if (
          errorMessage.includes("internal") ||
          errorMessage.includes("unavailable") ||
          errorMessage.includes("500") ||
          errorMessage.includes("502") ||
          errorMessage.includes("504") ||
          errorMessage.includes("fetch") ||
          errorMessage.includes("network")
        ) {
          if (attempt < maxRetries) {
            const delayMs = baseDelay * Math.pow(2, attempt - 1)
            console.log(`Server/network error. Retrying in ${delayMs}ms... (Attempt ${attempt}/${maxRetries})`)
            await delay(delayMs)
            continue
          } else {
            throw new Error("Google Gemini API server error after multiple retries. Please try again later.")
          }
        }

        // JSON parsing errors - retry once in case of malformed response
        if (error instanceof SyntaxError && attempt < maxRetries) {
          console.log(`JSON parsing error. Retrying... (Attempt ${attempt}/${maxRetries})`)
          await delay(baseDelay * attempt)
          continue
        }
      }

      // For unknown errors, retry
      if (attempt < maxRetries) {
        console.log(`Unknown error. Retrying... (Attempt ${attempt}/${maxRetries})`)
        await delay(baseDelay * Math.pow(2, attempt - 1))
        continue
      } else {
        throw new Error(
          "Failed to generate user stories with Gemini after multiple retries. Please check your API key and try again.",
        )
      }
    }
  }

  throw new Error("Failed to generate user stories after all retry attempts.")
}

export async function analyzeSite(url: string, geminiApiKey?: string): Promise<AnalysisResult> {
  // Perform real site analysis
  const siteAnalysis = await performSiteAnalysis(url)

  let userStories: UserStory[] = []

  if (geminiApiKey) {
    try {
      // Generate AI-powered user stories based on actual analysis
      userStories = await generateAIUserStories(siteAnalysis, geminiApiKey)
    } catch (error) {
      console.error("AI generation failed:", error)
      throw error
    }
  } else {
    // Generate basic story based on actual detected features
    const detectedFeatures = Object.entries(siteAnalysis.detectedFeatures)
      .filter(([_, value]) => value)
      .map(([key, _]) => key.replace("has", ""))

    userStories = [
      {
        id: "story-001",
        title: "As a user, I want to navigate the website effectively, so that I can find the information I need",
        description: `Basic navigation and content testing for ${url}. ${detectedFeatures.length > 0 ? `Detected features: ${detectedFeatures.join(", ")}` : "No special features detected."} Provide a Google Gemini API key for AI-generated, site-specific scenarios.`,
        persona: "Website Visitor",
        priority: "high",
        acceptanceCriteria: [
          {
            id: "ac-001-1",
            description: `Given I am on ${url}, When I navigate through the site, Then I should be able to access all ${siteAnalysis.pagesCrawled} discovered pages`,
            testable: true,
          },
        ],
        scenarios: [
          {
            id: "nav-001",
            category: "Navigation",
            priority: "high",
            title: "Website Navigation Testing",
            description: `Test navigation across the ${siteAnalysis.pagesCrawled} discovered pages`,
            steps: [
              `Prerequisites: Open ${url} in a browser`,
              "Navigate through all discovered pages",
              "Verify all links work correctly",
              "Check page loading and content display",
            ],
            expectedOutcome: "All pages should load correctly and navigation should work without errors",
          },
        ],
      },
    ]
  }

  return {
    ...siteAnalysis,
    userStories,
  }
}

export async function saveAcceptanceCriteria(userStories: UserStory[], url: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("Acceptance criteria saved for:", url)
  console.log(JSON.stringify(userStories, null, 2))
}

export async function checkGherkinFileExists(scenarioId: string, scenarioTitle: string): Promise<boolean> {
  try {
    const { access } = await import("fs/promises")
    const { join } = await import("path")

    const gherkinDir = join(process.cwd(), "gherkin-scenarios")
    const filename = `${scenarioId}-${scenarioTitle.toLowerCase().replace(/\s+/g, "-")}.feature`
    const filePath = join(gherkinDir, filename)

    await access(filePath)
    return true
  } catch {
    return false
  }
}

export async function generateScenarioGherkin(
  scenario: TestingScenario,
  storyTitle: string,
  url: string,
): Promise<void> {
  const gherkinDir = join(process.cwd(), "gherkin-scenarios")
  await mkdir(gherkinDir, { recursive: true })

  const gherkinContent = `Feature: ${scenario.category} - ${scenario.title}

Background:
  Given I am testing the website "${url}"
  And I am acting as the user persona for this scenario

Scenario: ${scenario.title}
  # ${scenario.description}
  
  # Test Steps (convert to Gherkin format):
${scenario.steps.map((step, index) => `  # Step ${index + 1}: ${step}`).join("\n")}
  
  # Expected Outcome:
  # ${scenario.expectedOutcome}
  
  # TODO: Convert the above steps into proper Gherkin Given/When/Then format
  # Example structure:
  Given I am on the homepage
  When I click on the navigation menu
  Then I should see all menu items clearly labeled
  And the navigation should work without errors

@${scenario.category.toLowerCase().replace(/\s+/g, "-")}
@${scenario.priority}-priority
Scenario Outline: ${scenario.title} - Cross Browser Testing
  Given I am using "<browser>" browser
  When I perform the test steps for "${scenario.title}"
  Then the expected outcome should be achieved
  
  Examples:
    | browser |
    | chrome  |
    | firefox |
    | safari  |
`

  const filename = `${scenario.id}-${scenario.title.toLowerCase().replace(/\s+/g, "-")}.feature`
  await writeFile(join(gherkinDir, filename), gherkinContent)
}
