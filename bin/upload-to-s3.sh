#!/bin/bash

HELP="""
This script uploads test files to S3 to do a demo of glue functionality

Required:
    -b|--bucket     Name of the bucket to upload artifacts to

Optional:
    -p|--profile    Name of the AWS CLI profile to use
"""

# Parse args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -b|--bucket) BUCKET=$2; shift ;;
        -p|--profile) PROFILE=$2; shift ;;
    esac
    shift
done

PROFILE=${PROFILE:-default}

if [[ -z $BUCKET ]]; then
    >&2 echo "ERROR: One or more arguments are undefined";
    echo;
    echo "$HELP";
    exit 1;
fi

TMPFILE=$(mktemp)

set -x

trap "rm -f $TMPFILE" EXIT

wget https://people.sc.fsu.edu/~jburkardt/data/csv/faithful.csv -O $TMPFILE

TMPFILE_BASENAME=$(basename $TMPFILE)

aws s3 cp --profile $PROFILE $TMPFILE s3://$BUCKET/csv/$TMPFILE_BASENAME.csv
