import { expect as expectCDK, countResources } from "@monocdk-experiment/assert";
import { App } from "monocdk";
import * as CdkWithGlue from "../lib/cdk-with-glue-stack";

describe("CdkWithGlueStack", () => {
    const app = new App();
    // WHEN
    const sut = new CdkWithGlue.CdkWithGlueStack(app, "StackUnderTest");

    test("Deploys 2 Glue Jobs", () => {
        // THEN
        expectCDK(sut).to(countResources("AWS::Glue::Job", 2));
    });

    test("Deploys an S3 Bucket", () => {
        // THEN
        expectCDK(sut).to(countResources("AWS::S3::Bucket", 1));
    });

    test("Deploys a DynamoDB Table", () => {
        // THEN
        expectCDK(sut).to(countResources("AWS::DynamoDB::Table", 1));
    });
});
