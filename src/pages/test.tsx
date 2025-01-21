import React, { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";

import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Test() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFile(f);
            const url = URL.createObjectURL(f);
            setFileUrl(url);
          }
        }}
      />
      {fileUrl && (
        <Document file={file} className={"h-10"}>
          <Page pageNumber={1} height={100} width={100}/>
        </Document>
      )}
    </div>
  );
}
