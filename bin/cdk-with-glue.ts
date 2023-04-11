#!/usr/bin/env node
import { App, Aspects } from "aws-cdk-lib";
import { CdkWithGlueStack } from "../lib/cdk-with-glue-stack";
import fs from "fs";
import * as nag from "cdk-nag";

function getCurrentRevision() {
    const rev = fs.readFileSync(".git/HEAD").toString().trim();
    if (rev.indexOf(":") === -1) {
        return rev;
    } else {
        return fs
            .readFileSync(".git/" + rev.substring(5))
            .toString()
            .trim();
    }
}

const currentRevision = getCurrentRevision();

const app = new App();
const cdkWithGlueStack = new CdkWithGlueStack(app, "CdkWithGlueStack", {
    tags: { App: "CdkWithGlue", Revision: currentRevision },
});

Aspects.of(app).add(new nag.AwsSolutionsChecks());

nag.NagSuppressions.addStackSuppressions(cdkWithGlueStack, [
    {
        id: "AwsSolutions-IAM4",
        reason: "Suppress warnings from using AWSGlueServiceRole policy",
        appliesTo: [
            {
                regex: "/Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSGlueServiceRole/",
            },
        ],
    },
    {
        id: "AwsSolutions-IAM5",
        reason: "Allows use of wildcards in policies required by CDK permissions helper functions",
    },
]);
