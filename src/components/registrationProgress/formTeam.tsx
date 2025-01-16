import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import RegisterTeamForm from '../forms/createTeam';

export default function FormTeam() {
  return (
    <div className="flex justify-center">
      {/* <div className="mx-auto mt-[10rem] w-full max-w-6xl bg-black/50 md:mt-[12rem]"> */}
        <Card className="mx-4 mt-[12rem] w-full max-w-7xl bg-black/50 py-2 md:mt-[14rem] md:py-4">
          <CardHeader>
            <CardTitle
              id="form-title"
              className="bg-gradient-to-b from-neutral-50 via-neutral-500 to-neutral-300 bg-clip-text text-center md:text-5xl text-3xl font-bold text-transparent"
            >
              Team Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mx-auto max-w-4xl">
                <RegisterTeamForm />
            </div>
          </CardContent>
        </Card>
      {/* </div> */}
    </div>
  );
}
