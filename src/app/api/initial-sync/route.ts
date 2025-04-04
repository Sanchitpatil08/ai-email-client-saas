import { Account } from "@/lib/account";
import { db } from "@/server/db";
import { NextResponse, type NextRequest } from "next/server";

export const POST = async ( req: NextRequest) =>{
    const { accountId, userId} = await req.json()

    if (!accountId || userId){
        return NextResponse.json({message:'Missing accountId or userId'}, {status:400})
    }

    const dbAccount = await db.account.findUnique({
        where:{
            id: accountId,
            userId
        }
    })

    if(!dbAccount) return NextResponse.json({ error:'account not found'}, {status: 400})

    // perform Initial Sync 

    const account = new Account(dbAccount.accessToken)
    const emails = await performInitialSync ()
    await syncEmailsToDatabase(emails)
}