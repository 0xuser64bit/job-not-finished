# Job Not Finished

![Job Not Finished Logo](/public/image.png)

A modern web application designed to help developers track and manage their unfinished GitHub projects. Built with Next.js 15, this application integrates with the GitHub API to display your repositories and helps you stay motivated to complete your projects through friendly reminders and progress tracking.

## 🌟 Features

- **GitHub Integration**: Connect with your GitHub account to view and manage your repositories
- **Project Progress Tracking**: Track completion status of your projects with a visual progress bar
- **Repository Filtering**: Filter repositories by language, search by name, and sort by various criteria
- **Email Reminders**: Receive weekly email reminders for your unfinished projects with motivational roasts
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between dark and light themes
- **Protected Routes**: Secure authentication with NextAuth.js
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Animations**: Smooth animations powered by Framer Motion

## 📋 Table of Contents

- [Demo](#-demo)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Usage](#-usage)
  - [Authentication](#authentication)
  - [Dashboard](#dashboard)
  - [Project Reminders](#project-reminders)
- [Project Structure](#-project-structure)
- [Technologies](#-technologies)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

## 🚀 Demo

Visit the live demo at [JOB-NOT-FINISHED](https://job-not-finished.vercel.app/)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- GitHub account (for OAuth setup and API access)
- PostgreSQL database
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/job-not-finished.git
cd job-not-finished
```

2. Install dependencies:

```bash
# Using Bun (recommended for faster installation)
bun install

# Or using npm
npm install
```

### Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:

```
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# GitHub API (for higher rate limits)
GITHUB_TOKEN=your-github-personal-access-token

# Database
DATABASE_URL=your-postgresql-connection-string
DIRECT_URL=your-postgresql-direct-connection-string

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key

# Cron Job Secret
CRON_SECRET=your-cron-secret-key
```

2. Set up GitHub OAuth:
   - Go to your GitHub account settings
   - Navigate to "Developer settings" > "OAuth Apps" > "New OAuth App"
   - Fill in the application details:
     - Application name: Job Not Finished
     - Homepage URL: http://localhost:3000
     - Authorization callback URL: http://localhost:3000/api/auth/callback/github
   - Register the application
   - Copy the Client ID and generate a new Client Secret
   - Add these values to your `.env.local` file

3. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens
   - Generate a new token with the following permissions:
     - `public_repo` - to access public repositories
     - `read:user` - to read user profile information
   - Add this token to your `.env.local` file as `GITHUB_TOKEN`

4. Set up a PostgreSQL database and add the connection strings to your `.env.local` file

5. Set up Resend for email functionality:
   - Create an account at [resend.com](https://resend.com)
   - Create an API key and add it to your `.env.local` file as `RESEND_API_KEY`

6. Generate a secure random string for `NEXTAUTH_SECRET` and `CRON_SECRET`:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🖥️ Usage

### Running the Development Server

```bash
# Using Bun
bun dev

# Or using npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
# Using Bun
bun run build

# Or using npm
npm run build
```

### Authentication

1. Visit the homepage and click "Sign In with GitHub"
2. Authorize the application to access your GitHub account
3. After successful authentication, you'll be prompted to provide your email address for reminders
4. Once your email is provided, you'll be redirected to the dashboard

### Dashboard

The dashboard displays all your GitHub repositories with the following features:

- **Search**: Filter repositories by name
- **Language Filter**: View repositories of a specific programming language
- **Sorting**: Sort repositories by name, stars, forks, last updated, or progress
- **Source Filter**: Toggle to show only repositories you created (exclude forks)
- **Progress Tracking**: Update the completion percentage of each project
- **Reminders**: Enable or disable weekly email reminders for specific projects

### Project Reminders

The application includes a weekly email reminder system that:

1. Sends emails to users with reminder-enabled projects
2. Analyzes GitHub repository activity and generates motivational "roasts"
3. Provides statistics about project activity, stars, and open issues
4. Encourages users to continue working on their unfinished projects

To set up the reminder system:

1. Ensure the `RESEND_API_KEY` and `CRON_SECRET` are configured in your environment
2. Set up a cron job to hit the reminder endpoint weekly:
   ```
   https://your-domain.com/api/reminder/sendEmail?secret=your-cron-secret-key
   ```

## 📂 Project Structure

```
job-not-finished/
├── app/                      # Next.js App Router
│   ├── (protected)/          # Protected routes requiring authentication
│   │   └── dashboard/        # Dashboard page
│   ├── actions/              # Server actions
│   │   ├── get-user/         # User data retrieval
│   │   ├── toggle-reminder/  # Toggle project reminders
│   │   ├── update-progress/  # Update project progress
│   │   └── update-repositories/ # Fetch GitHub repositories
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication API routes
│   │   ├── reminder/         # Email reminder API
│   │   └── user/             # User data API
│   ├── collect-email/        # Email collection page
│   ├── signin/               # Sign-in page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── providers.tsx         # Context providers
├── components/               # React components
│   ├── ui/                   # UI components (shadcn/ui)
│   └── RepositoryCard.tsx    # Repository card component
├── lib/                      # Utility functions and libraries
│   ├── github.ts             # GitHub API integration
│   ├── prisma.ts             # Prisma client initialization
│   └── utils.ts              # Utility functions
├── prisma/                   # Prisma ORM
│   ├── migrations/           # Database migrations
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── auth.ts                   # NextAuth.js configuration
├── middleware.ts             # Next.js middleware for route protection
└── ...                       # Configuration files
```

## 🛠️ Technologies

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [NextAuth.js 5](https://next-auth.js.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Email Service**: [Resend](https://resend.com/)
- **GitHub API**: [Octokit](https://github.com/octokit/octokit.js)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Toast Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Package Manager**: [Bun](https://bun.sh/) / [npm](https://www.npmjs.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [GitHub](https://github.com/) for the API that makes this project possible
- [Vercel](https://vercel.com/) for hosting the application

---

<p align="center">Made with ❤️ by Arth</p>
