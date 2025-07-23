import { describe, it, expect } from "vitest"

// Test utility functions that might be extracted later
describe("Utility Functions", () => {
  describe("Priority Color Mapping", () => {
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

    it("should return correct colors for each priority level", () => {
      expect(getPriorityColor("high")).toBe("bg-red-50 text-red-700 border-red-200")
      expect(getPriorityColor("medium")).toBe("bg-yellow-50 text-yellow-700 border-yellow-200")
      expect(getPriorityColor("low")).toBe("bg-green-50 text-green-700 border-green-200")
      expect(getPriorityColor("unknown")).toBe("bg-gray-50 text-gray-700 border-gray-200")
    })
  })

  describe("Persona Color Mapping", () => {
    const getPersonaColor = (persona: string) => {
      const colors = {
        "New Visitor": "bg-blue-50 text-blue-700 border-blue-200",
        "Returning User": "bg-purple-50 text-purple-700 border-purple-200",
        "Admin User": "bg-orange-50 text-orange-700 border-orange-200",
        "Mobile User": "bg-green-50 text-green-700 border-green-200",
        "Accessibility User": "bg-pink-50 text-pink-700 border-pink-200",
      }
      return colors[persona as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"
    }

    it("should return correct colors for each persona", () => {
      expect(getPersonaColor("New Visitor")).toBe("bg-blue-50 text-blue-700 border-blue-200")
      expect(getPersonaColor("Returning User")).toBe("bg-purple-50 text-purple-700 border-purple-200")
      expect(getPersonaColor("Admin User")).toBe("bg-orange-50 text-orange-700 border-orange-200")
      expect(getPersonaColor("Mobile User")).toBe("bg-green-50 text-green-700 border-green-200")
      expect(getPersonaColor("Accessibility User")).toBe("bg-pink-50 text-pink-700 border-pink-200")
      expect(getPersonaColor("Unknown User")).toBe("bg-gray-50 text-gray-700 border-gray-200")
    })
  })

  describe("File Name Generation", () => {
    const generateFileName = (scenarioId: string, scenarioTitle: string) => {
      return `${scenarioId}-${scenarioTitle.toLowerCase().replace(/\s+/g, "-")}.feature`
    }

    it("should generate correct file names", () => {
      expect(generateFileName("test-001", "Primary Navigation Testing")).toBe(
        "test-001-primary-navigation-testing.feature",
      )

      expect(generateFileName("form-001", "Form Validation & Error Handling")).toBe(
        "form-001-form-validation-&-error-handling.feature",
      )

      expect(generateFileName("acc-001", "Screen Reader Compatibility")).toBe(
        "acc-001-screen-reader-compatibility.feature",
      )
    })

    it("should handle multiple spaces and special characters", () => {
      expect(generateFileName("test-001", "Test   Multiple    Spaces")).toBe(
        "test-001-test---multiple----spaces.feature",
      )

      expect(generateFileName("test-002", "Test!@#$%^&*()Special")).toBe("test-002-test!@#$%^&*()special.feature")
    })
  })
})
