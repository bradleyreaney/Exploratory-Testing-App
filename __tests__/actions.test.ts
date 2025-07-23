import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { analyzeSite, saveAcceptanceCriteria, checkGherkinFileExists, generateScenarioGherkin } from "../app/actions"
import { writeFile, mkdir, access } from "fs/promises"

// Mock fs/promises
vi.mock("fs/promises", () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  access: vi.fn(),
}))

// Mock path
vi.mock("path", () => ({
  join: vi.fn((...args) => args.join("/")),
}))

describe("analyzeSite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return analysis result with correct structure", async () => {
    const testUrl = "https://example.com"
    const result = await analyzeSite(testUrl)

    expect(result).toHaveProperty("url", testUrl)
    expect(result).toHaveProperty("pagesCrawled")
    expect(result).toHaveProperty("userStories")
    expect(result).toHaveProperty("siteStructure")
    expect(result).toHaveProperty("technologies")

    expect(typeof result.pagesCrawled).toBe("number")
    expect(Array.isArray(result.userStories)).toBe(true)
    expect(Array.isArray(result.technologies)).toBe(true)
  })

  it("should return user stories with correct structure", async () => {
    const result = await analyzeSite("https://test.com")

    expect(result.userStories.length).toBeGreaterThan(0)

    const firstStory = result.userStories[0]
    expect(firstStory).toHaveProperty("id")
    expect(firstStory).toHaveProperty("title")
    expect(firstStory).toHaveProperty("description")
    expect(firstStory).toHaveProperty("persona")
    expect(firstStory).toHaveProperty("acceptanceCriteria")
    expect(firstStory).toHaveProperty("scenarios")
    expect(firstStory).toHaveProperty("priority")

    expect(Array.isArray(firstStory.acceptanceCriteria)).toBe(true)
    expect(Array.isArray(firstStory.scenarios)).toBe(true)
    expect(["high", "medium", "low"]).toContain(firstStory.priority)
  })

  it("should return scenarios with prerequisites", async () => {
    const result = await analyzeSite("https://test.com")

    const firstScenario = result.userStories[0].scenarios[0]
    expect(firstScenario).toHaveProperty("steps")
    expect(Array.isArray(firstScenario.steps)).toBe(true)

    // Check that at least one step contains "Prerequisites"
    const hasPrerequisites = firstScenario.steps.some((step) => step.toLowerCase().includes("prerequisites"))
    expect(hasPrerequisites).toBe(true)
  })

  it("should return site structure with numeric values", async () => {
    const result = await analyzeSite("https://test.com")

    expect(typeof result.siteStructure.forms).toBe("number")
    expect(typeof result.siteStructure.links).toBe("number")
    expect(typeof result.siteStructure.images).toBe("number")
    expect(typeof result.siteStructure.interactiveElements).toBe("number")

    expect(result.siteStructure.forms).toBeGreaterThanOrEqual(1)
    expect(result.siteStructure.links).toBeGreaterThanOrEqual(20)
    expect(result.siteStructure.images).toBeGreaterThanOrEqual(10)
    expect(result.siteStructure.interactiveElements).toBeGreaterThanOrEqual(5)
  })
})

describe("saveAcceptanceCriteria", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.log to avoid output during tests
    vi.spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should complete without throwing errors", async () => {
    const mockUserStories = [
      {
        id: "story-001",
        title: "Test Story",
        description: "Test Description",
        persona: "Test User",
        acceptanceCriteria: [
          {
            id: "ac-001",
            description: "Test criteria",
            testable: true,
          },
        ],
        scenarios: [],
        priority: "high" as const,
      },
    ]

    await expect(saveAcceptanceCriteria(mockUserStories, "https://test.com")).resolves.not.toThrow()
  })

  it("should log the correct information", async () => {
    const mockUserStories = [
      {
        id: "story-001",
        title: "Test Story",
        description: "Test Description",
        persona: "Test User",
        acceptanceCriteria: [],
        scenarios: [],
        priority: "high" as const,
      },
    ]
    const testUrl = "https://test.com"

    await saveAcceptanceCriteria(mockUserStories, testUrl)

    expect(console.log).toHaveBeenCalledWith("Acceptance criteria saved for:", testUrl)
    expect(console.log).toHaveBeenCalledWith(JSON.stringify(mockUserStories, null, 2))
  })
})

