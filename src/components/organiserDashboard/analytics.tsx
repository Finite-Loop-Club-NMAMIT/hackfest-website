//  import { useState, useEffect } from "react";
// import { api } from "~/utils/api";
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';


// /**
//  * Main Analytics component
//  * Handles data fetching, filtering, and visualization
//  */
// const Analytics = () => {
//   // State management for filters and data
//   type AnalyticsLog = {
//       id: number;
//       sessionUser: string | null;
//       uniqueId: string;
//       routePath: string;
//       isChecked: string;
//       timer: number | null;
//       startPing: Date;
//       lastPing: Date;
//       device: string;
//     };

//   const analyticsQuery = api.analytics.getAnalytics.useQuery();
//   const [filter, setFilter] = useState<string>("all");
//   const [captureFilter, setCaptureFilter] = useState<string>("all");
//   const [customDate, setCustomDate] = useState<string | null>(null);
//   const [eventFilter, setEventFilter] = useState<string>("all");
//   const [graphData, setGraphData] = useState<{ time: string; visits: number; unique: number; viewsPerUnique: number; avgTimeSpent: number }[]>([]);
//   const [growthData, setGrowthData] = useState<{ time: string; cumulativeVisits: number }[]>([]);
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const [selectedRoute, setSelectedRoute] = useState<string>("all");
//   const [routeAnalytics, setRouteAnalytics] = useState<{
//     hourlyTraffic: { hour: number; count: number }[];
//     deviceDistribution: { device: string; count: number }[];
//     averageTimeSpent: number;
//     bounceRate: number;
//     peakHours: { hour: number; count: number }[];
//     userRetention: number;
//   }>({
//     hourlyTraffic: [],
//     deviceDistribution: [],
//     averageTimeSpent: 0,
//     bounceRate: 0,
//     peakHours: [],
//     userRetention: 0,
//   });

//   const dateReferences: Record<string, Date> = { 
//     day1: new Date('2025-02-27'),
//     day2: new Date('2025-02-28'),
//     day3: new Date('2025-03-01'),
//   };

//   const analyticslog = analyticsQuery.data ?? [];

//   const filteredLogs =
//   filter === "all"
//     ? analyticslog.filter(
//         (log: AnalyticsLog) =>
//           log.routePath.includes("/") &&
//           log.isChecked === "yes" &&
//           log.sessionUser !== "" &&
//           log.sessionUser !== null
//     ) : filter === "custom" && customDate
//     ? analyticslog.filter((log: AnalyticsLog) => {
//         const logDate = new Date(log.startPing).toISOString().split("T")[0];
//         return logDate === customDate;
//       })
//     : analyticslog.filter((log: AnalyticsLog) => {
//         const logDate = new Date(log.startPing);
//         const dateReferenceKey = `day${filter}`;
//         const dateReference = dateReferences[dateReferenceKey];
//         return (
//           dateReference &&
//           logDate.toDateString() === dateReference.toDateString() &&
//           log.routePath.includes("/") &&
//           log.sessionUser !== "" &&
//           log.sessionUser !== null
//         );
//       });
//       const deviceCounts = filteredLogs.reduce(
//         (acc, log) => {
//           acc[log.device as keyof typeof acc] = (acc[log.device as keyof typeof acc] || 0) + 1;
//           return acc;
//         },
//         { tablet: 0, desktop: 0, mobile: 0 }
//       );
      
//       const data = {
//         labels: ["Tablet", "Desktop", "Mobile"],
//         datasets: [
//           {
//             data: [deviceCounts.tablet, deviceCounts.desktop, deviceCounts.mobile],
//             backgroundColor: ["#E0E0E0", "#A0A0A0", "#606060"], // Light gray, medium gray, dark gray
//             hoverBackgroundColor: ["#D0D0D0", "#909090", "#505050"], // Slightly darker on hover
//           },
//         ],
//       };
//       const options = {
//         plugins: {
//           legend: {
//             labels: {
//               color: "#FFFFFF", // White text for legend
//             },
//           },
//           tooltip: {
//             titleColor: "#FFFFFF", // White tooltip title
//             bodyColor: "#FFFFFF", // White tooltip text
//           },
//         },
//       };
      
      

