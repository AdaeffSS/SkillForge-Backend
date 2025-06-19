import { HttpException, Injectable } from "@nestjs/common";
import axios from "axios";
import * as process from "node:process";
import * as qs from "qs";

@Injectable()
export class ZvonokService {
  async sendCall(phone: string): Promise<string> {
    const publicKey = process.env.ZVONOK_PUBLIC_KEY;
    const campaignId = process.env.ZVONOK_CAMPAIGN_ID;

    const data = {
      public_key: publicKey,
      campaign_id: campaignId,
      phone,
    };

    const headers = {
      "content-type": "application/x-www-form-urlencoded",
    };

    try {
      const response = await axios.post(
        "https://zvonok.com/manager/cabapi_external/api/v1/phones/flashcall/",
        qs.stringify(data),
        { headers },
      );
      return response.data.data?.pincode.toString();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
