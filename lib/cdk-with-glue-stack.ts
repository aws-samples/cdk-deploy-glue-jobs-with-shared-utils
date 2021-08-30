import {
    Stack,
    StackProps,
    Construct,
    aws_s3 as s3,
    RemovalPolicy,
} from "monocdk";
import { GlueJob } from "./constructs/GlueJob";

export class CdkWithGlueStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const dataBucket = new s3.Bucket(this, "data-bucket", {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const sampleEtlJob = new GlueJob(this, "sample-etl-job", {
            jobName: "sampleEtlJob",
            scriptLocation: "src/jobs/sample_etl_job.py",
            defaultArguments: {
                "--data-bucket": dataBucket.bucketName,
            },
        });
    }
}
