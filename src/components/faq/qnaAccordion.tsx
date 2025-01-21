import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export default function QnaAccordion({
  faqs,
}: {
  faqs:
    | {
        id: number;
        question: string;
        answer: string;
        category: "GENERAL" | "FOOD" | "STAY" | "TRAVEL";
        published: boolean;
      }[]
    | undefined;
}) {
  return (
    <>
      <div className="flex flex-col">
        {faqs?.map((faq, index) => {
          return (
            <Accordion
              type="single"
              collapsible
              key={index}
              className="w-[80vw] md:w-[50vw]"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger className="w-full">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>
    </>
  );
}
