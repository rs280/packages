import { XMessage } from "@samagra-x/xmessage";
import { ITransformer } from "../common/transformer.interface";
import axios, { AxiosRequestConfig } from 'axios';

export class DocRetrieverTransformer implements ITransformer {

    /// Accepted config properties:
    ///     BFFBaseURL: BFF endpoint.
    ///     topK: Int describing number of top matched chunks to retrieve. default: 6
    ///     staticNoContentResponse: Bot response message incase no related docs are found, if not given will go though next transformer. (optional)
    constructor(readonly config: Record<string, any>) { }

    async transform(xmsg: XMessage): Promise<XMessage> {
        console.log("DOC_RETRIEVER transformer used with: " + JSON.stringify(xmsg));
        if (!xmsg.transformer) {
            xmsg.transformer = {
                metaData: {}
            };
        }
        if (!this.config.BFFBaseURL) throw new Error('`BFFBaseURL` not defined in DOC_RETRIEVER transformer');
        if (!this.config.topK) this.config.topK = 6;
        let pdfId;
        try { pdfId = JSON.parse(xmsg.payload.metaData! || '{}')['pdfId'] } catch (error){}
        try {
            const config: AxiosRequestConfig = {
              headers: {
                'Content-Type': 'application/json'
              }
            };
            const response = await axios.get(`${this.config.BFFBaseUR}/chunk/retrieve?text=${xmsg.payload.text}${pdfId?`&pdfId=${pdfId}`:''}${this.config.topK ? `&topK=${this.config.topK}`:''}`, config);
            const responseData = response.data;
            if (!xmsg.transformer) {
                xmsg.transformer = {
                    metaData: {}
                };
            }
            xmsg.transformer.metaData!.retrievedChunks = responseData;
            xmsg.transformer.metaData!.state = (responseData && responseData.length) ? 'if' : 'else';
            if(xmsg.transformer.metaData!.state=='else' && this.config.staticNoContentResponse) xmsg.payload.text = this.config.staticNoContentResponse;
            return xmsg;
        } catch (ex) {
            console.error(`NEURAL_COREFERENCE failed. Reason: ${ex}`);
            throw ex;
        }
    }
}