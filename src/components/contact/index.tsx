import { FaPhone } from 'react-icons/fa';
import { IoIosMail } from 'react-icons/io';

export default function ContactCard({
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
    <div className="text-sm md:text-base xl:text-lg bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 backdrop-blur-2xl border-2 border-teal-600 rounded-2xl md:px-10 px-6  py-6 text-white">
      <div className="text-justify flex flex-col gap-1">
        <div className="text-lg md:text-xl xl:text-2xl font-semibold">
          {name}
        </div>
        <h2 className="text-base md:text-lg xl:text-xl">{designation}</h2>
        <a
          href={`mailto:${email}`}
          className="items-center justify-start flex gap-2"
        >
          <IoIosMail /> {email}
        </a>
        <a href={`tel:${ph}`} className="flex gap-2 items-center justify-start">
          <FaPhone className="text-sm md:text-base" /> {ph}
        </a>
      </div>
    </div>
  );
}
