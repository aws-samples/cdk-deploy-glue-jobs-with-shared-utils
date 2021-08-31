#!/bin/bash -x

BUCKET=$1

if [ -z $1 ]; then
    echo "Must set Bucket Name"
    exit 1;
fi

TMPFILE=$(mktemp)
trap "rm -f $TMPFILE" EXIT

wget https://people.sc.fsu.edu/~jburkardt/data/csv/faithful.csv -O $TMPFILE

TMPFILE_BASENAME=$(basename $TMPFILE)

aws s3 cp $TMPFILE s3://$1/csv/$TMPFILE_BASENAME.csv
