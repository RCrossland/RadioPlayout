using Microsoft.AspNet.Identity;
using RadioPlayout.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RadioPlayout.Controllers
{
	[Authorize]
	public class HomeController : Controller
	{
		private ApplicationDbContext _db = new ApplicationDbContext();

		public ActionResult Index()
		{
			// Get user details
			string currentUserId = User.Identity.GetUserId();
			ApplicationUser currentUser = _db.Users.FirstOrDefault(x => x.Id == currentUserId);

			if(currentUser != null)
			{
				ViewBag.UserName = currentUser.FirstName + " " + currentUser.LastName;
			}

			return View();
		}
	}
}