//   const totalTimeSpent = filteredLogs.reduce((total, log) => total + (log.timer || 0), 0);
//   const averageTimeSpent = filteredLogs.length > 0 ? totalTimeSpent / filteredLogs.length : 0;
//   const hours = Math.floor(averageTimeSpent / 3600);
//   const minutes = Math.floor((averageTimeSpent % 3600) / 60);
//   const seconds = Math.floor(averageTimeSpent % 60);
//   const thours = Math.floor(totalTimeSpent / 3600);
//   const tminutes = Math.floor((totalTimeSpent % 3600) / 60);
//   const tseconds = Math.floor(totalTimeSpent % 60);

//         const validRoutes = [
//           "pronite", 
//           "your-snaps", 
//           "accolades",
//           "faculty",
//           "our-team", 
//           "about", 
//           "events", 
//           "/", 
//           "behindincridea",
//           "captures"
//         ];

//         const isValidRoute = validRoutes.some((route) => log.routePath.includes(route));

//         return (
//           isValidRoute && 
//           (filter === "all" || logDate.toDateString() === dateReference?.toDateString()) &&
//           log.isChecked === "yes"
//         );
//       })
//     : filteredLogs.filter((log) => {
//         const logDate = new Date(log.startPing);
//         const dateReferenceKey = `day${filter}`;
//         const dateReference = dateReferences[dateReferenceKey];

//         if (captureFilter === "/") {
//           return (
//             log.routePath === "/" && 
//             (filter === "all" || logDate.toDateString() === dateReference?.toDateString()) &&
//             log.isChecked === "yes"
//           );
//         }
//         if (captureFilter === "captures") {
//           return (
//             log.routePath === "/captures" &&
//             (filter === "all" || logDate.toDateString() === dateReference?.toDateString()) &&
//             log.isChecked === "yes"
//           );
//         }

//         if (captureFilter === "events") {
//           return (
//             log.routePath === "/captures/events" &&
//             (filter === "all" || logDate.toDateString() === dateReference?.toDateString()) &&
//             log.isChecked === "yes"
//           );
//         }

//         return (
//           log.routePath.includes(captureFilter) &&
//           (filter === "all" || logDate.toDateString() === dateReference?.toDateString()) &&
//           log.isChecked === "yes"
//         );
//     });

//   const routeVisits = filteredCaptures.length;
//   const uniqueRouteIDs = new Set(filteredCaptures.filter(log => log.isChecked === "yes").map((entry) => entry.session_user)).size;

//   const filteredEvents = eventFilter === "all"
//     ? filteredLogs.filter((log) => {
//         const logDate = new Date(log.startPing);
//         const dateReferenceKey = `day${filter}`;
//         const dateReference = dateReferences[dateReferenceKey];
//         return (
//           log.routePath.startsWith("/captures/events") && 
//           (filter === "all" || logDate.toDateString() === dateReference?.toDateString())
//         );
//       })
//     : filteredLogs.filter((log) => {
//         const logDate = new Date(log.startPing);
//         const dateReferenceKey = `day${filter}`;
//         const dateReference = dateReferences[dateReferenceKey];
//         return (
//           log.routePath === `/captures/events/${eventFilter}` && 
//           (filter === "all" || logDate.toDateString() === dateReference?.toDateString())
//         );
//       });

//   const eventVisits = filteredEvents.length;
//   const uniqueEventIPs = new Set(filteredEvents.map((entry) => entry.session_user)).size;

//   // Add new state for college analytics
//   const [collegeStats, setCollegeStats] = useState({
//     internal: 0,
//     external: 0,
//     internalDownloads: 0,
//     externalDownloads: 0,
//     internalPlaybackViews: 0,
//     externalPlaybackViews: 0
//   });

//   // Calculate college-based statistics
//   useEffect(() => {
//     const internal = verifiedusers.filter(user => user.college === "internal").length;
//     const external = verifiedusers.filter(user => user.college === "external").length;

//     // Get user IDs by college type
//     const internalIds = new Set(verifiedusers.filter(user => user.college === "internal").map(user => user.id));
//     const externalIds = new Set(verifiedusers.filter(user => user.college === "external").map(user => user.id));

//     // Calculate downloads by college type
//     const internalDownloads = filtereddLogs.filter(log => internalIds.has(Number(log.session_user))).length;
//     const externalDownloads = filtereddLogs.filter(log => externalIds.has(Number(log.session_user))).length;


