import React, { useRef, useState } from "react";
import { Card, CardContent } from "../card";
import { Button } from "../button";

// Define the props expected by the Dropzone component
interface DropzoneProps {
  // onChange: React.Dispatch<React.SetStateAction<string[]>>;
  onChange: React.Dispatch<React.SetStateAction<File | null>>;
  className?: string;
  fileExtension?: string;
  image?: string;
  pdf?: boolean;
}

// Create the Dropzone component receiving props
export function Dropzone({
  onChange,
  className,
  fileExtension,
  image,
  pdf,
  ...props
}: DropzoneProps) {
  // Initialize state variables using the useState hook
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to file input element
  const [fileInfo, setFileInfo] = useState<string | null>(null); // Information about the uploaded file
  const [error, setError] = useState<string | null>(null); // Error message state
  const [previewURL, setPreviewURL] = useState<string | null>(image ?? null);

  // Function to handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Function to handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;
    handleFiles(files);
  };

  // Function to handle file input change event
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      handleFiles(files);
    }
  };

  // Function to handle processing of uploaded files
  const handleFiles = (files: FileList) => {
    const uploadedFile = files[0]!;
    const allowedImageTypes = pdf
      ? ["application/pdf"]
      : ["image/jpeg", "image/png", "image/jpg"];

    // Check file extension
    // if (fileExtension && !uploadedFile.name.endsWith(`.${fileExtension}`)) {
    if (!allowedImageTypes.includes(uploadedFile.type)) {
      setError(`Invalid file type. Expected: .${fileExtension}`);
      return;
    }

    const fileSizeInKB = Math.round(uploadedFile.size / 1024); // Convert to KB

    const fileList = Array.from(files).map((file) => URL.createObjectURL(file));
    console.log(fileList);
    // onChange((prevFiles) => [...prevFiles, ...fileList]);
    onChange(uploadedFile);

    // Display file information
    setFileInfo(`Uploaded file: ${uploadedFile.name} (${fileSizeInKB} KB)`);
    setError(null); // Reset error state
    const previewURL = URL.createObjectURL(uploadedFile);
    setPreviewURL(previewURL);
  };

  // Function to simulate a click on the file input element
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card
      className={`border-2 border-dashed bg-muted hover:cursor-pointer hover:border-muted-foreground/50 ${className}`}
      {...props}
      onClick={handleButtonClick}
    >
      <CardContent
        className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center text-muted-foreground">
          <span className="font-medium">Drag File to Upload or</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto flex h-8 space-x-2 px-0 pl-1 text-xs"
            onClick={handleButtonClick}
          >
            Click Here
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={`
            ${pdf ? "application/pdf" : "image/png, image/jpg, image/jpeg"}
            `} // Set accepted file type
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
        {}
        {pdf && <>{fileInfo}</>}
        {!pdf && previewURL ? (
          <img
            src={previewURL}
            alt="Uploaded"
            className="mt-2 h-32 object-cover"
          />
        ) : (
          <svg
            className="h-32 w-32 text-gray-600"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 18"
          >
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
          </svg>
        )}
        <div className="text-center text-xs text-muted-foreground">
          {pdf
            ? "Only .pdf is allowed less than 2MB"
            : "Only .png, .jpg, and .jpeg files are allowed less than 2MB."}
        </div>

        {/* {fileInfo && <p className="text-muted-foreground">{fileInfo}</p>} */}
        {error && <span className="text-red-500">{error}</span>}
      </CardContent>
    </Card>
  );
}
