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
        public ActionResult Index()
        {
            string accessIdName = "AWS_ACCESS_KEY_ID";
            string accessKeyName = "AWS_SECRET_ACCESS_KEY";
            string tokenName = "AWS_SESSION_TOKEN";
            string accessId = Environment.GetEnvironmentVariable(accessIdName, EnvironmentVariableTarget.Machine);
            string accessKey = Environment.GetEnvironmentVariable(accessKeyName, EnvironmentVariableTarget.Machine);
            string token = Environment.GetEnvironmentVariable(tokenName, EnvironmentVariableTarget.Machine);

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
    }
}