import QnaAccordion from "./qnaAccordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useState } from "react";
import { SectionHeading } from "../ui/sectionHeading";
import { toast } from "sonner";
import { type Category } from "@prisma/client";
import { Button } from "../ui/button";
import Link from "next/link";
import { Phone } from "lucide-react";
import { api } from "~/utils/api";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const FAQ = () => {
  const [faq, setFaq] = useState<{
    question: string;
    category: "GENERAL" | "FOOD" | "STAY" | "TRAVEL" | undefined;
  }>({
    question: "",
    category: undefined,
  });

  const faqData = api.faq.getAllFaqs.useQuery();
  const addFaq = api.faq.addFaq.useMutation({
    onSuccess: async () => {
      toast.success("Faq added");
      await faqData.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-y-4 py-6 md:py-12 ">
        <SectionHeading
          title="FAQ"
          classname="text-5xl md:text-6xl xl:text-7xl"
        />
        <div className="flex w-full flex-col items-center justify-center space-y-6 pb-6 pt-2">
          <Tabs
            defaultValue="GENERAL"
            className=" flex flex-col items-center justify-center"
          >
            <TabsList className="mb-5 scale-[110%] md:scale-150">
              <TabsTrigger value="GENERAL">General</TabsTrigger>
              <TabsTrigger value="FOOD">Food</TabsTrigger>
              <TabsTrigger value="STAY">Stay</TabsTrigger>
              <TabsTrigger value="TRAVEL">Travel</TabsTrigger>
            </TabsList>
            <TabsContent value="GENERAL">
              <QnaAccordion
                faqs={faqData.data?.filter(
                  (faq) => faq.category === "GENERAL" && faq.published,
                )}
              />
            </TabsContent>
            <TabsContent value="FOOD">
              <QnaAccordion
                faqs={faqData.data?.filter(
                  (faq) => faq.category === "FOOD" && faq.published,
                )}
              />
            </TabsContent>
            <TabsContent value="STAY">
              <QnaAccordion
                faqs={faqData.data?.filter(
                  (faq) => faq.category === "STAY" && faq.published,
                )}
              />
            </TabsContent>
            <TabsContent value="TRAVEL">
              <QnaAccordion
                faqs={faqData.data?.filter(
                  (faq) => faq.category === "TRAVEL" && faq.published,
                )}
              />
            </TabsContent>
          </Tabs>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="font-semibold">Drop your question</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="dark:text-white">
                Submit your question
              </DialogTitle>
              <div className="flex flex-col gap-2 ">
                <Input
                  type="text"
                  className="rounded-lg border-2 bg-[#020817] p-2"
                  value={faq.question}
                  placeholder="Your Quesiton"
                  onChange={(e) => {
                    setFaq({ ...faq, question: e.target.value });
                  }}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary">
                      {faq.category
                        ? `Selected : ${faq.category}`
                        : "Select Category"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-slate-800">
                    <DropdownMenuLabel className="text-white">
                      FAQ Category
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={faq.category}
                      className="bg-slate-800"
                      onValueChange={(value: string) =>
                        setFaq((prev) => {
                          return { ...prev, category: value as Category };
                        })
                      }
                    >
                      <DropdownMenuRadioItem
                        value="GENERAL"
                        className="text-white hover:text-black"
                      >
                        General
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="STAY"
                        className="text-white hover:text-black"
                      >
                        Stay
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="TRAVEL"
                        className="text-white hover:text-black"
                      >
                        Travel
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="FOOD"
                        className="text-white hover:text-black"
                      >
                        Food
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={() => {
                    if (!faq.question) {
                      return toast.error("Please type a question");
                    }
                    if (!faq.category) {
                      return toast.error("Please select a category");
                    }
                    addFaq.mutate(
                      faq as {
                        question: string;
                        category: "GENERAL" | "FOOD" | "STAY" | "TRAVEL";
                      },
                    );
                  }}
                  className="font-semibold"
                >
                  Submit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pb-10 md:pb-16 xl:pb-20">
        <div className="relative mx-10 mt-4 flex w-full max-w-[90vw] flex-col flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 p-5 py-5 shadow-[0_0_3px_1px_#b9b7b7ad] backdrop-blur-2xl sm:w-[40rem] md:w-[72rem]">
          <SectionHeading
            title="Still have more questions?"
            classname="text-3xl md:text-4xl xl:text-5xl"
          />
          <Link href="/contact">
            <Button className="flex items-center gap-2" size={"lg"}>
              <Phone size={16} />
              Contact us
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};
