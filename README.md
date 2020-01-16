# Testing Different Amazon Pinpoint Import Job Patterns

Testing different ways of importing 75k endpoint definitions.

## Test 1
One import job to import 75k endpoints (file: 70k.csv)

## Test 2
Eight import jobs in parallel for 8 files of 10k endpoints (files: splitx.csv)

## Test 3
One import job targeting an S3 prefix ("test") where the 8 files of 10k endpoints were loaded


