import React from "react";
import { api } from "~/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

export default function Top60Payments() {
  const { data: teams, isLoading, refetch } = api.team.getTop60.useQuery();
  const verifyMutation = api.payment.verifyPayment.useMutation();

  const handleVerifyPayment = async (teamId: string) => {
    try {
      await verifyMutation.mutateAsync(teamId);
      await refetch();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <Skeleton className="h-12 w-full" />;

  const statusPriority = { VERIFY: 0, PENDING: 1, PAID: 2 };
  const sortedTeams = teams
    ? [...teams].sort((a, b) => {
        return (
          (statusPriority[a.paymentStatus] ?? 99) -
          (statusPriority[b.paymentStatus] ?? 99)
        );
      })
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top 60 Teams Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Payment Proof</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeams.map((team, index) => (
              <TableRow key={team.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{team.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      team.paymentStatus === "PAID"
                        ? "default"
                        : team.paymentStatus === "VERIFY"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {team.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>{350 * team.Members.length}</TableCell>
                <TableCell>
                  {team.paymentStatus === "VERIFY" && team.transactionId
                    ? team.transactionId
                    : "-"}
                </TableCell>
                <TableCell>
                  {team.paymentStatus === "VERIFY" && team.paymentProof ? (
                    <a href={team.paymentProof.split(";")[0]} target="_blank">
                      <Button>View Payment Proof</Button>
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {team.paymentStatus === "VERIFY" && (
                    <Button
                      size="sm"
                      onClick={() => handleVerifyPayment(team.id)}
                    >
                      Verify Payment
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {sortedTeams.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No top 60 teams found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
