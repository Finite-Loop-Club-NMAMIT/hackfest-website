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
import { IdeaSubmission, Team, TeamProgress } from "@prisma/client";
import { Check, X } from "lucide-react";
import Link from "next/link";

interface MembersRow {
  members: { college: { name: string } }[];
}

export default function PaymentVerification({
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

  const verifyPayment = api.finalSubmission.verifyPaymentStatus.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      dataRefecth();
      toast.success('Verified Payment')
    }
  })
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
      accessorKey: "members",
      header: "College",
      cell: (members) => (
        <span>
          {(members.row.original as MembersRow).members[0]!.college.name}
        </span>
      ),
    },
    {
      accessorKey: 'transactionId',
      header: 'Transaction ID'
    },
    {
      accessorKey: 'paymentProof',
      header: 'Payment Proof',
      cell: (cell) => {
        return(
          <a href={(cell.row.original as Team).paymentProof ?? ''} target="_blank">
          <Button>
            Proof
          </Button>
          </a>
        )
      }
    },
    {
      accessorKey: '',
      header: 'Verify',
      cell: (cell) => {
        return(
          <>
            <Button className="bg-green-500 rounded-lg p-4 text-white font-bold"
              onClick={async () => {
                await verifyPayment.mutateAsync({
                  teamId: (cell.row.original as Team).id
                })
              }}
            >
              <Check />
            </Button>
          </>
        )
      }
    }
  ];

  const table = useReactTable({
    data: data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    
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
