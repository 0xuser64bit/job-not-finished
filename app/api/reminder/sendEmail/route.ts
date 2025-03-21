import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Octokit } from 'octokit';
import prisma from '@/lib/prisma';

// Initialize clients
const resend = new Resend(process.env.RESEND_API_KEY);
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Secret key for cron job access - should match middleware.ts
const CRON_SECRET = process.env.CRON_SECRET;

// Define types for our data
interface GitHubRepo {
    name: string;
    owner: string;
}

interface ProjectRoast {
    name: string;
    url?: string;
    roast: string;
    daysSinceLastCommit?: number;
    stars?: number;
    openIssues?: number;
    error?: boolean;
}

// Helper function to generate the current date in a readable format
const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

// Helper function to parse GitHub repository information
function extractGitHubInfo(fullName: string): GitHubRepo | null {
    // Example formats: "username/repo-name" or full URL "https://github.com/username/repo-name"
    try {
        // Extract owner/repo if it's a full URL
        if (fullName.includes('github.com')) {
            const url = new URL(fullName);
            const parts = url.pathname.split('/').filter(Boolean);
            if (parts.length >= 2) {
                return { owner: parts[0], name: parts[1] };
            }
        } 
        // Handle simple format: username/repo-name
        else if (fullName.includes('/')) {
            const [owner, name] = fullName.split('/');
            if (owner && name) {
                return { owner, name };
            }
        }
        // Fallback: Assume the name is just a repo name, owner will be provided separately
        return null;
    } catch (error) {
        console.error(`Failed to parse GitHub repo info from: ${fullName}`, error);
        return null;
    }
}

// Function to generate a roast for a GitHub project based on its stats
async function generateProjectRoast(repo: GitHubRepo): Promise<ProjectRoast> {
    try {
        console.log(`[Cron Job] Analyzing GitHub repo: ${repo.owner}/${repo.name}`);
        
        // Get repository details
        const repoData = await octokit.rest.repos.get({
            owner: repo.owner,
            repo: repo.name,
        });

        // Calculate days since last commit
        const lastCommitDate = new Date(repoData.data.pushed_at);
        const now = new Date();
        const daysSinceLastCommit = Math.floor((now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24));

        // Generate appropriate roast based on project activity
        let roast = '';
        
        if (daysSinceLastCommit > 30) {
            roast = `Your project "${repo.name}" hasn't seen a commit in ${daysSinceLastCommit} days! Even dinosaurs moved faster than your development pace. Is this a project or a digital fossil?`;
        } else if (daysSinceLastCommit > 14) {
            roast = `Two weeks without a commit to "${repo.name}"? Your code must be feeling neglected. Even house plants get more attention!`;
        } else if (daysSinceLastCommit > 7) {
            roast = `A week without touching "${repo.name}"? Your GitHub contribution graph is getting as empty as a developer's social calendar.`;
        } else if (daysSinceLastCommit > 3) {
            roast = `${daysSinceLastCommit} days since your last commit to "${repo.name}". At this rate, you'll finish just in time for the retirement party.`;
        } else {
            roast = `Nice recent activity on "${repo.name}", but let's be honest - we both know it won't last. Prove me wrong!`;
        }

        // Add something about the project size or stats
        const repoSize = repoData.data.size;
        if (repoSize < 1000) {
            roast += ` And with only ${repoSize}KB? That's not a project, that's a digital sticky note!`;
        }

        // Add open issues count if available
        if (repoData.data.open_issues_count > 5) {
            roast += ` With ${repoData.data.open_issues_count} open issues, you're collecting bugs like they're trading cards.`;
        }

        return {
            name: repo.name,
            url: repoData.data.html_url,
            roast: roast,
            daysSinceLastCommit: daysSinceLastCommit,
            stars: repoData.data.stargazers_count,
            openIssues: repoData.data.open_issues_count
        };
    } catch (error) {
        console.error(`Error analyzing repo ${repo.owner}/${repo.name}:`, error);
        return {
            name: repo.name,
            roast: `I tried to roast your project "${repo.name}", but it's so inactive even my roasting algorithm got bored looking at it.`,
            error: true
        };
    }
}

// Helper function to verify cron job authentication
function verifyAuth(request: NextRequest): boolean {
    const secret = request.nextUrl.searchParams.get('secret');
    const authHeader = request.headers.get('authorization');
    
    // Extract token from Bearer header if present
    const authToken = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;
    
    // Fix for URL encoding: In query parameters, + characters are converted to spaces
    const fixedSecret = secret?.replace(/ /g, '+');
    
    // Check against environment variable
    return fixedSecret === CRON_SECRET || authToken === CRON_SECRET;
}

