import { Injectable } from "@nestjs/common";
import { BaseTask } from "@tasks/baseTask";
import { RegisterTask } from "@tasks/tasks.decorator";
import { Exam, Sub } from "@tasks/enums";
import { S3Service } from "../../../s3/s3.service";

@Injectable()
@RegisterTask(Exam.EGE, Sub.INFO, "t_24_2")
export class Task extends BaseTask {
  private s3 = new S3Service();

  protected readonly paramsSchema = {
    file: {
      creator: async (params: any): Promise<any> => {
        const length = 1_000_000;
        const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        for (let i = 0; i < length; i++) {
          result += this.random.pick(charset);
        }
        const key = `t_24_2/${String(this.random.getSeed())}`;
        this.s3.upload(key, result);
        return await this.s3.getSignedUrl(key);
      },
      depends: {},
    },

    answer: {
      creator: (params: any): any => 5,
      depends: {},
    },
  };
}
