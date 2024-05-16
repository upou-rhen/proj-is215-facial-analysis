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
using Amazon.Runtime;
using Amazon.Runtime.CredentialManagement;
using Amazon.Runtime.Internal.Util;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Net;
using Amazon.Runtime.Internal;
using IS215G4FacialAnalysis.HelperClasses;
using System.Web.Services.Description;
using System.Xml.Linq;
using Amazon.Lambda;
using Amazon.Lambda.Model;
using Newtonsoft.Json;
using Microsoft.Ajax.Utilities;
using IS215G4FacialAnalysis.Model;

namespace IS215G4FacialAnalysis.Controllers
{
    public class G4Controller : Controller
    {
        private const string bucketName = "is215-g4-bucket";
        private static IAmazonS3 s3Client;
        private static IAmazonLambda lambdaClient;

        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [AllowXRequestsEveryXSeconds(Name = "UploadFile",
            Message = "You have performed this action more than {x} times in the last {n} seconds.",
            Requests = 3,
            Seconds = 60)]
        public async Task<ActionResult> UploadFile(HttpPostedFileBase file)
        {
            try
            {
                string key = file.FileName;
                var request = new PutObjectRequest
                {
                    BucketName = bucketName,
                    Key = key,
                    InputStream = file.InputStream,
                    ContentType = file.ContentType,
                };

                s3Client = new AmazonS3Client(RegionEndpoint.USEast1);
                var response = await s3Client.PutObjectAsync(request).ConfigureAwait(false);
                if (response.HttpStatusCode == HttpStatusCode.OK)
                {
                    var payload = await CallLambdaFnAsync(request.Key).ConfigureAwait(false);
                    return Json(new { key, payload }, JsonRequestBehavior.AllowGet);
                }
                else
                    return Json("error", JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(HttpStatusCode.InternalServerError, JsonRequestBehavior.AllowGet);
            }
        }

        private async Task<string> CallLambdaFnAsync(string key)
        {
            var payload = new KeyBucketModel
            {
                key = key,
                bucket = bucketName,
            };
            var request = new InvokeRequest
            {
                FunctionName = "getHtmlResponseFromChatGpt",
                Payload = JsonConvert.SerializeObject(payload)
            };
            lambdaClient = new AmazonLambdaClient(RegionEndpoint.USEast1);
            var response = await lambdaClient.InvokeAsync(request).ConfigureAwait(false);
            var responseBody = System.Text.Encoding.UTF8.GetString(response.Payload.ToArray());
            return responseBody;
        }

        public ActionResult About()
        {
            return View();
        }
    }
}