//     // Calculate playback views by college type
//     const internalPlaybackViews = filteredpLogs.filter(log => internalIds.has(Number(log.session_user))).length;
//     const externalPlaybackViews = filteredpLogs.filter(log => externalIds.has(Number(log.session_user))).length;

//     setCollegeStats({
//       internal,
//       external,
//       internalDownloads,
//       externalDownloads,
//       internalPlaybackViews,
//       externalPlaybackViews
//     });
//   }, [verifiedusers, filtereddLogs, filteredpLogs]);

//   // Create college distribution chart data
//   const collegeDistributionData = {
//     labels: ['Internal', 'External'],
//     datasets: [{
//       label: 'Users by College Type',
//       data: [collegeStats.internal, collegeStats.external],
//       backgroundColor: ['#B0B0B0', '#606060'], // Light gray, dark gray
//       borderColor: ['#A0A0A0', '#505050'], // Slightly darker borders
//       borderWidth: 1
//     }]
//   };

//   // Create college engagement chart data
//   const collegeEngagementData = {
//     labels: ['Downloads', 'Story Views', 'Playback Views'],
//     datasets: [
//       {
//         label: 'Internal College',
//         data: [
//           collegeStats.internalDownloads,
//           collegeStats.internalPlaybackViews
//         ],
//         backgroundColor: monochromeColors.line.primary,
//         borderColor: 'rgba(255, 255, 255, 1)',
//         borderWidth: 1
//       },
//       {
//         label: 'External College',
//         data: [
//           collegeStats.externalDownloads,
//           collegeStats.externalPlaybackViews
//         ],
//         backgroundColor: monochromeColors.line.tertiary,
//         borderColor: 'rgba(200, 200, 200, 1)',
//         borderWidth: 1
//       }
//     ]
//   };

//   /**
//    * Effect hook for graph data processing
//    * Processes and formats data for various charts
//    */
//   useEffect(() => {
//     const visitData = filteredLogs.reduce<{ [key: string]: { visits: number; uniqueIPs: Set<string>; totalTime: number } }>(
//       (acc, log) => {
//         const dateObj = new Date(log.startPing);
//         const dateKey = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
//         const timeKey = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//         const combinedKey = `${dateKey} ${timeKey}`;

//         if (!acc[combinedKey]) {
//           acc[combinedKey] = { visits: 0, uniqueIPs: new Set(), totalTime: 0 };
//         }

//         acc[combinedKey].visits += 1;
//         acc[combinedKey].uniqueIPs.add(log.session_user);
//         acc[combinedKey].totalTime += log.timer ?? 0;

//         return acc;
//       },
//       {}
//     );

//     const timeSeriesData = Object.entries(visitData).map(([time, data]) => ({
//       time,
//       visits: data.visits,
//       unique: data.uniqueIPs.size,
//       viewsPerUnique: data.uniqueIPs.size ? data.visits / data.uniqueIPs.size : 0,
//       avgTimeSpent: data.visits > 0 ? data.totalTime / data.visits : 0, 
//     }));

//     setGraphData(timeSeriesData);

//     let cumulativeVisits = 0;
//     const growthSeriesData = timeSeriesData.map((data) => {
//       cumulativeVisits += data.visits;
//       return { time: data.time, cumulativeVisits };
//     });

//     setGrowthData(growthSeriesData);
//   }, [filteredLogs]);

//   const avgTimeSpentGraphData = {
//     labels: graphData.map((data) => data.time),
//     datasets: [
//       {
//         label: "Average Time Spent per Visit (s)",
//         data: graphData.map((data) => data.avgTimeSpent),
//         borderColor: monochromeColors.line.primary,
//         backgroundColor: monochromeColors.line.background,
//         ...lineChartBaseStyle
//       },
//     ],
//   };

//   const visitGraphData = {
//     labels: graphData.map((data) => data.time),
//     datasets: [
//       {
//         label: "Total Visits",
//         data: graphData.map((data) => data.visits),
//         borderColor: monochromeColors.line.secondary,
//         backgroundColor: monochromeColors.line.background,
//         ...lineChartBaseStyle
//       },
//     ],
//   };

//   const uniqueGraphData = {
//     labels: graphData.map((data) => data.time),
//     datasets: [
//       {
//         label: "Unique Visitors",
//         data: graphData.map((data) => data.unique),
//         borderColor: monochromeColors.line.tertiary,
//         backgroundColor: monochromeColors.line.background,
//         ...lineChartBaseStyle
//       },
//     ],
//   };

