import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { FaExclamationCircle, FaQuestionCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IoTrashBin } from "react-icons/io5";
import { api } from "~/utils/api";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { $Enums } from "@prisma/client";
import { ScrollArea } from "../ui/scroll-area";

export default function FaqAdmin() {
  const [answer, setAnswer] = useState("");

  const faqData = api.faq.getAllFaqs.useQuery();

  const [unPublishedFAQ, setUnPublishedFAQ] = useState<
    {
      id: number;
      question: string;
      answer: string;
      category: $Enums.Category;
      published: boolean;
    }[]
  >([]);

  useEffect(() => {
    if (faqData.data)
      setUnPublishedFAQ(faqData.data.filter((faq) => !faq.published));
  }, [faqData.data]);

  const answerFaq = api.faq.answerFaq.useMutation({
    onSuccess: async () => {
      toast.success("Faq answered");
      await faqData.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteFaq = api.faq.deleteFaq.useMutation({
    onSuccess: async () => {
      toast.success("Faq deleted");
      await faqData.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <div className="flex items-center justify-center gap-3 rounded-md border-2 p-2 hover:border-white">
            <span className="text-2xl font-bold">FAQ</span>
            <FaExclamationCircle className="text-white" />
          </div>
        </DialogTrigger>
        <DialogContent>
        <ScrollArea className="h-96">
        <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unPublishedFAQ.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No Faq Found
                    </TableCell>
                  </TableRow>
                ) : (
                  unPublishedFAQ.map((faq, index) => {
                    if (!faq.published) {
                      return (
                        <TableRow key={index} className="text-black">
                          <TableCell className="text-black dark:text-white">
                            {faq.question}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger className="text-black dark:text-white">
                                <Button>Answer</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogTitle className="text-black dark:text-white">
                                  {faq.question}
                                </DialogTitle>
                                <Input
                                  type="text"
                                  className="rounded-lg p-2 text-black"
                                  placeholder="Answer this question"
                                  value={answer}
                                  onChange={(e) => {
                                    setAnswer(e.target.value);
                                  }}
                                />
                                <Button
                                  className="rounded-lg p-2"
                                  onClick={async () => {
                                    await answerFaq.mutateAsync({
                                      id: faq.id,
                                      answer,
                                    });
                                    setAnswer("");
                                  }}
                                >
                                  Submit
                                </Button>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell>
                            <span
                              onClick={async () => {
                                await deleteFaq.mutateAsync({ id: faq.id });
                              }}
                              className="cursor-pointer text-black dark:text-white"
                            >
                              <IoTrashBin />
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })
                )}
              </TableBody>
            </Table>
        </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
