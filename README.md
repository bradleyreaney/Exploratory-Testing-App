# Exploratory Testing App

A Next.js application for exploratory testing with AI-powered scenario generation.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nimbleapproach/v0-exploratory-testing-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/T7Ttnc7CkBO)

## Overview

This application provides tools for exploratory testing with intelligent scenario generation capabilities. It features AI-powered test case creation using Google Gemini and supports both manual and automated testing workflows.

### v0.dev Integration

This repository is automatically synced with your [v0.dev](https://v0.dev) deployments. Any changes made to your deployed app will be automatically pushed to this repository from v0.dev.

## Features

- **AI-Powered Scenario Generation**: Leverage Google Gemini to automatically generate comprehensive test scenarios
- **Interactive Testing Interface**: Modern UI built with Next.js and Tailwind CSS
- **Flexible Testing Modes**: Run with AI-enhanced scenarios or use predefined test cases
- **Component Library**: Built with Radix UI components for consistent user experience
- **TypeScript Support**: Full type safety throughout the application

## Live Demo

🚀 **Live Application**: [v0-exploratory-testing-app.vercel.app](https://vercel.com/nimbleapproach/v0-exploratory-testing-app)

## Development

Continue building and modifying this app on [v0.dev](https://v0.dev/chat/projects/T7Ttnc7CkBO)

### Workflow
1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your changes from the v0 interface
3. Changes are automatically synced to this repository
4. Vercel deploys the latest version automatically

## Running Locally

### Prerequisites

- **Node.js 18+** installed on your system
- **pnpm** package manager (recommended) or npm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bradleyreaney/Exploratory-Testing-App.git
   cd Exploratory-Testing-App
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or with npm
   npm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   # or with npm
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `pnpm dev` / `npm run dev` - Start the development server
- `pnpm build` / `npm run build` - Build the application for production
- `pnpm start` / `npm run start` - Start the production server
- `pnpm lint` / `npm run lint` - Run ESLint for code quality checks

### Testing

This project uses Vitest for testing. Run tests with:
```bash
# Install test dependencies and run tests
pnpm test
# or with npm
npm test
```

## Configuration

### AI Integration

The application supports AI-powered scenario generation using Google Gemini:

1. **Get API Key**: Obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Configure**: Add the key to your `.env.local` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. **Enable**: The application will automatically detect the API key and enable AI features

**Note**: Without an API key, the application runs in basic mode with predefined scenarios.

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI Integration**: Google Gemini
- **Testing**: Vitest with Testing Library
- **Language**: TypeScript
- **Deployment**: Vercel

## Contributing

This project is automatically synced with v0.dev. For major changes, consider using the [v0.dev interface](https://v0.dev/chat/projects/T7Ttnc7CkBO) to maintain the sync workflow.
