# Using Shared Library Files with CDK

https://gitlab.aws.dev/lagroujl/cdk-with-glue

Demonstrate how to automate the deployment of multiple glue jobs that utilize shared code together with CDK.

## Motivation

When writing multiple AWS Glue jobs, it is necessary to create a script file for each Glue Job. This
means that naive approach where use independent sets of code will often quickly violate DRY
principles. To use share code between AWS Glue Jobs, it requires the user to create a deployment
package (Zip file, Wheel, or Egg) and include it with their Glue Job. Automating this process will
allow developers to write code faster, and allows for CI/CD pipelines to deploy the same code to
multiple environments.

Additionally, the CDK is a favorite IaC solution

## Solution

- Use NPM features to give users one `npm run build` command that builds all code

- Use Pipenv to install Python dependencies and setup.py to declare build package

- When code is built create an Egg that can be uploaded to S3

- Use CDK S3 Assets to upload the Egg and Script File to S3.

- Then use a custom CDK Construct to automatically create Glue Execution Role with access to Script
  and Egg files

## Prerequisites

- Install NPM
- Install Python 3.7
- Install pipenv

## Deploying

```
npm install
```

```
npm run build
```

```
npm run cdk -- deploy
```

## Testing

## Clean up

All databases and S3

```
npm run cdk -- destroy
```
