import { Injectable } from "@nestjs/common";
import { TaskConfigurer } from "@tasks/taskConfigurer";
import { RegisterTask } from "@tasks/tasks.decorator";
import { Exam, Sub } from "@tasks/enums";
import { S3Service } from "../../../s3/s3.service";

@Injectable()
@RegisterTask(Exam.EGE, Sub.INFO, "t_24_1")
export class Task extends TaskConfigurer {
  private s3 = new S3Service();

  protected readonly paramsSchema = {
    file: {
      creator: async (params: any): Promise<any> => {
        const length = 1_000_000;
        const charset = "0123456789abcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < length; i++) {
          result += this.random.pick(charset);
        }
        const key = `t_24_1/${String(this.random.getSeed())}`;
        this.s3.upload(key, result).then()
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
