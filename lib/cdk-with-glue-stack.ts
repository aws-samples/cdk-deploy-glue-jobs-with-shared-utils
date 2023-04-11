import {
    Stack,
    StackProps,
    RemovalPolicy,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    CfnOutput,
    Duration,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { GlueJob } from "./constructs/GlueJob";

export class CdkWithGlueStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const dataBucket = new s3.Bucket(this, "data-bucket", {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            enforceSSL: true,
            autoDeleteObjects: true,
            serverAccessLogsPrefix: "accessLogs",
            encryption: s3.BucketEncryption.S3_MANAGED,
            lifecycleRules: [
                {
                    // This code is for demo only, delete data after 14 days to prevent
                    // unnecessary charges
                    expiration: Duration.days(14),
                },
            ],
        });
        new CfnOutput(dataBucket, "name", {
            value: dataBucket.bucketName,
        });

        const dataTable = new dynamodb.Table(this, "data-table", {
            partitionKey: {
                name: "Index",
                type: dynamodb.AttributeType.STRING,
            },
            pointInTimeRecovery: true,
            removalPolicy: RemovalPolicy.DESTROY,
        });
        new CfnOutput(dataTable, "name", {
            value: dataTable.tableName,
        });

        const loadToDataBase = new GlueJob(this, "sample-etl-job", {
            jobName: "LoadToDatabase",
            scriptLocation: "glue/src/jobs/load_to_database.py",
            extraPyFiles: ["glue/dist/glue_src-0.0.1-py3-none-any.whl"],
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
            extraPyFiles: ["glue/dist/glue_src-0.0.1-py3-none-any.whl"],
            defaultArguments: {
                "--data-bucket": dataBucket.bucketName,
                "--input-data-path": "csv",
                "--output-data-path": "orc",
            },
        });
        dataBucket.grantReadWrite(convertCsvToOrc);
    }
}