//   const viewsPerUniqueGraphData = {
//     labels: graphData.map((data) => data.time),
//     datasets: [
//       {
//         label: "Total Views per Unique View",
//         data: graphData.map((data) => data.viewsPerUnique),
//         borderColor: monochromeColors.line.quaternary,
//         backgroundColor: monochromeColors.line.background,
//         ...lineChartBaseStyle
//       },
//     ],
//   };

//   const growthGraphData = {
//     labels: growthData.map((data) => data.time),
//     datasets: [
//       {
//         label: "Cumulative Visits Growth",
//         data: growthData.map((data) => data.cumulativeVisits),
//         borderColor: monochromeColors.line.primary,
//         backgroundColor: monochromeColors.line.background,
//         ...lineChartBaseStyle
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: true, labels: { color: "white" } },
//       tooltip: { backgroundColor: "rgba(0, 0, 0, 0.7)", titleColor: "#fff", bodyColor: "#fff" },
//     },
//     scales: {
//       x: { ticks: { color: "white" } },
//       y: { ticks: { color: "white" } },
//     },
//   };
//   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedDate = e.target.value;
//     setCustomDate(selectedDate);
//     setFilter("custom");
//   };
//   // Grouping by routePath
//   const routeCounts = filteredLogs.reduce((acc, log) => {
//     acc[log.routePath] = (acc[log.routePath] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   // Time spent (sum of timers) per device
//   const deviceTimeSpent = filteredLogs.reduce((acc, log) => {
//     acc[log.device] = (acc[log.device] || 0) + (log.timer || 0);
//     return acc;
//   }, {} as Record<string, number>);

//   const devices = Object.keys(deviceCounts);
//   const counts = Object.values(deviceCounts);
//   const timeSpent = Object.values(deviceTimeSpent);
//   const routes = Object.keys(routeCounts);
//   const routeSessionCounts = Object.values(routeCounts);

//   // Pie Chart: Device Distribution
//   const pieData = {
//     labels: devices,
//     datasets: [{
//       label: 'Device Distribution',
//       data: counts,
//       backgroundColor: ['#E0E0E0', '#B0B0B0', '#808080', '#505050'], // Monochrome grays
//     }],
//   };

//   // Bar Chart: Sessions by Device
//   const barData = {
//     labels: devices,
//     datasets: [{
//       label: 'Sessions by Device',
//       data: counts,
//       backgroundColor: monochromeColors.bar.primary,
//       hoverBackgroundColor: monochromeColors.bar.hover,
//       borderColor: 'rgba(255, 255, 255, 1)',
//       borderWidth: 1
//     }],
//   };

//   // Line Chart: Timer Over Time for Each Device
//   const lineData = {
//     labels: filteredLogs.map(log => new Date(log.startPing).toLocaleString()),
//     datasets: devices.map((device, index) => ({
//       label: device,
//       data: filteredLogs.filter(log => log.device === device).map(log => log.timer ?? 0),
//       borderColor: monochromeColors.line[['primary', 'secondary', 'tertiary'][index] as 'primary' | 'secondary' | 'tertiary'],
//       backgroundColor: monochromeColors.line.background,
//       ...lineChartBaseStyle
//     })),
//   };

//   // Doughnut Chart: Time Spent per Device
//   const doughnutData = {
//     labels: devices,
//     datasets: [{
//       label: 'Time Spent per Device (ms)',
//       data: timeSpent,
//       backgroundColor: ['#E0E0E0', '#B0B0B0', '#808080', '#505050'], // Monochrome grays
//     }],
//   };

//  // Define the type if not imported
//  interface AnalyticsLog {
//   id: number;
//   session_user: string;
//   uniqueId: string;
//   routePath: string;
//   device: string;
//   timer: number | null; // Change from `number | undefined` to `number | null`
//   isChecked: string;
//   startPing: Date;
//   lastPing: Date;
// }


// // Radar Chart: Average Time per Device by Route
// const radarData = {
//   labels: routes,
//   datasets: devices.map(device => ({
//     label: device,
//     data: routes.map(route => {
//       const deviceRouteLogs = filteredLogs.filter((log: AnalyticsLog) => log.device === device && log.routePath === route);
//       const totalTime = deviceRouteLogs.reduce((acc: number, log: AnalyticsLog) => acc + (log.timer || 0), 0);
//       return totalTime / (deviceRouteLogs.length > 0 ? deviceRouteLogs.length : 1); // Avoid division by zero
//     }),
//     borderColor: '#FF5733',
//     backgroundColor: 'rgba(255, 87, 51, 0.2)',
//     fill: true,
//   })),
// };

