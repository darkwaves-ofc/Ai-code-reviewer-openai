# AI Code Reviewer - Modelslab

## Overview
AI-powered code review tool that helps developers analyze and improve their code quality with AI models.

## Screenshots
![screenshot crysolabs coderoast](https://coderoast.crysolabs.com/screenshots/Screenshot-1.png)
![screenshot crysolabs coderoast](https://coderoast.crysolabs.com/screenshots/Screenshot-2.png)

## Features
- AI-powered code review
- Authentication with NextAuth
- API key management
- Team collaboration
- Stripe payment integration
- Webhooks for Stripe events

## Installation
Clone the repository:
```sh
 git clone https://github.com/crysolabs/Ai-code-reviewer-modelslab.git
 cd Ai-code-reviewer-modelslab
```

Install dependencies:
```sh
npm install
```

## Environment Variables
Create a `.env` file in the root directory and add the following variables:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Database
DATABASE_URL=your-mongodb-connection-string

# OAuth Providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=your-stripe-pro-price-id
NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID=your-stripe-team-price-id
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

## Running the Project
Start the development server:
```sh
npm run dev
```

## Scripts
- `dev`: Start the development server
- `build`: Build the project
- `start`: Start the production server
- `lint`: Run ESLint

## API Routes
- `api/auth` - Authentication (NextAuth)
- `api/review` - Code review endpoint
- `api/webhooks/stripe` - Stripe webhook handler
  
## Video Demonstration
[YouTube Video](link)

## Live Demo
[CodeRoast - Crysolabs](https://coderoast.crysolabs.com/)

## Repository
[GitHub - Crysolabs](https://github.com/crysolabs/Ai-code-reviewer-modelslab)

## Official Website
[Crysolabs](https://crysolabs.com/)

## License
This project is licensed under the MIT License.

