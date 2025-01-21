import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
    addReferralCodeZ,
  } from "~/server/schema/zod-schema";

  export const referralRouter = createTRPCRouter({
    addReferralCode: protectedProcedure
    .input(addReferralCodeZ)
    .mutation(async ({input, ctx}) => {
        try {  
            
            const referral = await ctx.db.referral.create({
                data: {
                    code: '',
                    referrer: input.referrer,
                    collegeId: input.collegeId,
                    name: input.name,
                    contact: input.contact
                }
            })
            const updatedReferral = await ctx.db.referral.update({
                where:{
                    id: referral.id
                },
                data:{
                    code: `HF2024_${("00" + referral.id).slice(-3)}`
                }
            })
            return updatedReferral;
        } catch (error) {
            console.log(error)
            throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong"
            })
        }
    }),

    getAllReferrals: protectedProcedure
    .query(async ({ctx}) => {
        try{
            const referrals = await ctx.db.referral.findMany({
                include: {
                    college: true
                }
            });
            return referrals;
        }catch(error){
            console.log(error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    })
  })
  