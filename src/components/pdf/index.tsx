import React from "react";
import { Document, pdfjs, Thumbnail } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfPreview({
  className,
  height,
  width,
  file,
  pages,
}: {
  className?: string;
  height?: number;
  width?: number;
  file: File | string;
  pages: Array<number>;
}) {
  return (
    <Document file={file} className={className} renderMode="canvas">
      {pages.map((page) => {
        return <Thumbnail key={page} pageNumber={page} height={height} width={width} />;
      })}
    </Document>
  );
}
