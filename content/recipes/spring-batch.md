+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Spring Batch"
date = 2018-10-02T07:46:35-05:00
+++

### Dependencies Needed

```groovy
dependencies {
	compile('org.springframework.boot:spring-boot-starter-batch')
	compile('org.springframework.cloud:spring-cloud-task-batch')

	testCompile('org.springframework.boot:spring-boot-starter-test')
}

dependencyManagement {
	imports {
		mavenBom "org.springframework.cloud:spring-cloud-task-dependencies:${springCloudTaskVersion}"
	}
}
```

### Implement Configuration

```java
@Configuration
@EnableBatchProcessing
public class BatchConfiguration {

	private final DataSource dataSource;
	private final ResourceLoader resourceLoader;
	private final JobBuilderFactory jobBuilderFactory;
	private final StepBuilderFactory stepBuilderFactory;

	@Autowired
	public BatchConfiguration(final DataSource dataSource,
              final JobBuilderFactory jobBuilderFactory,
							final StepBuilderFactory stepBuilderFactory,
							final ResourceLoader resourceLoader) {
		this.dataSource = dataSource;
		this.resourceLoader = resourceLoader;
		this.jobBuilderFactory = jobBuilderFactory;
		this.stepBuilderFactory = stepBuilderFactory;
	}

	@Bean
	@StepScope
	public ItemStreamReader<Person> reader(@Value("#{jobParameters['filePath']}") String filePath) {
		return new FlatFileItemReaderBuilder<Person>()
			.name("reader")
			.resource(resourceLoader.getResource(filePath))
			.delimited()
			.names(new String[] {"firstName", "lastName"})
			.fieldSetMapper(new PersonFieldSetMapper())
			.build();
	}

	@Bean
	public ItemProcessor<Person, Person> processor() {
		return new PersonItemProcessor();
	}

	@Bean
	public ItemWriter<Person> writer() {
		return new JdbcBatchItemWriterBuilder<Person>()
			.beanMapped()
			.dataSource(this.dataSource)
			.sql("INSERT INTO people (first_name, last_name) VALUES (:firstName, :lastName)")
			.build();
	}

	@Bean
	public Job ingestJob() {
		return jobBuilderFactory.get("ingestJob")
			.incrementer(new RunIdIncrementer())
			.flow(step1())
			.end()
			.build();
	}

	@Bean
	public Step step1() {
		return stepBuilderFactory.get("ingest")
			.<Person, Person>chunk(10)
			.reader(reader(null))
			.processor(processor())
			.writer(writer())
			.build();
	}
}
```

### Readers, Writers, and Processors

Readers often can leverage a `FieldSetMapper` as part of reading job parameters to convert to a stream of POJOs.

```java
public class UserFieldSetMapper implements FieldSetMapper<UserEntity> {
    @Override
    public UserEntity mapFieldSet(FieldSet fieldSet) {

        UserEntity user = new UserEntity();
        user.setName(fieldSet.readString(0));
        user.setEmail(fieldSet.readString(1));
        user.setCity(fieldSet.readString(2));
        user.setState(fieldSet.readString(3));
        return user;
    }
}
```

```java
public class UserItemProcessor implements ItemProcessor<UserEntity,UserEntity> {

    private UserService userService;

    public UserItemProcessor(UserService userService) {
        this.userService = userService;
    }

    @Override
    public UserEntity process(UserEntity user) {

        // implement processing logic such as transformation, etc.

        return user;
    }

}
```

### Testing

The following test will execute a `Job` using a provided set of parameters.  

Note: the current date is included as a parameter to prevent unique constraint violations since the parameters are included as part of the job's execution primary key.

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class JobConfigTest {

    @Autowired
    private Job job;

    @Autowired
    private JobLauncher jobLauncher;

    @Test
    public void testBatchDataProcessing() throws Exception {

        // given
        JobParameters jobParameters = new JobParametersBuilder()
                .addString("filePath", "classpath:data.csv")
                .addDate("executionTimeStamp", new Date())
                .toJobParameters();

        // when
        JobExecution jobExecution = jobLauncher.run(job, jobParameters);

        // then
        assertEquals("Incorrect batch status", BatchStatus.COMPLETED, jobExecution.getStatus());
        assertEquals("Invalid number of step executions", 1, jobExecution.getStepExecutions().size());
    }
}
```
