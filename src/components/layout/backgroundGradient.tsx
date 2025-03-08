import { cn } from "~/lib/utils";

// export const GradientBackground = ({
//   children,
//   className,
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) => {
//   return <div className={cn("min-h-screen w-full", className)}>{children}</div>;
// };

export default function GradientBackground({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("h-full min-h-screen w-full bg-gradient-to-b from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328] px-2 py-40", className)}>
      {children}
    </div>
  );
}
