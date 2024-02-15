import { XMessage } from "@samagra-x/xmessage";
import { ITransformer } from "../common";

export class RandomBinaryTransformer implements ITransformer {

    constructor(
        private readonly config: Record<string, any>
    ) { }

    async transform(xmsg: XMessage): Promise<XMessage> {
        console.log("RANDOM_BINARY transformer used with: " + JSON.stringify(xmsg));
        xmsg.transformer = {
            metaData: {
                state: Math.random() > 0.5 ? 'if' : 'else',
            }
        }
        return xmsg;
    }
}