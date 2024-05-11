using Amazon.S3.Model;
using Amazon.S3;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.IO;
using Amazon;
using IS215G4FacialAnalysis.Models;

namespace IS215G4FacialAnalysis.Controllers
{
    public class G4Controller : Controller
    {
        //private async Task<bool> UploadFileAsync(
        //    string bucketName,
        //    string objectName,
        //    HttpPostedFileBase file)
        //{
        //    var request = new PutObjectRequest
        //    {
        //        BucketName = bucketName,
        //        Key = objectName,
        //        InputStream = file.InputStream,
        //        ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256,
        //    };
        //    request.Metadata.Add("original-filename", file.FileName);

        //    var credentials = null;
        //    IAmazonS3 client = new AmazonS3Client(credentials, RegionEndpoint.USEast1);
        //    var response = await client.PutObjectAsync(request).ConfigureAwait(false);
        //    if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
        //    {
        //        Console.WriteLine($"Successfully uploaded {objectName} to {bucketName}.");
        //        return true;
        //    }
        //    else
        //    {
        //        Console.WriteLine($"Could not upload {objectName} to {bucketName}.");
        //        return false;
        //    }
        //}

        public ActionResult Index()
        {
            string accessIdName = "AWS_ACCESS_KEY_ID";
            string accessKeyName = "AWS_SECRET_ACCESS_KEY";
            string tokenName = "AWS_SESSION_TOKEN";
            string accessId = Environment.GetEnvironmentVariable(accessIdName, EnvironmentVariableTarget.User);
            string accessKey = Environment.GetEnvironmentVariable(accessKeyName, EnvironmentVariableTarget.User);
            string token = Environment.GetEnvironmentVariable(tokenName, EnvironmentVariableTarget.User);

            return View(new AccessViewModel
            {
                AccessId = accessId,
                AccessKey = accessKey,
                Token = token,
            });
        }

        public ActionResult About()
        {
            return View();
        }

        //[HttpPost]
        //public async Task<ActionResult> UploadToS3(HttpPostedFileBase file, string bucketName)
        //{
        //    string status = "ERROR";
        //    string objectName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        //    bool result = await UploadFileAsync(bucketName, objectName, file).ConfigureAwait(false);
        //    if (result)
        //    {
        //        status = "SUCCESS";
        //    }
        //    return Json(status, JsonRequestBehavior.AllowGet);
        //}
    }
}