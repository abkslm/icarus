import fs from 'fs';

import config from "../config/config.json" with {type: "json"}

/**
 * TwitchAPI Configuration, reads in from `../config/config.json`
 */
export class Configuration {

    private readonly appId: string;
    private readonly secret: string;
    private readonly icarusId: string;
    private readonly icarusUname: string;
    private readonly broadcasterId: string;

    private refreshToken: string;
    private accessToken: string;

    constructor () {
        this.appId = config.twitch.appId
        this.secret = config.twitch.secret
        this.icarusId = config.twitch.icarusId
        this.icarusUname = config.twitch.icarusUname
        this.broadcasterId = config.twitch.broadcasterId
        this.refreshToken = config.twitch.refreshToken
        this.accessToken = config.twitch.accessToken
    }

    /**
     * Get the Twitch API User Access Token
     */
    public getAccessToken () {
        return structuredClone(this.accessToken)
    }

    /**
     * Get the Twitch API Client ID
     */
    public getAppId () {
        return structuredClone(this.appId)
    }

    /**
     * Get the Icarus account's UUID
     */
    public getIcarusId () {
        return structuredClone(this.icarusId)
    }

    /**
     * Get the Twitch API Secret
     */
    public getClientSecret () {
        return structuredClone(this.secret)
    }

    /**
     * Get the Broadcaster account's UUID
     */
    public getBroadcasterId () {
        return structuredClone(this.broadcasterId)
    }

    /**
     * Get the Twitch API User Access Refresh Token
     */
    public getRefreshToken () {
        return structuredClone(this.refreshToken)
    }

    /**
     * Update the refresh token
     * @param refreshToken The refresh token to replace with
     */
    public updateRefreshToken (refreshToken: string) {
        this.refreshToken = refreshToken
        this.writeCredentials().then()
    }

    /**
     * Update the access token
     * @param accessToken The access token to replace with
     */
    public updateAccessToken (accessToken: string) {
        this.accessToken = accessToken
        this.writeCredentials().then()
    }

    /**
     * Replace both tokens
     * @param refreshToken The refresh token to replace with
     * @param accessToken The access token to replace with
     */
    public async updateTokens (refreshToken: string, accessToken: string) {
        this.refreshToken = refreshToken
        this.accessToken = accessToken
        this.writeCredentials().then()
    }

    /**
     * Write the credentials to config.json
     */
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

    /**
     * Make a tmi.Client configuration Object
     */
    public makeTmiConfig (): {} {
        return {
            "options": config.tmi.options,
            "identity": {
                "username": this.icarusUname,
                "password": "oauth:" + this.accessToken
            },
            "channels": config.tmi.channels,
            "connection": config.tmi.connection,
        }
    }

}

/**
 * The Twitch API Wrapper
 */
export class TwitchAPI {

    private config: Configuration;

    /**
     * Constructor; creates new TwitchAPI.Configuration and refreshes access token
     */
    constructor () {
        this.config = new Configuration()
        this.refreshAccessToken().then()
    }

    /**
     * Removes a message, calls removeMessageRec recursively to enable retries
     * @param id the message id to remove
     */
    public async removeMessage (id: string): Promise<boolean> {
        return this.removeMessageRec(id, 0)
    }

    /**
     * Removes a message, recursively calling self to enable retries in the case of failure.
     * Primary reason for recursion is 401 failure, where the key needs to be renewed, then fn to be called again
     * @param id the message id to remove
     * @param depth the current recursion depth
     * @private
     */
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
                    console.log(`Message ID: ${id} not removed: 401 Unauthorized.\nRequesting new key.`)
                    this.refreshAccessToken()
                    if (depth < 3) {
                        return this.removeMessageRec(id, depth + 1);
                    } else {
                        return false
                    }
                } else if (response.status === 400) {
                    return false
                } else {
                    console.log(`Message ID failed with status code ${response.status}, retrying...`)
                    if (depth < 3) {
                        return this.removeMessageRec(id, depth + 1);
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

    /**
     * Refreshes the access token via Twitch API auth endpoint
     * @private
     */
    private async refreshAccessToken () {

        const clientId: string = this.config.getAppId();
        const clientSecret: string = this.config.getClientSecret();
        const encodedRefreshToken = encodeURIComponent(this.config.getRefreshToken());

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

    /**
     * Creates a tmiConfig via TwitchAPI.Configuration
     */
    public getTmiConfig (): {} {
        return this.config.makeTmiConfig()
    }

}



