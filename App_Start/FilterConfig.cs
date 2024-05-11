using System.Web;
using System.Web.Mvc;

namespace IS215G4FacialAnalysis
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
