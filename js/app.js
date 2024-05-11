
$(function () {
    $('#UploadToS3').on('click', function (event) {
        event.preventDefault();

        var fileInput = document.getElementById('imageFileUpload');
        var file = fileInput.files[0];
        if (!file) {
            alert('Please select a file.');
            return;
        }
        var fileName = file.name;
        var fileExtensions = ['jpeg', 'jpg', 'png', 'bmp'];
        if ($.inArray(fileName.split('.').pop().toLowerCase(), fileExtensions) == -1) {
            alert("Only these formats are allowed : " + fileExtensions.join(', '));
            return;
        }

        toggleControls(true);

        UploadFileToS3(file);
    });

    $('#startButton').on('click', function () {
        $('#uploadModal').modal('show');
    });
});

var bucketName = 'is215-g4-bucket';
var bucketUrl = 'https://' + bucketName + '.s3.amazonaws.com/';
var region = 'us-east-1';
var accessKeyId = '';
var secretAccessKey = '';
var token = '';

function toggleControls(state) {
    $('#UploadToS3').toggleClass('d-none');
    $('#pleaseWaitButton').toggleClass('d-none');
    $('#imageFileUpload').prop('disabled', state);
}

function UploadFileToS3(file) {
    accessKeyId = $('#accessId').val();
    secretAccessKey = $('#accessKey').val();
    token = $('#token').val();

    AWS.config.update({
        region: region,
        credentials: new AWS.Credentials(accessKeyId, secretAccessKey, token)
    });

    var params = {
        Bucket: bucketName,
        Key: file.name,
        Body: file,
    };

    var s3 = new AWS.S3();
    s3.putObject(params, function (err, data) {
        if (err) {
            swal('Error', `Error uploading file: ${err}`, 'error');
            toggleControls(false);
            return;
        }

        runLambdaFn(file.name);
    });
}

function runLambdaFn(key) {
    var lambda = new AWS.Lambda();
    var params = {
        FunctionName: 'getHtmlResponseFromChatGpt',
        Payload: JSON.stringify({ key: key, bucket: bucketName })
    };
    lambda.invoke(params, function (err, data) {
        if (err) {
            swal('Error',`Error calling Lambda function: ${err}`, 'error');
            toggleControls(false);
            return;
        }

        console.log('Lambda function called successfully.');
        console.log({ data });
        let payload = JSON.parse(data.Payload);
        console.log({ payload });
        if (!payload.errorMessage) {
            parseLambdaResponse(key, payload.body);
        }
        else
            swal('Error', payload.errorMessage,'error');

        toggleControls(false);
    });
}

function parseLambdaResponse(key, response) {
    console.log({ response });
    if (response !== undefined) {
        $('#uploadModal').modal('hide');
        $('#jumbotron').hide();

        var photoUrl = bucketUrl + key;
        var paragraphs = response.split('**').filter(i => i);
        var htmlContent = '';

        // page number
        htmlContent += '<h6 class="text-muted text-end" style="font-size:small;">G4</h6>';

        // title
        htmlContent += '<h1>' + paragraphs[0].trim() + '</h1>';

        // author
        htmlContent += '<h6 class="text-muted mb-5" style="font-size:small;font-weight:500;">By ChatGPT 3.5</h6>';

        paragraphs = paragraphs[1].split('|').filter(i => i);
        // photo
        htmlContent += '<div class="col-md-6 float-md-end mb-3 ">';
        htmlContent += '<img class="img-fluid custom-img ms-md-3" src="' + photoUrl + '" alt="Article Photo">';
        htmlContent += '<span class="text-muted float-end" style = "font-size:small;">Photo by You</span></div>';

        // article
        for (var i = 1; i < paragraphs.length; i++) {
            let city = '';
            if (i === 1) {
                // add city
                city = 'MANILA - ';
            }

            htmlContent += '<p style="text-align: justify;">' + city + paragraphs[i].trim() + '</p>';
        }

        // footer
        htmlContent += '<hr style="border: solid 5px;" />';

        let date = moment(new Date()).format('DD-MMM-YYYY');
        $('#articleDate').text(date);

        $('#article').html(htmlContent);
        $('#articleContainer').toggleClass('d-none');
    }
    else {
        swal('Error','Unable to retrieve response from the AWS Lambda function.','error');
    }
}