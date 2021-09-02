# Using Shared Library Files with CDK

https://gitlab.aws.dev/lagroujl/cdk-with-glue

Demonstrate how to automate the deployment of multiple glue jobs that utilize shared code together
with CDK.

## Motivation

When writing multiple AWS Glue jobs, it is necessary to create a script file for each Glue Job. This
means that naive approach where develops created independent scripts will quickly lead to violations
of DRY principles. However, to use shared code between AWS Glue Jobs, it is a tricky process that
requires the user to create a deployment package (Zip file, Wheel, or Egg) and upload it to S3.

Automating this process will allow developers to write code faster without thinking about how their
code is packaged, and deployed.

Building this solution with the CDK allows users to also use CloudFormation to automate the
deployment and manage access control for all their related resources. For example, this might
include a Glue Database, S3 Buckets, or DynamoDB tables.

## Solution

This solution uses NPM features to give users one `npm run build` command that builds all code,
Typescript and Python. Underneath, it uses Pipenv to install Python dependencies and a `setup.py` to
declare the package that will be built. When the build command runs, it creates an Egg that will be
uploaded to S3 when the CloudFormation is deployed.

This code contains a custom CDK Construct to automatically create Glue Execution Role with access to
Script and Egg files. As a user, you simply have to provide the file location of the script and the
location of the Egg. The location of the Egg will never change. This means that if you test locally,
the location on the file sytem will be the same in a CICD environment.

This example has a small utility in `glue/src/utils/utils.py` that both Glue jobs use to manipulate
S3 paths. This allows both deployed Glue jobs to share the code that is not strictly related to
their business logic.

## Prerequisites

-   Install Node and NPM
-   Install Python 3.7
-   Install pipenv

## Deploying

From a terminal run `npm install` to install node dependencies.

Then from a terminal run

```
npm run build
```

This will compile all Typescript code, then it will install Python libraries

To deploy the CloudFormation stack, run

```
npm run cdk -- deploy
```

This will take the build artifacts generated in the build step and upload them to S3. Then it will
deploy the Cloudformation stack containing the Glue jobs that utilize the shared code in
`glue/src/utils`

## Testing

This example comes with a test script to download Ol' Faithful geyser data and uplooad it to an S3
Bucket created by this stack. Then there are two Glue Jobs. One will take the downloaded CSV data
and convert it to Apache ORC format, the other will read the ORC data and write to a DynamoDB table
created by the CDK.

After running `npm run cdk -- deploy` note the name of the S3 Bucket that was output and then run

```
npm run upload-data -- [Bucket Name Here]
```

Then you can navigate to the Glue console in AWS. First run the job `ConvertCsvtoOrc`. Then when the
job is complete, run the job `LoadToDatabase`. When both jobs are complete, navigate to the DynamoDB
output by the CDK and inspect the Table. There should be records created with 3 columns, `Index`,
`Eruption length (mins)`, and `Eruption wait (mins)`

## Clean up

All databases and S3 have removal policies set to automatically delete any objects in S3, then
delete both the S3 bucket and DynamoDB Table created by this stack. To destroy all
resources created run:

```
npm run cdk -- destroy
```

The S3 Bucket and DynamoDB are provided as outputs, so it is possible to double check that they are
actually deleted