//   useEffect(() => {
//     if (selectedRoute === "all") return;

//     const routeLogs = filteredLogs.filter(log => 
//       selectedRoute === "/" ? log.routePath === "/" : log.routePath.includes(selectedRoute)
//     );

//     // Calculate hourly traffic
//     const hourlyTraffic = Array.from({ length: 24 }, (_, hour) => ({
//       hour,
//       count: routeLogs.filter(log => new Date(log.startPing).getHours() === hour).length
//     }));

//     // Calculate device distribution
//     const devices = routeLogs.reduce((acc, log) => {
//       acc[log.device] = (acc[log.device] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     const deviceDistribution = Object.entries(devices).map(([device, count]) => ({
//       device,
//       count
//     }));

//     // Calculate average time spent
//     const averageTimeSpent = routeLogs.reduce((acc, log) => acc + (log.timer || 0), 0) / (routeLogs.length || 1);

//     // Calculate bounce rate (users who only visited once)
//     const uniqueUsers = new Set(routeLogs.map(log => log.session_user));
//     const bounceUsers = [...uniqueUsers].filter(user =>
//       routeLogs.filter(log => log.session_user === user).length === 1
//     );
//     const bounceRate = (bounceUsers.length / uniqueUsers.size) * 100;

//     // Find peak hours (top 3)
//     const peakHours = [...hourlyTraffic]
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 3);

//     // Calculate user retention (users who visited more than once)
//     const userRetention = 100 - bounceRate;

//     setRouteAnalytics({
//       hourlyTraffic,
//       deviceDistribution,
//       averageTimeSpent,
//       bounceRate,
//       peakHours,
//       userRetention,
//     });
//   }, [selectedRoute, filteredLogs]);

//   // Add these new chart configurations
//   const hourlyTrafficData = {
//     labels: routeAnalytics.hourlyTraffic.map(item => `${item.hour}:00`),
//     datasets: [{
//       label: 'Visits per Hour',
//       data: routeAnalytics.hourlyTraffic.map(item => item.count),
//       backgroundColor: monochromeColors.bar.primary,
//       hoverBackgroundColor: monochromeColors.bar.hover,
//       borderColor: 'rgba(255, 255, 255, 1)',
//       borderWidth: 1,
//     }]
//   };

//   const deviceDistributionData = {
//     labels: routeAnalytics.deviceDistribution.map(item => item.device),
//     datasets: [{
//       label: 'Device Distribution',
//       data: routeAnalytics.deviceDistribution.map(item => item.count),
//       backgroundColor: ['#E0E0E0', '#B0B0B0', '#808080', '#505050'], // Monochrome grays
//     }]
//   };

//   useEffect(() => {
//     if (status === 'authenticated' && session?.user?.role !== 'admin') {
//       void router.push('/');
//     }
//   }, [session, status, router]);

//   if (isLoading || galleryLoading || eventsLoading) {
//     return <CameraLoading />;
//   }


//   return (
//     <div className="p-6 mt-20 mb-20">
//       <h1 className="text-center text-4xl font-Trap-Black mb-8 text-white">Detailed Admin Analytics</h1>
//       <div className="flex justify-center gap-2">
//         <div className="flex justify-center mb-4 ">
//           <select
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             className="ml-2 border font-Trap-Regular border-gray-700 rounded-lg py-2 pl-3 pr-4 bg-neutral-950 text-white"
//           >
//             <option value="all">All Days</option>
//             <option value="1">Day 1</option>
//             <option value="2">Day 2</option>
//             <option value="3">Day 3</option>
//             <option value="custom">Custom</option>
//           </select>
//         </div>
//       </div>
//       <div className="flex justify-center gap-2">
//         <div className="flex justify-center mb-4">
//           {filter === "custom" && (
//             <input
//               type="date"
//               value={customDate || ""}
//               onChange={handleDateChange}
//               className="mt-4 border font-Trap-Regular border-gray-700 rounded-lg py-2 px-4 bg-neutral-950 text-white"
//             />
//           )}
//         </div>
//       </div>
            
