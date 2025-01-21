import { College, User } from "@prisma/client";

export default function Status({user}:{user:User & {
college:College|null
}}){
return(

	<div>
		{user.profileProgress}
	</div>
)
}
