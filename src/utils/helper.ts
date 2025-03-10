import { toast } from "sonner";
import { brochureUrl, pptUrl } from "~/constants";

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

async function downloadBrochure() {
  toast.loading("Downloading Brochure",{ id: 'brochure' });
  
  try {
    const res = await fetch(brochureUrl);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "Hackfest_Brochure.pdf";
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    toast.dismiss('brochure');
    toast.success("Brochure downloaded successfully");
  } catch (error) {
    toast.dismiss('brochure');
    toast.error("Failed to download the Brochure");
  }
}

async function downloadFromUrl(url: string, fileName: string) {
  toast.loading("Downloading...", { id: "download" });

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName;
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    toast.dismiss("download");
    toast.success("downloaded successfully");
  } catch (error) {
    toast.dismiss("brochdownloadure");
    toast.error("Download failed");
  }
}

export { getUrlAndId, downloadPPT, downloadBrochure, downloadFromUrl };
