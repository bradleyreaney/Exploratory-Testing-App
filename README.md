# Exploratory testing app

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nimbleapproach/v0-exploratory-testing-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/T7Ttnc7CkBO)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/nimbleapproach/v0-exploratory-testing-app](https://vercel.com/nimbleapproach/v0-exploratory-testing-app)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/T7Ttnc7CkBO](https://v0.dev/chat/projects/T7Ttnc7CkBO)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Running Locally

To run this application locally on your machine:

### Prerequisites
- Node.js 18+ installed on your system
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/exploratory-testing-app.git
   cd exploratory-testing-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edit `.env.local` and add your API keys:
   \`\`\`
   GEMINI_API_KEY=your_gemini_api_key_here
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run test` - Run the test suite
- `npm run lint` - Run ESLint for code quality checks

### API Configuration

The application supports AI-powered scenario generation using Google Gemini. To enable this feature:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file as shown above
3. The application will automatically detect the API key and enable AI mode

Without an API key, the application will run in basic mode with predefined scenarios.
