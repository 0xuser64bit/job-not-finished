# Job Not Finished

![Job Not Finished Logo](/public/image.png)

A modern web application designed to help developers track and manage their unfinished GitHub projects. Built with Next.js 15, this application integrates with the GitHub API to display your repositories and helps you stay motivated to complete your projects.

## 🌟 Features

- **GitHub Integration**: Connect with your GitHub account to view and manage your repositories
- **Project Progress Tracking**: Track completion status of your projects
- **Repository Filtering**: Filter repositories by language, search by name, and sort by various criteria
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
- [Project Structure](#-project-structure)
- [Technologies](#-technologies)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

## 🚀 Demo

Visit the live demo at [https://job-not-finished.vercel.app/](https://job-not-finished.vercel.app/) (replace with your actual deployment URL)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- GitHub account (for OAuth setup and API access)
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

# GitHub API (optional, but recommended for higher rate limits)
NEXT_PUBLIC_GITHUB_ACCESS_TOKEN=your-github-personal-access-token
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

3. (Optional) Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens
   - Generate a new token with the following permissions:
     - `public_repo` - to access public repositories
     - `read:user` - to read user profile information
   - Add this token to your `.env.local` file as `NEXT_PUBLIC_GITHUB_ACCESS_TOKEN`

4. Generate a secure random string for `NEXTAUTH_SECRET`:

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
3. After successful authentication, you'll be redirected to the dashboard

### Dashboard

The dashboard displays all your GitHub repositories with the following features:

- **Search**: Filter repositories by name
- **Language Filter**: View repositories of a specific programming language
- **Sorting**: Sort repositories by name, stars, forks, last updated, or progress
- **Source Filter**: Toggle to show only repositories you created (exclude forks)
- **Pagination**: Navigate through your repositories with ease

## 📂 Project Structure

```
job-not-finished/
├── app/                      # Next.js App Router
│   ├── (protected)/          # Protected routes requiring authentication
│   │   └── dashboard/        # Dashboard page
│   ├── api/                  # API routes
│   │   └── auth/             # Authentication API routes
│   ├── signin/               # Sign-in page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── providers.tsx         # Context providers
├── components/               # React components
│   ├── ui/                   # UI components (shadcn/ui)
│   └── RepositoryCard.tsx    # Repository card component
├── lib/                      # Utility functions and libraries
│   ├── github.ts             # GitHub API integration
│   └── utils.ts              # Utility functions
├── public/                   # Static assets
├── auth.ts                   # NextAuth.js configuration
├── middleware.ts             # Next.js middleware for route protection
└── ...                       # Configuration files
```

## 🛠️ Technologies

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [NextAuth.js 5](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
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

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [GitHub API](https://docs.github.com/en/rest) - For repository data
- [Vercel](https://vercel.com/) - For hosting and deployment

---

<p align="center">Made with ❤️ by Arth</p>
