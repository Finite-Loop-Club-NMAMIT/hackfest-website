import Image from "next/image";
import React, { useRef, useState } from "react";
import { RiImageAddLine } from "react-icons/ri";

export default function DragAndDropFile({
  text,
  accept,
  onChange,
}: {
  text?: string;
  accept?: string;
  onChange?: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <div
        className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-[#132b58]/50 p-4"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file && onChange) {
              onChange(file);
              setFile(file);
              setFileUrl(URL.createObjectURL(file));
            }
          }
        }}
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.click();
          }
        }}
      >
        {fileUrl ? (
          <div className="my-auto flex h-full w-full flex-col">
            <div className="flex basis-[90%] items-center justify-center">
              <Image
                height={100}
                width={100}
                src={fileUrl}
                alt="Preview"
                className="max-h-xl mx-auto object-contain"
              />
            </div>
            {file !== null ? (
              <p className="mx-auto text-center">
                <span className="font-semibold">{text}</span>: {file.name}
              </p>
            ) : (
              <p className="mx-auto">
                <span className="font-semibold">{text}</span>: file
              </p>
            )}
          </div>
        ) : (
          <>
            {accept === "image/*" && <RiImageAddLine className="m-4 size-12" />}
            <p
              className="text-center"
              dangerouslySetInnerHTML={{
                __html: `Drag and drop your ${text ?? "files"} here`,
              }}
            />
          </>
        )}
      </div>
      <input
        type="file"
        accept={accept}
        ref={inputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onChange) {
            onChange(file);
            setFile(file);
            setFileUrl(URL.createObjectURL(file));
          }
        }}
      />
    </>
  );
}