describe("checkGherkinFileExists", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return true when file exists", async () => {
    const mockAccess = vi.mocked(access)
    mockAccess.mockResolvedValue(undefined)

    const result = await checkGherkinFileExists("test-001", "Test Scenario")

    expect(result).toBe(true)
    expect(mockAccess).toHaveBeenCalledWith("gherkin-scenarios/test-001-test-scenario.feature")
  })

  it("should return false when file does not exist", async () => {
    const mockAccess = vi.mocked(access)
    mockAccess.mockRejectedValue(new Error("File not found"))

    const result = await checkGherkinFileExists("test-001", "Test Scenario")

    expect(result).toBe(false)
    expect(mockAccess).toHaveBeenCalledWith("gherkin-scenarios/test-001-test-scenario.feature")
  })

  it("should handle special characters in scenario title", async () => {
    const mockAccess = vi.mocked(access)
    mockAccess.mockResolvedValue(undefined)

    await checkGherkinFileExists("test-001", "Test Scenario With Spaces & Special!")

    expect(mockAccess).toHaveBeenCalledWith("gherkin-scenarios/test-001-test-scenario-with-spaces-&-special!.feature")
  })
})

describe("generateScenarioGherkin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create directory and write file", async () => {
    const mockMkdir = vi.mocked(mkdir)
    const mockWriteFile = vi.mocked(writeFile)

    mockMkdir.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)

    const mockScenario = {
      id: "test-001",
      category: "Navigation",
      priority: "high" as const,
      title: "Test Navigation",
      description: "Test navigation functionality",
      steps: ["Prerequisites: Set up test environment", "Click navigation link", "Verify page loads"],
      expectedOutcome: "Navigation should work correctly",
    }

    await generateScenarioGherkin(mockScenario, "Test Story", "https://test.com")

    expect(mockMkdir).toHaveBeenCalledWith("gherkin-scenarios", { recursive: true })
    expect(mockWriteFile).toHaveBeenCalledWith(
      "gherkin-scenarios/test-001-test-navigation.feature",
      expect.stringContaining("Feature: Navigation - Test Navigation"),
    )
  })

  it("should generate correct Gherkin content", async () => {
    const mockWriteFile = vi.mocked(writeFile)
    mockWriteFile.mockResolvedValue(undefined)

    const mockScenario = {
      id: "test-001",
      category: "Forms",
      priority: "medium" as const,
      title: "Form Validation",
      description: "Test form validation",
      steps: ["Prerequisites: Prepare test data", "Fill form with invalid data", "Submit form"],
      expectedOutcome: "Form should show validation errors",
    }

    await generateScenarioGherkin(mockScenario, "Form Story", "https://example.com")

    const writtenContent = mockWriteFile.mock.calls[0][1] as string

    expect(writtenContent).toContain("Feature: Forms - Form Validation")
    expect(writtenContent).toContain('Given I am testing the website "https://example.com"')
    expect(writtenContent).toContain("# Test form validation")
    expect(writtenContent).toContain("# Step 1: Prerequisites: Prepare test data")
    expect(writtenContent).toContain("# Step 2: Fill form with invalid data")
    expect(writtenContent).toContain("# Step 3: Submit form")
    expect(writtenContent).toContain("# Form should show validation errors")
    expect(writtenContent).toContain("@forms")
    expect(writtenContent).toContain("@medium-priority")
  })

  it("should handle scenarios with special characters in title", async () => {
    const mockWriteFile = vi.mocked(writeFile)
    mockWriteFile.mockResolvedValue(undefined)

    const mockScenario = {
      id: "test-001",
      category: "Security",
      priority: "high" as const,
      title: "XSS & SQL Injection Testing",
      description: "Test security vulnerabilities",
      steps: ["Prerequisites: Get security testing permission"],
      expectedOutcome: "System should be secure",
    }

    await generateScenarioGherkin(mockScenario, "Security Story", "https://test.com")

    expect(mockWriteFile).toHaveBeenCalledWith(
      "gherkin-scenarios/test-001-xss-&-sql-injection-testing.feature",
      expect.any(String),
    )
  })
})

describe("Integration Tests", () => {
  it("should generate complete workflow from analysis to Gherkin", async () => {
    const mockMkdir = vi.mocked(mkdir)
    const mockWriteFile = vi.mocked(writeFile)
    const mockAccess = vi.mocked(access)

    mockMkdir.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)
    mockAccess.mockRejectedValue(new Error("File not found"))

    // Step 1: Analyze site
    const analysisResult = await analyzeSite("https://integration-test.com")
    expect(analysisResult.userStories.length).toBeGreaterThan(0)

    // Step 2: Check if Gherkin files exist (should not exist)
    const firstScenario = analysisResult.userStories[0].scenarios[0]
    const fileExists = await checkGherkinFileExists(firstScenario.id, firstScenario.title)
    expect(fileExists).toBe(false)

    // Step 3: Generate Gherkin file
    await generateScenarioGherkin(firstScenario, analysisResult.userStories[0].title, analysisResult.url)

    expect(mockWriteFile).toHaveBeenCalled()
    expect(mockMkdir).toHaveBeenCalledWith("gherkin-scenarios", { recursive: true })
  })
})
