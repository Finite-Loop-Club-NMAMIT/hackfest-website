import { AiOutlineInstagram, AiOutlineMail } from "react-icons/ai";
import { FaDiscord } from "react-icons/fa";

export const dates: [Date, Date, Date] = [
  new Date("2024-4-5"),
  new Date("2024-4-6"),
  new Date("2024-4-7"),
];

export const cardContent: Array<{
  img: string;
  header: string;
  content: string;
}> = [
  {
    img: "/images/about1.png",
    header: "36 HOURS LONG HACKATHON",
    content:
      "A theme based Hackathon consisting of 5 tracks resulting in 3 Grand winners",
  },
  {
    img: "/images/about2.png",
    header: "TECH CONFERENCES",
    content:
      "Conference Talks from Top Quality Tech Speakers & Representative from Sponsors",
  },
  {
    img: "/images/about3.png",
    header: "ENGAGEMENT & NETWORKING",
    content: `A lot more than just a ${"'"}Hackathon${"'"}, more of a tech fest with Engagement Activities`,
  },
];

export const social: Array<{
  link: string;
  icon: JSX.Element;
  name: string;
}> = [
  {
    link: "https://www.instagram.com/hackfest.dev",
    icon: <AiOutlineInstagram className=" hover:text-yellow-500" />,
    name: "Instagram",
  },
  {
    link: "mailto:admin@hackfest.dev",
    icon: <AiOutlineMail className=" hover:text-yellow-500" />,
    name: "E-mail",
  },
  {
    link: "https://discord.gg/d9hQV8Hcv6",
    icon: <FaDiscord className=" hover:text-yellow-500" />,
    name: "Discord",
  },
];

export const domains: Array<{
  name: string;
  image: string;
  description: { p1: string; p2: string };
  prize: number | null;
}> = [
  {
    name: "Fintech",
    image: "/images/fintech.png",
    description: {
      p1: "Crafting the future of finance by creating solutions that revolutionize the way we manage, invest and transact in the financial realm.",
      p2: "Tackle challenges related to digital payments, financial inclusion, or innovative solutions for managing and investing money.",
    },
    prize: 10000,
  },
  {
    name: "Sustainable Development",
    image: "/images/sustainableDev.png",
    description: {
      p1: "Driving innovation towards a greener, more sustainable world, where technology harmonizes with the environment.",
      p2: "Hack for a better future by tackling any of the UN's 17 Sustainable Development Goals (SDGs). Think clean water, renewable energy, poverty reduction, or anything that makes our planet healthier and fairer. Build software solutions that solve real-world problems and pave the way for a sustainable tomorrow.",
    },
    prize: 10000,
  },
  {
    name: "Healthcare",
    image: "/images/healthcare.png",
    description: {
      p1: "Heal through code!!! Your innovative solutions have the power to bridge gaps, save lives, and pave the way for a healthier world.",
      p2: "Develop solutions for patient care, telemedicine, health record management, or tools that enhance the overall efficiency of the healthcare system.",
    },
    prize: 10000,
  },
  {
    name: "Metaverse",
    image: "/images/meta.png",
    description: {
      p1: "Shape the future of immersive experiences through digital spaces that captivate and connect people in ways never thought possible.",
      p2: "Dive into the virtual realm and explore possibilities that redefine how we interact, work, and play in digital spaces. Create immersive experiences, innovative social platforms, or tools that enhance collaboration within the metaverse. Whether it's virtual reality, augmented reality, or mixed reality, unleash your creativity to shape the future of interconnected digital worlds.",
    },
    prize: 10000,
  },
  {
    name: "Logistics",
    image: "/images/logistics.png",
    description: {
      p1: "Redefine logistics and contribute to a world  where movement of goods is faster, smarter and also sustainable.",
      p2: "Revolutionize the way goods and services move across the globe. Tackle challenges in supply chain optimization, last-mile delivery, warehouse management, or transportation efficiency. Build solutions that streamline logistics operations, reduce environmental impact, and ensure the seamless flow of products from point A to point B. Your code can be the driving force behind a more connected and efficient global logistics network.",
    },
    prize: 10000,
  },
  {
    name: "Open Innovation",
    image: "/images/openInnovation.png",
    description: {
      p1: "Innovation knows no bounds!!! Push the boundaries and Break free from traditional barriers with code.",
      p2: "This track encourages participants to work on any problem they are passionate about, fostering innovation and allowing for a wide range of projects across different domains. Solve a problem that matters to you. Identify an issue in your community or a personal challenge and develop a creative and impactful solution using technology.",
    },
    prize: null,
  },
];

export const siteMetadata = {
  title: "Hackfest",
  author: "Technical Team of Hackfest",
  description:
    "Hackfest is a 36h long National level Hackathon at NMAMIT, Nitte coupled with a lot of Interactive Activities & Tech Conference talks!",
  siteUrl: "https://hackfest.dev",
  email: "admin@hackfest.com",
  address: "N.M.A.M. Institute of Technology, Nitte, Kalya, Karnataka 574110",
  instagram: "hackfest.dev",
};

export const navLinks = [
  { url: "/", label: "Home" },
  { url: "/#sponsors", label: "Sponsors" },
  { url: "/#about", label: "About" },
  { url: "/#prizes", label: "Prizes" },
  { url: "/#tracks", label: "Tracks" },
  { url: "/#timeline", label: "Timeline" },
];
