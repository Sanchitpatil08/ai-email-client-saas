import axios from "axios";

export class Account {
    private token: string;

    constructor(token: string){
        this.token = token
    }

    private async startsync(){
        const response = await axios.post('https://api.aurinko.io/v1/email/sync',{},{
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

    async performInitialSync () {
        try {
            let syncResponse = await this.startsync()
        } catch (error) {
            
        }
    }
}