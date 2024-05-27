import fs from 'fs';

import config from "../config/config.json" with {type: "json"}


export class Configuration {

    private readonly appId: string;
    private readonly secret: string;
    private readonly icarusId: string;
    private readonly broadcasterId: string;

    private refreshToken: string;
    private accessToken: string;

    constructor () {
        this.appId = config.twitch.appId
        this.secret = config.twitch.secret
        this.icarusId = config.twitch.icarusId
        this.broadcasterId = config.twitch.broadcasterId
        this.refreshToken = config.twitch.refreshToken
        this.accessToken = config.twitch.accessToken

    }

    public getAccessToken () {
        return structuredClone(this.accessToken)
    }

    public getAppId () {
        return structuredClone(this.appId)
    }

    public getIcarusId () {
        return structuredClone(this.icarusId)
    }

    public getClientSecret () {
        return structuredClone(this.secret)
    }

    public getBroadcasterId () {
        return structuredClone(this.broadcasterId)
    }

    public getRefreshToken () {
        return structuredClone(this.refreshToken)
    }

    public updateRefreshToken (refreshToken: string) {
        this.refreshToken = refreshToken
        this.writeCredentials().then()
    }

    public updateAccessToken (accessToken: string) {
        this.accessToken = accessToken
        this.writeCredentials().then()
    }

    public async updateTokens (refreshToken: string, accessToken: string) {
        this.refreshToken = refreshToken
        this.accessToken = accessToken
        this.writeCredentials().then()
    }

    public async writeCredentials () {
        try {
            config.twitch.accessToken = this.accessToken
            config.twitch.refreshToken = this.refreshToken
            const updatedJsonData = JSON.stringify(config, null, 2)
            await fs.promises.writeFile("config/config.json", updatedJsonData, 'utf8')

        } catch (err) {
            console.error(err)
        }
    }

    public makeTmiConfig (): {} {
        return {
            "options": config.tmi.options,
            "identity": {
                "username": config.tmi.identity.username,
                "password": "oauth:" + this.getAccessToken()
            },
            "channels": config.tmi.channels,
            "connection": {}
        }
    }

}

export class TwitchAPI {

    private config: Configuration;

    constructor () {
        this.config = new Configuration()
        this.refreshApiKey().then()
    }

    public async removeMessage (id: string): Promise<boolean> {
        return this.removeMessageRec(id, 0)
    }

    private async removeMessageRec (id: string, depth: number): Promise<boolean> {

        const url = `https://api.twitch.tv/helix/moderation/chat?broadcaster_id=${this.config.getBroadcasterId()}&moderator_id=${this.config.getIcarusId()}&message_id=${id}`

        const headers = {
            "Authorization": `Bearer ${this.config.getAccessToken()}`,
            "Client-Id": this.config.getAppId()
        }

        return await fetch(url, {
            method: 'DELETE',
            headers: headers
        })
            .then(response => {
                if (response.status === 204) {
                    console.log(`Message ID: ${id} successfully removed.`)
                    return true
                } else if (response.status === 401) {
                    console.log(`Message ID: ${id} not removed. 401 Unauthorized.\nRequesting new key.`)
                    this.refreshApiKey()
                    if (depth < 3) {
                        return this.removeMessageRec(id, ++depth);
                    } else {
                        return false
                    }
                } else {
                    console.log(`Message ID failed with status code ${response.status}, retrying...`)
                    if (depth < 3) {
                        return this.removeMessageRec(id, ++depth);
                    } else {
                        return false
                    }
                }
            })
            .catch(error => {
                console.error("Error: ", error)
                return false
            })

    }

    public async refreshApiKey () {

        const clientId: string = this.config.getAppId();
        const clientSecret: string = this.config.getClientSecret();
        const encodedRefreshToken = encodeURIComponent(this.config.getRefreshToken());

        console.log(encodedRefreshToken);

        await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=refresh_token&refresh_token=${encodedRefreshToken}&client_id=${clientId}&client_secret=${clientSecret}`,
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Request failed: ' + response.status);
                }
            })
            .then(data => {
                this.config.updateTokens(data.refresh_token, data.access_token);

            })
            .catch(error => {
                console.error('Error:', error);
            });

    }

    public getTmiConfig (): {} {
        return this.config.makeTmiConfig()
    }

}



