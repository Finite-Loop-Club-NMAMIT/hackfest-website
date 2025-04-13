import React, { useState } from 'react';
import { api } from '~/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import Spinner from '~/components/spinner'; // Assuming Spinner component exists

const AuditLogViewer: React.FC = () => {
  const [filterType, setFilterType] = useState<string | undefined>(undefined);

  // Fetch distinct audit types for the filter dropdown/select
  const { data: auditTypes, isLoading: isLoadingTypes } = api.audit.getDistinctAuditTypes.useQuery();

  // Fetch audit logs based on the selected filter
  const { data: auditLogs, isLoading, error, refetch } = api.audit.getFilteredAuditLog.useQuery(
    { auditType: filterType ?? undefined }, // Pass undefined if filter is empty/all
    {
      refetchOnWindowFocus: false, // Optional: prevent refetching on window focus
    }
  );

  const handleFilterChange = (value: string) => {
    // If 'ALL' is selected, set filterType to undefined to fetch all logs
    setFilterType(value === 'ALL' ? undefined : value);
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle>Audit Log Viewer</CardTitle>
        <div className="mt-4 flex items-center space-x-2">
           <Select onValueChange={handleFilterChange} defaultValue="ALL">
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Filter by Audit Type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {isLoadingTypes ? (
                 <SelectItem value="loading" disabled>Loading types...</SelectItem>
              ) : (
                 auditTypes?.map((type) => (
                   <SelectItem key={type} value={type}>
                     {type}
                   </SelectItem>
                 ))
              )}
            </SelectContent>
          </Select>
           <button onClick={() => refetch()} className="p-2 border rounded hover:bg-gray-700" title="Refresh Logs">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
             </svg>
           </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="flex justify-center p-4"><Spinner /></div>}
        {error && <p className="text-red-500 text-center p-4">Error loading logs: {error.message}</p>}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Audit Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs && auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.dateTime).toLocaleString()}</TableCell>
                      <TableCell>{log.sessionUser ?? 'N/A'}</TableCell>
                      <TableCell>{log.auditType}</TableCell>
                      <TableCell>{log.description}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No audit logs found matching the criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogViewer;
