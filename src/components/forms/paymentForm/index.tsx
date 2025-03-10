import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { paymentTransactionZ } from "~/server/schema/zod-schema";
import type { z } from "zod";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

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

export default function PaymentForm() {
  const session = useSession();
  const [submitting, setSubmitting] = useState(false);

  const paymentMutation = api.payment.createTransaction.useMutation({
    onSuccess: async() => {
      await session.update();
    },
    onError: (error) => {
      toast.error(error.message);
      setSubmitting(false);
    },
  });
  const form = useForm<z.infer<typeof paymentTransactionZ>>({
    resolver: zodResolver(paymentTransactionZ),
    defaultValues: {
      transactionId: "",
    },
  });

  function onSubmit(values: z.infer<typeof paymentTransactionZ>) {
    setSubmitting(true);
    paymentMutation.mutate(values);
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
        <div className="flex w-full justify-end">
          <Button type="submit" disabled={submitting}>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
