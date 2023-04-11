import {
    aws_kms as kms,
    aws_glue as glue,
    aws_iam as iam,
    aws_s3_assets as assets,
    Names,
    RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export interface GlueJobProps {
    jobName: string;
    extraPyFiles?: string[];
    scriptLocation: string;
    defaultArguments: Record<string, string>;
}

export class GlueServiceRolePolicy extends iam.PolicyDocument {
    constructor() {
        super({
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents",
                        "logs:AssociateKmsKey",
                    ],
                    resources: ["arn:aws:logs:*:*:/aws-glue/*"],
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ["glue:GetSecurityConfiguration"],
                    resources: ["*"],
                }),
            ],
        });
    }
}

export class GlueJob extends Construct implements iam.IGrantable {
    readonly job: glue.CfnJob;
    readonly executionRole: iam.Role;

    get grantPrincipal(): iam.IPrincipal {
        return this.executionRole;
    }

    constructor(scope: Construct, id: string, props: GlueJobProps) {
        super(scope, id);

        this.executionRole = new iam.Role(this, "execution-role", {
            assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
            inlinePolicies: {
                "glue-service-policy": new GlueServiceRolePolicy(),
            },
        });

        const scriptAsset = new assets.Asset(this, "script-assest", {
            path: props.scriptLocation,
        });
        scriptAsset.grantRead(this.executionRole);

        const extraPyAssets = props.extraPyFiles?.map((filePath) => {
            const asset = new assets.Asset(this, filePath.replace("/", "-"), {
                path: filePath,
            });
            asset.grantRead(this.executionRole);
            return asset;
        });

        const defaultArguments = props.defaultArguments;
        if (extraPyAssets) {
            const urls = extraPyAssets.map((asset) => asset.s3ObjectUrl).join(",");
            defaultArguments["--extra-py-files"] = urls.length == 1 ? urls[0] : urls;
        }

        const encryptionKey = new kms.Key(this, "encryption-key", {
            enableKeyRotation: true,
            // As is, this code is for demo only. Consider retaining this key in a real production in environment
            removalPolicy: RemovalPolicy.DESTROY,
        });
        encryptionKey.grantEncryptDecrypt(new iam.ServicePrincipal("logs.amazonaws.com"));

        const securityConfiguration = new glue.CfnSecurityConfiguration(
            this,
            "security-configuration",
            {
                encryptionConfiguration: {
                    s3Encryptions: [
                        {
                            s3EncryptionMode: "SSE-S3",
                        },
                    ],
                    cloudWatchEncryption: {
                        cloudWatchEncryptionMode: "SSE-KMS",
                        kmsKeyArn: encryptionKey.keyArn,
                    },
                    jobBookmarksEncryption: {
                        jobBookmarksEncryptionMode: "CSE-KMS",
                        kmsKeyArn: encryptionKey.keyArn,
                    },
                },
                name: `security-configuration-${Names.uniqueId(this)}`,
            },
        );

        this.job = new glue.CfnJob(this, "glue-job", {
            name: props.jobName,
            glueVersion: "3.0",
            command: {
                name: "glueetl",
                pythonVersion: "3",
                scriptLocation: scriptAsset.s3ObjectUrl,
            },
            defaultArguments: defaultArguments,
            role: this.executionRole.roleArn,
            securityConfiguration: securityConfiguration.name,
        });
    }
}
