import { Account } from "@/lib/account";
import { db } from "@/server/db";
import { NextResponse, type NextRequest } from "next/server";


export const POST = async ( req: NextRequest) =>{
    console.log('sync request hit')
    const { accountId, userId} = await req.json()

    if (!accountId || !userId){
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
    const response  = await account.performInitialSync()

    if (!response){
        return NextResponse.json({ error :"Failed to perform initial sync"}, {status: 500})
    
    }

    const {emails, deltaToken } = response 
    console.log('emails', emails)

    //  await db.account.update({
    //     where: {
    //         id :  accountId
    //     },
    //     data :{
    //         nextDeltaToken : deltaToken
    //     }
    //  })


    console.log ( 'sync completed', deltaToken)
    return NextResponse.json({ success:true}, {status : 200})
    // await syncEmailsToDatabase(emails)
}


