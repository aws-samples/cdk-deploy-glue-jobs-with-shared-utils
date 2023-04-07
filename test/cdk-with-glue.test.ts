import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib/core";
import * as CdkWithGlue from "../lib/cdk-with-glue-stack";

describe("CdkWithGlueStack", () => {
    let template: Template;

    beforeAll(() => {
        const sut = new CdkWithGlue.CdkWithGlueStack(new App(), "StackUnderTest");
        template = Template.fromStack(sut);
    });

    test("Deploys 2 Glue Jobs", () => {
        template.resourceCountIs("AWS::Glue::Job", 2);
    });

    test("Deploys an S3 Bucket", () => {
        template.resourceCountIs("AWS::S3::Bucket", 1);
    });

    test("Deploys a DynamoDB Table", () => {
        template.resourceCountIs("AWS::DynamoDB::Table", 1);
    });
});
