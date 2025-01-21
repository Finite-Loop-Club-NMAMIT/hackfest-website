export const SectionHeading: React.FC<{
  title: string;
  classname?: string;
}> = ({ title, classname }) => {
  return (
    <h2
      className={
        "w-fit bg-gradient-to-b from-cyan-300 to-cyan-50 bg-clip-text py-4 text-center font-obscura text-4xl font-bold text-transparent md:text-left md:text-6xl " +
        classname
      }
    >
      {title}
    </h2>
  );
};
