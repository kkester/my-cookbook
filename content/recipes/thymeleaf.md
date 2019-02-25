+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Thymeleaf"
date = 2018-12-04T08:12:25-06:00
+++

### Home Page Example

```html
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Enterprise Print</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
    <style type="text/css">
        div {
            color: darkblue;
            font-size: 16px;
            border: solid 2px darkblue;
        }

    </style>
    <script>
        if ('[[${message}]]' !== 'none') {
            alert ( '[[${message}]]' )
        }

    </script>
</head>

<body>

<div class="container">
    <h2>Step 1: Choose PDF</h2>
    <form method="POST" enctype="multipart/form-data" action="/pdf">
        <table>
            <tr>
                <td>PDF File to upload:</td>
                <td><input type="file" name="file"/></td>
            </tr>
            <tr>
                <td></td>
                <td><input type="submit" value="Upload"/></td>
            </tr>
        </table>
    </form>
</div>

<br>

<div class="container">
    <h2>Step 2: Choose Geo Image or Geo PDF (Optional)</h2>
    <form method="POST" enctype="multipart/form-data" action="/geo-pdf">
        <table>
            <tr>
                <td>Geo PDF File to upload:</td>
                <td><input type="file" name="file"/></td>
            </tr>
            <tr>
                <td></td>
                <td><input type="submit" value="Upload"/></td>
            </tr>
        </table>
    </form>
</div>

<br>

<div class="container">
    <h2>Step 3: Provide Product to Apply</h2>
    <form action="#" th:action="@{/image-request}" th:object="${imageRequest}" method="post">
        <p>Product:
            <select class="form-control" id="productSelection" name="productSelection" th:field="*{product}">
                <option value="">Select Product</option>
                <option th:each="product : ${products}"
                        th:value="${product.productName}"
                        th:text="${product.productName}">
                </option>
            </select>
        </p>
        <p>PDF: <input type="text" th:field="*{pdf}"/></p>
        <p>Geo Image or Geo PDF: <input type="text" th:field="*{geoPdf}"/></p>
        <p><input type="submit" value="Submit"/></p>
    </form>
</div>

<br>

<div class="container">
    <h2>Images Available for Download</h2>
    <table>
        <thead>
        <tr>
            <th>Name</th>
            <th>Date</th>
        </tr>
        </thead>
        <tbody>
        <tr th:if="${images.empty}">
            <td colspan="2"> No Images Available</td>
        </tr>
        <tr th:each="image : ${images}">
            <td><a th:href="@{'/files/' + *{name}}" th:text="*{name}">Image</a></td>
            <td><span th:text="${image.date}">Date</span></td>
        </tr>
        </tbody>
    </table>
</div>


</body>
</html>
```

### Download a File

```java
@GetMapping("/files/{fileName}")
@ResponseBody
public void downloadImage(@PathVariable("fileName") String fileName, HttpServletResponse response) throws IOException {

    response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename="+fileName);
    this.download(fileName, response.getOutputStream());
}

public void download(String fileName, ServletOutputStream outputStream) {
    try {
        S3ObjectInputStream s3ObjectInputStream = s3Methods.download(fileName);
        if (Objects.nonNull(s3ObjectInputStream )) {
            FileCopyUtils.copy(s3ObjectInputStream, outputStream);
        }
        outputStream.flush();
    } catch (IOException e) {
        log.error(e.getMessage());
    }
}
```
