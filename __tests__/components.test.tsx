import type React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import TestingScenarioGenerator from "../app/page"
import * as actions from "../app/actions"

// Mock the actions module
vi.mock("../app/actions", () => ({
  analyzeSite: vi.fn(),
  saveAcceptanceCriteria: vi.fn(),
  generateScenarioGherkin: vi.fn(),
  checkGherkinFileExists: vi.fn(),
}))

// Mock the UI components
vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockAnalysisResult = {
  url: "https://test.com",
  pagesCrawled: 10,
  siteStructure: {
    forms: 2,
    links: 25,
    images: 15,
    interactiveElements: 8,
  },
  technologies: ["React", "Next.js"],
  userStories: [
    {
      id: "story-001",
      title: "Test User Story",
      description: "Test description",
      persona: "New Visitor",
      priority: "high" as const,
      acceptanceCriteria: [
        {
          id: "ac-001",
          description: "Test acceptance criteria",
          testable: true,
        },
      ],
      scenarios: [
        {
          id: "scenario-001",
          category: "Navigation",
          priority: "high" as const,
          title: "Test Scenario",
          description: "Test scenario description",
          steps: ["Prerequisites: Set up test environment", "Perform test action", "Verify result"],
          expectedOutcome: "Test should pass",
        },
      ],
    },
  ],
}

describe("TestingScenarioGenerator Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the main title and input form", () => {
    render(<TestingScenarioGenerator />)

    expect(screen.getByText(/Testing Scenario Generator/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText("https://example.com")).toBeInTheDocument()
    expect(screen.getByText("Analyze Site")).toBeInTheDocument()
  })

  it("shows loading state when analyzing", async () => {
    const mockAnalyzeSite = vi.mocked(actions.analyzeSite)
    mockAnalyzeSite.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<TestingScenarioGenerator />)

    const urlInput = screen.getByPlaceholderText("https://example.com")
    const analyzeButton = screen.getByText("Analyze Site")

    fireEvent.change(urlInput, { target: { value: "https://test.com" } })
    fireEvent.click(analyzeButton)

    await waitFor(() => {
      expect(screen.getByText("Analyzing...")).toBeInTheDocument()
    })
  })

  it("displays analysis results after successful analysis", async () => {
    const mockAnalyzeSite = vi.mocked(actions.analyzeSite)
    const mockCheckGherkinFileExists = vi.mocked(actions.checkGherkinFileExists)

    mockAnalyzeSite.mockResolvedValue(mockAnalysisResult)
    mockCheckGherkinFileExists.mockResolvedValue(false)

    render(<TestingScenarioGenerator />)

    const urlInput = screen.getByPlaceholderText("https://example.com")
    const analyzeButton = screen.getByText("Analyze Site")

    fireEvent.change(urlInput, { target: { value: "https://test.com" } })
    fireEvent.click(analyzeButton)

    // Wait for analysis modal to appear and then continue button
    await waitFor(() => {
      expect(screen.getByText("Analysis Complete!")).toBeInTheDocument()
    })

    const continueButton = screen.getByText("Continue to Results")
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText("Site Overview")).toBeInTheDocument()
      expect(screen.getByText("10")).toBeInTheDocument() // Pages crawled
      expect(screen.getByText("Test User Story")).toBeInTheDocument()
    })
  })

  it("shows error message on analysis failure", async () => {
    const mockAnalyzeSite = vi.mocked(actions.analyzeSite)
    mockAnalyzeSite.mockRejectedValue(new Error("Analysis failed"))

    render(<TestingScenarioGenerator />)

    const urlInput = screen.getByPlaceholderText("https://example.com")
    const analyzeButton = screen.getByText("Analyze Site")

    fireEvent.change(urlInput, { target: { value: "https://invalid-url" } })
    fireEvent.click(analyzeButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to analyze the website/)).toBeInTheDocument()
    })
  })

  it("generates Gherkin file when button is clicked", async () => {
    const mockAnalyzeSite = vi.mocked(actions.analyzeSite)
    const mockCheckGherkinFileExists = vi.mocked(actions.checkGherkinFileExists)
    const mockGenerateScenarioGherkin = vi.mocked(actions.generateScenarioGherkin)

    mockAnalyzeSite.mockResolvedValue(mockAnalysisResult)
    mockCheckGherkinFileExists.mockResolvedValue(false)
    mockGenerateScenarioGherkin.mockResolvedValue(undefined)

    render(<TestingScenarioGenerator />)

    // Perform analysis first
    const urlInput = screen.getByPlaceholderText("https://example.com")
    const analyzeButton = screen.getByText("Analyze Site")

    fireEvent.change(urlInput, { target: { value: "https://test.com" } })
    fireEvent.click(analyzeButton)

    await waitFor(() => {
      expect(screen.getByText("Continue to Results")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Continue to Results"))

    await waitFor(() => {
      expect(screen.getByText("Generate Gherkin")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Generate Gherkin"))

    await waitFor(() => {
      expect(mockGenerateScenarioGherkin).toHaveBeenCalledWith(
        mockAnalysisResult.userStories[0].scenarios[0],
        mockAnalysisResult.userStories[0].title,
        "https://test.com",
      )
    })
  })

  it("disables generate button for existing Gherkin files", async () => {
    const mockAnalyzeSite = vi.mocked(actions.analyzeSite)
    const mockCheckGherkinFileExists = vi.mocked(actions.checkGherkinFileExists)

    mockAnalyzeSite.mockResolvedValue(mockAnalysisResult)
    mockCheckGherkinFileExists.mockResolvedValue(true) // File exists

    render(<TestingScenarioGenerator />)

    // Perform analysis
    const urlInput = screen.getByPlaceholderText("https://example.com")
    const analyzeButton = screen.getByText("Analyze Site")

    fireEvent.change(urlInput, { target: { value: "https://test.com" } })
    fireEvent.click(analyzeButton)

    await waitFor(() => {
      expect(screen.getByText("Continue to Results")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Continue to Results"))

    await waitFor(() => {
      expect(screen.getByText("Already Exists")).toBeInTheDocument()
      expect(screen.getByText("✓ Already Generated")).toBeInTheDocument()
    })

    const button = screen.getByText("Already Exists")
    expect(button).toBeDisabled()
  })
})
