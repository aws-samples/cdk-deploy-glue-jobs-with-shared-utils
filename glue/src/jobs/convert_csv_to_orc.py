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
    parser.add_argument("--output-data-path", type=str, required=True)
    known, unknown = parser.parse_known_args()
    return known


if __name__ == "__main__":
    sc = SparkContext()
    glue_context = GlueContext(sc)
    spark = glue_context.spark_session
    job = Job(glue_context)
    job.init(args["JOB_NAME"], args)

    args = parse_args()

    print(args)

    data_bucket = args.data_bucket
    input_data_path = args.input_data_path
    output_data_path = args.output_data_path

    input_uri = "s3://" + utils.join_path(data_bucket, input_data_path)
    output_uri = "s3://" + utils.join_path(data_bucket, output_data_path)

    print(f"Reading data from {input_uri}")

    data_source = glue_context.create_dynamic_frame_from_options(
        connection_type="s3",
        connection_options={
            "paths": [input_uri],
            "recurse": True,
            "withHeader": True,
            "quoteChar": -1,
        },
        format="csv",
        format_options={"withHeader": True},
    )

    data_source.toDF().printSchema()

    dropped_fields = data_source.drop_fields(paths=[""])
    dropped_fields.toDF().printSchema()

    print(f"Writing data to {output_uri}")

    glue_context.write_dynamic_frame.from_options(
        frame=dropped_fields,
        connection_type="s3",
        connection_options={"path": output_uri},
        format="orc",
    )

    job.commit()
