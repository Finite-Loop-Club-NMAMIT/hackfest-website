import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import Link from "next/link";

type FAQ = { question: string; answer: string }[];
function Accordian({ faqs }: { faqs: FAQ }) {
  return (
    <div className="mx-auto w-[90%] min-w-80 max-w-3xl text-xl font-bold">
      <Accordion type="multiple" className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="rounded-xl border border-blue-500/20 bg-white/[0.05] px-6 backdrop-blur-sm transition-all hover:border-blue-400/30 hover:bg-white/[0.08]"
          >
            <AccordionTrigger className="text-left text-white/95 hover:text-white">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-white/75">
              {faq.answer}
            </AccordionContent>
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
    <section className="relative my-6 flex min-h-[70vh] flex-col items-center justify-center py-16">
      <h1 className="mb-12 bg-gradient-to-b from-white via-white/95 to-white/90 bg-clip-text font-anton text-5xl font-bold text-transparent sm:text-6xl">
        FAQ
      </h1>

      <Accordian faqs={faqs} />

      {/* Contact Card */}
      <div className="mt-12 flex w-[90%] max-w-lg flex-col items-center rounded-xl border border-blue-500/20 bg-white/[0.05] p-8 backdrop-blur-sm transition-all hover:border-blue-400/30 hover:bg-white/[0.08]">
        <p className="text-center text-lg font-medium text-white/90">
          Have additional questions or facing any issues?
        </p>
        <Link
          href="/contact"
          className="mt-6 rounded-lg bg-white/95 px-8 py-3 font-semibold text-slate-900 transition-all hover:scale-105 hover:bg-white hover:shadow-lg hover:shadow-blue-500/20"
        >
          Contact Us
        </Link>
      </div>
    </section>
  );
}
