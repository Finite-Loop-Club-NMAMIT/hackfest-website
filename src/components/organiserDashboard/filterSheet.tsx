import React from "react";
import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "@radix-ui/react-label";

const FilterSheet: FunctionComponent<{
  searchQuery: string;
  paymentQuery: string;
  top60Query: string;
  submissionQuery: string;
  trackQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setPaymentQuery: Dispatch<SetStateAction<string>>;
  setTop60Query: Dispatch<SetStateAction<string>>;
  setSubmissionQuery: Dispatch<SetStateAction<string>>;
  setTrackQuery: Dispatch<SetStateAction<string>>;
}> = ({
  searchQuery,
  paymentQuery,
  top60Query,
  submissionQuery,
  trackQuery,
  setSearchQuery,
  setPaymentQuery,
  setTop60Query,
  setSubmissionQuery,
  setTrackQuery,
}) => {
  return (
    <Sheet>
      <SheetTrigger>
        <Button className="font-semibold">
          Filters
          {(searchQuery !== "" ||
            paymentQuery !== "ALL" ||
            top60Query !== "TOP 60" ||
            submissionQuery !== "ALL" ||
            trackQuery !== "ALL") &&
            " (Applied)"}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-slate-950">
        <SheetHeader className="mt-4">
          <SheetTitle className="text-white">Filters</SheetTitle>
          <SheetDescription className="flex flex-col items-center justify-center gap-10">
            <div className="flex flex-col items-center justify-center gap-3">
              <Label>Team ID/Name</Label>
              <Input
                placeholder="Search Team ID/Name"
                className="w-52"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              <Label>Idea Submission Status</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{submissionQuery}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Submission Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={submissionQuery}
                    onValueChange={(value: string) => setSubmissionQuery(value)}
                  >
                    <DropdownMenuRadioItem value="ALL">
                      All
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="SUBMITTED">
                      Submitted
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="NOT SUBMITTED">
                      Not Submitted
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              <Label>
                Track Choosen
                {submissionQuery === "NOT SUBMITTED" && " (N A)"}
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  disabled={submissionQuery === "NOT SUBMITTED"}
                >
                  <Button variant="outline">{trackQuery}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Submission Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={trackQuery}
                    onValueChange={(value: string) => setTrackQuery(value)}
                  >
                    <DropdownMenuRadioItem value="ALL">
                      All
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="FINTECH">
                      Fintech
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="SUSTAINABLE_DEVELOPMENT">
                      Sustainable Development
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="HEALTHCARE">
                      Healthcare
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="METAVERSE">
                      Metaverse
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="LOGISTICS">
                      Logistics
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="OPEN_INNOVATION">
                      Open Innovation
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              <Label>Selection of Teams</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{top60Query}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Shortlist Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={top60Query}
                    onValueChange={(value: string) => setTop60Query(value)}
                  >
                    <DropdownMenuRadioItem value="ALL">
                      All
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="TOP 60">
                      Top 60
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="TOP 100">
                      Top 100
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="NOT SELECTED">
                      Not Selected
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              <Label>Payment Status</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{paymentQuery}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Payment Staus</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={paymentQuery}
                    onValueChange={(value: string) => setPaymentQuery(value)}
                  >
                    <DropdownMenuRadioItem value="ALL">
                      All
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="PAID">
                      Paid
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="PENDING">
                      Pending
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="FAILED">
                      Failed
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                setPaymentQuery("ALL");
                setSearchQuery("");
                setSubmissionQuery("ALL");
                setTop60Query("TOP 60");
                setTrackQuery("ALL");
              }}
            >
              RESET
            </Button>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
