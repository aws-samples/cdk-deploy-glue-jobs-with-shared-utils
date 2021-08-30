import { Construct, aws_glue as glue, aws_iam as iam, aws_s3_assets as assets } from "monocdk";

export interface GlueJobProps {
  jobName: string;
  extraPyFiles?: string[];
  scriptLocation: string;
  defaultArguments: Record<string, string>;
}

export class GlueJob extends Construct {
  readonly job: glue.CfnJob;
  readonly executionRole: iam.Role;

  constructor(scope: Construct, id: string, props: GlueJobProps) {
    super(scope, id);

    this.executionRole = new iam.Role(this, "execution-role", {
      assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
    });
    this.executionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSGlueServiceRole"),
    );

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
    });
  }
}
