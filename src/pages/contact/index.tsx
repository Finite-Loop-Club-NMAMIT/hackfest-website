import { FaPhone } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import RootLayout from "~/components/layout";
import { SectionHeading } from "~/components/ui/sectionHeading";

const contacts = [
  {
    name: "Nandan R Pai",
    designation: "Organiser",
    email: "nnm22am033@nmamit.in",
    ph: "9481585863",
  },
  {
    name: "Prathama S J",
    designation: "Organiser",
    email: "4nm21cs115@nmamit.in",
    ph: "7411709904",
  },
  {
    name: "Satwik R Prabhu",
    designation: "Organiser",
    email: "4nm21cs143@nmamit.in",
    ph: "9686356123",
  },
  {
    name: "Ameya G Kowshik",
    designation: "Organiser",
    email: "nnm22am004@nmamit.in",
    ph: "9892521830",
  },
  {
    name: "Rahul A R",
    designation: "Organiser",
    email: "nnm22am045@nmamit.in",
    ph: "8618564271",
  },
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
];

export default function Contact() {
  return (
    <RootLayout>
      <main className="mx-auto flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#060e3c] via-[#052d4f] to-[#001933] p-2 pb-8 pt-20 sm:p-6 sm:pt-20 md:p-10 md:pt-24 xl:p-20 xl:pt-28">
        <SectionHeading
          title="CONTACT US"
          classname="text-5xl md:text-6xl xl:text-7xl mt-3 mb-5"
        />
        <div className="flex flex-col items-center justify-center gap-5 md:gap-10">
          <div className="flex w-full flex-wrap items-center justify-center gap-3 md:gap-24">
            {contacts.map((contact, idx) => (
              <div key={idx} className="w-full max-w-xs md:max-w-sm">
                <ContactCard {...contact} />
              </div>
            ))}
          </div>

          <div className="flex w-full max-w-sm flex-col items-center justify-center gap-2 md:max-w-xl md:gap-4">
            <div className="flex w-full flex-col gap-1 rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-700 to-blue-500 px-5 py-2 text-sm text-white transition hover:bg-blue-600 hover:shadow-lg md:text-base xl:text-lg">
              <p>
                <span className="font-semibold">Discord: </span>
                <a href="https://discord.gg/d9hQV8Hcv6">
                  discord.gg/d9hQV8Hcv6
                </a>
              </p>
            </div>
            <div className="flex w-full flex-col gap-1 rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-700 to-blue-500 px-5 py-2 text-sm text-white transition hover:bg-blue-600 hover:shadow-lg md:text-base xl:text-lg">
              <p>
                <span className="font-semibold">General queries: </span>
                <a href="mailto:admin@hackfest.dev">admin@hackfest.dev</a>
              </p>
            </div>
            <div className="flex w-full flex-col gap-1 rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-700 to-blue-500 px-5 py-2 text-sm text-white transition hover:bg-blue-600 hover:shadow-lg md:text-base xl:text-lg">
              <p>
                <span className="font-semibold">Tech support: </span>
                <a href="mailto:tech@hackfest.dev">tech@hackfest.dev</a>
              </p>
            </div>
            <div className="flex w-full flex-col gap-1 rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-700 to-blue-500 px-5 py-2 text-sm text-white transition hover:bg-blue-600 hover:shadow-lg md:text-base xl:text-lg">
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

function ContactCard({
  name,
  designation,
  email,
  ph,
}: {
  name: string;
  designation: string;
  email: string;
  ph: string;
}) {
  return (
    <div className="transform rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-700 via-blue-500 to-blue-600 px-6 py-6 text-sm text-white backdrop-blur-md transition duration-300 hover:scale-105 hover:shadow-xl md:px-10 md:text-base xl:text-lg">
      <div className="flex flex-col gap-1 text-justify">
        <div className="text-lg font-semibold md:text-xl xl:text-2xl">
          {name}
        </div>
        <h2 className="text-base md:text-lg xl:text-xl">{designation}</h2>
        <a
          href={`mailto:${email}`}
          className="flex items-center justify-start gap-2"
        >
          <IoIosMail /> {email}
        </a>
        <a href={`tel:${ph}`} className="flex items-center justify-start gap-2">
          <FaPhone className="text-sm md:text-base" /> {ph}
        </a>
      </div>
    </div>
  );
}
