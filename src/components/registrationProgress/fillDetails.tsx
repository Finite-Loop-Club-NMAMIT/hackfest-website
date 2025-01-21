import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import RegisterProfileForm from "../forms/registerProfile";

export default function FillDetails() {
  return (
    <Card className="mb-12 mt-[10rem] w-full max-w-7xl bg-black/50 py-2 md:mt-[12rem] md:py-4 border border-white/20">
      <CardHeader>
        <CardTitle
          id="form-title"
          className="bg-gradient-to-b from-neutral-50 via-neutral-500 to-neutral-300 bg-clip-text text-center text-3xl font-bold text-transparent md:text-5xl"
        >
          Personal Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mx-auto max-w-4xl">
          <RegisterProfileForm />
        </div>
      </CardContent>
    </Card>
  );
}
