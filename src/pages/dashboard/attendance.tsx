import { useZxing } from "react-zxing";
import { useState } from "react";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import NotFound from "../404";
import DashboardLayout from "~/components/layout/dashboardLayout";
import Spinner from "~/components/spinner";
// Import necessary UI components
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

export default function Attendance() {
    const { data: sessionData, status } = useSession();
    interface AttendedUser {
        name: string | null;
        teamName: string | undefined;
        collegeName: string | undefined;
    }
    const [attendedUser, setAttendedUser] = useState<AttendedUser | null>(null);
  const updateAttendance = api.user.markAttendance.useMutation({
    onSuccess: () => {
      toast.dismiss("attendance");
      toast.success("Attendance marked successfully");
      setResult(null);
    },
    onError: (error) => {
      toast.dismiss("attendance");
      toast.error(error.message);
    },
  });

  if (updateAttendance.isLoading) {
    toast.loading("Marking attendance...", { id: "attendance" });
  }

  const [result, setResult] = useState<string | null>(null);
  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
      stopCamera();
    },
    onError: (error) => {
      console.error("Scanner error:", error);
    },
  }) as { ref: React.RefObject<HTMLVideoElement> };

  const stopCamera = () => {
    const stream = ref.current?.srcObject as MediaStream;
    const tracks = stream?.getTracks();
    tracks?.forEach((track) => {
      track.stop();
    });
  };

  const startCamera = async () => {
    await navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        const video = ref.current;
        if (video) {
          video.srcObject = stream;
        }
      });
  };
    if (status === "loading")
      return (
        <DashboardLayout>
          <div className="flex h-screen w-screen items-center justify-center">
            <Spinner />
          </div>
        </DashboardLayout>
      );
  if (
    !sessionData?.user ||
    (sessionData.user.role !== "TEAM" && sessionData.user.role !== "ADMIN")
  ) {
    return <NotFound />;
  }
  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-950">
        <video className="w-full rounded-lg border border-gray-400" ref={ref} />
        {!result && (
          <div className="mt-2 text-center text-sm text-gray-400">
            <span className="text-green-500">Note:</span> Detection is retried
            every 300ms. If you are not seeing the detection, try moving the
            camera closer to the QR code.
          </div>
        )}
        {result && <Badge color={"info"}>Scanned ID: {result}</Badge>}

        {result && (
          <Button
            onClick={async () => {
              await updateAttendance
                .mutateAsync({
                  userId: result,
                })
                .then((res) => {
                  setAttendedUser(res);
                });
            }}
          >
            Mark Attendance
          </Button>
        )}
        {!result && (
          <Button
            onClick={async () => {
              setAttendedUser(null);
              await startCamera();
            }}
          >
            Scan
          </Button>
        )}
        {attendedUser && (
          <Card className="dark mx-5 py-8">
            <CardHeader>
              <CardTitle>Attended User</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col text-xl text-green-500">
              <div className="font-bold">{attendedUser.name}</div>
              <div className="font-semibold">{attendedUser.teamName}</div>
              <div>{attendedUser.collegeName}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
