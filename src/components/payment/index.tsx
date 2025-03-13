import React, { useEffect, useRef, useState } from "react";
import { downloadFromUrl } from "~/utils/helper";
import Image from "next/image";
import { paymentQRUrl, UPIUser } from "~/constants";
import { QRCodeSVG } from "qrcode.react";
import { api } from "~/utils/api";
import { toPng, toJpeg } from "html-to-image"


import { Button } from "~/components/ui/button";
import { Download, Info } from "lucide-react";
import PaymentForm from "../forms/paymentForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import Spinner from "~/components/spinner/index";

export default function PaymentComponent() {
  const [open, setOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement|null>(null);
  const teamSizeQuery = api.team.getTeamSize.useQuery();
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const showMessage = window.sessionStorage.getItem(
        "showTransactionGuidelines",
      );
      if (!showMessage) {
        setOpen(true);
        window.sessionStorage.setItem("showTransactionGuidelines", "true");
      }
    }
  }, []);

  useEffect(() => {
    if (teamSizeQuery.data && teamSizeQuery.data.teamsize >= 3) {
      const uri = `upi://pay?pa=${UPIUser.upiId}&am=${teamSizeQuery.data.teamsize * UPIUser.baseAmount}&cu=INR`;
      setUrl(uri);
    }
  }, [teamSizeQuery.data?.teamsize]);

  async function downloadQr() {
    if(qrRef.current){
      const dataUrl = await toPng(qrRef.current)
      const a = document.createElement("a")
      a.href = dataUrl;
      a.download = "Payment_QR.png"
      a.click()
      a.remove()
    }
  }

  return (
    <div className="flex h-fit w-full max-w-5xl flex-col items-center justify-center rounded-lg bg-black/50 px-4 py-6">
      <h1 className="gradient-text my-2 text-3xl font-bold md:text-5xl">
        Payment
      </h1>
      <div className="flex flex-col items-center justify-center gap-2 lg:flex-row">
        <div className="flex w-fit flex-col justify-center gap-4 pt-6">
          {!teamSizeQuery.isLoading && teamSizeQuery.data?.teamsize ? (
            <div ref={qrRef} className="h-fit w-fit p-4">
              <QRCodeSVG
                type="image"
                value={url}
                // bgColor="transparent"
                // color="#ffffff"
                // fgColor="#ffffff"
                className="aspect-square h-full w-full rounded-lg bg-white p-4 md:size-96 sm:size-72"
              />
            </div>
          ) : (
            <Spinner />
          )}
          <div className="flex flex-row gap-2">
            <Button
              variant={"secondary"}
              onClick={downloadQr}
              className="flex w-full justify-center gap-2"
            >
              Download QR
              <Download size={20} />
            </Button>
            <Dialog open={open} onOpenChange={() => setOpen(!open)}>
              <DialogTrigger className="size-10">
                <Info className="mx-auto my-auto stroke-amber-500" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center text-xl md:text-2xl">
                    Important !
                  </DialogTitle>
                  <DialogDescription className="text-sm md:text-base">
                    {/* TODO: content needs revalidation from DOC team */}
                    <ul className="mx-4 list-disc text-left">
                      <li>
                        Proceed to payment only if name in the QR is{" "}
                        <b>{UPIUser.name}</b>. we are not responsible in case of
                        wrong payment
                      </li>
                      <li>Only the leader should pay the Registrations fee</li>
                      <li>
                        Registration fee is <b>350 INR</b> per head
                      </li>
                      <li>
                        Failure due to payment will result in disqualification
                        of the team
                      </li>
                      <li>
                        Contact <b>{UPIUser.phone}</b> for queries
                      </li>
                    </ul>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex h-full basis-1/2 flex-col gap-6 px-4">
          <p className="mt-6 flex-wrap text-center text-lg">
            Scan the QR code to pay the registration fee of{" "}
            <b>350 INR per head</b>. Submit the UPI transaction ID below.
          </p>
          <PaymentForm />
        </div>
      </div>
    </div>
  );
}
