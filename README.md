# Job Not Finished

A task management application with GitHub authentication and protected routes.

## Features

- GitHub authentication
- Protected routes
- User profile page
- Dashboard for authenticated users

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- GitHub account (for OAuth setup)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
# or
npm install
```

### Setting up GitHub OAuth

1. Go to your GitHub account settings
2. Navigate to "Developer settings" > "OAuth Apps" > "New OAuth App"
3. Fill in the application details:
   - Application name: Job Not Finished (or your preferred name)
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/api/auth/callback/github
4. Register the application
5. Copy the Client ID and generate a new Client Secret
6. Create a `.env.local` file in the root of your project with the following content:

```
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

7. Replace `your-github-client-id` and `your-github-client-secret` with the values from GitHub
8. Generate a random string for `NEXTAUTH_SECRET` (you can use `openssl rand -base64 32` in your terminal)

### Running the Development Server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Protected Routes

The following routes are protected and require authentication:

- `/dashboard` - Main dashboard for authenticated users
- `/profile` - User profile page

If you try to access these routes without being authenticated, you will be redirected to the sign-in page.

## Authentication Flow

1. User clicks "Sign In" button on the home page
2. User is redirected to GitHub for authentication
3. After successful authentication, user is redirected back to the application
4. User can now access protected routes

## Technologies Used

- Next.js 15
- NextAuth.js 5
- Tailwind CSS
- TypeScript

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
