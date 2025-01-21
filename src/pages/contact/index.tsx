import ContactCard from "~/components/contact";
import RootLayout from "~/components/layout";
import { SectionHeading } from "~/components/ui/sectionHeading";

const contacts = [
  {
    name: "Dr. Shashank Shetty",
    designation: "Faculty Coordinator",
    email: "shashankshetty@nitte.edu.in",
    ph: "8197903771",
  },
  {
    name: "Mr. Puneeth R P",
    designation: "Faculty Coordinator",
    email: "Puneeth.rp@nitte.edu.in",
    ph: "9036366204",
  },

  {
    name: "Nagaraj Pandith",
    designation: "Organizer",
    email: "4nm20cs115@nmamit.in",
    ph: "9740689836",
  },

  {
    name: "Swasthik Shetty",
    designation: "Organizer",
    email: "4nm20cs195@nmamit.in",
    ph: "6364172219",
  },

  {
    name: "Prathama S J",
    designation: "Organizer",
    email: "4nm21cs115@nmamit.in",
    ph: "7411709904",
  },
];

const technicalContact = [
  {
    name: "Nandan R Pai",
    designation: "Technical Committee",
    email: "nnm22am033@nmamit.in",
    ph: "9481585863",
  },
  {
    name: "Srivatsa R Upadhya",
    designation: "Technical Committee",
    email: "4nm21cs171@nmamit.in",
    ph: "9449414199",
  },
]

export default function Contact() {
  return (
    <RootLayout>
      <main
        className="mx-auto flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#060e3c] via-[#052d4f] to-[#001933] p-2 pb-8 pt-20 sm:p-6 sm:pt-20 md:p-10 md:pt-24 xl:p-20 xl:pt-28"
        style={{
          background:
            "url('/images/noise.svg') repeat,linear-gradient(180deg, #060e3c 0%, #052d4f 30%, #001933 100%)",
        }}
      >
        <SectionHeading
          title="CONTACT US"
          classname="text-5xl md:text-6xl xl:text-7xl mt-3 mb-5"
        />
        <div className="flex flex-col items-center justify-center gap-5 md:gap-10">
          <div className="flex w-full flex-wrap items-center justify-center gap-3 md:gap-24">
            {contacts.map((contact, idx) => {
              return (
                <div key={idx} className="w-full max-w-xs md:max-w-sm">
                  <ContactCard {...contact} />
                </div>
              );
            })}
          </div>

          <SectionHeading
          title="TECHNICAL SUPPORT"
          classname="text-5xl md:text-6xl xl:text-7xl"
        />

<div className="flex w-full flex-wrap items-center justify-center gap-3 md:gap-24">
            {technicalContact.map((contact, idx) => {
              return (
                <div key={idx} className="w-full max-w-xs md:max-w-sm">
                  <ContactCard {...contact} />
                </div>
              )
            })}
          </div>

          <div className="flex w-full max-w-sm flex-col items-center justify-center gap-2 md:max-w-xl md:gap-4">
            <div className=" flex w-full flex-col gap-1 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 px-5 py-2 text-sm text-white backdrop-blur-2xl md:text-base xl:text-lg">
              <p>
                <span className="font-semibold">Discord: </span>
                <a href="https://discord.gg/d9hQV8Hcv6">
                  discord.gg/d9hQV8Hcv6
                </a>
              </p>
            </div>
            <div className=" flex w-full flex-col gap-1 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 px-5 py-2 text-sm text-white backdrop-blur-2xl md:text-base xl:text-lg">
              <p>
                <span className="font-semibold">General queries: </span>
                <a href="mailto:admin@hackfest.dev">admin@hackfest.dev</a>
              </p>
            </div>
            <div className=" flex w-full flex-col gap-1 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 px-5 py-2 text-sm text-white backdrop-blur-2xl md:text-base xl:text-lg">
              <p>
                <span className="font-semibold">Tech support: </span>
                <a href="mailto:tech@hackfest.dev">tech@hackfest.dev</a>
              </p>
            </div>

            <div className=" flex w-full flex-col gap-1 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 px-5 py-2 text-sm text-white backdrop-blur-2xl md:text-base xl:text-lg">
              <p>
                <span className="font-semibold">
                  Interested in sponsoring?{" "}
                </span>
                <a href="mailto:sponsor@hackfest.dev">sponsor@hackfest.dev</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </RootLayout>
  );
}
