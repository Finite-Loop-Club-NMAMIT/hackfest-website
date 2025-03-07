import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

type FAQ = { question: string; answer: string }[];
function Accordian({ faqs }: { faqs: FAQ }) {
  return (
    <div className="mx-auto mb-10 w-[50%] min-w-80 text-xl">
      <Accordion type="multiple">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

const faqs: FAQ = [
  {
    question: "What is the registration charge?",
    answer: "The registration fee is ₹350 which has to be paid after selection",
  },
  {
    question: "Will the be accomodation provided?",
    answer: "Yes accomodation will be provided",
  },
  {
    question: "Will travel expensed be covered?",
    answer: "No, travel expenses will not be covered",
  },
];
export default function FAQSection() {
  return (
    <section className="flex h-[70vh] flex-col items-center justify-center ">
      <h1 className="my-5  font-anton text-6xl font-bold">FAQ</h1>

      <Accordian faqs={faqs} />
    </section>
  );
}
