import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { JobApplication, UserDocument } from '@/lib/types-and-utils'; // Pastikan interface ini diimpor

const getSupabaseAuthedClient = (accessToken: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { 'Authorization': `Bearer ${accessToken}` } } }
  );
};

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken);

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', session.user.id);

    if (jobsError) throw jobsError;

    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', session.user.id);

    if (docsError) throw docsError;

    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const dashboardData: any = {
      user: {
        name: session.user.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email,
        joinDate: session.user.email ? jobs.reduce((minDate, job) => {
            const jobDate = new Date(job.created_at || '9999-12-31');
            return jobDate < minDate ? jobDate : minDate;
        }, new Date()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        profileCompletion: 85, // Hardcoded for now, can be dynamic later
      },
      applications: {
        total: jobs.length,
        thisMonth: jobs.filter(job => new Date(job.created_at!) >= oneMonthAgo).length,
        thisWeek: jobs.filter(job => new Date(job.created_at!) >= oneWeekAgo).length,
        lastMonth: jobs.filter(job => new Date(job.created_at!) < oneMonthAgo && new Date(job.created_at!).getMonth() === oneMonthAgo.getMonth()).length,
        responseRate: 0, 
        interviewRate: 0, 
        offerRate: 0, 
      },
      topRoles: [],
      companies: [],
      locations: [],
      activityTrend: [],
      documentsCount: documents.length,
      // hardcoded 
      journey: {
        currentStage: "Active Job Seeker",
        progress: 68,
        stages: [
          { name: "Profile Setup", completed: true, date: "2024-01-15" },
          { name: "First Application", completed: true, date: "2024-01-18" },
          { name: "Resume Optimization", completed: true, date: "2024-01-22" },
          { name: "Interview Practice", completed: true, date: "2024-02-01" },
          { name: "Active Networking", completed: false, date: null },
          { name: "Job Offer", completed: false, date: null },
        ],
      },
      skills: { // Hardcoded for now
        technical: [
          { skill: "React", level: 90, inDemand: true },
          { skill: "TypeScript", level: 85, inDemand: true },
          { skill: "Node.js", level: 80, inDemand: true },
          { skill: "Python", level: 75, inDemand: false },
          { skill: "AWS", level: 70, inDemand: true },
        ],
        soft: [
          { skill: "Communication", level: 88 },
          { skill: "Problem Solving", level: 92 },
          { skill: "Leadership", level: 78 },
          { skill: "Teamwork", level: 85 },
        ],
      },
      insights: [ // Hardcoded for now
        { type: "success", title: "Strong Application Rate", message: "You're applying to 3x more jobs than average users this month!", action: "Keep up the momentum" },
        { type: "warning", title: "Low Response Rate", message: "Your response rate is below average. Consider optimizing your resume.", action: "Use AI Resume Reviewer" },
        { type: "info", title: "Interview Skills", message: "Practice more interviews to improve your success rate.", action: "Try Mock Interview" },
      ],
      recommendations: [ // Hardcoded for now
        { title: "Optimize Your Resume", description: "Your resume could be better tailored for Frontend Developer roles", priority: "high", estimatedImpact: "+15% response rate", action: "Use Resume Reviewer", link: "/resume-reviewer" },
        { title: "Practice Technical Interviews", description: "Improve your interview performance with AI-powered practice", priority: "medium", estimatedImpact: "+20% interview success", action: "Start Mock Interview", link: "/interview" },
        { title: "Expand to New Locations", description: "Consider remote opportunities to increase your job pool", priority: "low", estimatedImpact: "+30% more opportunities", action: "Update Job Preferences", link: "/jobs/add" },
      ],
    };

    const appliedJobs = jobs.filter(job => job.status === 'Applied');
    const interviewJobs = jobs.filter(job => job.status === 'Interview');
    const offerJobs = jobs.filter(job => job.status === 'Offer');

    dashboardData.applications.responseRate = appliedJobs.length > 0 ? ((interviewJobs.length + offerJobs.length) / appliedJobs.length * 100).toFixed(0) : 0;
    dashboardData.applications.interviewRate = appliedJobs.length > 0 ? (interviewJobs.length / appliedJobs.length * 100).toFixed(0) : 0;
    dashboardData.applications.offerRate = appliedJobs.length > 0 ? (offerJobs.length / appliedJobs.length * 100).toFixed(0) : 0;
    
    // Hitung Top Roles
    const roleCounts: { [key: string]: number } = {};
    jobs.forEach(job => {
      roleCounts[job.job_title] = (roleCounts[job.job_title] || 0) + 1;
    });
    const sortedRoles = Object.entries(roleCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5); // Ambil 5 teratas
    
    dashboardData.topRoles = sortedRoles.map(([role, count]) => ({
      role,
      count,
      percentage: ((count / jobs.length) * 100).toFixed(0),
      trend: "stable", // hardcoded
    }));

    // Hitung Companies
    const companyCounts: { [key: string]: { count: number, statuses: Set<string> } } = {};
    jobs.forEach(job => {
      if (!companyCounts[job.company_name]) {
        companyCounts[job.company_name] = { count: 0, statuses: new Set() };
      }
      companyCounts[job.company_name].count++;
      companyCounts[job.company_name].statuses.add(job.status);
    });

    dashboardData.companies = Object.entries(companyCounts)
      .map(([name, data]) => ({
        name,
        applications: data.count,
        status: data.statuses.size > 1 ? 'Mixed' : Array.from(data.statuses)[0] || 'Saved', // Jika banyak status, sebut 'Mixed'
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5); 

    const locationCounts: { [key: string]: number } = {};
    jobs.forEach(job => {
      if (job.location) {
        locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
      }
    });
    const sortedLocations = Object.entries(locationCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 4); // Ambil 4 teratas

    dashboardData.locations = sortedLocations.map(([city, count]) => ({
      city,
      count,
      percentage: ((count / jobs.length) * 100).toFixed(0),
    }));

    const monthlyActivity: { [key: string]: { applications: number, interviews: number, offers: number } } = {};
    jobs.forEach(job => {
      const date = new Date(job.created_at!);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyActivity[monthYear]) {
        monthlyActivity[monthYear] = { applications: 0, interviews: 0, offers: 0 };
      }
      monthlyActivity[monthYear].applications++;
      if (job.status === 'Interview') monthlyActivity[monthYear].interviews++;
      if (job.status === 'Offer') monthlyActivity[monthYear].offers++;
    });

    const sortedMonths = Object.keys(monthlyActivity).sort();
    dashboardData.activityTrend = sortedMonths.map(month => ({
      month: new Date(month).toLocaleString('default', { month: 'short' }), // "Jan", "Feb"
      ...monthlyActivity[month],
    }));

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}