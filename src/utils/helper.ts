import { toast } from "sonner";
import { pptUrl } from "~/constants";

function getUrlAndId(data: string) {
  return {
    url: data.split(";")[0] ?? "",
    public_id: data.split(";")[1] ?? "",
  };
}

async function downloadPPT() {
  try {
    const res = await fetch(pptUrl);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "Idea_template.pptx";
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    toast.error("Failed to download the template");
  }
}

export { getUrlAndId, downloadPPT };
