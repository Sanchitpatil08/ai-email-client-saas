import { emailAddressSchema, SyncUpdatedResponse, type EmailMessage, type SyncResponse } from "@/types";
import axios, { all } from "axios";

export class Account {
    private token: string;

    constructor(token: string){
        this.token = token
    }

    private async startsync(){
        const response = await axios.post<SyncResponse>('https://api.aurinko.io/v1/email/sync',{},{
            headers:{
                Authorization: `Bearer ${this.token}`,
            },
            params:{
                daysWithin: 2,
                bodyType: 'html'
            }
        })

        return response.data
    }

    async getUpdatedEmail ({ deltaToken, pageToken }: { deltaToken? : string, pageToken?: string }) {
        let params : Record<string, string> = {}
        if (deltaToken) params.deltaToken = deltaToken
        if(pageToken) params.pageToken  = pageToken

        const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
            headers:{
                Authorization: `Bearer ${this.token}`,
            },
            params

        })

        return response.data
    } 

    async performInitialSync () {
        try {
            let syncResponse = await this.startsync()
            while(!syncResponse.ready){
                await new Promise ( resolve => setTimeout( resolve, 1000))
                syncResponse = await this.startsync()
            }


            // get the book mark delta token 
            let storedDeltaToken : string = syncResponse.syncUpdatedToken

            let UpdatedResponse = await this.getUpdatedEmail({deltaToken : storedDeltaToken})

            if (UpdatedResponse.nextDeltaToken) {
                // sync has completed

                storedDeltaToken = UpdatedResponse.nextDeltaToken
            }

            let allEmails : EmailMessage [] = UpdatedResponse.records

            // fetch all pages if there are more 

            while ( UpdatedResponse.nextPageToken) {
                UpdatedResponse = await this.getUpdatedEmail({ pageToken: UpdatedResponse.nextPageToken })
                allEmails = allEmails.concat(UpdatedResponse.records)

                if(UpdatedResponse.nextDeltaToken) {
                     // sync has ended 

                     storedDeltaToken = UpdatedResponse.nextDeltaToken
                }
            }

            console.log('initial sync completed, we have synced', allEmails.length, 'emails')

            // store the lated delta token for the future incremntal sync

            return {
                emails : allEmails,
                deltaToken : storedDeltaToken
            }


        } catch (error) {
            if( axios.isAxiosError(error)){
                console.error('Error during sync:', JSON.stringify(error.response?.data, null, 2));
            }else{
                console.error('Error during sync', error)
            }
        }
    }
}