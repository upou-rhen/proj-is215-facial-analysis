
$(function () {
    $('#UploadToS3').on('click', function (event) {
        event.preventDefault();

        var fileInput = document.getElementById('imageFileUpload');
        var file = fileInput.files[0];
        if (!file) {
            swal('Error', 'Please select a file.', 'error')
            return;
        }
        var fileName = file.name;
        var fileExtensions = ['jpeg', 'jpg', 'png', 'bmp'];
        if ($.inArray(fileName.split('.').pop().toLowerCase(), fileExtensions) == -1) {
            const msg = "Only these formats are allowed : " + fileExtensions.join(', ');
            swal('Error', msg, 'error')
            return;
        }

        toggleControls(true);

        UploadFileToS3(file);
    });

    $('#startButton').on('click', function () {
        $('#imageFileUpload').val('');
        $('#uploadModal').modal('show');
    });
});

var bucketName = 'is215-g4-bucket';
var bucketUrl = 'https://' + bucketName + '.s3.amazonaws.com/';
var region = 'us-east-1';

function toggleControls(state) {
    $('#UploadToS3').toggleClass('d-none');
    $('#pleaseWaitButton').toggleClass('d-none');
    $('#imageFileUpload').prop('disabled', state);
}

function UploadFileToS3(file) {
    AWS.config.update({
        region: region
    });

    const url = $('#uploadFileUrl').val();
    const token = $('input[name=__RequestVerificationToken]').val();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('__RequestVerificationToken', token);

    $.ajax({
        url: url,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false,
        beforeSend: function () {

        }
    })
        .done((r) => {
            // success
            if (r.payload) {
                const p = JSON.parse(r.payload);
                parseLambdaResponse(r.key, p.body);
            }
            else
                swal('Oops!', 'There was a problem processing your image file.', 'error');
        })
        .fail((x, t, e) => {
            if (e !== '')
                swal('Oops!', e, 'error');
            else
                swal('Oops!', x.responseText, 'error');
        })
        .always(() => {
            toggleControls(false);
        });
}

function parseLambdaResponse(key, response) {
    if (response) {
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
        swal('Oops!', 'Unable to retrieve response from the AWS Lambda function.', 'error');
    }
}