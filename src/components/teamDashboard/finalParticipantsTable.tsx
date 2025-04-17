/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import {
  TableCell,
  TableHead,
  TableRow,
  Table,
  TableBody,
  TableHeader,
} from "~/components/ui/table";
import { api } from "~/utils/api";
import { type inferRouterOutputs } from "@trpc/server";
import { type teamRouter } from "~/server/api/routers/team";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type VisibilityState,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import type { Team } from "@prisma/client";
import { TickButton, WrongButton } from "~/components/ui/monochrome-buttons";

interface TeamWithMembers extends Team {
  Members: {
    id: string;
    name: string;
    email: string;
    isLeader: boolean;
  }[];
}

export default function FinalParticipantsTable({
  data,
  dataRefecth,
}: {
  data:
    | inferRouterOutputs<typeof teamRouter>["getAttendanceList"]
    | null
    | undefined;
  dataRefecth: () => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const toggleAttendance = api.team.toggleAttendance.useMutation({
    onSuccess: () => {
      toast.dismiss("attendanceToast");
      toast.success("Attendance Updated");
      dataRefecth();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  async function ToggleAttendance(id: string) {
    await toggleAttendance.mutateAsync({
      teamId: id,
    });
  }

  if (toggleAttendance.isLoading) {
    toast.loading("Updating Attendance", { id: "attendanceToast" });
  }

  const columns: ColumnDef<
    unknown,
    inferRouterOutputs<typeof teamRouter>["getAttendanceList"]
  >[] = [
    {
      id: "index",
      header: "ID",
      cell: (cell) => cell.row.index,
    },
    {
      accessorKey: "name",
      header: "Team Name",
    },
    {
      accessorKey: "teamNo",
      header: "Team Number", 
      cell: (cell) => {
        const team = cell.cell.row.original as Team;
        return (
          <span className="font-medium text-primary px-2 py-1 rounded-md bg-primary/10">
            {team.teamNo}
          </span>
        );
      },
    },
    {
      accessorKey: "Members",
      header: "Team Members",
      cell: (cell) => {
        const team = cell.cell.row.original as TeamWithMembers;
        return (
          <div className="flex flex-col gap-1">
            {team.Members && team.Members.length > 0 ? (
              team.Members.map((member) => (
                <div key={member.id} className="flex items-center">
                  <span className={member.isLeader ? "font-bold" : ""}>
                    {member.name} {member.isLeader && "(Leader)"}
                  </span>
                </div>
              ))
            ) : (
              <span>No Members</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "",
      header: "Actions",
      cell: (cell) => {
        const team = cell.cell.row.original as Team;
        return (
          <div className="flex justify-center">
            {!team.attended ? (
              <button
                onClick={async () => {
                  await ToggleAttendance(team.id);
                }}
                className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                PRESENT
              </button>
            ) : (
              <button
                onClick={async () => {
                  await ToggleAttendance(team.id);
                }}
                className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                ABSENT
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>
      <div className="flex flex-col items-center justify-center rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Teams Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
