import { CheckIcon, XIcon } from "lucide-react";

interface MonochromeButtonProps {
  onClick: () => void;
  active: boolean;
}

export function TickButton({ onClick, active }: MonochromeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        active ? "bg-gray-700" : "hover:bg-gray-800"
      }`}
    >
      <CheckIcon className="h-4 w-4" />
    </button>
  );
}

export function WrongButton({ onClick, active }: MonochromeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        active ? "bg-gray-700" : "hover:bg-gray-800"
      }`}
    >
      <XIcon className="h-4 w-4" />
    </button>
  );
}
