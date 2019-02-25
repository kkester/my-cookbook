+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Spring S3 Integration"
date = 2018-11-02T16:49:56-05:00
+++

> Initial notes - still a WIP

### Import Dependencies

```xml
<dependency>
  <groupId>com.amazonaws</groupId>
  <artifactId>aws-java-sdk</artifactId>
  <version>{version}</version>
</dependency>
```

### Testing with S3

```java
@RunWith(SpringRunner.class)
@SpringBootTest
@Ignore
public class AwsS3Test {

    private AmazonS3 s3client;

    @Before
    public void setUp() throws Exception {

        AWSCredentials credentials = new BasicAWSCredentials(
                "<AWS accesskey>",
                "<AWS secretkey>"
        );

        s3client = AmazonS3ClientBuilder
                .standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withRegion(Regions.US_EAST_2)
                .build();
    }

    @Test
    public void testCreateBucket() {
        String bucketName = "bucket-" + UUID.randomUUID();

        if(s3client.doesBucketExist(bucketName)) {
            return;
        }

        s3client.createBucket(bucketName);

        List<Bucket> buckets = s3client.listBuckets();
        for(Bucket bucket : buckets) {
            System.out.println(bucket.getName());
        }

        s3client.deleteBucket(bucketName);
    }

    @Test
    public void testUpload() throws IOException {

        String bucketName = "bucket-" + UUID.randomUUID();

        s3client.putObject(
                bucketName,
                "Document/hello.txt",
                new File("/Users/user/Document/hello.txt")
        );

        S3Object s3object = s3client.getObject(bucketName, "Document/hello.txt");
        S3ObjectInputStream inputStream = s3object.getObjectContent();
        String contents = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);

        s3client.deleteObject(bucketName,"Document/hello.txt");
    }
}
```