//       <div className="overflow-x-auto mt-5 font-Trap-Regular">
//         <table className="min-w-full text-white">
//           <thead className="bg-gray-700">
//             <tr>
//               <th className="p-2 w-1/3">Routes</th>
//               <th className="p-2 w-1/3">Total Visits</th>
//               <th className="p-2 w-1/3">Unique Visitors</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td className="p-2 text-center w-1/3">
//                 <select
//                   value={captureFilter}
//                   onChange={(e) => setCaptureFilter(e.target.value)}
//                   className="border font-Trap-Regular border-gray-700 rounded-lg py-2 pl-3 pr-4 bg-neutral-950 text-white"
//                 >
//                   <option value="all">All Routes</option>
//                   <option value="/">Home</option>
//                   <option value="captures">Captures</option>
//                   <option value="events">Events</option>
//                   <option value="shaan">Shaan</option>
//                   <option value="masalacoffee">Masala Coffee</option>
//                   <option value="accolades">Accolades</option>
//                   <option value="faculty">Faculty</option>
//                   <option value="your-snaps">Your Snaps</option>
//                   <option value="behindincridea">Behind Incridea</option>
//                   <option value="our-team">Our Team</option>
//                   <option value="about">About</option>
                  
                  
//                 </select>
//               </td>
//               <td className="p-2 text-center w-1/3">{routeVisits}</td>
//               <td className="p-2 text-center w-1/3">{uniqueRouteIDs}</td>
//             </tr>
//           </tbody>
//         </table>
//         </div>

//         <div className="overflow-x-auto mt-5 mb-5">
//         <table className="min-w-full text-white font-Trap-Regular">
//           <thead className="bg-gray-700">
//             <tr>
//               <th className="p-2 w-1/3">Events</th>
//               <th className="p-2 w-1/3">Total Visits</th>
//               <th className="p-2 w-1/3">Unique Visitors</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td className="p-2 text-center w-1/3">
//                 <select
//                   value={eventFilter}
//                   onChange={(e) => setEventFilter(e.target.value)}
//                   className="border font-Trap-Regular border-gray-700 rounded-lg py-2 pl-3 pr-4 bg-neutral-950 text-white"
//                 >
//                   <option value="all">All Events</option>
//                   {events.map((event) => {
//                     const formattedEventName = event.name.split(' ').join('-'); // Split by space and join with hyphen
//                     return (
//                       <option key={event.id} value={formattedEventName}>
//                         {formattedEventName}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </td>
//               <td className="p-2 text-center w-1/3">{eventVisits}</td>
//               <td className="p-2 text-center w-1/3">{uniqueEventIPs}</td>              
//             </tr>
//           </tbody>
//         </table>
//         </div>
//       <div className="overflow-x-auto">
//         <table className="min-w-full text-white font-Trap-Regular">
//           <tbody>
//           <tr>
//               <td className="py-2 px-4 border-b">Total Users Logged</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{users.length}</td>
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Total Verfied Users</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{verifiedusers.length}</td>
//             </tr>
//             <tr>
//               <td className="py-6"></td>
//               <td className="py-6"></td>
//               <td className="py-6"></td>
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Total Web Visits</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{filteredLogs.length}</td>
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Total Unique Visitors</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{new Set(filteredLogs.map((entry) => entry.session_user)).size}</td>
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Total Time Spent</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{thours} hours {tminutes} minutes {tseconds} seconds</td> 
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Average Time Spent</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{hours} hours {minutes} minutes {seconds} seconds</td> 
//             </tr>
//             <tr>
//               <td className="py-6"></td>
//               <td className="py-6"></td>
//               <td className="py-6"></td>
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Total Captures</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{filteredGallery.length}</td> 
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Total Captures Downloads</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{filtereddLogs.length}</td> 
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Unique Captures Download ID's</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{new Set(filtereddLogs.map((entry) => entry.session_user)).size}</td> 
//             </tr>
//                         <tr>
//               <td className="py-6"></td>
//               <td className="py-6"></td>
//               <td className="py-6"></td>
//             </tr>            
//             <tr>
//               <td className="py-6"></td>
//               <td className="py-6"></td>
//               <td className="py-6"></td>
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Total Playbacks</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{filteredPlaybacks.length}</td> 
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Total Playbacks Downloads</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{filteredpLogs.length}</td> 
//             </tr>
//             <tr>
//               <td className="py-2 px-4 border-b">Unique Playbacks Download ID's</td>
//               <td className="py-2 px-4 border-b"></td>
//               <td className="py-2 px-4 border-b">{new Set(filteredpLogs.map((entry) => entry.session_user)).size}</td> 
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-20 w-full h-56 mx-auto p-4 rounded-2xl font-Trap-Regular">
//         <h3 className="text-center text-2xl text-white mb-4">Visits Growth Rate</h3>
//         <Line data={growthGraphData} options={chartOptions} />
//       </div>

