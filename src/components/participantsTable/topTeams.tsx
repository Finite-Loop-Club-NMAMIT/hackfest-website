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
import { Button } from "../ui/button";
import { toast } from "sonner";
import type { IdeaSubmission, Team } from "@prisma/client";
import type { superValidatorRouter } from "~/server/api/routers/super-validator";
import { Badge } from "../ui/badge";

interface MembersRow {
  members: { college: { name: string } }[];
}

export default function TopTeams({
  data,
  dataRefecth,
}: {
  data:
    | inferRouterOutputs<typeof superValidatorRouter>["getTop100"]
    | null
    | undefined;
  dataRefecth: () => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const moveToTop100 = api.team.moveToTop100.useMutation({
    onSuccess: async () => {
      dataRefecth();
      toast.success("Moved to Top 100");
      toast.dismiss("moveToTop100");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const moveToTop60 = api.team.moveToTop60.useMutation({
    onSuccess: async () => {
      dataRefecth();
      toast.success("Moved to Top 60");
      toast.dismiss("moveToTop60");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

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

  const resetProgress = api.team.resetToTop100.useMutation({
    onSuccess: async () => {
      dataRefecth();
      toast.success("Progress Reset");
      toast.dismiss("resetProgress");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  if (resetProgress.isLoading) {
    toast.loading("Resetting Progress", { id: "resetProgress" });
  }
  if (moveToTop60.isLoading) {
    toast.loading("Moving to Top 60", { id: "moveToTop60" });
  }

  if (moveToTop100.isLoading) {
    toast.loading("Moving to Top 100", { id: "moveToTop100" });
  }

  const verifyUser = api.user.verifyUser.useMutation();

  const columns: ColumnDef<
    unknown,
    inferRouterOutputs<typeof teamRouter>["getTeamsList"]
  >[] = [
    {
      accessorKey: "name",
      header: "Team Name",
    },
    {
      accessorKey: "ideaSubmission",
      header: "Actions",
      cell: (cell) => {
        return (
          <>
            <a
              href={(cell.cell.row.original as Team & {ideaSubmission: IdeaSubmission | null}).ideaSubmission?.pptUrl?.split(";")[0]}
              target="_blank"
            >
              <Button>View PDF</Button>
            </a>
          </>
        );
      },
    },
    {
      accessorKey: "teamProgress",
      header: "Status",
      cell: (cell) => {
        const team = cell.cell.row.original as Team;
        const isSelected = team.teamProgress === "SELECTED";
        return (
          <Button
            variant={isSelected ? "destructive" : "default"}
            className="w-42"
            onClick={async () => {
              if (isSelected) {
                await resetProgress.mutateAsync({ teamId: team.id });
              } else {
                await moveToTop60.mutateAsync({ teamId: team.id });
              }
            }}
          >
            {isSelected ? "Remove from Top 60" : "Move to Top 60"}
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data as unknown[] ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    // onRowSelectionChange: getSelection,
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
                <TableHead>Sl. No</TableHead>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  <TableCell>{parseInt(row.id) + 1}</TableCell>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
