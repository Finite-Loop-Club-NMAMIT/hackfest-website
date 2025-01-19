import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import RegisterTeamForm from "../forms/createTeam";

export default function FormTeam() {
  return (
    <Card className="w-full max-w-7xl bg-black/50 py-2 md:py-4">
      <CardHeader>
        <CardTitle
          id="form-title"
          className="bg-gradient-to-b from-neutral-50 via-neutral-500 to-neutral-300 bg-clip-text text-center text-3xl font-bold text-transparent md:text-5xl"
        >
          Team Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mx-auto max-w-4xl">
          <RegisterTeamForm />
        </div>
      </CardContent>
    </Card>
  );
}
