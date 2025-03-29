import { useState } from "react";
import { LineWobble } from '@uiball/loaders';
import { api } from "~/utils/api";
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from "recharts";
import { 
  ClockIcon, 
  UsersIcon, 
  GlobeAltIcon, 
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  UserCircleIcon,
  UserIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

// Types for our analytics data
interface UserTypeDevices {
  desktop: number;
  mobile: number;
  tablet: number;
}

interface RouteAnalytics {
  visits: number;
  uniqueLoggedInUsers: number;
  totalTime: number;
  avgTimePerVisit: number;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  loggedIn: {
    visits: number;
    uniqueUsers: number;
    totalTime: number;
    avgTimePerVisit: number;
    devices: UserTypeDevices;
  };
  anonymous: {
    visits: number;
    totalTime: number;
    avgTimePerVisit: number;
    devices: UserTypeDevices;
  };
  retention: {
    rate: number;
  };
  bounce: {
    rate: number;
  };
}

interface AnalyticsData {
  globalMetrics: {
    totalVisits: number;
    uniqueLoggedInUsers: number;
    totalTimeSpent: number;
    avgTimePerVisit: number;
    loggedIn: {
      visits: number;
      uniqueUsers: number;
      totalTime: number;
      avgTimePerVisit: number;
    };
    anonymous: {
      visits: number;
      totalTime: number;
      avgTimePerVisit: number;
    };
    retention: {
      overall: number;
      loggedIn: {
        returningUsers: number;
      };
    };
    bounce: {
      overall: number;
      loggedIn: {
        rate: number;
      };
      anonymous: {
        rate: number;
      };
    };
  };
  routeAnalytics: Record<string, RouteAnalytics>;
}

type UserViewMode = "all" | "loggedIn" | "anonymous";

// Define an array of allowed routes to display
const ALLOWED_ROUTES = ["/contact", "/about", "/profile", "/register", "/timeline", "/results", "/"];

// Format route name helper function
const formatRouteName = (path: string): string => {
  if (path === "/") return "HOMEPAGE";
  return path.replace("/", "").toUpperCase();
};

// Add tooltips for metric explanations
const METRIC_TOOLTIPS = {
  retention: "Percentage of logged-in users who return to the site across different sessions",
  bounce: "Percentage of visits where users leave after viewing only one page",
};

// Reusable metric card component
const MetricCard = ({ 
  title, 
  value, 
  icon, 
  suffix = "", 
  bgColor = "bg-indigo-600",
  compareData = null,
  children = null
}: { 
  title: string | React.ReactNode; 
  value: number | string; 
  icon: React.ReactNode; 
  suffix?: string;
  bgColor?: string;
  compareData?: { 
    loggedIn: number | string; 
    anonymous: number | string;
  } | null;
  children?: React.ReactNode;
}) => (
  <div className="relative overflow-hidden rounded-lg p-8 shadow transition-all duration-300 hover:shadow-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-full ${bgColor} p-3`}>
          {icon}
        </div>
        <div className="ml-5 w-full">
          <h3 className="text-base font-medium text-white">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix && <span className="ml-1 text-sm text-white/70">{suffix}</span>}
            </p>
          </div>
        </div>
      </div>
      {compareData && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <UserCircleIcon className="mr-1 h-4 w-4 text-indigo-300" />
            <span className="text-white">Logged-in: </span>
            <span className="ml-1 font-medium text-white">
              {typeof compareData.loggedIn === 'number' ? compareData.loggedIn.toLocaleString() : compareData.loggedIn}
            </span>
          </div>
          <div className="flex items-center">
            <UserIcon className="mr-1 h-4 w-4 text-purple-300" />
            <span className="text-white">Anonymous: </span>
            <span className="ml-1 font-medium text-white">
              {typeof compareData.anonymous === 'number' ? compareData.anonymous.toLocaleString() : compareData.anonymous}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  </div>
);

// Add new metric components
const PercentageIndicator = ({ value }: { value: number }) => (
  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 bg-opacity-20">
    <div 
      className="h-full bg-current transition-all duration-500 ease-in-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const MetricTooltip = ({ text }: { text: string }) => (
  <div className="group relative ml-2">
    <div className="cursor-help rounded-full border border-white/20 p-1">
      <svg className="h-3 w-3 text-white/50" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    </div>
    <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
      {text}
    </div>
  </div>
);

const BarChartMetric = ({ 
  data, 
  title,
  valueFormatter = (value: number) => value.toString()
}: { 
  data: Array<{ name: string; value: number; color: string }>;
  title: string;
  valueFormatter?: (value: number) => string;
}) => (
  <div className="h-48 w-full">
    <h4 className="mb-2 text-sm font-medium text-white/70">{title}</h4>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), title]}
          contentStyle={{ background: '#1f2937', border: 'none' }}
          labelStyle={{ color: 'white' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const RouteAnalyticsCard = ({ routePath, analytics, viewMode }: { 
  routePath: string; 
  analytics: RouteAnalytics;
  viewMode: UserViewMode;
}) => {
  const [activeTab, setActiveTab] = useState<UserViewMode>(viewMode);

  const getData = () => {
    switch(activeTab) {
      case "loggedIn":
        return analytics.loggedIn;
      case "anonymous":
        return {
          ...analytics.anonymous,
          uniqueUsers: undefined // Add uniqueUsers property for type consistency
        };
      default:
        return {
          visits: analytics.visits,
          uniqueUsers: analytics.uniqueLoggedInUsers,
          totalTime: analytics.totalTime,
          avgTimePerVisit: analytics.avgTimePerVisit,
          devices: analytics.devices
        };
    }
  };

  const currentData = getData();
  
  const deviceData = [
    { name: 'Desktop', value: currentData.devices.desktop, color: '#4F46E5' },
    { name: 'Mobile', value: currentData.devices.mobile, color: '#06B6D4' },
    { name: 'Tablet', value: currentData.devices.tablet, color: '#8B5CF6' }
  ];

  const metricData = [
    { name: 'Retention Rate', value: analytics.retention.rate, color: '#2563eb' },
    { name: 'Bounce Rate', value: analytics.bounce.rate, color: '#dc2626' }
  ];

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="relative overflow-hidden rounded-lg shadow transition-all duration-300 hover:shadow-lg">
      <div className="p-8">
        <div className="mb-8 flex justify-between">
          <h3 className="text-lg font-medium text-white">
            {formatRouteName(routePath)}
          </h3>
          <span className="rounded-full bg-indigo-500/20 px-4 py-1.5 text-xs font-medium text-white">
            {currentData.visits} visits
          </span>
        </div>
        
        <div className="mb-8">
          <nav className="-mb-px flex space-x-6" aria-label="User type tabs">
            <button
              onClick={() => setActiveTab("all")}
              className={`whitespace-nowrap px-1 py-2 text-sm font-medium ${
                activeTab === "all"
                  ? "text-indigo-400"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <EyeIcon className="mr-1 h-4 w-4" />
                All Users
              </div>
            </button>
            <button
              onClick={() => setActiveTab("loggedIn")}
              className={`whitespace-nowrap px-1 py-2 text-sm font-medium ${
                activeTab === "loggedIn"
                  ? "text-indigo-400"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <UserCircleIcon className="mr-1 h-4 w-4" />
                Logged-in ({analytics.loggedIn.visits})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("anonymous")}
              className={`whitespace-nowrap px-1 py-2 text-sm font-medium ${
                activeTab === "anonymous"
                  ? "text-indigo-400"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <UserIcon className="mr-1 h-4 w-4" />
                Anonymous ({analytics.anonymous.visits})
              </div>
            </button>
          </nav>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-white/70">Total Visits</p>
            <p className="text-xl font-semibold text-white">{currentData.visits}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">Unique Users</p>
            <p className="text-xl font-semibold text-white">{currentData.uniqueUsers ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">Avg. Time</p>
            <p className="text-xl font-semibold text-white">
              {formatTime(Math.round(currentData.avgTimePerVisit))}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">Total Time</p>
            <p className="text-xl font-semibold text-white">
              {formatTime(currentData.totalTime)}
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <BarChartMetric
            title="Device Usage"
            data={deviceData}
            valueFormatter={(value) => `${value} visits`}
          />
          <BarChartMetric
            title="Engagement Metrics"
            data={metricData}
            valueFormatter={(value) => `${value.toFixed(1)}%`}
          />
        </div>
      </div>
    </div>
  );
};

// Main component
export default function AnalyticsTab() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter] = useState("");
  const [sortBy] = useState<"visits" | "time">("visits");
  const [viewMode, setViewMode] = useState<UserViewMode>("all");

  const { isLoading: isApiLoading, refetch } = api.analytics.getDeepAnalytics.useQuery(undefined, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setAnalyticsData(data);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    }
  });

  const handleRefresh = () => {
    setIsLoading(true);
    void refetch();
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ${seconds % 60} sec`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hr ${minutes % 60} min`;
  };

  if (isLoading || isApiLoading) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-6">
        <LineWobble size={100} color="#4F46E5" />
        <p className="text-xl font-medium text-gray-600">
          Loading analytics data...
        </p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-6 p-8">
        <div className="rounded-full border border-red-200 p-6">
          <svg className="h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Failed to load analytics
        </h2>
        <p className="text-center text-gray-600">
          There was an error retrieving the analytics data. Please try again.
        </p>
        <button
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <ArrowPathIcon className="mr-2 h-5 w-5" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  const { 
    globalMetrics: { 
      totalVisits, 
      uniqueLoggedInUsers, 
      totalTimeSpent, 
      avgTimePerVisit,
      loggedIn,
      anonymous
    }, 
    routeAnalytics 
  } = analyticsData;

  // Filter to only include allowed routes
  const filteredRouteAnalytics = Object.keys(routeAnalytics)
    .filter(route => ALLOWED_ROUTES.includes(route))
    .reduce((acc, route) => {
      if (routeAnalytics[route]) {
        acc[route] = routeAnalytics[route];
      }
      return acc;
    }, {} as Record<string, RouteAnalytics>);

  const routes = Object.keys(filteredRouteAnalytics)
    .filter(route => !filter || route.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const routeA = filteredRouteAnalytics[a];
      const routeB = filteredRouteAnalytics[b];
      
      if (!routeA || !routeB) return 0;
      
      if (sortBy === "visits") {
        return routeB.visits - routeA.visits;
      } else {
        return routeB.totalTime - routeA.totalTime;
      }
    });

  return (
    <div className="flex flex-col space-y-12 p-8">
      <div className="w-full">
        <div className="mb-12 flex flex-col items-center justify-between space-y-6">
          <h1 className="text-4xl font-bold text-white">Analytics Dashboard</h1>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <ArrowPathIcon className="mr-2 h-5 w-5" aria-hidden="true" />
            Refresh
          </button>
        </div>

        {/* User type selector */}
        <div className="mb-12">
          <div className="rounded-md p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-white">User Type View</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setViewMode("all")}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    viewMode === "all"
                      ? "bg-indigo-600 text-white"
                      : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  <EyeIcon className="mr-1.5 h-4 w-4" />
                  All Users
                </button>
                <button
                  onClick={() => setViewMode("loggedIn")}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    viewMode === "loggedIn"
                      ? "bg-indigo-600 text-white"
                      : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  <UserCircleIcon className="mr-1.5 h-4 w-4" />
                  Logged-in Users
                </button>
                <button
                  onClick={() => setViewMode("anonymous")}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    viewMode === "anonymous"
                      ? "bg-indigo-600 text-white"
                      : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  <UserIcon className="mr-1.5 h-4 w-4" />
                  Anonymous Users
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Visits"
            value={viewMode === "all" ? totalVisits : viewMode === "loggedIn" ? loggedIn.visits : anonymous.visits}
            icon={<GlobeAltIcon className="h-6 w-6 text-white" aria-hidden="true" />}
            bgColor="bg-indigo-600"
            compareData={viewMode === "all" ? {
              loggedIn: loggedIn.visits,
              anonymous: anonymous.visits
            } : null}
          />
          <MetricCard
            title="Unique Logged-in Users"
            value={viewMode === "all" ? uniqueLoggedInUsers : viewMode === "loggedIn" ? loggedIn.uniqueUsers : "-"}
            icon={<UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />}
            bgColor="bg-cyan-600"
          />
          <MetricCard
            title="Total Time Spent"
            value={viewMode === "all" ? formatTime(totalTimeSpent) : viewMode === "loggedIn" ? formatTime(loggedIn.totalTime) : formatTime(anonymous.totalTime)}
            icon={<ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />}
            bgColor="bg-purple-600"
            compareData={viewMode === "all" ? {
              loggedIn: formatTime(loggedIn.totalTime),
              anonymous: formatTime(anonymous.totalTime)
            } : null}
          />
          <MetricCard
            title="Average Time Per Visit"
            value={viewMode === "all" ? formatTime(Math.round(avgTimePerVisit)) : viewMode === "loggedIn" ? formatTime(Math.round(loggedIn.avgTimePerVisit)) : formatTime(Math.round(anonymous.avgTimePerVisit))}
            icon={<ArrowTrendingUpIcon className="h-6 w-6 text-white" aria-hidden="true" />}
            bgColor="bg-emerald-600"
            compareData={viewMode === "all" ? {
              loggedIn: formatTime(Math.round(loggedIn.avgTimePerVisit)),
              anonymous: formatTime(Math.round(anonymous.avgTimePerVisit))
            } : null}
          />
          <MetricCard
            title={
              <div className="flex items-center">
                Retention Rate
                <MetricTooltip text={METRIC_TOOLTIPS.retention} />
              </div>
            }
            value={`${analyticsData.globalMetrics.retention.overall.toFixed(1)}%`}
            icon={<UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />}
            bgColor="bg-blue-600"
            compareData={viewMode === "all" ? {
              loggedIn: `${analyticsData.globalMetrics.retention.loggedIn.returningUsers} returning`,
              anonymous: "N/A"
            } : null}
          >
            <PercentageIndicator value={analyticsData.globalMetrics.retention.overall} />
          </MetricCard>
          <MetricCard
            title={
              <div className="flex items-center">
                Bounce Rate
                <MetricTooltip text={METRIC_TOOLTIPS.bounce} />
              </div>
            }
            value={`${analyticsData.globalMetrics.bounce.overall.toFixed(1)}%`}
            icon={<ArrowTrendingUpIcon className="h-6 w-6 text-white" aria-hidden="true" />}
            bgColor="bg-rose-600"
            compareData={viewMode === "all" ? {
              loggedIn: `${analyticsData.globalMetrics.bounce.loggedIn.rate.toFixed(1)}%`,
              anonymous: `${analyticsData.globalMetrics.bounce.anonymous.rate.toFixed(1)}%`
            } : null}
          >
            <PercentageIndicator value={analyticsData.globalMetrics.bounce.overall} />
          </MetricCard>
        </div>

        {/* Route Analytics */}
        <div>
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white">Page Analytics</h2>
          </div>

          <div className="grid gap-10 md:grid-cols-1 lg:grid-cols-2">
            {routes.map((routePath) => {
              const analytics = filteredRouteAnalytics[routePath];
              return analytics ? (
                <RouteAnalyticsCard
                  key={routePath}
                  routePath={routePath}
                  analytics={analytics}
                  viewMode={viewMode}
                />
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