export async function GET(request: NextRequest) {
    console.log(`[Cron Job] Weekly reminder triggered at ${new Date().toISOString()}`);
    
    // Set cache control headers to prevent caching
    const headers = new Headers({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    });
    
    // Verify authentication
    if (!verifyAuth(request)) {
        console.error('[Cron Job] Unauthorized access attempt');
        return NextResponse.json(
            { error: 'Unauthorized access' }, 
            { status: 401, headers }
        );
    }

    try {
        // Get all users
        const users = await prisma.user.findMany({
            where: {
                email: { not: null } // Only users with emails
            },
            include: {
                projects: {
                    where: {
                        reminder: true
                    }
                }
            }
        });
        
        const usersWithProjects = users.filter(user => user.projects && user.projects.length > 0);
        console.log(`[Cron Job] Found ${users.length} total users, ${usersWithProjects.length} with reminder-enabled projects`);
        
        if (usersWithProjects.length === 0) {
            console.log('[Cron Job] No users have reminder-enabled projects. Exiting.');
            return NextResponse.json({ 
                success: true, 
                data: { message: 'No users with reminder-enabled projects found' } 
            });
        }
        
        const formattedDate = getFormattedDate();
        const emailPromises = [];

        // Process each user with reminder-enabled projects
        for (const user of usersWithProjects) {
            if (!user.email) {
                console.log(`[Cron Job] User ${user.id} has no email, skipping`);
                continue;
            }

            console.log(`[Cron Job] Processing user ${user.id} with ${user.projects.length} reminder-enabled projects`);

            // Analyze each project and generate roasts
            const projectRoastsPromises = [];
            
            for (const project of user.projects) {
                console.log(`[Cron Job] Processing project ${project.id}: ${project.name}`);
                
                // Try to extract GitHub info from the project name
                const repoInfo = extractGitHubInfo(project.name);
                
                if (repoInfo) {
                    // If we successfully parsed a full GitHub repo reference
                    projectRoastsPromises.push(generateProjectRoast(repoInfo));
                } else {
                    // Default: assume the user's GitHub ID is the owner and project name is the repo
                    // This works if project names are in the format of repo names
                    projectRoastsPromises.push(generateProjectRoast({
                        name: project.name,
                        owner: user.githubId
                    }));
                }
            }

            // Wait for all project analyses to complete
            const projectRoasts = await Promise.all(projectRoastsPromises);
            
            // Generate the project roast HTML sections
            const projectRoastsHtml = projectRoasts.map((project: ProjectRoast) => `
                <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #e74c3c; background-color: #f9f9f9;">
                    <h3 style="margin-top: 0; color: #e74c3c;">Project: ${project.name}</h3>
                    <p><strong>The Hard Truth:</strong> ${project.roast}</p>
                    ${project.url ? `<p><a href="${project.url}" style="color: #3498db; text-decoration: none;">View on GitHub</a></p>` : ''}
                    ${project.daysSinceLastCommit ? `<p style="font-size: 14px;">Days since last activity: ${project.daysSinceLastCommit}</p>` : ''}
                    ${project.stars !== undefined ? `<p style="font-size: 14px;">Stars: ${project.stars}</p>` : ''}
                </div>
            `).join('');

            // Generate the full email HTML
            const emailHtml = `
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                            <h1 style="color: #2c3e50;">Weekly Project Roast - ${formattedDate}</h1>
                            <p>Hello ${user.githubId || 'there'},</p>
                            <p>It's time for your weekly dose of tough love for those unfinished projects of yours:</p>
                            
                            ${projectRoastsHtml}
                            
                            <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                                <p style="margin: 0; font-style: italic;">"The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will." – Vince Lombardi</p>
                            </div>
                            
                            <p>Remember, we're roasting your projects because we care. Now get back to coding!</p>
                            <p>Visit <a href="https://job-not-finished.arthprajapati.com" style="color: #3498db; text-decoration: none;">job-not-finished.arthprajapati.com</a> to update your progress.</p>
                            
                            <p style="margin-top: 30px; font-size: 12px; color: #7f8c8d;">This is an automated message from Job Not Finished. You're receiving this because you enabled project reminders. You can disable these reminders from your user settings.</p>
                        </div>
                    </body>
                </html>
            `;

            console.log(`[Cron Job] Sending email to ${user.email}`);
            
            // Queue the email for sending
            emailPromises.push(
                resend.emails.send({
                    from: 'noreply@updates.job-not-finished.arthprajapati.com',
                    to: [user.email],
                    subject: `Your Weekly Project Roast - It's Time To Ship! 🚢`,
                    html: emailHtml
                }).then(response => {
                    console.log(`[Cron Job] Email sent to ${user.email} with ID: ${response.data?.id}`);
                    return { userId: user.id, email: user.email, success: true, id: response.data?.id };
                }).catch(error => {
                    console.error(`[Cron Job] Failed to send email to ${user.email}:`, error);
                    return { userId: user.id, email: user.email, success: false, error };
                })
            );
        }

        // If no emails were queued (this should not happen given our earlier check, but just to be safe)
        if (emailPromises.length === 0) {
            console.log('[Cron Job] No emails were queued for sending, something may be wrong with the filtering');
            return NextResponse.json({ 
                success: true, 
                data: { message: 'No emails queued for sending' } 
            });
        }

        // Send all emails in parallel and wait for completion
        const emailResults = await Promise.all(emailPromises);
        
        const successCount = emailResults.filter(result => result.success).length;
        const failureCount = emailResults.length - successCount;

        console.log(`[Cron Job] Email batch completed. Success: ${successCount}, Failed: ${failureCount}`);
        
        return NextResponse.json(
            { 
                success: true, 
                data: {
                    totalEmails: emailResults.length,
                    successCount,
                    failureCount,
                    details: emailResults
                } 
            },
            { headers }
        );
    } catch (error) {
        console.error('[Cron Job] Error processing reminders:', error);
        return NextResponse.json(
            { error: error }, 
            { status: 500, headers }
        );
    }
}

// Also handle POST requests for manual testing
export async function POST(request: NextRequest) {
    return GET(request);
} 