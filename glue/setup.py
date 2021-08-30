import setuptools

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setuptools.setup(
    name="glue_src",
    version="0.0.1",
    description="Glue Src Files",
    long_description=long_description,
    long_description_context_type="text/markdown",
    classifiers=["Programming Language :: Python :: 3", "Operating System :: OS Independent"],
    package_dir={"": "src"},
    packages=setuptools.find_packages(where="src"),
    python_requires="==3.7",
)