//       <div className="mt-20 w-full h-56 mx-auto p-4 rounded-2xl font-Trap-Regular">
//         <h3 className="text-center text-2xl text-white mb-4">Average Time Spent per Visit</h3>
//         <Line data={avgTimeSpentGraphData} options={chartOptions} />
//       </div>

//       <div className="mt-20 w-full h-56 mx-auto p-4 rounded-2xl font-Trap-Regular">
//         <h3 className="text-center text-2xl text-white mb-4">Total Visits Over Time</h3>
//         <Line data={visitGraphData} options={chartOptions} />
//       </div>

//       <div className="mt-20 w-full h-56 mx-auto p-4 rounded-2xl font-Trap-Regular">
//         <h3 className="text-center text-2xl text-white mb-4">Unique Visitors Over Time</h3>
//         <Line data={uniqueGraphData} options={chartOptions} />
//       </div>

//       <div className="mt-20 w-full h-56 mx-auto p-4 rounded-2xl font-Trap-Regular">
//         <h3 className="text-center text-2xl text-white mb-4">Views per Unique Visitor Over Time</h3>
//         <Line data={viewsPerUniqueGraphData} options={chartOptions} />
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 place-items-center py-20 gap-20">
//         {/* Bar Chart - Full Width */}
//         <div className="col-span-1 md:col-span-2 w-full max-w-4xl">
//           <Bar data={barData} options={options}/>
//         </div>

//         {/* Line Chart - Full Width */}
//         <div className="col-span-1 md:col-span-2 w-full max-w-4xl">
//           <Line data={lineData} />
//         </div>

//         {/* Pie Chart (Half Width) */}
//         <div className="col-span-1 w-full max-w-sm">
//           <Pie data={pieData} options={options}/>
//         </div>

//         {/* Doughnut Chart (Half Width) */}
//         <div className="col-span-1 w-full max-w-sm">
//           <Doughnut data={doughnutData} />
//         </div>
//       </div>

//       {/* Add college analytics section before the final closing div */}
//       <div className="mt-20">
//         <h2 className="text-center text-3xl font-Trap-Black mb-8 text-white">College-wise Analytics</h2>
        
//         <div className="overflow-x-auto mb-10">
//           <table className="min-w-full text-white font-Trap-Regular">
//             <thead className="bg-gray-700">
//               <tr>
//                 <th className="p-2 text-left">Metric</th>
//                 <th className="p-2 text-left">Internal</th>
//                 <th className="p-2 text-left">External</th>
//                 <th className="p-2 text-left">Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td className="p-2">Verified Users</td>
//                 <td className="p-2">{collegeStats.internal}</td>
//                 <td className="p-2">{collegeStats.external}</td>
//                 <td className="p-2">{collegeStats.internal + collegeStats.external}</td>
//               </tr>
//               <tr>
//                 <td className="p-2">Downloads</td>
//                 <td className="p-2">{collegeStats.internalDownloads}</td>
//                 <td className="p-2">{collegeStats.externalDownloads}</td>
//                 <td className="p-2">{collegeStats.internalDownloads + collegeStats.externalDownloads}</td>
//               </tr>
//               <tr>
//                 <td className="p-2">Playback Views</td>
//                 <td className="p-2">{collegeStats.internalPlaybackViews}</td>
//                 <td className="p-2">{collegeStats.externalPlaybackViews}</td>
//                 <td className="p-2">{collegeStats.internalPlaybackViews + collegeStats.externalPlaybackViews}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//           <div className="w-full h-96">
//             <h3 className="text-center text-xl text-white mb-4">User Distribution by College</h3>
//             <Doughnut 
//               data={collegeDistributionData}
//               options={{
//                 ...chartOptions,
//                 plugins: {
//                   ...chartOptions.plugins,
//                   title: {
//                     display: true,
//                     text: 'Internal vs External College Users',
//                     color: 'white'
//                   }
//                 }
//               }}
//             />
//           </div>
          
