import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { paymentTransactionZ } from "~/server/schema/zod-schema";
import type { z } from "zod";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { env } from "~/env";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import DragAndDropFile from "~/components/ui/dragDrop";

export default function PaymentForm() {
  const session = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [screenShot, setScreenShot] = useState<File|null>(null);

  const paymentMutation = api.payment.createTransaction.useMutation({
    onSuccess: async() => {
      await session.update();
    },
    onError: (error) => {
      toast.dismiss("payment")
      toast.error(error.message);
      setSubmitting(false);
    },
  });
  const form = useForm<z.infer<typeof paymentTransactionZ>>({
    resolver: zodResolver(paymentTransactionZ),
    defaultValues: {
      transactionId: "",
      paymentProof: ""
    },
  });

  function onSubmit(values: z.infer<typeof paymentTransactionZ>) {
    paymentMutation.mutate(values);
  }

  async function uploadFiles(file: File, setter: (url: string) => void) {
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await fetch(
        `${env.NEXT_PUBLIC_BASE_URL}/api/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
  
      const data = (await response.json()) as { secure_url: string };
  
      if (!data.secure_url) {
        return false;
      }
      setter(data.secure_url);
  
      return data.secure_url;
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="transactionId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Transaction ID" {...field} />
              </FormControl>
              {/* <FormDescription>Enter your UPI transaction ID.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <DragAndDropFile text="Transaction screenshot" accept="image/*" onChange={setScreenShot}/>
        </div>
        <div className="flex w-full justify-end">
          <Button disabled={submitting} onClick={async(e) => {
            e.preventDefault();
            e.stopPropagation()

            if(screenShot === null){
              toast.error("Please upload screenshot")
              return
            }

            if (screenShot.size > 2 * 1000 * 1000) {
              console.log(screenShot.size);
              toast.error("Image size cannot be greater than 2MB");
              return;
            }
            
            const isTransactionIdPresent = await form.trigger(["transactionId"])
            
            if(isTransactionIdPresent && screenShot){
              try {
                setSubmitting(true)
                toast.loading("Saving payment proof", { id: "payment" })
                const paymentProofUrl = await uploadFiles(screenShot, (value) => {
                  form.setValue("paymentProof" , value)
                })

                const isPaymentProofPresent = await form.trigger(["paymentProof"])

                if(isPaymentProofPresent && paymentProofUrl){
                  await form.handleSubmit(onSubmit)()
                }else{
                  toast.dismiss("payment")
                  toast.error("Failed to upload file")
                  setSubmitting(false)
                }
              } catch (error) {
                toast.dismiss("payment")
                toast.error("Failed to submit payment proof")
                setSubmitting(false)
              }
            }
          }}>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
