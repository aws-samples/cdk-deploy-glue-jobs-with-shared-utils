import {
    expect as expectCDK,
    matchTemplate,
    MatchStyle,
} from "@monocdk-experiment/assert";
import { App, Stack } from "monocdk";
import * as CdkWithGlue from "../lib/cdk-with-glue-stack";

test("Empty Stack", () => {
    const app = new App();
    // WHEN
    const stack = new CdkWithGlue.CdkWithGlueStack(app, "MyTestStack");
    // THEN
    expectCDK(stack).to(
        matchTemplate(
            {
                Resources: {},
            },
            MatchStyle.EXACT
        )
    );
});
