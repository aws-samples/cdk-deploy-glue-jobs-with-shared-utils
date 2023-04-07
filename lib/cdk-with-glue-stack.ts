import {
    Stack,
    StackProps,
    RemovalPolicy,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { GlueJob } from "./constructs/GlueJob";

export class CdkWithGlueStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const dataBucket = new s3.Bucket(this, "data-bucket", {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });
        // Output bucket name so it is visible in command line for developer convenience
        new CfnOutput(this, "data-bucket", { value: dataBucket.bucketName });

        const dataTable = new dynamodb.Table(this, "data-table", {
            partitionKey: {
                name: "Index",
                type: dynamodb.AttributeType.STRING,
            },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        new CfnOutput(this, "data-bucket-output", {
            value: dataBucket.bucketName,
        });

        new CfnOutput(this, "data-table-output", {
            value: dataTable.tableName,
        });

        const loadToDataBase = new GlueJob(this, "sample-etl-job", {
            jobName: "LoadToDatabase",
            scriptLocation: "glue/src/jobs/load_to_database.py",
            extraPyFiles: ["glue/dist/glue_src-0.0.1-py3.7.egg"],
            defaultArguments: {
                "--data-bucket": dataBucket.bucketName,
                "--input-data-path": "orc",
                "--output-table": dataTable.tableName,
            },
        });
        dataBucket.grantRead(loadToDataBase);
        dataTable.grantReadWriteData(loadToDataBase);
        dataTable.grant(loadToDataBase, "dynamodb:DescribeTable");

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
        dataBucket.grantReadWrite(convertCsvToOrc);
    }
}
