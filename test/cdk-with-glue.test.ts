import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib/core";
import * as CdkWithGlue from "../lib/cdk-with-glue-stack";

describe("CdkWithGlueStack", () => {
    let template: Template;

    beforeAll(() => {
        const sut = new CdkWithGlue.CdkWithGlueStack(new App(), "StackUnderTest");
        const template = Template.fromStack(sut);
    });

    test("Deploys 2 Glue Jobs", () => {
        template.hasResource("AWS::Glue::Job", { countResources: 2 });
    });

    test("Deploys an S3 Bucket", () => {
        template.hasResource("AWS::S3::Bucket", { countResources: 1 });
    });

    test("Deploys a DynamoDB Table", () => {
        template.hasResource("AWS::DynamoDB::Table", { countResources: 1 });
    });
});
