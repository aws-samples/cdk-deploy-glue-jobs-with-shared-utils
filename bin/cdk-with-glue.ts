#!/usr/bin/env node
import "source-map-support/register";
import { App } from "monocdk";
import { CdkWithGlueStack } from "../lib/cdk-with-glue-stack";
import fs from "fs";

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
new CdkWithGlueStack(app, "CdkWithGlueStack", {
    tags: { App: "CdkWithGlue", Revision: currentRevision },
});
