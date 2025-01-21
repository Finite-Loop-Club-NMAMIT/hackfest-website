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
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type VisibilityState,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  IdeaSubmission,
  Team,
  TeamProgress,
  VideoSubmissions,
} from "@prisma/client";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { members } from "~/types";
import Link from "next/link";

interface MembersRow {
  members: { college: { name: string } }[];
}

export default function ParticipantsTable({
  data,
  dataRefecth,
}: {
  data:
    | inferRouterOutputs<typeof teamRouter>["getTeamsList"]
    | null
    | undefined;
  dataRefecth: () => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const moveToTop15 = api.judges.changeTeamProgress.useMutation({
    onSuccess: async () => {
      dataRefecth();
      toast.success("Moved to Top 15");
      toast.dismiss("moveToTop15");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
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

  const resetProgress = api.team.resetTeamProgress.useMutation({
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
      accessorKey: "",
      header: "Info",
      cell: (cell) => {
        return (
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>View</Button>
              </DialogTrigger>
              <DialogContent className="mx-5 flex max-h-[60dvh] flex-col gap-4 overflow-y-auto text-white">
                <div className="flex gap-5">
                  <span className="font-semibold">Name: </span>{" "}
                  {(cell.cell.row.original as Team).name}
                </div>
                <div className="flex gap-5">
                  <span className="font-semibold">College: </span>{" "}
                  {
                    (cell.cell.row.original as Team & { members: members[] })
                      .members[0]!.college?.name
                  }
                </div>
                <div className="flex gap-5">
                  <span className="font-semibold">ID: </span>
                  {(cell.cell.row.original as Team).id}
                </div>

                <div className="flex flex-col gap-5">
                  {(
                    cell.cell.row.original as Team & { members: members[] }
                  ).members.map((member, index) => (
                    <Table key={index} className="border border-white">
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-semibold">Name</TableCell>
                          <TableCell>
                            {member.name} {member.isLeader ? "(L)" : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Email</TableCell>
                          <TableCell>{member.email}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Phone</TableCell>
                          <TableCell>{member.phone}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">
                            Aadhaar
                          </TableCell>
                          <TableCell>
                            <a
                              href={member.aadhaar?.split(";")[0]}
                              target="_blank"
                            >
                              <Button>View</Button>
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">
                            College ID
                          </TableCell>
                          <TableCell>
                            <a
                              href={member.college_id?.split(";")[0]}
                              target="_blank"
                            >
                              <Button>View</Button>
                            </a>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Team Name",
    },
    {
      accessorKey: "members",
      header: "College",
      cell: (members) => (
        <span>
          {(members.row.original as MembersRow).members[0]?.college?.name}
        </span>
      ),
    },
    {
      accessorKey: "referral",
      header: "Referral",
      cell: (referral) => (
        <span>
          {referral.getValue()
            ? `HF2024_${(
                "00" +
                (
                  referral.row.original as {
                    referral: { id: string };
                  }
                ).referral?.id
              ).slice(-3)}`
            : "No"}
        </span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
    },
    {
      accessorKey: "ValidatorTotalScore",
      header: "Validator Score",
    },
    {
      accessorKey: "teamProgress",
      header: "Progress",
    },
    {
      accessorKey: "videoSubmission",
      header: "Actions",
      cell: (cell) => {
        return (
          <>
              <Button
			  onClick={()=>console.log(
(
                  cell.cell.row.original as Team & {
                    videoSubmission: VideoSubmissions | null;
                  }
                )
)}
                disabled={
                  (
                    cell.cell.row.original as Team & {
                      videoSubmission: VideoSubmissions | null;
                    }
                  ).videoSubmission?.url === null
                }
              >
            <a
              href={
                (
                  cell.cell.row.original as Team & {
                    videoSubmission: VideoSubmissions | null;
                  }
                ).videoSubmission?.url?.split(";")[0]
              }
              target="_blank"
            >
                View Video{" "}
            </a>
              </Button>
          </>
        );
      },
    },
    {
      accessorKey: "teamProgress",
      header: "Actions",
      cell: (cell) => {
        return (
          <>
            <button
              className={`${(cell.cell.row.original as Team).teamProgress === "SEMI_SELECTED" ? "bg-green-700 text-white" : "bg-white text-black"} rounded-lg px-4 py-2`}
              onClick={async () => {
                await moveToTop100.mutateAsync({
                  teamId: (cell.cell.row.original as Team).id,
                });
              }}
            >
              Top 15
            </button>
          </>
        );
      },
    },
    {
      accessorKey: "ideaSubmission",
      header: "Actions",
      cell: (cell) => {
        return (
          <>
            <a
              href={
                (
                  cell.cell.row.original as Team & {
                    ideaSubmission: IdeaSubmission | null;
                  }
                ).ideaSubmission?.pptUrl?.split(";")[0]
              }
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
      header: "Actions",
      cell: (cell) => {
        return (
          <>
            <button
              className={`${(cell.cell.row.original as Team).teamProgress === "SEMI_SELECTED" ? "bg-green-700 text-white" : "bg-white text-black"} rounded-lg px-4 py-2`}
              onClick={async () => {
                await moveToTop100.mutateAsync({
                  teamId: (cell.cell.row.original as Team).id,
                });
              }}
            >
              Top 100
            </button>
          </>
        );
      },
    },
    {
      accessorKey: "teamProgress",
      header: "Actions",
      cell: (cell) => {
        return (
          <>
            <button
              className={`${(cell.cell.row.original as Team).teamProgress === "SELECTED" ? "bg-green-700 text-white" : "bg-white text-black"} rounded-lg px-4 py-2`}
              onClick={async () => {
                await moveToTop60.mutateAsync({
                  teamId: (cell.cell.row.original as Team).id,
                });
              }}
            >
              Top 60
            </button>
          </>
        );
      },
    },
    {
      accessorKey: "teamProgress",
      header: "Actions",
      cell: (cell) => {
        return (
          <>
            <button
              className={`${(cell.cell.row.original as Team).teamProgress === "NOT_SELECTED" ? "pointer-events-none" : "bg-red-400 text-black"} rounded-lg px-4 py-2`}
              onClick={async () => {
                await moveToTop15.mutateAsync({
                  teamId: (cell.cell.row.original as Team).id,
                  progress: "SELECTED",
                });
              }}
            >
              Reset
            </button>
          </>
        );
      },
    },
    {
      accessorKey: "",
      header: "Attendance",
      cell: ({ cell }) => {
        return (
          <>
            <div className="flex">
              {!(cell.row.original as Team).attended ? (
                <div className="inline-block rounded-lg bg-green-500 p-2">
                  <span
                    className=" cursor-pointer text-white"
                    onClick={async () => {
                      await ToggleAttendance(
                        `${(cell.row.original as Team).id}`,
                      );
                    }}
                  >
                    <Check />
                  </span>
                </div>
              ) : (
                <div className="inline-block rounded-lg bg-red-500 p-2">
                  <span
                    className=" cursor-pointer text-white"
                    onClick={async () => {
                      await ToggleAttendance(
                        `${(cell.row.original as Team).id}`,
                      );
                    }}
                  >
                    <X />
                  </span>
                </div>
              )}
            </div>
          </>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </Button>
        </div>
      </div>
    </>
  );
}
