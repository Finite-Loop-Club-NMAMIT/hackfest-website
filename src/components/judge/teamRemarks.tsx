import { api } from "~/utils/api";
import Spinner from "../spinner";
import { Badge } from "~/components/ui/badge";

export default function TeamRemarks({teamId, judgeDay}: {teamId: string, judgeDay: string}) {
    const remarksByTeamQuery = api.judges.getRemarksByteam.useQuery({teamId: teamId});
    return(
        <>                                                       
          {
            remarksByTeamQuery.status === "loading" && <Spinner />
          }                                                   
          {
            remarksByTeamQuery.status === "success" && remarksByTeamQuery.data.map((remark,index) => (
                <div key={index} className="bg-slate-900 p-3 rounded-xl flex flex-col gap-3">
                <Badge className={`w-fit ${remark.judge.type === 'DAY1' ? 'bg-blue-500 text-white' : 'bg-green-500'}`}
                >
                    {remark.judge.type === 'DAY1' ? 'MENTOR' : 'JUDGE'}
                </Badge>
                <span>
                    {remark.remarks}
                </span>
            </div>
            ))
          }   
        </>
    )
}