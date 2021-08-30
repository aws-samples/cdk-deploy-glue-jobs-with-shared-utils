import argparse
import sys

from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from utils import utils

args = getResolvedOptions(sys.argv, ["JOB_NAME"])


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-bucket", type=str, required=True)
    parser.add_argument("--input-data-path", type=str, required=True)
    parser.add_argument("--output-table", type=str, required=True)
    known, unknown = parser.parse_known_args()
    return known


if __name__ == "__main__":
    sc = SparkContext()
    glue_context = GlueContext(sc)
    spark = glue_context.spark_session
    job = Job(glue_context)
    job.init(args["JOB_NAME"], args)

    args = parse_args()

    data_bucket = args.data_bucket
    input_data_path = args.input_data_path
    output_table = args.output_table

    input_uri = utils.join_path("s3:", data_bucket, input_data_path)

    print(f"Reading data from {input_uri}")

    data_source = glue_context.create_dynamic_from_options(
        connection_type="s3",
        connection_options={
            "paths": [input_uri],
        },
        format="orc",
    )

    print(f"Writing data to {output_table}")

    glue_context.write_dynamic_frame.from_options(
        frame=data_source,
        connection_type="dynamodb",
        connection_options={"dynamodb.ouput.tableName": output_table},
    )

    job.commit()
