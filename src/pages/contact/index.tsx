import { FaPhone } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import RootLayout from "~/components/layout";

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
];

export default function Contact() {
  return (
    <RootLayout>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328] px-2 py-32">
        <h1 className="z-[60] w-full pb-8 text-center font-herkules text-6xl tracking-wider sm:text-7xl">
          Contact Us
        </h1>
        <div className="flex flex-col items-center justify-center gap-5 md:gap-10">
          <div className="flex w-full flex-wrap items-center justify-center gap-3 md:gap-12">
            {contacts.map((contact, idx) => (
              <div key={idx} className="">
                <ContactCard {...contact} />
              </div>
            ))}
          </div>

          <div className="flex w-full max-w-sm flex-col items-center justify-center gap-2 md:max-w-xl md:gap-4">
            <div className="flex w-[90%] max-w-lg flex-col items-center rounded-xl border border-blue-500/20 bg-white/[0.05] p-8 backdrop-blur-sm transition-all hover:border-blue-400/30 hover:bg-white/[0.08]">
              <p>
                <span className="font-semibold">Discord: </span>
                <a href="https://discord.gg/d9hQV8Hcv6" target="_blank">
                  discord.gg/d9hQV8Hcv6
                </a>
              </p>
            </div>
            <div className=" flex w-[90%] max-w-lg flex-col items-center rounded-xl border border-blue-500/20 bg-white/[0.05] p-8 backdrop-blur-sm transition-all hover:border-blue-400/30 hover:bg-white/[0.08]">
              <p>
                <span className="font-semibold">General queries: </span>
                <a href="mailto:admin@hackfest.dev" target="_blank">
                  admin@hackfest.dev
                </a>
              </p>
            </div>
            <div className=" flex w-[90%] max-w-lg flex-col items-center rounded-xl border border-blue-500/20 bg-white/[0.05] p-8 backdrop-blur-sm transition-all hover:border-blue-400/30 hover:bg-white/[0.08]">
              <p>
                <span className="font-semibold">Tech support: </span>
                <a href="mailto:tech@hackfest.dev" target="_blank">
                  tech@hackfest.dev
                </a>
              </p>
            </div>
            <div className=" flex w-[90%] max-w-lg flex-col items-center rounded-xl border border-blue-500/20 bg-white/[0.05] p-8 backdrop-blur-sm transition-all hover:border-blue-400/30 hover:bg-white/[0.08]">
              <p>
                <span className="font-semibold">
                  Interested in sponsoring?{" "}
                </span>
                <a href="mailto:sponsor@hackfest.dev" target="_blank">
                  sponsor@hackfest.dev
                </a>
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
    <div className="flex w-[20rem] flex-col items-center rounded-xl border border-blue-500/20 bg-white/[0.05] p-8 backdrop-blur-sm transition-all hover:border-blue-400/30 hover:bg-white/[0.08]">
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
