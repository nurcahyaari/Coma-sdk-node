import Websocket from 'ws';

export interface IConfig {
    Origin: string,
    Host: string;
    Port: number;
    Key: string;
    Retry: number;
    RetryWaitTime: number;
}

interface IMessageObserver {
    clientKey: string;
    data: any;
}

export interface IComaSDK {
    observe(cfg: any): Promise<boolean>
}

export class ComaSDK implements IComaSDK{
    private cfg: IConfig;
    private ws: Websocket;
    constructor(config: IConfig) {
        this.cfg = config;
        this.ws = this.connect();
    }

    private connect(): Websocket {
        const ws = new Websocket(`ws://${this.cfg.Host}:${this.cfg.Port}/websocket?authorization=${this.cfg.Key}`);
        return ws
    }

    private async reconnect(cfg: any): Promise<boolean> {
        const ws = this.connect();
        this.ws = ws;
        return new Promise((resolve, reject) => {
            ws.on('open', () => {
                console.log('connected to server')
                this.observe(cfg);
                resolve(true);
            });

            ws.on('error', () => {
                reject(false)
            })
        });
    }

    async observe(cfg: any): Promise<boolean> {
        try {
            this.ws.on('message', (data: Buffer) => {
                let buf = Buffer.from(data);
                let json: IMessageObserver = JSON.parse(buf.toString());
                for (const k in json.data) {
                    cfg[k] = json.data[k]
                }
                console.log(`received data ${JSON.stringify(cfg)}`);
            })

            this.ws.on('close', async () => {
                console.log('server disconnected')
                for (let ret = 0; ret < this.cfg.Retry; ret++) {
                    try {
                        console.log(`retry: ${ret + 1}`);
                        let success = await this.reconnect(cfg);
                        if (success) {
                            return;
                        }   
                    } catch (error) {
                        await new Promise((resolve) => setTimeout(resolve, this.cfg.RetryWaitTime));
                    }
                }
            })

            return new Promise((resolve) => {
                this.ws.once('message', () => {
                    resolve(true);
                })
            })
        } catch (error) {
            let message: string = 'Unknown Error';
            if (error instanceof Error) message = error.message;

            throw new Error(message);
        }
    }
}