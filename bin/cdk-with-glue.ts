#!/usr/bin/env node
import "source-map-support/register";
import { App } from "monocdk";
import { CdkWithGlueStack } from "../lib/cdk-with-glue-stack";

const app = new App();
new CdkWithGlueStack(app, "CdkWithGlueStack", {});
