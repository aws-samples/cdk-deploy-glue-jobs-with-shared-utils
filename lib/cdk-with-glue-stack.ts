import { Stack, StackProps, Construct, aws_s3 as s3, RemovalPolicy } from "monocdk";
import { GlueJob } from "./constructs/GlueJob";

export class CdkWithGlueStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dataBucket = new s3.Bucket(this, "data-bucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const sampleEtlJob = new GlueJob(this, "sample-etl-job", {
      jobName: "SampleEtlJob",
      scriptLocation: "glue/src/jobs/sample_etl_job.py",
      extraPyFiles: ["glue/dist/glue_src-0.0.1-py3.7.egg"],
      defaultArguments: {
        "--data-bucket": dataBucket.bucketName,
        "--input-data-path": "orc",
      },
    });

    const convertCsvToOrc = new GlueJob(this, "convert-csv-to-orc", {
      jobName: "ConvertCsvToOrc",
      scriptLocation: "glue/src/jobs/convert_csv_to_orc.py",
      extraPyFiles: ["glue/dist/glue_src-0.0.1-py3.7.egg"],
      defaultArguments: {
        "--data-bucket": dataBucket.bucketName,
        "--input-data-path": "csv",
        "--output-data-path": "orc",
      },
    });
  }
}
