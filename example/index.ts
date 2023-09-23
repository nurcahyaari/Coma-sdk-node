import express, { Request, Response } from 'express';
import { ComaSDK, IConfig as IComaSDKConfig } from 'coma-sdk-node';

interface IConfig {
    PORT: number,
    NAME: string,
    APPLICATION_TYPE: string,
    RENDER_NAME: boolean,
}

let config: IConfig = {
    PORT: 3000,
    NAME: "Test",
    APPLICATION_TYPE: "application/json",
    RENDER_NAME: false
}

const coma = new ComaSDK({
    Origin: "http://localhost:3000/swagger/index.html#/Config/get_v1_configuration",
    Host: "localhost",
    Port: 3001,
    Key: "1O7LIFosR1HLcfjqco0u7Lhb1gHxON326yT4",
    Retry: 5,
    RetryWaitTime: 5000
});

coma.observe(config);

console.log(config);

const app = express();

app.get("/", (req: Request, res: Response) => {
    if (config.RENDER_NAME) {
        res.set('content-type', config.APPLICATION_TYPE);
        res.send(`Hello ${config.NAME}`)
        return
    }
    res.set('content-type', config.APPLICATION_TYPE);
    res.send(config);
})

app.listen(config.PORT, function() {
    console.log(`Example app listening on port ${config.PORT}`)
})