//           <div className="w-full h-96">
//             <h3 className="text-center text-xl text-white mb-4">Engagement by College Type</h3>
//             <Bar 
//               data={collegeEngagementData}
//               options={{
//                 ...chartOptions,
//                 plugins: {
//                   ...chartOptions.plugins,
//                   title: {
//                     display: true,
//                     text: 'Engagement Metrics by College Type',
//                     color: 'white'
//                   }
//                 }
//               }}
//             />
//           </div>
//         </div>
//       </div>

//        <div className="mt-20 max-h-[1200px] overflow-y-auto">
//         <h2 className="text-center text-3xl font-Trap-Black mb-8 text-white sticky top-0 py-4 z-10">
//           Route-specific Analytics
//         </h2>
        
//         <div className="flex justify-center mb-8 sticky top-16 py-4 z-10">
//           <select
//             value={selectedRoute}
//             onChange={(e) => setSelectedRoute(e.target.value)}
//             className="border font-Trap-Regular border-gray-700 rounded-lg py-2 pl-3 pr-4  text-white"
//           >
//             <option value="all">Select Route</option>
//             <option value="/">Home</option>
//             <option value="captures">Captures</option>
//             <option value="events">Events</option>
//             <option value="shaan">Shaan</option>
//             <option value="masalacoffee">Masala Coffee</option>
//             <option value="accolades">Accolades</option>
//             <option value="faculty">Faculty</option>
//             <option value="your-snaps">Your Snaps</option>
//             <option value="behindincridea">Behind Incridea</option>
//             <option value="our-team">Our Team</option>
//             <option value="about">About</option>
//           </select>
//         </div>

//         {selectedRoute !== "all" && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
//             {/* Stats Cards */}
//             <div className="bg-gray-800 rounded-lg p-6 h-[400px] overflow-y-auto">
//               <h3 className="text-xl text-white mb-4 sticky top-0 bg-gray-800 py-2">Key Metrics</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-700 p-4 rounded-lg">
//                   <p className="text-gray-400">Avg. Time Spent</p>
//                   <p className="text-2xl text-white">
//                     {Math.floor(routeAnalytics.averageTimeSpent / 60)}m {Math.floor(routeAnalytics.averageTimeSpent % 60)}s
//                   </p>
//                 </div>
//                 <div className="bg-gray-700 p-4 rounded-lg">
//                   <p className="text-gray-400">Bounce Rate</p>
//                   <p className="text-2xl text-white">{routeAnalytics.bounceRate.toFixed(1)}%</p>
//                 </div>
//                 <div className="bg-gray-700 p-4 rounded-lg">
//                   <p className="text-gray-400">User Retention</p>
//                   <p className="text-2xl text-white">{routeAnalytics.userRetention.toFixed(1)}%</p>
//                 </div>
//                 <div className="bg-gray-700 p-4 rounded-lg">
//                   <p className="text-gray-400">Peak Hours</p>
//                   <p className="text-sm text-white">
//                     {routeAnalytics.peakHours.map(peak => `${peak.hour}:00 (${peak.count})`).join(', ')}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Hourly Traffic Chart */}
//             <div className="bg-gray-800 rounded-lg p-6 h-[400px]">
//               <h3 className="text-xl text-white mb-4 sticky top-0 bg-gray-800 py-2">Hourly Traffic</h3>
//               <div className="h-[320px]">
//                 <Bar data={hourlyTrafficData} options={{
//                   ...chartOptions,
//                   maintainAspectRatio: false,
//                   scales: {
//                     ...chartOptions.scales,
//                     y: {
//                       beginAtZero: true,
//                       ticks: { color: "white" }
//                     }
//                   }
//                 }} />
//               </div>
//             </div>

//             {/* Device Distribution Chart */}
//             <div className="bg-gray-800 rounded-lg p-6 h-[400px] md:col-span-2">
//               <h3 className="text-xl text-white mb-4 sticky top-0 bg-gray-800 py-2">Device Distribution</h3>
//               <div className="h-[320px]">
//                 <Doughnut 
//                   data={deviceDistributionData} 
//                   options={{
//                     ...chartOptions,
//                     maintainAspectRatio: false
//                   }} 
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Analytics;
