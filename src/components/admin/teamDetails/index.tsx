// import { getTeamDetailsById } from "@/src/server/actions";
import { IdeaSubmission, Team, User } from "@prisma/client";
import { useState } from "react";

export default function TeamsList({
  teams,
}: {
  teams: { teamName: string; id: string }[] | undefined;
}) {
  const [teamDetails, setTeamDetails] = useState<
    | (Team & { members: User[] } & { ideaSubmission: IdeaSubmission | null })
    | null
  >(null);
  const handleTeamDetails = async (teamId: string) => {
    // setTeamDetails(await getTeamDetailsById(teamId));
  };
  return (
    <>
      <h1 className="text-center text-xl">Team Details</h1>
      <div className="m-auto flex w-3/4 justify-between p-10">
        <div className="w-fit bg-gray-300 p-5">
          <h1 className="border-b text-center">Teams</h1>
          {teams?.map((team) => {
            return (
              <button
                data-teamid={team.id}
                onClick={(e) =>
                  handleTeamDetails(
                    e.currentTarget.getAttribute("data-teamid") ?? "",
                  )
                }
                key={team.id}
              >
                {team.teamName}
              </button>
            );
          })}
        </div>
        <div className="w-full bg-gray-500 p-5">
          {teamDetails ? (
            <>
              <h2 className="border-b text-center">
                Team Name: {teamDetails?.name}
              </h2>
              <div className="flex">
                <div className="border-r p-3">
                  <h2>Track: {teamDetails?.ideaSubmission?.track}</h2>

                  <h2>
                    Problem Statement:{" "}
                    {teamDetails?.ideaSubmission?.problemStatement}
                  </h2>
                  <a
                    className="m-2 rounded border p-2"
                    href={teamDetails?.ideaSubmission?.pptUrl.split(";")[1]}
                  >
                    View PPT
                  </a>
                </div>
                <div className="p-3">
                  <div>
                    <h2>Members</h2>
                    {teamDetails?.members.map((member, index) => {
                      return (
                        <div key={index}>
                          <h3>{member.name}</h3>
                          <h3>{member.email}</h3>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <h2>Team status</h2>
                    <h3>
                      <b>Completed:</b> {teamDetails?.isComplete}
                    </h3>
                    <h3>
                      Idea Submitted:{" "}
                      {teamDetails?.ideaSubmission?.pptUrl ? "Yes" : "No"}
                    </h3>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <h2 className="text-center">No Team Selected</h2>
          )}
        </div>
      </div>
    </>
  );
}
