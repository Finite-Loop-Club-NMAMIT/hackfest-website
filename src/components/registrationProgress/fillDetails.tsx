import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "../ui/button";
import RegisterProfileForm from "../forms/registerProfile";

export default function FillDetails() {
  return (
    <div className="flex flex-nowrap justify-center w-full">
      <Card className="mx-4 mt-[10rem] mb-12 w-full max-w-7xl bg-black/50 py-2 md:mt-[12rem] md:py-4">
        <CardHeader>
          <CardTitle id="form-title" className="text-center md:text-5xl text-3xl font-bold bg-gradient-to-b from-neutral-50 via-neutral-500 to-neutral-300 bg-clip-text text-transparent">
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-4xl">
            <RegisterProfileForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
