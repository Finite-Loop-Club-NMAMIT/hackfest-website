import { States } from "@prisma/client";
import { FunctionComponent } from "react";
import {
  TableCell,
  TableHead,
  TableRow,
  Table,
  TableBody,
  TableHeader,
} from "~/components/ui/table";
import Spinner from "../spinner";
interface TableProps {
  data:
    | ({
        college: {
          id: string;
          name: string;
          state: States;
        } | null;
      } & {
        id: number;
        code: string;
        referrer: string;
        collegeId: string;
        name: string;
        contact: string;
      })[]
    | undefined;
}

const ReferralsTable: FunctionComponent<TableProps> = ({ data }) => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="h-full max-w-screen-2xl rounded-md border p-10">
        {!data ? (
          <Table>
            <TableBody>
              <TableRow>
                <Spinner size="large" />
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referral Code</TableHead>
                <TableHead>College</TableHead>
                <TableHead>College ID</TableHead>
                <TableHead>Referrer Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Referrer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((referral) => {
                return (
                  <TableRow key={referral.id}>
                    <TableCell>{`HF2024_${("00" + referral.id).slice(-3)}`}</TableCell>
                    <TableCell>{referral?.college?.name}</TableCell>
                    <TableCell>{referral.collegeId}</TableCell>
                    <TableCell>{referral.name}</TableCell>
                    <TableCell>{referral.contact}</TableCell>
                    <TableCell>{referral.referrer}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {data?.length === 0 && (
          <div className="flex w-full justify-center p-5">
            No Data To Display
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsTable;
