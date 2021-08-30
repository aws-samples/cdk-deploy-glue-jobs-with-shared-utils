import { Stack, StackProps, Construct } from "monocdk";

export class CdkWithGlueStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
    }
}
